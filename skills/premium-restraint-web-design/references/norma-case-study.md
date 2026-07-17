# Case Study: Norma — a Screen-Time Device Landing Page

A fully worked example of the premium-restraint language applied to a real product: Norma, a physical screen-time-blocking device — a machined stainless-steel disc you tap your iPhone against to instantly block a preset group of apps (an NFC-trigger "one scan to lock in, one scan to release" mechanic), sold direct-to-consumer as a single €90 hardware SKU alongside a companion iOS/Mac app. This file demonstrates every principle in the core skill with exact, reproducible values — treat it as a template to adapt, not a Norma-specific artifact.

## Why the positioning drives every visual decision

Everything about this design is downstream of one idea: **this is a serious, adult, almost luxury object — not a wellness app with a cute mascot.** The visual cues borrow from premium consumer-hardware marketing (Apple, Teenage Engineering, Aesop, Rams-era industrial design) rather than SaaS/startup landing-page conventions: no bright gradients, no mascots, no playful bounce, no emoji, no rounded "friendly" illustration style. The tone is quiet, confident, a little cold, materially honest.

### The UX psychology in play

- **Dark/light section alternation as information architecture.** Sections alternate dark-moody ("problem": glowing phone screens, cramped stat numbers) and light-airy ("solution": generously-spaced product photography) — a rhythm that mirrors the product's promise (put the phone down, get the calm back) closely enough that the page is skimmable by background value alone.
- **Object fetishism / material honesty.** The product is shot like a watch or Braun/Vitsœ furniture — macro close-ups on the machined disc edge, on a coffee table next to a leather journal, next to a cat. This borrows credibility from adjacent luxury-lifestyle categories rather than arguing "this app is good for you" directly.
- **Loss-aversion framing via data.** "220 phone checks a day," "23 minutes to refocus," "14 years of your life" — huge glass-morphism stat tiles floating over a dark macro photo. Big authoritative numbers over an ambiguous blurred backdrop read as "researched fact," not marketing copy, even though the visual design (not a citation) is doing the persuading.
- **Monochrome competitive comparison, not color-coded.** Norma's own column renders in near-black with white checks; competitors stay on white with grey ✕ marks. Ink-density (not color, not shame-icons) signals "we win" while keeping the page's palette intact — no red X's, no green checks. Restraint is the persuasion device even in the one section built to make a competitive argument.
- **Quiet social proof.** A 5.0 review score and three one-line testimonials sit in a plain white card on a plain grey section — no reviewer photos, no logo-carousel. Stated once, not hyped.
- **Progressive disclosure in the FAQ** — accordion, one row open at a time, plus-icon affordance, respecting scan behavior instead of forcing a copy wall.
- **One repeated CTA form** — `Order — 90 €` black pill with a trailing arrow, at every major decision point (hero, mid-page, sticky dark banner, footer), same visual weight every time, so the eye already knows what it's looking for by the third occurrence.

## Color tokens (exact)

Base palette is almost achromatic — photography supplies the only real color (warm wood, green velvet, terracotta), which makes product photography read as richer by contrast.

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#0A0A0A` | Primary headline text, primary button backgrounds, comparison-table "hero" column bg |
| `--ink-2` | `#111111` | Near-black secondary surface (table header column, dark image overlays) |
| `--paper` | `#FFFFFF` | Default page background |
| `--surface-muted` | `#F5F5F5` | Alternating section background — the page's "breathing" rhythm, used roughly every other section |
| `--text-muted` | `#6B6F76` (approx, mid-warm-grey) | Body copy on white/muted surfaces |
| `--text-muted-on-dark` | `#9AA0A6`–`#C7CACD` | Body copy over dark hero/photo sections, always lower-contrast than the white headline above it |
| `--border-hairline` | `#E5E5E5`–`#EAEAEA` | 1px card borders, table row dividers, FAQ dividers |
| `--pill-dark-glass` | `rgba(20,20,20,0.55)` over photo | Hero eyebrow pill, glass stat cards over dark photography |

Rules: never introduce a saturated brand color — every UI chrome element is black/white/grey, color only from photography. Buttons are binary (solid `--ink` pill / white-glass hairline pill), nothing in between. Dark sections use photography as the actual background (not a flat fill) with a soft black gradient/vignette at top and bottom so text stays legible. Glass stat cards over photography: semi-transparent near-black (~45–60% opacity), no border, soft radius, blurred backdrop (`backdrop-filter: blur(20px)`-equivalent) so the photo still reads through.

