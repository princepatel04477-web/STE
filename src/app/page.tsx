import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CategoriesSection from "@/components/CategoriesSection";
import BenefitsSection from "@/components/BenefitsSection";
import FestivalStrip from "@/components/FestivalStrip";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-expo-midnight w-full overflow-hidden">
      <HeroSection />
      <AboutSection />
      <CategoriesSection />
      <BenefitsSection />
      <FestivalStrip />
      <ContactSection />
      <Footer />
    </main>
  );
}
