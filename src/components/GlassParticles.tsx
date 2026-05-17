"use client";

import React from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface GlassParticlesProps {
  count?: number;
  className?: string;
}

function seededRandom(seed: number): number {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

export function GlassParticles({ count = 20, className = "" }: GlassParticlesProps) {
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: seededRandom((i + 1) * 11) * 100,
      y: seededRandom((i + 1) * 17) * 100,
      size: seededRandom((i + 1) * 23) * 3 + 1,
      duration: seededRandom((i + 1) * 29) * 20 + 10,
      delay: seededRandom((i + 1) * 31) * 10,
      opacity: seededRandom((i + 1) * 37) * 0.3 + 0.1,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, seededRandom((particle.id + 1) * 41) * 20 - 10, 0],
            opacity: [particle.opacity, 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
