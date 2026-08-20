# stesurat.com — Performance & Bug Fix Plan

**Target:** https://www.stesurat.com/ (Surat Textile Exhibition 2026)
**Stack detected:** Next.js App Router (Turbopack production build) on Vercel · Tailwind v4 · Framer Motion (`LazyMotion` + `domAnimation`) · Lenis smooth scroll · custom canvas cursor
**Audit date:** 2026-08-19
**Audience:** Claude Code, working in the site's repository

---

## 0. How to use this plan

You (Claude Code) have the repo; this audit was done against the **live production site only** (raw HTML, CSS, JS bundles, robots.txt, sitemap.xml). File paths below are therefore *inferred*. Every item ships with a **grep anchor** — a distinctive literal string I actually observed in the shipped output. Use it to locate the real file before editing.

Each finding is tagged with confidence:

- **[CONFIRMED]** — I read it directly in the shipped HTML/CSS/robots/sitemap. Treat as fact.
- **[LIKELY]** — derived from summarising a minified bundle. Verify in source before acting.
- **[VERIFY]** — a hypothesis worth 5 minutes of checking; do not "fix" blindly.

Work the phases in order. Phase 1 alone should account for most of the "laggy and buggy" feeling.

### Ground rules for this work

1. **One phase per PR.** Do not mix the SEO fixes with the animation fixes.
2. **Measure before and after.** Record Lighthouse mobile scores + a Performance-panel trace at the start of each phase, in the PR description.
3. **Do not delete the brand aesthetic.** This site's gold/midnight cinematic look is deliberate. Almost every fix below preserves the *look* and removes the *cost*. Where a fix is genuinely a visual tradeoff, it says so explicitly and offers a cheaper equivalent.
4. **If a grep anchor returns nothing,** stop and report rather than guessing at a rewrite.

---

## 1. Executive summary

The site is not slow because of one big mistake. It is slow because of three compounding ones:

1. **Nothing renders for the first 4.5 seconds — by design, on a hardcoded timer.** The intro preloader is not waiting for assets. It is `setTimeout(..., 4500)` on desktop / `2700` on mobile, and the page content is not mounted underneath it. Every visit, every time.
2. **The server sends an empty page.** The SSR HTML contains the preloader and *nothing else* — no `<h1>`, no hero, no navigation. All content is client-rendered after the timer. This destroys LCP and means crawlers and social scrapers see a loading screen.
3. **A stack of always-on, repaint-heavy effects run for the entire session.** Conic-gradient angle animation, background-position shimmer, border-radius morphing, permanent `will-change` layers, backdrop blur over a JS-driven scroll, full-viewport blend modes, and a full-screen canvas cursor — all on top of Lenis hijacking native scrolling.

Separately, and arguably more damaging commercially than the lag:

4. **The site tells Google it is a different website.** The canonical URL, Open Graph tags and JSON-LD all point at `stex2.vercel.app`; robots.txt and sitemap.xml point at `stefinalprototype.vercel.app`. Three domains, and the real one is authoritative in none of them.

---

## 2. Evidence collected

| What I checked | Result |
| --- | --- |
| Raw HTML, no JS (`vx6`) | `<main>` contains only `#cinematic-preloader`. Zero content, zero headings. |
| Rendered HTML @ 6s wait | Still the preloader. |
| Rendered HTML @ 18s wait | Full content appears (nav, hero, countdown, stats). |
| `robots.txt` | `Sitemap: https://stefinalprototype.vercel.app/sitemap.xml` |
| `sitemap.xml` | 3 URLs, all `https://stefinalprototype.vercel.app/...` |
| `<link rel="canonical">` | `https://stex2.vercel.app` |
| Head `<script>` count | 12 async chunks + 1 `nomodule` legacy chunk |
| Global CSS chunk | ~55 KB; 9 `@keyframes`; one single `prefers-reduced-motion` rule |
| Stat counters after 18s | Still rendering `₹0.0T`, `0+`, `0+` |

---

# PHASE 1 — Perceived speed (do this first)

> Expected impact: LCP from ~5 s+ to under 2 s. This is the phase that makes the site stop feeling broken.

