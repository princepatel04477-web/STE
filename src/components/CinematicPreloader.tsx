"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, Translate } from "@/components/LanguageContext";

/**
 * Hard ceiling on the intro. It used to be a hardcoded 4500ms (2700 on mobile)
 * that waited for nothing at all — not fonts, not the hero video, not hydration
 * — while the page underneath was not rendered. This is now a dismissable
 * overlay ON TOP of a fully server-rendered page, capped at MAX_MS and
 * dismissed earlier the moment the document is actually ready.
 */
const MAX_MS = 900;
const SEEN_KEY = "ste_intro_seen";

/** GlobalVisuals and friends wait on this before switching on ambient motion. */
function announceIntroDone() {
  try {
    sessionStorage.setItem(SEEN_KEY, "true");
  } catch {
    /* private mode / storage disabled — the intro simply replays */
  }
  window.dispatchEvent(new Event("ste-intro-done"));
}

export default function CinematicPreloader() {
  const { language } = useLanguage();
  // Starts true so server and first client render agree (no hydration mismatch).
  // The effect below dismisses it within a frame for repeat/reduced-motion visits.
  const [show, setShow] = useState(true);
  const [isDismissing, setIsDismissing] = useState(false);
  const [forceUnmounted, setForceUnmounted] = useState(false);
  const skipRef = useRef<HTMLButtonElement | null>(null);
  const doneRef = useRef(false);

  const dismiss = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setIsDismissing(true);
    announceIntroDone();
    setShow(false);

    // Hard failsafe: remove from DOM after exit duration even if rAF stalls
    setTimeout(() => {
      setForceUnmounted(true);
    }, 400);
  }, []);

  useEffect(() => {
    // Never animate or trap users if backgrounded (e.g. app switch from WhatsApp)
    if (document.hidden) {
      dismiss();
      setForceUnmounted(true);
      return;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        dismiss();
        setForceUnmounted(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const seen = (() => {
      try {
        return sessionStorage.getItem(SEEN_KEY) === "true";
      } catch {
        return false;
      }
    })();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Navigating to /privacy-policy and back should not replay the intro, and a
    // multi-second cinematic wipe is exactly what prefers-reduced-motion exists
    // to stop.
    if (seen || reduced) {
      dismiss();
      setForceUnmounted(true);
      return;
    }

    skipRef.current?.focus();

    const timer = setTimeout(dismiss, MAX_MS);
    const onReady = () => requestAnimationFrame(dismiss);

    // Absolute hard ceiling: preloader overlay MUST never remain in DOM longer than 1500ms
    const hardFailsafe = setTimeout(() => {
      dismiss();
      setForceUnmounted(true);
    }, 1500);

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });

    return () => {
      clearTimeout(timer);
      clearTimeout(hardFailsafe);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("load", onReady);
    };
  }, [dismiss]);

  // Escape is the keyboard equivalent of Skip Intro.
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  if (forceUnmounted) return null;

  return (
    <AnimatePresence>
      {show && (
        // Unmounted, not hidden. A permanent fixed inset-0 layer at the top of
        // the z stack is a compositing cost for the whole session even at
        // opacity 0.
        <motion.div
          key="preloader"
          id="cinematic-preloader"
          className={`fixed top-0 left-0 w-full h-[100svh] z-preloader bg-[#050505] flex flex-col justify-center items-center select-none ${
            isDismissing ? "pointer-events-none opacity-0 transition-opacity duration-300" : "pointer-events-auto"
          }`}
          role="status"
          aria-live="polite"
          initial={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          exit={{
            opacity: 0,
            clipPath: "inset(0 0 0 100%)",
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <div className="noise-overlay" aria-hidden="true" />
          <div
            className="grid-overlay-pattern absolute inset-0 opacity-[0.03]"
            aria-hidden="true"
          />

          <div className="flex flex-col items-center relative">
            {/* Golden thread drawing itself — timed to finish inside MAX_MS */}
            <svg
              className="w-[300px] h-[20px] mb-6 relative z-10"
              viewBox="0 0 300 20"
              aria-hidden="true"
            >
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
                transition={{ duration: 0.6, ease: "easeInOut" }}
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
              transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center relative"
            >
              <div
                className="w-[100px] h-[100px] border border-[#D6A066]/20 rounded-full flex items-center justify-center p-2 mb-8 animate-pulse relative z-10"
                aria-hidden="true"
              >
                <div className="absolute inset-0 border border-[#D6A066]/5 rounded-full scale-[1.2] animate-ping" />
                <div className="w-12 h-12 bg-gold-gradient rounded-full" />
              </div>

              <span className="font-sans text-xs tracking-[6px] text-expo-gold uppercase animate-pulse mb-3 z-10">
                <Translate en="Surat Textile Exhibition" hi="सूरत टेक्सटाइल प्रदर्शनी" />
              </span>
              <span className="font-serif text-3xl font-light italic text-white tracking-[2px] z-10">
                <Translate en="Orchestrating Couture, Commerce &amp; Connections" hi="कॉउचर, वाणिज्य और कनेक्शन का संयोजन" />
              </span>
            </motion.div>

            <button
              ref={skipRef}
              type="button"
              onClick={dismiss}
              className="mt-8 min-h-[44px] px-4 text-xs uppercase tracking-[0.3em] text-expo-warm/80 hover:text-expo-gold transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-expo-gold z-10"
              aria-label={language === "en" ? "Skip intro" : "प्रस्तावना छोड़ें"}
            >
              <Translate en="Skip Intro" hi="प्रस्तावना छोड़ें" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
