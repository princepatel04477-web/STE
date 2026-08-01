import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ste-exhibitor-portal-secret-key-2026'
);

const DEFAULT_PASSWORD = process.env.EXHIBITOR_PASSWORD || 'STE2026';

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

export function validatePassword(password: string): boolean {
  return password.trim() === DEFAULT_PASSWORD.trim();
}
