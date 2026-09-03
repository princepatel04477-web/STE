import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncExhibitorRowToSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import {
  resolveAndRecordStall,
  StallLookupUnavailableError,
} from '@/lib/stallAssignment';
import { checkGstin, normalizeGstin, verifyGstinWithPortal } from '@/lib/gstin';

// The write touches Supabase and then the Google Sheet; the platform default is
// tight enough that a slow Apps Script can abort a request whose data was
// already saved, which the portal then reports as a failed save.
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let exhibitor = db
      .prepare('SELECT mobile, brand_name, stall_sqft, exhibitor_name, profile_pic_url, company_description, gstin, fascia_names_json, logo_file_url, cdr_file_url, drive_file_url, drive_folder_id, drive_folder_url, updated_at FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as { mobile: string; brand_name: string; stall_sqft: string; exhibitor_name?: string; profile_pic_url?: string; company_description?: string; gstin?: string; fascia_names_json?: string; logo_file_url?: string; cdr_file_url?: string; drive_file_url?: string; drive_folder_id?: string; drive_folder_url?: string; updated_at: string; stall_number?: string; stall_hall?: string; stall_zone?: string; stall_dimensions?: string; stall_allocated_at?: string } | undefined;

    let extractedExhibitorName = exhibitor?.exhibitor_name || '';
    let extractedProfilePicUrl = exhibitor?.profile_pic_url || null;
    let extractedCompanyDesc = exhibitor?.company_description || '';
    let extractedGstin = exhibitor?.gstin || '';
    let extractedFasciaNames = ['', ''];

    // If Supabase is active, ensure we load latest remote data (source of truth)
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbExhibitor, error: sbFetchErr } = await supabaseAdmin
          .from('exhibitors')
          .select('*')
          .eq('mobile', session.mobile)
          .maybeSingle();

        if (sbFetchErr) {
          console.warn('[Profile GET] Supabase fetch error:', sbFetchErr.message);
        } else if (sbExhibitor) {
          exhibitor = {
            ...exhibitor,
            mobile: sbExhibitor.mobile,
            brand_name: sbExhibitor.brand_name || exhibitor?.brand_name || '',
            stall_sqft: sbExhibitor.stall_sqft || exhibitor?.stall_sqft || '',
            logo_file_url: sbExhibitor.logo_file_url ?? exhibitor?.logo_file_url,
            cdr_file_url: sbExhibitor.cdr_file_url ?? exhibitor?.cdr_file_url,
            drive_file_url: sbExhibitor.drive_file_url ?? exhibitor?.drive_file_url,
            drive_folder_url: sbExhibitor.drive_folder_url ?? exhibitor?.drive_folder_url,
            updated_at: sbExhibitor.updated_at || exhibitor?.updated_at || new Date().toISOString(),
            // The stall copy migration 20260827000006 keeps on the profile.
            // Read here so it is to hand if the draw table cannot be reached.
            stall_number: sbExhibitor.stall_number ?? exhibitor?.stall_number,
            stall_hall: sbExhibitor.stall_hall ?? exhibitor?.stall_hall,
            stall_zone: sbExhibitor.stall_zone ?? exhibitor?.stall_zone,
            stall_dimensions: sbExhibitor.stall_dimensions ?? exhibitor?.stall_dimensions,
            stall_allocated_at: sbExhibitor.stall_allocated_at ?? exhibitor?.stall_allocated_at
          };

          if (sbExhibitor.fascia_names_json) {
            const parsed = typeof sbExhibitor.fascia_names_json === 'string'
              ? JSON.parse(sbExhibitor.fascia_names_json)
              : sbExhibitor.fascia_names_json;

            if (Array.isArray(parsed)) {
              extractedFasciaNames = parsed.map(n => String(n || ''));
            } else if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.fascia_names)) {
                extractedFasciaNames = parsed.fascia_names.map((n: any) => String(n || ''));
              }
              if (parsed.exhibitor_name) extractedExhibitorName = parsed.exhibitor_name;
              if (parsed.profile_pic_url) extractedProfilePicUrl = parsed.profile_pic_url;
              if (parsed.company_description) extractedCompanyDesc = parsed.company_description;
              if (parsed.gstin) extractedGstin = parsed.gstin;
            }
          }
        }
      } catch (err) {
        console.warn('[Profile GET] Supabase fetch fallback to local:', err);
      }
    }

    const reg = findExhibitorByMobile(session.mobile);
    const brand_name = (exhibitor?.brand_name && exhibitor.brand_name.trim() !== '')
      ? exhibitor.brand_name
      : (reg?.brandName || 'Registered Exhibitor');

    const stall_sqft = (exhibitor?.stall_sqft && exhibitor.stall_sqft.trim() !== '')
      ? exhibitor.stall_sqft
      : (reg?.stallSqft || '200 sq ft');

    let fascia_names = ['', ''];
    if (extractedFasciaNames.length > 0 && extractedFasciaNames.some(n => n.trim() !== '')) {
      if (extractedFasciaNames[3]?.trim()) {
        fascia_names = [extractedFasciaNames[0] || '', extractedFasciaNames[1] || '', extractedFasciaNames[2] || '', extractedFasciaNames[3] || ''];
      } else if (extractedFasciaNames[2]?.trim()) {
        fascia_names = [extractedFasciaNames[0] || '', extractedFasciaNames[1] || '', extractedFasciaNames[2] || ''];
      } else {
        fascia_names = [extractedFasciaNames[0] || '', extractedFasciaNames[1] || ''];
      }
    } else if (exhibitor?.fascia_names_json) {
      try {
        const parsed = typeof exhibitor.fascia_names_json === 'string'
          ? JSON.parse(exhibitor.fascia_names_json)
          : exhibitor.fascia_names_json;
        if (Array.isArray(parsed)) {
          const names = parsed.map(n => String(n || ''));
          if (names[3]?.trim()) {
            fascia_names = [names[0] || '', names[1] || '', names[2] || '', names[3] || ''];
          } else if (names[2]?.trim()) {
            fascia_names = [names[0] || '', names[1] || '', names[2] || ''];
          } else {
            fascia_names = [names[0] || '', names[1] || ''];
          }
        }
      } catch {}
    } else {
      fascia_names = [brand_name, ''];
    }

    // The stall they were allotted travels with the profile, so the dashboard
    // shows a stall number without asking the draw table itself.
    //
    // If the draw table cannot be read, the copy already written onto this
    // profile answers instead. Nothing here offers a draw, so an out-of-date
    // stall number is the worst this can show - where the portal does offer
    // one, /api/lottery/status refuses rather than guesses.
    let stall = null;
    let stallFallback: Record<string, string> | null = null;
    try {
      stall = await resolveAndRecordStall(session.mobile);
    } catch (err) {
      if (!(err instanceof StallLookupUnavailableError)) throw err;
      console.warn('[Profile GET] Allotment read failed; using the profile copy.');
      stallFallback = {
        stall_number: exhibitor?.stall_number || '',
        stall_hall: exhibitor?.stall_hall || '',
        stall_zone: exhibitor?.stall_zone || '',
        stall_dimensions: exhibitor?.stall_dimensions || '',
        stall_allocated_at: exhibitor?.stall_allocated_at || '',
      };
    }

    return NextResponse.json({
      mobile: session.mobile,
      brand_name,
      stall_sqft,
      stall_number: stall?.stall_number || stallFallback?.stall_number || '',
      stall_hall: stall?.hall || stallFallback?.stall_hall || '',
      stall_zone: stall?.zone || stallFallback?.stall_zone || '',
      stall_dimensions: stall?.dimensions || stallFallback?.stall_dimensions || '',
      stall_allocated_at: stall?.allocated_at || stallFallback?.stall_allocated_at || '',
      exhibitor_name: extractedExhibitorName,
      profile_pic_url: extractedProfilePicUrl,
      company_description: extractedCompanyDesc,
      gstin: extractedGstin,
      fascia_names,
      logo_file_url: exhibitor?.logo_file_url || null,
      cdr_file_url: exhibitor?.cdr_file_url || null,
      drive_file_url: exhibitor?.drive_file_url || null,
      drive_folder_url: exhibitor?.drive_folder_url || null,
      category: reg?.category || '',
      market: reg?.market || '',
      // The portal replays any edit it could not send (a phone that lost signal
      // or was killed mid-form) on the next visit. It compares against this to
      // avoid replaying a stale draft over newer edits made elsewhere.
      updated_at: exhibitor?.updated_at || null
    });
  } catch (error) {
    console.error('Error fetching exhibitor profile:', error);
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brand_name, stall_sqft, fascia_names, exhibitor_name, company_description, gstin } = body;

    const reg = findExhibitorByMobile(session.mobile);
    const cleanBrand = (typeof brand_name === 'string' && brand_name.trim())
      ? brand_name.trim()
      : (reg?.brandName || 'Registered Exhibitor');

    const cleanSqft = (typeof stall_sqft === 'string' && stall_sqft.trim())
      ? stall_sqft.trim()
      : (reg?.stallSqft || '200 sq ft');

    const cleanExhibitorName = typeof exhibitor_name === 'string' ? exhibitor_name.trim() : '';
    const cleanCompanyDesc = typeof company_description === 'string' ? company_description.trim().slice(0, 400) : '';

    // The exhibitor's own GSTIN, which their extras bill is raised against.
    // Whether it is required is decided where the order is saved — extras
    // cannot be ordered without one. Here it only has to be real if given:
    // shape, state code and check digit, so a mistyped number cannot reach an
    // invoice the organiser can claim no input credit against.
    const cleanGstin = normalizeGstin(gstin);
    if (cleanGstin) {
      const gstinCheck = checkGstin(cleanGstin);
      if (!gstinCheck.valid) {
        return NextResponse.json({ error: gstinCheck.reason, field: 'gstin' }, { status: 400 });
      }

      // Where a verification service is configured, a number that passes every
      // offline check but is not actually registered is turned away too. With
      // none configured this returns unchecked and changes nothing.
      const portal = await verifyGstinWithPortal(cleanGstin);
      if (portal.checked && portal.active === false) {
        return NextResponse.json(
          { error: 'The GST portal does not show that GSTIN as active. Please check it against your GST certificate.', field: 'gstin' },
          { status: 400 }
        );
      }
      if (!portal.checked && portal.note && process.env.GST_VERIFY_API_URL) {
        console.warn('[Profile POST] GSTIN portal check skipped:', portal.note);
      }
    }
    
    // Sanitize dynamic fascia names options (up to 4, minimum 2)
    let cleanFasciaNames: string[] = ['', ''];
    if (Array.isArray(fascia_names)) {
      cleanFasciaNames = fascia_names.map(n => String(n || '').trim()).slice(0, 4);
      while (cleanFasciaNames.length < 2) {
        cleanFasciaNames.push('');
      }
    } else {
      cleanFasciaNames = [cleanBrand, ''];
    }

    const existing = db
      .prepare('SELECT id, profile_pic_url, logo_file_url, cdr_file_url, drive_file_url, drive_folder_id, drive_folder_url FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as any;

    let profilePicUrl = existing?.profile_pic_url || null;

    // The artwork and Drive links are written by the upload route, and the local
    // store is a /tmp cache that a cold serverless instance starts empty. Carry
    // the cloud values forward, or saving a name would blank an exhibitor's
    // uploaded logo, CDR and Drive folder.
    let logoFileUrl = existing?.logo_file_url || null;
    let cdrFileUrl = existing?.cdr_file_url || null;
    let driveFileUrl = existing?.drive_file_url || null;
    let driveFolderId = existing?.drive_folder_id || null;
    let driveFolderUrl = existing?.drive_folder_url || null;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbEx } = await supabaseAdmin
          .from('exhibitors')
          .select('fascia_names_json, logo_file_url, cdr_file_url, drive_file_url, drive_folder_id, drive_folder_url')
          .eq('mobile', session.mobile)
          .maybeSingle();

        if (sbEx?.fascia_names_json) {
          const parsed = typeof sbEx.fascia_names_json === 'string' ? JSON.parse(sbEx.fascia_names_json) : sbEx.fascia_names_json;
          if (parsed && typeof parsed === 'object' && parsed.profile_pic_url) {
            profilePicUrl = parsed.profile_pic_url;
          }
        }

        logoFileUrl = sbEx?.logo_file_url ?? logoFileUrl;
        cdrFileUrl = sbEx?.cdr_file_url ?? cdrFileUrl;
        driveFileUrl = sbEx?.drive_file_url ?? driveFileUrl;
        driveFolderId = sbEx?.drive_folder_id ?? driveFolderId;
        driveFolderUrl = sbEx?.drive_folder_url ?? driveFolderUrl;
      } catch (err) {
        console.warn('[Profile POST] Could not read cloud artwork links:', err);
      }
    }

    const structuredProfilePayload = {
      fascia_names: cleanFasciaNames,
      exhibitor_name: cleanExhibitorName,
      company_description: cleanCompanyDesc,
      gstin: cleanGstin,
      profile_pic_url: profilePicUrl
    };

    const fasciaNamesJson = JSON.stringify(cleanFasciaNames);

    if (existing) {
      db.prepare(
        'UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, fascia_names_json = ?, exhibitor_name = ?, company_description = ?, gstin = ?, updated_at = CURRENT_TIMESTAMP WHERE mobile = ?'
      ).run(cleanBrand, cleanSqft, fasciaNamesJson, cleanExhibitorName, cleanCompanyDesc, cleanGstin, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitors (mobile, brand_name, stall_sqft, fascia_names_json, exhibitor_name, company_description, gstin) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(session.mobile, cleanBrand, cleanSqft, fasciaNamesJson, cleanExhibitorName, cleanCompanyDesc, cleanGstin);
    }

    // Direct cloud sync to Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { error: sbErr } = await supabaseAdmin
          .from('exhibitors')
          .upsert({
            mobile: session.mobile,
            brand_name: cleanBrand,
            stall_sqft: cleanSqft,
            fascia_names_json: structuredProfilePayload,
            logo_file_url: logoFileUrl,
            cdr_file_url: cdrFileUrl,
            drive_file_url: driveFileUrl,
            drive_folder_id: driveFolderId,
            drive_folder_url: driveFolderUrl,
            updated_at: new Date().toISOString()
          }, { onConflict: 'mobile' });

        if (sbErr) {
          console.error('[SupabaseDB] Profile upsert error:', sbErr.message);
          return NextResponse.json({ error: `Failed to persist to cloud database: ${sbErr.message}` }, { status: 500 });
        }
      } catch (err: any) {
        console.error('[SupabaseDB] Profile sync exception:', err);
        return NextResponse.json({ error: `Database persistence error: ${err?.message || 'Unknown error'}` }, { status: 500 });
      }
    }

    // Push the exhibitor's COMPLETE row to the sheet — profile, artwork links
    // and extras together. Sending only the profile fields blanked the
    // uploaded logo, the Drive links and every extra item in the sheet.
    try {
      await syncExhibitorRowToSheets(session.mobile, {
        exhibitor_name: cleanExhibitorName,
        profile_pic_url: profilePicUrl || '',
        company_description: cleanCompanyDesc,
        gstin: cleanGstin,
        brand_name: cleanBrand,
        stall_sqft: cleanSqft,
        fascia_names: cleanFasciaNames,
        logo_file_url: logoFileUrl || '',
        cdr_file_url: cdrFileUrl || '',
        drive_file_url: driveFileUrl || '',
        drive_folder_url: driveFolderUrl || ''
      });
    } catch (err) {
      console.error('Google Sheets sync error:', err);
    }

    return NextResponse.json({
      success: true,
      mobile: session.mobile,
      brand_name: cleanBrand,
      exhibitor_name: cleanExhibitorName,
      company_description: cleanCompanyDesc,
      gstin: cleanGstin,
      stall_sqft: cleanSqft,
      message: 'Exhibitor profile updated successfully.'
    });
  } catch (error) {
    console.error('Error updating exhibitor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
