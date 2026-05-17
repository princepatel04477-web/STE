# Anime.js Easings Documentation

> Complete reference for easing functions and physics-based spring generators in Anime.js

## Table of Contents

- [Overview](#overview)
- [Import Methods](#import-methods)
- [Built-in Eases](#built-in-eases)
- [Cubic Bezier Easing](#cubic-bezier-easing)
- [Linear Easing](#linear-easing)
- [Steps Easing](#steps-easing)
- [Irregular Easing](#irregular-easing)
- [Spring Physics](#spring-physics)

---

## Overview

The easings section documents easing functions and physics-based spring generators for the Anime.js animation library.

### Import Methods

**Via main module:**

```javascript
import { easings } from 'animejs';
easings.eases.inOut(3);
easings.cubicBezier(.7, .1, .5, .9);
easings.spring({ bounce: .35 });
```

**Direct imports:**

```javascript
import { eases, cubicBezier, spring } from 'animejs';
eases.inOut(3);
cubicBezier(.7, .1, .5, .9);
spring({ bounce: .35 });
```

**Subpath import:**

```javascript
import { eases, cubicBezier, spring } from 'animejs/easings';
```

### Usage in Animations

Easing functions are passed to the `ease` parameter:

```javascript
import { cubicBezier, linear, spring } from 'animejs';

animate(target, { x: 100, ease: 'inOut(3)' });
animate(target, { x: 100, ease: cubicBezier(.7, .1, .5, .9) });
animate(target, { x: 100, ease: spring({ bounce: .35 }) });
```

### Basic Example

```javascript
import { animate, waapi, cubicBezier, spring } from 'animejs';

animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'out(3)',
});

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  ease: cubicBezier(.7, .1, .5, .9),
});

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: 360,
  ease: spring({ bounce: .35 }),
});
```

---

## Built-in Eases

Anime.js provides a collection of built-in easing functions that can be specified by name in the `ease` parameter of animation functions.

### Basic Syntax

```javascript
animate(target, { x: 100, ease: 'outQuad' });
animate(target, { x: 100, ease: 'outExpo' });
animate(target, { x: 100, ease: 'outElastic(.8, 1.2)' });
```

### Accessing via Eases Object

```javascript
import { eases } from 'animejs';

eases.outQuad;
eases.outExpo;
eases.outElastic(.8, 1.2);
```

### Complete Easing Functions List

| Type | Parameters | Variants |
|------|-----------|----------|
| Linear | — | `'linear'` |
| Power | power = `1.675` | `'in'`, `'out'`, `'inOut'`, `'outIn'` |
| Quad | — | `'inQuad'`, `'outQuad'`, `'inOutQuad'`, `'outInQuad'` |
| Cubic | — | `'inCubic'`, `'outCubic'`, `'inOutCubic'`, `'outInCubic'` |
| Quart | — | `'inQuart'`, `'outQuart'`, `'inOutQuart'`, `'outInQuart'` |
| Quint | — | `'inQuint'`, `'outQuint'`, `'inOutQuint'`, `'outInQuint'` |
| Sine | — | `'inSine'`, `'outSine'`, `'inOutSine'`, `'outInSine'` |
| Exponential | — | `'inExpo'`, `'outExpo'`, `'inOutExpo'`, `'outInExpo'` |
| Circular | — | `'inCirc'`, `'outCirc'`, `'inOutCirc'`, `'outInCirc'` |
| Bounce | — | `'inBounce'`, `'outBounce'`, `'inOutBounce'`, `'outInBounce'` |
| Back | overshoot = `1.70158` | `'inBack'`, `'outBack'`, `'inOutBack'`, `'outInBack'` |
| Elastic | amplitude = `1`, period = `.3` | `'inElastic'`, `'outElastic'`, `'inOutElastic'`, `'outInElastic'` |

### Example

```javascript
import { animate, waapi } from 'animejs';

animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'inOut',
});

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'inOut(3)',
});

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'inOutExpo',
});
```

---

## Cubic Bezier Easing

A cubic bezier easing defines the pace of an animation using a Bezier curve.

### API Signature

```javascript
cubicBezier(x1, y1, x2, y2)
```

### Parameters

| Name | Type | Details |
|------|------|---------|
| x1 | Number | X coordinate of the first control point. Must be between 0 and 1. |
| y1 | Number | Y coordinate of the first control point. Can be any value (negative creates anticipation, >1 creates overshoot). |
| x2 | Number | X coordinate of the second control point. Must be between 0 and 1. |
| y2 | Number | Y coordinate of the second control point. Can be any value (negative creates anticipation, >1 creates overshoot). |

### JavaScript Implementation

```javascript
import { animate, cubicBezier } from 'animejs';

animate(target, { x: 100, ease: cubicBezier(0, 0, 0.58, 1) });
```

### WAAPI Implementation

```javascript
import { waapi } from 'animejs';

waapi.animate(target, { x: 100, ease: 'cubic-bezier(0, 0, 0.58, 1)' });

// Or
waapi.animate(target, { x: 100, ease: 'cubicBezier(0, 0, 0.58, 1)' });
```

### Complete Example

```javascript
import { animate, waapi, cubicBezier } from 'animejs';

animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  ease: cubicBezier(0.5, 0, 0.9, 0.3)
});

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  ease: cubicBezier(0.1, 0.7, 0.5, 1)
});

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'cubicBezier(0.7, 0.1, 0.5, 0.9)'
});
```

---

## Linear Easing

Linear easing defines animation pacing through linear interpolation between specified points. It's available for both JavaScript and WAAPI implementations.

### API Signature

```javascript
linear(stop1, stop2, ...stopN)
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| number | Number | Output value at animation point (0=start, 1=end). Values outside 0-1 create overshoot effects. Minimum two values required. |
| percentage (optional) | String | Timing position as `'value percentage'`. Unavailable for first/last stops. Auto-distributed if omitted. |

### JavaScript Implementation

```javascript
import { animate, linear } from 'animejs';

animate(target, { x: 100, ease: linear(0, '0.5 50%', '0.3 75%', 1) });
```

### WAAPI Implementation

```javascript
import { waapi } from 'animejs';

waapi.animate(target, { x: 100, ease: 'linear(0, 0.5 50%, 0.3 75%, 1)' });
```

### Full Example

```javascript
import { animate, waapi, linear } from 'animejs';

animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  duration: 2000,
  ease: linear(0, 0, 0.5, 0.5, 1, 1)
});

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  duration: 2000,
  ease: linear(0, '1 25%', 0, 1)
});

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: 360,
  duration: 2000,
  ease: 'linear(1, 0 25%, 1, 0)'
});
```

---

## Steps Easing

A steps easing creates a stepped animation that jumps between values at discrete intervals.

### API Signature

```javascript
steps(n, fromStart)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| steps | Number | Represents the number of equal steps to divide the animation into. Must be a positive integer. |
| fromStart (optional) | Boolean | When `true`, the change happens at the start of each step. When `false`, the change happens at the end of each step (default: `false`). |

### JavaScript Implementation

```javascript
import { animate, steps } from 'animejs';

animate(target, { x: 100, ease: steps(5) });
// Or with fromStart
animate(target, { x: 100, ease: steps(5, true) });
```

### WAAPI Implementation

```javascript
import { waapi } from 'animejs';

waapi.animate(target, { x: 100, ease: 'steps(5)' });
// Or with jump-start
waapi.animate(target, { x: 100, ease: 'steps(5, start)' });
```

### Code Example

```javascript
import { animate, waapi } from 'animejs';

animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  ease: steps(4)
});

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  ease: steps(4, true)
});

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'steps(8, end)'
});
```

---

## Irregular Easing

An irregular easing defines the pace of an animation using linear interpolation between randomized points.

### API Signature

```javascript
irregular(steps, randomness)
```

### Parameters

| Name | Type | Details |
|------|------|---------|
| steps | Number | Represents the number of random steps to generate. Must be a positive integer. |
| randomness | Number (optional) | Controls the amplitude of random variations. Higher values create more dramatic jumps between steps (default: `1`). |

### Basic Usage

```javascript
import { animate, irregular } from 'animejs';

animate(target, { x: 100, ease: irregular(10, 1.5) });
```

### Code Example

```javascript
import { animate, waapi, irregular } from 'animejs';

animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  duration: 2000,
  ease: irregular(10, .5)
});

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  duration: 2000,
  ease: irregular(10, 1)
});

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: 360,
  duration: 2000,
  ease: irregular(10, 2)
});
```

---

## Spring Physics

The `spring()` method generates physics-based easing curves with automatic duration calculation. It's passed directly to the `ease` parameter of `animate()`.

### API Signature

```javascript
import { animate, spring } from 'animejs';
animate(target, { x: 100, ease: spring({ bounce: .5 }) });
```

### Perceived Parameters (Intuitive Controls)

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| bounce | Number | -1 to 1 | 0.5 | Controls the bounciness of the animation |
| duration | Number | 10-10000ms | 628 | The perceived duration in milliseconds, when the animation feels complete visually |

### Physics Parameters (Direct Control)

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| mass | Number | 1-10000 | 1 | Higher values create slower, heavier motion |
| stiffness | Number | 0-10000 | 100 | Higher values create tighter, quicker response |
| damping | Number | 0-10000 | 10 | Controls oscillation decay; higher reduces bounce |
| velocity | Number | -10000 to 10000 | 0 | Initial animation velocity |

### Callback Parameter

| Parameter | Type | Description |
|-----------|------|-------------|
| onComplete | Function | Callback triggered when the spring reaches its perceived duration |

### Example: Perceived Parameters

```javascript
animate(target, { x: 100, ease: spring({ bounce: .5, duration: 350 }) });
```

### Example: Physics Parameters

```javascript
animate(target, { x: 100, ease: spring({ stiffness: 95, damping: 13 }) });
```

### Example: With Callbacks

```javascript
animate(target, {
  x: 100,
  onComplete: () => console.log('settling complete'),
  ease: spring({
    bounce: .25,
    duration: 350,
    onComplete: () => console.log('perceived complete'),
  })
});
```

### Complex Animation Example

```javascript
const [ $square1, $square2, $square3 ] = utils.$('.square');
utils.set('.square', { color: 'var(--hex-red-1)' });

animate($square1, {
  x: '17rem',
  rotate: 360,
  ease: spring({ bounce: .15, duration: 500 })
});

animate($square2, {
  x: '17rem',
  rotate: 360,
  ease: spring({ bounce: .3, duration: 500 })
});

animate($square3, {
  x: '17rem',
  rotate: 360,
  ease: spring({ stiffness: 90, damping: 14 })
});
```

---

## Available Easing Types Summary

| Type | Function | Description |
|------|----------|-------------|
| Built-in eases | String names | Pre-defined easing curves (quad, cubic, elastic, etc.) |
| Cubic Bezier | `cubicBezier(x1, y1, x2, y2)` | Custom curves via control points |
| Linear | `linear(stop1, stop2, ...stopN)` | Linear interpolation between points |
| Steps | `steps(n, fromStart)` | Discrete step-based animation |
| Irregular | `irregular(steps, randomness)` | Randomized step interpolation |
| Spring | `spring({ bounce, duration, ... })` | Physics-based spring motion |
