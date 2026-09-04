import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import db from '@/lib/db';
import {
  resolveAndRecordStall,
  StallLookupUnavailableError,
} from '@/lib/stallAssignment';
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
    const session = await getAuthenticatedExhibitor(request);
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
    //
    // A read that could not be made is refused rather than answered. This is
    // what the page opens the Lucky Box on, so "we could not tell" must never
    // reach it as "you have not drawn": that is what let an exhibitor whose
    // phone dropped one read draw a second time.
    let allocation;
    try {
      allocation = await resolveAndRecordStall(mobile);
    } catch (err) {
      if (err instanceof StallLookupUnavailableError) {
        console.error('[Lottery Status] Allotment read failed for', mobile, err.cause);
        return NextResponse.json(
          {
            error:
              'The allotment database could not be reached, so your stall could ' +
              'not be confirmed. Please try again in a moment.'
          },
          { status: 503 }
        );
      }
      throw err;
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
