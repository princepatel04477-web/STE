export interface SyncPayload {
  mobile: string;
  exhibitor_name?: string;
  profile_pic_url?: string;
  company_description?: string;
  brand_name?: string;
  stall_sqft?: string;
  fascia_names?: string[];
  items?: Array<{ id: string; name: string; quantity: number; unit: string; days?: number }>;
  special_notes?: string;
  rental_days?: number;
  logo_file_url?: string;
  cdr_file_url?: string;
  drive_file_url?: string;
  drive_folder_url?: string;
  updated_at?: string;
}

/**
 * Sends exhibitor application data to Google Sheets Webhook URL in real-time.
 * Maps individual product quantities into dedicated spreadsheet columns.
 */
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwl6gh0Pt99Ea4LYl8VRFJrbOw_3QBBjhMP1At8hzd3n0LNyHNJu0uiSs2b7umTwyJ8/exec';

// The sheet write is awaited inside the request, because a serverless function
// is frozen the moment it responds. Apps Script is occasionally slow, so cap
// each attempt: the database write has already succeeded by this point, and a
// slow sheet must not turn a saved form into a timeout the exhibitor reads as
// "nothing was saved".
const SHEETS_ATTEMPT_TIMEOUT_MS = 6000;

function attemptSignal(): AbortSignal | undefined {
  try {
    return AbortSignal.timeout(SHEETS_ATTEMPT_TIMEOUT_MS);
  } catch {
    return undefined;
  }
}

export async function syncToGoogleSheets(payload: SyncPayload): Promise<boolean> {
  const webhookUrl =
    process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
    process.env.GOOGLE_SHEET_WEBHOOK_URL ||
    DEFAULT_WEBHOOK_URL;

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.log('[GoogleSheets] No valid GOOGLE_SHEETS_WEBHOOK_URL set in env. Skipping external sync.');
    return false;
  }

  try {
    const itemMap: Record<string, number> = {};
    if (Array.isArray(payload.items)) {
      payload.items.forEach(i => {
        if (i.id) itemMap[i.id] = i.quantity;
      });
    }

    const formattedItemsSummary = Array.isArray(payload.items) && payload.items.length > 0
      ? payload.items.map(i => `${i.name} (${i.quantity} ${i.unit || 'unit'}${i.days ? `, ${i.days}d` : ''})`).join('; ')
      : 'None';

    const timestamp = payload.updated_at
      ? new Date(payload.updated_at).toLocaleString()
      : new Date().toLocaleString();

    const fascia1 = payload.fascia_names?.[0] || payload.brand_name || '';
    const fascia2 = payload.fascia_names?.[1] || '';
    const fascia3 = payload.fascia_names?.[2] || '';
    const fascia4 = payload.fascia_names?.[3] || '';
    const fasciaAll = (payload.fascia_names || [payload.brand_name]).filter(Boolean).join(' | ');

    const bodyData = {
      timestamp,
      mobile: payload.mobile,
      exhibitor_name: payload.exhibitor_name || '',
      profile_pic_url: payload.profile_pic_url || '',
      company_description: payload.company_description || '',
      brand_name: payload.brand_name || '',
      stall_sqft: payload.stall_sqft || '',
      // Facia / Banner Firm Name Options
      fascia_name_1: fascia1,
      fascia_name_2: fascia2,
      fascia_name_3: fascia3,
      fascia_name_4: fascia4,
      fascia_names_summary: fasciaAll,
      rental_days: payload.rental_days || 2,
      // Dedicated product column quantities
      sofa_2seater: itemMap['sofa-2seater'] || 0,
      sofa_single: itemMap['sofa-single'] || 0,
      exhibition_chair: itemMap['exhibition-chair'] || 0,
      glass_table: itemMap['glass-table'] || 0,
      reception_counter: itemMap['reception-counter'] || 0,
      female_model: itemMap['female-model'] || 0,
      male_model: itemMap['male-model'] || 0,
      spot_light: itemMap['spot-light'] || 0,
      power_socket: itemMap['power-socket'] || 0,
      tv_screen: itemMap['tv-screen'] || 0,
      display_rack: itemMap['display-rack'] || 0,
      brochure_stand: itemMap['brochure-stand'] || 0,
      // Summary & Notes
      items_summary: formattedItemsSummary,
      special_notes: payload.special_notes || '',
      // Official Brand Assets & Google Drive Links
      logo_file_url: payload.logo_file_url || '',
      cdr_file_url: payload.cdr_file_url || '',
      drive_file_url: payload.drive_file_url || '',
      drive_folder_url: payload.drive_folder_url || ''
    };

    // 1. Try POST request
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyData),
        signal: attemptSignal()
      });
      const text = await res.text();
      if (res.ok && (text.includes('success') || text.includes('result'))) {
        console.log('[GoogleSheets] Successfully synced individual item columns via POST.');
        return true;
      }
    } catch (e) {
      console.warn('[GoogleSheets] POST attempt failed, trying GET fallback...', e);
    }

    // 2. GET Fallback using URL query parameters
    const queryParams = new URLSearchParams();
    Object.entries(bodyData).forEach(([k, v]) => {
      queryParams.append(k, String(v));
    });

    const getUrl = `${webhookUrl}?${queryParams.toString()}`;
    const getRes = await fetch(getUrl, { method: 'GET', redirect: 'follow', signal: attemptSignal() });
    const getText = await getRes.text();

    if (getRes.ok && (getText.includes('success') || getText.includes('result'))) {
      console.log('[GoogleSheets] Successfully synced individual item columns via GET fallback.');
      return true;
    }

    return true;
  } catch (error) {
    console.error('[GoogleSheets] Error syncing to Google Sheet:', error);
    return false;
  }
}

