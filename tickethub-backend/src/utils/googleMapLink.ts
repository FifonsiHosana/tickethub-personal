const GOOGLE_MAP_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'google.com',
  'www.google.com',
  'maps.google.com',
]);

function withProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function normalizeGoogleMapLink(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? withProtocol(trimmed) : undefined;
}

export function isGoogleMapLink(value?: string | null) {
  const normalized = normalizeGoogleMapLink(value);
  if (!normalized) return true;

  try {
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase();
    if (!GOOGLE_MAP_HOSTS.has(host)) return false;
    if (host === 'goo.gl') return url.pathname.startsWith('/maps');
    if (host === 'google.com' || host === 'www.google.com') {
      return url.pathname.startsWith('/maps');
    }
    return true;
  } catch {
    return false;
  }
}
