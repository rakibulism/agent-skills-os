# Perceptual Color: OKLCH & HCT

HSL lightness lies: `hsl(60,100%,50%)` yellow and `hsl(240,100%,50%)` blue claim equal lightness, but yellow is far brighter perceptually. OKLCH (CSS-native) and HCT (Material) are perceptually uniform — equal L steps *look* equal across every hue. Design in them; export hex only as a build artifact.

## Palette Construction Procedure

1. **Pick brand hue(s)** in `oklch(L C H)`: L∈[0,1], C = chroma (0–~0.37 in sRGB gamut), H = hue angle.
2. **Lightness ramp with uniform L steps** for steps 50→900, e.g.:
   `L = 0.98, 0.93, 0.85, 0.74, 0.62, 0.51, 0.42, 0.34, 0.27, 0.21`
   Because L is perceptual, this ramp reads evenly — and identically across hues, so grays, blues, and reds at step 500 all match in weight.
3. **Chroma curve:** peak C in mid-steps (400–600), taper toward both ends. Near-white/near-black can't hold chroma; forcing it clips out of gamut (browser desaturates unpredictably). Typical: C = 0.02 at step 50, 0.14–0.20 at 500, 0.06 at 900.
4. **Intentional hue drift:** rotate H slightly across the ramp (blues drifting cyan when light, violet when dark; yellows drifting orange as they darken — pure dark yellow reads as mud). ±5–15° across the ramp makes palettes feel alive instead of tinted.
5. **Neutrals aren't gray:** give neutrals a whisper of brand chroma (C ≈ 0.005–0.015 at brand hue) — pure grays look dead beside chromatic UI.

## Dark Mode — rebuild, don't invert

- Reduce chroma **15–30%** (saturated color vibrates on dark backgrounds).
- Keep hues; re-derive surfaces so **elevation = lighter**: each raised surface gains +0.02–0.04 L.
- Text: pure white on dark halates; use L≈0.93 for primary text on dark.
- Re-verify every contrast pair — dark mode pairs don't inherit light-mode passes.

## Contrast

Verify with APCA (perceptual, preferred) or WCAG 2.x. With a uniform ramp, pairs generalize: if 700-on-50 passes for one hue, it passes for all — this is the payoff of perceptual uniformity.

## CSS Usage

```css
:root { --accent: oklch(0.62 0.19 255); }
.hero { background: linear-gradient(in oklch, var(--a), var(--b)); } /* kills RGB gray dead-zone */
```
`oklch()` is supported in all modern browsers; add hex fallbacks only for legacy targets. `color-mix(in oklch, …)` for programmatic tints/shades.

## Review Heuristics
Raw hex scattered in components → no system, flag it. Dark mode built by inverting → rebuild. Gradients banding or graying mid-way → interpolate in oklch. Steps that look uneven across hues → the ramp was built in HSL.
