# Anime.js Web Animation API (WAAPI) Documentation

## Overview

Anime.js provides a lightweight alternative (3KB vs 10KB) using the Web Animation API's `Element.animate()` method under the hood through the `waapi.animate()` method.

### Import Methods

```javascript
// From main module
import { waapi } from 'animejs';

// As standalone subpath
import { waapi } from 'animejs/waapi';
```

### API Signature

```javascript
const animation = waapi.animate(targets, parameters);
```

### Parameters

| Parameter | Accepts |
|-----------|---------|
| `targets` | CSS selectors, DOM elements, or arrays of targets |
| `parameters` | Object containing animatable properties, tween settings, playback configuration, and callbacks |

### Returns

`WAAPIAnimation` object

### Basic Code Example

```javascript
import { waapi, stagger, splitText } from 'animejs';

const { chars } = splitText('h2', { words: false, chars: true });

waapi.animate(chars, {
  translate: `0 -2rem`,
  delay: stagger(100),
  duration: 600,
  loop: true,
  alternate: true,
  ease: 'inOut(2)',
});
```

### Key Features

- **Lightweight alternative** to standard animate() method
- Supports all animatable properties (CSS, transforms, variables, attributes)
- Includes tween parameters (delay, duration, ease)
- Hardware-accelerated animation support
- Compatible with stagger utilities and text splitting

---

## When to Use WAAPI

### Prioritize `waapi.animate()` When:

- Animating during CPU/network load (see hardware-accelerated animations section)
- Initial page load time is critical and every KB counts (3KB gzip vs 10KB for the JavaScript version)
- Animating complex CSS values like transform matrices or CSS color functions

### Use `animate()` When:

- Animating large quantities of targets (> 500)
- Animating JS/canvas/WebGL/WebGPU
- Animating SVG, DOM attributes, or CSS properties unsupported by WAAPI
- Animating complex timelines and keyframes
- Requiring advanced control methods
- Requiring advanced callback functions

### Comparison Code Example

```javascript
import { animate, waapi, utils } from 'animejs';

// WAAPI Animation
waapi.animate('.waapi.square', {
  x: '17rem',
  rotate: 180,
  loop: 3,
  alternate: true,
});

// JS Animation
const data = { x: '0rem', rotate: '0deg' }
const [ $log ] = utils.$('code');

animate(data, {
  x: 17,
  rotate: 180,
  modifier: utils.round(0),
  loop: 3,
  alternate: true,
  onRender: () => $log.textContent = JSON.stringify(data)
});
```

---

## Hardware-Accelerated Animations

One of the biggest advantages of WAAPI over `requestAnimationFrame` powered animations is the ability to run animations off the main thread, leading to smoother animations when the CPU is busy while consuming less power.

### Hardware-Accelerated Properties

**Supported across all major browsers:**
- opacity
- transform
- translate
- scale
- rotate

**Supported in some browsers:**
- clip-path
- filter

### Safari Limitation

Safari browsers restrict hardware acceleration when using custom `'linear()'` easing functions. Custom power eases like `'out(3)'`, `'in(3)'`, `'inOut(3)'`, and JavaScript easings passed to `waapi.animate()` prevent hardware acceleration even for supported properties.

### Code Example

```javascript
import { animate, waapi, createTimer, utils, cubicBezier } from 'animejs';

const [ $block ] = utils.$('.button');

const waapiAnim = waapi.animate('.waapi.square', {
  translate: 270,
  rotate: 180,
  alternate: true,
  loop: true,
  ease: 'cubic-bezier(0, 0, .58, 1)',
});

const jsAnim = animate('.js.square', {
  x: 270,
  rotate: 180,
  ease: cubicBezier(0, 0, .58, 1),
  alternate: true,
  loop: true,
});

const blockCPUTimer = createTimer({
  onUpdate: () => {
    const end = Date.now() + 100;
    while(Date.now() < end) {
      Math.random() * Math.random();
    }
  },
  autoplay: false
});

let isBusy = false;

const toggleCPU = () => {
  blockCPUTimer[isBusy ? 'pause' : 'play']();
  $block.textContent = (isBusy ? 'block' : 'free') + ' CPU';
  isBusy = !isBusy;
}

$block.addEventListener('click', toggleCPU);
```

