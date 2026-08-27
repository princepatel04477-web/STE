import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { findExhibitorByMobile, numbersFor } from '@/data/registeredExhibitors';
import db, { LotteryAllocationRecord } from '@/lib/db';
import { getAllocatedStallForMobile } from '@/lib/lotteryEngine';
import { normalizeSqftCategory } from '@/data/stallInventory';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryMobile = searchParams.get('mobile');

    let mobile = '';
    const session = await getAuthenticatedExhibitor();
    if (session?.mobile) {
      mobile = normalizeExhibitorId(session.mobile);
    } else if (queryMobile) {
      mobile = normalizeExhibitorId(queryMobile);
    }

    if (!mobile) {
      return NextResponse.json(
        { error: 'A mobile number or user ID is required, or the user must be logged in.' },
        { status: 400 }
      );
    }

    // 1. Get registered exhibitor profile
    const registeredMaster = findExhibitorByMobile(mobile);
    const dbExhibitor = db.prepare('SELECT * FROM exhibitors WHERE mobile = ?').get(mobile) as any;

    const brandName = dbExhibitor?.brand_name || registeredMaster?.brandName || 'STE Exhibitor';
    const rawSqft = dbExhibitor?.stall_sqft || registeredMaster?.stallSqft || '200 sq ft';
    const categorySqft = normalizeSqftCategory(rawSqft);
    const market = registeredMaster?.market || '';

    // 2. Check allocation status from Supabase (source of truth) or local
    // fallback. A firm that drew on a second number has drawn, so every number
    // on its master-sheet row is looked at, not just the one it logged in with.
    const ownNumbers = registeredMaster ? numbersFor(registeredMaster) : [mobile];
    let allocation =
      ownNumbers.map(getAllocatedStallForMobile).find(Boolean) ?? null;
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbAllocs } = await supabaseAdmin
          .from('lottery_allocations')
          .select('*')
          .in('mobile', ownNumbers);

        const sbAlloc = sbAllocs?.[0];
        if (sbAlloc) {
          allocation = sbAlloc;
        }
      } catch (sbErr) {
        console.warn('[Lottery Status] Supabase fetch fallback:', sbErr);
      }
    }

    return NextResponse.json({
      success: true,
      mobile,
      brandName,
      rawSqft,
      categorySqft: `${categorySqft} sq ft`,
      market,
      hasDrawn: Boolean(allocation),
      allocation: allocation || null
    });
  } catch (error) {
    console.error('Lottery status error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve lottery status.' },
      { status: 500 }
    );
  }
}
