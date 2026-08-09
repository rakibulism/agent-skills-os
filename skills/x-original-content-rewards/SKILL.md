---
name: x-original-content-rewards
description: Helps X (Twitter) creators understand and prepare for the Original Content Rewards Program — review drafts for originality, check account eligibility, and answer questions about how the program works. Use when a creator asks whether a post/thread would qualify, whether their account is eligible, or how payouts/impressions work under this program.
version: 0.1.0
tags: [x, twitter, creator-economy, monetization, content-review, social-media]
inputs:
  - name: draft
    description: A draft post, thread, or caption to review for originality.
    required: false
  - name: account_stats
    description: Account details (followers, impressions, subscription tier, verification status) to check against eligibility requirements.
    required: false
  - name: question
    description: A general question about how the program works (payouts, impressions, appeals, etc).
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# X Original Content Rewards — Creator Assistant

This skill helps creators navigate X's Original Content Rewards Program, which replaced open enrollment into Revenue Sharing. It does three things: reviews draft content for originality, checks account eligibility against program requirements, and answers general questions about how the program works.

Rules below are summarized from X's official program announcement and Help Center as of August 2026. Always tell the user to confirm current details in X's Creator Studio and Help Center, since program terms can change.

## 1. Reviewing a draft post for originality

When a user shares a draft post, thread, caption, or describes content they're about to post, assess it against this test:

**Core question: "Would this content still be valuable without the creator's own contribution?"**
If yes — the post leans on someone else's work without adding enough — flag it as at risk.

Score the draft on these signals:

**Likely counts as original:**
- Firsthand reporting, breaking news the creator gathered themselves
- Analysis, expertise, or a distinct argument/perspective built on top of a topic
- Creator's own photos, video, illustrations, memes they designed
- Commentary/reaction that adds real interpretation, humor, or context — not just description
- Substantial creative transformation of existing material (narration, editing, remixing with clear added value)

**Likely does NOT count as original (flag these):**
- Content copied or re-uploaded from another account, even with credit
- Captions/text overlays that just describe what's already visible in the clip/image
- Purely descriptive or filler summaries that add minimal value
- Reactions with little or no actual commentary
- Cosmetic edits only — cropping, filters, watermark, speed change, basic text overlay — with no substantive addition
- Content whose primary value clearly comes from someone else's underlying work

**When reviewing, give the user:**
1. A verdict: likely qualifies / borderline / unlikely to qualify
2. The specific reason, tied to one of the signals above
3. A concrete suggestion for what to add (a specific angle, data point, or personal take) if it's borderline or unlikely — don't just say "add more value," name what kind of value is missing

If the draft is purely about monetization/payouts/the program itself, note that content "exclusively focused on monetization coaching or maximizing payouts" is excluded regardless of originality.

## 2. Checking account eligibility

When a user gives account details (or asks "am I eligible"), check against these requirements. Ask for whatever isn't provided:

- Age 18+
- Located in a country where the program is available
- Account in good standing (no repeated Monetization Standards / ToS violations, not currently paused for a policy violation)
- Personal or Business account type
- Subscribed to X Premium, Premium+, or Premium Business
- At least 500 verified followers
- At least 500,000 Home Timeline impressions from verified users in the last 90 days (impressions on replies don't count)
- Regularly posts original content (per section 1 above)

Report back as a checklist: met / not met / unknown (needs user to check Creator Studio) for each item. If everything is met, tell them to apply via Creator Studio → Original Content Rewards, and that review takes about 3 business days. If something is unmet, name the specific gap and what would close it (e.g., "150 followers short of the 500 minimum").

For existing Revenue Sharing members: note that new enrollment into Revenue Sharing closed when this program launched, but their current earnings continue through September 7, 2026 (final payouts Aug 14, Aug 28, and a closing payout ~Sept 11). They can apply into Original Content Rewards starting September 8, 2026, and if already ID-verified with a payout method on file, they don't need to redo those steps.

## 3. Answering general questions

Use this reference when the user asks how something works:

- **Qualified impressions**: unique impressions from Premium subscribers (any tier) on the Home Timeline, with 50%+ of the post visible. Repeat views from the same account, paid/promoted/artificial impressions, and fraudulent impressions don't count.
- **Payout cadence**: every two weeks, contingent on continued eligibility.
- **Continuous eligibility**: staying enrolled requires keeping the Premium subscription active, continuing to post original content, avoiding fraud/bot engagement or algorithm tampering, not soliciting engagement (e.g., repeatedly asking for likes/reposts), and not violating platform policies. Violations can lead to temporary or permanent removal, appealable through X's process.
- **Appeals**: one appeal allowed if an application is rejected; if that fails, the creator can reapply after 90 days if they still meet requirements.
- **Relationship to IP/copyright**: originality under this program is a separate question from copyright. Content can qualify as "original" under these program rules and still infringe someone else's IP — creators are responsible for having rights to any third-party material they use.

If a question falls outside these rules (e.g., disputed payout amounts, account-specific investigation), tell the user to use X's Help Center or Creator Studio support channels rather than guessing.
