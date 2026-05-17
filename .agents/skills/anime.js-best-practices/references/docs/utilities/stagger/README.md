# Anime.js Utilities: Stagger

> Source: [animejs.com/documentation/utilities/stagger](https://animejs.com/documentation/utilities/stagger)
> Available since version 2.0.0

## Overview

The `stagger()` utility creates sequential effects by distributing values progressively across multiple targets. It enables time staggering (sequential delays), values staggering (progressive value distribution), and timeline position staggering.

---

## Utilities Overview

All utilities are available through multiple import methods:

### Via utils object

```javascript
import { utils } from 'animejs';
utils.stagger();
utils.$();
utils.get();
utils.set();
```

### Direct imports

```javascript
import {
  stagger,
  $,
  get,
  set,
} from 'animejs';
```

### From subpath

```javascript
import {
  stagger,
  $,
  get,
  set,
} from 'animejs/utils';
```

### Available Utilities

**DOM & Animation Control:**
- `$()` - DOM selection
- `get()` - Get values
- `set()` - Set values
- `cleanInlineStyles()` - Remove inline styles
- `remove()` - Remove elements
- `sync()` - Synchronize animations
- `keepTime()` - Time keeper functionality

**Randomization:**
- `random()` - Random number generation
- `createSeededRandom()` - Seeded random generator
- `randomPick()` - Pick random item
- `shuffle()` - Array shuffling

**Mathematical Operations:**
- `round()`, `roundPad()` - Rounding functions
- `clamp()` - Constrain values
- `snap()` - Snap to values
- `wrap()` - Wrap values
- `mapRange()` - Range mapping
- `lerp()` - Linear interpolation
- `damp()` - Damping function

**String Formatting:**
- `padStart()`, `padEnd()` - Padding utilities

**Angle Conversion:**
- `degToRad()` - Degrees to radians
- `radToDeg()` - Radians to degrees

**Advanced:**
- `stagger()` - Staggering animations

---

## stagger() Function

### Function Signature

```javascript
import { stagger } from 'animejs';

const functionValue = stagger(value, parameters);
```

### Parameters

| Name | Accepts |
|------|---------|
| `value` | Stagger value (numerical or range) |
| `parameters` (optional) | Stagger parameters object |

### Return Value

Returns a function-based value for use in animations.

### Basic Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  x: '17rem',
  scale: stagger([1, .1]),
  delay: stagger(100),
});
```

---

## Time Staggering

> Source: [animejs.com/documentation/utilities/stagger/time-staggering](https://animejs.com/documentation/utilities/stagger/time-staggering)

Time staggering enables sequential timing adjustments across multiple animation targets by using the `stagger()` function with time-related properties like `delay` and `duration`.

### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  x: '17rem',
  delay: stagger(100),
  duration: stagger(200, { start: 500 }),
  loop: true,
  alternate: true
});
```

### How It Works

When applied to function-based animation properties, `stagger()` creates incremental timing differences between targets:

- **First target**: delay: 0ms; duration: 500ms
- **Second target**: delay: 100ms; duration: 700ms
- **Third target**: delay: 200ms; duration: 900ms
- **Fourth target**: delay: 300ms; duration: 1100ms

Each subsequent target receives an additional increment (100ms delay increase, 200ms duration increase) based on the stagger parameters.

---

## Values Staggering

