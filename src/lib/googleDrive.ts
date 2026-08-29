import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

/**
 * Google Drive sync for exhibitor brand assets.
 *
 * Target layout (kept deliberately symmetrical for every exhibitor):
 *
 *   STE Logos/                        <- GOOGLE_DRIVE_PARENT_FOLDER_ID
 *     Apple Lifestyle/                <- one folder per exhibitor brand
 *       Apple Lifestyle - Logo.png
 *       Apple Lifestyle - Artwork.cdr
 *     Zenith Textiles/
 *       Zenith Textiles - Logo.jpg
 *
 * Auth is resolved in priority order, because each option has different
 * storage-quota semantics:
 *
 *   1. OAuth2 refresh token  - files are owned by the human who consented and
 *      consume that person's Drive quota. This is the only API-based option
 *      that works for a folder living in a personal (gmail.com) My Drive.
 *   2. Service account       - has NO storage quota of its own, so file
 *      creation only succeeds inside a Google Workspace Shared Drive, or with
 *      domain-wide delegation impersonating a real user.
 *   3. Apps Script web app   - runs as the deploying user, so it uses their
 *      quota. Zero Google Cloud setup; the usual choice for personal accounts.
 */

export type AssetCategory = 'logo' | 'cdr' | 'profile_pic';

export interface DriveUploadParams {
  mobile: string;
  brandName: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
  category?: AssetCategory;
  /** 1-based position within the exhibitor's files of this category. */
  slot?: number;
}

export interface DriveUploadResult {
  success: boolean;
  strategy?: 'oauth' | 'service_account' | 'apps_script';
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  folderId?: string;
  folderName?: string;
  folderViewLink?: string;
  error?: string;
}

const DEFAULT_ROOT_FOLDER_NAME = 'STE Logos';
const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

/* ------------------------------------------------------------------ *
 * Naming
 * ------------------------------------------------------------------ */

/**
 * Strips characters Drive and Supabase Storage handle badly, then collapses
 * whitespace, so '  Apple   Lifestyle/Pvt Ltd ' becomes 'Apple Lifestyle-Pvt Ltd'.
 */
const FORBIDDEN_NAME_CHARS = new Set(['\\', '/', ':', '*', '?', '"', '<', '>', '|']);

export function sanitizeFolderName(raw: string): string {
  const cleaned = Array.from(raw || '')
    .map((char) => {
      const code = char.charCodeAt(0);
      // Fold ASCII control characters (tabs, newlines) into a space so the
      // collapse below turns "Krishna\tSarees" into "Krishna Sarees".
      if (code < 32 || code === 127) return ' ';
      // Replace path-hostile characters rather than deleting them, so
      // "Apple/Lifestyle" stays readable as "Apple-Lifestyle".
      return FORBIDDEN_NAME_CHARS.has(char) ? '-' : char;
    })
    .join('')
    .replace(/-+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[.\-]+/, '')
    .replace(/[.\-]+$/, '')
    .trim();

  return cleaned || 'Exhibitor';
}

export function fileExtension(fileName: string): string {
  const match = /(\.[a-zA-Z0-9]+)$/.exec(fileName || '');
  return match ? match[1].toLowerCase() : '';
}

/**
 * Deterministic, human-readable asset name so every exhibitor folder looks the
 * same: 'Apple Lifestyle - Logo.png' / 'Apple Lifestyle - Artwork.cdr' / 'Apple Lifestyle - ProfilePhoto.jpg'.
 *
 * An exhibitor may keep several logos and several artwork files, so the name
 * carries the slot they occupy: the first is unnumbered and the rest read
 * 'Apple Lifestyle - Logo 2.png', 'Apple Lifestyle - Logo 3.png'. The name is
 * still derived rather than random, so re-uploading into a slot replaces that
 * file in place instead of stacking 'logo (1).png' duplicates beside it.
 */
