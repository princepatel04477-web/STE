"use client";

import { useEffect, useRef, useState } from "react";
import { waapi } from "animejs";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";

const TESTIMONIALS = [
  {
    quoteEn: "STE Surat has become our primary sourcing event of the year. Direct manufacturer pricing coupled with verified boutique-grade catalogs helped us increase our seasonal margins by 28%.",
    quoteHi: "सूरत का STE हमारे साल का सबसे प्रमुख सोर्सिंग इवेंट बन गया है। निर्माताओं से सीधे मिलने वाली दरों और सत्यापित बुटीक-स्तरीय कैटलॉग ने हमारे त्योहारी मुनाफे को 28% तक बढ़ाने में मदद की।",
    authorEn: "Rajesh K. Mehta",
    authorHi: "राजेश के. मेहता",
    companyEn: "Mehta Ethnic Silks, Bengaluru",
    companyHi: "मेहता एथनिक सिल्क, बेंगलुरु",
    roleEn: "Managing Wholesaler",
    roleHi: "प्रबंधक थोक विक्रेता",
    stars: 5,
    locationEn: "Karnataka",
    locationHi: "कर्नाटक"
  },
  {
    quoteEn: "Exhibiting at STE Surat 2025 gave us direct exposure to retail chains in East and South India. We booked bulk orders worth 80 Lakhs in two days. Absolutely indispensable platform.",
    quoteHi: "STE सूरत 2025 में प्रदर्शनी लगाने से हमें पूर्वी और दक्षिणी भारत के रिटेल चेन तक सीधे पहुंच मिली। हमने दो दिनों में 80 लाख रुपये के थोक ऑर्डर बुक किए। वास्तव में एक अनिवार्य प्लेटफॉर्म।",
    authorEn: "Dinesh Bhai Patel",
    authorHi: "दिनेश भाई पटेल",
    companyEn: "Ambika Creation, Surat",
    companyHi: "अंबिका क्रिएशन, सूरत",
    roleEn: "Lead Manufacturer",
    roleHi: "प्रमुख निर्माता",
    stars: 5,
    locationEn: "Gujarat",
    locationHi: "गुजरात"
  },
  {
    quoteEn: "As a boutique owner from Delhi, finding authentic, high-quality handloom and value-added kurtis was a challenge until we visited STE Surat. The scale of manufacturers is unparalleled.",
    quoteHi: "दिल्ली से एक बुटीक मालिक होने के नाते, प्रामाणिक, उच्च-गुणवत्ता वाले हथकरघा और कुर्तियों की खोज हमारे लिए एक चुनौती थी, जब तक कि हम STE सूरत नहीं गए। निर्माताओं का पैमाना बेजोड़ है।",
    authorEn: "Priyanka Sen",
    authorHi: "प्रियंका सेन",
    companyEn: "Sia Ethnic Wear, New Delhi",
    companyHi: "सिया एथनिक वियर, नई दिल्ली",
    roleEn: "Founder & Creative Director",
    roleHi: "संस्थापक और रचनात्मक निदेशक",
    stars: 5,
    locationEn: "NCR",
    locationHi: "एनसीआर"
  }
];

function AnimatedCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current || animatedRef.current) return;

    const startCounting = () => {
      const numMatch = value.match(/([^\d]*)([\d,.]+)([^\d]*)/);
      if (!numMatch) {
        setDisplayValue(value);
        return;
      }

      const prefix = numMatch[1] || "";
      const rawNumberStr = numMatch[2] || "";
      const suffix = numMatch[3] || "";
      const hasCommas = rawNumberStr.includes(",");
      const finalNumber = parseFloat(rawNumberStr.replace(/,/g, ""));

      if (isNaN(finalNumber)) {
        setDisplayValue(value);
        return;
      }

      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = progress * (2 - progress);
        const currentVal = Math.floor(easeProgress * finalNumber);
        
        let formattedNumber = "";
        if (hasCommas) {
          formattedNumber = currentVal.toLocaleString("en-IN");
        } else {
          formattedNumber = currentVal.toString();
        }

        setDisplayValue(`${prefix}${formattedNumber}${suffix}`);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            startCounting();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={elementRef}>{displayValue}</span>;
}

