---
name: color-grading
description: Correct and grade video color — balance exposure and white balance first, then build a look. Produces a node/layer-by-layer grade plan with scope targets, a stated mood, and shot-matching notes. Use when the user asks to color correct, grade footage, fix white balance, match shots, create a look or LUT, or make video "look cinematic."
version: 0.1.0
tags: [video, color, grading, color-correction, post-production]
inputs:
  - name: footage
    description: What you're grading — camera/codec, whether it's log or rec.709, lighting conditions, and the problem (too flat, mixed white balance, mismatched shots).
    required: true
  - name: look
    description: The mood or reference — "warm nostalgic," "cold thriller," "natural doc," or a film/still to emulate.
    required: false
  - name: deliverable
    description: Where it ends up — Rec.709 web, HDR, broadcast, theatrical — which sets the target and limits.
    required: false
---

# Color Grading

Two jobs, in order, never reversed: **correct** (make it technically right and consistent) then **grade** (give it a look). A beautiful look on top of an uncorrected, mismatched timeline falls apart the moment shots cut together.

## Trust the scopes, not your eyes

Your monitor and your eyes adapt and lie. Read the scopes:

- **Waveform** — exposure and contrast. Blacks should sit near 0 (but not crushed below), highlights near 100 IRE (but not clipped) unless the look calls for otherwise.
- **Parade (RGB waveform)** — white balance. Neutral whites/grays have R, G, B aligned. If blue rides high in the shadows, you have a cool cast.
- **Vectorscope** — hue and saturation. Skin tones fall along the **skin-tone line** (the I-line, ~11 o'clock). If skin drifts off it, fix it — audiences forgive anything except wrong skin.

## Order of operations

1. **Set exposure** — get the overall brightness right (lift/gamma/gain or offset). Anchor mid-tones.
2. **Balance white** — remove color casts so neutrals are neutral. Use the parade and a known-gray reference.
3. **Recover contrast** — set black point and white point. For log/flat footage, this is where it comes alive.
4. **Secondary / targeted fixes** — qualify and adjust specific elements (skin, sky, a jacket) with masks/qualifiers and power windows. Track them if the shot moves.
5. **Build the look** — now, and only now, push toward mood (see below).
6. **Match shots** — make every shot in a scene feel like the same time and place.

## Log and LUTs

- **Log footage** (S-Log, V-Log, Log-C) looks flat and gray by design — it preserves dynamic range. Don't grade it raw; either apply a **conversion LUT** to Rec.709 as a starting point or do a manual conversion, *then* grade.
- **Apply technical/conversion LUTs early** (input transform) and **creative LUTs late** (look). Grade your correction *under* the creative LUT so the LUT receives well-balanced input — LUTs amplify whatever you feed them.
- A LUT is a starting point, not a grade. Always adjust after.

## Building a look

State the mood in words first, then translate it:

- **Warm / nostalgic** — push gain warm, lift slightly warm, gentle highlight roll-off, lower contrast, slightly lifted blacks (a "film" milkiness).
- **Cold / tense** — cool shadows, desaturated, harder contrast, crushed-ish blacks.
- **Teal-and-orange** — warm skin/highlights against cool shadows. Effective but clichéd; use restraint and protect skin.
- **High-key / clean** — bright, low contrast, soft, airy. Lifestyle, beauty, tech.
- **Low-key / moody** — deep shadows, selective light, rich saturation in the highlights only.

Levers: **lift** (shadows), **gamma** (mids), **gain** (highlights) for tonal range; **hue vs hue / hue vs sat** curves for surgical color; **saturation and contrast** for overall punch. Move shadows and highlights in *opposite* hue directions for cinematic color contrast.

## Shot matching

When shots in a scene don't match:

1. Pick the **hero shot** (best-lit, most correct) as the reference.
2. Match every other shot's scopes to it — exposure first, then white balance, then saturation.
3. Compare with a **split-screen / shot-match** view, focusing on skin and neutral surfaces.
4. Check the cut **in motion**, not just on stills — perceived match changes with movement.

## Protect the image

- **Don't over-saturate.** Clipped saturation looks cheap and can break broadcast/codec limits.
- **Watch for banding** in skies and gradients — heavy grading on 8-bit footage reveals it. Add subtle grain if needed.
- **Stay legal** for the deliverable — broadcast often caps at 100 IRE / specific gamuts. Web Rec.709 is more forgiving but still respect 0–100.
- **Keep skin believable.** Everything else is negotiable.

## Output format

```
## Grade plan: <scene/shot> → <look name>

Deliverable: <Rec.709 / HDR / broadcast>   Source: <log? codec? bit depth?>

### Correction (per shot)
- Exposure: <waveform target>
- White balance: <parade fix>
- Contrast: <black/white points>

### Look (nodes/layers, in order)
1. <node> — <adjustment> — <scope target>
...

### Shot matching
- Hero shot: <which>  → <what each other shot needs>

### Cautions
- <banding / saturation / legality / skin risks>
```

Name the **mood in plain words** before any numbers, and flag where footage limits (bit depth, clipping, codec) will cap how far the look can go.