export function buildAssetFileName(
  brandName: string,
  originalFileName: string,
  category?: AssetCategory,
  slot?: number
): string {
  const brand = sanitizeFolderName(brandName);
  const ext = fileExtension(originalFileName) || '.bin';
  const resolved: AssetCategory = category || (ext === '.cdr' ? 'cdr' : 'logo');
  const label = resolved === 'cdr' ? 'Artwork' : (resolved === 'profile_pic' ? 'ProfilePhoto' : 'Logo');
  const suffix = slot && slot > 1 ? ' ' + slot : '';
  return brand + ' - ' + label + suffix + ext;
}

/** Escapes a value for use inside a Drive `q=` search string. */
function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/* ------------------------------------------------------------------ *
 * Auth
 * ------------------------------------------------------------------ */

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:5813/oauth2callback'
  );
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

function getServiceAccountClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) return null;

  // Vercel and dotenv store the PEM with literal backslash-n sequences.
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: DRIVE_SCOPES,
    // Domain-wide delegation: impersonate a real user so uploads use their quota.
    subject: process.env.GOOGLE_IMPERSONATED_USER_EMAIL || undefined
  });
}

/**
 * Returns the highest-priority Drive client available, or null when no Google
 * API credentials are configured at all.
 */
function getDriveClient(): { drive: drive_v3.Drive; strategy: 'oauth' | 'service_account' } | null {
  const oauth = getOAuthClient();
  if (oauth) {
    return { drive: google.drive({ version: 'v3', auth: oauth }), strategy: 'oauth' };
  }

  const serviceAccount = getServiceAccountClient();
  if (serviceAccount) {
    return { drive: google.drive({ version: 'v3', auth: serviceAccount }), strategy: 'service_account' };
  }

  return null;
}

/* ------------------------------------------------------------------ *
 * Drive primitives
 * ------------------------------------------------------------------ */

const ALL_DRIVES = { supportsAllDrives: true, includeItemsFromAllDrives: true };

async function findOrCreateFolder(
  drive: drive_v3.Drive,
  folderName: string,
  parentFolderId?: string
): Promise<{ id: string; webViewLink?: string }> {
  const clauses = [
    "mimeType = 'application/vnd.google-apps.folder'",
    "name = '" + escapeQueryValue(folderName) + "'",
    'trashed = false'
  ];
  if (parentFolderId) {
    clauses.push("'" + escapeQueryValue(parentFolderId) + "' in parents");
  }

  const existing = await drive.files.list({
    q: clauses.join(' and '),
    fields: 'files(id, name, webViewLink)',
    pageSize: 1,
    spaces: 'drive',
    ...ALL_DRIVES
  });

  const found = existing.data.files?.[0];
  if (found?.id) {
    return { id: found.id, webViewLink: found.webViewLink || undefined };
  }

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined
    },
    fields: 'id, name, webViewLink',
    supportsAllDrives: true
  });

  if (!created.data.id) {
    throw new Error('Drive did not return an id for new folder "' + folderName + '"');
  }

  return { id: created.data.id, webViewLink: created.data.webViewLink || undefined };
}

/**
 * Finds a same-named file in the folder so a re-upload updates it in place,
 * preserving the file id and therefore any link already shared with vendors.
 */
async function findExistingFile(
  drive: drive_v3.Drive,
  fileName: string,
  folderId: string
): Promise<string | null> {
  const res = await drive.files.list({
    q: [
      "name = '" + escapeQueryValue(fileName) + "'",
      "'" + escapeQueryValue(folderId) + "' in parents",
      'trashed = false'
    ].join(' and '),
    fields: 'files(id)',
    pageSize: 1,
    spaces: 'drive',
    ...ALL_DRIVES
  });

  return res.data.files?.[0]?.id || null;
}

/** Best-effort link sharing; a failure here must not fail the upload. */
async function makeReadableByLink(drive: drive_v3.Drive, fileId: string): Promise<void> {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true
    });
  } catch {
    // Shared drives and some org policies forbid public links - not fatal.
  }
}

