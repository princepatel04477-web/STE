"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import OptimizedVideoBg from "@/components/OptimizedVideoBg";
import { Translate } from "@/components/LanguageContext";

const BUYER_DEMOGRAPHICS = [
  { en: "Retailers", hi: "खुदरा विक्रेता" },
  { en: "Wholesalers", hi: "थोक विक्रेता" },
  { en: "Distributors", hi: "वितरक" },
  { en: "Boutique Owners", hi: "बुटीक मालिक" },
  { en: "Chain Stores", hi: "चेन स्टोर्स" },
  { en: "Resellers", hi: "पुनर्विक्रेता" },
  { en: "Fashion Buyers", hi: "फैशन खरीदार" }
];

const BUSINESS_BENEFITS = [
  { 
    titleEn: "Direct Manufacturer Access", 
    titleHi: "सीधे निर्माताओं तक पहुंच",
    descEn: "Bypass intermediates and connect directly with Surat's weaving mills.", 
    descHi: "बिचौलियों को हटाकर सूरत की बुनाई मिलों से सीधे जुड़ें।" 
  },
  { 
    titleEn: "Bulk Sourcing Opportunities", 
    titleHi: "थोक सोर्सिंग के अवसर",
    descEn: "Scale your order capacity with high-speed manufacturing setups.", 
    descHi: "उच्च गति वाले विनिर्माण सेटअप के साथ अपनी ऑर्डर क्षमता बढ़ाएं।" 
  },
  { 
    titleEn: "PAN India Networking", 
    titleHi: "अखिल भारतीय नेटवर्किंग",
    descEn: "Collaborate with trade leaders and distributors from all 28 states.", 
    descHi: "सभी 28 राज्यों के व्यापारिक नेताओं और वितरकों के साथ सहयोग करें।" 
  },
  { 
    titleEn: "Festival Season Sourcing", 
    titleHi: "त्योहारी सीजन सोर्सिंग",
    descEn: "Secure trending inventory ahead of Durga Puja, Diwali, and Weddings.", 
    descHi: "दुर्गा पूजा, दिवाली और शादियों से पहले ट्रेंडिंग इन्वेंट्री सुरक्षित करें।" 
  },
  { 
    titleEn: "New Design Discovery", 
    titleHi: "नए डिजाइनों की खोज",
    descEn: "Access exclusive, first-reveal collections before they hit open markets.", 
    descHi: "खुले बाजारों में आने से पहले विशेष, फर्स्ट-रिवील संग्रहों तक पहुंचें।" 
  },
  { 
    titleEn: "Wholesale Pricing Advantage", 
    titleHi: "थोक दरों का लाभ",
    descEn: "Maximize your commercial margins with direct mill-rate structures.", 
    descHi: "सीधी मिल दरों के साथ अपने वाणिज्यिक मुनाफे को अधिकतम करें।" 
  }
];

