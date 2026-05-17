# Advanced anime.js Patterns

Advanced techniques including text animations, draggable elements, layout animations, and WAAPI integration.

## Text Animations with splitText

Split text into animatable segments for character-by-character or word-by-word effects.

### Basic Text Splitting

```javascript
import { splitText, animate, stagger } from 'animejs';

// Split text element into words and characters
const { words, chars, lines } = splitText('h1', {
  words: true,
  chars: true,
  lines: true
});

// Animate characters
animate(chars, {
  opacity: [0, 1],
  translateY: [20, 0],
  delay: stagger(30),
  duration: 600,
  ease: 'outExpo'
});
```

### Split Options

```javascript
const split = splitText('.text-element', {
  // What to split into
  words: true,           // Split into words
  chars: true,           // Split into characters
  lines: true,           // Split into lines

  // Character handling
  includeSpaces: false,  // Include space characters

  // Accessibility
  accessible: true,      // Add aria-label for screen readers

  // Debug mode
  debug: true,           // Visual debugging

  // Wrapper options
  words: { wrap: 'span' },           // Wrap words in span
  chars: { wrap: 'span', class: 'char' },  // Custom class
  lines: { wrap: 'div' }             // Wrap lines in div
});
```

### Accessing Split Elements

```javascript
const split = splitText('p');

split.words    // Array of word elements
split.chars    // Array of character elements
split.lines    // Array of line elements

// Each element has data attributes
// data-word="0" - word index
// data-char="0" - character index
// data-line="0" - line index
```

### Text Animation Patterns

#### Typewriter Effect

```javascript
const { chars } = splitText('.typewriter');

animate(chars, {
  opacity: [0, 1],
  delay: stagger(50),
  duration: 1,
  ease: 'steps(1)'
});
```

#### Wave Effect

```javascript
const { chars } = splitText('.wave-text');

animate(chars, {
  translateY: [0, -20, 0],
  delay: stagger(50, { from: 'center' }),
  duration: 600,
  loop: true,
  ease: 'inOutQuad'
});
```

#### Reveal by Line

```javascript
import { createTimeline, splitText, stagger } from 'animejs';

const { lines, words } = splitText('.reveal-text', {
  lines: { wrap: 'clip' },  // Clip overflow for reveal effect
  words: true
});

const tl = createTimeline();

tl.add(words, {
  translateY: ['100%', '0%'],
  delay: stagger(30),
  duration: 800,
  ease: 'outExpo'
});
```

#### Scramble Text (Random Characters)

```javascript
const { chars } = splitText('.scramble');
const originalChars = chars.map(c => c.textContent);
const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Scramble
chars.forEach((char, i) => {
  let iterations = 0;
  const interval = setInterval(() => {
    char.textContent = randomChars[Math.floor(Math.random() * randomChars.length)];
    iterations++;
    if (iterations > 10) {
      char.textContent = originalChars[i];
      clearInterval(interval);
    }
  }, 30 + i * 20);
});
```

## Draggable Elements

Create interactive draggable elements with physics-based animations.

### Basic Draggable

```javascript
import { draggable } from 'animejs';

const drag = draggable('.draggable-element', {
  x: true,   // Enable horizontal drag
  y: true    // Enable vertical drag
});
```

### Constrained Dragging

```javascript
draggable('.element', {
  x: true,
  y: true,
  container: '.bounds',           // Constrain to container
  containerPadding: 20,           // Padding from edges
  containerFriction: 0.5          // Resistance at edges
});
```

### Snap to Grid

```javascript
draggable('.grid-item', {
  x: true,
  y: true,
  snap: {
    x: 50,    // Snap every 50px horizontally
    y: 50     // Snap every 50px vertically
  }
});
```

### Snap to Points

```javascript
draggable('.element', {
  x: true,
  snap: {
    x: [0, 100, 200, 300]  // Specific snap points
  }
});
```

### Physics Settings

```javascript
draggable('.element', {
  x: true,
  y: true,

  // Release physics
  releaseMass: 1,
  releaseStiffness: 100,
  releaseDamping: 10,
  releaseEase: 'outElastic',

  // Velocity
  velocityMultiplier: 1,
  minVelocity: 0,
  maxVelocity: 1000,

  // Friction
  containerFriction: 0.5,
  releaseContainerFriction: 0.8
});
```

### Draggable Callbacks

