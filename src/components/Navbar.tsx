"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, PhoneCall } from "lucide-react";
import { useLanguage, Translate } from "@/components/LanguageContext";

const PHONE_TEL = "+919950787787";
const PHONE_DISPLAY = "+91 99507 87787";

const navItems = [
  { name: "Home", hiName: "होम", href: "/#home" },
  { name: "Couture", hiName: "वस्त्र कला", href: "/#fabric-in-motion" },
  { name: "Exhibition", hiName: "प्रदर्शनी", href: "/#exhibition-experience" },
  { name: "Digital Commerce", hiName: "डिजिटल वाणिज्य", href: "/#future-of-commerce" },
  { name: "Register", hiName: "पंजीकरण", href: "/#buyer-registration" },
  { name: "Stall Lottery", hiName: "स्टॉल लकी ड्रा", href: "/stall-allocation" }
];

/**
 * Everything below the fold is a LazySection placeholder that expands from its
 * reserved minHeight to its real height when it mounts. A default #anchor jump
 * aims at an offset measured while the page is still collapsed, and the CSS
 * smooth scroll then spends seconds travelling there — mounting sections and
 * growing the document as it goes, so the destination retreats faster than the
 * scroll arrives. Measured on production: clicking Register animated for 2.3s
 * and stopped 4770px short of the section.
 *
 * Jump instantly instead — nothing in between crosses the observer margin, so
 * the page barely grows — then re-aim whenever the layout actually changes, so
 * a section that mounts late still gets corrected for. Watching for resizes
 * rather than polling frames matters: the heaviest section lands its chunk
 * around 2.3s, long after any "has it stopped moving yet" guess gives up.
 */
let cancelPendingAim: (() => void) | null = null;

function scrollToSection(href: string) {
  const el = document.getElementById(href.slice(1));
  if (!el) return;

  // A correction from an earlier click is still aiming at the old section for
  // up to three seconds; leaving it running would drag us back off this one.
  cancelPendingAim?.();

  const aim = () => {
    const header = document.querySelector("header");
    const offset = header ? header.getBoundingClientRect().height : 0;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
    // "instant", not "auto": auto defers to the computed scroll-behavior, which
    // is smooth here, so each re-aim would restart the animation we are avoiding.
    window.scrollTo({ top, behavior: "instant" });
  };

  aim();

  // Give up on a deadline so a section that animates forever cannot hold the
  // page hostage, and the moment the visitor scrolls for themselves — re-aiming
  // under someone who has taken over is worse than landing slightly off.
  const handOver = ["wheel", "touchstart", "keydown"];
  const stop = () => {
    resizes.disconnect();
    clearTimeout(deadline);
    handOver.forEach((evt) => window.removeEventListener(evt, stop));
    if (cancelPendingAim === stop) cancelPendingAim = null;
  };
  const resizes = new ResizeObserver(aim);
  const deadline = setTimeout(stop, 3000);

  resizes.observe(document.body);
  handOver.forEach((evt) => window.addEventListener(evt, stop, { passive: true }));
  cancelPendingAim = stop;
}

interface NavbarProps {
  theme?: "dark" | "light";
}

