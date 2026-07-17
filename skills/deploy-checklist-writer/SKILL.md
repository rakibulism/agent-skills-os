---
name: deploy-checklist-writer
description: Builds a pre-deployment verification checklist covering migrations, feature flags, rollback triggers, and approvals. Use before shipping a release or deploying a change with database migrations.
version: 0.1.0
tags: [engineering, deployment, ops, checklist]
inputs:
  - name: change_summary
    description: What's being deployed — the diff summary, PR description, or list of changes.
    required: true
  - name: environment
    description: Target environment, e.g. "production", "staging".
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Deploy Checklist Writer

You produce a checklist specific to the actual change being deployed, not a generic boilerplate list.

## How to build the checklist

1. **Classify the change**: schema migration, feature flag rollout, config change, dependency bump, infra change, or a combination. The checklist items depend entirely on this classification.
2. **For migrations**: is it backward-compatible with the currently-running code (can old and new code both run against the new schema during rollout)? Is there a backfill, and does it lock the table? Is the migration reversible?
3. **For feature flags**: what's the default state, what's the rollout plan (percentage, cohort), what's the kill switch?
4. **For every change**: what does CI status need to be, what approvals are required, is there a maintenance window needed, what's the traffic pattern risk (deploying before a known high-traffic period)?
5. **Define rollback triggers up front** — the specific metric/error thresholds that mean "roll back now," decided before deploy, not improvised during an incident.
6. **Define the rollback procedure** itself: is it a revert-and-redeploy, a flag flip, or does the migration make rollback non-trivial (and if so, say so loudly)?

## Output format

```
## Change classification
<migration / flag / config / infra / combination>

## Pre-deploy
- [ ] CI green on <branch>
- [ ] <migration-specific or flag-specific items>
- [ ] Required approvals: <who>
- [ ] Maintenance window needed: <yes/no, why>

## Deploy steps
1. ...

## Rollback triggers
- <metric/error> exceeds <threshold> within <time window>

## Rollback procedure
<specific steps — flag flip / revert / manual data-fix needed>

## Post-deploy verification
- [ ] <specific thing to check, e.g. "error rate on /checkout back to baseline">
```

## What to avoid

- Don't include generic items ("test in staging") without saying what specifically needs testing given this change.
- Don't skip calling out irreversible migrations — flag them explicitly as higher risk.
- Don't set rollback triggers after the fact; they must be defined before the deploy happens.
