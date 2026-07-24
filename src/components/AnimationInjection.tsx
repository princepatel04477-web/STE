"use client";

import { useEffect } from "react";

const CARD_TILT_SELECTORS = [
  ".card-hover",
  ".luxury-card",
  ".glass-card",
  ".border-glow-card",
].join(", ");

export default function AnimationInjection() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion || window.innerWidth < 768) return;

    // ── 1. Card 3D Tilt on Mousemove ─────────────────────────────────────────
    const cards = document.querySelectorAll<HTMLElement>(CARD_TILT_SELECTORS);
    const cardHandlers: Array<{
      el: HTMLElement;
      onEnter: (e: MouseEvent) => void;
      onMove: (e: MouseEvent) => void;
      onLeave: (e: MouseEvent) => void;
    }> = [];

    cards.forEach((el) => {
      el.style.transformStyle = "preserve-3d";
      el.style.willChange = "transform";

      let rect: DOMRect | null = null;
      let framePending = false;
      let pendingEvent: MouseEvent | null = null;

      const onEnter = () => {
        rect = el.getBoundingClientRect();
      };

      const applyTilt = () => {
        framePending = false;
        if (!rect || !pendingEvent) return;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (pendingEvent.clientX - cx) / (rect.width / 2);
        const dy = (pendingEvent.clientY - cy) / (rect.height / 2);
        const rotateY = dx * 6;
        const rotateX = -dy * 6;
        el.style.transform = `perspective(600px) translateY(-6px) scale(1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        pendingEvent = null;
      };

      const onMove = (e: MouseEvent) => {
        if (!rect) return;
        pendingEvent = e;
        if (!framePending) {
          framePending = true;
          requestAnimationFrame(applyTilt);
        }
      };

      const onLeave = () => {
        rect = null;
        pendingEvent = null;
        el.style.transform = "";
      };

      el.addEventListener("mouseenter", onEnter, { passive: true });
      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave, { passive: true });
      cardHandlers.push({ el, onEnter, onMove, onLeave });
    });

    // ── 2. Dynamic Hero Title Gradient Hue Shift on Scroll ────────────────────
    // Targets the hero headline spans used in CinematicHero gold gradient sections
    type HueTarget = { el: HTMLElement; baseBg: string };

    const hueTargets: HueTarget[] = [];

    const heroTextSpans = document.querySelectorAll<HTMLElement>(
      ".CinematicHero .headline-text, .CinematicHero .hero-shimmer, .cinematic-hero-section .headline-gradient"
    );
    const fallbackHueTargets = document.querySelectorAll<HTMLElement>(
      ".CinematicHero h1 span, .hero-section h1 .gold"
    );

    const targets =
      heroTextSpans.length > 0 ? heroTextSpans : fallbackHueTargets;

    targets.forEach((el) => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== "none") {
        el.style.backgroundClip = "text";
        el.style.webkitBackgroundClip = "text";
        el.style.webkitTextFillColor = "transparent";
        hueTargets.push({ el, baseBg: bgImage });
      }
    });

    // Generic fallback: for any gold gradient text child inside hero headings
    if (hueTargets.length === 0) {
      const heroH1s = document.querySelectorAll<HTMLElement>(
        ".CinematicHero h1, .hero-section h1, .cinematic-hero-section h1"
      );
      heroH1s.forEach((h1) => {
        const spans = h1.querySelectorAll<HTMLElement>("span, .gold, .gradient-text, .headline-inner");
        spans.forEach((span) => {
          const style = window.getComputedStyle(span);
          if (style.backgroundImage && style.backgroundImage !== "none") {
            span.style.backgroundClip = "text";
            span.style.webkitBackgroundClip = "text";
            span.style.webkitTextFillColor = "transparent";
            hueTargets.push({ el: span, baseBg: style.backgroundImage });
          }
        });

        // If no spans found, try the h1 itself
        if (hueTargets.length === 0) {
          const h1Style = window.getComputedStyle(h1);
          if (h1Style.backgroundImage && h1Style.backgroundImage !== "none") {
            h1.style.backgroundClip = "text";
            h1.style.webkitBackgroundClip = "text";
            h1.style.webkitTextFillColor = "transparent";
            hueTargets.push({ el: h1, baseBg: h1Style.backgroundImage });
          }
        }
      });
    }

    let ticking = false;
    let lastScrollPct = -1;

    const updateHueShift = () => {
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        ticking = false;
        return;
      }

      const scrollPct = window.scrollY / docHeight;
      if (Math.abs(scrollPct - lastScrollPct) > 0.005) {
        lastScrollPct = scrollPct;
        hueTargets.forEach(({ el, baseBg }) => {
          const shifted = baseBg.replace(
            /hsl\(\s*(\d+)/g,
            (_, h) => `hsl(${Math.round(parseInt(h, 10) + scrollPct * 30)}`
          );
          const shifted2 = shifted.replace(
            /(\d{1,3})deg\s*,\s*[\d.]+%/g,
            (match, deg) => {
              const newDeg = (parseInt(deg, 10) + scrollPct * 20) % 360;
              return `${Math.round(newDeg)}deg, 90%`;
            }
          );
          el.style.backgroundImage = shifted2;
        });
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking && hueTargets.length > 0) {
        ticking = true;
        requestAnimationFrame(updateHueShift);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cardHandlers.forEach(({ el, onEnter, onMove, onLeave }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.style.transform = "";
        el.style.transformStyle = "";
        el.style.willChange = "";
      });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}