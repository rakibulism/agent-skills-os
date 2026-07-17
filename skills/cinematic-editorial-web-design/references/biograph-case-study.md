# Case Study: Biograph — a Longevity Clinic Landing Page

A fully worked example of the cinematic-editorial language applied to a real brand: Biograph, a membership-based, in-person longevity/preventive-diagnostics clinic (whole-body MRI, advanced blood panels, coronary CT, DEXA, VO2 max, genetic screening) sold as a $/year membership with physical clinic locations and clinician-led follow-up. This file demonstrates every principle in the core skill with exact, reproducible values — treat it as a template to adapt, not a Biograph-specific artifact.

## Why the brand's category drives the design

Biograph is **not** a wellness app or a DTC supplement brand — the visual language borrows from three adjacent luxury categories simultaneously: **boutique hospitality** (clinic photography reads like a 5-star hotel lobby), **precision medical/scientific imaging** (MRI scans, blood macro photography, coronary angiography stills used as literal decorative art), and **editorial journalism** (serif pull-quotes, press-logo bar, "featured in" credibility strip). The result feels simultaneously clinical (trustworthy) and expensive (aspirational) — never playful, never "startup," never clip-arty.

### The UX psychology in play

- **Fear/mortality framing balanced by immediate reassurance.** The hero opens on "Act now, live longer" over a near-black, warmly-lit architectural photo of the physical clinic at night — mortality salience paired with an image of an actual, real, expensive-looking place you could walk into. The anxiety of "what if something is wrong with me" is immediately grounded in "this is a real, serious, well-designed institution," not an app screen.
- **Authority borrowing, twice over.** First via press logos (WSJ, Forbes, Esquire, Healthline, WWD) in a quiet "Featured in" strip; second, via a wall of medical-school/hospital-system logos (Harvard Medical School, UCLA, UCSF, Cedars-Sinai, NYU, Emory, UT Southwestern) framed as "care doesn't end at Biograph." Two separate trust systems (media credibility + clinical/academic credibility) are kept visually distinct in what they claim but styled identically (grayscale logo grids), so neither competes with the other for attention.
- **Testimonials as verified identity, not anonymous praise.** Every quote is attributed to a named, high-status person (a tech-company GTM leader, a founder/CEO, an ex-Android/Xiaomi/Oculus exec) with a small headshot AND a verified-platform badge (LinkedIn or X logo + blue checkmark) next to their name — "these are real, checkable, successful people" does more persuasive work here than star ratings would.
- **Danger made concrete via literal medical imagery.** The "four pillars of chronic disease" section uses glossy, ambiguous, almost-beautiful abstract 3D orbs in blood-red and bruise-purple on near-black cards — danger rendered as visually seductive rather than clinical-scary. The assessments checklist reuses actual anonymized scan/photography thumbnails (an MRI, a DEXA x-ray, a thermal-looking blood-vessel macro) as small square icons next to each test name — literal proof-of-capability replacing generic icons.
- **Numbers presented as clinical findings, not marketing stats.** "96%," "1 in 6," "2 of 3" sit in a plain bordered white strip directly beneath a testimonial, in a large confident numeral face — framed as outcomes data immediately after a personal story, so anecdote and statistic reinforce each other in sequence.
- **Two-tier membership as a status choice, not a feature-diff table.** Exactly two options side by side: a light, understated "Core" card and a black, elevated "Black" card with its own dark abstract membership-card artwork (styled like a literal Amex Black/Centurion card). The visual escalation from light→dark IS the upsell; no discount badges, no "most popular" ribbons.
- **Location cards as real-estate/hospitality marketing**, not "our offices" — moody interior photography (a stone bowl on a wood console, a courtyard tree through glass, blurred figures in a dim corridor) sold the way a boutique hotel or private members' club would sell itself.
- **Closing CTA as an aspirational lifestyle image**, not a product shot — a lone hiker overlooking an alpine valley at golden hour, headline "Live healthier for longer" — the payoff is a life, not a service.

## Color tokens (exact)

A **bi-modal palette**: true, deep black-charcoal sections (hero, "four pillars," "our clinics," final CTA) alternate with pure white/near-white editorial sections (how it works, assessments grid, testimonials, membership, FAQ). No mid-gray "brand color" — the only hue in the entire UI chrome is a single clinical blue used exclusively for verification checkmarks; everything else is neutral. All color drama comes from photography and the custom 3D/medical artwork.

