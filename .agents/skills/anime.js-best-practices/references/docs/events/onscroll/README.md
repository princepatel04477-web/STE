# Anime.js onScroll Events Documentation

The `onScroll()` function triggers and synchronises Timer, Animation and Timeline instances on scroll. It creates ScrollObserver instances that can be declared directly in the `autoplay` parameter.

## Import Methods

```javascript
import { onScroll, animate } from 'animejs';
animate(targets, { x: 100, autoplay: onScroll(parameters) });
```

Or as a standalone module:

```javascript
import { onScroll } from 'animejs/events';
```

## Function Signature

```javascript
onScroll(parameters) => ScrollObserver
```

**Parameter:** `parameters` - An object containing ScrollObserver settings, thresholds, sync modes, and callbacks

**Returns:** `ScrollObserver`

## Complete Code Example

```javascript
import { animate, createTimer, createTimeline, utils, onScroll } from 'animejs';

const [container] = utils.$('.scroll-container');
const debug = true;

// Animation
animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  autoplay: onScroll({ container, debug })
});

// Timer
const [$timer] = utils.$('.timer');
createTimer({
  duration: 2000,
  alternate: true,
  loop: true,
  onUpdate: self => {
    $timer.textContent = self.iterationCurrentTime
  },
  autoplay: onScroll({
    target: $timer.parentNode,
    container,
    debug
  })
});

// Timeline
const circles = utils.$('.circle');
createTimeline({
  alternate: true,
  loop: true,
  autoplay: onScroll({
    target: circles[0],
    container,
    debug
  })
})
.add(circles[2], { x: '9rem' })
.add(circles[1], { x: '9rem' })
.add(circles[0], { x: '9rem' });
```

---

## ScrollObserver Settings

Configuration properties used in the `onScroll()` function to control scroll-based animations.

### Settings Overview

```javascript
animate('.square', {
  x: 100,
  autoplay: onScroll({
    container: '.container',
    target: '.section',
    axis: 'y',
    enter: 'bottom top',
    leave: 'top bottom',
    sync: true,
    onEnter: () => {},
    onLeave: () => {},
    onUpdate: () => {},
  })
});
```

---

### container

Specifies which `HTMLElement` receives the scroll event listener for scroll-based animation synchronization.

**Type:** `HTMLElement | string | null`

**Default:** `null`

**Accepted Values:**
- CSS Selector: String targeting a DOM element (e.g., `'.scroll-container'`)
- DOM Element: Direct reference to an `HTMLElement`

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  ease: 'inOutQuad',
  autoplay: onScroll({
    container: '.scroll-container'
  })
});
```

**HTML Structure:**

```html
<div class="scroll-container scroll-y">
  <div class="scroll-content grid square-grid">
    <div class="scroll-section padded">
      <div class="large centered row">
        <div class="label">scroll down</div>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large row">
        <div class="square"></div>
      </div>
    </div>
  </div>
</div>
```

---

### target

Specifies which HTML element triggers scroll events in the `onScroll` function.

**Type:** `HTMLElement | string`

**Default:**
- Within animations: Defaults to the first targeted HTML element
- Outside animations: Defaults to `null`

**Accepted Values:**
- CSS Selector (string)
- DOM Element (HTMLElement object)

```javascript
import { createTimer, utils, onScroll } from 'animejs';

const [ $timer ] = utils.$('.timer');

createTimer({
  duration: 2000,
  alternate: true,
  loop: true,
  onUpdate: self => {
    $timer.textContent = self.iterationCurrentTime
  },
  autoplay: onScroll({
    target: $timer,
    container: '.scroll-container',
  })
});
```

---

### debug

Displays markers to better visualise the `enter` and `leave` threshold values. Each ScrollObserver instance has a dedicated color. The left side of the ruler represents the container threshold, and the right side the target threshold values.

**Type:** `Boolean`

**Default:** `false`

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  ease: 'inOutQuad',
  autoplay: onScroll({
    container: '.scroll-container',
    debug: true,
  })
});
```

---

### axis

Specifies the scroll direction of the ScrollObserver container HTMLElement.

