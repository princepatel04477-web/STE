/**
 * anime.js v4 Basic Animation Examples
 *
 * Core patterns for common animation scenarios.
 */

import { animate, stagger } from 'animejs';

// =============================================================================
// BASIC ANIMATIONS
// =============================================================================

/**
 * Simple fade in animation
 */
export function fadeIn(selector, options = {}) {
  return animate(selector, {
    opacity: [0, 1],
    duration: 600,
    ease: 'outQuad',
    ...options
  });
}

/**
 * Slide up and fade in (common entrance animation)
 */
export function slideUpFadeIn(selector, options = {}) {
  return animate(selector, {
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 800,
    ease: 'outExpo',
    ...options
  });
}

/**
 * Scale in from center
 */
export function scaleIn(selector, options = {}) {
  return animate(selector, {
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 500,
    ease: 'outBack',
    ...options
  });
}

/**
 * Bounce attention animation
 */
export function bounce(selector, options = {}) {
  return animate(selector, {
    translateY: [0, -20, 0],
    duration: 600,
    ease: 'outQuad',
    ...options
  });
}

/**
 * Shake animation (for errors/warnings)
 */
export function shake(selector, options = {}) {
  return animate(selector, {
    translateX: [0, -10, 10, -10, 10, 0],
    duration: 500,
    ease: 'outQuad',
    ...options
  });
}

/**
 * Pulse animation (scale up and down)
 */
export function pulse(selector, options = {}) {
  return animate(selector, {
    scale: [1, 1.05, 1],
    duration: 800,
    ease: 'inOutQuad',
    ...options
  });
}

// =============================================================================
// STAGGERED ANIMATIONS
// =============================================================================

/**
 * Staggered fade in for lists
 */
export function staggeredFadeIn(selector, delayBetween = 50, options = {}) {
  return animate(selector, {
    opacity: [0, 1],
    translateY: [20, 0],
    delay: stagger(delayBetween),
    duration: 600,
    ease: 'outQuad',
    ...options
  });
}

/**
 * Staggered scale in for grid items
 */
export function staggeredGridIn(selector, gridSize, options = {}) {
  return animate(selector, {
    scale: [0, 1],
    opacity: [0, 1],
    delay: stagger(50, {
      grid: gridSize,
      from: 'center'
    }),
    duration: 400,
    ease: 'outBack',
    ...options
  });
}

/**
 * Cascade animation from first to last
 */
export function cascade(selector, options = {}) {
  return animate(selector, {
    opacity: [0, 1],
    translateX: [-30, 0],
    delay: stagger(100, { ease: 'outQuad' }),
    duration: 600,
    ease: 'outExpo',
    ...options
  });
}

// =============================================================================
// HOVER ANIMATIONS
// =============================================================================

/**
 * Create hover animation handlers
 */
export function createHoverAnimation(element, {
  enterProps = { scale: 1.05 },
  leaveProps = { scale: 1 },
  duration = 300,
  ease = 'outQuad'
} = {}) {
  const handleEnter = () => {
    animate(element, { ...enterProps, duration, ease });
  };

  const handleLeave = () => {
    animate(element, { ...leaveProps, duration, ease });
  };

  element.addEventListener('mouseenter', handleEnter);
  element.addEventListener('mouseleave', handleLeave);

  // Return cleanup function
  return () => {
    element.removeEventListener('mouseenter', handleEnter);
    element.removeEventListener('mouseleave', handleLeave);
  };
}

// =============================================================================
// BUTTON ANIMATIONS
// =============================================================================

/**
 * Button press effect
 */
export function buttonPress(selector) {
  return animate(selector, {
    scale: [1, 0.95, 1],
    duration: 200,
    ease: 'outQuad'
  });
}

/**
 * Button success animation
 */
export function buttonSuccess(selector, options = {}) {
  return animate(selector, {
    backgroundColor: ['#3498db', '#2ecc71'],
    scale: [1, 1.02, 1],
    duration: 400,
    ease: 'outQuad',
    ...options
  });
}

// =============================================================================
// EXIT ANIMATIONS
// =============================================================================

/**
 * Fade out animation
 */
export function fadeOut(selector, options = {}) {
  return animate(selector, {
    opacity: [1, 0],
    duration: 400,
    ease: 'outQuad',
    ...options
  });
}

/**
 * Slide down and fade out
 */
export function slideDownFadeOut(selector, options = {}) {
  return animate(selector, {
    opacity: [1, 0],
    translateY: [0, 20],
    duration: 400,
    ease: 'inQuad',
    ...options
  });
}

/**
 * Scale out animation
 */
export function scaleOut(selector, options = {}) {
  return animate(selector, {
    scale: [1, 0.8],
    opacity: [1, 0],
    duration: 300,
    ease: 'inBack',
    ...options
  });
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Basic usage
fadeIn('.card');

// With options
slideUpFadeIn('.hero-content', { duration: 1000, delay: 200 });

// Staggered list animation
staggeredFadeIn('.list-item', 75);

// Grid animation (5x5 grid)
staggeredGridIn('.grid-cell', [5, 5]);

// Hover effect
const cleanup = createHoverAnimation(
  document.querySelector('.interactive-card'),
  {
    enterProps: { scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
    leaveProps: { scale: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }
  }
);

// Clean up when done
cleanup();

// Button click handler
button.addEventListener('click', () => buttonPress(button));

// Chained animations with promises
async function animateSequence() {
  await fadeIn('.step-1').then();
  await slideUpFadeIn('.step-2').then();
  await scaleIn('.step-3').then();
}
*/
