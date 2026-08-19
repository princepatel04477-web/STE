"use client";

import { useEffect } from 'react';
import Lenis from 'lenis';
import { masterRAF } from '@/hooks/useMasterRAF';

/**
 * Lenis replaces native scrolling with a JS-interpolated transform: every frame
 * runs JS, and latency between input and pixels is added by design. That is the
 * "the site feels laggy" complaint, and it is worst exactly where the site's
 * audience is — mid-range Android on a touch screen.
 *
 * So: fine-pointer desktop only, never on touch, never under reduced motion.
 * And it drives off the existing masterRAF loop rather than starting a second
 * one via gsap.ticker.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return; // native scroll — no interception at all

    const lenis = new Lenis({
      lerp: 0.12,
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // masterRAF hands out the native rAF timestamp (ms), which is what
    // lenis.raf expects — and it already stops itself when the tab is hidden.
    const unsubscribe = masterRAF.subscribe((time: number) => lenis.raf(time));

    return () => {
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
