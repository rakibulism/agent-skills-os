---
name: design-token-architect
description: Design or audit a design token system — color, spacing, typography, radii, shadows, motion — with semantic naming and theme support. Produces a token hierarchy with primitive, semantic, and component layers. Use when the user is starting a design system, restructuring tokens, adding dark mode, or auditing existing tokens for inconsistency.
version: 0.1.0
tags: [design-system, tokens, theming, css-variables]
inputs:
  - name: scope
    description: What you're building — full system from scratch, dark mode addition, audit of existing tokens, etc.
    required: true
  - name: existing_tokens
    description: Current token names/values if any (CSS variables, JSON, Figma styles).
    required: false
  - name: themes
    description: Themes to support — light, dark, high-contrast, brand variations.
    required: false
---

# Design Token Architect

A token system is a contract between design and code. Done well, themes swap, accessibility improves, and engineers never hand-pick a hex code. Done poorly, every component reinvents its own colors.

## The three layers

Always design tokens in layers. Mixing them creates the inconsistency you're trying to prevent.

### 1. Primitive (raw values)
The actual values. **Do not reference these in component code.**

```
color.blue.50 → #EBF2FF
color.blue.500 → #2563EB
color.gray.900 → #0F172A
space.4 → 16px
radius.md → 8px
```

Naming: descriptive, not semantic. `blue.500`, not `primary`. These never change meaning across themes.

### 2. Semantic (purpose)
Map purposes to primitives. **This is what component code references.**

```
color.text.primary → color.gray.900   (light) | color.gray.50 (dark)
color.text.muted → color.gray.500     (light) | color.gray.400 (dark)
color.surface.base → color.white      (light) | color.gray.900 (dark)
color.surface.subtle → color.gray.50  (light) | color.gray.800 (dark)
color.border.default → color.gray.200 (light) | color.gray.700 (dark)
color.action.primary → color.blue.600 (light) | color.blue.500 (dark)
color.feedback.error → color.red.600  (light) | color.red.400 (dark)
```

Naming reflects job, not appearance. `color.action.primary`, not `color.blue`.

### 3. Component (optional, escape hatch)
Component-specific overrides when semantic isn't enough.

```
button.primary.background → color.action.primary
button.primary.background.hover → color.action.primary.hover
input.border.invalid → color.feedback.error.border
```

Use sparingly. Most components should consume semantic tokens directly.

## Naming conventions

- **Use a category prefix:** `color.`, `space.`, `radius.`, `shadow.`, `motion.`, `font.`.
- **Don't encode the value in the name.** `color.brand` not `color.purple-9b87f5`. The value can change; the role can't.
- **Avoid t-shirt sizes where a scale is meaningful.** `space.4` (16px) is clearer than `space.md` because scale math is preserved.
- **State suffixes:** `.hover`, `.active`, `.focus`, `.disabled`. Append to the same token: `color.action.primary.hover`.
- **Density modifiers:** `.subtle`, `.muted`, `.strong`, `.bold` — not `.light`, `.dark` (which conflict with theme names).

## What tokens to include

**Always:**
- Color (text, surface, border, action, feedback × hover/active/disabled per role)
- Spacing scale (4/8/12/16/20/24/32/40/48/64; or 4-base; or 8-base)
- Radius (none, sm, md, lg, full)
- Typography (font family × size × weight × line-height stack)
- Shadows (xs, sm, md, lg, xl + inner)
- Motion duration (fast, base, slow) and easing (out, in-out)
- Z-index (base, dropdown, sticky, modal, toast)

**Often skipped but valuable:**
- Border width (hairline, default, thick)
- Opacity stops (overlay, disabled, scrim)
- Focus ring (color, width, offset)
- Text decoration (link, underline-offset, underline-thickness)

## Theme support

- Define primitives once. Define semantic tokens per theme.
- Use CSS custom properties so themes swap by changing the `:root` (or a class) — not by recompiling.
- **Don't theme primitives.** `color.blue.500` is the same blue in any theme; the *role* it plays may change.
- **Test contrast in every theme.** A semantic mapping that works in light may fail WCAG in dark.

```css
:root {
  --color-text-primary: var(--color-gray-900);
}
:root[data-theme="dark"] {
  --color-text-primary: var(--color-gray-50);
}
```

## Output format

```
## Token Architecture

### Primitives
<table or code block: name → value>

### Semantic (per theme)
| Token | Light | Dark | Purpose |
|---|---|---|---|
| color.text.primary | gray.900 | gray.50 | Default text |
| ... |

### Component overrides (if any)
<sparingly used>

## File structure
<how this lives in the codebase — CSS variables, Tailwind config, JSON, Style Dictionary>

## Migration plan (if auditing existing)
- <step-by-step from current to target with no visual regressions>

## Open questions
- <gaps where design input is needed>
```

## What to avoid

- **Skipping the semantic layer.** Components referencing `color.blue.500` directly means you can never theme without find-and-replace.
- **One-off tokens.** `color.checkout-page-banner-bg` is not a design token; it's a variable hiding in a token system.
- **Too many primitives.** A 12-step gray scale is plenty. 24 steps means nobody knows which to use.
- **Naming by hex.** `color.f5f5f5` is the same as inline hex but more annoying.
- **Forgetting state tokens.** Half a system is colors with no hover/active — every component reinvents the shift.
