# Animation & Micro-Interactions

Motion earns its place through a specific anatomy — trigger, rule, feedback, and (where relevant) loops/modes. Motion without a named trigger or purpose is noise, and a page where "everything moves" is functionally identical to a page where nothing does, because there's no longer any signal to distinguish.

## The four-part anatomy

1. **Trigger** — what starts it (hover, click, scroll into view, state change).
2. **Rules** — how it behaves (duration, easing, what properties change).
3. **Feedback** — what it communicates to the user (this action registered, this is loading, this is now active).
4. **Loops & modes** — does it repeat, and under what condition does it stop.

## Common use cases

- **Button hovers & press states** — background color shift, elevation shadow, subtle scale reduction (~2%) on press, to simulate physical depression.
- **Active input highlights** — border color change, floating label animation on focus.
- **Progress/loading indicators** — spinner → progress bar → checkmark, a state sequence rather than one static loading icon throughout.
- **Interactive toggle switches** — a springy sliding thumb communicates the on/off state change more clearly than an instant snap.

## Technical performance rules

- **Animate only `transform` and `opacity`** — these are the hardware-accelerated properties that don't trigger layout recalculation. Avoid animating `width`, `height`, `top`, or `margin` — these force the browser to recompute layout on every frame, which is how a "simple" hover animation ends up janking on lower-end devices.
- **Maintain 60 FPS** as the floor — anything that drops frames reads as broken, not "less smooth."
- **Timing**: strict durations of **150–300ms** for micro-interactions — shorter feels instant/unnoticed, longer feels sluggish and gets in the user's way.
- **Easing**: ease-out for elements entering (fast start, gentle settle — feels responsive), ease-in for elements exiting (gentle start, fast finish — feels like it's getting out of the way). Never use a linear easing curve for UI motion; it reads as mechanical/robotic because nothing in the physical world actually moves at constant velocity.

## Accessibility for motion

- Respect the `prefers-reduced-motion` media query — some users experience vestibular disorders triggered by motion, and this isn't optional polish, it's a documented accessibility need.
- Never rely on color alone in a state-change animation (see [accessibility.md](accessibility.md)) — pair a color shift with a shape/icon/text change too.
- Ensure screen-reader compatibility — a purely visual animated state change (e.g., a toggle sliding) needs an accompanying `aria-live` or state attribute so screen reader users get the same information non-visually.

## Business benefits

Boosts conversion (clear feedback reduces hesitation at the moment of action), reduces errors (visible validation states catch mistakes before submission), increases retention (a product that *feels* responsive is judged as higher quality, independent of its actual feature set).

## Scroll-triggered reveal animations

### Core principles
- **Guided storytelling** — content reveals in an intentional sequence as the user scrolls, rather than all being visible at once.
- **Curiosity and engagement** — a partially-visible next section invites continued scrolling.
- **Focus management** — reveal timing draws attention to what matters at each scroll position, rather than competing with everything already on screen.

### Animation timing by scale
| Element scale | Duration |
|---|---|
| Micro-interactions (buttons/links) | 100–200ms |
| Standard content reveals | 200–500ms |
| Large section transitions | up to 800ms max |

**The 5-second rule**: no single animation should run longer than ~1.5 seconds, and no sequence of chained animations on one scroll trigger should exceed ~5 seconds total — past that, the animation is actively delaying the user from the content they scrolled to see.

**Easing**: ease-out, specifically `cubic-bezier(0.215, 0.610, 0.355, 1)` for incoming elements — matches the general "fast start, gentle settle" principle above. Avoid linear easing for the same robotic-motion reason.

**Accent motion**: limit scroll-triggered motion to roughly 10–15% of page elements, targeting CTAs, key stats, and section headers specifically — not every paragraph and image on the page. This mirrors the accent-color scarcity principle in [color-theory.md](color-theory.md): motion that's everywhere stops signaling anything.

### Reference implementation (Intersection Observer API)

```css
.reveal-element {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1),
              transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: opacity, transform;
}
.reveal-element.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-element {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

```js
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -10% 0px', // trigger slightly before the element is fully in view
  threshold: 0.15,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // reveal once, don't re-trigger on scroll-back
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal-element').forEach((el) => observer.observe(el));
```

Notes on this implementation: `will-change: opacity, transform` should be applied strictly to elements that are actually animating (not globally), since it reserves GPU memory per element — see the design-engineer skill's `de5-gpu-compositing` reference for the full layer-promotion cost model. The `prefers-reduced-motion` override sets the end-state directly with no transition, so reduced-motion users see the final content immediately rather than a suppressed-but-still-delayed version of the same animation.

## Applying this

Before adding any animation, name its trigger, its rule, and what feedback it gives the user — if any of the three can't be named, the animation is decoration, not communication, and is a candidate to cut. For implementation-level detail (how to structure the actual render loop, GPU layer promotion, spring math), load the design-engineer skill's Track 4/5 references — this file owns *when and why* to animate; that skill owns *how*, at a technical level.
