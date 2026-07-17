# Grid Systems & Spacing Logic

Spacing is the invisible system that makes interfaces read as designed. Every gap is a hierarchy statement.

## The Spacing Table

Use a geometric-ish scale, never arbitrary values:
```
4 → 8 → 12 → 16 → 24 → 32 → 48 → 64 → 96 → 128
```
Jump ratios (~1.5×) create *visible* hierarchy; linear scales (8,16,24,32,40…) read as monotone sludge. Every margin/padding/gap in the product comes from this table — a value like 27px is a bug. Tokenize: `--space-1: 4px … --space-10: 128px`.

## Spacing IS Grouping (Gestalt proximity)

Space *within* a group must be visibly smaller than space *between* groups — **at least one full scale step, ideally two**. Label-to-input: 8. Field-to-field: 24. Section-to-section: 64–96. Most "cluttered" UIs are spacing-hierarchy failures, not density problems: everything sits at 16px so nothing groups. Diagnose clutter by mapping the gaps first.

## Grids

- **12-column fluid grid** as the default for marketing/product pages: `grid-template-columns: repeat(12, 1fr)` with a gutter from the scale.
- **Asymmetry creates tension:** 5/7 and 4/8 splits, off-center heroes, one element deliberately crossing a column line. Break the grid **once or twice per view, on purpose** — never accidentally. A perfectly symmetric page is safe and forgettable; a randomly broken one is amateur.
- Content max-width: 1200–1440px shell, 65ch for text columns inside it.

## Fluid Layout

`clamp(min, preferred, max)` for anything that should breathe continuously instead of snapping:
```css
font-size: clamp(2.5rem, 1.5rem + 4vw, 6rem);      /* hero type */
padding-block: clamp(3rem, 8vw, 8rem);               /* section padding */
```
Breakpoints for structural reflows only (column count changes); clamp for everything scalar.

## Nested Radius Math

Inner radius = outer radius − padding. Card radius 16, image inset 8 → image radius 8. Concentric corners are a subconscious quality signal; violating this reads instantly as sloppy. Token pairs: `--radius-outer`, `--radius-inner: calc(var(--radius-outer) - var(--pad))`.

## Review Heuristics
Off-scale values (10px, 18px, 27px) → snap to scale. Uniform 16px everywhere → rebuild gap hierarchy. Section boundaries unclear → double the between-group step. Rounded card with sharp inner media → fix concentric radii. Everything centered and symmetric → introduce one deliberate asymmetry.