## Typography (exact)

A rounded-terminal geometric grotesk — single-story "a," high x-height, slightly squarish counters (General Sans / Aeonik / Switzer / PP Neue Montreal family; not Inter/system-ui, which read too neutral/corporate). One typeface for the whole site, headings and body alike.

- **Display/H1** (hero headline): extra bold/black (800–900), tight leading (~0.95–1.0), clamp ~48px mobile → 96–110px desktop, sentence case, black text on the hero photo.
- **H2** (section headlines): bold (700–800), noticeably smaller than H1 (~40–56px desktop), always ends with a hard period as a stylistic tic — keep it.
- **Body/paragraph**: regular/medium (400–500), medium grey, generous line-height (~1.5–1.6), max-width constrained to ~55–65 characters per line even in a wide section — body copy never spans a full-width container.
- **Numerals/stats**: same display weight as H1, sized ~56–72px, always paired directly beneath with a small regular-weight caption in muted grey — a strict two-line stat-tile pattern, reused everywhere numbers appear.
- **UI chrome text** (nav links, button labels, badges): medium/semibold, small (14–16px), never uppercase, tracking stays near 0.
- **Micro-labels** (numbered step badges, table headers, testimonial names): small (13–14px), muted grey, sometimes inside a thin-bordered circle.

Explicit type scale, no in-between sizes: `13 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56 / 72 / 96`.

## Layout, grid, spacing (exact)

- Max content width ~1200–1280px, centered, wide outer gutters — never edge-to-edge except full-bleed photography banners.
- Section rhythm: **white → grey → white → dark photo → white → grey → dark photo → white → …** Never two dark-photo sections back to back, never more than two flat-grey sections in a row. This alternation is load-bearing for the calm/anxious pacing.
- Corner radii, large and consistent: **~20–28px** on cards/panels, **full pill (9999px)** on every button and badge, **~16–20px** on photography containers. Nothing sharp-cornered; if it's a container, it's a big rounded rectangle or a full pill — three radius values total, applied without exception.
- Card padding generous and consistent: ~40–56px internal on feature cards, ~32px on smaller stat tiles.
- Grid patterns: 3-column card grids (step cards, journal side-list), 2-column split panels (image + copy, alternating left/right), a horizontally-scrollable card row with prev/next arrow controls, a data-table grid with one column visually inverted to black as the "hero" column.
- Section headline + one-line subhead is always top-left aligned, never centered — centered text appears nowhere except tiny badges/labels.

## Component kit (build these generically — reusable across any premium-object product)

- **Nav bar**: pill-shaped translucent dark bar over the hero photo — wordmark left, inline text links + small leading icons center, locale switcher + solid black "Order — price" pill right. A floating rounded pill, not a full-width bar.
- **Primary button**: black pill, white semibold label, optional trailing arrow (→). Height ~48–56px, horizontal padding ~28–32px.
- **Secondary button**: white/translucent pill, hairline border, black label, no icon — paired next to a primary button for lower-emphasis actions.
- **Feature card** (2-col): grey `#F5F5F5` rounded panel, headline + paragraph + CTA stacked left, photography filling the right half at the same corner radius, edge-to-edge inside the shared outer container.
- **Numbered step card**: hairline-bordered white rounded panel, small numeral in a thin circle badge, bold mini-headline, one-line grey caption. Three in a row, equal width.
- **Phone/app mockup frame**: literal device chrome (status bar, notch/dynamic island) inside a rounded rectangle whenever showing companion-app UI — never a bare screenshot.
- **Stat tile (glass)**: semi-opaque near-black rounded panel, big numeral + small caption, floated over a full-bleed dark photo, usually 2–4 tiles arranged asymmetrically.
- **Comparison table**: plain white outer rounded card; header row = brand icon + name per column; one column (the product) has a full-height black fill header-to-footer; body rows use check (✓), cross (✕, muted grey), tilde (~ partial), em-dash (— n/a), or plain text (price/material); hairline row dividers.
- **Testimonial block**: grey section, big rating (★★★★★ 5.0 (15)) + headline + "See all reviews" pill top-left, single white rounded card split into 3 equal cells by hairline dividers — each cell: 5 stars, 1–3 line quote, name in muted grey, no avatar photos.
- **Horizontal scroll gallery**: equal-width rounded photo cards, each with a dark-glass pill badge bottom-left over the photo (e.g. "Deep work · 7 apps"), prev/next circular arrow buttons top-right of the section header.
- **FAQ accordion**: single bordered rounded outer container, each row = leading outline icon + question (medium/bold) + trailing plus icon, hairline divider between rows, only one row expanded at a time.
- **Journal/blog list**: one big feature article (image + tag pill + read-time pill + headline + excerpt + "Read →") paired with a compact right-hand list of smaller rows (thumbnail + category pill + date + headline).
- **Footer**: plain white, 4-column link layout (Explore/Product/Company/Contact) beside a brand column (wordmark, one-line tagline, email-capture input + black "Join" pill, locale switcher), hairline divider, copyright + legal row beneath. A small floating "Get 5% off" pill badge anchored bottom-left, persistent.

