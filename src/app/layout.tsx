import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LazyMotion, domAnimation } from "framer-motion";
import { SITE_URL, IS_PRODUCTION_SITE, absoluteUrl } from "@/lib/site";
import { EVENT, EVENT_SUMMARY_EN, formatCount } from "@/lib/event-facts";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PageTransition } from "@/components/PageTransition";
import CinematicCursor from "@/components/CinematicCursor";
import GlobalVisuals from "@/components/GlobalVisuals";
import AnimationInjection from "@/components/AnimationInjection";
import MobileBottomCTA from "@/components/MobileBottomCTA";
import FloatingWhatsAppBubble from "@/components/FloatingWhatsAppBubble";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "700"], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"], variable: '--font-playfair', display: 'swap' });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Surat Textile Exhibition 2026 (STE) | India's Premier B2B Sourcing Machine",
  description:
    `Official portal for ${EVENT.name} presented by ${EVENT.presenterName} and supported by ${EVENT.organizerName}. ` +
    `${EVENT.stalls}+ stalls, ${formatCount(EVENT.buyers)}+ verified B2B buyers and ${EVENT.agents}+ sourcing agents at ${EVENT.venueShortEn}.`,
  keywords: [
    "Surat Textile Exhibition",
    "STE 2026",
    "Textile Exhibition Surat",
    "B2B Textile Sourcing",
    "Surat Sarees Wholesale",
    "Lehenga Manufacturers Surat",
    "AKAS Group Exhibition"
  ],
  // Everything below is resolved against this. Keep all paths RELATIVE so the
  // canonical/OG host can never drift away from the deployment again.
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  robots: IS_PRODUCTION_SITE
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    title: "Surat Textile Exhibition 2026 (STE)",
    description: EVENT_SUMMARY_EN,
    url: "/",
    siteName: "Surat Textile Exhibition 2026",
    type: "website",
    locale: "en_IN",
    // og:image comes from app/opengraph-image.tsx — a real 1200x630 PNG.
  },
  twitter: {
    card: "summary_large_image",
    title: "Surat Textile Exhibition 2026 (STE)",
    description: EVENT_SUMMARY_EN,
    // twitter:image comes from app/twitter-image.tsx.
  },
};

import { LanguageProvider } from "@/components/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": EVENT.name,
    "description": EVENT_SUMMARY_EN,
    "startDate": EVENT.startDate,
    "endDate": EVENT.endDate,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "url": absoluteUrl("/"),
    "location": {
      "@type": "Place",
      "name": EVENT.venueName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": EVENT.streetAddress,
        "addressLocality": EVENT.city,
        "addressRegion": EVENT.region,
        "postalCode": EVENT.postalCode,
        "addressCountry": EVENT.country
      }
    },
    "image": [absoluteUrl("/opengraph-image")],
    "organizer": {
      "@type": "Organization",
      "name": EVENT.organizerName,
      "url": absoluteUrl("/")
    }
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>

        <script
          id="ld-json-schema"
          key="ld-json-schema"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      </head>
      <body 
        className="bg-expo-midnight text-expo-warm antialiased selection:bg-expo-gold/30"
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <LazyMotion features={domAnimation}>
            <ScrollProgress />
            <CinematicCursor />
            <GlobalVisuals />
            <AnimationInjection />
            <MobileBottomCTA />
            <FloatingWhatsAppBubble />
            <SmoothScroll>
              <PageTransition>
                {children}
              </PageTransition>
            </SmoothScroll>
          </LazyMotion>
        </LanguageProvider>
      </body>
    </html>
  );
}
