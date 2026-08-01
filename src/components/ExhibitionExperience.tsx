"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import OptimizedVideoBg from "@/components/OptimizedVideoBg";
import { Translate } from "@/components/LanguageContext";

const EXHIBITION_HIGHLIGHTS = [
  {
    nameEn: "Direct Mill Procurement",
    nameHi: "सीधी मिल खरीद",
    metersEn: "650+ Stalls",
    metersHi: "650+ स्टॉल",
    focusEn: "Source directly from Surat's massive powerloom, weaving, and high-speed processing mills.",
    focusHi: "सूरत की विशाल पावरलूम, बुनाई और हाई-स्पीड प्रोसेसिंग मिलों से सीधे सोर्सिंग करें।",
    coordsEn: "Direct Pricing",
    coordsHi: "सीधी दरें",
  },
  {
    nameEn: "Pre-Season Festive Launch",
    nameHi: "प्री-सीजन उत्सव लॉन्च",
    metersEn: "Sept 12–13",
    metersHi: "12–13 सितंबर",
    focusEn: "Acquire exclusive ethnic and bridal collections ahead of the major wedding & festival seasons.",
    focusHi: "शादी और त्योहारों के बड़े सीजन से पहले विशेष एथनिक और ब्राइडल कलेक्शन प्राप्त करें।",
    coordsEn: "First Reveal",
    coordsHi: "पहला अनावरण",
  },
  {
    nameEn: "Ecosystem Sourcing Opportunities",
    nameHi: "इकोसिस्टम सोर्सिंग के अवसर",
    metersEn: "8,000+ Buyers",
    metersHi: "8,000+ खरीदार",
    focusEn: "Interact with verified domestic and international wholesale trade buyers and distributors.",
    focusHi: "सत्यापित घरेलू और अंतर्राष्ट्रीय थोक व्यापार खरीदारों और वितरकों के साथ बातचीत करें।",
    coordsEn: "PAN India Reach",
    coordsHi: "अखिल भारतीय पहुंच",
  },
  {
    nameEn: "Dedicated B2B Networking Hub",
    nameHi: "समर्पित B2B नेटवर्किंग हब",
    metersEn: "VIP Lounges",
    metersHi: "वीआईपी लाउंज",
    focusEn: "Dedicated private matchmaking lounges for high-volume contract closures and deal signings.",
    focusHi: "बड़े सौदों और अनुबंधों को अंतिम रूप देने के लिए समर्पित निजी लाउंज की सुविधा।",
    coordsEn: "Secure Trade",
    coordsHi: "सुरक्षित व्यापार",
  },
];

