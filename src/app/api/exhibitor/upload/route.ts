import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import db, { updateExhibitorFiles } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncToGoogleSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import {
  storeExhibitorAsset,
  resolveCategory,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE
} from '@/lib/exhibitorAssets';
import { fileExtension } from '@/lib/googleDrive';

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
    const brandName = existingExhibitor?.brand_name?.trim() || reg?.brandName || 'Exhibitor';

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

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('exhibitors')
          .update({
            logo_file_url: logoUrl,
            cdr_file_url: cdrUrl,
            profile_pic_url: profilePicUrl,
            drive_file_url: driveFileUrl,
            drive_folder_id: driveFolderId,
            drive_folder_url: driveFolderUrl,
            updated_at: new Date().toISOString()
          })
          .eq('mobile', session.mobile);
      } catch (dbErr) {
        console.error('[SupabaseDB] update error:', dbErr);
      }
    }

    try {
      let fasciaNames = [brandName, '', '', ''];
      if (existingExhibitor?.fascia_names_json) {
        try {
          fasciaNames = JSON.parse(existingExhibitor.fascia_names_json);
        } catch {}
      }

      await syncToGoogleSheets({
        mobile: session.mobile,
        exhibitor_name: existingExhibitor?.exhibitor_name || '',
        profile_pic_url: profilePicUrl || '',
        company_description: existingExhibitor?.company_description || '',
        brand_name: brandName,
        stall_sqft: existingExhibitor?.stall_sqft || reg?.stallSqft || '200 sq ft',
        fascia_names: fasciaNames,
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
