"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { EVENT } from "@/lib/event-facts";

const TARGET_MS = new Date(EVENT.startDate).getTime();

function FlipDigit({ value, label }: { value: string; label: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlipping(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="text-center flex-1 flex flex-col items-center max-w-[70px] sm:max-w-[80px]">
      <div className="digit w-10 h-12 sm:w-16 sm:h-18 bg-black/75 border border-expo-gold/20 rounded-lg flex items-center justify-center relative shadow-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        <span
          className={`font-serif text-[clamp(20px,5vw,36px)] sm:text-4xl font-bold text-expo-gold leading-none tracking-normal drop-shadow-[0_0_10px_rgba(214,160,102,0.4)] ${
            flipping ? "flip-digit" : ""
          }`}
        >
          {displayValue}
        </span>
      </div>
      <span className="text-xs uppercase tracking-[0.1em] text-[#D6A066] block mt-2 font-semibold font-sans">
        {label}
      </span>
    </div>
  );
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Recomputed from the clock every tick — a decrementing counter drifts. */
function computeTimeLeft(): TimeLeft | null {
  const difference = TARGET_MS - Date.now();
  if (difference <= 0) return null;
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference % 86_400_000) / 3_600_000),
    minutes: Math.floor((difference % 3_600_000) / 60_000),
    seconds: Math.floor((difference % 60_000) / 1000),
  };
}

/**
 * A leaf that owns its own per-second state. This used to live in CinematicHero,
 * so a setInterval(fn, 1000) re-rendered the entire hero — headline, CTAs,
 * parallax refs and stats — once per second, forever, while Framer Motion was
 * animating.
 */
export default function HeroCountdown() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(computeTimeLeft());

    let interval: number | undefined;

    const start = () => {
      if (interval !== undefined) return;
      interval = window.setInterval(() => setTimeLeft(computeTimeLeft()), 1000);
    };
    const stop = () => {
      if (interval === undefined) return;
      window.clearInterval(interval);
      interval = undefined;
    };

    // No point ticking in a background tab.
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        setTimeLeft(computeTimeLeft());
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Server render and pre-hydration: the event dates, not a row of zeroes.
  if (!mounted) {
    return (
      <div className="w-full text-center py-1">
        <span className="font-serif text-base sm:text-lg tracking-[3px] text-expo-gold uppercase">
          {language === "en" ? EVENT.dateLabelEn : EVENT.dateLabelHi}
        </span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="w-full text-center py-1">
        <span className="font-serif text-base sm:text-lg tracking-[3px] text-expo-gold uppercase animate-pulse">
          {language === "en" ? "EVENT IN PROGRESS" : "कार्यक्रम जारी है"}
        </span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <FlipDigit value={pad(timeLeft.days)} label={language === "en" ? "Days" : "दिन"} />
      <div className="text-[#B87333] text-lg font-light -translate-y-3 select-none sm:text-2xl">:</div>
      <FlipDigit value={pad(timeLeft.hours)} label={language === "en" ? "Hours" : "घंटे"} />
      <div className="text-[#B87333] text-lg font-light -translate-y-3 select-none sm:text-2xl">:</div>
      <FlipDigit value={pad(timeLeft.minutes)} label={language === "en" ? "Mins" : "मिनट"} />
      <div className="text-[#B87333] text-lg font-light -translate-y-3 select-none sm:text-2xl">:</div>
      <FlipDigit value={pad(timeLeft.seconds)} label={language === "en" ? "Secs" : "सेकंड"} />
    </>
  );
}
