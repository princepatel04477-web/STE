# Native Web Animations API Reference

The Web Animations API (WAAPI) is the browser-native animation engine that anime.js's `waapi.animate()` wraps. Understanding the native API helps debug issues and leverage advanced features.

## When to Use Native WAAPI vs anime.js

| Use Native `Element.animate()` | Use anime.js `waapi.animate()` |
|-------------------------------|-------------------------------|
| Zero dependencies needed | Need stagger, splitText utilities |
| Full control over keyframes | Want simpler syntax |
| Need `commitStyles()`, `persist()` | Want consistent API with JS engine |
| Debugging animation issues | Building with anime.js ecosystem |

## Core Syntax

### Element.animate()

```javascript
const animation = element.animate(keyframes, options);
```

Returns an `Animation` object with full playback control.

### Keyframe Format: Array of Objects

```javascript
// Most explicit format - each object is a keyframe
element.animate([
  { transform: 'translateY(0)', opacity: 1 },
  { transform: 'translateY(-20px)', opacity: 0.5, offset: 0.5 },
  { transform: 'translateY(0)', opacity: 1 }
], {
  duration: 600,
  iterations: Infinity
});
```

### Keyframe Format: Object with Arrays

```javascript
// More concise - each property is an array of values
element.animate({
  transform: ['translateY(0)', 'translateY(-20px)', 'translateY(0)'],
  opacity: [1, 0.5, 1]
}, {
  duration: 600,
  iterations: Infinity
});
```

### Implicit Keyframes

```javascript
// Animate FROM current state TO specified state
element.animate({ transform: 'translateX(300px)' }, 1000);

// Animate FROM specified state TO current state
element.animate({ transform: 'translateX(300px)', offset: 0 }, 1000);

// Current → specified → current (pulse)
element.animate({ transform: 'scale(1.1)', offset: 0.5 }, 500);
```

## Timing Options

**CRITICAL DIFFERENCES FROM CSS:**

| Property | CSS | WAAPI | Notes |
|----------|-----|-------|-------|
| Duration | `2s` | `2000` | **Milliseconds, not seconds** |
| Iterations | `infinite` | `Infinity` | JavaScript `Infinity` constant |
| Default easing | `ease` | `linear` | **Different defaults!** |

### Complete Options Object

```javascript
element.animate(keyframes, {
  // Timing
  duration: 1000,           // milliseconds (required)
  delay: 0,                 // milliseconds before start
  endDelay: 0,              // milliseconds after end

  // Iteration
  iterations: 1,            // number or Infinity
  iterationStart: 0,        // start point (0-1)
  direction: 'normal',      // 'normal', 'reverse', 'alternate', 'alternate-reverse'

  // Easing
  easing: 'linear',         // CSS easing function (default is LINEAR, not ease!)

  // Fill mode
  fill: 'none',             // 'none', 'forwards', 'backwards', 'both'

  // Compositing
  composite: 'replace',     // 'replace', 'add', 'accumulate'
});
```

## Playback Controls

### Methods

```javascript
const anim = element.animate(keyframes, options);

// Core playback
anim.play();                    // Start or resume
anim.pause();                   // Pause at current position
anim.reverse();                 // Reverse direction
anim.finish();                  // Jump to end state
anim.cancel();                  // Stop and remove all effects

// Speed control
anim.updatePlaybackRate(0.5);   // Smooth speed change (recommended)
anim.playbackRate = 2;          // Instant speed change

// Persist styles
anim.commitStyles();            // Write final values to element.style
anim.persist();                 // Prevent auto-removal
```

### Properties

```javascript
// Read/write
anim.currentTime = 500;         // Seek to 500ms
anim.playbackRate = 1.5;        // 1.5x speed

// Read-only
anim.playState;                 // 'idle', 'running', 'paused', 'finished'
anim.pending;                   // true if play/pause pending
anim.replaceState;              // 'active', 'removed', 'persisted'

// Get timing info
const timing = anim.effect.getComputedTiming();
timing.duration;                // Animation duration
timing.activeDuration;          // Total active time
timing.progress;                // Current progress (0-1)
```

## Promises and Events

### Finished Promise

```javascript
const anim = element.animate(keyframes, options);

// Promise-based
anim.finished
  .then(() => console.log('Animation completed'))
  .catch(() => console.log('Animation was canceled'));

// Async/await
async function runAnimation() {
  const anim = element.animate(keyframes, options);
  await anim.finished;
  console.log('Done!');
}
```

### Event Handlers

