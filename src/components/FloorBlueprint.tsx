"use client";

import { useEffect, useRef, useState } from "react";
import { waapi } from "animejs";

export default function FloorBlueprint() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = containerRef.current?.querySelector(".blueprint-animate");
              if (element) {
                waapi.animate(element as HTMLElement, {
                  opacity: [0, 1],
                  scale: [0.98, 1],
                  translateY: [30, 0],
                  duration: 1000,
                  ease: "outExpo"
                });
              }
              observer.disconnect();
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const zones = {
    GOLD: {
      title: "Premium Gold Zone (Pavilion A)",
      details: "High traffic central area reserved for major Surat manufacturers. Direct visibility from front entrance.",
      stalls: "Stalls A1 - A40",
      dimensions: "9m² to 36m² slots",
      availability: "7 Stalls Remaining"
    },
    VIP: {
      title: "VIP Lounge & Platinum Corridor",
      details: "Premium corner blocks designed for high-profile labels. Adjacent to the B2B VIP lounge.",
      stalls: "Stalls P1 - P15",
      dimensions: "36m² to 72m² premium spaces",
      availability: "Only 2 Slots Left"
    },
    GENERAL: {
      title: "General Exhibition Hall (Pavilion B)",
      details: "Optimal for emerging brands, ethnic weavers, value-added fabric processors and accessory designers.",
      stalls: "Stalls B1 - B120",
      dimensions: "9m² to 18m² spaces",
      availability: "15 Stalls Remaining"
    }
  };

  return (
    <section
      ref={containerRef}
      id="floor-plan"
      className="relative w-full py-24 sm:py-32 bg-[#070707] overflow-hidden border-t border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing left-[-10%] top-[30%] w-[45vw] h-[45vw]" />
      <div className="spotlight-glowing right-[-10%] bottom-[10%] w-[50vw] h-[50vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            04 • INTERACTIVE EXHIBITION FLOOR PLAN
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            Technical Floor Plan & <br />
            <span className="text-metallic font-light italic">Pavilion Space</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Analyze the premium layout of SIECC Sarsana Dome, Surat. Select zones to inspect available commercial stalls, entry corridors, and strategic buyer pathways.
          </p>
        </div>

        {/* Blueprint Grid Dashboard */}
        <div className="blueprint-animate opacity-0 translate-y-[30px] grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-stretch">
          
          {/* Floor Plan Vector Map */}
          <div className="lg:col-span-7 border-glow-card p-6 bg-black/40 backdrop-blur-md flex flex-col justify-between rounded-xl relative">
            <span className="absolute top-4 left-4 font-sans text-[9px] tracking-[2.5px] text-expo-gold uppercase bg-black/60 px-3 py-1 border border-white/10 rounded-sm">
              SIECC SARSANA DOME • GROUND LEVEL MAP
            </span>

            {/* Interactive SVG Floor Map */}
            <div className="w-full aspect-[4/3] bg-black/60 rounded border border-white/5 my-8 flex items-center justify-center p-4">
              <svg viewBox="0 0 800 600" className="w-full h-full font-sans select-none">
                {/* Outer Bound */}
                <rect x="10" y="10" width="780" height="580" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Entry & Exit Gates */}
                <g fill="none" stroke="#D6A066" strokeWidth="2">
                  {/* Gate 1 */}
                  <line x1="10" y1="260" x2="10" y2="340" strokeWidth="4" />
                  <text x="25" y="305" fill="#D6A066" fontSize="11" fontWeight="bold" letterSpacing="1">ENTRY GATE 1</text>
                  
                  {/* Gate 2 */}
                  <line x1="790" y1="260" x2="790" y2="340" strokeWidth="4" />
                  <text x="690" y="305" fill="#D6A066" fontSize="11" fontWeight="bold" letterSpacing="1">EXIT GATE 2</text>
                </g>

                {/* VIP Zone (Platinum Corridor) - top row */}
                <g
                  onClick={() => setActiveZone("VIP")}
                  className="cursor-pointer group"
                >
                  <rect
                    x="50"
                    y="50"
                    width="700"
                    height="120"
                    fill={activeZone === "VIP" ? "rgba(214,160,102,0.18)" : "rgba(214,160,102,0.03)"}
                    stroke="#D6A066"
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:fill-expo-gold/10"
                  />
                  {/* Stall lines inside VIP */}
                  <line x1="190" y1="50" x2="190" y2="170" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <line x1="330" y1="50" x2="330" y2="170" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <line x1="470" y1="50" x2="470" y2="170" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <line x1="610" y1="50" x2="610" y2="170" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <text x="400" y="115" fill="#ffffff" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="2">PLATINUM VIP CORRIDOR</text>
                  <text x="400" y="138" fill="#D6A066" fontSize="10" textAnchor="middle" letterSpacing="1" className="opacity-80">STALLS P1 - P15</text>
                </g>

                {/* Gold Zone - Center Pavilion */}
                <g
                  onClick={() => setActiveZone("GOLD")}
                  className="cursor-pointer group"
                >
                  <rect
                    x="50"
                    y="220"
                    width="320"
                    height="200"
                    fill={activeZone === "GOLD" ? "rgba(214,160,102,0.18)" : "rgba(214,160,102,0.03)"}
                    stroke="#D6A066"
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:fill-expo-gold/10"
                  />
                  {/* Grid lines inside Gold Zone */}
                  <line x1="130" y1="220" x2="130" y2="420" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <line x1="210" y1="220" x2="210" y2="420" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <line x1="290" y1="220" x2="290" y2="420" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  <line x1="50" y1="320" x2="370" y2="320" stroke="rgba(214,160,102,0.3)" strokeDasharray="3,3" />
                  
                  <text x="210" y="315" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle" letterSpacing="2">GOLD ZONE (PAVILION A)</text>
                  <text x="210" y="338" fill="#D6A066" fontSize="9" textAnchor="middle" letterSpacing="1">STALLS A1 - A40</text>
                </g>

                {/* General Exhibition Hall - Pavilion B */}
                <g
                  onClick={() => setActiveZone("GENERAL")}
                  className="cursor-pointer group"
                >
                  <rect
                    x="430"
                    y="220"
                    width="320"
                    height="200"
                    fill={activeZone === "GENERAL" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)"}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1.5"
                    className="transition-all duration-300 group-hover:fill-white/5"
                  />
                  {/* Grid lines inside Pavilion B */}
                  <line x1="510" y1="220" x2="510" y2="420" stroke="rgba(255,255,255,0.1)" strokeDasharray="3,3" />
                  <line x1="590" y1="220" x2="590" y2="420" stroke="rgba(255,255,255,0.1)" strokeDasharray="3,3" />
                  <line x1="670" y1="220" x2="670" y2="420" stroke="rgba(255,255,255,0.1)" strokeDasharray="3,3" />
                  <line x1="430" y1="320" x2="750" y2="320" stroke="rgba(255,255,255,0.1)" strokeDasharray="3,3" />

                  <text x="590" y="315" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="2">EXHIBITION HALL B</text>
                  <text x="590" y="338" fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" letterSpacing="1">STALLS B1 - B120</text>
                </g>

                {/* Central Corridor Pathway */}
                <rect x="370" y="170" width="60" height="250" fill="rgba(214,160,102,0.08)" />
                <path d="M 400 170 L 400 420" stroke="#D6A066" strokeWidth="1" strokeDasharray="4,4" />
                <text x="400" y="295" fill="#D6A066" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="2" transform="rotate(-90, 400, 295)">MAIN CONCOURSE</text>

                {/* Food Court / VIP Lounge - bottom row */}
                <g fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                  <rect x="50" y="470" width="280" height="80" />
                  <text x="190" y="515" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" letterSpacing="2">B2B NETWORKING LOUNGE</text>
                  
                  <rect x="470" y="470" width="280" height="80" />
                  <text x="610" y="515" fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" letterSpacing="2">FOOD COURT & FACILITIES</text>
                </g>
              </svg>
            </div>

            <div className="flex gap-4 flex-wrap items-center justify-between text-xs text-white/50 border-t border-white/5 pt-4">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-expo-gold/20 border border-expo-gold" />
                Selected / Premium Zone
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-white/5 border border-white/20" />
                General Exhibition Area
              </span>
              <span className="text-expo-gold/80 italic font-semibold">
                * Click on any zone in the SVG to inspect live space availability.
              </span>
            </div>
          </div>

          {/* Brochure and Zone Details Card */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between items-stretch">
            
            {/* Zone Detail Card */}
            <div className="border-glow-card p-8 bg-black/40 backdrop-blur-md rounded-xl flex-1 flex flex-col justify-center">
              {activeZone ? (
                <div>
                  <span className="text-[9px] tracking-[2.5px] text-expo-gold uppercase block mb-2 font-bold">
                    Pavilion Spotlight
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white mb-4 italic">
                    {zones[activeZone as keyof typeof zones].title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                    {zones[activeZone as keyof typeof zones].details}
                  </p>
                  
                  <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-expo-warm/40 uppercase tracking-[1px]">Stall Series:</span>
                      <span className="text-white font-semibold">{zones[activeZone as keyof typeof zones].stalls}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-expo-warm/40 uppercase tracking-[1px]">Dimensions:</span>
                      <span className="text-white font-semibold">{zones[activeZone as keyof typeof zones].dimensions}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-expo-warm/40 uppercase tracking-[1px]">Availability:</span>
                      <span className="text-expo-gold font-bold uppercase tracking-[1px] animate-pulse">{zones[activeZone as keyof typeof zones].availability}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <span className="text-expo-gold text-lg">🔲</span>
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2 italic">
                    No Pavilion Selected
                  </h3>
                  <p className="font-sans text-xs text-expo-warm/40 leading-relaxed max-w-xs mx-auto">
                    Click on the Premium Platinum, Gold, or General Zone on the technical map to view layout specifics and live stall availability metrics.
                  </p>
                </div>
              )}
            </div>

            {/* High-Converting Brochure Card */}
            <div className="border-glow-card p-8 bg-gold-gradient/5 rounded-xl border border-expo-gold/20 flex flex-col justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-10%] w-[120px] h-[120px] bg-expo-gold/10 blur-[40px] pointer-events-none" />
              <div>
                <span className="text-[9px] tracking-[2.5px] text-expo-gold uppercase block mb-2 font-bold">
                  Sourcing Catalog & pricing
                </span>
                <h3 className="font-serif text-2xl text-white mb-3">
                  Download Stall Brochure
                </h3>
                <p className="font-sans text-xs text-expo-warm/60 leading-relaxed">
                  Unlock the full pricing catalogs, standard stall configuration details, exhibitor amenities package, and extensive seasonal B2B sourcing metrics for STE 2026.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="/brochure.jpeg"
                  download="brochure.jpeg"
                  className="w-full py-3.5 bg-gold-gradient rounded-sm text-expo-midnight font-sans font-bold text-center text-xs tracking-[3px] uppercase shadow-lg hover:shadow-expo-glow transition-all duration-500 hover:brightness-105"
                >
                  📥 Get Brochure (840 KB)
                </a>
                
                <span className="text-[9px] text-center uppercase tracking-[1.5px] text-expo-warm/40 font-semibold block">
                  Includes comprehensive participant checklist
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
