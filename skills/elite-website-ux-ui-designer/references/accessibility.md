# Accessibility-First Design

Accessibility-first means building for users with disabilities from the start of a design decision, not patching it in during a pre-launch audit. Contrast ratios, touch target sizes, and keyboard operability are decided at the same time as color and layout — not bolted on afterward, because retrofitting almost always means undoing a decision that was made without the constraint in mind.

## 1. Font readability & typography

- Use relative units (`rem`/`em`), with a minimum base of 16px.
- Text must be able to resize to 400% without breaking the layout — this is a WCAG requirement, not a nice-to-have.
- Contrast: 4.5:1 for normal text, 3:1 for large text (see [color-theory.md](color-theory.md) for the full WCAG contrast table).
- Use accessible sans-serif fonts (Calibri, Arial, Open Sans) — avoid decorative typefaces for body copy.
- Never rely on color alone to convey meaning; always underline links so they're distinguishable without color perception.
- Line height ≥1.5× font size; paragraph spacing ≥2× font size; left-align body text (avoid justified text, which creates uneven word-spacing "rivers" that are harder to track for users with dyslexia or low vision).

## 2. Motor constraints

- Touch targets ≥44×44 CSS px, with generous spacing between adjacent targets — a target below this size is measurably harder to hit accurately for users with motor impairments (and for anyone using a phone one-handed).
- Full keyboard operability for every interactive element — nothing should require a mouse.
- Visible `:focus` rings on every focusable element, in a logical tab order that matches the visual reading order.
- A "Skip to Main Content" link as the first focusable element on the page, so keyboard users don't have to tab through an entire nav bar on every single page load.

## 3. Assistive technology integration

- Use semantic HTML (`<button>`, `<header>`, `<nav>`, `<main>`) instead of generic `<div>`s with click handlers — screen readers rely on semantic meaning, not visual appearance, to announce what an element is and does.
- Exactly one `<h1>` per page, with properly nested heading levels below it (no skipping from `<h2>` to `<h4>`).
- **ARIA** — use only when native HTML genuinely lacks the needed behavior; native semantic HTML should always be the first choice, since incorrect ARIA is worse than no ARIA. Common correct uses: `aria-label` (accessible name when there's no visible text), `aria-expanded` (state of a collapsible element), `aria-live` (announce dynamic content changes to screen readers without requiring focus to move there).
- Alt text for every meaningful image; `alt=""` (empty, not omitted) for purely decorative images, so screen readers skip them instead of reading a meaningless filename.

## Implementation checklist

| Check | Requirement |
|---|---|
| Text resizing | Scales to 400% without breaking layout |
| Contrast | WCAG AA minimum (4.5:1 normal, 3:1 large) |
| Keyboard | Every action is keyboard-operable |
| Touch targets | ≥44×44px with adequate spacing |
| Form inputs | Every input has an associated, visible label |
| Images | Meaningful images have alt text; decorative images have `alt=""` |

## Applying this

When reviewing a design, don't ask "does this pass an accessibility audit" as a final gate — ask, at the moment a color, touch-target size, or interaction pattern is chosen, "does this already satisfy the checklist above?" A design built accessibility-first rarely fails an audit; a design retrofitted for accessibility usually needs to unwind several earlier decisions (a color pair that fails contrast, a custom `<div>` button that needs an ARIA rebuild) that would have been free to get right the first time.
