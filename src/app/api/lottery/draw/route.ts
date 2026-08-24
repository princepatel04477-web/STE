import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';
import db from '@/lib/db';
import { performLuckyDraw } from '@/lib/lotteryEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let mobile = body.mobile ? String(body.mobile).replace(/\D/g, '').slice(-10) : '';

    const session = await getAuthenticatedExhibitor();
    if (!mobile && session?.mobile) {
      mobile = session.mobile;
    }

    if (!mobile || mobile.length < 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit mobile number is required to perform lucky draw.' },
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
