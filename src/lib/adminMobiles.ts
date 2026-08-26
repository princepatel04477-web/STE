/**
 * The two numbers that run the event.
 *
 * Kept apart from lib/auth so the browser can import it too - auth pulls in
 * next/headers and is server-only. This list only decides what an admin is
 * shown; every admin route still checks the session on the server.
 */
export const ADMIN_MOBILES = ['9106139666', '9950787787'];

export function isAdminMobile(mobile: string | null | undefined): boolean {
  const clean = String(mobile ?? '').replace(/\D/g, '').slice(-10);
  return clean.length === 10 && ADMIN_MOBILES.includes(clean);
}
