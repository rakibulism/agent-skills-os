# Interactive Prototyping

Interactive prototyping bridges static design and final code by linking screens together with triggers, actions, transitions, and logic that simulate how a real application behaves — the difference between a flat mockup (shows layout, typography, colors, but has no behavior) and a working simulation of the actual product.

## The four core building blocks

### 1. Triggers — what starts an interaction
- **On Click / On Tap** — pressing a button or link.
- **On Hover** — moving the cursor over an element (tooltips, dropdown menus).
- **On Drag** — swiping banners, moving sliders.
- **While Pressing** — simulating long-presses on mobile.

### 2. Actions & destinations — what happens after the trigger
- **Navigate to** — move to a completely new screen.
- **Open Overlay** — modals, alerts, slide-out menus over the current screen.
- **Scroll To** — jump to a specific section on the same page.
- **Back** — return to the previously viewed screen.

### 3. Transitions & animations — the visual style of the change
- **Instant** — no visual effect, immediate screen change.
- **Dissolve** — cross-fade between old and new screen.
- **Smart Animate** — automatically matches identical layers across two screens and animates their position/size/color changes smoothly, without hand-authoring the tween.
- **Slide In / Out** — elements move from screen edges, mimicking native mobile app transitions.

### 4. Advanced logic & variables
Modern prototyping tools can hold real state:
- **Variables** — store user data like names, cart totals, item counts.
- **Conditional Logic** — if/then rules (e.g., if the cart is empty, hide the checkout button).
- **Component States** — swap variants of a single element (a checkbox flipping from unchecked to checked).

## Choosing a tool

| Tool | Best for | Key feature |
|---|---|---|
| **Figma** | All-in-one UI design and prototyping | Smart Animate + Variables produce highly realistic logic with no code |
| **ProtoPie** | Advanced, high-fidelity mobile interactions | Uses real device sensors (gyroscope, camera) and voice input |
| **Axure RP** | Complex enterprise applications, data-driven logic | Heavy conditional routing and realistic form validation |

Default to Figma unless the project specifically needs device-sensor interaction (ProtoPie) or enterprise-grade conditional data logic (Axure) — most projects don't, and the cost of a second specialized tool rarely pays for itself.

## Why this matters, beyond "it looks more finished"

- **Validates ideas fast** — usability gets tested before a developer writes a single line of code.
- **Saves development cost** — fixing a design flaw in Figma is dramatically cheaper than rewriting shipped code.
- **Improves communication** — gives stakeholders and developers an unmistakable blueprint of exactly how a feature should work, removing "I assumed you meant..." gaps.
- **Eliminates assumptions** — a working prototype shows exact animation speeds, easing curves, and layout behaviors instead of describing them in a spec doc that different readers interpret differently.

## Applying this

Before handing a design to development, ask whether it's a flat mockup or an interactive prototype — if a reviewer can't click through the actual flow (triggers → transitions → logic), gaps in the interaction model won't surface until a developer hits them mid-build, which is the most expensive point to discover them.
