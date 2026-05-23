"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";

const BUYER_DEMOGRAPHICS = [
  "Retailers",
  "Wholesalers",
  "Distributors",
  "Boutique Owners",
  "Chain Stores",
  "Resellers",
  "Fashion Buyers"
];

const BUSINESS_BENEFITS = [
  { title: "Direct Manufacturer Access", desc: "Bypass intermediates and connect directly with Surat's weaving mills." },
  { title: "Bulk Sourcing Opportunities", desc: "Scale your order capacity with high-speed manufacturing setups." },
  { title: "PAN India Networking", desc: "Collaborate with trade leaders and distributors from all 28 states." },
  { title: "Festival Season Sourcing", desc: "Secure trending inventory ahead of Durga Puja, Diwali, and Weddings." },
  { title: "New Design Discovery", desc: "Access exclusive, first-reveal collections before they hit open markets." },
  { title: "Wholesale Pricing Advantage", desc: "Maximize your commercial margins with direct mill-rate structures." }
];

export default function FutureOfCommerce() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const panels = containerRef.current?.querySelectorAll(".commerce-panel");
    if (!panels) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(Array.from(panels) as unknown as HTMLElement[], {
              opacity: [0, 1],
              scale: [0.97, 1],
              translateY: [25, 0],
              duration: 800,
              delay: (el, i) => i * 140,
              ease: "outExpo",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      id="future-of-commerce"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-[#050505] flex flex-col justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing left-[10%] top-[10%] w-[40vw] h-[40vw]" />
      <div className="spotlight-glowing right-[5%] bottom-[5%] w-[45vw] h-[45vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            06 • WHOLESALE SOURCING PORTAL
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            Connecting Sourcing and <br />
            <span className="text-metallic font-light italic">B2B Business Benefits</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Surat Textile Exhibition provides the ultimate commerce ecosystem. Connect directly with India&apos;s largest manufacturers, optimize your inventory margins, and establish direct-to-mill trade channels.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Block: Business Benefits */}
          <div className="lg:col-span-7 flex flex-col justify-between border-glow-card p-8 sm:p-12 min-h-[500px]">
            <div>
              <span className="font-sans text-[10px] tracking-[4px] text-expo-gold uppercase font-bold block mb-4">
                COMMERCIAL ADVANTAGES
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide mb-6">
                Premium Business Benefits
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {BUSINESS_BENEFITS.map((benefit, i) => (
                  <div key={i} className="commerce-panel opacity-0 flex flex-col">
                    <span className="font-display text-sm text-white font-bold tracking-[1px] mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-expo-gold animate-pulse" />
                      {benefit.title}
                    </span>
                    <p className="font-sans text-xs text-expo-warm/50 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Connection Widget */}
            <div className="bg-black/60 border border-white/10 rounded-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 relative overflow-hidden">
              <div className="absolute right-[-5%] bottom-[-5%] w-[120px] h-[120px] bg-expo-gold/5 blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#D6A066]/30 bg-[#D6A066]/10 flex items-center justify-center font-display text-xs text-expo-gold font-bold">
                  STE
                </div>
                <div>
                  <span className="font-sans text-[9px] tracking-[2.5px] text-expo-warm/40 uppercase block mb-1">
                    ACTIVE DIRECT SOURCING
                  </span>
                  <span className="font-sans text-xs text-white font-semibold">
                    Direct-to-Mill Bulk Pricings Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#D6A066]/15 border border-[#D6A066]/20 px-3 py-1 rounded-sm">
                <span className="font-sans text-[9px] tracking-[2px] text-expo-gold font-bold uppercase">
                  650+ MANUFACTURERS LIVE
                </span>
              </div>
            </div>

          </div>

          {/* Right Block: Demographics & Imagery */}
          <div className="lg:col-span-5 flex flex-col gap-8 justify-between">
            
            {/* Visual 1: Demographics with b2b-networking1.png */}
            <div
              className="commerce-panel opacity-0 translate-y-[25px] relative w-full h-[240px] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-end"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.75), rgba(5, 5, 5, 0.75)), url('/assets/images/b2b-networking1.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <div className="relative z-10">
                <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase block mb-2">
                  TARGET DEMOGRAPHICS
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium mb-3">Verified Buyer Segments</h3>
                <div className="flex flex-wrap gap-2">
                  {BUYER_DEMOGRAPHICS.map((buyer, idx) => (
                    <span
                      key={idx}
                      className="font-sans text-[9px] tracking-wider text-expo-gold bg-expo-midnight/75 border border-expo-gold/20 px-2.5 py-1 rounded font-semibold uppercase"
                    >
                      {buyer}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual 2: B2B Networking with b2b-networking3.png */}
            <div
              className="commerce-panel opacity-0 translate-y-[25px] relative w-full h-[240px] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-end"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.7), rgba(5, 5, 5, 0.7)), url('/assets/images/b2b-networking3.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <div className="relative z-10">
                <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase block mb-2">
                  BUSINESS NETWORKING
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium">Global Trade Matching</h3>
                <p className="font-sans text-[10px] text-expo-warm/50 mt-1 leading-relaxed">
                  Establish critical industry networks with primary distributors and retail boutique owners nationwide.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
