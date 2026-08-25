/**
 * One-command Google Drive setup for the exhibitor portal.
 *
 *   npm run drive:setup              -> generate the token + ready-to-paste script
 *   npm run drive:setup <webapp-url> -> wire it up, verify it, backfill everything
 *
 * Step 1 writes scripts/ste-drive-uploader.generated.gs with a fresh random
 * token already inlined, so the file can be pasted into script.google.com
 * without editing anything.
 *
 * Step 2 saves GOOGLE_DRIVE_WEBAPP_URL/TOKEN into .env.local, uploads a real
 * probe file to confirm the deployment works, then syncs every asset that was
 * uploaded before Drive credentials existed.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ENV_PATH = path.join(process.cwd(), '.env.local');
const TEMPLATE_PATH = path.join(process.cwd(), 'scripts', 'ste-drive-uploader.gs');
const GENERATED_PATH = path.join(process.cwd(), 'scripts', 'ste-drive-uploader.generated.gs');
const TOKEN_PLACEHOLDER = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#') || !t.includes('=')) continue;
      const i = t.indexOf('=');
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

/** Reads a key straight from .env.local, ignoring process.env. */
function readEnvFileValue(key: string): string | null {
  if (!fs.existsSync(ENV_PATH)) return null;
  for (const line of fs.readFileSync(ENV_PATH, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t.startsWith(key + '=') && !t.startsWith(key + ' =')) continue;
    let v = t.slice(t.indexOf('=') + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  }
  return null;
}

/** Adds or replaces a key in .env.local without disturbing anything else. */
function upsertEnvValue(key: string, value: string) {
  const line = key + '="' + value + '"';
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';

  const pattern = new RegExp('^\\s*' + key + '\\s*=.*$', 'm');
  if (pattern.test(content)) {
    content = content.replace(pattern, line);
  } else {
    if (content.length && !content.endsWith('\n')) content += '\n';
    content += line + '\n';
  }

  fs.writeFileSync(ENV_PATH, content, 'utf-8');
}

/** Step 1: mint a token and write a paste-ready copy of the Apps Script. */
function prepare() {
  const existingToken = readEnvFileValue('GOOGLE_DRIVE_WEBAPP_TOKEN');
  const token = existingToken || crypto.randomBytes(24).toString('hex');

  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('Missing template: ' + TEMPLATE_PATH);
    process.exitCode = 1;
    return;
  }

  const script = fs.readFileSync(TEMPLATE_PATH, 'utf-8').replace(TOKEN_PLACEHOLDER, token);
  if (script.includes(TOKEN_PLACEHOLDER)) {
    console.error('Could not inline the token into the template.');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(GENERATED_PATH, script, 'utf-8');
  upsertEnvValue('GOOGLE_DRIVE_WEBAPP_TOKEN', token);

  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || '(not set)';

  console.log('Google Drive setup - step 1 of 2');
  console.log('================================\n');
  console.log('Wrote scripts/ste-drive-uploader.generated.gs (token already filled in).');
  console.log('Saved GOOGLE_DRIVE_WEBAPP_TOKEN to .env.local.\n');
  console.log('Target Drive folder: ' + parentId);
  console.log('  https://drive.google.com/drive/folders/' + parentId + '\n');
  console.log('Now do this once, in your browser:\n');
  console.log('  1. Open https://script.google.com and click "New project".');
  console.log('  2. Select all the placeholder code and replace it with the');
  console.log('     contents of scripts/ste-drive-uploader.generated.gs');
  console.log('  3. Click Deploy > New deployment.');
  console.log('     Click the gear icon and choose "Web app".');
  console.log('       Execute as     : Me');
  console.log('       Who has access : Anyone');
  console.log('  4. Click Deploy, then Authorize access and approve Drive access.');
  console.log('     Google warns that the app is unverified - choose');
  console.log('     "Advanced" then "Go to <project name> (unsafe)". It is your');
  console.log('     own script, so this warning is expected.');
  console.log('  5. Copy the Web app URL (it ends in /exec) and run:\n');
  console.log('       npm run drive:setup "PASTE_THE_URL_HERE"\n');
  console.log('That second command verifies the connection and uploads every');
  console.log('asset that is currently waiting.');
}

/** Step 2: wire the URL in, verify with a real upload, then backfill. */
async function activate(url: string) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url)) {
    console.error('That does not look like an Apps Script web app URL.');
    console.error('Expected: https://script.google.com/macros/s/AKfy.../exec');
    console.error('Got     : ' + url);
    process.exitCode = 1;
    return;
  }

  const sheetsUrl = readEnvFileValue('GOOGLE_SHEETS_WEBHOOK_URL');
  if (sheetsUrl && sheetsUrl === url) {
    console.error('That is the Google Sheets webhook URL, not the Drive uploader.');
    console.error('Deploy scripts/ste-drive-uploader.generated.gs as a separate project.');
    process.exitCode = 1;
    return;
  }

  const token = readEnvFileValue('GOOGLE_DRIVE_WEBAPP_TOKEN');
  if (!token) {
    console.error('No GOOGLE_DRIVE_WEBAPP_TOKEN in .env.local.');
    console.error('Run "npm run drive:setup" first to generate one.');
    process.exitCode = 1;
    return;
  }

  upsertEnvValue('GOOGLE_DRIVE_WEBAPP_URL', url);
  process.env.GOOGLE_DRIVE_WEBAPP_URL = url;
  process.env.GOOGLE_DRIVE_WEBAPP_TOKEN = token;

  console.log('Saved GOOGLE_DRIVE_WEBAPP_URL to .env.local.\n');

  const { syncExhibitorFileToDrive } = await import('../src/lib/googleDrive');
  const { retryPendingDriveSyncs } = await import('../src/lib/exhibitorAssets');

  console.log('=== Verifying with a real upload ===');
  const probe = await syncExhibitorFileToDrive({
    mobile: '0000000000',
    brandName: '__STE Connection Test',
    fileName: 'connection-test.png',
    fileBuffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    ),
    mimeType: 'image/png',
    category: 'logo'
  });

  if (!probe.success) {
    console.error('\nFAILED: ' + probe.error + '\n');
    console.error('Common causes:');
    console.error('  - Deployment access is not set to "Anyone"');
    console.error('  - "Execute as" is not set to "Me"');
    console.error('  - The token in the deployed script does not match .env.local');
    console.error('  - Drive authorization was not approved during deployment');
    console.error('\nFix the deployment, then re-run this command with the same URL.');
    process.exitCode = 1;
    return;
  }

  console.log('SUCCESS - file created in Google Drive.');
  console.log('  folder : ' + probe.folderName);
  console.log('  file   : ' + probe.fileName);
  console.log('  link   : ' + probe.webViewLink);
  console.log('\nYou can delete the "__STE Connection Test" folder in Drive.\n');

  console.log('=== Backfilling assets uploaded before now ===');
  const result = await retryPendingDriveSyncs();
  console.log('pending found : ' + result.attempted);
  console.log('synced        : ' + result.synced);
  for (const f of result.failures) {
    console.log('  FAILED ' + f.mobile + ' / ' + f.asset + ' - ' + f.error);
  }

  console.log('\nDone. Exhibitor uploads now go straight into Drive.');
  console.log('\nLast step - add these two to Vercel so production works too:');
  console.log('  npx vercel env add GOOGLE_DRIVE_WEBAPP_URL production');
  console.log('  npx vercel env add GOOGLE_DRIVE_WEBAPP_TOKEN production');
  console.log('  npx vercel env add GOOGLE_DRIVE_PARENT_FOLDER_ID production');
}

async function main() {
  loadEnv();
  const url = process.argv[2];
  if (url) {
    await activate(url.trim());
  } else {
    prepare();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
