"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Menu, X, PhoneCall } from "lucide-react";
import { waapi } from "animejs";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "Couture", href: "#fabric-in-motion" },
  { name: "Exhibition", href: "#exhibition-experience" },
  { name: "Fashion Editorial", href: "#fashion-editorial" },
  { name: "Digital Commerce", href: "#future-of-commerce" }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle mobile menu slide & stagger animate on open
  useEffect(() => {
    if (isMobileOpen && mobileMenuRef.current) {
      const items = mobileMenuRef.current.querySelectorAll(".mobile-nav-item");
      
      // Animate mobile menu panel sliding in
      waapi.animate(mobileMenuRef.current as HTMLElement, {
        opacity: [0, 1],
        translate: ["0 -20px", "0 0px"],
        duration: 400,
        ease: "outExpo"
      });

      // Stagger items entry
      waapi.animate(Array.from(items) as unknown as HTMLElement[], {
        opacity: [0, 1],
        translate: ["0 20px", "0 0px"],
        delay: (el, i) => i * 80,
        duration: 500,
        ease: "outExpo"
      });
    }
  }, [isMobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#050505]/85 backdrop-blur-md border-b border-white/[0.06] shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between relative w-full">
        
        {/* Left Column: STE & AKAS Branding Logos */}
        <div className="flex items-center z-10 select-none">
          <a href="#home" className="flex items-center gap-2 sm:gap-3 group">
            {/* STE Logo */}
            <div className="relative w-16 h-11 sm:w-20 sm:h-14 overflow-hidden">
              <Image
                src="/assets/logo_STE.png"
                alt="STE Logo"
                fill
                priority
                sizes="100px"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Premium Divider */}
            <div className="h-6 sm:h-8 w-px bg-white/10 mx-1 sm:mx-1.5" />

            {/* AKAS Circular Logo */}
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 overflow-hidden rounded-full bg-white flex items-center justify-center border border-white/10 shadow-md group-hover:border-expo-gold/40 transition-all duration-300">
              <Image
                src="/assets/AKAS_1.png"
                alt="AKAS Logo"
                fill
                priority
                sizes="100px"
                className="object-contain scale-[1.35] transition-transform duration-500 group-hover:scale-[1.42]"
              />
            </div>

            {/* Brand Text */}
            <div className="hidden sm:flex flex-col select-none ml-2">
              <span className="text-[8px] uppercase tracking-[0.2em] text-expo-warm/55 leading-tight font-semibold">Surat Textile</span>
              <span className="text-xs sm:text-sm font-display tracking-widest text-expo-gold font-black leading-none">EXHIBITION</span>
            </div>
          </a>
        </div>

        {/* Center Column: Desktop Navigation Links (Absolutely Centered & Spacious starting at XL) */}
        <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-6 xl:gap-8 text-[10px] xl:text-[11px] uppercase tracking-[0.12em] font-medium select-none">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="group relative py-2.5 text-expo-warm/60 hover:text-expo-warm transition-colors duration-300"
            >
              <span>{item.name}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 ease-out group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Column: Action Button, Call Support & Mobile Toggle */}
        <div className="flex items-center z-10 gap-4 xl:gap-8">
          <div className="hidden sm:flex items-center gap-6 xl:gap-8">
            <a 
              href="tel:9950787787"
              className="hidden xl:flex items-center gap-2.5 text-expo-warm/75 hover:text-expo-gold transition-colors duration-300 font-medium"
            >
              <PhoneCall className="w-3.5 h-3.5 text-expo-gold/80" />
              <span className="text-[10px] tracking-[0.18em] font-sans uppercase">Call: 9950787787</span>
            </a>
            
            <a 
              href="#final-cta"
              className="group relative px-6 py-3 rounded-full overflow-hidden border border-expo-gold/25 transition-all duration-500 hover:border-expo-gold hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(214,160,102,0.12)]"
            >
              <div className="absolute inset-0 bg-gold-gradient translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-luxury" />
              <span className="relative z-10 text-[9px] uppercase tracking-[0.2em] font-bold text-expo-gold group-hover:text-expo-midnight transition-colors duration-500">
                Book Your Stall
              </span>
            </a>
          </div>

          {/* Mobile Toggle Button (Visible below XL break) */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="xl:hidden text-expo-warm hover:text-expo-gold transition-colors p-2"
            aria-label="Toggle Menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Panel (Visible below XL break) */}
      {isMobileOpen && (
        <div
          ref={mobileMenuRef}
          className="xl:hidden absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06] py-8 px-6 flex flex-col gap-6 shadow-2xl animate-fade-in"
        >
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className="mobile-nav-item opacity-0 text-lg uppercase tracking-widest text-expo-warm hover:text-expo-gold transition-colors py-2 border-b border-expo-border/20"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="mobile-nav-item opacity-0 flex flex-col gap-4 mt-2">
            <a
              href="#final-cta"
              onClick={() => setIsMobileOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-gold-gradient text-expo-midnight uppercase font-bold text-xs tracking-widest"
            >
              Book Your Stall
            </a>
            <div className="flex items-center justify-center gap-3 py-3 border border-expo-border/40 rounded-xl bg-expo-black/40">
              <PhoneCall className="w-4 h-4 text-expo-gold animate-pulse" />
              <a href="tel:9950787787" className="text-sm font-display tracking-wider text-expo-gold hover:underline">
                9950787787
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