**Type:** `'x' | 'y'`

**Default:** `'y'`

**Accepted Values:**
- `'x'` - horizontal scroll direction
- `'y'` - vertical scroll direction

```javascript
import { animate, utils, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  ease: 'inOutQuad',
  autoplay: onScroll({
    container: '.scroll-container',
    axis: 'x',
  })
});
```

**HTML Structure:**

```html
<div class="scroll-container scroll-x">
  <div class="scroll-content grid square-grid">
    <div class="scroll-section padded">
      <div class="large centered row">
        <div class="label">scroll right</div>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large row">
        <div class="square"></div>
      </div>
    </div>
  </div>
</div>
```

---

### repeat

Controls whether scroll synchronization should continue after the linked animation completes.

**Type:** `Boolean`

**Default:** `true`

When `true`, the scroll synchronisation should repeat after the linked object completes. Setting it to `false` causes the scrollContainer to revert upon animation completion.

```javascript
import { createTimer, onScroll, utils } from 'animejs';

const [ $repeat ] = utils.$('.repeat .value');
const [ $noRepeat ] = utils.$('.no-repeat .value');

let repeatUpdates = 0;
let noRepeatUpdates = 0;

createTimer({
  duration: 1000,
  autoplay: onScroll({
    container: '.scroll-container',
    target: '.repeat',
    enter: 'bottom-=40 top',
    leave: 'top+=60 bottom',
    onUpdate: () => $repeat.textContent = repeatUpdates++,
    repeat: true,
    debug: true,
  })
});

createTimer({
  duration: 1000,
  autoplay: onScroll({
    container: '.scroll-container',
    target: '.no-repeat',
    enter: 'bottom-=40 top',
    leave: 'top+=60 bottom',
    onUpdate: () => $noRepeat.textContent = noRepeatUpdates++,
    repeat: false,
    debug: true,
  })
});
```

---

## ScrollObserver Thresholds

The conditions that determine when an element enters or leaves the viewport are specified by comparing two pairs of values: the target and container `start` and `end` values.

**Default enter:** `'end start'`
**Default leave:** `'start end'`

### Three Syntax Patterns

**Object Syntax:**

```javascript
onScroll({
  enter: { target: 'top', container: 'bottom' },
  leave: { target: 'bottom', container: 'top' }
});
```

**Container Value String:**

```javascript
onScroll({
  enter: 'bottom',
  leave: 'top'
});
```

**Container and Target Shorthand:**

```javascript
onScroll({
  enter: 'bottom top',
  leave: 'top bottom'
});
```

---

### Numeric Values

Define an offset from the top of the target and container by passing numeric values. Without a unit, values are interpreted as pixels.

| Type | Example | Description |
|------|---------|-------------|
| Number | `100` | 100px from the top of the target or container |
| Unit | `'1rem'` | 1rem from the top of the target or container |
| Percentage | `'10%'` | 10% of target/container height from top |

**Default Unit:** `px` (pixels)

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  ease: 'inOutQuad',
  autoplay: onScroll({
    container: '.scroll-container',
    // 80% from top of container, -50px from top of target
    enter: '80% 20%',
    // 50px from top of container, 100px from top of target
    leave: '50 -25',
    debug: true
  })
});
```

---

### Positions Shorthands

Positions shorthands define target and container positioning through named string values.

| Value | Returns |
|-------|---------|
| `'top'` | The top y value |
| `'bottom'` | The bottom y value |
| `'left'` | The left x value |
| `'right'` | The right x value |
| `'center'` | The center x or y value |
| `'start'` | Equivalent to `'top'` and `'left'` depending on axis |
| `'end'` | Equivalent to `'bottom'` and `'right'` depending on axis |

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  ease: 'inOutQuad',
  autoplay: onScroll({
    container: '.scroll-container',
    enter: 'center top',
    leave: 'center bottom',
    debug: true
  })
});
```

---

### Relative Position Values

Define coordinates relative to the target and container top using relative value syntax.

