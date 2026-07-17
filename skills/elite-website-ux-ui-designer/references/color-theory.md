# Intentional Color Theory: The 60-30-10 Rule

Limit a UI palette to 2–3 colors, distribute them by the interior-design-derived 60-30-10 rule, and enforce accessibility contrast strictly. Intentional limitation isn't a stylistic constraint for its own sake — it reduces cognitive load, strengthens brand identity, and makes the palette trivially scalable to new screens because there are only ever 3 roles to assign, never an open-ended choice.

## The 60-30-10 breakdown

- **60% Dominant Neutral** — backgrounds and canvas. Whites, charcoals, grays, creams. This is the color the eye rests on; it should never compete for attention.
- **30% Secondary** — text, cards, sidebars, borders. High contrast against the dominant color, and where brand identity color typically lives (navy, slate).
- **10% Accent** — CTAs, notifications, active states. Highly saturated, reserved *only* for things the user should act on. An accent used anywhere else loses its power — see "Accent Bleed" below.

## Worked examples

- **Light-mode dashboard**: white (60%) / charcoal (30%) / electric blue (10%).
- **Dark-mode mobile app**: obsidian (60%) / steel blue (30%) / laser yellow (10%).

## Why the eye actually goes to the accent color — the Von Restorff Effect

The **Von Restorff Effect** (Isolation Effect): the item that differs from surrounding similar items is noticed and remembered first. An accent color registers as a visual "anomaly" against 90% of the screen being neutral/secondary tones, triggering an almost involuntary ocular reflex toward it. This is *why* the 10% ceiling matters — the effect depends on scarcity. Two accent-colored elements on screen split the anomaly signal; five accent-colored elements eliminate it entirely, because nothing stands out from a screen that's mostly "standing out."

## WCAG 2.2 contrast standards

| Level | Normal text | Large text | Typical use |
|---|---|---|---|
| AA (minimum) | 4.5:1 | 3:1 | Standard applications |
| AAA (enhanced) | 7:1 | 4.5:1 | High-accessibility / government / medical |

Large text = 18pt (24px)+ regular weight, or 14pt (18.66px)+ bold.

## Color-blindness safety

Never rely on color alone to convey meaning — pair every color-coded state with an icon, text label, or underline. A red/green error/success distinction is invisible to a meaningful fraction of users with color vision deficiency if color is the *only* signal.

## Step-by-step palette construction

1. **Establish the canvas (60%)** — pick the dominant neutral first; everything else is chosen relative to it.
2. **Select the reading/structure tone (30%)** — check it passes 4.5:1 contrast against the canvas before finalizing.
3. **Inject the action color (10%)** — check its contrast against both the canvas and any text placed on it.
4. **Audit the layout** — walk the finished screen and confirm the accent color never exceeds roughly 10% of visual area; if it does, something that isn't a primary action is wearing the accent color and needs to be demoted to secondary.

## Golden rules

- **Avoid accent bleed**: never use the accent color on body copy or decorative elements — overexposure trains the user's eye to ignore it, which is the opposite of its purpose.
- **Pass WCAG contrast**: the accent color, wherever it carries text, must still hit 4.5:1 — a vibrant accent that fails contrast is unusable regardless of how good it looks in a mockup.
- **The Squint Test**: squint at the screen (or blur it) — the only thing that should still read clearly is the primary action. If several elements remain equally visible, the hierarchy (color, not just size) has failed.

## Applying this

Before adding a new color to a design, name its role first — is it the 60% canvas, the 30% structural tone, or the 10% action signal? A color that doesn't obviously fit one of the three roles usually shouldn't be in the palette at all.
