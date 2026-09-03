import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { fetchRemotePasswords } from '@/lib/db';
import { createSessionToken, validatePassword, isAdminMobile } from '@/lib/auth';
import { findExhibitor, isRegisteredExhibitor, canonicalMobile } from '@/data/registeredExhibitors';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, password } = body;

    const rawInput = String(mobile ?? '').trim();
    if (!rawInput || !password) {
      return NextResponse.json(
        { error: 'User ID / Mobile number / Brand Name and password are required.' },
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

    // Always fold to canonical mobile so alias logins share the master row
    cleanMobile = canonicalMobile(cleanMobile);

    // Whitelist check: Static master list first, then Supabase cloud database fallback
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
        console.warn('[Login] Supabase exhibitor check error:', sbErr);
      }
    }

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'This number or brand is not on the STE 2026 exhibitor list. If you are a confirmed exhibitor, please contact the organisers at +91 91061 39666.' },
        { status: 403 }
      );
    }

    // Ensure exhibitor profile exists in local fallback store
    try {
      const existing = db
        .prepare('SELECT * FROM exhibitors WHERE mobile = ?')
        .get(cleanMobile) as any;

      if (!existing) {
        db.prepare('INSERT INTO exhibitors (mobile) VALUES (?)').run(cleanMobile);
      }
    } catch {}

    // Retrieve custom password from Supabase, local memory, backup cookie, or remote persistent store
    const cookieStore = await cookies();
    const cookiePass = cookieStore.get(`ste_custom_pass_${cleanMobile}`)?.value;
    const remoteMap = await fetchRemotePasswords();
    const remotePass = remoteMap[cleanMobile];

    let supabaseCustomPass: string | null = null;
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbEx } = await supabaseAdmin
          .from('exhibitors')
          .select('custom_password')
          .eq('mobile', cleanMobile)
          .maybeSingle();
        if (sbEx?.custom_password) {
          supabaseCustomPass = sbEx.custom_password;
        }
      } catch {}
    }

    const localExisting = db
      .prepare('SELECT custom_password FROM exhibitors WHERE mobile = ?')
      .get(cleanMobile) as any;

    const customPass = supabaseCustomPass || localExisting?.custom_password || cookiePass || remotePass;
    const inputPass = String(password).trim();
    const isValidPassword = validatePassword(inputPass, customPass, cleanMobile);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: 'Invalid password. You can use the default password "ste@2026", your registered mobile number, or click "Create / Reset Password".'
        },
        { status: 401 }
      );
    }

    // Create session JWT token
    const token = await createSessionToken(cleanMobile);
    const isAdmin = isAdminMobile(cleanMobile);

    const response = NextResponse.json({
      success: true,
      mobile: cleanMobile,
      token,
      isAdmin,
      redirectUrl: isAdmin ? '/admin/exhibitors' : '/exhibitor/dashboard',
      message: 'Login successful'
    });

    // Set HTTP-only cookie (secure over https in production)
    const isHttps = request.url.startsWith('https:');
    response.cookies.set('exhibitor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during login.' },
      { status: 500 }
    );
  }
}
