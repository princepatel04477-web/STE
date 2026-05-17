# Anime.js v4.0.0 - Getting Started Reference

This comprehensive reference covers installation, module imports, and integration patterns for Anime.js v4.0.0.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Module Imports](#module-imports)
4. [Using with Vanilla JavaScript](#using-with-vanilla-javascript)
5. [Using with React](#using-with-react)
6. [Best Practices](#best-practices)

---

## Overview

Anime.js is a lightweight JavaScript animation engine with a flexible modules-first API. Version 4.0.0 introduces excellent tree-shaking support and modular architecture.

### Key Features

- Flexible modules-first API with tree-shaking support
- Works with bundlers (Vite, esbuild) or natively via importmap
- Granular imports minimize bundle size
- Supports CSS properties, transforms, SVG attributes, and JavaScript objects
- Comprehensive playback controls including delay, duration, looping, and easing

### Documentation Structure

The Anime.js documentation is organized into major sections:

- **Getting Started**: Installation, module imports, vanilla JS usage, React integration
- **Core Features**: Timer, Animation, Timeline systems
- **Advanced Tools**: Animatable, Draggable, Layout, Scope
- **Events & Interactivity**: ScrollObserver, SVG morphing, text splitting
- **Utilities**: Stagger effects, mathematical helpers, easing functions
- **Engine Configuration**: Performance and timing settings

---

## Installation

### NPM Installation

```bash
npm install animejs
```

**ES Modules Import:**

```javascript
import { animate } from 'animejs';
```

**CommonJS Import:**

```javascript
const { animate } = require('animejs');
```

### CDN Installation

**ES Modules (esm.sh):**

```javascript
import { animate } from 'https://esm.sh/animejs';
```

**ES Modules (JsDelivr):**

```javascript
import { animate } from 'https://cdn.jsdelivr.net/npm/animejs/+esm';
```

**UMD Global Object (JsDelivr):**

```html
<script src="https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js"></script>
<script>
  const { animate } = anime;
</script>
```

### Direct Download from GitHub

**Available distribution files:**

| File Path | Description |
|-----------|-------------|
| `dist/modules/index.js` | ES modules entry |
| `dist/modules/index.cjs` | CommonJS entry |
| `dist/bundles/anime.esm.js` | Bundled ES |
| `dist/bundles/anime.esm.min.js` | Bundled & minified ES |
| `dist/bundles/anime.umd.js` | Bundled UMD |
| `dist/bundles/anime.umd.min.js` | Bundled & minified UMD |

**Local ES Modules:**

```javascript
import { animate } from './animejs/dist/bundles/anime.esm.min.js';
```

**Local UMD:**

```html
<script src="animejs/dist/bundles/anime.umd.min.js"></script>
<script>
  const { animate } = anime;
</script>
```

---

## Module Imports

Anime.js v4.0.0 provides a modular architecture that supports both main module imports and granular subpath imports for optimal bundle size.

### Main Module Import

Import everything you need from the main entry point:

```javascript
import { animate, splitText, stagger, random } from 'animejs';

const split = splitText('p');

animate(split.words, {
  opacity: () => random(0, 1, 2),
  delay: stagger(50),
});
```

### Subpath Imports

For better tree-shaking and smaller bundles, use subpath imports:

```javascript
import { animate } from 'animejs/animation';
import { splitText } from 'animejs/text';
import { stagger, random } from 'animejs/utils';

const split = splitText('p');

animate(split.words, {
  opacity: () => random(0, 1, 2),
  delay: stagger(50),
});
```

### Complete Subpath Reference

| Subpath | Exports |
|---------|---------|
| `'animejs/animation'` | `animate` function |
| `'animejs/timer'` | `createTimer` |
| `'animejs/timeline'` | `createTimeline` |
| `'animejs/animatable'` | `createAnimatable` |
| `'animejs/draggable'` | `createDraggable` |
| `'animejs/layout'` | `createLayout` |
| `'animejs/scope'` | `createScope` |
| `'animejs/engine'` | `engine` object |
| `'animejs/events'` | Event utilities |
| `'animejs/easings'` | Easing functions |
| `'animejs/utils'` | Utility functions |
| `'animejs/svg'` | SVG utilities |
| `'animejs/text'` | Text utilities |
| `'animejs/waapi'` | Web Animation API utilities |

### ImportMap Setup (No Bundler Required)

For projects without a bundler, use an importmap to enable subpath imports:

```html
<script type="importmap">
{
  "imports": {
    "animejs": "/node_modules/animejs/dist/modules/index.js",
    "animejs/animation": "/node_modules/animejs/dist/modules/animation/index.js",
    "animejs/timer": "/node_modules/animejs/dist/modules/timer/index.js",
    "animejs/timeline": "/node_modules/animejs/dist/modules/timeline/index.js",
    "animejs/animatable": "/node_modules/animejs/dist/modules/animatable/index.js",
    "animejs/draggable": "/node_modules/animejs/dist/modules/draggable/index.js",
    "animejs/layout": "/node_modules/animejs/dist/modules/layout/index.js",
    "animejs/scope": "/node_modules/animejs/dist/modules/scope/index.js",
    "animejs/engine": "/node_modules/animejs/dist/modules/engine/index.js",
    "animejs/events": "/node_modules/animejs/dist/modules/events/index.js",
    "animejs/easings": "/node_modules/animejs/dist/modules/easings/index.js",
    "animejs/utils": "/node_modules/animejs/dist/modules/utils/index.js",
    "animejs/svg": "/node_modules/animejs/dist/modules/svg/index.js",
    "animejs/text": "/node_modules/animejs/dist/modules/text/index.js",
    "animejs/waapi": "/node_modules/animejs/dist/modules/waapi/index.js"
  }
}
</script>

<script type="module">
  import { animate } from 'animejs/animation';
  import { splitText } from 'animejs/text';
  import { stagger, random } from 'animejs/utils';

  const split = splitText('p');

  animate(split.words, {
    opacity: () => random(0, 1, 2),
    delay: stagger(50),
  });
</script>
```

---

## Using with Vanilla JavaScript

### Complete Example

```javascript
import { animate, utils, createDraggable, spring } from 'animejs';

const [ $logo ] = utils.$('.logo.js');
const [ $button ] = utils.$('button');
let rotations = 0;

// Created a bounce animation loop
animate('.logo.js', {
  scale: [
    { to: 1.25, ease: 'inOut(3)', duration: 200 },
    { to: 1, ease: spring({ bounce: .7 }) }
  ],
  loop: true,
  loopDelay: 250,
});

// Make the logo draggable around its center
createDraggable('.logo.js', {
  container: [0, 0, 0, 0],
  releaseEase: spring({ bounce: .7 })
});

// Animate logo rotation on click
const rotateLogo = () => {
  rotations++;
  $button.innerText = `rotations: ${rotations}`;
  animate($logo, {
    rotate: rotations * 360,
    ease: 'out(4)',
    duration: 1500,
  });
}

$button.addEventListener('click', rotateLogo);
```

### Key Implementation Details

#### Import Pattern

Import only the specific modules needed for your animation workflow:

```javascript
import { animate, utils, createDraggable, spring } from 'animejs';
```

#### DOM Selection with `utils.$()`

The `utils.$()` utility retrieves DOM elements as arrays, enabling destructuring assignment:

```javascript
const [ $logo ] = utils.$('.logo.js');
const [ $button ] = utils.$('button');
```

#### Animation Configuration

Animations accept configuration objects with properties like:

- `scale` - Transform scale
- `rotate` - Transform rotation
- `loop` - Enable looping
- `loopDelay` - Delay between loops
- `ease` - Easing function
- `duration` - Animation duration in milliseconds

#### Keyframe Support

Define sequential keyframes using arrays of objects:

```javascript
animate('.logo.js', {
  scale: [
    { to: 1.25, ease: 'inOut(3)', duration: 200 },
    { to: 1, ease: spring({ bounce: .7 }) }
  ],
});
```

Each object in the array defines a distinct animation stage with individual easing and timing.

#### Spring Physics

Use the `spring()` function for physics-based easing:

```javascript
spring({ bounce: .7 })
```

#### Event Integration

Standard JavaScript event listeners trigger animations programmatically:

```javascript
$button.addEventListener('click', rotateLogo);
```

---

## Using with React

### Key Concept

Anime.js can be used with React by combining React's `useEffect()` and Anime.js `createScope()` methods. All Anime.js instances declared within `createScope()` become scoped to a target DOM reference, enabling component-level isolation and cleanup.

### Complete Example

```javascript
import { animate, createScope, spring, createDraggable } from 'animejs';
import { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  const root = useRef(null);
  const scope = useRef(null);
  const [ rotations, setRotations ] = useState(0);

  useEffect(() => {
    scope.current = createScope({ root }).add( self => {
      // Bounce animation loop
      animate('.logo', {
        scale: [
          { to: 1.25, ease: 'inOut(3)', duration: 200 },
          { to: 1, ease: spring({ bounce: .7 }) }
        ],
        loop: true,
        loopDelay: 250,
      });

      // Draggable functionality
      createDraggable('.logo', {
        container: [0, 0, 0, 0],
        releaseEase: spring({ bounce: .7 })
      });

      // Register custom methods
      self.add('rotateLogo', (i) => {
        animate('.logo', {
          rotate: i * 360,
          ease: 'out(4)',
          duration: 1500,
        });
      });
    });

    return () => scope.current.revert()
  }, []);

  const handleClick = () => {
    setRotations(prev => {
      const newRotations = prev + 1;
      scope.current.methods.rotateLogo(newRotations);
      return newRotations;
    });
  };

  return (
    <div ref={root}>
      <div className="large centered row">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <button onClick={handleClick}>rotations: {rotations}</button>
    </div>
  )
}
```

### React Integration Pattern

#### 1. Create Refs for Root and Scope

```javascript
const root = useRef(null);
const scope = useRef(null);
```

#### 2. Initialize Scope in useEffect

```javascript
useEffect(() => {
  scope.current = createScope({ root }).add( self => {
    // Define animations here
  });

  return () => scope.current.revert()
}, []);
```

#### 3. Attach Root Ref to Container Element

```jsx
<div ref={root}>
  {/* Animated content */}
</div>
```

#### 4. Register Custom Methods

Use `self.add()` to register methods that can be called from event handlers:

```javascript
self.add('rotateLogo', (i) => {
  animate('.logo', {
    rotate: i * 360,
    ease: 'out(4)',
    duration: 1500,
  });
});
```

#### 5. Call Methods from Event Handlers

```javascript
const handleClick = () => {
  scope.current.methods.rotateLogo(newRotations);
};
```

#### 6. Cleanup on Unmount

Always call `scope.current.revert()` in the useEffect cleanup function:

```javascript
return () => scope.current.revert()
```

---

## Best Practices

### Bundle Size Optimization

1. **Use subpath imports** for production builds to minimize bundle size:
   ```javascript
   import { animate } from 'animejs/animation';
   ```

2. **Import only what you need** - avoid importing the entire library when you only need specific functions.

3. **Use bundlers with tree-shaking** (Vite, esbuild) for automatic dead code elimination.

### Animation Performance

1. **Use CSS transforms** (`scale`, `rotate`, `translateX`, `translateY`) instead of layout-affecting properties for smooth 60fps animations.

2. **Leverage spring physics** for natural-feeling animations:
   ```javascript
   ease: spring({ bounce: .7 })
   ```

3. **Use `loopDelay`** to prevent continuous CPU usage in looping animations.

### React Integration

1. **Always use `createScope()`** to properly scope animations to component DOM.

2. **Always clean up** with `scope.current.revert()` in the useEffect cleanup function to prevent memory leaks.

3. **Use refs** instead of direct DOM queries to maintain React's declarative paradigm.

4. **Register methods** with `self.add()` for triggering animations from event handlers.

### Code Organization

1. **Keep animation configurations** in separate constants for reusability:
   ```javascript
   const bounceConfig = {
     scale: [
       { to: 1.25, ease: 'inOut(3)', duration: 200 },
       { to: 1, ease: spring({ bounce: .7 }) }
     ],
     loop: true,
     loopDelay: 250,
   };
   ```

2. **Use the `utils.$()` helper** for DOM selection to get arrays that support destructuring.

3. **Prefer CSS selectors** when targeting multiple elements, and direct element references for single elements.

---

## Version Information

- **Current Version**: 4.0.0
- **Previous Versions**: 3.2.2, 2.1.0

---

*This reference was compiled from the official Anime.js v4.0.0 documentation.*
