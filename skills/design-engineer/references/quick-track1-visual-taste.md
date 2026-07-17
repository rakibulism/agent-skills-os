# Track 1: The Designer's Vision

Train the eye before the hand. This skill encodes the rules that make interfaces read as *designed* rather than assembled. Apply these rules automatically whenever producing UI code, design tokens, or critique.

## 1. Optical vs. Mathematical Alignment

Mathematical centering is frequently wrong to the human eye. Correct for optical weight:

- **Play triangles in circular buttons:** shift the triangle right by ~4–8% of the container width (the visual centroid of a triangle sits left of its bounding-box center). For a 48px button, nudge ~2–3px right.
- **Icons vs. text baselines:** icons next to text should align to the text's x-height optical band, not the line-box center. Usually a 1–2px downward nudge.
- **Circles and diamonds next to squares:** round/pointed shapes must overshoot the shared alignment edge slightly (like typographic overshoot on "O" vs "H") to appear equal in size. Scale circles ~2–4% larger than squares of "equal" size.
- **Vertical centering of all-caps or lining text:** all-caps text has no descenders, so mathematically centered caps look low. Nudge up 1px in buttons/badges.
- **Rule:** when something is mathematically centered and still looks off, trust the eye — then encode the nudge as a deliberate token (`--optical-nudge: 1px`), never a random hack.

## 2. Perceptual Color: OKLCH First

Abandon raw hex/HSL for palette design. HSL lightness lies — `hsl(60,100%,50%)` yellow and `hsl(240,100%,50%)` blue claim equal lightness but yellow is far brighter perceptually. OKLCH fixes this.

**Palette construction procedure:**
1. Pick brand hue(s) in OKLCH: `oklch(L C H)` where L∈[0,1], C is chroma, H is hue angle.
2. Build a lightness ramp with **uniform L steps** (e.g., L = 0.98, 0.93, 0.85, 0.74, 0.62, 0.51, 0.42, 0.34, 0.27, 0.21 for steps 50→900). Because OKLCH L is perceptual, equal steps look equal — across every hue.
3. **Chroma curve:** peak chroma in the mid-steps (400–600), taper toward both ends. Near-white and near-black can't hold chroma; forcing it causes gamut clipping.
4. **Hue drift:** allow small intentional hue rotation across the ramp (e.g., blues drifting slightly cyan when light, slightly violet when dark) — this is what makes palettes feel alive vs. flat tints.
5. **Dark mode:** don't invert. Rebuild the ramp: reduce chroma ~15–30% (saturated colors vibrate on dark), keep the same hues, and re-derive surface steps so that elevation = lighter (surfaces gain L as they rise, +0.02–0.04 L per level).
6. **Contrast:** verify text pairs with APCA or WCAG. With a uniform OKLCH ramp, contrast pairs generalize: if step-700-on-step-50 passes for one hue, it passes for all.

CSS: use `oklch()` directly (supported in all modern browsers) with hex fallbacks only if legacy targets demand it. Gradients: prefer `linear-gradient(in oklch, …)` to kill the gray dead-zone of RGB interpolation.

## 3. Micro-Typography

- **Size-responsive tracking:** large display type needs tighter tracking; small text needs looser. Practical curve: `letter-spacing ≈ -0.02em` at 48px+, `-0.01em` at 24–32px, `0` at 16px, `+0.01–0.025em` at 12–13px, `+0.05em+` for all-caps labels at any size.
- **All-caps always gets tracking** (+0.05 to +0.1em) — caps set solid look cramped.
- **Line height inversely scales with size:** display 1.0–1.15, headings 1.2–1.3, body 1.5–1.65, captions 1.4.
- **Orphans/widows:** prevent single-word last lines in headlines with `text-wrap: balance`; body copy with `text-wrap: pretty`. In fixed copy, hand-insert `&nbsp;` between the final two words.
- **OpenType features:** `font-variant-numeric: tabular-nums` for any column of numbers, timers, or counters (stops layout jitter as digits change); `oldstyle-nums` for numbers inside running prose; enable `ss0X` stylistic sets deliberately, never accidentally. Check `font-feature-settings` support in the actual font file before promising a feature.
- **Optical sizes:** if the family ships an optical axis (`opsz`), let it work — don't lock body text to a display cut.
- **Measure:** body text 45–75 characters per line (`max-width: 65ch` is a safe default).

## 4. Spacing Scales & Grid Logic

- **Use a geometric-ish spacing table, not arbitrary values:** `4 → 8 → 12 → 16 → 24 → 32 → 48 → 64 → 96 → 128`. Every margin/padding/gap in the product comes from this table. The jump ratios (~1.5×) create visible hierarchy; linear scales (8,16,24,32,40…) read as monotone.
- **Spacing communicates grouping (Gestalt proximity):** space *within* a group must be visibly smaller than space *between* groups — at least one full scale step, ideally two. Most "cluttered" UIs are spacing-hierarchy failures, not density failures.
- **Grids:** 12-column fluid grid as default for marketing/product pages; but know when to break it — asymmetric splits (5/7, 4/8) and deliberately off-grid pull-elements create tension that symmetric grids can't. Break the grid on purpose, once or twice per view, never accidentally.
- **Fluid type/space:** `clamp(min, preferred-vw-based, max)` for hero type and section padding so layouts breathe continuously instead of snapping at breakpoints.
- **Border radius system:** radii nest — inner radius = outer radius − padding. A card with 16px radius containing an image inset by 8px gives the image 8px radius. Violating this reads instantly as sloppy.

## 5. Aesthetic Deconstruction (Reverse-Engineering Premium UI)

When asked "how did they do this?" or when setting direction from a reference, produce an exact spec, never vibes:

**Deconstruction checklist — name concrete values for each:**
1. **Timing:** duration(s) and easing. Sample the motion: does it overshoot (spring/`cubic-bezier` with y>1), ease-out hard (`cubic-bezier(0.16,1,0.3,1)` — the "expo-out" feel most premium sites use), or symmetric? Enter animations ease-out; exits ease-in; durations 150–250ms micro, 300–500ms structural, 600–900ms hero.
2. **Stagger:** list items rarely animate together — measure the per-item delay (typically 30–80ms) and whether the stagger origin follows the interaction point.
3. **Shadows:** premium shadows are **layered** — e.g., a tight dark contact shadow (`0 1px 2px rgba(0,0,0,.24)`) plus a large soft ambient (`0 8px 24px rgba(0,0,0,.12)`), often 3–5 layers with roughly doubling blur radii. One single box-shadow reads as flat/2012.
4. **Gradients & overlays:** identify scrims (transparent-to-black overlays on imagery for text legibility), noise/grain overlays (2–5% opacity, kills banding), and subtle 1px inner highlights (`inset 0 1px 0 rgba(255,255,255,.08)`) that fake physical lighting on dark UI.
5. **Radii + borders:** measure radii, check for the hairline border trick (semi-transparent 1px border + shadow instead of shadow alone).
6. **Type system:** identify the font pairing pattern (grotesque display + humanist body, or mono accents), weights used, and tracking behavior.

Output format for a deconstruction: a token table (colors, radii, shadows, easings, durations) + a prose paragraph naming the 2–3 signature moves that produce the feel.

## Critique Mode

When reviewing a screen, order findings by visual severity: (1) hierarchy/spacing failures, (2) color-system violations, (3) alignment/optical issues, (4) typography micro-issues, (5) motion defaults. For each finding give the fix as an exact value change, e.g., "increase section gap 24→48 (skip a scale step) to separate pricing from FAQ."
