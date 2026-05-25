"use client";

import { useEffect, useRef, useState } from "react";
import { waapi, splitText, stagger } from "animejs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PORTRAITS = [
  {
    title: "Imperial Sarees",
    desc: "Intricately detailed metallic weaves of heavy royal silks.",
    img: "/assets/images/editorial-queen.png",
    subtitle: "Heritage Couture",
    coords: "01 / COUTURE",
  },
  {
    title: "Trio of Silk Craft",
    desc: "A breathtaking display of detailed ethnic prints and drapes.",
    img: "/assets/images/editorial-trio.png",
    subtitle: "Bridal Assembly",
    coords: "02 / ANCESTRAL",
  },
  {
    title: "Chiaroscuro Silhouette",
    desc: "A dramatic composition highlighting intricate embroidery.",
    img: "/assets/images/editorial-dark.png",
    subtitle: "Dramatic Silhouette",
    coords: "03 / EMBELLISH",
  },
  {
    title: "Modern Ethnic Weave",
    desc: "Merging heritage looms with contemporary Western draping.",
    img: "/assets/images/editorial-portrait1.png",
    subtitle: "Contemporary Indo-Western",
    coords: "04 / SYNTHESIS",
  },
  {
    title: "Timeless Craftsmanship",
    desc: "Premium sarees engineered for elite global luxury boutique showcases.",
    img: "/assets/images/editorial-portrait2.png",
    subtitle: "Premium Banarasi Prints",
    coords: "05 / LEGACY",
  },
];

