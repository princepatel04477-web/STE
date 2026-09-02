import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import {
  syncExhibitorFileToDrive,
  deleteExhibitorFileFromDrive,
  sanitizeFolderName,
  buildAssetFileName,
  fileExtension,
  type AssetCategory,
  type DriveUploadResult
} from '@/lib/googleDrive';

/**
 * Stores an exhibitor brand asset in Supabase Storage (source of truth) and
 * mirrors it into Google Drive under STE Logos/<Brand Name>/.
 *
 * Both stores use the identical folder and file name, so the Drive folder and
 * the storage bucket read the same way:
 *
 *   Apple Lifestyle/Apple Lifestyle - Logo.png
 *   Apple Lifestyle/Apple Lifestyle - Logo 2.png
 *   Apple Lifestyle/Apple Lifestyle - Artwork.cdr
 *
 * An exhibitor keeps several files - a logo per sub-brand, artwork per fascia -
 * up to MAX_ASSETS_PER_EXHIBITOR. Each occupies a numbered slot, and the slot
 * is what makes the name deterministic, so re-uploading a file replaces the one
 * already in that slot rather than stacking a near-duplicate beside it.
 */

export const STORAGE_BUCKET = 'exhibitor-assets';

export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.cdr', '.heic', '.heif'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB, matches the bucket limit

/** Brand files one exhibitor may keep at once (logo and artwork together). */
export const MAX_ASSETS_PER_EXHIBITOR = 10;

/** Files the portal accepts in a single upload request. */
export const MAX_FILES_PER_UPLOAD = MAX_ASSETS_PER_EXHIBITOR;

/** Thrown when an upload would take an exhibitor past MAX_ASSETS_PER_EXHIBITOR. */
export class AssetLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssetLimitReachedError';
  }
}

export interface StoreAssetParams {
  mobile: string;
  brandName: string;
  originalFileName: string;
  fileBuffer: Buffer;
  browserMimeType?: string;
  category?: AssetCategory;
  /** Slot to write into. Allocated from the ledger when omitted. */
  slot?: number;
}

export interface StoreAssetResult {
  category: AssetCategory;
  folderName: string;
  assetFileName: string;
  slot: number;
  /** True when this overwrote a file the exhibitor had already uploaded. */
  replacedExisting: boolean;
  storagePath: string | null;
  storageUrl: string | null;
  storageError: string | null;
  drive: DriveUploadResult;
}

/** The ledger columns listExhibitorAssets reads back. */
interface AssetLedgerRow {
  id: number;
  category: string;
  slot: number | null;
  original_file_name: string | null;
  asset_file_name: string | null;
  file_size: number | null;
  storage_url: string | null;
  drive_file_url: string | null;
  drive_folder_url: string | null;
  drive_sync_status: string | null;
  created_at: string | null;
}

/** One row of the exhibitor's file list, as the portal shows it. */
export interface ExhibitorAssetSummary {
  id: number;
  category: AssetCategory;
  slot: number;
  originalFileName: string;
  assetFileName: string;
  fileSize: number | null;
  storageUrl: string | null;
  driveFileUrl: string | null;
  driveFolderUrl: string | null;
  driveSynced: boolean;
  uploadedAt: string | null;
}

/**
 * Browsers report .cdr inconsistently (empty string, application/cdr,
 * application/x-coreldraw...). Deriving the type from the extension keeps
 * uploads inside the bucket's allowed_mime_types list.
 */
export function canonicalMimeType(fileName: string, browserMimeType?: string): string {
  switch (fileExtension(fileName)) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.heic':
      return 'image/heic';
    case '.heif':
      return 'image/heif';
    case '.cdr':
      return 'application/octet-stream';
    default:
      return browserMimeType || 'application/octet-stream';
  }
}

export function resolveCategory(fileName: string, requested?: string): AssetCategory {
  if (requested === 'logo' || requested === 'cdr' || requested === 'profile_pic') return requested;
  if (requested === 'avatar') return 'profile_pic';
  return fileExtension(fileName) === '.cdr' ? 'cdr' : 'logo';
}

