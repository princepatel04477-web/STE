"use client";

import { useEffect, useRef, useState } from "react";
import { waapi, animate } from "animejs";

const STATS_DATA = [
  { value: 650, suffix: "+", label: "EXHIBITOR STALLS", sub: "Surat's leading manufacturers showcasing premium catalogs" },
  { value: 8000, suffix: "+", label: "VERIFIED B2B BUYERS", sub: "Retailers, wholesalers, boutique owners & chain stores" },
  { value: 28, suffix: "+ States", label: "PAN INDIA REACH", sub: "Connecting sourcing hubs from across the nation" },
  { value: 100, suffix: "%", label: "WHOLESALE BUSINESS FOCUS", sub: "Direct manufacturer pricing & high margin inventory sourcing" },
];

export default function PowerOfSurat() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [counts, setCounts] = useState(STATS_DATA.map(() => 0));
  const hasAnimated = useRef(false);

  useEffect(() => {
    // 1. In-Viewport Observer for number increments
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;

            // Trigger Anime.js number animations
            STATS_DATA.forEach((stat, idx) => {
              const counterObj = { val: 0 };
              animate(counterObj, {
                val: stat.value,
                duration: 2000,
                ease: "outExpo",
                onUpdate: () => {
                  setCounts((prev) => {
                    const next = [...prev];
                    next[idx] = Math.floor(counterObj.val);
                    return next;
                  });
                },
              });
            });
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="power-of-surat"
      className="relative w-full min-h-screen py-24 sm:py-32 flex flex-col justify-center bg-[#070707] overflow-hidden"
    >
      {/* Background spotlights & visual meshes */}
      <div className="absolute inset-0 bg-mesh-dark opacity-80 pointer-events-none z-0" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03] z-0" />
      <div className="spotlight-glowing left-[-10%] top-[20%] w-[50vw] h-[50vw]" />
      <div className="spotlight-glowing right-[-5%] bottom-[-10%] w-[45vw] h-[45vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            01 • INDUSTRIAL SUPREMACY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
            The Monumental Scale of <br />
            <span className="text-metallic font-light italic">Global Commerce</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Surat is the epicenter of India’s weaving, processing, and printing might. 
            A luxury infrastructure engineered for unmatched speed, limitless volume, and high-fashion precision.
          </p>
        </div>

        {/* Dynamic Multi-Column Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Block: Interactive Stats Dashboard & Visualized Line Graph */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
            {STATS_DATA.map((stat, i) => (
              <div
                key={i}
                className="border-glow-card p-6 sm:p-8 flex flex-col justify-between h-[180px] sm:h-[200px]"
                data-cursor="view"
              >
                <div>
                  <span className="font-display text-3xl sm:text-4xl text-white tracking-wide font-bold">
                    {counts[i].toLocaleString()}
                    <span className="text-expo-gold">{stat.suffix}</span>
                  </span>
                  <h3 className="font-sans text-sm font-semibold tracking-[1px] text-expo-warm uppercase mt-4">
                    {stat.label}
                  </h3>
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-expo-warm/50 leading-relaxed">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Right Block: Framed Cinematic Video & Global Trade Visuals */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="relative group overflow-hidden border border-white/10 rounded-sm shadow-2xl z-10">
              <video
                className="w-full aspect-video object-cover filter brightness-[0.7] group-hover:brightness-[0.9] transition-all duration-700 scale-100 group-hover:scale-[1.03]"
                autoPlay
                muted
                loop
                playsInline
                src="/assets/video/power.mp4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 z-20 pointer-events-none" />
              <span className="absolute bottom-4 left-4 font-sans text-[10px] tracking-[3px] text-expo-gold uppercase bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-sm">
                SURAT PRODUCTION GRID
              </span>
            </div>

            {/* Simulated Live Trade Routes Visualizer */}
            <div
              ref={mapRef}
              className="relative w-full h-[180px] border border-white/5 rounded-sm p-4 bg-black/40 backdrop-blur-md flex flex-col justify-end overflow-hidden z-10"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.85), rgba(5, 5, 5, 0.85)), url('/assets/images/world-map.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-[#070707]/30 mix-blend-color" />
              
              {/* Graphic overlays: Luminous lines representing seasonal demands */}
              <div 
                className="absolute inset-0 bg-contain bg-no-repeat bg-center opacity-[0.25] mix-blend-screen scale-[1.08] translate-y-[-10%]"
                style={{ backgroundImage: `url('/assets/images/line-graph-rising.png')` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="font-sans text-[9px] tracking-[3px] text-expo-warm/50 uppercase block mb-1">
                    B2B CHANNEL METRICS
                  </span>
                  <span className="font-display text-lg text-white font-bold tracking-[1px] uppercase">
                    ACTIVE BUYER INFLOW
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#D6A066]/10 border border-[#D6A066]/20 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-expo-gold animate-ping" />
                  <span className="font-sans text-[9px] tracking-[2px] text-expo-gold font-bold uppercase">
                    LIVE CONNECTION
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
