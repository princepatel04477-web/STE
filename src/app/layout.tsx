import type { Metadata } from "next";
import { Inter, Playfair_Display, Oswald } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });
const oswald = Oswald({ subsets: ["latin"], variable: '--font-oswald' });

export const metadata: Metadata = {
  title: "SURAT | India's Biggest Textile B2B Opportunity",
  description: "The official digital identity of India's largest textile sourcing ecosystem. A hyper-premium B2B exhibition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${oswald.variable}`}>
      <body className="bg-expo-midnight text-expo-warm antialiased selection:bg-expo-gold/30">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