export default function FutureOfCommerce() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

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
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
        <OptimizedVideoBg
          src="/assets/video/commerce.mp4"
          className="w-full h-full scale-[1.02] filter brightness-[0.22] contrast-[1.05]"
          fallbackImage="/assets/images/b2b-networking1.webp"
        />
        <div className="absolute inset-0 bg-[#050505]/65 z-10" />
        <div className="noise-overlay z-15" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03] z-15" />
      </div>
      <div className="spotlight-glowing left-[10%] top-[10%] w-[40vw] h-[40vw] z-10" />
      <div className="spotlight-glowing right-[5%] bottom-[5%] w-[45vw] h-[45vw] z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              <Translate en="WHOLESALE SOURCING PORTAL" hi="थोक सोर्सिंग पोर्टल" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="Connecting Sourcing and" hi="सोर्सिंग और" /></span> <br />
              <span className="text-metallic font-light italic"><Translate en="B2B Business Benefits" hi="B2B व्यावसायिक लाभ का संगम" /></span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
              <Translate en="Surat Textile Exhibition provides the ultimate commerce ecosystem. Connect directly with India's largest manufacturers, optimize your inventory margins, and establish direct-to-mill trade channels." hi="सूरत टेक्सटाइल एक्सहिबिशन सर्वोत्तम वाणिज्यिक पारिस्थितिकी तंत्र प्रदान करता है। भारत के सबसे बड़े निर्माताओं से सीधे जुड़ें, अपनी इन्वेंट्री मार्जिन को अनुकूलित करें, और सीधे मिलों के साथ व्यापारिक चैनल स्थापित करें।" />
            </p>
          </FadeUp>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Block: Business Benefits */}
          <div className="commerce-panel opacity-0 translate-y-[25px] lg:col-span-7 flex flex-col justify-between border-glow-card p-8 sm:p-12 min-h-[500px] card-tap">
            <div>
              <span className="font-sans text-[10px] tracking-[4px] text-expo-gold uppercase font-bold block mb-4">
                <Translate en="COMMERCIAL ADVANTAGES" hi="वाणिज्यिक लाभ" />
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide mb-6">
                <Translate en="Premium Business Benefits" hi="प्रीमियम व्यावसायिक लाभ" />
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {BUSINESS_BENEFITS.map((benefit, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-display text-sm text-white font-bold tracking-[1px] mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-expo-gold animate-pulse" />
                      <Translate en={benefit.titleEn} hi={benefit.titleHi} />
                    </span>
                    <p className="font-sans text-xs text-expo-warm/50 leading-relaxed">
                      <Translate en={benefit.descEn} hi={benefit.descHi} />
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
                    <Translate en="ACTIVE DIRECT SOURCING" hi="सक्रिय डायरेक्ट सोर्सिंग" />
                  </span>
                  <span className="font-sans text-xs text-white font-semibold">
                    <Translate en="Direct-to-Mill Bulk Pricings Active" hi="सीधे मिल-टू-कस्टमर थोक दरें सक्रिय" />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#D6A066]/15 border border-[#D6A066]/20 px-3 py-1 rounded-sm">
                <span className="font-sans text-[9px] tracking-[2px] text-expo-gold font-bold uppercase">
                  <Translate en="650+ MANUFACTURERS LIVE" hi="650+ निर्माता लाइव" />
                </span>
              </div>
            </div>

          </div>

          {/* Right Block: Demographics & Imagery */}
          <div className="lg:col-span-5 flex flex-col gap-8 justify-between">
            
            {/* Visual 1: Demographics with b2b-networking1.png */}
            <div
              className="commerce-panel opacity-0 translate-y-[25px] relative w-full h-[240px] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-end card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.75), rgba(5, 5, 5, 0.75)), url('/assets/images/b2b-networking1.webp')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <div className="relative z-10">
                <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase block mb-2">
                  <Translate en="TARGET DEMOGRAPHICS" hi="लक्षित जनसांख्यिकी" />
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium mb-3">
                  <Translate en="Verified Buyer Segments" hi="सत्यापित खरीदार वर्ग" />
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BUYER_DEMOGRAPHICS.map((buyer, idx) => (
                    <span
                      key={idx}
                      className="font-sans text-[9px] tracking-wider text-expo-gold bg-expo-midnight/75 border border-expo-gold/20 px-2.5 py-1 rounded font-semibold uppercase badge-tap active:scale-95"
                    >
                      <Translate en={buyer.en} hi={buyer.hi} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual 2: B2B Networking with b2b-networking3.png */}
            <div
              className="commerce-panel opacity-0 translate-y-[25px] relative w-full h-[240px] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-end card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.7), rgba(5, 5, 5, 0.7)), url('/assets/images/b2b-networking3.webp')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <div className="relative z-10">
                <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase block mb-2">
                  <Translate en="BUSINESS NETWORKING" hi="व्यावसायिक नेटवर्किंग" />
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium">
                  <Translate en="Global Trade Matching" hi="वैश्विक व्यापार मिलान" />
                </h3>
                <p className="font-sans text-[10px] text-expo-warm/50 mt-1 leading-relaxed">
                  <Translate en="Establish critical industry networks with primary distributors and retail boutique owners nationwide." hi="देश भर में प्राथमिक वितरकों और खुदरा बुटीक मालिकों के साथ महत्वपूर्ण उद्योग नेटवर्क स्थापित करें।" />
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
