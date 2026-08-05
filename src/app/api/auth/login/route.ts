import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db, { fetchRemotePasswords } from '@/lib/db';
import { createSessionToken, validatePassword, isAdminMobile } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json(
        { error: 'Mobile number and password are required.' },
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

    // Ensure exhibitor profile exists
    const existing = db
      .prepare('SELECT * FROM exhibitors WHERE mobile = ?')
      .get(cleanMobile) as any;

    if (!existing) {
      db.prepare('INSERT INTO exhibitors (mobile) VALUES (?)').run(cleanMobile);
    }

    // Retrieve custom password from local memory, backup cookie, or remote persistent store
    const cookieStore = await cookies();
    const cookiePass = cookieStore.get(`ste_custom_pass_${cleanMobile}`)?.value;
    const remoteMap = await fetchRemotePasswords();
    const remotePass = remoteMap[cleanMobile];

    const customPass = existing?.custom_password || cookiePass || remotePass;
    const inputPass = String(password).trim();
    const isValidPassword = validatePassword(inputPass, customPass);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          error: customPass
            ? 'Invalid password. Please enter your custom password.'
            : 'Invalid password. Please enter your custom password or default password (ste@2026).'
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
      isAdmin,
      redirectUrl: isAdmin ? '/admin/exhibitors' : '/exhibitor/dashboard',
      message: 'Login successful'
    });

    // Set HTTP-only cookie
    response.cookies.set('exhibitor_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
