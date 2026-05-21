# Usability heuristics & laws

Use these to diagnose *why* something feels off and to justify fixes. Cite the heuristic by name in your rationale.

## Nielsen's 10 usability heuristics

1. **Visibility of system status.** The interface should always tell the user what's happening (loading, saved, sending). Silence reads as "broken." Prefer optimistic UI + clear confirmation.
2. **Match between system and the real world.** Use the user's language and mental models, not internal jargon. "Trash," not "soft-delete queue."
3. **User control and freedom.** Every action needs an exit: undo, cancel, back. Destructive actions need a clearly marked escape, not just a confirm dialog.
4. **Consistency and standards.** Same word for the same thing, same control for the same action, platform conventions honored. Internal consistency + external (platform) consistency.
5. **Error prevention.** Better than good error messages. Disable invalid options, use constraints (date pickers over free text), confirm only the genuinely destructive.
6. **Recognition rather than recall.** Show options; don't make users remember them. Recently used, autocomplete, visible labels over memorized codes.
7. **Flexibility and efficiency.** Accelerators for experts (keyboard shortcuts, bulk actions) layered under a simple default for novices.
8. **Aesthetic and minimalist design.** Every extra element competes with the essential ones. Remove, don't add.
9. **Help users recognize, diagnose, recover from errors.** Plain language, name the problem, propose the fix. No error codes without a human sentence.
10. **Help and documentation.** Ideally unneeded; when needed, searchable, task-focused, and in context.

## Laws of UX

- **Hick's Law:** decision time grows with the number and complexity of choices. Reduce options, group them, use progressive disclosure, set smart defaults.
- **Miller's Law:** people hold ~7±2 items in working memory; in practice chunk to 3–5. Group form fields, paginate, summarize.
- **Fitts's Law:** time to hit a target depends on its size and distance. Make primary actions big and bring them close; put destructive actions out of the easy path.
- **Jakob's Law:** users spend most of their time on *other* sites, so they expect yours to work the same way. Conventions are equity.
- **Doherty Threshold:** keep system response under ~400ms or the user disengages. Below that, perceived productivity climbs. Use skeletons/optimistic states to mask latency.
- **Peak-End Rule:** people judge an experience by its most intense moment and its end. Invest in the success moment and the error recovery.
- **Postel's Law (robustness):** be liberal in what you accept from the user (forgiving inputs, paste-friendly fields), conservative in what you output.
- **Tesler's Law (conservation of complexity):** complexity can be moved but not erased. Decide whether the system or the user absorbs it — usually the system should.

## Quick diagnostic questions

- Where am I? (orientation) Where can I go? (navigation) What can I do here? (affordance)
- What just happened? (feedback) What went wrong and how do I fix it? (recovery)
- What's the one thing this screen wants me to do? (hierarchy)
