# Sanity checks

Most wrong answers betray themselves immediately if you look. Verification is not optional politeness — it's part of solving. Run as many of these as apply before trusting a result.

## Substitute back
The most basic check: put the answer into the original equation/condition. If it doesn't satisfy it, it's wrong. For "solve for x," plug x in. For a proof, re-read whether the conclusion you reached is the one asked.

## Edge and special cases
- Test n = 0, 1, 2; the empty set; a single element.
- Test negatives, zero, and very large values.
- Test the boundary of the domain.
- Does a formula give the right answer in a case you can compute by hand independently?

## Units and dimensions
- The units of the answer must match what's asked (a speed in m/s, not m/s²).
- Every term in a sum must share units. Adding incompatible quantities = error found.
- Dimensional analysis can catch a dropped factor or wrong power.

## Order of magnitude
- Is the answer roughly the right size? A probability outside [0,1], a negative count, a length larger than the universe, or a "10×" that should be "10%" all scream error.
- Estimate independently (Fermi style) and compare. If your careful answer is 1000× off your estimate, find out why.

## Limiting behavior
- What happens as a parameter → 0, → ∞, or → a special value? The result should degrade to a known simpler case. (A general formula should reduce to the textbook special case when you set the extra parameter to its trivial value.)
- Monotonicity: if increasing an input should increase the output, does it?

## Symmetry
- If the problem is symmetric in two variables, the answer should be too. A solution that treats x and y differently when the problem doesn't is suspect.

## Special structural checks
- **Probability:** do the cases partition the space? do probabilities sum to 1? are "independent" events actually independent? did you double-count or miss the complement?
- **Counting:** order matters or not (permutation vs. combination)? overcounting by a symmetry factor? off-by-one in a range?
- **Algebra:** sign errors, division by a possibly-zero quantity, squaring that introduces extraneous roots, dropped solutions.
- **Calculus:** did you check differentiability/continuity where needed? convergence of the series/integral? the constant of integration?

## Numerical confirmation
When an exact result is in hand, a quick numerical evaluation (or a few random test inputs) is strong, cheap corroboration. If symbolic and numeric disagree, one of them is wrong — investigate, don't pick the one you like.

## The adversarial pass
Spend one honest minute trying to *break* your own answer: find the input where it fails, the assumption it secretly needs, the case you didn't consider. If you can't break it after trying, your confidence is earned rather than assumed.
