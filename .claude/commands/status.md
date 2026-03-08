---
description: "Dashboard — what's working, what's broken, what's next"
---

# /status — Project Health Check

Run a quick health check on WGH. Do ALL of the following, keep it tight:

## 1. Build Health
- Run `npm run build` in the WGH directory. Report pass/fail.
- Run `npm run lint` — report pass/fail with count of issues.

## 2. Git State
- Current branch
- Any uncommitted changes? List them briefly.
- How many commits ahead/behind remote?

## 3. What's Next
- Read TODO.md from memory directory
- List the top 3 actionable items (not blocked, not done)
- Flag anything that's been sitting too long

## Format
Use a simple dashboard format:

```
BUILD:  [pass/fail]
LINT:   [pass/fail] (X issues)
BRANCH: [name] — [clean/dirty]
REMOTE: [ahead X / behind X / up to date]

NEXT UP:
1. [thing]
2. [thing]
3. [thing]
```

Keep it under 15 lines. No explanations unless something is broken.
