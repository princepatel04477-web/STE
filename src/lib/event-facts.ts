/**
 * Single source of truth for every factual number, date and place on the site.
 *
 * Do NOT hardcode these anywhere else. The site previously shipped "8000+ buyers"
 * in the hero and "80,000+ buyers" in the metadata/JSON-LD simultaneously; this
 * module exists so that can never happen again.
 */
export const EVENT = {
  name: "Surat Textile Exhibition (STE) 2026",
  shortName: "STE 2026",

  // Headline figures
  stalls: 650,
  buyers: 8_000,
  agents: 950,
  sourcingMarketSizeTrillionINR: 15.5,

  // Schedule (IST)
  startDate: "2026-09-12T10:00:00+05:30",
  endDate: "2026-09-13T18:00:00+05:30",
  dateLabelEn: "September 12-13, 2026",
  dateLabelHi: "12-13 सितंबर, 2026",

  // Venue
  venueName: "Surat International Exhibition and Convention Centre (SIECC)",
  venueShortEn: "SIECC, Sarsana Dome, Surat",
  venueShortHi: "SIECC, सरसाना डोम, सूरत",
  streetAddress: "Althan-Sarsana Road, Sarsana",
  city: "Surat",
  region: "Gujarat",
  postalCode: "395007",
  country: "IN",

  // Attribution
  // STE-11: Use these fields everywhere — homepage credit line, meta description,
  //         legal pages, and JSON-LD organizer. Do NOT hardcode alternate phrasings.
  organizerName: "AKAS Group",        // Legal / formal name — for schema.org, invoices
  organizerLegalName: "AKAS Group",   // Same right now; update if entity name changes
  presenterName: "STE",
  // Homepage credit line: "Organized by STE • Supported by AKAS Group"
  organizerCredit: "STE • Supported By AKAS Group",

  // Contact
  email: "surattextileexhibition@gmail.com",

  // STE-12: Canonical venue URL — use this for "Get Directions" links
  venueGoogleMapsUrl: "https://maps.google.com/?q=Surat+International+Exhibition+Convention+Centre+SIECC+Sarsana",
} as const;

/** "8,000" — Indian-agnostic grouping, stable between server and client. */
export const formatCount = (n: number) => n.toLocaleString("en-US");

/** Reusable one-line summary used in metadata, OG and JSON-LD. */
export const EVENT_SUMMARY_EN =
  `India's premier B2B textile sourcing exhibition. ${EVENT.stalls}+ stalls, ` +
  `${formatCount(EVENT.buyers)}+ verified buyers and ${EVENT.agents}+ sourcing agents at ` +
  `${EVENT.venueShortEn}, ${EVENT.dateLabelEn}.`;
