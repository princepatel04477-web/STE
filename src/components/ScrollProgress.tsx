"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B87333] via-[#D4AF37] to-[#FFD700] origin-left z-overlay pointer-events-none"
      style={{
        scaleX,
        boxShadow: "0 0 8px #D4AF37"
      }}
    />
  );
}
