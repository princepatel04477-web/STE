# Anime.js Scope Documentation

## Overview

The `Scope` feature allows Anime.js instances to respond to media queries, use custom root elements, share default parameters, and batch revert animations - useful for responsive and component-based environments.

## Creating a Scope

**Import from main module:**
```javascript
import { createScope } from 'animejs';
const scope = createScope(parameters);
```

**Import from subpath:**
```javascript
import { createScope } from 'animejs/scope';
```

### API Signature

| Parameter | Type | Notes |
|-----------|------|-------|
| `parameters` (optional) | Scope parameters | Configuration object |
| **Returns** | `Scope` | Scope instance |

### Basic Example

```javascript
import { animate, utils, createScope } from 'animejs';

createScope({
  mediaQueries: {
    isSmall: '(max-width: 200px)',
    reduceMotion: '(prefers-reduced-motion)',
  }
})
.add(self => {
  const { isSmall, reduceMotion } = self.matches;

  if (isSmall) {
    utils.set('.square', { scale: .5 });
  }

  animate('.square', {
    x: isSmall ? 0 : ['-35vw', '35vw'],
    y: isSmall ? ['-40vh', '40vh'] : 0,
    loop: true,
    alternate: true,
    duration: reduceMotion ? 0 : isSmall ? 750 : 1250
  });
});
```

---

## Add Constructor Function

The "Add constructor function" feature allows you to execute code within a Scope's context. Constructor functions are invoked immediately when passed to the Scope's `add()` or `addOnce()` methods and can track all animations, timers, and other elements created within them.

### API Signature

```javascript
scope.add(constructor);
scope.addOnce(constructorFunction);
```

### Constructor Function Argument

| Parameter | Type | Description |
|-----------|------|-------------|
| `self` | Scope instance | The current Scope instance providing access to media query states and utilities |

### Return Value (Optional)

A cleanup function that executes when the Scope reverts or when a media query changes.

### Code Example

```javascript
import { utils, animate, createScope, createDraggable } from 'animejs';

createScope({
  mediaQueries: { isSmall: '(max-width: 200px)' },
  defaults: { ease: 'linear' },
})
.add(self => {

  const { isSmall } = self.matches;
  const [ $square ] = utils.$('.square');

  if (self.matches.isSmall) {
    animate($square, {
      rotate: 360,
      loop: true,
    });
  } else {
    $square.classList.add('draggable');
    createDraggable($square, {
      container: document.body,
    });
  }

  return () => {
    $square.classList.remove('draggable');
  }

});
```

### Key Features

- Constructor executes within Scope context immediately
- Access media query states via `self.matches`
- Scoped utility methods available (e.g., `utils.$()`)
- Optional cleanup function for teardown operations
- Tracks all nested animations, timers, and interactive elements

---

## Register Method Function

The `register method function` feature allows developers to register custom methods within a Scope, making them callable from outside while maintaining execution context within the Scope.

### API Signature

```javascript
scope.add('methodName', methodFunction);
scope.methods.methodName();
```

### Method Arguments

| Name | Type |
|------|------|
| ...args | Any |

### Code Example

```javascript
import { utils, animate, createScope } from 'animejs';

const scope = createScope({
  mediaQueries: { isSmall: '(max-width: 200px)' },
})
.add(self => {

  /* Registering the method inside the scope allows access to the scope itself */
  self.add('onClick', (e) => {

    const { clientX, clientY } = e;
    const { isSmall } = self.matches;

    animate('.square', {
      rotate: isSmall ? '+=360' : 0,
      x: isSmall ? 0 : clientX - (window.innerWidth / 2),
      y: isSmall ? 0 : clientY - (window.innerHeight / 2),
      duration: isSmall ? 750 : 400,
    });

  });

  utils.set(document.body, {
    cursor: self.matches.isSmall ? 'alias' : 'crosshair'
  });

});

/* Methods can be called outside the scope */
document.addEventListener('click', scope.methods.onClick);
```

### Key Concepts

- Methods registered via `self.add()` become accessible on the Scope's `methods` object
- Registered methods maintain access to the Scope instance (`self`)
- Methods can be invoked externally while preserving their Scope context
- Useful for event handlers and interactive functionality within bounded scopes

---

## Scope Parameters

The `createScope()` function accepts three configuration parameters:

1. **root** - Specifies a scoped container element
2. **defaults** - Sets default animation settings (duration, easing, etc.)
3. **mediaQueries** - Defines responsive breakpoints accessible via `ctx.matches`

### Code Example

