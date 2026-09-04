import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor, isAdminMobile } from '@/lib/auth';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { allNumbersFor, clearStallAllocation } from '@/lib/stallAssignment';

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor(request);
    const body = await request.json().catch(() => ({}));
    const { mobile, resetAll } = body;

    // Only an organiser session may undo a draw.
    //
    // This used to also accept a shared key sent in the request body, but the
    // admin console is a client component, so that key was compiled into a
    // public /_next/static chunk - anyone who opened the page could read it
    // and wipe every allotment without logging in. The console already signs
    // in as an organiser, so the session was the only real check all along.
    const isSessionAdmin = session?.mobile ? isAdminMobile(session.mobile) : false;

    if (!isSessionAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required to reset allocations.' },
        { status: 403 }
      );
    }

    if (resetAll) {
      db.prepare('DELETE FROM lottery_allocations').run();
      if (isSupabaseConfigured && supabaseAdmin) {
        // The cloud table is the allotment. A delete it refuses leaves every
        // stall still held, so it cannot be swallowed: the organiser would be
        // told the draw was reset, send the exhibitors back to the box, and
        // watch them all be handed the stall they already had.
        try {
          const { error } = await supabaseAdmin
            .from('lottery_allocations')
            .delete()
            .neq('mobile', '');
          if (error) throw error;
        } catch (sbErr) {
          console.error('[SupabaseDB] Reset all allocations error:', sbErr);
          return NextResponse.json(
            {
              error:
                'The allotment database refused the reset, so nothing was ' +
                'cleared. Please try again in a moment.'
            },
            { status: 503 }
          );
        }
      }
      // The stall copy on each profile goes with the draw it came from.
      await clearStallAllocation();

      return NextResponse.json({
        success: true,
        message: 'All lottery allocations have been successfully reset.'
      });
    }

    if (mobile) {
      const cleanMobile = normalizeExhibitorId(mobile);
      db.prepare('DELETE FROM lottery_allocations WHERE mobile = ?').run(cleanMobile);
      if (isSupabaseConfigured && supabaseAdmin) {
        // Every number the firm answers to, so a draw filed under an alias is
        // undone by a reset aimed at the number on the master sheet.
        try {
          const { error } = await supabaseAdmin
            .from('lottery_allocations')
            .delete()
            .in('mobile', allNumbersFor(cleanMobile));
          if (error) throw error;
        } catch (sbErr) {
          console.error('[SupabaseDB] Reset allocation error:', sbErr);
          return NextResponse.json(
            {
              error:
                `The allotment database refused the reset for ${cleanMobile}, ` +
                'so their stall is unchanged. Please try again in a moment.'
            },
            { status: 503 }
          );
        }
      }
      await clearStallAllocation(cleanMobile);

      return NextResponse.json({
        success: true,
        message: `Lottery allocation for exhibitor ${cleanMobile} has been reset.`
      });
    }

    return NextResponse.json(
      { error: 'Mobile number or resetAll flag is required.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Lottery reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset allocation.' },
      { status: 500 }
    );
  }
}
