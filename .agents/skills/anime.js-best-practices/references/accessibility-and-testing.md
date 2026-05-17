# Accessibility, Testing, and Troubleshooting

Critical patterns for production-ready animations.

## Accessibility: prefers-reduced-motion

**Always respect user preferences for reduced motion.** Some users experience motion sickness, vestibular disorders, or simply prefer less animation.

### Basic Pattern

```javascript
import { waapi } from 'animejs';

// Check user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Instant state change, no animation
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
} else {
  // Full animation
  waapi.animate(element, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 600,
    ease: 'outExpo'
  });
}
```

### React Hook for Reduced Motion

```jsx
'use client';

import { useState, useEffect } from 'react';

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true); // Default safe

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

### Using the Hook

```jsx
'use client';

import { useEffect, useRef } from 'react';
import { waapi } from 'animejs';
import { usePrefersReducedMotion } from './hooks';

export function AnimatedCard({ children }) {
  const ref = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    if (prefersReducedMotion) {
      // No animation - just show immediately
      ref.current.style.opacity = '1';
      return;
    }

    const anim = waapi.animate(ref.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      ease: 'outExpo'
    });

    return () => anim.cancel();
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} style={{ opacity: prefersReducedMotion ? 1 : 0 }}>
      {children}
    </div>
  );
}
```

### CSS Fallback

```css
/* Disable ALL animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Global Animation Slowdown (Accessibility)

```javascript
// Slow all animations on page for users who need more time
document.getAnimations().forEach(anim => {
  anim.updatePlaybackRate(anim.playbackRate * 0.5);
});
```

## TypeScript Support

### Installing Types

```bash
npm install animejs
# Types are included in animejs v4
```

### Basic Typing

```typescript
import { waapi, stagger, splitText } from 'animejs';
import type { Animation } from 'animejs';

// Animation returns Animation type
const anim: Animation = waapi.animate('.element', {
  translateX: 200,
  duration: 1000
});

// Typed playback controls
anim.play();
anim.pause();
anim.currentTime = 500;
```

### React Hook with Types

```typescript
import { useRef, useEffect, RefObject } from 'react';
import { waapi } from 'animejs';
import type { Animation, AnimationParams } from 'animejs';

interface UseAnimationReturn {
  ref: RefObject<HTMLDivElement>;
  play: () => void;
  pause: () => void;
}

function useAnimation(config: AnimationParams): UseAnimationReturn {
  const ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  const play = () => {
    if (ref.current) {
      animationRef.current = waapi.animate(ref.current, config);
    }
  };

  const pause = () => animationRef.current?.pause();

  useEffect(() => {
    return () => animationRef.current?.cancel();
  }, []);

  return { ref, play, pause };
}
```

## Error Handling

### Defensive Animation Pattern

```javascript
import { waapi } from 'animejs';

function safeAnimate(target, config) {
  try {
    // Verify target exists
    const elements = typeof target === 'string'
      ? document.querySelectorAll(target)
      : [target].flat();

    if (elements.length === 0) {
      console.warn(`Animation target not found: ${target}`);
      return null;
    }

    return waapi.animate(target, config);
  } catch (error) {
    console.error('Animation failed:', error);
    return null;
  }
}
```

### React Error Boundary for Animations

```jsx
'use client';

import { Component } from 'react';

class AnimationErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Animation error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render children without animation
      return this.props.fallback || this.props.children;
    }
    return this.props.children;
  }
}
```

### Handling Animation Cancellation

```javascript
const anim = waapi.animate('.element', config);

anim.finished
  .then(() => {
    console.log('Animation completed successfully');
  })
  .catch((error) => {
    // Animation was cancelled - this is often intentional
    if (error.name === 'AbortError') {
      console.log('Animation was cancelled');
    } else {
      console.error('Animation error:', error);
    }
  });
```

## Testing Animations

### Jest/Vitest: Mock anime.js

```javascript
// __mocks__/animejs.js
export const waapi = {
  animate: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    cancel: jest.fn(),
    finished: Promise.resolve(),
    currentTime: 0,
    playbackRate: 1
  }))
};

export const stagger = jest.fn((delay) => delay);
export const splitText = jest.fn(() => ({ chars: [], words: [], lines: [] }));
```

### Testing Component with Animation

```jsx
import { render, screen } from '@testing-library/react';
import { AnimatedCard } from './AnimatedCard';

// Mock animejs
jest.mock('animejs');

describe('AnimatedCard', () => {
  it('renders children', () => {
    render(<AnimatedCard>Hello</AnimatedCard>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('calls animate on mount', () => {
    const { waapi } = require('animejs');
    render(<AnimatedCard>Hello</AnimatedCard>);
    expect(waapi.animate).toHaveBeenCalled();
  });
});
```

### Playwright: Visual Testing

```javascript
import { test, expect } from '@playwright/test';

test('animation completes', async ({ page }) => {
  await page.goto('/animated-page');

  // Wait for animation to complete
  await page.waitForFunction(() => {
    const element = document.querySelector('.animated-element');
    return getComputedStyle(element).opacity === '1';
  });

  // Screenshot after animation
  await expect(page).toHaveScreenshot('after-animation.png');
});
```

### Disable Animations in Tests

```javascript
// playwright.config.js
export default {
  use: {
    // Disable animations for consistent screenshots
    launchOptions: {
      args: ['--disable-animations']
    }
  }
};
```

```css
/* test-styles.css - load in test environment */
*, *::before, *::after {
  animation-duration: 0ms !important;
  transition-duration: 0ms !important;
}
```

## Common Mistakes & Troubleshooting

### 1. Animation Not Visible

**Symptoms:** Element doesn't animate, stays in initial state.

**Causes & Fixes:**

```javascript
// ❌ WRONG: Duration in seconds
waapi.animate('.el', { translateX: 100, duration: 2 }); // 2ms!

