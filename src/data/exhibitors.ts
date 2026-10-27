export interface Exhibitor {
  id: string;
  companyName: string;
  slug: string;
  categories: string[];
  stallNumber: string;
  hall: string;
  city: string;
  description?: string;
  logo?: string;
  website?: string;
  isConfirmed: boolean;
}

export const EXHIBITORS_DATA: Exhibitor[] = [];

export function getConfirmedExhibitors(): Exhibitor[] {
  return EXHIBITORS_DATA.filter((e) => e.isConfirmed);
}
