/**
 * Re-links profile photographs that the upload route unlinked.
 *
 * Until migration 20260904000027 the exhibitor's portrait was recorded only
 * inside fascia_names_json, and POST /api/exhibitor/upload rebuilt that whole
 * payload from the local /tmp store - empty on any cold serverless instance.
 * So every logo or artwork upload wrote profile_pic_url back as null, and the
 * exhibitor's photo disappeared from the portal and the admin console.
 *
 * The files themselves were never touched: they are still in the
 * exhibitor-assets bucket as "<Folder>/<Brand> - ProfilePhoto.<ext>". This
 * walks the bucket, matches each portrait to its exhibitor by folder name, and
 * puts the link back on rows that have lost it.
 *
 * Reports and changes nothing by default:
 *   npx tsx scripts/recover-profile-photos.ts
 *   npx tsx scripts/recover-profile-photos.ts --apply
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = 'exhibitor-assets';
const apply = process.argv.includes('--apply');

if (!url || !serviceKey) {
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set. ' +
    'Run with: npx dotenv-cli -e .env.local -- npx tsx scripts/recover-profile-photos.ts'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

interface ExhibitorRow {
  mobile: string;
  brand_name: string | null;
  drive_folder_name: string | null;
  profile_pic_url: string | null;
  fascia_names_json: unknown;
}

/** The portrait link currently on record, from either the column or the payload. */
function storedPhoto(row: ExhibitorRow): string {
  if (row.profile_pic_url) return row.profile_pic_url;
  const payload = row.fascia_names_json;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const value = (payload as Record<string, unknown>).profile_pic_url;
    if (typeof value === 'string' && value) return value;
  }
  return '';
}

async function listFolders(): Promise<string[]> {
  const folders: string[] = [];
  const pageSize = 100;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list('', { limit: pageSize, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`Listing the bucket failed: ${error.message}`);
    if (!data || data.length === 0) break;
    // A folder comes back as an entry with no id.
    folders.push(...data.filter((entry) => entry.id === null).map((entry) => entry.name));
    if (data.length < pageSize) break;
  }
  return folders;
}

async function findPortrait(folder: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, { limit: 100 });
  if (error) {
    console.warn(`  ! could not list "${folder}": ${error.message}`);
    return null;
  }
  const portrait = (data || []).find((f) => / - ProfilePhoto(\s\d+)?\./i.test(f.name));
  if (!portrait) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${portrait.name}`).data.publicUrl;
}

async function main() {
  const { data: rows, error } = await supabase
    .from('exhibitors')
    .select('mobile, brand_name, drive_folder_name, profile_pic_url, fascia_names_json');
  if (error) throw new Error(`Reading exhibitors failed: ${error.message}`);

  const exhibitors = (rows || []) as ExhibitorRow[];
  console.log(`${exhibitors.length} exhibitor rows.`);

  const folders = await listFolders();
  console.log(`${folders.length} folders in the bucket.\n`);

  // An exhibitor's folder is drive_folder_name where one was claimed, and
  // otherwise their brand name as sanitizeFolderName would have written it.
  const byFolder = new Map<string, ExhibitorRow>();
  for (const row of exhibitors) {
    for (const name of [row.drive_folder_name, row.brand_name]) {
      const key = (name || '').trim().toLowerCase();
      if (key && !byFolder.has(key)) byFolder.set(key, row);
    }
  }

  const recoverable: Array<{ row: ExhibitorRow; url: string }> = [];
  const claimed = new Set<string>();
  let alreadyLinked = 0;
  let unmatched = 0;

  for (const folder of folders) {
    const row = byFolder.get(folder.trim().toLowerCase());
    if (!row) {
      unmatched++;
      continue;
    }
    const portrait = await findPortrait(folder);
    if (!portrait) continue;
    if (storedPhoto(row)) {
      alreadyLinked++;
      continue;
    }
    // An exhibitor who was once foldered under a different name matches twice.
    // The first match wins, so a second folder cannot quietly replace the
    // portrait the first one just recovered.
    if (claimed.has(row.mobile)) continue;
    claimed.add(row.mobile);
    recoverable.push({ row, url: portrait });
  }

  console.log(`portraits already linked : ${alreadyLinked}`);
  console.log(`folders matching no row  : ${unmatched}`);
  console.log(`portraits to re-link     : ${recoverable.length}\n`);

  for (const { row, url } of recoverable) {
    console.log(`  ${row.mobile}  ${(row.brand_name || '').slice(0, 32).padEnd(32)}  ${url.split('/').pop()}`);
  }

  if (!apply) {
    console.log('\nNothing was changed. Re-run with --apply to write these links back.');
    return;
  }

  console.log('\nWriting...');
  let done = 0;
  for (const { row, url } of recoverable) {
    const payload = row.fascia_names_json;
    const base =
      payload && typeof payload === 'object' && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {};

    const { error: writeErr } = await supabase
      .from('exhibitors')
      .update({
        profile_pic_url: url,
        fascia_names_json: { ...base, profile_pic_url: url }
      })
      .eq('mobile', row.mobile);

    if (writeErr) console.error(`  ! ${row.mobile}: ${writeErr.message}`);
    else done++;
  }
  console.log(`Re-linked ${done} of ${recoverable.length}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
