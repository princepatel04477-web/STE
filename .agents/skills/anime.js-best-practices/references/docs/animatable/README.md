# Anime.js Animatable API Reference

> Source: https://animejs.com/documentation/animatable

## Overview

Efficiently animates target properties, making it an ideal replacement for `animate()` and `utils.set()` in situations where values change frequently, such as cursor events or animation loops.

## Creation

```javascript
import { createAnimatable } from 'animejs';

const animatable = createAnimatable(targets, parameters);
```

Or via subpath import:

```javascript
import { createAnimatable } from 'animejs/animatable';
```

## Function Signature

**Parameters:**
- `targets`: Accepts Targets (DOM elements, CSS selectors, objects, or arrays)
- `parameters`: Object containing Animatable settings

**Returns:** `Animatable` instance

## Core Usage Pattern

An Animatable instance exposes property functions for getting/setting values:

```javascript
animatable.propertyName(value, duration, ease); // Triggers animation
animatable.propertyName();                       // Returns current value
```

**Constraint:** Only `Number` or `Array<Number>` can be passed to animatable property functions.

## Basic Example

```javascript
import { createAnimatable, utils } from 'animejs';

const animatableSquare = createAnimatable('.square', {
  x: 500, // x duration: 500ms
  y: 500, // y duration: 500ms
  ease: 'out(3)',
});

const onMouseMove = e => {
  const x = utils.clamp(e.clientX - left - hw, -hw, hw);
  const y = utils.clamp(e.clientY - top - hh, -hh, hh);
  animatableSquare.x(x); // Animate x in 500ms
  animatableSquare.y(y); // Animate y in 500ms
}

window.addEventListener('mousemove', onMouseMove);
```

---

# Animatable Settings

> Source: https://animejs.com/documentation/animatable/animatable-settings

## Overview

Animatable properties can be configured globally or per-property.

## Structure

Settings can be applied in two ways:

```javascript
createAnimatable(targets, {
  // Specific property settings
  x: {
    unit: 'rem',
    duration: 400,
    ease: 'out(4)'
  },
  // Global property settings
  y: 200,
  rotate: 1000,
  ease: 'out(2)'
});
```

## Available Settings

1. **unit** - Specify measurement units for properties
2. **duration** - Set animation duration
3. **ease** - Define easing functions
4. **modifier** - Apply value modifications

Settings specified at the property level override global settings.

---

## unit

> Source: https://animejs.com/documentation/animatable/animatable-settings/unit

### API Signature

```javascript
unit: String // A valid CSS unit
```

### Description

Defines the unit for the animated value of the property. Accepts any valid CSS unit as a string.

### Example

```javascript
import { createAnimatable, utils } from 'animejs';

const $demos = document.querySelector('#docs-demos');
const [ $clock ] = utils.$('.clock');
let bounds = $clock.getBoundingClientRect();
const refreshBounds = () => bounds = $clock.getBoundingClientRect();

const clock = createAnimatable($clock, {
  rotate: { unit: 'rad' }, // Set the unit to 'rad'
  duration: 400,
});

const { PI } = Math;
let lastAngle = 0
let angle = PI / 2;

const onMouseMove = e => {
  const { width, height, left, top } = bounds;
  const x = e.clientX - left - width / 2;
  const y = e.clientY - top - height / 2;
  const currentAngle = Math.atan2(y, x);
  const diff = currentAngle - lastAngle;
  angle += diff > PI ? diff - 2 * PI : diff < -PI ? diff + 2 * PI : diff;
  lastAngle = currentAngle;
  clock.rotate(angle); // Pass new angle value in rad
}

window.addEventListener('mousemove', onMouseMove);
$demos.addEventListener('scroll', refreshBounds);
```

---

## duration

> Source: https://animejs.com/documentation/animatable/animatable-settings/duration

### API Signature

```javascript
duration: Number | Function
```

### Accepted Values

- A `Number` greater than or equal to `0`
- A function-based value returning a `Number` >= `0`

### Default Value

`1000` (milliseconds)

### Description

Specifies the animation transition time for an animatable property in milliseconds.

### Example

```javascript
import { createAnimatable, utils, stagger } from 'animejs';

const $demos = document.querySelector('#docs-demos');
const $demo = document.querySelector('.docs-demo.is-active');
let bounds = $demo.getBoundingClientRect();
const refreshBounds = () => bounds = $demo.getBoundingClientRect();

const circles = createAnimatable('.circle', {
  x: 0,
  y: stagger(200, { from: 'center', start: 200 }),
  ease: 'out(4)',
});

const onMouseMove = e => {
  const { width, height, left, top } = bounds;
  const hw = width / 2;
  const hh = height / 2;
  const x = utils.clamp(e.clientX - left - hw, -hw, hw);
  const y = utils.clamp(e.clientY - top - hh, -hh, hh);
  circles.x(x).y(y);
}

window.addEventListener('mousemove', onMouseMove);
$demos.addEventListener('scroll', refreshBounds);
```

