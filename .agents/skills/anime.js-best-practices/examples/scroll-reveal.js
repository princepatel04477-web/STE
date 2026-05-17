/**
 * anime.js v4 Scroll Animation Examples
 *
 * Patterns for scroll-triggered animations using ScrollObserver.
 */

import { animate, ScrollObserver, stagger, createTimeline } from 'animejs';

// =============================================================================
// BASIC SCROLL ANIMATIONS
// =============================================================================

/**
 * Simple fade in on scroll
 */
export function setupFadeInOnScroll(selector) {
  return new ScrollObserver(selector, {
    onEnter: (elements) => {
      animate(elements, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        ease: 'outExpo'
      });
    }
  });
}

/**
 * Staggered reveal for multiple elements
 */
export function setupStaggeredReveal(containerSelector, itemSelector) {
  return new ScrollObserver(containerSelector, {
    onEnter: () => {
      animate(itemSelector, {
        opacity: [0, 1],
        translateY: [40, 0],
        delay: stagger(75),
        duration: 600,
        ease: 'outQuad'
      });
    }
  });
}

/**
 * Scale in from center
 */
export function setupScaleInOnScroll(selector) {
  return new ScrollObserver(selector, {
    onEnter: (elements) => {
      animate(elements, {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 500,
        ease: 'outBack'
      });
    }
  });
}

// =============================================================================
// DIRECTIONAL ANIMATIONS
// =============================================================================

/**
 * Direction-aware scroll animation
 */
export function setupDirectionalReveal(selector) {
  return new ScrollObserver(selector, {
    repeat: true,

    onEnterForward: (elements) => {
      // Scrolling down - slide up
      animate(elements, {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 600,
        ease: 'outExpo'
      });
    },

    onEnterBackward: (elements) => {
      // Scrolling up - slide down
      animate(elements, {
        opacity: [0, 1],
        translateY: [-50, 0],
        duration: 600,
        ease: 'outExpo'
      });
    },

    onLeaveForward: (elements) => {
      // Scrolling down, leaving - slide up and out
      animate(elements, {
        opacity: [1, 0],
        translateY: [0, -30],
        duration: 400,
        ease: 'inQuad'
      });
    },

    onLeaveBackward: (elements) => {
      // Scrolling up, leaving - slide down and out
      animate(elements, {
        opacity: [1, 0],
        translateY: [0, 30],
        duration: 400,
        ease: 'inQuad'
      });
    }
  });
}

/**
 * Slide in from sides based on position
 */
export function setupAlternatingSlideIn(selector) {
  return new ScrollObserver(selector, {
    onEnter: (elements) => {
      elements.forEach((el, index) => {
        const fromLeft = index % 2 === 0;
        animate(el, {
          opacity: [0, 1],
          translateX: [fromLeft ? -50 : 50, 0],
          duration: 700,
          ease: 'outExpo'
        });
      });
    }
  });
}

// =============================================================================
// PROGRESS-BASED ANIMATIONS
// =============================================================================

/**
 * Parallax effect on scroll
 */
export function setupParallax(selector, speed = 0.5) {
  return new ScrollObserver(selector, {
    onUpdate: (elements, progress) => {
      const offset = (progress - 0.5) * 100 * speed;
      elements.forEach(el => {
        el.style.transform = `translateY(${offset}px)`;
      });
    }
  });
}

/**
 * Progress bar that fills as section scrolls
 */
export function setupProgressBar(sectionSelector, progressBarSelector) {
  return new ScrollObserver(sectionSelector, {
    onUpdate: (elements, progress) => {
      document.querySelector(progressBarSelector).style.width =
        `${progress * 100}%`;
    }
  });
}

/**
 * Opacity fade based on scroll progress
 */
export function setupProgressFade(selector) {
  return new ScrollObserver(selector, {
    onUpdate: (elements, progress) => {
      // Fade in during first half, stay visible
      const opacity = Math.min(1, progress * 2);
      elements.forEach(el => {
        el.style.opacity = opacity;
      });
    }
  });
}

/**
 * Scale based on scroll progress
 */
export function setupProgressScale(selector, minScale = 0.8, maxScale = 1) {
  return new ScrollObserver(selector, {
    onUpdate: (elements, progress) => {
      const scale = minScale + (maxScale - minScale) * progress;
      elements.forEach(el => {
        el.style.transform = `scale(${scale})`;
      });
    }
  });
}

// =============================================================================
// LINKED ANIMATIONS
// =============================================================================

/**
 * Animation that follows scroll progress exactly
 */
export function setupLinkedAnimation(triggerSelector, animationSelector) {
  const anim = animate(animationSelector, {
    translateX: [0, 200],
    rotate: [0, 360],
    autoplay: false
  });

  return new ScrollObserver(triggerSelector, {
    sync: anim  // Animation progress tied to scroll
  });
}

/**
 * Smooth linked animation with easing
 */