> Source: [animejs.com/documentation/utilities/stagger/values-staggering](https://animejs.com/documentation/utilities/stagger/values-staggering)

Values staggering enables animated properties to have staggered values across multiple targets. Each target receives an incrementally increased value based on the stagger function's configuration.

### Code Example

```javascript
import { animate, stagger } from 'animejs';

const animation = animate('.square', {
  y: stagger(['-2.75rem', '2.75rem']),
  rotate: { from: stagger('-.125turn') },
  loop: true,
  alternate: true
});
```

### Key Concept

All tweens animatable properties accept function-based values, enabling the use of the stagger function returned by the `stagger()` method in multi-target animations.

### Usage Pattern

- Apply `stagger()` to any animatable property
- Pass numerical values, ranges `[min, max]`, or unit-based values
- Works with both absolute values and relative animations (`from` parameter)
- Integrates with loop and alternate settings

---

## Timeline Positions Staggering

> Source: [animejs.com/documentation/utilities/stagger/timeline-positions-staggering](https://animejs.com/documentation/utilities/stagger/timeline-positions-staggering)

The `stagger()` function enables staggered positioning of animations on a timeline. When used with the timeline's `add()` method, it creates sequential animations for multiple targets at intervals.

### Code Example

```javascript
import { createTimeline, stagger, utils } from 'animejs';

const tl = createTimeline();

const onComplete = ({ targets }) => {
  utils.set(targets, { color: 'var(--hex-red)' });
}

tl
  .add('.circle', { x: '15rem', onComplete })
  .label('circle completes')
  .add(['.triangle', '.square'], {
    x: '15rem',
    onComplete, // Callbacks are also staggered
  }, stagger(500, { start: 'circle completes-=500' }));
```

### Key Concepts

- **Function-based positioning:** The timeline `add()` position argument accepts function-based values, allowing the stagger function to determine animation timing for each target.
- **Incremental timing:** Each target receives its own animation starting at a staggered position.
- **Callback staggering:** Callbacks defined on staggered animations execute at staggered intervals, once per target.
- **Start parameter:** The `start` property in the stagger configuration accepts timeline position values, determining where the stagger sequence begins.

---

## Stagger Value Types

> Source: [animejs.com/documentation/utilities/stagger/stagger-value-types](https://animejs.com/documentation/utilities/stagger/stagger-value-types)

### Basic Signature

```javascript
stagger(
  '1rem',  // Stagger Value
  {
    start: 100,
    from: 2,
    reversed: false,
    ease: 'outQuad',
    grid: [8, 8],
  }
);
```

### Numerical Value

> Source: [animejs.com/documentation/utilities/stagger/stagger-value-types/numerical-value](https://animejs.com/documentation/utilities/stagger/stagger-value-types/numerical-value)

The numerical value represents how much each staggered value increments for successive elements.

**Accepted Types:**
- `Number`
- `String` containing at least one `Number`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  // Increase translateX by 5.75rem for each elements
  x: stagger('5.75rem'),
  // Increase delay by 100ms for each elements
  delay: stagger(100)
});
```

#### Output Example

```html
<div class="small row">
  <div class="square"></div>
  <div class="padded label">x: 0rem      delay: 0ms</div>
</div>
<div class="small row">
  <div class="square"></div>
  <div class="padded label">x: 5.75rem   delay: 100ms</div>
</div>
<div class="small row">
  <div class="square"></div>
  <div class="padded label">x: 11.5rem   delay: 200ms</div>
</div>
<div class="small row">
  <div class="square"></div>
  <div class="padded label">x: 17.25rem  delay: 300ms</div>
</div>
```

Each successive element receives an incremented value based on the specified numerical increment.

### Range Value

> Source: [animejs.com/documentation/utilities/stagger/stagger-value-types/range-value](https://animejs.com/documentation/utilities/stagger/stagger-value-types/range-value)

Distributes values evenly between two numerical endpoints.

**Signature:**
```javascript
stagger([startValue, endValue])
```

**Accepted Input Types:** `[Number|String, Number|String]`

Both numbers and strings (with units) are supported as range boundaries.

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  y: stagger(['2.75rem', '-2.75rem']),
  delay: stagger([0, 500]),
});
```

#### Use Cases

- Creating wave-like effects by distributing position values
- Staggering delays across a range (e.g., 0ms to 500ms)
- Animating properties with varying magnitudes across target groups

---

## Stagger Parameters

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters](https://animejs.com/documentation/utilities/stagger/stagger-parameters)

### All Parameters

| Parameter | Description |
|-----------|-------------|
| `start` | Controls the initial timing offset |
| `from` | Specifies the starting point for stagger calculations |
| `reversed` | Boolean to reverse the stagger direction |
| `ease` | Applies easing functions to stagger distribution |
| `grid` | Defines grid-based stagger patterns (array format) |
| `axis` | Specifies grid axis for stagger direction |
| `modifier` | Applies custom modifications to stagger values |
| `use` | Determines custom stagger order based on attribute |
| `total` | Sets the total number of staggered items |

### Full Signature Example

```javascript
stagger(
  '1rem',
  {
    start: 100,
    from: 2,
    reversed: false,
    ease: 'outQuad',
    grid: [8, 8],
    // additional parameters available
  }
);
```

---

### start

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-start](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-start)

Defines the initial value from which staggering begins.

**Accepts:** `Number` | Timeline time position (when used as timeline position argument)

**Default:** `0`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  x: stagger('1rem', { start: 14 }),
  delay: stagger(100, { start: 500 }),
});
```

#### Behavior

When `start: 14` is applied to an x stagger of `'1rem'`:
- First element: 14rem
- Second element: 15rem
- Third element: 16rem
- And so forth...

With `start: 500` applied to a delay stagger of `100`:
- First element: 500ms delay
- Second element: 600ms delay
- Third element: 700ms delay
- And so forth...

---

### from

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-from](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-from)

Defines the starting position of the stagger effect.

**Accepted Values:**

| Value | Purpose |
|-------|---------|
| `Number` | The starting index of the effect |
| `'first'` | Equivalent to index `0` |
| `'center'` | Starts the effect from the center |
| `'last'` | Starts the effect from the last element |
| `'random'` | Randomises the order of the staggered values |

**Default:** `0`

#### Code Example

```javascript
import { createTimeline, stagger } from 'animejs';

