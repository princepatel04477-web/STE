"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Factory, Warehouse, Compass, Send, Layers, Palette } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Translate } from "@/components/LanguageContext";
import {
  FadeUp,
  StaggerWrapper,
  StaggerChild,
  TapCard
} from "@/components/animations/MobileAnimations";

const ECOSYSTEM_NODES = [
  {
    icon: <Factory className="w-6 h-6 text-expo-gold" />,
    titleEn: "Manufacturers",
    titleHi: "निर्माता",
    subEn: "Direct Loom Access",
    subHi: "करघों तक सीधी पहुंच",
    descEn: "Connect directly with Surat's industrial weaving, processing and embroidery powerhouses producing large capacity lots.",
    descHi: "सूरत के औद्योगिक बुनाई, प्रसंस्करण और कढ़ाई केंद्रों के साथ सीधे जुड़ें जो बड़ी क्षमता वाले लॉट का उत्पादन करते हैं।",
    statsEn: "650+ Mills Connected",
    statsHi: "650+ मिलें जुड़ीं"
  },
  {
    icon: <Warehouse className="w-6 h-6 text-expo-gold" />,
    titleEn: "Wholesalers",
    titleHi: "थोक व्यापारी",
    subEn: "Bulk Sourcing Scale",
    subHi: "थोक सोर्सिंग पैमाना",
    descEn: "Procure high-volume textile materials, wedding lehengas and festive saree stocks at absolute primary market prices.",
    descHi: "पूर्ण प्राथमिक बाजार कीमतों पर उच्च-मात्रा वाले कपड़े, शादी के लहंगे और उत्सव की साड़ी का स्टॉक खरीदें।",
    statsEn: "15,000+ Catalogs Live",
    statsHi: "15,000+ लाइव कैटलॉग"
  },
  {
    icon: <Compass className="w-6 h-6 text-expo-gold" />,
    titleEn: "Exporters",
    titleHi: "निर्यातक",
    subEn: "Global Supply Networks",
    subHi: "वैश्विक आपूर्ति नेटवर्क",
    descEn: "Ship Surat's world-class fabrics, value-added garments, and ethnic drapes to wholesale trade channels globally.",
    descHi: "सूरत के विश्व स्तरीय कपड़ों, मूल्य वर्धित वस्त्रों और पारंपरिक परिधानों को विश्व स्तर पर थोक व्यापार चैनलों पर भेजें।",
    statsEn: "28+ States Represented",
    statsHi: "28+ राज्यों का प्रतिनिधित्व"
  },
  {
    icon: <Send className="w-6 h-6 text-expo-gold" />,
    titleEn: "Retail Buyers",
    titleHi: "खुदरा खरीदार",
    subEn: "Boutique & Chain Stores",
    subHi: "बुटीक और चेन स्टोर",
    descEn: "Verified retail boutique owners, bridal chain stores, and online fashion brands acquiring pre-season premium stock.",
    descHi: "सत्यापित खुदरा बुटीक मालिक, ब्राइडल चेन स्टोर और ऑनलाइन फैशन ब्रांड प्री-सीजन प्रीमियम स्टॉक प्राप्त कर रहे हैं।",
    statsEn: "8,000+ Verified Buyers",
    statsHi: "8,000+ सत्यापित खरीदार"
  },
  {
    icon: <Layers className="w-6 h-6 text-expo-gold" />,
    titleEn: "Fabric Suppliers",
    titleHi: "कपड़ा आपूर्तिकर्ता",
    subEn: "Raw Material Weaves",
    subHi: "कच्चे माल की बुनाई",
    descEn: "Source raw materials from high-grade crepes, silk yarns, cotton filaments, metallic jacquards to designer prints.",
    descHi: "उच्च श्रेणी के क्रेप्स, रेशमी धागे, सूती फिलामेंट्स, धातु के जैकॉर्ड से लेकर डिजाइनर प्रिंटों तक कच्चे माल की सोर्सिंग करें।",
    statsEn: "Limitless Weaving Options",
    statsHi: "असीमित बुनाई के विकल्प"
  },
  {
    icon: <Palette className="w-6 h-6 text-expo-gold" />,
    titleEn: "Fashion Designers",
    titleHi: "फैशन डिजाइनर",
    subEn: "Couture Design Hub",
    subHi: "कॉउचर डिजाइन हब",
    descEn: "Master craftsmanship and contemporary wedding collections custom-designed by Surat's premier designer teams.",
    descHi: "सूरत के अग्रणी डिजाइनर टीमों द्वारा कस्टम-डिज़ाइन किए गए मास्टर शिल्प कौशल और समकालीन शादी के संग्रह।",
    statsEn: "First-Reveal Collections",
    statsHi: "पहली बार प्रदर्शित होने वाले संग्रह"
  }
];

