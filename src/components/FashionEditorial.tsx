"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { waapi, splitText, stagger } from "animejs";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import OptimizedVideoBg from "@/components/OptimizedVideoBg";

const PORTRAITS = [
  {
    title: "Where Heritage Meets Grandeur",
    desc: "Preserving centuries of Banarasi and Gujarati weaving legacy, redesigned for global luxury boutiques.",
    img: "/assets/images/editorial-saree.webp",
    subtitle: "Couture Heritage",
    coords: "01 / WEAVE",
    objectPosition: {
      mobile: "center 12%",
      tablet: "center 15%",
      desktop: "center 15%",
    },
    aspect: "aspect-[4/5]",
    scaleClass: "lg:scale-[1.02] lg:group-hover:scale-[1.05]",
  },
  {
    title: "Crafted with Golden Precision",
    desc: "High-definition Zardosi and Zari detailing woven by master artisans, representing Surat's premium embellishment scale.",
    img: "/assets/images/editorial-zari.webp",
    subtitle: "Embroidery Excellence",
    coords: "02 / EMBROIDERY",
    objectPosition: {
      mobile: "center center",
      tablet: "center center",
      desktop: "center center",
    },
    aspect: "aspect-[4/5]",
    scaleClass: "lg:scale-[1.02] lg:group-hover:scale-[1.05]",
  },
  {
    title: "The Scale of Global Commerce",
    desc: "Immersive boutique exhibition spaces presenting advanced weaving technologies and high-end merchandising setups.",
    img: "/assets/images/editorial-booth.webp",
    subtitle: "Textile Innovation",
    coords: "03 / EXHIBITION",
    objectPosition: {
      mobile: "center center",
      tablet: "center center",
      desktop: "center center",
    },
    aspect: "aspect-[4/5]",
    scaleClass: "lg:scale-[1.02] lg:group-hover:scale-[1.05]",
  },
  {
    title: "The Future of Ethnic Luxury",
    desc: "Striking ivory bridal couture showcasing fluid silhouettes and modern structural elegance for elite markets.",
    img: "/assets/images/editorial-lehenga.webp",
    subtitle: "Bridal Weaves",
    coords: "04 / COUTURE",
    objectPosition: {
      mobile: "center 16%",
      tablet: "center 20%",
      desktop: "center 20%",
    },
    aspect: "aspect-[4/5]",
    scaleClass: "lg:scale-[1.02] lg:group-hover:scale-[1.05]",
  },
];

