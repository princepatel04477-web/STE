"use client";

import { useEffect, useRef, useState } from "react";
import { waapi } from "animejs";

const TESTIMONIALS = [
  {
    quote: "STE Surat has become our primary sourcing event of the year. Direct manufacturer pricing coupled with verified boutique-grade catalogs helped us increase our seasonal margins by 28%.",
    author: "Rajesh K. Mehta",
    company: "Mehta Ethnic Silks, Bengaluru",
    role: "Managing Wholesaler",
    stars: 5,
    location: "Karnataka"
  },
  {
    quote: "Exhibiting at STE Surat 2025 gave us direct exposure to retail chains in East and South India. We booked bulk orders worth 80 Lakhs in three days. Absolutely indispensable platform.",
    author: "Dinesh Bhai Patel",
    company: "Ambika Creation, Surat",
    role: "Lead Manufacturer",
    stars: 5,
    location: "Gujarat"
  },
  {
    quote: "As a boutique owner from Delhi, finding authentic, high-quality handloom and value-added kurtis was a challenge until we visited STE Surat. The scale of manufacturers is unparalleled.",
    author: "Priyanka Sen",
    company: "Sia Ethnic Wear, New Delhi",
    role: "Founder & Creative Director",
    stars: 5,
    location: "NCR"
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
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
      className="relative w-full py-24 sm:py-32 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      
      {/* Light spots */}
      <div className="spotlight-glowing left-[15%] top-[10%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[15%] bottom-[15%] w-[40vw] h-[40vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 w-full">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            05 • TRUST, EXPERIENCE & SOCIAL PROOF
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white leading-tight">
            Ecosystem Built on <br />
            <span className="text-metallic font-light italic">Industrial Credibility</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-6 max-w-xl">
            Surat Textile Exhibition (STE) is backed by Surat’s most prominent industrial organizations and media partners, ensuring a safe, verified B2B transaction space.
          </p>
        </div>

        {/* 2x2 Grid for Social Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mb-16">
          
          {/* Left Block: Organizer Profile & Credentials */}
          <div className="trust-animate opacity-0 translate-y-[25px] lg:col-span-6 border-glow-card p-8 sm:p-10 bg-black/45 backdrop-blur-md rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] tracking-[2.5px] text-expo-gold uppercase block mb-3 font-bold">
                Ecosystem Organizer
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white mb-6">
                Supported by <span className="text-expo-gold font-bold">AKAS Group</span>
              </h3>
              <p className="font-sans text-xs sm:text-sm text-expo-warm/70 leading-relaxed mb-6">
                The AKAS Group is Surat&apos;s leading alliance of textile weaving, processing, and machinery manufacturers. By partnering with AKAS, STE 2026 ensures that every single exhibitor stall represents genuine manufacturing power, high capital capacity, and verified B2B catalog pipelines.
              </p>
            </div>

            {/* Media logos panel */}
            <div className="border-t border-white/10 pt-6 mt-4">
              <span className="text-[8px] tracking-[2px] text-expo-warm/40 uppercase block mb-4 font-bold">
                PROMINENT MEDIA COVERAGE & ALLIANCE
              </span>
              <div className="flex flex-wrap items-center gap-6 opacity-60">
                <span className="font-serif text-xs font-bold text-white tracking-[2px]">GUJARAT SAMACHAR</span>
                <span className="font-sans text-xs font-extrabold text-white tracking-[1.5px]">TEXTILE TODAY</span>
                <span className="font-serif text-xs italic font-bold text-expo-gold tracking-[1px]">DIVYA BHASKAR</span>
                <span className="font-sans text-xs font-bold text-white tracking-[2px]">SURAT CHRONICLES</span>
              </div>
            </div>
          </div>

          {/* Right Block: Previous Milestones Gallery & Testimonials */}
          <div className="lg:col-span-6 flex flex-col gap-6 items-stretch">
            
            {/* Previous event stats */}
            <div className="trust-animate opacity-0 translate-y-[25px] border-glow-card p-6 bg-black/40 backdrop-blur-md rounded-xl grid grid-cols-2 gap-4">
              {PREVIOUS_EVENTS.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-serif text-base text-expo-gold font-bold">STE {item.year}</span>
                    <span className="text-[8px] bg-expo-gold/10 border border-expo-gold/20 text-expo-gold px-2 py-0.5 rounded-full uppercase font-bold">Verified</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <span className="text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Wholesalers:</span>
                      <span className="text-white text-sm font-bold">
                        <AnimatedCounter value={item.visitors} />
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Stalls Booked:</span>
                      <span className="text-white text-sm font-bold">
                        <AnimatedCounter value={item.stalls} />
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/5 pt-2">
                    <span className="text-[8px] text-expo-warm/40 uppercase block tracking-[1px]">Trade Volume:</span>
                    <span className="text-expo-gold text-sm font-extrabold">
                      <AnimatedCounter value={item.transactions} />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials Slider */}
            <div className="trust-animate opacity-0 translate-y-[25px] border-glow-card p-8 bg-gold-gradient/5 rounded-xl border border-expo-gold/20 flex-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-[-10%] top-[-10%] w-[120px] h-[120px] bg-expo-gold/10 blur-[40px] pointer-events-none" />
              
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4 text-expo-gold">
                  {Array.from({ length: TESTIMONIALS[activeTestimonial].stars }).map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>

                <p className="font-serif text-sm sm:text-base text-white/90 italic leading-relaxed mb-6">
                  &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                <div>
                  <h4 className="font-sans text-xs font-bold text-white uppercase tracking-[1px]">
                    {TESTIMONIALS[activeTestimonial].author}
                  </h4>
                  <span className="text-[9px] text-expo-warm/50 block mt-0.5">
                    {TESTIMONIALS[activeTestimonial].company}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 text-white transition-colors duration-300"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveTestimonial((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 text-white transition-colors duration-300"
                  >
                    ›
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
