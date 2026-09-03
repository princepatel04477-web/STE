import { NextResponse } from 'next/server';
import db, { saveRemotePassword } from '@/lib/db';
import { findExhibitor, isRegisteredExhibitor, canonicalMobile } from '@/data/registeredExhibitors';
import { createSessionToken, isAdminMobile } from '@/lib/auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, new_password } = body;

    const rawInput = String(mobile ?? '').trim();
    if (!rawInput || !new_password) {
      return NextResponse.json(
        { error: 'User ID / Mobile number / Brand Name and new password are required.' },
        { status: 400 }
      );
    }

    // Resolve exhibitor by mobile, alias, User ID, or Brand Name
    const exhibitor = findExhibitor(rawInput);
    let cleanMobile = exhibitor?.mobile || '';

    if (!cleanMobile) {
      if (/^[0-9+\-\s()]+$/.test(rawInput)) {
        const digits = rawInput.replace(/\D/g, '').slice(-10);
        if (digits.length === 10) {
          cleanMobile = digits;
        }
      } else {
        cleanMobile = rawInput.toUpperCase();
      }
    }

    if (!cleanMobile) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number, User ID, or Brand Name.' },
        { status: 400 }
      );
    }

    // Always fold to canonical mobile
    cleanMobile = canonicalMobile(cleanMobile);

    // Whitelist check
    let isAllowed = isRegisteredExhibitor(cleanMobile);
    if (!isAllowed && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbEx } = await supabaseAdmin
          .from('exhibitors')
          .select('mobile')
          .eq('mobile', cleanMobile)
          .maybeSingle();
        if (sbEx?.mobile) {
          isAllowed = true;
        }
      } catch (sbErr) {
        console.warn('[Reset] Supabase check error:', sbErr);
      }
    }

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'User ID / Mobile number not found in registered exhibitor list. Please check your credentials.' },
        { status: 403 }
      );
    }

    const cleanPass = String(new_password).trim();
    if (cleanPass.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    // Update custom_password in local DB memory & remote persistent store
    try {
      db.prepare('UPDATE exhibitors SET custom_password = ? WHERE mobile = ?').run(cleanPass, cleanMobile);
      await saveRemotePassword(cleanMobile, cleanPass);
    } catch {}

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('exhibitors')
          .upsert({
            mobile: cleanMobile,
            custom_password: cleanPass,
            updated_at: new Date().toISOString()
          }, { onConflict: 'mobile' });
      } catch (sbErr) {
        console.error('[SupabaseDB] Password reset sync error:', sbErr);
      }
    }

    // Create session JWT token for instant login
    const token = await createSessionToken(cleanMobile);
    const isAdmin = isAdminMobile(cleanMobile);

    const response = NextResponse.json({
      success: true,
      mobile: cleanMobile,
      token,
      isAdmin,
      redirectUrl: isAdmin ? '/admin/exhibitors' : '/exhibitor/dashboard',
      message: 'Password updated successfully! Logging you in...'
    });

    const isHttps = request.url.startsWith('https:');

    // Set HTTP-only session cookie
    response.cookies.set('exhibitor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Set HTTP-only custom password backup cookie
    response.cookies.set(`ste_custom_pass_${cleanMobile}`, cleanPass, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    });

    return response;
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during password reset.' },
      { status: 500 }
    );
  }
}
