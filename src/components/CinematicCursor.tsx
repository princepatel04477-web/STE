"use client";

import { useEffect, useRef } from "react";
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

const MAX_PARTICLES = 80;

export default function CinematicCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const hoveredTypeRef = useRef<string | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 768
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("has-custom-cursor");

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const addParticle = (particle: Particle) => {
      const pArr = particles.current;
      pArr.push(particle);
      if (pArr.length > MAX_PARTICLES) {
        pArr.splice(0, pArr.length - MAX_PARTICLES);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.targetX = e.clientX;
      cursorRef.current.targetY = e.clientY;

      if (Math.random() < 0.16) {
        addParticle({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          alpha: 1,
          size: Math.random() * 2 + 1,
          color: Math.random() < 0.7 ? "#D6A066" : "#F0C48A",
        });
      }
    };

    const handleMouseDown = () => {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 2;
        addParticle({
          x: cursorRef.current.targetX,
          y: cursorRef.current.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          size: Math.random() * 3 + 1,
          color: "#B87333",
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const clickable = target?.closest(
        "a, button, [role='button'], input, textarea, select"
      );
      hoveredTypeRef.current = clickable ? "click" : null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("pointermove", handlePointerMove, { passive: true });

    const render = () => {
      const current = cursorRef.current;
      current.x += (current.targetX - current.x) * 0.18;
      current.y += (current.targetY - current.y) * 0.18;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const pArr = particles.current;
      for (let i = pArr.length - 1; i >= 0; i--) {
        const p = pArr[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        p.size *= 0.98;

        if (p.alpha <= 0) {
          pArr.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
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
    };

    const unsubscribe = masterRAF.subscribe(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.classList.remove("has-custom-cursor");
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
    />
  );
}
