# Anime.js Engine Documentation

## Overview

The **Engine** drives and synchronizes all Animation, Timer, and Timeline instances in Anime.js.

```javascript
import { engine } from 'animejs';
```

The Engine functions as the central coordinator, ensuring synchronized playback across multiple Animation, Timer, and Timeline instances throughout your application.

---

## Engine Parameters

### timeUnit (seconds / milliseconds)

The `timeUnit` parameter configures whether time-related values use seconds or milliseconds globally throughout the engine.

**API Signature:**
```javascript
engine.timeUnit = 'value';
```

**Accepted Values:**
- `'s'` - Use seconds as the time unit
- `'ms'` - Use milliseconds as the time unit

**Default Value:** `'ms'` (milliseconds)

**Key Behavior:** The currently defined default duration is automatically adjusted to the newly specified time unit. When you switch units, existing duration defaults adapt accordingly.

**Code Example:**
```javascript
import { engine, animate, utils } from 'animejs';

const [ $timeS ] = utils.$('.time-s');
const [ $timeMs ] = utils.$('.time-ms');
const [ $ms, $s ] = utils.$('.toggle');

const secondsTimer = createTimer({
  duration: 1,
  loop: true,
  onUpdate: self => $timeS.textContent = utils.roundPad(self.iterationCurrentTime, 2)
});

const millisecondsTimer = createTimer({
  duration: 1000,
  loop: true,
  onUpdate: self => $timeMs.textContent = utils.roundPad(self.iterationCurrentTime, 2)
});

const toggleSetting = () => {
  const isUsingSeconds = engine.timeUnit === 's';
  engine.timeUnit = isUsingSeconds ? 'ms' : 's';
  $ms.disabled = isUsingSeconds;
  $s.disabled = !isUsingSeconds;
}

$ms.addEventListener('click', toggleSetting);
$s.addEventListener('click', toggleSetting);
```

---

### speed

The `speed` parameter controls the global playback rate for all animations managed by the engine. This affects animation velocity across the entire system simultaneously.

**API Signature:**
```javascript
engine.speed = value;
```

**Parameters:**
- **Type:** Number
- **Range:** Greater than or equal to `0`
- **Default:** `1`

**Behavior:**
- Values > 1: Speed up animations
- Values between 0-1: Slow down animations
- Use case: Create slow-motion or fast-forward effects globally

**Code Example:**
```javascript
import { engine, animate, utils } from 'animejs';

const [ $container ] = utils.$('.container');
const [ $range ] = utils.$('.range');

for (let i = 0; i < 150; i++) {
  const $particle = document.createElement('div');
  $particle.classList.add('particle');
  $container.appendChild($particle);
  animate($particle, {
    x: utils.random(-10, 10, 2) + 'rem',
    y: utils.random(-3, 3, 2) + 'rem',
    scale: [{ from: 0, to: 1 }, { to: 0 }],
    delay: utils.random(0, 1000),
    loop: true,
  });
}

function onInput() {
  utils.sync(() => engine.speed = this.value);
}

$range.addEventListener('input', onInput);
```

**Basic Usage:**
```javascript
engine.speed = 0.5; // Run all animations at half speed
```

---

### fps

The `fps` parameter controls the global frame rate for animation updates and rendering. It's useful for optimizing performance on lower-end devices or when managing many simultaneous animations.

**API Signature:**
```javascript
engine.fps = value;
```

**Parameters:**
- **Type:** Number
- **Constraint:** Must be greater than 0
- **Default Value:** `120`

**Note:** Adjusting the frame rate can help optimize performance on lower-end devices or when running many complex animations simultaneously. However, it may affect the perceived smoothness of animations.

**Code Example:**
```javascript
import { engine, animate, utils } from 'animejs';

const [ $container ] = utils.$('.container');
const [ $range ] = utils.$('.range');

for (let i = 0; i < 150; i++) {
  const $particle = document.createElement('div');
  $particle.classList.add('particle');
  $container.appendChild($particle);
  animate($particle, {
    x: utils.random(-10, 10, 2) + 'rem',
    y: utils.random(-3, 3, 2) + 'rem',
    scale: [{ from: 0, to: 1 }, { to: 0 }],
    delay: utils.random(0, 1000),
    loop: true,
  });
}

function onInput() {
  engine.fps = this.value;
}

$range.addEventListener('input', onInput);
```

---

### precision

The `precision` parameter controls decimal place rounding for string values during animations in Anime.js.

**API Signature:**
```javascript
engine.precision = value;
```

