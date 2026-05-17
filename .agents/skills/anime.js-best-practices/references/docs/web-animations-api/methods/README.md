# Web Animations API - Methods Reference

This document consolidates MDN documentation for key Web Animations API methods and events.

**Sources:**
- [MDN Element.animate()](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)
- [MDN Element.getAnimations()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations)
- [MDN Document.getAnimations()](https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations)
- [MDN AnimationEvent](https://developer.mozilla.org/en-US/docs/Web/API/AnimationEvent)
- [MDN AnimationPlaybackEvent](https://developer.mozilla.org/en-US/docs/Web/API/AnimationPlaybackEvent)

---

## Table of Contents

1. [Element.animate()](#elementanimate)
2. [Element.getAnimations()](#elementgetanimations)
3. [Document.getAnimations()](#documentgetanimations)
4. [AnimationEvent Interface](#animationevent-interface)
5. [AnimationPlaybackEvent Interface](#animationplaybackevent-interface)

---

## Element.animate()

The `Element.animate()` method is a shortcut for creating, applying, and playing an animation on an element. It returns the created `Animation` object instance.

**Status:** Baseline Widely available (since March 2020)

### Syntax

```javascript
animate(keyframes, options)
```

### Parameters

#### `keyframes`

**Type:** `Array` of keyframe objects OR `Object` with array values

Either:
- An array of keyframe objects defining the animation states
- A keyframe object whose properties are arrays of values to iterate over

**Array Format Example:**
```javascript
[
  { transform: "rotate(0) scale(1)", opacity: 1 },
  { transform: "rotate(360deg) scale(0)", opacity: 0 }
]
```

**Object Format Example:**
```javascript
{
  transform: ["rotate(0)", "rotate(360deg)"],
  opacity: [1, 0]
}
```

#### `options`

**Type:** `Integer` (milliseconds) OR `Object`

Can be:
- **Integer**: Animation duration in milliseconds
- **Object**: Timing properties and animation-specific options

### Options Object Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `String` | `undefined` | Unique identifier to reference the animation |
| `duration` | `Number` | `0` | Animation duration in milliseconds |
| `iterations` | `Number` | `1` | Number of times to repeat (can be `Infinity`) |
| `fill` | `String` | `"none"` | How to apply styles before/after animation |
| `direction` | `String` | `"normal"` | Animation direction |
| `easing` | `String` | `"linear"` | Timing function |
| `delay` | `Number` | `0` | Delay before animation starts (ms) |
| `endDelay` | `Number` | `0` | Delay after animation ends (ms) |
| `timeline` | `AnimationTimeline` | `Document.timeline` | Associated timeline |
| `rangeStart` | `String` \| `Object` \| `CSSNumericValue` | — | Animation attachment range start (scroll-driven) |
| `rangeEnd` | `String` \| `Object` \| `CSSNumericValue` | — | Animation attachment range end (scroll-driven) |

#### `fill` Values

| Value | Description |
|-------|-------------|
| `"none"` | No styles applied before or after animation |
| `"forwards"` | Retains styles from the last keyframe after animation ends |
| `"backwards"` | Applies styles from the first keyframe during delay period |
| `"both"` | Combines `forwards` and `backwards` behavior |

#### `direction` Values

| Value | Description |
|-------|-------------|
| `"normal"` | Plays forward each iteration |
| `"reverse"` | Plays backward each iteration |
| `"alternate"` | Alternates between forward and backward |
| `"alternate-reverse"` | Alternates, starting backward |

#### `easing` Values

| Value | Description |
|-------|-------------|
| `"linear"` | Constant speed |
| `"ease"` | Slow start, fast middle, slow end |
| `"ease-in"` | Slow start |
| `"ease-out"` | Slow end |
| `"ease-in-out"` | Slow start and end |
| `"cubic-bezier(x1, y1, x2, y2)"` | Custom cubic bezier curve |
| `"steps(n, direction)"` | Step-based easing |

### Return Value

**Type:** `Animation` object instance

The returned `Animation` object can be used to control playback:
- `animation.play()` - Start or resume playback
- `animation.pause()` - Pause playback
- `animation.cancel()` - Cancel and remove the animation
- `animation.finish()` - Jump to end state
- `animation.reverse()` - Reverse playback direction
- `animation.finished` - Promise that resolves when animation completes

### Code Examples

#### Basic Example: Rotating and Scaling

```html
<div class="newspaper">Spinning newspaper<br />causes dizziness</div>
```

```css
html, body {
  height: 100%;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
}

.newspaper {
  padding: 0.5rem;
  text-transform: uppercase;
  text-align: center;
  background-color: white;
  cursor: pointer;
}
```

```javascript
const newspaperSpinning = [
  { transform: "rotate(0) scale(1)" },
  { transform: "rotate(360deg) scale(0)" },
];

const newspaperTiming = {
  duration: 2000,
  iterations: 1,
};

const newspaper = document.querySelector(".newspaper");

newspaper.addEventListener("click", () => {
  newspaper.animate(newspaperSpinning, newspaperTiming);
});
```

#### Infinite Animation (Tunnel Effect)

```javascript
document.getElementById("tunnel").animate(
  [
    { transform: "translateY(0px)" },
    { transform: "translateY(-300px)" },
  ],
  {
    duration: 1000,
    iterations: Infinity,
  }
);
```

#### Implicit From/To Keyframes

The browser can infer start/end states from current computed styles:

```javascript
const logo = document.getElementById("logo");

// Use current state as start (implicit from)
document.getElementById("run").addEventListener("click", () => {
  logo.animate({ transform: "translateX(300px)" }, 1000);
});

// Use current state as end (implicit to)
document.getElementById("run2").addEventListener("click", () => {
  logo.animate({ transform: "translateX(300px)", offset: 0 }, 1000);
});

// Use current state as middle point
document.getElementById("run3").addEventListener("click", () => {
  logo.animate({ transform: "translateX(300px)", offset: 0.5 }, 1000);
});
```

#### Scroll-Driven Animation with Timeline

```javascript
const img = document.querySelector("img");

const timeline = new ViewTimeline({
  subject: img,
  axis: "block",
});

img.animate(
  {
    opacity: [0, 1],
    transform: ["scaleX(0)", "scaleX(1)"],
  },
  {
    fill: "both",
    duration: 1,
    timeline,
    rangeStart: "cover 0%",
    rangeEnd: "cover 100%",
  }
);
```

#### Controlling Animation Playback

```javascript
const element = document.querySelector(".box");

const animation = element.animate(
  [
    { transform: "translateX(0)" },
    { transform: "translateX(500px)" }
  ],
  {
    duration: 2000,
    fill: "forwards"
  }
);

// Control methods
document.getElementById("pause").onclick = () => animation.pause();
document.getElementById("play").onclick = () => animation.play();
document.getElementById("reverse").onclick = () => animation.reverse();
document.getElementById("cancel").onclick = () => animation.cancel();

// Wait for animation to finish
animation.finished.then(() => {
  console.log("Animation completed!");
});
```

---

## Element.getAnimations()

The `getAnimations()` method of the `Element` interface returns an array of all `Animation` objects affecting the element or scheduled to affect it in the future.

**Status:** Baseline Widely available (since July 2020)

**Note:** This includes CSS Animations, CSS Transitions, and Web Animations.

### Syntax

```javascript
getAnimations()
getAnimations(options)
```

### Parameters

#### `options` (Optional)

An options object with the following property:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `subtree` | `Boolean` | `false` | If `true`, returns animations targeting descendant elements and pseudo-elements |

### Return Value

**Type:** `Array` of `Animation` objects

An array containing all `Animation` objects currently targeting the element, or its descendants if `{ subtree: true }` is specified.

### Code Examples

#### Wait for All Animations to Finish Before Removing Element

```javascript
Promise.all(
  elem.getAnimations({ subtree: true }).map((animation) => animation.finished),
).then(() => elem.remove());
```

#### Pause All Animations on an Element

```javascript
const element = document.querySelector(".animated-box");

element.getAnimations().forEach((animation) => {
  animation.pause();
});
```

#### Get Animation by ID

```javascript
const element = document.querySelector(".box");

// Create animation with ID
element.animate(
  [{ opacity: 1 }, { opacity: 0 }],
  { duration: 1000, id: "fade-out" }
);

// Find specific animation
const fadeAnimation = element.getAnimations()
  .find((anim) => anim.id === "fade-out");
```

#### Check If Element Has Running Animations

```javascript
function hasRunningAnimations(element) {
  return element.getAnimations().some(
    (animation) => animation.playState === "running"
  );
}
```

### Browser Compatibility

Supported in all modern browsers:
- Chrome 84+
- Firefox 75+
- Safari 13.1+
- Edge 84+

---

## Document.getAnimations()

The `getAnimations()` method of the `Document` interface returns an array of all `Animation` objects currently in effect whose target elements are descendants of the document.

**Status:** Baseline Widely available (since September 2020)

### Syntax

```javascript
document.getAnimations()
```

### Parameters

**None**

### Return Value

**Type:** `Array` of `Animation` objects

An array containing all `Animation` objects currently associated with elements which are descendants of the `Document`.

**Animation Types Included:**
- CSS Animations
- CSS Transitions
- Web Animations API

### Code Examples

#### Slow Down All Page Animations

```javascript
document.getAnimations().forEach((animation) => {
  animation.playbackRate *= 0.5;
});
```

#### Pause All Animations on the Page

```javascript
document.getAnimations().forEach((animation) => {
  animation.pause();
});
```

#### Resume All Paused Animations

```javascript
document.getAnimations().forEach((animation) => {
  if (animation.playState === "paused") {
    animation.play();
  }
});
```

#### Count All Running Animations

```javascript
const runningCount = document.getAnimations()
  .filter((animation) => animation.playState === "running")
  .length;

console.log(`Running animations: ${runningCount}`);
```

#### Cancel All Animations

```javascript
document.getAnimations().forEach((animation) => {
  animation.cancel();
});
```

#### Debug: Log All Animation Details

```javascript
document.getAnimations().forEach((animation, index) => {
  console.log(`Animation ${index}:`, {
    id: animation.id,
    playState: animation.playState,
    currentTime: animation.currentTime,
    playbackRate: animation.playbackRate,
    effect: animation.effect,
  });
});
```

### Browser Compatibility

Supported in all modern browsers since September 2020.

---

## AnimationEvent Interface

The `AnimationEvent` interface represents events providing information related to CSS animations.

**Status:** Baseline Widely available (since September 2015)

**Inheritance Chain:** `AnimationEvent` extends `Event`

### Constructor

```javascript
new AnimationEvent(type, options)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `String` | The type of animation event |
| `options` | `Object` | Optional event initialization options |

#### `options` Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `animationName` | `String` | The name of the CSS animation |
| `elapsedTime` | `Number` | Time elapsed in seconds |
| `pseudoElement` | `String` | The pseudo-element name (e.g., `"::before"`) |

### Instance Properties

All properties are **read-only**.

| Property | Type | Description |
|----------|------|-------------|
| `animationName` | `String` | The value of the `animation-name` CSS property |
| `elapsedTime` | `Number` | Time the animation has been running (in seconds) |
| `pseudoElement` | `String` | Pseudo-element name or empty string |

#### `elapsedTime` Special Cases

- For `animationstart` event: `elapsedTime` is `0.0`
- If `animation-delay` is negative, `elapsedTime` contains `(-1 * delay)`

#### `pseudoElement` Values

| Value | Meaning |
|-------|---------|
| `""` | Animation runs on the element itself |
| `"::before"` | Animation runs on `::before` pseudo-element |
| `"::after"` | Animation runs on `::after` pseudo-element |

### Event Types

| Event Type | When Fired |
|------------|------------|
| `animationstart` | When an animation starts |
| `animationend` | When an animation completes |
| `animationiteration` | When an animation iteration completes |
| `animationcancel` | When an animation is cancelled |

### Code Examples

#### Listening to CSS Animation Events

```javascript
const element = document.querySelector(".animated-element");

element.addEventListener("animationstart", (event) => {
  console.log(`Animation started: ${event.animationName}`);
  console.log(`Elapsed time: ${event.elapsedTime}s`);
});

element.addEventListener("animationend", (event) => {
  console.log(`Animation ended: ${event.animationName}`);
  console.log(`Total time: ${event.elapsedTime}s`);
});

element.addEventListener("animationiteration", (event) => {
  console.log(`Animation iteration: ${event.animationName}`);
});

element.addEventListener("animationcancel", (event) => {
  console.log(`Animation cancelled: ${event.animationName}`);
});
```

#### Creating a Custom AnimationEvent

```javascript
const customEvent = new AnimationEvent("animationend", {
  animationName: "slideIn",
  elapsedTime: 2.5,
  pseudoElement: "",
});

element.dispatchEvent(customEvent);
```

#### Detecting Pseudo-Element Animations

```javascript
element.addEventListener("animationend", (event) => {
  if (event.pseudoElement === "::before") {
    console.log("Before pseudo-element animation ended");
  } else if (event.pseudoElement === "::after") {
    console.log("After pseudo-element animation ended");
  } else {
    console.log("Element animation ended");
  }
});
```

#### Tracking Animation Progress

```javascript
let iterationCount = 0;

element.addEventListener("animationiteration", (event) => {
  iterationCount++;
  console.log(`Iteration ${iterationCount} of ${event.animationName}`);
});

element.addEventListener("animationend", () => {
  console.log(`Animation completed after ${iterationCount} iterations`);
});
```

### Related CSS Properties

| Property | Description |
|----------|-------------|
| `animation` | Shorthand for all animation properties |
| `animation-name` | Name of the `@keyframes` animation |
| `animation-duration` | Animation length |
| `animation-delay` | Delay before animation starts |
| `animation-direction` | Play direction |
| `animation-iteration-count` | Number of repetitions |
| `animation-fill-mode` | Styles before/after animation |
| `animation-play-state` | Running or paused state |
| `animation-timing-function` | Easing function |

### Browser Compatibility

Widely available since September 2015 across all modern browsers.

---

## AnimationPlaybackEvent Interface

The `AnimationPlaybackEvent` interface represents events related to Web Animations API playback state changes.

**Status:** Baseline Widely available (since July 2020)

**Inheritance Chain:** `AnimationPlaybackEvent` extends `Event`

### Constructor

```javascript
new AnimationPlaybackEvent(type, eventInitDict)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `String` | The type of playback event |
| `eventInitDict` | `Object` | Optional event initialization dictionary |

### Instance Properties

All properties are **read-only**.

| Property | Type | Description |
|----------|------|-------------|
| `currentTime` | `Number` | The current time of the animation when the event fired |
| `timelineTime` | `Number` | The time value of the animation's timeline when the event fired |

### Event Types

| Event Type | When Fired |
|------------|------------|
| `finish` | When the animation finishes playing |
| `cancel` | When the animation is cancelled |
| `remove` | When the animation is removed |

### Code Examples

#### Listening to Animation Playback Events

```javascript
const element = document.querySelector(".box");

const animation = element.animate(
  [
    { transform: "translateX(0)" },
    { transform: "translateX(300px)" }
  ],
  { duration: 2000, fill: "forwards" }
);

animation.addEventListener("finish", (event) => {
  console.log("Animation finished!");
  console.log(`Current time: ${event.currentTime}ms`);
  console.log(`Timeline time: ${event.timelineTime}ms`);
});

animation.addEventListener("cancel", (event) => {
  console.log("Animation was cancelled");
  console.log(`Cancelled at: ${event.currentTime}ms`);
});

animation.addEventListener("remove", (event) => {
  console.log("Animation was removed");
});
```

#### Using the `finished` Promise vs Event

```javascript
const animation = element.animate(keyframes, options);

// Promise-based approach
animation.finished.then(() => {
  console.log("Animation completed (promise)");
}).catch((error) => {
  console.log("Animation was cancelled");
});

// Event-based approach
animation.addEventListener("finish", () => {
  console.log("Animation completed (event)");
});
```

#### Chaining Animations with Finish Event

```javascript
const box = document.querySelector(".box");

function runSequentialAnimations() {
  const firstAnimation = box.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 1000 }
  );

  firstAnimation.addEventListener("finish", () => {
    const secondAnimation = box.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.5)" }],
      { duration: 500 }
    );

    secondAnimation.addEventListener("finish", () => {
      console.log("All animations complete!");
    });
  });
}
```

#### Tracking Animation Cancellation

```javascript
const animation = element.animate(keyframes, { duration: 5000 });

animation.addEventListener("cancel", (event) => {
  const progressPercent = (event.currentTime / 5000) * 100;
  console.log(`Animation cancelled at ${progressPercent.toFixed(1)}% progress`);
});

// Cancel after 2 seconds
setTimeout(() => {
  animation.cancel();
}, 2000);
```

### Browser Compatibility

Widely supported across all modern browsers since July 2020:
- Chrome 84+
- Firefox 75+
- Safari 13.1+
- Edge 84+

---

## Comparison: AnimationEvent vs AnimationPlaybackEvent

| Feature | AnimationEvent | AnimationPlaybackEvent |
|---------|----------------|------------------------|
| **API** | CSS Animations | Web Animations API |
| **Triggered by** | CSS `@keyframes` animations | `Element.animate()` and related |
| **Event target** | DOM Element | `Animation` object |
| **Properties** | `animationName`, `elapsedTime`, `pseudoElement` | `currentTime`, `timelineTime` |
| **Events** | `animationstart`, `animationend`, `animationiteration`, `animationcancel` | `finish`, `cancel`, `remove` |

---

## Specifications

- [Web Animations - DOM Animatable animate()](https://drafts.csswg.org/web-animations-1/#dom-animatable-animate)
- [Web Animations - DOM Animatable getAnimations](https://drafts.csswg.org/web-animations-1/#dom-animatable-getanimations)
- [Web Animations - Document getAnimations](https://drafts.csswg.org/web-animations-1/#dom-documentorshadowroot-getanimations)
- [Web Animations - AnimationPlaybackEvent Interface](https://drafts.csswg.org/web-animations-1/#the-animationplaybackevent-interface)
- [CSS Animations - AnimationEvent](https://drafts.csswg.org/css-animations-1/#interface-animationevent)

---

## See Also

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Using the Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)
- [Keyframe Formats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)
- [Animation Interface](https://developer.mozilla.org/en-US/docs/Web/API/Animation)
- [KeyframeEffect](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations)
- [CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions)
