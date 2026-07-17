# Typography, Grid & Spacing Systems

Typography bridges visual appeal and functional readability; grid and spacing systems provide the invisible mathematical framework that keeps a layout consistent and legible at any scale. All three are decided together, not independently — a type scale that ignores the spacing grid produces layouts that never quite align.

## Typography

### Choosing typefaces
- **Serif** (tradition/authority) — Times New Roman, Garamond.
- **Sans-serif** (modern, most common for UI) — Inter, Roboto.
- **Monospace** (technical contexts) — Fira Code, SF Mono.

Legibility checklist: distinct shapes for easily-confused characters (I / l / 1), a tall x-height, and at least 4 weights available (Regular, Medium, Semi-Bold, Bold) so hierarchy can be built with weight, not just size.

### Type scale (a mathematical ratio, not arbitrary sizes)
Pick one ratio and derive every size from it — arbitrary per-element font sizes are the single most common source of a typographic system that "feels off" without anyone being able to say why.

- **1.200 (Minor Third)** — compact, dense UIs like dashboards.
- **1.250 (Major Third)** — the industry-standard default.
- **1.414 (Augmented Fourth)** — dramatic, for marketing headlines that need to command attention.

Example scale at a 16px base, 1.25 ratio:
| Level | Size |
|---|---|
| H1 | 48.83px |
| H2 | 39.06px |
| H3 | 31.25px |
| H4 | 25.00px |
| Body | 16.00px |
| Caption | 12.80px |

### Line height (leading)
- **The 150% rule for body text**: 140%–160% (1.4–1.6). A 16px font gets a 24px line height.
- **Inverse for headings**: 110%–125% — large type needs tighter leading or it reads as loose/disconnected lines rather than one heading.

### Letter spacing (tracking)
- **Heading compression**: −1% to −2% for large headlines — large glyphs have visually "looser" natural spacing that tight tracking corrects.
- **Small-text expansion**: +5% to +10% for captions and all-caps labels — small/all-caps text needs *more* space to stay legible, the opposite correction from headings.

### Quick reference
| Element | Size | Line-height | Tracking |
|---|---|---|---|
| Headings | Mathematical scale | 110–125% | −0.02em |
| Body text | 16–18px | 140–160% | normal |
| Captions/UI | 12–14px | 130% | +0.05em |

## Grid systems

### Responsive grid breakpoints
- **12-column desktop grid** (≥1024px): 12 columns, 11 gutters, 2 margins. 12 is divisible by 2, 3, 4, and 6 — that's the entire reason it's the default: it lets 2-column, 3-column, 4-column, and 6-column layouts all share one grid without remainder math. Max-width container typically 1200–1440px.
- **8-column tablet grid** (600–1023px) — a structural bridge, not just a scaled-down desktop grid.
- **4-column mobile grid** (<600px): 4 columns, 3 gutters, 2 margins.

Grid anatomy: **columns** (content areas), **gutters** (space between columns), **margins** (space at the container edges).

## The 8-point spacing system

Use multiples of 8 for every spacing value: 8, 16, 24, 32, 40, 48, 56, 64...

**Why 8, specifically**: it scales cleanly at 1.5× and 2× zoom (common browser zoom levels) without producing sub-pixel values; it gives designers and developers a shared, unambiguous vocabulary ("use md spacing" beats "use 17px, no wait, 18px"); and it maps directly onto most icon grids and component libraries, which are themselves built on 8px multiples.

- **Hard Grid**: every spacing value is strictly a multiple of 8 — most predictable, least flexible.
- **Soft Grid** (recommended default): 8-point multiples for structural spacing (margins, section gaps), with the 4-point exception below available for compact components.
- **4-point exception**: for ultra-compact components (icons, tags, dense data tables) where an 8px minimum would look bloated, drop to 4px multiples.

### Visual rhythm, by spacing scale
| Spacing | Use |
|---|---|
| 4 / 8px | Internal component spacing (icon-to-label, tight groups) |
| 16px | Content grouping (related items within a card) |
| 24 / 32px | Component isolation (separating unrelated cards/sections) |
| 48 / 64px | Section-level macro spacing (separating major page sections) |

### Reference table, by viewport
| Viewport | Gutter | Margin |
|---|---|---|
| Desktop | 24–32px | 64px |
| Tablet | 16–24px | 32px |
| Mobile | 16px | 16–24px |

All component heights should be multiples of 8px — a 44px touch target rounds awkwardly against an 8-point grid; use 48px instead, which satisfies both the spacing system and (see the accessibility reference) minimum touch-target guidance.

## Applying this

Before adjusting a single spacing or font-size value ad hoc, check whether it maps to the established scale (type ratio, 8-point spacing). If it doesn't, that's usually a sign the *scale* needs a new step, not that this one instance should be the exception — exceptions compound into the inconsistency the design-systems audit later has to clean up.
