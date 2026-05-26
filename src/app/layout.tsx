import type { Metadata } from "next";
import { Inter, Playfair_Display, Oswald } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const oswald = Oswald({ subsets: ["latin"], variable: '--font-oswald' });

export const metadata: Metadata = {
  title: "Surat Textile Exhibition 2026 (STE) | India's Premier B2B Sourcing Machine",
  description: "Official portal for Surat Textile Exhibition 2026 (STE) organized by AKAS Group. Showcase for 650+ exhibitors & 80,000+ B2B buyers at SIECC, Surat.",
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
      "India's premier B2B textile sourcing exhibition with 650+ exhibitors and 80,000+ buyers at SIECC, Surat.",
    url: "/",
    siteName: "Surat Textile Exhibition 2026",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/logo_STE.png",
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
      "India's premier B2B textile sourcing exhibition with 650+ exhibitors and 80,000+ buyers at SIECC, Surat.",
    images: ["/logo_STE.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Surat Textile Exhibition (STE) 2026",
    "description": "India's premier B2B textile sourcing exhibition showcasing heritage drapes, sarees, premium lehengas, kurtis, and contemporary wedding wear. Explore 650+ exhibitors and 80,000+ buyers from across the world.",
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
      "https://stex2.vercel.app/logo_STE.png"
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${oswald.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      </head>
      <body className="bg-expo-midnight text-expo-warm antialiased selection:bg-expo-gold/30">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
