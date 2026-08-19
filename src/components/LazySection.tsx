"use client";

import { useInView } from "react-intersection-observer";

interface LazySectionProps {
  id?: string;
  className?: string;
  minHeight?: string;
  children: React.ReactNode;
}

/**
 * Defers mounting a below-the-fold section until it is within 300px of the
 * viewport. minHeight is reserved up front so deferring costs no layout shift.
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
      style={{ minHeight: inView ? "auto" : minHeight }}
    >
      {inView ? children : <div className="w-full h-full" />}
    </div>
  );
}