/**
 * Returns the Drive subfolder this exhibitor owns, claiming one on first use.
 *
 * Several exhibitors share a brand name, so the first to upload keeps the clean
 * name and later ones are suffixed with their mobile number. The claim is
 * persisted, keeping the folder stable even if brand_name is edited later.
 */
export async function claimDriveFolderName(mobile: string, brandName: string): Promise<string> {
  const base = sanitizeFolderName(brandName);

  if (!isSupabaseConfigured || !supabaseAdmin) return base;

  try {
    const { data: existing } = await supabaseAdmin
      .from('exhibitors')
      .select('drive_folder_name')
      .eq('mobile', mobile)
      .maybeSingle();

    if (existing?.drive_folder_name) return existing.drive_folder_name;

    const { data: claimedByOther } = await supabaseAdmin
      .from('exhibitors')
      .select('mobile')
      .eq('drive_folder_name', base)
      .neq('mobile', mobile)
      .limit(1);

    const folderName = claimedByOther && claimedByOther.length > 0 ? base + ' (' + mobile + ')' : base;

    const { error } = await supabaseAdmin
      .from('exhibitors')
      .update({ drive_folder_name: folderName })
      .eq('mobile', mobile);

    // A unique-index violation means another request claimed the plain name
    // first; fall back to the mobile-suffixed variant.
    if (error) {
      const fallback = base + ' (' + mobile + ')';
      await supabaseAdmin
        .from('exhibitors')
        .update({ drive_folder_name: fallback })
        .eq('mobile', mobile);
      return fallback;
    }

    return folderName;
  } catch (err) {
    console.warn('[ExhibitorAssets] Could not claim Drive folder name:', err);
    return base;
  }
}

/** Upserts the ledger row for this exhibitor + category + slot. */
async function recordAsset(row: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured || !supabaseAdmin) return;
  // exhibitor_assets table has check constraint for ('logo', 'cdr')
  if (row.category !== 'logo' && row.category !== 'cdr') {
    return;
  }
  try {
    const { error } = await supabaseAdmin
      .from('exhibitor_assets')
      .upsert(row, { onConflict: 'mobile,category,slot' });
    if (error) console.error('[ExhibitorAssets] Ledger upsert failed:', error.message);
  } catch (err) {
    console.error('[ExhibitorAssets] Ledger upsert threw:', err);
  }
}

/**
 * Every brand file this exhibitor currently keeps, oldest slot first.
 *
 * Profile photographs are not part of this list: they live on the profile
 * rather than in the ledger, and must not eat into the artwork allowance.
 */
