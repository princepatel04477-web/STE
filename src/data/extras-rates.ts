import { getProductImage } from "./productImages";

export type RateBasis = "per-day";

export type ExtraCategory = "furniture" | "display-av" | "electrical";

export interface ExtraItem {
  id: string;
  code: string;
  name: string;
  spec: string | null;
  rateInr: number;      // exclusive of GST
  rateUsd?: number;
  basis: RateBasis;
  category: ExtraCategory;
  image: string | null; // reference product image URL
}

export const GST_RATE = 0.18;

export const EXTRAS_RATES: ExtraItem[] = [
  { id: "desk-table",        code: "DP 01", name: "System Table / Desk Table", spec: "1m × 0.5m × 0.75m ht", rateInr: 600,  rateUsd: 7,  basis: "per-day", category: "furniture",  image: getProductImage("desk-table") },
  { id: "wooden-table",      code: "DP 02", name: "Wooden Table with cover",   spec: "5' × 2.5'",             rateInr: 400,  rateUsd: 5,  basis: "per-day", category: "furniture",  image: getProductImage("wooden-table") },
  { id: "glass-round-table", code: "DP 03", name: "Glass Round Table",         spec: "2'8\" Ø & 2'6\" ht",    rateInr: 1400, rateUsd: 15, basis: "per-day", category: "furniture",  image: getProductImage("glass-round-table") },
  { id: "white-chair",       code: "DP 04", name: "Exhibition Chair",          spec: "Standard exhibition seating", rateInr: 700, rateUsd: 8, basis: "per-day", category: "furniture",  image: getProductImage("white-chair") },
  { id: "cushioned-chair",   code: "DP 05", name: "Stake Chair",               spec: "Cushioned conference chair", rateInr: 700, rateUsd: 8, basis: "per-day", category: "furniture", image: getProductImage("cushioned-chair") },
  { id: "apple-chair",       code: "DP 06", name: "Apple Chair",               spec: "Modern designer seating", rateInr: 500,  rateUsd: 6,  basis: "per-day", category: "furniture",  image: getProductImage("apple-chair") },
  { id: "sofa-single",       code: "DP 08", name: "Sofa — Single Seat",        spec: "Plush armchair", rateInr: 3000, rateUsd: 33, basis: "per-day", category: "furniture",  image: getProductImage("sofa-single") },
  { id: "sofa-double",       code: "DP 09", name: "2 Seater Sofa",             spec: "2-seater luxury lounge sofa", rateInr: 5000, rateUsd: 55, basis: "per-day", category: "furniture",  image: getProductImage("sofa-double") },
  { id: "sofa-three",        code: "DP 10", name: "3 Seater Sofa",             spec: "3-seater spacious lounge sofa", rateInr: 6000, rateUsd: 66, basis: "per-day", category: "furniture",  image: getProductImage("sofa-three") },
  { id: "glass-centre-table",code: "DP 11", name: "Rectangle Tipoi",           spec: "Lounge glass centre table", rateInr: 1200, rateUsd: 13, basis: "per-day", category: "furniture",  image: getProductImage("glass-centre-table") },
  { id: "counter-without-lock", code: "DP 12", name: "Display Glass Counter (Without Lock)", spec: "37.50\" × 18\" × 39\" ht (no light)", rateInr: 2500, rateUsd: 28, basis: "per-day", category: "display-av", image: getProductImage("counter-without-lock") },
  { id: "counter-with-lock", code: "DP 13", name: "Display Glass Counter (With Lock)", spec: "37.50\" × 18\" × 39\" ht (no light)", rateInr: 3000, rateUsd: 33, basis: "per-day", category: "display-av", image: getProductImage("counter-with-lock") },
  { id: "tall-showcase-without-lock", code: "DP 14", name: "Tall Showcase (Without Lock)", spec: "37.50\" × 18\" × 84\" ht (no light)", rateInr: 4000, rateUsd: 44, basis: "per-day", category: "display-av", image: getProductImage("tall-showcase-without-lock") },
  { id: "tall-showcase-with-lock", code: "DP 14A", name: "Tall Showcase (With Lock)", spec: "37.50\" × 18\" × 84\" ht (no light)", rateInr: 5000, rateUsd: 55, basis: "per-day", category: "display-av", image: getProductImage("tall-showcase-with-lock") },
  { id: "brochure-rack",     code: "DP 15", name: "Brochure Stand",            spec: "Folding catalogue display stand", rateInr: 1500, rateUsd: 16, basis: "per-day", category: "display-av", image: getProductImage("brochure-rack") },
  { id: "pedestal-fan",      code: "DP 20", name: "Pedestrian Fan",            spec: "High power pedestal fan", rateInr: 1500, rateUsd: 16, basis: "per-day", category: "electrical", image: getProductImage("pedestal-fan") },
  { id: "glass-shelf",       code: "DP 21", name: "Glass Shelf",               spec: "1m × 10\"", rateInr: 600,  rateUsd: 6,  basis: "per-day", category: "display-av", image: getProductImage("glass-shelf") },
  { id: "wooden-shelf",      code: "DP 22", name: "Wooden Shelf",              spec: "1m × 0.25m wooden shelf", rateInr: 500,  rateUsd: 5,  basis: "per-day", category: "display-av", image: getProductImage("wooden-shelf") },
  { id: "plug-point",        code: "DP 24", name: "Plug Point",                spec: "5 / 15 amp single phase socket", rateInr: 250, rateUsd: 3,  basis: "per-day", category: "electrical", image: getProductImage("plug-point") },
  { id: "metal-halide",      code: "DP 25", name: "Metal Halide Light",        spec: "Spotlight / 50W LED fixture", rateInr: 1500, rateUsd: 13, basis: "per-day", category: "electrical", image: getProductImage("metal-halide") },
  { id: "plasma-32",         code: "DP 26", name: "32\" Plasma Screen with Stand", spec: "32-inch display with floor stand", rateInr: 3500, rateUsd: 27, basis: "per-day", category: "display-av", image: getProductImage("plasma-32") },
  { id: "garment-stand",     code: "DP 27", name: "Garment Stand (Single Rod)", spec: "4.5'w × 5.5'ht", rateInr: 900,  rateUsd: 7,  basis: "per-day", category: "display-av", image: getProductImage("garment-stand") },
  { id: "garment-stand-double", code: "DP 27A", name: "Garment Stand (Double Rod)", spec: "4.5'w × 5.5'ht", rateInr: 900, rateUsd: 7, basis: "per-day", category: "display-av", image: getProductImage("garment-stand-double") },
  { id: "mannequin",         code: "DP 28", name: "Mannequin",                 spec: "Full-body garment display mannequin", rateInr: 1500, rateUsd: 16, basis: "per-day", category: "display-av", image: getProductImage("mannequin") },
  { id: "receptionist",      code: "DP 29", name: "Receptionist",              spec: "Professional stall receptionist / hostess (per day)", rateInr: 1000, rateUsd: 12, basis: "per-day", category: "display-av", image: getProductImage("receptionist") },
  { id: "rack",              code: "DP 30", name: "Rack",                      spec: "5-tier aluminium display rack", rateInr: 1500, rateUsd: 16, basis: "per-day", category: "display-av", image: getProductImage("rack") },
];

export const CATEGORY_LABELS: Record<ExtraCategory, string> = {
  furniture: "Furniture & Seating",
  "display-av": "Display & AV",
  electrical: "Electrical & Utilities",
};

export const formatInr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