| Token | Hex | Usage |
|---|---|---|
| `--true-black` | `#010101`–`#020101` | Nav bar, hero base, deepest section backgrounds |
| `--charcoal-card` | `#111517`–`#16171A` | Dark feature-card backgrounds ("four pillars" cards, Black membership card) — never pure black, always a hair lighter so cards read as elevated surfaces against the true-black page bg |
| `--paper` | `#FFFFFF` | Default section background |
| `--surface-muted` | `#F9F9F9` | Alternate/secondary surface (Core membership card, some testimonial-strip backgrounds) — cooler and lighter than a typical warm off-white, reinforcing "clinical white" over "product cream" |
| `--ink` | ~`#1A1A1A` | Primary headline text on white |
| `--text-muted` | mid-warm-grey (~`#6B6F76`) | Body copy on white sections |
| `--text-muted-on-dark` | ~`#A8ACB0`–`#C9CCCF` | Body copy/subheads over dark photography or charcoal cards |
| `--hairline` | near-white at ~8–12% opacity | Card borders on dark cards (a faint 1px *light* stroke, not a dark one) and dashed dividers in the FAQ |
| `--verify-blue` | clinical mid-blue (~`#2F6FEE`) | Checkmarks in the membership feature lists only — the single spot-color in the entire system |

Rules: never invent a saturated brand color for buttons/links — buttons are white/off-white pills with dark text on dark backgrounds, or dark/black pills with white text on light backgrounds, always inverted-contrast, never colored. Reserve the accent color for exactly one narrow purpose (verified checkmarks); don't let it bleed into headings, links, or icons. Dark sections use full-bleed photography or near-black flat charcoal, never mid-grey — the true-black/true-white contrast is what gives the page its editorial rhythm. Custom illustrative/3D art (the disease-pillar orbs, the membership-card face art) is allowed its own saturated color specifically because it's bespoke commissioned art on a neutral card — never flat UI color.

## Typography (exact)

A **two-typeface system** — the key structural difference from a single-font hardware-object register (see `premium-restraint-web-design`).

- **Primary sans** (headings, nav, body, UI chrome — everything except pull-quotes): a rounded/humanist geometric sans (Söhne / Aeonik / Circular / General Sans family). Hero/display headline: **regular-to-medium weight** (not black/heavy — scale carries the impact, not weight), extremely large (clamp ~56px mobile → 100px+ desktop), tight leading. Section H2s: regular/medium weight, large (~48–64px), always preceded by a tiny tracked-out all-caps eyebrow label. Body copy: regular weight, muted grey, generous line-height (~1.5–1.6), centered under section headlines (card content beneath stays left-aligned — the centered-intro/left-content split, see §Layout).
- **Eyebrow/kicker labels** ("OUR METHOD," "WHAT WE MEASURE," "FEATURED IN"): ~12–13px, bold/semibold, wide tracking (~0.15–0.2em), muted grey or white depending on background — the brand's signature "editorial section marker," appearing above every major section headline with zero exceptions.
- **Secondary serif** (testimonial pull-quotes ONLY): a classic/transitional serif (Georgia / PT Serif / Tiempos / Canela family). This is the single most distinctive typographic choice on the page — the serif's presence signals "this is a real human quote/press-worthy statement" precisely because it appears nowhere else. Never use it in headings or body copy; its rarity is what gives it power.
- **Numerals/stats** (96%, 1 in 6, 2 of 3): same sans as body, large and confident (~56–64px), regular-to-medium weight, small superscript "%" — no accompanying caption (unlike a two-line stat-tile pattern); the number IS the headline in this instance.
- **UI labels** (nav items, button text, micro-labels): regular/medium, 15–16px, normal case, normal tracking.

Explicit type scale: `12 / 13 / 15 / 16 / 18 / 20 / 24 / 32 / 40 / 48 / 64 / 96`.

## Layout, grid, spacing (exact)

- Max content width ~1280–1320px, centered, wide gutters.
- Section rhythm: **true-black/photo → white → white → dark-charcoal → white → dark-photo → white → white → white → dark-photo (final CTA) → white (footer)** — dark sections are sparser than in a pure-restraint register and reserved for the emotionally heaviest beats (hero mortality framing, "danger" framing, immersive brand-world photography, final aspirational CTA). White sections carry all rational/credibility content.
- Nearly every major section follows the same **centered eyebrow + centered H2 + centered subhead + centered single button** intro before dropping into a left-to-right card row. Reproduce this rhythm section after section rather than varying alignment.
- Card grid patterns: 3-up feature cards with photography, horizontally-scrollable dark cards with nav arrows (danger/pillar section), 3-column dense checklist grid with small square thumbnail + title + caption (repeated for 15+ rows), 2-up large photography cards with bottom-left text overlay (locations), 2-up pricing cards light-vs-dark (memberships), 3-up testimonial cards in a bordered outer container with vertical hairline dividers, dense logo grids with dashed hairline cell dividers.
- Corner radii: large and consistent on photography containers and cards (~20–28px), full pill on all buttons/small badges, membership cards use a larger radius (~24–32px) commensurate with their size. Nothing sharp-cornered anywhere.
- Photography is frequently arranged in **asymmetric split-screen pairs** (50/50 or slightly uneven) rather than single hero images — reinforcing an editorial/magazine-spread feeling over a single "hero shot."
- Small circular "i" info-icons sit top-left on the dark danger/pillar cards — a subtle, clinical "more info available" affordance, not decoration.

