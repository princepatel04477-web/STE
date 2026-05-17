# SVG Animations with anime.js

Complete guide to SVG animations including path morphing, line drawing, and motion paths.

## SVG Attribute Animation

Animate any SVG attribute directly:

```javascript
import { animate } from 'animejs';

// Circle attributes
animate('circle', {
  cx: 150,
  cy: 100,
  r: [10, 50],
  fill: ['#FF0000', '#0000FF'],
  duration: 1000
});

// Rectangle attributes
animate('rect', {
  x: 100,
  width: [50, 200],
  height: [50, 100],
  rx: [0, 20],  // Border radius
  fill: '#3498db'
});

// Path stroke
animate('path', {
  stroke: ['#e74c3c', '#2ecc71'],
  strokeWidth: [2, 5],
  duration: 800
});
```

## Line Drawing Animation

Create the classic "drawing" effect using `strokeDashoffset`:

### Using createDrawable

```javascript
import { animate, svg } from 'animejs';

// Create drawable from path
const drawable = svg.createDrawable('path.draw-me');

animate(drawable, {
  draw: '0 1',     // Draw from 0% to 100%
  duration: 2000,
  ease: 'inOutQuad'
});
```

### Draw Property Values

```javascript
// Draw entire path
draw: '0 1'          // Start at 0%, end at 100%

// Draw partial path
draw: '0 0.5'        // Draw first half
draw: '0.5 1'        // Draw second half

// Animate through keyframes
draw: ['0 0', '0 1', '1 1']  // Draw in, then erase
```

### Multiple Paths with Stagger

```javascript
import { animate, svg, stagger } from 'animejs';

animate(svg.createDrawable('.line'), {
  draw: ['0 0', '0 1', '1 1'],
  ease: 'inOutQuad',
  duration: 2000,
  delay: stagger(100),
  loop: true
});
```

### Manual Stroke Animation

For more control, animate strokeDashoffset directly:

```javascript
// Get path length
const path = document.querySelector('path');
const length = path.getTotalLength();

// Set initial state
path.style.strokeDasharray = length;
path.style.strokeDashoffset = length;

// Animate
animate(path, {
  strokeDashoffset: [length, 0],
  duration: 2000,
  ease: 'inOutQuad'
});
```

## Path Morphing

Morph between SVG shapes using `morphTo`:

### Basic Morphing

```javascript
import { animate, svg, utils } from 'animejs';

const [path1, path2] = utils.$('path');

// Morph path1 into the shape of path2
animate(path1, {
  d: svg.morphTo(path2),
  duration: 1000,
  ease: 'inOutCirc'
});
```

### Polygon Morphing

```javascript
const [poly1, poly2] = utils.$('polygon');

animate(poly1, {
  points: svg.morphTo(poly2),
  duration: 800,
  ease: 'inOutQuad'
});
```

### Morphing with Precision

Control point generation for smooth morphs:

```javascript
// Higher precision = smoother morph, more computation
animate(path1, {
  d: svg.morphTo(path2, 0.5),  // precision: 0-1, default 0.33
  duration: 1000
});

// No extrapolation (use exact points)
animate(path1, {
  d: svg.morphTo(path2, 0),
  duration: 1000
});
```

### Continuous Morphing Loop

```javascript
import { animate, svg, utils } from 'animejs';

const shapes = utils.$('.morph-shape path');
let currentIndex = 0;

function morphToNext() {
  const current = shapes[currentIndex];
  const next = shapes[(currentIndex + 1) % shapes.length];

  animate(current, {
    d: svg.morphTo(next),
    duration: 800,
    ease: 'inOutQuad',
    onComplete: () => {
      currentIndex = (currentIndex + 1) % shapes.length;
      morphToNext();
    }
  });
}

morphToNext();
```

### Path Data Animation (Alternative)

Animate path data directly without morphTo:

```javascript
const pathSquare = 'M10 10 L90 10 L90 90 L10 90 Z';
const pathDiamond = 'M50 10 L90 50 L50 90 L10 50 Z';

animate('#shape', {
  d: [
    { value: pathSquare, duration: 1000 },
    { value: pathDiamond, duration: 1000 }
  ],
  loop: true,
  ease: 'inOutQuad'
});
```

## Motion Path Animation

Animate elements along an SVG path:

### Basic Motion Path

```javascript
import { animate, svg } from 'animejs';

// Animate element along path
animate('.moving-element', {
  ...svg.createMotionPath('path#track'),
  duration: 5000,
  ease: 'linear',
  loop: true
});
```

### Motion Path with Rotation

The element automatically rotates to follow the path direction:

```javascript
animate('.car', {
  ...svg.createMotionPath('path#road'),
  duration: 4000,
  ease: 'linear'
});
```

### Combined with Line Drawing

