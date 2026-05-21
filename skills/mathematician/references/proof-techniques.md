# Proof techniques

Match the method to the shape of the claim. The structure of what you're proving usually tells you how to prove it.

## Direct proof
Assume the hypothesis, derive the conclusion step by step. Best when there's a clear path from given to goal. For "if P then Q," assume P and reach Q.

## Contrapositive
"If P then Q" is logically equivalent to "if not Q then not P." When the negation of the conclusion is easier to work with than the conclusion itself, prove the contrapositive. (To show "if n² is even then n is even," prove "if n is odd then n² is odd" — much easier.)

## Proof by contradiction
Assume the statement is false, derive an absurdity. Powerful for existence/impossibility and for statements about "no such thing." Classic: √2 is irrational; there are infinitely many primes. Caution: don't overuse it where a direct proof is cleaner, and make sure the contradiction actually contradicts something established.

## Induction
For statements about all natural numbers (or well-ordered structures):
- **Base case:** prove it for the smallest n. (Don't skip this — it anchors everything.)
- **Inductive step:** assume it holds for n (or for all k ≤ n, for *strong* induction), prove it for n+1.
- The inductive hypothesis must actually be *used* in the step; if it isn't, you don't have an induction.
- **Structural induction** generalizes this to trees, lists, formulas, and other recursively defined objects.

## Construction (existence proofs)
To prove something exists, exhibit it. To prove "there is an x such that P(x)," produce a specific x and verify P. Constructive proofs are stronger than mere existence proofs because they give you the object.

## Counterexample (disproving universals)
To disprove "for all x, P(x)," produce one x where P fails. A single counterexample defeats a universal claim. Always try this *before* attempting to prove a universal — it's cheap and can save a doomed effort.

## Cases / exhaustion
Split into a complete, non-overlapping set of cases and prove each. Valid only if the cases are exhaustive. Useful when the object behaves differently in different regimes (even/odd, positive/negative/zero).

## Pigeonhole principle
If n items go into m boxes with n > m, some box has ≥ 2 items. Deceptively powerful for existence claims ("two people share a birthday month," "some difference is divisible by n"). The art is choosing the right pigeons and holes.

## Bijection / counting two ways
To show two sets have equal size, build a one-to-one correspondence. To prove a combinatorial identity, count the same thing two different ways. Elegant and illuminating.

## Extremal principle
Consider the largest/smallest/extreme object with a property and derive a contradiction or conclusion. ("Take the smallest counterexample…" leads to infinite descent.)

## Invariants
Find a quantity preserved by all allowed moves. If the start and target differ in the invariant, the target is unreachable. Solves many "can you transform A into B" puzzles instantly (e.g., coloring/parity arguments).

## Choosing among them
- Universal claim you doubt → counterexample first.
- "Infinitely many" / "no such" / irrationality → contradiction.
- "For all n ∈ ℕ" → induction.
- "There exists" → construction.
- Conclusion awkward, its negation clean → contrapositive.
- "Can you reach B from A" → invariant.
- Two quantities should be equal → bijection / double counting.