```javascript
import { createScope, animate } from 'animejs';

createScope({
  root: '.section',
  defaults: {
    duration: 250,
    ease: 'out(4)',
  },
  mediaQueries: {
    mobile: '(max-width: 640px)',
    reducedMotion: '(prefers-reduced-motion)',
  }
})
.add( ctx => {
  const isMobile = ctx.matches.mobile;
  const reduceMotion = ctx.matches.reducedMotion;
  animate(targets, {
    x: isMobile ? 0 : '100vw',
    y: isMobile ? '100vh' : 0,
    duration: reduceMotion ? 0 : 750
  });
});
```

---

### root Parameter

The `root` parameter defines a root element that limits all DOM queries within a Scope to descendants of a specified `HTMLElement`. This is useful for component-based architectures like React.

#### Accepted Input Types
- CSS Selector
- DOM Element

#### Code Example

```javascript
import { createScope, animate } from 'animejs';

createScope({ root: '.row:nth-child(2)' })
.add(() => {
  animate('.square', {
    x: '17rem',
    loop: true,
    alternate: true
  });
});
```

#### HTML Context
```html
<div class="medium row">
  <div class="square"></div>
  <div class="padded label">outside scope</div>
</div>
<div class="medium row">
  <div class="square"></div>
  <div class="padded label">inside scope</div>
</div>
<div class="medium row">
  <div class="square"></div>
  <div class="padded label">outside scope</div>
</div>
```

When a scope is created with `root: '.row:nth-child(2)'`, animations using `.square` selectors within that scope only target elements descending from the specified root element, enabling isolated animation contexts within larger applications.

---

### defaults Parameter

The `defaults` parameter defines default properties for all Timer, Animation, and Timeline instances created within a specific scope.

#### API Signature

```javascript
createScope({
  root: element,
  defaults: { /* properties */ }
})
```

#### Accepted Properties

| Property | Type | Description |
|----------|------|-------------|
| `playbackEase` | Easing name (String) \| Function | Controls playback rate easing |
| `playbackRate` | Number | Multiplier for animation speed |
| `frameRate` | Number | Target frames per second |
| `loop` | Number \| Boolean | Loop count or infinite loop |
| `reversed` | Boolean | Play animation backwards |
| `alternate` | Boolean | Reverse direction on each loop cycle |
| `autoplay` | Boolean | Start automatically |
| `duration` | Number \| Function | Animation length in milliseconds |
| `delay` | Number \| Function | Delay before animation starts |
| `composition` | Composition type (String) \| Function | Blending mode |
| `ease` | Easing name (String) \| Function | Animation timing function |
| `loopDelay` | Number | Delay between loop cycles |
| `modifier` | Function | Value transformation function |
| `onBegin` | Function | Callback when animation begins |
| `onUpdate` | Function | Callback on each frame |
| `onRender` | Function | Callback for render operations |
| `onLoop` | Function | Callback on loop completion |
| `onComplete` | Function | Callback when animation finishes |

#### Code Example

```javascript
import { createScope, animate } from 'animejs';

const rows = utils.$('.row');

rows.forEach(($row, i) => {
  createScope({
    root: $row,
    defaults: { ease: `out(${1 + i})` }
  })
  .add(() => {
    animate('.square', {
      x: '17rem',
      loop: true,
      alternate: true
    });
  });
});
```

This example creates multiple scopes with progressively stronger easing functions applied to all animations within each scope.

---

### mediaQueries Parameter

The `mediaQueries` parameter defines responsive breakpoints that trigger scope refreshes when media query match states change. Matched states are accessible via the scope's `matches` property.

#### API Signature

```javascript
mediaQueries: {
  [key: string]: string // arbitrary name maps to media query definition
}
```

#### Code Example

```javascript
import { createScope, animate } from 'animejs';

createScope({
  mediaQueries: {
    isSmall: '(max-width: 100px)',
    isMedium: '(min-width: 101px) and (max-width: 200px)',
    isLarge: '(min-width: 201px)',
    reduceMotion: '(prefers-reduced-motion)',
  }
})
.add(self => {

  const { isSmall, isMedium, isLarge, reduceMotion } = self.matches;

  utils.set('.square', { scale: isMedium ? .75 : isLarge ? 1 : .5 });

  animate('.square', {
    x: isSmall ? 0 : ['-35vw', '35vw'],
    y: isSmall ? ['-40vh', '40vh'] : 0,
    rotate: 360,
    loop: true,
    alternate: true,
    duration: reduceMotion ? 0 : isSmall ? 750 : 1250
  });

});
```

#### Key Details

- **Purpose:** Conditionally refresh scope when media query states change
- **Access Pattern:** Via `self.matches` object within scope callbacks
- **Use Cases:** Responsive animations, accessibility preferences (e.g., `prefers-reduced-motion`)

---

## Scope Methods

Methods available on the `Scope` instance returned by a `createScope()` function.

```
const scope = createScope(parameters);
      +------------+
scope.|add()       |
scope.|addOnce()   |
scope.|keepTime()  +- Methods
scope.|refresh()   |
scope.|revert()    |
      +------------+
```

