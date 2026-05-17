# Anime.js Tween Values and Parameters

> Complete reference for tween value types and tween parameters in Anime.js animations.

---

## Part 1: Tween Value Types

Tween value types specify the _start_ and _end_ values that define the animation of animatable properties.

### Overview

```javascript
animate('.square', {
  x: '6rem',
  y: $el => $el.dataset.y,
  scale: '+=.25',
  opacity: {
    from: .4,
  },
});
```

Animation values are assigned to animatable properties and accept diverse syntaxes including strings with units, relative operators, functions, and object configurations with parameters like `from`.

---

### Numerical Value

The numerical value tween type allows animation of properties using either `Number` or `String` values containing at least one number.

**Accepts:** `Number` | `String`

```javascript
import { waapi } from 'animejs';

waapi.animate('.square', {
  x: 240, //  -> 240px
  width: 75, // -> 75px
  rotate: '.75turn',
});
```

#### Default Unit Behavior

When no unit is specified for properties expecting units (like `width`), the resulting animation will use the default browser unit (typically `px`).

#### Unit Inheritance (JS Method)

```javascript
animate(target, { width: '50%' }); // Uses '%'
animate(target, { width: 75 });    // Inherits '%' -> '75%'
```

#### WAAPI Auto-Default Units

The WAAPI method automatically defaults to `px` for the following properties:
- `x`, `y`, `z`
- `perspective`
- `top`, `right`, `bottom`, `left`
- `width`, `height`
- `margin`, `padding`
- `borderWidth`, `borderRadius`
- `fontSize`

---

### Unit Conversion Value

The unit conversion value feature enables animating properties to values with different units than the defaults or currently used ones.

**Accepts:** `String`

```javascript
import { animate, utils } from 'animejs';

animate('.square', {
  width: '25%', // from '48px' to '25%',
  x: '15rem', // from '0px' to '15rem',
  rotate: '.75turn', // from `0deg` to '.75turn',
});
```

#### Important Consideration

When using the JavaScript `animate()` method, unit conversions may produce unexpected results depending on the unit type and animated properties. For more predictable behavior:

1. Define the unit externally using `utils.set()`
2. Then animate to the current unit
3. Or use the WAAPI `animate()` method instead

---

### Relative Value

Relative values enable incremental changes to target properties using mathematical operators. They modify the current value by adding, subtracting, or multiplying rather than setting absolute values.

**Accepts:** `String`

| Operator | Operation      | Examples                    |
|----------|----------------|-----------------------------|
| `'+='`   | Addition       | `'+=45'` or `'+=45px'`      |
| `'-='`   | Subtraction    | `'-=45'` or `'-=45deg'`     |
| `'*='`   | Multiplication | `'*=.5'`                    |

```javascript
import { animate, utils } from 'animejs';

const [ $clock ] = utils.$('.clock');
const [ $add ] = utils.$('.add');
const [ $sub ] = utils.$('.sub');
const [ $mul ] = utils.$('.mul');

const add = () => animate($clock, { rotate: '+=90' });
const sub = () => animate($clock, { rotate: '-=90' });
const mul = () => animate($clock, { rotate: '*=.5' });

$add.addEventListener('click', add);
$sub.addEventListener('click', sub);
$mul.addEventListener('click', mul);
```

---

### Color Value

Color values can be animated in Anime.js across multiple formats.

**Accepts:** `String`

| Format              | Syntax Examples                        |
|---------------------|----------------------------------------|
| HEX                 | `'#F44'` or `'#FF4444'`               |
| HEXA                | `'#F443'` or `'#FF444433'`            |
| RGB                 | `'rgb(255, 168, 40)'`                 |
| RGBA                | `'rgba(255, 168, 40, .2)'`            |
| HSL                 | `'hsl(255, 168, 40)'`                 |
| HSLA                | `'hsla(255, 168, 40, .2)'`            |
| Named Colors (WAAPI)| `'red'`, `'aqua'`                     |

#### Code Examples

