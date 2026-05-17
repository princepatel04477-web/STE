/**
 * anime.js v4 Timeline Examples
 *
 * Patterns for orchestrating complex animation sequences.
 */

import { createTimeline, stagger } from 'animejs';

// =============================================================================
// BASIC TIMELINE PATTERNS
// =============================================================================

/**
 * Simple sequential timeline
 */
export function createSequentialTimeline() {
  const tl = createTimeline({
    defaults: {
      duration: 600,
      ease: 'outExpo'
    }
  });

  tl.add('.element-1', { opacity: [0, 1], translateY: [30, 0] })
    .add('.element-2', { opacity: [0, 1], translateX: [-30, 0] })
    .add('.element-3', { opacity: [0, 1], scale: [0.8, 1] });

  return tl;
}

/**
 * Timeline with overlapping animations
 */
export function createOverlappingTimeline() {
  const tl = createTimeline({
    defaults: { duration: 800, ease: 'outExpo' }
  });

  tl.add('.box-1', { translateX: 200 })
    // Start 400ms before previous ends
    .add('.box-2', { translateX: 200 }, '-=400')
    // Start 400ms before previous ends
    .add('.box-3', { translateX: 200 }, '-=400');

  return tl;
}

/**
 * Timeline with labels for precise timing
 */
export function createLabeledTimeline() {
  const tl = createTimeline({
    defaults: { duration: 600, ease: 'outQuad' }
  });

  tl.add('.intro', { opacity: [0, 1] })
    .label('introComplete')
    // Both start at the 'introComplete' label
    .add('.sidebar', { translateX: [-100, 0] }, 'introComplete')
    .add('.content', { translateY: [50, 0] }, 'introComplete')
    .label('contentReady')
    // Start 200ms after 'contentReady'
    .add('.footer', { opacity: [0, 1] }, 'contentReady+=200');

  return tl;
}

// =============================================================================
// PAGE TRANSITION TIMELINES
// =============================================================================

/**
 * Page entrance animation timeline
 */
export function createPageEntranceTimeline() {
  const tl = createTimeline({
    autoplay: false,
    defaults: { duration: 800, ease: 'outExpo' }
  });

  // Header slides down
  tl.add('header', {
    translateY: [-50, 0],
    opacity: [0, 1]
  })
    .label('headerIn')

    // Navigation items stagger in
    .add('nav a', {
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: stagger(50)
    }, 'headerIn-=400')

    // Hero content fades up
    .add('.hero-content', {
      translateY: [30, 0],
      opacity: [0, 1]
    }, '-=600')

    // CTA button scales in
    .add('.cta-button', {
      scale: [0.8, 1],
      opacity: [0, 1]
    }, '-=400');

  return tl;
}

/**
 * Page exit animation timeline
 */
export function createPageExitTimeline() {
  const tl = createTimeline({
    autoplay: false,
    defaults: { duration: 400, ease: 'inQuad' }
  });

  tl.add('.hero-content', {
    translateY: [0, -30],
    opacity: [1, 0]
  })
    .add('nav a', {
      translateY: [0, -20],
      opacity: [1, 0],
      delay: stagger(30, { direction: 'reverse' })
    }, '-=200')
    .add('header', {
      translateY: [0, -50],
      opacity: [1, 0]
    }, '-=200');

  return tl;
}

// =============================================================================
// MODAL ANIMATION TIMELINES
// =============================================================================

/**
 * Modal open animation
 */
export function createModalOpenTimeline(modalSelector) {
  const tl = createTimeline({
    autoplay: false,
    defaults: { ease: 'outExpo' }
  });

  tl.add(`${modalSelector} .modal-overlay`, {
    opacity: [0, 1],
    duration: 300
  })
    .add(`${modalSelector} .modal-content`, {
      scale: [0.9, 1],
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400
    }, '-=200');

  return tl;
}

/**
 * Modal close animation
 */
export function createModalCloseTimeline(modalSelector) {
  const tl = createTimeline({
    autoplay: false,
    defaults: { ease: 'inQuad' }
  });

  tl.add(`${modalSelector} .modal-content`, {
    scale: [1, 0.9],
    opacity: [1, 0],
    duration: 200
  })
    .add(`${modalSelector} .modal-overlay`, {
      opacity: [1, 0],
      duration: 200
    }, '-=100');

  return tl;
}

// =============================================================================
// CARD/COMPONENT REVEAL TIMELINES
// =============================================================================

/**
 * Card reveal with staggered children
 */
