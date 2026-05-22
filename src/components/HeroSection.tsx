"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneCall, ChevronRight, Globe2 } from "lucide-react";
import { waapi } from "animejs";
import { GlassParticles } from "@/components/GlassParticles";

const eventStartTime = new Date("2026-09-12T00:00:00+05:30").getTime();
const morphWords = ["TEXTILE B2B", "SOURCING", "BUSINESS"];

type CountdownTime = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

function getCountdownTime(): CountdownTime {
  const remaining = Math.max(eventStartTime - Date.now(), 0);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0")
  };
}

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState<CountdownTime>(getCountdownTime);
  const [morphIndex, setMorphIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownTime());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMorphIndex((current) => (current + 1) % morphWords.length);
    }, 2800);
    return () => window.clearInterval(intervalId);
  }, []);

  // Entrance animations using Anime.js
  useEffect(() => {
    if (heroRef.current) {
      const headingElements = heroRef.current.querySelectorAll(".hero-animate-el");
      const ctas = heroRef.current.querySelectorAll(".hero-cta-el");
      
      // Animate titles, subtitle, and tags
      waapi.animate(Array.from(headingElements) as unknown as HTMLElement[], {
        opacity: [0, 1],
        translate: ["0 40px", "0 0px"],
        delay: (el, i) => i * 150,
        duration: 900,
        ease: "outExpo"
      });

      // Animate CTAs
      waapi.animate(Array.from(ctas) as unknown as HTMLElement[], {
        opacity: [0, 1],
        translate: ["0 20px", "0 0px"],
        delay: (el, i) => 600 + i * 100,
        duration: 800,
        ease: "outExpo"
      });
    }
  }, []);

  // Slide morphing text on index change
  useEffect(() => {
    const morphEl = heroRef.current?.querySelector(".morph-word-item");
    if (morphEl) {
      waapi.animate(morphEl as HTMLElement, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 600,
        ease: "outExpo"
      });
    }
  }, [morphIndex]);

  return (
    <section 
      ref={heroRef} 
      id="home"
      className="relative min-h-screen w-full bg-expo-midnight flex flex-col justify-between overflow-hidden"
    >
      
      {/* 1. Cinematic Background layers */}
      <div className="absolute inset-0 z-0">
        
        {/* Soft moving spotlights */}
        <div className="spotlight-glowing top-[20%] left-[25%] w-[600px] h-[600px]" />
        <div className="spotlight-glowing bottom-[15%] right-[20%] w-[500px] h-[500px]" style={{ animationDelay: "-7s" }} />

        {/* Ambient Dark Mesh overlay */}
        <div className="absolute inset-0 bg-mesh-dark opacity-80 z-10" />

        {/* Video Overlay Layer */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22] mix-blend-screen pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/assets/video/STE_logo_reveal_animation.mp4" type="video/mp4" />
        </video>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 grid-overlay-pattern opacity-25 z-10" />
        
        {/* Environmental Texture Noise */}
        <div className="absolute inset-0 noise-overlay z-15" />

        {/* Floating Textile particles */}
        <GlassParticles count={25} className="z-10" />

      </div>

      {/* Spacer for Navbar alignment */}
      <div className="h-28" />

      {/* 2. Main Hero Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center justify-center text-center my-auto">
        
        {/* Small badge tag */}
        <div className="hero-animate-el opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-expo-gold/25 bg-expo-black/60 backdrop-blur-md mb-6 hover:border-expo-gold/45 transition-colors">
          <Globe2 className="w-3.5 h-3.5 text-expo-gold" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-expo-gold uppercase">
            Surat Sourcing Expo 2026
          </span>
        </div>

        {/* Hero Headings */}
        <div ref={titleContainerRef} className="flex flex-col items-center">
          <h2 className="hero-animate-el opacity-0 font-display text-xl sm:text-2xl md:text-4xl tracking-widest text-expo-warm mb-2">
            INDIA&apos;S BIGGEST
          </h2>
          
          {/* Morphing Word block */}
          <h1 className="hero-animate-el opacity-0 font-display text-[clamp(2.5rem,10vw,6rem)] leading-none tracking-tight font-bold mb-2 min-h-[1.1em] flex items-center justify-center">
            <span className="morph-word-item text-metallic inline-block">
              {morphWords[morphIndex]}
            </span>
          </h1>

          <h2 className="hero-animate-el opacity-0 font-display text-2xl sm:text-3xl md:text-5xl tracking-widest text-white mb-8">
            OPPORTUNITY
          </h2>
        </div>

        {/* Stat Highlights Card */}
        <div className="hero-animate-el opacity-0 w-full max-w-3xl px-4 mb-10">
          <div 
            className="rounded-2xl p-6 md:p-8 flex flex-col items-center border border-expo-border/75 bg-expo-black/40 backdrop-blur-md group"
            style={{
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-expo-border">
              <div className="flex flex-col items-center justify-center">
                <span className="font-display text-3xl sm:text-4xl md:text-5xl text-expo-gold font-bold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">650+</span>
                <span className="text-xs uppercase tracking-widest text-expo-warm/70">Stalls</span>
              </div>
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                <span className="font-display text-3xl sm:text-4xl md:text-5xl text-expo-gold font-bold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">8000+</span>
                <span className="text-xs uppercase tracking-widest text-expo-warm/70">Verified Buyers</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 w-full border-t border-expo-border/40 flex justify-center gap-4 text-[10px] uppercase tracking-widest text-expo-warm/50 select-none">
              <span>Exhibition</span>
              <span className="text-expo-gold">•</span>
              <span>Networking</span>
              <span className="text-expo-gold">•</span>
              <span>Live Sourcing</span>
            </div>
          </div>
        </div>

        {/* CTA Button Panels */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto px-4 mb-8">
          
          <a
            href="#contact"
            className="hero-cta-el opacity-0 group relative flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gold-gradient overflow-hidden hover:scale-[1.02] transition-transform duration-500 ease-luxury shadow-[0_0_20px_rgba(214,160,102,0.25)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 text-xs font-bold uppercase tracking-widest text-expo-midnight">
              Book Your Stall Now
            </span>
            <ChevronRight className="relative z-10 w-4 h-4 text-expo-midnight group-hover:translate-x-0.5 transition-transform" />
          </a>

          <div 
            className="hero-cta-el opacity-0 flex items-center justify-center gap-4 px-6 py-3 border border-expo-border/60 bg-expo-black/40 backdrop-blur-md rounded-full"
          >
            <div className="w-9 h-9 rounded-full bg-expo-midnight border border-expo-gold/30 flex items-center justify-center animate-pulse">
              <PhoneCall className="w-3.5 h-3.5 text-expo-gold" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-expo-warm/50">Call for Stall Booking</span>
              <span className="text-sm sm:text-base font-display tracking-wider text-expo-gold font-bold">9950787787</span>
            </div>
          </div>

        </div>

        {/* Event Information Strip */}
        <div className="hero-cta-el opacity-0 w-full max-w-4xl px-4 mb-8">
           <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-expo-border border-b-2 border-b-expo-gold/50 bg-expo-black/40 backdrop-blur-md">
              <div className="flex-1 flex flex-col items-center justify-center px-4 pt-2 md:pt-0">
                <span className="text-lg font-bold text-white tracking-wide">12–13 September 2026</span>
                <span className="text-xs uppercase tracking-widest text-expo-gold mt-1 bg-expo-gold/10 px-3 py-1 rounded-full">SAT - SUN</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-4 pt-4 md:pt-0 text-center">
                <span className="text-xl font-display tracking-widest text-white">SIECC</span>
                <span className="text-xs uppercase tracking-widest text-expo-warm/70 mt-1">Sarsana Dome, Surat</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-4 pt-4 md:pt-0">
                <span className="text-sm font-serif italic text-expo-gold text-center leading-tight">
                  &quot;For those<br/>who mean business&quot;
                </span>
              </div>
           </div>
        </div>

      </div>

      {/* 3. Hero Bottom Strip: Countdown & Scroll Down Indicator */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Countdown Strip */}
        <div ref={countdownRef} className="flex items-center gap-4 sm:gap-6 bg-expo-black/40 backdrop-blur border border-expo-border/60 rounded-xl p-3 sm:px-5">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-expo-gold font-bold">
            EXPO OPENS IN
          </span>
          <div className="h-4 w-[1px] bg-expo-border" />
          <div className="flex items-center gap-3 tabular-nums text-xs sm:text-sm font-semibold tracking-wider text-expo-warm/85">
            <div>
              <span>{countdown.days}</span>
              <span className="text-[9px] text-expo-gold ml-0.5">D</span>
            </div>
            <div>
              <span>{countdown.hours}</span>
              <span className="text-[9px] text-expo-gold ml-0.5">H</span>
            </div>
            <div>
              <span>{countdown.minutes}</span>
              <span className="text-[9px] text-expo-gold ml-0.5">M</span>
            </div>
            <div>
              <span>{countdown.seconds}</span>
              <span className="text-[9px] text-expo-gold ml-0.5">S</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#about"
          className="flex items-center gap-3 group text-[10px] uppercase tracking-[0.25em] text-expo-warm/40 hover:text-expo-gold transition-colors duration-300 select-none cursor-pointer"
        >
          <span>Scroll Down</span>
          <div className="w-6 h-10 rounded-full border border-expo-border/75 flex items-start justify-center p-1 group-hover:border-expo-gold transition-colors duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-expo-gold scroll-indicator-dot" />
          </div>
        </a>

      </div>

      {/* Bottom transition gradient mask */}
      <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-expo-midnight to-transparent z-20 pointer-events-none" />

    </section>
  );
}
