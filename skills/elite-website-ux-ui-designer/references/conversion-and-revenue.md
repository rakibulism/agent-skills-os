# Conversion & Revenue Integration

UX merges with business metrics the moment a design decision is evaluated by its effect on checkout conversion, average order value, or retention — not just by whether it looks clean. Every page should have exactly one primary goal; competing objectives dilute focus and measurably hurt the metric that matters.

## Core principles

- **Funnel Mapping** — know exactly which step of the user's path this page/screen represents, and design it to move users to the *next* step, not to be a self-contained destination.
- **KPI Alignment** — the design decision and the business metric it's meant to move should be named together, not inferred after the fact.
- **Behavioral Economics** — real psychological principles (below) determine what actually converts, not designer intuition about persuasion.
- **Friction Reduction** — every extra field, click, or decision point between a user's intent and completing it is a chance to lose them.

## The single-goal page framework

### The psychology
- **Hick's Law**: more choices increase decision time — every additional competing link or CTA measurably slows the user down and increases the chance they leave without deciding at all.
- **Cognitive load**: hold to a strict ratio — as close to 1:1 as possible between links on a page and the actual conversion goal. A page with 15 nav links and one "Buy Now" button is fighting itself.

### CTA placement
- **Above the fold** — visible without scrolling.
- **F-shaped pattern** — align with how users actually scan text-heavy pages (see [visual-hierarchy-and-whitespace.md](visual-hierarchy-and-whitespace.md)).
- **Footer back-up** — repeat the CTA at the natural end of the page for users who scrolled through everything before deciding.

### Action-oriented copy
- **First-person verbs**: "Get," "Start," "Claim" — active, not passive.
- **Value vs. effort framing**: state what the user gets, not what they have to do.
- **Urgency words**: "Now," "Today" — used honestly, not as manufactured false scarcity.

### Visual contrast for the CTA
Run the **Squint Test** (see [visual-hierarchy-and-whitespace.md](visual-hierarchy-and-whitespace.md)), use a complementary/unique accent color reserved for this button alone (see [color-theory.md](color-theory.md)'s 60-30-10 rule), and surround it with generous whitespace.

### Secondary actions
De-emphasize as plain/ghost buttons — visually subordinate, never competing with the primary CTA. On dedicated landing pages, consider removing nav/footer links entirely so there is *only* the primary path forward.

## Checkout conversion optimization

- **Guest checkout** — don't force account creation before purchase; every mandatory step before the payment form is a drop-off point.
- **Smart form fields** — auto-fill and real-time validation, so errors surface immediately rather than after a failed submit.
- **Progress indicators** — show the user how many steps remain, so the process feels bounded rather than open-ended.
- **Conversion amplifiers**: one-click ordering for returning users, visual urgency/scarcity (used honestly), trust anchors (security badges, guarantees) placed near the payment button specifically — proximity to the moment of highest hesitation matters.

## Retention & lifetime value (LTV)

- **Time-to-Value (TTV)** — get the user to their first "aha" moment as fast as possible; a long TTV is a silent churn driver.
- **Progressive disclosure** — introduce advanced features gradually, not all at once during onboarding.
- **Gamified milestones** — visible progress toward a goal increases completion rates.
- **In-context upselling** — offer upgrades at the moment their value is obvious (e.g., hitting a plan limit), not as a generic banner.
- **Frictionless subscriptions** — easy to upgrade, and just as easy to manage/downgrade — a subscription that's hard to cancel damages trust even among users who never intend to cancel.
- **Predictive re-engagement** — reach out based on actual usage-drop signals, not a fixed calendar schedule.

## Above-the-fold optimization

### Core objectives
Capture attention within roughly 3 seconds, communicate value, drive action, reduce bounce.

### Key components
Headline, subheadline, CTA — all visible pre-scroll, no exceptions.

### Mobile-first constraints
Common failure modes: the "False Bottom" (a large hero image pushes the CTA below what looks like the end of the page), intrusive interstitials/pop-ups, oversized hero images that push everything else down. Fixes: stack content vertically, shrink header padding on mobile, use a visual scroll cue (like a subtle down-arrow) so users know there's more below.

### Technical best practices
- Optimize Core Web Vitals — **LCP (Largest Contentful Paint) < 2.5s** is the target; a beautiful hero that takes 6 seconds to paint has already lost a meaningful fraction of visitors.
- Prioritize critical CSS (above-the-fold styles load first), defer non-critical scripts.
- Use WebP/AVIF for hero images — smaller payload at equivalent visual quality vs. JPEG/PNG.

### Summary checklist
Headline under 8 words, visible within 2 seconds of page load; CTA at minimum 48×48px (satisfies both accessibility touch-target and the 8-point spacing grid — see [typography-grid-spacing.md](typography-grid-spacing.md) and [accessibility.md](accessibility.md)); layout tested across real device sizes, not just desktop-and-one-mobile-breakpoint; cookie/consent banners that don't block the hero content.

## Measurement

Track Conversion Rate, Average Order Value (AOV), Customer Lifetime Value (LTV), and Churn Rate as the core metric set. Validate changes with A/B testing, multivariate testing, and heatmapping/session recording (see [data-driven-objectivity.md](data-driven-objectivity.md) for the full experimentation framework) — never ship a conversion-motivated redesign without a plan to measure whether it actually moved the number it was meant to move.

## Applying this

Before adding an element to a page, ask what it costs the primary goal — every additional link, form field, or competing CTA is a real (if small) tax on the conversion this page exists to drive. If an element can't justify its cost against that one goal, it belongs on a different page.