---

### add() Method

The `add()` method enables adding constructor functions or registering method functions to a Scope.

#### API Signatures

**Adding a Constructor:**
```javascript
scope.add(constructor);
```

**Registering a Method:**
```javascript
scope.add(name, method);
```

#### Parameters

**For Constructor:**
- `constructor`: A function that acts as a constructor

**For Method Registration:**
- `name`: String used to store and access the method
- `method`: A function to be registered as a method

#### Return Value
Returns the Scope itself (supports chaining).

#### Code Example

```javascript
import { createScope, createAnimatable, createDraggable } from 'animejs';

const scope = createScope({
  mediaQueries: {
    isSmall: '(max-width: 200px)',
  }
})
.add(self => {
  const [ $circle ] = utils.$('.circle');

  if (self.matches.isSmall) {
    $circle.classList.add('draggable');
    self.circle = createDraggable($circle, {
      container: document.body,
    });
  } else {
    $circle.classList.remove('draggable');
    self.circle = createAnimatable($circle, {
      x: 500,
      y: 500,
      ease: 'out(3)'
    });
  }

  let win = { w: window.innerWidth, h: window.innerHeight };

  self.add('refreshBounds', () => {
    win.w = window.innerWidth;
    win.h = window.innerHeight;
  });

  self.add('onMouseMove', e => {
    if (self.matches.isSmall) return;
    const { w, h } = win;
    const hw = w / 2;
    const hh = h / 2;
    const x = utils.clamp(e.clientX - hw, -hw, hw);
    const y = utils.clamp(e.clientY - hh, -hh, hh);
    if (self.circle.x) {
      self.circle.x(x);
      self.circle.y(y);
    }
  });

  self.add('onPointerDown', e => {
    const { isSmall } = self.matches;
    animate($circle, {
      scale: [
        { to: isSmall ? 1.25 : .25, duration: isSmall ? 50 : 150 },
        { to: 1, duration: isSmall ? 250 : 500 },
      ]
    });
  });
});

window.addEventListener('resize', scope.methods.refreshBounds);
window.addEventListener('mousemove', scope.methods.onMouseMove);
document.addEventListener('pointerdown', scope.methods.onPointerDown);
```

---

### addOnce() Method

*(Since v4.1.0)*

The `addOnce()` method adds a constructor to a Scope that is only called once, allowing you to execute code once and add scoped animations that won't be reverted between media query changes.

#### API Signature

```javascript
scope.addOnce(constructor);
```

#### Parameters

| Name | Type | Description |
|------|------|-------------|
| `constructor` | Function | A constructor function that executes once |

#### Returns

The `Scope` itself

#### Key Characteristics

**Critical Constraint:** Callbacks "cannot be conditional, as it defeats the purpose and will mess with keeping track of which callbacks have already been executed or not."

#### Usage Pattern

```javascript
scope.addOnce(() => {
  /* Animations declared here won't be reverted
     between mediaqueries changes */
});
```

#### Anti-Pattern (Incorrect)

```javascript
// Don't do this - defeats the purpose
if (scope.matches.small) {
  scope.addOnce(() => { animate(target, params) });
}
```

#### Practical Example Structure

```javascript
const scope = createScope({ mediaQueries: { isSmall: '(max-width: 200px)' } })
  .add(self => {
    self.addOnce(() => {
      // Persistent animations across media query changes
    });
    self.add(() => {
      // Conditional animations that revert on media query changes
    });
  });
```

---

### keepTime() Method

*(Since v4.1.0)*

The `keepTime()` method preserves animation state across media query changes by recreating Timer, Animation, or Timeline instances while maintaining their current playback time.

#### API Signature

```javascript
scope.keepTime(() => animate(target, parameters));
```

#### Parameters

| Name | Accepts |
|------|---------|
| constructor | A `Function` that returns a Timer, Animation, or Timeline |

#### Returns

The Timer, Animation, or Timeline returned by the constructor function.

#### Important Constraints

**Warning:** `keepTime()` calls cannot be conditional, as it defeats the purpose and will mess with keeping track of which callbacks have already been executed or not.

**Incorrect pattern:**
```javascript
if (scope.matches.small) {
  scope.keepTime(() => animate(target, params));
}
```

**Correct pattern:**
```javascript
scope.keepTime(() => animate(target, params));
```

#### Code Example

