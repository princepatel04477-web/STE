import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { isAdminMobile } from '@/lib/adminMobiles';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ste-exhibitor-portal-secret-key-2026'
);

const DEFAULT_PASSWORD = process.env.EXHIBITOR_PASSWORD || 'ste@2026';

export interface ExhibitorSession {
  mobile: string;
}

export async function createSessionToken(mobile: string): Promise<string> {
  return new SignJWT({ mobile })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<ExhibitorSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as ExhibitorSession;
  } catch {
    return null;
  }
}

export async function getAuthenticatedExhibitor(request?: Request): Promise<ExhibitorSession | null> {
  // 1. Check Authorization: Bearer <token> header (essential for in-app webviews & private browsing)
  if (request) {
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        const bearerToken = authHeader.slice(7).trim();
        if (bearerToken) {
          const session = await verifySessionToken(bearerToken);
          if (session) return session;
        }
      }
    } catch {}
  }

  // 2. Check HTTP-only cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('exhibitor_session')?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export { ADMIN_MOBILES, isAdminMobile } from '@/lib/adminMobiles';

export function validatePassword(password: string, customPassword?: string, mobile?: string): boolean {
  const p = String(password ?? '').trim();
  if (!p) return false;

  const pLower = p.toLowerCase();
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '').slice(-10) : '';
  const isAdmin = cleanMobile ? isAdminMobile(cleanMobile) : false;

  // 1. Admin shortcut
  if (isAdmin && pLower === 'admin') return true;

  // 2. Default master password (always valid for all exhibitors, even if custom password is set)
  const envPass = DEFAULT_PASSWORD.trim().toLowerCase();
  if (pLower === envPass || pLower === 'ste@2026' || pLower === 'ste2026') {
    return true;
  }

  // 3. Exhibitor's own mobile number (convenience match)
  if (cleanMobile && (p === cleanMobile || p === `+91${cleanMobile}` || p === `91${cleanMobile}`)) {
    return true;
  }

  // 4. Last 4 digits of their mobile number
  if (cleanMobile.length === 10 && p === cleanMobile.slice(-4)) {
    return true;
  }

  // 5. Custom password (if registered/reset)
  if (customPassword && customPassword.trim() !== '') {
    const cp = customPassword.trim();
    if (p === cp || pLower === cp.toLowerCase()) {
      return true;
    }
  }

  return false;
}
