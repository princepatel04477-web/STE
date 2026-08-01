"use client";

import Image from "next/image";
import { ShieldCheck, Users, Network, TrendingUp } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import OptimizedVideoBg from "@/components/OptimizedVideoBg";
import { Translate } from "@/components/LanguageContext";
import {
  FadeUp,
  SlideFromLeft,
  SlideFromRight,
  StaggerWrapper,
  StaggerChild,
  TapCard
} from "@/components/animations/MobileAnimations";

export default function CollaborationSection() {
  const { ref: headingRef, inView: headingInView } = useInView(0.3);

  return (
    <section
      id="collaboration"
      className="relative w-full py-16 px-5 md:py-28 md:px-8 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-mesh-dark opacity-85 pointer-events-none" />
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <OptimizedVideoBg 
          src="/assets/video/hero.mp4" 
          className="w-full h-full scale-[1.02] filter brightness-[0.24] contrast-[1.05]"
        />
        <div className="noise-overlay z-15" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.05] z-15" />
      </div>
      
      {/* Ambient glowing spots */}
      <div className="spotlight-glowing left-[10%] top-[20%] w-[35vw] h-[35vw] z-10" />
      <div className="spotlight-glowing right-[10%] bottom-[10%] w-[40vw] h-[40vw] z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <FadeUp className="max-w-3xl mb-8 md:mb-16">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            <Translate en="THE POWER COLLABORATION" hi="महा-गठबंधन का प्रभाव" />
          </span>
          <h2
            ref={headingRef}
            className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight heading-underline ${headingInView ? "in-view" : ""}`}
          >
            <span className="gold-shimmer-text">STE × AKAS</span> <br />
            <span className="text-metallic font-light italic">
              <Translate en="Alliance of Industrial Trust" hi="औद्योगिक विश्वास का गठबंधन" />
            </span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            <Translate
              en="Surat Textile Exhibition (STE) joins forces with Adatiya Kapda Association Surat (AKAS) to orchestrate India’s most trusted, verified, and high-impact B2B textile sourcing ecosystem."
              hi="सूरत टेक्सटाइल एक्सहिबिशन (STE) और अड़तिया कपड़ा एसोसिएशन सूरत (AKAS) ने मिलकर भारत के सबसे भरोसेमंद, सत्यापित और उच्च-प्रभाव वाले B2B कपड़ा सोर्सिंग इकोसिस्टम का निर्माण किया है।"
            />
          </p>
        </FadeUp>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-stretch relative">
          
          {/* Connection Lines (SVG) - Visible on desktop */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
            <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 380,220 L 780,220"
                stroke="url(#goldGradientLine)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <path
                d="M 380,360 L 780,360"
                stroke="url(#goldGradientLine)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <defs>
                <linearGradient id="goldGradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D6A066" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#F0C48A" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#B87333" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Left Column: STE - The Sourcing Powerhouse */}
          <SlideFromLeft className="lg:col-span-5 flex z-10" delay={0}>
            <TapCard className="border-glow-card p-8 sm:p-10 bg-black/40 backdrop-blur-md rounded-xl flex flex-col justify-between w-full card-tap">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[9px] tracking-[2px] text-expo-gold border border-expo-gold/30 px-3 py-1 rounded-full uppercase font-bold bg-expo-gold/5">
                    <Translate en="THE EXHIBITION SUMMIT" hi="प्रदर्शनी शिखर सम्मेलन" />
                  </span>
                  <span className="text-xl">🏆</span>
                </div>

                <div className="relative w-36 h-20 mb-6">
                  <Image
                    src="/assets/logo_STE.webp"
                    alt="STE Logo"
                    fill
                    className="object-contain filter drop-shadow-[0_0_8px_rgba(214,160,102,0.25)]"
                  />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-white mb-4">
                  <span className="gold-shimmer-text"><Translate en="Surat Textile Exhibition" hi="सूरत टेक्सटाइल एक्सहिबिशन" /></span>
                </h3>
                
                <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                  <Translate
                    en="STE represents the physical sourcing summit of the year. Orchestrated at the massive SIECC Sarsana Dome, it gathers the elite textile manufacturers under one roof, presenting catalog collections directly to commercial wholesale and retail buyers."
                    hi="STE वर्ष के भौतिक सोर्सिंग शिखर सम्मेलन का प्रतिनिधित्व करता है। विशाल SIECC सरसाना डोम में आयोजित, यह एक छत के नीचे विशिष्ट कपड़ा निर्माताओं को एकत्र करता है, जो सीधे थोक और खुदरा खरीदारों को कैटलॉग संग्रह प्रस्तुत करते हैं।"
                  />
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-4">
                  <div>
                    <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">
                      <Translate en="Capacity:" hi="क्षमता:" />
                    </span>
                    <span className="text-white text-sm font-bold font-sans">
                      <Translate en="650+ Designer Pavilions" hi="650+ डिजाइनर पवेलियन" />
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">
                      <Translate en="Reach:" hi="पहुंच:" />
                    </span>
                    <span className="text-white text-sm font-bold font-sans">
                      <Translate en="80,000+ Sourcing Footfalls" hi="80,000+ सोर्सिंग खरीदार" />
                    </span>
                  </div>
                </div>
              </div>
            </TapCard>
          </SlideFromLeft>

          {/* Center Connector Card (Animated badge) - Visible on desktop */}
          <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center z-15 relative">
            <div className="absolute w-28 h-28 border border-expo-gold/15 rounded-full z-0 flex items-center justify-center">
              <div className="w-24 h-24 border border-expo-gold/5 rounded-full scale-[1.2]" />
            </div>
            
            <div className="relative w-16 h-16 rounded-full bg-[#050505] border border-expo-gold/30 flex items-center justify-center z-10 shadow-lg shadow-black/80">
              <span className="font-serif text-xs font-bold text-expo-gold tracking-widest">
                <Translate en="ALLIED" hi="संबद्ध" />
              </span>
            </div>
          </div>

          {/* Right Column: AKAS - The Foundation of Trust */}
          <SlideFromRight className="lg:col-span-5 flex z-10" delay={0.15}>
            <TapCard className="border-glow-card p-8 sm:p-10 bg-black/40 backdrop-blur-md rounded-xl flex flex-col justify-between w-full card-tap">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[9px] tracking-[2px] text-expo-gold border border-expo-gold/30 px-3 py-1 rounded-full uppercase font-bold bg-expo-gold/5">
                    <Translate en="SUPPORTING ASSOCIATION" hi="समर्थक संघ" />
                  </span>
                  <span className="text-xl">🤝</span>
                </div>

                <div className="relative w-20 h-20 mb-6 bg-white rounded-full p-1 flex items-center justify-center border border-white/10">
                  <Image
                    src="/assets/logo_AKAS.webp"
                    alt="AKAS Logo"
                    width={72}
                    height={72}
                    className="object-contain scale-[1.3]"
                  />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl text-white mb-4">
                  <span className="gold-shimmer-text"><Translate en="Adatiya Kapda Association Surat" hi="अड़तिया कपड़ा एसोसिएशन सूरत" /></span>
                </h3>
                
                <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                  <Translate
                    en="AKAS Surat is the structural foundation of the Surat textile market. Representing the city’s leading weavers, processors, and wholesalers, the association-backed partnership guarantees sourcing safety, verified manufacturer credentials, and direct-to-mill trade trust."
                    hi="AKAS सूरत, सूरत कपड़ा बाजार की संरचनात्मक नींव है। शहर के अग्रणी बुनकरों, प्रोसेसर्स और थोक विक्रेताओं का प्रतिनिधित्व करते हुए, एसोसिएशन समर्थित साझेदारी सोर्सिंग सुरक्षा, सत्यापित निर्माता साख और मिल-टू-डायरेक्ट व्यापार विश्वास की गारंटी देती है।"
                  />
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-4">
                  <div>
                    <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">
                      <Translate en="Ecosystem Trust:" hi="इकोसिस्टम विश्वास:" />
                    </span>
                    <span className="text-white text-sm font-bold font-sans">
                      <Translate en="100% Verified Sellers" hi="100% सत्यापित विक्रेता" />
                    </span>
                  </div>
                  <div>
                    <span className="font-sans text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">
                      <Translate en="Network:" hi="नेटवर्क:" />
                    </span>
                    <span className="text-white text-sm font-bold font-sans">
                      <Translate en="PAN-India Trade Alliances" hi="अखिल भारतीय व्यापार गठबंधन" />
                    </span>
                  </div>
                </div>
              </div>
            </TapCard>
          </SlideFromRight>

        </div>

        {/* Pillars of Partnership Grid */}
        <StaggerWrapper className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mt-16 z-20 relative" staggerDelay={0.08}>
          {[
            {
              icon: <ShieldCheck className="w-5 h-5 text-expo-gold" />,
              titleEn: "Association-Backed Trust",
              titleHi: "संघ समर्थित विश्वास",
              descEn: "Every exhibitor is pre-screened and certified by the AKAS alliance, safeguarding contract integrity.",
              descHi: "अनुबंध की अखंडता की रक्षा करते हुए, AKAS गठबंधन द्वारा प्रत्येक प्रदर्शक की पहले से जांच और प्रमाणन किया जाता है।"
            },
            {
              icon: <Users className="w-5 h-5 text-expo-gold" />,
              titleEn: "Surat Textile Power",
              titleHi: "सूरत कपड़े की शक्ति",
              descEn: "Direct access to Surat's humongous looms, printing processors, and value-added embellishers.",
              descHi: "सूरत के विशाल करघों, प्रिंटिंग प्रोसेसर्स और मूल्य वर्धित सजावटी निर्माताओं तक सीधी पहुँच।"
            },
            {
              icon: <Network className="w-5 h-5 text-expo-gold" />,
              titleEn: "Ecosystem Integration",
              titleHi: "इकोसिस्टम एकीकरण",
              descEn: "A singular platform connecting raw fabric mills, designer houses, logistics partners, and B2B buyers.",
              descHi: "कच्चे कपड़े की मिलों, डिजाइनर हाउसों, लॉजिस्टिक्स भागीदारों और B2B खरीदारों को जोड़ने वाला एक अनूठा मंच।"
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-expo-gold" />,
              titleEn: "Seasonal Trade Surge",
              titleHi: "मौसमी व्यापार में उछाल",
              descEn: "Strategically timed before festive and wedding seasons to maximize retail inventory margins.",
              descHi: "खुदरा इन्वेंट्री मार्जिन को अधिकतम करने के लिए त्योहारों और शादी के सीजन से ठीक पहले रणनीतिक रूप से आयोजित।"
            }
          ].map((pillar, idx) => (
            <StaggerChild key={idx} className="flex">
              <TapCard className="p-6 bg-white/[0.02] border border-white/5 hover:border-expo-gold/25 hover:bg-expo-gold/[0.01] transition-all duration-500 rounded-lg group card-tap flex flex-col w-full">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-expo-gold/30 transition-colors">
                  {pillar.icon}
                </div>
                <h4 className="font-serif text-base text-white group-hover:text-expo-gold transition-colors mb-2">
                  <span className="gold-shimmer-text"><Translate en={pillar.titleEn} hi={pillar.titleHi} /></span>
                </h4>
                <p className="font-sans text-xs text-expo-warm/50 leading-relaxed">
                  <Translate en={pillar.descEn} hi={pillar.descHi} />
                </p>
              </TapCard>
            </StaggerChild>
          ))}
        </StaggerWrapper>

      </div>
    </section>
  );
}