**Parameters:**
- **Type:** Number
- Numbers >= 0: specifies decimal places for rounding
- Numbers < 0: disables rounding
- **Default Value:** `4`

**Scope:** Only affects CSS properties, SVG, and DOM attributes with string values (e.g., `'120.725px'`, `'1.523'`). First and last animation frames preserve full precision.

**Performance Note:** Increasing precision beyond 4 rarely produces visible improvements. Lowering it may help when animating numerous elements simultaneously, though quality suffers.

**Code Example:**
```javascript
import { engine, animate, utils } from 'animejs';

const [ $container ] = utils.$('.container');
const [ $range ] = utils.$('.range');

for (let i = 0; i < 150; i++) {
  const $particle = document.createElement('div');
  $particle.classList.add('particle');
  $container.appendChild($particle);
  animate($particle, {
    x: utils.random(-10, 10, 2) + 'rem',
    y: utils.random(-3, 3, 2) + 'rem',
    scale: [{ from: 0, to: 1 }, { to: 0 }],
    delay: utils.random(0, 1000),
    loop: true,
  });
}

function onInput() {
  engine.precision = this.value;
}

$range.addEventListener('input', onInput);
```

**Basic Usage:**
```javascript
engine.precision = 1; // rounds to 1 decimal ('120.7px')
```

---

### pauseOnDocumentHidden

Controls whether the engine pauses animations when the browser tab is hidden.

**API Signature:**
```javascript
engine.pauseOnDocumentHidden = true;
```

**Parameters:**
- **Type:** Boolean
- **Default Value:** `true`

**Behavior:**
- When enabled (`true`): Animations pause automatically when the browser tab loses focus.
- When disabled (`false`): Animations adjust their `currentTime` to compensate for idle background time, creating continuous playback appearance.

**Code Example:**
```javascript
import { engine, utils, createTimer } from 'animejs';

const [ $globalTime ] = utils.$('.global-time');
const [ $engineTime ] = utils.$('.engine-time');
const [ $toggle ] = utils.$('.toggle');

const startTime = Date.now();

const globalTimer = setInterval(() => {
  $globalTime.textContent = Date.now() - startTime;
}, 16);

const engineTimer = createTimer({
  onUpdate: self => $engineTime.textContent = self.currentTime
});

const toggleSetting = () => {
  const isPauseWhenHidden = engine.pauseOnDocumentHidden;
  if (isPauseWhenHidden) {
    engine.pauseOnDocumentHidden = false;
    $toggle.textContent = 'Disabled (Switch tab to see the effect)';
  } else {
    engine.pauseOnDocumentHidden = true;
    $toggle.textContent = 'Enabled (Switch tab to see the effect)';
  }
}

$toggle.addEventListener('click', toggleSetting);
```

---

## Engine Methods

### update()

Manually ticks the engine when `engine.useDefaultMainLoop` is set to false. This is useful for integrating Anime.js into projects with existing animation loops, such as Three.js or game engines.

**API Signature:**
```javascript
engine.update()
```

**Return Value:** Returns the Engine instance.

**Code Example:**
```javascript
import { engine, createTimeline, utils } from 'animejs';

// Prevents Anime.js from using its own loop
engine.useDefaultMainLoop = false;

const [ $container ] = utils.$('.container');
const color = utils.get($container, 'color');
const { width, height } = $container.getBoundingClientRect();

// Three.js setup
const renderer = new THREE.WebGLRenderer({ alpha: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 20);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color, wireframe: true });

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
$container.appendChild(renderer.domElement);
camera.position.z = 5;

function createAnimatedCube() {
  const cube = new THREE.Mesh(geometry, material);
  const x = utils.random(-10, 10, 2);
  const y = utils.random(-5, 5, 2);
  const z = [-10, 7];
  const r = () => utils.random(-Math.PI * 2, Math.PI * 2, 3);
  const duration = 4000;
  createTimeline({
    delay: utils.random(0, duration),
    defaults: { loop: true, duration, ease: 'inSine', },
  })
  .add(cube.position, { x, y, z }, 0)
  .add(cube.rotation, { x: r, y: r, z: r }, 0)
  .init();
  scene.add(cube);
}

for (let i = 0; i < 40; i++) {
  createAnimatedCube();
}

function render() {
  engine.update(); // Manually update Anime.js engine
  renderer.render(scene, camera); // Render Three.js scene
}

renderer.setAnimationLoop(render);
```

**Key Points:**
- Available since version 4.0.0
- Requires disabling the default main loop first
- Essential for custom animation loop integration

---

