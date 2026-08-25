export interface SyncPayload {
  mobile: string;
  brand_name?: string;
  stall_sqft?: string;
  fascia_names?: string[];
  items?: Array<{ id: string; name: string; quantity: number; unit: string; days?: number }>;
  special_notes?: string;
  owner_badges?: number;
  sales_badges?: number;
  support_badges?: number;
  badge_names?: {
    owner?: string[];
    sales?: string[];
    support?: string[];
  };
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

    const ownerNamesStr = (payload.badge_names?.owner || []).filter(Boolean).join(', ');
    const salesNamesStr = (payload.badge_names?.sales || []).filter(Boolean).join(', ');
    const supportNamesStr = (payload.badge_names?.support || []).filter(Boolean).join(', ');

    const fascia1 = payload.fascia_names?.[0] || payload.brand_name || '';
    const fascia2 = payload.fascia_names?.[1] || '';
    const fascia3 = payload.fascia_names?.[2] || '';
    const fascia4 = payload.fascia_names?.[3] || '';
    const fasciaAll = (payload.fascia_names || [payload.brand_name]).filter(Boolean).join(' | ');

    const bodyData = {
      timestamp,
      mobile: payload.mobile,
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
      // Exhibitor Entry Badges
      owner_badges: payload.owner_badges || 0,
      owner_badge_names: ownerNamesStr,
      sales_badges: payload.sales_badges || 0,
      sales_badge_names: salesNamesStr,
      support_badges: payload.support_badges || 0,
      support_badge_names: supportNamesStr,
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
        body: JSON.stringify(bodyData)
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
    const getRes = await fetch(getUrl, { method: 'GET', redirect: 'follow' });
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