export default function FashionEditorial() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    // Reveal main headline
    if (headlineRef.current) {
      const split = splitText(headlineRef.current, {
        chars: true,
        accessible: true,
      });

      waapi.animate(split.chars, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: stagger(30, { start: 200 }),
        ease: "outExpo",
      });
    }

    // Scroll trigger indicator for horizontal scroll containers
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Check screen width (apply side scroll only on desktop)
      if (window.innerWidth < 1024) return;

      const isAtEnd =
        scrollContainer.scrollLeft + scrollContainer.clientWidth >=
        scrollContainer.scrollWidth - 5;
      const isAtStart = scrollContainer.scrollLeft <= 5;

      // If user is scrolling vertically but inside editorial, translate it to horizontal
      if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY * 0.85;
      }
    };

    // Attach wheel listener to horizontal box
    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    // Animate items on viewport entry
    const cards = scrollContainer.querySelectorAll(".editorial-card");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(Array.from(cards) as unknown as HTMLElement[], {
              opacity: [0, 1],
              translateX: [50, 0],
              duration: 1200,
              delay: (el, i) => i * 150,
              ease: "outExpo",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
      observer.disconnect();
    };
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Scroll to a specific slide helper
  const scrollToSlide = (index: number) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const cards = scrollContainer.querySelectorAll(".editorial-card");
    if (cards.length === 0) return;
    
    const cardWidth = (cards[0] as HTMLElement).offsetWidth + 32; // card width + gap-8 (32px)
    scrollContainer.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const prevIndex = activeIndex === 0 ? PORTRAITS.length - 1 : activeIndex - 1;
    scrollToSlide(prevIndex);
  };

  const handleNext = () => {
    const nextIndex = activeIndex === PORTRAITS.length - 1 ? 0 : activeIndex + 1;
    scrollToSlide(nextIndex);
  };

  // Sync activeIndex on manual scrolls/swipes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const cards = scrollContainer.querySelectorAll(".editorial-card");
      if (cards.length === 0) return;
      
      const cardWidth = (cards[0] as HTMLElement).offsetWidth + 32;
      const currentScrollIndex = Math.round(scrollContainer.scrollLeft / cardWidth);
      if (currentScrollIndex >= 0 && currentScrollIndex < PORTRAITS.length) {
        setActiveIndex(currentScrollIndex);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // Automatic scrolling loop
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || isHovering) return;

    const interval = setInterval(() => {
      const cards = scrollContainer.querySelectorAll(".editorial-card");
      if (cards.length === 0) return;
      
      const cardWidth = (cards[0] as HTMLElement).offsetWidth + 32;
      const currentScrollIndex = Math.round(scrollContainer.scrollLeft / cardWidth);
      let nextIndex = currentScrollIndex + 1;
      
      if (nextIndex >= PORTRAITS.length) {
        nextIndex = 0;
      }
      
      scrollContainer.scrollTo({
        left: nextIndex * cardWidth,
        behavior: "smooth"
      });
      
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section
      id="fashion-editorial"
      className="relative w-full py-24 sm:py-32 bg-[#050505] overflow-hidden"
    >
      {/* Dynamic Backplate video */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
        <video
          className="w-full h-full object-cover filter brightness-[0.2] contrast-[1.1] opacity-75"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/video/editorial.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/20 to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Section Header */}
        <div className="max-w-4xl mb-16 sm:mb-24">
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            05 • LUXURY EDITORIAL
          </span>
          <h2
            ref={headlineRef}
            className="font-serif text-3xl sm:text-5xl md:text-7xl tracking-tight text-white leading-[1.1]"
          >
            The Luxury Sensation: <br />
            <span className="text-metallic font-light italic">Heritage Couture</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 max-w-xl leading-relaxed mt-6">
            A premium visual testament to textile craftsmanship. Explore high-definition editorial showcases featuring elite ethnic draping and luxurious embroideries.
          </p>
        </div>
      </div>

      {/* Horizontal Couture Portrait Showcase */}
      <div className="relative w-full z-10">
        {/* Left & Right Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="horizontal-scroll-premium scrollbar-none px-6 sm:px-12 lg:px-24 py-6 w-full"
        >
          <div className="flex gap-8 pr-24 min-w-max">
            {PORTRAITS.map((p, idx) => {
              const isSelfActive = activeIndex === idx;
              return (
                <div
                  key={idx}
                  className={`editorial-card scroll-snap-card opacity-0 translate-x-[50px] w-[80vw] sm:w-[50vw] lg:w-[32vw] flex flex-col group transition-all duration-700 ease-luxury ${
                    isSelfActive 
                      ? "scale-100 opacity-100 filter blur-0" 
                      : "scale-[0.96] opacity-45 filter blur-[0.8px]"
                  }`}
                  data-cursor="explore"
                >
                  {/* Image box */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden border border-white/10 rounded-sm bg-neutral-900 shadow-2xl">
                    <div
                      className="absolute inset-0 bg-cover bg-center filter brightness-[0.7] group-hover:brightness-[0.9] group-hover:scale-[1.04] transition-all duration-[900ms] luxury"
                      style={{ backgroundImage: `url('${p.img}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 z-10 pointer-events-none" />
                    <div className="noise-overlay" />

                    {/* Section tags */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col">
                      <span className="font-sans text-[8px] font-bold tracking-[2px] text-expo-gold bg-black/60 px-2.5 py-1 border border-white/5 rounded-sm">
                        {p.coords}
                      </span>
                    </div>
                  </div>

                  {/* Description tags */}
                  <div className="mt-6 flex flex-col">
                    <span className="font-sans text-[10px] tracking-[3px] text-expo-gold uppercase block mb-1">
                      {p.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl text-white tracking-wide group-hover:text-expo-gold transition-colors duration-500">
                      {p.title}
                    </h3>
                    <p className="font-sans text-xs text-expo-warm/50 leading-relaxed mt-2 max-w-sm">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Left/Right Premium Navigation Buttons */}
      <div className="absolute top-[60%] -translate-y-1/2 left-4 sm:left-8 z-30 hidden sm:block">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full border border-expo-gold/20 bg-[#050505]/75 hover:bg-expo-gold hover:text-expo-midnight hover:border-expo-gold text-expo-gold hover:shadow-expo-glow transition-all duration-300 flex items-center justify-center backdrop-blur-md"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-[60%] -translate-y-1/2 right-4 sm:right-8 z-30 hidden sm:block">
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full border border-expo-gold/20 bg-[#050505]/75 hover:bg-expo-gold hover:text-expo-midnight hover:border-expo-gold text-expo-gold hover:shadow-expo-glow transition-all duration-300 flex items-center justify-center backdrop-blur-md"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Premium Pagination Indicator Dots */}
      <div className="flex justify-center items-center gap-2 mt-6 z-30 relative">
        {PORTRAITS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToSlide(idx)}
            className={`transition-all duration-500 rounded-full h-1.5 ${
              activeIndex === idx 
                ? "w-8 bg-expo-gold shadow-[0_0_10px_rgba(214,160,102,0.6)]" 
                : "w-2 bg-expo-warm/30 hover:bg-expo-warm/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Horizontal scroll advice overlay for desktop */}
      <div className="hidden lg:flex justify-end max-w-7xl mx-auto px-24 mt-8 pointer-events-none">
        <span className="font-sans text-[9px] tracking-[3px] text-expo-warm/30 uppercase animate-pulse">
          Use Navigation Buttons or Mouse Wheel to Explore →
        </span>
      </div>

      {/* Mobile Swipe Indicator */}
      <div className="lg:hidden flex justify-center items-center gap-2 mt-6 pointer-events-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-expo-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-expo-gold"></span>
        </span>
        <span className="font-sans text-[9px] tracking-[3px] text-expo-gold uppercase animate-pulse">
          Swipe to View More
        </span>
      </div>
    </section>
  );
}
