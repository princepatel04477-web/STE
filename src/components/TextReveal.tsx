"use client";

import React from "react";
import { motion } from "framer-motion";

interface TextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export default function TextReveal({
  text,
  className = "",
  wordClassName = "",
  highlightWords = [],
  highlightClassName = "gold-foil-text font-light italic normal-case",
  delay = 0.1,
  stagger = 0.08,
  once = true,
}: TextRevealProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 18,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.span
      className={`inline-flex flex-wrap justify-center gap-x-[0.28em] gap-y-[0.1em] ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {words.map((word, i) => {
        const cleanWord = word.replace(/[^\w\s\u0900-\u097F]/gi, "");
        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <span key={i} className="inline-block overflow-hidden py-1">
            <motion.span
              variants={wordVariants}
              className={`inline-block origin-bottom ${wordClassName} ${
                isHighlighted ? highlightClassName : ""
              }`}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
}
