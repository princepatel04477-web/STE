"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage, Translate } from "@/components/LanguageContext";
import FadeInSection from "@/components/FadeInSection";
import { useInView } from "@/hooks/useInView";
import {
  FadeUp,
  SlideFromLeft,
  SlideFromRight,
  TapCard,
  TapButton
} from "@/components/animations/MobileAnimations";

const PHONE_NUMBER = "919950787787";

const checklistItems = [
  { en: "High-Visibility Corner Stall Space", hi: "उच्च-दृश्यता कोना स्टॉल स्पेस" },
  { en: "VIP B2B Networking Lounge Passes", hi: "VIP B2B नेटवर्किंग लाउंज पास" },
  { en: "Official Exhibitor Directory Profile", hi: "आधिकारिक प्रदर्शक निर्देशिका प्रोफ़ाइल" },
  { en: "Daily Cleaning & Security Services", hi: "दैनिक सफाई और सुरक्षा सेवाएं" }
];

const stallTiers = [
  { id: "100", name: "Starter", nameHi: "स्टार्टर", size: 100, sqm: 9.3, base: 51000, descEn: "Boutique exhibition booth space ideal for startup weavers and local fashion houses.", descHi: "स्टार्टअप बुनकरों और स्थानीय फैशन हाउसों के लिए आदर्श बुटीक प्रदर्शनी बूथ स्थान।" },
  { id: "200", name: "Basic", nameHi: "बेसिक", size: 200, sqm: 18.6, base: 102000, descEn: "Compact layout suitable for regional textile sellers and design studios.", descHi: "क्षेत्रीय कपड़ा विक्रेताओं और डिजाइन स्टूडियो के लिए उपयुक्त कॉम्पैक्ट लेआउट।" },
  { id: "300", name: "Standard", nameHi: "स्टैंडर्ड", size: 300, sqm: 27.9, base: 153000, descEn: "Mid-size pavilion optimized for established fabric suppliers and trade agents.", descHi: "स्थापित कपड़ा आपूर्तिकर्ताओं और व्यापार एजेंटों के लिए अनुकूलित मध्यम आकार का मंडप।" },
  { id: "400", name: "Premium", nameHi: "प्रीमियम", size: 400, sqm: 37.2, base: 204000, descEn: "Large premium exhibit space designed for prominent wholesalers and bridal manufacturers.", descHi: "प्रमुख थोक विक्रेताओं और ब्राइडल निर्माताओं के लिए डिज़ाइन किया गया बड़ा प्रीमियम प्रदर्शनी स्थान।" },
  { id: "600", name: "Pro", nameHi: "प्रो", size: 600, sqm: 55.7, base: 306000, descEn: "High-visibility concourse area optimized for leading apparel and design groups.", descHi: "प्रमुख परिधान और डिजाइन समूहों के लिए अनुकूलित उच्च-दृश्यता वाला कॉनकोर्स क्षेत्र।" },
  { id: "800", name: "Pro Max", nameHi: "प्रो मैक्स", size: 800, sqm: 74.3, base: 408000, descEn: "Colossal booth layout tailored for national textile mills and premium conglomerates.", descHi: "राष्ट्रीय कपड़ा मिलों और प्रीमियम समूहों के लिए विशेष रूप से तैयार किया गया विशाल बूथ लेआउट।" },
  { id: "1000", name: "Ultra Pro Max", nameHi: "अल्ट्रा प्रो मैक्स", size: 1000, sqm: 92.9, base: 510000, descEn: "Ultimate luxury custom-built pavilion for international export conglomerates and market leaders.", descHi: "अंतर्राष्ट्रीय निर्यात समूहों और बाजार के दिग्गजों के लिए अंतिम लक्जरी कस्टम-निर्मित मंडप।" }
];