export function createCardRevealTimeline(cardSelector) {
  const tl = createTimeline({
    autoplay: false,
    defaults: { duration: 600, ease: 'outExpo' }
  });

  tl.add(cardSelector, {
    scale: [0.95, 1],
    opacity: [0, 1],
    translateY: [20, 0]
  })
    .add(`${cardSelector} .card-image`, {
      scale: [1.1, 1],
      duration: 800
    }, '-=400')
    .add(`${cardSelector} .card-title`, {
      translateY: [20, 0],
      opacity: [0, 1]
    }, '-=600')
    .add(`${cardSelector} .card-description`, {
      translateY: [15, 0],
      opacity: [0, 1]
    }, '-=500')
    .add(`${cardSelector} .card-button`, {
      scale: [0.8, 1],
      opacity: [0, 1]
    }, '-=400');

  return tl;
}

/**
 * Feature list reveal
 */
export function createFeatureListTimeline(containerSelector) {
  const tl = createTimeline({
    autoplay: false,
    defaults: { duration: 500, ease: 'outQuad' }
  });

  tl.add(`${containerSelector} .feature-title`, {
    opacity: [0, 1],
    translateY: [30, 0]
  })
    .add(`${containerSelector} .feature-item`, {
      opacity: [0, 1],
      translateX: [-20, 0],
      delay: stagger(100)
    }, '-=300')
    .add(`${containerSelector} .feature-icon`, {
      scale: [0, 1],
      delay: stagger(100)
    }, '-=400');

  return tl;
}

// =============================================================================
// LOADING/PROGRESS TIMELINES
// =============================================================================

/**
 * Loading spinner timeline
 */
export function createLoadingTimeline(spinnerSelector) {
  const tl = createTimeline({
    loop: true,
    defaults: { ease: 'linear' }
  });

  tl.add(`${spinnerSelector} .dot`, {
    scale: [1, 1.5, 1],
    opacity: [0.5, 1, 0.5],
    delay: stagger(150),
    duration: 600
  });

  return tl;
}

/**
 * Progress bar animation
 */
export function createProgressTimeline(progressSelector, targetProgress = 100) {
  const tl = createTimeline({
    autoplay: false,
    defaults: { ease: 'outQuad' }
  });

  tl.add(`${progressSelector} .progress-bar`, {
    width: [`0%`, `${targetProgress}%`],
    duration: 1500
  })
    .add(`${progressSelector} .progress-text`, {
      innerHTML: [0, targetProgress],
      round: 1,
      duration: 1500
    }, 0); // Start at same time (offset 0)

  return tl;
}

// =============================================================================
// NOTIFICATION TIMELINES
// =============================================================================

/**
 * Toast notification enter/exit
 */
export function createToastTimeline(toastSelector, duration = 3000) {
  const tl = createTimeline({
    autoplay: false
  });

  tl.add(toastSelector, {
    translateX: [300, 0],
    opacity: [0, 1],
    duration: 400,
    ease: 'outExpo'
  })
    // Hold for specified duration
    .add({}, { duration })
    // Exit
    .add(toastSelector, {
      translateX: [0, 300],
      opacity: [1, 0],
      duration: 300,
      ease: 'inQuad'
    });

  return tl;
}

// =============================================================================
// TIMELINE CONTROLS EXAMPLE
// =============================================================================

/**
 * Interactive timeline controller
 */
export function createControllableTimeline(config) {
  const tl = createTimeline({
    autoplay: false,
    ...config
  });

  // Add your animations...

  return {
    timeline: tl,
    play: () => tl.play(),
    pause: () => tl.pause(),
    reverse: () => tl.reverse(),
    restart: () => tl.restart(),
    seek: (time) => tl.seek(time),
    getProgress: () => tl.progress,
    setProgress: (progress) => tl.seek(tl.duration * progress)
  };
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Basic sequential timeline
const tl = createSequentialTimeline();

// Page entrance on load
document.addEventListener('DOMContentLoaded', () => {
  const entranceTl = createPageEntranceTimeline();
  entranceTl.play();
});

// Modal handling
const modalOpenTl = createModalOpenTimeline('#my-modal');
const modalCloseTl = createModalCloseTimeline('#my-modal');

openButton.addEventListener('click', () => modalOpenTl.play());
closeButton.addEventListener('click', () => modalCloseTl.play());

// Scroll-triggered card reveal
const cardTl = createCardRevealTimeline('.feature-card');
// Trigger with ScrollObserver or IntersectionObserver
observer.onEnter = () => cardTl.play();

// Controllable timeline for scrubbing
const controller = createControllableTimeline({
  defaults: { duration: 1000 }
});
// Add animations to controller.timeline
slider.addEventListener('input', (e) => {
  controller.setProgress(e.target.value / 100);
});
*/
