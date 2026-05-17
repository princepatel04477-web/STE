# Anime.js Utilities - Helper Functions (Part 2)

This document covers the helper utility functions in Anime.js for DOM manipulation, value manipulation, randomization, mathematical operations, string formatting, and chainable utilities.

---

## Table of Contents

1. [DOM Helper Functions](#dom-helper-functions)
   - [$()](#-dollar-sign)
   - [get()](#get)
   - [set()](#set)
   - [cleanInlineStyles()](#cleaninlinestyles)
   - [remove()](#remove)
   - [sync()](#sync)
   - [keepTime()](#keeptime)

2. [Random Functions](#random-functions)
   - [random()](#random)
   - [createSeededRandom()](#createseededrandom)
   - [randomPick()](#randompick)
   - [shuffle()](#shuffle)

3. [Mathematical Functions](#mathematical-functions)
   - [round()](#round)
   - [clamp()](#clamp)
   - [snap()](#snap)
   - [wrap()](#wrap)
   - [mapRange()](#maprange)
   - [lerp()](#lerp)
   - [damp()](#damp)

4. [String Formatting Functions](#string-formatting-functions)
   - [roundPad()](#roundpad)
   - [padStart()](#padstart)
   - [padEnd()](#padend)

5. [Angle Conversion Functions](#angle-conversion-functions)
   - [degToRad()](#degtorad)
   - [radToDeg()](#radtodeg)

6. [Chainable Utility Functions](#chainable-utility-functions)

---

## DOM Helper Functions

### $() (Dollar Sign)

Converts target parameters into an array of DOM elements, functioning as an alternative to `document.querySelectorAll()`. Within a Scope, it queries relative to the Scope's root element.

#### API Signature

```javascript
const targetsArray = utils.$(targets);
```

#### Parameters

| Name | Accepts |
|------|---------|
| targets | CSS selector or DOM Elements |

#### Return Value

An `Array` of `HTMLElement`, `SVGElement`, or `SVGGeometryElement`

#### Code Example

```javascript
import { utils, createScope } from 'animejs';

// Targets all the '.square' elements
utils.$('.square').forEach($square => {
  utils.set($square, { scale: .5 });
});

createScope({ root: '.row:nth-child(2)' }).add(() => {
  // Limits the selection to '.row:nth-child(2) .square'
  utils.$('.square').forEach($square => {
    utils.set($square, { rotate: 45 });
  });
});
```

#### HTML Structure

```html
<div class="medium justified row">
  <div class="square"></div>
  <!-- repeated 8 times -->
</div>
<!-- repeated 3 times total -->
```

#### Key Behavior

When used within a Scope context, the function uses the Scope's `root` element instead of `document`, effectively scoping selections to a specific DOM subtree.

---

### get()

Retrieves the current value of a target's property with optional unit conversion or removal.

**Available since:** v2.0.0

#### API Signature

```javascript
const value = utils.get(target, property, unit);
```

#### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| `target` | Targets | The targeted element |
| `property` | `String` | A valid property name of the target |
| `unit` (optional) | `String` \| `Boolean` | Strip the unit if set to `false` or convert the unit if a valid unit `String` is passed |

#### Return Types

| Type | Condition |
|------|-----------|
| `String` | HTMLElement or SVGElement without `unit` parameter set to `false`, or with valid unit `String` |
| `Number` | HTMLElement or SVGElement with `unit` parameter set to `false` |

#### Code Example

```javascript
import { animate, utils } from 'animejs';

const [ $raw, $rem, $num ] = utils.$('.value');
const [ $sq1, $sq2, $sq3 ] = utils.$('.square');

const getValues = () => {
  // Return the raw parsed value (string with px)
  $raw.textContent = utils.get($sq1, 'x');
  // Return the converted value with unit (string with rem)
  $rem.textContent = utils.get($sq2, 'x', 'rem');
  // Return the raw value with its unit removed (number)
  $num.textContent = utils.get($sq3, 'x', false);
}

animate('.square', {
  x: 270,
  loop: true,
  alternate: true,
  onUpdate: getValues
});
```

---

### set()

Immediately sets one or multiple properties values to one or multiple targets.

#### API Signature

```javascript
const setter = utils.set(targets, properties);
```

#### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| `targets` | Targets | The targeted element(s) |
| `properties` | `Object` | An object of valid properties and values of the target |

#### Return Value

Returns an Animation object.

#### Code Example

```javascript
import { utils, stagger } from 'animejs';

const [ $set, $revert ] = utils.$('button');
const squares = utils.$('.square');
const colors = ['red', 'orange', 'yellow'];

let setter;

const setStyles = () => {
  setter = utils.set(squares, {
    borderRadius: '50%',
    y: () => utils.random(-1, 1) + 'rem',
    scale: stagger(.1, { start: .25, ease: 'out' }),
    color: () => `var(--hex-${utils.randomPick(colors)})`
  });
  $set.setAttribute('disabled', 'true');
  $revert.removeAttribute('disabled');
}

const revertStyles = () => {
  setter.revert();
  $set.removeAttribute('disabled');
  $revert.setAttribute('disabled', 'true');
}

$set.addEventListener('click', setStyles);
$revert.addEventListener('click', revertStyles);
```

#### Important Notes

- Useful for setting complex values, but for repeatedly updating the same properties on the same targets, using an Animatable is recommended for better performance.
- Won't work if you try to set an attribute on a DOM or SVG element not already defined on the element.

---

### cleanInlineStyles()

Removes all CSS inline styles added by the specified instance.

**Available since:** v4.0.0

#### API Signature

```javascript
const cleanedInstance = utils.cleanInlineStyles(instance);
```

#### Parameters

| Name | Accepts |
|------|---------|
| instance | Animation or Timeline |

#### Return Value

Returns the passed Animation or Timeline instance.

#### Code Example

```javascript
import { animate, utils } from 'animejs';

utils.set('.square', { scale: .75 });

animate('.keep-styles', {
  x: '23rem',
  borderRadius: '50%',
});

animate('.clean-styles', {
  x: '23rem',
  borderRadius: '50%',
  // This removes the translateX and borderRadius inline styles
  // But keeps the scale previously added outside of this animation
  onComplete: utils.cleanInlineStyles
});
```

#### Usage Notes

This function is useful as an `onComplete()` callback. It removes only the inline styles added by that specific animation while preserving styles applied separately (like the `scale` property set via `utils.set()`).

---

### remove()

Removes one or multiple targets from all active animations, a specific instance, or a specific property, cancelling any Animation or Timeline referencing these targets if needed.

**Available since:** v2.0.0

#### API Signature

```javascript
const removed = utils.remove(targets, instance, propertyName);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | Targets | Elements to remove from animations |
| `instance` (optional) | Animation \| Timeline | Specific instance to target |
| `propertyName` (optional) | String | Specific animatable property name |

#### Return Value

An `Array` of the removed targeted elements.

#### Code Example

```javascript
import { animate, utils } from 'animejs';

let updates = 0;

const [ $removeFirstButton ] = utils.$('.remove-1');
const [ $removeSecondButton ] = utils.$('.remove-2');
const [ $updates ] = utils.$('.value');

const animation = animate('.square', {
  x: '17rem',
  rotate: 360,
  alternate: true,
  loop: true,
  onUpdate: () => {
    $updates.textContent = updates++;
  }
});

$removeFirstButton.onclick = () => {
  utils.remove('.row:nth-child(1) .square');
}

$removeSecondButton.onclick = () => {
  utils.remove('.row:nth-child(2) .square', animation, 'x');
}
```

---

### sync()

Executes a callback in synchronization with the engine's animation loop, ensuring code runs at the optimal timing.

#### API Signature

```javascript
utils.sync(function);
```

#### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| callback | `Function` | The function to execute synced with the engine loop |

#### Return Value

Returns a `Timer` object.

#### Code Example

```javascript
import { animate, utils } from 'animejs';

const [ $range ] = utils.$('.range');
const [ $speed ] = utils.$('.speed');

const animation = animate('.circle', {
  x: '16rem',
  loop: true,
  alternate: true,
  playbackRate: 1,
});

const updateSpeed = () => {
  const { value } = $range;
  $speed.textContent = utils.roundPad(+value, 2);
  utils.sync(() => animation.speed = value);
}

$range.addEventListener('input', updateSpeed);
```

#### Use Case

This utility is particularly useful when you need to modify animation properties in response to user input while maintaining smooth synchronization with the rendering engine loop.

---

### keepTime()

Creates a wrapper that maintains playback state when updating animation parameters. It accepts a constructor function returning a Timer, Animation, or Timeline, and returns a function that recreates the animation while preserving its current time position.

#### API Signature

```javascript
const trackedAnimate = utils.keepTime(() => animate(target, params));
const tracked = trackedAnimate();
```

#### Parameters

| Name | Accepts |
|------|---------|
| constructor | A function returning a Timer, Animation, or Timeline |

#### Return Value

A function that returns the tracked Timer, Animation, or Timeline object.

#### Code Example

```javascript
import { animate, utils } from 'animejs';

const [ $button ] = utils.$('button');
const clocks = utils.$('.clock');
let targetIndex = 0;

const animateNextTarget = utils.keepTime(() => {
  if (targetIndex > clocks.length - 1) targetIndex = 0;
  return animate(clocks[targetIndex++], {
    color: ['#B7FF54', '#FF4B4B'],
    rotate: 360,
    ease: 'linear',
    duration: 8000,
    loop: true,
  })
});

animateNextTarget();
$button.addEventListener('click', animateNextTarget);
```

#### Key Benefit

Allows to seamlessly update an animation's parameters without breaking the playback state.

---

## Random Functions

### random()

Returns a random `Number` within a specified range, with an optional third parameter determining the number of decimal places.

**Available since:** v2.0.0

#### API Signature

```javascript
const randomValue = utils.random(min, max, decimalLength);
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `min` | Number | Minimum value of range |
| `max` | Number | Maximum value of range |
| `decimalLength` | Number | Optional; decimal places (default: 0) |

#### Return Value

Returns a `Number` within the specified range.

#### Code Example

```javascript
import { utils } from 'animejs';

utils.set('.square', {
  x: () => utils.random(2, 18, 2) + 'rem',
  rotate: () => utils.random(0, 180),
  scale: () => utils.random(.25, 1.5, 3),
});
```

---

### createSeededRandom()

Returns a pre-seeded pseudo-random function that always returns the same sequence of numbers.

#### API Signature

```javascript
const seededRandom = utils.createSeededRandom(seed, min, max, decimalLength);
const randomValue = seededRandom(min, max, decimalLength);
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `seed` | Number | 0 | Initial seed value for the random generator |
| `seededMin` | Number | 0 | Minimum value (optional) |
| `seededMax` | Number | 1 | Maximum value (optional) |
| `seededDecimalLength` | Number | 0 | Number of decimal places (optional) |

#### Return Value

Returns a pre-seeded `random()` function for generating consistent random sequences.

#### Code Example

```javascript
import { utils } from 'animejs';

const seededRandom = utils.createSeededRandom(12345);

utils.set('.square', {
  x: () => seededRandom(2, 18, 2) + 'rem',
  rotate: () => seededRandom(0, 180),
  scale: () => seededRandom(.25, 1.5, 3),
});
```

#### Key Feature

Once initialized with a seed value, the function produces reproducible random sequences - identical seeds generate identical number sequences, useful for deterministic animations.

---

### randomPick()

Returns a random element from a collection.

**Available since:** v4.0.0

#### API Signature

```javascript
const randomElement = utils.randomPick(collection);
```

#### Parameters

| Name | Accepts |
|------|---------|
| collection | `Array` \| `NodeList` \| `String` |

#### Return Value

A random element from the provided collection.

#### Code Example

```javascript
import { utils } from 'animejs';

utils.set('.letter', {
  x: () => utils.randomPick([5, 9, 13, 17]) + 'rem',
  scale: () => utils.randomPick([1, 1.25, 1.5, 1.75]),
  color: () => `var(--hex-${utils.randomPick(['red', 'orange', 'yellow'])}-1)`,
  textContent: () => utils.randomPick('ABCD'),
});
```

---

### shuffle()

Randomizes the order of array elements through mutation of the original array.

#### API Signature

```javascript
const shuffledArray = utils.shuffle(array);
```

#### Parameters

| Name | Type |
|------|------|
| array | `Array` |

#### Return Value

Returns the mutated `Array` with elements in randomized order.

#### Code Example

```javascript
import { utils, animate, stagger } from 'animejs';

const [ $shuffle ] = utils.$('button');
const squares = utils.$('.square');
const x = stagger('3.2rem');

// Initial squares x position
utils.set(squares, { x });

const shuffle = () => animate(utils.shuffle(squares), { x });

$shuffle.addEventListener('click', shuffle);
```

#### HTML

```html
<div class="large row">
  <div class="square">A</div>
  <div class="square">B</div>
  <div class="square">C</div>
  <div class="square">D</div>
  <div class="square">E</div>
  <div class="square">F</div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button>Shuffle</button>
  </fieldset>
</div>
```

#### CSS

```css
#utilities-shuffle .square {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(var(--rgb-current-1), .25);
}

#utilities-shuffle .docs-demo-template .square {
  opacity: 0;
}
```

---

## Mathematical Functions

### round()

Rounds a `Number` to a specified number of decimal places or creates a rounding `Function` with preset parameters.

**Available since:** v4.0.0

#### API Signature

```javascript
const roundedValue = utils.round(value, decimalLength);
const roundingFunction = utils.round(decimalLength);
```

#### Parameters

| Name | Type | Details |
|------|------|---------|
| `value` | `Number` | Optional; the number to round |
| `decimalLength` | `Number` | Specifies decimal place precision |

#### Return Value

Returns either:
- A `Number` when a value is provided
- A chainable utility `Function` for rounding with preset decimal length

#### Chainable Usage Example

```javascript
const clampAndRound = utils.clamp(0, 100).round(2);
clampAndRound(72.7523);  // Returns 72.75
clampAndRound(120.2514); // Returns 100
```

#### Code Example

```javascript
import { animate, utils } from 'animejs';

animate('.normal', {
  rotate: '1turn',
  duration: 3000,
  loop: true,
});

animate('.rounded', {
  rotate: '1turn',
  modifier: utils.round(1), // Function with preset decimal length
  duration: 3000,
  loop: true,
});
```

---

### clamp()

Restricts a number between specified min and max values, or creates a reusable clamping function.

#### API Signature

```javascript
const clampedValue = utils.clamp(value, min, max);
const clamperFunction = utils.clamp(min, max);
```

#### Parameters

| Name | Type | Details |
|------|------|---------|
| `value` | `Number` | Optional; the number to constrain |
| `min` | `Number` | Lower boundary |
| `max` | `Number` | Upper boundary |

#### Return Value

Returns a `Number` when a value argument is provided. Without a value, returns a chainable function that constrains numbers between the specified boundaries.

#### Usage Examples

**Direct clamping:**

```javascript
utils.clamp(50, 0, 100);  // Returns 50
utils.clamp(120, 0, 100); // Returns 100
utils.clamp(-15, 0, 100); // Returns 0
```

**Creating a reusable clamper:**

```javascript
const clampBetween0and100 = utils.clamp(0, 100);
clampBetween0and100(90);   // 90
clampBetween0and100(120);  // 100
clampBetween0and100(-15);  // 0
```

**Chaining with other utilities:**

```javascript
const clampAndRound = utils.clamp(0, 100).round(2);
clampAndRound(72.7523);    // 72.75
clampAndRound(120.2514);   // 100
```

**Animation modifier example:**

```javascript
animate('.clamped', {
  rotate: '1turn',
  modifier: utils.clamp(.25, .75),
  duration: 3000,
  loop: true,
  ease: 'inOut',
});
```

---

### snap()

Rounds numbers to the nearest increment or creates a reusable snapping function. When an array is provided, it selects the closest value from that array.

#### API Signature

```javascript
const snappedValue = utils.snap(value, increment);
const snapperFunction = utils.snap(increment);
```

#### Parameters

| Name | Type | Notes |
|------|------|-------|
| `value` (optional) | `Number` | The value to snap |
| `increment` | `Number` or `Array<Number>` | Target increment or array of values |

#### Return Value

Returns a `Number` when a value is provided, otherwise returns a chainable utility function for snapping.

#### Usage Examples

**Numeric increment:**

```javascript
const snapTo10 = utils.snap(10);
snapTo10(94);  // 90
snapTo10(-17); // -20
```

**Array-based snapping:**

```javascript
const snapToArray = utils.snap([0, 50, 100]);
snapToArray(30);  // 50
snapToArray(75);  // 100
snapToArray(-10); // 0
```

**Chaining with other utilities:**

```javascript
const clampAndSnap = utils.clamp(0, 100).snap(30);
clampAndSnap(72.7523); // 60
clampAndSnap(120.2514); // 90
```

**Practical Animation Example:**

```javascript
animate('.snapped', {
  rotate: '1turn',
  modifier: utils.snap(.25),
  duration: 3000,
  loop: true,
  ease: 'inOut',
});
```

This applies snapping as a modifier during animation, constraining rotation to quarter-turn increments.

---

### wrap()

Wraps a number between a range defined by min/max values, or creates a reusable wrapper function.

#### API Signature

```javascript
const wrappedValue = utils.wrap(value, min, max);
const wrapperFunction = utils.wrap(min, max);
```

#### Parameters

| Name | Type | Notes |
|------|------|-------|
| value | Number | Optional - if omitted, returns a function |
| min | Number | Lower boundary |
| max | Number | Upper boundary |

#### Return Value

- **With value provided**: Returns a wrapped `Number`
- **Without value**: Returns a chainable `Function` for wrapping numbers

#### Usage Examples

**Direct wrapping:**

```javascript
utils.wrap(105, 0, 100);  // Returns 5
utils.wrap(220, 0, 100);  // Returns 20
utils.wrap(-15, 0, 100);  // Returns 85
```

**Pre-configured wrapper function:**

```javascript
const wrapBetween0and100 = utils.wrap(0, 100);
wrapBetween0and100(105);   // 5
wrapBetween0and100(220);   // 20
wrapBetween0and100(-15);   // 85
```

**With chaining:**

```javascript
const wrapAndRound = utils.wrap(0, 100).round(2);
wrapAndRound(105.7523);    // 5.75
wrapAndRound(220.2514);    // 20.25
```

#### Practical Animation Example

Using `wrap()` as a modifier to constrain rotation values between -0.25 and 0.25 turns during a looping animation.

---

### mapRange()

Maps a `Number` from one range to another or creates a mapping `Function` with pre-defined range parameters.

#### API Signature

```javascript
const mappedValue = utils.mapRange(value, fromLow, fromHigh, toLow, toHigh);
const mapperFunction = utils.mapRange(fromLow, fromHigh, toLow, toHigh);
```

#### Parameters

| Name | Type | Notes |
|------|------|-------|
| value | Number | Optional |
| fromLow | Number | Required |
| fromHigh | Number | Required |
| toLow | Number | Required |
| toHigh | Number | Required |

#### Return Value

Returns either a `Number` when a value is supplied, or a chainable utility `Function` for mapping ranges.

#### Code Examples

**Direct mapping:**

```javascript
import { animate, utils } from 'animejs';

animate('.normal', {
  rotate: '12turn',
  duration: 12000,
  loop: true,
  ease: 'inOut',
});

animate('.mapped', {
  rotate: '12turn',
  modifier: utils.mapRange(0, 12, 0, 1),
  duration: 12000,
  loop: true,
  ease: 'inOut',
});
```

**Function currying examples:**

```javascript
const mapFrom0and100to0and200 = utils.mapRange(0, 100, 0, 200);
mapFrom0and100to0and200(45);   // Returns: 90
mapFrom0and100to0and200(120);  // Returns: 240
mapFrom0and100to0and200(-15);  // Returns: -30

const normalizeAndClamp = utils.mapRange(-100, 100, 0, 1).clamp(0, 1);
normalizeAndClamp(50);   // Returns: 0.75
normalizeAndClamp(120);  // Returns: 1
```

---

### lerp()

Performs linear interpolation between two values.

**Available since:** v4.0.0

#### API Signature

```javascript
const interpolatedValue = utils.lerp(start, end, progress);
const interpolatorFunction = utils.lerp(start, end);
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `start` | Number | Starting value |
| `end` | Number | Ending value |
| `progress` (optional) | Number `[0-1]` | Interpolation progress |

#### Return Value

Returns a **Number** when progress is provided. Without progress, returns a chainable utility function for interpolation between start and end values.

#### Usage Examples

**Direct interpolation with progress:**

```javascript
utils.lerp(0, 100, 0.5);  // 50
utils.lerp(0, 100, 0.75); // 75
utils.lerp(0, 100, 0.25); // 25
```

**Creating an interpolator function:**

```javascript
const interpolateBetween0and100 = utils.lerp(0, 100);
interpolateBetween0and100(0.5);  // 50
interpolateBetween0and100(0.75); // 75
```

**Chaining with other utilities:**

```javascript
const interpolateAndRound = utils.lerp(0, 100).round(2);
interpolateAndRound(0.677523); // 67.75
interpolateAndRound(1.202514); // 100
```

**Practical Animation Example:**

```javascript
import { animate, utils } from 'animejs';

animate('.interpolated', {
  rotate: '1turn',
  modifier: utils.lerp(0, 12), // Maps 0-1 progress to 0-12
  duration: 3000,
  loop: true,
  ease: 'inOut',
});
```

---

### damp()

A frame rate independent interpolation function that performs linear interpolation between two values, accounting for deltaTime for consistent behavior across different frame rates.

#### API Signature

```javascript
const lerped = utils.damp(start, end, deltaTime, amount);
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `start` | `Number` | Starting value |
| `end` | `Number` | Ending value |
| `deltaTime` | `Number (ms)` | Time delta in milliseconds |
| `amount` | `Number [0-1]` | Interpolation factor; closer to 1 approaches end value |

#### Return Value

`Number` - The interpolated value

#### Usage Examples

```javascript
utils.damp(0, 100, 8, 0);     // Returns: 0
utils.damp(0, 100, 8, 0.5);   // Returns: 50
utils.damp(0, 100, 8, 1);     // Returns: 100
```

#### Complete Code Example

```javascript
import { animate, createTimer, utils } from 'animejs';

const [ $input ] = utils.$('.input');
const [ $lerped ] = utils.$('.lerped');
const [ $lerped15fps ] = utils.$('.lerped-15');

animate($input, {
  rotate: '1000turn',
  modifier: utils.snap(.25),
  duration: 4000000,
  loop: true,
  ease: 'linear',
});

const dampedLoop = createTimer({
  frameRate: 15,
  onUpdate: clock => {
    const sourceRotate = utils.get($input, 'rotate', false);
    const lerpedRotate = utils.get($lerped15fps, 'rotate', false);
    utils.set($lerped15fps, {
      rotate: utils.damp(lerpedRotate, sourceRotate, clock.deltaTime, .075) + 'turn'
    });
  }
});
```

#### Key Distinction

Unlike `utils.lerp()`, `damp()` accounts for frame rate variations, making it suitable for consistent animations across different refresh rates.

---

## String Formatting Functions

### roundPad()

Rounds a value to a specified decimal length, pads with zeros if needed, and returns the result as a string.

**Available since:** v4.0.0

#### API Signature

```javascript
const roundedPaddedValue = utils.roundPad(value, decimalLength);
const roundPadderFunction = utils.roundPad(decimalLength);
```

#### Parameters

| Name | Accepts |
|------|---------|
| value (optional) | `Number` / `String` |
| decimalLength | `Number` |

#### Return Value

Returns a `String` when a value is provided. Without a value, it returns a chainable utility `Function` that rounds and pads numbers to the specified decimal length.

#### Usage Examples

**Chainable function approach:**

```javascript
const roundPadTo2Decimals = utils.roundPad(2);
roundPadTo2Decimals(90.12345);  // '90.12'
roundPadTo2Decimals(120);       // '120.00'
roundPadTo2Decimals(15.9);      // '15.90'
```

**Chained with other utilities:**

```javascript
const snapAndRoundPad = utils.snap(50).roundPad(2);
snapAndRoundPad(123.456); // '100.00'
snapAndRoundPad(175.789); // '200.00'
```

**Animation modifier example:**

```javascript
animate('.value', {
  textContent: '8.1',
  modifier: utils.roundPad(3),
  duration: 10000,
  ease: 'linear',
});
```

---

### padStart()

Pads a number from the start with a string until reaching a specified length, or creates a reusable padding function with pre-defined parameters.

#### API Signature

```javascript
const paddedValue = utils.padStart(value, totalLength, padString);
const padderFunction = utils.padStart(totalLength, padString);
```

#### Parameters

| Name | Accepts | Notes |
|------|---------|-------|
| `value` (optional) | `String` / `Number` | Value to pad |
| `totalLength` | `Number` | Target length after padding |
| `padString` | `String` | Character(s) to use for padding |

#### Return Value

- **String** if a value argument is provided
- **Chainable Function** if only `totalLength` and `padString` are provided, enabling functional composition

#### Usage Examples

**Direct Padding:**

```javascript
utils.padStart(123, 5, '0');    // '00123'
utils.padStart(78, 5, '0');     // '00078'
utils.padStart('1234', 5, '0'); // '01234'
```

**Reusable Padding Function:**

```javascript
const padTo5WithZeros = utils.padStart(5, '0');
padTo5WithZeros('123');  // '00123'
padTo5WithZeros(78);     // '00078'
```

**Function Chaining:**

```javascript
const roundAndPad = utils.round(2).padStart(5, '0');
roundAndPad(12.345);  // '12.35'
roundAndPad(7.8);     // '07.80'
```

**Animation Modifier:**

```javascript
animate('.value', {
  textContent: 10000,
  modifier: utils.round(0).padStart(6, '-'),
  duration: 100000,
  ease: 'linear',
});
```

---

### padEnd()

Pads a number from the end with a string until reaching a specified length, or creates a reusable padding function with pre-configured parameters.

#### API Signature

```javascript
const paddedValue = utils.padEnd(value, totalLength, padString);
const padderFunction = utils.padEnd(totalLength, padString);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `value` | String / Number | Optional - the value to pad |
| `totalLength` | Number | Desired final length |
| `padString` | String | Character(s) to use for padding |

#### Return Value

- **With value provided:** Returns a padded `String`
- **Without value:** Returns a chainable utility `Function` accepting numbers/strings to pad

#### Usage Examples

**Direct padding:**

```javascript
utils.padEnd('123', 5, '0');  // '12300'
utils.padEnd(78, 5, '0');     // '78000'
```

**Chainable function approach:**

```javascript
const padTo5WithZeros = utils.padEnd(5, '0');
padTo5WithZeros('123');  // '12300'
padTo5WithZeros(78);     // '78000'
padTo5WithZeros('1234'); // '12340'
```

**Chaining with other utilities:**

```javascript
const roundAndPadEnd = utils.round(0).padEnd(5, '0');
roundAndPadEnd(123.456); // '12300'
roundAndPadEnd(7.8);     // '80000'
```

**Practical Animation Example:**

```javascript
animate('.value', {
  textContent: 1,
  modifier: utils.round(3).padEnd(6, '-'),
  duration: 100000,
  ease: 'linear',
});
```

This chains `round(3)` then `padEnd(6, '-')` to format animated values.

---

## Angle Conversion Functions

### degToRad()

Converts degrees into radians.

#### API Signature

```javascript
const radians = utils.degToRad(degrees);
```

#### Parameters

- **degrees (optional)**: `Number` - The degree value to convert

#### Return Value

Either a `Number` (if degrees provided) or a chainable utility `Function` for degree-to-radian conversion.

#### Usage Examples

```javascript
const degToRad = utils.degToRad();
degToRad(360); // 6.283185307179586

const roundDegToRad = utils.degToRad().round(2);
roundDegToRad(180); // 3.14
roundDegToRad(90);  // 1.57
```

#### Code Example

```javascript
import { animate, createAnimatable, utils } from 'animejs';

const radAnimatable = createAnimatable('.rad', {
  rotate: { unit: 'rad', duration: 0 },
});

const [ $deg ] = utils.$('.deg');

const degAnimation = animate($deg, {
  rotate: '360deg',
  ease: 'linear',
  loop: true,
  onUpdate: () => {
    const degrees = utils.get($deg, 'rotate', false);
    radAnimatable.rotate(utils.degToRad(degrees));
  }
});
```

This example rotates an element in degrees while simultaneously updating a second element's rotation in radians.

---

### radToDeg()

Converts radians into degrees.

#### API Signature

```javascript
const degrees = utils.radToDeg(radians);
```

#### Parameters

- **radians (optional)**: `Number` - The radian value to convert

#### Return Value

Returns a `Number` when radians are provided. Without arguments, returns a chainable utility function for converting radians to degrees.

#### Usage Examples

**Basic usage:**

```javascript
utils.radToDeg(1.7453292519943295); // 100
utils.radToDeg(Math.PI);            // 180
```

**Chainable usage:**

```javascript
const radToDeg = utils.radToDeg();
radToDeg(1.7453292519943295); // 100
radToDeg(Math.PI);            // 180

const roundRadToDeg = utils.radToDeg().round(2);
roundRadToDeg(Math.PI / 7);  // 25.71
```

#### Complete Example

```javascript
import { animate, createAnimatable, utils } from 'animejs';

const degAnimatable = createAnimatable('.deg', {
  rotate: { unit: 'deg', duration: 0 }
});

const [ $rad ] = utils.$('.rad');

const degAnimation = animate($rad, {
  rotate: (Math.PI * 2) + 'rad',
  ease: 'linear',
  loop: true,
  onUpdate: () => {
    const radians = utils.get($rad, 'rotate', false);
    degAnimatable.rotate(utils.radToDeg(radians));
  }
});
```

---

## Chainable Utility Functions

Chainable utility functions allow for the creation of complex operations by combining multiple functions in a single expression.

### Supported Functions

The following utilities support chaining:

- `round()`
- `clamp()`
- `snap()`
- `wrap()`
- `mapRange()`
- `interpolate()` / `lerp()`
- `roundPad()`
- `padStart()`
- `padEnd()`
- `degToRad()`
- `radToDeg()`

### Creating Chainable Functions

Chainable functions are created when calling a utility function without its optional value parameter.

```javascript
const chainableClamp = utils.clamp(0, 100);
const result = chainableClamp(150); // 100
```

### Code Examples

**Basic Chaining Example:**

```javascript
const clampRoundPad = utils.clamp(0, 100).round(2).padStart(6, '0');
clampRoundPad(125)   // '000100'
clampRoundPad(75.25) // '075.25'
```

**Multi-step Chaining:**

```javascript
const normalizeAndRound = utils.mapRange(0, 255, 0, 1).round(1);
normalizeAndRound(128); // '0.5'
normalizeAndRound(64);  // '0.3'
```

**Real-world Animation Example:**

```javascript
import { animate, utils } from 'animejs';

animate('.value', {
  textContent: 1000,
  modifier: utils.wrap(0, 10).roundPad(3).padStart(6, '0'),
  duration: 100000,
  alternate: true,
  loop: true,
  ease: 'linear',
});
```

### Integration

Chainable functions work great in combination with the `modifier` tween parameter, allowing complex value transformations during animation playback.

---

## Summary

The Anime.js utility helper functions provide a comprehensive toolkit for:

1. **DOM Operations**: Selecting elements (`$`), getting/setting properties (`get`, `set`), cleaning styles (`cleanInlineStyles`), removing targets (`remove`), syncing with the engine loop (`sync`), and maintaining playback state (`keepTime`).

2. **Randomization**: Generating random numbers (`random`), creating reproducible sequences (`createSeededRandom`), picking random elements (`randomPick`), and shuffling arrays (`shuffle`).

3. **Mathematical Operations**: Rounding (`round`), constraining values (`clamp`), snapping to increments (`snap`), wrapping values (`wrap`), mapping ranges (`mapRange`), interpolating (`lerp`), and frame-rate independent damping (`damp`).

4. **String Formatting**: Rounding with padding (`roundPad`), padding at start (`padStart`), and padding at end (`padEnd`).

5. **Angle Conversion**: Converting between degrees and radians (`degToRad`, `radToDeg`).

6. **Chainable Utilities**: Combining multiple utility functions into complex transformations that work seamlessly with animation modifiers.
