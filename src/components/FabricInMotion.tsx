"use client";

import { useEffect, useRef, useState } from "react";
import { waapi } from "animejs";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useInView } from "@/hooks/useInView";
import { FadeUp, StaggerWrapper, StaggerChild } from "@/components/animations/MobileAnimations";
import OptimizedVideoBg from "@/components/OptimizedVideoBg";

import { Translate, useLanguage } from "@/components/LanguageContext";

const GALLERY_ITEMS = [
  {
    titleEn: "Heritage Kanjivaram & Georgette",
    titleHi: "हेरिटेज कांजीवरम और जॉर्जेट",
    categoryEn: "Sarees",
    categoryHi: "साड़ी",
    img: "/assets/images/Saree.webp",
    mobileAspect: "aspect-[4/3]",
    aspect: "sm:aspect-[4/5]",
    bgPosition: "bg-[position:30%_0%] bg-[size:150%_auto]",
    descEn: "Intricately detailed silk, georgette, and metallic gold weaves from Surat's master designer looms.",
    descHi: "सूरत के कुशल बुनकरों द्वारा रेशम, जॉर्जेट और धातुई सुनहरे धागों से तैयार की गई बारीक कलाकृति.",
  },
  {
    titleEn: "Exquisite Designer Blouses",
    titleHi: "उत्कृष्ट डिजाइनर ब्लाउज",
    categoryEn: "Blouses",
    categoryHi: "ब्लाउज",
    img: "/assets/images/blouses-designer.webp",
    mobileAspect: "aspect-[4/5]",
    aspect: "sm:aspect-[4/5]",
    bgPosition: "bg-cover bg-center",
    descEn: "Heavily embellished bridal blouses and couture cholis showcasing exquisite handcraft and zari details.",
    descHi: "शाही दुल्हन के भारी कढ़ाई वाले ब्लाउज और उत्कृष्ट हस्तकला व जरी के विवरणों को दर्शाती हुई चोलियाँ।",
  },
  {
    titleEn: "Heavy Embroidered Suit Materials",
    titleHi: "भारी कढ़ाई वाले सूट मटेरियल",
    categoryEn: "Dress Materials",
    categoryHi: "ड्रेस मटेरियल",
    img: "/assets/images/salwar-suit.webp",
    mobileAspect: "aspect-[4/5]",
    aspect: "sm:aspect-[4/5]",
    bgPosition: "bg-cover bg-center sm:bg-[position:center_18%]",
    descEn: "Premium salwar kameez fabrics and semi-stitched sets featuring sophisticated festive embroidery.",
    descHi: "परिष्कृत उत्सव कढ़ाई वाले प्रीमियम सलवार कमीज फैब्रिक्स और सेमी-स्टिच्ड सेट्स.",
  },
  {
    titleEn: "Boutique Fusion Kurtis & Tunics",
    titleHi: "बुटीक फ्यूजन कुर्तियां और ट्यूनिक्स",
    categoryEn: "Kurtis",
    categoryHi: "कुर्तियां",
    img: "/assets/images/Kurti.webp",
    mobileAspect: "aspect-[4/3]",
    aspect: "sm:aspect-[4/5]",
    bgPosition: "bg-[position:center_0%] bg-[size:150%_auto]",
    descEn: "Modern everyday elegance and high-end boutique fusion wear crafted for premium retail buyers.",
    descHi: "प्रीमियम खुदरा खरीदारों के लिए तैयार किए गए आधुनिक रोजमर्रा के सुरुचिपूर्ण और बुटीक फ्यूजन परिधान.",
  },
  {
    titleEn: "Imperial Sherwanis & Indo-Western",
    titleHi: "शाही शेरवानी और इंडो-वेस्टर्न",
    categoryEn: "Menswear",
    categoryHi: "मेंसवेयर",
    img: "/assets/images/sherwani.webp",
    mobileAspect: "aspect-[4/3]",
    aspect: "sm:aspect-[4/5]",
    bgPosition: "bg-cover bg-[position:73%_center] sm:bg-[position:73%_15%]",
    descEn: "Royal wedding drapes, bandhgalas, and designer ethnic fabrics radiating heritage prestige.",
    descHi: "शाही शादी के परिधान, बंदगला और ऐतिहासिक प्रतिष्ठा को दर्शाने वाले डिजाइनर एथनिक फैब्रिक्स.",
  },
  {
    titleEn: "Value Added Embroidery & Laces",
    titleHi: "वैल्यू एडेड कढ़ाई और लेस",
    categoryEn: "Embroidery",
    categoryHi: "कढ़ाई",
    img: "/assets/images/lehenga.webp",
    mobileAspect: "aspect-[4/5]",
    aspect: "sm:aspect-[4/5]",
    bgPosition: "bg-cover bg-center sm:bg-[position:center_22%]",
    descEn: "Opulent border trims, wedding lehenga panels, and high-density sequin embroidery patterns.",
    descHi: "भव्य बॉर्डर ट्रिम्स, शादी के लहंगे के पैनल और घनी सेक्विन कढ़ाई के आकर्षक पैटर्न.",
  },
  {
    titleEn: "Surat Premium Pure Silk Weaves",
    titleHi: "सूरत प्रीमियम प्योर सिल्क बुनाई",
    categoryEn: "Silk",
    categoryHi: "सिल्क",
    img: "/assets/images/f_kidswear.webp",
    mobileAspect: "aspect-[4/5]",
    aspect: "sm:aspect-[1/1]",
    bgPosition: "bg-[position:center_42%] sm:bg-[position:center_36%] bg-[size:220%_auto]",
    descEn: "Lustrous heavy brocades and authentic raw silk textiles suited for national ethnic showrooms.",
    descHi: "राष्ट्रीय एथनिक शोरूम के लिए उपयुक्त चमकदार ब्रोकेड और प्रामाणिक रॉ सिल्क कपड़े.",
  },
  {
    titleEn: "Handwoven Cotton & Linen Filaments",
    titleHi: "हथकरघा सूती और लिनन धागे",
    categoryEn: "Cotton",
    categoryHi: "कॉटन",
    img: "/assets/images/festive_editorial_saree.webp",
    mobileAspect: "aspect-[1/1]",
    aspect: "sm:aspect-[1/1]",
    bgPosition: "bg-cover bg-center sm:bg-[position:center_20%]",
    descEn: "Lightweight, highly breathable organic threads curated for spring-summer trade cycles.",
    descHi: "वंसत-ग्रीष्मकालीन व्यापार चक्रों के लिए विशेष रूप से तैयार किए गए हल्के और हवादार जैविक कपड़े.",
  },
  {
    titleEn: "Bespoke Digital Prints & Jacquards",
    titleHi: "बेस्पोक डिजिटल प्रिंट और जैक्वार्ड",
    categoryEn: "Designer Fabrics",
    categoryHi: "डिजाइनर फैब्रिक्स",
    img: "/assets/images/fabric-gold.webp",
    mobileAspect: "aspect-[4/3]",
    aspect: "sm:aspect-[1/1]",
    bgPosition: "bg-cover bg-center",
    descEn: "High-grade jacquards, organza, crepe, and printed base materials for direct custom production.",
    descHi: "सीधे कस्टम उत्पादन के लिए उच्च श्रेणी के जैक्वार्ड, ऑर्गेन्जा, क्रेप और मुद्रित आधार सामग्री.",
  },
];

