"use client";

import { useEffect, useState } from "react";

export default function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only after scrolling down 300px to avoid cluttering initial loading hero
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/85 backdrop-blur-xl border-t border-expo-gold/20 shadow-[0_-5px_30px_rgba(214,160,102,0.15)] animate-slide-up">
      <div className="grid grid-cols-4 items-center justify-between w-full h-16 divide-x divide-white/5">
        
        {/* 1. Direct Call Hotline */}
        <a
          href="tel:+919950787787"
          className="flex flex-col items-center justify-center h-full text-white hover:text-expo-gold transition-colors duration-300"
        >
          <span className="text-lg">📞</span>
          <span className="text-[9px] uppercase tracking-[1px] font-sans font-bold mt-1">Call</span>
        </a>

        {/* 2. Direct WhatsApp Book */}
        <a
          href="https://wa.me/919950787787?text=I%20want%20to%20book%20a%20stall%20at%20STE%202026"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center h-full text-white hover:text-expo-gold transition-colors duration-300 bg-[#FF9933]/5"
        >
          <span className="text-lg">📲</span>
          <span className="text-[9px] uppercase tracking-[1px] font-sans font-bold mt-1 text-[#FFBF80]">WhatsApp</span>
        </a>

        {/* 3. Brochure Download */}
        <a
          href="/brochure.jpeg"
          download="brochure.jpeg"
          className="flex flex-col items-center justify-center h-full text-white hover:text-expo-gold transition-colors duration-300"
        >
          <span className="text-lg">📄</span>
          <span className="text-[9px] uppercase tracking-[1px] font-sans font-bold mt-1">Brochure</span>
        </a>

        {/* 4. Scroll to Register Form */}
        <a
          href="#final-cta"
          className="flex flex-col items-center justify-center h-full text-white hover:text-expo-gold transition-colors duration-300"
        >
          <span className="text-lg">🎫</span>
          <span className="text-[9px] uppercase tracking-[1px] font-sans font-bold mt-1">Register</span>
        </a>

      </div>
    </div>
  );
}
