# stesurat.com — Bug Audit

**Site:** https://www.stesurat.com
**Date:** 26 August 2026
**Method:** server HTML, metadata, robots.txt, sitemap.xml across 6 routes
**Result:** 18 confirmed issues — 3 high, 7 medium, 8 low

Each bug has a fix prompt written to be pasted directly into an AI coding agent
working on the Next.js repo.

---

## HIGH

### STE-01 — robots.txt points Google at your Vercel preview domain

Your live `robots.txt` ends with:

```
Sitemap: https://stefinalprototype.vercel.app/sitemap.xml
```

That host returns 404.

**Why it matters:** Search engines ignore a sitemap declared on a different host, so as
far as Google is concerned you have not submitted one at all. It also publishes your
internal project name to anyone who opens the file.

**Fix prompt:**

```
In this Next.js repo, open `app/robots.ts` (or `public/robots.txt`) and change the
sitemap value from `https://stefinalprototype.vercel.app/sitemap.xml` to
`https://www.stesurat.com/sitemap.xml`.

Then grep the entire repo for `stefinalprototype.vercel.app` and replace every
occurrence with the production URL. Replace all hard-coded site URLs with a single
`NEXT_PUBLIC_SITE_URL` env var, and use it for `metadataBase`, the canonical tag,
the sitemap host and the robots sitemap line, so this can never drift again.

Show me every file you changed. After deploying, I will re-submit the sitemap in
Google Search Console.
```

---

### STE-02 — Everything below the hero is missing from the server-rendered HTML

The HTML the server sends for `/` contains only the header, hero and stats strip. The
**Couture**, **Exhibition Experience**, **Digital Commerce**, **Buyer Registration** and
footer sections are not in it — they only appear after JavaScript runs. The nav links to
`#buyer-registration` exist, but the section they point at does not exist in the source.

**Why it matters:** This is the most expensive bug on the list. Google indexes rendered
pages on a slower second pass and often not completely, so most of your keyword-rich copy
is effectively invisible. WhatsApp and LinkedIn previews — how a B2B exhibition actually
spreads — read only the raw HTML. And every visitor on a weak connection at the venue
stares at a hero with nothing under it.

**Fix prompt:**

```
On the homepage of this Next.js app, only the header, hero and stats strip appear in
the server-rendered HTML. The Couture / Fabric in Motion, Exhibition Experience,
Digital Commerce, Buyer Registration and footer sections are missing from the source
and only render after hydration.

Find the cause. Look specifically for:
  - `dynamic(() => import(...), { ssr: false })` on any section component
  - components that return null until a `mounted` / `isClient` / `hasMounted` state flips
  - content gated behind an IntersectionObserver or scroll listener that renders
    nothing before it fires
  - a client-only i18n provider that suppresses children until a locale loads

Refactor so all real content — section headings, body copy, form labels, footer links
— is server-rendered, and only the ANIMATION is client-side. With framer-motion, that
means always rendering the markup and animating `opacity` / `transform` via
`whileInView`, never conditionally mounting the children.

Verify with View Source (Ctrl+U) on the deployed page, not DevTools Inspect: every
section heading and every buyer-registration field label must be present in the raw
HTML. Report which files you changed and what was causing it.
```

---

### STE-03 — No Event structured data

There is no JSON-LD on the page.

**Why it matters:** With valid `Event` schema, a search for "textile exhibition Surat" can
show your dates, venue and a registration link directly in results. Without it you are one
blue link among many. For a dated, venued exhibition this is the biggest free win available.

**Fix prompt:**

