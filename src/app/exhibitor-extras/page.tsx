import React from "react";
import Metadata from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RateTable from "@/components/extras/RateTable";
import EstimateBuilder from "@/components/extras/EstimateBuilder";
import Disclaimers from "@/components/extras/Disclaimers";
import { EXTRAS_RATES } from "@/data/extras-rates";
import { Download, FileText } from "lucide-react";

export const metadata = {
  title: "Exhibitor Extras & Rentals — Rates | STE 2026 Surat",
  description: "Official rate card for STE 2026 Surat exhibitor extras: furniture, display, AV, and electrical rentals. Per-day INR rates, 18% GST extra.",
  alternates: {
    canonical: "https://www.stesurat.com/exhibitor-extras",
  },
  openGraph: {
    title: "Exhibitor Extras & Rentals — Rates | STE 2026 Surat",
    description: "Official rate card for STE 2026 Surat exhibitor extras: furniture, display, AV, and electrical rentals.",
    url: "https://www.stesurat.com/exhibitor-extras",
    siteName: "STE 2026 Surat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exhibitor Extras & Rentals — Rates | STE 2026 Surat",
    description: "Official rate card for STE 2026 Surat exhibitor extras: furniture, display, AV, and electrical rentals.",
  },
};

export default function ExhibitorExtrasPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500/20 selection:text-amber-900">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto border-b border-slate-200 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest shadow-xs">
            <span>Official Rental Rate Card</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 font-serif tracking-tight leading-tight">
            Exhibitor Extras & Rental Rates
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans font-medium">
            Transparent per-day pricing for additional booth furniture, display fixtures, audio-visual gear, and electrical connections for STE 2026 Surat.
          </p>
        </div>

        {/* Server Rendered Rate Table */}
        <section aria-label="Rate Table Catalog">
          <RateTable items={EXTRAS_RATES} />
        </section>

        {/* Interactive Estimate Calculator */}
        <section aria-label="Estimate Calculator">
          <EstimateBuilder />
        </section>

        {/* Mandatory Disclaimers */}
        <section aria-label="Important Disclaimers">
          <Disclaimers />
        </section>
      </main>

      <Footer />
    </div>
  );
}
