"use client";

import { useEffect, useRef } from "react";
import { waapi } from "animejs";
import { useInView } from "@/hooks/useInView";
import { FadeUp } from "@/components/animations/MobileAnimations";
import { Translate } from "@/components/LanguageContext";

const sponsors = [
  {
    name: "Apex Machinery",
    logo: (
      <svg className="w-40 h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 10L35 40H5L20 10Z" fill="currentColor" className="text-expo-gold" />
        <text x="50" y="32" fontFamily="var(--font-oswald), sans-serif" fontSize="18" fontWeight="bold" letterSpacing="0.2em" fill="currentColor">APEX</text>
        <text x="50" y="44" fontFamily="var(--font-inter), sans-serif" fontSize="8" letterSpacing="0.1em" fill="currentColor" opacity="0.6">MACHINERY</text>
      </svg>
    )
  },
  {
    name: "Global Threads",
    logo: (
      <svg className="w-40 h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="15" stroke="currentColor" strokeWidth="3" className="text-expo-gold" />
        <circle cx="25" cy="25" r="8" fill="currentColor" className="text-expo-gold" />
        <text x="55" y="32" fontFamily="var(--font-oswald), sans-serif" fontSize="16" fontWeight="bold" letterSpacing="0.15em" fill="currentColor">GLOBAL</text>
        <text x="55" y="44" fontFamily="var(--font-inter), sans-serif" fontSize="8" letterSpacing="0.2em" fill="currentColor" opacity="0.6">THREADS</text>
      </svg>
    )
  },
  {
    name: "Silk Road Exports",
    logo: (
      <svg className="w-40 h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 25C15 15, 25 15, 30 25C35 35, 45 35, 50 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-expo-gold" />
        <text x="65" y="32" fontFamily="var(--font-oswald), sans-serif" fontSize="16" fontWeight="bold" letterSpacing="0.15em" fill="currentColor">SILKROAD</text>
        <text x="65" y="44" fontFamily="var(--font-inter), sans-serif" fontSize="8" letterSpacing="0.15em" fill="currentColor" opacity="0.6">EXPORTS GROUP</text>
      </svg>
    )
  },
  {
    name: "Tex-Tech Solutions",
    logo: (
      <svg className="w-40 h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="30" height="30" rx="3" stroke="currentColor" strokeWidth="2.5" className="text-expo-gold" />
        <line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2" className="text-expo-gold" />
        <line x1="12" y1="30" x2="24" y2="30" stroke="currentColor" strokeWidth="2" className="text-expo-gold" />
        <text x="50" y="30" fontFamily="var(--font-oswald), sans-serif" fontSize="17" fontWeight="bold" letterSpacing="0.2em" fill="currentColor">TEX-TECH</text>
        <text x="50" y="42" fontFamily="var(--font-inter), sans-serif" fontSize="8" letterSpacing="0.1em" fill="currentColor" opacity="0.6">DIGITAL SOLUTIONS</text>
      </svg>
    )
  },
  {
    name: "Surat Weavers",
    logo: (
      <svg className="w-40 h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="20" height="30" rx="2" stroke="currentColor" strokeWidth="2" className="text-expo-gold" />
        <rect x="15" y="15" width="20" height="30" rx="2" stroke="currentColor" strokeWidth="2" className="text-expo-gold" opacity="0.5" />
        <text x="50" y="32" fontFamily="var(--font-oswald), sans-serif" fontSize="16" fontWeight="bold" letterSpacing="0.15em" fill="currentColor">SURAT</text>
        <text x="50" y="44" fontFamily="var(--font-inter), sans-serif" fontSize="8" letterSpacing="0.2em" fill="currentColor" opacity="0.6">WEAVERS ALLIANCE</text>
      </svg>
    )
  },
  {
    name: "Eco-Dye Innovations",
    logo: (
      <svg className="w-40 h-10" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8C12 18, 10 25, 20 40C30 25, 28 18, 20 8Z" fill="currentColor" className="text-expo-gold" />
        <text x="45" y="32" fontFamily="var(--font-oswald), sans-serif" fontSize="16" fontWeight="bold" letterSpacing="0.15em" fill="currentColor">ECO-DYE</text>
        <text x="45" y="44" fontFamily="var(--font-inter), sans-serif" fontSize="8" letterSpacing="0.15em" fill="currentColor" opacity="0.6">INNOVATIONS</text>
      </svg>
    )
  }
];

const doubleSponsors = [...sponsors, ...sponsors, ...sponsors]; // Create a long marquee strip

export default function SponsorSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const { ref: headingRef, inView: headingInView } = useInView(0.3);

  // Trigger reveal animation for section title
  useEffect(() => {
    if (titleRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            waapi.animate(titleRef.current as HTMLElement, {
              opacity: [0, 1],
              translate: ["0 20px", "0 0px"],
              duration: 800,
              ease: "outExpo"
            });
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(titleRef.current);
      return () => observer.disconnect();
    }
  }, []);

  return (
    <section className="relative w-full py-24 bg-expo-midnight overflow-hidden border-t border-expo-border/30">
      
      {/* Background visual detail */}
      <div className="absolute inset-0 z-0 bg-mesh-dark opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Title */}
        <FadeUp>
          <div ref={titleRef} className="opacity-0 flex flex-col items-center mb-16 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-expo-gold font-medium mb-2">
              <Translate en="Our Alliance" hi="हमारा गठबंधन" />
            </span>
            <h3
              ref={headingRef}
              className={`font-display text-2xl md:text-3xl tracking-widest text-expo-warm heading-underline ${headingInView ? "in-view" : ""}`}
            >
              <span className="gold-shimmer-text">
                <Translate en="TRUSTED BY INDUSTRY LEADERS" hi="उद्योग जगत के नेताओं द्वारा विश्वसनीय" />
              </span>
            </h3>
            <div className="mt-3 w-12 h-[1px] bg-expo-gold/50" />
          </div>
        </FadeUp>

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden py-4 mask-marquee">
          {/* Subtle side fading overlays for premium blending */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-expo-midnight to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-expo-midnight to-transparent z-20 pointer-events-none" />

          {/* Marquee Loop */}
          <div className="marquee-track gap-12 sm:gap-16">
            {doubleSponsors.map((sponsor, idx) => (
              <div
                key={`${sponsor.name}-${idx}`}
                className="floating-logo-item flex items-center justify-center px-8 py-4 rounded-xl border border-white/5 bg-[#0a0a0a]/50 text-expo-warm/40 hover:text-expo-gold hover:border-expo-gold/40 hover:shadow-[0_0_30px_rgba(214,160,102,0.25)] transition-all duration-700 ease-luxury cursor-pointer filter grayscale-[100%] brightness-[160%] opacity-[70%] hover:grayscale-0 hover:brightness-[100%] hover:opacity-100 card-tap"
              >
                {sponsor.logo}
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .mask-marquee {
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        @keyframes floatingLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .floating-logo-item {
          animation: floatingLogo 4.2s ease-in-out infinite;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        .floating-logo-item:nth-child(2n) {
          animation-delay: 0.8s;
          animation-duration: 4.8s;
        }
        .floating-logo-item:nth-child(3n) {
          animation-delay: 1.6s;
          animation-duration: 5.4s;
        }
        .floating-logo-item:nth-child(4n) {
          animation-delay: 2.4s;
          animation-duration: 3.9s;
        }
      `}</style>
    </section>
  );
}