function SelfDrawingCheckmark() {
  return (
    <svg className="w-4 h-4 text-expo-gold flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <motion.path
        d="M3 8L6.5 11.5L13 4.5"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

export default function StallPackages() {
  const { language } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>("400");
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  const currentCalc = stallTiers.find((t) => t.id === selectedSize) || stallTiers[3];
  const gst = currentCalc.base * 0.18;
  const total = currentCalc.base + gst;

  return (
    <section id="packages" className="relative w-full py-14 px-5 md:py-24 md:px-8 bg-[#050505] overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Glow lights */}
      <div className="spotlight-glowing left-[10%] top-[20%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[10%] bottom-[10%] w-[40vw] h-[40vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <FadeUp delay={0}>
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              <Translate en="STALL EXHIBITION PACKAGES" hi="स्टॉल प्रदर्शनी पैकेज" />
            </span>
          </FadeUp>
          <FadeUp delay={0.06}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <Translate en="Bespoke Exhibition" hi="बेस्पोक प्रदर्शनी" /> <br />
              <span className="text-metallic font-light italic">
                <Translate en="Spaces & Pavilions" hi="स्थान और मंडप" />
              </span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
              <Translate
                en="Select the ideal presence for your brand at STE 2026 Surat. Standardized pricing structured at ₹510/Sqft with 18% GST."
                hi="STE 2026 सूरत में अपने ब्रांड के लिए आदर्श उपस्थिति का चयन करें। ₹510/Sqft पर 18% जीएसटी के साथ मानकीकृत मूल्य निर्धारण।"
              />
            </p>
          </FadeUp>
        </div>

        {/* Featured Stall Packages Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-20">
          
          {/* Card 1: Starter */}
          <SlideFromLeft delay={0} className="h-full">
            <TapCard className="h-full">
              <motion.div
                whileHover={typeof window !== "undefined" && window.innerWidth >= 1024 ? { y: -8, boxShadow: "0 24px 48px rgba(212,175,55,0.15)" } : {}}
                className="relative bg-black/40 border border-white/5 p-8 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 overflow-hidden card-tap"
                style={{ borderTop: "3px solid #D4AF37" }}
              >
                <div>
                  {/* 3x3 Grid Footprint Diagram */}
                  <div className="flex justify-between items-center mb-6">
                    <svg className="w-10 h-10 opacity-30" viewBox="0 0 30 30">
                      {Array.from({ length: 9 }).map((_, idx) => {
                        const row = Math.floor(idx / 3);
                        const col = idx % 3;
                        return (
                          <rect
                            key={idx}
                            x={col * 10}
                            y={row * 10}
                            width="7"
                            height="7"
                            fill="#D4AF37"
                            rx="1"
                          />
                        );
                      })}
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest text-expo-warm/40 font-semibold font-sans">
                      100 Sqft (~9.3 m²)
                    </span>
                  </div>

                  <h3 className="font-serif text-xl lg:text-2xl tracking-wider text-white uppercase mb-3 gold-shimmer-text">
                    Starter
                  </h3>
                  <p className="font-sans text-xs text-expo-warm/60 leading-relaxed mb-6">
                    <Translate
                      en="Standard exhibition booth space perfect for boutique labels, ethnic weavers, and primary textile sellers."
                      hi="बुटीक लेबल, पारंपरिक बुनकरों और प्राथमिक कपड़ा विक्रेताओं के लिए उपयुक्त मानक प्रदर्शनी बूथ स्थान।"
                    />
                  </p>

                  <div className="border-t border-white/5 py-4 flex flex-col gap-2">
                    <span className="text-2xl font-serif text-expo-gold">₹51,000</span>
                    <span className="text-[9px] uppercase tracking-wider text-expo-warm/40 block">
                      +18% GST • <Translate en="Direct Mill Rate (₹510/Sqft)" hi="डायरेक्ट मिल रेट (₹510/Sqft)" />
                    </span>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <a
                    href={`https://wa.me/${PHONE_NUMBER}?text=Hi,%20I'm%20interested%20in%20the%20Starter%20(100%20Sqft)%20stall%20at%20STE%202026`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-[52px] md:h-auto py-3.5 md:py-3 bg-[#0a0a0a] border border-expo-gold/20 rounded-xl md:rounded-md text-expo-gold hover:text-white hover:border-expo-gold text-center text-sm md:text-xs tracking-wider uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 btn-shimmer"
                  >
                    <span>📲</span>
                    <Translate en="Inquire on WhatsApp" hi="व्हाट्सएप द्वारा पूछताछ करें" />
                  </a>
                </div>
              </motion.div>
            </TapCard>
          </SlideFromLeft>

          {/* Card 2: Premium (Popular elevated card) */}
          <FadeUp delay={0.12} className="h-full">
            <TapCard className="h-full">
              <motion.div
                whileHover={typeof window !== "undefined" && window.innerWidth >= 1024 ? { y: -20, boxShadow: "0 24px 48px rgba(212,175,55,0.25)" } : {}}
                className="relative bg-black/50 border border-expo-gold/30 p-8 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 border-l-[4px] border-l-[#D4AF37] lg:border-l lg:-translate-y-4 shadow-xl card-tap gold-border-pulse"
                style={{ borderTop: "3px solid #D4AF37" }}
              >
                {/* Popular Badge */}
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-[#B87333] to-[#D4AF37] px-4 py-1.5 rounded-full border border-expo-gold/40 shadow-md">
                  <span className="text-[9px] text-white tracking-[2.5px] uppercase font-bold font-serif italic">
                    <Translate en="Most Sought" hi="सर्वाधिक लोकप्रिय" />
                  </span>
                </div>

                <div>
                  {/* 6x6 Grid Footprint Diagram */}
                  <div className="flex justify-between items-center mb-6">
                    <svg className="w-10 h-10 opacity-45" viewBox="0 0 60 60">
                      {Array.from({ length: 36 }).map((_, idx) => {
                        const row = Math.floor(idx / 6);
                        const col = idx % 6;
                        return (
                          <rect
                            key={idx}
                            x={col * 10}
                            y={row * 10}
                            width="7"
                            height="7"
                            fill="#D4AF37"
                            rx="1"
                          />
                        );
                      })}
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest text-expo-gold font-bold font-sans">
                      400 Sqft (~37.2 m²)
                    </span>
                  </div>

                  <h3 className="font-serif text-xl lg:text-2xl tracking-wider text-expo-gold uppercase mb-3 font-semibold gold-shimmer-text">
                    Premium
                  </h3>
                  <p className="font-sans text-xs text-expo-warm/75 leading-relaxed mb-6">
                    <Translate
                      en="Elevated premium space designed for medium to large scale manufacturers and prominent PAN-India wholesale trading houses."
                      hi="मध्यम से बड़े पैमाने के निर्माताओं और प्रमुख अखिल भारतीय थोक व्यापारिक घरानों के लिए डिज़ाइन किया गया उन्नत प्रीमियम स्थान।"
                    />
                  </p>

                  <div className="border-t border-white/5 py-4 flex flex-col gap-2">
                    <span className="text-2xl font-serif text-white">₹2,04,000</span>
                    <span className="text-[9px] uppercase tracking-wider text-expo-gold block font-semibold">
                      +18% GST • <Translate en="VIP Concourse Edge (₹510/Sqft)" hi="VIP कॉनकोर्स एज (₹510/Sqft)" />
                    </span>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <a
                    href={`https://wa.me/${PHONE_NUMBER}?text=Hi,%20I'm%20interested%20in%20the%20Premium%20(400%20Sqft)%20stall%20at%20STE%202026`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-[52px] md:h-auto py-3.5 md:py-3 bg-gradient-to-r from-[#B87333] to-[#D4AF37] hover:brightness-105 rounded-xl md:rounded-md text-black text-center text-sm md:text-xs tracking-wider uppercase font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 active:scale-95 btn-shimmer gold-border-pulse"
                  >
                    <span>📲</span>
                    <Translate en="Inquire on WhatsApp" hi="व्हाट्सएप द्वारा पूछताछ करें" />
                  </a>
                </div>
              </motion.div>
            </TapCard>
          </FadeUp>

          {/* Card 3: Ultra Pro Max (Conic gradient rotating border card) */}
          <SlideFromRight delay={0.24} className="h-full">
            <TapCard className="h-full">
              <motion.div
                whileHover={typeof window !== "undefined" && window.innerWidth >= 1024 ? { y: -8, boxShadow: "0 24px 48px rgba(212,175,55,0.25)" } : {}}
                className="rotating-gradient-border relative bg-black/45 p-8 rounded-2xl flex flex-col justify-between h-full transition-all duration-300 overflow-hidden card-tap"
              >
                <div>
                  {/* 10x10 Grid Footprint Diagram */}
                  <div className="flex justify-between items-center mb-6">
                    <svg className="w-10 h-10 opacity-60" viewBox="0 0 100 100">
                      {Array.from({ length: 100 }).map((_, idx) => {
                        const row = Math.floor(idx / 10);
                        const col = idx % 10;
                        return (
                          <rect
                            key={idx}
                            x={col * 10}
                            y={row * 10}
                            width="7"
                            height="7"
                            fill="#D4AF37"
                            rx="0.5"
                          />
                        );
                      })}
                    </svg>
                    <span className="text-[10px] uppercase tracking-widest text-[#FFD700] font-bold font-sans">
                      1000 Sqft (~92.9 m²)
                    </span>
                  </div>

                  <h3 className="font-serif text-xl lg:text-2xl tracking-wider text-[#FFD700] uppercase mb-3 font-semibold gold-shimmer-text">
                    Ultra Pro Max
                  </h3>
                  <p className="font-sans text-xs text-expo-warm/75 leading-relaxed mb-6">
                    <Translate
                      en="Elite luxury bare space for corporate giants, massive weaving conglomerates, and international export partners."
                      hi="कॉर्पोरेट दिग्गजों, विशाल बुनाई समूहों और अंतर्राष्ट्रीय निर्यात भागीदारों के लिए विशिष्ट लक्जरी बेयर स्पेस।"
                    />
                  </p>

                  <div className="border-t border-white/5 py-4 flex flex-col gap-2">
                    <span className="text-2xl font-serif text-expo-gold">₹5,10,000</span>
                    <span className="text-[9px] uppercase tracking-wider text-expo-gold block">
                      +18% GST • <Translate en="Ultra Luxury Concourse (₹510/Sqft)" hi="अल्ट्रा लक्जरी कॉनकोर्स (₹510/Sqft)" />
                    </span>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <a
                    href={`https://wa.me/${PHONE_NUMBER}?text=Hi,%20I'm%20interested%20in%20the%20Ultra%20Pro%20Max%20(1000%20Sqft)%20stall%20at%20STE%202026`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-[52px] md:h-auto py-3.5 md:py-3 bg-[#0c0c0c] border border-expo-gold/40 rounded-xl md:rounded-md text-expo-gold hover:text-white hover:border-[#FFD700] text-center text-sm md:text-xs tracking-wider uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 btn-shimmer"
                  >
                    <span>📲</span>
                    <Translate en="Inquire on WhatsApp" hi="व्हाट्सएप द्वारा पूछताछ करें" />
                  </a>
                </div>
              </motion.div>
            </TapCard>
          </SlideFromRight>

        </div>

        {/* Feature Checklist (With self-drawing checkmarks on scroll) */}
        <FadeInSection className="max-w-4xl mx-auto mb-20 bg-black/40 border border-white/5 p-8 rounded-xl backdrop-blur-md">
          <h4 className="font-serif text-lg text-white text-center mb-6 italic">
            <Translate en="Standard Amenities Included in All Stalls" hi="सभी स्टालों में शामिल मानक सुविधाएं" />
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checklistItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-white/[0.04] text-xs sm:text-sm text-expo-warm/75">
                <SelfDrawingCheckmark />
                <span>
                  <Translate en={item.en} hi={item.hi} />
                </span>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* Stall Size Calculator Component */}
        <FadeInSection className="max-w-4xl mx-auto border border-expo-gold/20 p-8 sm:p-10 rounded-2xl bg-[#0a0a0a]/80 shadow-[0_15px_35px_rgba(214,160,102,0.08)] card-tap">
          <div className="text-center mb-8">
            <span className="text-[9px] tracking-[3px] text-expo-gold uppercase font-bold block mb-2">
              <Translate en="EXHIBITION COST CALCULATOR" hi="प्रदर्शनी लागत कैलकुलेटर" />
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white italic">
              <span className="gold-shimmer-text"><Translate en="Stall Space Cost Estimator" hi="स्टॉल स्पेस लागत अनुमानक" /></span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Size Toggle Buttons */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] tracking-widest uppercase text-expo-warm/50 font-bold block mb-1">
                <Translate en="Select Desired Dimensions" hi="वांछित आयामों का चयन करें" />
              </span>
              
              {/* Mobile: 3 large toggle buttons (full width each) */}
              <div className="flex flex-col gap-3 md:hidden">
                {[
                  { id: "100", label: "3×3m (Starter - 100 Sqft)" },
                  { id: "400", label: "6×6m (Premium - 400 Sqft)" },
                  { id: "1000", label: "9×9m (Ultra Pro Max - 1000 Sqft)" }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setSelectedSize(btn.id)}
                    className={`w-full h-[52px] rounded-xl font-bold text-sm tracking-wider flex items-center justify-center transition-all duration-300 badge-tap active:scale-95 ${
                      selectedSize === btn.id
                        ? "bg-gradient-to-r from-[#B87333] to-[#D4AF37] text-black shadow-md"
                        : "border border-white/20 bg-transparent text-[#F7F4EF]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Desktop: Full grid of all tiers */}
              <div className="hidden md:flex flex-wrap gap-2">
                {stallTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedSize(tier.id)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all duration-300 flex-1 min-w-[80px] badge-tap active:scale-95 ${
                      selectedSize === tier.id
                        ? "bg-gradient-to-r from-[#B87333] to-[#D4AF37] text-black shadow-md"
                        : "bg-white/5 border border-white/10 text-expo-warm/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {tier.size} Sqft
                  </button>
                ))}
              </div>

              <p className="text-xs text-expo-warm/60 leading-relaxed mt-2">
                * <Translate 
                    en={`Size: ~${currentCalc.sqm} m² (${currentCalc.name} - ${currentCalc.descEn})`} 
                    hi={`आकार: ~${currentCalc.sqm} m² (${currentCalc.nameHi} - ${currentCalc.descHi})`} 
                  />
              </p>
            </div>

            {/* Right: Dynamic Cost Breakdown */}
            <div className="bg-black/60 border border-white/10 p-6 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B87333] to-[#D4AF37]" />
              
              <div className="flex flex-col gap-3 font-sans text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-expo-warm/50">
                    <Translate en="Stall Space Tier" hi="स्टॉल स्पेस श्रेणी" />
                  </span>
                  <span className="text-expo-gold font-bold">
                    <Translate en={currentCalc.name} hi={currentCalc.nameHi} />
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-expo-warm/50"><Translate en="Base Stall Cost" hi="आधार स्टॉल लागत" /></span>
                  <span className="text-white font-semibold">₹{currentCalc.base.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-expo-warm/50"><Translate en="GST (18% Service Tax)" hi="जीएसटी (18% सेवा कर)" /></span>
                  <span className="text-white">₹{gst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10 items-center">
                  <span className="text-expo-gold font-bold text-sm sm:text-base"><Translate en="Total Amount" hi="कुल राशि" /></span>
                  <span className="text-[32px] sm:text-3xl font-bold text-expo-gold transition-all duration-300">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/${PHONE_NUMBER}?text=Hi,%20I'm%20interested%20in%20the%20${currentCalc.name}%20(${currentCalc.size}%20Sqft)%20stall%20package%20at%20STE%202026.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-6 h-[52px] bg-[#25D366] hover:bg-[#20ba5a] rounded-xl text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md active:scale-95 btn-shimmer gold-border-pulse"
              >
                <span>📲</span>
                <Translate en="Get Quote on WhatsApp" hi="व्हाट्सएप पर कोटेशन प्राप्त करें" />
              </a>
            </div>
          </div>
        </FadeInSection>

      </div>
    </section>
  );
}
