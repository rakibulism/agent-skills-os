# Feature Completeness Checklist — full method

This is the micro lens's full method, mirrored from the standalone [`ux-flow-completeness-auditor`](../../ux-flow-completeness-auditor/SKILL.md) skill. Load this file when `flow-auditor` has determined the micro lens applies.

---

Most half-built features don't look half-built. They render fine, the happy path works, and nothing throws an error. What's missing only shows up when someone actually tries to use it: an avatar that doesn't do anything when clicked, a "create" screen with no matching "edit," a permission that's implemented as a greyed-out button instead of not being there at all. This lens catches that class of gap — in real, shipped code, not in a screenshot.

This is a **builder's checklist**, not a visual critique. Use `ux-ui-designer` or `design-critic` for hierarchy/spacing/visual feedback on a mockup. Use this lens once something is actually implemented and you need to know what's still missing before it ships.

## The core discipline

**A feature isn't done because the primary action works. It's done when every element that looks interactive is interactive, every entity you can create you can also edit and remove, every relationship you can form you can also later change, and every role that can see the feature sees the *correct* version of it — not a disabled copy of the full one.**

Work through the checklist below against the actual running app (or the actual component tree), not from memory of what you intended to build.

## Checklist

### 1. Dead interactive elements
Grep and click through every avatar, list row, icon button, and card in the feature. For each one, ask: does this actually do something, or does it just *look* clickable?
- A common failure: a list of people/items rendered as `<div>`s with hover styles but no `onClick` — visually identical to a working button, functionally inert.
- Fix pattern: either wire the handler, or strip the interactive styling so it stops promising an action that isn't there.

### 2. One-way CRUD
If there's a "Create X" flow, there must also be "Edit X" and "Delete/Remove X" — unless the product genuinely never needs them (rare; justify explicitly if you skip one).
- Check the entity's edit path specifically for anything that was only settable *at creation time*. If a form field exists at creation, ask whether it can also be changed later — if not, that's usually a bug, not a design decision.
- Don't stop at "can I create it" — try to un-create it, rename it, and change every field you just set.

### 3. Unmanageable relationships
When entity A references entity B (a channel has members, a task has an assignee, a project has collaborators), the relationship needs its own lifecycle, independent of A's own create/edit:
- Can you set the relationship when creating A? (e.g. pick members while creating a channel)
- Can you change it later, without recreating A? (add/remove members from an existing channel)
- Is the current state of the relationship visible somewhere (a member list, an assignee chip), not just editable?
- If A's UI shows a count or summary of B ("12 members"), verify that number is backed by real, editable data — not a hardcoded or globally-shared list standing in for a relationship that was never actually modeled.

### 4. Data that's stored but never surfaced
If an entity's data model carries a field (email, role, status, last-active, description), check whether the UI ever actually shows it to a user, anywhere. A field that's populated in mock/seed data but never rendered is a strong signal of a missing detail view.
- Rule of thumb: if a list item represents a person or a rich entity, there should be *some* way to see its full detail (a profile card, an info panel, a detail page) — not just the truncated name shown inline.

### 5. Permission theatre — hide, don't disable
When a role can't perform an action, the default instinct is to render the control disabled/greyed-out with a tooltip explaining why. **Don't.** What a role can't do shouldn't exist as UI for them at all:
- No disabled buttons, no greyed switches, no "only admins can..." banners sitting on top of a form full of disabled fields.
- Instead: don't render the control. Show the underlying data as plain, non-interactive text/labels if it's still useful to see, and nothing more.
- Exception: destructive or high-stakes actions where the *absence* of a control could itself be confusing (e.g. a always-visible "Request access" affordance) — judge case by case, but default to removal.
- Verify this by actually switching roles/personas in the running app and diffing what renders, not by reading the gating code and assuming it's equivalent to hiding.

### 6. Permission state must be tied to a real identity
If the app has a "preview as a different role" or similar mechanism, it must be backed by an actual identity (a specific user/account), not a bare, disconnected enum that only a few components happen to check.
- Symptom of the bug: switching "role" changes some buttons but the sidebar, header, message authorship, or "who am I" logic elsewhere in the app still shows the previous identity.
- Fix: derive permissions from the single source of truth for "who is currently acting," and audit every place in the app that hardcodes a specific user's name/identity — those all need to follow the same source.

### 7. Standard placement for standard patterns
Well-established UI patterns have a place users already expect them, from comparable products (Slack, Discord, Linear, Notion, etc.). Don't invent a new location for something that already has a convention:
- Account switching / sign out → bottom-left (or top-right) identity menu, not buried in a settings page.
- Channel/conversation member list and call/info actions → the conversation header, not a separate settings screen.
- Search, notifications, help → global chrome, not per-page.
- When in doubt, name the reference product you're matching and place it where that product places it.

### 8. Systematic state coverage
Don't audit only the state you happened to build first. For the feature under review, explicitly enumerate and check:
- **Every role** that can see it (owner/admin/member, or equivalent) — not just the one you were logged in as while building.
- **Every list state**: empty, one item, many items, an item with missing/optional fields unset.
- **Every entity kind** if the feature is polymorphic (e.g. a "step" that can be 5 different types) — verify the one you tested isn't the only one that actually works.
- **Every entry point** into the same screen (e.g. a detail view reached from a list vs. reached from a search result) — confirm they end up in the same, fully-functional state.

## How to run the audit

1. Get the feature into a running, clickable state (dev server, not just source reading).
2. Walk the checklist above in order, item by item, against the real UI. For roles/permissions, actually switch identity/role in the app rather than reasoning about the gating code.
3. For every gap found, record: what's missing, which checklist item it falls under, and the concrete state that exposes it (e.g. "member role, channel list, avatar click — no handler").
4. Prioritize fixes: dead interactive elements and one-way CRUD first (they block basic usage), then permission theatre and relationship management, then placement conventions last (real but lower-severity).
5. After fixing, re-verify in the browser — inspect actual DOM/computed state (e.g. `:disabled` matching, not just a component's own `disabled` prop) rather than trusting that the code change did what it looks like it should do. CSS and framework quirks (e.g. `display: contents` silently breaking native `fieldset` disabling) can make a fix look correct in source while doing nothing at runtime.

## Output format

```
## Gaps found

1. **[Checklist item] — [one-line summary]**
   State: [exact role/screen/element that exposes it]
   Fix: [concrete direction, not just "make it work"]

2. ...

## Already complete
- [what was checked and is genuinely fine — say so, don't just list problems]

## Priority order
1. ...
```

## What to avoid

- Don't audit from the component source alone — click through the actual states. Several of the gaps this lens targets (dead click handlers, permission-check bugs, CSS-level disabling failures) are invisible from reading code and only show up live.
- Don't treat "the happy path works" as "the feature is done."
- Don't recommend disabling a control as an acceptable substitute for hiding it, when auditing permission-gated UI — that's the specific anti-pattern this lens exists to catch.
- Don't invent a new UI location for a pattern that already has an established convention elsewhere in comparable products.
