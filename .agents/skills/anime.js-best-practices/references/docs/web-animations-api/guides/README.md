# Web Animations API - Comprehensive Guide

> Source: MDN Web Docs
> Last Updated: January 2026

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Interfaces](#interfaces)
4. [Basic Usage](#basic-usage)
5. [Keyframe Formats](#keyframe-formats)
6. [Timing Properties](#timing-properties)
7. [Playback Control](#playback-control)
8. [Events and Promises](#events-and-promises)
9. [Advanced Patterns](#advanced-patterns)
10. [Tips and Best Practices](#tips-and-best-practices)

---

## Overview

The **Web Animations API** allows for synchronizing and timing changes to DOM element presentations by combining two models:

- **Timing Model** - Controls when animations occur
- **Animation Model** - Describes what changes during animation

### Key Advantages

- Move interactive animations from stylesheets to JavaScript
- Separate presentation from behavior
- Dynamically set values (properties, durations, etc.)
- No need for DOM-heavy CSS class manipulation
- Browser makes internal optimizations automatically
- More efficient than `requestAnimationFrame` for most cases

### Historical Context

- **SMIL** (Synchronized Multimedia Integration Language): Early animation engine for SVG only
- **CSS Animations & Transitions**: Introduced by Safari team
- **Web Animations API**: Created by Mozilla Firefox and Google Chrome developers to consolidate animation functionality across all browsers

---

## Core Concepts

### Two Core Models

#### 1. Timing Model

Handles time management:

- Each document has a master timeline (`Document.timeline`)
- Stretches from page load to window close
- Each animation anchored by its `startTime` (when it plays along the document's timeline)
- Controls: seeking position, playback rate, repetitions
- Future possibilities: gesture-based, scroll-position, parent/child timelines

#### 2. Animation Model

Handles visual changes over time:

- Conceptualized as snapshots of what the animation looks like at any given moment
- Arranged along the animation's duration
- Determines what animated objects should look like at any point in time

### Core Components

#### Timeline Objects

- Provide `currentTime` property showing how long the page has been open
- Currently: only `Document.timeline` based on active document
- Future: potential `ScrollTimeline` and other types

#### Animation Objects

Think of them as **DVD players**:

- Control playback of animation effects
- Methods available:
  - `play()` - start animation
  - `pause()` - pause animation
  - `seek()` / `currentTime` - jump to specific point
  - `reverse()` - play backwards
  - `playbackRate` - control speed

#### Animation Effects (Keyframe Effects)

Think of them as **DVDs** (the media being played):

- Bundles of information including:
  - Set of keyframes
  - Duration for animation
- Currently: `KeyframeEffect` is the only available type
- Future: Group Effects and Sequence Effects (Web Animations API Level 2)

### How They Work Together

```javascript
// Animation Constructor
new Animation(effect, timeline)

// Or the shortcut
Element.animate()
```

The components assemble as:

1. **Timeline** provides time reference
2. **Animation Object** uses Timeline to playback
3. **Keyframe Effect** contains the animation data
4. **Result**: A playable animation you can view and control

---

## Interfaces

### Primary Interfaces

| Interface | Description |
|-----------|-------------|
| **`Animation`** | Provides playback controls and timeline for animation nodes. Accepts objects created with `KeyframeEffect()` constructor. |
| **`KeyframeEffect`** | Defines sets of animatable properties and values (keyframes). Specifies timing options for animations. |
| **`AnimationTimeline`** | Represents the animation timeline. Base interface inherited by `DocumentTimeline`. |
| **`DocumentTimeline`** | Represents default document timeline. Accessed via `Document.timeline` property. |
| **`AnimationEvent`** | Part of CSS Animations module. Captures animation name and elapsed time. |
| **`ScrollTimeline`** | Advanced timeline for scroll-driven animations. |
| **`ViewTimeline`** | Advanced timeline for view-driven animations. |

### Extensions to Other Interfaces

#### Document Interface Extensions

```javascript
// Access the default document timeline
const timeline = document.timeline;

// Get all animations currently in effect
const animations = document.getAnimations();
```

#### Element Interface Extensions

```javascript
// Create and play an animation on an element
const animation = element.animate(keyframes, options);

// Get animations affecting an element
const elementAnimations = element.getAnimations();
```

---

## Basic Usage

### Creating Keyframes

Define animations as an array of keyframe objects:

```javascript
const aliceTumbling = [
  { transform: "rotate(0) translate3d(-50%, -50%, 0)", color: "black" },
  { color: "#431236", offset: 0.3 },
  { transform: "rotate(360deg) translate3d(-50%, -50%, 0)", color: "black" },
];
```

**Key points:**

- Keyframes are equally spaced by default
- Use `offset` property to specify explicit positions (0-1)
- At least 2 keyframes required

### Running Animations

```javascript
// Method 1: Using Element.animate()
const animation = element.animate(keyframes, timing);

// Method 2: Shorthand with duration only
element.animate(keyframes, 3000);

// Method 3: Inline options
element.animate(
  [
    { transform: "rotate(0)" },
    { transform: "rotate(360deg)" }
  ],
  {
    duration: 3000,
    iterations: Infinity
  }
);
```

### Using the Animation Constructor

```javascript
// Create a KeyframeEffect
const effect = new KeyframeEffect(
  element,
  [
    { opacity: 0 },
    { opacity: 1 }
  ],
  { duration: 1000 }
);

// Create an Animation with the effect
const animation = new Animation(effect, document.timeline);

// Play the animation
animation.play();
```

---

## Keyframe Formats

### Format 1: Array of Objects

An array of keyframe objects with properties and values:

```javascript
element.animate(
  [
    { opacity: 0, color: "white" },  // from
    { opacity: 1, color: "black" }   // to
  ],
  2000
);
```

#### Using Offset

```javascript
element.animate(
  [
    { opacity: 1 },
    { opacity: 0.1, offset: 0.7 },
    { opacity: 0 }
  ],
  2000
);
```

- Must be between 0.0 and 1.0 (inclusive) in ascending order
- Omitted offsets are evenly spaced between adjacent keyframes

#### Using Easing

```javascript
element.animate(
  [
    { opacity: 1, easing: "ease-out" },
    { opacity: 0.1, easing: "ease-in" },
    { opacity: 0 }
  ],
  2000
);
```

- Easing applies from the keyframe where specified to the next keyframe
- Options `easing` applies across entire animation duration

### Format 2: Object with Property Arrays

Key-value pairs with arrays of values:

```javascript
element.animate(
  {
    opacity: [0, 1],           // [from, to]
    color: ["white", "black"]  // [from, to]
  },
  2000
);
```

#### Variable-length Arrays

```javascript
element.animate(
  {
    opacity: [0, 1],                           // offset: 0, 1
    backgroundColor: ["red", "yellow", "green"] // offset: 0, 0.5, 1
  },
  2000
);
```

- Each array can have different lengths
- Values distributed independently

#### Special Keys

```javascript
element.animate(
  {
    opacity: [0, 0.9, 1],
    offset: [0, 0.8],        // Shorthand for [0, 0.8, 1]
    easing: ["ease-in", "ease-out"]
  },
  2000
);
```

- If insufficient values, list repeats as needed
- `null` values cause even spacing

### Implicit To/From Keyframes

```javascript
// Current state -> translateX(300px)
logo.animate({ transform: "translateX(300px)" }, 1000);

// translateX(300px) -> current state
logo.animate({ transform: "translateX(300px)", offset: 0 }, 1000);

// Current state -> translateX(300px) -> current state
logo.animate({ transform: "translateX(300px)", offset: 0.5 }, 1000);
```

### Special Attributes Reference

| Attribute | Description |
|-----------|-------------|
| **offset** | Number (0.0-1.0) or null. Keyframe position in timeline. If null/missing, evenly spaced. |
| **easing** | Easing function applied from this keyframe to next. |
| **composite** | `KeyframeEffect.composite` operation. Defaults to `auto`. |

### Property Names

- Use **camelCase**: `background-color` -> `backgroundColor`
- Shorthand values permitted: `margin`
- Exceptions:
  - `float` -> `cssFloat` (reserved word)
  - `offset` -> `cssOffset` (conflicts with keyframe offset)

---

## Timing Properties

```javascript
const aliceTiming = {
  duration: 3000,        // milliseconds (not seconds!)
  iterations: Infinity,  // use Infinity, not "infinite"
  easing: "linear",      // default is "linear"
  fill: "forwards",      // persist final state
  direction: "normal",   // or "reverse", "alternate", "alternate-reverse"
  delay: 0,              // delay before animation starts
  endDelay: 0,           // delay after animation ends
  iterationStart: 0,     // starting point within iteration (0-1)
};
```

### Timing Property Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | number | 0 | Animation duration in milliseconds |
| `iterations` | number | 1 | Number of times to repeat (use `Infinity` for infinite) |
| `easing` | string | "linear" | Timing function for the entire animation |
| `fill` | string | "none" | How styles persist: "none", "forwards", "backwards", "both" |
| `direction` | string | "normal" | Playback direction: "normal", "reverse", "alternate", "alternate-reverse" |
| `delay` | number | 0 | Delay before animation starts (ms) |
| `endDelay` | number | 0 | Delay after animation ends (ms) |
| `iterationStart` | number | 0 | Starting point within an iteration (0-1) |

---

## Playback Control

### Play, Pause, and Cancel

```javascript
const animation = element.animate(keyframes, timing);

animation.pause();    // Stop the animation
animation.play();     // Resume or start
animation.reverse();  // Run backwards
animation.finish();   // Jump to end
animation.cancel();   // Abort and remove effects
```

### Practical Example: Click to Play

```javascript
const rabbitAnimation = element.animate(
  [
    { transform: "translateY(0%)" },
    { transform: "translateY(100%)" }
  ],
  { duration: 3000, fill: "forwards" }
);

rabbitAnimation.pause(); // Start paused

element.addEventListener("click", () => {
  rabbitAnimation.play();
});
```

### Playback Rate

Control animation speed dynamically:

```javascript
// Get current playback rate
const currentRate = animation.playbackRate;

// Set directly (instant)
animation.playbackRate = 0.5;

// Update smoothly (preferred)
animation.updatePlaybackRate(animation.playbackRate * 0.9);

// Reverse playback
animation.playbackRate = -1;
```

#### Real-world Example: Decay Animation

```javascript
setInterval(() => {
  if (animation.playbackRate > 0.4) {
    animation.updatePlaybackRate(animation.playbackRate * 0.9);
  }
}, 1000);
```

### Getting Animation Information

```javascript
// Get the animation's effect
const effect = animation.effect;

// Get computed timing
const timing = animation.effect.getComputedTiming();
console.log(timing.duration);
console.log(timing.activeDuration);

// Get current position in timeline
const currentTime = animation.currentTime; // milliseconds
const progress = currentTime / timing.duration; // 0-1

// Set position
animation.currentTime = 2000; // Jump to 2 seconds
```

### Link Animation Durations

```javascript
const aliceAnimation = element.animate(
  [{ transform: "scale(.5)" }, { transform: "scale(2)" }],
  { duration: 8000 }
);

// Make another animation's duration depend on Alice's
const cakeAnimation = element.animate([], {
  duration: aliceAnimation.effect.getComputedTiming().duration / 2
});
```

### Get All Page Animations

```javascript
// Get all active animations
const allAnimations = document.getAnimations();

// Example: Slow down all animations for accessibility
allAnimations.forEach((animation) => {
  animation.updatePlaybackRate(animation.playbackRate * 0.5);
});
```

---

## Events and Promises

### Event Handlers

```javascript
const animation = element.animate(keyframes, timing);

// When animation finishes
animation.onfinish = () => {
  console.log("Animation complete!");
};

// When animation is cancelled
animation.oncancel = () => {
  console.log("Animation cancelled!");
};

// When animation is removed
animation.onremove = () => {
  console.log("Animation removed!");
};
```

### Using addEventListener

```javascript
animation.addEventListener("finish", (event) => {
  console.log("Animation finished");
});

animation.addEventListener("cancel", (event) => {
  console.log("Animation cancelled");
});
```

### Using Promises

```javascript
const animation = element.animate(keyframes, timing);

// Wait for animation to finish
animation.finished
  .then(() => {
    console.log("Animation finished");
  })
  .catch(() => {
    console.log("Animation cancelled");
  });
```

### Async/Await Pattern

```javascript
async function animateSequence() {
  const anim1 = element1.animate(keyframes1, 1000);
  await anim1.finished;

  const anim2 = element2.animate(keyframes2, 1000);
  await anim2.finished;

  console.log("All animations complete");
}
```

---

## Advanced Patterns

### Persisting Animation Styles

#### Using fill: "forwards"

```javascript
element.animate(keyframes, {
  duration: 3000,
  fill: "forwards"  // Keep final state
});
```

**Warning:** Not recommended for indefinite persistence because:

- Browser maintains animation state (resource consumption)
- Animation styles have higher cascade precedence

#### Better Approach: commitStyles()

```javascript
const animation = element.animate(keyframes, {
  duration: 3000,
  fill: "forwards"
});

animation.onfinish = () => {
  animation.commitStyles();  // Write computed styles to element.style
  animation.cancel();        // Remove the animation
};
```

### Automatic Animation Removal

Browsers automatically remove filling animations when:

1. Animation has `fill: "forwards"`, `"backwards"`, or `"both"`
2. Animation is finished
3. Timeline is monotonically increasing (normal case)
4. Not controlled by CSS declarations
5. Effect is completely overridden by another animation

**Prevent auto-removal:**

```javascript
animation.persist();  // Keep animation active
console.log(animation.replaceState); // "active", "persisted", or "removed"
```

### Sequence Multiple Animations

```javascript
const anim1 = element1.animate(keyframes1, 3000);

anim1.onfinish = () => {
  element2.animate(keyframes2, 3000);
};
```

### Using Promises for Sequences

```javascript
async function runSequence() {
  await element1.animate(keyframes1, 1000).finished;
  await element2.animate(keyframes2, 1000).finished;
  await element3.animate(keyframes3, 1000).finished;
}
```

### Conditional Animation Based on Position

```javascript
const animation = element.animate(keyframes, {
  duration: 8000,
  fill: "both"
});

animation.pause();
animation.currentTime = animation.effect.getComputedTiming().duration / 2;
```

### Game Example: State Based on Animation Progress

```javascript
const endGame = () => {
  const alicePlayhead = aliceAnimation.currentTime;
  const aliceTimeline = aliceAnimation.effect.getComputedTiming().activeDuration;
  const aliceHeight = alicePlayhead / aliceTimeline;

  if (aliceHeight <= 0.333) {
    console.log("Alice got smaller!");
  } else if (aliceHeight >= 0.666) {
    console.log("Alice got bigger!");
  }
};

animation.onfinish = endGame;
```

### Stop All Animations on Page

```javascript
document.getAnimations().forEach((anim) => {
  anim.cancel();
});
```

---

## Tips and Best Practices

### 1. Running an Animation Again

The CSS Animations specification doesn't provide a native way to replay a completed animation by simply resetting `animation-play-state`. Instead, use JavaScript with the `Element.animate()` method.

```javascript
const box = document.querySelector(".box");
const button = document.querySelector(".runButton");

const colorChangeFrames = { backgroundColor: ["grey", "lime"] };

function playAnimation() {
  box.animate(colorChangeFrames, 4000);
}

button.addEventListener("click", playAnimation);
```

### 2. Waiting for Animation Completion

To prevent interrupting a running animation when triggering a new one, disable the trigger button and listen for the `finish` event:

```javascript
function playAnimation() {
  button.setAttribute("disabled", true);
  const anim = box.animate(colorChangeFrames, 4000);

  anim.addEventListener("finish", (event) => {
    button.removeAttribute("disabled");
  });
}
```

**Benefits:**

- Ensures animation completes before restarting
- Provides better user experience
- Allows controlled iteration of animations

### 3. Stacking Context in Animations

- Animated properties behave as if included in the `will-change` property
- Properties creating a stacking context receive a new stacking context during animation
- With `animation-fill-mode: forwards` or `both`, animated properties retain their final keyframe state and stacking context after completion

### 4. Performance Tips

- Use `transform` and `opacity` for best performance (compositor-only properties)
- The API lets the browser optimize internally
- More efficient than `requestAnimationFrame` for most cases
- Avoid maintaining animations indefinitely with `fill`
- Use `commitStyles()` and `cancel()` instead of persistent `fill: "forwards"`

### 5. Memory Management

```javascript
// Bad: Animation persists in memory
element.animate(keyframes, { duration: 1000, fill: "forwards" });

// Good: Clean up after animation
const anim = element.animate(keyframes, { duration: 1000, fill: "forwards" });
anim.finished.then(() => {
  anim.commitStyles();
  anim.cancel();
});
```

### 6. Accessibility Considerations

```javascript
// Respect user's reduced motion preference
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  // Skip animation or use a simpler one
  element.style.opacity = 1;
} else {
  element.animate([{ opacity: 0 }, { opacity: 1 }], 1000);
}
```

### 7. Slow Down All Animations (Debug/Accessibility)

```javascript
document.getAnimations().forEach((animation) => {
  animation.updatePlaybackRate(animation.playbackRate * 0.5);
});
```

---

## Quick Reference

### Common Animation Patterns

```javascript
// Fade in
element.animate([{ opacity: 0 }, { opacity: 1 }], 300);

// Slide in from left
element.animate(
  [{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }],
  { duration: 300, easing: "ease-out" }
);

// Scale up
element.animate(
  [{ transform: "scale(0)" }, { transform: "scale(1)" }],
  { duration: 200, easing: "ease-out" }
);

// Rotate
element.animate(
  [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
  { duration: 1000, iterations: Infinity }
);

// Color change
element.animate(
  { backgroundColor: ["#ff0000", "#00ff00", "#0000ff"] },
  { duration: 3000, iterations: Infinity }
);

// Complex multi-property
element.animate(
  [
    { opacity: 0, transform: "translateY(-20px) scale(0.9)" },
    { opacity: 1, transform: "translateY(0) scale(1)" }
  ],
  { duration: 400, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
);
```

### Animation States

| Property | Description |
|----------|-------------|
| `animation.playState` | "idle", "running", "paused", "finished" |
| `animation.replaceState` | "active", "persisted", "removed" |
| `animation.pending` | Boolean - true if play/pause is pending |
| `animation.ready` | Promise - resolves when animation is ready to play |
| `animation.finished` | Promise - resolves when animation completes |

---

## Official Specification

[Web Animations (CSSWG Draft)](https://drafts.csswg.org/web-animations/)

## Browser Compatibility

The Web Animations API is well-supported in all modern browsers. Check [MDN compatibility tables](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API#browser_compatibility) for specific features.

## Polyfill

For older browser support: [web-animations-js](https://github.com/web-animations/web-animations-js)
