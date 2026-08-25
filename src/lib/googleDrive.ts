import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

export interface DriveUploadParams {
  mobile: string;
  brandName: string;
  fileName: string;
  fileBuffer: Buffer;
  mimeType: string;
}

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  folderId?: string;
  folderViewLink?: string;
  error?: string;
}

/**
 * Initializes authenticated Google Drive client using Service Account credentials.
 */
function getDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  // Handle newlines in environment variable private key
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ]
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Finds or creates a folder inside a specified parent folder in Google Drive.
 */
async function getOrCreateFolder(
  drive: any,
  folderName: string,
  parentFolderId?: string
): Promise<{ id: string; webViewLink?: string }> {
  let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const searchRes = await drive.files.list({
    q: query,
    fields: 'files(id, name, webViewLink)',
    spaces: 'drive'
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    const found = searchRes.data.files[0];
    return { id: found.id, webViewLink: found.webViewLink };
  }

  // Folder does not exist, create it
  const createMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    createMetadata.parents = [parentFolderId];
  }

  const createRes = await drive.files.create({
    requestBody: createMetadata,
    fields: 'id, name, webViewLink'
  });

  // Make folder accessible via link if possible
  try {
    if (createRes.data.id) {
      await drive.permissions.create({
        fileId: createRes.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    }
  } catch {}

  return { id: createRes.data.id || undefined, webViewLink: createRes.data.webViewLink || undefined };
}

/**
 * Converts a Buffer into a readable stream for Google Drive API.
 */
function bufferToStream(buffer: Buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Automatically creates/finds the exhibitor folder inside "STE Logos" and uploads the file.
 */
export async function syncExhibitorFileToDrive(
  params: DriveUploadParams
): Promise<DriveUploadResult> {
  const { mobile, brandName, fileName, fileBuffer, mimeType } = params;
  const cleanBrand = (brandName || 'Exhibitor').trim();
  const folderName = `${cleanBrand}`;

  // 1. Try Google Drive API via Service Account
  const drive = getDriveClient();
  if (drive) {
    try {
      console.log(`[GoogleDrive] Starting drive sync for ${cleanBrand} (${fileName})...`);

      // 1. Root Parent Folder: STE Logos
      const configuredParentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
      let rootFolderId: string | undefined = configuredParentId;

      if (!rootFolderId) {
        const rootFolder = await getOrCreateFolder(drive, 'STE Logos');
        rootFolderId = rootFolder.id;
      }

      // 2. Exhibitor Subfolder: e.g. "Apple Lifestyle"
      const exhibitorFolder = await getOrCreateFolder(drive, folderName, rootFolderId);

      // 3. Upload the file into the exhibitor subfolder
      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
        parents: exhibitorFolder.id ? [exhibitorFolder.id] : undefined
      };

      const media = {
        mimeType: mimeType || 'application/octet-stream',
        body: bufferToStream(fileBuffer)
      };

      const fileRes = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink'
      });

      // Make file accessible
      try {
        if (fileRes.data.id) {
          await drive.permissions.create({
            fileId: fileRes.data.id,
            requestBody: {
              role: 'reader',
              type: 'anyone'
            }
          });
        }
      } catch {}

      console.log(`[GoogleDrive] Successfully uploaded ${fileName} to Google Drive folder "${folderName}".`);

      return {
        success: true,
        fileId: fileRes.data.id || undefined,
        webViewLink: fileRes.data.webViewLink || fileRes.data.webContentLink || undefined,
        folderId: exhibitorFolder.id,
        folderViewLink: exhibitorFolder.webViewLink
      };
    } catch (error: any) {
      console.error('[GoogleDrive] Service account drive sync failed:', error.message);
    }
  }

  // 2. Fallback via Google Apps Script Web App if configured
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('http')) {
    try {
      console.log(`[GoogleDrive] Attempting upload via Google Apps Script Web App...`);
      const base64Data = fileBuffer.toString('base64');
      const payload = {
        action: 'upload_file',
        parentFolderName: 'STE Logos',
        exhibitorFolderName: folderName,
        mobile,
        brandName: cleanBrand,
        fileName,
        mimeType,
        base64Data
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => null);
      if (json && (json.fileUrl || json.webViewLink || json.status === 'success')) {
        return {
          success: true,
          fileId: json.fileId,
          webViewLink: json.fileUrl || json.webViewLink,
          folderId: json.folderId,
          folderViewLink: json.folderUrl || json.folderViewLink
        };
      }
    } catch (err: any) {
      console.warn('[GoogleDrive] Apps Script webhook upload attempt failed:', err.message);
    }
  }

  console.log('[GoogleDrive] No Google Drive credentials configured. File safely stored in Supabase.');
  return {
    success: false,
    error: 'Google Drive credentials not configured. File stored in primary cloud storage.'
  };
}
