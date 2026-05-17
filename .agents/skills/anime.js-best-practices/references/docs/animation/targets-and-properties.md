# Anime.js Animation: Targets and Animatable Properties Reference

This document provides a comprehensive reference for Anime.js v4 targets and animatable properties, extracted from the official documentation.

---

## Part 1: Targets

Targets are defined as the first argument of the `animate()` function and specify the elements to which property value changes are applied.

### Basic Syntax

```javascript
animate(
  '.square', // Targets
  {
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
  }
);
```

---

### 1.1 CSS Selector Targets

Target one or multiple DOM elements using standard CSS selector syntax.

**API Signature:**
```javascript
animate(selector, properties)
```

**Accepts:** Any `String` accepted by `document.querySelectorAll()`

**Code Examples:**

```javascript
import { animate } from 'animejs';

animate('.square', { x: '17rem' });
animate('#css-selector-id', { rotate: '1turn' });
animate('.row:nth-child(3) .square', { scale: [1, .5, 1] });
```

**HTML Structure:**
```html
<div class="medium row">
  <div class="square"></div>
</div>
<div class="medium row">
  <div id="css-selector-id" class="square"></div>
</div>
<div class="medium row">
  <div class="square"></div>
</div>
```

**Key Details:**
- Supports complex selectors including pseudo-classes and descendant combinators
- Targets single or multiple DOM elements simultaneously
- Available since version 1.0.0

---

### 1.2 DOM Elements Targets

Animate one or multiple DOM elements by passing direct references.

**Accepted Types:**
- `HTMLElement`
- `SVGElement`
- `SVGGeometryElement`
- `NodeList`

**Code Example:**

```javascript
import { animate } from 'animejs';

const $demo = document.querySelector('#selector-demo');
const $squares = $demo.querySelectorAll('.square');

animate($demo, { scale: .75 });
animate($squares, { x: '23rem' });
```

**HTML Structure:**
```html
<div id="selector-demo">
  <div class="medium row">
    <div class="square"></div>
  </div>
  <div class="medium row">
    <div class="square"></div>
  </div>
  <div class="medium row">
    <div class="square"></div>
  </div>
</div>
```

**Key Points:**
- Single elements are targeted using `querySelector()`
- Multiple elements are targeted using `querySelectorAll()` which returns a `NodeList`
- Properties like `scale` and positional values like `x` can be animated on these targets

---

### 1.3 JavaScript Objects Targets

Animate properties within JavaScript `Object` instances or Class instances.

**Accepted Types:**
- `Object` - Plain JavaScript objects
- Instance of `Class` - Custom class instances

**Code Example:**

```javascript
import { animate, utils } from 'animejs';

const [ $log ] = utils.$('code');

const vector2D = { x: 0, y: 0 };

animate(vector2D, {
  x: 100,
  y: 150,
  modifier: utils.round(0),
  onUpdate: () => $log.textContent = JSON.stringify(vector2D),
});
```

**Key Characteristics:**
- Animates numerical properties within JavaScript objects
- The `modifier` parameter can round values to integers during animation
- The `onUpdate` callback can log the current state as JSON
- Updates the display in real-time as values change from initial state to target values

---

### 1.4 Array of Targets

Target multiple valid targets simultaneously by grouping them inside an `Array`. Any types of targets can be grouped together.

**API Signature:**
```javascript
animate(targetArray, animationProperties)
```

**Accepts:** An `Array` of valid target types (CSS selectors, DOM elements, JavaScript objects, or combinations thereof)

**Code Example:**

```javascript
import { animate, utils } from 'animejs';

const [ $log ] = utils.$('code');

const vector2D = { x: 0, y: 0 };

animate([vector2D, '.square'], {
  x: '17rem',
  modifier: utils.roundPad(2).padStart(5, '0'),
  onRender: () => $log.textContent = JSON.stringify(vector2D),
});
```

**Key Features:**
- Supports heterogeneous arrays mixing different target types
- Applies the same animation properties to all targets simultaneously
- Compatible with callbacks like `onRender` for tracking animation progress
- Enables coordinated animations across multiple elements and objects

---

## Part 2: Animatable Properties

Six types of properties can be animated in Anime.js:

1. CSS Properties
2. CSS Transforms
3. CSS Variables
4. JavaScript Object Properties
5. HTML Attributes
6. SVG Attributes

---

### 2.1 CSS Properties

Any CSS numerical and color properties can be animated. Properties with dashes (like `background-color`) require camelCase conversion (`backgroundColor`) or string notation.

**Performance Note:**
> "Most CSS properties can cause layout changes or repaint leading to choppy animations. To achieve smoother animations, always prioritise opacity and CSS transforms as much as possible."

**Code Example:**

```javascript
import { animate } from 'animejs';

animate('.square', {
  left: 'calc(7.75rem * 2)',
  borderRadius: 64,
  'background-color': '#F9F640',
  filter: 'blur(5px)',
});
```

**HTML Target:**
```html
<div class="large row">
  <div class="square"></div>
</div>
```

**Animatable CSS Properties Include:**
- `left` (numerical)
- `borderRadius` (numerical)
- `background-color` or `backgroundColor` (color)
- `filter` (functional)
- `opacity` (numerical)
- Any other numerical or color CSS property

---

### 2.2 CSS Transforms

Anime.js allows you to animate individual CSS transform properties directly in the parameter object, providing greater control than standard CSS animations.

**Valid Individual CSS Transform Properties:**

| Property | Shorthand | Default Value | Default Unit |
|----------|-----------|---------------|--------------|
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
| perspective | - | '0px' | 'px' |

**Code Example (JS approach):**

```javascript
import { animate } from 'animejs';

animate('.square', {
  x: '15rem',
  scale: 1.25,
  skew: -45,
  rotate: '1turn',
});
```

