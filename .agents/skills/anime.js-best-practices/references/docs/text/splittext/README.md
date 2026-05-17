# Anime.js splitText() Documentation

A lightweight, responsive and accessible text utility function to split, clone and wrap lines, words and characters of an HTML Element.

## Function Signature

```javascript
import { splitText } from 'animejs';

const split = splitText(target, parameters);
```

Alternative import (v4.2.0+):
```javascript
import { splitText } from 'animejs/text';
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | CSS selector `String` \| `HTMLElement` | The element to split |
| `parameters` (optional) | `Object` | Configuration object with TextSplitter settings |

## Return Value

Returns a `TextSplitter` object instance.

## Basic Example

```javascript
import { createTimeline, stagger, utils, splitText } from 'animejs';

const { words, chars } = splitText('p', {
  words: { wrap: 'clip' },
  chars: true,
});

createTimeline({
  loop: true,
  defaults: { ease: 'inOut(3)', duration: 650 }
})
.add(words, {
  y: [$el => +$el.dataset.line % 2 ? '100%' : '-100%', '0%'],
}, stagger(125))
.add(chars, {
  y: $el => +$el.dataset.line % 2 ? '100%' : '-100%',
}, stagger(10, { from: 'random' }))
.init();
```

---

## TextSplitter Settings

### Configuration Overview

```javascript
splitText(target, {
  lines: true,
  words: {
    wrap: 'clip',
    class: 'split-word',
    clone: true
  },
  includeSpaces: true,
  debug: true
});
```

### Available Settings

| Setting | Description |
|---------|-------------|
| `lines` | Controls line-based text splitting |
| `words` | Configures word splitting with nested options |
| `chars` | Handles character-level splitting |
| `debug` | Enables debugging visualization |
| `includeSpaces` | Determines whether whitespace is preserved |
| `accessible` | Manages accessibility considerations |

---

### lines

Controls whether and how text should be split into individual lines.

**Type:** `Boolean` | `Object` | `String`
**Default:** `false`

**Default HTML Output:**
```html
<span style="display: block;" data-line="0">This is the first line</span>
<span style="display: block;" data-line="1">This is the second line</span>
<span style="display: block;" data-line="2">This is the third line</span>
```

**Configuration Options:**
- **Boolean** - Enable/disable line splitting
- **Object** - Custom Split parameters
- **String** - Custom HTML template

**Important Behavior Notes:**
- Nested elements are duplicated across lines when necessary, maintaining structure integrity
- Lines are split after font loading completes via `document.fonts.ready.then()`, with automatic re-splitting on resize
- Use `split.addEffect()` to ensure animations persist across font loading and resize events

**Code Example:**

```javascript
import { animate, splitText, stagger } from 'animejs';

splitText('p', {
  lines: { wrap: 'clip' },
})
.addEffect(({ lines }) => animate(lines, {
  y: [
    { to: ['100%', '0%'] },
    { to: '-100%', delay: 750, ease: 'in(3)' }
  ],
  duration: 750,
  ease: 'out(3)',
  delay: stagger(200),
  loop: true,
  loopDelay: 500,
}));
```

---

### words

Defines if and how the words should be split.

**Type:** `Boolean` | `Object` | `String`
**Default:** `true`

Word splitting uses native `Intl.Segmenter` where supported (enabling proper splitting for languages without spaces like Japanese, Chinese, Thai, Lao, Khmer, Myanmar). Falls back to `String.prototype.split()` for older browsers.

**Default HTML Output:**
```html
<span style="display: inline-block;" data-line="0" data-word="0">Split</span>
<span style="display: inline-block;" data-line="0" data-word="1">by</span>
<span style="display: inline-block;" data-line="0" data-word="2">words</span>
```

**Code Example:**

```javascript
import { animate, splitText, stagger } from 'animejs';

const { words } = splitText('p', {
  words: { wrap: 'clip' },
})

