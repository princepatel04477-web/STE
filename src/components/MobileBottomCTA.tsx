"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";
import { useLanguage, Translate } from "@/components/LanguageContext";

const PHONE_NUMBER = "919950787787";

export default function MobileBottomCTA() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  // Hide on exhibitor portal and admin console
  const isPortalOrAdmin = pathname?.startsWith('/exhibitor') || pathname?.startsWith('/admin');

  useEffect(() => {
    // Detect mobile device
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    const handleScroll = () => {
      // Show CTA bar after user scrolls 300px (past the hero fold)
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const message = language === "en"
      ? "Namaste! I want to know more about STE 2026 stall booking."
      : "नमस्ते! मैं STE 2026 स्टॉल बुकिंग के बारे में अधिक जानना चाहता हूँ।";
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleBookClick = () => {
    const el = document.getElementById("packages");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isPortalOrAdmin) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-overlay md:hidden bg-gradient-to-r from-[#B87333] to-[#D4AF37] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-[#B87333]/30"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          {/* Shimmer line indicator above bar */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>

          <div className="h-[72px] flex items-center justify-stretch">
            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsAppClick}
              className="flex-1 h-full bg-[#25D366] text-white flex items-center justify-center gap-2 font-sans font-bold text-sm tracking-wide active:brightness-95 transition-all border-r border-white/20 wa-pulse tap-feedback"
              type="button"
            >
              <MessageSquare className="w-5 h-5 fill-white text-white" />
              <span>
                <Translate en="📲 WhatsApp Us" hi="📲 व्हाट्सएप पर बात करें" />
              </span>
            </button>

            {/* Exhibitor's Portal CTA */}
            <a
              href="/exhibitor/login"
              className="flex-1 h-full text-black flex items-center justify-center gap-1.5 font-display font-extrabold text-xs tracking-widest uppercase active:bg-black/5 transition-all btn-shimmer tap-feedback"
            >
              <span>
                <Translate en="Exhibitor's Portal" hi="प्रदर्शक पोर्टल" />
              </span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
