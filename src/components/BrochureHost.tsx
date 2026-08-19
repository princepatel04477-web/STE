"use client";

import { useEffect, useState } from "react";
import nextDynamic from "next/dynamic";

const BrochureModal = nextDynamic(() => import("@/components/BrochureModal"));

/**
 * Listens for the global "open-brochure" event so the homepage does not have to
 * be a client component just to own one boolean.
 */
export default function BrochureHost() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-brochure", handleOpen);
    return () => window.removeEventListener("open-brochure", handleOpen);
  }, []);

  if (!isOpen) return null;
  return <BrochureModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