## 1.1 — Kill the fixed-duration preloader gate `[CONFIRMED + LIKELY]` — **P0**

**Grep anchors:** `cinematic-preloader` · `Orchestrating Couture` · `Skip Intro` · `2700` · `4500`

**What's wrong.** The preloader hides on a hardcoded timer — `[LIKELY]` `window.innerWidth<768?2700:4500` — not on any real readiness signal. It is not waiting for fonts, the hero video, or hydration. It is waiting for *nothing*. Worse, the page content is not rendered behind it, so when the timer expires the browser then starts the real work: mount, hydrate, fetch images, run entry animations. The user's 4.5-second wait buys them nothing and is followed by *more* waiting.

`[CONFIRMED]` In the shipped no-JS HTML, `<main>` contains the preloader and closes. There is nothing underneath.

**The fix.** The preloader must become a **dismissable overlay on top of a fully-rendered page**, never a gate in front of an empty one.

```tsx
// components/CinematicPreloader.tsx
'use client';
import { useEffect, useState } from 'react';

const MAX_MS = 900; // hard ceiling. Never longer.

export default function CinematicPreloader() {
  // Never show for repeat visits in the same session, or for reduced-motion users.
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (sessionStorage.getItem('ste:intro-seen')) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  });

  useEffect(() => {
    if (!show) return;
    const done = () => {
      sessionStorage.setItem('ste:intro-seen', '1');
      setShow(false);
    };
    // Dismiss as soon as the page is actually interactive, capped hard at MAX_MS.
    const t = setTimeout(done, MAX_MS);
    const onReady = () => requestAnimationFrame(done);
    if (document.readyState === 'complete') onReady();
    else window.addEventListener('load', onReady, { once: true });
    return () => { clearTimeout(t); window.removeEventListener('load', onReady); };
  }, [show]);

  if (!show) return null;      // <-- unmount. Do not leave it in the DOM at opacity 0.
  return (/* ...existing markup, plus a working Skip Intro... */);
}
```

**Critical details, in priority order:**

- **Unmount it (`return null`), don't hide it.** `[CONFIRMED]` Today the preloader stays in the DOM as a `fixed inset-0` layer at `z-[10000]`. A full-viewport fixed layer that never leaves is a permanent compositing cost for the rest of the session.
- **Render page content unconditionally.** The preloader sits *over* the hero; it does not replace it.
- **`sessionStorage` gate.** Someone browsing to `/privacy-policy` and back should not sit through the intro twice.
- **Honour `prefers-reduced-motion`** by skipping the intro entirely.
- **Make Skip Intro actually skip.** It should also set the `sessionStorage` flag, and receive focus on mount so keyboard users can hit it immediately.

**Acceptance criteria:**
- [ ] `curl -s https://www.stesurat.com/ | grep -c "INDIA'S"` returns ≥ 1
- [ ] LCP element in Lighthouse is hero text/image, not the preloader
- [ ] Second navigation within a session shows no intro
- [ ] With reduced-motion on, no intro at all

---

## 1.2 — Server-render the page `[CONFIRMED]` — **P0**

**Grep anchor:** the file exporting the homepage — look for a `'use client'` at the very top of `app/page.tsx`, plus a gating state like `isLoading` / `showContent` / `introDone`.

**What's wrong.** The whole homepage is one client component whose initial render is the preloader. Everything below — nav, hero, countdown, stats, sections — exists only after a state flip. Consequences: LCP is a black screen; the entire component tree hydrates in one long task; Googlebot and every social/WhatsApp link preview scraper sees a loading spinner despite the meticulous JSON-LD.

**The fix.**
1. Remove the loading gate from the page component: `{isLoading ? <Preloader/> : <Content/>}` becomes `<><Preloader/><Content/></>`.
2. Push `'use client'` **down** to the leaves that need it (countdown, language toggle, cursor, carousels). Keep `app/page.tsx` and the hero/nav as server components.
3. Static copy (headings, stat labels, section text) should be plain server-rendered JSX.

**Acceptance criteria:**
- [ ] Raw HTML (`curl`, no JS) contains exactly one `<h1>` with the real hero headline
- [ ] Raw HTML contains the nav links and the September 12–13, 2026 date
- [ ] Rich Results Test and a WhatsApp link preview both render correctly

