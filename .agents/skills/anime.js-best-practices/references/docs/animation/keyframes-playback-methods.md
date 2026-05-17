# Anime.js Animation Documentation: Keyframes, Playback, Callbacks, Methods & Properties

> Source: https://animejs.com/documentation/animation/

---

## Table of Contents

1. [Keyframes Overview](#keyframes-overview)
2. [Tween Values Keyframes](#tween-values-keyframes)
3. [Tween Parameters Keyframes](#tween-parameters-keyframes)
4. [Duration Based Keyframes](#duration-based-keyframes)
5. [Percentage Based Keyframes](#percentage-based-keyframes)
6. [Animation Playback Settings](#animation-playback-settings)
7. [Animation Callbacks](#animation-callbacks)
8. [Animation Methods](#animation-methods)
9. [Animation Properties](#animation-properties)

---

## Keyframes Overview

> Source: https://animejs.com/documentation/animation/keyframes

Keyframes create sequences of animations on the same animatable property. There are two main approaches:

### Property Value Keyframes

Applied directly to specific properties:

**Tween Values Array:**

```javascript
animate('.square', {
  x: [0, 100, 200],
  y: [0, 100, 200],
  duration: 3000,
})
```

**Tween Parameters Array:**

```javascript
animate('.square', {
  x: [{to: 100}, {to: 200}],
  y: [{to: 100}, {to: 200}],
  duration: 3000,
})
```

### Animation-Level Keyframes

Animate multiple properties per keyframe:

**Duration Based:**

```javascript
animate('.square', {
  keyframes: [
    { x: 100, y: 100 },
    { x: 200, y: 200 },
  ],
  duration: 3000,
})
```

**Percentage Based:**

```javascript
animate('.square', {
  keyframes: {
    '0%'  : { x: 0,   y: 0   },
    '50%' : { x: 100, y: 100 },
    '100%': { x: 200, y: 200 },
  },
  duration: 3000,
})
```

---

## Tween Values Keyframes

> Source: https://animejs.com/documentation/animation/keyframes/tween-values-keyframes

"Sequences multiple Tween value specific to an Animatable property using an Array." The duration between keyframes equals total animation duration divided by the number of transitions.

### Syntax

The first keyframe establishes the initial `from` value. Basic usage:

```javascript
animate(target: { x: [-100, 100] }); // Animate x from -100 to 100
```

### Accepted Values

An `Array` of valid tween values (numerical, unit conversion, relative, color, CSS variables, or function-based).

### Code Example

```javascript
import { animate } from 'animejs';

animate('.square', {
  translateX: ['0rem', 0, 17, 17, 0, 0],
  translateY: ['0rem', -2.5, -2.5, 2.5, 2.5, 0],
  scale: [1, 1, .5, .5, 1, 1],
  rotate: { to: 360, ease: 'linear' },
  duration: 3000,
  ease: 'inOut', // ease applied between each keyframes if no ease defined
  playbackEase: 'ouIn(5)', // ease applied across all keyframes
  loop: true,
});
```

### Key Properties

- **ease**: Applied between each keyframe when not individually specified
- **playbackEase**: Applied across all keyframes
- **duration**: Divided equally among transitions between keyframes

---

## Tween Parameters Keyframes

> Source: https://animejs.com/documentation/animation/keyframes/tween-parameters-keyframes

"Sequences multiple Tween parameters specific to an Animatable property" allowing fine-grained control over animations with individual `ease`, `delay`, `duration`, and `modifier` settings per keyframe.

### Parameter Format

Accepts an `Array` of Tween parameters objects.

**Default behavior:** Each keyframe's duration equals total animation duration divided by keyframe count.

### Code Example

```javascript
import { animate } from 'animejs';

animate('.square', {
  x: [
    { to: '17rem', duration: 700, delay: 400 },
    { to: 0, duration: 700, delay: 800 },
  ],
  y: [
    { to: '-2.5rem', ease: 'out', duration: 400 },
    { to: '2.5rem', duration: 800, delay: 700 },
    { to: 0, ease: 'in', duration: 400, delay: 700 },
  ],
  scale: [
    { to: .5, duration: 700, delay: 400 },
    { to: 1, duration: 700, delay: 800 },
  ],
  rotate: { to: 360, ease: 'linear' },
  duration: 3000,
  ease: 'inOut',
  playbackEase: 'ouIn(5)',
  loop: true,
});
```

### Key Properties

- **to**: Target animation value
- **duration**: Keyframe-specific duration
- **delay**: Keyframe-specific delay
- **ease**: Individual keyframe easing function
- **playbackEase**: Applied across all keyframes

---

## Duration Based Keyframes

> Source: https://animejs.com/documentation/animation/keyframes/duration-based-keyframes

Duration-based keyframes allow sequencing multiple animatable properties one after another with fine control. The default keyframe duration equals the total animation duration divided by the number of keyframes.

### Syntax Structure

```javascript
keyframes: [
  { y: 50, ease: 'out', duration: 400 },
  { x: 75, scale: .5, duration: 800 },
]
```

### What It Accepts

"An `Array` of `Object` containing one Animatable property and Tween parameters"

### Complete Code Example

```javascript
import { animate } from 'animejs';

animate('.square', {
  keyframes: [
    { y: '-2.5rem', ease: 'out', duration: 400 },
    { x: '17rem', scale: .5, duration: 800 },
    { y: '2.5rem' }, // duration = 3000 / 5 = 600ms
    { x: 0, scale: 1, duration: 800 },
    { y: 0, ease: 'in', duration: 400 }
  ],
  rotate: { to: 360, ease: 'linear' },
  duration: 3000,
  ease: 'inOut',
  playbackEase: 'ouIn(5)',
  loop: true,
});
```

### Key Parameters

- **ease**: Applied between keyframes if not individually specified
- **duration**: Time for individual keyframe (in milliseconds)
- **playbackEase**: "ease applied across all keyframes"
- **loop**: Enable repetition of the animation sequence

---

## Percentage Based Keyframes

> Source: https://animejs.com/documentation/animation/keyframes/percentage-based-keyframes

"Sequences multiple Animatable properties with positions defined from a percentage of the animation total duration." This approach mirrors CSS `@keyframes` syntax while limiting control to the `ease` parameter per keyframe.

### Structure

The first keyframe establishes the animation's starting value.

```javascript
keyframes: {
  '25%' : { x: 100, y: 50, ease: 'out' },
  '50%' : { x: 200, y: 75, },
}
```

### Parameters

An object format where:

- **Keys**: Strings representing percentage points (e.g., '0%', '50%', '100%')
- **Values**: Objects containing animatable properties plus optional `ease` parameter

### Complete Example

```javascript
import { animate } from 'animejs';

animate('.square', {
  keyframes: {
    '0%'  : { x: '0rem', y: '0rem', ease: 'out' },
    '13%' : { x: '0rem', y: '-2.5rem', },
    '37%' : { x: '17rem', y: '-2.5rem', scale: .5 },
    '63%' : { x: '17rem', y: '2.5rem', scale: .5 },
    '87%' : { x: '0rem', y: '2.5rem', scale: 1 },
    '100%': { y: '0rem', ease: 'in' }
  },
  rotate: { to: 360, ease: 'linear' },
  duration: 3000,
  ease: 'inOut',
  playbackEase: 'ouIn(5)',
  loop: true,
});
```

### Key Features

- Individual keyframes support `ease` parameter
- Default ease applies between keyframes unless specified individually
- `playbackEase` applies across the entire animation sequence

---

## Animation Playback Settings

> Source: https://animejs.com/documentation/animation/animation-playback-settings

Animation playback settings control "the timings and behaviours of an animation." Settings are "defined directly in the `animate()` parameters `Object`" rather than as separate method calls.

### Code Example

```javascript
animate('.square', {
  translateX: 100,
  scale: 2,
  opacity: .5,
  duration: 400,
  delay: 250,
  ease: 'out(3)',
  loop: 3,
  alternate: true,
  autoplay: false,
  onBegin: () => {},
  onLoop: () => {},
  onUpdate: () => {},
});
```

### Available Settings

| Parameter | Description |
|-----------|-------------|
| **delay** | Initial wait time before animation starts |
| **duration** | Animation length |
| **loop** | Repetition count |
| **loopDelay** | Wait between loop iterations |
| **alternate** | Direction reversal on each loop |
| **reversed** | Begin animation in reverse |
| **autoplay** | Start animation automatically |
| **frameRate** | Update frequency |
| **playbackRate** | Speed multiplier |
| **playbackEase** | Easing applied to playback timing |
| **persist** | WAAPI-specific parameter for animation persistence |

---

## Animation Callbacks

> Source: https://animejs.com/documentation/animation/animation-callbacks

"Execute functions at specific points during an animation playback. Callbacks `Function` are specified directly in the `animate()` parameters `Object`."

### Code Example

```javascript
animate('.square', {
  translateX: 100,
  scale: 2,
  opacity: .5,
  duration: 400,
  delay: 250,
  ease: 'out(3)',
  loop: 3,
  alternate: true,
  autoplay: false,
  onBegin: () => {},
  onLoop: () => {},
  onUpdate: () => {},
});
```

### Available Callbacks

| Callback | Description |
|----------|-------------|
| **onBegin** | Fires when animation starts |
| **onComplete** | Fires when animation finishes |
| **onBeforeUpdate** | Fires before each frame update |
| **onUpdate** | Fires during each frame update |
| **onRender** | Fires on render events |
| **onLoop** | Fires when loop completes |
| **onPause** | Fires when animation pauses |
| **then()** | Promise-based callback method |

### Key Information

- Callbacks are callback functions within the animation parameters object
- Introduced in version 1.0.0+
- Part of Anime.js's animation configuration system
- Each callback receives execution at specific animation lifecycle points

---

## Animation Methods

> Source: https://animejs.com/documentation/animation/animation-methods

"Methods available on the `Animation` instance returned by an `animate()` function, providing control over the timing, behaviour, and progression of an animation."

### Basic Pattern

```javascript
const animation = animate(target, parameters);
animation.pause()
animation.play()
animation.restart()
```

### Available Methods

| Method | Description |
|--------|-------------|
| **play()** | Resume playback |
| **reverse()** | Play backwards |
| **pause()** | Suspend playback |
| **restart()** | Begin from start |
| **alternate()** | Switch direction mode |
| **resume()** | Continue from pause point |
| **complete()** | Jump to end state |
| **cancel()** | Stop and remove animation |
| **revert()** | Restore original values |
| **reset()** | Return to initial state |
| **seek()** | Jump to specific time |
| **stretch()** | Modify duration |
| **refresh()** | Update animation state |

---

## Animation Properties

> Source: https://animejs.com/documentation/animation/animation-properties

The `Animation` instance returned by `animate()` and `waapi.animate()` functions provides access to animation state and control through various properties.

### Usage Pattern

```javascript
const animation = animate(targets, parameters);
animation.currentTime;  // Access property
animation.progress = 0.5;  // Modify property
```

### Property Reference

| Property | Type | Description | JS Only |
|----------|------|-------------|---------|
| **id** | String \| Number | Gets and sets the ID of the animation | Yes |
| **targets** | Array | Gets the current animation targets | No |
| **currentTime** | Number | Gets and sets the global current time in ms of the animation | No |
| **iterationCurrentTime** | Number | Gets and sets the current iteration time in ms | Yes |
| **deltaTime** | Number | Gets the time in ms elapsed between the current and previous frame | Yes |
| **progress** | Number | Gets and sets the overall progress of the animation from `0` to `1` | No |
| **iterationProgress** | Number | Gets and sets the progress of the current iteration from `0` to `1` | Yes |
| **currentIteration** | Number | Gets and sets the current iteration count | Yes |
| **duration** | Number | Gets the total duration in ms of the animation | No |
| **speed** | Number | Gets and sets the speed multiplier of the animation | No |
| **fps** | Number | Gets and sets the fps of the animation | Yes |
| **paused** | Boolean | Gets and sets whether the animation is paused | No |
| **began** | Boolean | Gets and sets whether the animation has started | Yes |
| **completed** | Boolean | Gets and sets whether the animation has completed | No |
| **reversed** | Boolean | Gets and sets whether the animation is reversed | Yes |
| **backwards** | Boolean | Gets whether the animation is currently playing backwards | Yes |

**Note:** Properties marked "JS only" are exclusive to the JavaScript version of `animate()`, not the Web Animation API variant.

---

## Quick Reference: Keyframe Types Comparison

| Type | Syntax | Use Case |
|------|--------|----------|
| **Tween Values** | `x: [0, 100, 200]` | Simple value sequences |
| **Tween Parameters** | `x: [{to: 100, ease: 'out'}, {to: 200}]` | Fine-grained control per keyframe |
| **Duration Based** | `keyframes: [{x: 100}, {y: 200}]` | Sequential multi-property animation |
| **Percentage Based** | `keyframes: {'0%': {x: 0}, '100%': {x: 200}}` | CSS-like precise timing control |