```javascript
anim.onfinish = () => console.log('Finished');
anim.oncancel = () => console.log('Canceled');
anim.onremove = () => console.log('Auto-removed');

// Or addEventListener
anim.addEventListener('finish', () => {});
anim.addEventListener('cancel', () => {});
anim.addEventListener('remove', () => {});
```

## Getting All Animations

```javascript
// All animations on document
const allAnimations = document.getAnimations();

// All animations on specific element
const elementAnimations = element.getAnimations();

// Slow all animations (accessibility)
document.getAnimations().forEach(anim => {
  anim.updatePlaybackRate(anim.playbackRate * 0.5);
});

// Pause all animations
document.getAnimations().forEach(anim => anim.pause());
```

## Fill Mode and commitStyles()

### Problem with fill: 'forwards'

```javascript
// BAD: Browser maintains animation state forever (memory leak)
element.animate({ transform: 'translateX(100px)' }, {
  duration: 500,
  fill: 'forwards'  // Animation never releases
});
```

### Solution: commitStyles()

```javascript
// GOOD: Apply final styles directly to element
const anim = element.animate({ transform: 'translateX(100px)' }, {
  duration: 500,
  fill: 'forwards'
});

anim.finished.then(() => {
  anim.commitStyles();  // Write to element.style
  anim.cancel();        // Release the animation
});
```

## Keyframe Special Properties

### offset (position)

```javascript
element.animate([
  { opacity: 1 },                    // offset: 0 (implicit)
  { opacity: 0.2, offset: 0.7 },     // offset: 0.7 (70%)
  { opacity: 0 }                     // offset: 1 (implicit)
], 2000);
```

### easing (per-keyframe)

```javascript
element.animate([
  { transform: 'translateX(0)', easing: 'ease-out' },
  { transform: 'translateX(100px)', easing: 'ease-in' },
  { transform: 'translateX(50px)' }
], 1000);
```

### composite (layering)

```javascript
element.animate([
  { transform: 'translateX(100px)', composite: 'add' }
], {
  duration: 1000,
  composite: 'add'  // Adds to existing transforms
});
```

## Common Patterns

### Bounce Animation

```javascript
element.animate([
  { transform: 'translateY(0)' },
  { transform: 'translateY(-20px)', offset: 0.5 },
  { transform: 'translateY(0)' }
], {
  duration: 600,
  iterations: Infinity,
  easing: 'ease-in-out'
});
```

### Fade In

```javascript
element.animate([
  { opacity: 0, transform: 'translateY(20px)' },
  { opacity: 1, transform: 'translateY(0)' }
], {
  duration: 500,
  fill: 'forwards',
  easing: 'ease-out'
});
```

### Staggered Animation (Manual)

```javascript
const elements = document.querySelectorAll('.item');

elements.forEach((el, i) => {
  el.animate([
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], {
    duration: 500,
    delay: i * 100,  // Stagger by index
    fill: 'forwards',
    easing: 'ease-out'
  });
});
```

### Click to Replay

```javascript
const button = document.querySelector('button');
const box = document.querySelector('.box');

button.addEventListener('click', () => {
  button.disabled = true;

  const anim = box.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.2)' },
    { transform: 'scale(1)' }
  ], { duration: 300 });

  anim.finished.then(() => {
    button.disabled = false;
  });
});
```

### Sync Animation Duration

```javascript
const mainAnim = element1.animate(keyframes1, { duration: 2000 });

// Link second animation to first's duration
const linkedDuration = mainAnim.effect.getComputedTiming().duration;
element2.animate(keyframes2, { duration: linkedDuration / 2 });
```

## React/Next.js with Native WAAPI

```jsx
'use client';

import { useEffect, useRef } from 'react';

export function NativeAnimatedBox() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const anim = ref.current.animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 500,
      fill: 'forwards',
      easing: 'ease-out'
    });

    return () => anim.cancel();
  }, []);

  return <div ref={ref}>Animated with native WAAPI</div>;
}
```

## Debugging Tips

1. **Check playState**: `console.log(anim.playState)` - should be 'running'
2. **Check currentTime**: `console.log(anim.currentTime)` - should increase
3. **Check effect**: `console.log(anim.effect.getKeyframes())` - see actual keyframes
4. **Use getAnimations()**: `console.log(element.getAnimations())` - see all active animations
5. **Duration in ms**: Most common mistake - using seconds instead of milliseconds

## Browser Support

Web Animations API is supported in all modern browsers:
- Chrome 36+
- Firefox 48+
- Safari 13.1+
- Edge 79+

For older browsers, use the [web-animations-js polyfill](https://github.com/web-animations/web-animations-js).
