"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { useLanguage, Translate } from "@/components/LanguageContext";
import HeroCountdown from "@/components/HeroCountdown";
import StatCounter from "@/components/StatCounter";
import { EVENT, formatCount } from "@/lib/event-facts";
import { useMobileAnimation } from "./useMobileAnimation";

import BoomerangVideoBg from "@/BoomerangVideoBg";
import { masterRAF } from "@/hooks/useMasterRAF";
import TextReveal from "@/components/TextReveal";

const MinimalThreeOverlay = lazy(() => import("@/MinimalThreeOverlay"));

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

export function MagneticButton({ children, className = "", href, onClick, ...props }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const rectRef = useRef<DOMRect | null>(null);

  const handleMouseEnter = () => {
    setHovered(true);
    if (buttonRef.current) {
      rectRef.current = buttonRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = buttonRef.current;
    if (!btn) return;

    let rect = rectRef.current;
    if (!rect) {
      rect = btn.getBoundingClientRect();
      rectRef.current = rect;
    }

    const { left, top, width, height } = rect;
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);

    const maxPull = 6;
    const pullX = (x / width) * maxPull;
    const pullY = (y / height) * maxPull;

    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    rectRef.current = null;
    setPosition({ x: 0, y: 0 });
    setHovered(false);
  };

  const buttonStyle = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${hovered ? 1.03 : 1})`,
    transition: hovered ? "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)" : "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
  };

  if (href) {
    return (
      <a
        ref={buttonRef}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${className} select-none`}
        style={buttonStyle}
        {...(props as any)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${className} select-none`}
      style={buttonStyle}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMobileAnimation();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { language } = useLanguage();

  const handleViewBrochure = (e: any) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-brochure"));
  };

  const mouseRef = useRef({ x: 0, y: 0 });
  const currentMouseOffsetRef = useRef({ x: 0, y: 0 });
  const scrollYRef = useRef(0);

  const bgRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const subheadRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updatePositions = () => {
      const scrollY = scrollYRef.current;
      const current = currentMouseOffsetRef.current;

      const titleY = scrollY * -0.22;
      const titleOpacity = Math.max(0, 1 - scrollY / 500);
      const subheadY = scrollY * -0.15;
      const ctaY = scrollY * -0.1;
      const bgY = scrollY * 0.08;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${current.x * 18}px, ${current.y * 18 + bgY}px, 0)`;
      }
      if (titleRef.current) {
        titleRef.current.style.transform = `translate3d(${current.x * 10}px, ${current.y * 10 + titleY}px, 0)`;
        titleRef.current.style.opacity = String(titleOpacity);
      }
      if (subheadRef.current) {
        subheadRef.current.style.transform = `translate3d(${current.x * 7}px, ${current.y * 7 + subheadY}px, 0)`;
      }
      if (ctaRef.current) {
        ctaRef.current.style.transform = `translate3d(${current.x * 5}px, ${current.y * 5 + ctaY}px, 0)`;
      }
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      updatePositions();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current = { x, y };
    };

    let unsubscribeParallax: (() => void) | undefined;
    const updateParallax = () => {
      const target = mouseRef.current;
      const current = currentMouseOffsetRef.current;

      const ease = 0.05;
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;

      updatePositions();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    if (!prefersReducedMotion && !isMobile) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      unsubscribeParallax = masterRAF.subscribe(updateParallax);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (unsubscribeParallax) unsubscribeParallax();
    };
  }, [prefersReducedMotion, isMobile]);

  // Split word elements for title animations
  const titleWordsEn = [
    { text: "India's", highlight: false },
    { text: "Biggest", highlight: false },
    { text: "Textile B2B", highlight: true },
    { text: "Opportunity", highlight: false }
  ];

  const titleWordsHi = [
    { text: "भारत", highlight: false },
    { text: "का", highlight: false },
    { text: "सबसे बड़ा", highlight: false },
    { text: "टेक्सटाइल B2B", highlight: true },
    { text: "अवसर", highlight: false }
  ];

  const currentTitleWords = language === "en" ? titleWordsEn : titleWordsHi;

  return (
    <section
      ref={containerRef}
      className="hero-section relative w-full min-h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-[#050505] pt-20 pb-[100px] px-5 text-center md:pt-28 md:pb-16 md:px-8"
    >
      {/* 1. Cinematic Boomerang Background Video */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0"
      >
        {/* Not gated on isMounted: the poster inside must be in the SSR HTML so
            it can be the LCP element. The video itself still loads lazily and
            only on devices that should get it. */}
        <BoomerangVideoBg
          src="/assets/video/hero.mp4"
          className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.1] animate-canvas-zoom"
          fallbackImage="/assets/images/f_kidswear.webp"
        />
        {/* Cinematic dark linear gradient & noise texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/65 via-transparent to-[#050505] z-10 animate-bg-breathing" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.08] z-20" />
      </div>

      {/* Layer 1 — Three.js overlay (z-[5], desktop only) */}
      <Suspense fallback={null}>
        <MinimalThreeOverlay />
      </Suspense>

      {/* 2. Parallax Visual Layers & Particles */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10 select-none">
        {/* World map city lights layer */}
        <div
          className="parallax-layer absolute inset-0 bg-cover bg-center opacity-[0.1] md:mix-blend-screen scale-[1.1]"
          style={{ backgroundImage: `url('/assets/images/world-map.webp')` }}
          data-speed="0.25"
        />



        {/* Ambient Floating Dust Glow Spotlights */}
        <div className="spotlight-glowing left-[20%] top-[30%] w-[35vw] h-[35vw]" />
        <div className="spotlight-glowing right-[15%] bottom-[10%] w-[45vw] h-[45vw]" />
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 flex flex-col justify-center items-center text-center select-text">
        {/* Pre-Header B2B Tagline */}
        <div 
          className="animate-hero-fade-up" 
          style={{ animationDelay: "100ms" }}
        >
          <span className="text-xs font-bold tracking-[3px] md:tracking-[6px] text-expo-gold uppercase mb-6 bg-expo-gold/5 border border-expo-gold/15 px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-full md:backdrop-blur-sm glow-soft animate-pulse">
            <Translate
              en={`${EVENT.dateLabelEn} • ${EVENT.venueShortEn}`}
              hi={`${EVENT.dateLabelHi} • ${EVENT.venueShortHi}`}
            />
          </span>
        </div>

        {/* Major Editorial Headline */}
        <div 
          ref={titleRef}
          className="transition-opacity duration-300"
        >
          <div
            className="animate-headline-reveal" 
            style={{ 
              animationDelay: "220ms"
            }}
          >
            <h1 className="font-serif text-hero-mobile md:text-7xl lg:text-8xl tracking-[-0.02em] md:tracking-[-0.035em] text-white mb-6 leading-[1.15] md:leading-[0.9] uppercase max-w-4xl text-center">
              <TextReveal
                text={language === "en" ? "INDIA'S BIGGEST Textile B2B OPPORTUNITY" : "भारत का सबसे बड़ा टेक्सटाइल B2B अवसर"}
                highlightWords={["Textile", "B2B", "टेक्सटाइल"]}
                stagger={0.09}
                delay={0.15}
              />
            </h1>
          </div>
        </div>

        {/* Modernist Thin Subhead */}
        <div 
          ref={subheadRef}
        >
          <div
            className="animate-subhead-reveal" 
            style={{ 
              animationDelay: "520ms"
            }}
          >
            <div className="flex flex-col gap-2 max-w-[300px] md:max-w-3xl mx-auto md:mx-0 mt-2">
              <h2 className="font-sans text-[clamp(14px,4vw,18px)] md:text-xl text-expo-gold font-light tracking-[1px] md:tracking-[2px] leading-relaxed">
                <Translate
                  en="Where Manufacturers, Wholesalers, Exporters & Buyers Connect"
                  hi="जहाँ निर्माता, थोक विक्रेता, निर्यातक और खरीदार जुड़ते हैं"
                />
              </h2>
              <p className="font-sans text-xs md:text-sm text-expo-warm/75 tracking-[0.5px] md:tracking-[1px] font-light">
                <Translate
                  en={`${EVENT.stalls}+ Stalls · ${formatCount(EVENT.buyers)}+ Verified Buyers · ${EVENT.agents}+ Sourcing Agents · ${EVENT.venueShortEn}`}
                  hi={`${EVENT.stalls}+ स्टॉल · ${formatCount(EVENT.buyers)}+ सत्यापित खरीदार · ${EVENT.agents}+ सोर्सिंग एजेंट · ${EVENT.venueShortHi}`}
                />
              </p>
              <span className="text-xs tracking-[1.5px] md:tracking-[2.5px] uppercase text-expo-warm/70 mt-1 block">
                <Translate en="Organized By STE • Supported By AKAS" hi="STE द्वारा आयोजित • AKAS द्वारा समर्थित" />
              </span>
            </div>
          </div>
        </div>

        {/* Cinematic Live Countdown Timer */}
        <div 
          className="animate-hero-fade-up" 
          style={{ animationDelay: "620ms" }}
        >
          <div className="mt-8 flex justify-center items-center gap-1.5 sm:gap-4 bg-[#0a0a0a]/65 md:backdrop-blur-sm border border-expo-gold/20 p-3 sm:p-5 rounded-2xl shadow-[0_0_36px_rgba(214,160,102,0.15)] max-w-sm sm:max-w-md w-full relative">
            <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
            <HeroCountdown />
          </div>
        </div>

        {/* Call to Actions (Interactive 3-CTA Cluster) */}
        <div 
          ref={ctaRef}
          className="w-full"
        >
          <div
            className="animate-cta-reveal w-full" 
            style={{ 
              animationDelay: "820ms"
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mt-10 z-40 w-full max-w-sm md:max-w-none px-4 md:px-0">
              {/* Exhibitor's Portal CTA */}
              <MagneticButton
                href="/exhibitor/login"
                className="w-full md:w-auto md:min-w-[200px] h-[52px] md:h-auto md:py-4 px-6 rounded-xl md:rounded-md bg-gold-gradient text-black font-bold text-base md:text-xs tracking-[1.5px] uppercase flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              >
                <Translate en="Exhibitor's Portal" hi="प्रदर्शक पोर्टल" />
              </MagneticButton>

              {/* View Stall Brochure in Modal */}
              <MagneticButton
                onClick={handleViewBrochure}
                className="w-full md:w-auto md:min-w-[200px] h-[52px] md:h-auto md:py-4 px-6 rounded-xl md:rounded-md border-2 border-expo-gold text-expo-gold font-bold text-base md:text-xs tracking-[1.5px] uppercase flex items-center justify-center bg-transparent btn-shimmer"
              >
                <Translate en="Download Brochure" hi="विवरणिका डाउनलोड करें" />
              </MagneticButton>

              {/* Buyer Registration - Hidden on Mobile */}
              <MagneticButton
                href="#buyer-registration"
                className="hidden md:flex relative px-6 py-4 bg-[#B87333]/15 border border-[#B87333]/40 rounded-md text-[#F0C48A] hover:text-white font-sans text-xs tracking-[1.5px] uppercase overflow-hidden hover:border-expo-gold transition-colors duration-500 items-center justify-center gap-1.5 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center gap-1.5 justify-center">
                  <Translate en="Register as Buyer" hi="खरीदार पंजीकरण" />
                </span>
                <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
              </MagneticButton>
            </div>
          </div>
        </div>

        {/* Headline statistics. Figures come from lib/event-facts.ts — the
            single source of truth — and render server-side, so the panel can
            never sit at zero the way it used to. */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 w-full max-w-lg mx-auto md:max-w-none mt-16 z-40 px-1 sm:px-0">
          {[
            {
              end: EVENT.sourcingMarketSizeTrillionINR,
              decimals: 1,
              prefix: "₹",
              suffix: "T",
              labelEn: "Sourcing Market Size",
              labelHi: "सोर्सिंग मार्केट आकार"
            },
            {
              end: EVENT.buyers,
              prefix: "",
              suffix: "+",
              labelEn: "Verified B2B Buyers",
              labelHi: "सत्यापित B2B खरीदार"
            },
            {
              end: EVENT.agents,
              prefix: "",
              suffix: "+",
              labelEn: "Sourcing Agents",
              labelHi: "सोर्सिंग एजेंट"
            }
          ].map((stat, i) => (
            <div
              key={stat.labelEn}
              className="h-full animate-hero-pop-in"
              style={{ animationDelay: `${750 + i * 80}ms` }}
            >
              <div
                className="relative h-full bg-black/80 border-t-2 border-t-[#D4AF37] border-x border-b border-white/5 p-3.5 md:p-6 rounded-lg md:rounded-xl md:backdrop-blur-sm text-center overflow-hidden transition-all duration-300 active:scale-95 card-tap"
              >
                <StatCounter
                  end={stat.end}
                  decimals={stat.decimals}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="block font-serif text-[22px] font-bold md:text-4xl md:font-light text-white drop-shadow-[0_0_10px_rgba(214,160,102,0.25)] gold-shimmer-text"
                />
                <span className="text-xs uppercase tracking-[1px] md:tracking-[1.5px] text-expo-warm/70 block mt-2 font-sans font-semibold">
                  <Translate en={stat.labelEn} hi={stat.labelHi} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>


    </section>
  );
}