```
Add schema.org Event structured data to the homepage of this Next.js app as a
`<script type="application/ld+json">` block rendered server-side from `app/page.tsx`
(build the object in TypeScript, then `JSON.stringify` it — do not hand-write the
JSON string).

Use:
  "@type": "Event"
  name: "Surat Textile Exhibition 2026"
  startDate / endDate: 2026-09-12 and 2026-09-13 with the +05:30 offset and the
    REAL opening and closing times — ask me for them if they are not in the repo
  eventStatus: "https://schema.org/EventScheduled"
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode"
  location: Place -> name "Surat International Exhibition and Convention Centre
    (SIECC)", PostalAddress -> Sarsana, Surat, Gujarat, 395007, IN
  organizer: Organization with the correct legal name and url (see STE-11 —
    the site is inconsistent about this, so confirm with me first)
  image: the absolute URL of the existing opengraph image
  description: the same text as the meta description
  offers / url: the buyer registration anchor

Also add BreadcrumbList and Organization schema. Then validate the deployed page at
search.google.com/test/rich-results and paste me the result.
```

---

## MEDIUM

### STE-04 — The `<html>` tag has no `lang` attribute

No `lang` is declared, on a site that ships an EN / हिं toggle.

**Why it matters:** Screen readers pick a pronunciation engine from this attribute — without
it Hindi content may be read in an English voice, or vice versa. It is also a straightforward
accessibility-audit failure.

**Fix prompt:**

```
In `app/layout.tsx` the root `<html>` element has no `lang` attribute. Add
`lang="en"` and `dir="ltr"` as the defaults.

Because this site has an EN / हिं language toggle, the attribute must follow the
active locale: when the user switches to Hindi, `document.documentElement.lang`
should become `hi`. Implement it wherever the locale state already lives — either a
`useEffect` in the language provider, or by lifting locale into the route segment
(`/[locale]/...`) if you think that is the cleaner refactor. Tell me which you chose
and why.
```

---

### STE-05 — No favicon declared anywhere in the head

No `<link rel="icon">`, no apple-touch-icon, no `favicon.ico` reference.

**Why it matters:** Exhibitors keep the portal open in a tab for days. A blank page icon
among twenty tabs reads as unfinished, and it is also what shows when someone saves the site
to a phone home screen.

**Fix prompt:**

```
This Next.js App Router site declares no favicon. Add a complete icon set using the
App Router file conventions so Next injects the tags automatically:

  app/favicon.ico      (32x32, for legacy browsers)
  app/icon.png         (512x512)
  app/apple-icon.png   (180x180, no transparency — iOS ignores alpha)

Use the STE mark on a solid brand-coloured background, not a transparent logo:
it must stay legible at 16px in a browser tab. If no square mark exists in the repo,
tell me and generate a placeholder from the "STE" lettermark so nothing ships blank.

Confirm afterwards that `<link rel="icon">` appears in View Source on the deployed page.
```

---

### STE-06 — Every page reuses the homepage title and description

`/privacy-policy` and `/terms-of-service` both serve the title
*"Surat Textile Exhibition 2026 (STE) | India's Premier B2B Sourcing Machine"*. No
page-level metadata is exported.

**Why it matters:** Duplicate titles compete with each other in search results and make
browser tabs indistinguishable. Google frequently rewrites titles it considers unhelpful,
which means you lose control of your own snippet.

**Fix prompt:**

```
Every route in this Next.js app inherits the homepage metadata. Export a page-level
`metadata` object from each route with a unique title, description and canonical:

  app/privacy-policy/page.tsx
    title: "Privacy Policy | Surat Textile Exhibition 2026"
    description: one sentence about how STE handles exhibitor and buyer data
    alternates.canonical: "/privacy-policy"

  app/terms-of-service/page.tsx
    title: "Terms of Service | Surat Textile Exhibition 2026"
    description: one sentence about booking, eligibility and cancellation terms
    alternates.canonical: "/terms-of-service"

  app/exhibitor/login/page.tsx
    title: "Exhibitor Login | Surat Textile Exhibition 2026"
    robots: { index: false, follow: true }
    alternates.canonical: "/exhibitor/login"

In `app/layout.tsx`, set `title.template` to "%s | Surat Textile Exhibition 2026"
and `title.default` to the current homepage title, so future pages inherit the
pattern instead of the literal string. Keep every title under 60 characters.
```

---