```javascript
draggable('.element', {
  x: true,
  y: true,

  onGrab: (instance) => {
    console.log('Grabbed at', instance.x, instance.y);
  },

  onDrag: (instance) => {
    console.log('Dragging', instance.x, instance.y);
  },

  onRelease: (instance) => {
    console.log('Released with velocity', instance.velocityX, instance.velocityY);
  },

  onSnap: (instance) => {
    console.log('Snapped to', instance.x, instance.y);
  },

  onSettle: (instance) => {
    console.log('Settled at', instance.x, instance.y);
  }
});
```

### Draggable Methods

```javascript
const drag = draggable('.element', config);

drag.disable();           // Disable dragging
drag.enable();            // Re-enable dragging
drag.setX(100);          // Set X position
drag.setY(50);           // Set Y position
drag.animateInView();    // Animate to visible area
drag.scrollInView();     // Scroll to make visible
drag.stop();             // Stop current animation
drag.reset();            // Reset to initial position
drag.revert();           // Remove draggable
drag.refresh();          // Update after DOM changes
```

### Carousel/Slider Example

```javascript
const slider = draggable('.slider-track', {
  x: true,
  y: false,
  snap: {
    x: (value) => {
      const slideWidth = 300;
      return Math.round(value / slideWidth) * slideWidth;
    }
  },
  releaseEase: 'outExpo',
  onSnap: (instance) => {
    const currentSlide = Math.abs(instance.x / 300);
    updateIndicators(currentSlide);
  }
});
```

## Layout Animations

Animate DOM changes smoothly with layout animations.

### Record and Animate

```javascript
import { layout } from 'animejs';

// Record current positions
const record = layout.record('.grid-item');

// Make DOM changes
shuffleGridItems();

// Animate to new positions
layout.animate(record, {
  duration: 500,
  ease: 'outExpo'
});
```

### Staggered Layout Animation

```javascript
import { layout, stagger } from 'animejs';

const record = layout.record('.list-item');

// Reorder items
sortListItems();

layout.animate(record, {
  duration: 600,
  delay: stagger(50),
  ease: 'outQuad'
});
```

### Display Property Transitions

```javascript
import { layout } from 'animejs';

const record = layout.record('.modal');

// Show modal (display: none → block)
modal.style.display = 'block';

layout.animate(record, {
  duration: 300,
  ease: 'outQuad'
});
```

### Modal Dialog Example

```javascript
import { layout, animate } from 'animejs';

function openModal(modal) {
  const record = layout.record(modal);

  modal.style.display = 'flex';

  layout.animate(record, {
    duration: 400,
    ease: 'outExpo'
  });

  // Additional entrance animation
  animate(modal.querySelector('.modal-content'), {
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: 300
  });
}

function closeModal(modal) {
  animate(modal.querySelector('.modal-content'), {
    scale: [1, 0.9],
    opacity: [1, 0],
    duration: 200,
    onComplete: () => {
      modal.style.display = 'none';
    }
  });
}
```

## WAAPI Integration

anime.js provides enhanced Web Animations API support.

### Using WAAPI Mode

```javascript
import { animate } from 'animejs';

// Force WAAPI for hardware acceleration
animate('.element', {
  translateX: 200,
  duration: 1000,
  composition: 'waapi'  // Use Web Animations API
});
```

### WAAPI Benefits

- Hardware-accelerated transforms
- Better performance for simple animations
- Native browser optimization
- Runs off main thread when possible

### WAAPI Limitations

- Limited easing options (no spring, steps, irregular)
- Some anime.js features unavailable
- Callback timing may differ

### Converting Easing for WAAPI

```javascript
import { convertEase } from 'animejs';

// Convert anime.js easing to WAAPI-compatible format
const wapiEase = convertEase('outExpo');

element.animate([
  { transform: 'translateX(0)' },
  { transform: 'translateX(200px)' }
], {
  duration: 1000,
  easing: wapiEase
});
```

### Hybrid Approach

```javascript
// Use WAAPI for simple transforms (performance)
animate('.moving-element', {
  translateX: 200,
  composition: 'waapi'
});

// Use anime.js engine for complex animations
animate('.complex-element', {
  translateX: 200,
  ease: 'spring({ bounce: 0.5 })',
  composition: 'anime'  // Default
});
```

## Scope API

Manage groups of animations with the Scope API.

### Creating a Scope

```javascript
import { createScope } from 'animejs';

const scope = createScope('.animation-container', {
  defaults: {
    duration: 800,
    ease: 'outExpo'
  }
});

// Animations within scope inherit defaults
scope.add('.item', { translateX: 100 });
scope.add('.other', { opacity: 0.5 });
```

