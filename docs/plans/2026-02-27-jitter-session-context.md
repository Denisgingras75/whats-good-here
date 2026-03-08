# Jitter Input Component — Session Context

> Paste this into a new Claude Code session to execute the implementation plan.

## What you're building

A standalone `<JitterInput>` component for WGH that captures typing biometrics (keystroke dynamics), displays live stats while typing, shows a "baseball card" after review submission, and adds a typing identity card to user profiles. This is the foundation for Jitter Protocol — an embeddable human verification widget.

## How to execute

```
Use superpowers:executing-plans to implement the plan at:
docs/plans/2026-02-27-jitter-input-component-plan.md
```

The plan has 10 tasks with exact file paths, code, and commit messages. Execute them in order.

## Key files you'll touch

| File | What to do |
|---|---|
| `src/hooks/usePurityTracker.js` (314 lines) | Upgrade: add DD time, per-key dwell, edit ratio, pause freq, mouse path. Drop fatigue_drift + hour_of_day from output. Add getSessionStats(). |
| `supabase/schema.sql` | Add `created_at` to jitter_profiles, new `get_my_jitter_profile()` RPC, update `merge_jitter_sample()` trigger (lines 2037-2152) |
| `src/api/jitterApi.js` (47 lines) | Update getMyProfile() to use new RPC |
| `src/components/jitter/` (NEW dir) | Create: JitterInput.jsx, SessionBadge.jsx, SessionCard.jsx, ProfileJitterCard.jsx, index.js |
| `src/components/ReviewFlow.jsx` (477 lines) | Swap textarea for `<JitterInput>`, add SessionCard post-submit |
| `src/components/TrustBadge.jsx` (93 lines) | Add hover popover with cumulative stats |
| `src/api/votesApi.js` | Pass jitter_profile through review data for TrustBadge popover |
| `src/pages/Profile.jsx` | Add ProfileJitterCard |

## Design doc

Full design rationale: `docs/plans/2026-02-27-jitter-input-component-design.md`

## Project rules (critical)

- **No ES2023+** — no toSorted(), Array.at(), findLast(). Use slice().sort(), arr[arr.length-1]
- **All colors via CSS variables** — `style={{ color: 'var(--color-text-primary)' }}`, never hardcode hex
- **Tailwind = layout only** — className for flex/padding/margin, style for colors/backgrounds/borders
- **No direct Supabase calls from components** — all through src/api/
- **schema.sql is source of truth** — update it first, then run in SQL Editor
- **Use logger, not console.\*** — import from src/utils/logger
- **Named export + export default** on new components
- **Run `npm run build` after each task** to verify
- **Safari compatibility** — test for banned methods

## Branch

Work on `main`. Confirm with `git branch --show-current` before starting.

## Commands

```bash
npm run dev      # localhost:5173
npm run build    # production build
npm run test -- --run  # tests (no watch mode)
npm run lint     # eslint
```