---

## ease

> Source: https://animejs.com/documentation/animatable/animatable-settings/ease

### API Signature

```javascript
ease: String | Function
```

### Accepted Values

Accepts the same easing options as the `ease` tween parameter, including:
- Built-in easing function names (e.g., `'linear'`, `'outQuad'`, `'outElastic'`)
- Custom easing functions
- Spring easings
- Cubic Bezier curves

### Default Value

```javascript
'outQuad'
```

### Important Note

It is recommended to use an `out` type easing function to achieve interesting results. `in` type easing functions start with changes that are too subtle to be noticeable.

### Example

```javascript
import { createAnimatable } from 'animejs';

const clock1 = createAnimatable('.clock-1', {
  rotate: { unit: 'rad' },
  ease: 'linear',
});

const clock2 = createAnimatable('.clock-2', {
  rotate: { unit: 'rad' },
  ease: 'outElastic',
});
```

---

## modifier

> Source: https://animejs.com/documentation/animatable/animatable-settings/modifier

### API Signature

```javascript
modifier: Function
```

### Default Value

`noop` (no operation)

### Description

Defines a Modifier function to modify or alter the behaviour of the animated numerical value.

### Example

```javascript
import { createAnimatable, utils, stagger } from 'animejs';

const PI = Math.PI;

const clock1 = createAnimatable('.clock-1', {
  rotate: { unit: 'rad' },
  modifier: utils.snap(PI / 10),
  duration: 0,
});

const clock2 = createAnimatable('.clock-2', {
  rotate: { unit: 'rad' },
  modifier: v => -v,
  duration: 0,
});

const rotateClock = (animatable) => {
  return e => {
    const [ $clock ] = animatable.targets;
    const { width, height, left, top } = $clock.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    animatable.rotate(Math.atan2(y, x) + PI / 2);
  }
}

const rotateClock1 = rotateClock(clock1);
const rotateClock2 = rotateClock(clock2);

const onMouseMove = e => {
  rotateClock1(e);
  rotateClock2(e);
}

window.addEventListener('mousemove', onMouseMove);
```

### Usage Patterns

1. **Snapping:** `utils.snap(PI / 10)` constrains values to discrete intervals
2. **Inversion:** `v => -v` negates animated values

---

# Animatable Methods

> Source: https://animejs.com/documentation/animatable/animatable-methods

## Overview

The `Animatable` instance is returned by `createAnimatable()` and provides methods for animating properties.

**Basic Usage:**

```javascript
const animatable = createAnimatable(target, parameters);
animatable.x(100);
animatable.y(50, 500, 'out(2)');
animatable.revert();
```

## Method Categories

1. **Getters** - retrieve current property values
2. **Setters** - assign new animated values to properties
3. **revert()** - reset animated properties to their original state

---

## Getters

> Source: https://animejs.com/documentation/animatable/animatable-methods/getters

### API Signature

```javascript
animatableObject.propertyName()
```

### Return Values

- **Single value properties**: Returns a `Number`
- **Multiple value properties**: Returns an `Array` of `Number` (e.g., RGB color values)

### Description

Calling a method without any argument acts as a getter, returning the current value of the animatable property.

### Example

```javascript
import { createAnimatable, utils } from 'animejs';

const $demos = document.querySelector('#docs-demos');
const $demo = document.querySelector('.docs-demo.is-active');
const [ $x, $y ] = utils.$('.coords');
let bounds = $demo.getBoundingClientRect();
const refreshBounds = () => bounds = $demo.getBoundingClientRect();

const circle = createAnimatable('.circle', {
  x: 500,
  y: 500,
  ease: 'out(2)',
});

// Gets and log the current x and y values
circle.animations.x.onRender = () => {
  $x.textContent = utils.roundPad(circle.x(), 2);
  $y.textContent = utils.roundPad(circle.y(), 2);
}

const onMouseMove = e => {
  const { width, height, left, top } = bounds;
  const hw = width / 2;
  const hh = height / 2;
  const x = utils.clamp(e.clientX - left - hw, -hw, hw);
  const y = utils.clamp(e.clientY - top - hh, -hh, hh);
  // Sets x and y values
  circle.x(x);
  circle.y(y);
}

window.addEventListener('mousemove', onMouseMove);
$demos.addEventListener('scroll', refreshBounds);
```

---

## Setters

> Source: https://animejs.com/documentation/animatable/animatable-methods/setters

### API Signature

```javascript
animatable.property(value, duration, easing);
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `value` | `Number \| Array<Number>` | Target value to animate toward |
| `duration` (optional) | `Number` | Transition duration in milliseconds |
| `easing` (optional) | ease function | Easing function for the animation |

### Returns

The animatable instance itself, enabling chained property calls.

### Description

Setters transform animatable properties into callable methods on the animatable object. When called with arguments, they act as setters and enable method chaining.

### Example

```javascript
import { createAnimatable, utils } from 'animejs';

