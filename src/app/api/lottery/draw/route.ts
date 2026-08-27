import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { findExhibitorByMobile, isRegisteredExhibitor } from '@/data/registeredExhibitors';
import db from '@/lib/db';
import { performLuckyDraw, DrawContext } from '@/lib/lotteryEngine';
import type { LotteryAllocationRecord } from '@/lib/db';
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

    // mobile can come straight off the request body, so the draw has to apply
    // the same guest list as login rather than trusting the caller.
    if (!isRegisteredExhibitor(mobile)) {
      return NextResponse.json(
        { error: 'This number is not on the STE 2026 exhibitor list, so it cannot draw a stall.' },
        { status: 403 }
      );
    }

    // Lookup profile data
    const registeredMaster = findExhibitorByMobile(mobile);
    const dbExhibitor = db.prepare('SELECT * FROM exhibitors WHERE mobile = ?').get(mobile) as any;

    const brandName = body.brandName || dbExhibitor?.brand_name || registeredMaster?.brandName || 'STE Exhibitor';
    const stallSqft = body.stallSqft || dbExhibitor?.stall_sqft || registeredMaster?.stallSqft || '200 sq ft';

    // The local store sits in /tmp on Vercel and is wiped per instance, so the
    // cloud database is the only reliable answer to "has this exhibitor already
    // drawn?" and "which stalls are gone?". Read both before drawing.
    const context: DrawContext = {};
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbExisting } = await supabaseAdmin
          .from('lottery_allocations')
          .select('*')
          .eq('mobile', mobile)
          .maybeSingle();

        if (sbExisting) {
          return NextResponse.json({
            success: true,
            isExisting: true,
            allocation: sbExisting,
            message: 'Exhibitor already has an allotted stall.'
          });
        }

        const { data: sbTaken } = await supabaseAdmin
          .from('lottery_allocations')
          .select('stall_number');

        if (Array.isArray(sbTaken)) {
          context.taken = sbTaken
            .map((row) => String(row.stall_number || '').trim())
            .filter(Boolean);
        }
      } catch (sbErr) {
        console.error('[Lottery Draw] Cloud pre-check failed:', sbErr);
        return NextResponse.json(
          {
            error:
              'Could not reach the allotment database. The draw was not run — ' +
              'please try again in a moment.'
          },
          { status: 503 }
        );
      }
    }

    // Execute lucky draw
    const result = performLuckyDraw(mobile, brandName, stallSqft, context);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Lucky draw allocation failed.' },
        { status: 500 }
      );
    }

    // Direct cloud sync to Supabase Database. ignoreDuplicates leaves a row that
    // a concurrent request wrote in place, so the first draw stands.
    let allocation: LotteryAllocationRecord | null = result.allocation ?? null;
    if (isSupabaseConfigured && supabaseAdmin && result.allocation && !result.isExisting) {
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
          }, { onConflict: 'mobile', ignoreDuplicates: true });

        // Read back what the database actually holds. If another request got
        // there first, that row is the exhibitor's stall, not the one just
        // drawn here.
        const { data: stored } = await supabaseAdmin
          .from('lottery_allocations')
          .select('*')
          .eq('mobile', mobile)
          .maybeSingle();

        if (stored) {
          allocation = stored;
          if (stored.stall_number !== result.allocation.stall_number) {
            console.warn(
              `[Lottery Draw] ${mobile} drew ${result.allocation.stall_number} but ` +
              `${stored.stall_number} was already on record; keeping the stored stall.`
            );
          }
        }
      } catch (sbErr) {
        console.error('[SupabaseDB] Lottery allocation upsert error:', sbErr);
      }
    }

    const isExisting =
      result.isExisting ||
      allocation?.stall_number !== result.allocation?.stall_number;

    return NextResponse.json({
      success: true,
      isExisting,
      allocation,
      message: isExisting
        ? 'Exhibitor already has an allotted stall.'
        : `Congratulations! Stall ${allocation?.stall_number} allocated successfully!`
    });
  } catch (error) {
    console.error('Lottery draw API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during stall allocation.' },
      { status: 500 }
    );
  }
}