animate(words, {
  y: [
    { to: ['100%', '0%'] },
    { to: '-100%', delay: 750, ease: 'in(3)' }
  ],
  duration: 750,
  ease: 'out(3)',
  delay: stagger(100),
  loop: true,
});
```

**Note on Line Splitting:**
When combining line and word splits, each line split overrides existing word elements, potentially interrupting animations. Use `split.addEffect()` to maintain continuous playback across resizes.

---

### chars

Controls character-level text splitting. When enabled, each character is wrapped in a DOM element for individual animation.

**Type:** `Boolean` | `Object` | `String`
**Default:** `false`

**Default HTML Output:**
```html
<span style="display: inline-block;" data-line="0" data-word="0" data-char="0">H</span>
<span style="display: inline-block;" data-line="0" data-word="0" data-char="1">E</span>
```

**Code Example:**

```javascript
import { animate, splitText, stagger } from 'animejs';

const { chars } = splitText('p', {
  chars: { wrap: 'clip' },
});

animate(chars, {
  y: [
    { to: ['100%', '0%'] },
    { to: '-100%', delay: 750, ease: 'in(3)' }
  ],
  duration: 750,
  ease: 'out(3)',
  delay: stagger(50),
  loop: true,
});
```

**Important:** Declaring an animation within the `split.addEffect()` method ensures continuous playback between resizes and automatically reverts it when using `split.revert()`.

---

### debug

Enables visual styling to highlight wrapper elements created during text splitting.

**Type:** `Boolean`
**Default:** `false`

When enabled, applies color-coded outlines to help visualize the text structure:
- Lines are outlined in green
- Words in red
- Characters in blue

**Code Example:**

```javascript
import { animate, splitText, stagger, utils } from 'animejs';

const [ $button ] = utils.$('button');
const [ $p ] = utils.$('p');

let debug = false;
let split;

const toggleDebug = () => {
  if (split) split.revert();
  debug = !debug;
  split = splitText($p, {
    lines: true,
    chars: true,
    words: true,
    debug: debug,
  });
}

toggleDebug();

$button.addEventListener('click', toggleDebug);
```

---

### includeSpaces

Controls whether whitespace characters are included as separate elements when splitting text.

**Type:** `Boolean`
**Default:** `false`

When enabled, spaces between words are preserved as individual wrapped elements rather than being excluded from the split output.

**Code Example:**

```javascript
import { animate, splitText, stagger, utils } from 'animejs';

const [ $button ] = utils.$('button');
const [ $p ] = utils.$('p');

let includeSpaces = true;
let split;

const toggleSpaces = () => {
  if (split) split.revert();
  includeSpaces = !includeSpaces;
  split = splitText($p, {
    debug: true,
    includeSpaces: includeSpaces,
  });
}

toggleSpaces();

$button.addEventListener('click', toggleSpaces);
```

---

### accessible

Creates a cloned element that preserves the structure of the original element for accessibility purposes.

**Type:** `Boolean`
**Default:** `true`

**Code Example:**

```javascript
import { createTimeline, splitText, stagger, utils } from 'animejs';

const [ $button ] = utils.$('button');
const split = splitText('p', { debug: true });
const $accessible = split.$target.firstChild;

$accessible.style.cssText = `
  opacity: 0;
  position: absolute;
  color: var(--hex-green-1);
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  outline: currentColor dotted 1px;
`;

const showAccessibleClone = createTimeline({
  defaults: { ease: 'inOutQuad' },
})
.add($accessible, {
  opacity: 1,
  z: '-2rem',
}, 0)
.add('p', {
  rotateX: 0,
  rotateY: 60
}, 0)
.add(split.words, {
  z: '6rem',
  opacity: .75,
  outlineColor: { from: '#FFF0' },
  duration: 750,
  delay: stagger(40, { from: 'random' })
}, 0)
.init();

const toggleAccessibleClone = () => {
  showAccessibleClone.alternate().resume();
}

$button.addEventListener('click', toggleAccessibleClone);
```

---

## Split Parameters

Defines the CSS class, wrap behavior, or clone type of a split. Parameters are configured by passing an object to the `lines`, `words`, and `chars` properties.

```javascript
splitText(target, {
  lines: true,
  words: {
    wrap: 'clip',
    class: 'split-word',
    clone: true
  },
  includeSpaces: true,
  debug: true,
});
```

---

### class

Specifies a custom CSS class applied to all split elements.

**Type:** `String` | `null`
**Default:** `null`

**Output Example:**
```html
<span class="my-custom-class" style="display: inline-block;">
  <span style="display: inline-block;">word</span>
</span>
```

**Code Example:**

```javascript
import { animate, stagger, splitText } from 'animejs';

splitText('p', {
  chars: { class: 'split-char' },
});

