"use client";

import { motion } from "framer-motion";
import React from "react";

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeInSection({ children, delay = 0, className = "" }: FadeInSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