export async function listExhibitorAssets(mobile: string): Promise<ExhibitorAssetSummary[]> {
  if (!isSupabaseConfigured || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('exhibitor_assets')
    .select('*')
    .eq('mobile', mobile)
    .order('category', { ascending: true })
    .order('slot', { ascending: true });

  if (error) {
    console.error('[ExhibitorAssets] Could not list assets:', error.message);
    return [];
  }

  return (data || []).map((row: AssetLedgerRow) => ({
    id: row.id,
    category: row.category as AssetCategory,
    slot: row.slot || 1,
    originalFileName: row.original_file_name || row.asset_file_name || '',
    assetFileName: row.asset_file_name || '',
    fileSize: row.file_size ?? null,
    storageUrl: row.storage_url || null,
    driveFileUrl: row.drive_file_url || null,
    driveFolderUrl: row.drive_folder_url || null,
    driveSynced: row.drive_sync_status === 'synced',
    uploadedAt: row.created_at || null
  }));
}

/**
 * Decides which slot an incoming file takes.
 *
 * Uploading a name the exhibitor already has re-uses that file's slot, so
 * sending a corrected version of 'front-fascia.cdr' updates it rather than
 * spending another of the ten places. Otherwise the lowest free slot is taken,
 * which fills gaps left by deletions instead of letting slot numbers climb.
 */
export async function allocateAssetSlot(
  mobile: string,
  category: AssetCategory,
  originalFileName: string
): Promise<{ slot: number; replacedExisting: boolean }> {
  // A profile photograph is a single portrait, never a numbered set.
  if (category === 'profile_pic') return { slot: 1, replacedExisting: false };

  const existing = await listExhibitorAssets(mobile);

  const sameName = existing.find(
    (a) =>
      a.category === category &&
      a.originalFileName.trim().toLowerCase() === originalFileName.trim().toLowerCase()
  );
  if (sameName) return { slot: sameName.slot, replacedExisting: true };

  if (existing.length >= MAX_ASSETS_PER_EXHIBITOR) {
    throw new AssetLimitReachedError(
      'You already have ' + existing.length + ' files uploaded, which is the maximum of ' +
        MAX_ASSETS_PER_EXHIBITOR +
        '. Please remove a file you no longer need before uploading another.'
    );
  }

  const taken = new Set(existing.filter((a) => a.category === category).map((a) => a.slot));
  let slot = 1;
  while (taken.has(slot)) slot++;

  return { slot, replacedExisting: false };
}

/**
 * Uploads to Supabase Storage, records the asset, then mirrors it to Drive.
 * Never throws: a Drive failure is recorded as 'pending' for the retry sweep
 * rather than failing the exhibitor's upload.
 */
export async function storeExhibitorAsset(params: StoreAssetParams): Promise<StoreAssetResult> {
  const { mobile, brandName, originalFileName, fileBuffer, browserMimeType } = params;

  const category = resolveCategory(originalFileName, params.category);
  const folderName = await claimDriveFolderName(mobile, brandName);

  const allocation =
    params.slot !== undefined
      ? { slot: params.slot, replacedExisting: false }
      : await allocateAssetSlot(mobile, category, originalFileName);
  const { slot, replacedExisting } = allocation;

  const assetFileName = buildAssetFileName(folderName, originalFileName, category, slot);
  const mimeType = canonicalMimeType(originalFileName, browserMimeType);

  // Identical layout in both stores.
  const storagePath = folderName + '/' + assetFileName;

  let storageUrl: string | null = null;
  let storageError: string | null = null;

  if (isSupabaseConfigured && supabaseAdmin) {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

    if (error) {
      storageError = error.message;
      console.error('[ExhibitorAssets] Supabase Storage upload failed:', error.message);
    } else {
      storageUrl = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
    }
  } else {
    storageError = 'Supabase is not configured.';
  }

  // Record before syncing so a crash mid-Drive-upload still leaves a trail.
  const baseRow = {
    mobile,
    brand_name: folderName,
    category,
    slot,
    original_file_name: originalFileName,
    asset_file_name: assetFileName,
    mime_type: mimeType,
    file_size: fileBuffer.length,
    storage_path: storageError ? null : storagePath,
    storage_url: storageUrl
  };

  await recordAsset({ ...baseRow, drive_sync_status: 'pending', drive_sync_error: null });

  const drive = await syncExhibitorFileToDrive({
    mobile,
    brandName: folderName,
    fileName: assetFileName,
    fileBuffer,
    mimeType,
    category,
    slot
  });

  await recordAsset({
    ...baseRow,
    drive_folder_id: drive.folderId || null,
    drive_folder_url: drive.folderViewLink || null,
    drive_file_id: drive.fileId || null,
    drive_file_url: drive.webViewLink || null,
    drive_sync_status: drive.success ? 'synced' : 'pending',
    drive_sync_strategy: drive.strategy || null,
    drive_sync_error: drive.success ? null : drive.error || 'Unknown Drive error',
    drive_synced_at: drive.success ? new Date().toISOString() : null
  });

  return {
    category,
    folderName,
    assetFileName,
    slot,
    replacedExisting,
    storagePath: storageError ? null : storagePath,
    storageUrl,
    storageError,
    drive
  };
}

/**
 * Removes one of the exhibitor's files, freeing its slot.
 *
 * The ledger row goes last: while it survives, the file is still listed and a
 * failed storage delete can be retried. Drive is a mirror, so a copy left
 * behind there is reported but does not fail the deletion.
 */
export async function deleteExhibitorAsset(
  mobile: string,
  assetId: number
): Promise<{ deleted: boolean; error?: string; driveWarning?: string }> {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return { deleted: false, error: 'Supabase is not configured.' };
  }

  // Scoped by mobile so one exhibitor can never delete another's file.
  const { data: asset, error: readErr } = await supabaseAdmin
    .from('exhibitor_assets')
    .select('*')
    .eq('id', assetId)
    .eq('mobile', mobile)
    .maybeSingle();

  if (readErr) return { deleted: false, error: readErr.message };
  if (!asset) return { deleted: false, error: 'That file is not on your account.' };

  if (asset.storage_path) {
    const { error: removeErr } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([asset.storage_path]);
    if (removeErr) {
      return { deleted: false, error: 'Could not remove the stored file: ' + removeErr.message };
    }
  }

  let driveWarning: string | undefined;
  if (asset.drive_file_id) {
    const driveResult = await deleteExhibitorFileFromDrive(asset.drive_file_id);
    if (!driveResult.success) {
      driveWarning = 'Removed from the portal, but the Google Drive copy remains: ' + driveResult.error;
    }
  }

  const { error: deleteErr } = await supabaseAdmin
    .from('exhibitor_assets')
    .delete()
    .eq('id', assetId)
    .eq('mobile', mobile);

  if (deleteErr) return { deleted: false, error: deleteErr.message };

  return { deleted: true, driveWarning };
}