export default function BusinessEcosystem() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  return (
    <section
      ref={containerRef}
      id="business-ecosystem"
      className="relative w-full py-14 px-5 md:py-24 md:px-8 bg-[#070707] overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-80 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Copper/Amber light effects */}
      <div className="spotlight-glowing left-[20%] top-[10%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[15%] bottom-[10%] w-[40vw] h-[40vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              <Translate en="BUSINESS ECOSYSTEM" hi="व्यापारिक इकोसिस्टम" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="A Global Textile" hi="कपड़ा व्यापार का" /></span> <br />
              <span className="text-metallic font-light italic">
                <Translate en="Commerce Network" hi="एक वैश्विक नेटवर्क" />
              </span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
              <Translate
                en="Surat is not just a city—it is India’s largest, fully integrated textile sourcing machine. Connect with every major node of the textile value chain in a seamless, high-volume environment."
                hi="सूरत सिर्फ एक शहर नहीं है—यह भारत की सबसे बड़ी, पूरी तरह से एकीकृत कपड़ा सोर्सिंग मशीन है। एक सहज और उच्च क्षमता वाले वातावरण में कपड़ा मूल्य श्रृंखला के हर बड़े केंद्र से जुड़ें।"
              />
            </p>
          </FadeUp>
        </div>

        {/* Global Network Graphic backdrop (Dotted map styling) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen z-0">
          <div
            className="w-full h-full bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url('/assets/images/world-map.webp')` }}
          />
        </div>

        {/* Interactive Cards Grid */}
        <StaggerWrapper
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10"
          staggerDelay={0.08}
        >
          {ECOSYSTEM_NODES.map((node, idx) => (
            <StaggerChild key={idx}>
              <TapCard className="h-full">
                <div
                  className="border-glow-card p-6 sm:p-8 bg-black/45 backdrop-blur-xl flex flex-col justify-between group cursor-default transition-all duration-500 hover:-translate-y-1 hover:bg-black/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] card-tap h-full"
                  data-cursor="view"
                >
                  <div>
                    {/* Icon & Label */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-expo-gold/40 group-hover:bg-expo-gold/5 transition-all duration-500">
                        {node.icon}
                      </div>
                      <span className="font-sans text-[9px] tracking-[2.5px] text-expo-gold font-bold uppercase bg-[#D6A066]/10 border border-[#D6A066]/20 px-3 py-1 rounded-full badge-tap">
                        <Translate en={node.statsEn} hi={node.statsHi} />
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl text-white group-hover:text-expo-gold transition-colors duration-500 mb-1">
                      <span className="gold-shimmer-text"><Translate en={node.titleEn} hi={node.titleHi} /></span>
                    </h3>
                    <span className="font-sans text-[10px] tracking-[2px] text-expo-warm/40 uppercase block mb-4">
                      <Translate en={node.subEn} hi={node.subHi} />
                    </span>
                    
                    <p className="font-sans text-xs sm:text-sm text-expo-warm/60 group-hover:text-expo-warm/80 transition-colors duration-500 leading-relaxed">
                      <Translate en={node.descEn} hi={node.descHi} />
                    </p>
                  </div>

                  {/* Stats Footer inside Card */}
                  <div className="border-t border-white/5 pt-6 mt-6 flex justify-between items-center text-[10px] tracking-[2px] uppercase text-expo-gold/70 group-hover:text-expo-gold transition-colors duration-500 font-bold font-sans">
                    <span>
                      <Translate en="Explore Node" hi="नोड देखें" />
                    </span>
                    <span>➔</span>
                  </div>
                </div>
              </TapCard>
            </StaggerChild>
          ))}
        </StaggerWrapper>

      </div>
    </section>
  );
}
