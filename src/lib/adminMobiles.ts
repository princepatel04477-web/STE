/**
 * The numbers that run the event.
 *
 * Kept apart from lib/auth so the browser can import it too - auth pulls in
 * next/headers and is server-only. This list only decides what an admin is
 * shown; every admin route still checks the session on the server.
 *
 * Being here is not enough to get in. The portal is closed to any number that
 * is not on the guest list, and login checks that first, so an admin number
 * must also have a row in registeredExhibitors.ts and be named in its
 * ORGANISER_MOBILES - otherwise it is turned away at the login screen, or
 * counted as an exhibitor once it is let through.
 */
export const ADMIN_MOBILES = ['9106139666', '9950787787', '9712327649'];

export function isAdminMobile(mobile: string | null | undefined): boolean {
  const clean = String(mobile ?? '').replace(/\D/g, '').slice(-10);
  return clean.length === 10 && ADMIN_MOBILES.includes(clean);
}
