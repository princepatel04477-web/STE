import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LazyMotion, domAnimation } from "framer-motion";
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
  description: "Official portal for Surat Textile Exhibition 2026 (STE) organized by AKAS Group. Showcase for 650+ exhibitors & 8,000+ B2B customers at SIECC, Surat.",
  keywords: [
    "Surat Textile Exhibition", 
    "STE 2026", 
    "Textile Exhibition Surat", 
    "B2B Textile Sourcing", 
    "Surat Sarees Wholesale", 
    "Lehenga Manufacturers Surat", 
    "AKAS Group Exhibition"
  ],
  metadataBase: new URL("https://stex2.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Surat Textile Exhibition 2026 (STE)",
    description:
      "India's premier B2B textile sourcing exhibition with 650+ exhibitors and 8,000+ B2B customers at SIECC, Surat.",
    url: "/",
    siteName: "Surat Textile Exhibition 2026",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/assets/logo_STE.webp",
        width: 1200,
        height: 630,
        alt: "Surat Textile Exhibition 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Surat Textile Exhibition 2026 (STE)",
    description:
      "India's premier B2B textile sourcing exhibition with 650+ exhibitors and 8,000+ B2B customers at SIECC, Surat.",
    images: ["/assets/logo_STE.webp"],
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
    "name": "Surat Textile Exhibition (STE) 2026",
    "description": "India's premier B2B textile sourcing exhibition showcasing heritage drapes, sarees, premium lehengas, kurtis, and contemporary wedding wear. Explore 650+ exhibitors and 8,000+ B2B customers from across the world.",
    "startDate": "2026-09-12T10:00:00+05:30",
    "endDate": "2026-09-13T18:00:00+05:30",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Surat International Exhibition and Convention Centre (SIECC)",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Althan-Sarsana Road, Sarsana",
        "addressLocality": "Surat",
        "addressRegion": "Gujarat",
        "postalCode": "395007",
        "addressCountry": "IN"
      }
    },
    "image": [
      "https://stex2.vercel.app/assets/logo_STE.webp"
    ],
    "organizer": {
      "@type": "Organization",
      "name": "AKAS Group",
      "url": "https://stex2.vercel.app"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://stex2.vercel.app/#final-cta",
      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": "2026-05-23T00:00:00+05:30"
    }
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Preload the video so boomerang capture starts faster */}
        <link 
          rel="preload" 
          href="/assets/video/hero.mp4"
          as="fetch"
          crossOrigin="anonymous"
        />

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