```javascript
import { createScope, createTimeline, utils, stagger } from 'animejs';

const scope = createScope({
  mediaQueries: { isSmall: '(max-width: 200px)' }
}).add(self => {
  self.addOnce(() => {
    createTimeline().add('.circle', {
      backgroundColor: [
        $el => utils.get($el, `--hex-red-1`),
        $el => utils.get($el, `--hex-citrus-1`),
      ],
      loop: true,
      alternate: true,
      duration: 2000,
    }, stagger(100));
  });

  self.keepTime(() => createTimeline().add('.circle', {
    x: self.matches.isSmall ? [-30, 30] : [-70, 70],
    scale: [.5, 1.1],
    loop: true,
    alternate: true,
  }, stagger(100)).init());
});
```

---

### revert() Method

*(Since v4.0.0)*

The `revert()` method reverts all Anime.js objects that have been declared inside a Scope and calls the constructors cleanup functions if needed.

#### API Signature

```javascript
revert()
```

#### Return Value

The Scope itself (enables method chaining)

#### Code Example

```javascript
import { utils, stagger, createScope, createTimeline } from 'animejs';

const [ $button1, $button2 ] = utils.$('.revert');

function onMouseEnter() { animate(this, { scale: 2, duration: 250 }) }
function onMouseLeave() { animate(this, { scale: 1, duration: 750 }) }

const scopeConstructor = scope => {
  const circles = utils.$('.circle');

  circles.forEach(($circle, i) => {
    animate($circle, {
      opacity: .25,
      loop: true,
      alternate: true,
      duration: 500,
      delay: i * 100,
      ease: 'inOut(3)',
    });
    $circle.addEventListener('mouseenter', onMouseEnter);
    $circle.addEventListener('mouseleave', onMouseLeave);
  });

  // Cleanup function removes event listeners on revert
  return () => {
    circles.forEach($circle => {
      $circle.removeEventListener('mouseenter', onMouseEnter);
      $circle.removeEventListener('mouseleave', onMouseLeave);
    });
  }
}

const scope1 = createScope({ root: '.row-1' }).add(scopeConstructor);
const scope2 = createScope({ root: '.row-2' }).add(scopeConstructor);

$button1.addEventListener('click', () => scope1.revert());
$button2.addEventListener('click', () => scope2.revert());
```

#### Key Concept

The method automatically cancels all animations within the scope and executes cleanup functions defined in the scope constructor, allowing proper teardown of event listeners and other resources.

---

### refresh() Method

*(Since v4.0.0)*

The `refresh()` method reverts the scope and rebuilds it by executing every constructor function that was added to it. Internally, `refresh()` is called every time a media query state changes.

#### API Signature

```javascript
refresh()
```

#### Return Value

Returns the Scope itself (allowing for method chaining)

#### Code Example

```javascript
import { utils, stagger, createScope, createTimeline } from 'animejs';

const [ $button1, $button2 ] = utils.$('.refresh');

const scopeConstructor = scope => {
  const circles = utils.$('.circle');
  if (scope.i === undefined || scope.i > circles.length - 1) scope.i = 0;
  const i = scope.i++;

  utils.set(circles, {
    opacity: stagger([1, .25], { from: i, ease: 'out(3)' }),
  });

  createTimeline()
  .add(circles, {
    scale: [{ to: [.5, 1], duration: 250 }, { to: .5, duration: 750 }],
    duration: 750,
    loop: true,
  }, stagger(50, { from: i }))
  .seek(750)
}

const scope1 = createScope({ root: '.row-1' }).add(scopeConstructor);
const scope2 = createScope({ root: '.row-2' }).add(scopeConstructor);

const refreshScope1 = () => scope1.refresh();
const refreshScope2 = () => scope2.refresh();

$button1.addEventListener('click', refreshScope1);
$button2.addEventListener('click', refreshScope2);
```

#### Usage Pattern

Call `refresh()` when you need to reinitialize a scope with updated logic or responsive behavior.

---

## Scope Properties

Properties available on the `Scope` instance returned by a `createScope()` function.

| Property | Type | Description |
|----------|------|-------------|
| **data** | Object | An object used to store variables associated with the scope. Every property added to it is cleared when the scope is reverted |
| **defaults** | Object | Retrieves the default parameters for the scope |
| **root** | Document \| HTMLElement | Retrieves the root element for DOM operations in this scope |
| **constructors** | Array\<Function\> | Provides the array of constructor functions added to this scope |
| **revertConstructors** | Array\<Function\> | Provides the array of revert constructor functions |
| **revertibles** | Array | Gets the array of revertible objects created within this scope (Array\<Tickable\|Animatable\|Draggable\|ScrollObserver\|Scope\>) |
| **methods** | Object | Provides the object containing methods added to this scope |
| **matches** | Object | Provides current media query match results |
| **mediaQueryLists** | Object | Provides MediaQueryList objects for this scope |

### Access Pattern

```javascript
const scope = createScope();
scope.data          // Variables storage
scope.methods       // Added methods
scope.root          // DOM root element
scope.matches       // Media query results
```

**Note:** All scope properties are cleared upon calling the scope's revert method.
