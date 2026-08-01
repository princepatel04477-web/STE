"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstMount(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="w-full min-h-screen relative"
        initial="initial"
        animate="enter"
        exit="exit"
      >
        {/* Copper-gold overlay panel that slides away on entry (disabled on first mount to prevent flash) */}
        {!isFirstMount && (
          <motion.div
            className="fixed inset-0 bg-gradient-to-r from-[#B87333] via-[#D4AF37] to-[#FFD700] z-[99999] pointer-events-none"
            variants={{
              initial: { clipPath: "inset(0 0% 0 0)" },
              enter: {
                clipPath: "inset(0 0% 0 100%)",
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
              },
              exit: {
                clipPath: "inset(0 100% 0 0)",
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }
            }}
          />
        )}

        {/* Page Content Animation */}
        <motion.div
          variants={{
            initial: { opacity: 0.9, y: 10 },
            enter: { opacity: 1, y: 0 },
            exit: { opacity: 0.9, y: -10 }
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