---

## Improvements to the Web Animation API

Anime.js enhances the Web Animation API with several quality-of-life improvements.

### ScrollObserver Integration

```javascript
waapi.animate('.square', {
  translate: '100px',
  autoplay: onScroll()
});
```

### Scope with Media Queries

```javascript
createScope({
  mediaQueries: { reduceMotion: '(prefers-reduced-motion)' }
})
.add(({ matches }) => {
  const { reduceMotion } = matches;
  waapi.animate('.square', {
    transform: reduceMotion ? ['100px', '100px'] : '100px',
    opacity: [0, 1],
  });
});
```

---

## Sensible Defaults

Native WAAPI animations require explicit duration specification, manual easing configuration, and developer responsibility to persist final values post-animation. Anime.js simplifies all that by making sure the animation state is preserved after the animation completes, and uses the same default duration and delay as the JS animate() method.

### Anime.js Approach

```javascript
import { waapi } from 'animejs';

waapi.animate('.circle', { translate: '16rem' });
```

### Native WAAPI Equivalent

```javascript
const $el = document.querySelector('.circle');

$el.animate({ translate: '100px' }, {
  duration: 1000,
  easing: 'ease-out',
}).finished.then(() => {
  $el.style.translate = '100px';
});
```

### Default Behaviors

Anime.js automatically provides:
- Automatic duration application
- Built-in easing (ease-out equivalent)
- Persistent final animation state (no manual style cleanup required)
- Consistent defaults matching the JS `animate()` method

---

## Multi-targets Animation

The multi-targets animation feature allows developers to target one or multiple DOM elements using CSS selectors, enabling animation of several targets in a single `animate()` call with support for the `stagger()` method.

### Accepted Input

Any `String` accepted by `document.querySelectorAll()`

### Anime.js Approach

```javascript
waapi.animate('.circle', {
  translate: '100px',
  delay: stagger(100),
});
```

### Native WAAPI Equivalent

```javascript
document.querySelectorAll('.circle').forEach(($el, i) => {
  $el.animate({
    translate: '100px',
  }, {
    duration: 1000,
    delay: i * 100,
    easing: 'ease-out',
  }).finished.then(() => {
    $el.style.translate = '100px';
  })
});
```

### Practical Example

```javascript
import { waapi, stagger } from 'animejs';

waapi.animate('.circle', {
  translate: '17rem',
  delay: stagger(100),
  loop: true,
  alternate: true,
});
```

**HTML structure:**

```html
<div class="medium row">
  <div class="circle"></div>
</div>
<div class="medium row">
  <div class="circle"></div>
</div>
<div class="medium row">
  <div class="circle"></div>
</div>
```

---

## Default Units

Anime.js automatically applies default units to CSS properties when animating with the Web Animation API (WAAPI). This feature simplifies syntax by eliminating the need to manually specify units for common properties.

### Code Example

```javascript
import { waapi } from 'animejs';

waapi.animate('.square', {
  opacity: .5,
  x: 250,
  rotate: 45,
  width: 40,
  height: 40,
});
```

### Properties with Automatic Default Units

| Property | Default Unit |
|----------|--------------|
| x, y, z | `'px'` |
| translateX, translateY, translateZ | `'px'` |
| rotate, rotateX, rotateY, rotateZ | `'deg'` |
| skew, skewX, skewY | `'deg'` |
| perspective | `'px'` |
| width, height | `'px'` |
| margin, padding | `'px'` |
| top, right, bottom, left | `'px'` |
| borderWidth, fontSize, borderRadius | `'px'` |

### Syntax Comparison

**Anime.js approach** (with default units):

```javascript
waapi.animate('.circle', {
  x: 100,
  y: 50,
  width: 150,
  height: 80,
});
```

**Native WAAPI equivalent** (requiring explicit units):

```javascript
const $el = document.querySelector('.circle');
$el.animate({
  translate: '100px 50px',
  width: '150px',
  height: '80px',
}, {
  duration: 1000,
  easing: 'ease-out',
}).finished.then(() => {
  $el.style.translate = '100px';
});
```

---

## Function-Based Values

