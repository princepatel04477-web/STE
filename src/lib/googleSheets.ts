export interface SyncPayload {
  mobile: string;
  brand_name?: string;
  stall_sqft?: string;
  items?: Array<{ name: string; quantity: number; unit: string }>;
  special_notes?: string;
  updated_at?: string;
}

/**
 * Sends exhibitor application data to Google Sheets Webhook URL in real-time.
 */
export async function syncToGoogleSheets(payload: SyncPayload): Promise<boolean> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[GoogleSheets] No GOOGLE_SHEETS_WEBHOOK_URL set in env. Skipping external sync.');
    return false;
  }

  try {
    const formattedItems = Array.isArray(payload.items) && payload.items.length > 0
      ? payload.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join('; ')
      : 'None';

    const bodyData = {
      timestamp: payload.updated_at || new Date().toISOString(),
      mobile: payload.mobile,
      brand_name: payload.brand_name || '',
      stall_sqft: payload.stall_sqft || '',
      items_requested: formattedItems,
      special_notes: payload.special_notes || ''
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    if (!res.ok) {
      console.error('[GoogleSheets] Failed response from webhook:', res.status, res.statusText);
      return false;
    }

    console.log('[GoogleSheets] Successfully synced exhibitor entry to Google Sheet.');
    return true;
  } catch (error) {
    console.error('[GoogleSheets] Error syncing to Google Sheet:', error);
    return false;
  }
}

/**
 * Google Apps Script snippet to paste into Google Sheets > Extensions > Apps Script:
 * 
 * ```javascript
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = JSON.parse(e.postData.contents);
 *   
 *   // Ensure header row exists
 *   if (sheet.getLastRow() === 0) {
 *     sheet.appendRow(["Timestamp", "Mobile Number", "Brand Name", "Stall Size (Sq Ft)", "Extras Requested", "Special Notes"]);
 *   }
 *   
 *   // Append entry row
 *   sheet.appendRow([
 *     new Date(),
 *     "'" + (data.mobile || ""),
 *     data.brand_name || "",
 *     data.stall_sqft || "",
 *     data.items_requested || "",
 *     data.special_notes || ""
 *   ]);
 *   
 *   return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * ```
 */
