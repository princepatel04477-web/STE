# Anime.js SVG Documentation

## Overview

The SVG module provides utility functions for SVG animations. As stated in the documentation: "A collection of utility functions to help with SVG morphing, line drawing and motion path animations."

## Import Methods

Three import approaches are available:

**Object import:**
```javascript
import { svg } from 'animejs';
svg.morphTo();
svg.createMotionPath();
svg.createDrawable();
```

**Direct imports:**
```javascript
import { morphTo, createMotionPath, createDrawable } from 'animejs';
```

**Subpath import:**
```javascript
import { morphTo, createMotionPath, createDrawable } from 'animejs/svg';
```

## Available Functions

The SVG module includes three primary utilities:

1. **morphTo** - Shape morphing animations
2. **createDrawable** - Line drawing and stroke animations
3. **createMotionPath** - Motion path animations along SVG paths

---

## morphTo

### Function Signature
```javascript
svg.morphTo(shapeTarget, precision);
```

### Parameters

| Name | Accepts | Details |
|------|---------|---------|
| `shapeTarget` | CSS selector, `SVGPathElement`, `SVGPolylineElement`, `SVGPolygonElement` | Target shape to morph into |
| `precision` | Number (0-1), optional, default=0.33 | Controls amount of points generated during morphing; 0 disables point extrapolation |

### Return Value
An `Array` containing the shape's starting and final `String` values

### Description
Creates morphing animations between SVG shapes by passing the `d` property of `SVGPathElement` or `points` property of `SVGPolylineElement`/`SVGPolygonElement` to the function.

### Code Example

```javascript
import { animate, svg, utils } from 'animejs';

const [ $path1, $path2 ] = utils.$('polygon');

function animateRandomPoints() {
  utils.set($path2, { points: generatePoints() });
  animate($path1, {
    points: svg.morphTo($path2),
    ease: 'inOutCirc',
    duration: 500,
    onComplete: animateRandomPoints
  });
}

animateRandomPoints();

function generatePoints() {
  const total = utils.random(4, 64);
  const r1 = utils.random(4, 56);
  const r2 = 56;
  const isOdd = n => n % 2;
  let points = '';
  for (let i = 0, l = isOdd(total) ? total + 1 : total; i < l; i++) {
    const r = isOdd(i) ? r1 : r2;
    const a = (2 * Math.PI * i / l) - Math.PI / 2;
    const x = 152 + utils.round(r * Math.cos(a), 0);
    const y = 56 + utils.round(r * Math.sin(a), 0);
    points += `${x},${y} `;
  }
  return points;
}
```

---

## createDrawable

### Overview
`createDrawable()` creates a Proxy of an SVGElement that exposes a `draw` property for controlling line visibility.

### Function Signature
```javascript
const [ drawable ] = svg.createDrawable(target);
```

### Parameters

| Name | Accepts | Details |
|------|---------|---------|
| `target` | CSS selector, `SVGLineElement`, `SVGPathElement`, `SVGPolylineElement`, `SVGRectElement` | The SVG element(s) to make drawable |

### Returns
An `Array` of `Proxy` `SVGElement` instances

### Draw Property
The `draw` property accepts a string with two space-separated values (start and end) ranging from 0 to 1:

```javascript
drawable.draw = '0 1';      // Full line visible
drawable.draw = '0 .5';     // First half visible
drawable.draw = '.25 .75';  // Middle section visible
drawable.draw = '.5 1';     // Second half visible
drawable.draw = '1 1';      // Single point at end
```

### Code Example

```javascript
import { animate, svg, stagger } from 'animejs';

animate(svg.createDrawable('.line'), {
  draw: ['0 0', '0 1', '1 1'],
  ease: 'inOutQuad',
  duration: 2000,
  delay: stagger(100),
  loop: true
});
```

### Performance Note
Animating elements with `vector-effect: non-scaling-stroke` may be slow because scale factors must recalculate every frame.

---

## createMotionPath

### Overview
`createMotionPath` creates pre-defined tween parameter objects that animate elements along SVG path coordinates and inclination.

### Function Signature
```javascript
const { translateX, translateY, rotate } = svg.createMotionPath(path, offset);
```

### Parameters

| Name | Type | Description |
|------|------|-------------|
| `path` | CSS selector, `SVGPathElement` | The target SVG path element |
| `offset` | Number (optional) | Value between 0 and 1; defaults to 0 |

### Return Object

| Property | Type | Purpose |
|----------|------|---------|
| `translateX` | Tween parameter | Maps to x coordinate of path |
| `translateY` | Tween parameter | Maps to y coordinate of path |
| `rotate` | Tween parameter | Maps to angle/inclination of path |

### Code Example

```javascript
import { animate, svg } from 'animejs';

// Animate element along motion path
const carAnimation = animate('.car', {
  ease: 'linear',
  duration: 5000,
  loop: true,
  ...svg.createMotionPath('path')
});

// Line drawing animation following motion path
animate(svg.createDrawable('path'), {
  draw: '0 1',
  ease: 'linear',
  duration: 5000,
  loop: true,
});
```

### Usage Pattern
Use the spread operator (`...`) to distribute the returned tween parameters into an animation configuration, enabling synchronized movement along SVG paths with automatic rotation alignment.
