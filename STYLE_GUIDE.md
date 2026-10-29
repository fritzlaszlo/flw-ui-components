# DIY Self-Hosted — Style Guide

A visual language for self-hosted web projects running on embedded or low-power hardware (Raspberry Pi, NUC, mini-PC, homelab). Designed to look intentional, not default. Inspired by terminal emulators and system monitors (bpytop, btop, iTerm2 Dracula), adapted for browser delivery. Applicable across a wide range of project types: dashboards, status pages, control panels, kiosk displays, tools.

**Implementation:** the [flw](README.md) CSS library ships these tokens and components as `.flw-*` classes. Visual QA: [examples/overview.html](examples/overview.html). Agent instructions: [AGENTS.md](AGENTS.md).

---

## Design Philosophy

**Terminal-native, not web-native.** The aesthetic borrows from the terminal world: monospace type, colored text for state, thin-line borders, glyph-based graphics. There is no shadow-heavy card design, no gradients, no rounded corners on containers. The UI looks like a thoughtful CLI tool that happens to run in a browser.

**Color communicates state, not decoration.** Every color in the palette has a semantic role. Status, health, and values are expressed through color. Decoration and hierarchy are expressed through weight and opacity — not color.

**Flat typography with restrained variation.** The base font size is the dominant text size and most interfaces will live almost entirely within it. Size variation is permitted but should be used sparingly and with intention — a meaningful heading, a clearly subordinate caption. The default posture is: reach for weight or color before reaching for size.

**Playful nerd energy.** The target vibe is closer to Chaos Computer Club than sleek developer portfolio. The interface is technical and precise, but it is also allowed to have personality. Glyph-based icons, expressive emoji used selectively, and the occasional decoration that serves no purpose except delight — these are welcome. This is a system for people who enjoy building things and want that to show.

---

## Color Palette

All colors are defined as CSS custom properties on `:root`.

### Core Palette

| Token | Value | Semantic Role |
|---|---|---|
| `--c-bg` | `#000000` | Page background — absolute black |
| `--c-dark-gray` | `#333333` | Borders (resting), dim fills, disabled text |
| `--c-gray` | `#888888` | Body text, secondary labels, active borders |
| `--c-white` | `#ededed` | Primary text, titles — warm off-white, not pure white |
| `--c-red` | `#ff5555` | Error, down, critical, danger |
| `--c-green` | `#50fa7b` | OK, up, connected, healthy |
| `--c-orange` | `#ffb86c` | Warning, elevated, intermediate |
| `--c-blue` | `#6272a4` | Info, metadata, secondary accents |
| `--c-purple` | `#bd93f9` | Structural accents, separators, decorative highlights |

### RGB triplets (for glows)

| Token | Value |
|---|---|
| `--c-red-rgb` | `255, 85, 85` |
| `--c-green-rgb` | `80, 250, 123` |
| `--c-blue-rgb` | `98, 114, 164` |
| `--c-purple-rgb` | `189, 147, 249` |
| `--c-orange-rgb` | `255, 184, 108` |

Use as `rgba(var(--c-green-rgb), 0.45)` for LED glows.

This is a Dracula-family palette. The five semantic colors (red/green/orange/blue/purple) are distinct enough to read at a glance and low-saturated enough to sit comfortably on pure black without visual fatigue.

### Usage Rules

- **Green → Red** via orange is the standard severity ramp. Never use two adjacent ramp colors for unrelated concepts.
- **Blue** is reserved for informational annotations, not primary status.
- **Purple** is structural — separators, decorative chrome, accent elements.
- **Dark gray** is the resting state. Gray is the active/elevated state. White is emphasis.
- Transparency layers use `rgba` derived from the palette: overlays use `rgba(0,0,0,0.7)`, glows use the semantic color at `~45% alpha`.

### Extended: Semantic Data Colors

