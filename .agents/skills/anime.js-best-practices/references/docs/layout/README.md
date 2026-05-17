# Anime.js Layout API Reference

> Automatically animates between two HTML layout states, allowing you to easily animate properties that are normally impossible or hard to animate like CSS display, flex direction, grid settings, and DOM order.

**Available since:** v4.3.0

## Table of Contents

- [Creating a Layout](#creating-a-layout)
- [Usage](#usage)
  - [Specifying a Root](#specifying-a-root)
  - [CSS Display Property Animation](#css-display-property-animation)
  - [Staggered Layout Animation](#staggered-layout-animation)
  - [DOM Order Change Animation](#dom-order-change-animation)
  - [Enter Layout Animation](#enter-layout-animation)
  - [Exit Layout Animation](#exit-layout-animation)
  - [Swap Parent Animation](#swap-parent-animation)
  - [Animate Modal Dialog](#animate-modal-dialog)
- [Layout Settings](#layout-settings)
- [States Parameters](#states-parameters)
- [Layout Methods](#layout-methods)
- [Layout ID Attribute](#layout-id-attribute)
- [Layout Callbacks](#layout-callbacks)
- [Layout Properties](#layout-properties)
- [Common Auto Layout Gotchas](#common-auto-layout-gotchas)

---

## Creating a Layout

### Main Entry Point

```javascript
import { createLayout } from 'animejs';
const layout = createLayout(root, parameters);
```

### Standalone Module

```javascript
import { createLayout } from 'animejs/layout';
```

### Parameters

| Name | Accepts |
|------|---------|
| `root` | CSS selector or DOM element |
| `parameters` (optional) | Object with Layout settings & states parameters |

**Returns:** `AutoLayout` instance

### Animating a Layout

Two approaches:

**Method 1 - Record and Animate:**

```javascript
layout.record();
// ... make layout changes ...
layout.animate();
```

**Method 2 - Update with Callback:**

```javascript
layout.update(({ root }) => root.classList.toggle('grid'));
```

### Complete Example

```javascript
import { createLayout, utils, stagger } from 'animejs';

const layout = createLayout('.layout-container');
let i = 0;

function animateLayout() {
  return layout.update(({ root }) => {
    root.dataset.grid = (++i % 4) + 1;
  }, {
    duration: 1000,
    delay: stagger(150),
    onComplete: () => animateLayout()
  });
}

const layoutAnimation = animateLayout();
```

---

## Usage

### Specifying a Root

The root is the mandatory parameter for creating a layout. It defines which element the layout measures and constrains all child queries to its descendants.

#### API Signature

```javascript
createLayout(root)
```

#### Parameters

**root** (Required)
- **Type**: CSS selector string or DOM element
- **Purpose**: Specifies the root element to be measured and animated
- **Behavior**: All children queries are limited to descendants of this element; by default, all children are animated

#### Code Example

```javascript
import { createLayout, utils } from 'animejs';

const [ $rootA, $rootB ] = utils.$('.layout-container');
const [ $buttonA, $buttonB ] = utils.$('.controls button');

const layoutA = createLayout($rootA);
const layoutB = createLayout($rootB);

function animateLayoutA() {
  layoutA.update(({ root }) => root.classList.toggle('row'));
}

function animateLayoutB() {
  layoutB.update(({ root }) => root.classList.toggle('row'));
}

$buttonA.addEventListener('click', animateLayoutA);
$buttonB.addEventListener('click', animateLayoutB);
```

#### Key Points

- Root parameter is the only mandatory parameter needed
- Accepts both CSS selectors and DOM elements as input
- Elements outside the root can be targeted using layout id data attributes
- The root object is accessible within layout methods for direct manipulation

---

### CSS Display Property Animation

The `AutoLayout` feature automatically animates between CSS display properties like `flex`, `grid`, or `none`. Custom entering and leaving states can be defined for elements hidden with `display: none` or `visibility: hidden`.

#### Code Example

```javascript
import { createLayout, utils, stagger } from 'animejs';

const [ $button ] = utils.$('.controls button');
const items = utils.$('.item');

const displayClasses = [
  'flex-row',
  'grid-1',
  'flex-col',
  'none',
  'grid-2',
  'flex-row-reverse',
];

const layout = createLayout('.layout-container', {
  // Custom animation state for elements leaving the layout with display: none
  leaveTo: {
    transform: 'scale(0)',
    delay: stagger(75),
  },
});

let index = 0;

function animateLayout() {
  layout.update(({ root }) => {
    root.classList.remove(displayClasses[index]);
    index++;
    if (index > displayClasses.length - 1) index = 0;
    root.classList.add(displayClasses[index]);
    $button.textContent = displayClasses[index];
  });
}

$button.addEventListener('click', animateLayout);
```

#### HTML Structure

```html
<div class="large layout centered row">
  <div class="layout-container flex-row">
    <div class="item col">Item A</div>
    <div class="item col">Item B</div>
    <div class="item col">Item C</div>
  </div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button class="button">flex-row</button>
  </fieldset>
</div>
```

#### CSS Styles

```css
.grid-1 {
  display: grid;
  grid-template-columns: 1fr 1fr;

  & > :last-child:nth-child(odd) {
    grid-column: span 2;
  }
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;

  & > :first-child {
    grid-column: span 2;
  }
}

.none .item {
  display: none;
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row-reverse {
  display: flex;
  flex-direction: row-reverse;
}
```

---

### Staggered Layout Animation

The `AutoLayout` `delay` property accepts the `stagger()` utility to create staggered animations of layout children changes.

#### Code Example

```javascript
import { createLayout, utils, stagger } from 'animejs';

const [ $button ] = utils.$('.controls button');
const [ $root ] = utils.$('.layout-container');
const items = utils.$('.item');

const layout = createLayout($root, { ease: 'outExpo' });

function animateLayout() {
  layout.update(() => {
    $root.classList.toggle('row');
  }, {
    // Different stagger "from" param depending on the layout state
    delay: stagger(50, { from: $root.classList.contains('row') ? 'last' : 'first' })
  });
}

$button.addEventListener('click', animateLayout);
```

#### HTML Structure

```html
<div class="large layout centered row">
  <div class="layout-container">
    <div class="item col">Item A</div>
    <div class="item col">Item B</div>
    <div class="item col">Item C</div>
    <div class="item col">Item D</div>
    <div class="item col">Item E</div>
  </div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button class="button">Stagger animation</button>
  </fieldset>
</div>
```

#### CSS Styling

```css
.layout-container {
  overflow: scroll;
  flex-wrap: nowrap;
}

.layout-container .item {
  min-height: 2rem;
}
```

#### Key Parameters

- **`delay`**: Accepts `stagger()` utility with timing value (e.g., `50`)
- **`from`**: Stagger direction option (`'first'` or `'last'`)
- **`ease`**: Animation easing (e.g., `'outExpo'`)

---

### DOM Order Change Animation

The Layout feature automatically animates DOM order changes when using the `layout.update()` method.

#### Code Example

```javascript
import { createLayout, utils } from 'animejs';

const [ $button ] = utils.$('.controls button');

const layout = createLayout('.layout-container');

function animateLayout() {
  layout.update(({ root }) => {
    const items = [...root.querySelectorAll('.item')];
    utils.shuffle(items).forEach($el => root.appendChild($el))
  });
}

$button.addEventListener('click', animateLayout);
```

#### HTML Structure

```html
<div class="large layout centered row">
  <div class="layout-container row">
    <div class="item col">A</div>
    <div class="item col">B</div>
    <div class="item col">C</div>
    <div class="item col">D</div>
    <div class="item col">E</div>
    <div class="item col">F</div>
    <div class="item col">G</div>
  </div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button class="button">Shuffle</button>
  </fieldset>
</div>
```

#### Key Concepts

The workflow involves:

1. Creating a layout instance targeting a container
2. Modifying DOM order within the update callback
3. The library detects position changes and applies smooth animations

---

### Enter Layout Animation

The enter layout animation feature automatically animates elements entering the layout, with optional initial properties and timing via the `enterFrom` state parameter.

#### Code Example

```javascript
import { createLayout, utils } from 'animejs';

const [ $button ] = utils.$('.controls button');

const layout = createLayout('.layout-container', {
  duration: 250,
  ease: 'outQuad',
  enterFrom: {
    transform: 'translateY(100px) scale(.25)',
    opacity: 0,
    duration: 350, // Applied to the elements entering the layout
    ease: 'out(3)' // Applied to the elements entering the layout
  }
});

let count = 0;

function addItem() {
  layout.update(({ root }) => {
    const $item = document.createElement('div');
    $item.classList.add('item', 'col');
    $item.textContent = ++count;
    if (count > 15) return $button.disabled = true;
    root.appendChild($item);
  });
}

$button.addEventListener('click', addItem);
```

#### HTML Template

```html
<div class="large layout centered row">
  <div class="layout-container col grid-layout row"></div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button class="button">Add item</button>
  </fieldset>
</div>
```

#### Configuration Parameters

- **duration**: Animation duration (250ms in example)
- **ease**: Easing function ('outQuad' in example)
- **enterFrom**: Specifies initial state for entering elements
  - **transform**: CSS transform applied initially
  - **opacity**: Starting opacity (default: 0)
  - **duration**: Animation duration for entering elements
  - **ease**: Easing for entering elements

---

### Exit Layout Animation

The exit layout animation feature automatically animates elements leaving the layout, and optionally specifies their final properties and timings using the `leaveTo` state parameter, which defaults to `opacity: 0`.

#### Code Example

```javascript
import { createLayout, utils } from 'animejs';

const [ $button ] = utils.$('.controls button');

const layout = createLayout('.layout-container', {
  duration: 250,
  ease: 'outQuad',
  leaveTo: {
    transform: 'translateY(-100px) scale(.25)',
    opacity: 0,
    duration: 350,
    ease: 'out(3)'
  }
});

function removeItem() {
  layout.update(({ root }) => {
    const items = root.querySelectorAll('.item:not(.is-hidden)');
    if (!items.length) return $button.disabled = true;
    items[0].classList.add('is-hidden');
  }).then(() => {
    layout.leaving.forEach($el => $el.remove());
  });
}

$button.addEventListener('click', removeItem);
```

#### Configuration Parameters

**`leaveTo` object:**
- `transform` - CSS transform values applied during exit
- `opacity` - Fade effect during exit
- `duration` - Timing specific to leaving elements
- `ease` - Easing function for exit animation

**Main layout options:**
- `duration: 250` - Layout reflow timing
- `ease: 'outQuad'` - Easing for layout changes

#### Workflow Pattern

1. Update layout visibility using `classList.add('is-hidden')`
2. Trigger animation via `layout.update()`
3. Access exiting elements via `layout.leaving` array
4. Remove DOM nodes after animation completes in `.then()` callback

---

### Swap Parent Animation

This feature automatically animates child elements being moved from one parent element to another using the Layout API.

#### Code Example

```javascript
import { createLayout, utils } from 'animejs';

const [ $button ] = utils.$('.controls button');

const layout = createLayout('.layout');

function animateLayout() {
  layout.update(({ root }) => {
    const $child = root.querySelector('.item');
    const $parent = $child.parentElement;
    const $nextParent = $parent.nextElementSibling || $parent.previousElementSibling;
    $parent.style.zIndex = '0';
    $nextParent.style.zIndex = '1';
    $nextParent.appendChild($child);
  })
}

$button.addEventListener('click', animateLayout);
```

#### HTML Structure

```html
<div class="large layout centered row">
  <div class="layout-container container-a col grid-layout row">
    <div class="item col">Item A</div>
  </div>
  <div class="layout-container container-b col grid-layout row">
  </div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button class="button">Swap parent</button>
  </fieldset>
</div>
```

#### CSS Styling

```css
.container-b {
  flex: 2;
}
```

---

### Animate Modal Dialog

Easily create seamless transitions between a clickable element and its expanded version inside a modal.

#### Code Example

```javascript
import { createLayout, utils } from 'animejs';

const buttons = utils.$('button');

// Create demo dialog and append it to the body
const $dialog = document.createElement('dialog');
$dialog.id = 'layout-dialog';
document.body.appendChild($dialog);

// Create the modal layout by setting the dialog as the root
const modalLayout = createLayout($dialog, {
  children: ['.item', 'h2', 'h3', 'p'],
  properties: ['--overlay-alpha'],
});

const closeModal = (e) => {
  let $item;
  modalLayout.update(({ root }) => {
    $dialog.close();
    $item = buttons.find(item => item.classList.contains('is-open'));
    $item.classList.remove('is-open');
    $item.focus();
  });
};

const openModal = e => {
  const $target = e.target;
  const $item = $target.closest('.item');
  const $clone = $item.cloneNode(true);
  // Clear dialog content before appending
  while ($dialog.firstChild) {
    $dialog.removeChild($dialog.firstChild);
  }
  $dialog.appendChild($clone);
  modalLayout.update(() => {
    $dialog.showModal();
    $item.classList.add('is-open');
  }, {
    duration: $item.dataset.duration
  });
}

buttons.forEach($button => $button.addEventListener('click', openModal));
$dialog.addEventListener('cancel', closeModal);
$dialog.addEventListener('click', closeModal);
```

#### Key Configuration

**createLayout() Parameters:**
- `root`: Dialog element
- `children`: Array of selectors to animate
- `properties`: CSS variables to animate (e.g., overlay opacity)

**modalLayout.update() Method:**
- Accepts callback function for DOM changes
- Optional settings object with `duration` parameter
- Automatically animates layout transitions

#### Technique Notes

Use layout IDs and the `children` setting to animate elements from outside the modal root into the dialog container.

---

## Layout Settings

The `createLayout()` function accepts a settings object that configures layout animations.

### Full Settings Example

```javascript
import { createLayout } from 'animejs';

createLayout('.layout-container', {
  children: '.item',
  duration: 350,
  delay: 0,
  ease: 'inOut(3.5)',
  properties: ['boxShadow'],
  enterFrom: { opacity: 0 },
  leaveTo: { opacity: 0 },
  swapAt: { opacity: 0 },
  onBegin: () => {},
  onUpdate: () => {},
  onComplete: () => {},
}).then(() => {});
```

### Available Settings Parameters

| Parameter | Description |
|-----------|-------------|
| `children` | Selector or reference for child elements to animate |
| `delay` | Time before animation begins |
| `duration` | Animation length in milliseconds |
| `ease` | Easing function (e.g., `'inOut(3.5)'`) |
| `properties` | Array of CSS properties to animate (e.g., `['boxShadow']`) |

---

## States Parameters

States parameters define CSS properties applied during specific transition phases when elements enter, leave, or swap positions in a layout.

### Code Example

```javascript
import { createLayout } from 'animejs';

createLayout('.layout-container', {
  children: '.item',
  duration: 350,
  delay: 0,
  ease: 'inOut(3.5)',
  properties: ['boxShadow'],
  enterFrom: { opacity: 0 },
  leaveTo: { opacity: 0 },
  swapAt: { opacity: 0 },
  onBegin: () => {},
  onUpdate: () => {},
  onComplete: () => {},
}).then(() => {});
```

### State Parameters Overview

Each parameter accepts an object of CSS properties with optional `delay`, `duration`, and `ease` overrides.

| Parameter | Purpose |
|-----------|---------|
| `enterFrom` | Properties applied when elements appear in layout |
| `leaveTo` | Properties applied when elements disappear from layout |
| `swapAt` | Properties applied to non-animated children during transitions |

### Element Arrays

After calling `layout.update()` or `layout.animate()`, three arrays populate on the layout instance:

- **`layout.entering`**: Elements that appeared in the layout
- **`layout.leaving`**: Elements that disappeared from the layout
- **`layout.swapping`**: Non-animated children during transitions

These arrays clear and repopulate on each `.animate()` call.

---

## Layout Methods

The `AutoLayout` instance returned by `createLayout()` provides four core methods:

### API Structure

```javascript
const layout = createLayout(root, parameters);

layout.record();   // Records layout states
layout.animate();  // Animates between recorded layout states
layout.update();   // Updates layout calculations
layout.revert();   // Reverts to previous layout states
```

### Method 1: record() and animate()

```javascript
const layout = createLayout(rootEl);

layout.record();
// Modify the DOM state
rootEl.classList.toggle('row');
// Animate the transition
layout.animate();
```

### Method 2: update()

```javascript
const layout = createLayout(rootEl);

layout.update(() => rootEl.classList.toggle('row'));
```

The `update()` method combines record, DOM update, and animate in one call.

---

## Layout ID Attribute

The Layout ID attribute feature allows automatic animation between two elements in different DOM locations without cloning or moving them. Elements sharing the same `data-layout-id` will animate when visibility states toggle.

### Code Example

**JavaScript:**

```javascript
import { createLayout, utils } from 'animejs';

const [ $button ] = utils.$('.controls button');
const [ $itemA1, $itemA2 ] = utils.$('.item');

// Manually set the same layout id to both items
$itemA1.dataset.layoutId = "item-A";
$itemA2.dataset.layoutId = "item-A";

// Hide item 2
$itemA2.classList.add('is-hidden');

const layout = createLayout('.layout');

function animateLayout() {
  layout.update(({ root }) => {
    // Toggle the visibility and alternate between the two items
    $itemA1.classList.toggle('is-hidden');
    $itemA2.classList.toggle('is-hidden');
  });
}

$button.addEventListener('click', animateLayout);
```

**HTML:**

```html
<div class="large layout centered row">
  <div class="layout-container container-a col grid-layout row">
    <div class="item col">Item A</div>
  </div>
  <div class="layout-container container-b col grid-layout row">
    <div class="item col">Item A</div>
  </div>
</div>
<div class="medium row">
  <fieldset class="controls">
    <button class="button">Toggle visibility</button>
  </fieldset>
</div>
```

**CSS:**

```css
.item.is-hidden {
  display: none;
}
```

### Key Concepts

- Layout ids are automatically assigned or can be manually defined using a `data-layout-id` attribute
- When two elements share the same ID and one is hidden while the other is visible, automatic animation occurs between them
- Primary use case: create an animation between two elements in different parts of the DOM without having to clone or move them

---

## Layout Callbacks

Layout animations inherit all Timeline callbacks, allowing you to execute functions at specific points during playback like you would with a regular Timeline.

### Code Example

```javascript
import { createLayout } from 'animejs';

createLayout(root, {
  children: '.item',
  duration: 350,
  delay: 0,
  ease: 'inOut(3.5)',
  properties: ['boxShadow'],
  enterFrom: { opacity: 0 },
  leaveTo: { opacity: 0 },
  swapAt: { opacity: 0 },
  onBegin: () => {},
  onUpdate: () => {},
  onComplete: () => {},
}).then(() => {});
```

### Available Callbacks

| Callback | Description |
|----------|-------------|
| `onBegin` | Executes when animation starts |
| `onUpdate` | Executes during animation playback |
| `onComplete` | Executes when animation finishes |

### Additional Method

The `.then()` method is available on the Timeline returned by `.update()` or `.animate()` methods for promise-based sequencing.

---

## Layout Properties

The `createLayout()` function returns an `AutoLayout` instance with the following properties:

### Core Properties

| Property | Type | Description |
|----------|------|-------------|
| `params` | Object | Configuration object passed to `createLayout()` |
| `root` | HTMLElement | Resolved root element where measurements start |
| `children` | String/Array | Selector(s) used to find tracked elements each time `.record()` runs |
| `properties` | Set<String> | Set of CSS property names interpolated whenever their values change |
| `timeline` | Timeline/null | Timeline instance returned by the last `.animate()` / `.update()` call |
| `id` | Number | Incremental identifier useful for debugging |

### Animation State Properties

| Property | Type | Description |
|----------|------|-------------|
| `enterFromParams` | Object | Animation parameters for nodes entering the layout |
| `leaveToParams` | Object | Animation parameters for nodes leaving the layout |
| `swapAtParams` | Object | Animation parameters for nodes swapping during a layout transition |

### Measurement Snapshots

| Property | Type | Description |
|----------|------|-------------|
| `oldState` | LayoutSnapshot | Previous measurements with `.getNode()` and `.getComputedValue()` helpers |
| `newState` | LayoutSnapshot | Latest measurements with snapshot inspection methods |

### Runtime Arrays

| Property | Type | Description |
|----------|------|-------------|
| `animating` | Array<DOMTarget> | DOM nodes animated during latest `.animate()` call |
| `entering` | Array<DOMTarget> | DOM nodes entering during latest `.animate()` call |
| `leaving` | Array<DOMTarget> | DOM nodes leaving during latest `.animate()` call |
| `swapping` | Array<DOMTarget> | DOM nodes swapped during latest `.animate()` call |

### Usage Note

Runtime arrays reset after each `.animate()` call; inspect them immediately after to coordinate custom states before timeline completion.

---

## Common Auto Layout Gotchas

### 1. Elements Fading Out Unexpectedly

**Issue:** When using a `children` selector, non-target descendants fade to opacity 0 then back to 1 when their size changes.

**Solution:**

```javascript
const layout = createLayout('#root', {
  children: '.card',
  swapAt: { opacity: 1 }
});
```

**Explanation:** Elements that are descendants of matched children (but not targets themselves) will only get their state updated at 50% of the transition progress. Use `swapAt: { opacity: 1 }` to keep all descendants visible during transitions.

---

### 2. Text Jumping During Layout Transitions

**Issue:** Animating `fontSize` with `width` or `height` causes text reflow mid-animation.

**Workaround:** Apply `white-space: nowrap` to prevent wrapping when text reflow isn't needed.

---

### 3. Inlined Elements Not Animating

**Problem HTML:**

```html
<p>Some text <span class="highlight">inline element</span> more text</p>
```

**Solution HTML:**

```html
<p><span>Some text</span> <span class="highlight">inline element</span> <span>more text</span></p>
```

**Explanation:** Elements adjacent to text nodes are excluded from position animations to prevent breaking text flow. Wrap text in span tags to enable animation.

---

### 4. Transform Shorthands Not Working

**Won't Work:**

```javascript
createLayout('#root', {
  enterFrom: { scale: 0 }
});
```

**Correct Approach:**

```javascript
createLayout('#root', {
  enterFrom: { transform: 'scale(0)' }
});
```

**Note:** The `enterFrom`, `leaveTo`, and `swapAt` parameters do not support CSS transform shorthands. Use full transform strings instead.

---

### 5. SVG Elements Not Animated

**Limitation:** SVG elements and their descendants are excluded from layout animations. Only HTML elements are tracked and animated.

---

## Quick Reference

### Import Methods

```javascript
// Full library import
import { createLayout } from 'animejs';

// Standalone module import
import { createLayout } from 'animejs/layout';
```

### Basic Pattern

```javascript
// Create layout
const layout = createLayout('.container', {
  duration: 350,
  ease: 'outQuad'
});

// Animate changes
layout.update(({ root }) => {
  // Make DOM changes here
  root.classList.toggle('active');
});
```

### Complete Settings Object

```javascript
createLayout(root, {
  // Settings
  children: '.item',
  duration: 350,
  delay: 0,
  ease: 'inOut(3.5)',
  properties: ['boxShadow'],

  // State parameters
  enterFrom: { opacity: 0, transform: 'scale(0.5)' },
  leaveTo: { opacity: 0, transform: 'scale(0.5)' },
  swapAt: { opacity: 1 },

  // Callbacks
  onBegin: () => {},
  onUpdate: () => {},
  onComplete: () => {},
});
```
