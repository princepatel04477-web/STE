import nextDynamic from "next/dynamic";

import Navbar from "@/components/Navbar";
import CinematicHero from "@/components/CinematicHero";
import CinematicPreloader from "@/components/CinematicPreloader";
import LazySection from "@/components/LazySection";
import BrochureHost from "@/components/BrochureHost";

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
const StallPackages = nextDynamic(() => import("@/components/StallPackages"));

/**
 * Server component. The page used to be one client component whose initial
 * render was the preloader and nothing else — nav, hero, countdown and stats
 * existed only after a state flip on a 4.5s timer, so the SSR HTML contained no
 * <h1>, LCP was a black screen, and every crawler and link-preview scraper saw
 * a loading spinner. Content now renders unconditionally; the preloader is an
 * overlay on top of it.
 */
export default function Home() {
  return (
    // overflow-x-clip, not overflow-hidden: hidden on a top-level wrapper
    // creates a scroll container and breaks position: sticky for every
    // descendant. clip contains the same horizontal overflow without either.
    <main className="min-h-[100svh] bg-expo-midnight w-full overflow-x-clip relative select-text selection:bg-expo-gold/30 text-expo-warm antialiased">
      <CinematicPreloader />

      <div className="pb-20 md:pb-0">
        <Navbar />

        <div id="home">
          <CinematicHero />
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

        <LazySection minHeight="300px">
          <Footer />
        </LazySection>
      </div>

      <BrochureHost />
    </main>
  );
}
