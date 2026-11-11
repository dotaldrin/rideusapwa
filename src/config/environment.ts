// src/config/env.ts

import { developmentEnvironment } from "../config/development/env.development";

import { productionEnvironment } from "../config/production/env.production";

import type { EnvironmentConfig } from "../config/shared/environment.types";

import { resolveHubUrl } from "../config/hubUrl";

/**
 * Returns a required configuration value.
 */
function requireValue(value: string | undefined, name: string): string {
  if (value == null || value.trim() === "") {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

/**
 * Removes one or more trailing slashes.
 *
 * Example:
 * https://api.rundelta.ai/
 *
 * becomes:
 * https://api.rundelta.ai
 */
function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Ensures API paths always begin with "/"
 * and prevents "/api/api/..." duplication.
 *
 * Examples:
 *
 * account/me
 *   -> /account/me
 *
 * /account/me
 *   -> /account/me
 *
 * /api/account/me
 *   -> /account/me
 */
function normalizeApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized === "/api") {
    return "";
  }

  if (normalized.startsWith("/api/")) {
    return normalized.slice(4);
  }

  return normalized;
}

/**
 * Selects the current environment configuration.
 */
const selectedEnvironment: EnvironmentConfig = import.meta.env.PROD
  ? productionEnvironment
  : developmentEnvironment;

/**
 * Public validated application configuration.
 */
export const env: EnvironmentConfig = {
  environment: selectedEnvironment.environment,

  apiBaseUrl: requireValue(selectedEnvironment.apiBaseUrl, "VITE_API_BASE_URL"),

  rideHubUrl: requireValue(selectedEnvironment.rideHubUrl, "VITE_RIDE_HUB_URL"),

  locationHubUrl: requireValue(
    selectedEnvironment.locationHubUrl,
    "VITE_LOCATION_HUB_URL",
  ),

  taxicardHubUrl: requireValue(
    selectedEnvironment.taxicardHubUrl,
    "VITE_TAXICARD_HUB_URL",
  ),

  platformMessagesHubUrl: requireValue(
    selectedEnvironment.platformMessagesHubUrl,
    "VITE_PLATFORM_MESSAGES_HUB_URL",
  ),

  azureMapsKey: requireValue(
  selectedEnvironment.azureMapsKey,
  "VITE_AZURE_MAPS_KEY",
),
};

/**
 * Individual exports for modules that only
 * require one configuration value.
 */
export const API_BASE_URL = env.apiBaseUrl;

export const RIDE_HUB_URL = resolveHubUrl(env.rideHubUrl, env.environment === "development", env.apiBaseUrl);

export const LOCATION_HUB_URL = resolveHubUrl(env.locationHubUrl, env.environment === "development", env.apiBaseUrl);

/**
 * Each hub has its own configured URL. Keep the existing development
 * proxy behavior without deriving one hub's route from another hub.
 */
export const TAXICARD_HUB_URL = resolveHubUrl(
  env.taxicardHubUrl,
  env.environment === "development",
  env.apiBaseUrl,
);

export const PLATFORM_MESSAGES_HUB_URL = resolveHubUrl(
  env.platformMessagesHubUrl,
  env.environment === "development",
  env.apiBaseUrl,
);

export const AZURE_MAPS_KEY = env.azureMapsKey;

/**
 * Builds REST API URLs.
 *
 * Development:
 *   apiUrl("/account/me")
 *   -> /api/account/me
 *
 * Production:
 *   apiUrl("/account/me")
 *   -> https://api.rundelta.ai/api/account/me
 */
export function apiUrl(path: string): string {
  let relative = path;
  if (/^https?:\/\//i.test(path)) {
    const absolute = new URL(path);
    const configured = new URL(API_BASE_URL, window.location.origin);
    if (absolute.origin !== configured.origin)
      throw new Error("API URL must use the configured API origin.");
    relative = absolute.pathname + absolute.search;
  }
  if (relative.startsWith("//")) throw new Error("Invalid API path.");
  const normalizedPath = normalizeApiPath(relative);
  if (env.environment === "development") return `/api${normalizedPath}`;
  const base = withoutTrailingSlash(API_BASE_URL).replace(/\/api$/i, "");
  return `${base}/api${normalizedPath}`;
}
