"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";

const FESTIVALS = [
  { 
    nameEn: "Durga Puja", 
    nameHi: "दुर्गा पूजा",
    periodEn: "September - October", 
    periodHi: "सितंबर - अक्टूबर",
    demandEn: "450% Peak Demand", 
    demandHi: "450% उच्चतम मांग",
    descEn: "East India's grandest festival driving massive demand for premium designer sarees and handloom fabrics.", 
    descHi: "पूर्वी भारत का सबसे बड़ा त्योहार, जो प्रीमियम डिजाइनर साड़ियों और हथकरघा कपड़ों की भारी मांग पैदा करता है।" 
  },
  { 
    nameEn: "Dussehra", 
    nameHi: "दशहरा",
    periodEn: "October", 
    periodHi: "अक्टूबर",
    demandEn: "350% Peak Demand", 
    demandHi: "350% उच्चतम मांग",
    descEn: "High demand for traditional salwar suits, ethnic wear, and value-added dress materials across India.", 
    descHi: "पूरे भारत में पारंपरिक सलवार सूट, एथनिक वियर और मूल्य-वर्धित ड्रेस मटेरियल की भारी मांग।" 
  },
  { 
    nameEn: "Karwa Chauth", 
    nameHi: "करवा चौथ",
    periodEn: "October", 
    periodHi: "अक्टूबर",
    demandEn: "400% Peak Demand", 
    demandHi: "400% उच्चतम मांग",
    descEn: "Extreme peak for luxurious red sarees, heavily embroidered lehengas, and royal designer ensembles.", 
    descHi: "शानदार लाल साड़ियों, भारी कढ़ाई वाले लहंगे और शाही डिजाइनर परिधानों की अत्यधिक मांग।" 
  },
  { 
    nameEn: "Diwali", 
    nameHi: "दिवाली",
    periodEn: "November", 
    periodHi: "नवंबर",
    demandEn: "500% Peak Demand", 
    demandHi: "500% उच्चतम मांग",
    descEn: "The ultimate national shopping festival. Peak wholesale trade for ready-made garments, kurtis, and men's ethnic wear.", 
    descHi: "देश का सबसे बड़ा खरीदारी उत्सव। रेडीमेड परिधानों, कुर्तियों और पुरुषों के एथनिक वियर के लिए उच्चतम थोक व्यापार।" 
  },
  { 
    nameEn: "Chhath Puja", 
    nameHi: "छठ पूजा",
    periodEn: "November", 
    periodHi: "नवंबर",
    demandEn: "300% Peak Demand", 
    demandHi: "300% उच्चतम मांग",
    descEn: "High-volume demand for auspicious sarees and traditional clothing across North and East Indian regions.", 
    descHi: "उत्तर और पूर्वी भारतीय क्षेत्रों में शुभ साड़ियों और पारंपरिक कपड़ों की बड़े पैमाने पर मांग।" 
  },
  { 
    nameEn: "Wedding Season", 
    nameHi: "शादी का सीजन",
    periodEn: "November - March", 
    periodHi: "नवंबर - मार्च",
    demandEn: "600% Peak Demand", 
    demandHi: "600% उच्चतम मांग",
    descEn: "The crown jewel of India's textile economy. Multi-billion dollar bridal couture, sherwani, and luxury lehenga sourcing.", 
    descHi: "भारतीय कपड़ा अर्थव्यवस्था का सबसे महत्वपूर्ण हिस्सा। अरबों डॉलर के ब्राइडल कॉउचर, शेरवानी और लक्जरी लहंगे की सोर्सिंग।" 
  },
];