// ✅ CORRECT: Duration in milliseconds
waapi.animate('.el', { translateX: 100, duration: 2000 }); // 2 seconds
```

```javascript
// ❌ WRONG: Element doesn't exist yet
waapi.animate('.dynamic-element', config); // Element not in DOM

// ✅ CORRECT: Wait for element
await waitForElement('.dynamic-element');
waapi.animate('.dynamic-element', config);
```

### 2. Animation Snaps Instead of Animating

**Symptoms:** Element jumps to end state immediately.

```javascript
// ❌ WRONG: No from value, element already at end state
waapi.animate('.el', { opacity: 1 }); // Already opacity: 1

// ✅ CORRECT: Specify from-to
waapi.animate('.el', { opacity: [0, 1] });
```

### 3. Animation Doesn't Loop

```javascript
// ❌ WRONG: CSS syntax
waapi.animate('.el', { translateX: 100, iterations: 'infinite' });

// ✅ CORRECT: JavaScript Infinity
waapi.animate('.el', { translateX: 100, iterations: Infinity });
```

### 4. Memory Leak in React

```jsx
// ❌ WRONG: No cleanup
useEffect(() => {
  waapi.animate(ref.current, { translateX: 100, loop: true });
}, []);

// ✅ CORRECT: Cancel on unmount
useEffect(() => {
  const anim = waapi.animate(ref.current, { translateX: 100, loop: true });
  return () => anim.cancel();
}, []);
```

### 5. fill: 'forwards' Memory Leak

```javascript
// ❌ WRONG: Animation held forever
waapi.animate('.el', {
  translateX: 100,
  fill: 'forwards' // Browser maintains animation indefinitely
});

// ✅ CORRECT: Use commitStyles
const anim = waapi.animate('.el', {
  translateX: 100,
  fill: 'forwards'
});
anim.finished.then(() => {
  anim.commitStyles(); // Write to element.style
  anim.cancel();       // Release animation
});
```

### 6. splitText Not Working

```javascript
// ❌ WRONG: Element has no text content
const { chars } = splitText('.empty-div'); // chars = []

// ❌ WRONG: Called before DOM ready
const { chars } = splitText('h1'); // Element not in DOM yet

// ✅ CORRECT: Ensure element exists with text
useEffect(() => {
  if (ref.current && ref.current.textContent) {
    const { chars } = splitText(ref.current);
    // ...
  }
}, []);
```

### 7. Stagger Not Working

```javascript
// ❌ WRONG: Single element (nothing to stagger)
waapi.animate('.unique-element', { delay: stagger(100) });

// ✅ CORRECT: Multiple elements
waapi.animate('.list-item', { delay: stagger(100) }); // Multiple .list-item elements
```

## Performance Debugging

### Chrome DevTools Performance Tab

1. Open DevTools → Performance tab
2. Click Record
3. Trigger your animation
4. Stop recording
5. Look for:
   - **Long frames** (red bars) = jank
   - **Layout** events during animation = bad (animating width/height)
   - **Paint** events = consider `will-change`

### What to Look For

```
✅ Good: Only "Composite Layers" during animation
❌ Bad: "Layout" or "Recalculate Style" during animation
❌ Bad: "Paint" on every frame
```

### Optimizing Janky Animations

```javascript
// ❌ JANKY: Animating layout properties
waapi.animate('.el', {
  width: [100, 200],     // Triggers layout!
  height: [50, 100],     // Triggers layout!
  top: [0, 50]           // Triggers layout!
});

// ✅ SMOOTH: Animating transform/opacity only
waapi.animate('.el', {
  scale: [1, 2],         // GPU accelerated
  translateY: [0, 50],   // GPU accelerated
  opacity: [0.5, 1]      // GPU accelerated
});
```

### Using will-change

```css
/* Apply before animation starts */
.will-animate {
  will-change: transform, opacity;
}

/* Remove after animation completes */
.animation-done {
  will-change: auto;
}
```

```javascript
// Programmatic will-change
element.style.willChange = 'transform, opacity';

const anim = waapi.animate(element, config);

anim.finished.then(() => {
  element.style.willChange = 'auto'; // Clean up
});
```
