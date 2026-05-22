"use client";

import { useEffect, useState } from "react";
import { waapi } from "animejs";

import Navbar from "@/components/Navbar";
import CinematicCursor from "@/components/CinematicCursor";
import CinematicHero from "@/components/CinematicHero";
import PowerOfSurat from "@/components/PowerOfSurat";
import FabricInMotion from "@/components/FabricInMotion";
import ExhibitionExperience from "@/components/ExhibitionExperience";
import FashionEditorial from "@/components/FashionEditorial";
import FutureOfCommerce from "@/components/FutureOfCommerce";
import PremiumTransitions from "@/components/PremiumTransitions";
import FestivalSeason from "@/components/FestivalSeason";
import CountdownSection from "@/components/CountdownSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after a short cinematic reveal interval (2.2 seconds)
    const timer = setTimeout(() => {
      const loader = document.getElementById("cinematic-preloader");
      if (loader) {
        waapi.animate(loader, {
          opacity: 0,
          duration: 800,
          ease: "outQuad",
          onComplete: () => {
            setLoading(false);
          },
        });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-expo-midnight w-full overflow-hidden relative select-text selection:bg-expo-gold/30 text-expo-warm antialiased">
      
      {/* 1. Immersive Cinematic Trailing Dust Pointer Effect */}
      <CinematicCursor />

      {/* 2. Custom Cinematic Preloader (STE Luxury branding reveal) */}
      {loading && (
        <div
          id="cinematic-preloader"
          className="fixed inset-0 z-[10000] bg-[#050505] flex flex-col justify-center items-center select-none"
        >
          <div className="noise-overlay" />
          <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
          
          <div className="flex flex-col items-center">
            {/* PULSING GOLD CONCENTRIC SPARK */}
            <div className="w-[100px] h-[100px] border border-[#D6A066]/20 rounded-full flex items-center justify-center p-2 mb-8 animate-pulse relative">
              <div className="absolute inset-0 border border-[#D6A066]/5 rounded-full scale-[1.2] animate-ping" />
              <div className="w-12 h-12 bg-gold-gradient rounded-full" />
            </div>

            <span className="font-sans text-[10px] tracking-[6px] text-expo-gold uppercase animate-pulse mb-3">
              Surat Textile Exhibition
            </span>
            <span className="font-serif text-3xl font-light italic text-white tracking-[2px]">
              Orchestrating Couture...
            </span>
          </div>
        </div>
      )}

      {/* 3. Global Navbar navigation */}
      <Navbar />

      {/* 4. Complete Nine-Section Immersive Cinematic Sequence */}
      <div id="home">
        <CinematicHero /> {/* Section 1 */}
      </div>

      <PremiumTransitions mode="gold-tunnel" /> {/* Section 8 - Transition A */}

      <div id="power-of-surat">
        <PowerOfSurat /> {/* Section 2 */}
      </div>

      <div id="fabric-in-motion">
        <FabricInMotion /> {/* Section 3 */}
      </div>

      <PremiumTransitions mode="metallic-flow" /> {/* Section 8 - Transition B */}

      <div id="exhibition-experience">
        <ExhibitionExperience /> {/* Section 4 */}
      </div>

      <div id="festival-season">
        <FestivalSeason />
      </div>

      <div id="fashion-editorial">
        <FashionEditorial /> {/* Section 5 */}
      </div>

      <div id="future-of-commerce">
        <FutureOfCommerce /> {/* Section 6 */}
      </div>

      <div id="countdown-section">
        <CountdownSection />
      </div>

      <div id="final-cta">
        <FinalCTA /> {/* Section 7 */}
      </div>

      {/* 5. Elegant Editorial Footer */}
      <Footer />

    </main>
  );
}