export default function ExhibitionExperience() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ref: headingRef, inView: headingInView } = useInView(0.3);

  useEffect(() => {
    const listItems = containerRef.current?.querySelectorAll(".pavilion-item");
    const expCards = containerRef.current?.querySelectorAll(".experience-card");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (listItems && listItems.length > 0) {
              waapi.animate(Array.from(listItems) as unknown as HTMLElement[], {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 800,
                delay: (el, i) => i * 120,
                ease: "outExpo",
              });
            }
            if (expCards && expCards.length > 0) {
              waapi.animate(Array.from(expCards) as unknown as HTMLElement[], {
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 900,
                delay: (el, i) => i * 150,
                ease: "outExpo",
              });
            }
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
      className="relative w-full min-h-[100svh] py-14 px-5 md:py-24 md:px-8 bg-[#050505] flex flex-col justify-center overflow-hidden"
    >
      {/* Background loop walkthrough video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
        <OptimizedVideoBg
          src="/assets/video/exhibition.mp4"
          className="w-full h-full filter brightness-[0.35] contrast-[1.05]"
          fallbackImage="/f_kidswear.jpeg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.05] z-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        {/* Section Header */}
        <FadeUp className="max-w-3xl mb-8 md:mb-16">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            <Translate en="THE EXHIBITION VENUE" hi="प्रदर्शनी स्थल" />
          </span>
          <h2
            ref={headingRef}
            className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight heading-underline ${headingInView ? "in-view" : ""}`}
          >
            <span className="gold-shimmer-text"><Translate en="SIECC, Sarsana Dome" hi="SIECC, सरसाना डोम" /></span> <br />
            <span className="text-metallic font-light italic"><Translate en="Surat’s Sourcing Epicenter" hi="सूरत का सोर्सिंग केंद्र" /></span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            <Translate en="Walk into India’s most prestigious, purpose-built textile arena. SIECC Sarsana Dome, Surat, is architecturally engineered to host the grandest B2B textile trade exhibitions." hi="भारत के सबसे प्रतिष्ठित, उद्देश्य-निर्मित टेक्सटाइल क्षेत्र में प्रवेश करें। SIECC सरसाना डोम, सूरत, भव्यतम B2B कपड़ा व्यापार प्रदर्शनियों की मेजबानी के लिए विशेष रूप से डिज़ाइन किया गया है।" />
          </p>
        </FadeUp>

        {/* Layout: Interactive Blueprint overlays & Pavilions list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Block: Luxury Exhibition Blueprint Cards */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-6">
            
            {/* Concentric Circle Design Layer */}
            <div
              className="experience-card opacity-0 translate-y-[30px] relative w-full sm:w-1/2 aspect-[4/5] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between bg-[#050505] card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.75), rgba(5, 5, 5, 0.75)), url('/assets/images/floor-plan.webp')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm self-start">
                <Translate en="Blueprint Grid" hi="ब्लूप्रिंट ग्रिड" />
              </span>
              <div>
                <h3 className="font-serif text-xl text-white font-medium gold-shimmer-text">
                  <Translate en="VIP Pavilions" hi="वीआईपी पवेलियन" />
                </h3>
                <p className="font-sans text-[10px] text-expo-warm/50 mt-2 leading-relaxed">
                  <Translate en="Concentric architectural designs ensuring fluid pedestrian drapes and transitions." hi="सर्कुलर और विस्तृत आर्किटेक्चरल डिजाइन जो आने-जाने वाले खरीदारों के आसान आवागमन को सुनिश्चित करता है।" />
                </p>
              </div>
            </div>

            {/* Stall visual showcasing draped sarees */}
            <div
              className="experience-card opacity-0 translate-y-[30px] relative w-full sm:w-1/2 aspect-[4/5] border border-white/10 rounded-sm overflow-hidden p-6 flex flex-col justify-between bg-[#050505] card-tap"
              style={{
                backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.65), rgba(5, 5, 5, 0.65)), url('/assets/images/expo-stall.webp')`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              data-cursor="view"
            >
              <div className="noise-overlay" />
              <span className="font-sans text-[8px] tracking-[3px] text-expo-gold uppercase bg-black/60 px-2 py-1 border border-white/5 rounded-sm self-start">
                <Translate en="Design Space" hi="डिजाइन स्पेस" />
              </span>
              <div>
                <h3 className="font-serif text-xl text-white font-medium gold-shimmer-text">
                  <Translate en="Bespoke Stalls" hi="विशेष रूप से निर्मित स्टॉल" />
                </h3>
                <p className="font-sans text-[10px] text-expo-warm/50 mt-2 leading-relaxed">
                  <Translate en="Double-height premium draped SARIS exhibit platforms with custom spotlighting." hi="कस्टम स्पॉटलाइटिंग के साथ डबल-हाइट प्रीमियम ड्रेप्ड साड़ियों के प्रदर्शनी प्लेटफॉर्म।" />
                </p>
              </div>
            </div>

          </div>

          {/* Right Block: Interactive Pavilions Map Indices */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h4 className="font-sans text-[11px] font-bold tracking-[3px] text-expo-gold uppercase border-b border-white/10 pb-4">
              <Translate en="EXHIBITOR ADVANTAGES & SOURCING HIGHLIGHTS" hi="प्रदर्शकों के लाभ और सोर्सिंग की मुख्य विशेषताएं" />
            </h4>

            <div className="flex flex-col divide-y divide-white/5">
              {EXHIBITION_HIGHLIGHTS.map((pav, idx) => (
                <div
                  key={idx}
                  className="pavilion-item opacity-0 translate-y-[30px] py-5 flex items-center justify-between group hover:pl-2 transition-all duration-300 card-tap"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-white font-semibold tracking-wide group-hover:text-expo-gold transition-colors duration-300 gold-shimmer-text">
                        <Translate en={pav.nameEn} hi={pav.nameHi} />
                      </span>
                      <span className="font-sans text-[9px] tracking-[1.5px] text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm badge-tap">
                        <Translate en={pav.coordsEn} hi={pav.coordsHi} />
                      </span>
                    </div>
                    <p className="font-sans text-xs text-expo-warm/50 mt-1 leading-relaxed">
                      <Translate en={pav.focusEn} hi={pav.focusHi} />
                    </p>
                  </div>

                  <span className="font-display text-sm text-expo-gold font-bold tracking-wide">
                    <Translate en={pav.metersEn} hi={pav.metersHi} />
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#D6A066]/5 border border-[#D6A066]/15 p-6 rounded-sm mt-4 card-tap">
              <span className="font-sans text-[9px] tracking-[3px] text-expo-gold font-bold uppercase block mb-2">
                <Translate en="EXHIBITOR BOOKINGS" hi="प्रदर्शक बुकिंग" />
              </span>
              <p className="font-sans text-xs text-expo-warm/70 leading-relaxed">
                <Translate en="Experience high-volume commercial matchmaking. Bookings cover premium booth design, dedicated lounge passes, and automated buyer meetings." hi="उच्च-स्तरीय वाणिज्यिक व्यापार का अनुभव करें। बुकिंग में प्रीमियम बूथ डिजाइन, समर्पित लाउंज पास और स्वचालित खरीदार बैठकें शामिल हैं।" />
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
