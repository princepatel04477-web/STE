import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import db, { updateExhibitorFiles } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncExhibitorRowToSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import {
  storeExhibitorAsset,
  resolveCategory,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE
} from '@/lib/exhibitorAssets';
import { fileExtension } from '@/lib/googleDrive';

// An upload carries a file body through storage, Drive and the sheet, and a
// large logo over a phone connection needs more than the platform default.
export const maxDuration = 60;

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
    const file = formData.get('file') as File | null;
    const requestedCategory = (formData.get('category') as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided for upload.' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'The selected file is empty.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 50MB maximum size limit.' }, { status: 400 });
    }

    const ext = fileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error:
            'File format "' + (ext || 'unknown') +
            '" is not allowed. Only .PNG, .JPG, .JPEG, and .CDR files are accepted.'
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Resolve the brand name that names the exhibitor's folder.
    const existingExhibitor = db
      .prepare(
        'SELECT brand_name, exhibitor_name, company_description, stall_sqft, fascia_names_json, logo_file_url, cdr_file_url, profile_pic_url, drive_file_url, drive_folder_id, drive_folder_url FROM exhibitors WHERE mobile = ?'
      )
      .get(session.mobile) as any;

    const reg = findExhibitorByMobile(session.mobile);
    let brandName = existingExhibitor?.brand_name?.trim() || reg?.brandName || 'Exhibitor';

    const category = resolveCategory(file.name, requestedCategory);

    // Store in Supabase Storage and mirror into STE Logos/<Brand Name>/.
    const result = await storeExhibitorAsset({
      mobile: session.mobile,
      brandName,
      originalFileName: file.name,
      fileBuffer,
      browserMimeType: file.type,
      category
    });

    if (!result.storageUrl) {
      return NextResponse.json(
        {
          error:
            'Could not save your file to secure storage. Please try again. (' +
            (result.storageError || 'unknown error') +
            ')'
        },
        { status: 502 }
      );
    }

    const isProfilePic = result.category === 'profile_pic';
    const isCdr = result.category === 'cdr';
    const cdrUrl = isCdr ? result.storageUrl : existingExhibitor?.cdr_file_url || null;
    const logoUrl = (!isCdr && !isProfilePic) ? result.storageUrl : existingExhibitor?.logo_file_url || null;
    const profilePicUrl = isProfilePic ? result.storageUrl : existingExhibitor?.profile_pic_url || null;

    const driveFileUrl = result.drive.webViewLink || existingExhibitor?.drive_file_url || null;
    const driveFolderId = result.drive.folderId || existingExhibitor?.drive_folder_id || null;
    const driveFolderUrl = result.drive.folderViewLink || existingExhibitor?.drive_folder_url || null;

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
            { error: `Upload succeeded in storage, but database link failed: ${sbUpdateErr.message}` },
            { status: 500 }
          );
        }
      } catch (dbErr: any) {
        console.error('[SupabaseDB] Fatal database update error on upload:', dbErr);
        return NextResponse.json(
          { error: `Database persistence error: ${dbErr?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Push the exhibitor's COMPLETE row to the sheet. Sending only the artwork
    // fields blanked every extra item, badge count and badge name they had
    // already submitted.
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

    return NextResponse.json({
      success: true,
      fileName: result.assetFileName,
      originalFileName: file.name,
      fileSize: file.size,
      fileType: ext.replace('.', '').toUpperCase(),
      category: result.category,
      folderName: result.folderName,
      fileUrl: result.storageUrl,
      logoUrl,
      cdrUrl,
      profilePicUrl,
      driveFileUrl,
      driveFolderUrl,
      isDriveSynced: result.drive.success,
      message:
        'File "' + file.name + '" uploaded successfully and saved to the ' +
        result.folderName + ' folder.'
    });
  } catch (error: any) {
    console.error('Error handling exhibitor file upload:', error);
    return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 });
  }
}
