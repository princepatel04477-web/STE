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
 * MAINTENANCE FUNCTIONS (run from the editor, not over HTTP)
 * ---------------------------------------------------------
 *   auditSteAssets()          - dry run: what is live, what is in the bin, and
 *                               which assets exist ONLY in the bin.
 *   restoreMissingSteAssets() - untrashes just those, leaving superseded
 *                               copies binned so nothing comes back doubled.
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

    // The token guard is active as soon as SHARED_TOKEN has been replaced with
    // a real value (npm run drive:setup does this for you).
    if (SHARED_TOKEN && SHARED_TOKEN.indexOf('CHANGE_ME') !== 0) {
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

    // Replace the previous file of this name IN PLACE.
    //
    // This used to trash every same-named file first and then create a new
    // one. Two things went wrong with that. The old copy went to the bin on
    // every single re-upload - which is why exhibitor photos piled up in the
    // owner's Drive bin. And because a brand new file was created each time,
    // the file id changed, so any link already recorded in Supabase or handed
    // to a printer pointed at a binned file.
    //
    // Overwriting the existing file keeps one id, one link, and puts nothing
    // in the bin. Nothing is trashed until the new content is safely written.
    var matches = folder.getFilesByName(payload.fileName);
    var target = matches.hasNext() ? matches.next() : null;

    // Same-named duplicates left behind by the old trash-and-recreate logic.
    var duplicates = [];
    while (matches.hasNext()) {
      duplicates.push(matches.next());
    }

    var file;
    if (target) {
      file = overwriteFileContents(target.getId(), blob);
    } else {
      file = folder.createFile(blob);
    }

    // Only now that the current file is definitely written is it safe to clear
    // the leftovers, so a failed upload can never cost the exhibitor a photo.
    for (var d = 0; d < duplicates.length; d++) {
      try {
        duplicates[d].setTrashed(true);
      } catch (dupErr) {
        // Not fatal - a stale duplicate is better than a failed upload.
      }
    }

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

/**
 * Replaces a file's bytes without changing its id.
 *
 * DriveApp cannot overwrite binary content, so this calls the Drive REST API
 * with the script's own OAuth token. That needs the external-request scope, so
 * re-authorise the deployment after pasting this version in.
 */
function overwriteFileContents(fileId, blob) {
  var url =
    'https://www.googleapis.com/upload/drive/v3/files/' +
    encodeURIComponent(fileId) +
    '?uploadType=media&supportsAllDrives=true';

  var res = UrlFetchApp.fetch(url, {
    method: 'patch',
    contentType: blob.getContentType(),
    payload: blob.getBytes(),
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  if (code >= 300) {
    throw new Error(
      'Drive rejected the in-place update (HTTP ' + code + '): ' +
        String(res.getContentText()).slice(0, 300)
    );
  }

  return DriveApp.getFileById(fileId);
}

/** Calls a Drive REST endpoint with the script's own credentials. */
function driveApi(path, params, method, body) {
  var query = [];
  for (var k in params) {
    if (params[k] !== undefined && params[k] !== null) {
      query.push(k + '=' + encodeURIComponent(params[k]));
    }
  }

  var options = {
    method: method || 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  };
  if (body) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(body);
  }

  var res = UrlFetchApp.fetch(
    'https://www.googleapis.com/drive/v3/' + path + (query.length ? '?' + query.join('&') : ''),
    options
  );

  if (res.getResponseCode() >= 300) {
    throw new Error(
      'Drive API ' + path + ' failed (HTTP ' + res.getResponseCode() + '): ' +
        String(res.getContentText()).slice(0, 300)
    );
  }
  return JSON.parse(res.getContentText());
}

/** Every file sitting in the bin that still belongs to this folder. */
function listTrashedIn(folderId) {
  var out = [];
  var pageToken = null;
  do {
    var page = driveApi('files', {
      q: "'" + folderId + "' in parents and trashed = true",
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
      pageSize: 200,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageToken: pageToken
    });
    out = out.concat(page.files || []);
    pageToken = page.nextPageToken;
  } while (pageToken);
  return out;
}

/**
 * DRY RUN. Run this first: Run > auditSteAssets, then check the execution log.
 *
 * Reports, per exhibitor folder, what is live and what is in the bin, and
 * flags any asset that exists ONLY in the bin - those are the ones actually
 * lost, as opposed to superseded copies it is fine to leave binned.
 */
function auditSteAssets() {
  var root = DriveApp.getFolderById(DEFAULT_PARENT_FOLDER_ID);
  var folders = root.getFolders();
  var totalLive = 0;
  var totalTrashed = 0;
  var missing = [];

  Logger.log('Auditing "' + root.getName() + '"...');

  while (folders.hasNext()) {
    var folder = folders.next();

    var liveNames = {};
    var liveIter = folder.getFiles();
    var liveCount = 0;
    while (liveIter.hasNext()) {
      liveNames[liveIter.next().getName()] = true;
      liveCount++;
    }

    var trashed = listTrashedIn(folder.getId());
    totalLive += liveCount;
    totalTrashed += trashed.length;

    for (var i = 0; i < trashed.length; i++) {
      if (!liveNames[trashed[i].name]) {
        missing.push({ folder: folder.getName(), id: trashed[i].id, name: trashed[i].name });
      }
    }

    if (trashed.length > 0) {
      Logger.log('  ' + folder.getName() + ' - live: ' + liveCount + ', in bin: ' + trashed.length);
    }
  }

  Logger.log('');
  Logger.log('Live files      : ' + totalLive);
  Logger.log('Files in the bin: ' + totalTrashed);
  Logger.log('ONLY in the bin : ' + missing.length + '  <- these are genuinely lost');
  for (var m = 0; m < missing.length; m++) {
    Logger.log('   ' + missing[m].folder + ' / ' + missing[m].name);
  }
  Logger.log('');
  Logger.log(
    missing.length
      ? 'Run restoreMissingSteAssets() to bring those ' + missing.length + ' back.'
      : 'Nothing is missing - every binned file is a superseded copy that already has a live replacement.'
  );

  return { live: totalLive, trashed: totalTrashed, missing: missing.length };
}

/**
 * RECOVERY. Untrashes only the assets that have no live copy left, so
 * superseded versions stay in the bin instead of coming back as duplicates.
 * Run auditSteAssets() first to see what this will do.
 */
function restoreMissingSteAssets() {
  var root = DriveApp.getFolderById(DEFAULT_PARENT_FOLDER_ID);
  var folders = root.getFolders();
  var restored = 0;

  while (folders.hasNext()) {
    var folder = folders.next();

    var liveNames = {};
    var liveIter = folder.getFiles();
    while (liveIter.hasNext()) {
      liveNames[liveIter.next().getName()] = true;
    }

    var trashed = listTrashedIn(folder.getId());
    // Newest first, so if several binned copies share a name the most recent
    // is the one brought back.
    trashed.sort(function (a, b) {
      return String(b.modifiedTime).localeCompare(String(a.modifiedTime));
    });

    for (var i = 0; i < trashed.length; i++) {
      if (liveNames[trashed[i].name]) continue;
      driveApi('files/' + trashed[i].id, { supportsAllDrives: true }, 'patch', { trashed: false });
      liveNames[trashed[i].name] = true;
      restored++;
      Logger.log('Restored: ' + folder.getName() + ' / ' + trashed[i].name);
    }
  }

  Logger.log('');
  Logger.log('Restored ' + restored + ' file(s) from the bin.');
  return restored;
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