### STE-07 — sitemap.xml lists only three URLs

It contains the homepage, `/privacy-policy` and `/terms-of-service`. Nothing else —
including the exhibitor portal.

**Why it matters:** Two of the three URLs you are actively telling Google about are legal
boilerplate. That is a poor signal about what the site is for.

**Fix prompt:**

```
`app/sitemap.ts` in this repo emits only 3 URLs: /, /privacy-policy and
/terms-of-service. Rewrite it to:

  - enumerate every public route, including /exhibitor/login (or exclude it
    deliberately and leave a code comment saying why)
  - set a real `lastModified` per route — use the source file's mtime or a
    date constant per page, not `new Date()` at build time, which tells Google
    every page changed on every deploy and is then ignored
  - set priority 1.0 for /, 0.8 for conversion routes, 0.3 for legal pages
  - read the host from NEXT_PUBLIC_SITE_URL (see STE-01)

If any content sections are planned as real routes rather than homepage anchors,
list them for me — anchor-only sections cannot be sitemapped and that limits how
this site can rank for "textile exhibition stalls Surat" type queries.
```

---

### STE-08 — `/exhibitor` returns 404 instead of going to the login

`https://www.stesurat.com/exhibitor` 404s. Only the full `/exhibitor/login` path resolves.

**Why it matters:** People shorten URLs when they retype them from a brochure or a WhatsApp
forward. An exhibitor who types the obvious parent path hits a dead end at exactly the
moment they were trying to pay you.

**Fix prompt:**

```
`/exhibitor` currently 404s on this Next.js site; only `/exhibitor/login` resolves.
Add redirects in `next.config.js`:

  { source: '/exhibitor', destination: '/exhibitor/login', permanent: false }
  { source: '/login',     destination: '/exhibitor/login', permanent: false }
  { source: '/register',  destination: '/#buyer-registration', permanent: false }
  { source: '/portal',    destination: '/exhibitor/login', permanent: false }

Use permanent: false for now so we can change our minds without poisoning caches.

Then check `app/not-found.tsx` exists and is branded: it should carry the site header,
say plainly that the page was not found, and offer three buttons — Home, Register as
Buyer, Exhibitor's Portal. If there is no custom not-found page, create one. Show me
what the default currently renders.
```

---

### STE-09 — The legal pages are dead ends

Both `/privacy-policy` and `/terms-of-service` render as bare documents. The only way out
is a text link reading "← Back to Exhibition Home". No nav, no language toggle, no Register
button, no link between the two legal pages.

**Why it matters:** An exhibitor who opens Terms to check the cancellation clause before
paying has no route back to the portal except the browser back button. That is a checkout
funnel with a hole in it.

**Fix prompt:**

```
`/privacy-policy` and `/terms-of-service` render without the site chrome — no
header, no nav, no language toggle, no footer. The only exit is a "← Back to
Exhibition Home" text link.

Wrap both pages in the same layout shell the homepage uses, so they get the sticky
header (logo, nav, language toggle, Exhibitor's Portal button) and the footer
(contact block, legal links, WhatsApp CTA). If the homepage chrome currently lives
inside `app/page.tsx` rather than a layout, extract it into a shared
`<SiteHeader />` / `<SiteFooter />` and move it up into `app/layout.tsx`.

Also cross-link the two legal pages to each other, and keep the "back" link — but
as a secondary element under the real nav, not as the only navigation.

Make sure the header on these pages does not overlap the first heading; check at
375px and 1440px.
```

---

### STE-10 — Terms of Service lists no contact details at all

The Privacy Policy gives `compliance@akasgroup.in`, `+91 99507 87787` and the full SIECC
address. The Terms of Service — the page that governs bookings, cancellations and force
majeure — gives no email, no phone, no address.

**Why it matters:** A terms document with no notice address is weak if a booking dispute
ever arises, and an exhibitor reading the cancellation clause has nobody to ask.

**Fix prompt:**

