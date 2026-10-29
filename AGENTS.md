# AGENTS.md — building UIs with flw

This file is the operational contract for AI agents generating HTML/CSS for Fritz's personal DIY self-hosted projects. Read this before writing UI code. For deeper visual rationale, see [STYLE_GUIDE.md](STYLE_GUIDE.md).

## Mindset

You are building a **handcrafted technical instrument**, not a SaaS product.

- Terminal-native: monospace, thin borders, glyph icons, semantic color
- Dark, nerdy, a little chaotic — CCC energy, not startup polish
- Color communicates **state**, not decoration
- Hierarchy via weight and color before size
- Playful touches are welcome but intentional (one personality emoji, not emoji everywhere)

## Always use flw

1. Link `flw.css` (from `dist/` or npm/git dependency) — **includes bundled fonts**
2. Optionally link `flw.js` and call `flw.auto()` for spinners, tabs, accordion, marquee, progress bars
3. Prefer **flw classes** over ad-hoc CSS
4. **Do not** add Google Fonts links — Space Mono + Noto Emoji ship inside `dist/fonts/`

```html
<link rel="stylesheet" href="path/to/flw.css" />
<script src="path/to/flw.js"></script>
<script>flw.auto()</script>
```

Before inventing a new pattern, check [examples/overview.html](examples/overview.html).

## Composition recipe

```
.flw-page
  └── .flw-page__header (optional title)
  └── .flw-grid / .flw-stack
        └── .flw-box (one job per box)
              └── .flw-stat-rows / .flw-cluster / forms / progress
```

When a page grows beyond ~3 peer boxes, use `.flw-accordion` or `.flw-tabs` instead of endless scrolling stacks.

## Layout rules

1. **Box is the unit of containment.** Primary chrome is `.flw-box`. Don't invent cards.
2. **One job per box.** Title names the job; content is only that concern.
3. **Spacing only from the scale.** Use `--space-1`…`--space-4` or `.flw-gap-*` / `.flw-p-*`.
4. **Density default: compact.** 8px inside boxes; 12px between sections.
5. **Rows before columns for data.** Use `.flw-stat-row` for key/value. Grids place boxes, not every field.
6. **Controls in clusters.** `.flw-cluster` or `.flw-stack` — no floating SaaS toolbars.
7. **Hierarchy without size.** Bold + color before larger type. One hero reading max.
8. **Full-bleed page, inset content.** Only `.flw-page` provides outer padding.
9. **Collapse with accordion/tabs** for control panels (VMs, irrigation zones, logs).
10. **No decorative layout.** Remove wrappers that don't structure content.

## Do

- Use `.flw-text-green` / `.flw-text-red` / `.flw-text-orange` for status
- Use `.flw-dot--up` / `.flw-dot--down` for inline state
- Use `.flw-btn--primary` for affirmative actions, `.flw-btn--danger` for destructive
- Use `.flw-toggle` for on/off controls
- Use `.flw-slider` for discrete choices with more than two options (levels, durations, modes)
- Use `.flw-range` + `data-flw-range` for continuous numeric values (0–100 px, gain, opacity)
- Use terminal glyphs first: `█ ░ ● ○ ▶ ▼`
- Use `.flw-sep` between metadata tokens
- Use `.flw-stale` / `.flw-dim` for degraded/secondary content
- Add `data-flw-*` attributes and call `flw.auto()` for interactive widgets

## Don't

- No border-radius on containers (50% only for `.flw-led` and the `.flw-range` knob)
- No elevation shadows on panels (glow only on LEDs; hard purple offset for rare splash)
- No gradients on backgrounds
- No Inter/Roboto/system-ui as primary font
- No purple-on-white SaaS aesthetic
- No card grids used purely for decoration
- No entrance/exit animations; accordion opens instantly
- No pill buttons, no Material tabs, no floating action buttons

## Icon tiers

1. **Terminal glyphs** (function) — always preferred: `● ○ █ ░ ▶ ▼`
2. **Mono emoji** via `.flw-emoji` + palette color — Noto Emoji recolored through CSS (overrides system emoji). Use semantic highlights, not full system color:

| Role | Class | Example use |
|---|---|---|
| Resting / inactive | `.flw-emoji--dim` or `--dark` | partly cloudy, background |
| OK / clear / healthy | `.flw-emoji--green` | ☀ sunny, valve open |
| Warning / storm | `.flw-emoji--orange` | ⛈ elevated |
| Error / critical | `.flw-emoji--red` | rare on emoji — prefer glyphs |
| Info / rain / cloud | `.flw-emoji--blue` | 🌧 ☁ metadata weather |
| Night / moon / structural | `.flw-emoji--purple` | 🌙 waxing moon |
| Emphasis | `.flw-emoji--white` | 🌕 full moon peak |
| Data scale (not status) | `.flw-emoji--data-cold` etc. | cold-night 🌙 |

Moon phase example:

```html
<span class="flw-emoji flw-emoji--dark">🌑</span>
<span class="flw-emoji flw-emoji--dim">🌒</span>
<span class="flw-emoji flw-emoji--blue">🌓</span>
<span class="flw-emoji flw-emoji--purple">🌔</span>
<span class="flw-emoji flw-emoji--white">🌕</span>
```

You can also combine `.flw-emoji` with `.flw-text-green` etc. — same effect.

3. **Full-color emoji** (once or twice per project — personality anchor only):

```html
<span class="flw-emoji--color" aria-hidden="true">🪴</span>
```

No `.flw-emoji--*` color class on tier 3 — let system/Noto color show.

## Longer text

Use `.flw-prose` inside boxes for notes, logs, or short explanations. Stay at base or `.flw-sm` size; use `<strong>` + semantic colors for emphasis — not larger headings.

## Forms & controls

```html
<button type="button" class="flw-btn flw-btn--primary">start</button>
<button type="button" class="flw-btn flw-btn--danger">stop</button>

<label class="flw-toggle">
  <input class="flw-toggle__input" type="checkbox" />
  <span class="flw-toggle__switch"></span>
  <span class="flw-toggle__label">zone-a</span>
</label>

<!-- > 2 options: one .flw-slider__step per option, shared radio name -->
<div class="flw-slider" role="radiogroup" aria-label="fan">
  <span class="flw-slider__label">fan</span>
  <label class="flw-slider__step">
    <input class="flw-slider__input" type="radio" name="fan" value="off" />
    <span class="flw-slider__knob"></span>
    <span class="flw-slider__value">off</span>
  </label>
  <label class="flw-slider__step">
    <input class="flw-slider__input" type="radio" name="fan" value="low" checked />
    <span class="flw-slider__knob"></span>
    <span class="flw-slider__value">low</span>
  </label>
  <label class="flw-slider__step">
    <input class="flw-slider__input" type="radio" name="fan" value="high" />
    <span class="flw-slider__knob"></span>
    <span class="flw-slider__value">high</span>
  </label>
</div>

<!-- continuous value: step sets resolution, readout synced by flw.js -->
<div class="flw-range" data-flw-range>
  <label class="flw-range__label" for="offset">offset</label>
  <input class="flw-range__input" id="offset" type="range" min="0" max="100" step="1" value="42" />
  <span class="flw-range__readout"><output class="flw-range__value" for="offset">42</output><span class="flw-range__unit">px</span></span>
</div>

<div class="flw-field">
  <label class="flw-field__label" for="x">label</label>
  <input class="flw-input" id="x" type="text" />
</div>
```

## Motion

Allowed: Braille spinner (80ms), marquee scroll (linear), screensaver-style transforms in project code.

Not allowed: easing curves, fade-in modals, hover scale, animated accordion height.

## When to extend the library vs project CSS

| Extend flw | Keep in project |
|---|---|
| Reusable component used in 2+ projects | One-off ASCII art header |
| Missing primitive (e.g. new form control) | Domain-specific data viz |
| Bug in shared pattern | Kiosk viewport lock for a specific display |

If extending flw, match existing naming (`.flw-*`), spacing scale, and border language. Update `overview.html`.

## Starter skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>project name</title>
  <link rel="stylesheet" href="flw.css" />
</head>
<body>
  <main class="flw-page">
    <header class="flw-page__header">
      <h1 class="flw-page__title">project name</h1>
    </header>
    <div class="flw-grid flw-cols-2">
      <div class="flw-box">
        <div class="flw-box__title">
          <span class="flw-box__title-text">status</span>
        </div>
        <div class="flw-box__content">
          <div class="flw-stat-rows">
            <div class="flw-stat-row">
              <span class="flw-stat-row__label">state</span>
              <span class="flw-stat-row__value flw-text-green">ok</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <script src="flw.js"></script>
  <script>flw.auto()</script>
</body>
</html>
```

## Verify

After CSS changes: `npm run build` → open `examples/overview.html` → confirm visually.
