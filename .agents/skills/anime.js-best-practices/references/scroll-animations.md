# Scroll Animations with ScrollObserver

Complete guide to scroll-triggered animations using anime.js v4's ScrollObserver API.

## ScrollObserver Basics

ScrollObserver monitors element visibility and triggers animations based on scroll position.

### Basic Setup

```javascript
import { animate, ScrollObserver } from 'animejs';

// Create observer for elements
const observer = new ScrollObserver('.animate-on-scroll', {
  onEnter: (elements) => {
    animate(elements, {
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 600,
      ease: 'outExpo'
    });
  }
});
```

### Configuration Options

```javascript
const observer = new ScrollObserver('.element', {
  // Container element (default: window)
  container: document.querySelector('.scroll-container'),

  // Target element for threshold calculations
  target: document.querySelector('.scroll-target'),

  // Enable visual debugging
  debug: true,

  // Scroll axis: 'x' or 'y'
  axis: 'y',

  // Re-trigger on each scroll (not just first enter)
  repeat: true
});
```

## Threshold Configuration

Thresholds determine when callbacks trigger based on element visibility.

### Numeric Thresholds

```javascript
const observer = new ScrollObserver('.element', {
  // Trigger at specific visibility percentages
  threshold: [0, 0.5, 1],  // 0%, 50%, 100% visible

  onEnter: (elements, values, trigger) => {
    console.log('Threshold crossed:', trigger.threshold);
  }
});
```

### Position Shorthands

```javascript
// Predefined threshold positions
threshold: 'top'      // Element top reaches viewport top
threshold: 'center'   // Element center reaches viewport center
threshold: 'bottom'   // Element bottom reaches viewport bottom
```

### Relative Thresholds

```javascript
// Offset from default position
threshold: 'center-=100'  // 100px before center
threshold: 'bottom+=50'   // 50px after bottom
```

### Min/Max Range

```javascript
// Trigger between range
threshold: {
  min: 0.2,    // Start at 20% visible
  max: 0.8     // End at 80% visible
}
```

## Directional Callbacks

Handle scroll direction for different animation behaviors:

```javascript
const observer = new ScrollObserver('.element', {
  // Generic enter/leave
  onEnter: (elements) => {
    animate(elements, { opacity: 1 });
  },
  onLeave: (elements) => {
    animate(elements, { opacity: 0 });
  },

  // Direction-specific
  onEnterForward: (elements) => {
    // Scrolling down, element entering
    animate(elements, { translateY: [50, 0] });
  },
  onEnterBackward: (elements) => {
    // Scrolling up, element entering
    animate(elements, { translateY: [-50, 0] });
  },
  onLeaveForward: (elements) => {
    // Scrolling down, element leaving
    animate(elements, { translateY: [0, -50] });
  },
  onLeaveBackward: (elements) => {
    // Scrolling up, element leaving
    animate(elements, { translateY: [0, 50] });
  }
});
```

## Progress-Based Animations

Sync animation progress with scroll position:

```javascript
const observer = new ScrollObserver('.element', {
  onUpdate: (elements, progress) => {
    // progress: 0 (just entered) to 1 (about to leave)
    elements.forEach(el => {
      el.style.opacity = progress;
      el.style.transform = `translateX(${progress * 100}px)`;
    });
  }
});
```

### Linking Animations to Scroll

```javascript
import { animate, ScrollObserver } from 'animejs';

// Create animation (paused)
const anim = animate('.parallax-element', {
  translateY: [-100, 100],
  autoplay: false
});

// Link to scroll progress
const observer = new ScrollObserver('.scroll-section', {
  sync: anim  // Animation follows scroll progress
});
```

### Sync Modes

```javascript
// Method name - calls animation method on enter
sync: 'play'      // anim.play() on enter
sync: 'reverse'   // anim.reverse() on enter

// Progress sync - ties progress to scroll
sync: anim        // Animation progress = scroll progress

// Smooth scroll sync
sync: {
  animation: anim,
  smooth: 0.1     // Smoothing factor (0-1)
}

// Eased scroll sync
sync: {
  animation: anim,
  ease: 'outQuad'
}
```

