# Development Empathy

Development empathy means understanding the technical environment a design will be built in, so the result is visually striking, functional, *and* realistically codeable — a design that ignores implementation reality isn't a finished design, it's a wish that development will have to negotiate down later.

## Core pillars

### HTML
- **Semantic structure** — the document should describe *what things are* (heading, nav, article, button), not just how they look.
- **The DOM as a tree of nested boxes** — every layout decision ultimately becomes a nested-box structure; a design that doesn't map cleanly onto that model (overlapping elements with no clear parent/child relationship) is harder to build than it looks in a mockup.
- **Accessibility impact** — semantic HTML is also the foundation accessibility tooling depends on (see [accessibility.md](accessibility.md)); a design decision that requires abandoning semantic tags for div soup costs accessibility, not just development time.

### CSS
- **Box model** — every element is content + padding + border + margin; spacing decisions (see [typography-grid-spacing.md](typography-grid-spacing.md)) need to specify which of these four they mean, or a developer will guess.
- **Layout engines** — Flexbox (one-dimensional: a row or a column) vs. CSS Grid (two-dimensional: rows and columns together). Know which one a given layout actually needs before handoff; asking for Grid-shaped behavior described as if it were Flexbox creates real implementation friction.
- **Inheritance & cascade** — some properties (font, color) inherit down the DOM tree by default; others don't. A design system's tokens should account for this rather than over-specifying every property on every element.
- **States** — `:hover`, `:focus`, `:active`, `:disabled` are not optional extras; every interactive element needs all four states designed, not just its default appearance.

### Modern web constraints
- **Responsive fluidity** — relative units (`%`, `vw`, `vh`, `rem`, `em`) instead of fixed pixel values wherever a layout needs to adapt across viewports.
- **Performance budgets** — every asset (image, font, script) has a real download/render cost; a design that assumes unlimited asset weight will either get built slow or get quietly re-scoped by development without designer input.
- **Cross-browser discrepancies** — Blink (Chrome/Edge), WebKit (Safari), and Gecko (Firefox) don't render every CSS feature identically; a design that depends on a bleeding-edge CSS feature needs a documented fallback, not a silent assumption that "the browser will handle it."

## Design artifacts that make handoff faster

- **Component-driven architecture** — design in the same reusable units development will build in (see [design-systems.md](design-systems.md)'s Atomic Design breakdown), not as one-off flat compositions.
- **Tokenized styling** — hand off design tokens (color, spacing, type scale values), not just visual references — see [design-systems.md](design-systems.md).
- **Responsive breakpoint specs** — show how a layout actually reflows at each breakpoint, not just the desktop and mobile endpoints with everything in between left to guesswork.
- **Extreme content states** — design for empty states (no data yet), overflow (a name/title longer than the mockup's placeholder text), and translation expansion (some languages take 30%+ more horizontal space than English) — these are exactly the cases a flat mockup never shows and a real build always hits.

## Business benefits

- **Zero-waste delivery** — designs that don't need to be re-negotiated mid-build because they weren't codeable as specified.
- **Reduced feedback loops** — fewer "can we actually build this?" round-trips between design and engineering.
- **Faster time to market** — the natural result of the first two.

## Handoff checklist

Grid/spacing alignment to the system, contrast ratios pre-verified, optimized SVG icons (not raster exports), all interactive states (hover/focus/active/error) specified, and layout behavior verified at a genuinely wide viewport (design for content stretching to ~2500px on ultra-wide monitors, not just the 1440px mockup frame).

## Applying this

Before finalizing a layout, ask whether it maps cleanly onto a nested-box DOM structure, whether every interactive element's four states are specified, and whether extreme content (empty, overflow, translated) has been considered — not as a final QA pass, but as part of the same decision that chose the layout in the first place.
