/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { waapi } from 'animejs';

const PHONE_TEL = "+919950787787";
const PHONE_DISPLAY = "+91 99507 87787";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (footerRef.current) {
      const columns = footerRef.current.querySelectorAll(".footer-col");
      const bottomBar = footerRef.current.querySelector(".footer-bottom");
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              waapi.animate(Array.from(columns) as any, {
                opacity: [0, 1],
                translate: ["0 20px", "0 0px"],
                delay: (el, i) => i * 100,
                duration: 800,
                ease: "outExpo"
              });

              if (bottomBar) {
                waapi.animate(bottomBar as any, {
                  opacity: [0, 1],
                  duration: 800,
                  delay: 450,
                  ease: "outExpo"
                });
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
    <footer ref={footerRef} className="w-full bg-[#050505] pt-28 pb-24 md:pb-8 px-6 border-t border-expo-border/30 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-20">

          {/* Brand Col */}
          <div className="footer-col opacity-0 col-span-1 md:col-span-1 flex flex-col items-start">
            <Image 
              src="/assets/logo_STE.png" 
              alt="STE Logo" 
              width={100} 
              height={85} 
              sizes="100px"
              className="mb-6 h-auto object-contain opacity-90" 
            />
            <p className="text-xs text-expo-warm/50 font-sans leading-relaxed mb-6">
              The official digital identity of India&apos;s largest textile sourcing ecosystem. A hyper-premium B2B exhibition showcase.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300 relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Instagram className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300 relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Facebook className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300 relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Twitter className="w-4 h-4 relative z-10" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-expo-border/50 flex items-center justify-center hover:border-expo-gold hover:text-expo-gold transition-colors duration-300 relative group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold"
              >
                <span className="absolute inset-0 bg-expo-gold/10 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                <Linkedin className="w-4 h-4 relative z-10" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col opacity-0 col-span-1 flex flex-col md:pl-8">
            <h4 className="font-display text-sm tracking-[0.2em] text-expo-gold font-bold mb-6">QUICK SOURCING LINKS</h4>
            <nav className="flex flex-col gap-3 text-xs uppercase tracking-wider font-medium text-expo-warm/60">
              <a href="#power-of-surat" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5">
                Surat Power Scale
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#fabric-in-motion" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5">
                Couture Showcases
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#exhibition-experience" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5">
                Exhibition Arenas
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#fashion-editorial" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5">
                Fashion Editorial
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
              <a href="#final-cta" className="hover:text-expo-gold transition-colors duration-300 w-max relative group py-0.5">
                Book Your Stall
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-expo-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="footer-col opacity-0 col-span-1 md:col-span-2 flex flex-col">
             <h4 className="font-display text-sm tracking-[0.2em] text-expo-gold font-bold mb-6">CONTACT US</h4>
             <div className="flex flex-col gap-5 text-xs text-expo-warm/60 font-sans leading-relaxed">
               <div className="flex items-start gap-3">
                 <MapPin className="w-4 h-4 text-expo-gold shrink-0 mt-0.5" />
                 <span>SIECC Sarsana Dome,<br/>Surat, Gujarat, India</span>
               </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-expo-gold shrink-0" />
                  <a
                    href={`tel:${PHONE_TEL}`}
                    className="text-base font-display tracking-widest text-expo-warm font-bold hover:text-expo-gold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold"
                  >
                    {PHONE_DISPLAY}
                  </a>
                </div>
               <div className="flex items-center gap-3">
                 <Mail className="w-4 h-4 text-expo-gold shrink-0" />
                 <span>info@suratexpo.com</span>
               </div>
             </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-expo-border to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="footer-bottom opacity-0 flex flex-col md:flex-row items-center justify-between text-[10px] text-expo-warm/40 font-sans tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Surat Textile Exhibition. All Rights Reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/privacy-policy" className="hover:text-expo-warm transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-expo-warm transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
