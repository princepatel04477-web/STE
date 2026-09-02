import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import db, { updateExhibitorFiles } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncExhibitorRowToSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import {
  storeExhibitorAsset,
  listExhibitorAssets,
  deleteExhibitorAsset,
  resolveCategory,
  AssetLimitReachedError,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_ASSETS_PER_EXHIBITOR,
  MAX_FILES_PER_UPLOAD
} from '@/lib/exhibitorAssets';
import { fileExtension } from '@/lib/googleDrive';

// An upload carries a file body through storage, Drive and the sheet, and a
// large logo over a phone connection needs more than the platform default.
export const maxDuration = 60;

/** Rejects a file the portal cannot accept, or returns null when it is fine. */
function validateFile(file: File): string | null {
  if (file.size === 0) return 'The file "' + file.name + '" is empty.';

  if (file.size > MAX_FILE_SIZE) {
    return 'The file "' + file.name + '" exceeds the 50MB maximum size limit.';
  }

  const ext = fileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return 'File format "' + (ext || 'unknown') + '" of "' + file.name +
      '" is not allowed. Only .PNG, .JPG, .JPEG, .WEBP, .HEIC, and .CDR files are accepted.';
  }

  return null;
}

/**
 * Stores one or more brand files.
 *
 * The portal sends a batch, so every file is validated up front and the whole
 * request is refused if any one of them is unusable - an exhibitor who picked
 * six files should not discover afterwards that the fourth was silently
 * dropped. The profile, database and sheet are then synced once for the batch
 * rather than once per file.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to your exhibitor portal.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('file').filter((f): f is File => f instanceof File);
    const requestedCategory = (formData.get('category') as string) || undefined;

    if (files.length === 0) {
      return NextResponse.json({ error: 'No file was provided for upload.' }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        {
          error:
            'You selected ' + files.length + ' files. Please upload at most ' +
            MAX_FILES_PER_UPLOAD + ' at a time.'
        },
        { status: 400 }
      );
    }

    for (const file of files) {
      const problem = validateFile(file);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }

    // Resolve the brand name that names the exhibitor's folder.
    const existingExhibitor = db
      .prepare(
        'SELECT brand_name, exhibitor_name, company_description, stall_sqft, fascia_names_json, logo_file_url, cdr_file_url, profile_pic_url, drive_file_url, drive_folder_id, drive_folder_url FROM exhibitors WHERE mobile = ?'
      )
      .get(session.mobile) as any;

    const reg = findExhibitorByMobile(session.mobile);
    let brandName = existingExhibitor?.brand_name?.trim() || reg?.brandName || 'Exhibitor';

    // A profile photograph replaces the portrait on the profile; brand files
    // take a numbered slot, and only those count against the allowance.
    const isProfilePicUpload = resolveCategory(files[0].name, requestedCategory) === 'profile_pic';

    if (!isProfilePicUpload) {
      const alreadyHeld = (await listExhibitorAssets(session.mobile)).map(
        (a) => a.category + '::' + a.originalFileName.trim().toLowerCase()
      );
      const incomingNew = new Set<string>();
      for (const file of files) {
        const key =
          resolveCategory(file.name, requestedCategory) + '::' + file.name.trim().toLowerCase();
        if (!alreadyHeld.includes(key)) incomingNew.add(key);
      }
      const projected = alreadyHeld.length + incomingNew.size;
      if (projected > MAX_ASSETS_PER_EXHIBITOR) {
        return NextResponse.json(
          {
            error:
              'You can keep up to ' + MAX_ASSETS_PER_EXHIBITOR + ' files. You already have ' +
              alreadyHeld.length + ', so these ' + incomingNew.size +
              ' new files would take you to ' + projected +
              '. Please remove some files you no longer need, or upload fewer.'
          },
          { status: 409 }
        );
      }
    }

    // Sequential rather than parallel: slots are allocated from the ledger, so
    // two files racing for the same one would collide on the unique index.
    const stored: Array<{ file: File; result: Awaited<ReturnType<typeof storeExhibitorAsset>> }> = [];

    for (const file of files) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const category = resolveCategory(file.name, requestedCategory);

      let result;
      try {
        result = await storeExhibitorAsset({
          mobile: session.mobile,
          brandName,
          originalFileName: file.name,
          fileBuffer,
          browserMimeType: file.type,
          category
        });
      } catch (err) {
        if (err instanceof AssetLimitReachedError) {
          return NextResponse.json({ error: err.message, uploaded: stored.length }, { status: 409 });
        }
        throw err;
      }

      if (!result.storageUrl) {
        return NextResponse.json(
          {
            error:
              'Could not save "' + file.name + '" to secure storage. Please try again. (' +
              (result.storageError || 'unknown error') +
              ')',
            uploaded: stored.length
          },
          { status: 502 }
        );
      }

      stored.push({ file, result });
    }

    // The exhibitor row keeps a link to the most recent file of each kind; the
    // full set lives in the asset ledger and is read back by GET.
    const newestOfCategory = (category: string) => {
      for (let i = stored.length - 1; i >= 0; i--) {
        if (stored[i].result.category === category) return stored[i].result;
      }
      return null;
    };

    const newestProfilePic = newestOfCategory('profile_pic');
    const newestCdr = newestOfCategory('cdr');
    const newestLogo = newestOfCategory('logo');

    const cdrUrl = newestCdr?.storageUrl || existingExhibitor?.cdr_file_url || null;
    const logoUrl = newestLogo?.storageUrl || existingExhibitor?.logo_file_url || null;
    const profilePicUrl = newestProfilePic?.storageUrl || existingExhibitor?.profile_pic_url || null;

    const newest = stored[stored.length - 1].result;
    const driveFileUrl = newest.drive.webViewLink || existingExhibitor?.drive_file_url || null;
    const driveFolderId = newest.drive.folderId || existingExhibitor?.drive_folder_id || null;
    const driveFolderUrl = newest.drive.folderViewLink || existingExhibitor?.drive_folder_url || null;

    updateExhibitorFiles(session.mobile, {
      logo_file_url: logoUrl || undefined,
      cdr_file_url: cdrUrl || undefined,
      profile_pic_url: profilePicUrl || undefined,
      drive_file_url: driveFileUrl || undefined,
      drive_folder_id: driveFolderId || undefined,
      drive_folder_url: driveFolderUrl || undefined
    });

    let currentExhibitorName = existingExhibitor?.exhibitor_name || '';
    let currentCompanyDesc = existingExhibitor?.company_description || '';
    let currentFasciaNames = [brandName, '', '', ''];
    let currentSqft = existingExhibitor?.stall_sqft || reg?.stallSqft || '200 sq ft';

    if (existingExhibitor?.fascia_names_json) {
      try {
        const parsed = typeof existingExhibitor.fascia_names_json === 'string'
          ? JSON.parse(existingExhibitor.fascia_names_json)
          : existingExhibitor.fascia_names_json;
        if (Array.isArray(parsed)) {
          currentFasciaNames = [parsed[0] || '', parsed[1] || '', parsed[2] || '', parsed[3] || ''];
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.fascia_names)) {
            currentFasciaNames = [parsed.fascia_names[0] || '', parsed.fascia_names[1] || '', parsed.fascia_names[2] || '', parsed.fascia_names[3] || ''];
          }
          if (parsed.exhibitor_name && !currentExhibitorName) currentExhibitorName = parsed.exhibitor_name;
          if (parsed.company_description && !currentCompanyDesc) currentCompanyDesc = parsed.company_description;
        }
      } catch {}
    }

    // Direct cloud sync to Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        // Fetch latest remote record to prevent overwriting concurrent edits
        const { data: sbCurrent } = await supabaseAdmin
          .from('exhibitors')
          .select('*')
          .eq('mobile', session.mobile)
          .maybeSingle();

        if (sbCurrent) {
          if (sbCurrent.fascia_names_json) {
            const parsed = typeof sbCurrent.fascia_names_json === 'string'
              ? JSON.parse(sbCurrent.fascia_names_json)
              : sbCurrent.fascia_names_json;
            if (Array.isArray(parsed)) {
              currentFasciaNames = [parsed[0] || '', parsed[1] || '', parsed[2] || '', parsed[3] || ''];
            } else if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.fascia_names)) {
                currentFasciaNames = [parsed.fascia_names[0] || '', parsed.fascia_names[1] || '', parsed.fascia_names[2] || '', parsed.fascia_names[3] || ''];
              }
              if (parsed.exhibitor_name) currentExhibitorName = parsed.exhibitor_name;
              if (parsed.company_description) currentCompanyDesc = parsed.company_description;
            }
          }
          if (sbCurrent.brand_name) brandName = sbCurrent.brand_name;
          if (sbCurrent.stall_sqft) currentSqft = sbCurrent.stall_sqft;
        }

        const structuredProfilePayload = {
          fascia_names: currentFasciaNames,
          exhibitor_name: currentExhibitorName,
          company_description: currentCompanyDesc,
          profile_pic_url: profilePicUrl || null
        };

        const { error: sbUpdateErr } = await supabaseAdmin
          .from('exhibitors')
          .upsert({
            mobile: session.mobile,
            brand_name: brandName,
            stall_sqft: currentSqft,
            fascia_names_json: structuredProfilePayload,
            logo_file_url: logoUrl || sbCurrent?.logo_file_url || null,
            cdr_file_url: cdrUrl || sbCurrent?.cdr_file_url || null,
            drive_file_url: driveFileUrl || sbCurrent?.drive_file_url || null,
            drive_folder_id: driveFolderId || sbCurrent?.drive_folder_id || null,
            drive_folder_url: driveFolderUrl || sbCurrent?.drive_folder_url || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'mobile' });

        if (sbUpdateErr) {
          console.error('[SupabaseDB] Upload update error:', sbUpdateErr);
          return NextResponse.json(
            { error: 'Upload succeeded in storage, but database link failed: ' + sbUpdateErr.message },
            { status: 500 }
          );
        }
      } catch (dbErr: any) {
        console.error('[SupabaseDB] Fatal database update error on upload:', dbErr);
        return NextResponse.json(
          { error: 'Database persistence error: ' + (dbErr?.message || 'Unknown error') },
          { status: 500 }
        );
      }
    }

    // Push the exhibitor's COMPLETE row to the sheet. Sending only the artwork
    // fields blanked every extra item they had already submitted.
    try {
      await syncExhibitorRowToSheets(session.mobile, {
        exhibitor_name: currentExhibitorName,
        profile_pic_url: profilePicUrl || '',
        company_description: currentCompanyDesc,
        brand_name: brandName,
        stall_sqft: currentSqft,
        fascia_names: currentFasciaNames,
        logo_file_url: logoUrl || '',
        cdr_file_url: cdrUrl || '',
        drive_file_url: driveFileUrl || '',
        drive_folder_url: driveFolderUrl || ''
      });
    } catch (sheetErr) {
      console.warn('[GoogleSheets] Upload sync note:', sheetErr);
    }

    const uploadedFiles = stored.map(({ file, result }) => ({
      fileName: result.assetFileName,
      originalFileName: file.name,
      fileSize: file.size,
      fileType: fileExtension(file.name).replace('.', '').toUpperCase(),
      category: result.category,
      slot: result.slot,
      replacedExisting: result.replacedExisting,
      folderName: result.folderName,
      fileUrl: result.storageUrl,
      driveFileUrl: result.drive.webViewLink || null,
      isDriveSynced: result.drive.success
    }));

    const assets = isProfilePicUpload ? [] : await listExhibitorAssets(session.mobile);

    const message =
      uploadedFiles.length === 1
        ? 'File "' + uploadedFiles[0].originalFileName + '" uploaded successfully and saved to the ' +
          uploadedFiles[0].folderName + ' folder.'
        : uploadedFiles.length + ' files uploaded successfully and saved to the ' +
          uploadedFiles[0].folderName + ' folder.';

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      assets,
      maxFiles: MAX_ASSETS_PER_EXHIBITOR,
      remainingSlots: isProfilePicUpload
        ? MAX_ASSETS_PER_EXHIBITOR
        : Math.max(0, MAX_ASSETS_PER_EXHIBITOR - assets.length),

      // Single-file fields, kept so the profile picture uploader and anything
      // else reading the old shape keeps working unchanged.
      fileName: uploadedFiles[0].fileName,
      originalFileName: uploadedFiles[0].originalFileName,
      fileSize: uploadedFiles[0].fileSize,
      fileType: uploadedFiles[0].fileType,
      category: uploadedFiles[0].category,
      folderName: uploadedFiles[0].folderName,
      fileUrl: uploadedFiles[0].fileUrl,
      logoUrl,
      cdrUrl,
      profilePicUrl,
      driveFileUrl,
      driveFolderUrl,
      isDriveSynced: stored.every((s) => s.result.drive.success),
      message
    });
  } catch (error: any) {
    console.error('Error handling exhibitor file upload:', error);
    return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 });
  }
}

/** The exhibitor's current brand files, so the dashboard can list them. */
export async function GET() {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assets = await listExhibitorAssets(session.mobile);

    return NextResponse.json({
      assets,
      maxFiles: MAX_ASSETS_PER_EXHIBITOR,
      remainingSlots: Math.max(0, MAX_ASSETS_PER_EXHIBITOR - assets.length)
    });
  } catch (error) {
    console.error('Error listing exhibitor files:', error);
    return NextResponse.json({ error: 'Failed to load your uploaded files.' }, { status: 500 });
  }
}