```javascript
import { animate } from 'animejs';

// HEX Color Animation
animate('.hex', {
  background: '#FF4B4B',
});

// RGB Format
animate('.rgb', {
  background: 'rgb(255, 168, 40)',
});

// HSL Format
animate('.hsl', {
  background: 'hsl(44, 100%, 59%)',
});

// HEXA (Hex with Alpha)
animate('.hexa', {
  background: '#FF4B4B33',
});

// RGBA (RGB with Alpha)
animate('.rgba', {
  background: 'rgba(255, 168, 40, .2)',
});

// HSLA (HSL with Alpha)
animate('.hsla', {
  background: 'hsla(44, 100%, 59%, .2)',
});
```

---

### Color Function Value

The CSS `color()` function can be animated using the WAAPI `animate()` method, supporting any valid CSS color space syntax.

**Accepts:** CSS color function `String`

**Available since:** Version 4.0.0

```javascript
import { waapi } from 'animejs';

waapi.animate('.circle',  {
  backgroundColor: 'color(display-p3 1.0 0.267 0.267 / 1.0)',
});
```

---

### CSS Variable

CSS variables can be animated using the `'var(--my-value)'` syntax.

**Accepts:** CSS variable `String` in format `'var(--variable-name)'`

```javascript
import { waapi, animate, stagger } from 'animejs';

waapi.animate('.square',  {
  rotate: 'var(--rotation)',
  borderColor: ['var(--hex-orange-1)', 'var(--hex-red-1)'],
  duration: 500,
  delay: stagger(100),
  loop: true,
});

animate('.square',  {
  scale: 'var(--scale)',
  background: ['var(--hex-red-1)', 'var(--hex-orange-1)'],
  duration: 500,
  delay: stagger(100),
  loop: true,
  alternate: true,
});
```

#### Updating CSS Variables

JS animations must compute the variable value, meaning updates made separately won't be reflected unless `.refresh()` is called:

```javascript
target.style.setProperty('--x', '100px');
const anim = animate(target, { x: 'var(--x)' });
target.style.setProperty('--x', '200px');
anim.restart().refresh()
```

---

### Function-Based Value

Function-based values enable different animation values for each target in multi-target animations by accepting a function instead of a static value.

**Function Signature:**

```javascript
animate(targets, {
  property: (target, index, length) => value
});
```

**Parameters:**

| Parameter | Description                              |
|-----------|------------------------------------------|
| `target`  | The current animated target element      |
| `index`   | The index of current targeted element    |
| `length`  | The total number of animated targets     |

**Returns:** A tween value or tween parameters

```javascript
import { animate, utils } from 'animejs';

animate('.square', {
  x: $el => $el.getAttribute('data-x'),
  y: (_, i) => 50 + (-50 * i),
  scale: (_, i, l) => (l - i) * .75,
  rotate: () => utils.random(-360, 360),
  borderRadius: () => `+=${utils.random(0, 8)}`,
  duration: () => utils.random(1200, 1800),
  delay: () => utils.random(0, 400),
  ease: 'outElastic(1, .5)',
});
```

#### Key Feature

Function-based values can be re-calculated without creating a new animation using the `animation.refresh()` method.

---

## Part 2: Tween Parameters

Tween parameters configure values, timings, and behaviors of animated properties.

### Overview

Tween parameters can be set in two ways:
- **Globally**: Applied to all properties in an animation
- **Locally**: Applied to specific properties using an Object

All animatable properties inherit the _global_ parameters, which can be overridden _locally_ for a specific tween.

```javascript
animate('.square', {
  x: {
    to: 100,
    delay: 0,
    ease: 'inOut(4)'
    // Local Tween Parameters
  },
  scale: 1,
  opacity: .5,
  duration: 400,
  delay: 250,
  ease: 'out(3)',
  // Global Tween Parameters
  loop: 3,
  alternate: true,
});
```

---

### to

The `to` parameter animates toward a specified value from the current target value. It must be defined within a local tween parameter object.

**Required if:** No `from` property is defined

**Accepts:**
- Any valid Tween value type
- An Array of two Tween value keyframes in format `[fromValue, toValue]`

**Default:** Current target value (used when only `from` is defined)

```javascript
import { animate } from 'animejs';

animate('.square', {
  x: {
    to: '16rem', // From 0px to 16rem
    ease: 'outCubic',
  },
  rotate: {
    to: '.75turn', // From 0turn to .75turn
    ease: 'inOutQuad'
  },
});
```