For data that represents real-world quantities on a scale (temperature, sky conditions, signal strength), use a secondary pastel register — lighter, less saturated variants of the core palette — so they read as "data" rather than "status":

| Concept | Token / class | Value | Notes |
|---|---|---|---|
| Very cold (`< 0°`) | `--c-data-very-cold` / `.flw-data-very-cold` | `#e8d4ff` | Lavender-cool |
| Cold (`< 10°`) | `--c-data-cold` / `.flw-data-cold` | `#b8e7ff` | Ice blue |
| Mild (`< 20°`) | `--c-data-mild` / `.flw-data-mild` | `#f8f8f2` | Near-white |
| Warm (`≤ 25°`) | `--c-data-warm` / `.flw-data-warm` | `#ffd49a` | Warm amber |
| Hot (`> 25°`) | `--c-data-hot` / `.flw-data-hot` | `#ffabab` | Soft red |

The principle: semantic data colors are always lighter and less saturated than the core status colors so the two registers never compete.

### Playing with the palette

The palette is small on purpose — that's what makes it fun to play. Status colors keep their meaning wherever state is shown; everywhere else, be generous:

- **Identity colors.** Give peers a color each so they're recognizable at a glance: cpu green, mem blue, disk purple. Severity still wins — any bar above 70 % turns orange, above 90 % red, whatever its identity.
- **Rotating accents.** Non-status values in a ticker can cycle through orange → purple → green so the strip feels alive. Labels stay gray; only the value gets the accent.
- **Derive, don't invent.** Need a color for a domain (sky conditions, signal quality, room temperatures)? Lean on the data register or a lightened core color, or recolor a mono emoji (`filter: brightness(1.15) saturate(1.2)` is fair game). New hex values belong in project CSS, not in flw tokens.
- **Gray carries a lot.** A muted bar (`--gray`) for something that's off, a dimmed row for stale data — gray and opacity say "not now" without saying "broken".

---

## Typography

### Fonts

| Token | Stack | Role |
|---|---|---|
| `--font-mono` | `'flw Glyphs', 'Space Mono', 'DejaVu Sans Mono', 'Courier New', monospace` | All UI text |
| `--font-emoji` | `'Noto Emoji', sans-serif` | Pictographic/icon content |

**Space Mono** (Google Fonts, weights 400 + 700) is the primary face. It is a fixed-width geometric grotesque with a clear, slightly wide letterform that reads well at small sizes on low-DPI screens. The fallback stack covers headless and offline deployments.

**flw Glyphs** fills what Space Mono lacks: Space Mono covers Latin only, so box drawing, blocks, geometric shapes, arrows and Braille (`─ │ ┌ █ ▓ ▒ ░ ● ○ ■ ▶ ▼ ← → ⠋`) would otherwise fall back to whatever mono font the device has — Menlo on the Mac, DejaVu on the Pi, something else on Windows. flw ships DejaVu subsets (Sans Mono for shapes, Sans for Braille) under a `unicode-range`, so every glyph looks the same everywhere. Regenerate with `python3 scripts/fetch-glyphs.py` (needs `fonttools` + `brotli`).

**Noto Emoji** provides supplementary pictographs. Bundled locally in `fonts/` (SIL OFL) — `@font-face` rules ship inside `flw.css`. No Google Fonts CDN required at runtime.

Re-fetch fonts after upstream updates: `npm run fetch-fonts && npm run build`.

### Scale

| Token | Value | Usage |
|---|---|---|
| `--font-size` | `16px` | Global base — the dominant size |
| `--font-size-sm` | `12px` | Captions, secondary labels, subordinate metadata |
| `--font-size-lg` | `1.25rem` | Section headings, page titles, hero values |
| Icon boost | `calc(var(--font-size) * 1.1)` | Glyph/emoji icons inline with text |

The base size carries most of the interface. Size variation is a tool, not a default — use it only when the hierarchy genuinely calls for it. When in doubt, use weight or color instead.

### Weight

