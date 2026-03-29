/**
 * Parse QR / barcode payload into a gym route id.
 * Supports: plain id, JSON { "routeId": "r-1" }, app deep links, and paths containing /route/:id.
 */
export function parseRouteIdFromScan(data: string): string | null {
  const trimmed = data.trim();
  if (/^r-[\w-]+$/i.test(trimmed)) {
    return trimmed;
  }
  try {
    const j = JSON.parse(trimmed) as { routeId?: string };
    if (j && typeof j.routeId === 'string' && j.routeId.length > 0) {
      return j.routeId;
    }
  } catch {
    /* not JSON */
  }
  const scheme = /boulderscan:\/\/route\/([^?\s#]+)/i.exec(trimmed);
  if (scheme) {
    return decodeURIComponent(scheme[1]);
  }
  const path = /\/route\/([^?\s#/]+)/i.exec(trimmed);
  if (path) {
    return decodeURIComponent(path[1]);
  }
  return null;
}