/**
 * Removes one uploaded file, freeing its slot. Without this the cap of
 * MAX_ASSETS_PER_EXHIBITOR would be a dead end rather than a limit.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = Number(searchParams.get('id'));

    if (!Number.isInteger(assetId) || assetId <= 0) {
      return NextResponse.json({ error: 'Which file should be removed?' }, { status: 400 });
    }

    const outcome = await deleteExhibitorAsset(session.mobile, assetId);
    if (!outcome.deleted) {
      return NextResponse.json(
        { error: outcome.error || 'Could not remove that file.' },
        { status: 400 }
      );
    }

    const assets = await listExhibitorAssets(session.mobile);

    // Keep the exhibitor row's links pointing at files that still exist.
    const newestOf = (category: string) =>
      [...assets].reverse().find((a) => a.category === category)?.storageUrl || null;

    const logoUrl = newestOf('logo');
    const cdrUrl = newestOf('cdr');

    updateExhibitorFiles(session.mobile, {
      logo_file_url: logoUrl || '',
      cdr_file_url: cdrUrl || ''
    });

    if (isSupabaseConfigured && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('exhibitors')
        .update({
          logo_file_url: logoUrl,
          cdr_file_url: cdrUrl,
          updated_at: new Date().toISOString()
        })
        .eq('mobile', session.mobile);
      if (error) console.warn('[SupabaseDB] Could not clear deleted file link:', error.message);
    }

    return NextResponse.json({
      success: true,
      assets,
      maxFiles: MAX_ASSETS_PER_EXHIBITOR,
      remainingSlots: Math.max(0, MAX_ASSETS_PER_EXHIBITOR - assets.length),
      driveWarning: outcome.driveWarning || null,
      message: 'File removed.'
    });
  } catch (error) {
    console.error('Error deleting exhibitor file:', error);
    return NextResponse.json({ error: 'Failed to remove the file. Please try again.' }, { status: 500 });
  }
}