---

## 1.3 — Fix the hero video preload `[CONFIRMED]` — **P0**

**Grep anchor:** `/assets/video/hero.mp4` · `rel="preload"` · `as="fetch"`

**What's wrong.** The shipped `<head>` contains this **twice**, plus a third RSC preload hint:

```html
<link rel="preload" href="/assets/video/hero.mp4" as="fetch" crossorigin="anonymous">
<link rel="preload" href="/assets/video/hero.mp4" as="fetch" crossorigin="anonymous">
```

Three problems stacked:

1. **`as="fetch"` is the wrong destination for a `<video>`.** A preload only gets reused if the destination matches. A `<video>` element issues a *media* request with Range headers; it will not claim a `fetch` preload. **The video is downloaded twice** — once wastefully into the preload cache, once for real.
2. **It is declared twice**, risking a third fetch.
3. `as="fetch"` pulls the whole file at high priority, competing with CSS, fonts and JS during the exact window where the user is already staring at a black preloader. On an Indian mobile connection — the site's actual audience — this is the difference between a 3-second and a 15-second first paint.

**The fix.**

```tsx
// app/layout.tsx — DELETE both <link rel="preload" ... as="fetch"> for hero.mp4.
```

```tsx
// Hero video: poster first, bytes later, and never on mobile data.
<video
  poster="/assets/hero-poster.webp"   // must exist; this becomes your LCP image
  preload="none"                       // "metadata" at most
  muted playsInline loop
  autoPlay={false}                     // start it yourself, after first paint
  aria-hidden="true"
/>
```

- Start playback from an `IntersectionObserver` + `requestIdleCallback`, after first paint.
- **Skip the video entirely on `(pointer: coarse)` / narrow viewports** and on `navigator.connection.saveData` — show the poster. A background video is decorative; on a mid-range Android it is the single most expensive thing on the page.
- Re-encode: cap at 1280×720, target **under 2 MB**, ship WebM (VP9/AV1) + MP4 (H.264) via `<source>`. `[VERIFY]` — measure the current file size first; I could not.

**Acceptance criteria:**
- [ ] `hero.mp4` appears **once** in the network panel, or not at all on mobile
- [ ] No Chrome console warning about a preloaded-but-unused resource
- [ ] Poster image is the LCP element and is under 150 KB

---

# PHASE 2 — The SEO break (independent; ship it in parallel)

## 2.1 — The site declares itself to be two other websites `[CONFIRMED]` — **P0**

**Grep anchors:** `stex2.vercel.app` · `stefinalprototype.vercel.app` · `metadataBase` · `alternates`

Currently live on `www.stesurat.com`:

| Signal | Points at |
| --- | --- |
| `<link rel="canonical">` | `https://stex2.vercel.app` |
| `og:url`, `og:image`, `twitter:image` | `https://stex2.vercel.app` |
| JSON-LD `image`, `organizer.url`, `offers.url` | `https://stex2.vercel.app` |
| `robots.txt` → `Sitemap:` | `https://stefinalprototype.vercel.app/sitemap.xml` |
| `sitemap.xml` — all 3 URLs | `https://stefinalprototype.vercel.app/...` |

A canonical tag pointing to a different host is an instruction to Google to **index that host instead**. The real domain is currently asking to be de-indexed in favour of a preview deployment, and the sitemap is nominating a *second, different* preview deployment. For a site whose entire purpose is being found by buyers searching for a September 2026 expo, this outranks every performance item in this document.

**The fix.**

```ts
// lib/site.ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.stesurat.com';
```

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: { url: '/', images: ['/assets/og-image.png'], /* ... */ },
};
```

With `metadataBase` set, use **relative** paths everywhere and let Next resolve them. Then:

- Build the JSON-LD from `SITE_URL` — no hardcoded hosts.
- Convert `robots.txt` and `sitemap.xml` to `app/robots.ts` and `app/sitemap.ts` so they derive from `SITE_URL` and can never drift again.
- Set `NEXT_PUBLIC_SITE_URL=https://www.stesurat.com` on the Vercel **production** environment only. Preview deployments should fall back to `VERCEL_URL` so previews stay self-consistent.
- In Vercel project settings, make `www.stesurat.com` the **primary** domain and 308-redirect `stex2.vercel.app` and `stefinalprototype.vercel.app` to it. `[VERIFY]` — confirm you actually own both before redirecting.
- Add `noindex` for preview deployments:

