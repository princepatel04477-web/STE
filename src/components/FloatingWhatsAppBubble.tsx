"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

const PHONE_NUMBER = "919950787787";

export default function FloatingWhatsAppBubble() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  // Hide on exhibitor portal and admin console to prevent overlapping bottom action bars
  // Hidden on the working tools - portal, admin console and the lucky draw -
  // where a floating bar would sit over the controls.
  const isPortalOrAdmin = pathname?.startsWith('/exhibitor')
    || pathname?.startsWith('/admin')
    || pathname?.startsWith('/stall-allocation');

  useEffect(() => {
    // Only active on mobile devices
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;

    // Show after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const message = language === "en"
      ? "Hi, I visited the STE 2026 website and would like more information."
      : "नमस्ते, मैंने STE 2026 की वेबसाइट देखी और मुझे अधिक जानकारी चाहिए।";
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (isPortalOrAdmin) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleClick}
          className="fixed bottom-[88px] right-4 z-overlay w-[52px] h-[52px] rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform animate-wa-pulse md:hidden"
          type="button"
          aria-label={language === "en" ? "Contact us on WhatsApp" : "व्हाट्सएप पर हमसे संपर्क करें"}
        >
          <MessageSquare className="w-7 h-7 fill-white text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
