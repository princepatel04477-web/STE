# Web Animations API - Core Interfaces

> **Source**: MDN Web Docs
> **Baseline**: Widely available since March 2020
> **Last Updated**: January 2026

This document consolidates the three core interfaces of the Web Animations API: `Animation`, `AnimationEffect`, and `KeyframeEffect`.

---

## Table of Contents

1. [Animation Interface](#animation-interface)
   - [Constructor](#animation-constructor)
   - [Instance Properties](#animation-instance-properties)
   - [Instance Methods](#animation-instance-methods)
   - [Events](#animation-events)
   - [Accessibility Concerns](#accessibility-concerns)
2. [AnimationEffect Interface](#animationeffect-interface)
   - [Overview](#animationeffect-overview)
   - [Instance Methods](#animationeffect-instance-methods)
3. [KeyframeEffect Interface](#keyframeeffect-interface)
   - [Constructor](#keyframeeffect-constructor)
   - [Instance Properties](#keyframeeffect-instance-properties)
   - [Instance Methods](#keyframeeffect-instance-methods)
   - [Code Examples](#keyframeeffect-code-examples)
4. [Browser Compatibility](#browser-compatibility)
5. [Related APIs](#related-apis)

---

## Animation Interface

The `Animation` interface from the Web Animations API represents a single animation player and provides playback controls and a timeline for an animation node or source.

**Inheritance**: `EventTarget` -> `Animation`

### Animation Constructor

Creates a new `Animation` object instance.

```javascript
new Animation()
new Animation(effect)
new Animation(effect, timeline)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `effect` | `AnimationEffect` | No | The target effect, as an object based on the `AnimationEffect` interface, to assign to the animation. Although in the future other effects such as `SequenceEffect`s or `GroupEffect`s might be possible, the only kind of effect currently available is `KeyframeEffect`. This can be `null` (which is the default) to indicate that there should be no effect applied. |
| `timeline` | `AnimationTimeline` | No | Specifies the timeline with which to associate the animation, as an object of a type based on the `AnimationTimeline` interface. Currently the only timeline type available is `DocumentTimeline`, but in the future there may be timelines associated with gestures or scrolling. The default value is `Document.timeline`, but this can be set to `null` as well. |

#### Example

```javascript
// Create a KeyframeEffect
const effect = new KeyframeEffect(
  document.getElementById('myElement'),
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

### Animation Instance Properties

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| `currentTime` | `number \| null` | Read/Write | The current time value of the animation in milliseconds, whether running or paused. Returns `null` if the animation lacks a timeline, is inactive, or hasn't been played yet. Setting this value seeks the animation to the new time. |
| `effect` | `AnimationEffect \| null` | Read/Write | Gets or sets the `AnimationEffect` associated with this animation. This will usually be a `KeyframeEffect` object. |
| `finished` | `Promise<Animation>` | Read-only | Returns the current finished Promise for this animation. The promise resolves when the animation finishes playing. |
| `id` | `string` | Read/Write | Gets or sets the string used to identify the animation. Useful for debugging or finding specific animations. |
| `overallProgress` | `number \| null` | Read-only | Returns a number between `0` and `1` indicating the overall progress toward the finished state, taking into account the current iteration. Returns `null` if the animation is in the `idle` state. |
| `pending` | `boolean` | Read-only | Indicates whether the animation is currently waiting for an asynchronous operation such as initiating playback or pausing a running animation. |
| `playState` | `string` | Read-only | Returns an enumerated value describing the playback state of an animation. Possible values: `idle`, `running`, `paused`, `finished`. |
| `playbackRate` | `number` | Read/Write | Gets or sets the playback rate of the animation. `1.0` is normal speed, `2.0` is double speed, `-1.0` plays in reverse, `0` effectively pauses the animation. |
| `ready` | `Promise<Animation>` | Read-only | Returns the current ready Promise for this animation. The promise resolves when the animation is ready to be played. |
| `replaceState` | `string` | Read-only | Indicates whether the animation is active, has been automatically removed after being replaced by another animation, or has been explicitly persisted. Values: `active`, `removed`, `persisted`. |
| `startTime` | `number \| null` | Read/Write | Gets or sets the scheduled time when an animation's playback should begin. This is the time value of the animation's timeline when its target `KeyframeEffect` is scheduled to begin playback. |
| `timeline` | `AnimationTimeline \| null` | Read/Write | Gets or sets the `AnimationTimeline` associated with this animation. A timeline is a source of time values for synchronization purposes. |

#### Property Examples

```javascript
const animation = element.animate(
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 2000 }
);

// Reading properties
console.log(animation.playState);     // "running"
console.log(animation.currentTime);   // e.g., 500 (ms)
console.log(animation.playbackRate);  // 1

// Setting properties
animation.id = 'fadeInAnimation';
animation.currentTime = 1000;  // Seek to 1 second
animation.playbackRate = 2;    // Double speed

// Using promises
animation.ready.then(() => {
  console.log('Animation is ready to play');
});

animation.finished.then(() => {
  console.log('Animation has finished');
});
```

---

### Animation Instance Methods

#### `cancel()`

Clears all `KeyframeEffect`s caused by this animation and aborts its playback. The animation's `playState` becomes `idle`.

```javascript
animation.cancel()
```

**Returns**: `undefined`

**Example**:
```javascript
const animation = element.animate(keyframes, options);

// Cancel the animation after 500ms
setTimeout(() => {
  animation.cancel();
  console.log(animation.playState); // "idle"
}, 500);
```

---

#### `commitStyles()`

Commits the end styling state of an animation to the element being animated, even after that animation has been removed. It will cause the end styling state to be written to the element being animated, in the form of properties inside a `style` attribute.

```javascript
animation.commitStyles()
```

**Returns**: `undefined`

**Example**:
```javascript
const animation = element.animate(
  [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
  { duration: 1000, fill: 'forwards' }
);

animation.finished.then(() => {
  // Commit the final styles so the element stays at translateX(100px)
  // even if the animation is removed
  animation.commitStyles();
  animation.cancel();
});
```

---

#### `finish()`

Seeks either end of an animation, depending on whether the animation is playing or reversing. If the animation is playing forward, it seeks to the end. If playing in reverse, it seeks to the beginning.

```javascript
animation.finish()
```

**Returns**: `undefined`

**Throws**: `InvalidStateError` if the animation's playback rate is `0` or if the animation is playing forward and has an infinite duration.

**Example**:
```javascript
const animation = element.animate(keyframes, { duration: 5000 });

// Skip to the end immediately
animation.finish();
console.log(animation.playState); // "finished"
```

---

#### `pause()`

Suspends playback of the animation.

```javascript
animation.pause()
```

**Returns**: `undefined`

**Example**:
```javascript
const animation = element.animate(keyframes, { duration: 2000 });

// Pause after 500ms
setTimeout(() => {
  animation.pause();
  console.log(animation.playState); // "paused"
}, 500);

// Resume later
setTimeout(() => {
  animation.play();
}, 1500);
```

---

#### `persist()`

Explicitly persists an animation, preventing it from being automatically removed when it is replaced by another animation.

```javascript
animation.persist()
```

**Returns**: `undefined`

**Example**:
```javascript
const animation1 = element.animate(
  [{ opacity: 1 }, { opacity: 0.5 }],
  { duration: 1000, fill: 'forwards' }
);

// Persist the animation so it won't be removed when replaced
animation1.persist();

// This would normally replace animation1, but it's persisted
const animation2 = element.animate(
  [{ opacity: 0.5 }, { opacity: 1 }],
  { duration: 1000, fill: 'forwards' }
);

console.log(animation1.replaceState); // "persisted"
```

---

#### `play()`

Starts or resumes playing of an animation, or begins the animation again if it previously finished.

```javascript
animation.play()
```

**Returns**: `undefined`

**Example**:
```javascript
const animation = element.animate(keyframes, options);
animation.pause();

// Resume playback
playButton.addEventListener('click', () => {
  animation.play();
});
```

---

#### `reverse()`

Reverses the playback direction, meaning the animation ends at its beginning. If called on an unplayed animation, the whole animation is played backwards. If called on a paused animation, the animation will continue in reverse.

```javascript
animation.reverse()
```

**Returns**: `undefined`

**Example**:
```javascript
const animation = element.animate(
  [{ transform: 'scale(1)' }, { transform: 'scale(2)' }],
  { duration: 1000 }
);

// Reverse direction on click
element.addEventListener('click', () => {
  animation.reverse();
});
```

---

#### `updatePlaybackRate()`

Sets the speed of an animation after first synchronizing its playback position. This method is useful for synchronizing animations with external events.

```javascript
animation.updatePlaybackRate(playbackRate)
```

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `playbackRate` | `number` | The new playback rate to set. Positive values play forward, negative values play in reverse, and `0` effectively pauses the animation. |

**Returns**: `undefined`

**Example**:
```javascript
const animation = element.animate(keyframes, { duration: 2000 });

// Smoothly accelerate the animation
animation.ready.then(() => {
  animation.updatePlaybackRate(2); // Double speed
});

// Slow down based on user interaction
slider.addEventListener('input', (e) => {
  animation.updatePlaybackRate(parseFloat(e.target.value));
});
```

---

### Animation Events

The `Animation` interface inherits events from `EventTarget` and adds the following animation-specific events:

| Event | Description | Cancelable |
|-------|-------------|------------|
| `cancel` | Fired when the `Animation.cancel()` method is called or when the animation enters the `"idle"` play state from another state. | No |
| `finish` | Fired when the animation finishes playing, either by completing naturally or by calling `finish()`. | No |
| `remove` | Fired when the animation is automatically removed by the browser (when replaced by another animation). | No |

#### Event Examples

```javascript
const animation = element.animate(keyframes, { duration: 2000 });

// Using event listeners
animation.addEventListener('finish', () => {
  console.log('Animation finished!');
  element.classList.add('animation-complete');
});

animation.addEventListener('cancel', () => {
  console.log('Animation was cancelled');
});

animation.addEventListener('remove', () => {
  console.log('Animation was automatically removed');
});

// Using event handler properties
animation.onfinish = (event) => {
  console.log('Finished via handler property');
};

animation.oncancel = (event) => {
  console.log('Cancelled via handler property');
};

animation.onremove = (event) => {
  console.log('Removed via handler property');
};
```

---

### Accessibility Concerns

When implementing animations, consider the following accessibility guidelines:

#### Motion Sensitivity

- **Blinking and flashing animations** can cause problems for people with cognitive concerns such as ADHD
- **Motion** can trigger vestibular disorders, epilepsy, migraines, and scotopic sensitivity

#### Best Practices

1. **Provide pause/stop controls**: Allow users to pause or disable animations
2. **Respect user preferences**: Check for reduced motion preferences

```javascript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Disable or simplify animations
  animation.cancel();
  // Or use instant transitions
  animation.finish();
}

// Listen for preference changes
window.matchMedia('(prefers-reduced-motion: reduce)')
  .addEventListener('change', (e) => {
    if (e.matches) {
      // User now prefers reduced motion
      animation.pause();
    } else {
      // User no longer prefers reduced motion
      animation.play();
    }
  });
```

3. **Use the Sec-CH-Prefers-Reduced-Motion header**: This user agent client hint can be used to serve appropriate content server-side

---

## AnimationEffect Interface

The `AnimationEffect` interface is the abstract base interface for animation effects. It cannot be instantiated directly; instead, use concrete implementations like `KeyframeEffect`.

### AnimationEffect Overview

`AnimationEffect` serves as the foundation for all animation effects in the Web Animations API. Concrete implementations can be:
- Passed to `Animation` objects for playback using the `Animation()` constructor
- Assigned to the `Animation.effect` property
- Created automatically by CSS Animations and Transitions

**Inheritance**: `AnimationEffect` (abstract base class)
**Concrete implementations**: `KeyframeEffect`

---

### AnimationEffect Instance Methods

#### `getTiming()`

Returns the timing properties for the animation effect as an `EffectTiming` object.

```javascript
animationEffect.getTiming()
```

**Returns**: `EffectTiming` object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `delay` | `number` | The delay before the animation starts, in milliseconds. Default: `0` |
| `direction` | `string` | Direction of playback: `'normal'`, `'reverse'`, `'alternate'`, `'alternate-reverse'`. Default: `'normal'` |
| `duration` | `number \| string` | Duration of a single iteration in milliseconds, or `'auto'`. Default: `'auto'` |
| `easing` | `string` | The easing function: `'linear'`, `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'`, or a `cubic-bezier()` function. Default: `'linear'` |
| `endDelay` | `number` | The delay after the animation ends, in milliseconds. Default: `0` |
| `fill` | `string` | Fill mode: `'none'`, `'forwards'`, `'backwards'`, `'both'`, `'auto'`. Default: `'auto'` |
| `iterations` | `number` | Number of times to repeat. Use `Infinity` for endless. Default: `1` |
| `iterationStart` | `number` | The iteration offset at which to start. Default: `0` |

**Example**:
```javascript
const effect = new KeyframeEffect(
  element,
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 1000, easing: 'ease-in-out', iterations: 3 }
);

const timing = effect.getTiming();
console.log(timing.duration);    // 1000
console.log(timing.easing);      // "ease-in-out"
console.log(timing.iterations);  // 3
```

---

#### `getComputedTiming()`

Returns the calculated, current timing values for the animation effect as a `ComputedEffectTiming` object.

```javascript
animationEffect.getComputedTiming()
```

**Returns**: `ComputedEffectTiming` object extending `EffectTiming` with additional computed properties:

| Property | Type | Description |
|----------|------|-------------|
| `endTime` | `number` | The end time of the effect in milliseconds. |
| `activeDuration` | `number` | The total active duration (duration × iterations). |
| `localTime` | `number \| null` | The current time within the effect. |
| `progress` | `number \| null` | The current progress through the current iteration (0 to 1). |
| `currentIteration` | `number \| null` | The current iteration number (0-indexed). |

**Example**:
```javascript
const effect = new KeyframeEffect(
  element,
  [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
  { duration: 2000, iterations: 3 }
);

const animation = new Animation(effect, document.timeline);
animation.play();

// Check computed timing during playback
setTimeout(() => {
  const computed = effect.getComputedTiming();
  console.log(computed.activeDuration);    // 6000 (2000 × 3)
  console.log(computed.currentIteration);  // e.g., 0, 1, or 2
  console.log(computed.progress);          // e.g., 0.5 (halfway through current iteration)
}, 1000);
```

---

#### `updateTiming()`

Updates the specified timing properties of the animation effect.

```javascript
animationEffect.updateTiming(timing)
```

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `timing` | `OptionalEffectTiming` | An object containing the timing properties to update. Only specified properties will be changed. |

**Returns**: `undefined`

**Example**:
```javascript
const effect = new KeyframeEffect(
  element,
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 1000 }
);

const animation = new Animation(effect, document.timeline);
animation.play();

// Update timing during playback
effect.updateTiming({
  duration: 2000,        // Slow down
  easing: 'ease-out',    // Change easing
  iterations: 5          // More iterations
});

// Update a single property
effect.updateTiming({ delay: 500 });
```

---

## KeyframeEffect Interface

The `KeyframeEffect` interface represents a set of animatable properties and values called **keyframes** that can be played using the `Animation()` constructor.

**Inheritance**: `AnimationEffect` -> `KeyframeEffect`

---

### KeyframeEffect Constructor

Creates a new `KeyframeEffect` object instance. Can also be used to clone an existing `KeyframeEffect`.

#### Syntax

```javascript
// Create new KeyframeEffect
new KeyframeEffect(target, keyframes)
new KeyframeEffect(target, keyframes, options)

// Clone existing KeyframeEffect
new KeyframeEffect(sourceKeyframeEffect)
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | `Element \| null` | Yes | The DOM element to be animated, or `null` for animations not tied to a specific element. |
| `keyframes` | `object \| object[]` | Yes | A keyframes object or array of keyframe objects. See Keyframe Formats below. |
| `options` | `number \| KeyframeEffectOptions` | No | Either an integer representing the animation's duration (in milliseconds), or an object containing timing and effect options. |

#### Options Object Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `delay` | `number` | `0` | Delay before animation starts (ms). |
| `direction` | `string` | `'normal'` | `'normal'`, `'reverse'`, `'alternate'`, `'alternate-reverse'` |
| `duration` | `number \| 'auto'` | `'auto'` | Duration of one iteration (ms). |
| `easing` | `string` | `'linear'` | Easing function for the overall animation. |
| `endDelay` | `number` | `0` | Delay after animation ends (ms). |
| `fill` | `string` | `'auto'` | `'none'`, `'forwards'`, `'backwards'`, `'both'`, `'auto'` |
| `iterations` | `number` | `1` | Number of times to repeat. Use `Infinity` for endless. |
| `iterationStart` | `number` | `0` | Point in the iteration to start at (0-1). |
| `composite` | `string` | `'replace'` | `'replace'`, `'add'`, `'accumulate'` |
| `iterationComposite` | `string` | `'replace'` | `'replace'`, `'accumulate'` |
| `pseudoElement` | `string \| null` | `null` | Pseudo-element selector (e.g., `'::before'`). |

#### Keyframe Formats

**Array Format** (recommended for multiple keyframes):
```javascript
const keyframes = [
  { opacity: 0, transform: 'scale(0.5)', offset: 0 },
  { opacity: 0.5, transform: 'scale(0.8)', offset: 0.3 },
  { opacity: 1, transform: 'scale(1)', offset: 1 }
];
```

**Object Format** (property-indexed):
```javascript
const keyframes = {
  opacity: [0, 0.5, 1],
  transform: ['scale(0.5)', 'scale(0.8)', 'scale(1)'],
  offset: [0, 0.3, 1],
  easing: ['ease-in', 'ease-out']
};
```

#### Constructor Examples

```javascript
// Basic keyframe effect
const fadeEffect = new KeyframeEffect(
  document.getElementById('box'),
  [
    { opacity: 0 },
    { opacity: 1 }
  ],
  { duration: 1000 }
);

// With full options
const slideEffect = new KeyframeEffect(
  document.getElementById('slider'),
  [
    { transform: 'translateX(0)', easing: 'ease-out' },
    { transform: 'translateX(300px)' }
  ],
  {
    duration: 2000,
    delay: 500,
    direction: 'alternate',
    iterations: Infinity,
    fill: 'both',
    easing: 'ease-in-out'
  }
);

// Clone an existing effect
const clonedEffect = new KeyframeEffect(slideEffect);

// Animate a pseudo-element
const pseudoEffect = new KeyframeEffect(
  document.querySelector('.tooltip'),
  [
    { opacity: 0, transform: 'translateY(-10px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  {
    duration: 300,
    pseudoElement: '::after'
  }
);

// Null target for non-element animations
const abstractEffect = new KeyframeEffect(
  null,
  [{ '--custom-prop': '0' }, { '--custom-prop': '100' }],
  { duration: 1000 }
);
```

---

### KeyframeEffect Instance Properties

| Property | Type | Access | Description |
|----------|------|--------|-------------|
| `target` | `Element \| null` | Read/Write | Gets or sets the element, or originating element of the pseudo-element, being animated. May be `null` for animations not associated with an element. |
| `pseudoElement` | `string \| null` | Read/Write | Gets or sets the selector of the pseudo-element being animated (e.g., `'::before'`, `'::after'`). Returns `null` if animating the element itself. |
| `composite` | `string` | Read/Write | Gets or sets the composite operation used for combining property values. Values: `'replace'` (default), `'add'`, `'accumulate'`. |
| `iterationComposite` | `string` | Read/Write | Gets or sets how values build from iteration to iteration. Values: `'replace'` (default), `'accumulate'`. |

#### Property Examples

```javascript
const effect = new KeyframeEffect(
  document.getElementById('box'),
  [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
  { duration: 1000, iterations: 3 }
);

// Read properties
console.log(effect.target);              // <div id="box">...</div>
console.log(effect.pseudoElement);       // null
console.log(effect.composite);           // "replace"
console.log(effect.iterationComposite);  // "replace"

// Change target
effect.target = document.getElementById('otherBox');

// Animate pseudo-element
effect.pseudoElement = '::before';

// Use additive composition
effect.composite = 'add';

// Accumulate across iterations
effect.iterationComposite = 'accumulate';
```

#### Composite Mode Examples

```javascript
// 'replace' - default, replaces underlying value
const replaceEffect = new KeyframeEffect(
  element,
  [{ transform: 'translateX(100px)' }],
  { duration: 1000, composite: 'replace' }
);

// 'add' - adds to underlying value
const addEffect = new KeyframeEffect(
  element,
  [{ transform: 'translateX(50px)' }],
  { duration: 1000, composite: 'add' }
);
// If element already has translateX(100px), result is translateX(150px)

// 'accumulate' - accumulates with underlying value
const accumulateEffect = new KeyframeEffect(
  element,
  [{ transform: 'scale(1.5)' }],
  { duration: 1000, composite: 'accumulate' }
);
```

---

### KeyframeEffect Instance Methods

#### `getKeyframes()`

Returns an array of computed keyframe objects making up this effect, with their computed offsets and resolved values.

```javascript
keyframeEffect.getKeyframes()
```

**Returns**: `object[]` - Array of computed keyframe objects. Each object includes:
- All animated CSS properties with their values
- `offset` - The computed offset (0-1) for this keyframe
- `computedOffset` - The offset after automatic distribution
- `easing` - The easing function for this keyframe
- `composite` - The composite operation for this keyframe

**Example**:
```javascript
const effect = new KeyframeEffect(
  element,
  [
    { opacity: 0, transform: 'scale(0.5)' },
    { opacity: 0.7, transform: 'scale(0.8)', offset: 0.3 },
    { opacity: 1, transform: 'scale(1)' }
  ],
  { duration: 1000, easing: 'ease-in-out' }
);

const keyframes = effect.getKeyframes();
console.log(keyframes);
/*
[
  {
    opacity: "0",
    transform: "scale(0.5)",
    offset: 0,
    computedOffset: 0,
    easing: "ease-in-out",
    composite: "auto"
  },
  {
    opacity: "0.7",
    transform: "scale(0.8)",
    offset: 0.3,
    computedOffset: 0.3,
    easing: "ease-in-out",
    composite: "auto"
  },
  {
    opacity: "1",
    transform: "scale(1)",
    offset: 1,
    computedOffset: 1,
    easing: "ease-in-out",
    composite: "auto"
  }
]
*/
```

---

#### `setKeyframes()`

Replaces the keyframes that make up this effect with a new set of keyframes.

```javascript
keyframeEffect.setKeyframes(keyframes)
```

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `keyframes` | `object \| object[] \| null` | A keyframes object, array of keyframe objects, or `null` to clear all keyframes. |

**Returns**: `undefined`

**Example**:
```javascript
const effect = new KeyframeEffect(
  element,
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 1000 }
);

const animation = new Animation(effect, document.timeline);
animation.play();

// Change keyframes during playback
effect.setKeyframes([
  { transform: 'translateX(0)', opacity: 0 },
  { transform: 'translateX(100px)', opacity: 1 }
]);

// Use object format
effect.setKeyframes({
  opacity: [0, 0.5, 1],
  transform: ['scale(0.8)', 'scale(1.1)', 'scale(1)']
});

// Clear all keyframes
effect.setKeyframes(null);
```

---

### KeyframeEffect Code Examples

#### Complete Animation Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .box {
      width: 100px;
      height: 100px;
      background: coral;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="box" id="animated-box"></div>
  <button id="play-btn">Play</button>
  <button id="pause-btn">Pause</button>
  <button id="reverse-btn">Reverse</button>

  <script>
    const box = document.getElementById('animated-box');

    // Create a KeyframeEffect
    const bounceEffect = new KeyframeEffect(
      box,
      [
        { transform: 'translateY(0) scale(1)', offset: 0 },
        { transform: 'translateY(-100px) scale(1.1)', offset: 0.5 },
        { transform: 'translateY(0) scale(1)', offset: 1 }
      ],
      {
        duration: 1000,
        iterations: Infinity,
        direction: 'normal',
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }
    );

    // Create Animation
    const animation = new Animation(bounceEffect, document.timeline);

    // Control buttons
    document.getElementById('play-btn').onclick = () => animation.play();
    document.getElementById('pause-btn').onclick = () => animation.pause();
    document.getElementById('reverse-btn').onclick = () => animation.reverse();

    // Event listeners
    animation.addEventListener('finish', () => {
      console.log('Animation finished');
    });

    // Start the animation
    animation.play();
  </script>
</body>
</html>
```

#### Emoji Rolling Animation

```html
<div id="emoji">🤣</div>

<script>
  const emoji = document.querySelector('#emoji');

  const rollingKeyframes = new KeyframeEffect(
    emoji,
    [
      { transform: 'translateX(0) rotate(0)' },
      { transform: 'translateX(200px) rotate(1.3turn)' }
    ],
    {
      duration: 2000,
      direction: 'alternate',
      easing: 'ease-in-out',
      iterations: Infinity
    }
  );

  const rollingAnimation = new Animation(rollingKeyframes, document.timeline);
  rollingAnimation.play();
</script>
```

#### Dynamic Keyframe Modification

```javascript
const element = document.getElementById('morphing-shape');

const morphEffect = new KeyframeEffect(
  element,
  [
    { borderRadius: '0%', backgroundColor: 'red' },
    { borderRadius: '50%', backgroundColor: 'blue' }
  ],
  { duration: 2000, fill: 'forwards' }
);

const animation = new Animation(morphEffect, document.timeline);
animation.play();

// Change keyframes on user interaction
element.addEventListener('click', () => {
  morphEffect.setKeyframes([
    { borderRadius: '50%', backgroundColor: 'blue', transform: 'scale(1)' },
    { borderRadius: '25%', backgroundColor: 'green', transform: 'scale(1.5)' }
  ]);
});
```

#### Chaining Animations

```javascript
async function chainAnimations(element) {
  const fadeIn = new Animation(
    new KeyframeEffect(element, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }),
    document.timeline
  );

  const slide = new Animation(
    new KeyframeEffect(
      element,
      [{ transform: 'translateX(0)' }, { transform: 'translateX(200px)' }],
      { duration: 1000 }
    ),
    document.timeline
  );

  const fadeOut = new Animation(
    new KeyframeEffect(element, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }),
    document.timeline
  );

  // Chain animations using promises
  fadeIn.play();
  await fadeIn.finished;

  slide.play();
  await slide.finished;

  fadeOut.play();
  await fadeOut.finished;

  console.log('Animation chain complete!');
}
```

---

## Browser Compatibility

All three interfaces (`Animation`, `AnimationEffect`, `KeyframeEffect`) are **Baseline Widely Available** since March 2020.

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 75+ | Full support |
| Firefox | 63+ | Full support |
| Safari | 13.1+ | Full support |
| Edge | 79+ | Full support |
| Opera | 62+ | Full support |
| Samsung Internet | 11.0+ | Full support |

### Feature Detection

```javascript
// Check for Web Animations API support
if ('Animation' in window && 'KeyframeEffect' in window) {
  // Web Animations API is supported
  console.log('Web Animations API supported!');
} else {
  // Fallback to CSS animations or polyfill
  console.log('Web Animations API not supported');
}

// Check for specific features
const supportsCommitStyles = 'commitStyles' in Animation.prototype;
const supportsReplaceState = 'replaceState' in Animation.prototype;
```

---

## Related APIs

- **[Element.animate()](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)** - Shorthand method for creating and playing animations
- **[Document.getAnimations()](https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations)** - Returns all active animations in the document
- **[Element.getAnimations()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations)** - Returns animations affecting an element
- **[AnimationTimeline](https://developer.mozilla.org/en-US/docs/Web/API/AnimationTimeline)** - Abstract timeline interface
- **[DocumentTimeline](https://developer.mozilla.org/en-US/docs/Web/API/DocumentTimeline)** - Default document timeline
- **[CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)** - CSS-based animation approach

---

## Specifications

- [Web Animations Level 1](https://drafts.csswg.org/web-animations-1/)
- [Web Animations Level 2](https://drafts.csswg.org/web-animations-2/)

---

## See Also

- [Using the Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)
- [Web Animations API Concepts](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Web_Animations_API_Concepts)
- [Keyframe Formats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)
