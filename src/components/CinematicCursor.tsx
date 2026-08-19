"use client";

import { useEffect, useRef, useState } from "react";
import { masterRAF } from "@/hooks/useMasterRAF";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

/** Exactly the condition under which a replacement cursor is actually drawn. */
const FINE_POINTER_QUERY = "(pointer: fine) and (min-width: 768px)";

export default function CinematicCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const hoveredTypeRef = useRef<string | null>(null);
  const particles = useRef<Particle[]>([]);

  // The canvas used to be rendered always and merely `hidden md:block`, while
  // `has-custom-cursor` was set on <html> unconditionally. A mouse user on a
  // narrow window therefore got `cursor: none !important` with nothing drawn in
  // its place — the pointer simply vanished. The class and the canvas now share
  // one source of truth and are re-evaluated on every viewport change.
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia(FINE_POINTER_QUERY);
    const apply = () => setActive(fine.matches);
    apply();
    fine.addEventListener("change", apply);

    // Any uncaught error must not leave the site permanently cursor-less.
    const recover = () => setActive(false);
    window.addEventListener("error", recover);

    return () => {
      fine.removeEventListener("change", apply);
      window.removeEventListener("error", recover);
    };
  }, []);

  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("has-custom-cursor");

    // Attribute size used to be a stretched 1280x633 with no devicePixelRatio
    // handling — blurry on every HiDPI display. Cap DPR at 2: at DPR 3 on a
    // 4K display the per-frame clearRect alone is a serious cost.
    let width = 0;
    let height = 0;
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.targetX = e.clientX;
      cursorRef.current.targetY = e.clientY;

      // Spawn golden dust particles occasionally
      if (Math.random() < 0.3) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          alpha: 1,
          size: Math.random() * 2 + 1,
          color: Math.random() < 0.7 ? "#D6A066" : "#F0C48A", // warm gold
        });
      }
    };

    const handleMouseDown = () => {
      // Spawn a burst of golden sparks
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        particles.current.push({
          x: cursorRef.current.targetX,
          y: cursorRef.current.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: Math.random() * 3 + 1,
          color: "#B87333", // metallic copper spark
        });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      const clickable = target.closest("a, button, [role='button'], input, textarea, select");
      hoveredTypeRef.current = clickable ? "click" : null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Only the region the cursor and its particles actually occupy is cleared.
    // A full-viewport clearRect every frame was paying 4K-worth of fill for a
    // few hundred pixels of artwork.
    const PAD = 48;
    let prev = { x: 0, y: 0, w: 0, h: 0 };

    const render = () => {
      if (prev.w > 0) ctx.clearRect(prev.x, prev.y, prev.w, prev.h);

      const current = cursorRef.current;
      current.x += (current.targetX - current.x) * 0.12;
      current.y += (current.targetY - current.y) * 0.12;

      let minX = current.x - PAD;
      let minY = current.y - PAD;
      let maxX = current.x + PAD;
      let maxY = current.y + PAD;

      const pArr = particles.current;
      for (let i = pArr.length - 1; i >= 0; i--) {
        const p = pArr[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        p.size *= 0.98;

        if (p.alpha <= 0) {
          pArr.splice(i, 1);
          continue;
        }

        if (p.x - PAD < minX) minX = p.x - PAD;
        if (p.y - PAD < minY) minY = p.y - PAD;
        if (p.x + PAD > maxX) maxX = p.x + PAD;
        if (p.y + PAD > maxY) maxY = p.y + PAD;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(current.x, current.y);

      if (hoveredTypeRef.current === "click") {
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(214, 160, 102, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#F0C48A";
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#D6A066";
        ctx.fill();
      }

      ctx.restore();

      prev = {
        x: Math.max(0, minX),
        y: Math.max(0, minY),
        w: Math.min(width, maxX) - Math.max(0, minX),
        h: Math.min(height, maxY) - Math.max(0, minY),
      };
    };

    const unsubscribe = masterRAF.subscribe(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.classList.remove("has-custom-cursor");
      unsubscribe();
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-cursor"
    />
  );
}
