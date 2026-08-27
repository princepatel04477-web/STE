/**
 * Exhibitor identity, normalised the one way the whole portal agrees on.
 *
 * Almost every exhibitor is keyed by their 10-digit mobile, but a few firms are
 * registered under a short user ID instead (Saraogi Super Sales is "SSS").
 * Login has always accepted both; the lottery path assumed digits only, so a
 * user-ID exhibitor could sign in and then be turned away at the draw with
 * "valid 10-digit mobile number is required" — leaving their stall unallotted.
 *
 * Returns '' when the input is neither a full mobile nor a user ID, so callers
 * can reject it with one falsy check.
 */
export function normalizeExhibitorId(raw: string | null | undefined): string {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return '';

  // Looks like a phone number: keep the last 10 digits, and only if there are 10.
  if (/^[0-9+\-\s()]+$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, '').slice(-10);
    return digits.length === 10 ? digits : '';
  }

  // Otherwise it is a user ID, matched case-insensitively.
  return trimmed.toUpperCase();
}

/** True when the identifier is a real mobile rather than a user ID. */
export function isMobileNumberId(id: string | null | undefined): boolean {
  return /^\d{10}$/.test(String(id ?? '').trim());
}