- `400` — default, body, labels, values
- `700` — titles, box headers, emphasized readings

### Rendering

```css
-webkit-font-smoothing: antialiased;
```

Apply globally. On low-DPI displays this produces cleaner strokes.

### Line Height & Spacing

| Token | Value |
|---|---|
| `--line-height` | `1.4` |
| Letter-spacing (data rows) | `0.04em` |

Letter-spacing of `0.04em` improves readability of numeric data in dense rows.

---

## Spacing

A 4px base unit. All spacing is a multiple of 4.

| Step | Token | Value | Usage |
|---|---|---|---|
| 1 | `--space-1` | `4px` | Tight internal gaps, icon-to-label |
| 2 | `--space-2` | `8px` | Standard component gap, content padding |
| 3 | `--space-3` | `12px` | Section padding, moderate gaps |
| 4 | `--space-4` | `16px` | Loose section separation |

Avoid freeform spacing values. If a component needs a value not in this table, use a half-step (`2px`, `6px`) sparingly and only for sub-component micro-adjustments.

---

## Borders

- Standard: `1px solid var(--c-dark-gray)` — resting state
- Active / focused: `1px solid var(--c-gray)` — elevated state
- Strong accent: `6px solid var(--c-gray)` — only for intentional structural emphasis
- Status outline: `1.5px solid` — fine-line status rings
- **No border-radius** on containers and panels
- `border-radius: 50%` on circular indicators only (LEDs, dots) — and the `.flw-range` knob, which stands in for the `●` glyph of the slider track

---

## Shadows

Shadows are used sparingly and only for deliberate effect — not elevation.

- **Glow:** `0 0 4px rgba(var(--c-green-rgb), 0.45)` — for active indicator "power LEDs"
- **Hard offset:** `6px 6px 0 rgba(var(--c-purple-rgb), 0.5)` — for splash or highlight elements; the only decorative shadow

No `box-shadow` for elevation or depth. No drop shadows on cards or panels.

---

## Layout

### Primitives (flw classes)

- `.flw-page` — outer page shell with padding
- `.flw-stack` / `.flw-row` — flex column/row
- `.flw-grid` + `.flw-cols-2` / `.flw-cols-3` — place boxes on a grid
- `.flw-cluster` — wrapping button/toggle groups
- `.flw-stat-rows` / `.flw-stat-row` — key/value data rows
- `.flw-data-grid` (+ `--4`) — rows whose columns line up: label · content · value (· status). `__num` right-aligns, `__full` spans the row
- **Columns of stacks** — `.flw-grid.flw-cols-3` with one `.flw-stack` per column. Boxes of uneven height pack per column instead of leaving row gaps; the go-to layout for dashboards

### Component layout rules

1. **Box is the unit of containment.** Primary chrome is `.flw-box`.
2. **One job per box.** Title names the job; content is only that concern.
3. **Spacing only from the scale.** Use `--space-1`…`--space-4`.
4. **Density default: compact.** 8px inside boxes; 12px between sections.
5. **Rows before columns for data.** Grids place boxes, not every field. When several rows share the same shape (metric · bar · value), use `.flw-data-grid` so the columns line up.
6. **Controls in clusters.** No floating SaaS toolbars.
7. **Hierarchy without size.** Weight and color before larger type.
8. **Full-bleed page, inset content.** Only `.flw-page` provides outer padding.
9. **Collapse long pages** with accordion/tabs, not endless peer boxes.
10. **No decorative layout.** Remove wrappers that don't structure content.

Optional kiosk mode: add `.flw-kiosk` on `<html>` for full-viewport overflow lock (Pi displays).

---

## Components

These are the canonical component types. All components inherit the terminal aesthetic — outline-only, no fill, no radius. flw class names in parentheses.

### Terminal Box (`.flw-box`)

The primary container. This is the core building block of the UI — directly inspired by the bordered, titled panes of modern TUI tools like `btop`, `lazygit`, or `k9s`. An outline-only box with a title bar, carrying the visual language of a terminal panel into the browser.

