"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, RotateCcw, FileText } from "lucide-react";
import { useLanguage, Translate } from "@/components/LanguageContext";

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrochureModal({ isOpen, onClose }: BrochureModalProps) {
  const { language } = useLanguage();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setScale(1);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const focusables = getFocusableElements(dialog);
    const initialFocus = closeButtonRef.current ?? focusables[0] ?? dialog;
    initialFocus.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = getFocusableElements(dialog);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/90 md:backdrop-blur-sm"
        >
          {/* Close Area */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} aria-hidden="true" />

          <motion.div
            ref={dialogRef}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl h-[82vh] md:h-[88vh] bg-[#070707] border border-expo-gold/20 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(214,160,102,0.15)] flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="brochure-title"
            aria-describedby="brochure-subtitle"
            tabIndex={-1}
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0c0c0c]/80 md:backdrop-blur-sm select-none">
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold tracking-[3px] text-expo-gold uppercase">
                  <Translate en="Official Brochure" hi="आधिकारिक ब्रोशर" />
                </span>
                <h3
                  id="brochure-title"
                  className="font-serif text-sm sm:text-base text-white tracking-wide italic"
                >
                  <Translate en="Surat Textile Exhibition 2026" hi="सूरत टेक्सटाइल प्रदर्शनी 2026" />
                </h3>
              </div>

              {/* Interactive Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-full p-1 gap-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-full text-expo-warm/75 transition-colors tap-feedback"
                    title={language === "en" ? "Zoom Out" : "ज़ूम आउट"}
                    aria-label={language === "en" ? "Zoom out" : "ज़ूम आउट"}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono px-1.5 text-expo-warm/50 w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-full text-expo-warm/75 transition-colors tap-feedback"
                    title={language === "en" ? "Zoom In" : "ज़ूम इन"}
                    aria-label={language === "en" ? "Zoom in" : "ज़ूम इन"}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-full text-expo-warm/75 transition-colors border-l border-white/5 pl-2 tap-feedback"
                    title={language === "en" ? "Reset Zoom" : "ज़ूम रीसेट करें"}
                    aria-label={language === "en" ? "Reset zoom" : "ज़ूम रीसेट करें"}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <a
                  href="/pdf/STE_2026_Prospectus.pdf"
                  download="STE2026-Brochure.pdf"
                  className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient text-expo-midnight font-bold font-sans text-xs tracking-[1.5px] uppercase rounded-full shadow-lg transition-all duration-300 btn-shimmer tap-feedback"
                  aria-label={language === "en" ? "Download brochure" : "ब्रोशर डाउनलोड करें"}
                >
                  <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline"><Translate en="Download" hi="डाउनलोड" /></span>
                </a>

                {/* Close Button */}
                <motion.button
                  ref={closeButtonRef}
                  whileTap={{ scale: 0.94, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={onClose}
                  className="p-2 bg-white/5 border border-white/10 rounded-full text-expo-warm/60 transition-colors tap-feedback"
                  aria-label={language === "en" ? "Close Modal" : "बंद करें"}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Document Stage */}
            <div
              ref={containerRef}
              className="flex-1 w-full overflow-auto bg-[#030303] flex items-center justify-center p-6 relative cursor-grab active:cursor-grabbing"
            >
              <motion.div
                drag
                dragConstraints={containerRef}
                dragElastic={0.1}
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="relative max-w-full max-h-full aspect-[3/4.2] w-[600px] shadow-2xl border border-white/5 rounded-sm overflow-hidden select-none"
              >
                <Image
                  src="/brochure.webp"
                  alt="Surat Textile Exhibition 2026 Official Brochure"
                  fill
                  className="object-contain pointer-events-none"
                  priority
                />
              </motion.div>
            </div>

            {/* Footer Presentation */}
            <div
              id="brochure-subtitle"
              className="px-6 py-3 border-t border-white/5 bg-[#0c0c0c]/80 flex justify-between items-center text-xs uppercase tracking-[1.5px] text-expo-warm/60 select-none"
            >
              <span><Translate en="STE Surat 2026 • September 12-13" hi="एसटीई सूरत 2026 • सितंबर 12-13" /></span>
              <span><Translate en="All Rights Reserved • AKAS Group" hi="सर्वाधिकार सुरक्षित • अकास ग्रुप" /></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