```javascript
import { animate, svg } from 'animejs';

// Element follows path
animate('.dot', {
  ...svg.createMotionPath('path#route'),
  duration: 3000,
  ease: 'linear'
});

// Path draws as element moves
animate(svg.createDrawable('path#route'), {
  draw: '0 1',
  duration: 3000,
  ease: 'linear'
});
```

### Custom Motion Path Options

```javascript
const motionPath = svg.createMotionPath('path', {
  // Offset along path (0-1)
  start: 0.2,
  end: 0.8,

  // Rotate element to follow path
  rotate: true,

  // Additional rotation offset
  rotateOffset: 90
});

animate('.element', {
  ...motionPath,
  duration: 2000
});
```

## SVG Transform Animations

Animate SVG-specific transforms:

```javascript
animate('g.icon', {
  translateX: 50,
  translateY: 30,
  rotate: 45,
  scale: 1.5,
  duration: 800
});

// Transform origin
animate('rect', {
  rotate: 360,
  transformOrigin: '50% 50%',  // Center
  duration: 1000
});
```

## Filter Animations

Animate SVG filter values:

```javascript
// Blur filter
animate('#blur feGaussianBlur', {
  stdDeviation: [0, 10],
  duration: 500
});

// Color matrix
animate('#colorMatrix feColorMatrix', {
  values: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0',
  duration: 800
});
```

## Gradient Animations

Animate gradient stops:

```javascript
animate('linearGradient stop', {
  stopColor: ['#ff0000', '#00ff00'],
  offset: ['0%', '100%'],
  duration: 1000
});
```

## React/Next.js SVG Patterns

### Animated SVG Component

```jsx
'use client';

import { useEffect, useRef } from 'react';
import { animate, svg } from 'animejs';

function AnimatedLogo() {
  const svgRef = useRef(null);

  useEffect(() => {
    const paths = svgRef.current.querySelectorAll('path');

    animate(svg.createDrawable(paths), {
      draw: ['0 0', '0 1'],
      duration: 2000,
      delay: (el, i) => i * 200,
      ease: 'inOutQuad'
    });
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 100 100">
      <path d="M10 50 Q50 10 90 50" fill="none" stroke="currentColor" />
      <path d="M10 50 Q50 90 90 50" fill="none" stroke="currentColor" />
    </svg>
  );
}
```

### Morphing Icon Component

```jsx
'use client';

import { useRef, useCallback } from 'react';
import { animate, svg } from 'animejs';

function MorphingIcon({ isOpen, onToggle }) {
  const pathRef = useRef(null);

  const menuPath = 'M4 6h16M4 12h16M4 18h16';
  const closePath = 'M6 6l12 12M6 18l12-12';

  useCallback(() => {
    animate(pathRef.current, {
      d: isOpen ? closePath : menuPath,
      duration: 300,
      ease: 'outQuad'
    });
    onToggle();
  }, [isOpen, onToggle]);

  return (
    <svg viewBox="0 0 24 24" onClick={handleClick}>
      <path
        ref={pathRef}
        d={menuPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
```

## Performance Tips for SVG

1. **Simplify paths**: Fewer points = smoother morphing and better performance
2. **Match point counts**: For morphing, ensure shapes have similar complexity
3. **Use `will-change`**: Apply to animated SVG elements
4. **Prefer transforms**: Use `translateX/Y`, `scale`, `rotate` over attribute changes
5. **Batch similar animations**: Group paths with same timing into single animate call
6. **Consider CSS for simple animations**: Native CSS animations can be more performant for basic transforms

## Common SVG Animation Patterns

### Logo Reveal

```javascript
import { createTimeline, svg, stagger } from 'animejs';

const tl = createTimeline();

tl.add(svg.createDrawable('.logo-path'), {
    draw: ['0 0', '0 1'],
    duration: 1500,
    delay: stagger(200),
    ease: 'inOutQuad'
  })
  .add('.logo-fill', {
    opacity: [0, 1],
    duration: 500
  }, '-=300');
```

### Interactive Hover Morph

```javascript
const element = document.querySelector('.icon');
const normalPath = element.querySelector('path').getAttribute('d');
const hoverPath = 'M...'; // Hover state path

element.addEventListener('mouseenter', () => {
  animate(element.querySelector('path'), {
    d: hoverPath,
    duration: 200,
    ease: 'outQuad'
  });
});

element.addEventListener('mouseleave', () => {
  animate(element.querySelector('path'), {
    d: normalPath,
    duration: 200,
    ease: 'outQuad'
  });
});
```

### Animated Chart

```javascript
import { animate, stagger } from 'animejs';

// Bar chart animation
animate('.bar rect', {
  height: (el) => el.dataset.value,
  y: (el) => 100 - el.dataset.value,
  delay: stagger(50),
  duration: 800,
  ease: 'outExpo'
});

// Pie chart animation
animate('.pie-segment', {
  strokeDashoffset: [100, 0],
  delay: stagger(100),
  duration: 1000,
  ease: 'outQuad'
});
```
