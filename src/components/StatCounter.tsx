"use client";

import { useEffect, useRef, useState } from "react";
import { masterRAF } from "@/hooks/useMasterRAF";

interface StatCounterProps {
  /** The real, final figure. This is what renders server-side. */
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const DURATION_MS = 2200;
/** If the observer has not fired by now, show the number anyway. */
const FALLBACK_MS = 2000;

function format(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * The hero stats used to render "₹0.0T / 0+ / 0+" and stay there — count-up
 * animations gated on an IntersectionObserver that never fired for a visitor
 * who landed and read without scrolling. Zero is now unreachable as a final
 * state: the real figure is what server-renders, the animation is a
 * progressive enhancement, and it hard-stops at the real figure either way.
 */
export default function StatCounter({
  end,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(end);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let settled = false;
    let unsubscribe: (() => void) | undefined;

    const animate = () => {
      if (settled) return;
      settled = true;
      let start = 0;
      setValue(0);
      unsubscribe = masterRAF.subscribe((now) => {
        if (!start) start = now;
        const t = Math.min(1, (now - start) / DURATION_MS);
        // easeOutExpo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(end * eased);
        if (t === 1) {
          setValue(end);
          unsubscribe?.();
          unsubscribe = undefined;
        }
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        animate();
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    const fallback = window.setTimeout(() => {
      observer.disconnect();
      if (!settled) {
        settled = true;
        setValue(end);
      }
    }, FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      unsubscribe?.();
    };
  }, [end]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}