Function-based values enable different values per target in Web Animation API (WAAPI) animations.

### Anime.js Syntax

```javascript
waapi.animate('.square', {
  translate: () => `${utils.random(10, 17)}rem`,
  rotate: () => utils.random(-180, 180),
  scale: (_, i) => .25 + (i * .25),
  delay: stagger(100)
});
```

### Full Implementation Example

```javascript
import { waapi, utils, stagger } from 'animejs';

waapi.animate('.square', {
  translate: () => `${utils.random(10, 17)}rem`,
  rotate: () => utils.random(-180, 180),
  scale: (_, i) => .25 + (i * .25),
  duration: $el => $el.dataset.duration,
  delay: stagger(100)
});
```

### Equivalent Native WAAPI

```javascript
document.querySelectorAll('.square').forEach(($el, i) => {
  $el.animate({
    translate: `${utils.random(10, 17)}rem`,
    rotate: utils.random(-180, 180),
    scale: .25 + (i * .25),
  }, {
    duration: 1000,
    delay: i * 100,
    easing: 'ease-out',
  }).finished.then(() => {
    $el.style.translate = '100px';
  })
});
```

### Key Features

- Functions receive element and index parameters
- Supports per-target values including duration and delay
- Compatible with utility functions like `stagger()` and `random()`
- Simplifies multi-target animations versus native WAAPI

---

## Individual CSS Transforms

Unlike CSS animations or native WAAPI, the CSS `transform` property can be animated by specifying individual properties. This feature enables granular control over separate transform attributes rather than the combined `transform` property.

### Key Constraints

- Individual transforms with WAAPI only works for browsers that support `CSS.registerProperty(propertyDefinition)`
- Individual transforms cannot be hardware-accelerated

### Valid Transform Properties

| Name | Shorthand | Default | Unit |
|------|-----------|---------|------|
| translateX | x | '0px' | 'px' |
| translateY | y | '0px' | 'px' |
| translateZ | z | '0px' | 'px' |
| rotate | - | '0deg' | 'deg' |
| rotateX | - | '0deg' | 'deg' |
| rotateY | - | '0deg' | 'deg' |
| rotateZ | - | '0deg' | 'deg' |
| scale | - | '1' | - |
| scaleX | - | '1' | - |
| scaleY | - | '1' | - |
| scaleZ | - | '1' | - |
| skew | - | '0deg' | 'deg' |
| skewX | - | '0deg' | 'deg' |
| skewY | - | '0deg' | 'deg' |

### Code Example

```javascript
import { waapi, utils } from 'animejs';

const $squares = utils.$('.square');

const animateSquares = () => {
  waapi.animate($squares, {
    x: () => utils.random(0, 17) + 'rem',
    y: () => utils.random(-1, 1) + 'rem',
    rotateX: () => utils.random(-90, 90),
    rotateY: () => utils.random(-90, 90),
    onComplete: () => animateSquares()
  });
}

animateSquares();
```

---

## Individual Property Parameters

Each property can have specific `delay`, `duration` and `ease` parameters by passing an `Object` with at least one `to` or `from` properties as value.

### Code Example

```javascript
import { waapi, utils, stagger } from 'animejs';

waapi.animate('.square', {
  y: {
    to: [0, -30, 0],
    ease: 'out(4)',
    duration: 1000,
  },
  rotate: { from: -180, to: 0, ease: 'out(3)' },
  scale: { to: [.65, 1, .65], ease: 'inOut(3)' },
  duration: 500,
  delay: stagger(75),
  loop: true,
});
```

### Key Parameters

Each property object accepts:
- **`to`** - target value(s)
- **`from`** - starting value
- **`ease`** - easing function specific to that property
- **`duration`** - animation length for that property
- **`delay`** - timing delay for that property

Global animation settings (duration, delay, loop) serve as fallbacks when individual property parameters aren't specified.

---

## Spring and Custom Easings

Anime.js supports any spring and custom JavaScript easing function. Built-in easing functions are accessed via the `eases` object, while `spring()` requires separate import.

### Imports

```javascript
import { eases } from 'animejs';
const { linear, outExpo, cubicBezier } = eases;

import { spring } from 'animejs';
```

