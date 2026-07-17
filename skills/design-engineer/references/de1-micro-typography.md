# Micro-Typography

Type systems are judged at the detail level. These rules apply automatically to any type CSS Claude writes.

## Size-Responsive Tracking

Fonts are drawn for body sizes; scale demands compensation:

| Size | letter-spacing |
|---|---|
| ≥48px display | −0.02em to −0.03em |
| 24–32px headings | −0.01em |
| 16px body | 0 |
| 12–13px captions | +0.01 to +0.025em |
| All-caps labels (any size) | +0.05 to +0.1em — caps set solid always look cramped |

Fluid version: `letter-spacing: clamp(-0.03em, calc(0.01em - 0.002 * 1vw), 0.02em)` tuned per family.

## Line Height — inverse to size

Display 1.0–1.15 · headings 1.2–1.3 · body 1.5–1.65 · captions/UI labels 1.4. Unitless values only (numbers inherit correctly; `px`/`%` line-heights are inheritance bugs waiting).

## Orphans & Widows

- Headlines: `text-wrap: balance` — equalizes line lengths, kills single-word last lines.
- Body copy: `text-wrap: pretty` — prevents orphans with minimal cost.
- Fixed marketing copy: hand-place `&nbsp;` between the final two words.
- Never let a heading break to leave one word alone; rewrite the copy if CSS can't save it.

## OpenType Features

- `font-variant-numeric: tabular-nums` — **mandatory** for timers, counters, tables, prices in columns; stops width-jitter as digits change. Lining proportional figures elsewhere in UI; `oldstyle-nums` inside long-form prose.
- `font-feature-settings: "ss01"` etc. — enable stylistic sets deliberately (check the font actually ships them); never rely on defaults differing across browsers.
- Ligatures: keep standard (`liga`) on for prose; consider off for code/inputs. Discretionary/historical (`dlig`, `hlig`) only in display settings, on purpose.
- Variable fonts with an `opsz` axis: let `font-optical-sizing: auto` work — don't lock body text to a display cut.

## Measure & Rhythm

- Body line length 45–75 characters: `max-width: 65ch` default.
- Paragraph spacing ≥ 0.75em; never both indent and space.
- Hanging punctuation for pull quotes (`hanging-punctuation` where supported, or negative text-indent).

## Review Heuristics
All-caps without tracking → fix. Big display type at default tracking → too loose, tighten. Number columns wiggling on update → tabular-nums missing. line-height in px → convert to unitless. Headline widow → balance/rewrite.