/**
 * Re-attempts Drive sync for every asset still pending. Used by
 * `npm run drive:retry` once Drive credentials are in place, so assets
 * uploaded before then are backfilled rather than lost.
 */
export async function retryPendingDriveSyncs(limit = 200): Promise<{
  attempted: number;
  synced: number;
  failures: Array<{ mobile: string; asset: string; error: string }>;
}> {
  const failures: Array<{ mobile: string; asset: string; error: string }> = [];

  if (!isSupabaseConfigured || !supabaseAdmin) {
    return { attempted: 0, synced: 0, failures };
  }

  const { data: pending, error } = await supabaseAdmin
    .from('exhibitor_assets')
    .select('*')
    .neq('drive_sync_status', 'synced')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error('Could not read pending assets: ' + error.message);

  let synced = 0;

  for (const asset of pending || []) {
    if (!asset.storage_path) {
      failures.push({
        mobile: asset.mobile,
        asset: asset.asset_file_name,
        error: 'No stored copy in Supabase Storage to re-upload.'
      });
      continue;
    }

    const download = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(asset.storage_path);
    if (download.error || !download.data) {
      failures.push({
        mobile: asset.mobile,
        asset: asset.asset_file_name,
        error: 'Download failed: ' + (download.error?.message || 'empty body')
      });
      continue;
    }

    const buffer = Buffer.from(await download.data.arrayBuffer());
    const drive = await syncExhibitorFileToDrive({
      mobile: asset.mobile,
      brandName: asset.brand_name,
      fileName: asset.asset_file_name,
      fileBuffer: buffer,
      mimeType: asset.mime_type || 'application/octet-stream',
      category: asset.category as AssetCategory,
      slot: asset.slot || 1
    });

    await supabaseAdmin
      .from('exhibitor_assets')
      .update({
        drive_folder_id: drive.folderId || null,
        drive_folder_url: drive.folderViewLink || null,
        drive_file_id: drive.fileId || null,
        drive_file_url: drive.webViewLink || null,
        drive_sync_status: drive.success ? 'synced' : 'failed',
        drive_sync_strategy: drive.strategy || null,
        drive_sync_error: drive.success ? null : drive.error || 'Unknown Drive error',
        drive_sync_attempts: (asset.drive_sync_attempts || 0) + 1,
        drive_synced_at: drive.success ? new Date().toISOString() : null
      })
      .eq('id', asset.id);

    if (drive.success) {
      synced++;
      await supabaseAdmin
        .from('exhibitors')
        .update({
          drive_file_url: drive.webViewLink,
          drive_folder_id: drive.folderId,
          drive_folder_url: drive.folderViewLink
        })
        .eq('mobile', asset.mobile);
    } else {
      failures.push({
        mobile: asset.mobile,
        asset: asset.asset_file_name,
        error: drive.error || 'Unknown Drive error'
      });
    }
  }

  return { attempted: (pending || []).length, synced, failures };
}
