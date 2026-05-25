"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";

const EXHIBITION_HIGHLIGHTS = [
  {
    name: "Direct Mill Procurement",
    meters: "650+ Stalls",
    focus: "Source directly from Surat's massive powerloom, weaving, and high-speed processing mills.",
    coords: "Direct Pricing",
  },
  {
    name: "Pre-Season Festive Launch",
    meters: "Sept 12–13",
    focus: "Acquire exclusive ethnic and bridal collections ahead of the major wedding & festival seasons.",
    coords: "First Reveal",
  },
  {
    name: "Ecosystem Sourcing Opportunities",
    meters: "8,000+ Buyers",
    focus: "Interact with verified domestic and international wholesale trade buyers and distributors.",
    coords: "PAN India Reach",
  },
  {
    name: "Dedicated B2B Networking Hub",
    meters: "VIP Lounges",
    focus: "Dedicated private matchmaking lounges for high-volume contract closures and deal signings.",
    coords: "Secure Trade",
  },
];

export default function ExhibitionExperience() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const listItems = containerRef.current?.querySelectorAll(".pavilion-item");
    if (!listItems) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(Array.from(listItems) as unknown as HTMLElement[], {
              opacity: [0, 1],
              translateX: [-30, 0],
              duration: 800,
              delay: (el, i) => i * 120,
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
      id="exhibition-experience"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-[#050505] flex flex-col justify-center overflow-hidden"
    >
      {/* Background loop walkthrough video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
        <video
          className="w-full h-full object-cover filter brightness-[0.35] contrast-[1.05]"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/video/exhibition.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.05] z-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            03 • THE EXHIBITION VENUE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight">
            SIECC, Sarsana Dome <br />
            <span className="text-metallic font-light italic">Surat’s Sourcing Epicenter</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Walk into India’s most prestigious, purpose-built textile arena. SIECC Sarsana Dome, Surat, is architecturally engineered to host the grandest B2B textile trade exhibitions.
          </p>
        </div>

        {/* Layout: Interactive Blueprint overlays & Pavilions list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: Luxury Exhibition Blueprint Cards */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-6">
            
            {/* Concentric Circle Design Layer */}
            <div
              className="relative w-full sm:w-1/2 aspect-[4/5] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between bg-[#050505]"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.75), rgba(5, 5, 5, 0.75)), url('/assets/images/floor-plan.png')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm self-start">
                Blueprint Grid
              </span>
              <div>
                <h3 className="font-serif text-xl text-white font-medium">VIP Pavilions</h3>
                <p className="font-sans text-[10px] text-expo-warm/50 mt-2 leading-relaxed">
                  Concentric architectural designs ensuring fluid pedestrian transitions.
                </p>
              </div>
            </div>

            {/* Stall visual showcasing draped sarees */}
            <div
              className="relative w-full sm:w-1/2 aspect-[4/5] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between bg-[#050505]"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.65), rgba(5, 5, 5, 0.65)), url('/assets/images/expo-stall.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm self-start">
                Design Space
              </span>
              <div>
                <h3 className="font-serif text-xl text-white font-medium">Bespoke Stalls</h3>
                <p className="font-sans text-[10px] text-expo-warm/50 mt-2 leading-relaxed">
                  Double-height premium draped SARIS exhibit platforms with custom spotlighting.
                </p>
              </div>
            </div>

          </div>

          {/* Right Block: Interactive Pavilions Map Indices */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h4 className="font-sans text-[11px] font-bold tracking-[3px] text-expo-gold uppercase border-b border-white/10 pb-4">
              EXHIBITOR ADVANTAGES & SOURCING HIGHLIGHTS
            </h4>

            <div className="flex flex-col divide-y divide-white/5">
              {EXHIBITION_HIGHLIGHTS.map((pav, idx) => (
                <div
                  key={idx}
                  className="pavilion-item opacity-0 -translate-x-[30px] py-5 flex items-center justify-between group hover:pl-2 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-white font-semibold tracking-wide group-hover:text-expo-gold transition-colors duration-300">
                        {pav.name}
                      </span>
                      <span className="font-sans text-[9px] tracking-[1.5px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm">
                        {pav.coords}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-expo-warm/50 mt-1 leading-relaxed">
                      {pav.focus}
                    </p>
                  </div>

                  <span className="font-display text-sm text-expo-gold font-bold tracking-wide">
                    {pav.meters}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#D6A066]/5 border border-[#D6A066]/15 p-6 rounded-sm mt-4">
              <span className="font-sans text-[9px] tracking-[3px] text-expo-gold font-bold uppercase block mb-2">
                EXHIBITOR BOOKINGS
              </span>
              <p className="font-sans text-xs text-expo-warm/70 leading-relaxed">
                Experience high-volume commercial matchmaking. Bookings cover premium booth design, dedicated lounge passes, and automated buyer meetings.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
