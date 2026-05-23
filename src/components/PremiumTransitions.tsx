"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";

interface TransitionProps {
  mode: "gold-tunnel" | "metallic-flow";
}

export default function PremiumTransitions({ mode }: TransitionProps) {
  const transitionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const text = transitionRef.current?.querySelector(".transition-title");
    if (!text) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            waapi.animate(text as HTMLElement, {
              opacity: [0, 0.45],
              letterSpacing: ["4px", "8px"],
              duration: 1500,
              ease: "outExpo",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(transitionRef.current!);
    return () => observer.disconnect();
  }, []);

  const isTunnel = mode === "gold-tunnel";

  return (
    <div
      ref={transitionRef}
      className="relative w-full h-[35vh] sm:h-[45vh] bg-[#050505] overflow-hidden flex items-center justify-center border-y border-white/5"
    >
      {/* 1. Background full-bleed transitions videos */}
      <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
        <video
          className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.1] saturate-[0.8]"
          autoPlay
          muted
          loop
          playsInline
          src={isTunnel ? "/assets/video/transition1.mp4" : "/assets/video/transition2.mp4"}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10" />
        <div className="noise-overlay z-20" />
      </div>

      {/* 2. Abstract background texture overlays */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] mix-blend-screen scale-[1.05]"
        style={{
          backgroundImage: isTunnel
            ? `url('/assets/images/golden-fabric.png')`
            : `url('/assets/images/metallic-concentric.png')`,
        }}
      />

      {/* 3. Text systems */}
      <div className="relative z-20 text-center select-none pointer-events-none">
        <span className="transition-title font-sans text-xs sm:text-sm font-bold tracking-[8px] text-expo-gold uppercase block opacity-0">
          {isTunnel ? "• COUTURE ENCLAVE •" : "• INDUSTRIAL POWER •"}
        </span>
      </div>
    </div>
  );
}
