/**
 * Single source of truth for the site's own origin.
 *
 * Production must set NEXT_PUBLIC_SITE_URL=https://www.stesurat.com.
 * Preview deployments fall back to their own VERCEL_URL so they stay
 * self-consistent and never nominate the production domain (or each other).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && process.env.VERCEL_ENV !== "production") {
    return `https://${vercelUrl}`;
  }

  return "https://www.stesurat.com";
}

export const SITE_URL = resolveSiteUrl();

/** True only on the real production deployment. Previews must not be indexed. */
export const IS_PRODUCTION_SITE =
  process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === undefined;

/** Absolute URL helper — use for JSON-LD and anywhere metadataBase can't resolve. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
