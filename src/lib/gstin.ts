/**
 * GSTIN handling for the exhibitor extras bill.
 *
 * A GSTIN is fifteen characters: a two digit state code, the holder's ten
 * character PAN, an entity number, a fixed 'Z', and a check digit computed
 * over the first fourteen. Checking that last digit is what separates a real
 * number from a plausible-looking typo, and it is the same check the GST
 * portal applies before it will look a number up at all.
 */

/** Shape only: 15 characters in the documented arrangement. */
export const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** Position value alphabet for the check digit, 0-9 then A-Z. */
const CHECKSUM_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * State codes in use. 01-38 are the states and union territories (38 is
 * Ladakh), 97 is Other Territory and 99 is Centre Jurisdiction.
 */
const VALID_STATE_CODES = new Set<string>([
  ...Array.from({ length: 38 }, (_, i) => String(i + 1).padStart(2, '0')),
  '97',
  '99',
]);

/** Upper case, alphanumeric, at most fifteen characters. */
export function normalizeGstin(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
}

/**
 * The check digit a GSTIN's first fourteen characters imply, or null if any of
 * them is outside the alphabet.
 */
export function gstinCheckDigit(gstin: string): string | null {
  if (gstin.length < 14) return null;

  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = CHECKSUM_ALPHABET.indexOf(gstin[i]);
    if (value < 0) return null;

    // Every second position is doubled, and a product that overflows the
    // 36 character alphabet contributes both of its digits.
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }

  return CHECKSUM_ALPHABET[(36 - (sum % 36)) % 36];
}

export interface GstinCheck {
  valid: boolean;
  /** Wording meant for the exhibitor, not for a log. */
  reason?: string;
}

/**
 * Everything that can be settled without asking anyone: shape, state code and
 * check digit. An empty value is not judged here — whether a GSTIN is required
 * depends on what is being submitted, so the caller decides that.
 */
export function checkGstin(rawGstin: string): GstinCheck {
  const gstin = normalizeGstin(rawGstin);

  if (gstin.length !== 15) {
    return { valid: false, reason: 'A GSTIN is 15 characters. Enter all 15, or leave the box blank.' };
  }

  if (!GSTIN_PATTERN.test(gstin)) {
    return { valid: false, reason: 'That is not the shape of a GSTIN. It looks like 24AFOFS4061C1Z3.' };
  }

  if (!VALID_STATE_CODES.has(gstin.slice(0, 2))) {
    return { valid: false, reason: `${gstin.slice(0, 2)} is not a GST state code. The first two digits carry your state.` };
  }

  if (gstinCheckDigit(gstin) !== gstin[14]) {
    return { valid: false, reason: 'That GSTIN fails its check digit, so one of the characters is wrong. Please compare it against your GST certificate.' };
  }

  return { valid: true };
}

/** Convenience for render paths that only want a yes or no. */
export function isValidGstin(rawGstin: string): boolean {
  return checkGstin(rawGstin).valid;
}

export interface GstinPortalResult {
  /** False when no verification service is configured or it could not be reached. */
  checked: boolean;
  /** Registration status where known; null when nothing was checked. */
  active: boolean | null;
  legalName?: string;
  /** Why the lookup could not decide. For logs, not for the exhibitor. */
  note?: string;
}

/**
 * Asks a GST verification service whether a GSTIN is really registered.
 *
 * India's GST portal has no free public API — a live lookup goes through a GST
 * Suvidha Provider or a reseller of one, on paid credentials. So this reads
 * its endpoint from the environment and does nothing at all until those are
 * set, which keeps the checksum above as the standing guarantee.
 *
 * Configure with:
 *   GST_VERIFY_API_URL     endpoint, with {gstin} where the number belongs
 *   GST_VERIFY_API_KEY     credential, sent as a header
 *   GST_VERIFY_API_HEADER  header name (default: Authorization)
 *
 * A lookup that fails is deliberately NOT treated as a bad GSTIN. A provider
 * outage during the submission deadline would otherwise lock out exhibitors
 * whose numbers are perfectly good.
 */
export async function verifyGstinWithPortal(gstin: string): Promise<GstinPortalResult> {
  const endpoint = process.env.GST_VERIFY_API_URL;
  const apiKey = process.env.GST_VERIFY_API_KEY;

  if (!endpoint || !apiKey) {
    return { checked: false, active: null, note: 'No GST verification service is configured.' };
  }

  const headerName = process.env.GST_VERIFY_API_HEADER || 'Authorization';
  const url = endpoint.includes('{gstin}')
    ? endpoint.replace('{gstin}', encodeURIComponent(gstin))
    : `${endpoint}${endpoint.endsWith('/') ? '' : '/'}${encodeURIComponent(gstin)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: { [headerName]: apiKey, Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { checked: false, active: null, note: `Verification service answered ${res.status}.` };
    }

    const body = (await res.json()) as Record<string, unknown>;
    const payload = (isRecord(body.data) ? body.data : body) as Record<string, unknown>;

    // Providers disagree about field names, so read the ones they share.
    const status = firstString(payload, ['sts', 'status', 'gstnStatus', 'registrationStatus']);
    const legalName = firstString(payload, ['lgnm', 'legalName', 'legal_name', 'tradeNam', 'tradeName']);

    if (!status) {
      return { checked: false, active: null, note: 'Verification service returned no status field.' };
    }

    return {
      checked: true,
      active: /^(active|acti|yes|valid)$/i.test(status.trim()),
      legalName: legalName || undefined,
    };
  } catch (err) {
    const note = err instanceof Error ? err.message : 'Verification lookup failed.';
    return { checked: false, active: null, note };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function firstString(source: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}
