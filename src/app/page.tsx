"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, Translate } from "@/components/LanguageContext";
import { useInView } from "react-intersection-observer";

import nextDynamic from "next/dynamic";

import Navbar from "@/components/Navbar";
import CinematicHero from "@/components/CinematicHero";

interface LazySectionProps {
  id?: string;
  className?: string;
  minHeight?: string;
  children: React.ReactNode;
}

function LazySection({ id, className = "", minHeight = "150px", children }: LazySectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px 0px", // preload when within 300px
  });

  return (
    <div id={id} ref={ref} className={className} style={{ minHeight: inView ? "auto" : minHeight }}>
      {inView ? children : <div className="w-full h-full" />}
    </div>
  );
}

const CollaborationSection = nextDynamic(() => import("@/components/CollaborationSection"));
const PowerOfSurat = nextDynamic(() => import("@/components/PowerOfSurat"));
const BusinessEcosystem = nextDynamic(() => import("@/components/BusinessEcosystem"));
const FabricInMotion = nextDynamic(() => import("@/components/FabricInMotion"));
const ExhibitionExperience = nextDynamic(() => import("@/components/ExhibitionExperience"));
const FutureOfCommerce = nextDynamic(() => import("@/components/FutureOfCommerce"));
const BilingualSection = nextDynamic(() => import("@/components/BilingualSection"));
const TrustSection = nextDynamic(() => import("@/components/TrustSection"));
const SponsorSection = nextDynamic(() => import("@/components/SponsorSection"));
const PremiumTransitions = nextDynamic(() => import("@/components/PremiumTransitions"));
const FestivalSeason = nextDynamic(() => import("@/components/FestivalSeason"));
const CountdownSection = nextDynamic(() => import("@/components/CountdownSection"));
const BuyerRegistration = nextDynamic(() => import("@/components/BuyerRegistration"));
const FinalCTA = nextDynamic(() => import("@/components/FinalCTA"));
const Footer = nextDynamic(() => import("@/components/Footer"));
const BrochureModal = nextDynamic(() => import("@/components/BrochureModal"));
const StallPackages = nextDynamic(() => import("@/components/StallPackages"));

