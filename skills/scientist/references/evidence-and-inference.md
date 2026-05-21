# Evidence and inference

How to read evidence without fooling yourself, and how to appraise a claim someone hands you.

## Statistical literacy, the parts that matter most

- **Significance ≠ importance.** A p-value tells you how surprising the data are under the null, *not* how big or important the effect is. With a huge sample, a trivial effect can be "significant." Always report and weigh **effect size**.
- **p-value, honestly.** p is the probability of data this extreme *if the null were true* — not the probability the null is true, and not the probability you're wrong. A p of 0.05 still misfires often, especially when prior plausibility is low.
- **Confidence/credible intervals over point estimates.** A range with its uncertainty is more honest than a single number. Wide interval = don't over-claim.
- **Base rates rule everything.** For a rare condition, even an accurate test produces mostly false positives. Always combine the test's accuracy with how common the thing is (Bayes' theorem). Ignoring base rates is the most common reasoning error in medicine, security, and everyday life.
- **Multiple comparisons.** Test 20 things at p<0.05 and ~1 will "pass" by chance. Correct for it, or pre-specify the one test that counts.
- **Regression to the mean.** Extreme measurements tend to be followed by less extreme ones with no intervention. Many "the treatment worked!" stories are just this.

## Correlation → causation: the bar to clear

To move from "X correlates with Y" to "X causes Y," you generally need:
1. **Association** — they covary.
2. **Temporal precedence** — X comes before Y.
3. **No confounding** — no third variable Z causing both (best handled by randomized intervention).
Supporting (Bradford Hill–style) considerations: dose-response (more X → more Y), plausible mechanism, consistency across studies, specificity, and reversibility.

Common traps: reverse causation (Y causes X), common cause (Z drives both), and collider/selection effects (conditioning on a shared effect creates a spurious link).

## Absence of evidence

"No significant effect" is not "proof of no effect" — it may mean the study was too small (underpowered) to detect one. Distinguish *evidence of absence* (a well-powered study that would have found an effect and didn't) from *absence of evidence* (we couldn't tell).

## Appraising a claim someone gives you

```
# Claim: <restate it precisely>

## What kind of evidence backs it?
<anecdote / observational / RCT / meta-analysis / model / expert opinion>  → where on the strength ladder?

## Key questions
- Is there a control/comparison? Randomized? Blinded?
- Effect size and uncertainty — big enough to matter? interval reported?
- Sample size and population — who, how many, generalizable to the case at hand?
- Confounds addressed? Causal language justified by the design?
- Conflicts of interest, funding, publication/file-drawer bias?
- Has it replicated independently?

## Verdict
<what the evidence actually supports, hedged appropriately>
<what would raise or lower my confidence>
```

## Honest reporting

State your confidence in words tied to the evidence ("strongly supported by replicated RCTs," "a single observational study, treat as a lead"). Separate what the data show from what you infer. Note limitations before someone else does. The credibility you protect is your own.
