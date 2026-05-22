"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";

const GALLERY_ITEMS = [
  {
    title: "Heritage Sarees",
    category: "Sarees",
    img: "/assets/images/saree1.png",
    aspect: "aspect-[3/4]",
    bgPosition: "bg-center",
    desc: "Intricately detailed silk, georgette and metallic gold weaves from Surat's master designers.",
    span: "col-span-12 md:col-span-4",
  },
  {
    title: "Luxury Lehenga Choli",
    category: "Lehenga Choli",
    img: "/assets/images/lehenga.png",
    aspect: "aspect-[4/3]",
    bgPosition: "bg-center",
    desc: "Opulent wedding and ceremonial lehengas adorned with precision handcraft and heavy zari work.",
    span: "col-span-12 md:col-span-8",
  },
  {
    title: "Designer Salwar Suits",
    category: "Salwar Suit",
    img: "/assets/images/salwar-suit.png",
    aspect: "aspect-square",
    bgPosition: "bg-center",
    desc: "Premium salwar kameez fabrics and semi-stitched sets featuring sophisticated festive embroidery.",
    span: "col-span-12 md:col-span-6",
  },
  {
    title: "Contemporary Kurtis",
    category: "Kurti",
    img: "/assets/images/kurti.png",
    aspect: "aspect-square",
    bgPosition: "bg-center",
    desc: "Modern everyday elegance and high-end boutique fusion wear crafted for daily fashion buyers.",
    span: "col-span-12 md:col-span-6",
  },
  {
    title: "Sherwani & Men's Ethnic",
    category: "Sherwani & Men's Ethnic Wear",
    img: "/assets/images/sherwani.png",
    aspect: "aspect-[3/4]",
    bgPosition: "bg-[position:72%_center]",
    desc: "Royal wedding sherwanis, bandhgalas, and kurta-pajama fabrics radiating masculine prestige.",
    span: "col-span-12 md:col-span-4",
  },
  {
    title: "Value Added Fabrics",
    category: "Fabrics",
    img: "/assets/images/fabric-gold.png",
    aspect: "aspect-[4/3]",
    bgPosition: "bg-center",
    desc: "High-grade jacquards, organza, crepe, and printed base materials for direct bulk sourcing.",
    span: "col-span-12 md:col-span-8",
  },
  {
    title: "Premium Kids Ethnic Wear",
    category: "Kids Wear",
    img: "/assets/images/kids-wear.png",
    aspect: "aspect-[3/4]",
    bgPosition: "bg-center",
    desc: "Comfortable, vibrant, and highly durable traditional wear tailored beautifully for children.",
    span: "col-span-12 md:col-span-6",
  },
  {
    title: "Festive Editorial Sarees",
    category: "Sarees",
    img: "/assets/images/saree2.jpg",
    aspect: "aspect-[4/3]",
    bgPosition: "bg-center",
    desc: "Exclusive designer collection showcasing rich zari borders and luxurious drapes.",
    span: "col-span-12 md:col-span-6",
  },
];

export default function FabricInMotion() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reveal animation on load/scroll
    const cards = containerRef.current?.querySelectorAll(".gallery-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(Array.from(cards) as any, {
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 1000,
              delay: (el, i) => i * 150,
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
      id="fabric-in-motion"
      className="relative w-full py-24 sm:py-32 bg-[#050505] overflow-hidden"
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing right-[10%] top-[10%] w-[40vw] h-[40vw]" />
      <div className="spotlight-glowing left-[5%] bottom-[5%] w-[45vw] h-[45vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20 sm:mb-28">
          <div className="max-w-2xl">
            <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
              02 • PRODUCT SHOWCASE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-tight text-white leading-tight">
              Fabric in <span className="text-metallic font-light italic">Motion</span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 max-w-sm leading-relaxed">
            Witness the elegant flow of haute couture. A tactile journey through India's premier B2B sourcing catalog, from bridal elegance to western prints.
          </p>
        </div>

        {/* Cinematic Split Backplate Layer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch mb-16">
          
          {/* Loop Backdrop Video Panel */}
          <div className="col-span-12 md:col-span-5 relative group overflow-hidden border border-white/10 rounded-sm shadow-2xl min-h-[300px] flex flex-col justify-end p-8">
            <video
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.5] group-hover:brightness-[0.7] transition-all duration-700 scale-100 group-hover:scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              src="/assets/video/fabric.mp4"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
            
            <div className="relative z-20">
              <span className="text-[9px] font-bold tracking-[4px] text-expo-gold uppercase mb-2 block">
                Couture Motion
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide leading-tight mb-4">
                Flowing Textile Drapes
              </h3>
              <p className="font-sans text-xs text-expo-warm/60 leading-relaxed">
                Observe the cinematic micro-weights of luxury weaves under ambient exhibition light paths.
              </p>
            </div>
          </div>

          {/* Saree & Suits Showcase Block */}
          <div className="col-span-12 md:col-span-7 flex flex-col justify-center border border-white/5 bg-black/40 backdrop-blur-md p-8 sm:p-12 rounded-sm relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-[300px] h-[300px] bg-expo-gold/5 blur-[80px] pointer-events-none" />
            <h4 className="font-serif text-xl sm:text-2xl text-expo-gold mb-6 italic">
              Premium Sourcing Portfolio
            </h4>
            <p className="font-sans text-sm sm:text-base text-expo-warm/75 leading-relaxed mb-8">
              Explore custom ethnic collections tailored for worldwide distributors. Every fiber represents a synthesis of traditional Indian handloom heritage and modern high-speed production capability.
            </p>
            
            {/* Visual categories strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
              {["SAREES", "LEHENGAS", "KURTIS & SUITS", "MEN & KIDS WEAR"].map((cat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-display text-sm text-white font-bold tracking-[1px]">{cat}</span>
                  <span className="font-sans text-[10px] text-expo-warm/40 mt-1">Export Standard</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Asymmetrical Editorial Gallery Grid */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`${item.span} gallery-card opacity-0 translate-y-[40px] flex flex-col group`}
              data-cursor="explore"
            >
              {/* Image Box */}
              <div className={`relative w-full ${item.aspect} overflow-hidden border border-white/10 rounded-sm shadow-xl bg-neutral-900`}>
                <div
                  className={`absolute inset-0 bg-cover ${item.bgPosition} filter brightness-[0.75] group-hover:brightness-[0.95] group-hover:scale-[1.04] transition-all duration-[800ms] luxury`}
                  style={{ backgroundImage: `url('${item.img}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-10 pointer-events-none" />
                <div className="noise-overlay" />
                
                {/* Floating category badge */}
                <span className="absolute top-4 left-4 z-20 font-sans text-[8px] font-bold tracking-[3px] text-expo-gold bg-black/60 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md uppercase">
                  {item.category}
                </span>
              </div>

              {/* Title Copy */}
              <div className="mt-6 flex flex-col">
                <h3 className="font-serif text-lg sm:text-2xl text-white tracking-wide group-hover:text-expo-gold transition-colors duration-500">
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
    </section>
  );
}
