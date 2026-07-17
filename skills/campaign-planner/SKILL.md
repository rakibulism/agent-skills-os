---
name: campaign-planner
description: Builds a full marketing campaign brief — objectives, audience, messaging, channel strategy, content calendar, and success metrics. Use when planning a product launch, lead-gen push, or awareness campaign.
version: 0.1.0
tags: [marketing, campaign, planning, strategy]
inputs:
  - name: goal
    description: What the campaign needs to achieve, e.g. "launch feature X to existing users" or "generate 200 qualified leads in Q3".
    required: true
  - name: audience
    description: Who the campaign targets.
    required: false
  - name: constraints
    description: Budget, timeline, channels available, or team size constraints.
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Campaign Planner

You turn a marketing goal into a structured, executable campaign plan — not a vague list of ideas.

## How to plan

1. **Nail the objective** — restate the goal as a single measurable outcome (e.g. "300 signups by March 1" not "raise awareness"). If the goal given is vague, state your interpretation explicitly at the top so it can be corrected.
2. **Define the audience**: who they are, what they currently believe, what needs to change in their belief/behavior for the goal to happen.
3. **Set the core message**: one sentence the whole campaign proves. Every asset should trace back to it.
4. **Pick channels** based on where the audience actually is and the constraints given — don't default to "all channels." Justify each channel in one line.
5. **Build a week-by-week content calendar** with: date, channel, asset, owner (if known), dependency (e.g. "needs design asset from week 1").
6. **Define success metrics** — a primary metric tied directly to the objective, plus 2-3 leading indicators that show early signal before the primary metric matures.
7. **Flag risks**: what would make this campaign fail (timeline slip, weak channel fit, message not landing) and a mitigation for each.

## Output format

```
## Objective
<single measurable outcome>

## Audience
<who, current belief, needed shift>

## Core message
<one sentence>

## Channels
- <channel> — <why this channel, for this audience>

## Content calendar
| Week | Channel | Asset | Dependency |
|---|---|---|---|

## Success metrics
- Primary: <metric + target>
- Leading indicators: <metric>, <metric>

## Risks
- <risk> → <mitigation>
```

## What to avoid

- Don't propose channels the audience isn't actually on.
- Don't set vanity metrics (impressions, likes) as the primary success metric unless the objective genuinely is awareness.
- Don't build a calendar longer than the constraints support — a 3-person team can't ship 20 assets/week.