export default function FabricInMotion() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const { ref: headingRef, inView: headingInView } = useInView(0.3);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  useEffect(() => {
    if (!emblaApi) return;
    
    const initTimer = setTimeout(() => {
      if (emblaApi) {
        emblaApi.reInit();
        setScrollSnaps(emblaApi.scrollSnapList());
      }
    }, 100);

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onSelect);
    return () => {
      clearTimeout(initTimer);
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    if (containerRef.current && isDesktop) {
      // Reveal animation on load/scroll
      const cards = containerRef.current?.querySelectorAll(".gallery-card");
      if (!cards) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(Array.from(cards) as unknown as HTMLElement[], {
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 1000,
                delay: (el, i) => i * 120,
                ease: "outExpo",
              });
              observer.disconnect();
            }
          });
        },
        { threshold: 0.05 }
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <section
      ref={containerRef}
      id="fabric-in-motion"
      className="relative w-full py-14 px-5 md:py-32 md:px-8 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing right-[10%] top-[10%] w-[40vw] h-[40vw]" />
      <div className="spotlight-glowing left-[5%] bottom-[5%] w-[45vw] h-[45vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Section Header */}
        <FadeUp className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-16">
          <div className="max-w-2xl">
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              <Translate en="COUTURE COLLECTION" hi="फैशन संग्रह" />
            </span>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest text-white leading-tight heading-underline ${headingInView ? "in-view" : ""}`}
            >
              <span className="gold-shimmer-text"><Translate en="Fabric in " hi="परिधान की " /></span><span className="text-metallic font-light italic"><Translate en="Motion" hi="गतिशीलता" /></span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 max-w-sm leading-relaxed">
            <Translate en="Witness the elegant flow of haute couture. A journey through India's premier B2B sourcing categories." hi="हाइ-फैशन के सुरुचिपूर्ण प्रवाह का अनुभव करें। भारत की प्रमुख बी2बी सोर्सिंग श्रेणियों की एक यात्रा।" />
          </p>
        </FadeUp>

        {/* Cinematic Backdrop & Text */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-16">
          <div className="col-span-12 md:col-span-5 relative group overflow-hidden border border-white/10 rounded-sm shadow-2xl min-h-[320px] flex flex-col justify-end p-8 card-tap">
            <OptimizedVideoBg
              src="/assets/video/fabric.mp4"
              className="absolute inset-0 w-full h-full filter brightness-[0.55] group-hover:brightness-[0.7] transition-all duration-700 scale-100 group-hover:scale-[1.03]"
              fallbackImage="/assets/images/fabric-gold.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />
            
            <div className="relative z-20">
              <span className="text-[9px] font-bold tracking-[4px] text-expo-gold uppercase mb-2 block">
                <Translate en="Couture Showcase" hi="उत्कृष्ट परिधान प्रदर्शन" />
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide leading-tight mb-4 gold-shimmer-text">
                <Translate en="Flowing Textile Drapes" hi="प्रवाहमान वस्त्र कला" />
              </h3>
              <p className="font-sans text-xs text-expo-warm/60 leading-relaxed">
                <Translate en="Observe the cinematic drapes of luxury ethnic weaves under ambient exhibition lighting." hi="प्रदर्शनी की सुंदर रोशनी में लक्जरी एथनिक बुनाई के कलात्मक प्रदर्शन को करीब से देखें।" />
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 flex flex-col justify-center border border-white/5 bg-black/40 backdrop-blur-md p-8 sm:p-12 rounded-sm relative overflow-hidden card-tap">
            <div className="absolute right-[-10%] top-[-10%] w-[300px] h-[300px] bg-expo-gold/5 blur-[80px] pointer-events-none" />
            <h4 className="font-serif text-xl sm:text-2xl text-expo-gold mb-6 italic gold-shimmer-text">
              <Translate en="Premium Sourcing Portfolio" hi="प्रीमियम सोर्सिंग पोर्टफोलियो" />
            </h4>
            <p className="font-sans text-sm sm:text-base text-expo-warm/75 leading-relaxed mb-8">
              <Translate en="Explore custom ethnic collections tailored for worldwide B2B distributors. Every fiber represents a synthesis of traditional Indian handloom heritage and modern high-speed production." hi="दुनिया भर के बी2बी वितरकों के लिए तैयार किए गए कस्टम एथनिक संग्रह का अन्वेषण करें। हर एक धागा पारंपरिक भारतीय हथकरघा विरासत और आधुनिक तीव्र गति उत्पादन के संगम का प्रतिनिधित्व करता है।" />
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-white/10">
              {[
                { en: "SAREES", hi: "साड़ी" },
                { en: "SUIT MATERIAL", hi: "सूट मटेरियल" },
                { en: "DESIGNER BLOUSES", hi: "डिजाइनर ब्लाउज" },
                { en: "DESIGNER SILKS", hi: "डिजाइनर सिल्क" },
                { en: "CUSTOM FABRICS", hi: "कस्टम फैब्रिक्स" }
              ].map((cat, idx) => (
                <div key={idx} className="flex flex-col badge-tap">
                  <span className="font-display text-sm text-white font-bold tracking-[1px]">
                    <Translate en={cat.en} hi={cat.hi} />
                  </span>
                  <span className="font-sans text-[10px] text-expo-warm/40 mt-1">
                    <Translate en="Export Ready" hi="निर्यात के लिए तैयार" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Editorial Grid / Mobile Embla Carousel */}
        <div className="relative w-full overflow-visible">
          {/* Mobile View (Carousel) */}
          <div className="block md:hidden">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {GALLERY_ITEMS.map((item, i) => (
                  <div
                    key={i}
                    className="gallery-card flex-[0_0_85%] pl-4 flex flex-col group card-tap"
                  >
                    {/* Image Card Container */}
                    <div className={`relative w-full ${item.mobileAspect} overflow-hidden border border-white/10 rounded-sm shadow-xl bg-neutral-950`}>
                      <div
                        className={`absolute inset-0 bg-no-repeat ${item.bgPosition} filter brightness-[0.82]`}
                        style={{ backgroundImage: `url('${item.img}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 z-10 pointer-events-none" />
                      <div className="noise-overlay" />
                      
                      {/* Category Stamp */}
                      <span className="absolute top-4 left-4 z-20 font-sans text-[8px] font-bold tracking-[3px] text-expo-gold bg-black/75 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md uppercase badge-tap">
                        <Translate en={item.categoryEn} hi={item.categoryHi} />
                      </span>
                    </div>
 
                    {/* Captions */}
                    <div className="mt-4 flex flex-col">
                      <h3 className="font-serif text-base text-white tracking-wide gold-shimmer-text">
                        <Translate en={item.titleEn} hi={item.titleHi} />
                      </h3>
                      <p className="font-sans text-[11px] text-expo-warm/50 leading-relaxed mt-1">
                        <Translate en={item.descEn} hi={item.descHi} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 badge-tap ${
                    index === selectedIndex ? "bg-expo-gold" : "bg-expo-copper/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop View (Grid) */}
          <div className="hidden md:block">
            <StaggerWrapper
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 w-full"
              staggerDelay={0.08}
            >
              {GALLERY_ITEMS.map((item, i) => (
                <StaggerChild key={i} className="w-full flex flex-col">
                  <div
                    className="gallery-card w-full flex flex-col group card-tap"
                    data-cursor="explore"
                  >
                    {/* Image Card Container */}
                    <div className={`relative w-full ${item.mobileAspect} ${item.aspect} overflow-hidden border border-white/10 rounded-sm shadow-xl bg-neutral-950`}>
                      <div
                        className={`absolute inset-0 bg-no-repeat ${item.bgPosition} filter brightness-[0.82] sm:brightness-[0.7] group-hover:brightness-[0.95] sm:group-hover:scale-[1.04] transition-all duration-[800ms] ease-luxury`}
                        style={{ backgroundImage: `url('${item.img}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 z-10 pointer-events-none" />
                      <div className="noise-overlay" />
                      
                      {/* Category Stamp */}
                      <span className="absolute top-4 left-4 z-20 font-sans text-[8px] font-bold tracking-[3px] text-expo-gold bg-black/75 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md uppercase badge-tap">
                        <Translate en={item.categoryEn} hi={item.categoryHi} />
                      </span>
                    </div>
    
                    {/* Captions */}
                    <div className="mt-6 flex flex-col">
                      <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide group-hover:text-expo-gold transition-colors duration-500 gold-shimmer-text">
                        <Translate en={item.titleEn} hi={item.titleHi} />
                      </h3>
                      <p className="font-sans text-xs text-expo-warm/50 leading-relaxed mt-2">
                        <Translate en={item.descEn} hi={item.descHi} />
                      </p>
                    </div>
                  </div>
                </StaggerChild>
              ))}
            </StaggerWrapper>
          </div>
        </div>
      </div>
      
            {/* Hide Scrollbar Style Inject */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none !important;
        }
        .scrollbar-none {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
    </section>
  );
}
