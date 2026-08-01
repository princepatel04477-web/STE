import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { createSessionToken, validatePassword } from '@/lib/auth';

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

    // Verify password
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password. Please enter the official exhibitor password.' },
        { status: 401 }
      );
    }

    // Check whitelist if whitelist table contains entries
    const allowedCount = (
      db.prepare('SELECT COUNT(*) as count FROM allowed_exhibitors').get() as { count: number }
    ).count;

    if (allowedCount > 0) {
      const isAllowed = db
        .prepare('SELECT mobile FROM allowed_exhibitors WHERE mobile = ?')
        .get(cleanMobile);
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Mobile number not authorized in exhibitor list. Please contact support.' },
          { status: 403 }
        );
      }
    }

    // Ensure exhibitor profile exists
    const existing = db
      .prepare('SELECT * FROM exhibitors WHERE mobile = ?')
      .get(cleanMobile);

    if (!existing) {
      db.prepare('INSERT INTO exhibitors (mobile) VALUES (?)').run(cleanMobile);
    }

    // Create session JWT token
    const token = await createSessionToken(cleanMobile);

    const response = NextResponse.json({
      success: true,
      mobile: cleanMobile,
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
