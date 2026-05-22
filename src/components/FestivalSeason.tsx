"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";

const FESTIVALS = [
  { name: "Durga Puja", period: "September - October", demand: "450% Peak Demand", desc: "East India's grandest festival driving massive demand for premium designer sarees and handloom fabrics." },
  { name: "Dussehra", period: "October", demand: "350% Peak Demand", desc: "High demand for traditional salwar suits, ethnic wear, and value-added dress materials across India." },
  { name: "Karwa Chauth", period: "October", demand: "400% Peak Demand", desc: "Extreme peak for luxurious red sarees, heavily embroidered lehengas, and royal designer ensembles." },
  { name: "Diwali", period: "November", demand: "500% Peak Demand", desc: "The ultimate national shopping festival. Peak wholesale trade for ready-made garments, kurtis, and men's ethnic wear." },
  { name: "Chhath Puja", period: "November", demand: "300% Peak Demand", desc: "High-volume demand for auspicious sarees and traditional clothing across North and East Indian regions." },
  { name: "Wedding Season", period: "November - March", demand: "600% Peak Demand", desc: "The crown jewel of India's textile economy. Multi-billion dollar bridal couture, sherwani, and luxury lehenga sourcing." },
];

export default function FestivalSeason() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".festival-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(Array.from(cards) as any, {
              opacity: [0, 1],
              translateY: [30, 0],
              duration: 800,
              delay: (el, i) => i * 100,
              ease: "outExpo",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      id="festival-season"
      className="relative w-full py-24 sm:py-32 bg-[#070707] overflow-hidden"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-75 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing right-[-5%] top-[10%] w-[45vw] h-[45vw]" />
      <div className="spotlight-glowing left-[-10%] bottom-[10%] w-[50vw] h-[50vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            04 • THE FESTIVAL IMPERATIVE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            Cinematic Festival Demand & <br />
            <span className="text-metallic font-light italic">Seasonal Business Opportunity</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Surat is the manufacturing engine driving India's multi-billion dollar festival seasons. Sourcing at STE in September enables direct manufacturer inventory access right before peak shopping timelines.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Block: Demands Curve & Fabric Visuals */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Visual 1: Sourcing Seasonal Demand Curve Graph using line-graph-seasonal.png */}
            <div
              className="relative w-full aspect-[4/3] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.7), rgba(5, 5, 5, 0.7)), url('/assets/images/line-graph-seasonal.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="noise-overlay" />
              <div className="flex justify-between items-start">
                <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm">
                  Seasonal Trade Analysis
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <span className="font-sans text-[9px] tracking-[2px] text-expo-warm/50 uppercase block mb-1">
                  B2B INDEX REPORT
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium">Loom Demand Peak</h3>
                <p className="font-sans text-[10px] text-expo-warm/60 mt-1 leading-relaxed">
                  Surat's weaving clusters project a 400% average manufacturing surge leading up to the Diwali and Wedding season.
                </p>
              </div>
            </div>

            {/* Visual 2: Golden Fabric Visual using golden-fabric.png */}
            <div
              className="relative w-full aspect-[4/3] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.65), rgba(5, 5, 5, 0.65)), url('/assets/images/golden-fabric.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="noise-overlay" />
              <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm self-start">
                Textile Sourcing Core
              </span>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium">Haute Zari Threads</h3>
                <p className="font-sans text-[10px] text-expo-warm/60 mt-1 leading-relaxed">
                  High-fidelity metallic weaves crafted specifically for premium bridal suits and wedding heavy-drape sarees.
                </p>
              </div>
            </div>

          </div>

          {/* Right Block: Interactive Staggered Festival Sourcing Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            {FESTIVALS.map((fest, idx) => (
              <div
                key={idx}
                className="festival-card opacity-0 translate-y-[30px] border-glow-card p-6 flex flex-col justify-between h-[210px] relative group"
                data-cursor="explore"
              >
                <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 rounded pointer-events-none" />
                <div>
                  <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                    <div>
                      <h4 className="font-serif text-lg text-white font-semibold group-hover:text-expo-gold transition-colors duration-300">
                        {fest.name}
                      </h4>
                      <span className="font-sans text-[9px] tracking-wide text-expo-warm/40 block mt-0.5">
                        {fest.period}
                      </span>
                    </div>
                    <span className="font-sans text-[9px] tracking-wider text-expo-gold bg-[#D6A066]/10 border border-[#D6A066]/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      {fest.demand}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] sm:text-xs text-expo-warm/50 leading-relaxed">
                    {fest.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
