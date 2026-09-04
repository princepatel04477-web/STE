import { NextResponse } from 'next/server';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import {
  canonicalMobile,
  findExhibitorByMobile,
  isRegisteredExhibitor,
  numbersFor,
} from '@/data/registeredExhibitors';
import db from '@/lib/db';
import { performLuckyDraw, saveAllocationLocally, DrawContext } from '@/lib/lotteryEngine';
import type { LotteryAllocationRecord } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured, hasServiceRoleKey } from '@/lib/supabase';
import { recordStallAllocation } from '@/lib/stallAssignment';

/**
 * A stall lost to another exhibitor mid-draw costs one more attempt. Eight is
 * far more than a live draw needs - it only ever spends one per firm that
 * happened to be pressing the button in the same second - and it still ends,
 * so a block that has genuinely run out reports that instead of spinning.
 */
const MAX_DRAW_ATTEMPTS = 8;

/** The row as lottery_allocations holds it. */
function allocationRow(allocation: LotteryAllocationRecord) {
  return {
    mobile: allocation.mobile,
    // The firm behind the number. Unique in the table, so a firm drawing at
    // the same moment on two of its own numbers is refused the second stall
    // rather than seated on it (migration 20260828000008).
    firm_mobile: canonicalMobile(allocation.mobile),
    brand_name: allocation.brand_name,
    stall_sqft: allocation.stall_sqft,
    stall_number: allocation.stall_number,
    is_corner: allocation.is_corner,
    shape: allocation.shape,
    hall: allocation.hall,
    zone: allocation.zone,
    dimensions: allocation.dimensions,
    slip_id: allocation.slip_id,
    allocated_at: allocation.allocated_at,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let mobile = normalizeExhibitorId(body.mobile);

    const session = await getAuthenticatedExhibitor(request);
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

    // Every number this firm is known by, so a second number cannot win a
    // second stall. The earliest row is the one that counts: a drawn number is
    // final, and ordering makes sure the same one comes back every time rather
    // than whichever the database happened to return first.
    const ownNumbers = registeredMaster ? numbersFor(registeredMaster) : [mobile];
    const firmMobile = canonicalMobile(mobile);
    const readOwnAllocation = async (): Promise<LotteryAllocationRecord | null> => {
      // Matched on firm_mobile as well as on every number the firm answers
      // to: the column is the guarantee, and the number list still finds a
      // row written before the column existed.
      const { data, error } = await supabaseAdmin!
        .from('lottery_allocations')
        .select('*')
        .or(
          `firm_mobile.eq.${firmMobile},mobile.in.(${ownNumbers.join(',')})`
        )
        .order('allocated_at', { ascending: true })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as LotteryAllocationRecord) ?? null;
    };

    // Configured to use the cloud, but without the key that can actually read
    // and write it. Row-level security would report an empty floor and refuse
    // the write without raising anything, so the draw would hand out a stall
    // that is already someone else's and then lose it. Refuse instead.
    if (isSupabaseConfigured && !hasServiceRoleKey) {
      console.error('[Lottery Draw] Refused: the allotment database is not reachable with write access.');
      return NextResponse.json(
        {
          error:
            'The allotment database is not configured for this deployment, so ' +
            'no stall was drawn. Please contact the organisers.'
        },
        { status: 503 }
      );
    }

    // No cloud database configured - a local dev machine. The local store is
    // then the whole record, so the draw is written straight to it.
    if (!isSupabaseConfigured || !supabaseAdmin) {
      const result = performLuckyDraw(mobile, brandName, stallSqft);
      if (!result.success || !result.allocation) {
        return NextResponse.json(
          { error: result.error || 'Lucky draw allocation failed.' },
          { status: 409 }
        );
      }
      if (!result.isExisting) saveAllocationLocally(result.allocation);
      await recordStallAllocation(result.allocation);
      return NextResponse.json({
        success: true,
        isExisting: result.isExisting,
        allocation: result.allocation,
        message: result.isExisting
          ? 'Exhibitor already has an allotted stall.'
          : `Congratulations! Stall ${result.allocation.stall_number} allocated successfully!`,
      });
    }

    // The local store sits in /tmp on Vercel and is wiped per instance, so the
    // cloud database is the only reliable answer to "has this exhibitor already
    // drawn?" and "which stalls are gone?". Read both before drawing.
    const context: DrawContext = {};
    try {
      const existing = await readOwnAllocation();

      if (existing) {
        // Already seated: make sure their profile carries the stall, then
        // hand back the stall they hold rather than drawing a second one.
        saveAllocationLocally(existing);
        await recordStallAllocation(existing);
        return NextResponse.json({
          success: true,
          isExisting: true,
          allocation: existing,
          message: 'Exhibitor already has an allotted stall.'
        });
      }

      const { data: sbTaken, error: takenErr } = await supabaseAdmin
        .from('lottery_allocations')
        .select('stall_number');
      if (takenErr || !Array.isArray(sbTaken)) {
        throw takenErr ?? new Error('The allotted-stall list came back empty-handed.');
      }

      context.taken = sbTaken
        .map((row) => String(row.stall_number || '').trim())
        .filter(Boolean);
    } catch (sbErr) {
      console.error('[Lottery Draw] Cloud pre-check failed:', sbErr);
      return NextResponse.json(
        {
          error:
            'Could not reach the allotment database. The draw was not run - ' +
            'please try again in a moment.'
        },
        { status: 503 }
      );
    }

    // Draw, then offer the stall to the database and let it decide. The unique
    // index on stall_number (migration 20260828000007) means the second firm to
    // reach for a stall is refused rather than seated on it, and comes back
    // here to draw again. This is what makes a drawn number final: nothing is
    // shown to the exhibitor until the database has accepted it.
    const taken = new Set(context.taken ?? []);
    let allocation: LotteryAllocationRecord | null = null;
    let isExisting = false;
    let lastConflict = '';

    for (let attempt = 0; attempt < MAX_DRAW_ATTEMPTS && !allocation; attempt++) {
      const result = performLuckyDraw(mobile, brandName, stallSqft, {
        // The cloud has been asked and holds nothing for this firm, so the
        // local store must not be consulted: a row left behind by an instance
        // that was reset elsewhere would hand back a stall that is no longer
        // theirs.
        existing: null,
        taken: Array.from(taken),
      });

      if (!result.success || !result.allocation) {
        return NextResponse.json(
          { error: result.error || 'Lucky draw allocation failed.' },
          { status: 409 }
        );
      }

      const drawn = result.allocation;

      // A hand-allotted stall comes back whatever the taken list says, so a
      // repeat means the stall this firm is held on is already on record for
      // someone else. Drawing again would only return it a third time.
      if (taken.has(drawn.stall_number)) {
        return NextResponse.json(
          {
            error:
              `Stall ${drawn.stall_number} is held for this exhibitor but is already ` +
              'allotted to another firm. Please contact the organisers.'
          },
          { status: 409 }
        );
      }

      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('lottery_allocations')
        .insert(allocationRow(drawn))
        .select('*')
        .single();

      if (!insertErr && inserted) {
        allocation = inserted as LotteryAllocationRecord;
        break;
      }

      // Refused. Ask the database which of the two guarantees was hit rather
      // than reading the message: if this firm now holds a stall, a request
      // running alongside this one seated them and that draw is the one that
      // stands. Otherwise the stall went to someone else, so take it off the
      // list and draw again.
      let mine: LotteryAllocationRecord | null = null;
      try {
        mine = await readOwnAllocation();
      } catch (readErr) {
        console.error('[Lottery Draw] Post-conflict read failed:', readErr);
      }

      if (mine) {
        allocation = mine;
        isExisting = true;
        break;
      }

      if (insertErr?.code === '23505') {
        console.warn(
          `[Lottery Draw] ${mobile} drew ${drawn.stall_number}, which was taken ` +
          'mid-draw. Redrawing.'
        );
        taken.add(drawn.stall_number);
        lastConflict = insertErr.message;
        continue;
      }

      console.error('[Lottery Draw] Allotment write failed:', insertErr);
      return NextResponse.json(
        {
          error:
            'The allotment could not be saved, so no stall was drawn. Nothing has ' +
            'been allotted to you yet - please try again in a moment.'
        },
        { status: 503 }
      );
    }

    if (!allocation) {
      console.error(
        `[Lottery Draw] ${mobile} could not be seated in ${MAX_DRAW_ATTEMPTS} attempts. ` +
        `Last conflict: ${lastConflict}`
      );
      return NextResponse.json(
        {
          error:
            'Several exhibitors are drawing at once and every stall this draw ' +
            'offered was taken first. Nothing has been allotted to you - please ' +
            'try again in a moment.'
        },
        { status: 503 }
      );
    }

    // Settled. Only now is the stall kept anywhere else: the local copy, and
    // the one write-back onto the exhibitor's own profile, so every view can
    // read it without a join.
    saveAllocationLocally(allocation);
    await recordStallAllocation(allocation);

    return NextResponse.json({
      success: true,
      isExisting,
      allocation,
      message: isExisting
        ? 'Exhibitor already has an allotted stall.'
        : `Congratulations! Stall ${allocation.stall_number} allocated successfully!`
    });
  } catch (error) {
    console.error('Lottery draw API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during stall allocation.' },
      { status: 500 }
    );
  }
}