**Code Example (WAAPI approach - recommended):**

```javascript
import { waapi } from 'animejs';

waapi.animate('.square', {
  transform: 'translateX(15rem) scale(1.25) skew(-45deg) rotate(1turn)',
});
```

**Key Notes:**
- The JS `animate()` method requires inline styles
- WAAPI's `animate()` method is recommended for direct transform property animation
- Individual transforms with WAAPI only works for browsers that support `CSS.registerProperty`
- Uses fallback for unsupported browsers

---

### 2.3 CSS Variables

CSS variables with numerical or color values can be animated by passing the variable name as a string to animation parameters. This enables animation of properties on pseudo-elements like `::after` and `::before`.

**Code Example:**

```javascript
import { animate, utils } from 'animejs';

// Assign CSS variables to animated elements
utils.set('.square', {
  '--radius': '4px',
  '--x': '0rem',
  '--pseudo-el-after-scale': '1',
  borderRadius: () => 'var(--radius)',
  translateX: () => 'var(--x)',
});

// Animate the CSS variable values
animate('.square', {
  '--radius': '20px',
  '--x': '16.5rem',
  '--pseudo-el-after-scale': '1.55'
});
```

**HTML:**
```html
<div class="medium row">
  <div class="css-variables square"></div>
</div>
```

**CSS:**
```css
.demo .css-variables.square:after {
  position: absolute;
  opacity: .5;
  top: 0;
  left: 0;
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  background: currentColor;
  border-radius: inherit;
  transform: scale(var(--pseudo-el-after-scale));
}
```

**Key Details:**
- Using a function prevents the variables from being converted
- For WAAPI-powered animations, register properties using `CSS.registerProperty(propertyDefinition)` or fallback to no animation
- Pseudo-element variables use naming convention: `--pseudo-el-{element}-{property}`

---

### 2.4 JavaScript Object Properties

Numerical and color JavaScript `Object` properties can be passed directly to the animation parameters.

**Code Example:**

```javascript
import { animate, utils } from 'animejs';

const myObject = {
  number: 1337,
  unit: '42%',
}

const [ $log ] = utils.$('code');

animate(myObject, {
  number: 50,
  unit: '100%',
  modifier: utils.round(0),
  onRender: function() {
    // Update display with current object state
    $log.textContent = JSON.stringify(myObject);
  }
});
```

**Animatable Property Types:**
- Numerical values
- Properties containing unit-based strings (like percentages)

**Core Parameters Used:**
- `number`: Target numeric value for animation
- `unit`: Target string value with units
- `modifier`: Function to format output values (example shows rounding)
- `onRender`: Callback executed during each animation frame to update the display

---

### 2.5 HTML Attributes

Numerical and color HTML attributes can be passed directly to the animation parameters.

**Code Example:**

```javascript
import { animate, utils } from 'animejs';

animate('input', {
  value: 1000, // animate the input "value" attribute
  alternate: true,
  loop: true,
  modifier: utils.round(0),
});
```

**Supported Attribute Types:**
- Numerical HTML attributes
- Color HTML attributes

**Use Cases:**
- Animating an input element's `value` attribute
- Looping and alternating animations
- Rounding values to whole numbers using the `round()` utility modifier

---

### 2.6 SVG Attributes

Numerical and color SVG attributes can be passed directly to animation parameters.

**Code Example:**

```javascript
import { animate } from 'animejs';

animate(['feTurbulence', 'feDisplacementMap'], {
  baseFrequency: .05,
  scale: 15,
  alternate: true,
  loop: true
});

animate('polygon', {
  points: '64 68.64 8.574 100 63.446 67.68 64 4 64.554 67.68 119.426 100',
  alternate: true,
  loop: true
});
```

**HTML Structure:**
```html
<svg width="128" height="128" viewBox="0 0 128 128">
  <filter id="displacementFilter">
    <feTurbulence type="turbulence" numOctaves="2" baseFrequency="0" result="turbulence"/>
    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="1" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <polygon points="64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96" fill="currentColor"/>
</svg>
```

**CSS:**
```css
.demo polygon {
  filter: url(#displacementFilter)
}
```

**Key Features:**
- Animate numerical SVG attributes (`baseFrequency`, `scale`, points coordinates)
- Target multiple SVG elements simultaneously
- Support for animation parameters like `alternate` and `loop`
- For more advanced SVG animations, refer to dedicated SVG utility methods (`morphTo`, `createDrawable`, `createMotionPath`)

---

## Quick Reference Summary

### Target Types

| Type | Example | Description |
|------|---------|-------------|
| CSS Selector | `'.square'` | Any valid CSS selector string |
| DOM Element | `document.querySelector('#el')` | HTMLElement, SVGElement, NodeList |
| JavaScript Object | `{ x: 0, y: 0 }` | Plain objects or class instances |
| Array of Targets | `[obj, '.square', element]` | Mix of any target types |

### Animatable Property Types

| Type | Example | Notes |
|------|---------|-------|
| CSS Properties | `opacity`, `backgroundColor` | Use camelCase or string notation |
| CSS Transforms | `x`, `scale`, `rotate` | Shorthand available for translate |
| CSS Variables | `'--my-var'` | String notation required |
| JS Object Properties | `number`, `unit` | Numerical and color values |
| HTML Attributes | `value` | Numerical and color attributes |
| SVG Attributes | `baseFrequency`, `points` | Filter and shape attributes |

### Performance Best Practices

1. Prioritize `opacity` and CSS transforms for smooth animations
2. Use WAAPI for better transform animation performance
3. Avoid animating layout-triggering properties when possible
4. Use `modifier` functions to control value precision