```
The Privacy Policy page lists compliance@akasgroup.in, +91 99507 87787 and the full
SIECC address. The Terms of Service page lists no contact details at all, even though
it covers bookings, cancellations and force majeure.

1. Create a single source of truth — `lib/site-config.ts` exporting an object with
   organizer legal name, email, phone (both display format "+91 99507 87787" and
   tel: format "+919950787787"), WhatsApp number, venue short name, venue full name,
   and the full postal address including pincode 395007.
2. Build a `<ContactBlock />` component that reads from it.
3. Render it in: the homepage footer, the Privacy Policy page, the Terms of Service
   page, and the exhibitor portal.
4. Replace every hard-coded phone number, email and address string in the repo with
   references to that config. Grep for "99507", "akasgroup", "Sarsana" and "395007"
   to make sure none are left.

Add a "Notices" line to the Terms page giving the postal address for formal notice.
```

---

## LOW

### STE-11 — Who organises the exhibition changes between pages

- Homepage: *"Organized By STE • Supported By AKAS"*
- Meta description: *"presented by STE and supported by AKAS Group"*
- Privacy Policy: *"organized by AKAS Group"*

**Why it matters:** This is the name that goes on invoices, tax receipts and the schema.org
organizer field. Buyers doing due diligence on a lakh-rupee stall booking notice this.

**Fix prompt:**

```
The organiser is described three different ways across this site:
  - homepage:         "Organized By STE • Supported By AKAS"
  - meta description: "presented by STE and supported by AKAS Group"
  - privacy policy:   "organized by AKAS Group"

Do not guess which is correct — ask me to confirm the legal phrasing first. Once
confirmed, put it in `lib/site-config.ts` as `organizer.legalName` and
`organizer.displayCredit`, and render every mention from there: homepage credit line,
meta description, both legal pages, the schema.org `organizer` field (STE-03), and
anywhere invoices or receipts are generated.

Grep for "AKAS" and "Organized By" and show me every match before you change them.
```

---

### STE-12 — The venue is written two different ways

- Homepage: *"SIECC, Sarsana Dome, Surat"*
- Privacy Policy: *"Surat International Exhibition and Convention Centre (SIECC), Sarsana, Surat, Gujarat - 395007"*

**Why it matters:** The full address appears nowhere on the homepage, so a buyer coming from
Bhiwandi or Ludhiana has to hunt through the privacy policy to find where to actually go. It
also weakens local SEO, which keys off a consistent name-address-phone string.

**Fix prompt:**

```
The venue is written inconsistently: the homepage says "SIECC, Sarsana Dome, Surat"
and the privacy policy says "Surat International Exhibition and Convention Centre
(SIECC), Sarsana, Surat, Gujarat - 395007".

Add a canonical venue object to `lib/site-config.ts`:
  venue: { shortName, fullName, hall, area: "Sarsana", city: "Surat",
           state: "Gujarat", pincode: "395007", mapsUrl }

Render the short form in the hero, and the FULL address at least once on the
homepage — in the footer and near the buyer registration CTA — with a "Get
directions" link to Google Maps. Keep the exact same name-address string everywhere,
including the schema.org Place (STE-03); inconsistent NAP data hurts local search.

Confirm with me whether the correct hall name is "Sarsana Dome" before writing it.
```

---

### STE-13 — Header tagline reads as unfinished: "Orchestrating Couture..."

The line under the logo ends in an ellipsis with nothing after it.

**Why it matters:** Either it is copy that was never finished, or it is a longer string being
clipped by CSS `text-overflow` — both look like a site that shipped early. It sits in the
first thing every visitor reads.

**Fix prompt:**

```
The tagline under the logo in the site header reads "Orchestrating Couture..." with
a trailing ellipsis.

First determine which it is:
  (a) the literal string in the code ends in "...", or
  (b) it is a longer string being clipped by CSS `text-overflow: ellipsis` on a
      fixed-width container.

If (a): finish the line. Give me 3 options that complete the thought and fit in one
line at 375px width — something in the register of "Orchestrating Couture, Commerce
and Connections".

If (b): the real string is being truncated. Fix the container rather than the text —
allow it to wrap on mobile, or hide the tagline below 480px and keep it in full above
that. Show me the untruncated string.

Check the result at 320px, 375px, 768px and 1440px.
```

