# States and edge cases

The happy path is the demo. The states below are the product. Design them explicitly or the engineer will improvise them under deadline.

## The state checklist for any screen or component

- **Empty** — first run, no data yet. This is an onboarding opportunity, not a blank box. Explain what goes here, why it's valuable, and the one action to fill it.
- **Loading** — initial load and subsequent fetches. Prefer skeletons that mirror the final layout over spinners; they reduce perceived wait and prevent layout shift.
- **Partial / streaming** — some data here, more coming. Show what you have; don't block on the slowest item.
- **Ideal / populated** — the designed-for case. Make sure it still holds with realistic data volume.
- **Error** — request failed, validation failed, permission denied, offline. Name what happened, preserve the user's work, offer a retry or a path forward.
- **Success** — confirm the action landed. Honor the Peak-End rule; the success moment is worth investing in.
- **Edge data** — the long name, the 0, the negative, the 10,000 rows, the missing avatar, the emoji in the field, the right-to-left string.

## Empty states, done well

Three flavors:
1. **First-use** (nothing yet): teach + a single primary CTA.
2. **User-cleared** (inbox zero): celebrate, don't scold.
3. **No-results** (search/filter returned nothing): explain why, offer to broaden or clear filters, suggest the next move.

## Error states, done well

- **Prevent** before you handle: disable invalid options, constrain inputs, validate inline as the user leaves a field (not on every keystroke, not only on submit).
- **When it fails:** plain language ("We couldn't save your changes"), the cause if known, the fix ("Check your connection and retry"), and a button that performs the fix.
- **Never** lose the user's input on error. Re-render the form with their data intact.
- **Match severity to treatment:** inline hint for a recoverable typo, a banner for a page-level problem, a blocking dialog only for the genuinely destructive or unrecoverable.

## Data extremes to design for

| Dimension | Test with |
|---|---|
| Text length | 1 char, and 3× the expected max (truncate? wrap? tooltip?) |
| Quantity | 0, 1, the typical N, and 10,000 (pagination/virtualization?) |
| Numbers | 0, negative, very large, currency, percentages, decimals |
| Media | missing image, slow image, broken image (fallback?) |
| Locale | longest-language strings (German), RTL (Arabic/Hebrew), date/number formats |
| Network | slow, flaky, offline (optimistic UI + reconciliation?) |
| Permissions | logged out, read-only, denied, expired session |

## The "what if" pass

Before sign-off, ask of each interactive element: what if it's slow? what if it fails? what if it's empty? what if there's too much? what if the user has no permission? what if they do this twice fast? Each "what if" with no answer is a future bug report.