- Container: `border: 1px solid var(--c-dark-gray)`; active/focused state: `var(--c-gray)` (`.flw-box--active`)
- Title bar: `.flw-box__title`, `.flw-box__title-text`, optional `.flw-box__title-extra`
- Content area: `.flw-box__content`, `padding: 8px`
- No background fill, no border-radius, no shadow
- Title icon: `.flw-box__icon` — one gray mono emoji in front of the title text, from the project's theme (see *Personality in practice*)

### Progress Bar (glyph-based) (`.flw-progress`)

Bars are rendered with block characters, not CSS widths. This preserves the terminal aesthetic and works in any monospace context.

- Filled cell: `█`
- Empty cell: `░`
- Default width: 20 characters; narrower contexts: 12 characters
- Color ramp: base color (0–70%) → orange (70–90%) → red (>90%). Base is green unless the bar has an identity color: `.flw-progress__bar--blue` / `--purple` / `--white` / `--gray`, or `data-flw-bar-color`
- Label and value flanking the bar are right-aligned to a fixed `min-width: 4ch`
- JS helper: `flw.bar(el, pct)` or `data-flw-bar`

### Status Dot (`.flw-dot--up` / `.flw-dot--down`)

Inline state indicator.

- Active / up: `●` in `var(--c-green)`
- Warning: `●` in `var(--c-orange)` (`.flw-dot--warn`)
- Asleep / parked: `💤` in `var(--c-purple)` (`.flw-dot--sleep`) — a laptop that's closed, a VM that's suspended. Not down, so not red
- Inactive / down: `○` in `var(--c-red)`
- Size: body font size; glow optional for "power LED" contexts (`.flw-led--on` / `.flw-led--off`)

### Spinner (`.flw-spinner`)

Activity indicator for loading/pending states. Braille animation frames:
`⠋ ⠙ ⠹ ⠸ ⠼ ⠴ ⠦ ⠧ ⠇ ⠏`

- Frame interval: 80ms
- Default color: `var(--c-green)`
- Width: fixed `1ch`
- JS helper: `data-flw-spinner` + `flw.auto()`

### Separator (`.flw-sep`)

A purple-tinted separator character (`/` or `│`) used inline between metadata tokens. Uses `var(--c-purple)`. Modifiers: `.flw-sep--slash`, `.flw-sep--pipe`, `.flw-sep--dot`.

### Button (`.flw-btn`)

Outline buttons for control panels. Modifiers: `--primary`, `--danger`, `--active`.

### Form controls (`.flw-input`, `.flw-select`, `.flw-toggle`, `.flw-slider`)

Bordered monospace inputs. Select shows a `▼` affordance on the right.

**Toggle** (binary on/off): a 12px framed cell in the box border language. Off = gray outline (resting, not red — off is not an error); on = green outline with a solid inner fill. Same weight as surrounding text.

**Slider** (discrete choice with more than two options): a glyph track `──●──` built from a radio group. Track `─` in gray, selected knob `●` in white, hover previews `○`. The selected option's value is shown after the track. Use it for levels, durations, modes — not for binary state (that's the toggle). Works without JS; arrow keys move the knob.

**Range** (`.flw-range`, continuous value): the full-resolution sibling of the slider — a native `<input type="range">` drawn as the same track: 1px gray line, white `●` knob with a black ring so the line breaks around it like the glyph. Use it when the value is a number on a scale (px offsets, gain, opacity) rather than a handful of named options. `step` sets the resolution; arrows move one step, shift + arrows ten. JS (`data-flw-range`) keeps the numeric readout in sync; without JS the control still works, the readout just stays static.

### Accordion (`.flw-accordion` / `.flw-details`)

Foldable TUI panes — not web card collapses. Header row with `▶`/`▼` marker; instant open/close. JS: `data-flw-accordion="single|multi"`. CSS-only fallback: `<details class="flw-details">`.

