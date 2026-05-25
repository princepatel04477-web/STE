import { useEffect, useRef, useState } from "react";
import { waapi, splitText, stagger } from "animejs";

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef1 = useRef<HTMLHeadingElement | null>(null);
  const headlineRef2 = useRef<HTMLHeadingElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);


  const [isMounted, setIsMounted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [stats, setStats] = useState({ exhibitors: 0, buyers: 0, nations: 0, area: 0 });

  const handleViewBrochure = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-brochure"));
  };
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
    const targetDate = new Date("2026-09-12T10:00:00+05:30");
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // 1. Heading Anime.js Reveals
    if (headlineRef1.current) {
      const split1 = splitText(headlineRef1.current, {
        chars: true,
        accessible: true,
      });

      waapi.animate(split1.chars, {
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: stagger(40, { start: 300 }),
        ease: "outExpo",
      });
    }

    if (headlineRef2.current) {
      const split2 = splitText(headlineRef2.current, {
        words: true,
        accessible: true,
      });

      waapi.animate(split2.words, {
        translateY: [20, 0],
        opacity: [0, 0.8],
        duration: 1000,
        delay: stagger(60, { start: 800 }),
        ease: "outExpo",
      });
    }

    // 2. Parallax mouse movements
    const container = containerRef.current;
    if (!container) return () => clearInterval(interval);

    const layers = container.querySelectorAll(".parallax-layer");
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      layers.forEach((layer) => {
        const speed = parseFloat(layer.getAttribute("data-speed") || "0");
        const x = xPercent * speed * 20;
        const y = yPercent * speed * 20;
        (layer as HTMLElement).style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      const endExhibitors = 650;
      const endBuyers = 8000;
      const endNations = 24;
      const endArea = 40000;
      
      const duration = 2000; // ms
      const stepTime = 30;
      const steps = duration / stepTime;
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        setStats({
          exhibitors: Math.min(endExhibitors, Math.floor((endExhibitors / steps) * currentStep)),
          buyers: Math.min(endBuyers, Math.floor((endBuyers / steps) * currentStep)),
          nations: Math.min(endNations, Math.floor((endNations / steps) * currentStep)),
          area: Math.min(endArea, Math.floor((endArea / steps) * currentStep))
        });
        
        if (currentStep >= steps) {
          setStats({ exhibitors: endExhibitors, buyers: endBuyers, nations: endNations, area: endArea });
          clearInterval(timer);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [isMounted]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-expo-midnight pt-20"
    >
      {/* 1. Cinematic Silent Loop Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-[1.03] filter brightness-[0.4] contrast-[1.1] transition-transform duration-1000"
          autoPlay
          muted
          loop
          playsInline
          src="/assets/video/hero.mp4"
        />
        {/* Cinematic dark linear gradient & noise texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
        <div className="grid-overlay-pattern absolute inset-0 opacity-[0.08] z-20" />
      </div>

      {/* 2. Parallax Visual Layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10 select-none">
        {/* World map city lights layer */}
        <div
          className="parallax-layer absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-screen scale-[1.1]"
          style={{ backgroundImage: `url('/assets/images/world-map.jpg')` }}
          data-speed="0.25"
        />

        {/* Surreal floating figure layer */}
        <div
          className="parallax-layer absolute right-[2%] sm:right-[8%] top-[25%] sm:top-[18%] w-[45vw] h-[45vw] sm:w-[28vw] sm:h-[28vw] max-w-[320px] max-h-[320px] bg-contain bg-no-repeat bg-center opacity-[0.15] sm:opacity-[0.25] mix-blend-screen"
          style={{ backgroundImage: `url('/assets/images/floating-person.png')` }}
          data-speed="0.45"
        />

        {/* Undulating golden fabric highlights */}
        <div
          className="parallax-layer absolute left-[-10%] sm:left-[-5%] bottom-[-10%] sm:bottom-[-5%] w-[60vw] h-[50vw] sm:w-[45vw] sm:h-[35vw] max-w-[500px] max-h-[400px] bg-contain bg-no-repeat bg-bottom bg-left opacity-[0.12] sm:opacity-[0.18] mix-blend-color-dodge scale-[1.1] sm:scale-[1.2]"
          style={{ backgroundImage: `url('/assets/images/golden-fabric.png')` }}
          data-speed="-0.3"
        />

        {/* Ambient Floating Dust Glow Spotlights */}
        <div className="spotlight-glowing left-[20%] top-[30%] w-[35vw] h-[35vw]" />
        <div className="spotlight-glowing right-[15%] bottom-[10%] w-[45vw] h-[45vw]" />
      </div>

      {/* 3. Hero Copywriting & Typography */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 flex flex-col justify-center items-center text-center select-text">
        {/* Pre-Header B2B Tagline */}
        <span className="text-[10px] sm:text-xs font-bold tracking-[6px] text-expo-gold uppercase mb-6 bg-expo-gold/5 border border-expo-gold/15 px-5 py-2 rounded-full backdrop-blur-md glow-soft animate-pulse">
          September 12-13, 2026 • SIECC, Sarsana Dome, Surat
        </span>

        {/* Major Editorial Headline */}
        <h1
          ref={headlineRef1}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] sm:tracking-[-0.035em] text-white mb-4 leading-[0.92] sm:leading-[0.9] lg:leading-[0.85] uppercase max-w-4xl"
        >
          India&apos;s Biggest <br className="hidden sm:inline" />
          <span className="text-metallic font-light italic normal-case block sm:inline mt-2 sm:mt-0 mr-2 sm:mr-2 pr-3">Textile B2B</span> Opportunity
        </h1>

        {/* Modernist Thin Subhead */}
        <div ref={headlineRef2} className="flex flex-col gap-2 max-w-3xl mt-2">
          <h2 className="font-sans text-base sm:text-lg md:text-xl text-expo-gold font-light tracking-[2px] leading-relaxed">
            Where Manufacturers, Wholesalers, Exporters & Buyers Connect
          </h2>
          <p className="font-sans text-xs sm:text-sm text-expo-warm/75 tracking-[1px] font-light">
            650+ Stalls · 8000+ Verified Buyers · SIECC Sarsana Dome, Surat · September 2026
          </p>
          <span className="text-[9px] tracking-[2.5px] uppercase text-expo-warm/50 mt-1 block">
            Organized By STE • Supported By AKAS
          </span>
        </div>

        {/* Cinematic Live Countdown Timer */}
        <div className="mt-6 flex justify-center items-center gap-4 sm:gap-6 bg-expo-midnight/50 backdrop-blur-xl border border-expo-gold/20 p-4 sm:p-6 rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.15)] glow-soft max-w-md w-full relative">
          <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
          {!isMounted ? (
            <div className="w-full text-center py-1">
              <span className="font-serif text-base sm:text-lg tracking-[3px] text-expo-gold uppercase">
                September 12-13, 2026
              </span>
            </div>
          ) : isExpired ? (
            <div className="w-full text-center py-1">
              <span className="font-serif text-base sm:text-lg tracking-[3px] text-expo-gold uppercase animate-pulse">
                EVENT IN PROGRESS
              </span>
            </div>
          ) : (
            <>
              <div className="text-center min-w-[50px] sm:min-w-[65px]">
                <span className="block font-serif text-2xl sm:text-4xl font-light text-expo-gold leading-none tracking-normal drop-shadow-[0_0_10px_rgba(214,160,102,0.4)]">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-expo-warm/50 block mt-2">Days</span>
              </div>
              <div className="text-expo-gold/40 text-xl font-light -translate-y-2 select-none sm:text-2xl">:</div>
              <div className="text-center min-w-[50px] sm:min-w-[65px]">
                <span className="block font-serif text-2xl sm:text-4xl font-light text-expo-gold leading-none tracking-normal drop-shadow-[0_0_10px_rgba(214,160,102,0.4)]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-expo-warm/50 block mt-2">Hours</span>
              </div>
              <div className="text-expo-gold/40 text-xl font-light -translate-y-2 select-none sm:text-2xl">:</div>
              <div className="text-center min-w-[50px] sm:min-w-[65px]">
                <span className="block font-serif text-2xl sm:text-4xl font-light text-expo-gold leading-none tracking-normal drop-shadow-[0_0_10px_rgba(214,160,102,0.4)]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-expo-warm/50 block mt-2">Mins</span>
              </div>
              <div className="text-expo-gold/40 text-xl font-light -translate-y-2 select-none sm:text-2xl">:</div>
              <div className="text-center min-w-[50px] sm:min-w-[65px]">
                <span className="block font-serif text-2xl sm:text-4xl font-light text-expo-gold leading-none tracking-normal drop-shadow-[0_0_10px_rgba(214,160,102,0.4)]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-expo-warm/50 block mt-2">Secs</span>
              </div>
            </>
          )}
        </div>

        {/* Call to Actions (Interactive 3-CTA Cluster) */}
        <div className="grid grid-cols-1 sm:flex sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 z-40 w-full max-w-lg sm:max-w-none px-4 sm:px-0">
          {/* Book Stall CTA */}
          <a
            href="#final-cta"
            className="group relative px-6 py-4 bg-gold-gradient rounded-sm text-expo-midnight font-bold font-sans text-xs tracking-[1.5px] uppercase overflow-hidden shadow-lg hover:shadow-expo-glow transition-all duration-500 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            data-cursor="explore"
          >
            <span className="relative z-10 flex items-center gap-1.5 justify-center">
              Book Exhibition Stall
            </span>
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
          </a>

          {/* View Stall Brochure in Modal */}
          <button
            onClick={handleViewBrochure}
            className="group relative px-6 py-4 bg-transparent border border-expo-gold/45 rounded-sm text-expo-gold font-sans text-xs tracking-[1.5px] uppercase overflow-hidden hover:border-expo-gold transition-colors duration-500 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            data-cursor="click"
          >
            <span className="relative z-10 flex items-center gap-1.5 justify-center">
              Download Brochure
            </span>
            <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
          </button>

          {/* Buyer Registration */}
          <a
            href="#buyer-registration"
            className="group relative px-6 py-4 bg-[#B87333]/20 border border-[#B87333]/50 rounded-sm text-[#F0C48A] hover:text-white font-sans text-xs tracking-[1.5px] uppercase overflow-hidden hover:border-expo-gold transition-colors duration-500 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            data-cursor="click"
          >
            <span className="relative z-10 flex items-center gap-1.5 justify-center">
              Register as Buyer
            </span>
            <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
          </a>
        </div>

        {/* Animated Statistics Counter Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-12 bg-black/45 border border-white/5 p-6 rounded-xl backdrop-blur-md max-w-4xl w-full z-40">
          {[
            { value: stats.exhibitors, suffix: "+", label: "Premium Exhibitors" },
            { value: stats.buyers, suffix: "+", label: "Sourcing Buyers" },
            { value: stats.nations, suffix: "+", label: "Sourcing Nations" },
            { value: Math.round(stats.area / 1000), suffix: "K+", label: "Sq. Ft. Exhibition Area" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <span className="block font-serif text-2xl sm:text-4xl text-white font-light drop-shadow-[0_0_10px_rgba(214,160,102,0.25)]">
                {stat.value.toLocaleString()}{stat.suffix}
              </span>
              <span className="text-[9px] uppercase tracking-[1.5px] text-expo-warm/50 block mt-2 font-sans font-semibold">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Luxury Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-30 select-none">
        <span className="font-sans text-[9px] tracking-[4px] text-expo-warm/40 uppercase mb-3">
          Scroll to explore
        </span>
        <div className="w-[18px] h-[34px] rounded-full border border-expo-warm/20 flex justify-center p-1">
          <div className="scroll-indicator-dot w-1.5 h-1.5 rounded-full bg-expo-gold" />
        </div>
      </div>
    </section>
  );
}