export default function FestivalSeason() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: headingRef, inView: headingInView } = useInView(0.3);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".festival-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(Array.from(cards) as unknown as HTMLElement[], {
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
        <FadeUp className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            <Translate en="THE FESTIVAL IMPERATIVE" hi="त्योहारी मांग का महत्व" />
          </span>
          <h2
            ref={headingRef}
            className={`font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide text-white leading-tight heading-underline ${headingInView ? "in-view" : ""}`}
          >
            <span className="gold-shimmer-text"><Translate en="Cinematic Festival Demand &" hi="भव्य त्योहारी मांग और" /></span> <br />
            <span className="text-metallic font-light italic"><Translate en="Seasonal Business Opportunity" hi="मौसमी व्यावसायिक अवसर" /></span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            <Translate en="Surat is the manufacturing engine driving India's multi-billion dollar festival seasons. Sourcing at STE in September enables direct manufacturer inventory access right before peak shopping timelines." hi="सूरत भारत के अरबों डॉलर के त्योहारी सीजन को संचालित करने वाला विनिर्माण इंजन है। सितंबर में STE पर सोर्सिंग करने से खरीदारों को पीक शॉपिंग सीजन से ठीक पहले निर्माताओं की इन्वेंट्री तक सीधे पहुंच मिलती है।" />
          </p>
        </FadeUp>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Block: Demands Curve & Fabric Visuals */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Visual 1: Sourcing Seasonal Demand Curve Graph using line-graph-seasonal.png */}
            <div
              className="relative w-full aspect-[4/3] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between bg-[#050505] card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.7), rgba(5, 5, 5, 0.7)), url('/assets/images/line-graph-seasonal.webp')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="noise-overlay" />
              <div className="flex justify-between items-start">
                <span className="font-sans text-xs tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm badge-tap">
                  <Translate en="Seasonal Trade Analysis" hi="मौसमी व्यापार विश्लेषण" />
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div>
                <span className="font-sans text-xs tracking-[2px] text-expo-warm/50 uppercase block mb-1">
                  <Translate en="B2B INDEX REPORT" hi="बी2बी इंडेक्स रिपोर्ट" />
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium gold-shimmer-text">
                  <Translate en="Loom Demand Peak" hi="लूम मांग का उच्चतम स्तर" />
                </h3>
                <p className="font-sans text-xs text-expo-warm/60 mt-1 leading-relaxed">
                  <Translate en="Surat's weaving clusters project a 400% average manufacturing surge leading up to the Diwali and Wedding season." hi="सूरत के बुनाई क्लस्टर्स दिवाली और शादी के सीजन से पहले विनिर्माण में औसतन 400% की वृद्धि का अनुमान लगाते हैं।" />
                </p>
              </div>
            </div>

            {/* Visual 2: Golden Fabric Visual using golden-fabric.png */}
            <div
              className="relative w-full aspect-[4/3] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between bg-[#050505] card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.65), rgba(5, 5, 5, 0.65)), url('/assets/images/golden-fabric.webp')`,
                backgroundSize: "contain",
                backgroundPosition: "center 30%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="noise-overlay" />
              <span className="font-sans text-xs tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm self-start badge-tap">
                <Translate en="Textile Sourcing Core" hi="कपड़ा सोर्सिंग का केंद्र" />
              </span>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium gold-shimmer-text">
                  <Translate en="Haute Zari Threads" hi="उत्कृष्ट जरी धागे" />
                </h3>
                <p className="font-sans text-xs text-expo-warm/60 mt-1 leading-relaxed">
                  <Translate en="High-fidelity metallic weaves crafted specifically for premium bridal suits and wedding heavy-drape sarees." hi="विशेष रूप से प्रीमियम ब्राइडल सूट और भारी शादी की साड़ियों के लिए तैयार की गई बारीक धातुई बुनाई।" />
                </p>
              </div>
            </div>

          </div>

          {/* Right Block: Interactive Staggered Festival Sourcing Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
            {FESTIVALS.map((fest, idx) => (
              <div
                key={idx}
                className="festival-card opacity-0 translate-y-[30px] border-glow-card p-6 flex flex-col justify-between h-[210px] relative group card-tap"
                data-cursor="explore"
              >
                <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 rounded pointer-events-none" />
                <div>
                  <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                    <div>
                      <h4 className="font-serif text-lg text-white font-semibold group-hover:text-expo-gold transition-colors duration-300 gold-shimmer-text">
                        <Translate en={fest.nameEn} hi={fest.nameHi} />
                      </h4>
                      <span className="font-sans text-xs tracking-wide text-expo-warm/60 block mt-0.5">
                        <Translate en={fest.periodEn} hi={fest.periodHi} />
                      </span>
                    </div>
                    <span className="font-sans text-xs tracking-wider text-expo-gold bg-[#D6A066]/10 border border-[#D6A066]/20 px-2 py-0.5 rounded font-bold uppercase shrink-0 badge-tap">
                      <Translate en={fest.demandEn} hi={fest.demandHi} />
                    </span>
                  </div>
                  <p className="font-sans text-xs text-expo-warm/50 leading-relaxed">
                    <Translate en={fest.descEn} hi={fest.descHi} />
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