export default function FashionEditorial() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { ref: headingInViewRef, inView: headingInView } = useInView(0.3);

  const clientWidthRef = useRef(0);
  const scrollWidthRef = useRef(0);
  const cardWidthRef = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const updateMeasurements = () => {
      clientWidthRef.current = scrollContainer.clientWidth;
      scrollWidthRef.current = scrollContainer.scrollWidth;
      const cards = scrollContainer.querySelectorAll(".editorial-card");
      if (cards.length > 0) {
        cardWidthRef.current = (cards[0] as HTMLElement).offsetWidth;
      }
    };

    updateMeasurements();

    const resizeObserver = new ResizeObserver(() => {
      updateMeasurements();
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Responsive state for mobile checks
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Screen size tracking for responsive inline styling (mobile < 640px, tablet < 1024px, desktop >= 1024px)
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 640) {
        setScreenSize("mobile");
      } else if (window.innerWidth < 1024) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Set up Framer Motion scroll tracker with lerp smoothing (damping)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001
  });

  // Layer 1 — Background Atmosphere (Subtle luxury gradients & drifting mesh glow)
  const bgY = useTransform(smoothProgress, [0, 1], ["-6%", "6%"]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1.02, 1.08]);
  const glowOpacity = useTransform(smoothProgress, [0, 0.5, 1], [0.35, 0.7, 0.35]);

  // Layer 2 — Main Editorial Hero Video Backplate
  const heroY = useTransform(smoothProgress, [0, 1], ["-12%", "12%"]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.15, 0.45, 0.45, 0.15]);
  const heroScale = useTransform(smoothProgress, [0, 1], [1.04, 1.15]);

  // Layer 3 — Product Cards (Asymmetrical motion speeds)
  const yLeft = useTransform(
    smoothProgress,
    [0, 1],
    isMobile ? ["-20px", "20px"] : ["-60px", "60px"]
  );
  const yCenter = useTransform(
    smoothProgress,
    [0, 1],
    isMobile ? ["-10px", "10px"] : ["-30px", "30px"]
  );
  const scaleCenter = useTransform(
    smoothProgress,
    [0, 1],
    isMobile ? [0.99, 1.01] : [0.97, 1.05]
  );
  const yRight = useTransform(
    smoothProgress,
    [0, 1],
    isMobile ? ["-30px", "30px"] : ["-90px", "90px"]
  );

  // Layer 4 — Typography (Upward weightless drift & opacity reveals)
  const textY = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    isMobile ? ["15px", "0px", "-15px"] : ["45px", "0px", "-45px"]
  );
  const textOpacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.4, 1, 1, 0.4]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Reveal main headline
    if (headlineRef.current) {
      const split = splitText(headlineRef.current, {
        words: true,
        accessible: true,
      });

      waapi.animate(split.words, {
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

      const clientWidth = clientWidthRef.current || scrollContainer.clientWidth;
      const scrollWidth = scrollWidthRef.current || scrollContainer.scrollWidth;

      const isAtEnd =
        scrollContainer.scrollLeft + clientWidth >=
        scrollWidth - 5;
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
              translateY: [50, 0],
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

  // Sync activeIndex on manual scrolls/swipes
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      let cardWidth = cardWidthRef.current;
      if (cardWidth === 0) {
        const cards = scrollContainer.querySelectorAll(".editorial-card");
        if (cards.length > 0) {
          cardWidth = (cards[0] as HTMLElement).offsetWidth;
          cardWidthRef.current = cardWidth;
        }
      }
      if (cardWidth === 0) return;
      const totalWidth = cardWidth + 32;
      const currentScrollIndex = Math.round(scrollContainer.scrollLeft / totalWidth);
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
      let cardWidth = cardWidthRef.current;
      if (cardWidth === 0) {
        const cards = scrollContainer.querySelectorAll(".editorial-card");
        if (cards.length > 0) {
          cardWidth = (cards[0] as HTMLElement).offsetWidth;
          cardWidthRef.current = cardWidth;
        }
      }
      if (cardWidth === 0) return;
      const totalWidth = cardWidth + 32;
      const currentScrollIndex = Math.round(scrollContainer.scrollLeft / totalWidth);
      let nextIndex = currentScrollIndex + 1;
      
      if (nextIndex >= PORTRAITS.length) {
        nextIndex = 0;
      }
      
      scrollContainer.scrollTo({
        left: nextIndex * totalWidth,
        behavior: "smooth"
      });
      
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <motion.section
      ref={sectionRef}
      id="fashion-editorial"
      className="relative w-full py-14 px-5 md:py-24 md:px-8 bg-[#050505] overflow-visible"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Layer 1 — Background Atmosphere */}
      <motion.div
        style={{
          y: bgY,
          scale: bgScale,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      >
        <div className="absolute inset-0 bg-mesh-dark opacity-80" />
        <motion.div
          style={{ opacity: glowOpacity }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(214,160,102,0.15),_transparent_60%)]"
        />
        <div className="noise-overlay z-20" />
      </motion.div>

      {/* Layer 2 — Main Editorial Hero (Drifting model backplate) */}
      <motion.div
        style={{
          y: heroY,
          opacity: heroOpacity,
          scale: heroScale,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        className="absolute inset-0 w-full h-full select-none pointer-events-none z-0"
      >
        <OptimizedVideoBg
          src="/assets/video/editorial.mp4"
          className="w-full h-full filter brightness-[0.25] contrast-[1.1]"
          fallbackImage="/assets/images/f_kidswear.webp"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
        {/* Layer 4 — Typography (Upward weightless drifting header) */}
        <motion.div
          ref={headingInViewRef}
          style={{
            y: textY,
            opacity: textOpacity,
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
          className="max-w-4xl mb-8 md:mb-16"
        >
          <span className="text-[10px] sm:text-xs font-bold tracking-[5px] text-expo-gold uppercase mb-4 block">
            05 • LUXURY EDITORIAL
          </span>
          <h2
            ref={headlineRef}
            className={`font-serif text-3xl sm:text-5xl md:text-7xl tracking-tight text-white leading-[1.1] text-balance heading-underline ${headingInView ? "in-view" : ""}`}
          >
            <span className="gold-shimmer-text">The Luxury Sensation:</span> <br />
            <span className="text-metallic font-light italic">Heritage Couture</span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-expo-warm/60 max-w-xl leading-relaxed mt-6">
            A premium visual testament to textile craftsmanship. Explore high-definition editorial showcases featuring elite ethnic draping and luxurious embroideries.
          </p>
        </motion.div>
      </div>

      {/* Layer 3 — Product Cards Showcase with Asymmetrical Depth Offset */}
      <div className="relative w-full z-10 overflow-visible">
        {/* Left & Right Edge Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="horizontal-scroll-premium scrollbar-none px-6 sm:px-12 lg:px-24 py-6 w-full overflow-x-auto overflow-y-visible lg:overflow-visible"
        >
          <div className="flex gap-8 pr-24 min-w-max overflow-visible py-6">
            {PORTRAITS.map((p, idx) => {
              const isSelfActive = activeIndex === idx;

              // Assign asymmetrical speeds/scales based on card layout indexes
              let cardY = yCenter;
              let cardScale = undefined;

              if (idx % 3 === 0) {
                cardY = yLeft;
              } else if (idx % 3 === 1) {
                cardY = yCenter;
                cardScale = scaleCenter;
              } else {
                cardY = yRight;
              }

              return (
                <motion.div
                  key={idx}
                  style={{
                    y: cardY,
                    scale: cardScale,
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                  }}
                  className={`editorial-card scroll-snap-card opacity-0 translate-y-[50px] w-[80vw] sm:w-[50vw] lg:w-[32vw] flex flex-col group transition-all duration-700 ease-luxury card-tap ${
                    isSelfActive
                      ? "opacity-100"
                      : "opacity-45"
                  }`}
                  data-cursor="explore"
                >
                  {/* Image box */}
                  <div className={`relative w-full ${p.aspect || "aspect-[4/5]"} overflow-hidden border border-white/10 rounded-sm bg-neutral-900 shadow-2xl`}>
                    <Image
                      src={p.img}
                      alt={p.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 80vw"
                      className={`object-contain lg:object-cover ${p.scaleClass || "lg:scale-[1.02] lg:group-hover:scale-[1.05]"} filter brightness-[0.78] lg:brightness-[0.7] group-hover:brightness-[0.9] transition-all duration-[900ms] ease-luxury`}
                      style={{
                        objectPosition: screenSize === "mobile" ? p.objectPosition.mobile : screenSize === "tablet" ? p.objectPosition.tablet : p.objectPosition.desktop
                      }}
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 z-10 pointer-events-none" />
                    <div className="noise-overlay" />

                    {/* Section tags */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col">
                      <span className="font-sans text-[8px] font-bold tracking-[2px] text-expo-gold bg-black/60 px-2.5 py-1 border border-white/5 rounded-sm badge-tap">
                        {p.coords}
                      </span>
                    </div>
                  </div>

                  {/* Description tags */}
                  <div className="mt-6 flex flex-col">
                    <span className="font-sans text-[10px] tracking-[3px] text-expo-gold uppercase block mb-1">
                      {p.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-2xl text-white tracking-wide group-hover:text-expo-gold transition-colors duration-500 gold-shimmer-text">
                      {p.title}
                    </h3>
                    <p className="font-sans text-xs text-expo-warm/50 leading-relaxed mt-2 max-w-sm">
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Horizontal scroll advice overlay for desktop */}
      <div className="hidden lg:flex justify-end max-w-7xl mx-auto px-24 mt-8 pointer-events-none">
        <span className="font-sans text-[9px] tracking-[3px] text-expo-warm/30 uppercase animate-pulse">
          Use Touchpad or Mouse Wheel to Explore →
        </span>
      </div>
    </motion.section>
  );
}