### Tabs (`.flw-tabs`)

tmux-style tab bar: inactive tabs are plain text; active tab gets an outline frame that connects to the panel below (no bracket glyphs). JS required: `data-flw-tabs`.

### Marquee (`.flw-marquee`)

Overflow text scroll. Linear animation; duration scales with content. JS: `data-flw-marquee`. Default: no border. Modifiers: `.flw-marquee--ruled` (bottom line), `.flw-marquee--box` (full frame), `.flw-marquee--off` (dimmed, e.g. player stopped), `.flw-marquee--stepped` (ticker that jumps at 8 fps instead of gliding; `data-flw-marquee-fps` to tune).

A marquee makes a good header ticker: build hash, clock, today's date, a trivia slot — separated by mono emoji from the project's icon pool instead of `·`.

### Shade (`.flw-shade`)

Intensity as texture: `░ ▒ ▓` fills the cell behind a bold white value. Thresholds 20 / 50 / 80 %. Default blue (rain chance); any text color class recolors the texture. JS: `data-flw-shade="65"` or `flw.shade(el, pct)`; CSS-only: `.flw-shade--1` … `--3`. Use for rain probability, signal strength, heatmap cells — anything where "how much" matters more than the exact number.

---

## Icons & Emoji

The icon system has three tiers, applied in order of preference:

**1. Terminal glyphs (first choice)** — block characters, Braille, box-drawing characters, and Unicode symbols rendered in the monospace font. These are always on-palette and feel most native to the aesthetic. Examples: `█ ░ ● ○ ⠋ ◆ ▲ ►`

**2. Mono-color emoji via `--font-emoji` (second choice)** — Noto Emoji bundled in flw, recolored through CSS `color` (replaces system emoji rendering). Not full system color — **palette highlights** on the same semantic roles as text:

| Modifier | Token | Typical use |
|---|---|---|
| `.flw-emoji--dim` / `--dark` | gray / dark-gray | resting, inactive |
| `.flw-emoji--green` | `--c-green` | clear, OK, sunny |
| `.flw-emoji--orange` | `--c-orange` | warning, storm |
| `.flw-emoji--red` | `--c-red` | critical (rare — prefer glyphs) |
| `.flw-emoji--blue` | `--c-blue` | rain, cloud, info |
| `.flw-emoji--purple` | `--c-purple` | moon, night, structural |
| `.flw-emoji--white` | `--c-white` | emphasis (full moon, peak) |
| `.flw-emoji--data-*` | data register | temperature-scale decoration |

Moon phases often ramp dark → dim → blue → purple → white. Weather: green sun, blue rain, orange storm, purple moon.

**Pictograms can carry status.** When the object has a natural pictogram, let the pictogram replace the `●` and take the status color: 🚌 green on time, orange delayed, red cancelled (plus `.flw-strike` on the time); 💤 purple for sleeping machines. The color keeps its meaning; the emoji adds what it is.

**3. Full-color emoji (selective use)** — `.flw-emoji--color` only, no palette override. Standard emoji color intact — once or twice per project as personality anchor (🪴 irrigation, 🎙️ studio). Not throughout.

The rule of thumb: terminal glyphs for function, mono emoji with palette highlights for supplementary iconography, full-color emoji for personality anchors.

**Longer copy:** `.flw-prose` inside boxes.

---

## State & Feedback

| State | Visual Treatment |
|---|---|
| Normal | Default color per token |
| Stale / disconnected | `opacity: 0.5` |
| Dim / secondary | `opacity: 0.7` |
| Active indicator | `var(--c-green)` + optional glow |
| Asleep / parked | `var(--c-purple)` — 💤, not an error |
| Cancelled | `var(--c-red)` + `.flw-strike` |
| Warning | `var(--c-orange)` |
| Error / down | `var(--c-red)` |

No state is communicated through shape change or size change. Opacity is the degradation signal.

