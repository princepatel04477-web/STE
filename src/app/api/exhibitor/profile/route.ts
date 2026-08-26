import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncToGoogleSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';

export async function GET() {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let exhibitor = db
      .prepare('SELECT mobile, brand_name, stall_sqft, exhibitor_name, profile_pic_url, company_description, fascia_names_json, logo_file_url, cdr_file_url, drive_file_url, drive_folder_id, drive_folder_url, updated_at FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as { mobile: string; brand_name: string; stall_sqft: string; exhibitor_name?: string; profile_pic_url?: string; company_description?: string; fascia_names_json?: string; logo_file_url?: string; cdr_file_url?: string; drive_file_url?: string; drive_folder_id?: string; drive_folder_url?: string; updated_at: string } | undefined;

    let extractedExhibitorName = exhibitor?.exhibitor_name || '';
    let extractedProfilePicUrl = exhibitor?.profile_pic_url || null;
    let extractedCompanyDesc = exhibitor?.company_description || '';
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
            updated_at: sbExhibitor.updated_at || exhibitor?.updated_at || new Date().toISOString()
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

    return NextResponse.json({
      mobile: session.mobile,
      brand_name,
      stall_sqft,
      exhibitor_name: extractedExhibitorName,
      profile_pic_url: extractedProfilePicUrl,
      company_description: extractedCompanyDesc,
      fascia_names,
      logo_file_url: exhibitor?.logo_file_url || null,
      cdr_file_url: exhibitor?.cdr_file_url || null,
      drive_file_url: exhibitor?.drive_file_url || null,
      drive_folder_url: exhibitor?.drive_folder_url || null,
      category: reg?.category || '',
      market: reg?.market || ''
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
    const { brand_name, stall_sqft, fascia_names, exhibitor_name, company_description } = body;

    const reg = findExhibitorByMobile(session.mobile);
    const cleanBrand = (typeof brand_name === 'string' && brand_name.trim())
      ? brand_name.trim()
      : (reg?.brandName || 'Registered Exhibitor');

    const cleanSqft = (typeof stall_sqft === 'string' && stall_sqft.trim())
      ? stall_sqft.trim()
      : (reg?.stallSqft || '200 sq ft');

    const cleanExhibitorName = typeof exhibitor_name === 'string' ? exhibitor_name.trim() : '';
    const cleanCompanyDesc = typeof company_description === 'string' ? company_description.trim().slice(0, 400) : '';
    
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

    // Fetch existing profile pic from Supabase if not in local db
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
      } catch {}
    }

    const structuredProfilePayload = {
      fascia_names: cleanFasciaNames,
      exhibitor_name: cleanExhibitorName,
      company_description: cleanCompanyDesc,
      profile_pic_url: profilePicUrl
    };

    const fasciaNamesJson = JSON.stringify(cleanFasciaNames);

    if (existing) {
      db.prepare(
        'UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, fascia_names_json = ?, exhibitor_name = ?, company_description = ?, updated_at = CURRENT_TIMESTAMP WHERE mobile = ?'
      ).run(cleanBrand, cleanSqft, fasciaNamesJson, cleanExhibitorName, cleanCompanyDesc, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitors (mobile, brand_name, stall_sqft, fascia_names_json, exhibitor_name, company_description) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(session.mobile, cleanBrand, cleanSqft, fasciaNamesJson, cleanExhibitorName, cleanCompanyDesc);
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
            logo_file_url: existing?.logo_file_url || null,
            cdr_file_url: existing?.cdr_file_url || null,
            drive_file_url: existing?.drive_file_url || null,
            drive_folder_id: existing?.drive_folder_id || null,
            drive_folder_url: existing?.drive_folder_url || null,
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

    // Fetch existing order items for complete Google Sheet row sync
    const order = db
      .prepare('SELECT items_json, special_notes, owner_badges, sales_badges, support_badges, badge_names_json, rental_days FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string; special_notes: string; owner_badges?: number; sales_badges?: number; support_badges?: number; badge_names_json?: string; rental_days?: number } | undefined;

    let items = [];
    if (order && order.items_json) {
      try { items = JSON.parse(order.items_json); } catch {}
    }

    let badgeNames = undefined;
    if (order && order.badge_names_json) {
      try { badgeNames = JSON.parse(order.badge_names_json); } catch {}
    }

    // Sync to Google Sheets and await completion for Vercel Serverless execution
    try {
      await syncToGoogleSheets({
        mobile: session.mobile,
        exhibitor_name: cleanExhibitorName,
        profile_pic_url: existing?.profile_pic_url || '',
        company_description: cleanCompanyDesc,
        brand_name: cleanBrand,
        stall_sqft: cleanSqft,
        fascia_names: cleanFasciaNames,
        items,
        special_notes: order?.special_notes || '',
        owner_badges: order?.owner_badges ?? 0,
        sales_badges: order?.sales_badges ?? 0,
        support_badges: order?.support_badges ?? 0,
        badge_names: badgeNames,
        rental_days: order?.rental_days ?? 2
      });
    } catch (err) {
      console.error('Google Sheets background sync error:', err);
    }

    return NextResponse.json({
      success: true,
      mobile: session.mobile,
      brand_name: cleanBrand,
      exhibitor_name: cleanExhibitorName,
      company_description: cleanCompanyDesc,
      stall_sqft: cleanSqft,
      message: 'Exhibitor profile updated successfully.'
    });
  } catch (error) {
    console.error('Error updating exhibitor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