| Prefix | Effect | Example |
|--------|--------|---------|
| `'+='` | Addition | `'+=45'` |
| `'-='` | Subtraction | `'-=50%'` |
| `'*='` | Multiplication | `'*=.5'` |

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  alternate: true,
  loop: true,
  ease: 'inOutQuad',
  autoplay: onScroll({
    container: '.scroll-container',
    enter: 'center+=1em top-=100%',
    leave: 'center-=1em bottom+=100%',
    debug: true
  })
});
```

---

### Min Max

The `min` and `max` threshold values define scroll boundaries for triggering enter/leave conditions, particularly useful when target elements are positioned at scroll extremes.

| Value | Purpose |
|-------|---------|
| `'min'` | The minimum value possible to meet the enter or leave condition |
| `'max'` | The maximum value possible to meet the enter or leave condition |

```javascript
import { animate, onScroll, utils } from 'animejs';

utils.$('.square').forEach($square => {
  animate($square, {
    x: '15rem',
    rotate: '1turn',
    duration: 2000,
    alternate: true,
    ease: 'inOutQuad',
    autoplay: onScroll({
      container: '.scroll-container',
      sync: 1,
      enter: 'max bottom',
      leave: 'min top',
      debug: true
    })
  });
});
```

---

## ScrollObserver Synchronisation Modes

The `sync` property determines the behaviour of the animation and how it is synchronised relative to the scroll progress or by meeting certain thresholds.

```javascript
animate('.square', {
  x: 100,
  autoplay: onScroll({
    container: '.container',
    target: '.section',
    axis: 'y',
    enter: 'bottom top',
    leave: 'top bottom',
    sync: true,  // Synchronisation Mode
    onEnter: () => {},
    onLeave: () => {},
    onUpdate: () => {},
  })
});
```

---

### Method Names

Define a list of method names from a linked object that will be called when specific scroll callbacks are triggered.

**Type:** String containing space-separated names of Animation, Timer, or Timeline method names.

**Default:** `'play pause'`

#### Callback Definition Orders

**Single Callback: `'enter'`**

Triggers a method when the enter threshold is crossed or element re-enters the viewport.

```javascript
{
  sync: 'play',
}
```

**Two Callbacks: `'enter leave'`**

Triggers separate methods for enter and leave threshold crossings.

```javascript
{
  sync: 'play pause',
}
```

**Four Callbacks: `'enterForward leaveForward enterBackward leaveBackward'`**

Specifies distinct methods for scrolling direction and threshold combinations.

```javascript
{
  sync: 'play pause reverse reset',
}
```

**Full Example:**

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  duration: 2000,
  autoplay: onScroll({
    container: '.scroll-container',
    enter: 'bottom-=50 top',
    leave: 'top+=60 bottom',
    sync: 'resume pause reverse reset',
    debug: true
  })
});
```

---

### Playback Progress

Perfectly synchronises a linked animation's playback to the scroll position.

**Accepted Values:** `1` or `true`

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  ease: 'linear',
  autoplay: onScroll({
    container: '.scroll-container',
    enter: 'bottom-=50 top',
    leave: 'top+=60 bottom',
    sync: true,
    debug: true,
  })
});
```

**HTML Structure:**

```html
<div class="scroll-container scroll-y">
  <div class="scroll-content grid square-grid">
    <div class="scroll-section padded">
      <div class="large row">
        <div class="label">scroll down</div>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large row">
        <div class="square"></div>
      </div>
    </div>
    <div class="scroll-section"></div>
  </div>
</div>
```

---

### Smooth Scroll

Smoothly animate the playback progress of the linked object to the scroll position with a damping effect.

**Type:** Numeric value between `0` and `1` (inclusive)

Lower values (approaching 0) increase animation duration to catch up with scroll position, creating a lag effect.

```javascript
import { animate, onScroll } from 'animejs';

animate('.square', {
  x: '15rem',
  rotate: '1turn',
  ease: 'linear',
  autoplay: onScroll({
    container: '.scroll-container',
    enter: 'bottom-=50 top',
    leave: 'top+=60 bottom',
    sync: .25,
    debug: true,
  })
});
```

---

### Eased Scroll

Applies an easing function to the synchronised playback progress of a linked object relative to scroll position.

**Accepts:** An easing function name (string)

```javascript
import { animate, stagger, onScroll } from 'animejs';