/* ------------------------------------------------------------------ *
 * Upload strategies
 * ------------------------------------------------------------------ */

async function uploadViaDriveApi(
  drive: drive_v3.Drive,
  strategy: 'oauth' | 'service_account',
  params: DriveUploadParams
): Promise<DriveUploadResult> {
  const folderName = sanitizeFolderName(params.brandName);
  const assetName = buildAssetFileName(params.brandName, params.fileName, params.category, params.slot);

  // 1. Root folder ("STE Logos"), by configured id where available.
  const configuredRootId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID?.trim();
  const rootFolderId =
    configuredRootId || (await findOrCreateFolder(drive, DEFAULT_ROOT_FOLDER_NAME)).id;

  // 2. Per-exhibitor folder, e.g. "Apple Lifestyle".
  const exhibitorFolder = await findOrCreateFolder(drive, folderName, rootFolderId);

  // 3. Create or update the asset itself.
  const media = {
    mimeType: params.mimeType || 'application/octet-stream',
    body: bufferToStream(params.fileBuffer)
  };

  const existingFileId = await findExistingFile(drive, assetName, exhibitorFolder.id);

  const saved = existingFileId
    ? await drive.files.update({
        fileId: existingFileId,
        requestBody: { name: assetName },
        media,
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true
      })
    : await drive.files.create({
        requestBody: { name: assetName, parents: [exhibitorFolder.id] },
        media,
        fields: 'id, name, webViewLink, webContentLink',
        supportsAllDrives: true
      });

  if (saved.data.id) {
    await makeReadableByLink(drive, saved.data.id);
  }

  return {
    success: true,
    strategy,
    fileId: saved.data.id || undefined,
    fileName: assetName,
    webViewLink: saved.data.webViewLink || saved.data.webContentLink || undefined,
    folderId: exhibitorFolder.id,
    folderName,
    folderViewLink:
      exhibitorFolder.webViewLink || 'https://drive.google.com/drive/folders/' + exhibitorFolder.id
  };
}

async function uploadViaAppsScript(params: DriveUploadParams): Promise<DriveUploadResult | null> {
  const webhookUrl = process.env.GOOGLE_DRIVE_WEBAPP_URL || process.env.GOOGLE_DRIVE_SCRIPT_URL;
  if (!webhookUrl || !webhookUrl.startsWith('http')) return null;

  const folderName = sanitizeFolderName(params.brandName);
  const assetName = buildAssetFileName(params.brandName, params.fileName, params.category, params.slot);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'upload_file',
      token: process.env.GOOGLE_DRIVE_WEBAPP_TOKEN || '',
      parentFolderId: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || '',
      parentFolderName: DEFAULT_ROOT_FOLDER_NAME,
      exhibitorFolderName: folderName,
      mobile: params.mobile,
      brandName: folderName,
      fileName: assetName,
      mimeType: params.mimeType || 'application/octet-stream',
      base64Data: params.fileBuffer.toString('base64')
    })
  });

  let json: any = null;
  try {
    const rawText = await res.text();
    try {
      json = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*"(?:fileId|fileUrl|status|folderId)"[\s\S]*\}/);
      if (jsonMatch) {
        json = JSON.parse(jsonMatch[0]);
      }
    }
  } catch (err: any) {
    return {
      success: false,
      strategy: 'apps_script',
      error: `Could not read Apps Script response: ${err.message}`
    };
  }

  // Require a concrete file id or link.
  if (!json || (!json.fileId && !json.fileUrl && !json.webViewLink)) {
    return {
      success: false,
      strategy: 'apps_script',
      error: json?.error || json?.message || 'Apps Script web app did not return an uploaded file id.'
    };
  }

  return {
    success: true,
    strategy: 'apps_script',
    fileId: json.fileId,
    fileName: json.fileName || assetName,
    webViewLink: json.fileUrl || json.webViewLink,
    folderId: json.folderId,
    folderName,
    folderViewLink:
      json.folderUrl ||
      json.folderViewLink ||
      (json.folderId ? 'https://drive.google.com/drive/folders/' + json.folderId : undefined)
  };
}