export default function Home() {
  const { language } = useLanguage();
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    setTimeout(() => setIsMobile(window.innerWidth < 768), 0);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsBrochureOpen(true);
    window.addEventListener("open-brochure", handleOpen);
    return () => window.removeEventListener("open-brochure", handleOpen);
  }, []);

  const handleSkip = () => {
    setIsIntroVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ste_intro_seen", "true");
      window.dispatchEvent(new Event("ste-intro-done"));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("ste_intro_seen");
      if (seen === "true") {
        setTimeout(() => {
          setIsIntroVisible(false);
          window.dispatchEvent(new Event("ste-intro-done"));
        }, 0);
      } else {
        const isMobileDevice = window.innerWidth < 768;
        const delayTime = isMobileDevice ? 2700 : 4500;
        const timer = setTimeout(() => {
          handleSkip();
        }, delayTime);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return (
    <main className="min-h-[100svh] bg-expo-midnight w-full overflow-hidden relative select-text selection:bg-expo-gold/30 text-expo-warm antialiased">

      {/* 2. Custom Cinematic Preloader (STE Luxury branding reveal) */}
      <AnimatePresence mode="wait">
        {isIntroVisible ? (
          <motion.div
            key="preloader"
            id="cinematic-preloader"
            className="fixed top-0 left-0 w-full h-[100svh] z-[10000] bg-[#050505] flex flex-col justify-center items-center select-none"
            role="status"
            aria-live="polite"
            initial={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              clipPath: "inset(0 0 0 100%)",
              transition: { duration: isMobile ? 0.4 : 0.5, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            <div className="noise-overlay" />
            <div className="grid-overlay-pattern absolute inset-0 opacity-[0.03]" />
            
            <div className="flex flex-col items-center relative">
              {/* SVG Golden Thread drawing itself */}
              <svg className="w-[300px] h-[20px] mb-6 relative z-10" viewBox="0 0 300 20">
                <motion.line
                  x1="10"
                  y1="10"
                  x2="290"
                  y2="10"
                  stroke="url(#gold-thread-grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: 280, strokeDashoffset: 280 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: isMobile ? 0.8 : 1.2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gold-thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#B87333" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0.5 : 0.8, duration: isMobile ? 0.4 : 0.6, ease: "easeOut" }}
                className="flex flex-col items-center relative"
              >
                {/* PULSING GOLD CONCENTRIC SPARK */}
                <div className="w-[100px] h-[100px] border border-[#D6A066]/20 rounded-full flex items-center justify-center p-2 mb-8 animate-pulse relative z-10">
                  <div className="absolute inset-0 border border-[#D6A066]/5 rounded-full scale-[1.2] animate-ping" />
                  <div className="w-12 h-12 bg-gold-gradient rounded-full" />
                </div>

                <span className="font-sans text-[10px] tracking-[6px] text-expo-gold uppercase animate-pulse mb-3 z-10">
                  <Translate en="Surat Textile Exhibition" hi="सूरत टेक्सटाइल प्रदर्शनी" />
                </span>
                <span className="font-serif text-3xl font-light italic text-white tracking-[2px] z-10">
                  <Translate en="Orchestrating Couture..." hi="कॉउचर का आयोजन..." />
                </span>
              </motion.div>

              <motion.button
                type="button"
                onClick={handleSkip}
                initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={isMobile ? { duration: 0.1 } : { delay: 1.2, duration: 0.4 }}
                className={
                  isMobile
                    ? "absolute top-4 right-4 p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold tracking-widest text-expo-gold z-50 focus:outline-none"
                    : "mt-8 text-[9px] uppercase tracking-[0.3em] text-expo-warm/70 hover:text-expo-gold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold z-10"
                }
                aria-label={language === "en" ? "Skip intro" : "प्रस्तावना छोड़ें"}
              >
                <Translate en="Skip Intro" hi="प्रस्तावना छोड़ें" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: isMobile ? 0.4 : 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="pb-20 md:pb-0"
          >
            <Navbar />

            {/* 4. Complete Nine-Section Immersive Cinematic Sequence */}
            <div id="home">
              <CinematicHero /> {/* Section 1 */}
            </div>

            <LazySection minHeight="200px">
              <PremiumTransitions mode="gold-tunnel" />
            </LazySection>

            <LazySection id="collaboration" minHeight="400px">
              <CollaborationSection />
            </LazySection>

            <LazySection id="power-of-surat" minHeight="600px">
              <PowerOfSurat />
            </LazySection>

            <LazySection id="business-ecosystem" minHeight="600px">
              <BusinessEcosystem />
            </LazySection>

            <LazySection minHeight="700px">
              <FabricInMotion />
            </LazySection>

            <LazySection minHeight="200px">
              <PremiumTransitions mode="metallic-flow" />
            </LazySection>

            <LazySection id="exhibition-experience" minHeight="700px">
              <ExhibitionExperience />
            </LazySection>

            <LazySection id="packages" minHeight="600px">
              <StallPackages />
            </LazySection>

            <LazySection id="festival-season" minHeight="500px">
              <FestivalSeason />
            </LazySection>

            <LazySection id="future-of-commerce" minHeight="600px">
              <FutureOfCommerce />
            </LazySection>

            <LazySection id="bilingual-benefits" minHeight="500px">
              <BilingualSection />
            </LazySection>

            <LazySection id="trust-social" minHeight="500px">
              <TrustSection />
            </LazySection>

            <LazySection id="media-wall" minHeight="200px">
              <SponsorSection />
            </LazySection>

            <LazySection id="countdown-section" minHeight="400px">
              <CountdownSection />
            </LazySection>

            <LazySection id="buyer-registration" minHeight="800px">
              <BuyerRegistration />
            </LazySection>

            <LazySection id="final-cta" minHeight="600px">
              <FinalCTA />
            </LazySection>

            {/* 5. Elegant Editorial Footer */}
            <LazySection minHeight="300px">
              <Footer />
            </LazySection>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. Immersive Premium Brochure Modal */}
      {isBrochureOpen && <BrochureModal isOpen={isBrochureOpen} onClose={() => setIsBrochureOpen(false)} />}

    </main>
  );
}
