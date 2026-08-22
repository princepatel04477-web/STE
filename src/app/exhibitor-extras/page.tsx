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
    <div className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto border-b border-neutral-800/80 pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <span>Official Rental Rate Card</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight leading-tight">
            Exhibitor Extras & Rental Rates
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-sans">
            Transparent per-day pricing for additional booth furniture, display fixtures, audio-visual gear, and electrical connections for STE 2026 Surat.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/downloads/STE_Extra_Items_Rate_Card_and_Order_Form.docx"
              download="STE_Extra_Items_Official_Catalogue_2026.docx"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Official Docs (.docx)</span>
            </a>

            <a
              href="#estimate-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold text-xs uppercase tracking-wider transition-all"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Generate Tax Bill / Estimate</span>
            </a>
          </div>
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