---

### from

The `from` parameter animates from a specified value to the current target value. It must be defined within a local tween parameter object.

**Required if:** No `to` property is defined

**Accepts:** Any valid tween value type

**Default:** Current target value (used when only `to` is defined)

```javascript
import { animate } from 'animejs';

animate('.square', {
  opacity: { from: .5 }, // Animate from .5 opacity to 1 opacity
  translateX: { from: '16rem' }, // From 16rem to 0rem
  rotate: {
    from: '-.75turn', // From -.75turn to 0turn
    ease: 'inOutQuad',
  },
});
```

---

### delay

The `delay` parameter controls the timing offset before animation properties begin executing.

**Accepts:**
- `Number` >= 0 (in milliseconds)
- Function-based value returning a `Number` >= 0

**Default:** `0` milliseconds

```javascript
import { animate } from 'animejs';

const animation = animate('.square', {
  x: '17rem',
  rotate: {
    to: 360,
    delay: 1000, // Property-specific delay
  },
  delay: 500,  // Global delay for all properties
  loop: true,
  alternate: true
});
```

#### Modify Default Globally

```javascript
import { engine } from 'animejs';
engine.defaults.delay = 500;
```

---

### duration

The `duration` parameter defines how long an animation runs in milliseconds.

**Accepts:**
- `Number` >= 0
- Function-based value returning a `Number` >= 0

**Default:** `1000` milliseconds

**Note:** Duration values exceeding `1e12` or equal to `Infinity` are internally clamped to `1e12` (roughly 32 years).

```javascript
import { animate } from 'animejs';

const animation = animate('.square', {
  x: '17rem',
  rotate: {
    to: 360,
    duration: 1500, // Local duration only applied to rotate property
  },
  duration: 3000,  // Global duration applied to all properties
  loop: true,
  alternate: true
});
```

#### Modify Default Globally

```javascript
import { engine } from 'animejs';
engine.defaults.duration = 500;
```

---

### ease

The `ease` parameter defines the easing function for animated properties, controlling how the rate of change occurs during animation playback.

**Accepts:**
- An easing `Function`
- A built-in ease `String` (e.g., `'inQuad'`, `'outQuad'`)
- A function-based value returning an easing function or string

**Default:** `'out(2)'`

#### Code Examples

**Using string-based easing names:**

```javascript
animate('.row:nth-child(1) .square', {
  x: '17rem',
  rotate: 360,
  ease: 'inQuad',
});
```

**Using easing function objects:**

```javascript
import { eases } from 'animejs';

animate('.row:nth-child(2) .square', {
  x: '17rem',
  rotate: 360,
  ease: eases.outQuad,
});
```

**Using per-property easing with spring:**

```javascript
import { waapi, spring } from 'animejs';

waapi.animate('.row:nth-child(3) .square', {
  x: '17rem',
  rotate: {
    to: 360,
    ease: 'out(6)',
  },
  ease: spring({ stiffness: 70 }),
});
```

#### Modify Default Globally

```javascript
import { engine } from 'animejs';
engine.defaults.ease = 'outElastic(1, .5)';
```

---

### composition

The `composition` parameter controls how animations interact when multiple animations target the same property simultaneously.

**Accepts:**

| Mode        | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `'replace'` | Replace and cancel the running animation.                                   |
| `'none'`    | Do not replace the running animation.                                       |
| `'blend'`   | Creates an additive animation and blends its values with the running animation. |
| `0`         | Shorthand for `'replace'`                                                   |
| `1`         | Shorthand for `'none'`                                                      |
| `2`         | Shorthand for `'blend'`                                                     |

**Default:** `'replace'` if the animation targets count is below `1000`; otherwise, the default composition is set to `'none'` on the JS version if no composition mode is defined.

