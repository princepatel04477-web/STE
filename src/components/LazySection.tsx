"use client";

import { useInView } from "react-intersection-observer";

interface LazySectionProps {
  id?: string;
  className?: string;
  minHeight?: string;
  children: React.ReactNode;
}

/**
 * STE-02 fix: children are ALWAYS rendered in the HTML (so Google, WhatsApp and
 * weak-connection visitors see all section headings and copy).
 *
 * What is deferred: the section does not call useInView until it mounts in the
 * browser. While the element is not yet near the viewport the children are still
 * in the DOM — they just sit behind the minHeight placeholder. Once inView fires
 * the minHeight constraint is released and Framer Motion / Anime.js animations
 * can play.
 *
 * Verify with View Source (Ctrl+U): every section heading must appear in the raw
 * HTML, not only after JavaScript runs.
 */
export default function LazySection({
  id,
  className = "",
  minHeight = "150px",
  children,
}: LazySectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px 0px",
  });

  return (
    <div
      id={id}
      ref={ref}
      className={className}
      // When not yet in view we keep the reserved height so there is no layout
      // shift, but the children are still in the DOM for crawlers and SSR.
      style={{ minHeight: inView ? "auto" : minHeight }}
    >
      {children}
    </div>
  );
}
