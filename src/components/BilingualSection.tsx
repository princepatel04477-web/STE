"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";

export default function BilingualSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cards = containerRef.current?.querySelectorAll(".bilingual-card");
              if (cards) {
                waapi.animate(Array.from(cards) as unknown as HTMLElement[], {
                  opacity: [0, 1],
                  scale: [0.96, 1],
                  translateY: [30, 0],
                  duration: 900,
                  delay: (el, i) => i * 200,
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

  return (
    <section
      ref={containerRef}
      id="bilingual-benefits"
      className="relative w-full py-24 sm:py-32 bg-[#070707] overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Saffron Glowing spotlights */}
      <div className="absolute left-[30%] top-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#FF9933]/[0.03] blur-[120px] pointer-events-none z-0" />
      <div className="absolute right-[20%] bottom-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FF9933]/[0.03] blur-[130px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[4px] text-[#FF9933] uppercase mb-4 block">
              BILINGUAL SOURCING BENEFITS • <span className="text-hindi text-[9px] lowercase tracking-normal font-semibold">व्यापारिक लाभ</span>
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text">Connecting Weavers &</span> <br />
              <span className="text-metallic font-light italic text-[#FFBF80]">PAN-India Buyers</span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
              Surat is the sourcing heartbeat of India. Discover why hundreds of major manufacturers and thousands of verified retailers align at STE 2026.
            </p>
          </FadeUp>
        </div>

        {/* 2-Column Comparison Layout (Saffron Accent border glow) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Card 1: For Manufacturers (Weavers / Processor Sellers) */}
          <div className="bilingual-card opacity-0 translate-y-[30px] border border-[#FF9933]/20 hover:border-[#FF9933]/50 p-8 sm:p-12 bg-black/40 backdrop-blur-md rounded-xl flex flex-col justify-between shadow-[0_0_40px_rgba(255,153,51,0.02)] transition-colors duration-500 card-tap">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-[9px] tracking-[2.5px] text-[#FF9933] border border-[#FF9933]/30 px-3 py-1 rounded-full uppercase font-bold bg-[#FF9933]/5">
                  SELLERS • <span className="text-hindi text-[8px] tracking-normal font-medium">उत्पादक निर्माता</span>
                </span>
                <span className="text-2xl">🏭</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-white mb-2">
                For Surat Manufacturers
              </h3>
              <h4 className="font-sans text-hindi text-sm sm:text-[15px] text-[#FFBF80] font-semibold mb-6">
                सूरत के कपड़ा निर्माताओं और बुनकरों के लिए
              </h4>

              {/* Bullet Points */}
              <ul className="flex flex-col gap-6 text-xs sm:text-sm text-expo-warm/75">
                <li className="flex items-start gap-3">
                  <span className="text-[#FF9933] mt-0.5">✦</span>
                  <div>
                    <strong className="text-white">Direct Retail Pipeline:</strong> Sell whole production lots directly to boutique owners and massive multi-state wholesalers, completely bypassing agents.
                    <span className="block text-hindi text-[10px] sm:text-[11px] text-expo-warm/50 mt-1.5 leading-loose">
                      दलालों और एजेंटों के बिना सीधे रिटेलर्स और बड़े थोक खरीदारों को अपनी पूरी उत्पादन क्षमता बेचें।
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF9933] mt-0.5">✦</span>
                  <div>
                    <strong className="text-white">Pan-India Expansion:</strong> Expand your commercial customer reach to buyers from Karnataka, Tamil Nadu, Delhi, Bihar, and Northeast India.
                    <span className="block text-hindi text-[10px] sm:text-[11px] text-expo-warm/50 mt-1.5 leading-loose">
                      दक्षिण भारत, दिल्ली, बिहार और पूर्वोत्तर राज्यों से आने वाले ग्राहकों से जुड़ें और व्यापार बढ़ाएं।
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FF9933] mt-0.5">✦</span>
                  <div>
                    <strong className="text-white">Direct Advanced Bookings:</strong> Secure direct advance orders for the upcoming wedding and festival seasons.
                    <span className="block text-hindi text-[10px] sm:text-[11px] text-expo-warm/50 mt-1.5 leading-loose">
                      आने वाले त्योहारों और शादी के सीजन के लिए सीधे एडवांस ऑर्डर प्राप्त करें।
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-t border-white/10 pt-6 mt-8">
              <a
                href="#final-cta"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-[#FFBF80] hover:text-[#FF9933] transition-colors duration-300"
              >
                Book Manufacturer Stall • <span className="text-hindi text-[10px] tracking-normal font-semibold lowercase">स्टॉल बुक करें</span> ➔
              </a>
            </div>
          </div>

          {/* Card 2: For B2B Buyers (Wholesalers / Retail Boutique Owners) */}
          <div className="bilingual-card opacity-0 translate-y-[30px] border border-[#FFBF80]/20 hover:border-[#FFBF80]/50 p-8 sm:p-12 bg-black/40 backdrop-blur-md rounded-xl flex flex-col justify-between shadow-[0_0_40px_rgba(255,191,128,0.02)] transition-colors duration-500 card-tap">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-[9px] tracking-[2.5px] text-[#FFBF80] border border-[#FFBF80]/30 px-3 py-1 rounded-full uppercase font-bold bg-[#FFBF80]/5">
                  BUYERS • <span className="text-hindi text-[8px] tracking-normal font-medium">थोक व्यापारी / रिटेलर</span>
                </span>
                <span className="text-2xl">🛍️</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-white mb-2">
                For PAN-India Buyers
              </h3>
              <h4 className="font-sans text-hindi text-sm sm:text-[15px] text-[#FFBF80] font-semibold mb-6">
                भारत भर के थोक और खुदरा व्यापारियों के लिए
              </h4>

              {/* Bullet Points */}
              <ul className="flex flex-col gap-6 text-xs sm:text-sm text-expo-warm/75">
                <li className="flex items-start gap-3">
                  <span className="text-[#FFBF80] mt-0.5">✦</span>
                  <div>
                    <strong className="text-white">Zero Broker Markup:</strong> Procure premium sarees, kurtis, salwar suits, and ethnic wear directly from looms at primary manufacturer pricing.
                    <span className="block text-hindi text-[10px] sm:text-[11px] text-expo-warm/50 mt-1.5 leading-loose">
                      सीधे बुनकरों और कारखानों से साड़ी, कुर्ती और सलवार सूट खरीदें और दलालों के कमीशन की बचत करें।
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFBF80] mt-0.5">✦</span>
                  <div>
                    <strong className="text-white">Curated Festival Catalogs:</strong> Access thousands of brand new luxury catalogs prepared specifically for the upcoming wedding/festival seasons.
                    <span className="block text-hindi text-[10px] sm:text-[11px] text-expo-warm/50 mt-1.5 leading-loose">
                      आने वाले शादी और त्योहारों के सीजन के लिए नए एक्सक्लूसिव कैटलॉग का स्टॉक एक ही जगह देखें।
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#FFBF80] mt-0.5">✦</span>
                  <div>
                    <strong className="text-white">Verified Sourcing Security:</strong> Every exhibitor is verified by the STE board, guaranteeing premium quality control and timely shipping.
                    <span className="block text-hindi text-[10px] sm:text-[11px] text-expo-warm/50 mt-1.5 leading-loose">
                      STE बोर्ड द्वारा सत्यापित विक्रेताओं से ही डील करें, जो सुरक्षित लेनदेन और सही समय पर डिलीवरी सुनिश्चित करते हैं।
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border-t border-white/10 pt-6 mt-8">
              <a
                href="#final-cta"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-[#FFBF80] hover:text-[#FF9933] transition-colors duration-300"
              >
                Register as B2B Buyer • <span className="text-hindi text-[10px] tracking-normal font-semibold lowercase">बायर रजिस्ट्रेशन</span> ➔
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