```javascript
import { animate, utils } from 'animejs';

const squares = utils.$('.square');
const [ $none, $replace, $blend ] = squares;

// Animate each square with a different composition mode
squares.forEach($square => {
  const mode = $square.classList[1];
  animate($square, {
    scale: [.5, 1],
    alternate: true,
    loop: true,
    duration: 750,
    composition: mode,
  });
});

const enter = { scale: 1.5, duration: 350 };
const leave = { scale: 1.0, duration: 250 };

const enterNone = () => animate($none, {
  composition: 'none', ...enter
});

const leaveNone = () => animate($none, {
  composition: 'none', ...leave
});

$none.addEventListener('mouseenter', enterNone);
$none.addEventListener('mouseleave', leaveNone);

const enterReplace = () => animate($replace, {
  composition: 'replace', ...enter
});

const leaveReplace = () => animate($replace, {
  composition: 'replace', ...leave
});

$replace.addEventListener('mouseenter', enterReplace);
$replace.addEventListener('mouseleave', leaveReplace);

const enterBlend = () => animate($blend, {
  composition: 'blend', ...enter
});

const leaveBlend = () => animate($blend, {
  composition: 'blend', ...leave
});

$blend.addEventListener('mouseenter', enterBlend);
$blend.addEventListener('mouseleave', leaveBlend);
```

#### Modify Default Globally

```javascript
import { engine } from 'animejs';
engine.defaults.composition = 'blend';
```

#### Blend Mode Limitations

The `'blend'` mode cannot be used with:
- Multiple keyframes
- Color values
- `reverse()` method
- `loop` parameter
- `reversed` parameter
- `alternate` parameter

Blended animations work best on movement-based properties like `translate`, `scale`, and `rotation`.

---

### modifier

The `modifier` parameter is a function that alters the behavior of animated numerical values. It can be applied globally or to specific properties.

**Function Signature:**

```javascript
modifier: (value: Number) => Number
```

**Parameters:**
- `value`: The current animated numerical value being processed

**Returns:** `Number`

**Default:** `null`

**Available since:** Version 4.0.0

#### Key Characteristics

- Accepts any function that takes a numerical value and returns a modified number
- Most utility functions from Anime.js can serve as modifiers
- String units (like `'px'`) are automatically appended after modification
- Can be set at animation level or per-property level

#### Code Examples

**Global rounding modifier:**

```javascript
animate('.row:nth-child(1) .square', {
  x: '17rem',
  modifier: utils.round(0),
  duration: 4000,
});
```

**Modulo operator modifier:**

```javascript
animate('.row:nth-child(2) .square', {
  x: '85rem',
  modifier: v => v % 17,
  duration: 4000,
});
```

**Property-specific modifier:**

```javascript
animate('.row:nth-child(3) .square', {
  x: '17rem',
  y: {
    to: '70rem',
    modifier: v => Math.cos(v) / 2,
  },
  duration: 4000,
});
```

#### Modify Default Globally

```javascript
import { engine } from 'animejs';
engine.defaults.modifier = utils.round(0);
```

---

## Quick Reference Summary

### Tween Value Types

| Type                  | Description                                          | Example                                    |
|-----------------------|------------------------------------------------------|--------------------------------------------|
| Numerical             | Number or string with number                         | `240`, `'.75turn'`                         |
| Unit Conversion       | String with CSS unit                                 | `'25%'`, `'15rem'`                         |
| Relative              | String with operator prefix                          | `'+=45'`, `'-=90deg'`, `'*=.5'`            |
| Color                 | HEX, RGB, HSL (with optional alpha)                  | `'#FF4B4B'`, `'rgba(255, 168, 40, .2)'`    |
| Color Function        | CSS color() function (WAAPI only)                    | `'color(display-p3 1.0 0.267 0.267 / 1.0)'`|
| CSS Variable          | var() syntax                                         | `'var(--rotation)'`                        |
| Function-Based        | Function returning value                             | `(target, index, length) => value`         |

### Tween Parameters

| Parameter   | Default       | Description                                      |
|-------------|---------------|--------------------------------------------------|
| `to`        | Current value | Target value for animation                       |
| `from`      | Current value | Starting value for animation                     |
| `delay`     | `0`           | Wait time before animation begins (ms)           |
| `duration`  | `1000`        | Animation length (ms)                            |
| `ease`      | `'out(2)'`    | Easing function                                  |
| `composition`| `'replace'`  | How animations interact (`replace`/`none`/`blend`)|
| `modifier`  | `null`        | Value transformation function                    |