## Component kit (build generically — reusable for other high-end service brands)

- **Nav bar**: full-bleed true-black bar (not a floating pill), wordmark left (letter-spaced, all-caps/small-caps logotype), inline text nav links with one dropdown-chevron item, "Login" text link + solid white "Join [Brand]" pill right. A secondary thin sub-nav row of anchor links sometimes sits directly beneath — a scroll-linked in-page jump bar.
- **Hero**: full-bleed dark architectural/interior photograph, large light-weight display headline bottom-left, one-line muted subhead beneath, then a horizontal strip of 2–3 quick-stat labels as plain text (not cards) directly under the fold.
- **Centered section-intro block**: eyebrow → H2 → centered subhead → single centered CTA. Reused verbatim at the top of nearly every section.
- **3-up process card**: full-bleed square-ish photo with rounded top corners, numbered bold mini-headline below the image, muted paragraph beneath.
- **Serif testimonial slide**: centered large serif quotation (literal typed quote marks), small circular headshot + bold name + muted role/company caption, centered carousel dots (one active pill-shaped dot, rest small circles) below — a single-slide-at-a-time carousel, not a grid.
- **Inline stat strip**: plain bordered white rounded rectangle split into 3 equal columns by thin vertical dividers, each column = one giant numeral (+ optional superscript unit), no caption — sits directly beneath the testimonial carousel.
- **Press/institutional logo grid**: grayscale wordmarks only (no color logos), bordered rounded container with dashed-or-solid hairline cell dividers, uneven per-logo widths (natural width, not forced equal columns).
- **Dark danger/pillar card** (horizontally scrollable): tall charcoal rounded card, small circular "i" icon top-left, large glossy 3D abstract sphere bleeding off the card's top edge, bold white mini-headline + muted grey caption near the bottom, thin near-white hairline border, left/right circular arrow nav for the row, thin progress bar beneath indicating scroll position.
- **Assessment checklist row**: small (~64–72px) rounded-square photo/scan thumbnail left, bold dark title + muted grey one-line description stacked right, repeated in a dense 3-column × many-row grid on a light card background, "See all" pill button centered beneath a truncated/fade-masked grid.
- **Location photo card**: large moody interior photograph, rounded corners, bottom-left text overlay (white bold location name + underlined "Learn more" link) directly on the photo — no separate scrim card, relies on the photo's own dark tones for legibility.
- **Membership tier card pair**: two side-by-side large rounded cards, one light one true-dark, each topped with a small square "membership card" art object unique per tier (icy blue/white abstract for the light tier, dark cosmic/nebula for the premium tier), tier name, one-line positioning subhead, full-width CTA (always inverted from its own card's background), bulleted feature list with a single accent-color checkmark, the higher tier's list headed "Everything in [lower tier], plus:" to visually reinforce the upsell.
- **Testimonial-with-verification card**: same 3-up bordered/divided pattern as the stat strip, but each cell = small circular headshot + bold name + verified-platform icon (small, beside the name) + muted role/company line + 2–3 line plain (sans, not serif) quote.
- **FAQ accordion**: no leading icons — plain question text in medium weight, thin dashed horizontal dividers, plus-icon trailing affordance, generous vertical padding per row (airier than a typical accordion).
- **Final CTA**: full-bleed aspirational lifestyle photo, large centered light-weight headline, centered muted subhead, centered single pill button — mirrors the hero's structure as a closing bookend.
- **Footer**: white background, small square dark logo mark (monogram) top-left, one-line tagline, a small row of monochrome machine-readability/brand icon chips, 4-column link layout, hairline divider, copyright + legal links row beneath.

## Imagery direction (exact)

- **Architectural/interior photography**: warm wood-slat walls lit gold against near-black ambient light, polished dark stone floors with reflections, minimal furniture — reads as a boutique hotel or Japanese-inflected wellness retreat, never a clinical waiting room. Consistently underexposed/moody rather than bright and clean.
- **Custom 3D/abstract art**: glossy, fluid, almost-liquid-metal spheres and card-face textures in saturated jewel tones (blood red, violet, ice blue, magma orange) — representing abstract danger/complexity concepts without literal gore or clip-art icons. Should look bespoke-commissioned, high production value, slightly surreal.
- **Medical/scientific macro photography**: real (or real-looking) scan stills, blood-vessel macro shots, thermal-toned tissue imagery — used as small thumbnail "proof" icons and full-bleed textures on dark cards. This is the brand's alternative to a generic icon library for anything domain-specific.
- **Lifestyle/action photography**: understated, natural-light, slightly desaturated outdoor/athletic imagery — always about a life being lived well, never a person using a phone/app.
- Every photo, regardless of category, sits inside a large-radius rounded rectangle matching the surrounding card system — never a hard-edged photo dropped straight onto a background.

## Icons (exact)

Never emoji, anywhere. Every glyph — dropdown chevrons, circular "i" info icons, FAQ plus icons, checkmarks, verified-platform marks, carousel arrows — is a clean single-weight line icon or a small monochrome brand mark, sourced from an open-source set (Phosphor Icons, Hugeicons, Remix Icon, or similar consistent-stroke library). One icon family per project, one consistent stroke weight (light, thin, ~1.5px, entirely outline-style except solid social-platform glyphs, which stay solid because they represent a specific external platform, not decoration). Icons here are almost invisible — used only where they carry real functional meaning, never as decorative flourishes next to headlines.

## Polish details that read as "human-designed"

- The recurring **eyebrow-label → headline → centered subhead → single CTA** intro block, used with total discipline at the top of every section, is the single strongest "this was art-directed" signal on the page. Do not skip it, do not vary its structure section to section.
- The deliberate **two-typeface system** (sans everywhere, serif only for testimonial pull-quotes) is a high-craft choice a templated/AI-default page almost never makes (defaults to one font everywhere). Preserve the split exactly — it does a lot of the "feels expensive" work on its own.
- Light-to-regular (never black/heavy) weight on giant display headlines, letting scale rather than boldness create impact — subtler and more confident than maxing out font-weight for drama.
- Stat numerals get no caption in the post-testimonial strip — deliberately terse, almost cryptic, trusting the surrounding testimonial content to supply context. Resist the urge to over-explain every number with a caption; bare numerals can read as more confident/credible.
- Real, named, checkably-real people (with platform verification badges) for every testimonial — never anonymous "Sarah T., New York" style quotes. If real testimonials aren't available for a new project, flag this rather than fabricating one.
- Shadows are essentially absent on white sections (hairline borders instead of elevation) and replaced by a **light-on-dark hairline border** on dark cards — an inverted-shadow language consistent with the bimodal palette.
- Motion (implied, not visible in a static reference): slow, cinematic fades/cross-dissolves between hero states and on scroll-reveal — longer and calmer than a typical SaaS site's snappy 200ms micro-interactions, closer to a luxury film's pacing. No bounce, no playful overshoot, no confetti/celebration moments.
- The two logo-credibility strips are visually near-identical in construction (grayscale wordmarks in a bordered grid) but conceptually distinct in what they prove — when building a similar page for a different vertical, look for this same "borrow authority from two separate, non-competing credibility systems" opportunity rather than relying on a single logo wall.

## How to use this file when asked to build "something like Biograph" or "in this style"

Treat every section above as a hard constraint, not inspiration:

1. Start from the two-mode color system and two-typeface system before writing any component — lock in the black/white rhythm and the sans/serif split first, since almost everything else depends on them.
2. Build the component kit generically (feature-card row, danger-card row, assessment checklist, location card, tier-pair card, verified-testimonial card, FAQ) so it's reusable for other high-end service/membership clients, not brand-specific.
3. Source or commission photography/art matching the three imagery categories (architectural/hospitality, custom 3D/abstract, understated lifestyle) — flag rather than substitute generic bright stock photography if none is available.
4. Icons only from the named open-source sets — refuse a request to add emoji or decorative icon flourishes, since restraint is core to this brand's premium-clinical positioning.
5. Never fabricate named testimonials with fake verification badges for a real client project — flag this explicitly, since the credibility mechanism depends on the people being real and checkable.
6. When in doubt about a spacing, weight, or color decision not explicitly covered here, default to the more restrained, more centered, lower-saturation option outside of the commissioned abstract art — that is always the correct guess for this taste profile.