```ts
// app/robots.ts
const isProd = process.env.VERCEL_ENV === 'production';
export default function robots(): MetadataRoute.Robots {
  return isProd
    ? { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/*?_rsc='] }],
        sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL }
    : { rules: [{ userAgent: '*', disallow: '/' }] };
}
```

**Acceptance criteria:**
- [ ] `curl -s https://www.stesurat.com/ | grep -o 'canonical[^>]*'` shows `www.stesurat.com`
- [ ] Zero occurrences of `vercel.app` in production HTML, sitemap or robots
- [ ] Google Search Console: URL Inspection reports the page as canonical to itself

## 2.2 — Open Graph image is a logo declared as 1200×630 `[CONFIRMED]` — **P2**

`og:image` is `/assets/logo_STE.webp` with `og:image:width=1200`, `og:image:height=630`. `[VERIFY]` the real dimensions — if the logo isn't actually 1200×630, previews will letterbox or crop badly. Also, several scrapers (older WhatsApp/LinkedIn) handle **WebP** poorly. Produce a purpose-built **1200×630 PNG or JPEG** OG card with the event name, dates and venue.

---

# PHASE 3 — Runtime jank (the "laggy scroll" complaint)

> These are the reasons scrolling feels heavy *after* the page loads. Attack in this order; re-measure after each.

## 3.1 — Animations that force a repaint on every frame `[CONFIRMED]` — **P1**

From the shipped CSS. Compositor-friendly animation touches only `transform` and `opacity`. These do not:

| `@keyframes` | Animates | Why it costs |
| --- | --- | --- |
| `rotateConic` | a `--angle` custom property | **Worst offender.** Re-resolves a conic-gradient and repaints on the CPU every frame. |
| `goldShimmer` | `background-position` | Full repaint per frame; cannot be composited. |
| `border-rotate` | `background-position` | Same. |
| `morph-float` | `border-radius` | Repaint per frame; may also re-raster the layer. |
| `particle-float` | `opacity`, `transform` | Fine per element — but cost scales with particle count. `[VERIFY]` how many. |
| `marquee`, `spotlightMove`, `scrollPulse`, `morph-word-in` | `transform`/`opacity` | Acceptable. Leave alone. |

**Fixes:**

- **`rotateConic`** — replace the animated `--angle` with a static conic-gradient on a pseudo-element and rotate *that* with `transform: rotate()`. Identical look, GPU path:

