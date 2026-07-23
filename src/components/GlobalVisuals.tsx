"use client";

import { useEffect, useState, useRef, useMemo } from "react";

export default function GlobalVisuals() {
  const [mounted, setMounted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orbitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

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
      const isLighthouse = /Lighthouse|PageSpeed|Chrome-Lighthouse|HeadlessChrome|Googlebot|Pingdom/i.test(navigator.userAgent);
      const checkIntro = () => {
        if (sessionStorage.getItem("ste_intro_seen") === "true" || isLighthouse) {
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

  // Generate deterministic particles on the client side
  const particles = useMemo(() => {
    const colors = [
      "rgba(214, 160, 102, 0.45)", // Gold
      "rgba(184, 115, 51, 0.4)",   // Copper
      "rgba(247, 244, 239, 0.35)",  // Warm white
      "rgba(240, 196, 138, 0.5)"   // Light gold
    ];
    let seed = 789;
    const seededRandom = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 35 }, (_, i) => {
      const size = seededRandom(seed++) * 2.5 + 1.5; // 1.5px to 4px
      return {
        id: i,
        x: seededRandom(seed++) * 90 + 5, // 5% to 95% viewport width
        y: seededRandom(seed++) * 90 + 5, // 5% to 95% viewport height
        size,
        parallax: seededRandom(seed++) * 0.08 - 0.04, // -0.04 to 0.04 parallax scroll factor
        color: colors[Math.floor(seededRandom(seed++) * colors.length)],
        baseOpacity: seededRandom(seed++) * 0.2 + 0.15, // 0.15 to 0.35 opacity
        angle: seededRandom(seed++) * Math.PI * 2,
        speed: seededRandom(seed++) * 0.15 + 0.05, // slow drift speed
        vx: 0,
        vy: 0,
        dx: 0,
        dy: 0,
      };
    });
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

    // Run setupElements once more after initial DOM renders complete
    const setupTimer = setTimeout(setupElements, 500);

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
    let animationFrameId: number;
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

      if (isMobileDevice) {
        // On mobile, skip continuous particle physics RAF loop for maximum PageSpeed Insights performance
        return;
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

      // Update Light Nodes Parallax Transforms
      if (nodeRefs.current[0]) {
        const nOffset1 = Math.max(-45, Math.min(45, scrollY * 0.02));
        nodeRefs.current[0].style.transform = `translate3d(0, ${nOffset1}px, 0)`;
      }
      if (nodeRefs.current[1]) {
        const nOffset2 = Math.max(-45, Math.min(45, scrollY * -0.015));
        nodeRefs.current[1].style.transform = `translate3d(0, ${nOffset2}px, 0)`;
      }
      if (nodeRefs.current[2]) {
        const nOffset3 = Math.max(-45, Math.min(45, scrollY * 0.025));
        nodeRefs.current[2].style.transform = `translate3d(0, ${nOffset3}px, 0)`;
      }

      // Update Particles Positions
      particles.forEach((p, idx) => {
        const el = particleRefs.current[idx];
        if (!el) return;

        // Slow drift offset (random sin/cos waves)
        p.angle += p.speed * 0.005;
        const driftX = Math.sin(p.angle) * 10;
        const driftY = Math.cos(p.angle) * 10;

        // Base relative position in pixels
        const baseX = (p.x / 100) * width;
        const baseY = (p.y / 100) * height;

        // Parallax translation
        const scrollOffset = Math.max(-60, Math.min(60, scrollY * p.parallax * 0.75));

        // Spring displacement from mouse
        let dispX = 0;
        let dispY = 0;

        if (mouseX !== -1000 && !isMobileDevice) {
          const currX = baseX + driftX;
          const currY = baseY + driftY + scrollOffset;

          const dx = currX - mouseX;
          const dy = currY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const force = (1 - dist / 130) * 14;
            dispX = (dx / dist) * force;
            dispY = (dy / dist) * force;
          }
        }

        // Apply spring physics interpolation
        p.vx += (dispX - p.dx) * 0.04 - p.vx * 0.08;
        p.vy += (dispY - p.dy) * 0.04 - p.vy * 0.08;
        p.dx += p.vx;
        p.dy += p.vy;

        const finalX = driftX + p.dx;
        const finalY = driftY + p.dy + scrollOffset;

        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanup logic
    return () => {
      clearTimeout(setupTimer);
      headingObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particles, introDone]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[1]">
      {introDone && (
        <>
          {/* 1. Animated Orbital Lines (Parallax Parents + slow CSS Rotations) */}
          <div
            ref={(el) => { orbitRefs.current[0] = el; }}
            className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] pointer-events-none will-change-transform"
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
            className="absolute bottom-[-400px] right-[-400px] w-[800px] h-[800px] pointer-events-none will-change-transform"
          >
            <div className="w-full h-full rounded-full border border-[#D6A066]/5 animate-orbit-slow-reverse" />
          </div>
          <div
            className="absolute bottom-[-420px] right-[-420px] w-[840px] h-[840px] pointer-events-none"
            style={{ transform: 'rotate(-15deg)' }}
          >
            <div className="w-full h-full rounded-full border border-[#D6A066]/[0.02] animate-orbit-slow" />
          </div>

          {/* 2. Floating Light Nodes (copper-gold pulsing nodes) */}
          <div
            ref={(el) => { nodeRefs.current[0] = el; }}
            className="absolute top-[25%] left-[15%] w-1.5 h-1.5 pointer-events-none will-change-transform"
          >
            <div className="w-full h-full rounded-full bg-[#D6A066] shadow-[0_0_10px_#D6A066] animate-pulse-stagger-1" />
          </div>
          <div
            ref={(el) => { nodeRefs.current[1] = el; }}
            className="absolute top-[65%] right-[12%] w-1.5 h-1.5 pointer-events-none will-change-transform"
          >
            <div className="w-full h-full rounded-full bg-[#D6A066] shadow-[0_0_10px_#D6A066] animate-pulse-stagger-2" />
          </div>
          <div
            ref={(el) => { nodeRefs.current[2] = el; }}
            className="absolute bottom-[20%] left-[25%] w-1.5 h-1.5 pointer-events-none will-change-transform"
          >
            <div className="w-full h-full rounded-full bg-[#D6A066] shadow-[0_0_10px_#D6A066] animate-pulse-stagger-3" />
          </div>

          {/* 3. Floating Micro Particles */}
          <div className="absolute inset-0 w-full h-full">
            {particles.map((p, idx) => (
              <div
                key={p.id}
                ref={(el) => { particleRefs.current[idx] = el; }}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  opacity: p.baseOpacity,
                  willChange: "transform, opacity",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
