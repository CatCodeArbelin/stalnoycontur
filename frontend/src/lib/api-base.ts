const DEFAULT_BROWSER_API_BASE = "/api";

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "") || DEFAULT_BROWSER_API_BASE;
}

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function getBrowserApiBase() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || DEFAULT_BROWSER_API_BASE;

  if (process.env.NODE_ENV === "production" && isLocalhostUrl(apiBase)) {
    return DEFAULT_BROWSER_API_BASE;
  }

  return trimTrailingSlashes(apiBase);
}