### Built-in Easing Functions

| String Format | Function | Parameters |
|---|---|---|
| `'linear'` or `'linear(0, .5 75%, 1)'` | `linear()` | coords: `0, '.5 75%', 1` |
| `'steps'` or `'steps(10)'` | `steps()` | steps = `10` |
| `'cubicBezier'` or `'cubicBezier(.5,0,.5,1)'` | `cubicBezier()` | x1, y1, x2, y2 values |
| `'in'` or `'in(1.675)'` | `in()` | power = `1.675` |
| `'out'` or `'out(1.675)'` | `out()` | power = `1.675` |
| `'inOut'` or `'inOut(1.675)'` | `inOut()` | power = `1.675` |

**Default easing:** `'out(2)'`

### Code Example

```javascript
import { waapi, stagger, spring } from 'animejs';

waapi.animate('.circle', {
  y: [0, -30, 0],
  ease: spring({ stiffness: 150, damping: 5 }),
  delay: stagger(75),
  loop: true,
});
```

The `spring()` function accepts configuration objects with physics parameters like `stiffness` and `damping` for customized spring animations.

---

## API Differences with Native WAAPI

### Anime.js Syntax

```javascript
waapi.animate(
  '.square',
  {
    x: 100,
    y: 50,
    opacity: .5,
    loop: 3,
    alternate: true,
    ease: 'out',
  }
);
```

### Native WAAPI Syntax

```javascript
const $square = document.querySelector('.square');

$square.animate({
  translate: '100px 50px',
  opacity: .5,
}, {
  iterations: 4,
  direction: 'alternate',
  easing: 'ease-out',
});
```

### Key Structural Differences

| Aspect | Anime.js | Native WAAPI |
|--------|----------|--------------|
| **Target selection** | Accepts selectors as strings | Requires DOM elements |
| **Transform values** | Individual properties (x, y) | Combined strings (translate) |
| **Loop iterations** | `loop` property | `iterations` property |
| **Animation direction** | `alternate` boolean | `direction: 'alternate'` |
| **Easing functions** | `ease: 'out'` | `easing: 'ease-out'` |

---

## Iterations

The `iterations` parameter in native WAAPI is replaced with the `loop` parameter in Anime.js, which determines how many times the animation will repeat instead of the total number of iterations.

### Parameter Mapping

| Anime.js `loop` | Native WAAPI `iterations` | Effect |
|---|---|---|
| `0` | `1` | No repeat |
| `2` | `3` | Repeat twice |
| `Infinity` / `true` / `-1` | `Infinity` | Repeat indefinitely |

### Accepted Values

The `loop` parameter accepts:
- A `Number` in range `[0, Infinity]`
- A `Boolean` where `true` equals `Infinity` and `false` disables looping

### Code Example

**Anime.js syntax:**

```javascript
import { waapi, stagger } from 'animejs';

waapi.animate('.square', {
  translate: '17rem',
  loop: 3,
  alternate: true,
  delay: stagger(100)
});
```

**Equivalent native WAAPI:**

```javascript
const targets = document.querySelectorAll('.square');

targets.forEach(($el, i) => {
  $el.animate({
    translate: '100px',
  }, {
    fill: 'forwards',
    duration: 1000,
    iterations: 4
  })
});
```

Note: In Anime.js, `loop: 3` repeats 3 times; in native WAAPI, `iterations: 4` means 4 total iterations (1 original + 3 repeats).

---

## Direction

The `direction` parameter in native WAAPI has been replaced with two separate parameters: `reversed` and `alternate`.

### Parameter Mapping

| `direction` | `reversed` | `alternate` | Effect |
|---|---|---|---|
| `'forward'` | `false` | `false` | Play forward |
| `'reverse'` | `true` | `false` | Play backward |
| `'alternate'` | `false` | `true` | Alternate on loop |
| `'alternate-reverse'` | `true` | `true` | Start in reverse, alternate on loop |

### Code Example

**Anime.js syntax:**

```javascript
import { waapi, stagger } from 'animejs';

waapi.animate('.square', {
  translate: '17rem',
  reversed: true,
  delay: stagger(100)
});
```

**Equivalent native WAAPI:**

