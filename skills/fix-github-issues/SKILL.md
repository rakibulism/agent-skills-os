---
name: fix-github-issues
description: Check GitHub Projects (v2) boards and/or every repo an account owns for open issues, then investigate and fix them in the real codebase. Use when the user asks to "check my issues", "check my project board", "check for open issues across my repos", "look into issue #N", or asks to review/fix issues on a GitHub project or repo they own.
version: 0.1.1
tags: [github, issues, project-management, git, engineering, triage]
inputs:
  - name: account
    description: The GitHub account/org to operate as or scan (e.g. a username). If omitted, use whatever account the local GitHub CLI is already authenticated as.
    required: false
  - name: scope
    description: What to check — a specific Projects (v2) board URL, a single repo, or "all" to sweep every repo the account owns.
    required: false
  - name: issue_number
    description: A specific issue number to investigate and fix, if the user already knows which one.
    required: false
author: rakibulism
author_url: https://x.com/rakibulism
---

# Fix GitHub Issues

End-to-end workflow: find open issues (one project board, one repo, or a sweep across every repo an account owns), read what each one actually asks for, implement the fix in the real codebase, verify it as best as possible, and commit/push with the user's sign-off. Everything here is driven through the **GitHub CLI (`gh`)** plus normal shell/git commands, so it works in any agent runtime that can execute shell commands — it does not depend on any Claude-Code-specific tooling.

## Step 1 — Auth

```bash
gh auth status
```

- If not logged in as the right account, tell the user and stop — don't try to log in as someone else, and never ask for or handle their password/token directly.
- Reading a **Projects (v2) board** requires the `read:project` scope, which a default `gh` token often lacks. If a `projectV2` GraphQL query fails with `INSUFFICIENT_SCOPES`, run:
  ```bash
  gh auth refresh -h github.com -s read:project
  ```
  This starts a **device code flow** — it prints a one-time code and a URL (`github.com/login/device`). Relay both to the user verbatim and wait for them to authorize in their browser before continuing. Poll with `gh auth status` afterward rather than guessing when they're done.
- A browser-automation session (if the agent has one) is typically a **separate, unauthenticated session** from the `gh` CLI. Don't expect "open the issue in the browser" to work for private repos unless the user is separately logged in there — prefer `gh` for anything read/write, and only use a browser to show the rendered page.

## Step 2 — Find the issues

**Single project board:**
```bash
gh api graphql -f query='
query {
  user(login: "ACCOUNT") {
    projectV2(number: N) {
      title url shortDescription public closed
      items(first: 100) {
        totalCount
        nodes { content { __typename ... on Issue { title number state url repository { nameWithOwner } } } }
      }
    }
  }
}'
```

**Sweep every owned repo for open issues** (what "check all my issues" means by default — project boards can be stale or incomplete):
```bash
gh api graphql -f query='
query($login: String!, $endCursor: String) {
  user(login: $login) {
    repositories(first: 100, after: $endCursor, ownerAffiliations: OWNER) {
      pageInfo { hasNextPage endCursor }
      nodes {
        nameWithOwner
        isPrivate
        issues(states: OPEN, first: 50) { totalCount nodes { number title url createdAt } }
      }
    }
  }
}' -f login=ACCOUNT --paginate
```
Flatten `--paginate`'s multiple JSON objects (e.g. with a short script) and print only repos with `totalCount > 0`. Report the full list to the user before diving into fixes — let them pick which repo(s) to tackle rather than fixing everything unasked.

## Step 3 — Read the issue

```bash
gh issue view <number> -R <owner>/<repo> --json title,body,number,state,labels,comments
```
Read the body and any images/comments carefully — issue text from real users is often terse or has small errors (e.g. a copy-pasted list with an accidental duplicate). Note and silently correct obvious slips like that in the fix rather than reproducing the bug; mention the correction in the summary.

## Step 4 — Locate or clone the repo

Check for a local clone first before cloning fresh — the user may already have one on disk. If nothing local:
```bash
gh repo clone <owner>/<repo>
```

## Step 5 — Investigate and implement

- Read enough surrounding code to find the right insertion point (search for related keywords: nav item names, message types, existing partial infrastructure). Issues sometimes name a feature that's *half*-implemented — e.g. a handler already exists on one side of a message-passing boundary but nothing on the other side ever sends that message. Grep both sides before writing new code.
- Match the existing code's style exactly (helper functions already defined, message-passing patterns, naming conventions) rather than introducing a new pattern.
- Keep the fix scoped to what the issue asks — don't refactor unrelated code.

## Step 6 — Verify (be honest about what you couldn't check)

- Prefer real verification: type-check, build, lint, or a running dev server if the project is a previewable app.
- **Don't fabricate success.** Common real blockers:
  - Missing environment secrets (e.g. a database URL) — a dev server or build's data-collection step will fail; that's expected and not something the fix caused. Say so explicitly, and still confirm what *did* pass (typecheck, bundling/compile stage).
  - Non-web projects (browser extensions, CLIs, editor/design-tool plugins) often can't be exercised at all outside their host app — verify by tracing the relevant data/message contract by hand and running a syntax check on the changed files.

## Step 7 — Commit and push (ask first)

- Stage only the files you changed. Write a commit message: short imperative summary line, then a body explaining *why* (referencing the issue's actual ask, not just restating the diff).
- **Always confirm with the user before pushing** — pushing is a visible, hard-to-reverse action. A prior "push it" approval does not carry over to a new, unrelated fix later in the conversation — ask again each time.
- **Check the actual default branch name before pushing** (`git branch -vv`, or check what `git push` without arguments resolves to) — don't assume `main`; some repos still use `master`.

## Step 8 — Dependency/security sweeps (if asked, or if noticed in passing)

If GitHub reports Dependabot alerts on a repo being touched:
```bash
gh api repos/<owner>/<repo>/dependabot/alerts --paginate
```
- Filter to `state == "open"`, group by package. Often several alerts collapse to one or two root packages.
- Prefer bumping the *direct* dependency forward (e.g. a framework to its latest patch) over an automatic audit-fix's suggestion, which can propose a major *downgrade* if it doesn't understand the dependency tree — sanity-check any suggested version against the registry's latest before applying.
- If a vulnerable package is nested inside another package's own manifest (not a direct dependency), use a lockfile override to force the patched version, then actually re-run the build to confirm the override didn't break anything before committing.
- Re-query the alerts endpoint after pushing to confirm they actually cleared — the count shown at push time can be stale by a few seconds.

## Step 9 — Closing issues

Don't close issues automatically after fixing/pushing — ask the user first, since the fix may still need their own manual verification (e.g. testing a plugin inside its host app, or an app needing env secrets the agent doesn't have). If the user confirms, or if an issue turns out to already be closed, check its actual state first:
```bash
gh issue view <number> -R <owner>/<repo> --json state,closedAt,stateReason,projectItems
```
and report that rather than re-closing it.
