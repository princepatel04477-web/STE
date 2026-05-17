"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
  variant?: "default" | "gold" | "dark" | "subtle";
  glow?: boolean;
  reflect?: boolean;
  hoverLift?: boolean;
}

const variants = {
  default:
    "relative bg-white/5 backdrop-blur-2xl border border-white/10 " +
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_0_0_1px_rgba(255,255,255,0.05)]",
  gold:
    "relative bg-[rgba(214,160,102,0.05)] backdrop-blur-2xl border border-[rgba(214,160,102,0.2)] " +
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.37),0_0_20px_rgba(214,160,102,0.1),inset_0_0_0_1px_rgba(255,255,255,0.05)]",
  dark:
    "relative bg-[rgba(5,5,5,0.6)] backdrop-blur-2xl border border-white/8 " +
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.02)]",
  subtle:
    "relative bg-white/[0.02] backdrop-blur-lg border border-white/5 " +
    "shadow-[0_4px_16px_0_rgba(0,0,0,0.2)]",
} as const;

export function GlassCard({
  children,
  variant = "default",
  glow = false,
  reflect = false,
  hoverLift = true,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={`${variants[variant]} ${glow ? "glow-soft" : ""} ${
        reflect ? "glass-reflect overflow-hidden" : ""
      } rounded-2xl ${className}`}
      whileHover={
        hoverLift
          ? {
              y: -8,
              transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}