```javascript
const targets = document.querySelectorAll('.square');

targets.forEach(($el, i) => {
  $el.animate({
    translate: '100px',
  }, {
    fill: 'forwards',
    duration: 1000,
    direction: 'alternate-reverse',
    iterations: 4
  })
});
```

### Parameter Details

**Accepts:** `Boolean`

- `reversed`: Inverts playback direction
- `alternate`: Enables direction reversal on each loop iteration

---

## Easing

The `easing` parameter in native WAAPI is replaced by `ease` in Anime.js, which accepts easing functions beyond native WAAPI support. Default easing changed from `'linear'` to `'out(2)'`.

### Code Examples

**Anime.js Syntax:**

```javascript
waapi.animate('.square', {
  x: 100,
  ease: 'outElastic(1.25, .1)'
});
```

**Complete Implementation Example:**

```javascript
import { waapi, stagger } from 'animejs';

waapi.animate('.square', {
  translate: '17rem',
  ease: 'inOut(6)',
  delay: stagger(100)
});
```

**HTML markup:**

```html
<div class="medium row">
  <div class="square"></div>
</div>
<div class="medium row">
  <div class="square"></div>
</div>
<div class="medium row">
  <div class="square"></div>
</div>
```

### Parameter Specifications

**Accepts:**
- Any valid easing String name or Function
- Any valid native WAAPI easing function String (e.g., `'linear'`, `'ease-in-out'`)
- Custom easing functions like `'outElastic'`, `'inOut'`, etc.

### Key Differences from Native WAAPI

The `easing` parameter is replaced by the `ease` parameter and supports any type of easing `Function` alongside native options. The default changed from `'linear'` to `'out(2)'`.

---

## Finished

The `animation.finished` property from native WAAPI has been replaced with the `animation.then()` method in Anime.js. This method returns a Promise that resolves when the animation completes.

### Anime.js Implementation

**Inline usage:**

```javascript
waapi.animate(target, {
  translate: '100px',
  duration: 500,
}).then(callback);
```

**Async/await usage:**

```javascript
async function waitForAnimationToComplete() {
  return animate(target, {
    translate: '100px',
    duration: 500,
  });
}

const asyncAnimation = await waitForAnimationToComplete();
```

### Native WAAPI Equivalent

```javascript
const targets = document.querySelectorAll('.square');
const animations = [];

targets.forEach(($el, i) => {
  animations[i] = $el.animate({
    translate: '100px',
  }, {
    fill: 'forwards',
    duration: 500,
  });
});

Promise.all(
  animations
    .map((animation) => animation.finished)
    .then(() => console.log('completed'))
);
```

### Method Signature

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | Function | Executed when animation completes; receives animation as first argument |

**Returns:** `Promise`

### Code Example

```javascript
import { waapi, utils } from 'animejs';

const [ $value ] = utils.$('.value');

const animation = waapi.animate('.circle', {
  translate: '16rem',
  loop: 2,
  alternate: true,
});

animation.then(() => $value.textContent = 'fulfilled');
```

---

## waapi.convertEase()

Converts JavaScript easing functions into WAAPI-compatible linear easing formats.

### API Signature

```javascript
waapi.convertEase(easingFunction)
```

### Basic Usage

```javascript
import { waapi, spring } from 'animejs';

const springEase = spring({ stiffness: 12 });
const linearEasing = waapi.convertEase(springEase.ease);
```

### Complete Implementation Example

```javascript
import { waapi, spring } from 'animejs';

const springs = [
  spring({ stiffness: 100 }),
  spring({ stiffness: 150 }),
  spring({ stiffness: 200 })
]

document.querySelectorAll('#web-animation-api-waapi-convertease .demo .square').forEach(($el, i) => {
  $el.animate({
    translate: '17rem',
    rotate: '1turn',
  }, {
    easing: waapi.convertEase(springs[i].ease),
    delay: i * 250,
    duration: springs[i].duration,
    fill: 'forwards'
  });
});
```

### Key Details

- **Version**: Available since 4.0.0
- **Input**: Any JavaScript easing function
- **Output**: Compatible WAAPI linear easing string
- **Use Case**: Enables custom easing functions (like spring easings) to work with native Web Animation API