const tl = createTimeline({
  loop: true,
  defaults: { duration: 500 },
  delay: 500,
  loopDelay: 500
})
.add('.row:nth-child(1) .square:nth-child(8)', { color: '#FFF', scale: 1.2 })
.add('.row:nth-child(1) .square', {
  scale: 0,
  delay: stagger(25, { from: 7 }),
}, '<')
.add('.row:nth-child(2) .square:first-child', { color: '#FFF', scale: 1.2 })
.add('.row:nth-child(2) .square', {
  scale: 0,
  delay: stagger(25, { from: 'first' }),
}, '<')
.add('.row:nth-child(3) .square:nth-child(6)', { color: '#FFF', scale: 1.2 })
.add('.row:nth-child(3) .square', {
  scale: 0,
  delay: stagger(25, { from: 'center' }),
}, '<')
.add('.row:nth-child(4) .square:last-child', { color: '#FFF', scale: 1.2 })
.add('.row:nth-child(4) .square', {
  scale: 0,
  delay: stagger(25, { from: 'last' }),
}, '<')
.set('.row .square', { color: 'currentColor' })
.add('.row .square', {
  scale: 1,
  delay: stagger(25, { from: 'random' }),
})
```

---

### reversed

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-reversed](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-reversed)

Controls whether the stagger effect operates in reverse order.

**Type:** `Boolean`

**Default:** `false`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  translateX: '17rem',
  delay: stagger(100, { reversed: true }),
});
```

#### Behavior

When `reversed` is set to `true`, the stagger sequence applies delays in descending order. With 4 elements and a 100ms stagger value:

- Element 1: 300ms delay
- Element 2: 200ms delay
- Element 3: 100ms delay
- Element 4: 0ms delay

This causes animations to begin from the last element and progress backward toward the first.

---

### ease

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-ease](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-ease)

Defines an easing function applied to the distribution of staggered values.

**Accepts:** `ease` (any valid easing function)

**Default:** `'linear'`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  y: stagger(['2.75rem', '-2.75rem'], { ease: 'inOut(3)' }),
  delay: stagger(100, { ease: 'inOut(3)' }),
});
```

```html
<div class="small justified row">
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
  <div class="square"></div>
</div>
```

This parameter controls how the easing curve shapes the progression of staggered animations across multiple elements, allowing for non-linear distribution patterns.

---

### grid

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-grid](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-grid)

Distributes values on a 2D array structure.

**Accepts:** `[<Number>, <Number>]` (array of two numbers representing grid dimensions)

**Default:** `null`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

const $squares = utils.$('.square');

function animateGrid() {
  animate($squares, {
    scale: [
      { to: [0, 1.25] },
      { to: 0 }
    ],
    boxShadow: [
      { to: '0 0 1rem 0 currentColor' },
      { to: '0 0 0rem 0 currentColor' }
    ],
    delay: stagger(100, {
      grid: [11, 4],
      from: utils.random(0, 11 * 4)
    }),
    onComplete: animateGrid
  });
}

animateGrid();
```

This example uses `grid: [11, 4]` to organize 44 elements (11 columns x 4 rows) with staggered delays of 100ms each, starting from a random position within the grid.

---

### axis (Grid Axis)

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-grid-axis](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-grid-axis)

Defines the direction of a staggered grid effect by restricting which axis of the grid can update.

**Parameter Values:**

| Value | Effect |
|-------|--------|
| `'x'` | Restrict the direction to the x axis |
| `'y'` | Restrict the direction to the y axis |

#### Code Example

```javascript
import { animate, stagger, utils } from 'animejs';

const grid = [11, 4];
const $squares = utils.$('.square');

function animateGrid() {
  const from = utils.random(0, 11 * 4);
  animate($squares, {
    translateX: [
      { to: stagger('-.75rem', { grid, from, axis: 'x' }) },
      { to: 0, ease: 'inOutQuad', },
    ],
    translateY: [
      { to: stagger('-.75rem', { grid, from, axis: 'y' }) },
      { to: 0, ease: 'inOutQuad' },
    ],
    opacity: [
      { to: .5 },
      { to: 1 }
    ],
    delay: stagger(85, { grid, from }),
    onComplete: animateGrid
  });
}

animateGrid();
```