---

### STE-14 — The same two statistics appear twice within one scroll

- Hero strip: **650+ Stalls · 8,000+ Verified Buyers · 950+ Sourcing Agents · SIECC**
- Next block: **₹15.5T · 8,000+ Verified B2B Buyers · 950+ Sourcing Agents**

**Why it matters:** Repeating a number two screens apart does not reinforce it, it wastes the
second block — and the label drift ("Verified Buyers" vs "Verified B2B Buyers") makes a
reader wonder if they are two different figures.

**Fix prompt:**

```
On the homepage, the hero stats strip shows: 650+ Stalls, 8,000+ Verified Buyers,
950+ Sourcing Agents, SIECC Sarsana Dome. The metrics block immediately below shows:
₹15.5T Sourcing Market Size, 8,000+ Verified B2B Buyers, 950+ Sourcing Agents.

Two of the three repeat within one scroll, with inconsistent labels.

Keep the hero strip as the canonical stat line. Replace the second block with metrics
it does not already state — candidates: total floor area in sq ft, number of product
categories, exhibitor cities or states represented, buyer footfall from the previous
edition, average order value, number of countries. Ask me which figures we can
actually stand behind before writing any of them in.

Also: define every stat once in `lib/site-config.ts` and render both blocks from
that object, so "8,000+ Verified Buyers" and "8,000+ Verified B2B Buyers" can never
drift apart again.
```

---

### STE-15 — "₹15.5T" is the wrong unit for an Indian B2B audience

The largest claim on the page is written in Western short-scale notation with no source.

**Why it matters:** Indian textile buyers price in crore. "T" reads as trillion to some, as a
typo to others, and as nothing at all to most. An unsourced headline number on a page asking
for stall bookings invites scepticism rather than confidence.

**Fix prompt:**

```
The homepage metrics block shows "₹15.5T — Sourcing Market Size". Indian B2B buyers
price in crore, and "T" is ambiguous.

Change the display to Indian numbering: "₹15.5 lakh crore" as the primary figure,
with "(≈ US$ 186 bn)" as a smaller secondary line if the dollar figure is accurate —
compute it from a stated exchange rate, do not invent it.

Add a small caption under the figure naming the source and year, e.g.
"Source: <report name>, <year>". This is the single largest claim on the page and it
currently has no attribution.

If the source is not in the repo, ask me for it rather than guessing. Apply the same
lakh/crore treatment to any other rupee figure on the site.
```

---

### STE-16 — The WhatsApp CTA stays English when the site is switched to Hindi

The link is hard-coded to
`wa.me/919950787787?text=Namaste!%20I%20visited%20the%20STE%202026%20website…`.
Switching the site to हिं does not change it.

**Why it matters:** A buyer who chose Hindi is then asked to open a chat that speaks English
on their behalf. A small thing that undoes the point of offering the toggle.

**Fix prompt:**

```
The WhatsApp CTA hard-codes an English prefill:
`https://wa.me/919950787787?text=Namaste!%20I%20visited%20the%20STE%202026%20website%20and%20would%20like%20more%20information.`

It does not change when the site is switched to Hindi.

1. Move the prefill text into the i18n dictionary alongside the rest of the copy, with
   an `en` and a `hi` variant, and build the URL at render time with
   `encodeURIComponent(t('whatsappPrefill'))`.
2. Read the phone number from `lib/site-config.ts`, not a literal.
3. Add `target="_blank"` and `rel="noopener noreferrer"` if missing.
4. The link text is an emoji plus "WhatsApp Us" — give it an explicit
   `aria-label` ("Chat with STE 2026 on WhatsApp") so screen readers do not announce
   the emoji, and confirm the emoji has `aria-hidden="true"`.

