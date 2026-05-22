"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export default function CinematicCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Check for prefers-reduced-motion or mobile devices
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

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse position
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

    // Track click shockwaves
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

    // Track hover states for interactive tags
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const clickable = target.closest("a, button, [role='button'], input, textarea, select");

      if (clickable) {
        setHoveredType("click");
      } else {
        setHoveredType(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseover", handleMouseOver);

    // Animation Loop
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Smoothly interpolate cursor position (lerp)
      const current = cursorRef.current;
      current.x += (current.targetX - current.x) * 0.12;
      current.y += (current.targetY - current.y) * 0.12;

      // 2. Draw trailing gold dust particles
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

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. Draw premium cursor lens
      ctx.save();
      ctx.translate(current.x, current.y);

      if (hoveredType === "click") {
        // Expand circle on clickable items
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
        // Standard premium minimalist dot with soft glowing sweep ring
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
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseover", handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hoveredType]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
    />
  );
}
