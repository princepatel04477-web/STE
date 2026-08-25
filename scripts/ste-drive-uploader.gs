/**
 * Surat Textile Expo 2026 - Exhibitor asset uploader (Google Apps Script)
 * =====================================================================
 *
 * Receives a base64 file from the exhibitor portal and files it as:
 *
 *   STE Logos/
 *     Apple Lifestyle/
 *       Apple Lifestyle - Logo.png
 *       Apple Lifestyle - Artwork.cdr
 *
 * WHY A SCRIPT INSTEAD OF A SERVICE ACCOUNT
 * -----------------------------------------
 * Google service accounts own no Drive storage quota, so they cannot create
 * files inside a folder that lives in a personal (gmail.com) My Drive - the
 * API rejects the upload with "Service Accounts do not have storage quota".
 * A web app deployed with "Execute as: Me" runs under the folder owner's own
 * account and quota, which is exactly what we need here.
 *
 * DEPLOYMENT (one time, ~2 minutes)
 * ---------------------------------
 *  1. Open https://script.google.com and click "New project".
 *  2. Delete the placeholder code and paste this whole file in.
 *  3. Change SHARED_TOKEN below to a long random string of your choosing.
 *  4. Click Deploy > New deployment > (gear) Web app.
 *       Description    : STE Drive Uploader
 *       Execute as     : Me
 *       Who has access : Anyone
 *     Click Deploy, then Authorize access and approve the Drive permission.
 *     (Google will warn the app is unverified - choose Advanced > Go to
 *     project. It is your own script, so this is expected.)
 *  5. Copy the "/exec" Web app URL and put both values in .env.local and in
 *     the Vercel project environment variables:
 *
 *       GOOGLE_DRIVE_WEBAPP_URL="https://script.google.com/macros/s/AKfy.../exec"
 *       GOOGLE_DRIVE_WEBAPP_TOKEN="the SHARED_TOKEN you chose"
 *
 *  6. Verify with:  npm run drive:check
 *
 * NOTE: keep this deployment separate from the Google Sheets webhook script.
 * They are different URLs and GOOGLE_SHEETS_WEBHOOK_URL must stay unchanged.
 *
 * SIZE LIMIT: Apps Script accepts POST bodies up to 50MB. Base64 inflates a
 * file by ~33%, so the practical ceiling here is roughly 35MB per file.
 * Larger files are stored in Supabase and stay 'pending' until synced by
 * `npm run drive:retry` under OAuth credentials.
 */

// Must match GOOGLE_DRIVE_WEBAPP_TOKEN in the app environment.
var SHARED_TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

// Fallback if the caller does not send one. This is the "STE Logos" folder.
var DEFAULT_PARENT_FOLDER_ID = '1_6t-lfH0ha4BF1MxP2nsry6zmjmUFFcm';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ error: 'Empty request body.' });
    }

    var payload = JSON.parse(e.postData.contents);

    if (payload.action !== 'upload_file') {
      return jsonOut({ error: 'Unsupported action: ' + payload.action });
    }

    if (SHARED_TOKEN && SHARED_TOKEN !== 'CHANGE_ME_TO_A_LONG_RANDOM_STRING') {
      if (payload.token !== SHARED_TOKEN) {
        return jsonOut({ error: 'Invalid or missing token.' });
      }
    }

    if (!payload.base64Data || !payload.fileName) {
      return jsonOut({ error: 'Missing fileName or base64Data.' });
    }

    var parentId = payload.parentFolderId || DEFAULT_PARENT_FOLDER_ID;
    var parent = DriveApp.getFolderById(parentId);

    var folderName = String(payload.exhibitorFolderName || payload.brandName || 'Exhibitor').trim();
    if (!folderName) folderName = 'Exhibitor';

    // Serialise folder creation so two simultaneous uploads from the same
    // exhibitor cannot create two folders with the same name.
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    var folder;
    try {
      folder = getOrCreateFolder(parent, folderName);
    } finally {
      lock.releaseLock();
    }

    var blob = Utilities.newBlob(
      Utilities.base64Decode(payload.base64Data),
      payload.mimeType || 'application/octet-stream',
      payload.fileName
    );

    // Replace any previous file of the same name so folders stay clean
    // instead of accumulating "logo (1).png" duplicates.
    var stale = folder.getFilesByName(payload.fileName);
    while (stale.hasNext()) {
      stale.next().setTrashed(true);
    }

    var file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      // Some Workspace policies forbid link sharing; not fatal.
    }

    return jsonOut({
      status: 'success',
      fileId: file.getId(),
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      folderId: folder.getId(),
      folderName: folder.getName(),
      folderUrl: folder.getUrl()
    });
  } catch (err) {
    return jsonOut({ error: String(err && err.message ? err.message : err) });
  }
}

/** Simple GET so you can confirm the deployment is live in a browser. */
function doGet() {
  return jsonOut({ status: 'ok', service: 'STE Drive Uploader' });
}

function getOrCreateFolder(parent, name) {
  var existing = parent.getFoldersByName(name);
  if (existing.hasNext()) {
    return existing.next();
  }
  return parent.createFolder(name);
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
