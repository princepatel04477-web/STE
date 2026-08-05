import { NextResponse } from 'next/server';
import db, { REGISTERED_EXHIBITOR_MOBILES, saveRemotePassword } from '@/lib/db';
import { createSessionToken, isAdminMobile } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, new_password } = body;

    if (!mobile || !new_password) {
      return NextResponse.json(
        { error: 'Mobile number and new password are required.' },
        { status: 400 }
      );
    }

    const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // Verify mobile is in registered whitelist
    if (!REGISTERED_EXHIBITOR_MOBILES.includes(cleanMobile)) {
      return NextResponse.json(
        { error: 'Mobile number not found in registered exhibitor list. Please check your number.' },
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
    db.prepare('UPDATE exhibitors SET custom_password = ? WHERE mobile = ?').run(cleanPass, cleanMobile);
    await saveRemotePassword(cleanMobile, cleanPass);

    // Create session JWT token for instant login
    const token = await createSessionToken(cleanMobile);
    const isAdmin = isAdminMobile(cleanMobile);

    const response = NextResponse.json({
      success: true,
      mobile: cleanMobile,
      isAdmin,
      redirectUrl: isAdmin ? '/admin/exhibitors' : '/exhibitor/dashboard',
      message: 'Password updated successfully! Logging you in...'
    });

    // Set HTTP-only session cookie
    response.cookies.set('exhibitor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    // Set HTTP-only custom password backup cookie
    response.cookies.set(`ste_custom_pass_${cleanMobile}`, cleanPass, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
