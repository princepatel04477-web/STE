"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrochureModal({ isOpen, onClose }: BrochureModalProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => setScale(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          {/* Close Area */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-5xl h-[82vh] md:h-[88vh] bg-[#070707] border border-expo-gold/20 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(214,160,102,0.15)] flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0c0c0c]/80 backdrop-blur-md select-none">
              <div className="flex flex-col">
                <span className="font-sans text-[8px] font-bold tracking-[3px] text-expo-gold uppercase">
                  Official Brochure
                </span>
                <h3 className="font-serif text-sm sm:text-base text-white tracking-wide italic">
                  Surat Textile Exhibition 2026
                </h3>
              </div>

              {/* Interactive Toolbar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-full p-1 gap-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 rounded-full hover:bg-white/10 text-expo-warm/75 hover:text-white transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-mono px-1.5 text-expo-warm/50 w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 rounded-full hover:bg-white/10 text-expo-warm/75 hover:text-white transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-full hover:bg-white/10 text-expo-warm/75 hover:text-white transition-colors border-l border-white/5 pl-2"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <a
                  href="/brochure.jpeg"
                  download="STE_Surat_2026_Brochure.jpeg"
                  className="flex items-center gap-1.5 px-4 py-2 bg-gold-gradient text-expo-midnight font-bold font-sans text-[10px] tracking-[1.5px] uppercase rounded-full shadow-lg hover:shadow-expo-glow transition-all duration-300"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                {/* Close Button */}
                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  onClick={onClose}
                  className="p-2 bg-white/5 border border-white/10 rounded-full hover:border-expo-gold text-expo-warm/60 hover:text-white transition-colors"
                  aria-label="Close Modal"
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
                  src="/brochure.jpeg"
                  alt="Surat Textile Exhibition 2026 Official Brochure"
                  fill
                  className="object-contain pointer-events-none"
                  priority
                />
              </motion.div>
            </div>

            {/* Footer Presentation */}
            <div className="px-6 py-3 border-t border-white/5 bg-[#0c0c0c]/80 flex justify-between items-center text-[9px] uppercase tracking-[1.5px] text-expo-warm/30 select-none">
              <span>STE Surat 2026 • September 12-13</span>
              <span>All Rights Reserved • AKAS Group</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
