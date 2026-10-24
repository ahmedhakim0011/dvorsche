export const SITE_NAME = "D’Vorsche";

/** Production origin, e.g. https://www.example.com — set NEXT_PUBLIC_SITE_URL. Never hard-code a domain here. */
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");

/**
 * Search engines are only invited when a real https production origin is configured.
 * Without it (local, preview, unconfigured hosts) robots.txt disallows everything and pages carry noindex.
 * Set NEXT_PUBLIC_ALLOW_INDEXING=false to keep a production-like staging site out of search.
 */
export const isIndexable = () => {
  const u = siteUrl();
  return u.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(u) && process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";
};

export const absoluteUrl = (path = "/") => `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

export const DEFAULT_OG_IMAGE = { url: "/og/default.png", width: 1200, height: 630, alt: "D’Vorsche — leather wallets marked by the Woven DV monogram" };
