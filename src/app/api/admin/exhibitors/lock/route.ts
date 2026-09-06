import { NextResponse } from 'next/server';
import { setExhibitorRequirementsLock, setAllExhibitorsRequirementsLock } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthenticatedExhibitor, isAdminMobile } from '@/lib/auth';
import { EXHIBITORS_ONLY, canonicalMobile } from '@/data/registeredExhibitors';

/**
 * Freezes (or reopens) an exhibitor's Additional Requirements & Extras
 * section. Single-exhibitor toggle via `mobile`, or every exhibitor at once
 * via `all: true` (Lock All / Unlock All in the admin console).
 */
export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session || !isAdminMobile(session.mobile)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin authorization required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const locked = Boolean(body?.locked);
    const all = body?.all === true;
    const rawMobile = typeof body?.mobile === 'string' ? body.mobile : '';

    const mobiles = all
      ? EXHIBITORS_ONLY.map((e) => e.mobile)
      : rawMobile
      ? [canonicalMobile(rawMobile)]
      : [];

    if (mobiles.length === 0) {
      return NextResponse.json({ error: 'No exhibitor specified.' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const { error: sbErr } = await supabaseAdmin.from('exhibitors').upsert(
        mobiles.map((mobile) => ({
          mobile,
          requirements_locked: locked,
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'mobile' }
      );

      if (sbErr) {
        console.error('[Admin API] Requirements lock upsert error:', sbErr.message);
        return NextResponse.json(
          { error: `Failed to update lock state: ${sbErr.message}` },
          { status: 500 }
        );
      }
    }

    if (all) {
      setAllExhibitorsRequirementsLock(mobiles, locked);
    } else {
      setExhibitorRequirementsLock(mobiles[0], locked);
    }

    return NextResponse.json({ success: true, locked, mobiles });
  } catch (error) {
    console.error('Error updating requirements lock:', error);
    return NextResponse.json({ error: 'Failed to update lock state.' }, { status: 500 });
  }
}