export function setupSmoothLinkedAnimation(triggerSelector, animationSelector) {
  const anim = animate(animationSelector, {
    translateX: [0, 300],
    opacity: [0.5, 1],
    autoplay: false
  });

  return new ScrollObserver(triggerSelector, {
    sync: {
      animation: anim,
      smooth: 0.1,  // Smoothing factor
      ease: 'outQuad'
    }
  });
}

// =============================================================================
// COMPLEX SCROLL PATTERNS
// =============================================================================

/**
 * Horizontal scroll section
 */
export function setupHorizontalScroll(sectionSelector, contentSelector) {
  const section = document.querySelector(sectionSelector);
  const content = document.querySelector(contentSelector);

  return new ScrollObserver(section, {
    onUpdate: (elements, progress) => {
      const maxScroll = content.scrollWidth - section.clientWidth;
      content.style.transform = `translateX(-${progress * maxScroll}px)`;
    }
  });
}

/**
 * Sticky element with progress-based animation
 */
export function setupStickyAnimation(containerSelector, stickySelector) {
  return new ScrollObserver(containerSelector, {
    onUpdate: (elements, progress) => {
      const sticky = document.querySelector(stickySelector);

      // Scale up as user scrolls through section
      const scale = 0.8 + progress * 0.2;
      sticky.style.transform = `scale(${scale})`;

      // Change color based on progress
      const hue = Math.round(progress * 360);
      sticky.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
    }
  });
}

/**
 * Timeline-based scroll animation
 */
export function setupTimelineOnScroll(containerSelector) {
  const tl = createTimeline({
    autoplay: false,
    defaults: { duration: 600, ease: 'outQuad' }
  });

  tl.add(`${containerSelector} .step-1`, {
      opacity: [0, 1],
      translateY: [30, 0]
    })
    .add(`${containerSelector} .step-2`, {
      opacity: [0, 1],
      translateX: [-30, 0]
    })
    .add(`${containerSelector} .step-3`, {
      opacity: [0, 1],
      scale: [0.9, 1]
    });

  return new ScrollObserver(containerSelector, {
    sync: tl  // Timeline progress tied to scroll
  });
}

// =============================================================================
// SCROLL-TRIGGERED ONCE
// =============================================================================

/**
 * Animate once when scrolled into view (no repeat)
 */
export function setupOnceAnimation(selector, animationConfig) {
  const observer = new ScrollObserver(selector, {
    repeat: false,  // Only trigger once

    onEnter: (elements) => {
      animate(elements, {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 800,
        ease: 'outExpo',
        ...animationConfig
      });

      // Optionally disconnect observer
      observer.revert();
    }
  });

  return observer;
}

/**
 * Batch setup for multiple "animate once" elements
 */
export function setupBatchOnceAnimations(configs) {
  const observers = [];

  configs.forEach(({ selector, animation }) => {
    const observer = setupOnceAnimation(selector, animation);
    observers.push(observer);
  });

  // Return cleanup function
  return () => {
    observers.forEach(obs => obs.revert());
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Setup multiple scroll animations from config
 */
export function setupScrollAnimations(config) {
  const observers = [];

  config.forEach(({ selector, type, options = {} }) => {
    let observer;

    switch (type) {
      case 'fadeIn':
        observer = setupFadeInOnScroll(selector);
        break;
      case 'scaleIn':
        observer = setupScaleInOnScroll(selector);
        break;
      case 'directional':
        observer = setupDirectionalReveal(selector);
        break;
      case 'parallax':
        observer = setupParallax(selector, options.speed);
        break;
      default:
        observer = setupFadeInOnScroll(selector);
    }

    observers.push(observer);
  });

  // Return cleanup function
  return () => {
    observers.forEach(obs => obs.revert());
  };
}

/**
 * Cleanup all scroll observers
 */
export function cleanupObserver(observer) {
  observer?.revert();
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Basic fade in
const fadeObserver = setupFadeInOnScroll('.fade-section');

// Staggered reveal
const staggerObserver = setupStaggeredReveal('.list-container', '.list-item');

// Direction-aware animation
const directionalObserver = setupDirectionalReveal('.card');

// Parallax effect
const parallaxObserver = setupParallax('.parallax-bg', 0.3);

// Progress bar
const progressObserver = setupProgressBar('article', '.reading-progress');

// Horizontal scroll section
const horizontalObserver = setupHorizontalScroll('.horizontal-section', '.horizontal-content');

// Linked animation (animation follows scroll)
const linkedObserver = setupLinkedAnimation('.trigger-section', '.animated-element');

// Batch setup
const cleanup = setupScrollAnimations([
  { selector: '.hero', type: 'fadeIn' },
  { selector: '.features', type: 'scaleIn' },
  { selector: '.testimonials', type: 'directional' },
  { selector: '.background', type: 'parallax', options: { speed: 0.5 } }
]);

// Cleanup on page leave
window.addEventListener('beforeunload', cleanup);

// Or with React useEffect
useEffect(() => {
  const cleanup = setupScrollAnimations([...]);
  return cleanup;
}, []);
*/
