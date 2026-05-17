# Web Animations API - Timeline Interfaces

This document provides comprehensive documentation for all timeline-related interfaces in the Web Animations API, including scroll-driven animation timelines.

## Table of Contents

- [AnimationTimeline Interface](#animationtimeline-interface)
- [DocumentTimeline Interface](#documenttimeline-interface)
- [ScrollTimeline Interface](#scrolltimeline-interface)
- [ViewTimeline Interface](#viewtimeline-interface)
- [Document.timeline Property](#documenttimeline-property)
- [Browser Compatibility Summary](#browser-compatibility-summary)

---

## AnimationTimeline Interface

The `AnimationTimeline` interface is the base interface for all animation timelines in the Web Animations API. It defines common timeline features inherited by other timeline types.

### Browser Support

**Baseline: Widely Available** - Well established and works across many devices and browser versions since July 2020.

> Note: Some parts may have varying levels of support.

### Inheritance Hierarchy

`AnimationTimeline` is the parent interface inherited by:

- `DocumentTimeline`
- `ScrollTimeline`
- `ViewTimeline`

### Instance Properties

#### `currentTime` (Read-only)

Returns the time value in milliseconds for this timeline, or `null` if the timeline is inactive.

```javascript
const currentTime = timeline.currentTime;
// Returns: number | null
```

#### `duration` (Read-only)

Returns the maximum value for this timeline, or `null`.

```javascript
const duration = timeline.duration;
// Returns: number | null
```

### Specification

- [Web Animations - The AnimationTimeline Interface](https://drafts.csswg.org/web-animations-1/#the-animationtimeline-interface)

---

## DocumentTimeline Interface

The `DocumentTimeline` interface represents animation timelines, including the default document timeline accessed via `Document.timeline`.

### Browser Support

**Baseline: Widely Available** - Works across all modern browsers since July 2020.

### Inheritance Hierarchy

```
AnimationTimeline
    └── DocumentTimeline
```

### Constructor

#### `DocumentTimeline()`

Creates a new `DocumentTimeline` object associated with the active document of the current browsing context.

```javascript
const timeline = new DocumentTimeline();
```

### Instance Properties

Inherits all properties from `AnimationTimeline`:

| Property | Type | Description |
|----------|------|-------------|
| `currentTime` | `number \| null` | Time value in milliseconds for this timeline, or `null` if inactive |

### Code Example

```javascript
// Access the default document timeline
const defaultTimeline = document.timeline;
console.log(defaultTimeline.currentTime); // Time since Performance.timeOrigin in ms

// Create a custom document timeline
const customTimeline = new DocumentTimeline();

// Use with Animation constructor
const animation = new Animation(keyframeEffect, customTimeline);
```

### Specification

- [Web Animations - The DocumentTimeline Interface](https://drafts.csswg.org/web-animations-1/#the-documenttimeline-interface)

---

## ScrollTimeline Interface

The `ScrollTimeline` interface represents a scroll progress timeline for controlling animations based on scroll position. It enables scroll-driven animations.

### Browser Support

**Limited Availability** - Not yet Baseline compatible across all widely-used browsers. Check browser compatibility before using in production.

### Inheritance Hierarchy

```
AnimationTimeline
    └── ScrollTimeline
```

### Constructor

#### `ScrollTimeline(options)`

Creates a new `ScrollTimeline` object instance.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `source` | `Element` | The scrollable element (scroller) that drives the timeline's progress |
| `axis` | `string` | The scroll axis driving the animation (`"block"`, `"inline"`, `"x"`, `"y"`) |

```javascript
const timeline = new ScrollTimeline({
  source: document.documentElement,
  axis: "block",
});
```

### Instance Properties

| Property | Type | Description |
|----------|------|-------------|
| `source` (Read-only) | `Element` | Reference to the scrollable element whose scroll position drives the timeline |
| `axis` (Read-only) | `string` | Enumerated value representing the scroll axis driving the timeline's progress |

Also inherits `currentTime` and `duration` from `AnimationTimeline`.

### Instance Methods

Inherits methods from `AnimationTimeline`.

### Usage

Pass a `ScrollTimeline` instance to either:

- The `Animation()` constructor
- The `Element.animate()` method

### Complete Code Example

#### HTML

```html
<div class="content"></div>
<div class="box"></div>
<div class="output"></div>
```

#### CSS

```css
.content {
  height: 2000px;
}

.box {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  background-color: rebeccapurple;
  position: fixed;
  top: 20px;
  left: 0%;
}

.output {
  font-family: "Helvetica", "Arial", sans-serif;
  position: fixed;
  top: 5px;
  right: 5px;
}
```

#### JavaScript

```javascript
const box = document.querySelector(".box");
const output = document.querySelector(".output");

// Create ScrollTimeline
const timeline = new ScrollTimeline({
  source: document.documentElement,
  axis: "block",
});

// Animate box with scroll timeline
box.animate(
  {
    rotate: ["0deg", "720deg"],
    left: ["0%", "100%"],
  },
  {
    timeline,
  },
);

// Display timeline information
output.textContent = `Timeline source element: ${timeline.source.nodeName}. Timeline scroll axis: ${timeline.axis}`;
```

**Result:** The box rotates and slides horizontally as the document scrolls.

### Specification

- [Scroll-driven Animations - ScrollTimeline Interface](https://drafts.csswg.org/scroll-animations/#scrolltimeline-interface)

---

## ViewTimeline Interface

The `ViewTimeline` interface represents a view progress timeline that enables animations to progress based on an element's visibility within its nearest ancestor scrollable element (scroller).

### Browser Support

**Limited Availability** - Not yet Baseline; does not work in all widely-used browsers.

### Inheritance Hierarchy

```
AnimationTimeline
    └── ScrollTimeline
        └── ViewTimeline
```

### Constructor

#### `ViewTimeline(options)`

Creates a new `ViewTimeline` object instance.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `subject` | `Element` | The element whose visibility drives the timeline |
| `axis` | `string` | The scroll axis (`"block"` or `"inline"`, default: `"block"`) |
| `inset` | `array` | CSSNumericValue offsets for start and end |

```javascript
const timeline = new ViewTimeline({
  subject: element,
  axis: "block",
  inset: [CSS.px("200"), CSS.px("300")],
});
```

### Instance Properties

| Property | Type | Description |
|----------|------|-------------|
| `subject` (Read-only) | `Element` | Reference to the subject element whose visibility drives the timeline |
| `startOffset` (Read-only) | `CSSNumericValue` | Starting (0% progress) scroll position offset |
| `endOffset` (Read-only) | `CSSNumericValue` | Ending (100% progress) scroll position offset |

Also inherits `source` and `axis` from `ScrollTimeline`, and `currentTime` and `duration` from `AnimationTimeline`.

### Instance Methods

Inherits methods from `ScrollTimeline` and `AnimationTimeline`.

### Usage

#### With Animation() Constructor

```javascript
const animation = new Animation(effect, timeline);
```

#### With Element.animate() Method

```javascript
element.animate(keyframes, { timeline });
```

### Complete Code Example

#### HTML

```html
<div class="content">
  <h1>Content</h1>
  <p>Lorem ipsum dolor sit amet...</p>

  <div class="subject animation"></div>

  <p>More content...</p>
  <div class="output"></div>
</div>
```

#### CSS

```css
.subject {
  width: 300px;
  height: 200px;
  margin: 0 auto;
  background-color: deeppink;
}

.content {
  width: 75%;
  max-width: 800px;
  margin: 0 auto;
}

.output {
  position: fixed;
  top: 5px;
  right: 5px;
}
```

#### JavaScript

```javascript
const subject = document.querySelector(".subject");
const output = document.querySelector(".output");

// Create ViewTimeline with subject element
const timeline = new ViewTimeline({
  subject,
  axis: "block",
  inset: [CSS.px("200"), CSS.px("300")],
});

// Animate using the view progress timeline
subject.animate(
  {
    opacity: [0, 1],
    transform: ["scaleX(0)", "scaleX(1)"],
  },
  {
    fill: "both",
    timeline,
  }
);

// Display timeline properties
output.textContent += `Subject element: ${timeline.subject.nodeName}, `;
output.textContent += `start offset: ${timeline.startOffset}, `;
output.textContent += `end offset: ${timeline.endOffset}.`;
```

**Result:** The animation progresses based on the subject element's visibility as the user scrolls.

### Key Features

- **Subject-based animations** - Animations tied to element visibility
- **Scroll-axis control** - `block` or `inline` axis configuration
- **Inset offsets** - Fine-tune visibility boundaries
- **Automatic progress calculation** - 0% to 100% based on scroll position

### Specification

- [Scroll-driven Animations - ViewTimeline Interface](https://drafts.csswg.org/scroll-animations/#viewtimeline-interface)

---

## Document.timeline Property

The `timeline` readonly property of the `Document` interface represents the default timeline of the current document.

### Browser Support

**Baseline: Widely Available** - Works across all modern browsers since July 2020.

### Syntax

```javascript
const timeline = document.timeline;
```

### Return Value

Returns a `DocumentTimeline` object.

### Key Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Access** | Read-only property |
| **Scope** | Unique to each document |
| **Persistence** | Persists for the lifetime of the document, including calls to `Document.open()` |
| **Time Unit** | Milliseconds since `Performance.timeOrigin` |

### Timing Details

The timeline expresses time in milliseconds since `Performance.timeOrigin`:

- **Before time origin**: The timeline is inactive, and its `currentTime` is `null`
- **After time origin**: The timeline is active and tracks elapsed time

### Important Notes

A document timeline associated with a **non-active document** (a `Document` not associated with a `Window`, `<iframe>`, or `<frame>`) is also considered to be **inactive**.

### Code Example

```javascript
// Get the default document timeline
const defaultTimeline = document.timeline;

// Check if timeline is active
if (defaultTimeline.currentTime !== null) {
  console.log(`Timeline active. Current time: ${defaultTimeline.currentTime}ms`);
} else {
  console.log("Timeline is inactive");
}

// Use with Element.animate()
const element = document.querySelector(".animated");
element.animate(
  [
    { transform: "translateX(0)" },
    { transform: "translateX(100px)" },
  ],
  {
    duration: 1000,
    timeline: document.timeline, // Uses default timeline (this is the default)
  }
);

// Compare with custom timeline
const customTimeline = new DocumentTimeline();
console.log(document.timeline === customTimeline); // false - different instances
```

### Specification

- [Web Animations - DOM Document Timeline](https://drafts.csswg.org/web-animations-1/#dom-document-timeline)

---

## Browser Compatibility Summary

| Interface/Property | Baseline Status | Available Since |
|--------------------|-----------------|-----------------|
| `AnimationTimeline` | Widely Available | July 2020 |
| `DocumentTimeline` | Widely Available | July 2020 |
| `Document.timeline` | Widely Available | July 2020 |
| `ScrollTimeline` | Limited Availability | Varies by browser |
| `ViewTimeline` | Limited Availability | Varies by browser |

### Notes on Scroll-Driven Animation Support

`ScrollTimeline` and `ViewTimeline` are part of the newer scroll-driven animations specification and have limited browser support. Before using these features in production:

1. Check current browser compatibility
2. Consider using feature detection
3. Provide fallback animations for unsupported browsers

### Feature Detection Example

```javascript
// Check for ScrollTimeline support
if ("ScrollTimeline" in window) {
  // Use scroll-driven animations
  const timeline = new ScrollTimeline({
    source: document.documentElement,
    axis: "block",
  });
  element.animate(keyframes, { timeline });
} else {
  // Fallback to time-based animation or CSS scroll-snap
  element.animate(keyframes, { duration: 1000 });
}

// Check for ViewTimeline support
if ("ViewTimeline" in window) {
  const timeline = new ViewTimeline({
    subject: element,
    axis: "block",
  });
  element.animate(keyframes, { timeline });
}
```

---

## Related Resources

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Using the Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)
- [CSS Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Web Animations API Concepts](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Web_Animations_API_Concepts)
- [Keyframe Formats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats)

## Related Interfaces

- [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation)
- [`AnimationEffect`](https://developer.mozilla.org/en-US/docs/Web/API/AnimationEffect)
- [`KeyframeEffect`](https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect)
- [`Element.animate()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)
- [`Document.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations)
- [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations)

---

*Source: [MDN Web Docs](https://developer.mozilla.org/)*
