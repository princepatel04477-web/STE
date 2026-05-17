"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedMorphShapeProps {
  className?: string;
  variant?: "circle" | "blob" | "diamond" | "wave";
  size?: number;
  color?: string;
  blur?: number;
  duration?: number;
  delay?: number;
}

export function AnimatedMorphShape({
  className = "",
  variant = "blob",
  size = 200,
  color = "rgba(214, 160, 102, 0.1)",
  blur = 60,
  duration = 8,
  delay = 0,
}: AnimatedMorphShapeProps) {
  const variants = {
    circle: {
      borderRadius: "50%",
      clipPath: "circle(50% at 50% 50%)",
    },
    blob: {
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      clipPath:
        "polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)",
    },
    diamond: {
      borderRadius: "20%",
      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
    },
    wave: {
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      clipPath:
        "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
    },
  };

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        filter: `blur(${blur}px)`,
      }}
      initial={variants[variant]}
      animate={{
        borderRadius: [
          "60% 40% 30% 70% / 60% 30% 70% 40%",
          "30% 60% 70% 40% / 50% 60% 30% 60%",
          "50% 60% 30% 60% / 30% 60% 70% 40%",
          "60% 40% 30% 70% / 60% 30% 70% 40%",
        ],
        rotate: [0, 180, 360, 0],
        scale: [1, 1.05, 0.95, 1],
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