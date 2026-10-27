/**
 * The guest list for Surat Textile Exhibition.
 * All prior 2026 exhibitors data deleted per user instruction.
 */
export interface RegisteredExhibitor {
  mobile: string;
  brandName: string;
  stallSqft: string;
  category?: string;
  market?: string;
  aliases?: string[];
}

export const REGISTERED_EXHIBITORS_LIST: RegisteredExhibitor[] = [];

/** Every number one exhibitor answers to: the sheet's, plus any alias. */
export function numbersFor(exhibitor: RegisteredExhibitor): string[] {
  return [exhibitor.mobile, ...(exhibitor.aliases ?? [])];
}

const key = (identifier: string) => {
  const trimmed = String(identifier ?? "").trim();
  const digits = trimmed.replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? digits : trimmed.toUpperCase();
};

/** Lookup by any of an exhibitor's numbers, or by portal ID. */
const BY_NUMBER: Map<string, RegisteredExhibitor> = new Map(
  REGISTERED_EXHIBITORS_LIST.flatMap((e) =>
    numbersFor(e).map((n) => [key(n), e] as [string, RegisteredExhibitor])
  )
);

export function findExhibitorByMobile(identifier: string): RegisteredExhibitor | undefined {
  if (!identifier) return undefined;
  return BY_NUMBER.get(key(identifier));
}

export function findExhibitor(identifier: string | null | undefined): RegisteredExhibitor | undefined {
  if (!identifier) return undefined;
  const raw = String(identifier).trim();
  if (!raw) return undefined;

  const byMobile = findExhibitorByMobile(raw);
  if (byMobile) return byMobile;

  const norm = raw.toLowerCase();
  const exactBrand = REGISTERED_EXHIBITORS_LIST.find(
    (e) => e.brandName.toLowerCase().trim() === norm
  );
  if (exactBrand) return exactBrand;

  if (norm.length >= 3) {
    const partialBrand = REGISTERED_EXHIBITORS_LIST.find((e) => {
      const b = e.brandName.toLowerCase();
      return b.includes(norm) || norm.includes(b);
    });
    if (partialBrand) return partialBrand;
  }

  return undefined;
}

export function canonicalMobile(identifier: string | null | undefined): string {
  return findExhibitor(identifier)?.mobile ?? String(identifier ?? "");
}

/** The organiser logins, which are not exhibitors. */
export const ORGANISER_MOBILES = ["9106139666", "9950787787", "9712327649"];

/** The exhibitors alone. */
export const EXHIBITORS_ONLY: RegisteredExhibitor[] = [];

export function isRegisteredExhibitor(identifier: string | null | undefined): boolean {
  return findExhibitor(identifier) !== undefined;
}
