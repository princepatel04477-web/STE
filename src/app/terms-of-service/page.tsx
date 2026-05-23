"use client";

import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#050505] text-expo-warm selection:bg-expo-gold/30 antialiased relative overflow-hidden py-24 sm:py-32">
      {/* Aesthetic Backplates */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing right-[20%] top-[10%] w-[35vw] h-[35vw]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[3px] text-expo-gold hover:text-white transition-colors duration-300 mb-12 group"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span> Back to Exhibition Home
        </Link>

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <span className="text-[10px] font-bold tracking-[6px] text-expo-gold uppercase mb-3 block">
            STE 2026 • COMPLIANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-white leading-none">
            Terms of <span className="text-metallic font-light italic">Service</span>
          </h1>
          <p className="font-sans text-xs text-expo-warm/40 mt-4">
            Last Updated: May 23, 2026
          </p>
        </div>

        {/* Content */}
        <div className="font-sans text-sm sm:text-base text-expo-warm/75 leading-relaxed space-y-8">
          <p>
            Welcome to the official portal of the Surat Textile Exhibition (STE 2026). By accessing our website, downloading our technical exhibition blueprints, downloading brochures, or submitting stall booking registrations, you agree to comply with and be bound by the following Terms of Service. Please review them carefully.
          </p>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              1. B2B Eligibility & Stall Applications
            </h2>
            <p>
              STE 2026 is an exclusive commercial trade-only B2B exhibition. General public registrations are not eligible for commercial stall purchases:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>Exhibitors must provide valid commercial corporate credentials, including an active and legally valid GSTIN.</li>
              <li>Stall space applications submitted via this website represent preliminary bookings and are subject to final layout review, space availability, and organizer approval.</li>
              <li>The organizers (AKAS Group) reserve absolute discretion to reallocate stall numbers, zones, or adjust final floor concourses in line with safety regulations and zoning compliance.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              2. Intellectual Property and Technical Blueprints
            </h2>
            <p>
              All materials published on this website, including but not limited to technical SVG floor plans, high-fidelity promotional videos, official brochures, logos, branding, and copy structures are the absolute intellectual property of AKAS Group. Any unauthorized redistribution, hotlinking, or commercial reproduction of these digital assets without prior written consent is strictly prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              3. Commercial Booking Confirmations & Cancellation
            </h2>
            <p>
              Initial registration on this portal does not guarantee stall space. Secure reservation is only completed upon the verification of business details, formal slot allocation by an STE manager, and execution of the final commercial contract alongside necessary down payments:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-expo-warm/70">
              <li>Stall cancellation, fee structures, refunds, and transfer rules are governed exclusively by the primary physical contract signed between the exhibitor and AKAS Group.</li>
              <li>Organizers shall not be held liable for any loss, delay, or event cancellations caused by Force Majeure circumstances including government regulations, municipal restrictions, natural disasters, or strikes.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl text-white tracking-wide border-l-2 border-expo-gold pl-4">
              4. Governing Law and Dispute Resolution
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes, claims, or controversies arising out of or in connection with the digital services, registrations, or events organized on this platform shall be subject to the exclusive jurisdiction of the competent courts in Surat, Gujarat.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
