"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, PhoneCall } from "lucide-react";
import { useLanguage, Translate } from "@/components/LanguageContext";

const PHONE_TEL = "+919950787787";
const PHONE_DISPLAY = "+91 99507 87787";

const navItems = [
  { name: "Home", hiName: "होम", href: "#home" },
  { name: "Couture", hiName: "वस्त्र कला", href: "#fabric-in-motion" },
  { name: "Exhibition", hiName: "प्रदर्शनी", href: "#exhibition-experience" },
  { name: "Digital Commerce", hiName: "डिजिटल वाणिज्य", href: "#future-of-commerce" },
  { name: "Countdown", hiName: "उल्टी गिनती", href: "#countdown-section" },
  { name: "Register", hiName: "पंजीकरण", href: "#buyer-registration" }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [isMobile, setIsMobile] = useState(false);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    setTimeout(() => setIsMobile(window.innerWidth < 768), 0);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerWidth < 768 ? 60 : 80;
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { passive: true } as any);
  }, []);

  // IntersectionObserver to trace active segment across landing sections
  useEffect(() => {
    const sections = [
      "home",
      "fabric-in-motion",
      "exhibition-experience",
      "future-of-commerce",
      "countdown-section",
      "buyer-registration"
    ];
    const elements = sections.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: 0.1
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const headerStyle = isMobile
    ? (isScrolled
      ? {
          backgroundColor: "rgba(5, 5, 5, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
          height: "56px",
          transition: "all 0.2s ease"
        }
      : {
          backgroundColor: "transparent",
          borderBottom: "1px solid transparent",
          height: "56px",
          transition: "all 0.2s ease"
        })
    : (isScrolled
      ? {
          backgroundColor: "rgba(5, 5, 5, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          paddingTop: "0.875rem",
          paddingBottom: "0.875rem",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
        }
      : {
          backgroundColor: "transparent",
          borderBottom: "1px solid transparent",
          paddingTop: "1.5rem",
          paddingBottom: "1.5rem",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
        });

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 flex items-center animate-navbar-slide-down"
      style={headerStyle}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between relative w-full h-full">
        
        {/* Left Column: STE & AKAS Branding Logos */}
        <div className="flex items-center z-10 select-none max-w-[120px] md:max-w-none">
          <a href="#home" className="flex items-center gap-1.5 md:gap-3 group badge-tap">
            {/* STE Logo */}
            <div className="relative w-12 h-8 md:w-20 md:h-14 overflow-hidden">
              <Image
                src="/assets/logo_STE.webp"
                alt="STE Logo"
                fill
                priority
                sizes="100px"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Premium Divider */}
            <div className="h-4 md:h-8 w-px bg-white/10 mx-0.5 md:mx-1.5" />

            {/* AKAS Circular Logo */}
            <div className="relative w-8 h-8 md:w-18 md:h-18 overflow-hidden rounded-full bg-white flex items-center justify-center border border-white/10 shadow-md group-hover:border-expo-gold/40 transition-all duration-300">
              <Image
                src="/assets/logo_AKAS.webp"
                alt="AKAS Logo"
                fill
                priority
                sizes="100px"
                className="object-contain scale-[1.35] transition-transform duration-500 group-hover:scale-[1.42]"
              />
            </div>

            {/* Brand Text */}
            <div className="hidden md:flex flex-col select-none ml-2">
              <span className="text-[8px] uppercase tracking-[0.2em] text-expo-warm/55 leading-tight font-semibold">
                <Translate en="Surat Textile" hi="सूरत टेक्सटाइल" />
              </span>
              <span className="text-xs sm:text-sm font-display tracking-widest text-expo-gold font-black leading-none gold-shimmer-text">
                <Translate en="EXHIBITION" hi="प्रदर्शनी" />
              </span>
            </div>
          </a>
        </div>

        {/* Center Column: Desktop Navigation Links */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center gap-4 lg:gap-8 text-[10px] lg:text-[11px] uppercase tracking-[0.12em] font-medium select-none">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`nav-link-hover-trace focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold ${
                  isActive ? "active text-expo-gold font-bold" : "text-expo-warm/60 hover:text-expo-warm"
                } py-2.5 transition-colors duration-300 badge-tap`}
              >
                <Translate en={item.name} hi={item.hiName} />
              </a>
            );
          })}
        </nav>

        {/* Right Column: Action Button, Call Support & Mobile Toggle */}
        <div className="flex items-center z-10 gap-4 xl:gap-8">
          <div className="hidden md:flex items-center gap-6 xl:gap-8">
            <a 
              href={`tel:${PHONE_TEL}`}
              className="hidden min-[1700px]:flex items-center gap-2.5 text-expo-warm/75 hover:text-expo-gold transition-colors duration-300 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
            >
              <PhoneCall className="w-3.5 h-3.5 text-expo-gold/80" />
              <span className="text-[10px] tracking-[0.18em] font-sans uppercase">
                <Translate en={`Call: ${PHONE_DISPLAY}`} hi={`कॉल: ${PHONE_DISPLAY}`} />
              </span>
            </a>

            {/* Language Toggle Pill */}
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 select-none w-[80px] h-[32px] overflow-hidden">
              <div
                className="absolute top-0.5 bottom-0.5 rounded-full bg-expo-gold/25 border border-expo-gold/45 transition-all duration-300 ease-out"
                style={{
                  left: language === "en" ? "2px" : "40px",
                  width: "36px"
                }}
              />
              <button
                onClick={() => setLanguage("en")}
                className={`relative z-10 w-1/2 text-center text-[10px] font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "en" ? "text-expo-gold" : "text-expo-warm/50"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`relative z-10 w-1/2 text-center text-[10px] font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "hi" ? "text-expo-gold" : "text-expo-warm/50"
                }`}
              >
                हिं
              </button>
            </div>
            
            <a 
              href="#final-cta"
              data-cursor="cta"
              className="px-6 py-2.5 rounded-full bg-gold-gradient text-black font-bold text-[9px] uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
            >
              <Translate en="Book Your Stall" hi="अपना स्टॉल बुक करें" />
            </a>
          </div>

          {/* Mobile Toggle Button (Visible below MD break) */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-expo-warm hover:text-expo-gold transition-colors p-3 z-[9999] relative w-11 h-11 flex items-center justify-center focus:outline-none badge-tap"
            aria-label="Toggle Menu"
            aria-expanded={isMobileOpen}
          >
            <div className="flex flex-col justify-between w-5 h-3 relative">
              <span className={`w-5 h-[2px] bg-[#B87333] block transition-all duration-300 origin-center ${isMobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`w-5 h-[2px] bg-[#B87333] block transition-all duration-300 ${isMobileOpen ? 'scale-x-0 opacity-0' : 'opacity-100'}`} />
              <span className={`w-5 h-[2px] bg-[#B87333] block transition-all duration-300 origin-center ${isMobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </div>
          </button>
        </div>

      </div>

      {/* Mobile Navigation Panel (Visible below MD break) */}
      <div
        id="primary-mobile-menu"
        className={`mobile-drawer md:hidden fixed inset-0 z-[9997] bg-[#050505]/95 pt-20 pb-8 px-6 flex flex-col justify-between shadow-2xl overflow-y-auto mobile-menu-drawer ${
          isMobileOpen ? "open" : "closed"
        }`}
        style={{
          height: "100svh",
          backgroundImage: "radial-gradient(circle at top, rgba(184, 115, 51, 0.15) 0%, transparent 70%)"
        }}
      >
        <nav className="flex flex-col w-full mt-6">
          {navItems.map((item, index) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`h-[64px] flex items-center font-cormorant text-[28px] text-[#F7F4EF] border-b border-[#D4AF37]/20 mobile-nav-link badge-tap ${
                  isActive ? "border-l-[4px] border-l-[#D4AF37] pl-3" : "pl-1 hover:border-l-[4px] hover:border-l-[#D4AF37] hover:pl-3"
                } ${isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <Translate en={item.name} hi={item.hiName} />
              </a>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4 w-full mt-8 mb-6">
          {/* Language toggle: EN | हिं pill, centered, above buttons */}
          <div 
            className={`flex justify-center mb-2 mobile-menu-cta ${
              isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: "400ms"
            }}
          >
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 select-none w-[120px] h-[36px] overflow-hidden">
              <div
                className="absolute top-0.5 bottom-0.5 rounded-full bg-expo-gold/25 border border-expo-gold/45 transition-all duration-300 ease-out"
                style={{
                  left: language === "en" ? "2px" : "60px",
                  width: "56px"
                }}
              />
              <button
                onClick={() => setLanguage("en")}
                className={`relative z-10 w-1/2 text-center text-xs font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "en" ? "text-expo-gold" : "text-expo-warm/50"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`relative z-10 w-1/2 text-center text-xs font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "hi" ? "text-expo-gold" : "text-expo-warm/50"
                }`}
              >
                हिं
              </button>
            </div>
          </div>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/919950787787?text=Namaste!%20I%20visited%20the%20STE%202026%20website%20and%20would%20like%20more%20information."
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full h-[52px] bg-[#25D366] text-white flex items-center justify-center gap-2 rounded-xl font-bold text-[15px] wa-pulse btn-shimmer tap-feedback mobile-menu-cta ${
              isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: "450ms"
            }}
          >
            <span>📲 WhatsApp Us</span>
          </a>

          {/* Book a Stall Button */}
          <a
            href="#packages"
            onClick={() => setIsMobileOpen(false)}
            className={`w-full h-[52px] bg-gold-gradient text-black flex items-center justify-center rounded-xl font-extrabold text-[15px] uppercase tracking-wider btn-shimmer tap-feedback mobile-menu-cta ${
              isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: "500ms"
            }}
          >
            <Translate en="Book a Stall" hi="अपना स्टॉल बुक करें" />
          </a>
        </div>
      </div>
    </header>
  );
}
