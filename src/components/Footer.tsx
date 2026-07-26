/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import { Translate } from "@/components/LanguageContext";
import { StaggerWrapper, StaggerChild } from "@/components/animations/MobileAnimations";

const PHONE_TEL = "+919950787787";
const PHONE_DISPLAY = "+91 99507 87787";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (footerRef.current) {
      const bottomBar = footerRef.current.querySelector(".footer-bottom");
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (bottomBar) {
                const bar = bottomBar as HTMLElement;
                bar.style.transition = "opacity 0.8s ease 0.45s";
                bar.style.opacity = "1";
              }
              observer.disconnect();
            }
          });
        },
        { threshold: 0.05 }
      );

      observer.observe(footerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <footer 
      ref={footerRef} 
      className="w-full bg-[#050505] pt-28 pb-24 md:pb-8 px-6 relative z-10 overflow-hidden"
    >
      {/* Top Border with horizontal gradient line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#B87333] via-[#D4AF37] via-[#B87333] to-transparent" />

      {/* Massive Watermark behind content */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0">
        <span className="font-serif text-[clamp(80px,15vw,220px)] font-bold tracking-[0.15em] text-[#D4AF37]/[0.03] leading-none uppercase">
          STE 2026
        </span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col relative z-10">

        <StaggerWrapper className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20" staggerDelay={0.08}>

          {/* Brand Col */}
          <StaggerChild className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Image 
              src="/assets/logo_STE.webp" 
              alt="STE Logo" 
              width={100} 
              height={85} 
              sizes="100px"
              className="mb-6 h-auto object-contain opacity-90" 
            />
            <p className="text-xs text-expo-warm/50 font-sans leading-relaxed mb-6">
              <Translate 
                en="The official digital identity of India's largest textile sourcing ecosystem. A hyper-premium B2B exhibition showcase." 
                hi="भारत के सबसे बड़े कपड़ा सोर्सिंग इकोसिस्टम की आधिकारिक डिजिटल पहचान। एक हाइपर-प्रीमियम B2B प्रदर्शनी शोकेस।" 
              />
            </p>
            {/* Social Icons with Glow Effects */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com/stesurat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Instagram className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="https://facebook.com/stesurat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Facebook className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="https://x.com/stesurat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Twitter className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="https://linkedin.com/company/stesurat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Linkedin className="w-4 h-4 relative z-10" />
              </a>
            </div>
          </StaggerChild>

          {/* Quick Links */}
          <StaggerChild className="col-span-1 flex flex-col md:pl-8">
            <h4 className="font-display text-sm tracking-[0.2em] text-expo-gold font-bold mb-6">
              <Translate en="QUICK SOURCING LINKS" hi="त्वरित सोर्सिंग लिंक" />
            </h4>
            <nav className="flex flex-col gap-3 text-xs uppercase tracking-wider font-medium text-expo-warm/60">
              <a href="#power-of-surat" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Surat Power Scale" hi="सूरत पावर स्केल" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#packages" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Stall Packages" hi="स्टॉल पैकेज" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#exhibition-experience" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Exhibition Arenas" hi="प्रदर्शनी क्षेत्र" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#final-cta" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Book Your Stall" hi="अपना स्टॉल बुक करें" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>
          </StaggerChild>

          {/* Contact Info */}
          <StaggerChild className="col-span-1 md:col-span-2 flex flex-col">
            <h4 className="font-display text-sm tracking-[0.2em] text-expo-gold font-bold mb-6">
              <Translate en="CONTACT & LEGAL ENTITY" hi="संपर्क एवं कानूनी संस्था" />
            </h4>
            <div className="flex flex-col gap-4 text-xs text-expo-warm/60 font-sans leading-relaxed">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-expo-gold shrink-0 mt-0.5" />
                <span>
                  <Translate 
                    en="SIECC Sarsana Dome, Surat, Gujarat 395007, India" 
                    hi="SIECC सरसाना डोम, सूरत, गुजरात 395007, भारत" 
                  />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-expo-gold shrink-0" />
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="text-base font-display tracking-widest text-expo-warm font-bold hover:text-expo-gold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
                >
                  {PHONE_DISPLAY}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-expo-gold shrink-0" />
                <div className="flex flex-col sm:flex-row gap-2">
                  <a 
                    href="mailto:contact@stesurat.com" 
                    className="hover:text-expo-gold transition-colors duration-300 text-expo-gold font-semibold"
                  >
                    contact@stesurat.com
                  </a>
                  <span className="hidden sm:inline text-white/30">•</span>
                  <a 
                    href="mailto:surattextileexhibition@gmail.com" 
                    className="hover:text-expo-gold transition-colors duration-300 opacity-70"
                  >
                    surattextileexhibition@gmail.com
                  </a>
                </div>
              </div>

              {/* Legal Entity & GST Block */}
              <div className="mt-2 p-3 bg-white/[0.03] border border-white/10 rounded-lg text-[10px] text-expo-warm/50 flex flex-wrap justify-between items-center gap-2">
                <span>
                  <strong className="text-white">Organized by:</strong> AKAS Events (Regd. B2B Exhibition Entity)
                </span>
                <span className="text-expo-gold font-mono font-bold">
                  GSTIN: 24AAAAA0000A1Z5
                </span>
              </div>
            </div>
          </StaggerChild>

        </StaggerWrapper>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#B87333]/30 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="footer-bottom opacity-0 flex flex-col md:flex-row items-center justify-between text-[10px] font-sans tracking-widest uppercase gap-4 text-expo-warm/40">
          <p className="text-expo-copper/70 font-semibold">
            © 2026 AKAS Events. All Rights Reserved. Surat Textile Exhibition (STE).
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/privacy-policy" className="hover:text-expo-gold transition-colors duration-300">
              <Translate en="Privacy Policy" hi="गोपनीयता नीति" />
            </a>
            <a href="/terms-of-service" className="hover:text-expo-gold transition-colors duration-300">
              <Translate en="Terms of Service" hi="सेवा की शर्तें" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
