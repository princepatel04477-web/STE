"use client";

import { useEffect, useState, useRef } from "react";
import { waapi } from "animejs";

export default function CountdownSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
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

    // Fade-in reveal
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const panels = containerRef.current?.querySelectorAll(".glow-panel");
              if (panels) {
                waapi.animate(Array.from(panels) as unknown as HTMLElement[], {
                  opacity: [0, 1],
                  scale: [0.95, 1],
                  translateY: [20, 0],
                  duration: 900,
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
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 bg-[#050505] flex flex-col justify-center items-center overflow-hidden border-t border-b border-expo-border/30"
    >
      <div className="absolute inset-0 bg-mesh-dark opacity-60 pointer-events-none" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
      <div className="spotlight-glowing left-[20%] top-[20%] w-[35vw] h-[35vw]" />
      <div className="spotlight-glowing right-[20%] bottom-[20%] w-[35vw] h-[35vw]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 flex flex-col items-center text-center w-full">
        {/* Title */}
        <span className="text-[10px] sm:text-xs font-bold tracking-[6px] text-expo-gold uppercase mb-4 block">
          SECURE YOUR COMMERCIAL STALL
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl tracking-wide text-white mb-6 leading-tight max-w-4xl">
          The Sourcing Event <br />
          <span className="text-metallic font-light italic">Commences In</span>
        </h2>
        <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mb-16 max-w-xl">
          Surat Textile Exhibition 2026 is almost fully booked. Watch the cinematic ticking clock and act fast to secure your premium exhibition stall before registration closes.
        </p>

        {/* Large Cinematic Countdown Grid */}
        <div className="w-full max-w-4xl flex justify-center">
          {!isMounted ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full">
              {/* Days Fallback */}
              <div className="glow-panel relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-expo-gold leading-none tracking-normal drop-shadow-[0_0_15px_rgba(214,160,102,0.4)]">
                  110
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Days
                </span>
              </div>
              {/* Hours Fallback */}
              <div className="glow-panel relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-white leading-none tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  12
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Hours
                </span>
              </div>
              {/* Minutes Fallback */}
              <div className="glow-panel relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-white leading-none tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  30
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Minutes
                </span>
              </div>
              {/* Seconds Fallback */}
              <div className="glow-panel relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-expo-gold leading-none tracking-normal drop-shadow-[0_0_15px_rgba(214,160,102,0.4)]">
                  45
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Seconds
                </span>
              </div>
            </div>
          ) : isExpired ? (
            <div className="glow-panel relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-12 md:p-16 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.15)] max-w-2xl w-full">
              <div className="absolute inset-0 bg-gold-gradient opacity-[0.05] rounded-2xl pointer-events-none" />
              <span className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-expo-gold leading-none tracking-wider uppercase animate-pulse">
                EVENT IN PROGRESS
              </span>
              <span className="text-sm text-expo-warm/70 mt-4 tracking-[2px] font-sans font-semibold uppercase">
                September 12-13, 2026 • SIECC, Surat
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full">
              {/* Days */}
              <div className="glow-panel opacity-0 translate-y-[20px] relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-expo-gold leading-none tracking-normal drop-shadow-[0_0_15px_rgba(214,160,102,0.4)]">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Days
                </span>
              </div>

              {/* Hours */}
              <div className="glow-panel opacity-0 translate-y-[20px] relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-white leading-none tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Hours
                </span>
              </div>

              {/* Minutes */}
              <div className="glow-panel opacity-0 translate-y-[20px] relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-white leading-none tracking-normal drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Minutes
                </span>
              </div>

              {/* Seconds */}
              <div className="glow-panel opacity-0 translate-y-[20px] relative border-glow-card bg-expo-midnight/40 backdrop-blur-2xl p-8 md:p-12 flex flex-col items-center justify-center rounded-2xl shadow-[0_0_50px_rgba(214,160,102,0.05)]">
                <div className="absolute inset-0 bg-gold-gradient opacity-[0.02] rounded-2xl pointer-events-none" />
                <span className="font-serif text-5xl md:text-7xl font-extralight text-expo-gold leading-none tracking-normal drop-shadow-[0_0_15px_rgba(214,160,102,0.4)]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[4px] text-expo-warm/50 block mt-4 font-semibold">
                  Seconds
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