### pause()

Pauses the engine's main loop, pausing all active Timer, Animation, and Timeline instances.

**API Signature:**
```javascript
engine.pause()
```

**Return Value:** Returns the Engine instance (allows chaining).

**Key Behaviors:**
- Stops all active animations across Timer, Animation, and Timeline objects
- New animations can be added while paused but won't execute until engine resumes
- Animations remain at their paused state and resume from that point

**Code Example:**
```javascript
import { engine, animate, utils } from 'animejs';

const [ $container ] = utils.$('.container');
const [ $add, $pause ] = utils.$('button');

function addAnimation() {
  const $particle = document.createElement('div');
  $particle.classList.add('particle');
  $container.appendChild($particle);
  animate($particle, {
    x: utils.random(-10, 10, 2) + 'rem',
    y: utils.random(-3, 3, 2) + 'rem',
    scale: [{ from: 0, to: 1 }, { to: 0 }],
    loop: true,
  });
}

function pauseEngine() {
  engine.pause();
  $pause.setAttribute('disabled', 'true');
  $pause.textContent = 'Resume in 3 seconds';
  setTimeout(() => {
    engine.resume();
    $pause.removeAttribute('disabled');
  }, 3000);
}

$add.addEventListener('click', addAnimation);
$pause.addEventListener('click', pauseEngine);
```

---

### resume()

Resumes the engine after being paused with a call to `engine.pause()`.

**API Signature:**
```javascript
engine.resume()
```

**Return Value:** Returns the Engine instance.

**Code Example:**
```javascript
import { engine, animate, utils } from 'animejs';

const [ $container ] = utils.$('.container');
const [ $pause, $resume ] = utils.$('button');

function addAnimation() {
  const $particle = document.createElement('div');
  $particle.classList.add('particle');
  $container.appendChild($particle);
  animate($particle, {
    x: utils.random(-10, 10, 2) + 'rem',
    y: utils.random(-3, 3, 2) + 'rem',
    scale: [{ from: 0, to: 1 }, { to: 0 }],
    loop: true,
    delay: utils.random(0, 1000)
  });
}

for (let i = 0; i < 150; i++) addAnimation();

const resumeEngine = () => engine.resume();
const pauseEngine = () => engine.pause();

$pause.addEventListener('click', pauseEngine);
$resume.addEventListener('click', resumeEngine);
```

**Basic Usage Pattern:**
```javascript
engine.pause();  // Pauses the engine and all animations
engine.resume(); // Resumes the engine and all animations
```

---

## Engine Properties

| Property | Type | Description |
|----------|------|-------------|
| **timeUnit** | String | Gets and sets the unit of time to use for time-related values (`'ms'` \| `'s'`) |
| **currentTime** | Number | Gets the current time of the engine |
| **deltaTime** | Number | Gets the time elapsed since the last frame |
| **precision** | Number | Gets and sets how many decimal places to round string values to during an animation |
| **speed** | Number | Gets or sets the global playback rate for all animations |
| **fps** | Number | Gets or sets the global frame rate for all animations |
| **useDefaultMainLoop** | Boolean | Gets and sets whether the engine uses its default main loop |
| **pauseOnDocumentHidden** | Boolean | Gets or sets whether the engine pauses when the tab is hidden |

**Access Pattern:**
```javascript
import { engine } from 'animejs';

engine.deltaTime
engine.useDefaultMainLoop
engine.pauseOnDocumentHidden
```

---

## Engine Defaults

The engine defaults establish global properties applied to all Timer, Animation, and Timeline instances. These settings are accessible via the `defaults` Object within `engine`.

**Code Example:**
```javascript
import { engine } from 'animejs';

engine.defaults.duration = 500;
```

### Default Properties Table

| Property | Accepted Values |
|----------|-----------------|
| playbackEase | Easing name String \| Easing Function |
| playbackRate | Number |
| frameRate | Number |
| loop | Number \| Boolean |
| reversed | Boolean |
| alternate | Boolean |
| autoplay | Boolean |
| duration | Number \| Function |
| delay | Number \| Function |
| composition | Composition types String \| Function |
| ease | Easing name String \| Easing Function |
| loopDelay | Number |
| modifier | Modifier Function |
| onBegin | Callback Function |
| onUpdate | Callback Function |
| onRender | Callback Function |
| onLoop | Callback Function |
| onComplete | Callback Function |
| onPause | Callback Function |

This feature allows developers to configure animation behaviors globally rather than specifying them for each individual instance.

---

*Documentation for Anime.js v4.0.0*
