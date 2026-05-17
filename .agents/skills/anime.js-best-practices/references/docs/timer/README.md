# Anime.js Timer Documentation

> Complete reference for Anime.js Timer API (v4.0.0+)

Timers schedule and control timed callbacks that can be used as an alternative to `setTimeout()` or `setInterval()`, keeping animations and callbacks synchronized.

## Table of Contents

- [Creating a Timer](#creating-a-timer)
- [Import Methods](#import-methods)
- [Playback Settings](#playback-settings)
  - [delay](#delay)
  - [duration](#duration)
  - [loop](#loop)
  - [loopDelay](#loopdelay)
  - [alternate](#alternate)
  - [reversed](#reversed)
  - [autoplay](#autoplay)
  - [frameRate](#framerate)
  - [playbackRate](#playbackrate)
- [Callbacks](#callbacks)
  - [onBegin](#onbegin)
  - [onComplete](#oncomplete)
  - [onUpdate](#onupdate)
  - [onLoop](#onloop)
  - [onPause](#onpause)
  - [then()](#then)
- [Methods](#methods)
  - [play()](#play)
  - [reverse()](#reverse)
  - [pause()](#pause)
  - [restart()](#restart)
  - [alternate()](#alternate-method)
  - [resume()](#resume)
  - [complete()](#complete)
  - [reset()](#reset)
  - [cancel()](#cancel)
  - [revert()](#revert)
  - [seek()](#seek)
  - [stretch()](#stretch)
- [Properties](#properties)

---

## Creating a Timer

### API Signature

```javascript
createTimer(parameters)
```

**Parameters:**
- `parameters` (optional): Object containing timer playback settings and callbacks

**Returns:** Timer instance

### Basic Example

```javascript
import { createTimer } from 'animejs';

const [ $time, $count ] = utils.$('.value');

createTimer({
  duration: 1000,
  loop: true,
  frameRate: 30,
  onUpdate: self => $time.textContent = self.currentTime,
  onLoop: self => $count.textContent = self._currentIteration
});
```

---

## Import Methods

**From main module:**
```javascript
import { createTimer } from 'animejs';
const timer = createTimer(parameters);
```

**From standalone subpath:**
```javascript
import { createTimer } from 'animejs/timer';
```

---

## Playback Settings

Timer playback settings control the timing and behavior of timers.

```javascript
createTimer({
  duration: 1000,
  frameRate: true,
  loop: true,
  // Playback Settings
  onBegin: () => {},
  onLoop: () => {},
  onUpdate: () => {},
});
```

### delay

Specifies the time in milliseconds before a timer starts execution.

| Property | Value |
|----------|-------|
| **Accepts** | `Number` >= 0 |
| **Default** | `0` |

**Global default configuration:**
```javascript
import { engine } from 'animejs';
engine.defaults.delay = 500;
```

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $time ] = utils.$('.time');

createTimer({
  delay: 2000,
  onUpdate: self => $time.textContent = self.currentTime
});
```

---

### duration

Defines how long a timer runs in milliseconds. Setting `0` completes the timer instantly upon play.

| Property | Value |
|----------|-------|
| **Accepts** | `Number` >= 0 (clamped to `1e12` max) |
| **Default** | `Infinity` |

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $time ] = utils.$('.time');

createTimer({
  duration: 2000,
  onUpdate: self => $time.textContent = self.currentTime
});
```

---

### loop

Defines how many times a timer repeats during playback.

| Value | Effect |
|-------|--------|
| `Number` | Loop count in range `[0, Infinity]` |
| `Infinity` | Loop indefinitely |
| `true` | Equivalent to `Infinity` |
| `-1` | Equivalent to `Infinity` |

**Default:** `0` (no looping)

**Global default configuration:**
```javascript
import { engine } from 'animejs';
engine.defaults.loop = true;
```

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $loops ] = utils.$('.loops');
const [ $time ] = utils.$('.time');

let loops = 0;

createTimer({
  loop: true,
  duration: 1000,
  onLoop: () => $loops.textContent = ++loops,
  onUpdate: self => $time.textContent = self.iterationCurrentTime
});
```

---

### loopDelay

Specifies the pause between loop iterations in milliseconds.

| Property | Value |
|----------|-------|
| **Accepts** | `Number` >= 0 |
| **Default** | `0` |

**Example:**
```javascript
createTimer({
  duration: 1000,
  loop: true,
  loopDelay: 500, // 500ms pause between each loop
  onLoop: () => console.log('Loop completed')
});
```

---

### alternate

Controls whether a timer's direction reverses on each iteration when `loop` is enabled.

| Property | Value |
|----------|-------|
| **Accepts** | `Boolean` |
| **Default** | `false` |

**Global default configuration:**
```javascript
import { engine } from 'animejs';
engine.defaults.alternate = true;
```

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $loops ] = utils.$('.loops');
const [ $time ] = utils.$('.time');

let loops = 0;

createTimer({
  loop: true,
  duration: 1000,
  alternate: true,
  onLoop: () => $loops.textContent = ++loops,
  onUpdate: self => $time.textContent = self.iterationCurrentTime
});
```

When enabled, the direction of the timer alternates on each iteration, creating a back-and-forth motion effect rather than restarting from the beginning each cycle.

---

### reversed

Sets the initial direction of a timer. The timer `currentTime` always progresses from `0` to `duration`. Only the `iterationTime` property is actually reversed.

| Value | Effect |
|-------|--------|
| `true` | Timer's first iteration runs backward |
| `false` | Timer's first iteration runs normally |

**Default:** `false`

**Global default configuration:**
```javascript
import { engine } from 'animejs';
engine.defaults.reversed = true;
```

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $iterationTime ] = utils.$('.iteration-time');
const [ $currentTime ] = utils.$('.current-time');

createTimer({
  duration: 10000,
  reversed: true,
  onUpdate: self => {
    $iterationTime.textContent = self.iterationCurrentTime;
    $currentTime.textContent = self.currentTime;
  }
});
```

---

### autoplay

Controls the initial play mode of a timer.

| Value | Behavior |
|-------|----------|
| `true` | Timer plays automatically upon creation |
| `false` | Timer requires manual triggering via `.play()` |
| `onScroll()` | Timer starts when scroll threshold conditions are met |

**Default:** `true`

> **Note:** The autoplay parameter has no effect when the timer is added to a timeline, and will be overridden to `false`.

**Global default configuration:**
```javascript
import { engine } from 'animejs';
engine.defaults.autoplay = false;
```

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $time ] = utils.$('.time');
const [ $playButton ] = utils.$('.play');

const timer = createTimer({
  autoplay: false,
  onUpdate: self => $time.textContent = self.currentTime
});

const playTimer = () => timer.play();

$playButton.addEventListener('click', playTimer);
```

---

### frameRate

Controls the update frequency of the timer in frames per second.

| Property | Value |
|----------|-------|
| **Accepts** | `Number` (fps) or `true` for default |
| **Default** | `60` (typical display refresh rate) |

**Example:**
```javascript
createTimer({
  duration: 1000,
  frameRate: 30, // Update 30 times per second
  onUpdate: self => console.log(self.currentTime)
});
```

---

### playbackRate

Speed multiplier for the timer playback.

| Property | Value |
|----------|-------|
| **Accepts** | `Number` > 0 |
| **Default** | `1` |

**Example:**
```javascript
createTimer({
  duration: 2000,
  playbackRate: 2, // Plays at double speed (completes in 1000ms)
  onUpdate: self => console.log(self.currentTime)
});
```

---

## Callbacks

Callbacks are functions executed at specific points during timer playback.

```javascript
createTimer({
  duration: 1000,
  frameRate: true,
  loop: true,
  onBegin: () => {},
  onLoop: () => {},
  onUpdate: () => {},
});
```

### onBegin

Executes when the timer starts (after any delay).

| Property | Value |
|----------|-------|
| **Accepts** | `Function` |
| **Callback Argument** | Timer instance |

**Example:**
```javascript
createTimer({
  duration: 2000,
  delay: 1000,
  onBegin: self => {
    console.log('Timer started!');
    console.log('Duration:', self.duration);
  }
});
```

---

### onComplete

Executes when the timer finishes all iterations.

| Property | Value |
|----------|-------|
| **Accepts** | `Function` |
| **Callback Argument** | Timer instance |

**Example:**
```javascript
createTimer({
  duration: 2000,
  onComplete: self => {
    console.log('Timer completed!');
    console.log('Final time:', self.currentTime);
  }
});
```

---

### onUpdate

Executes on every frame during playback progression.

| Property | Value |
|----------|-------|
| **Accepts** | `Function` |
| **Callback Argument** | Timer instance |

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $time ] = utils.$('.time');

createTimer({
  duration: 2000,
  onUpdate: self => {
    $time.textContent = self.currentTime;
  }
});
```

---

### onLoop

Executes when a loop cycle completes.

| Property | Value |
|----------|-------|
| **Accepts** | `Function` |
| **Callback Argument** | Timer instance |

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $loops ] = utils.$('.loops');

let loopCount = 0;

createTimer({
  duration: 1000,
  loop: 5,
  onLoop: self => {
    loopCount++;
    $loops.textContent = loopCount;
    console.log('Loop iteration:', self.currentIteration);
  }
});
```

---

### onPause

Executes when the timer is paused.

| Property | Value |
|----------|-------|
| **Accepts** | `Function` |
| **Callback Argument** | Timer instance |

**Example:**
```javascript
createTimer({
  duration: 5000,
  onPause: self => {
    console.log('Timer paused at:', self.currentTime);
  }
});
```

---

### then()

Returns a `Promise` that resolves when the timer completes, enabling promise-based and async/await patterns.

**API Signature:**
```javascript
createTimer({duration: 500}).then(callback);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | `Function` | Executed when timer completes; receives timer instance as first argument |

**Returns:** `Promise` - Resolves upon timer completion

**Basic Pattern:**
```javascript
createTimer({duration: 500}).then(callback);
```

**Async/Await Pattern:**
```javascript
async function waitForTimerToComplete() {
  return createTimer({ duration: 250 })
}

const asyncTimer = await waitForTimerToComplete();
```

**Practical Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $status ] = utils.$('.status');
const [ $time ] = utils.$('.time');

createTimer({
  duration: 2000,
  onUpdate: self => $time.textContent = self.currentTime,
})
.then(() => $status.textContent = 'fulfilled');
```

---

## Methods

Timer methods provide control over the timing, behaviour, and progression of a timer. All methods return the timer instance for chaining.

```javascript
const timer = createTimer(parameters);
timer.play();
timer.pause();
timer.restart();
```

### play()

Forces a timer to play forward.

**API Signature:**
```javascript
play()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $playButton ] = utils.$('.play');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  duration: 2000,
  autoplay: false,
  onUpdate: self => $time.textContent = self.iterationCurrentTime,
});

const playTimer = () => timer.play();

$playButton.addEventListener('click', playTimer);
```

---

### reverse()

Forces a timer to play backward.

**API Signature:**
```javascript
reverse()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $reverseButton ] = utils.$('.reverse');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  duration: 2000,
  onUpdate: self => $time.textContent = self.iterationCurrentTime,
});

const reverseTimer = () => timer.reverse();

$reverseButton.addEventListener('click', reverseTimer);
```

---

### pause()

Halts a currently running timer.

**API Signature:**
```javascript
pause()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $pauseButton ] = utils.$('.pause');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  onUpdate: self => $time.textContent = self.currentTime
});

const pauseTimer = () => timer.pause();

$pauseButton.addEventListener('click', pauseTimer);
```

---

### restart()

Resets all timer properties and sets the `currentTime` to `0`. If `autoplay` is set to `true`, the timer plays automatically.

**API Signature:**
```javascript
restart()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $restartButton ] = utils.$('.restart');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  onUpdate: self => $time.textContent = self.currentTime
});

const restartTimer = () => timer.restart();

$restartButton.addEventListener('click', restartTimer);
```

---

### alternate() (Method)

Toggles the playback direction while adjusting the `currentTime` position to reflect the new time progress. Only the `iterationTime` is actually played in reverse since the `currentTime` always starts at `0` and ends at `duration`.

**API Signature:**
```javascript
alternate()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $alternateButton ] = utils.$('.button');
const [ $iterationTime ] = utils.$('.iteration-time');

const timer = createTimer({
  duration: 10000,
  loop: true,
  onUpdate: self => {
    $iterationTime.textContent = self.iterationCurrentTime;
  }
});

const alternateTimer = () => timer.alternate();

$alternateButton.addEventListener('click', alternateTimer);
```

---

### resume()

Resumes playback of a paused timer in its current direction.

**API Signature:**
```javascript
resume()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $resumeButton, $pauseButton, $alternateButton ] = utils.$('.button');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  duration: 2000,
  onUpdate: self => $time.textContent = self.iterationCurrentTime,
  loop: true,
});

const resumeTimer = () => timer.resume();
const pauseTimer = () => timer.pause();
const alternateTimer = () => timer.alternate();

$resumeButton.addEventListener('click', resumeTimer);
$pauseButton.addEventListener('click', pauseTimer);
$alternateButton.addEventListener('click', alternateTimer);
```

---

### complete()

Instantly finishes a timer animation, advancing it to its final state.

**API Signature:**
```javascript
complete()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $completeButton ] = utils.$('.complete');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  duration: 100000,
  onUpdate: self => $time.textContent = self.currentTime
});

const completeTimer = () => timer.complete();

$completeButton.addEventListener('click', completeTimer);
```

---

### reset()

Pauses and resets `currentTime`, `progress`, `reversed`, `began`, `completed` properties to their default values.

**API Signature:**
```javascript
timer.reset(softReset);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `softReset` | `Boolean` | `false` | If `true`, resets internal values without triggering visual render |

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $time ] = utils.$('.time');
const [ $reset ] = utils.$('.button');

const timer = createTimer({
  onUpdate: self => $time.textContent = self.currentTime,
});

const resetTimer = () => {
  timer.reset();
  $time.textContent = timer.currentTime;
}

$reset.addEventListener('click', resetTimer);
```

---

### cancel()

Pauses a timer, removes it from the engine's main loop, and frees up memory.

**API Signature:**
```javascript
cancel()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $playButton ] = utils.$('.play');
const [ $cancelButton ] = utils.$('.cancel');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  onUpdate: self => $time.textContent = self.currentTime
});

const playTimer = () => timer.play();
const cancelTimer = () => timer.cancel();

$playButton.addEventListener('click', playTimer);
$cancelButton.addEventListener('click', cancelTimer);
```

---

### revert()

Cancels the timer and reverts the linked `onScroll()` instance if necessary. Use it when you want to completely stop and destroy a timer and its attached ScrollObserver.

**API Signature:**
```javascript
timer.revert()
```

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $revertButton ] = utils.$('.revert');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  onUpdate: self => $time.textContent = self.currentTime
});

const revertTimer = () => {
  timer.revert();
  $time.textContent = timer.currentTime
}

$revertButton.addEventListener('click', revertTimer);
```

---

### seek()

Updates the `currentTime` of the timer and advances it to a specific time.

**API Signature:**
```javascript
timer.seek(time, muteCallbacks);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `time` | `Number` | - | The new `currentTime` in ms of the timer |
| `muteCallbacks` | `Boolean` | `false` | If `true`, prevents callbacks from firing |

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $range ] = utils.$('.range');
const [ $playPauseButton ] = utils.$('.play-pause');
const [ $time ] = utils.$('.time');

const updateButtonLabel = timer => {
  $playPauseButton.textContent = timer.paused ? 'Play' : 'Pause';
}

const timer = createTimer({
  duration: 2000,
  autoplay: false,
  onUpdate: self => {
    $range.value = self.currentTime;
    $time.textContent = self.currentTime;
    updateButtonLabel(self);
  },
  onComplete: updateButtonLabel,
});

const seekTimer = () => timer.seek(+$range.value);

const playPauseTimer = () => {
  if (timer.paused) {
    timer.play();
  } else {
    timer.pause();
    updateButtonLabel(timer);
  }
}

$range.addEventListener('input', seekTimer);
$playPauseButton.addEventListener('click', playPauseTimer);
```

---

### stretch()

Changes the total duration of a timer to fit a specific time. The total duration equals the iteration duration multiplied by total iterations.

**API Signature:**
```javascript
timer.stretch(duration);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `duration` | `Number` | The new total duration in milliseconds of the timer |

**Returns:** The timer itself (enables method chaining)

**Example:**
```javascript
import { createTimer, utils } from 'animejs';

const [ $range ] = utils.$('.range');
const [ $duration ] = utils.$('.duration');
const [ $time ] = utils.$('.time');

const timer = createTimer({
  duration: 2000,
  onUpdate: self => $time.textContent = self.currentTime
});

const stretchTimer = () => {
  timer.stretch(+$range.value);
  $duration.textContent = timer.duration;
  timer.restart();
}

$range.addEventListener('input', stretchTimer);
```

---

## Properties

Timer properties provide read and write access to the timer's state.

```javascript
const timer = createTimer(parameters);
      ┌────────────┐
timer.│progress    │
timer.│currentTime ├─ Properties
timer.│duration    │
      └────────────┘
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `String` \| `Number` | Gets and sets the timer's identifier |
| `deltaTime` | `Number` (ms) | Elapsed time between current and previous frame |
| `currentTime` | `Number` (ms) | Global current time of the timer |
| `iterationCurrentTime` | `Number` (ms) | Current iteration time |
| `progress` | `Number` (0-1) | Overall progress from 0 to 1 |
| `iterationProgress` | `Number` (0-1) | Current iteration progress from 0 to 1 |
| `currentIteration` | `Number` | Current iteration count |
| `speed` | `Number` | Playback rate multiplier |
| `fps` | `Number` | Frame rate setting |
| `paused` | `Boolean` | Whether timer is paused |
| `began` | `Boolean` | Whether timer has started |
| `completed` | `Boolean` | Whether timer has completed |
| `reversed` | `Boolean` | Whether timer is reversed |
| `backwards` | `Boolean` | Whether currently playing backwards |
| `duration` | `Number` (ms) | Total duration of the timer |

All properties support both getter and setter operations where applicable.

**Example - Reading Properties:**
```javascript
const timer = createTimer({
  duration: 2000,
  loop: 3,
  onUpdate: self => {
    console.log('Progress:', self.progress);
    console.log('Current Time:', self.currentTime);
    console.log('Iteration:', self.currentIteration);
    console.log('Is Paused:', self.paused);
  }
});
```

**Example - Setting Properties:**
```javascript
const timer = createTimer({ duration: 2000 });

// Set custom ID
timer.id = 'my-timer';

// Change playback speed
timer.speed = 2; // Double speed
```

---

## Complete Example

Here is a comprehensive example demonstrating multiple timer features:

```javascript
import { createTimer, utils } from 'animejs';

const [ $time ] = utils.$('.time');
const [ $progress ] = utils.$('.progress');
const [ $status ] = utils.$('.status');
const [ $playBtn, $pauseBtn, $restartBtn ] = utils.$('.button');

const timer = createTimer({
  duration: 5000,
  delay: 500,
  loop: 3,
  alternate: true,
  autoplay: false,

  onBegin: () => {
    $status.textContent = 'Started';
  },

  onUpdate: self => {
    $time.textContent = Math.round(self.currentTime);
    $progress.textContent = (self.progress * 100).toFixed(1) + '%';
  },

  onLoop: self => {
    console.log('Completed loop:', self.currentIteration);
  },

  onPause: () => {
    $status.textContent = 'Paused';
  },

  onComplete: () => {
    $status.textContent = 'Completed';
  }
});

// Promise-based completion
timer.then(() => {
  console.log('Timer finished via promise!');
});

// Control buttons
$playBtn.addEventListener('click', () => {
  timer.play();
  $status.textContent = 'Playing';
});

$pauseBtn.addEventListener('click', () => timer.pause());

$restartBtn.addEventListener('click', () => {
  timer.restart();
  $status.textContent = 'Restarted';
});
```

---

## Method Chaining

All timer methods return the timer instance, enabling fluent method chaining:

```javascript
const timer = createTimer({ duration: 2000, autoplay: false })
  .play()
  .pause()
  .seek(1000)
  .play();
```

---

## Best Practices

1. **Use timers instead of setTimeout/setInterval** for animation-related timing to stay synchronized with the animation engine.

2. **Clean up timers** when they are no longer needed using `cancel()` or `revert()` to free memory.

3. **Use `autoplay: false`** when you need precise control over when the timer starts.

4. **Leverage callbacks** to respond to timer lifecycle events rather than polling properties.

5. **Use `then()`** for promise-based workflows and async/await patterns.

6. **Set appropriate `frameRate`** to balance performance and smoothness for your use case.