const PREVIOUS_EVENTS = [
  { year: "2025", visitors: "6,500+", transactions: "₹45 Cr+", stalls: "450+" },
  { year: "2024", visitors: "5,200+", transactions: "₹32 Cr+", stalls: "320+" },
];

export default function TrustSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const { ref: headingRef, inView: headingInView } = useInView<HTMLHeadingElement>(0.3);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  useEffect(() => {
    if (!emblaApi) return;
    setTimeout(() => {
      if (emblaApi) setScrollSnaps(emblaApi.scrollSnapList());
    }, 0);
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const elements = containerRef.current?.querySelectorAll(".trust-animate");
              if (elements) {
                waapi.animate(Array.from(elements) as unknown as HTMLElement[], {
                  opacity: [0, 1],
                  translateY: [25, 0],
                  duration: 800,
                  delay: (el, i) => i * 150,
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
      id="trust-section"
      className="relative w-full py-14 px-5 md:py-24 md:px-8 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Light spots */}
      <div className="spotlight-glowing left-[15%] top-[10%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[15%] bottom-[15%] w-[40vw] h-[40vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        
        {/* Header */}
        <div className="max-w-3xl mb-8 md:mb-16">
          <FadeUp delay={0}>
            <span className="text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              <Translate en="TRUST, EXPERIENCE & SOCIAL PROOF" hi="विश्वास, अनुभव और सामाजिक प्रमाण" />
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2
              ref={headingRef}
              className={`font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide text-white leading-tight heading-underline ${
                headingInView ? "in-view" : ""
              }`}
            >
              <span className="gold-shimmer-text"><Translate en="Ecosystem Built on" hi="व्यापारिक विश्वसनीयता" /></span> <br />
              <span className="text-metallic font-light italic"><Translate en="Industrial Credibility" hi="औद्योगिक साख और विश्वास पर" /></span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
              <Translate en="Surat Textile Exhibition (STE) is backed by Surat's most prominent industrial organizations and media partners, ensuring a safe, verified B2B transaction space." hi="सूरत टेक्सटाइल एक्सहिबिशन (STE) सूरत के सबसे प्रमुख औद्योगिक संगठनों और मीडिया भागीदारों द्वारा समर्थित है, जो एक सुरक्षित, सत्यापित बी2बी लेनदेन क्षेत्र सुनिश्चित करता है।" />
            </p>
          </FadeUp>
        </div>

        {/* 2x2 Grid for Social Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mb-16">
          
          {/* Left Block: Organizer Profile & Credentials */}
          <div className="trust-animate opacity-0 translate-y-[25px] lg:col-span-6 border-glow-card p-8 sm:p-10 bg-black/45 md:backdrop-blur-sm rounded-xl flex flex-col justify-between card-tap">
            <div>
              <span className="text-xs tracking-[2.5px] text-expo-gold uppercase block mb-3 font-bold">
                <Translate en="Ecosystem Organizer" hi="इकोसिस्टम आयोजक" />
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white mb-6">
                <Translate en="Supported by " hi="समर्थित " /><span className="text-expo-gold font-bold"><Translate en="AKAS Group" hi="AKAS ग्रुप द्वारा" /></span>
              </h3>
              <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                <Translate en="The AKAS Group is Surat's leading alliance of textile weaving, processing, and machinery manufacturers. By partnering with AKAS, STE 2026 ensures that every single exhibitor stall represents genuine manufacturing power, high capital capacity, and verified B2B catalog pipelines." hi="AKAS ग्रुप सूरत के टेक्सटाइल बुनाई, प्रोसेसिंग और मशीनरी निर्माताओं का प्रमुख संगठन है। AKAS के साथ साझेदारी करके, STE 2026 यह सुनिश्चित करता है कि प्रत्येक प्रदर्शक स्टॉल वास्तविक विनिर्माण क्षमता, उच्च पूंजी क्षमता और सत्यापित बी2बी कैटलॉग पाइपलाइनों का प्रतिनिधित्व करे।" />
              </p>
            </div>

            {/* Media logos panel */}
            <div className="border-t border-white/10 pt-6 mt-4">
              <span className="text-xs tracking-[2px] text-expo-warm/60 uppercase block mb-4 font-bold">
                <Translate en="PROMINENT MEDIA COVERAGE & ALLIANCE" hi="प्रमुख मीडिया कवरेज और गठबंधन" />
              </span>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                <span className="font-serif text-xs font-bold text-white tracking-[2px]">SURAT TEXTILE NETWORK</span>
                <span className="font-sans text-xs font-extrabold text-white tracking-[1.5px]">TEXTILE WORLD</span>
              </div>
            </div>
          </div>

          {/* Right Block: Previous Milestones Gallery & Testimonials */}
          <div className="lg:col-span-6 flex flex-col gap-6 items-stretch">
            
            {/* Previous event stats */}
            <div className="trust-animate opacity-0 translate-y-[25px] border-glow-card p-6 bg-black/40 md:backdrop-blur-sm rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 card-tap">
              {PREVIOUS_EVENTS.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg badge-tap active:scale-95">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-serif text-base text-expo-gold font-bold">STE {item.year}</span>
                    <span className="text-[10px] bg-expo-gold/10 border border-expo-gold/20 text-expo-gold px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      <Translate en="Verified" hi="सत्यापित" />
                    </span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] text-expo-warm/60 uppercase tracking-wider">
                        <Translate en="Wholesalers" hi="थोक खरीदार" />
                      </span>
                      <span className="text-white text-sm font-bold">
                        <AnimatedCounter value={item.visitors} />
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] text-expo-warm/60 uppercase tracking-wider">
                        <Translate en="Stalls Booked" hi="बुक किए गए स्टॉल" />
                      </span>
                      <span className="text-white text-sm font-bold">
                        <AnimatedCounter value={item.stalls} />
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 border-t border-white/5 pt-2 mt-1">
                      <span className="text-[11px] text-expo-warm/60 uppercase tracking-wider">
                        <Translate en="Trade Volume" hi="कुल व्यापार" />
                      </span>
                      <span className="text-expo-gold text-sm font-extrabold">
                        <AnimatedCounter value={item.transactions} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials Slider */}
            <div className="trust-animate opacity-0 translate-y-[25px] border-glow-card bg-gold-gradient/5 rounded-xl border border-expo-gold/20 flex-1 overflow-hidden relative flex flex-col justify-between card-tap gold-border-pulse">
              <div className="absolute right-[-10%] top-[-10%] w-[120px] h-[120px] bg-expo-gold/10 blur-[40px] pointer-events-none" />
              
              <div ref={emblaRef} className="w-full overflow-hidden flex-1">
                <div className="flex w-full">
                  {TESTIMONIALS.map((testimonial, idx) => (
                    <div key={idx} className="flex-[0_0_100%] p-8 flex flex-col justify-between min-h-[200px]">
                      <div>
                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-4 text-expo-gold">
                          {Array.from({ length: testimonial.stars }).map((_, i) => (
                            <span key={i} className="text-sm">★</span>
                          ))}
                        </div>

                        <p className="font-serif text-sm sm:text-base text-white/90 italic leading-relaxed mb-6">
                          &ldquo;<Translate en={testimonial.quoteEn} hi={testimonial.quoteHi} />&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                        <div>
                          <h4 className="font-sans text-xs font-bold text-white uppercase tracking-[1px]">
                            <Translate en={testimonial.authorEn} hi={testimonial.authorHi} />
                          </h4>
                          <span className="text-xs text-expo-warm/50 block mt-0.5">
                            <Translate en={testimonial.companyEn} hi={testimonial.companyHi} />
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              emblaApi?.scrollPrev();
                            }}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 text-white transition-colors duration-300"
                            aria-label="Previous testimonial"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              emblaApi?.scrollNext();
                            }}
                            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 text-white transition-colors duration-300"
                            aria-label="Next testimonial"
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 pb-4">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === selectedIndex ? "bg-expo-gold" : "bg-expo-copper/30"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>        </div>

          </div>

        </div>

      </div>
    </section>
  );
}
