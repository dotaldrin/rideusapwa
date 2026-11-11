/** Keep development hubs on the same proxy/cookie path as REST. Preserve explicit remote hubs. */
export function resolveHubUrl(value: string, development: boolean, apiBaseUrl: string): string {
  if (!development || value.startsWith("/")) return value;
  const hub = new URL(value);
  const api = new URL(apiBaseUrl);
  return hub.origin === api.origin && hub.pathname.startsWith("/hubs/")
    ? hub.pathname + hub.search
    : value;
}
