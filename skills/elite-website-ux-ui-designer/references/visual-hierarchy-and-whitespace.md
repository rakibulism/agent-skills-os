# Visual Hierarchy & Whitespace

Visual hierarchy is the strategic arrangement of elements to signify importance — it controls the order information is consumed in and guides users toward primary actions without an instruction manual. Whitespace is the tool that makes hierarchy legible: without it, even a technically correct hierarchy of size/color/contrast reads as clutter.

## The three levers of hierarchy

### 1. Size & scale
- **Dominance**: bigger reads as more important, universally and immediately.
- **Proportion**: deliberate ratios between heading levels (H1/H2/H3), not arbitrary jumps — see [typography-grid-spacing.md](typography-grid-spacing.md) for the mathematical type scale this should follow.
- **Scanning**: size differences are what let a user scan a page in seconds rather than reading linearly.
- Aim for dramatic ratios, not subtle ones — a 48pt H1 against a 16pt body reads as a clear hierarchy; a 22pt H1 against 16pt body barely registers as one. Use the **Squint Test** (blur or squint at the screen) — only the intended focal point should still read clearly.

### 2. Color & contrast
Apply the 60-30-10 rule (see [color-theory.md](color-theory.md)): isolate action elements with the accent color, leverage luminance contrast (darker/lighter reads as heavier/lighter, independent of hue), and de-saturate secondary/supporting data so it doesn't compete with the primary focal point.

### 3. Placement & proximity
- **Z-Pattern**: for landing pages with minimal text — eye moves top-left → top-right → diagonal → bottom-right, which is why a logo (top-left), nav-CTA (top-right), and primary CTA (bottom-right) is such a common landing-page skeleton.
- **F-Pattern**: for text-heavy content like blogs — eye scans left-to-right along the top, then drops and scans a shorter line, then trails down the left edge — which is why the most important information in body copy belongs at the start of paragraphs and headers, not buried mid-paragraph.
- **Whitespace**: isolating an element from its neighbors is itself a placement signal — see the whitespace section below.

## Guiding the eye: the funnel mechanics

1. **The Hook (Contrast)** — high color contrast or a large visual element captures attention in the first instant.
2. **The Context (Grid)** — structured grid alignment lets the eye smoothly scan supporting information in a predictable direction.
3. **The Action (Whitespace)** — isolating the final action button with generous whitespace eliminates competing distractions and prompts the click.

## Above-the-fold rules

- **Hook** — the H1 states the value proposition instantly, no scrolling required to understand what the page is for.
- **Action** — the primary CTA is visible without scrolling.
- **Trust** — a badge, logo strip, or testimonial fragment is visible early, before skepticism has a chance to set in.
- **Clarity** — the background stays clean; nothing competes with the hook/action/trust triad.

```
┌─────────────────────────────────────────┐
│  Logo                          Nav  CTA  │
├─────────────────────────────────────────┤
│                                           │
│         HERO HEADLINE (H1)               │
│         Sub-headline supporting copy      │
│                                           │
│         [ Primary CTA Button ]            │
│                                           │
│         ★★★★★ "Trusted by..." badge       │
│                                           │
├─────────────────────────────────────────┤ ← THE FOLD
```

## Hooking users in the 5-second scan window

- **Hero Section Clarity**: H1 + subhead + CTA all visible and legible above the fold, no exceptions.
- **Eliminate Cognitive Load**: no competing pop-ups, modals, or cookie banners fighting for attention in that first 5 seconds.
- **Instant Value Delivery**: the H1 states the value explicitly ("Cut invoicing time in half") rather than in vague, jargon-heavy branding language ("Empowering Financial Synergy").

## The 4-step hierarchy audit process

1. **Audit content** — identify the top 3 goals of the page; if there are more than 3, something needs to be cut or deferred to a secondary page.
2. **Assign weight** — deliberately map size/color/placement to each goal's priority rank, not by default/whatever-fits-the-space.
3. **Test contrast** — run an actual WCAG contrast checker, don't eyeball it.
4. **Remove friction** — anything that doesn't serve one of the top 3 goals gets demoted or removed, not left "just in case."

## Whitespace, specifically

### Macro vs. micro
- **Macro whitespace**: large spaces between major layout sections (margins, section gaps) — dictates overall layout rhythm.
- **Micro whitespace**: small spaces between letters, lines, or list items — directly impacts readability; increasing micro whitespace has been shown to improve reading comprehension by as much as 20%.

### Active vs. passive
- **Active whitespace**: deliberately placed to isolate and emphasize a specific element.
- **Passive whitespace**: leftover default space with no intentional design purpose — this is "empty space," not "whitespace," and it's the difference between a layout that feels designed and one that feels unfinished in a different way.

### Psychological benefits
- **Reducing cognitive load** — fewer competing signals per unit of screen.
- **Enhancing legibility** — see the 20% comprehension figure above.
- **Establishing visual hierarchy** — whitespace is itself a hierarchy signal, not just a gap between other signals.

### Maximizing CTA impact — the Law of Proximity
The **Law of Proximity** (a Gestalt principle): elements placed close together are perceived as related, and isolated elements are perceived as distinct/important. Isolating a CTA within roughly a 50–100px radius from any competing element measurably draws attention to it — a CTA crowded by nearby links, secondary buttons, or dense text gets read as "one option among many" instead of "the action."

```
Overcrowded:                    Isolated (recommended):
[Link] [Link] [CTA] [Link]      
[Text][Text][Text][Text]                [ CTA ]
                                 
                                 [Text][Text][Text]
```

### Whitespace implementation checklist
- **Audit clutter** — remove elements that don't serve one of the page's top 3 goals.
- **Set padding standards** — use the 8-point spacing scale (8/16/24/32px), not arbitrary values.
- **Optimize text spacing** — line-height 1.5–1.8 for body copy.
- **Define target margins** — 60–80px of isolating space around primary CTAs.
- **Limit competing elements** — one CTA per viewport/screen, not several fighting for the same click.

## Applying this

When a layout "feels cluttered" but every individual element seems justified, the problem is almost always insufficient whitespace around the *intended* focal point, not too many elements per se. Run the Squint Test first — if more than one thing stays sharp, either add isolating whitespace around the true priority or demote/remove whatever's competing with it.