While you are in there, audit every other outbound and tel: link on the site for
missing rel/target and missing aria-labels, and list what you fixed.
```

---

### STE-17 — Exhibitor login is blocked to crawlers by something outside robots.txt

Fetching `/exhibitor/login` is refused with "disallowed by robots.txt rules" — but the
published `robots.txt` only disallows `/api/` and `/*?_rsc=`. Something else is doing the
blocking.

**Why it matters:** Keeping a login page out of search results is correct. Doing it with a
robots.txt *disallow* is not — that also stops WhatsApp and LinkedIn generating a preview
when you send an exhibitor their portal link, so it arrives as a bare URL.

**Fix prompt:**

```
Requests to `/exhibitor/login` are being refused by crawlers with "disallowed by
robots.txt rules", but the published robots.txt only disallows `/api/` and
`/*?_rsc=`.

Find what is actually blocking it. Check, in this order:
  - a second `User-agent` group in `app/robots.ts` or `public/robots.txt`
  - an `X-Robots-Tag` response header set in `next.config.js` headers()
  - `middleware.ts` intercepting bot user-agents
  - Vercel deployment protection or a firewall rule on that path

Then correct the approach: a login page SHOULD be `noindex, follow` via the page's
metadata export, and should NOT be disallowed in robots.txt — a disallow also kills
WhatsApp and LinkedIn link previews, which matters because we send exhibitors this
URL directly.

Report what you found before changing anything.
```

---

### STE-18 — No theme-color, so mobile browser chrome stays default grey

There is no `theme-color` meta tag.

**Why it matters:** Most of your traffic will be on Android Chrome. The address bar tinting
to your brand colour is the cheapest polish available and it is currently unclaimed.

**Fix prompt:**

```
This site has no `theme-color` meta tag. In `app/layout.tsx`, add a Next.js
`viewport` export:

  export const viewport = {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '<brand hex>' },
      { media: '(prefers-color-scheme: dark)',  color: '<brand dark hex>' },
    ],
  }

Use the actual brand colours from the existing theme/token file rather than inventing
hexes — tell me which values you used.

While in that file, confirm the viewport export also sets
`width: 'device-width', initialScale: 1` and does NOT set `maximumScale: 1` or
`userScalable: false`, since blocking pinch-zoom is an accessibility failure.
```

---

## Still to check — needs the repo or a browser

This pass read what the server sends. These can only be judged by clicking through the live
site or reading the source, and several are where the expensive bugs usually hide.

- **Buyer registration form** — required-field validation, email / phone / GSTIN format checks, double-submit protection, what the success and error states say, and where the submission actually goes.
- **Exhibitor login flow** — wrong-password copy, forgot-password path, rate limiting, whether the session cookie is HttpOnly and Secure.
- **"Download Brochure"** — whether the file exists, its size, and whether it opens or downloads on mobile.
- **Language toggle** — does हिं translate the whole page or only the nav, and does the choice survive a reload.
- **Anchor scrolling** — whether the sticky header covers section headings when nav links jump to `#fabric-in-motion` and friends.
- **Horizontal overflow** at 320px, 375px and 768px — the most common bug on animated marketing sites.
- **Console and hydration errors** — React hydration mismatches are likely given how much of this page is client-rendered.
- **Images** — alt text, explicit width/height to stop layout shift, modern formats, lazy-loading below the fold, total page weight on 4G.
- **Colour contrast** of hero text over its background or video, against WCAG AA.
- **Keyboard navigation** — visible focus rings, sane tab order, whether the mobile menu traps focus.
- **Core Web Vitals** — LCP, CLS and INP on a mid-range Android, not on a laptop.
- **Non-www redirect** — confirm `stesurat.com` 301s to `www.stesurat.com` rather than serving both.
- **Custom 404 page** — whether one exists and carries the site chrome.

To finish these: connect the project folder in the Claude desktop app and I can read the
source directly, or connect your Chrome so I can click through the live site and read the
console.
