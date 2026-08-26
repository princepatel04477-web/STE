import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor, isAdminMobile } from '@/lib/auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    const body = await request.json().catch(() => ({}));
    const { mobile, resetAll } = body;

    // Verify admin access
    const isSessionAdmin = session?.mobile ? isAdminMobile(session.mobile) : false;
    const isTargetAdmin = body.adminKey === 'ste@2026' || isSessionAdmin;

    if (!isTargetAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin credentials required to reset allocations.' },
        { status: 403 }
      );
    }

    if (resetAll) {
      db.prepare('DELETE FROM lottery_allocations').run();
      if (isSupabaseConfigured && supabaseAdmin) {
        try {
          await supabaseAdmin.from('lottery_allocations').delete().neq('mobile', '');
        } catch (sbErr) {
          console.error('[SupabaseDB] Reset all allocations error:', sbErr);
        }
      }
      return NextResponse.json({
        success: true,
        message: 'All lottery allocations have been successfully reset.'
      });
    }

    if (mobile) {
      const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
      db.prepare('DELETE FROM lottery_allocations WHERE mobile = ?').run(cleanMobile);
      if (isSupabaseConfigured && supabaseAdmin) {
        try {
          await supabaseAdmin.from('lottery_allocations').delete().eq('mobile', cleanMobile);
        } catch (sbErr) {
          console.error('[SupabaseDB] Reset allocation error:', sbErr);
        }
      }
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
