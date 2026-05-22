/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { waapi } from "animejs";

const pillars = [
  {
    title: "Exhibition",
    image: "/assets/STE.jpg",
    desc: "Over 650 custom-designed pavilions launching the newest textile and ethnic wear collections."
  },
  {
    title: "Networking",
    image: "/assets/logo_STE.png",
    desc: "Connecting bulk buyers, retail chains, and manufacturing giants directly."
  },
  {
    title: "Live Sourcing",
    image: "/assets/ste_luxury_hero_613dfd3b.jpg",
    desc: "Spot orders, fabric inspections, and contract custom manufacturing bookings."
  },
  {
    title: "Festive Collections",
    image: "/assets/STE.jpg",
    desc: "Unveiling highly anticipated premium seasonal designs ahead of the major retail cycles."
  },
  {
    title: "Wedding Market",
    image: "/assets/ste_luxury_hero_613dfd3b.jpg",
    desc: "The premier hub showcasing bridal wear, lehengas, designer sarees, and luxury mens ethnic fabrics."
  }
];

export default function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll triggers for text reveals and image shifts
  useEffect(() => {
    if (containerRef.current) {
      const texts = containerRef.current.querySelectorAll(".about-fade-el");
      const cards = containerRef.current.querySelectorAll(".pillar-card");
      const line = containerRef.current.querySelector(".about-vertical-line");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Reveal editorial text
              waapi.animate(Array.from(texts) as any, {
                opacity: [0, 1],
                transform: ["translateY(30px)", "translateY(0px)"],
                delay: (el, i) => i * 100,
                duration: 800,
                ease: "outExpo"
              });

              // Reveal pillar cards
              waapi.animate(Array.from(cards) as any, {
                opacity: [0, 1],
                transform: ["translateY(20px) scale(0.96)", "translateY(0px) scale(1)"],
                delay: (el, i) => 200 + i * 100,
                duration: 900,
                ease: "outExpo"
              });

              // Draw vertical line
              if (line) {
                waapi.animate(line as any, {
                  transform: ["scaleY(0)", "scaleY(1)"],
                  opacity: [0, 1],
                  duration: 1200,
                  ease: "outExpo"
                });
              }

              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <section id="about" ref={containerRef} className="relative w-full bg-expo-midnight py-32 px-6 overflow-hidden">
      
      {/* Background Volumetric Gradient */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-expo-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-20">
        
        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Editorial & Quote */}
          <div className="lg:col-span-6 flex flex-col justify-center animate-container">
            
            {/* Main Header */}
            <h2 className="about-fade-el opacity-0 font-display text-4xl md:text-5xl lg:text-6xl tracking-wider text-expo-warm mb-8">
              ABOUT THE EXHIBITION
            </h2>

            {/* Editorial Body */}
            <div className="about-fade-el opacity-0 space-y-6 font-sans text-expo-warm/65 text-sm sm:text-base leading-relaxed mb-8">
              <p className="font-serif text-lg sm:text-xl text-expo-warm/80 leading-relaxed italic mb-4">
                Welcome to the epicenter of <span className="text-expo-gold font-medium">India&apos;s textile ecosystem</span>. Surat, recognized globally as a manufacturing powerhouse, opens its doors to the most sourcing summit of the year.
              </p>
              <p>
                Positioned strategically ahead of the festive and wedding seasons, SURAT EXPO is engineered for scale. We bring together top-tier manufacturers and <span className="text-white">verified buyers</span> in a hyper-premium environment designed for <span className="text-white">high-volume trade</span> and <span className="text-white">live sourcing</span>.
              </p>
            </div>

            {/* Editorial Advantage Quote */}
            <div className="about-fade-el opacity-0 flex flex-col gap-4 pl-6 border-l-2 border-expo-gold/30">
              <span className="text-xs uppercase tracking-widest text-expo-gold font-medium">The Textile Capital Advantage</span>
              <p className="text-sm text-expo-warm/50 leading-relaxed font-sans">
                Experience unparalleled access to direct manufacturers, eliminating middlemen and accelerating your business momentum.
              </p>
            </div>

          </div>

          {/* Right Column: Interactive Pillars Grid */}
          <div className="lg:col-span-6 relative pt-4 pb-4">
            
            {/* Vertical timeline connector line */}
            <div className="about-vertical-line opacity-0 absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-expo-gold/45 via-expo-border to-transparent origin-top z-10" />

            <div className="flex flex-col gap-8">
              {pillars.map((pillar) => (
                <div 
                  key={pillar.title}
                  className="pillar-card opacity-0 relative pl-16 flex flex-col sm:flex-row gap-6 group cursor-default"
                >
                  
                  {/* Timeline bullet */}
                  <div className="absolute left-6 top-6 -translate-x-1/2 w-4 h-4 rounded-full border border-expo-border bg-expo-midnight flex items-center justify-center z-20 group-hover:border-expo-gold transition-colors duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-expo-gold/40 group-hover:bg-expo-gold group-hover:shadow-[0_0_8px_rgba(214,160,102,1)] transition-all duration-300" />
                  </div>

                  {/* Pillar card container */}
                  <div className="flex-1 border-glow-card p-6 bg-expo-black/40 hover:-translate-y-1 transition-all duration-500 flex flex-col sm:flex-row gap-5">
                    {/* Small preview image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-expo-border/60">
                      <Image
                        src={pillar.image}
                        alt={pillar.title}
                        fill
                        sizes="100px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.7] group-hover:brightness-100"
                      />
                    </div>
                    {/* Text contents */}
                    <div className="flex flex-col justify-center">
                      <h3 className="font-display text-lg tracking-wide text-expo-warm group-hover:text-expo-gold transition-colors duration-300">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-expo-warm/55 leading-relaxed font-sans mt-2">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