```css
.gold-ring { position: relative; isolation: isolate; }
.gold-ring::before {
  content: ''; position: absolute; inset: -1px; border-radius: inherit; z-index: -1;
  background: conic-gradient(from 0deg, #B87333, #D4AF37, #FFD700, #B87333);
  animation: spin 4s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- **`goldShimmer` / `border-rotate`** — stop animating `background-position`. Put the gradient on an oversized child and `translateX()` it under `overflow: hidden`.
- **`morph-float`** — animate `transform: scale()` / `rotate()` instead of `border-radius`, or make the morph a one-shot on hover rather than an infinite loop.
- **Pause everything off-screen.** Any infinite animation should stop when its section is out of view and when `document.hidden`:

```css
.section:not(.in-view) [class*="animate-"] { animation-play-state: paused; }
```

## 3.2 — Permanent `will-change` is creating layers that never get released `[CONFIRMED]` — **P1**

**Grep anchors:** `marquee-track` · `scroll-snap-card` · `horizontal-scroll-premium` · `will-change-transform`

```css
.marquee-track { will-change: transform; }
.scroll-snap-card { will-change: transform; }
.horizontal-scroll-premium { will-change: transform; }
```

`will-change` promotes an element to its own compositor layer **and keeps it there**. On a class applied to every card in a carousel, that is dozens of full-size GPU layers held for the entire session. On mobile GPUs this exhausts memory, and the browser starts thrashing — which presents exactly as "laggy scrolling".

**Fix:** apply it only while the element is actually animating.

```css
.scroll-snap-card { /* no will-change here */ }
.scroll-snap-card.is-animating { will-change: transform; }
```

Add the class on animation start, remove it on `transitionend`/`animationend`. Rule of thumb: **fewer than ~10 promoted elements at any moment.** Audit with DevTools → Rendering → *Layer borders*.

## 3.3 — Lenis smooth scroll `[CONFIRMED]` — **P1**

**Grep anchors:** `SmoothScroll` · `lenis` · `new Lenis`

Lenis replaces native scrolling with a JS-interpolated `transform`. Every frame runs JS. It is the leading cause of the specific complaint "the site feels laggy" on trackpads and mid-range Android, because it adds latency between the input and the pixels *by design*, and it fights the browser's own scroll optimisations.

Combined with everything in 3.1/3.2/3.4 — repaint-heavy keyframes, dozens of layers, backdrop blur — this is where the site's frame budget dies.

**Fix (least invasive first):**

1. **Disable on touch and reduced-motion.** Non-negotiable:
```ts
const coarse = matchMedia('(pointer: coarse)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (coarse || reduced) return; // native scroll
const lenis = new Lenis({ lerp: 0.12, duration: 0.9, smoothWheel: true, syncTouch: false });
```
2. **Ensure a single rAF loop** drives Lenis and Framer Motion's scroll values — not two competing ones. `[LIKELY]` there's already a `masterRAF` subscription pattern in the bundle; make sure Lenis subscribes to it rather than calling its own `requestAnimationFrame`.
3. **Consider removing Lenis entirely.** `scroll-behavior: smooth` covers anchor-link smoothness — the only part users actually notice — at zero runtime cost. I'd recommend this; it's a small aesthetic loss for a large responsiveness win. Flag it for the client rather than deciding unilaterally.

## 3.4 — Backdrop blur and blend modes `[CONFIRMED]` — **P1**

**Grep anchors:** `backdrop-blur-2xl` · `backdrop-blur-xl` · `mix-blend-screen` · `mix-blend-color` · `shadow-[0_0_80px`

- **`backdrop-blur-2xl` / `xl` on a fixed nav** forces the browser to re-blur everything behind it on *every scroll frame*. With Lenis driving scroll via transforms, that's a continuous full-width blur. Fix: drop to `backdrop-blur-sm`, or switch to a solid/gradient background once scrolled past the hero, and disable backdrop blur entirely below `md`.
- **`mix-blend-mode: screen` / `color`** forces the element out of the fast compositing path — the browser must read back the backdrop to blend. Fix: bake the blend into the asset, or replace with a plain `rgba()` overlay.
- **`shadow-[0_0_80px_rgba(...)]`** — an 80 px blur radius is expensive to rasterise, especially on hover transitions across many cards. Cap around 30–40 px, or use a pre-blurred PNG glow.

## 3.5 — Five stacked full-viewport fixed layers `[CONFIRMED]` — **P1**

Present simultaneously in the shipped DOM:

| Layer | z-index |
| --- | --- |
| Background effects (`fixed inset-0 ... overflow-hidden`) | `z-[1]` |
| Scroll progress bar | `z-[9999]` |
| Custom-cursor `<canvas>` | `z-[9999]` |
| Preloader | `z-[10000]` |
| Page-transition wipe (`clip-path: inset(0 0% 0 100%)`) | `z-[99999]` |

Each is a viewport-sized composited layer retained for the session, even when visually inert.

**Fix:** unmount the preloader (see 1.1) and the page-transition wipe when idle; render the cursor canvas only when `(pointer: fine)` matches (see 3.6). Also flatten the z-index scale to tokens (`--z-nav: 100`, `--z-overlay: 200`, `--z-modal: 300`) — `z-[99999]` next to `z-[10000]` is a bug waiting to happen.

## 3.6 — Custom cursor: invisible cursor bug + wasted frames `[CONFIRMED]` — **P1**

**Grep anchors:** `has-custom-cursor` · `pointer-events-none fixed inset-0 z-\[9999\]`

Shipped CSS:

```css
.has-custom-cursor, .has-custom-cursor body,
.has-custom-cursor a, .has-custom-cursor button { cursor: none !important; }
```

Shipped markup:

```html
<canvas class="pointer-events-none fixed inset-0 z-[9999] hidden md:block" width="1280" height="633">
```

Three real bugs:

1. **Invisible cursor below 768 px.** The class `has-custom-cursor` is applied to `<html>` unconditionally, but the canvas is `hidden md:block`. A mouse user on a narrow window (small laptop, split-screen, resized browser) gets `cursor: none !important` **with no replacement cursor drawn**. The pointer vanishes entirely. This is a "the site is broken" bug, not a polish item.
2. **No recovery path.** `!important` plus a JS-added class means any error in the cursor code leaves the site permanently cursor-less.
3. **Attribute size ≠ CSS size.** `width="1280" height="633"` with `fixed inset-0` means the canvas is stretched, ignoring `devicePixelRatio` — blurry on any HiDPI display, and re-rasterised on resize.

**Fix:**

```ts
const fine = window.matchMedia('(pointer: fine) and (min-width: 768px)');
const apply = () => {
  document.documentElement.classList.toggle('has-custom-cursor', fine.matches);
  if (fine.matches) startCursorLoop(); else stopCursorLoop(); // and cancelAnimationFrame
};
apply();
fine.addEventListener('change', apply);
window.addEventListener('error', () =>
  document.documentElement.classList.remove('has-custom-cursor')); // always recoverable
```

Size the canvas properly and cap the redraw region — a full-viewport `clearRect` every frame at DPR 2 on a 4K display is a serious per-frame cost:

```ts
const dpr = Math.min(window.devicePixelRatio, 2);
canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
ctx.scale(dpr, dpr);
```

Also drop `cursor: none` under `prefers-reduced-motion`, and **never** apply it to `a`/`button` without a visible substitute.

## 3.7 — Countdown timer re-renders `[LIKELY]` — **P2**

**Grep anchors:** `setInterval` · `Days` · `Secs` · `2026-09-12`

A `setInterval(fn, 1000)` driving React state. If that state lives high in the tree, the site re-renders a large subtree **once per second, forever** — while Framer Motion is animating. Fix: isolate into a leaf `<Countdown/>` that owns its own state; pause on `document.hidden`; recompute from `Date.now()` each tick rather than decrementing (interval drift makes a decrementing counter wrong within minutes on a backgrounded tab).

---

# PHASE 4 — Functional & layout bugs

## 4.1 — Stat counters stuck at zero `[CONFIRMED]` — **P1**

After 18 seconds of rendering, the hero stats still read:

```
₹0.0T  Sourcing Market Size
0+     Verified B2B Buyers
0+     Premium Exhibitors
```

These are count-up animations gated on an `IntersectionObserver`. A visitor who lands and reads without scrolling sees zeros where the headline numbers should be — the exact opposite of the intended effect.

**Likely cause `[VERIFY]`:** `<main>` carries `overflow-hidden` (see 4.2), which can create a scroll container and break observer/sticky assumptions. Check whether the observer is given the right `root`.

**Fix regardless of cause — make zero unreachable as a final state:**

- Render the **final** value in the SSR HTML; animate *down-from/up-to* it only as a progressive enhancement.
- Add a timeout fallback: if the observer hasn't fired within 2 s, snap to the final value.
- Under `prefers-reduced-motion`, skip the animation and show the number.

## 4.2 — `overflow-hidden` on `<main>` `[CONFIRMED]` — **P2**

```html
<main class="min-h-[100svh] bg-expo-midnight w-full overflow-hidden relative ...">
```

`overflow: hidden` on a top-level wrapper breaks `position: sticky` for **every descendant**, can create an unintended scroll container, and interacts badly with Lenis. It is almost always a blunt fix for a horizontal-overflow bug elsewhere.

**Fix:** replace with `overflow-x: clip` (which does not create a scroll container), then find and fix the element actually overflowing horizontally:

```js
[...document.querySelectorAll('*')].filter(el =>
  el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
```

## 4.3 — Page-transition `transform` breaks `position: fixed` `[CONFIRMED]` — **P2**

**Grep anchor:** `PageTransition`

The shipped HTML wraps the entire page in `<div style="opacity:0.9;transform:translateY(10px)">`. **Any non-`none` `transform` makes that element the containing block for every `position: fixed` descendant.** During a page transition, the fixed nav, the WhatsApp button and any modal stop being viewport-fixed and start scrolling with the transformed wrapper — they will visibly jump or drift.

**Fix:** animate **`opacity` only** on the wrapper, and never leave a residual transform. If a translate is essential, apply it to an inner element that contains no fixed-position children. (Note: `transform: none` is correctly restored when idle, so this only manifests *during* transitions — but that's exactly when it's most visible.)

## 4.4 — Contradictory buyer numbers `[CONFIRMED]` — **P2**

The same page states both:

- Hero: `650+ Stalls · 8000+ Verified Buyers`
- Meta description + JSON-LD + OG: `80,000+ B2B buyers`

**An order of magnitude apart, on a B2B site whose credibility is the product.** Pick the correct figure, then define it **once** and import it everywhere:

```ts
// lib/event-facts.ts — single source of truth for every number on the site
export const EVENT = {
  exhibitors: 650, buyers: 80_000,
  startDate: '2026-09-12T10:00:00+05:30', endDate: '2026-09-13T18:00:00+05:30',
  venue: 'SIECC, Sarsana Dome, Surat',
} as const;
```

Also reconcile "650+ Stalls" vs "650+ exhibitors" (stalls ≠ exhibitors), and "Organized By STE • Supported By AKAS" vs JSON-LD `organizer: AKAS Group`. `[VERIFY]` `offers.price: "0"` in the JSON-LD — if entry isn't actually free, this produces a misleading rich result.

## 4.5 — `/privacy-policy` and `/terms-of-service` `[VERIFY]` — **P2**

Both exist in the sitemap under the wrong domain. My extraction of `/privacy-policy` on the live domain **timed out at 60 s**. Load both directly, confirm they return 200 on `www.stesurat.com`, and confirm the footer links point at relative paths (`/privacy-policy`) rather than a hardcoded `vercel.app` URL — a hardcoded link would silently walk users off the real domain.

---

# PHASE 5 — Accessibility

## 5.1 — `prefers-reduced-motion` is essentially unimplemented `[CONFIRMED]` — **P1**

The entire ~55 KB stylesheet contains exactly **one** reduced-motion rule:

```css
@media (prefers-reduced-motion: reduce) { .morph-word { animation: none } }
```

Meanwhile the site ships a 4.5 s cinematic intro, hijacked scrolling, marquees, particles, spotlight sweeps, shimmer loops, page-transition wipes and a cursor trail. For a user with vestibular disorders this is not a preference — it's the difference between usable and nauseating. It also happens to be the cheapest global perf win available.

**Fix — add globally, then handle JS-driven motion at the source (1.1, 3.3, 3.6, 4.1):**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 5.2 — Other findings `[CONFIRMED / VERIFY]` — **P2/P3**

- **9 px type with 0.3em tracking** (`text-[9px] uppercase tracking-[0.3em]`, `text-[10px] tracking-[6px]`) — below any reasonable legibility floor. Raise to 12 px minimum.
- **`text-expo-warm/70` on `#050505`** `[VERIFY]` — check it clears 4.5:1. Opacity-modified utilities are a common silent contrast failure.
- **Language toggle doesn't update `lang`** `[VERIFY]` — `<html lang="en">` is static, but the site offers EN/हिं. Switching to Hindi must set `lang="hi"` or screen readers will read Devanagari with English phonetics.
- **Preloader focus management** — `role="status" aria-live="polite"` is correct and good. But move focus to **Skip Intro** on mount so keyboard users aren't trapped behind an overlay they can't reach.
- **Decorative canvas/overlays** need `aria-hidden="true"`.

---

# PHASE 6 — Build & delivery `[CONFIRMED / VERIFY]` — **P3**

- **A `nomodule` legacy chunk is shipped** (`<script src="/_next/static/chunks/03~...js" nomodule>`). It is downloaded by no browser anyone still uses. `[VERIFY]` your `browserslist` — tightening it removes this and shrinks the modern bundles too.
- **12 async chunks in `<head>`.** Not fatal over HTTP/2, but worth a `@next/bundle-analyzer` pass. Framer Motion is already correctly using `LazyMotion` + `domAnimation` — good; make sure nothing imports the full `motion` bundle and undoes that.
- **Images bypass Next's optimiser.** Assets are referenced as raw `/assets/*.webp`, so there is no responsive `srcset` and no per-device sizing — every device downloads the desktop asset. Move to `next/image` with explicit `sizes`, and set `width`/`height` on everything to eliminate layout shift.
- **Fonts.** Two `woff2` files are preloaded via `next/font` (correct). `[VERIFY]` `display: swap` is set and subsets are trimmed — and that the Devanagari subset loads **only** when Hindi is selected.
- **Turbopack production build** `[VERIFY]` — confirm this is intentional and that the deployed Next version's Turbopack builds are stable for you.

---

# Verification

## Before/after, per phase

```bash
npx unlighthouse --site https://www.stesurat.com   # or Lighthouse CI, mobile preset
```

**Targets after Phases 1–3:**

| Metric | Now (est.) | Target |
| --- | --- | --- |
| LCP (mobile) | > 5 s | < 2.5 s |
| TBT | high | < 200 ms |
| CLS | ? | < 0.1 |
| Lighthouse Perf (mobile) | ? | > 75 |

## Manual checks

- [ ] **DevTools → Performance**, 6× CPU throttle, scroll the full page. No long tasks > 50 ms; frames stay green.
- [ ] **Rendering → Layer borders**: fewer than ~10 promoted layers at rest.
- [ ] **Rendering → Paint flashing**: scrolling should not repaint the whole viewport.
- [ ] Real mid-range Android on 4G — not just a throttled desktop.
- [ ] Resize the window below 768 px with a mouse attached: **the cursor stays visible**.
- [ ] `prefers-reduced-motion: reduce` (DevTools → Rendering): no intro, no smooth-scroll hijack, no infinite loops.
- [ ] Keyboard-only pass: Skip Intro reachable, focus visible throughout, no traps.
- [ ] `curl -s https://www.stesurat.com/ | grep -E 'canonical|<h1'` — correct domain, real headline.

---

# Suggested PR sequence

| PR | Contents | Risk |
| --- | --- | --- |
| 1 | 2.1, 2.2 — domain/canonical/sitemap/robots | Low |
| 2 | 1.1, 1.2 — preloader + SSR | Medium (touches page structure) |
| 3 | 1.3 — video preload & mobile poster | Low |
| 4 | 3.1, 3.2, 3.4 — CSS animation & layer cost | Low |
| 5 | 3.3, 3.6 — Lenis gating + cursor fix | Medium (needs product sign-off on Lenis) |
| 6 | 4.1–4.5 — functional & layout bugs | Low |
| 7 | 5.1, 5.2 — accessibility | Low |
| 8 | 6 — build & images | Medium |

---

# What I could NOT verify — do these first, in a real browser

This audit was done **without a browser profiler** (the browser bridge dropped mid-session, and the sandbox couldn't reach the domain directly). Everything above rests on the shipped HTML, CSS, bundle inspection, robots.txt and sitemap.xml — solid for structural bugs, but it means I have **no measured frame timings**. Before acting on Phase 3's ordering, spend ten minutes collecting:

1. **A Performance-panel trace** while scrolling, at 6× CPU throttle. Confirms *which* of 3.1–3.6 actually dominates. My ordering is reasoned, not measured.
2. **Real asset sizes** — `hero.mp4` above all. I never obtained it, and if it's 20 MB it instantly becomes the #1 item in this document.
3. **The console on first load.** Hydration mismatches are likely given `suppressHydrationWarning` appears on `<html>`, `<body>` *and* the JSON-LD script — that's three suppressions, which often masks a real mismatch that costs a full client re-render.
4. **Total JS transferred** and long-task count during hydration.
5. **`/privacy-policy` and `/terms-of-service`** loading at all (4.5).

If you re-run this audit with the browser bridge connected, the numbers slot straight into the table above.
