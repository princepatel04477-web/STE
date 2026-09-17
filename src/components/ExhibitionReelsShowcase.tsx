"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Flame,
  Maximize2
} from "lucide-react";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { EXHIBITION_REELS, ExhibitionReel } from "@/data/exhibitionVideos";
import { Translate, useLanguage } from "@/components/LanguageContext";
import { FadeUp } from "@/components/animations/MobileAnimations";

type CategoryFilter = "all" | "fashion" | "ceremony" | "exhibition" | "bts";

const CATEGORIES: { id: CategoryFilter; en: string; hi: string; count: number }[] = [
  { id: "all", en: "All Reels", hi: "सभी वीडियो", count: EXHIBITION_REELS.length },
  { id: "fashion", en: "Runway Fashion", hi: "रनवे फैशन", count: 2 },
  { id: "ceremony", en: "Inauguration & VIP", hi: "उद्घाटन और वीआईपी", count: 2 },
  { id: "exhibition", en: "Exhibition Buzz", hi: "प्रदर्शनी दृश्य", count: 4 },
  { id: "bts", en: "Behind The Scenes", hi: "पर्दे के पीछे", count: 1 },
];

export default function ExhibitionReelsShowcase() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredReels = selectedCategory === "all"
    ? EXHIBITION_REELS
    : EXHIBITION_REELS.filter((r) => r.category === selectedCategory);

  const activeReel: ExhibitionReel | null =
    activeReelIndex !== null ? EXHIBITION_REELS[activeReelIndex] : null;

  // Scroll carousel left/right
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const offset = direction === "left" ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  // Open modal with chosen reel
  const handleOpenReel = (reelId: string) => {
    const idx = EXHIBITION_REELS.findIndex((r) => r.id === reelId);
    if (idx !== -1) {
      setActiveReelIndex(idx);
      setIsPlaying(true);
      setIsLoading(true);
    }
  };

  // Close modal
  const handleCloseReel = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveReelIndex(null);
  };

  // Next / Previous Reel Navigation
  const handleNextReel = () => {
    if (activeReelIndex === null) return;
    const nextIdx = (activeReelIndex + 1) % EXHIBITION_REELS.length;
    setActiveReelIndex(nextIdx);
    setIsLoading(true);
  };

  const handlePrevReel = () => {
    if (activeReelIndex === null) return;
    const prevIdx = (activeReelIndex - 1 + EXHIBITION_REELS.length) % EXHIBITION_REELS.length;
    setActiveReelIndex(prevIdx);
    setIsLoading(true);
  };

  // Handle Play / Pause Toggle
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle Mute Toggle
  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const newMuteState = !isMuted;
    videoRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  // Handle Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Handle Video Time Update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  // Handle Scrubber Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    if (activeReelIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseReel();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === " ") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "m" || e.key === "M") {
        handleToggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeReelIndex, isPlaying, isMuted]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <section
      id="exhibition-reels"
      className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#050505] text-expo-warm overflow-hidden border-b border-white/5"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-expo-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-expo-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Header with Live Audio Pill */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <FadeUp className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-expo-gold/10 border border-expo-gold/25 mb-4 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-expo-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-expo-gold" />
              </span>
              <span className="text-[11px] font-bold tracking-[2.5px] text-expo-gold uppercase flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <Translate en="AUDIO ENABLED SHOWCASE • 9 REELS" hi="ऑडियो सक्षम शोकेस • 9 विशेष रील्स" />
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide text-white leading-tight">
              <span className="gold-shimmer-text">
                <Translate en="2026 Exhibition Reels" hi="2026 प्रदर्शनी रील्स" />
              </span>{" "}
              <br className="hidden sm:inline" />
              <span className="text-metallic font-light italic text-2xl sm:text-3xl lg:text-4xl">
                <Translate en="Runway, VIP & Trade Rush" hi="रनवे फैशन, वीआईपी और व्यापार दृश्य" />
              </span>
            </h2>

            <p className="font-sans text-xs sm:text-sm text-expo-warm/60 leading-relaxed mt-3">
              <Translate
                en="Tap any vertical reel below to experience Surat Textile Expo with live sound: runway walks, inaugural fanfare, buyer crowds, and dome atmosphere."
                hi="लाइव साउंड के साथ सूरत टेक्सटाइल एक्सपो का अनुभव करने के लिए नीचे किसी भी रील पर टैप करें: रनवे वॉक, उद्घाटन, खरीदारों की भीड़ और डोम का माहौल।"
              />
            </p>
          </FadeUp>

          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => handleScroll("left")}
              aria-label="Previous reels"
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:border-expo-gold/50 hover:bg-expo-gold/10 flex items-center justify-center text-white/80 hover:text-expo-gold transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              aria-label="Next reels"
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:border-expo-gold/50 hover:bg-expo-gold/10 flex items-center justify-center text-white/80 hover:text-expo-gold transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans tracking-wider uppercase transition-all duration-300 shrink-0 flex items-center gap-2 border ${
                selectedCategory === cat.id
                  ? "bg-expo-gold text-black border-expo-gold font-semibold shadow-lg shadow-expo-gold/20"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white"
              }`}
            >
              <span>{language === "hi" ? cat.hi : cat.en}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.id ? "bg-black/20 text-black" : "bg-white/10 text-white/60"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Horizontal Reels Carousel (Scroll Snap + Touch / Mouse Drag) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-none select-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filteredReels.map((reel) => (
            <div
              key={reel.id}
              className="snap-start shrink-0 w-[240px] sm:w-[280px] md:w-[300px]"
            >
              <SpotlightCard
                onClick={() => handleOpenReel(reel.id)}
                className="group cursor-pointer aspect-[9/16] w-full flex flex-col justify-between p-4 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-expo-gold/10"
              >
                {/* Background Poster Image */}
                <Image
                  src={reel.posterSrc}
                  alt={language === "hi" ? reel.titleHi : reel.titleEn}
                  fill
                  sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 300px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.8] group-hover:brightness-95"
                />

                {/* Dark Luxury Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60 pointer-events-none" />

                {/* Top Bar inside card */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-sans text-[10px] tracking-[1.5px] uppercase font-bold text-expo-gold bg-black/75 px-2.5 py-1 rounded-sm border border-expo-gold/30 backdrop-blur-md">
                    <Translate en={reel.tagEn} hi={reel.tagHi} />
                  </span>

                  <div className="flex items-center gap-1.5 bg-black/75 px-2 py-1 rounded-sm text-[11px] text-white/90 font-mono border border-white/10 backdrop-blur-md">
                    <Clock className="w-3 h-3 text-expo-gold" />
                    <span>{reel.duration}</span>
                  </div>
                </div>

                {/* Center Play Button with Pulse */}
                <div className="relative z-10 my-auto flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-black/50 border border-expo-gold/60 flex items-center justify-center backdrop-blur-md group-hover:scale-115 group-hover:bg-expo-gold group-hover:border-expo-gold transition-all duration-300 shadow-xl">
                    <Play
                      className="w-6 h-6 text-expo-gold group-hover:text-black ml-0.5 transition-colors duration-300"
                      fill="currentColor"
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity">
                    <Volume2 className="w-3 h-3 text-expo-gold animate-bounce" />
                    <span className="text-[10px] tracking-wider text-expo-warm/90 uppercase font-sans">
                      <Translate en="Play with Sound" hi="ध्वनि के साथ चलाएं" />
                    </span>
                  </div>
                </div>

                {/* Bottom Metadata */}
                <div className="relative z-10">
                  <h3 className="font-serif text-base sm:text-lg text-white font-medium leading-snug group-hover:text-expo-gold transition-colors duration-200">
                    <Translate en={reel.titleEn} hi={reel.titleHi} />
                  </h3>
                  <p className="font-sans text-xs text-expo-gold/80 font-medium mt-1 line-clamp-1">
                    <Translate en={reel.subtitleEn} hi={reel.subtitleHi} />
                  </p>
                  <p className="font-sans text-[11px] text-expo-warm/60 mt-1.5 line-clamp-2 leading-relaxed">
                    <Translate en={reel.descriptionEn} hi={reel.descriptionHi} />
                  </p>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Featured Reel Viewer Modal with Audio (Instagram / TikTok stories style) */}
      <AnimatePresence>
        {activeReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6"
            onClick={handleCloseReel}
          >
            {/* Prev Reel Button (Desktop) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevReel();
              }}
              aria-label="Previous reel"
              className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:border-expo-gold hover:bg-expo-gold/20 items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Reel Button (Desktop) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextReel();
              }}
              aria-label="Next reel"
              className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 hover:border-expo-gold hover:bg-expo-gold/20 items-center justify-center text-white transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Reel Container (9:16 vertical player) */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-[420px] aspect-[9/16] max-h-[92vh] bg-black border border-expo-gold/40 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Progress Bar & Header */}
              <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                {/* Scrubbing Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Video scrubber"
                  className="w-full h-1 bg-white/20 accent-expo-gold rounded-lg cursor-pointer mb-3"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[10px] tracking-[1.5px] uppercase font-bold text-expo-gold bg-expo-gold/15 px-2 py-0.5 rounded border border-expo-gold/30">
                      <Translate en={activeReel.tagEn} hi={activeReel.tagHi} />
                    </span>
                    <span className="text-[11px] font-mono text-white/70">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mute/Unmute Button */}
                    <button
                      onClick={handleToggleMute}
                      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                      className="p-1.5 rounded-full bg-black/60 border border-white/20 text-white hover:text-expo-gold transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-expo-gold" />}
                    </button>

                    {/* Volume Slider */}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      aria-label="Volume slider"
                      className="w-14 h-1 bg-white/20 accent-expo-gold rounded-lg cursor-pointer hidden sm:inline"
                    />

                    {/* Close Button */}
                    <button
                      onClick={handleCloseReel}
                      aria-label="Close reel player"
                      className="p-1.5 rounded-full bg-black/60 border border-white/20 text-white hover:text-expo-gold transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div
                className="relative w-full h-full cursor-pointer flex items-center justify-center bg-black"
                onClick={handleTogglePlay}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 z-20 bg-black/60">
                    <div className="w-9 h-9 border-2 border-expo-gold/30 border-t-expo-gold rounded-full animate-spin" />
                    <span className="text-xs font-sans text-expo-warm/80 tracking-wider">
                      <Translate en="Streaming audio & video..." hi="ऑडियो और वीडियो लोड हो रहा है..." />
                    </span>
                  </div>
                )}

                <video
                  ref={videoRef}
                  src={activeReel.videoSrc}
                  poster={activeReel.posterSrc}
                  playsInline
                  autoPlay
                  controls={false}
                  onTimeUpdate={handleTimeUpdate}
                  onCanPlay={() => setIsLoading(false)}
                  onEnded={handleNextReel}
                  className="w-full h-full object-cover"
                />

                {/* Central Play/Pause Flash Indicator */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-black/75 border border-expo-gold flex items-center justify-center backdrop-blur-md shadow-2xl">
                      <Play className="w-7 h-7 text-expo-gold ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Caption & Controls */}
              <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base sm:text-lg text-white font-medium">
                      <Translate en={activeReel.titleEn} hi={activeReel.titleHi} />
                    </h4>
                    <p className="font-sans text-xs text-expo-gold/90 mt-0.5">
                      <Translate en={activeReel.subtitleEn} hi={activeReel.subtitleHi} />
                    </p>
                    <p className="font-sans text-xs text-expo-warm/75 mt-2 line-clamp-2 leading-relaxed">
                      <Translate en={activeReel.descriptionEn} hi={activeReel.descriptionHi} />
                    </p>
                  </div>

                  {/* Quick Next Button on Mobile */}
                  <div className="flex flex-col gap-2 md:hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevReel();
                      }}
                      className="p-2 rounded-full bg-black/60 border border-white/20 text-white"
                      aria-label="Previous reel"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextReel();
                      }}
                      className="p-2 rounded-full bg-black/60 border border-white/20 text-white"
                      aria-label="Next reel"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
