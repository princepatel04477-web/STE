# Anime.js Timeline Documentation

Complete reference for Anime.js Timeline API (v4.0.0+).

## Table of Contents

1. [Creating Timelines](#creating-timelines)
2. [Adding Timers](#adding-timers)
3. [Adding Animations](#adding-animations)
4. [Sync WAAPI Animations](#sync-waapi-animations)
5. [Sync Timelines](#sync-timelines)
6. [Calling Functions](#calling-functions)
7. [Time Position](#time-position)
8. [Playback Settings](#playback-settings)
9. [Callbacks](#callbacks)
10. [Methods](#methods)
11. [Properties](#properties)

---

## Creating Timelines

Timelines are created using the `createTimeline()` method imported from the main `'animejs'` module. Timelines allow developers to synchronise animations, timers, and callbacks together.

### Import Methods

**From main module:**

```javascript
import { createTimeline } from 'animejs';
const timeline = createTimeline(parameters);
```

**From subpath:**

```javascript
import { createTimeline } from 'animejs/timeline';
```

### API Signature

```javascript
createTimeline(parameters)
```

| Parameter | Accepts | Description |
|-----------|---------|-------------|
| `parameters` | Object (optional) | Timeline playback settings and callbacks |

**Returns:** Timeline instance

### Core Methods Overview

The Timeline instance exposes these primary methods:

```javascript
timeline.add(target, animationParameters, position);
timeline.add(timerParameters, position);
timeline.sync(timelineB, position);
timeline.call(callbackFunction, position);
timeline.label(labelName, position);
```

### Basic Example

```javascript
import { createTimeline } from 'animejs';

const tl = createTimeline({ defaults: { duration: 750 } });

tl.label('start')
  .add('.square', { x: '15rem' }, 500)
  .add('.circle', { x: '15rem' }, 'start')
  .add('.triangle', { x: '15rem', rotate: '1turn' }, '<-=500');
```

---

## Adding Timers

### API Signatures

**Timer Creation:**

```javascript
timeline.add(parameters, position);
```

**Timer Synchronisation:**

```javascript
timeline.sync(timer, position);
```

### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| `parameters` | Object | Timer playback settings and Timer callbacks |
| `timer` | Timer instance | Pre-existing timer to synchronize |
| `position` | Time position value (optional) | When to insert in timeline |

**Returns:** The timeline itself (chainable)

### Code Example

```javascript
import { createTimeline, createTimer, utils } from 'animejs';

const [ $timer01, $timer02, $timer03 ] = utils.$('.timer');

const timer1 = createTimer({
  duration: 1500,
  onUpdate: self => $timer01.textContent = self.currentTime,
});

const tl = createTimeline()
.sync(timer1)
.add({
  duration: 500,
  onUpdate: self => $timer02.textContent = self.currentTime,
})
.add({
  onUpdate: self => $timer03.textContent = self.currentTime,
  duration: 1000
});
```

### Key Concepts

- Create timers directly via `add()` with parameter objects
- Synchronize pre-existing timer instances using `sync()`
- Both support optional time positioning
- Both enable method chaining for sequential timeline construction

---

## Adding Animations

### API Signatures

**Animation Creation with `add()`:**

```javascript
timeline.add(targets, parameters, position);
```

**Animation Synchronization with `sync()`:**

```javascript
timeline.sync(animation, position);
```

### Parameters

**For `add()` method:**

| Name | Accepts | Description |
|------|---------|-------------|
| `targets` | Targets | Elements to animate |
| `parameters` | Object | Animatable properties, tween parameters, playback settings, callbacks |
| `position` | Time position value (optional) | When to insert in timeline |

**For `sync()` method:**

| Name | Accepts | Description |
|------|---------|-------------|
| `animation` | Animation | Existing Animation object |
| `position` | Time position value (optional) | When to insert in timeline |

**Returns:** The timeline itself (chainable)

### Key Distinction

- `add()` allows composition with existing timeline children
- `sync()` - Tween value composition is handled when the animation is created, and won't affect the timeline's existing children when added

### Code Example

```javascript
import { createTimeline, animate } from 'animejs';

const circleAnimation = animate('.circle', {
  x: '15rem'
});

const tl = createTimeline()
  .sync(circleAnimation)
  .add('.triangle', {
    x: '15rem',
    rotate: '1turn',
    duration: 500,
    alternate: true,
    loop: 2,
  })
  .add('.square', {
    x: '15rem',
  });
```

---

## Sync WAAPI Animations

WAAPI (Web Animations API) animations can be synchronized to a timeline using the `sync()` method.

### API Signature

```javascript
timeline.sync(animation, position);
```

### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| `synced` | Animation \| Timer \| Timeline | The animation/timer/timeline to synchronize |
| `position` | Time position (optional) | When to sync the animation on the timeline |

**Returns:** The timeline itself (chainable)

### Code Example

```javascript
import { createTimeline, waapi } from 'animejs';

const circle = waapi.animate('.circle', {
  x: '15rem',
});

const triangle = waapi.animate('.triangle', {
  x: '15rem',
  y: [0, '-1.5rem', 0],
  ease: 'out(4)',
  duration: 750,
});

const square = waapi.animate('.square', {
  x: '15rem',
  rotateZ: 360,
});

const tl = createTimeline()
  .sync(circle, 0)
  .sync(triangle, 350)
  .sync(square, 250);
```

This example demonstrates synchronizing three WAAPI animations at different timeline positions (0ms, 350ms, and 250ms respectively).

---

## Sync Timelines

Timelines can be synchronized to another timeline using the `sync()` method, allowing complex animation sequences to be coordinated across multiple timeline objects.

### API Signature

```javascript
timelineA.sync(timelineB, position);
```

### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| `synced` | Animation \| Timer \| Timeline | The animation, timer, or timeline to synchronize |
| `position` | Time position (optional) | Where to insert the synced element in the timeline |

**Returns:** The timeline itself (chainable)

### Code Example

```javascript
import { createTimeline, animate } from 'animejs';

const circleAnimation = animate('.circle', {
  x: '15rem'
});

const tlA = createTimeline()
.sync(circleAnimation)
.add('.triangle', {
  x: '15rem',
  duration: 2000,
})
.add('.square', {
  x: '15rem',
});

const tlB = createTimeline({ defaults: { duration: 2000 } })
.add(['.triangle', '.square'], {
  rotate: 360,
}, 0)
.add('.circle', {
  scale: [1, 1.5, 1],
}, 0);

const tlMain = createTimeline()
.sync(tlA)
.sync(tlB, '-=2000');
```

### Key Features

- Enables hierarchical timeline composition
- Supports negative time position offsets (e.g., `'-=2000'`)
- Chainable API for fluent syntax
- Works with animations, timers, and other timelines

---

## Calling Functions

Functions are added to a timeline with the `call()` method, allowing you to execute arbitrary code at specific positions within a timeline sequence.

### API Signature

```javascript
timeline.call(callback, position);
```

### Parameters

| Name | Accepts | Description |
|------|---------|-------------|
| `callback` | Function | The function to execute |
| `position` | Time position (optional) | When to execute the function in the timeline |

**Returns:** The timeline itself (chainable)

### Code Example

```javascript
import { createTimeline, utils } from 'animejs';

const [ $functionA ] = utils.$('.function-A');
const [ $functionB ] = utils.$('.function-B');
const [ $functionC ] = utils.$('.function-C');

const tl = createTimeline()
.call(() => $functionA.textContent = 'A', 0)
.call(() => $functionB.textContent = 'B', 800)
.call(() => $functionC.textContent = 'C', 1200);
```

This enables synchronization of non-animation logic with animation events.

---

## Time Position

Time position specifies when a timeline child is inserted. If undefined, the child positions at the timeline's end.

### Methods Supporting Time Position

Time position is the final parameter in these methods:

```javascript
timeline.add(target, animationParameters, position)
timeline.add(timerParameters, position)
timeline.call(callbackFunction, position)
timeline.sync(labelName, position)
timeline.label(labelName, position)
```

### Time Position Types

| Type | Example | Behavior |
|------|---------|----------|
| Absolute | `100` | Inserts at exactly 100ms |
| Addition | `'+=100'` | Places 100ms after the previous element |
| Subtraction | `'-=100'` | Places 100ms before the previous element's end |
| Multiplier | `'*=.5'` | Positions at half the total element duration |
| Previous End | `'<'` | Aligns with previous element's end position |
| Previous Start | `'<<'` | Aligns with previous element's start position |
| Combined | `'<<+=250'` | Places 250ms after the previous element's start |
| Label | `'My Label'` | Positions at a labeled timeline point |
| Stagger | `stagger(10)` | Staggers element positioning by 10ms intervals |

### Code Example

```javascript
import { createTimeline } from 'animejs';

const tl = createTimeline()
  .label('start', 0)
  .add('.square', {
    x: '15rem',
    duration: 500,
  }, 500)
  .add('.circle', {
    x: '15rem',
    duration: 500,
  }, 'start')
  .add('.triangle', {
    x: '15rem',
    rotate: '1turn',
    duration: 500,
  }, '<-=250');
```

This example demonstrates:
- Absolute positioning (`500`)
- Label reference (`'start'`)
- Combined positioning (`'<-=250'`)

---

## Playback Settings

Timeline playback settings control timing and behaviors of timelines.

### Available Playback Settings

| Setting | Description |
|---------|-------------|
| `defaults` | Set default animation properties for all children |
| `delay` | Timing offset before playback |
| `loop` | Repetition count |
| `loopDelay` | Pause between loop iterations |
| `alternate` | Reverse direction on alternate loops |
| `reversed` | Start animation in reverse |
| `autoplay` | Begin automatically |
| `frameRate` | Rendering frame rate |
| `playbackRate` | Speed multiplier |
| `playbackEase` | Easing function for playback speed |

### Code Example

```javascript
createTimeline({
  defaults: {
    ease: 'out(3)',
    duration: 500,
  },
  loop: 3,
  alternate: true,
  autoplay: false,
  onBegin: () => {},
  onLoop: () => {},
  onUpdate: () => {},
});
```

---

## Callbacks

Timeline callbacks execute functions at specific points during timeline playback. They are defined directly in the `createTimeline()` parameters object.

### Available Callbacks

| Callback | Description |
|----------|-------------|
| `onBegin` | Executes when timeline begins |
| `onComplete` | Executes when timeline completes |
| `onBeforeUpdate` | Executes before each update |
| `onUpdate` | Executes during each update cycle |
| `onRender` | Executes on render |
| `onLoop` | Executes at each loop iteration |
| `onPause` | Executes when timeline pauses |
| `then()` | Promise-based callback method |

### Code Example

```javascript
createTimeline({
  defaults: {
    ease: 'out(3)',
    duration: 500,
  },
  loop: 3,
  alternate: true,
  autoplay: false,
  onBegin: () => {},
  onLoop: () => {},
  onUpdate: () => {},
});
```

---

## Methods

Timeline methods provide control over timing, behavior, and progression of timelines.

### Available Methods (20 total)

| Method | Description |
|--------|-------------|
| `add()` | Add animations/timers to timeline |
| `set()` | Set timeline properties |
| `sync()` | Synchronize timelines |
| `label()` | Create timeline labels |
| `remove()` | Remove items from timeline |
| `call()` | Execute functions at specific times |
| `init()` | Initialize timeline |
| `play()` | Start playback |
| `reset()` | Reset to initial state |
| `reverse()` | Play in reverse direction |
| `pause()` | Pause playback |
| `restart()` | Restart from beginning |
| `alternate()` | Toggle playback direction |
| `resume()` | Continue from paused state |
| `complete()` | Jump to end state |
| `cancel()` | Cancel timeline |
| `revert()` | Restore original state |
| `seek()` | Jump to specific time |
| `stretch()` | Modify timeline duration |
| `refresh()` | Update timeline calculations |

---

## Properties

Timeline properties available on instances returned by `createTimeline()`.

### Property Reference

| Property | Type | Description |
|----------|------|-------------|
| `id` | String \| Number | Gets and sets the timeline's identifier |
| `labels` | Object | Gets and sets the map of time position labels |
| `currentTime` | Number | Gets and sets the global current time in milliseconds |
| `iterationCurrentTime` | Number | Gets and sets the current iteration time in milliseconds |
| `deltaTime` | Number | Gets the elapsed time in ms between current and previous frame |
| `progress` | Number | Gets and sets overall progress from 0 to 1 |
| `iterationProgress` | Number | Gets and sets current iteration progress from 0 to 1 |
| `currentIteration` | Number | Gets and sets the current iteration count |
| `duration` | Number | Gets the total duration in milliseconds |
| `speed` | Number | Gets and sets the speed multiplier |
| `fps` | Number | Gets and sets the frames per second |
| `paused` | Boolean | Gets and sets pause state |
| `began` | Boolean | Gets and sets whether timeline has started |
| `completed` | Boolean | Gets and sets completion state |
| `reversed` | Boolean | Gets and sets reverse state |
| `backwards` | Boolean | Gets whether currently playing backwards |

### Usage Pattern

```javascript
const timeline = createTimeline(parameters);
timeline.property // access or modify
```

---

## Quick Reference

### Creating a Complete Timeline

```javascript
import { createTimeline, animate, waapi, utils } from 'animejs';

// Create timeline with settings
const tl = createTimeline({
  defaults: {
    ease: 'out(3)',
    duration: 500,
  },
  loop: 2,
  alternate: true,
  autoplay: false,
  onBegin: () => console.log('Timeline started'),
  onComplete: () => console.log('Timeline completed'),
  onUpdate: (self) => console.log('Progress:', self.progress),
});

// Add labels
tl.label('intro', 0)
  .label('main', 1000)
  .label('outro', 2000);

// Add animations at different time positions
tl.add('.element1', { x: 100, opacity: 1 }, 'intro')
  .add('.element2', { y: 50, scale: 1.2 }, 'main')
  .add('.element3', { rotate: 360 }, '<<+=250');

// Call functions at specific times
tl.call(() => console.log('Intro complete'), 'main')
  .call(() => console.log('Almost done'), 'outro');

// Control playback
tl.play();
// tl.pause();
// tl.reverse();
// tl.seek(500);
// tl.restart();
```

### Time Position Cheat Sheet

```
100       -> Absolute: at 100ms
'+=100'   -> Relative add: 100ms after previous end
'-=100'   -> Relative subtract: 100ms before previous end
'*=.5'    -> Multiplier: at 50% of element duration
'<'       -> Previous end position
'<<'      -> Previous start position
'<<+=250' -> 250ms after previous start
'label'   -> At named label position
stagger(10) -> Stagger by 10ms
```
