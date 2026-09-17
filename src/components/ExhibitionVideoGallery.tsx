"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Clock, Sparkles } from "lucide-react";
import { EXHIBITION_VIDEOS, ExhibitionVideo } from "@/data/exhibitionVideos";
import { Translate, useLanguage } from "@/components/LanguageContext";
import { FadeUp } from "@/components/animations/MobileAnimations";

export default function ExhibitionVideoGallery() {
  const { language } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<ExhibitionVideo | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close modal on Escape key & manage body scroll
  useEffect(() => {
    if (!activeVideo) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    modalCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideo]);

  const handleOpenVideo = (video: ExhibitionVideo) => {
    setIsVideoLoading(true);
    setActiveVideo(video);
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
  };

  return (
    <section
      id="exhibition-videos"
      className="relative w-full py-16 px-5 md:py-24 md:px-8 bg-[#070707] text-expo-warm overflow-hidden"
    >
      {/* Subtle background luxury accents */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#080808] to-[#050505] pointer-events-none" />
      <div className="noise-overlay z-0" />
      <div className="grid-overlay-pattern absolute inset-0 opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <FadeUp className="max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-expo-gold/10 border border-expo-gold/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-expo-gold animate-pulse" />
            <span className="text-[11px] font-bold tracking-[3px] text-expo-gold uppercase">
              <Translate en="2026 EXHIBITION SHOWCASE" hi="2026 प्रदर्शनी दृश्य" />
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-wide text-white leading-tight">
            <span className="gold-shimmer-text">
              <Translate en="Experience Surat 2026" hi="सूरत 2026 का अनुभव करें" />
            </span>{" "}
            <br />
            <span className="text-metallic font-light italic text-2xl sm:text-3xl md:text-4xl">
              <Translate en="Exclusive Video Walkthroughs" hi="विशेष वीडियो वॉकथ्रू" />
            </span>
          </h2>

          <p className="font-sans text-sm sm:text-base text-expo-warm/60 leading-relaxed mt-4 max-w-2xl">
            <Translate
              en="Step into the grand venues, bespoke architectural stalls, and vibrant textile manufacturing pavilions prepared for Surat Textile Expo 2026."
              hi="सूरत टेक्सटाइल एक्सपो 2026 के लिए तैयार भव्य स्थलों, विशेष स्टॉल्स और जीवंत कपड़ा निर्माण पवेलियनों का अनुभव करें।"
            />
          </p>
        </FadeUp>

        {/* Video Cards Grid (Facade Pattern: Only lightweight images & metadata loaded initially) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {EXHIBITION_VIDEOS.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenVideo(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenVideo(item);
                }
              }}
              className="group relative flex flex-col rounded-sm overflow-hidden border border-white/10 bg-[#0c0c0c] hover:border-expo-gold/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-expo-gold/5"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#141414]">
                <Image
                  src={item.posterSrc}
                  alt={language === "hi" ? item.titleHi : item.titleEn}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.85] group-hover:brightness-95"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badge: Tag */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="font-sans text-[10px] tracking-[2px] text-expo-gold uppercase bg-black/75 px-2.5 py-1 border border-expo-gold/30 rounded-sm backdrop-blur-sm">
                    <Translate en={item.tagEn} hi={item.tagHi} />
                  </span>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded text-[11px] text-white/80 font-mono border border-white/10">
                  <Clock className="w-3 h-3 text-expo-gold" />
                  <span>{item.duration}</span>
                </div>

                {/* Play Button Trigger */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 border border-expo-gold/50 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:bg-expo-gold group-hover:border-expo-gold transition-all duration-300 shadow-xl">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-expo-gold group-hover:text-black ml-0.5 transition-colors duration-300" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-white font-medium group-hover:text-expo-gold transition-colors duration-200">
                    <Translate en={item.titleEn} hi={item.titleHi} />
                  </h3>
                  <p className="font-sans text-xs text-expo-gold/80 font-medium mt-1">
                    <Translate en={item.subtitleEn} hi={item.subtitleHi} />
                  </p>
                  <p className="font-sans text-xs text-expo-warm/60 mt-3 leading-relaxed line-clamp-2">
                    <Translate en={item.descriptionEn} hi={item.descriptionHi} />
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-expo-warm/50 group-hover:text-white transition-colors">
                  <span className="tracking-wider uppercase font-sans text-[11px]">
                    <Translate en="Watch Walkthrough" hi="वॉकथ्रू देखें" />
                  </span>
                  <span className="text-expo-gold font-sans group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player (Only rendered on-demand when activeVideo != null) */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-10"
            onClick={handleCloseVideo}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-5xl bg-[#0a0a0a] border border-expo-gold/30 rounded-sm shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-black/80 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-[10px] tracking-[2px] text-expo-gold uppercase bg-expo-gold/10 px-2 py-0.5 border border-expo-gold/30 rounded-sm">
                    <Translate en={activeVideo.tagEn} hi={activeVideo.tagHi} />
                  </span>
                  <h4 className="font-serif text-sm sm:text-base text-white font-medium truncate max-w-xs sm:max-w-md">
                    <Translate en={activeVideo.titleEn} hi={activeVideo.titleHi} />
                  </h4>
                </div>

                <button
                  ref={modalCloseRef}
                  onClick={handleCloseVideo}
                  aria-label="Close video player"
                  className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-expo-gold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Container */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                {isVideoLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black/60">
                    <div className="w-8 h-8 border-2 border-expo-gold/30 border-t-expo-gold rounded-full animate-spin" />
                    <span className="text-xs font-sans text-expo-warm/70 tracking-wider">
                      <Translate en="Loading video..." hi="वीडियो लोड हो रहा है..." />
                    </span>
                  </div>
                )}

                <video
                  ref={videoRef}
                  src={activeVideo.videoSrc}
                  poster={activeVideo.posterSrc}
                  controls
                  autoPlay
                  playsInline
                  onCanPlay={() => setIsVideoLoading(false)}
                  className="w-full h-full object-contain"
                >
                  <Translate en="Your browser does not support the video tag." hi="आपका ब्राउज़र वीडियो टैग का समर्थन नहीं करता है।" />
                </video>
              </div>

              {/* Modal Footer Description */}
              <div className="p-4 sm:p-5 bg-black/60 border-t border-white/5">
                <p className="font-sans text-xs sm:text-sm text-expo-warm/80 leading-relaxed">
                  <Translate en={activeVideo.descriptionEn} hi={activeVideo.descriptionHi} />
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