animate('.square', {
  x: '12rem',
  rotate: '1turn',
  ease: 'linear',
  delay: stagger(100, { from: 'last' }),
  autoplay: onScroll({
    container: '.scroll-container',
    enter: 'bottom-=50 top',
    leave: 'top+=60 bottom',
    sync: 'inOutCirc',
    debug: true,
  })
});
```

**HTML Structure:**

```html
<div class="scroll-container scroll-y">
  <div class="scroll-content grid square-grid">
    <div class="scroll-section padded">
      <div class="large row">
        <div class="label">scroll down</div>
      </div>
    </div>
    <div class="scroll-section padded">
      <div class="large row">
        <div class="square"></div>
        <div class="square"></div>
      </div>
    </div>
    <div class="scroll-section"></div>
  </div>
</div>
```

---

## ScrollObserver Callbacks

Callbacks trigger functions at specific points during scroll. They are defined directly in the `onScroll()` parameters object.

```javascript
animate('.square', {
  x: 100,
  autoplay: onScroll({
    container: '.container',
    target: '.section',
    axis: 'y',
    enter: 'bottom top',
    leave: 'top bottom',
    sync: true,
    onEnter: () => {},
    onLeave: () => {},
    onUpdate: () => {}
  })
});
```

### Available Callbacks

| Callback | Description |
|----------|-------------|
| `onEnter` | Fires when entering the threshold |
| `onEnterForward` | Fires when entering while scrolling forward |
| `onEnterBackward` | Fires when entering while scrolling backward |
| `onLeave` | Fires when leaving the threshold |
| `onLeaveForward` | Fires when leaving while scrolling forward |
| `onLeaveBackward` | Fires when leaving while scrolling backward |
| `onUpdate` | Fires during scroll updates |
| `onSyncComplete` | Fires when synchronization completes |
| `onResize` | Fires on resize events |

---

## ScrollObserver Methods

The `ScrollObserver` instance returned by `onScroll()` provides methods for managing scroll-based animations.

```javascript
const scrollObserver = onScroll(parameters);
```

### Available Methods

| Method | Description |
|--------|-------------|
| `link()` | Connects the scroll observer to animation instances, synchronizing playback with scroll position |
| `refresh()` | Recalculates scroll observer thresholds and properties, useful after DOM changes or viewport resizing |
| `revert()` | Removes all scroll observer functionality and restores the initial state of targeted elements |

**Usage:**

```javascript
scrollObserver.link()
scrollObserver.refresh()
scrollObserver.revert()
```

---

## ScrollObserver Properties

The `ScrollObserver` instance returned by `onScroll()` provides access to the following properties.

| Property | Type | Description |
|----------|------|-------------|
| `id` | Number | Unique identifier for the ScrollObserver instance |
| `container` | ScrollContainer | The scroll container being observed |
| `target` | HTMLElement | The element under observation |
| `linked` | Animation \| Timer \| Timeline | The connected animation object |
| `repeat` | Boolean | Whether observation repeats |
| `horizontal` | Boolean | Indicates horizontal scroll direction |
| `enter` | String \| Number | Entry threshold value |
| `leave` | String \| Number | Exit threshold (gettable/settable) |
| `sync` | Boolean | Synchronization status |
| `velocity` | Number | Current scroll speed |
| `backward` | Boolean | Scroll direction (backward status) |
| `scroll` | Number | Current scroll position |
| `progress` | Number | Observation progress (0 to 1 range) |
| `completed` | Boolean | Observation completion status |
| `began` | Boolean | Observation start status |
| `isInView` | Boolean | Current visibility status |
| `offset` | Number | Element offset value |
| `offsetStart` | Number | Start offset position |
| `offsetEnd` | Number | End offset position |
| `distance` | Number | Scroll distance for element |

**Basic Usage Pattern:**

```javascript
const scrollObserver = onScroll(parameters);
scrollObserver.target    // Access observed element
scrollObserver.progress  // Get current progress
```
