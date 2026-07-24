"use client";

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // On touch/mobile devices, skip Lenis entirely.
    // Native browser scrolling is smoother, uses compositor thread,
    // and doesn't add any main-thread JS overhead.
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    if (isTouchDevice) return;

    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      syncTouch: false,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.stop();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
