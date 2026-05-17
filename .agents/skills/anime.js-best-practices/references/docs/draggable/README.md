# Anime.js Draggable Documentation

Complete reference documentation for the Draggable feature in Anime.js v4.0.0+.

## Table of Contents

1. [Overview](#overview)
2. [Draggable Axes Parameters](#draggable-axes-parameters)
   - [x Parameter](#x-parameter)
   - [y Parameter](#y-parameter)
   - [snap Parameter](#snap-parameter)
   - [modifier Parameter](#modifier-parameter)
   - [mapTo Parameter](#mapto-parameter)
3. [Draggable Settings](#draggable-settings)
4. [Draggable Callbacks](#draggable-callbacks)
5. [Draggable Methods](#draggable-methods)
6. [Draggable Properties](#draggable-properties)

---

## Overview

The Draggable feature adds draggable capabilities to DOM Elements.

### API Signature

```javascript
import { createDraggable } from 'animejs';

const draggable = createDraggable(target, parameters);
```

Alternative import:

```javascript
import { createDraggable } from 'animejs/draggable';
```

### Parameters

| Name | Accepts |
|------|---------|
| target | CSS Selector or DOM Element |
| parameters (optional) | Object containing axes parameters, settings, and callbacks |

### Return Value

Returns a `Draggable` instance.

### Basic Code Example

```javascript
import { createDraggable } from 'animejs';

createDraggable('.square');
```

HTML:

```html
<div class="large row centered">
  <div class="square draggable"></div>
</div>
```

### Configuration Categories

The parameters object accepts three categories:

1. **Draggable axes parameters** - Control x/y axis behavior, snapping, modifiers, and mapTo
2. **Draggable settings** - Configure trigger, container, friction, velocity, cursor, and thresholds
3. **Draggable callbacks** - Handle onGrab, onDrag, onUpdate, onRelease, onSnap, onSettle, onResize, onAfterResize

---

## Draggable Axes Parameters

These parameters configure individual axes (x, y) or apply globally across all axes.

### Combined Example

```javascript
createDraggable('.square', {
  x: { snap: 100 },
  y: { snap: 50 },
  modifier: utils.wrap(-200, 0),
  containerPadding: 10,
  releaseStiffness: 40,
  releaseEase: 'out(3)',
  onGrab: () => {},
  onDrag: () => {},
  onRelease: () => {},
});
```

### Parameters List

- **x** - Horizontal axis configuration
- **y** - Vertical axis configuration
- **snap** - Snapping behavior for axes
- **modifier** - Transform function applied to axis values
- **mapTo** - Maps axis movement to different targets

---

### x Parameter

Controls x-axis dragging behavior.

#### API Signature

```javascript
createDraggable(target, {
  x: Boolean | Object
})
```

#### Parameter Details

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x` | `Boolean` or `Object` | `true` | Defines the behaviour of the x-axis by either passing an object of parameters or disabling it by setting the value to `false` |

#### Code Example

```javascript
import { createDraggable } from 'animejs';

createDraggable('.square.enabled', {
  x: true
});

createDraggable('.square.disabled', {
  x: false
});
```

#### Usage Notes

- **`x: true`** - Enables x-axis dragging with default behavior
- **`x: false`** - Disables x-axis dragging entirely
- **`x: { ... }`** - Accepts a configuration object with additional axis-specific parameters (snap, modifier, mapTo)

---

### y Parameter

Controls the behavior of the y-axis (vertical movement) in draggable elements.

#### API Signature

```javascript
createDraggable(selector, {
  y: true | false | Object
});
```

#### Parameter Details

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `y` | `Boolean` or `Object` | `true` | Defines the behaviour of the y-axis by either passing an object of parameters or disabling it by setting the value to `false` |

#### Code Example

```javascript
import { createDraggable } from 'animejs';

createDraggable('.square.enabled', {
  y: true
});

createDraggable('.square.disabled', {
  y: false
});
```

#### Usage Notes

- Setting `y: true` enables vertical dragging
- Setting `y: false` disables vertical movement
- Passing an object allows configuration of additional y-axis parameters like `snap`, `modifier`, and `mapTo`
- Works in conjunction with the `x` parameter for complete drag control

---

### snap Parameter

Rounds draggable element final values to specified increments. Applies to one or both axes.

#### API Signature

```javascript
snap: Number | Array<Number> | Function
```

#### Parameter Details

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `snap` | `Number` | `0` | Rounds to nearest increment value |
| `snap` | `Array<Number>` | `0` | Selects closest value from array |
| `snap` | `Function` | `0` | Returns number/array; refreshes on resize |

#### Code Example

```javascript
import { createDraggable } from 'animejs';

createDraggable('.square', {
  container: '.grid',
  snap: 56, // Global to both x and y
  x: { snap: [0, 200] }, // Specific to x
});
```

#### Key Features

- **Global application**: Set `snap` at root level for both axes
- **Axis-specific**: Override with `x: { snap: ... }` or `y: { snap: ... }`
- **Dynamic refresh**: Function-based snaps auto-refresh on container/target resize
- **Manual refresh**: Use `refresh()` method

#### Usage Patterns

1. **Fixed increment**: `snap: 56` - rounds to multiples of 56
2. **Discrete positions**: `snap: [0, 200, 400]` - snaps to array values
3. **Responsive**: `snap: () => calculateGridSize()` - updates dynamically

---

### modifier Parameter

Defines a function that alters or modifies axis values.

#### Parameter Details

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `modifier` | `Function` | `noop` | Modifier function applied to axis values |

**Availability:** Since version 4.0.0

#### Code Example

```javascript
import { createDraggable, utils } from 'animejs';

createDraggable('.square', {
  modifier: utils.wrap(-32, 32), // Global to both x and y
  x: { modifier: utils.wrap(-128, 128) }, // Specific to x
});
```

```html
<div class="large grid centered square-grid">
  <div class="square draggable"></div>
</div>
```

#### Key Points

- **Global application:** When set at the root level, the modifier function applies to both x and y axes simultaneously
- **Axis-specific application:** Individual axes (x, y) can have their own dedicated modifier functions that override the global setting
- **Common use case:** The example demonstrates wrapping coordinate values within specified ranges using `utils.wrap()`

The modifier enables constrained dragging behavior by transforming raw coordinate values before they're applied to the element.

---

### mapTo Parameter

Maps an axis value to a different property of the element.

#### Parameter Details

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mapTo` | `String` | `null` | Property name to map axis movement to |

#### Code Example

```javascript
import { createDraggable, utils } from 'animejs';

utils.set('.square', { z: 100 });

createDraggable('.square', {
  x: { mapTo: 'rotateY' },
  y: { mapTo: 'z' },
});
```

```html
<div class="large grid centered perspective square-grid">
  <div class="square draggable"></div>
</div>
```

#### Explanation

This parameter enables remapping of drag axis movements to alternative element properties. In the example provided, horizontal (x-axis) drag movements apply to the `rotateY` transform, while vertical (y-axis) movements affect the `z` property instead of their default mappings.

---

## Draggable Settings

Configuration options passed directly to the `createDraggable()` function parameters object.

### Combined Example

```javascript
createDraggable('.square', {
  x: { snap: 100 },
  y: { snap: 50 },
  modifier: utils.wrap(-200, 0),
  containerPadding: 10,
  releaseStiffness: 40,
  releaseEase: 'out(3)',
  onGrab: () => {},
  onDrag: () => {},
  onRelease: () => {},
});
```

### Available Settings

| Setting | Description |
|---------|-------------|
| `trigger` | Element that triggers dragging |
| `container` | Constrains dragging movement |
| `containerPadding` | Padding within container bounds |
| `containerFriction` | Friction while dragging in container |
| `releaseContainerFriction` | Friction after release |
| `releaseMass` | Mass parameter for release animation |
| `releaseStiffness` | Stiffness of release spring |
| `releaseDamping` | Damping of release animation |
| `velocityMultiplier` | Multiplier for drag velocity |
| `minVelocity` | Minimum velocity threshold |
| `maxVelocity` | Maximum velocity cap |
| `releaseEase` | Easing function for release |
| `dragSpeed` | Speed of dragging motion |
| `dragThreshold` | Distance needed to initiate drag |
| `scrollThreshold` | Scroll activation threshold |
| `scrollSpeed` | Speed of scroll behavior |
| `cursor` | CSS cursor style during drag |

---

## Draggable Callbacks

Callback functions execute at specific points during drag interactions.

### Combined Example

```javascript
createDraggable('.square', {
  x: { snap: 100 },
  y: { snap: 50 },
  modifier: utils.wrap(-200, 0),
  containerPadding: 10,
  containerStiffness: 40,
  containerEase: 'out(3)',
  onGrab: () => {},
  onDrag: () => {},
  onRelease: () => {}
});
```

### Available Callbacks

| Callback | Description |
|----------|-------------|
| `onGrab` | Triggered when dragging starts |
| `onDrag` | Triggered during drag motion |
| `onUpdate` | Triggered on position updates |
| `onRelease` | Triggered when dragging ends |
| `onSnap` | Triggered when snapping to positions |
| `onSettle` | Triggered when motion settles |
| `onResize` | Triggered during resize events |
| `onAfterResize` | Triggered after resize completes |

Callbacks are specified as function properties directly within the `createDraggable()` parameters object, allowing reactive behavior during drag lifecycle events.

---

## Draggable Methods

Methods accessible on a `Draggable` instance created via `createDraggable(target, parameters)`.

### Available Methods

| Method | Description |
|--------|-------------|
| `disable()` | Disables dragging functionality |
| `enable()` | Re-enables dragging functionality |
| `setX()` | Sets the X-axis position |
| `setY()` | Sets the Y-axis position |
| `animateInView()` | Animates element into viewport |
| `scrollInView()` | Scrolls element into view |
| `stop()` | Halts current dragging operation |
| `reset()` | Returns element to initial state |
| `revert()` | Reverts to previous state |
| `refresh()` | Updates draggable calculations |

### Usage Example

```javascript
import { createDraggable } from 'animejs';

const draggable = createDraggable('.square');

// Disable dragging
draggable.disable();

// Re-enable dragging
draggable.enable();

// Set position programmatically
draggable.setX(100);
draggable.setY(50);

// Reset to initial state
draggable.reset();

// Refresh calculations (useful after DOM changes)
draggable.refresh();
```

---

## Draggable Properties

Properties available on a `Draggable` instance created via `createDraggable()`.

```javascript
const draggable = createDraggable(target, parameters);
```

### Configuration Properties (Get/Set)

#### Snap and Speed Controls

| Property | Type | Description |
|----------|------|-------------|
| `snapX` | `Number` or `Array<Number>` | Snap value for x-axis |
| `snapY` | `Number` or `Array<Number>` | Snap value for y-axis |
| `scrollSpeed` | `Number` | Auto-scroll speed |
| `scrollThreshold` | `Number` | Distance from edges triggering scroll |
| `dragSpeed` | `Number` | Element drag speed |

#### Velocity Settings

| Property | Type | Description |
|----------|------|-------------|
| `maxVelocity` | `Number` | Maximum velocity limit |
| `minVelocity` | `Number` | Minimum velocity limit |
| `velocityMultiplier` | `Number` | Velocity calculation multiplier |

#### Physics and Animation

| Property | Type | Description |
|----------|------|-------------|
| `releaseEase` | `Function` | Easing function for animations |
| `releaseSpring` | `Spring` | Internal spring post-release |
| `containerFriction` | `Number` | Friction within container |
| `containerPadding` | `Array<Number>` | Padding [top, right, bottom, left] |

#### Element References

| Property | Type | Description |
|----------|------|-------------|
| `$container` | `HTMLElement` | Container element |
| `$target` | `HTMLElement` | Target element |
| `$trigger` | `HTMLElement` | Trigger element |
| `$scrollContainer` | `Window` or `HTMLElement` | Window or container |

### Position Properties (Get/Set)

| Property | Type | Description |
|----------|------|-------------|
| `x` | `Number` | X position |
| `y` | `Number` | Y position |
| `progressX` | `Number` | X progress 0-1 |
| `progressY` | `Number` | Y progress 0-1 |

### State Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `enabled` | `Boolean` | Whether draggable is enabled |
| `grabbed` | `Boolean` | Currently being grabbed |
| `dragged` | `Boolean` | Currently dragging |
| `velocity` | `Number` | Current velocity |
| `angle` | `Number` | Current angle in radians |
| `contained` | `Boolean` | Within bounds |
| `released` | `Boolean` | Just released |
| `updated` | `Boolean` | Recently updated |

### Data Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `coords` | `Array<Number>` | [x, y, prevX, prevY] |
| `pointer` | `Array<Number>` | [x, y, prevX, prevY] |
| `scroll` | `Object` | {x, y} position |
| `dragArea` | `Array<Number>` | [x, y, width, height] |
| `containerBounds` | `Array<Number>` | [top, right, bottom, left] |
| `targetBounds` | `Array<Number>` | Element bounds |
| `window` | `Array<Number>` | [width, height] |

### Callback Properties (Get/Set)

| Property | Type | Description |
|----------|------|-------------|
| `onGrab` | `Function` | Callback when grabbed |
| `onDrag` | `Function` | Callback during drag |
| `onRelease` | `Function` | Callback when released |
| `onUpdate` | `Function` | Callback on update |
| `onSettle` | `Function` | Callback when settled |
| `onSnap` | `Function` | Callback when snapped |
| `onResize` | `Function` | Callback during resize |
| `onAfterResize` | `Function` | Callback after resize |

---

## Complete Example

```javascript
import { createDraggable, utils } from 'animejs';

// Create a fully configured draggable element
const draggable = createDraggable('.square', {
  // Axes parameters
  x: {
    snap: [0, 100, 200, 300],
    modifier: utils.clamp(-300, 300)
  },
  y: {
    snap: 50,
    mapTo: 'translateY'
  },

  // Settings
  container: '.container',
  containerPadding: [10, 10, 10, 10],
  containerFriction: 0.8,
  releaseStiffness: 40,
  releaseDamping: 0.8,
  releaseEase: 'out(3)',
  dragSpeed: 1,
  dragThreshold: 5,
  cursor: 'grab',

  // Callbacks
  onGrab: (self) => {
    console.log('Grabbed at:', self.x, self.y);
  },
  onDrag: (self) => {
    console.log('Dragging:', self.x, self.y);
  },
  onRelease: (self) => {
    console.log('Released with velocity:', self.velocity);
  },
  onSnap: (self) => {
    console.log('Snapped to:', self.x, self.y);
  },
  onSettle: (self) => {
    console.log('Settled at:', self.x, self.y);
  }
});

// Access properties
console.log('Current position:', draggable.x, draggable.y);
console.log('Is dragging:', draggable.dragged);

// Use methods
draggable.setX(150);
draggable.setY(75);

// Programmatic control
draggable.disable();
setTimeout(() => draggable.enable(), 1000);
```

---

## Source URLs

- https://animejs.com/documentation/draggable
- https://animejs.com/documentation/draggable/draggable-axes-parameters
- https://animejs.com/documentation/draggable/draggable-axes-parameters/x
- https://animejs.com/documentation/draggable/draggable-axes-parameters/y
- https://animejs.com/documentation/draggable/draggable-axes-parameters/snap
- https://animejs.com/documentation/draggable/draggable-axes-parameters/modifier
- https://animejs.com/documentation/draggable/draggable-axes-parameters/mapto
- https://animejs.com/documentation/draggable/draggable-settings
- https://animejs.com/documentation/draggable/draggable-callbacks
- https://animejs.com/documentation/draggable/draggable-methods
- https://animejs.com/documentation/draggable/draggable-properties
