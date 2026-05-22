import { useEffect, useRef, useState } from "react";
import { waapi, splitText, stagger } from "animejs";

export default function CinematicHero() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef1 = useRef<HTMLHeadingElement | null>(null);
  const headlineRef2 = useRef<HTMLHeadingElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date("2026-09-12T09:00:00");
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
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
          className="parallax-layer absolute right-[8%] top-[18%] w-[28vw] h-[28vw] max-w-[320px] max-h-[320px] bg-contain bg-no-repeat bg-center opacity-[0.25] mix-blend-screen"
          style={{ backgroundImage: `url('/assets/images/floating-person.png')` }}
          data-speed="0.45"
        />

        {/* Undulating golden fabric highlights */}
        <div
          className="parallax-layer absolute left-[-5%] bottom-[-5%] w-[45vw] h-[35vw] max-w-[500px] max-h-[400px] bg-contain bg-no-repeat bg-bottom bg-left opacity-[0.18] mix-blend-color-dodge scale-[1.2]"
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
          12-13 September 2026 • SIECC, Sarsana Dome, Surat
        </span>

        {/* Major Editorial Headline */}
        <h1
          ref={headlineRef1}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[-0.02em] sm:tracking-[-0.035em] text-white mb-4 leading-[0.92] sm:leading-[0.9] lg:leading-[0.85] uppercase max-w-4xl"
        >
          Surat’s Biggest <br className="hidden sm:inline" />
          <span className="text-metallic font-light italic normal-case block sm:inline mt-2 sm:mt-0 mr-2 sm:mr-2 pr-3">Textile B2B</span> Opportunity
        </h1>

        {/* Modernist Thin Subhead */}
        <h2
          ref={headlineRef2}
          className="font-sans text-base sm:text-xl md:text-2xl text-expo-warm/80 font-light tracking-[2px] max-w-3xl leading-relaxed mt-1"
        >
          Organized By STE • Supported By AKAS
        </h2>

        {/* Cinematic Live Countdown Timer */}
        <div className="mt-6 flex justify-center items-center gap-4 sm:gap-6 bg-expo-midnight/50 backdrop-blur-xl border border-expo-gold/20 p-4 sm:p-6 rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.15)] glow-soft max-w-md w-full relative">
          <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
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
        </div>

        {/* Call to Actions (Interactive with Cursor overlays) */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-8 z-40">
          <a
            href="#final-cta"
            className="group relative px-8 py-4 bg-gold-gradient rounded-sm text-expo-midnight font-bold font-sans text-sm tracking-[2px] uppercase overflow-hidden shadow-lg hover:shadow-expo-glow transition-all duration-500"
            data-cursor="explore"
          >
            <span className="relative z-10">BOOK YOUR STALL NOW</span>
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 luxury" />
          </a>
          <a
            href="tel:9950787787"
            className="group relative px-8 py-4 bg-transparent border border-expo-gold/40 rounded-sm text-expo-gold font-sans text-sm tracking-[2px] uppercase overflow-hidden hover:border-expo-gold transition-colors duration-500"
            data-cursor="click"
          >
            <span className="relative z-10">CALL: 9950787787</span>
            <span className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 luxury" />
          </a>
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
