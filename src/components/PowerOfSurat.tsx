"use client";

import { useEffect, useRef, useState } from "react";
import { animate, waapi } from "animejs";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import OptimizedVideoBg from "@/components/OptimizedVideoBg";
import { Translate } from "@/components/LanguageContext";

const STATS_DATA = [
  { value: 650, suffix: "+", labelEn: "EXHIBITOR STALLS", labelHi: "प्रदर्शक स्टॉल", subEn: "Surat's leading manufacturers showcasing premium catalogs", subHi: "सूरत के अग्रणी निर्माता अपने प्रीमियम संग्रह का प्रदर्शन करते हैं" },
  { value: 8000, suffix: "+", labelEn: "VERIFIED B2B BUYERS", labelHi: "सत्यापित B2B खरीदार", subEn: "Retailers, wholesalers, boutique owners & chain stores", subHi: "रिटेलर्स, थोक विक्रेता, बुटीक मालिक और स्टोर चेन" },
  { value: 28, suffix: " STATES", labelEn: "PAN INDIA REACH", labelHi: "अखिल भारतीय पहुंच", subEn: "Connecting buyers from all 28 Indian states & UTs", subHi: "भारत के सभी 28 राज्यों और केंद्र शासित प्रदेशों के खरीदारों को जोड़ना" },
  { value: 100, suffix: "%", labelEn: "WHOLESALE BUSINESS FOCUS", labelHi: "थोक व्यापार पर ध्यान", subEn: "Direct manufacturer pricing & high margin inventory sourcing", subHi: "सीधे निर्माताओं से मूल्य निर्धारण और उच्च मार्जिन इन्वेंट्री सोर्सिंग" },
];

export default function PowerOfSurat() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [counts, setCounts] = useState(STATS_DATA.map(() => 0));
  const [isAnimated, setIsAnimated] = useState(false);
  const hasAnimated = useRef(false);
  const { ref: headingRef, inView: headingInView } = useInView(0.3);

  // 1. Scroll-triggered slide up animation for stats cards
  useEffect(() => {
    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll(".stat-card");
      if (cards.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(Array.from(cards) as unknown as HTMLElement[], {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 900,
                delay: (el, i) => i * 100,
                ease: "outExpo"
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(sectionRef.current);
      return () => observer.disconnect();
    }
  }, []);

  // 2. In-Viewport Observer for number increments (30% threshold)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            setIsAnimated(true);

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
      { threshold: 0.3 }
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
        <FadeUp className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            <Translate en="INDUSTRIAL SUPREMACY" hi="औद्योगिक वर्चस्व" />
          </span>
          <h2
            ref={headingRef}
            className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest text-white leading-tight heading-underline ${headingInView ? "in-view" : ""}`}
          >
            <span className="gold-shimmer-text">
              <Translate en="The Monumental Scale of" hi="विश्व कपड़ा व्यापार का" />
            </span> <br />
            <span className="text-metallic font-light italic">
              <Translate en="Global Commerce" hi="भव्य औद्योगिक पैमाना" />
            </span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            <Translate
              en="Surat is the epicenter of India’s weaving, processing, and printing might. A luxury infrastructure engineered for unmatched speed, limitless volume, and high-fashion precision."
              hi="सूरत भारत की बुनाई, प्रसंस्करण और छपाई क्षमता का केंद्र है। बेजोड़ गति, असीमित मात्रा और उच्च-फैशन सटीकता के लिए तैयार किया गया एक शानदार औद्योगिक बुनियादी ढांचा।"
            />
          </p>
        </FadeUp>

        {/* Dynamic Multi-Column Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Block: Interactive Stats Dashboard & Visualized Line Graph */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 z-10">
            {STATS_DATA.map((stat, i) => (
              <div
                key={i}
                className="stat-card opacity-0 translate-y-[30px] border-glow-card p-6 sm:p-8 flex flex-col justify-between h-[180px] sm:h-[200px] card-tap"
                data-cursor="view"
              >
                <div>
                  <span className="font-display text-3xl sm:text-4xl text-white tracking-wide font-bold">
                    {i === 2 ? (
                      <>
                        PAN <span className="text-expo-gold">
                          <Translate en="India" hi="इंडिया" />
                        </span>
                      </>
                    ) : (
                      <>
                        {isAnimated ? counts[i].toLocaleString() : stat.value.toLocaleString()}
                        <span className="text-expo-gold">{stat.suffix}</span>
                      </>
                    )}
                  </span>
                  <h3 className="font-sans text-sm font-semibold tracking-[1px] text-expo-warm uppercase mt-4 gold-shimmer-text">
                    <Translate en={stat.labelEn} hi={stat.labelHi} />
                  </h3>
                </div>
                <p className="font-sans text-[11px] sm:text-xs text-expo-warm/50 leading-relaxed">
                  <Translate en={stat.subEn} hi={stat.subHi} />
                </p>
              </div>
            ))}
          </div>

          {/* Right Block: Framed Cinematic Video & Global Trade Visuals */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="stat-card opacity-0 translate-y-[30px] relative group overflow-hidden border border-white/10 rounded-sm shadow-2xl z-10 card-tap">
               <OptimizedVideoBg
                 src="/assets/video/power.mp4"
                 className="w-full aspect-video filter brightness-[0.7] group-hover:brightness-[0.9] transition-all duration-700 scale-100 group-hover:scale-[1.03]"
                 fallbackImage="/assets/images/world-map.webp"
               />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 z-20 pointer-events-none" />
              <span className="absolute bottom-4 left-4 font-sans text-[10px] tracking-[3px] text-expo-gold uppercase bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-sm badge-tap">
                <Translate en="SURAT PRODUCTION GRID" hi="सूरत उत्पादन ग्रिड" />
              </span>
            </div>

            {/* Simulated Live Trade Routes Visualizer */}
            <div
              ref={mapRef}
              className="stat-card opacity-0 translate-y-[30px] relative w-full h-[180px] border border-white/5 rounded-sm p-4 bg-black/40 backdrop-blur-md flex flex-col justify-end overflow-hidden z-10 card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.85), rgba(5, 5, 5, 0.85)), url('/assets/images/world-map.webp')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-[#070707]/30 mix-blend-color" />
              
              {/* Graphic overlays: Luminous lines representing seasonal demands */}
              <div 
                className="absolute inset-0 bg-contain bg-no-repeat bg-center opacity-[0.25] mix-blend-screen scale-[1.08] translate-y-[-10%]"
                style={{ backgroundImage: `url('/assets/images/line-graph-rising.webp')` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="font-sans text-[9px] tracking-[3px] text-expo-warm/50 uppercase block mb-1">
                    <Translate en="B2B CHANNEL METRICS" hi="B2B चैनल मेट्रिक्स" />
                  </span>
                  <span className="font-display text-lg text-white font-bold tracking-[1px] uppercase">
                    <Translate en="ACTIVE BUYER INFLOW" hi="सक्रिय खरीदार प्रवाह" />
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#D6A066]/10 border border-[#D6A066]/20 px-3 py-1.5 rounded-full badge-tap">
                  <span className="w-1.5 h-1.5 rounded-full bg-expo-gold animate-ping" />
                  <span className="font-sans text-[9px] tracking-[2px] text-expo-gold font-bold uppercase">
                    <Translate en="LIVE CONNECTION" hi="लाइव कनेक्शन" />
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