const $demos = document.querySelector('#docs-demos');
const $demo = document.querySelector('.docs-demo.is-active');
let bounds = $demo.getBoundingClientRect();
const refreshBounds = () => bounds = $demo.getBoundingClientRect();

const circle = createAnimatable('.circle', {
  x: 0,
  y: 0,
  backgroundColor: 0,
  ease: 'outExpo',
});

const rgb = [164, 255, 79];

circle.x(0, 500, 'out(2)');
circle.y(0, 500, 'out(3)');
circle.backgroundColor(rgb, 250);

const onMouseMove = e => {
  const { width, height, left, top } = bounds;
  const hw = width / 2;
  const hh = height / 2;
  const x = utils.clamp(e.clientX - left - hw, -hw, hw);
  const y = utils.clamp(e.clientY - top - hh, -hh, hh);
  rgb[0] = utils.mapRange(x, -hw, hw, 0, 164);
  rgb[2] = utils.mapRange(x, -hw, hw, 79, 255);
  circle.x(x).y(y).backgroundColor(rgb);
}

window.addEventListener('mousemove', onMouseMove);
$demos.addEventListener('scroll', refreshBounds);
```

### Chaining Example

```javascript
animatable.x(100).y(200);
// Animates x to 100 and y to 200 in 500ms
```

---

## revert()

> Source: https://animejs.com/documentation/animatable/animatable-methods/revert

### API Signature

```javascript
revert()
```

### Returns

The method returns the animatable instance itself, enabling method chaining with other animatable methods.

### Description

Reverts all the animatable properties to their original values and cleanup the CSS inline styles. Use `revert()` when you want to completely stop and destroy an animatable.

### Example

```javascript
import { createAnimatable, utils, stagger } from 'animejs';

const $demos = document.querySelector('#docs-demos');
const $demo = $demos.querySelector('.docs-demo.is-active');
const [ $revertButton ] = utils.$('.revert');
let bounds = $demo.getBoundingClientRect();
const refreshBounds = () => bounds = $demo.getBoundingClientRect();

const circles = createAnimatable('.circle', {
  x: stagger(50, { from: 'center', start: 100 }),
  y: stagger(200, { from: 'center', start: 200 }),
  ease: 'out(4)',
});

const onMouseMove = e => {
  const { width, height, left, top } = bounds;
  const hw = width / 2;
  const hh = height / 2;
  const x = utils.clamp(e.clientX - left - hw, -hw, hw);
  const y = utils.clamp(e.clientY - top - hh, -hh, hh);
  circles.x(x).y(y);
}

const revertAnimatable = () => {
  window.removeEventListener('mousemove', onMouseMove);
  circles.revert();
}

$revertButton.addEventListener('click', revertAnimatable);
window.addEventListener('mousemove', onMouseMove);
$demos.addEventListener('scroll', refreshBounds);
```

---

# Animatable Properties

> Source: https://animejs.com/documentation/animatable/animatable-properties

## Overview

The `Animatable` instance exposes two main properties for accessing targets and their associated animations.

## Properties

### targets

- **Type:** `Array`
- **Description:** Gets the animatable Targets
- **Purpose:** Provides access to the target elements or objects being animated

### animations

- **Type:** `Object`
- **Description:** Gets all animatable Animations
- **Purpose:** Contains all animation instances associated with the animatable targets

## Basic Usage

```javascript
const animatable = createAnimatable(targets, parameters);

// Access properties
animatable.targets    // Array of target elements/objects
animatable.animations // Object containing all animations
```

---

# Quick Reference

## Creating an Animatable

```javascript
import { createAnimatable } from 'animejs';

const animatable = createAnimatable('.element', {
  x: 500,           // duration for x property
  y: 500,           // duration for y property
  ease: 'out(3)',   // global easing
});
```

## Settings Summary

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `unit` | `String` | (none) | CSS unit for animated value |
| `duration` | `Number \| Function` | `1000` | Animation duration in ms |
| `ease` | `String \| Function` | `'outQuad'` | Easing function |
| `modifier` | `Function` | `noop` | Value modifier function |

## Methods Summary

| Method | Arguments | Returns | Description |
|--------|-----------|---------|-------------|
| `.property()` | none | `Number \| Array<Number>` | Get current value |
| `.property(value)` | `Number \| Array<Number>` | `Animatable` | Set and animate to value |
| `.property(value, duration, ease)` | mixed | `Animatable` | Set with custom duration/ease |
| `.revert()` | none | `Animatable` | Revert all properties to original |

## Properties Summary

| Property | Type | Description |
|----------|------|-------------|
| `targets` | `Array` | Target elements/objects being animated |
| `animations` | `Object` | All animation instances |