## Imagery direction (exact)

- Lifestyle photography: desaturated, cool-toned, overcast-daylight interiors — concrete, linen, brushed steel, dark wood, olive-green velvet, houseplants. Never bright, saturated, "sunny lifestyle blog."
- Product macro shots: hard directional studio light on brushed/machined steel so the material itself provides visual interest — no added color, no printed graphics on the product.
- Dark "problem" sections use moody, almost-black photography with a single warm/cool highlight (a phone glow, a polished tray) so stat tiles have a naturally darker zone to sit on.
- Every photo — lifestyle or macro — is corner-radius'd to match its container; nothing is a hard-edged rectangle photo dropped straight onto white.

## Icons (exact)

Never emoji, anywhere. Every glyph (FAQ leading icons, nav icons, table checks/crosses, numbered-step badges) is a clean single-weight line icon, sourced from an open-source set: Phosphor Icons, Hugeicons, Remix Icon, or another consistent-stroke open-source library. One icon family per project, one consistent stroke weight (this reference uses a light/regular ~1.5px stroke, never filled/solid except the star ratings, which are solid black stars). Icons are small and quiet (16–20px) — punctuation, not decoration. Never mix icon families within one page.

## Polish details that read as "human-designed"

- Consistent, restrained corner-radius language everywhere — inconsistent radii between components is the #1 tell of an AI-generated layout; this reference uses maybe 3 radius values total, applied with total discipline.
- Section headlines almost always end in a hard period, even mid-sentence fragments ("How it works.") — a deliberate, slightly blunt editorial voice.
- Numbers are always exact and oddly specific (23 minutes, 220 checks, 14.0 years, 270 g, 70 mm) instead of round marketing numbers — specificity reads as honesty/engineering credibility. When writing placeholder copy in this register, always prefer a precise-looking number over a round one.
- Whitespace is the primary premium signal — err toward more vertical space between sections (roughly 120–160px) rather than less.
- Every image container, card, and button shares the same handful of corner-radius and shadow tokens — build those as design tokens first, before touching a single section, so the whole page inherits consistency automatically rather than being eyeballed section by section.
- Shadows are extremely soft and low-opacity — barely-there elevation on white cards (e.g. `0 1px 2px rgba(0,0,0,0.04)`, `0 8px 24px rgba(0,0,0,0.06)`) — never a hard drop shadow, never a colored shadow.
- Motion (implied by the brand's restraint, not directly visible in a static reference): short, low-amplitude transitions only — fades and small (8–12px) slide/translate-ins on scroll, ~300–400ms ease-out. No bounce, no spring overshoot, no parallax gimmicks — the brand's motion personality is as quiet as its palette.

## How to use this file when asked to build "something like Norma" or "in this style"

Treat every section above as a hard constraint, not inspiration:

1. Start from the color/type/spacing/radius tokens (above) before writing any component.
2. Build the component kit generically — these patterns are reusable across any hardware/premium-object product, not Norma-specific.
3. Source or commission photography matching the imagery direction — never fall back to generic bright stock photos; if no photography direction is given for a new project, ask for it rather than substituting a colorful placeholder.
4. Icons only from the named open-source sets — flag and refuse a request to add emoji to this style of UI, since it directly contradicts the brand's premium-restraint positioning.
5. When in doubt about a spacing, radius, or weight decision not explicitly covered here, default to the more restrained, more spacious, lower-contrast option — that is always the correct guess for this taste profile.