/* ------------------------------------------------------------------ *
 * Public entry point
 * ------------------------------------------------------------------ */

export function isDriveConfigured(): boolean {
  return Boolean(
    getDriveClient() || process.env.GOOGLE_DRIVE_WEBAPP_URL || process.env.GOOGLE_DRIVE_SCRIPT_URL
  );
}

/**
 * Ensures 'STE Logos/<Brand Name>/' exists and stores the asset inside it.
 * Never throws - callers treat Drive as a mirror of Supabase Storage, so a
 * Drive outage must not fail the exhibitor's upload.
 */
export async function syncExhibitorFileToDrive(
  params: DriveUploadParams
): Promise<DriveUploadResult> {
  const brand = sanitizeFolderName(params.brandName);
  const errors: string[] = [];

  const client = getDriveClient();
  if (client) {
    try {
      const result = await uploadViaDriveApi(client.drive, client.strategy, params);
      console.log(
        '[GoogleDrive] Stored "' + result.fileName + '" in "' +
          DEFAULT_ROOT_FOLDER_NAME + '/' + brand + '" via ' + client.strategy + '.'
      );
      return result;
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || error?.message || String(error);
      errors.push(client.strategy + ': ' + message);
      console.error('[GoogleDrive] ' + client.strategy + ' upload failed:', message);

      if (/storage quota/i.test(message)) {
        console.error(
          '[GoogleDrive] Service accounts own no storage. Use a Shared Drive, set ' +
            'GOOGLE_IMPERSONATED_USER_EMAIL for domain-wide delegation, or switch to ' +
            'OAuth / the Apps Script web app.'
        );
      }
    }
  }

  try {
    const scriptResult = await uploadViaAppsScript(params);
    if (scriptResult?.success) {
      console.log(
        '[GoogleDrive] Stored "' + scriptResult.fileName + '" in "' + brand +
          '" via Apps Script web app.'
      );
      return scriptResult;
    }
    if (scriptResult?.error) errors.push('apps_script: ' + scriptResult.error);
  } catch (error: any) {
    errors.push('apps_script: ' + (error?.message || String(error)));
    console.warn('[GoogleDrive] Apps Script upload failed:', error?.message);
  }

  const error = errors.length
    ? errors.join(' | ')
    : 'No Google Drive credentials configured (set GOOGLE_DRIVE_WEBAPP_URL or OAuth credentials).';

  console.warn('[GoogleDrive] Drive sync skipped for "' + brand + '": ' + error);
  return { success: false, error };
}

/**
 * Removes a mirrored file from Drive when the exhibitor deletes it in the
 * portal. Never throws: Supabase Storage is the source of truth, so a Drive
 * that cannot be reached must not block the deletion the exhibitor asked for.
 * The Apps Script strategy has no delete endpoint, so an Apps-Script-only
 * deployment leaves the mirrored copy behind and says so.
 */
export async function deleteExhibitorFileFromDrive(
  fileId: string
): Promise<{ success: boolean; error?: string }> {
  if (!fileId) return { success: false, error: 'No Drive file id recorded for this asset.' };

  const client = getDriveClient();
  if (!client) {
    return { success: false, error: 'No Drive API credentials configured; mirrored copy left in place.' };
  }

  try {
    // Trash rather than purge, so an accidental delete stays recoverable.
    await client.drive.files.update({
      fileId,
      requestBody: { trashed: true },
      supportsAllDrives: true
    });
    return { success: true };
  } catch (error: any) {
    const message = error?.errors?.[0]?.message || error?.message || String(error);
    console.warn('[GoogleDrive] Could not trash file ' + fileId + ': ' + message);
    return { success: false, error: message };
  }
}
