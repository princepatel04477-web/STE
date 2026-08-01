"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { masterRAF } from "@/hooks/useMasterRAF";

export default function MinimalThreeOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // ── MOBILE GUARD ──
    if (window.innerWidth < 768) return;

    if (!canvasRef.current) return;

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: window.devicePixelRatio < 2, // skip on retina/high-dpr
      powerPreference: "high-performance",
      logarithmicDepthBuffer: false,
      precision: "mediump", // mediump not highp — 30% faster
      stencil: false,       // not needed
      depth: false,         // not needed for overlay
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 1.5 cap
    renderer.setClearColor(0x000000, 0);
    renderer.setAnimationLoop(null); // Disable Three's internal loop

    // ── CAMERA ──
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    // ── SCENE ──
    const scene = new THREE.Scene();

    // ── EFFECT A — FLOATING DOTS FIELD ──
    const COUNT = 38;

    // Build geometry with random positions
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);    // per-dot speed
    const offsets = new Float32Array(COUNT);   // per-dot phase

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14;  // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;   // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;   // z
      speeds[i]  = 0.18 + Math.random() * 0.22;
      offsets[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position", 
      new THREE.BufferAttribute(positions.slice(), 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
      depthWrite: false,
    });

    const dots = new THREE.Points(geometry, material);
    scene.add(dots);

    // Store original positions for animation reference
    const originalPositions = positions.slice();

    // ── MOUSE PARALLAX ──
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── RESIZE ──
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── ANIMATION LOOP via masterRAF ──
    const unsubscribe = masterRAF.subscribe((timestamp: number) => {
      const time = timestamp * 0.001;

      // Mouse parallax lerp
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX * 0.6;
      camera.position.y = -targetY * 0.4;
      camera.lookAt(scene.position);

      // Animate dots positions
      const pos = dots.geometry.attributes.position;
      for (let i = 0; i < COUNT; i++) {
        // Gentle sine wave float on Y axis
        pos.array[i * 3 + 1] = 
          originalPositions[i * 3 + 1] + 
          Math.sin(time * speeds[i] + offsets[i]) * 0.35;
        // Subtle drift on X
        pos.array[i * 3] = 
          originalPositions[i * 3] + 
          Math.cos(time * speeds[i] * 0.6 + offsets[i]) * 0.15;
      }
      pos.needsUpdate = true;

      // Very slow whole-field rotation
      dots.rotation.y = time * 0.025;
      dots.rotation.x = time * 0.015;
      dots.rotation.z = time * 0.010;

      renderer.render(scene, camera);
    });

    // ── CLEANUP ──
    return () => {
      unsubscribe();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        zIndex: 5,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
