"use client";

import { useEffect, useRef, useState } from "react";
import { waapi, splitText, stagger } from "animejs";

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Reveal text
    if (headlineRef.current) {
      const split = splitText(headlineRef.current, {
        chars: true,
        accessible: true,
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(split.chars, {
                translateY: [35, 0],
                opacity: [0, 1],
                duration: 1000,
                delay: stagger(30),
                ease: "outExpo",
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(containerRef.current!);
      return () => observer.disconnect();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      ref={containerRef}
      id="final-cta"
      className="relative w-full min-h-screen py-24 sm:py-32 bg-[#050505] flex flex-col justify-center overflow-hidden"
    >
      {/* Loop background video */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
        <video
          className="w-full h-full object-cover filter brightness-[0.18] contrast-[1.1] saturate-[0.7]"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/video/cta.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/40 to-[#050505] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.06] z-20" />
      </div>

      {/* Decorative Layered Panels */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 overflow-hidden">
        {/* World map panel */}
        <div
          className="absolute left-[5%] top-[15%] w-[18vw] h-[12vw] bg-cover bg-center border border-white/5 rounded-sm opacity-[0.08] hidden lg:block scale-[1.05]"
          style={{ backgroundImage: `url('/assets/images/world-map.jpg')` }}
        />
        {/* Saree stall panel */}
        <div
          className="absolute right-[5%] top-[25%] w-[15vw] h-[20vw] bg-cover bg-center border border-white/5 rounded-sm opacity-[0.08] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/expo-stall.png')` }}
        />
        {/* Couture queen panel */}
        <div
          className="absolute left-[8%] bottom-[15%] w-[15vw] h-[20vw] bg-cover bg-center border border-white/5 rounded-sm opacity-[0.08] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/editorial-queen.png')` }}
        />
        {/* Line graph panel */}
        <div
          className="absolute right-[8%] bottom-[10%] w-[18vw] h-[12vw] bg-contain bg-no-repeat bg-center border border-white/5 rounded-sm opacity-[0.06] hidden lg:block"
          style={{ backgroundImage: `url('/assets/images/line-graph-rising.png')` }}
        />

        {/* Ambient glow lights */}
        <div className="spotlight-glowing left-[35%] top-[10%] w-[40vw] h-[40vw]" />
        <div className="spotlight-glowing right-[30%] bottom-[10%] w-[45vw] h-[45vw]" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column: Text invitations */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <span className="text-[10px] sm:text-xs font-bold tracking-[6px] text-expo-gold uppercase mb-6 block">
            07 • EXHIBITOR REGISTRATION
          </span>
          <h2
            ref={headlineRef}
            className="font-serif text-3xl sm:text-5xl md:text-7xl tracking-tight text-white leading-[1.08] mb-8 uppercase"
          >
            Exhibitor Stall <br />
            <span className="text-metallic font-light italic normal-case">Booking Request</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed max-w-lg mb-8">
            Book your premium exhibition space at SIECC Sarsana Dome, Surat. With 650+ stalls and 8000+ verified buyers from all across India, establish critical connections and command maximum B2B seasonal trade.
          </p>

          <div className="flex flex-wrap gap-6 items-center border-t border-white/10 pt-8 mt-2">
            <div>
              <span className="font-display text-2xl text-white font-bold tracking-[1.5px]">STE</span>
              <span className="font-sans text-[10px] text-expo-warm/40 block mt-1">Ecosystem Organizer</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="font-display text-2xl text-expo-gold font-bold tracking-[1px]">AKAS</span>
              <span className="font-sans text-[10px] text-expo-warm/40 block mt-1">Supporting Association</span>
            </div>
          </div>
        </div>

        {/* Right column: Premium Inquiry Form */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md border-glow-card p-8 sm:p-10 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute right-[-10%] top-[-10%] w-[150px] h-[150px] bg-expo-gold/5 blur-[50px] pointer-events-none" />
            
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="font-serif text-xl sm:text-2xl text-white italic mb-2">
                  Exhibitor Stall Registration
                </h3>
                
                {/* Inputs */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Company Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Contact Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white placeholder-white/20 transition-colors duration-300"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Trade Category</label>
                  <select
                    required
                    defaultValue=""
                    className="w-full bg-black/90 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white/80 transition-colors duration-300"
                  >
                    <option value="" disabled>Select Sourcing Category</option>
                    <option value="sarees">Sarees</option>
                    <option value="lehenga">Lehenga Choli</option>
                    <option value="kurti">Kurti</option>
                    <option value="salwar">Salwar Suit</option>
                    <option value="kids">Kids Wear</option>
                    <option value="men">Sherwani & Men's Ethnic Wear</option>
                    <option value="fabrics">Value Added Fabrics</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[9px] tracking-[2px] text-expo-gold uppercase">Stall Area Required</label>
                  <select
                    required
                    defaultValue=""
                    className="w-full bg-black/90 border border-white/10 focus:border-expo-gold focus:outline-none rounded-sm px-4 py-3 text-sm text-white/80 transition-colors duration-300"
                  >
                    <option value="" disabled>Select Stall Dimension</option>
                    <option value="9">9 Sqm Standard Stall</option>
                    <option value="18">18 Sqm Executive Space</option>
                    <option value="27">27 Sqm Premium Space</option>
                    <option value="36">36 Sqm+ Custom Pavilion</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gold-gradient rounded-sm text-expo-midnight font-sans font-bold text-xs tracking-[3px] uppercase mt-4 overflow-hidden shadow-lg hover:shadow-expo-glow transition-all duration-500 hover:brightness-105"
                  data-cursor="click"
                >
                  BOOK YOUR STALL NOW
                </button>
                
                <a
                  href="tel:9950787787"
                  className="w-full py-3.5 bg-transparent border border-expo-gold/40 hover:border-expo-gold rounded-sm text-expo-gold font-sans font-bold text-center text-xs tracking-[2px] uppercase overflow-hidden transition-all duration-500"
                >
                  CALL FOR STALL BOOKING: 9950787787
                </a>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full border border-expo-gold bg-[#D6A066]/10 flex items-center justify-center mb-6">
                  <span className="text-expo-gold font-display text-xl font-bold">✓</span>
                </div>
                <h3 className="font-serif text-2xl text-white italic mb-4">
                  Request Registered
                </h3>
                <p className="font-sans text-xs text-expo-warm/60 leading-relaxed max-w-xs mb-6">
                  Your exhibitor stall booking request has been successfully filed. The STE trade allocation team will contact your enterprise within 24 hours.
                </p>
                <a
                  href="tel:9950787787"
                  className="font-sans text-xs text-expo-gold hover:underline font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  Call Hotline: 9950787787
                </a>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