---

## Motion

Motion is minimal and functional.

| Pattern | Spec |
|---|---|
| Spinner | Frame swap every 80ms — no CSS transition |
| Scrolling text (marquee) | `translateX` from 0 to `-50%`, linear, infinite; duration scales with text length |
| Ticker (marquee `--stepped`) | Same path in `steps()` at ~8 fps — jumps a few pixels at a time, like an LED sign. Cheaper on a Pi, more terminal |

`prefers-reduced-motion` stops spinner and marquee.

No easing curves except linear (and `steps()`). No entrance/exit animations. Motion only appears when it communicates something (activity, overflow text).

---

## Personality in practice

Lessons from the studio monitor (a 1280px kiosk on a Pi in the studio — the best flw-style UI so far). None of this is a class; it's how to use the classes.

**Pick a world.** The studio is "gaolhouse" and its machines are rodents: the server is `ratte`, the Tailscale devices are *nager in freier wildnis*, cron jobs live in the *lokales hamsterrad*, the websites are a *spider web*. Box titles name the job in the project's world, not in IT words. The data inside stays plain — hostnames, times, percentages.

**An icon pool, not an icon set.** Each box gets one gray mono emoji (`.flw-box__icon`) from a themed pool — 🐀 🌾 🦫 🐿️ 🧀 🪺 🕳️ 🪜. The same pool rotates as separators in the header ticker. Tier-2 mono, always gray: they decorate, they don't signal.

**A trivia slot.** The ticker cycles real but useless facts between build hash and clock: the date in the 1900 Excel system, the Islamic and French Revolutionary calendars, days since the last full moon. Rule: trivia must be computed and true — never filler text.

**Status through the domain.** Buses are 🚌 colored by punctuality, sleeping laptops are 💤 in purple, a cancelled departure is struck through in red. If the object has a picture, use it.

**Display-only screens.** A kiosk nobody touches needs less: no hover states, hide the cursor after a few seconds of inactivity (project JS), pin the viewport (`<meta name="viewport" content="width=1280">`), lock overflow (`.flw-kiosk`), fit everything on one screen with columns of stacks and `.flw-truncate`. Show freshness instead of interactivity: dim stale data (`.flw-stale`), print its age (`12h`, `4d`), and keep a tiny connection dot in a corner.

**Leave room for delight.** Between status views the monitor shows a gallery and a screensaver box that bounces like a DVD logo, with the hard purple offset shadow and a cycling `■ ■ ■` RGB test pattern. That's project code, not library — but it's the kind of thing flw UIs should have.

---

## Tone Summary

> **Dark. Nerdy. A little bit chaotic.** This is a UI for people who run servers in their basement and think that's completely normal. Monospace throughout, colored text for meaning, glyphs where other UIs would use icons. Built with care, worn with pride. If something looks like a design decision, it is one.

The aesthetic should feel like a well-loved `bpytop` session — technically precise, but clearly made by someone who enjoys it. Not a SaaS product. Not a design system for a startup. A handcrafted technical instrument with a distinct personality, built to run 24/7 on hardware you own.

---

## Inspirational Examples

Apart from the mentioned terminal emulators, here are some other examples of interfaces that I find inspiring. They are not meant to be copied, but rather to be used as inspiration for the design of the self-hosted projects. Less around concrete color and design choices, more around the overall feel and the mindset behind.

- https://felixdreesen.de/map
An ASCII map of the website, where each subpage/project has their own ASCII art icon.
- https://fritz-web.net/
A minimalistic and clean interface for an artist portfolio but with pleanty of easter eggs and playful sorting algorithms.
- https://of.domains/
Playful ASCII approach followed by modern terminal style simple overview.
- **studio monitor @ gaolhouse** (private, Pi kiosk)
The reference flw-style UI: three columns of boxes, a rodent-themed world, a trivia ticker, pictograms as status. See *Personality in practice*.