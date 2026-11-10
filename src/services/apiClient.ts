/** Central HTTP transport for future authenticated customer API integration. */
const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL = (configured?.trim() || '/').replace(/\/$/, '');
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options, credentials: 'include',
    headers: { Accept: 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}
