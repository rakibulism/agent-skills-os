# Accessibility quick reference (WCAG 2.1 AA)

Accessibility is not a layer added at the end; it's a property of correct structure. Most fixes also improve usability for everyone.

## The four principles (POUR)

- **Perceivable** — content can be perceived by sight, hearing, or touch.
- **Operable** — every action works by keyboard, not just pointer.
- **Understandable** — predictable, consistent, with clear errors.
- **Robust** — works with assistive tech (screen readers, switch devices).

## The checks that catch most issues

**Color & contrast**
- Body text: ≥ 4.5:1 against its background. Large text (≥24px, or ≥19px bold): ≥ 3:1.
- UI components and meaningful graphics (icons, focus rings, chart lines): ≥ 3:1.
- Never carry meaning in color alone — pair with text, icon, or pattern (error = red *and* an icon *and* a message).

**Keyboard**
- Everything actionable is reachable and operable with Tab/Shift-Tab/Enter/Space/arrows/Esc.
- Focus order follows reading order. No keyboard traps.
- Focus is always visible — a clear, ≥3:1 focus indicator. Never `outline: none` without a replacement.

**Touch & target size**
- Minimum target ~44×44px (iOS) / 48×48dp (Android). Space targets so neighbors aren't hit by accident.

**Semantics & screen readers**
- Use the right element: `<button>` for actions, `<a>` for navigation, real headings (`h1`→`h2`…) in order, lists for lists.
- Labels: every input has a programmatically associated `<label>`. Icon-only buttons get an accessible name (`aria-label`).
- Images: meaningful ones get `alt`; decorative ones get empty `alt=""`.
- Use ARIA only when native semantics fall short — "no ARIA is better than bad ARIA."
- Announce dynamic changes (toasts, validation, live regions) with `aria-live`.

**Forms**
- Label above or beside the field, never placeholder-as-label (it vanishes on input).
- Errors: identify the field, describe the problem in words, and keep the user's input.
- Group related controls with `<fieldset>`/`<legend>`.

**Motion & timing**
- Respect `prefers-reduced-motion`: offer a non-animated path.
- Avoid content that flashes more than 3×/second (seizure risk).
- Don't impose tight time limits; if you must, let users extend them.

**Content**
- Set the page language. Write link text that makes sense out of context ("View invoice," not "click here").
- Don't rely on sensory instructions alone ("the button on the right").

## A 90-second audit

1. Unplug the mouse. Can you do the core task? Is focus always visible?
2. Zoom to 200%. Does anything break or get cut off?
3. Run a contrast checker on text and on the focus ring.
4. Tab through and read each control's accessible name aloud — does it make sense?
