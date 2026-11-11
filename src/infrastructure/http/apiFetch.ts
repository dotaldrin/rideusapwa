
import Cookies from "js-cookie";
import { apiUrl } from "../../config/environment";
import { ApiError } from "./apiError";
import type { ApiFetchOptions } from "./httpTypes";

function messages(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(messages);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.description === "string") return [obj.description];
    return Object.entries(obj).flatMap(([key, item]) =>
      messages(item).map((text) => `${key}: ${text}`),
    );
  }
  return [];
}
function errorDetails(text: string): { detail: string; errors?: unknown } {
  try {
    const body: unknown = JSON.parse(text);
    if (typeof body === "string" || Array.isArray(body))
      return { detail: messages(body).join("; ") };
    if (body && typeof body === "object") {
      const p = body as Record<string, unknown>;
      const errors = messages(p.errors).join("; ");
      return {
        detail: [p.detail ?? p.message ?? p.error, errors || p.title]
          .filter(Boolean)
          .join("; "),
        errors: p.errors,
      };
    }
  } catch {
    /* Plain-text API failures are supported. */
  }
  return {
    detail: /^\s*</.test(text)
      ? "The server returned a page instead of an API response."
      : text.slice(0, 1500),
  };
}
/** Normalize once; retain the existing cookie and antiforgery contract. */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { responseType = "json", ...request } = options;
  if (
    !navigator.onLine &&
    !["GET", "HEAD"].includes((request.method ?? "GET").toUpperCase())
  ) {
    throw new ApiError(
      0,
      "Reconnect before submitting this action. Nothing was queued for replay.",
    );
  }
  
  const headers = new Headers(request.headers);
  
  const xsrf = Cookies.get("XSRF-TOKEN");
  if (xsrf) headers.set("X-CSRF-Token", xsrf);
  if (
    request.body != null &&
    !(request.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(apiUrl(path), {
    ...request,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  
  if (!response.ok) {
    const { detail, errors } = errorDetails(await response.text());
    throw new ApiError(
      response.status,
      detail || `Request failed (${response.status}).`,
      errors,
      response.headers.get("Retry-After"),
    );
  }
  if (response.status === 204) return undefined as T;
  if (responseType === "blob") return (await response.blob()) as T;
  const text = await response.text();
   
  if (!text) return undefined as T;
  if (responseType === "text") return text as T;
  if (
    !/application\/(?:[\w.-]+\+)?json/i.test(
      response.headers.get("content-type") ?? "",
    )
  ) {
    throw new ApiError(
      response.status,
      "The server returned an unexpected response. Please reload and try again.",
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(response.status, "The server returned invalid JSON.");
  }
}