animate('.split-char', {
  y: ['0rem', '-1rem', '0rem'],
  loop: true,
  delay: stagger(100)
});
```

**HTML:**
```html
<div class="large centered row">
  <p class="text-xl">Custom CSS class.</p>
</div>
```

**CSS:**
```css
.split-char {
  color: var(--hex-current-1);
  background-color: var(--hex-current-3);
  outline: 1px solid var(--hex-current-2);
  border-radius: .25rem;
}
```

---

### wrap

Adds an extra wrapper element with a specified CSS `overflow` property to all split elements.

**Type:** `'hidden'` | `'clip'` | `'visible'` | `'scroll'` | `'auto'` | `Boolean` | `null`
**Default:** `null`

Note: `true` equals `'clip'`

**Output Structure:**
```html
<span style="overflow: clip; display: inline-block;">
  <span style="display: inline-block;">word</span>
</span>
```

**Code Example:**

```javascript
import { animate, stagger, splitText } from 'animejs';

const { chars } = splitText('p', {
  chars: { wrap: true },
});

animate(chars, {
  y: ['75%', '0%'],
  duration: 750,
  ease: 'out(3)',
  delay: stagger(50),
  loop: true,
  alternate: true,
});
```

---

### clone

Creates duplicated split elements in a specified direction by wrapping content in a specific HTML structure with absolute positioning.

**Type:** `'left'` | `'top'` | `'right'` | `'bottom'` | `'center'` | `Boolean` | `null`
**Default:** `null`

Note: `true` is equivalent to `'center'`

**Output Structure:**
```html
<span style="position: relative; display: inline-block;">
  <span style="display: inline-block;">word</span>
  <span style="position: absolute; top: 100%; left: 0px; white-space: nowrap; display: inline-block;">word</span>
</span>
```

**Code Example:**

```javascript
import { createTimeline, stagger, splitText } from 'animejs';

const { chars } = splitText('p', {
  chars: {
    wrap: 'clip',
    clone: 'bottom'
  },
});

createTimeline()
  .add(chars, {
    y: '-100%',
    loop: true,
    loopDelay: 350,
    duration: 750,
    ease: 'inOut(2)',
  }, stagger(150, { from: 'center' }));
```

---

## HTML Template

Custom HTML templates can be used for wrapping split text elements (lines, words, and characters). Templates must include at least one `'{value}'` variable for the split content.

### Template Variables

| Variable | Description |
|----------|-------------|
| `'{value}'` | Required. Replaced by the split text element |
| `'{i}'` | Optional. Replaced by the current index of the split element |

**Note:** All necessary styles, like `'display: inline-block;'`, will be applied automatically and don't need to be defined in the template.

**Code Example:**

```javascript
import { createTimeline, stagger, splitText } from 'animejs';

splitText('p', {
  chars: `<span class="char-3d word-{i}">
    <em class="face face-top">{value}</em>
    <em class="face-front">{value}</em>
    <em class="face face-bottom">{value}</em>
  </span>`,
});

const charsStagger = stagger(100, { start: 0 });

createTimeline({ defaults: { ease: 'linear', loop: true, duration: 750 }})
.add('.char-3d', { rotateX: -90 }, charsStagger)
.add('.char-3d .face-top', { opacity: [.5, 0] }, charsStagger)
.add('.char-3d .face-front', { opacity: [1, .5] }, charsStagger)
.add('.char-3d .face-bottom', { opacity: [.5, 1] }, charsStagger);
```

---

## TextSplitter Methods

The `TextSplitter` instance returned by `splitText()` provides three methods:

```javascript
const split = splitText(target, parameters);

