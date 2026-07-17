# Optical vs. Mathematical Alignment

Mathematical centering is frequently wrong to the human eye. The eye perceives *visual mass*, not bounding boxes. Correct for it deliberately.

## The Core Nudges

- **Play triangle in a circular button:** the triangle's visual centroid sits left of its bounding-box center. Shift right by ~4–8% of container width. 48px button → nudge 2–3px right. 96px → 4–6px.
- **Any asymmetric icon (arrows, chevrons, hearts):** find the shape's centroid, not its box. Chevrons pointing right nudge left slightly; back-arrows nudge right.
- **Icon beside text:** align the icon to the text's x-height optical band, not the line-box center — usually a 1–2px downward nudge for 16px text.
- **Circles/diamonds beside squares:** round and pointed shapes must *overshoot* shared edges to appear equal (typographic overshoot principle: "O" is drawn taller than "H"). Scale circles ~2–4% larger than "equal" squares; let circle edges cross alignment lines by 1–2px.
- **All-caps / lining-figure text in buttons and badges:** no descenders → mathematically centered caps sit visually low. Nudge up 1px (2px above 20px font size).
- **Text next to heavier elements:** dense/bold neighbors pull perceived center toward them; add ~2–4px compensating space on the heavy side.

## Method

1. Center mathematically first (flexbox/grid).
2. Squint or blur (screenshot + Gaussian blur 4px) — imbalance shows immediately when detail disappears.
3. Nudge in 1px steps until the *mass* balances.
4. **Encode the nudge as a token or comment** (`--optical-nudge-x: 2px; /* triangle centroid compensation */`) — never leave it looking like a hack someone will "fix".

## Implementation Patterns

```css
.play-button svg { transform: translateX(4%); }        /* centroid fix */
.badge span      { transform: translateY(-1px); }      /* caps sit low */
.icon-row svg    { margin-top: 1px; }                  /* x-height band */
```

## Review Heuristic
If a layout is mathematically perfect and still bothers the eye, the eye is right. Diagnose by visual mass: which side is heavier? Nudge against it. Then document why.
