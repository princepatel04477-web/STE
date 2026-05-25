"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";

const GALLERY_ITEMS = [
  {
    title: "Heritage Kanjivaram & Georgette",
    category: "Sarees",
    img: "/assets/images/saree1.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "Intricately detailed silk, georgette, and metallic gold weaves from Surat's master designer looms.",
  },
  {
    title: "Heavy Embroidered Suit Materials",
    category: "Dress Materials",
    img: "/assets/images/salwar-suit.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "Premium salwar kameez fabrics and semi-stitched sets featuring sophisticated festive embroidery.",
  },
  {
    title: "Boutique Fusion Kurtis & Tunics",
    category: "Kurtis",
    img: "/assets/images/kurti.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "Modern everyday elegance and high-end boutique fusion wear crafted for premium retail buyers.",
  },
  {
    title: "Imperial Sherwanis & Indo-Western",
    category: "Menswear",
    img: "/assets/images/sherwani.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-[position:72%_center]",
    desc: "Royal wedding sherwanis, bandhgalas, and designer kurta-pajama fabrics radiating heritage prestige.",
  },
  {
    title: "Value Added Embroidery & Laces",
    category: "Embroidery",
    img: "/assets/images/lehenga.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "Opulent border trims, wedding lehenga panels, and high-density sequin embroidery patterns.",
  },
  {
    title: "Surat Premium Pure Silk Weaves",
    category: "Silk",
    img: "/assets/images/kids-wear.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "Lustrous heavy brocades and authentic raw silk textiles suited for national couture showrooms.",
  },
  {
    title: "Handwoven Cotton & Linen Filaments",
    category: "Cotton",
    img: "/assets/images/festive_editorial_saree.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "Lightweight, highly breathable organic threads curated for spring-summer trade cycles.",
  },
  {
    title: "Bespoke Digital Prints & Jacquards",
    category: "Designer Fabrics",
    img: "/assets/images/fabric-gold.png",
    aspect: "aspect-[3/4.2]",
    bgPosition: "bg-center",
    desc: "High-grade jacquards, organza, crepe, and printed base materials for direct custom production.",
  },
];

export default function FabricInMotion() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Intercept scroll event to allow horizontal scrolling on mouse wheel
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        // Prevent default browser scrolling only if the mouse is hovered over the gallery container
        e.preventDefault();
        scrollContainer.scrollBy({
          left: e.deltaY * 1.5,
          behavior: "smooth"
        });
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <section
      ref={containerRef}
      id="fabric-in-motion"
      className="relative w-full py-24 sm:py-32 bg-[#050505] overflow-hidden border-b border-white/5"
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing right-[10%] top-[10%] w-[40vw] h-[40vw]" />
      <div className="spotlight-glowing left-[5%] bottom-[5%] w-[45vw] h-[45vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 sm:mb-24">
          <div className="max-w-2xl">
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              03 • COUTURE COLLECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-widest text-white leading-tight">
              Fabric in <span className="text-metallic font-light italic">Motion</span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 max-w-sm leading-relaxed">
            Witness the elegant flow of haute couture. A horizontal journey through India&apos;s premier B2B sourcing categories. Use mouse wheel or swipe.
          </p>
        </div>

        {/* Cinematic Backdrop & Text */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-16">
          <div className="col-span-12 md:col-span-5 relative group overflow-hidden border border-white/10 rounded-sm shadow-2xl min-h-[320px] flex flex-col justify-end p-8">
            <video
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.55] group-hover:brightness-[0.7] transition-all duration-700 scale-100 group-hover:scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              src="/assets/video/fabric.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 pointer-events-none" />
            
            <div className="relative z-20">
              <span className="text-[9px] font-bold tracking-[4px] text-expo-gold uppercase mb-2 block">
                Couture Showcase
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide leading-tight mb-4">
                Flowing Textile Drapes
              </h3>
              <p className="font-sans text-xs text-expo-warm/60 leading-relaxed">
                Observe the cinematic micro-weights of luxury weaves under ambient exhibition lighting.
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 flex flex-col justify-center border border-white/5 bg-black/40 backdrop-blur-md p-8 sm:p-12 rounded-sm relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-[300px] h-[300px] bg-expo-gold/5 blur-[80px] pointer-events-none" />
            <h4 className="font-serif text-xl sm:text-2xl text-expo-gold mb-6 italic">
              Premium Sourcing Portfolio
            </h4>
            <p className="font-sans text-sm sm:text-base text-expo-warm/75 leading-relaxed mb-8">
              Explore custom ethnic collections tailored for worldwide B2B distributors. Every fiber represents a synthesis of traditional Indian handloom heritage and modern high-speed production.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              {["SAREES", "SUIT MATERIAL", "DESIGNER SILKS", "CUSTOM FABRICS"].map((cat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-display text-sm text-white font-bold tracking-[1px]">{cat}</span>
                  <span className="font-sans text-[10px] text-expo-warm/40 mt-1">Export Ready</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Gallery */}
        <div className="relative w-full">
          {/* Side Fading Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none hidden sm:block" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none hidden sm:block" />

          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-8 w-full"
            style={{
              scrollSnapType: "x mandatory",
              overscrollBehaviorX: "contain",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {GALLERY_ITEMS.map((item, i) => (
              <div
                key={i}
                className="gallery-card scroll-snap-card opacity-0 translate-y-[40px] flex-shrink-0 w-[82vw] sm:w-[48vw] md:w-[380px] lg:w-[420px] flex flex-col group snap-start"
                data-cursor="explore"
              >
                {/* Image Card Container */}
                <div className={`relative w-full ${item.aspect} overflow-hidden border border-white/10 rounded-sm shadow-xl bg-neutral-950`}>
                  <div
                    className={`absolute inset-0 bg-cover ${item.bgPosition} filter brightness-[0.7] group-hover:brightness-[0.95] group-hover:scale-[1.04] transition-all duration-[800ms] ease-luxury`}
                    style={{ backgroundImage: `url('${item.img}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 z-10 pointer-events-none" />
                  <div className="noise-overlay" />
                  
                  {/* Category Stamp */}
                  <span className="absolute top-4 left-4 z-20 font-sans text-[8px] font-bold tracking-[3px] text-expo-gold bg-black/75 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md uppercase">
                    {item.category}
                  </span>
                </div>

                {/* Captions */}
                <div className="mt-6 flex flex-col">
                  <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide group-hover:text-expo-gold transition-colors duration-500">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs text-expo-warm/50 leading-relaxed mt-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
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