export default function Navbar({ theme = "dark" }: NavbarProps) {
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

  const headerStyle = theme === "light"
    ? (isMobile
      ? {
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.06)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
          height: "56px",
          transition: "all 0.2s ease"
        }
      : {
          backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          boxShadow: isScrolled ? "0 10px 30px rgba(0, 0, 0, 0.06)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
          paddingTop: isScrolled ? "0.875rem" : "1.25rem",
          paddingBottom: isScrolled ? "0.875rem" : "1.25rem",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
        })
    : (isMobile
      ? (isScrolled
        ? {
            backgroundColor: "rgba(5, 5, 5, 0.97)",
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
            backgroundColor: "rgba(5, 5, 5, 0.88)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
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
          }));

  return (
    <header
      className="fixed top-0 left-0 w-full z-nav flex items-center animate-navbar-slide-down"
      style={headerStyle}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 flex items-center justify-between relative w-full h-full">
        
        {/* Left Column: STE & AKAS Branding Logos */}
        <div className="flex items-center z-10 shrink-0 select-none max-w-[120px] md:max-w-none">
          <a href="/#home" className="flex items-center gap-1.5 md:gap-3 group badge-tap">
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
            <div className={`h-4 md:h-8 w-px mx-0.5 md:mx-1.5 ${
              theme === "light" ? "bg-slate-300" : "bg-white/10"
            }`} />

            {/* AKAS Circular Logo */}
            <div className={`relative w-8 h-8 md:w-18 md:h-18 overflow-hidden rounded-full bg-white flex items-center justify-center transition-all duration-300 ${
              theme === "light" ? "border border-slate-300 shadow-xs group-hover:border-amber-500" : "border border-white/10 shadow-md group-hover:border-expo-gold/40"
            }`}>
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
              <span className={`text-xs uppercase tracking-[0.2em] leading-tight font-bold ${
                theme === "light" ? "text-slate-700" : "text-expo-warm/55"
              }`}>
                <Translate en="Surat Textile" hi="सूरत टेक्सटाइल" />
              </span>
              <span className={`text-xs sm:text-sm font-display tracking-widest font-black leading-none ${
                theme === "light" ? "text-amber-800" : "text-expo-gold font-black gold-shimmer-text"
              }`}>
                <Translate en="EXHIBITION" hi="प्रदर्शनी" />
              </span>
            </div>
          </a>
        </div>

        {/* Center Column: Desktop Navigation Links */}
        <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-6 min-[1700px]:gap-4 text-xs uppercase tracking-[0.12em] font-medium select-none">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.href.includes('#')) {
                    const id = item.href.split('#')[1];
                    if (document.getElementById(id)) {
                      e.preventDefault();
                      history.replaceState(null, "", `#${id}`);
                      scrollToSection(`#${id}`);
                    }
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={`nav-link-hover-trace whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold ${
                  isActive
                    ? (theme === "light" ? "active text-amber-800 font-extrabold" : "active text-expo-gold font-bold")
                    : (theme === "light" ? "text-slate-700 hover:text-amber-800 font-bold" : "text-expo-warm/60 hover:text-expo-warm")
                } py-2.5 transition-colors duration-300 badge-tap`}
              >
                <Translate en={item.name} hi={item.hiName} />
              </a>
            );
          })}
        </nav>

        {/* Right Column: Action Button, Call Support & Mobile Toggle */}
        <div className="flex items-center z-10 shrink-0 gap-4 xl:gap-8">
          <div className="hidden md:flex items-center gap-6 xl:gap-8">
            <a 
              href={`tel:${PHONE_TEL}`}
              className={`hidden min-[1700px]:flex items-center gap-2.5 transition-colors duration-300 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap ${
                theme === "light" ? "text-slate-700 hover:text-amber-800" : "text-expo-warm/75 hover:text-expo-gold"
              }`}
            >
              <PhoneCall className={`w-3.5 h-3.5 ${theme === "light" ? "text-amber-700" : "text-expo-gold/80"}`} />
              <span className="text-xs tracking-[0.18em] font-sans uppercase">
                <Translate en={`Call: ${PHONE_DISPLAY}`} hi={`कॉल: ${PHONE_DISPLAY}`} />
              </span>
            </a>

            {/* Language Toggle Pill */}
            <div className={`relative flex items-center rounded-full p-0.5 select-none w-[80px] h-[32px] overflow-hidden ${
              theme === "light" ? "bg-slate-200/80 border border-slate-300 shadow-xs" : "bg-black/40 border border-white/10"
            }`}>
              <div
                className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-out ${
                  theme === "light" ? "bg-amber-500 border border-amber-400 shadow-xs" : "bg-expo-gold/25 border border-expo-gold/45"
                }`}
                style={{
                  left: language === "en" ? "2px" : "40px",
                  width: "36px"
                }}
              />
              <button
                onClick={() => setLanguage("en")}
                className={`relative z-10 w-1/2 text-center text-xs font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "en"
                    ? (theme === "light" ? "text-slate-950 font-black" : "text-expo-gold")
                    : (theme === "light" ? "text-slate-600" : "text-expo-warm/50")
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`relative z-10 w-1/2 text-center text-xs font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "hi"
                    ? (theme === "light" ? "text-slate-950 font-black" : "text-expo-gold")
                    : (theme === "light" ? "text-slate-600" : "text-expo-warm/50")
                }`}
              >
                हिं
              </button>
            </div>
            
            <a 
              href="/exhibitor/login"
              data-cursor="cta"
              className="px-6 py-2.5 rounded-full bg-gold-gradient text-black font-extrabold text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
            >
              <Translate en="Exhibitor's Portal" hi="प्रदर्शक पोर्टल" />
            </a>
          </div>

          {/* Mobile Exhibitor Portal Quick Button */}
          <a
            href="/exhibitor/login"
            className="md:hidden px-3.5 py-1.5 rounded-full bg-gold-gradient text-black font-extrabold text-[11px] uppercase tracking-wider shadow-md whitespace-nowrap active:scale-95 transition-transform"
          >
            <Translate en="Portal" hi="पोर्टल" />
          </a>

          {/* Mobile Toggle Button (Visible below XL break) */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`xl:hidden transition-colors p-3 z-modal relative w-11 h-11 flex items-center justify-center focus:outline-none badge-tap ${
              theme === "light" ? "text-slate-900" : "text-expo-warm hover:text-expo-gold"
            }`}
            aria-label="Toggle Menu"
            aria-expanded={isMobileOpen}
          >
            <div className="flex flex-col justify-between w-5 h-3 relative">
              <span className={`w-5 h-[2px] block transition-all duration-300 origin-center ${
                theme === "light" ? "bg-slate-900" : "bg-[#B87333]"
              } ${isMobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`w-5 h-[2px] block transition-all duration-300 ${
                theme === "light" ? "bg-slate-900" : "bg-[#B87333]"
              } ${isMobileOpen ? 'scale-x-0 opacity-0' : 'opacity-100'}`} />
              <span className={`w-5 h-[2px] block transition-all duration-300 origin-center ${
                theme === "light" ? "bg-slate-900" : "bg-[#B87333]"
              } ${isMobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </div>
          </button>
        </div>

      </div>

      {/* Mobile Navigation Panel (Visible below XL break) */}
      <div
        id="primary-mobile-menu"
        className={`mobile-drawer xl:hidden fixed inset-0 z-overlay pt-20 pb-8 px-6 flex flex-col justify-between shadow-2xl overflow-y-auto mobile-menu-drawer ${
          theme === "light" ? "bg-white/98 text-slate-900" : "bg-[#050505]/95 text-[#F7F4EF]"
        } ${
          isMobileOpen ? "open" : "closed"
        }`}
        style={{
          height: "100svh",
          backgroundImage: theme === "light" ? "none" : "radial-gradient(circle at top, rgba(184, 115, 51, 0.15) 0%, transparent 70%)"
        }}
      >
        <nav className="flex flex-col w-full mt-6">
          {navItems.map((item, index) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  setIsMobileOpen(false);
                  if (item.href.includes('#')) {
                    const id = item.href.split('#')[1];
                    if (document.getElementById(id)) {
                      e.preventDefault();
                      history.replaceState(null, "", `#${id}`);
                      scrollToSection(`#${id}`);
                    }
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={`h-[64px] flex items-center font-cormorant text-[28px] border-b mobile-nav-link badge-tap ${
                  theme === "light"
                    ? (isActive ? "text-amber-800 font-bold border-b-slate-200 border-l-[4px] border-l-amber-500 pl-3" : "text-slate-800 border-b-slate-200 pl-1 hover:border-l-[4px] hover:border-l-amber-500 hover:pl-3")
                    : (isActive ? "text-[#F7F4EF] border-b-[#D4AF37]/20 border-l-[4px] border-l-[#D4AF37] pl-3" : "text-[#F7F4EF] border-b-[#D4AF37]/20 pl-1 hover:border-l-[4px] hover:border-l-[#D4AF37] hover:pl-3")
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
            <div className={`relative flex items-center rounded-full p-0.5 select-none w-[120px] h-[36px] overflow-hidden ${
              theme === "light" ? "bg-slate-200 border border-slate-300" : "bg-black/40 border border-white/10"
            }`}>
              <div
                className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-out ${
                  theme === "light" ? "bg-amber-500 border border-amber-400" : "bg-expo-gold/25 border border-expo-gold/45"
                }`}
                style={{
                  left: language === "en" ? "2px" : "60px",
                  width: "56px"
                }}
              />
              <button
                onClick={() => setLanguage("en")}
                className={`relative z-10 w-1/2 text-center text-xs font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "en"
                    ? (theme === "light" ? "text-slate-950 font-black" : "text-expo-gold")
                    : (theme === "light" ? "text-slate-600 font-bold" : "text-expo-warm/50")
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`relative z-10 w-1/2 text-center text-xs font-bold tracking-wider transition-colors duration-300 badge-tap ${
                  language === "hi"
                    ? (theme === "light" ? "text-slate-950 font-black" : "text-expo-gold")
                    : (theme === "light" ? "text-slate-600 font-bold" : "text-expo-warm/50")
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

          {/* Stall Allocation Button */}
          <a
            href="/stall-allocation"
            onClick={() => setIsMobileOpen(false)}
            className={`w-full h-[52px] bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center rounded-xl font-extrabold text-[15px] uppercase tracking-wider btn-shimmer tap-feedback mobile-menu-cta ${
              isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: "480ms"
            }}
          >
            <Translate en="Stall Lottery / Lucky Draw" hi="स्टॉल लकी ड्रा" />
          </a>

          {/* Exhibitor's Portal Button */}
          <a
            href="/exhibitor/login"
            onClick={() => setIsMobileOpen(false)}
            className={`w-full h-[52px] bg-gold-gradient text-black flex items-center justify-center rounded-xl font-extrabold text-[15px] uppercase tracking-wider btn-shimmer tap-feedback mobile-menu-cta ${
              isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: "500ms"
            }}
          >
            <Translate en="Exhibitor's Portal" hi="प्रदर्शक पोर्टल" />
          </a>
        </div>
      </div>
    </header>
  );
}
