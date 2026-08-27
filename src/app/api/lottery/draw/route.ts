import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import db from '@/lib/db';
import { performLuckyDraw } from '@/lib/lotteryEngine';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let mobile = normalizeExhibitorId(body.mobile);

    const session = await getAuthenticatedExhibitor();
    if (!mobile && session?.mobile) {
      mobile = normalizeExhibitorId(session.mobile);
    }

    if (!mobile) {
      return NextResponse.json(
        { error: 'A registered mobile number or user ID is required to perform the lucky draw.' },
        { status: 400 }
      );
    }

    // Lookup profile data
    const registeredMaster = findExhibitorByMobile(mobile);
    const dbExhibitor = db.prepare('SELECT * FROM exhibitors WHERE mobile = ?').get(mobile) as any;

    const brandName = body.brandName || dbExhibitor?.brand_name || registeredMaster?.brandName || 'STE Exhibitor';
    const stallSqft = body.stallSqft || dbExhibitor?.stall_sqft || registeredMaster?.stallSqft || '200 sq ft';

    // Execute lucky draw
    const result = performLuckyDraw(mobile, brandName, stallSqft);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Lucky draw allocation failed.' },
        { status: 500 }
      );
    }

    // Direct cloud sync to Supabase Database
    if (isSupabaseConfigured && supabaseAdmin && result.allocation) {
      try {
        await supabaseAdmin
          .from('lottery_allocations')
          .upsert({
            mobile: result.allocation.mobile,
            brand_name: result.allocation.brand_name,
            stall_sqft: result.allocation.stall_sqft,
            stall_number: result.allocation.stall_number,
            is_corner: result.allocation.is_corner,
            shape: result.allocation.shape,
            hall: result.allocation.hall,
            zone: result.allocation.zone,
            dimensions: result.allocation.dimensions,
            slip_id: result.allocation.slip_id,
            allocated_at: result.allocation.allocated_at
          }, { onConflict: 'mobile' });
      } catch (sbErr) {
        console.error('[SupabaseDB] Lottery allocation upsert error:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      isExisting: result.isExisting,
      allocation: result.allocation,
      message: result.isExisting
        ? 'Exhibitor already has an allotted stall.'
        : `Congratulations! Stall ${result.allocation?.stall_number} allocated successfully!`
    });
  } catch (error) {
    console.error('Lottery draw API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during stall allocation.' },
      { status: 500 }
    );
  }
}
