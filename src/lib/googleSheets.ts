export interface SyncPayload {
  mobile: string;
  brand_name?: string;
  stall_sqft?: string;
  items?: Array<{ id: string; name: string; quantity: number; unit: string }>;
  special_notes?: string;
  updated_at?: string;
}

/**
 * Sends exhibitor application data to Google Sheets Webhook URL in real-time.
 * Maps individual product quantities into dedicated spreadsheet columns.
 */
export async function syncToGoogleSheets(payload: SyncPayload): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL;

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
      ? payload.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join('; ')
      : 'None';

    const timestamp = payload.updated_at
      ? new Date(payload.updated_at).toLocaleString()
      : new Date().toLocaleString();

    const bodyData = {
      timestamp,
      mobile: payload.mobile,
      brand_name: payload.brand_name || '',
      stall_sqft: payload.stall_sqft || '',
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
      special_notes: payload.special_notes || ''
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