### Scope Methods

```javascript
const scope = createScope('.container');

// Add animation (re-runs on refresh)
scope.add('.element', { translateX: 100 });

// Add once (doesn't re-run on refresh)
scope.addOnce('.intro', { opacity: [0, 1] });

// Pause all scope time
scope.keepTime(false);

// Resume scope time
scope.keepTime(true);

// Update after DOM changes
scope.refresh();

// Remove all animations and restore
scope.revert();
```

### Media Query Scopes

```javascript
const scope = createScope('.responsive-element', {
  mediaQueries: {
    '(min-width: 768px)': {
      defaults: { duration: 500 }
    },
    '(min-width: 1024px)': {
      defaults: { duration: 300 }
    }
  }
});
```

## Engine Configuration

Global animation engine settings.

```javascript
import { engine } from 'animejs';

// Time unit (default: 'ms')
engine.timeUnit = 'ms';  // or 's' for seconds

// Global speed multiplier
engine.speed = 1;        // 0.5 = half speed, 2 = double speed

// Target frame rate
engine.fps = 60;         // Default: 60

// Value precision
engine.precision = 4;    // Decimal places

// Pause when tab hidden
engine.pauseOnDocumentHidden = true;
```

### Engine Methods

```javascript
// Force update
engine.update();

// Pause all animations
engine.pause();

// Resume all animations
engine.resume();
```

## Utility Functions

### Math Utilities

```javascript
import { utils } from 'animejs';

utils.random(0, 100);           // Random between 0-100
utils.random(0, 100, 2);        // With 2 decimal places
utils.round(3.14159, 2);        // 3.14
utils.clamp(150, 0, 100);       // 100 (clamped to max)
utils.snap(47, 10);             // 50 (snap to nearest 10)
utils.wrap(15, 0, 10);          // 5 (wrap around)
utils.lerp(0, 100, 0.5);        // 50 (linear interpolation)
utils.mapRange(5, 0, 10, 0, 100);  // 50 (map value to new range)
```

### DOM Utilities

```javascript
import { utils } from 'animejs';

// Query selector shorthand
const elements = utils.$('.selector');

// Get computed value
const width = utils.get('.element', 'width');

// Set value
utils.set('.element', { opacity: 0.5 });

// Clean inline styles
utils.cleanInlineStyles('.element');

// Remove from animations
utils.remove('.element');
```

### Array Utilities

```javascript
import { utils } from 'animejs';

utils.shuffle([1, 2, 3, 4, 5]);      // Randomize array
utils.randomPick([1, 2, 3, 4, 5]);   // Pick random item
```

### Angle Conversion

```javascript
import { utils } from 'animejs';

utils.degToRad(180);   // π (degrees to radians)
utils.radToDeg(Math.PI);  // 180 (radians to degrees)
```

## React/Next.js Advanced Patterns

### Animation Manager Hook

```jsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { createScope } from 'animejs';

function useAnimationScope() {
  const containerRef = useRef(null);
  const scopeRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      scopeRef.current = createScope(containerRef.current, {
        defaults: { duration: 600, ease: 'outExpo' }
      });
    }

    return () => scopeRef.current?.revert();
  }, []);

  const animate = useCallback((selector, props) => {
    scopeRef.current?.add(selector, props);
  }, []);

  return { ref: containerRef, animate };
}
```

### Draggable Component

```jsx
'use client';

import { useRef, useEffect } from 'react';
import { draggable } from 'animejs';

function DraggableCard({ children, onPositionChange }) {
  const cardRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    dragRef.current = draggable(cardRef.current, {
      x: true,
      y: true,
      container: '.card-container',
      snap: { x: 20, y: 20 },
      onSettle: (instance) => {
        onPositionChange?.({ x: instance.x, y: instance.y });
      }
    });

    return () => dragRef.current?.revert();
  }, [onPositionChange]);

  return (
    <div ref={cardRef} className="draggable-card">
      {children}
    </div>
  );
}
```

### Text Animation Component

```jsx
'use client';

import { useRef, useEffect } from 'react';
import { splitText, animate, stagger } from 'animejs';

function AnimatedHeading({ children, delay = 0 }) {
  const headingRef = useRef(null);

  useEffect(() => {
    const { chars } = splitText(headingRef.current, {
      chars: true,
      accessible: true
    });

    animate(chars, {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(25, { start: delay }),
      duration: 600,
      ease: 'outExpo'
    });
  }, [delay]);

  return <h1 ref={headingRef}>{children}</h1>;
}
```
