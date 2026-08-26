/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import { Translate } from "@/components/LanguageContext";
import { StaggerWrapper, StaggerChild } from "@/components/animations/MobileAnimations";
import { EVENT } from "@/lib/event-facts";

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
                href="#"
                aria-label="Instagram"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Instagram className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Facebook className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="social-icon-glow w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold badge-tap"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Twitter className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="#"
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
              <a href="#fabric-in-motion" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Couture Showcases" hi="कॉउचर शोकेस" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#exhibition-experience" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Exhibition Arenas" hi="प्रदर्शनी क्षेत्र" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="/exhibitor/login" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5 badge-tap">
                <Translate en="Exhibitor's Portal" hi="प्रदर्शक पोर्टल" />
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>
          </StaggerChild>

          {/* Contact Info */}
          <StaggerChild className="col-span-1 md:col-span-2 flex flex-col">
            <h4 className="font-display text-sm tracking-[0.2em] text-expo-gold font-bold mb-6">
              <Translate en="CONTACT US" hi="संपर्क करें" />
            </h4>
            <div className="flex flex-col gap-5 text-xs text-expo-warm/60 font-sans leading-relaxed">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-expo-gold shrink-0 mt-0.5" />
                <span>
                  {/* STE-12: Use canonical full name from event-facts, not shorthand */}
                  <Translate 
                    en={`${EVENT.venueName}, ${EVENT.streetAddress}, ${EVENT.city}, ${EVENT.region} — ${EVENT.postalCode}`} 
                    hi={`${EVENT.venueName}, ${EVENT.streetAddress}, ${EVENT.city}, ${EVENT.region} — ${EVENT.postalCode}`} 
                  />
                  {" "}
                  <a
                    href={EVENT.venueGoogleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-expo-gold hover:text-white transition-colors underline underline-offset-2 text-[10px]"
                  >
                    <Translate en="Get Directions →" hi="दिशा-निर्देश →" />
                  </a>
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
                <a 
                  href={`mailto:${EVENT.email}`}
                  className="hover:text-expo-gold transition-colors lowercase"
                >
                  {EVENT.email}
                </a>
              </div>
            </div>
          </StaggerChild>

        </StaggerWrapper>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#B87333]/30 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="footer-bottom opacity-0 flex flex-col md:flex-row items-center justify-between text-xs font-sans tracking-widest uppercase gap-4 text-expo-warm/60">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-expo-copper/70 font-semibold">
              © 2026 AKAS Events. All Rights Reserved.
            </p>
            <span className="hidden sm:inline text-white/20">•</span>
            <p className="text-amber-400/90 font-medium tracking-wider">
              Developed & Managed by{" "}
              <a
                href="https://varunyatechnologies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-amber-300 hover:text-white underline underline-offset-4 decoration-amber-500/50 transition-colors"
              >
                Varunya Technologies
              </a>
            </p>
          </div>

          <div className="flex gap-6 mt-2 md:mt-0">
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
