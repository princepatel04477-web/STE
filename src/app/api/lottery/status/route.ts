import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import db from '@/lib/db';
import { resolveAndRecordStall } from '@/lib/stallAssignment';
import { normalizeSqftCategory } from '@/data/stallInventory';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryMobile = searchParams.get('mobile');

    // The number the caller asked about wins, and the session answers only
    // when none was given. /api/lottery/draw resolves identity the same way,
    // so the two can never disagree about who is being seated: a phone still
    // carrying an earlier session used to be shown that firm's stall while the
    // draw ran for the number actually typed in.
    const session = await getAuthenticatedExhibitor();
    const mobile =
      normalizeExhibitorId(queryMobile) ||
      (session?.mobile ? normalizeExhibitorId(session.mobile) : '');

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

    // 2. The stall this exhibitor holds, under any of the numbers they answer
    // to, written onto their profile on the way out.
    const allocation = await resolveAndRecordStall(mobile);

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
