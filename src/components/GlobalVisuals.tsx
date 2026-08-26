"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { masterRAF } from "@/hooks/useMasterRAF";

export default function GlobalVisuals() {
  const [mounted, setMounted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const orbitRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Setup mounted state asynchronously to avoid lint warnings
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Monitor preloader state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkIntro = () => {
        if (sessionStorage.getItem("ste_intro_seen") === "true") {
          setTimeout(() => {
            setIntroDone(true);
          }, 0);
        }
      };
      checkIntro();
      window.addEventListener("ste-intro-done", checkIntro);
      return () => window.removeEventListener("ste-intro-done", checkIntro);
    }
  }, []);

  useEffect(() => {
    if (!introDone) return;

    // ─── 1. Existing Editorial Setup Logic (Headings, Cards, Images) ───
    const setupElements = () => {
      // Headings
      const headings = document.querySelectorAll("h2, h3");
      headings.forEach((h) => {
        if (!h.classList.contains("luxury-heading")) {
          h.classList.add("luxury-heading");
          headingObserver.observe(h);
        }
      });

      // Cards
      const cardCandidates = document.querySelectorAll(
        '.border-glow-card, .glass-card, [class*="-card"], [class*="card-"]'
      );
      cardCandidates.forEach((card) => {
        if (!card.classList.contains("luxury-card")) {
          card.classList.add("luxury-card");
        }
      });

      // Images
      const images = document.querySelectorAll("img");
      images.forEach((img) => {
        if (
          img.classList.contains("cursor-dot") || 
          img.classList.contains("cursor-ring") || 
          img.getAttribute("src")?.includes("whatsapp") || 
          img.getAttribute("src")?.includes("arrow")
        ) {
          return;
        }

        const parent = img.parentElement;
        if (!parent) return;

        if (!parent.classList.contains("luxury-image-parent")) {
          parent.classList.add("luxury-image-parent");
          img.classList.add("luxury-image");
          img.setAttribute("data-cursor", "image");
        }

        if (!parent.querySelector(".luxury-gold-overlay")) {
          const overlay = document.createElement("div");
          overlay.className = "luxury-gold-overlay";
          parent.appendChild(overlay);
        }
      });
    };

    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    setupElements();

    const observer = new MutationObserver(() => {
      setupElements();
      observeMotionTargets();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // ─── 2. Premium Ambient Radial Glow Injection ───
    const targetGlowSections = document.querySelectorAll(
      '#collaboration, #exhibition-experience, #future-of-commerce, #final-cta'
    );
    targetGlowSections.forEach((section) => {
      if (section.querySelector('.premium-gradient-glow')) return;
      const glow = document.createElement('div');
      glow.className = 'premium-gradient-glow pointer-events-none absolute inset-0 z-0 overflow-hidden';
      const computedStyle = window.getComputedStyle(section);
      if (computedStyle.position === 'static') {
        (section as HTMLElement).style.position = 'relative';
      }
      glow.innerHTML = `
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[800px] h-[70vw] max-w-[800px] rounded-full opacity-[0.25] blur-[130px]" 
             style="background: radial-gradient(circle, rgba(214, 160, 102, 0.08) 0%, transparent 70%); animation: glow-breath 9s ease-in-out infinite;">
        </div>
      `;
      section.insertBefore(glow, section.firstChild);
    });

    // ─── 3. Section Entry Reveal Animation (Intersection Observer) ───
    const revealSections = document.querySelectorAll(
      '#collaboration, #power-of-surat, #business-ecosystem, #fabric-in-motion, #exhibition-experience, #packages, #festival-season, #future-of-commerce, #bilingual-benefits, #trust-social, #media-wall, #countdown-section, #buyer-registration, #final-cta'
    );
    
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('premium-revealed');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealSections.forEach((section) => {
      section.classList.add('premium-reveal');
      sectionObserver.observe(section);
    });

    // ─── 3b. Pause animations in off-screen sections ───
    // An infinite keyframe animation costs exactly as much scrolled past as it
    // does on screen. data-motion="paused" is picked up by a global CSS rule.
    const motionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          (entry.target as HTMLElement).dataset.motion = entry.isIntersecting
            ? 'running'
            : 'paused';
        });
      },
      { rootMargin: '150px 0px' }
    );

    const observeMotionTargets = () => {
      document.querySelectorAll('section').forEach((el) => {
        if ((el as HTMLElement).dataset.motionObserved) return;
        (el as HTMLElement).dataset.motionObserved = '1';
        motionObserver.observe(el);
      });
    };
    observeMotionTargets();

    // ─── 4. Mouse Proximity Interaction tracking ───
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // ─── 5. High Performance Parallax Scroll & Drift tick loop ───
    let scrollY = window.scrollY;
    let targetScrollY = scrollY;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const tick = () => {
      // Smooth interpolation for scroll
      scrollY += (targetScrollY - scrollY) * 0.09;

      // Smooth interpolation for mouse
      if (targetMouseX === -1000) {
        mouseX = -1000;
        mouseY = -1000;
      } else {
        if (mouseX === -1000) {
          mouseX = targetMouseX;
          mouseY = targetMouseY;
        } else {
          mouseX += (targetMouseX - mouseX) * 0.08;
          mouseY += (targetMouseY - mouseY) * 0.08;
        }
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobileDevice = window.matchMedia("(pointer: coarse)").matches || width < 768;

      // Update Orbital Lines Parallax Parent Transforms
      if (orbitRefs.current[0]) {
        const offset1 = Math.max(-80, Math.min(80, scrollY * 0.035));
        orbitRefs.current[0].style.transform = `translate3d(0, ${offset1}px, 0)`;
      }
      if (orbitRefs.current[1]) {
        const offset2 = Math.max(-80, Math.min(80, scrollY * -0.025));
        orbitRefs.current[1].style.transform = `translate3d(0, ${offset2}px, 0)`;
      }

      // Update Orbital Lines Parallax Parent Transforms
      if (orbitRefs.current[0]) {
        const offset1 = Math.max(-80, Math.min(80, scrollY * 0.035));
        orbitRefs.current[0].style.transform = `translate3d(0, ${offset1}px, 0)`;
      }
      if (orbitRefs.current[1]) {
        const offset2 = Math.max(-80, Math.min(80, scrollY * -0.025));
        orbitRefs.current[1].style.transform = `translate3d(0, ${offset2}px, 0)`;
      }
    };

    const unsubscribeTick = masterRAF.subscribe(tick);

    // Cleanup logic
    return () => {
      headingObserver.disconnect();
      sectionObserver.disconnect();
      motionObserver.disconnect();
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      unsubscribeTick();
    };
  }, [introDone]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]"
      aria-hidden="true">
      {introDone && (
        <>
          {/* Animated Orbital Lines (Parallax Parents + slow CSS Rotations) */}
          <div
            ref={(el) => { orbitRefs.current[0] = el; }}
            className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] pointer-events-none"
          >
            <div className="w-full h-full rounded-full border border-[#D6A066]/5 animate-orbit-slow" />
          </div>
          <div
            className="absolute top-[-320px] left-[-320px] w-[640px] h-[640px] pointer-events-none"
            style={{ transform: 'rotate(25deg)' }}
          >
            <div className="w-full h-full rounded-full border border-[#D6A066]/[0.02] animate-orbit-slow-reverse" />
          </div>

          <div
            ref={(el) => { orbitRefs.current[1] = el; }}
            className="absolute bottom-[-400px] right-[-400px] w-[800px] h-[800px] pointer-events-none"
          >
            <div className="w-full h-full rounded-full border border-[#D6A066]/5 animate-orbit-slow-reverse" />
          </div>
          <div
            className="absolute bottom-[-420px] right-[-420px] w-[840px] h-[840px] pointer-events-none"
            style={{ transform: 'rotate(-15deg)' }}
          >
            <div className="w-full h-full rounded-full border border-[#D6A066]/[0.02] animate-orbit-slow" />
          </div>
        </>
      )}
    </div>
  );
}
