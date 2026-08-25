import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import db, { updateExhibitorFiles } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncExhibitorFileToDrive } from '@/lib/googleDrive';
import { syncToGoogleSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import path from 'path';
import fs from 'fs';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.cdr'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login to your exhibitor portal.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadCategory = (formData.get('category') as string) || 'cdr'; // 'cdr' | 'logo'

    if (!file) {
      return NextResponse.json({ error: 'No file was provided for upload.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 50MB maximum size limit.' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({
        error: `File format "${ext}" is not allowed. Only .PNG, .JPG, .JPEG, and .CDR files are accepted.`
      }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${session.mobile}/${Date.now()}_${cleanFileName}`;

    let primaryStorageUrl = '';

    // 1. Upload to Supabase Storage if configured
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { error: uploadError } = await supabaseAdmin.storage
          .from('exhibitor-assets')
          .upload(storagePath, fileBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true
          });

        if (uploadError) {
          console.error('[SupabaseStorage] Upload error:', uploadError.message);
        } else {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('exhibitor-assets')
            .getPublicUrl(storagePath);
          primaryStorageUrl = publicUrlData.publicUrl;
        }
      } catch (storageErr) {
        console.error('[SupabaseStorage] Exception:', storageErr);
      }
    }

    // Fallback local persistence if Supabase Storage is not set up
    if (!primaryStorageUrl) {
      const localUploadDir = path.join(process.cwd(), 'public', 'uploads', session.mobile);
      try {
        if (!fs.existsSync(localUploadDir)) {
          fs.mkdirSync(localUploadDir, { recursive: true });
        }
        const localFilePath = path.join(localUploadDir, `${Date.now()}_${cleanFileName}`);
        fs.writeFileSync(localFilePath, fileBuffer);
        primaryStorageUrl = `/uploads/${session.mobile}/${path.basename(localFilePath)}`;
      } catch (localErr) {
        console.error('[LocalUpload] Fallback local save error:', localErr);
        primaryStorageUrl = `https://www.stesurat.com/assets/logo_STE.webp`;
      }
    }

    // 2. Fetch Brand Name
    const existingExhibitor = db
      .prepare('SELECT brand_name, stall_sqft, fascia_names_json, logo_file_url, cdr_file_url, drive_file_url, drive_folder_id, drive_folder_url FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as any;

    const reg = findExhibitorByMobile(session.mobile);
    const brandName = existingExhibitor?.brand_name?.trim() || reg?.brandName || 'Exhibitor';

    // 3. Automatically sync to Google Drive in exhibitor folder under "STE Logos"
    let driveResult = await syncExhibitorFileToDrive({
      mobile: session.mobile,
      brandName,
      fileName: file.name,
      fileBuffer,
      mimeType: file.type || 'application/octet-stream'
    });

    const driveFileUrl = driveResult.webViewLink || existingExhibitor?.drive_file_url || null;
    const driveFolderId = driveResult.folderId || existingExhibitor?.drive_folder_id || null;
    const driveFolderUrl = driveResult.folderViewLink || existingExhibitor?.drive_folder_url || null;

    const isCdr = ext === '.cdr' || uploadCategory === 'cdr';
    const isLogoImage = ['.png', '.jpg', '.jpeg'].includes(ext) || uploadCategory === 'logo';

    const cdrUrl = isCdr ? primaryStorageUrl : (existingExhibitor?.cdr_file_url || null);
    const logoUrl = isLogoImage ? primaryStorageUrl : (existingExhibitor?.logo_file_url || null);

    // 4. Update Database
    updateExhibitorFiles(session.mobile, {
      logo_file_url: logoUrl || undefined,
      cdr_file_url: cdrUrl || undefined,
      drive_file_url: driveFileUrl || undefined,
      drive_folder_id: driveFolderId || undefined,
      drive_folder_url: driveFolderUrl || undefined
    });

    // Also update Supabase database directly if configured
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('exhibitors')
          .update({
            logo_file_url: logoUrl,
            cdr_file_url: cdrUrl,
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

    // 5. Sync row to Google Sheets
    try {
      let fasciaNames = [brandName, '', '', ''];
      if (existingExhibitor?.fascia_names_json) {
        try {
          fasciaNames = JSON.parse(existingExhibitor.fascia_names_json);
        } catch {}
      }

      await syncToGoogleSheets({
        mobile: session.mobile,
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
      fileName: file.name,
      fileSize: file.size,
      fileType: ext.replace('.', '').toUpperCase(),
      fileUrl: primaryStorageUrl,
      logoUrl,
      cdrUrl,
      driveFileUrl,
      driveFolderUrl,
      isDriveSynced: Boolean(driveResult.success),
      message: `File "${file.name}" uploaded successfully and linked to ${brandName} folder.`
    });
  } catch (error: any) {
    console.error('Error handling exhibitor file upload:', error);
    return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 });
  }
}
