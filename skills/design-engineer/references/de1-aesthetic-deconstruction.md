# Aesthetic Deconstruction

The skill of looking at any premium interaction and naming the exact ingredients. Output is always a concrete spec — values, not adjectives.

## The Deconstruction Checklist

Work through all six; name concrete values for each:

**1. Timing & easing.** Does motion overshoot (spring / bezier with y>1)? Ease out hard? The signature premium curve is expo-out: `cubic-bezier(0.16, 1, 0.3, 1)`. Enters ease-out, exits ease-in. Durations: 150–250ms micro-interactions, 300–500ms structural (panels, modals), 600–900ms hero reveals. Anything animating at default `ease`/`linear` reads unfinished — premium sites never do.

**2. Stagger.** List/grid items rarely animate together. Measure per-item delay (typically 30–80ms), total stagger cap (~400ms regardless of count), and whether the stagger origin follows the interaction point (radiates from the clicked card).

**3. Shadows — always layered.** One box-shadow reads flat/2012. The premium pattern is 2–5 layers with roughly doubling blurs:
```css
box-shadow:
  0 1px 2px rgba(0,0,0,.24),    /* tight contact */
  0 4px 8px rgba(0,0,0,.12),
  0 16px 32px rgba(0,0,0,.08);  /* soft ambient */
```
Note colored shadows (shadow tinted with the element's hue) and the hairline trick: semi-transparent 1px border + soft shadow instead of shadow alone.

**4. Gradients & overlays.** Identify: scrims (transparent→black over imagery for text legibility, usually 40–70% at the text edge), noise/grain overlays (2–5% opacity — kills banding, adds texture), 1px inner top highlight on dark UI (`inset 0 1px 0 rgba(255,255,255,.08)`) faking physical lighting, and mesh/radial ambient glows behind heroes.

**5. Radii & borders.** Measure actual radii; check concentric nesting (inner = outer − padding); note squircle-feel (large radius relative to element ≈ superellipse look).

**6. Type system.** Pairing pattern (grotesque display + humanist body, or mono accents), weights in use (premium sites use few — often just 400/500/700), tracking behavior on display sizes, whether numbers are tabular.

## Output Format

1. **Token table:** colors (OKLCH), radii, shadow stacks, easing curves, durations, stagger values.
2. **Signature-moves paragraph:** the 2–3 techniques doing most of the work (e.g., "expo-out everything at 500ms + grain overlay + colored layered shadows is 80% of this site's feel").
3. **Implementation notes:** which pieces are CSS vs. JS-driven vs. WebGL (defer to de3/de4/de5 skills for those).

## Sampling Techniques
Screen-record the interaction, scrub frame-by-frame to read durations and overshoot. DevTools → inspect computed transition/animation values when possible. For canvas/WebGL effects, identify the technique class (noise warp? SDF blob? particle field?) rather than guessing pixel values.
