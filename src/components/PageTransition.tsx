"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [wipeKey, setWipeKey] = useState<string | null>(null);

  useEffect(() => {
    // No wipe on the very first paint — it would just be a gold flash.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setWipeKey(pathname);
  }, [pathname]);

  return (
    <div className="w-full min-h-screen relative">
      {/* The wipe used to stay mounted for the whole session as a
          fixed inset-0 layer at z-[99999]. It now exists only while it runs. */}
      <AnimatePresence>
        {wipeKey && (
          <motion.div
            key={wipeKey}
            aria-hidden="true"
            className="fixed inset-0 bg-gradient-to-r from-[#B87333] via-[#D4AF37] to-[#FFD700] z-transition pointer-events-none"
            initial={{ clipPath: "inset(0 0% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 100%)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setWipeKey(null)}
          />
        )}
      </AnimatePresence>

      {/* Opacity only. Any non-`none` transform on this wrapper makes it the
          containing block for every position:fixed descendant — during a
          transition the fixed nav, the WhatsApp button and any open modal would
          stop being viewport-fixed and drift with the page. */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