split.revert()
split.addEffect()
split.refresh()
```

---

### addEffect()

Preserves animations and callbacks state between text splits when using the `splitText()` function with the `lines` option enabled.

**API Signature:**
```javascript
split.addEffect(function)
```

**Parameters:**
- **Function**: Receives the `SplitText` object as its first argument; can return an Animation, Timeline, Timer, or optional cleanup function

This method allows reverting all split animations at once using `split.revert()` and ensures animations execute safely after split elements update.

**Automatic Refresh Triggers:**
The effect's animation refreshes when:
- `splitText()` is called and `document.fonts.ready` resolves
- Splitting by lines and the target element's width changes

**Basic Example:**
```javascript
split.addEffect(({ lines, words, chars }) => animate([lines, words, chars], {
  opacity: { from: 0 },
}));
```

**Advanced Example with Cleanup:**
```javascript
.addEffect(split => {
  split.words.forEach(($el, i) => {
    $el.addEventListener('pointerenter', () => {
      animate($el, { color: '#FF4B4B', duration: 250 })
    });
  });
  return () => {
    // Called between each split
    split.words.forEach((w, i) => colors[i] = utils.get(w, 'color'));
  }
});
```

---

### revert()

Reverts the split target HTML back to its original state, removing debug styles and reverting all animations added with `split.addEffect()`.

**API Signature:**
```javascript
revert() → TextSplitter
```

**Return Value:** Returns a `TextSplitter` instance for method chaining.

**Code Example:**

```javascript
import { animate, stagger, splitText, utils } from 'animejs';

const [ $button ] = utils.$('button');
const [ $p ] = utils.$('p');

const split = splitText('p', {
  words: { wrap: 'clip' },
  debug: true,
});

split.addEffect((self) => animate(self.words, {
  y: ['100%', '0%'],
  duration: 1250,
  ease: 'out(3)',
  delay: stagger(100),
  loop: true,
  alternate: true,
}));

const revertSplit = () => {
  split.revert();
  $button.setAttribute('disabled', 'true');
}

$button.addEventListener('click', revertSplit);
```

---

### refresh()

Manually re-splits text, accounting for any parameter changes made after initial instantiation.

**API Signature:**
```javascript
refresh(): TextSplitter
```

**Return Value:** Returns the `TextSplitter` instance for method chaining.

**Updatable Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `$target` | HTMLElement | The split element |
| `html` | String | HTML content to split |
| `debug` | Boolean | Visibility of debug styles |
| `includeSpaces` | Boolean | Whether spaces wrap within text |
| `accessible` | Boolean | Accessible clone creation |
| `lineTemplate` | String | Line HTML template |
| `wordTemplate` | String | Word HTML template |
| `charTemplate` | String | Character HTML template |

**Code Example:**

```javascript
import { animate, stagger, splitText, utils } from 'animejs';

const [ $add, $remove ] = utils.$('button');
const [ $p ] = utils.$('p');

const split = splitText('p', {
  lines: { wrap: 'clip' },
  debug: true,
});

split.addEffect((self) => animate(self.words, {
  y: ['0%', '75%'],
  loop: true,
  alternate: true,
  ease: 'inOutQuad',
  delay: stagger(150)
}));

const words = ['sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'tortor', 'lectus', 'aliquet'];

const addRandomWord = () => {
  split.html += ' ' + utils.randomPick(words);
  split.refresh();
}

const removeRandomWord = () => {
  const words = split.words.map(w => w.innerHTML);
  split.html = (words.splice(utils.random(0, words.length - 1), 1), words).join(' ');
  split.refresh();
}

$add.addEventListener('click', addRandomWord);
$remove.addEventListener('click', removeRandomWord);
```

---

## TextSplitter Properties

The `TextSplitter` instance exposes properties for accessing split text elements and configuration details.

| Property | Type | Description |
|----------|------|-------------|
| `$target` | HTMLElement | Gets the split root element |
| `html` | String | Gets the html to split |
| `debug` | Boolean | Gets if the debug styles are visible or not |
| `includeSpaces` | Boolean | Gets if the spaces should be wrapped within the text |
| `accessible` | Boolean | Gets if the accessible clone element should be created |
| `lines` | Array<HTMLElement> | Gets the lines elements |
| `words` | Array<HTMLElement> | Gets the words elements |
| `chars` | Array<HTMLElement> | Gets the chars elements |
| `lineTemplate` | String | The line HTML template |
| `wordTemplate` | String | The word HTML template |
| `charTemplate` | String | The char HTML template |

**Basic Usage:**

```javascript
const split = splitText(target, parameters);
split.lines  // Access line elements
split.words  // Access word elements
split.chars  // Access character elements
```

---

## Version Information

- `splitText()` available since v4.0.0+
- Alternative import from `'animejs/text'` available since v4.2.0+
- Split parameters (`class`, `wrap`, `clone`) available since v4.1.0+
- `includeSpaces` available since v4.1.0+
- Properties available since v4.1.0+
