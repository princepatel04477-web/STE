"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneCall, MoveRight } from 'lucide-react';

const eventStartTime = new Date('2026-09-12T00:00:00+05:30').getTime();
const morphWords = ['TEXTILE B2B', 'SOURCING', 'BUSINESS'];

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
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
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
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, []);

  // Framer Motion variants for enter animations
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (delay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
    }),
  };

  return (
    <section ref={containerRef} className="relative min-h-[100svh] md:min-h-[120vh] w-full overflow-hidden bg-expo-midnight flex flex-col items-center justify-start pt-4 sm:pt-8 md:pt-20 pb-10 md:pb-16">

      {/* Background Plane - Sky and Distant Environment */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-expo-midnight/80 via-transparent to-transparent z-10" />
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-screen"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/assets/video/STE_logo_reveal_animation.mp4" type="video/mp4" />
        </video>
        {/* Soft volumetric glow */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-expo-copper/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        {/* Morphing background blobs */}
        <motion.div
          className="absolute top-[20%] left-[10%] w-64 h-64 bg-expo-gold/10 rounded-full blur-[80px] pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-expo-copper/10 rounded-full blur-[80px] pointer-events-none"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top Brand Bar */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 py-4 md:py-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <Image src="/assets/STE LOGO.jpg" alt="STE Logo" width={80} height={68} className="h-auto w-16 object-contain sm:w-20" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-expo-warm/60">Organised By</span>
              <div className="h-[1px] w-full bg-expo-border mt-1" />
            </div>
          </div>
          <div className="h-8 w-[1px] bg-expo-border hidden md:block" />
          <div className="hidden md:flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-expo-border flex items-center justify-center bg-expo-midnight/50">
               <span className="text-xs font-bold text-expo-gold">AKAS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-expo-warm/60">Supported By</span>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.2em] font-medium">
          {['Home', 'About', 'Categories', 'Benefits', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="group relative py-2">
              <span className="text-expo-warm/80 group-hover:text-expo-warm transition-colors duration-300">{item}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-expo-gold transition-all duration-300 ease-luxury group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="shrink-0">
          <button className="group relative px-4 py-2.5 sm:px-6 sm:py-3 rounded-full border border-expo-gold/50 overflow-hidden transition-all duration-500 ease-luxury hover:border-expo-gold hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(214,160,102,0.3)]">
            <div className="absolute inset-0 bg-expo-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
            <span className="relative z-10 text-[10px] sm:text-xs uppercase tracking-widest text-expo-gold group-hover:text-expo-midnight font-bold transition-colors duration-500">Book Stall</span>
          </button>
        </div>
      </header>

      {/* Main Headline Block */}
      <motion.div
        className="relative z-30 flex flex-col items-center text-center mt-6 md:mt-12 px-4 pointer-events-none"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <h2 className="font-display text-xl sm:text-2xl md:text-4xl tracking-widest text-expo-warm mb-2">INDIA&apos;S BIGGEST</h2>
        <h1 className="font-display text-[clamp(3rem,16vw,5rem)] md:text-7xl lg:text-8xl tracking-tight leading-none mb-2 relative">
          <span key={morphWords[morphIndex]} className="morph-word text-metallic inline-block relative min-w-[min(92vw,760px)]">
            {morphWords[morphIndex]}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          </span>
        </h1>
        <h2 className="font-display text-2xl sm:text-3xl md:text-5xl tracking-widest text-white">OPPORTUNITY</h2>
      </motion.div>

      <div className="relative z-40 mt-8 md:mt-12 w-full max-w-4xl px-4">
        <motion.div
          className="glass-card glass-panel-glow rounded-2xl p-5 md:p-8 flex flex-col items-center group"
          whileHover={{
            y: -4,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-5 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-expo-border">
            <div className="flex flex-col items-center justify-center pt-0">
              <span className="font-display text-3xl md:text-5xl text-expo-gold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">650+</span>
              <span className="text-sm uppercase tracking-widest text-expo-warm/70">Stalls</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-5 md:pt-0">
              <span className="font-display text-3xl md:text-5xl text-expo-gold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">8000+</span>
              <span className="text-sm uppercase tracking-widest text-expo-warm/70">Verified Buyers</span>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-4 w-full border-t border-expo-border flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs uppercase tracking-widest text-expo-warm/50">
            <span>Exhibition</span>
            <span className="text-expo-gold">•</span>
            <span>Networking</span>
            <span className="text-expo-gold">•</span>
            <span>Live Sourcing</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 z-[25] pointer-events-none bg-expo-midnight/25" />

      <motion.div
        className="relative left-0 w-full z-30 mt-10 md:mt-12 flex flex-col items-center gap-6 px-4"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >

        {/* CTA Bar */}
        <div className="flex w-full max-w-5xl flex-col md:w-auto md:flex-row items-stretch md:items-center gap-3 md:gap-6 bg-expo-black/40 backdrop-blur-md p-2 rounded-2xl md:rounded-full border border-expo-border">
          <button className="group relative flex items-center justify-center gap-3 px-6 md:px-8 py-4 rounded-full bg-gold-gradient overflow-hidden hover:scale-[1.02] transition-transform duration-500 ease-luxury shadow-[0_0_20px_rgba(214,160,102,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 text-center text-sm font-bold uppercase tracking-widest text-expo-midnight">Book Your Stall Now</span>
            <MoveRight className="relative z-10 w-4 h-4 text-expo-midnight group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center justify-center gap-4 px-4 sm:px-6 py-3 md:py-2 md:border-l border-expo-border/50">
            <div className="w-10 h-10 rounded-full bg-expo-midnight border border-expo-gold/30 flex items-center justify-center animate-pulse">
              <PhoneCall className="w-4 h-4 text-expo-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-expo-warm/50">Call for Stall Booking</span>
              <span className="text-lg font-display tracking-wider text-expo-gold">9950787787</span>
            </div>
          </div>
        </div>

        {/* Countdown Strip */}
        <div className="w-full max-w-5xl">
          <div className="glass-panel glass-panel-glow rounded-xl border border-expo-gold/20 p-3 sm:p-4">
            <div className="mb-3 flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-expo-gold/80">
                Expo opens in
              </span>
              <span className="hidden h-[1px] w-10 bg-expo-border sm:block" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-expo-warm/55">
                12 Sep 2026
              </span>
            </div>
            <div className="grid grid-cols-4 divide-x divide-expo-border">
              {[
                ['D', countdown?.days],
                ['H', countdown?.hours],
                ['M', countdown?.minutes],
                ['S', countdown?.seconds],
              ].map(([label, value]) => (
                <div key={label} className="flex min-w-0 flex-col items-center justify-center px-2">
                  <span className="font-display text-2xl sm:text-4xl md:text-5xl leading-none text-expo-gold tabular-nums">
                    {value}
                  </span>
                  <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-expo-warm/55">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Information Strip */}
        <div className="w-full max-w-5xl">
           <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-expo-border border-b-2 border-b-expo-gold/50">
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

      </motion.div>

    </section>
  );
}
