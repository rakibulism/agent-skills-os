# Problem solving (Pólya and friends)

Hard problems are rarely solved by marching forward from the givens. They're solved by exploration that reveals the idea, then a clean write-up. Pólya's four phases organize the work.

## 1. Understand the problem
- Restate it in your own words. What is unknown? What is given? What is the condition linking them?
- Is the condition enough to determine the unknown? Redundant? Contradictory?
- Draw a figure. Introduce suitable notation. Separate the parts of the condition.
- Write down precise definitions of every term — fuzzy terms hide most errors.

## 2. Devise a plan
Reach for these connectors between problem and method:
- **Have you seen it before?** A related problem? A problem with the same unknown?
- **Solve a simpler problem.** Fewer variables, smaller n, a special case. The structure of the easy case often reveals the general one.
- **Specialize and generalize.** Try extreme or boundary instances; or solve a more general problem that's somehow easier.
- **Work backward.** Start from the desired conclusion and ask what would yield it.
- **Introduce auxiliary elements.** A helper line, variable, function, or quantity that links the parts.
- **Restate.** Rephrase the problem in equivalent terms (geometric ↔ algebraic ↔ combinatorial).
- **Look for symmetry, invariants, monovariants** (quantities that only increase/decrease — they bound processes).
- **Guess and verify, then justify.** A pattern from small cases gives a conjecture to prove.

## 3. Carry out the plan
- Execute each step, checking that each one is correct and *follows* — not just that it feels right.
- Keep the goal visible; if a step doesn't move toward it, question it.
- If stuck, return to phase 2 with what you've learned. Stuckness is information about which approach the problem resists.

## 4. Look back (the phase everyone skips)
- **Check the result** (see sanity-checks): substitute, test edge cases, units, magnitude.
- **Check the argument:** is each step justified? did you use every hypothesis?
- **Can you derive it differently?** A second route raises confidence and deepens understanding.
- **Can you generalize?** What's the real theorem here? What did the specific numbers actually contribute?
- **What was the key idea?** Naming it makes it reusable on the next problem.

## On being stuck
- Compute more examples; the pattern may not have appeared yet.
- Weaken the goal: prove something easier first.
- Strengthen the hypotheses temporarily to see what helps, then try to remove the crutch.
- Look for what makes the problem hard — the obstacle often points at the technique (an obstacle of "infinitely many" suggests contradiction; "all n" suggests induction).
- Step away. Insight frequently arrives after incubation.
