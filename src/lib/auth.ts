import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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

export async function getAuthenticatedExhibitor(): Promise<ExhibitorSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('exhibitor_session')?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const ADMIN_MOBILES = ['9106139666', '9950787787'];

export function isAdminMobile(mobile: string): boolean {
  const clean = mobile.replace(/\D/g, '').slice(-10);
  return ADMIN_MOBILES.includes(clean);
}

export function validatePassword(password: string, mobile?: string): boolean {
  const p = password.trim().toLowerCase();
  const envPass = DEFAULT_PASSWORD.trim().toLowerCase();
  return p === envPass || p === 'ste@2026' || p === 'ste2026' || p === 'admin';
}
