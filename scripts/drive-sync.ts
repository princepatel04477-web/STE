/**
 * Google Drive sync utility for exhibitor brand assets.
 *
 *   npm run drive:check   - report configuration + sync status, upload a probe
 *   npm run drive:retry   - re-attempt Drive sync for every pending asset
 *
 * The probe in `drive:check` writes a real file into a "__STE Connection Test"
 * folder and then trashes it, so a green result means uploads genuinely work.
 */

import fs from 'fs';
import path from 'path';

// Load .env.local before anything imports the Supabase/Drive clients.
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      let v = trimmed.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadEnv();

async function main() {
  const mode = process.argv[2] === 'retry' ? 'retry' : 'check';

  const { syncExhibitorFileToDrive, isDriveConfigured } = await import('../src/lib/googleDrive');
  const { retryPendingDriveSyncs } = await import('../src/lib/exhibitorAssets');
  const { supabaseAdmin, isSupabaseConfigured } = await import('../src/lib/supabase');

  console.log('=== Configuration ===');
  console.log('Supabase              :', isSupabaseConfigured ? 'configured' : 'MISSING');
  console.log('Drive parent folder   :', process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || 'MISSING');

  const strategies = [
    ['OAuth refresh token', Boolean(process.env.GOOGLE_OAUTH_REFRESH_TOKEN)],
    ['Service account', Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL)],
    ['Apps Script web app', Boolean(process.env.GOOGLE_DRIVE_WEBAPP_URL)]
  ] as Array<[string, boolean]>;

  for (const [name, present] of strategies) {
    console.log('  ' + name.padEnd(20) + ':', present ? 'configured' : '-');
  }

  if (!isDriveConfigured()) {
    console.log(
      '\nNo Drive credentials found. Deploy scripts/ste-drive-uploader.gs and set\n' +
        'GOOGLE_DRIVE_WEBAPP_URL + GOOGLE_DRIVE_WEBAPP_TOKEN, or supply OAuth credentials.'
    );
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data } = await supabaseAdmin.from('exhibitor_assets').select('drive_sync_status');
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.drive_sync_status] = (counts[row.drive_sync_status] || 0) + 1;
    }
    console.log('\n=== Asset ledger ===');
    console.log('total   :', (data || []).length);
    console.log('synced  :', counts.synced || 0);
    console.log('pending :', counts.pending || 0);
    console.log('failed  :', counts.failed || 0);
  }

  if (mode === 'retry') {
    console.log('\n=== Retrying pending Drive syncs ===');
    const result = await retryPendingDriveSyncs();
    console.log('attempted :', result.attempted);
    console.log('synced    :', result.synced);
    for (const f of result.failures) {
      console.log('  FAILED ' + f.mobile + ' / ' + f.asset + ' - ' + f.error);
    }
    process.exitCode = result.failures.length > 0 ? 1 : 0;
    return;
  }

  if (!isDriveConfigured()) {
    process.exitCode = 1;
    return;
  }

  console.log('\n=== Upload probe ===');
  const probe = await syncExhibitorFileToDrive({
    mobile: '0000000000',
    brandName: '__STE Connection Test',
    fileName: 'connection-test.png',
    // Smallest valid 1x1 PNG.
    fileBuffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    ),
    mimeType: 'image/png',
    category: 'logo'
  });

  if (probe.success) {
    console.log('SUCCESS via ' + probe.strategy);
    console.log('  folder :', probe.folderName, probe.folderViewLink);
    console.log('  file   :', probe.fileName, probe.webViewLink);
    console.log('\nDrive sync is working. Delete the "__STE Connection Test" folder when done.');
    return;
  }

  console.log('FAILED:', probe.error);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
