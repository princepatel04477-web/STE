"use client";

import React from "react";
import { m, useReducedMotion, HTMLMotionProps } from "framer-motion";

interface BaseAnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

interface StaggerWrapperProps extends BaseAnimationProps {
  staggerDelay?: number;
}

interface TapCardProps extends BaseAnimationProps {
  onClick?: () => void;
}

interface TapButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

// ─── BASE TRANSITION (mobile-tuned) ───
const mobileTransition = {
  duration: 0.45,
  ease: [0.25, 0.46, 0.5, 0.94] as [number, number, number, number],
};

// ─── 1. FADE UP (use on EVERY card and section) ───
export const FadeUp: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ 
        opacity: 0, 
        y: shouldReduce ? 0 : 28 
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ ...mobileTransition, delay }}
    >
      {children}
    </m.div>
  );
};

// ─── 2. FADE IN (use on images and bg elements) ───
export const FadeIn: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ 
        duration: shouldReduce ? 0 : 0.5, 
        delay 
      }}
    >
      {children}
    </m.div>
  );
};

// ─── 3. SLIDE FROM LEFT (left-side content) ───
export const SlideFromLeft: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ 
        opacity: 0, 
        x: shouldReduce ? 0 : -35 
      }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ ...mobileTransition, delay }}
    >
      {children}
    </m.div>
  );
};

// ─── 4. SLIDE FROM RIGHT (right-side content) ───
export const SlideFromRight: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ 
        opacity: 0, 
        x: shouldReduce ? 0 : 35 
      }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ ...mobileTransition, delay }}
    >
      {children}
    </m.div>
  );
};

// ─── 5. POP IN (use on stat cards, badges, icons) ───
export const PopIn: React.FC<BaseAnimationProps> = ({ 
  children, 
  delay = 0, 
  className = "" 
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={{ 
        opacity: 0, 
        scale: shouldReduce ? 1 : 0.88 
      }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 22,
        delay,
      }}
    >
      {children}
    </m.div>
  );
};

// ─── 6. STAGGER WRAPPER (for grids of cards) ───
export const StaggerWrapper: React.FC<StaggerWrapperProps> = ({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}) => (
  <m.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.08 }}
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
  >
    {children}
  </m.div>
);

// ─── 7. STAGGER CHILD (wrap each card inside StaggerWrapper) ───
export const StaggerChild: React.FC<BaseAnimationProps> = ({ 
  children, 
  className = "" 
}) => {
  const shouldReduce = useReducedMotion();
  return (
    <m.div
      className={className}
      variants={{
        hidden: { 
          opacity: 0, 
          y: shouldReduce ? 0 : 28 
        },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.45,
            ease: [0.25, 0.46, 0.5, 0.94] as [number, number, number, number],
          }
        },
      }}
    >
      {children}
    </m.div>
  );
};

// ─── 8. TAP CARD (touch-feedback wrapper for cards) ───
export const TapCard: React.FC<TapCardProps> = ({ 
  children, 
  className = "",
  onClick 
}) => (
  <m.div
    className={className}
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    {children}
  </m.div>
);

// ─── 9. TAP BUTTON (touch-feedback for all buttons) ───
export const TapButton: React.FC<TapButtonProps> = ({ 
  children, 
  className = "",
  onClick,
  ...props 
}) => (
  <m.button
    className={className}
    onClick={onClick}
    whileTap={{ scale: 0.94, opacity: 0.85 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    {...props}
  >
    {children}
  </m.button>
);