The `axis` parameter works alongside the `grid` parameter to control staggering direction. In the example, separate `axis: 'x'` and `axis: 'y'` calls apply directional staggering to different transform properties.

---

### modifier

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-modifier](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-modifier)

Defines a function to modify returned staggered values.

**Accepts:** A `Function` with the following parameter:

| Parameter | Description |
|-----------|-------------|
| `value` | The current animated numerical value |

**Returns:** `Number` | `String`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  boxShadow: [
    { to: stagger([1, .25], {
        modifier: v => `0 0 ${v * 30}px ${v * 20}px currentColor`,
        from: 'center'
      })
    },
    { to: 0 },
  ],
  delay: stagger(100, { from: 'center' }),
  loop: true
});
```

The modifier function receives a numerical stagger value and can transform it into a different number or string format. In this example, the modifier transforms stagger values into CSS box-shadow parameters.

---

### use

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-use](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-use)

> Available since version 4.1.0

Defines a custom staggering order by referencing an attribute or property containing sequential numbers starting at `0`, rather than following the natural DOM order.

**Type:** `String`

**Default:** `null`

#### Requirements

- Target properties/attributes must contain a suite of numbers starting at `0`
- When using `from`, `reversed`, or `ease` alongside `use`, you must explicitly define a `total` parameter if the highest custom index is lower than the actual target count

#### Code Example

**JavaScript:**
```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  x: '17rem',
  rotate: 90,
  delay: stagger(250, { use: 'data-index' }),
});
```

**HTML:**
```html
<div class="small row">
  <div class="square" data-index="2"></div>
  <div class="padded label">data-index="2"</div>
</div>
<div class="small row">
  <div class="square" data-index="0"></div>
  <div class="padded label">data-index="0"</div>
</div>
<div class="small row">
  <div class="square" data-index="3"></div>
  <div class="padded label">data-index="3"</div>
</div>
<div class="small row">
  <div class="square" data-index="1"></div>
  <div class="padded label">data-index="1"</div>
</div>
```

---

### total

> Source: [animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-total](https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-total)

> Available since version 4.1.0

Defines a custom staggering length instead of using the actual total count of staggered targets.

**Purpose:** Useful if the max value of the custom order defined using the `use` parameter is lower than the actual number of staggered targets when using the `from`, `reversed` or `ease` parameters.

**Type:** `Number`

**Default:** `null`

#### Code Example

```javascript
import { animate, stagger } from 'animejs';

animate('.square', {
  x: '17rem',
  rotate: 90,
  delay: stagger(250, { use: 'data-index', total: 2, reversed: true }),
});
```

In this example, `total: 2` sets the staggering calculation to work with 2 items rather than the actual number of `.square` elements in the DOM, allowing the `reversed` parameter to apply based on this custom total.

---

## Quick Reference

### Import Options

```javascript
// Option 1: Via utils object
import { utils } from 'animejs';
utils.stagger(100);

// Option 2: Direct import
import { stagger } from 'animejs';
stagger(100);

// Option 3: From subpath
import { stagger } from 'animejs/utils';
stagger(100);
```

### Common Patterns

```javascript
// Simple delay stagger
delay: stagger(100)

// Stagger with start offset
delay: stagger(100, { start: 500 })

// Range stagger
y: stagger(['-2rem', '2rem'])

// From center
delay: stagger(50, { from: 'center' })

// Reversed
delay: stagger(100, { reversed: true })

// With easing
delay: stagger(100, { ease: 'inOut(3)' })

// Grid stagger
delay: stagger(100, { grid: [10, 10], from: 'center' })

// Grid with axis restriction
translateX: stagger('1rem', { grid: [10, 10], axis: 'x' })

// With modifier function
scale: stagger([1, 0.5], { modifier: v => Math.round(v * 10) / 10 })

// Custom order via attribute
delay: stagger(100, { use: 'data-order' })

// Custom total for calculations
delay: stagger(100, { use: 'data-index', total: 5, reversed: true })
```

### Parameter Summary Table

| Parameter | Type | Default | Since |
|-----------|------|---------|-------|
| `start` | Number / Timeline position | `0` | 2.0.0 |
| `from` | Number / 'first' / 'center' / 'last' / 'random' | `0` | 2.0.0 |
| `reversed` | Boolean | `false` | 2.0.0 |
| `ease` | String (easing function) | `'linear'` | 2.0.0 |
| `grid` | [Number, Number] | `null` | 2.0.0 |
| `axis` | 'x' / 'y' | - | 2.0.0 |
| `modifier` | Function | - | 2.0.0 |
| `use` | String (attribute name) | `null` | 4.1.0 |
| `total` | Number | `null` | 4.1.0 |
