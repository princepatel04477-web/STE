"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

const PHONE_NUMBER = "919950787787";

export default function FloatingWhatsAppBubble() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 1.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const message = language === "en"
      ? "Hi, I visited the STE 2026 website and would like more information."
      : "नमस्ते, मैंने STE 2026 की वेबसाइट देखी और मुझे अधिक जानकारी चाहिए।";
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={handleClick}
          className="fixed bottom-6 right-6 z-[9998] group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
          type="button"
          aria-label={language === "en" ? "Contact us on WhatsApp" : "व्हाट्सएप पर हमसे संपर्क करें"}
        >
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
          <span className="font-sans text-xs tracking-wider font-extrabold drop-shadow-sm">
            {language === "en" ? "WhatsApp Us" : "व्हाट्सएप करें"}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
