"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PhoneCall, MoveRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const midgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current || !bgRef.current || !midgroundRef.current) return;

    // Parallax effect on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    // The text moves up faster than the background to create depth
    tl.to(textRef.current, { y: -150, ease: 'none' }, 0)
      .to(bgRef.current, { y: 50, ease: 'none' }, 0)
      // The midground (architecture) moves up slower, overlapping the text
      .to(midgroundRef.current, { y: -50, ease: 'none' }, 0);

  }, []);

  return (
    <section ref={containerRef} className="relative h-[120vh] w-full overflow-hidden bg-expo-midnight flex flex-col items-center justify-start pt-20">

      {/* Background Plane - Sky and Distant Environment */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-expo-midnight/80 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('/assets/ste_luxury_hero_613dfd3b.jpg')] bg-cover bg-top opacity-30 mix-blend-screen" />
        {/* Soft volumetric glow */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-expo-copper/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
      </div>

      {/* Top Brand Bar */}
      <header className="relative z-50 w-full max-w-7xl mx-auto px-6 flex items-center justify-between py-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Image src="/assets/STE LOGO.jpg" alt="STE Logo" width={80} height={40} className="object-contain" />
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

        <div>
          <button className="group relative px-6 py-3 rounded-full border border-expo-gold/50 overflow-hidden transition-all duration-500 ease-luxury hover:border-expo-gold hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(214,160,102,0.3)]">
            <div className="absolute inset-0 bg-expo-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
            <span className="relative z-10 text-xs uppercase tracking-widest text-expo-gold group-hover:text-expo-midnight font-bold transition-colors duration-500">Book Stall</span>
          </button>
        </div>
      </header>

      {/* Main Headline Block */}
      <div className="relative z-30 flex flex-col items-center text-center mt-12 px-4 pointer-events-none">
        <h2 className="font-display text-2xl md:text-4xl tracking-widest text-expo-warm mb-2">INDIA&apos;S BIGGEST</h2>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-2 relative">
          <span className="text-metallic inline-block relative">
            TEXTILE B2B
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          </span>
        </h1>
        <h2 className="font-display text-3xl md:text-5xl tracking-widest text-white">OPPORTUNITY</h2>
      </div>

      {/* Floating Stats Glass Panel */}
      <div className="relative z-40 mt-12 w-full max-w-4xl px-4">
        <div className="glass-panel glass-panel-glow rounded-2xl p-6 md:p-8 flex flex-col items-center transition-all duration-500 hover:bg-expo-black/80 hover:border-expo-gold/30 hover:shadow-[0_0_30px_rgba(214,160,102,0.15)] group">
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-expo-border">
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <span className="font-display text-4xl md:text-5xl text-expo-gold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">650+</span>
              <span className="text-sm uppercase tracking-widest text-expo-warm/70">Stalls</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <span className="font-display text-4xl md:text-5xl text-expo-gold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">8000+</span>
              <span className="text-sm uppercase tracking-widest text-expo-warm/70">Verified Buyers</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
              <span className="font-display text-4xl md:text-5xl text-expo-gold mb-1 group-hover:scale-105 transition-transform duration-500 ease-luxury">PAN India</span>
              <span className="text-sm uppercase tracking-widest text-expo-warm/70">B2B</span>
            </div>
          </div>
          <div className="mt-8 pt-4 w-full border-t border-expo-border flex justify-center gap-4 text-xs uppercase tracking-widest text-expo-warm/50">
            <span>Exhibition</span>
            <span className="text-expo-gold">•</span>
            <span>Networking</span>
            <span className="text-expo-gold">•</span>
            <span>Live Sourcing</span>
          </div>
        </div>
      </div>

      {/* Massive SURAT Typography - Z-Index Layer 10 */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-full flex justify-center z-10 pointer-events-none mix-blend-lighten">
        <h1
          ref={textRef}
          className="font-display text-[20vw] leading-none tracking-tighter text-metallic opacity-90 w-full text-center"
          style={{
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
            transformStyle: 'preserve-3d'
          }}
        >
          SURAT
        </h1>
      </div>

      {/* Midground Plane - Architecture Masking the Text - Z-Index Layer 20 */}
      {/* We use an image with transparency at the top (or carefully clipped) to overlap the bottom of "SURAT" */}
      <div
        ref={midgroundRef}
        className="absolute bottom-0 left-0 w-full h-[60vh] z-20 pointer-events-none flex items-end justify-center"
      >
        {/* We use the provided architecture image, masking it so it overlays the text */}
        <div className="relative w-full h-full">
           <Image
             src="/assets/ste_luxury_hero_613dfd3b.jpg"
             alt="Architecture"
             fill
             className="object-cover object-bottom"
             style={{
               maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)',
               WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)'
             }}
             priority
           />
           {/* Ground reflections overlay */}
           <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-expo-midnight to-transparent" />
        </div>
      </div>

      {/* Hero CTA Zone & Event Info - Z-Index Layer 30 (Above Architecture) */}
      <div className="absolute bottom-10 left-0 w-full z-30 flex flex-col items-center gap-6 px-4">

        {/* CTA Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-expo-black/40 backdrop-blur-md p-2 rounded-full border border-expo-border">
          <button className="group relative flex items-center gap-3 px-8 py-4 rounded-full bg-gold-gradient overflow-hidden hover:scale-[1.02] transition-transform duration-500 ease-luxury shadow-[0_0_20px_rgba(214,160,102,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 text-sm font-bold uppercase tracking-widest text-expo-midnight">Book Your Stall Now</span>
            <MoveRight className="relative z-10 w-4 h-4 text-expo-midnight group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-4 px-6 py-2 border-l border-expo-border/50">
            <div className="w-10 h-10 rounded-full bg-expo-midnight border border-expo-gold/30 flex items-center justify-center animate-pulse">
              <PhoneCall className="w-4 h-4 text-expo-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-expo-warm/50">Call for Stall Booking</span>
              <span className="text-lg font-display tracking-wider text-expo-gold">9950787787</span>
            </div>
          </div>
        </div>

        {/* Event Information Strip */}
        <div className="w-full max-w-5xl mt-8">
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

      </div>

    </section>
  );
}