/* ------------------------------------------------------------------------ *
 * Whole-row composition
 *
 * The Apps Script webhook rewrites an exhibitor's sheet row in full from the
 * payload it is handed, so any field left out of a payload is blanked in the
 * sheet. Three routes write that row — profile, extras and upload — and each
 * one used to send only the fields it happened to own, wiping the other two's
 * columns: saving a name erased the uploaded logo and Drive links, uploading a
 * logo erased every extra item.
 *
 * Everything now goes through buildExhibitorRow(), which reads the complete
 * current state of the exhibitor (profile + assets + order) from the cloud
 * database before writing, so the row is whole no matter which action
 * triggered the sync.
 * ------------------------------------------------------------------------ */

/** Supabase hands these columns back as objects; the local store as strings. */
function parseJsonish(value: unknown): unknown {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asCount(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** The columns of an exhibitor record this module reads. */
interface ExhibitorRow {
  brand_name?: string;
  stall_sqft?: string;
  exhibitor_name?: string;
  profile_pic_url?: string;
  company_description?: string;
  fascia_names_json?: unknown;
  logo_file_url?: string;
  cdr_file_url?: string;
  drive_file_url?: string;
  drive_folder_url?: string;
}

interface OrderRow {
  items_json?: unknown;
  special_notes?: string;
  rental_days?: number;
}

/**
 * Reads the exhibitor's complete record and returns a full sheet-row payload.
 * `overrides` carries the values the calling route has just written, which win
 * over what was read back — a read can race its own write on a replica.
 */
export async function buildExhibitorRow(
  mobile: string,
  overrides: Partial<SyncPayload> = {}
): Promise<SyncPayload> {
  const { default: db } = await import('@/lib/db');
  const { supabaseAdmin, isSupabaseConfigured } = await import('@/lib/supabase');
  const { findExhibitorByMobile } = await import('@/data/registeredExhibitors');

  const reg = findExhibitorByMobile(mobile);

  let profile: ExhibitorRow | undefined = db
    .prepare(
      'SELECT brand_name, stall_sqft, exhibitor_name, profile_pic_url, company_description, fascia_names_json, logo_file_url, cdr_file_url, drive_file_url, drive_folder_url, updated_at FROM exhibitors WHERE mobile = ?'
    )
    .get(mobile) as ExhibitorRow | undefined;

  let order: OrderRow | undefined = db
    .prepare(
      'SELECT items_json, special_notes, rental_days FROM exhibitor_orders WHERE mobile = ?'
    )
    .get(mobile) as OrderRow | undefined;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const [{ data: sbProfile }, { data: sbOrder }] = await Promise.all([
        supabaseAdmin.from('exhibitors').select('*').eq('mobile', mobile).maybeSingle(),
        supabaseAdmin.from('exhibitor_orders').select('*').eq('mobile', mobile).maybeSingle()
      ]);
      if (sbProfile) profile = { ...profile, ...sbProfile };
      if (sbOrder) order = { ...order, ...sbOrder };
    } catch (err) {
      console.warn('[GoogleSheets] Row build fell back to the local store:', err);
    }
  }

  // The exhibitor's own name, description and picture live inside the
  // structured fascia payload on Supabase and in their own columns locally.
  let exhibitorName = profile?.exhibitor_name || '';
  let companyDescription = profile?.company_description || '';
  let profilePicUrl = profile?.profile_pic_url || '';
  let fasciaNames: string[] = [];

  const parsedFascia = parseJsonish(profile?.fascia_names_json);
  if (Array.isArray(parsedFascia)) {
    fasciaNames = parsedFascia.map((n) => String(n || ''));
  } else if (isPlainObject(parsedFascia)) {
    if (Array.isArray(parsedFascia.fascia_names)) {
      fasciaNames = parsedFascia.fascia_names.map((n) => String(n || ''));
    }
    if (asText(parsedFascia.exhibitor_name)) exhibitorName = asText(parsedFascia.exhibitor_name);
    if (asText(parsedFascia.company_description)) companyDescription = asText(parsedFascia.company_description);
    if (asText(parsedFascia.profile_pic_url)) profilePicUrl = asText(parsedFascia.profile_pic_url);
  }

  const brandName = profile?.brand_name?.trim() || reg?.brandName || '';
  if (fasciaNames.length === 0) fasciaNames = [brandName, ''];

  const items = (() => {
    const parsed = parseJsonish(order?.items_json);
    return Array.isArray(parsed) ? (parsed as SyncPayload['items']) : [];
  })();

  const composed: SyncPayload = {
    mobile,
    exhibitor_name: exhibitorName,
    profile_pic_url: profilePicUrl,
    company_description: companyDescription,
    brand_name: brandName,
    stall_sqft: profile?.stall_sqft?.trim() || reg?.stallSqft || '',
    fascia_names: fasciaNames,
    items,
    special_notes: order?.special_notes || '',
    rental_days: asCount(order?.rental_days, 2),
    logo_file_url: profile?.logo_file_url || '',
    cdr_file_url: profile?.cdr_file_url || '',
    drive_file_url: profile?.drive_file_url || '',
    drive_folder_url: profile?.drive_folder_url || ''
  };

  const target = composed as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      target[key] = value;
    }
  }

  return composed;
}

/**
 * Writes the exhibitor's complete row to the sheet. Every route that changes
 * exhibitor data should call this rather than syncToGoogleSheets directly, so
 * no column is ever blanked by a partial payload.
 */
export async function syncExhibitorRowToSheets(
  mobile: string,
  overrides: Partial<SyncPayload> = {}
): Promise<boolean> {
  try {
    const payload = await buildExhibitorRow(mobile, overrides);
    return await syncToGoogleSheets(payload);
  } catch (err) {
    console.error('[GoogleSheets] Could not compose the exhibitor row:', err);
    return false;
  }
}
