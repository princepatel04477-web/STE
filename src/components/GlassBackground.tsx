"use client";

import React from "react";
import { motion } from "framer-motion";

interface OrbProps {
  delay?: number;
  size?: number;
  x?: number;
  y?: number;
  duration?: number;
}

function GlassOrb({ delay = 0, size = 300, x = 0, y = 0, duration = 20 }: OrbProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(214, 160, 102, 0.08) 0%, transparent 70%)`,
        filter: "blur(60px)",
        x,
        y,
      }}
      animate={{
        x: [x, x + 50, x - 30, x + 20, x],
        y: [y, y - 40, y + 20, y - 10, y],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

interface GlassBackgroundProps {
  orbs?: number;
  children?: React.ReactNode;
}

export function GlassBackground({ orbs = 3, children }: GlassBackgroundProps) {
  const orbConfigs = React.useMemo(() => {
    return Array.from({ length: orbs }, (_, i) => ({
      delay: i * 2.5,
      size: 250 + i * 80,
      x: (i % 2 === 0 ? -1 : 1) * (20 + i * 15),
      y: -50 + i * 40,
      duration: 18 + i * 4,
    }));
  }, [orbs]);

  return (
    <div className="relative overflow-hidden">
      {orbConfigs.map((config, i) => (
        <GlassOrb key={i} {...config} />
      ))}
      {children}
    </div>
  );
}