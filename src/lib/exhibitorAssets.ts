import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import {
  syncExhibitorFileToDrive,
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
 *   Apple Lifestyle/Apple Lifestyle - Artwork.cdr
 */

export const STORAGE_BUCKET = 'exhibitor-assets';

export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.cdr'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB, matches the bucket limit

export interface StoreAssetParams {
  mobile: string;
  brandName: string;
  originalFileName: string;
  fileBuffer: Buffer;
  browserMimeType?: string;
  category?: AssetCategory;
}

export interface StoreAssetResult {
  category: AssetCategory;
  folderName: string;
  assetFileName: string;
  storagePath: string | null;
  storageUrl: string | null;
  storageError: string | null;
  drive: DriveUploadResult;
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

/** Upserts the ledger row for this exhibitor + category. */
async function recordAsset(row: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured || !supabaseAdmin) return;
  // exhibitor_assets table has check constraint for ('logo', 'cdr')
  if (row.category !== 'logo' && row.category !== 'cdr') {
    return;
  }
  try {
    const { error } = await supabaseAdmin
      .from('exhibitor_assets')
      .upsert(row, { onConflict: 'mobile,category' });
    if (error) console.error('[ExhibitorAssets] Ledger upsert failed:', error.message);
  } catch (err) {
    console.error('[ExhibitorAssets] Ledger upsert threw:', err);
  }
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
  const assetFileName = buildAssetFileName(folderName, originalFileName, category);
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
    category
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
    storagePath: storageError ? null : storagePath,
    storageUrl,
    storageError,
    drive
  };
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
      category: asset.category as AssetCategory
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
