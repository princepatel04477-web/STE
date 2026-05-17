"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MorphTextProps {
  words: string[];
  interval?: number;
  className?: string;
  baseIndex?: number;
}

export function MorphText({
  words,
  interval = 2200,
  className = "",
  baseIndex,
}: MorphTextProps) {
  const [index, setIndex] = React.useState(baseIndex ?? 0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`relative inline-block ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            scaleX: 0.92,
            clipPath:
              "polygon(0 44%, 12% 38%, 28% 52%, 44% 35%, 60% 49%, 78% 36%, 100% 45%, 100% 55%, 82% 65%, 62% 51%, 44% 66%, 24% 50%, 0 62%)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            scaleX: 1,
            clipPath:
              "polygon(0 6%, 14% 0, 32% 8%, 48% 1%, 67% 7%, 84% 0, 100% 8%, 100% 94%, 86% 100%, 66% 92%, 49% 99%, 31% 93%, 12% 100%, 0 92%)",
          }}
          exit={{
            opacity: 0,
            y: -20,
            filter: "blur(10px)",
            scaleX: 0.92,
            clipPath:
              "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)",
          }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block will-change-[clip-path,filter,opacity,transform]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}