## ScrollObserver Methods

```javascript
const observer = new ScrollObserver('.element', config);

// Link additional animation
observer.link(anotherAnimation);

// Update after DOM changes
observer.refresh();

// Remove observer
observer.revert();
```

## Callback Parameters

All callbacks receive the same parameters:

```javascript
onEnter: (elements, values, trigger) => {
  // elements: Array of DOM elements
  // values: Current animation values
  // trigger: Object with threshold info

  console.log(trigger.threshold);   // Crossed threshold value
  console.log(trigger.direction);   // 'forward' or 'backward'
}
```

## Common Scroll Animation Patterns

### Fade In on Scroll

```javascript
new ScrollObserver('.fade-in', {
  onEnter: (elements) => {
    animate(elements, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 800,
      ease: 'outExpo'
    });
  }
});
```

### Staggered Reveal

```javascript
import { stagger } from 'animejs';

new ScrollObserver('.stagger-container', {
  onEnter: () => {
    animate('.stagger-item', {
      opacity: [0, 1],
      translateY: [40, 0],
      delay: stagger(100),
      duration: 600,
      ease: 'outQuad'
    });
  }
});
```

### Parallax Effect

```javascript
new ScrollObserver('.parallax-section', {
  onUpdate: (elements, progress) => {
    const parallaxEl = elements[0].querySelector('.parallax-bg');
    parallaxEl.style.transform = `translateY(${progress * 50}px)`;
  }
});
```

### Progress Bar

```javascript
new ScrollObserver('article', {
  onUpdate: (elements, progress) => {
    document.querySelector('.progress-bar').style.width =
      `${progress * 100}%`;
  }
});
```

### Horizontal Scroll Section

```javascript
const section = document.querySelector('.horizontal-scroll');
const content = section.querySelector('.horizontal-content');

new ScrollObserver(section, {
  onUpdate: (elements, progress) => {
    const maxScroll = content.scrollWidth - section.clientWidth;
    content.style.transform = `translateX(-${progress * maxScroll}px)`;
  }
});
```

### Reveal on Scroll, Hide on Leave

```javascript
new ScrollObserver('.reveal-hide', {
  repeat: true,
  onEnter: (elements) => {
    animate(elements, {
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 500
    });
  },
  onLeave: (elements) => {
    animate(elements, {
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 300
    });
  }
});
```

## React/Next.js Integration

### useScrollAnimation Hook

```jsx
'use client';

import { useEffect, useRef } from 'react';
import { animate, ScrollObserver } from 'animejs';

function useScrollAnimation(config) {
  const ref = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (ref.current) {
      observerRef.current = new ScrollObserver(ref.current, {
        onEnter: () => {
          animate(ref.current, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600,
            ...config
          });
        }
      });
    }

    return () => observerRef.current?.revert();
  }, [config]);

  return ref;
}

// Usage
function FadeInSection({ children }) {
  const ref = useScrollAnimation({ ease: 'outExpo' });
  return <div ref={ref} style={{ opacity: 0 }}>{children}</div>;
}
```

### Intersection Observer Alternative

For simpler use cases, consider native IntersectionObserver with anime.js:

```jsx
'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

function useInViewAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(ref.current, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 600
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return ref;
}
```

## Performance Considerations

1. **Limit observers**: Create one observer for similar elements rather than one per element
2. **Use `repeat: false`**: When animations should only trigger once
3. **Debounce onUpdate**: For expensive calculations in progress callbacks
4. **Prefer CSS transforms**: Use `translateY` over `top`/`margin` in scroll animations
5. **Clean up**: Call `revert()` when components unmount

## Debug Mode

Enable visual debugging to see thresholds:

```javascript
new ScrollObserver('.element', {
  debug: true,  // Shows threshold lines in viewport
  // ... other config
});
```

Debug mode displays colored lines showing where thresholds trigger, helpful during development.
