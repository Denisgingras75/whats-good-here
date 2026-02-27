# Agent Phone v2 — Coordination & Knowledge Transfer

**Version:** 2.0 — Multi-agent coordination + compound learning
**Last updated:** 2026-02-27

---

## How This Works

This file is a shared coordination channel for AI agents working on WGH. It solves two problems:

1. **Don't step on each other's work** — Cross-fork sync (Denis ↔ Dan) and multi-tab locking
2. **Don't lose what we learned** — Knowledge that dies between sessions stays alive here

### The Rules

- **Read this file on session startup.** Before touching code, check Active Agents, Warnings, and recent Learnings/Gotchas.
- **Register yourself** in Active Agents when you start working. Deregister when you're done.
- **Append, don't overwrite** the Learnings, Gotchas, and Session Log sections. Add new entries at the top of each section (newest first). This avoids merge conflicts when multiple agents write.
- **Timestamp everything.** Format: `YYYY-MM-DD HH:MM` or just `YYYY-MM-DD` if time doesn't matter.
- **Be specific.** "Search is buggy" is useless. "Multi-word search only tokenizes the first word — see dishesApi.search() fallback ladder" is useful.

### For Denis's Claude (local)
Read and write this file directly. You have full access.

### For Dan's Claude (remote)
Read via raw GitHub URL:
```bash
curl -s https://raw.githubusercontent.com/Denisgingras75/whats-good-here/main/AGENT-PHONE.md
```
Respond via GitHub Issues with "Agent Phone:" prefix:
```bash
gh issue create --repo Denisgingras75/whats-good-here --title "Agent Phone: [subject]" --body "[message]"
```

### For Multi-Tab Sessions (same machine)
All tabs read/write this file. Use the Active Agents registry as a lightweight lock:
- Before working on a file or feature, check if another agent has claimed it
- If claimed, coordinate via the Message Board section or work on something else
- If the claiming agent's timestamp is stale (>2 hours), assume the session ended and reclaim

---

## Active Agents

> Register here when you start a session. Remove yourself when done. Format:
> `| Agent ID | Owner | Working on | Don't touch | Since |`

| Agent ID | Owner | Working on | Don't touch | Since |
|----------|-------|------------|-------------|-------|
| _example_ | _Denis-Tab1_ | _Auth flow refactor_ | _AuthContext.jsx, LoginModal.jsx_ | _2026-02-27 14:00_ |

**Currently:** No agents registered.

When starting a session:
```markdown
| session-abc | Denis-Claude | [what you're doing] | [files/areas locked] | 2026-02-27 |
```
When ending a session, delete your row and add a Session Log entry.

---

## Cross-Fork Status

### Denis's Fork
- **Branch:** `main` (67+ commits ahead of upstream)
- **Last session:** 2026-02-27
- **State:** Codex learning system complete, launch strategy planning, Agent Phone v2

### Dan's Fork
- **Last known:** `280943e` — Editorial refinement (2026-02-20)
- **Working on:** Unknown
- **Action needed:** Dan, have your Claude update this section via issue

---

## Warnings (Breaking Changes)

> Things that will bite you if you don't know about them. Check this before writing code.

### Active Warnings

1. **DishListItem is the single source of truth for dish display.** All dish rendering goes through `src/components/DishListItem.jsx` with 3 variants. Do NOT create new dish card components.

2. **13 components were deleted.** Do not import any of these — they don't exist:
   `RankedDishRow`, `VotedDishCard`, `TopDishCard`, `Top10Compact`, `CategorySkeleton`, `SearchHero`, `DishCard`, `CategoryImageCard`, `CategoryGrid`, or old profile tab components.

3. **Profile is a Food Journal now.** Old 5-tab profile system is gone. Replaced with shelf-based layout: Good Here / Not Good Here / Heard That's Good There / All. Component: `JournalFeed`.

4. **E2E tests exist and must pass.** `npm run test:e2e` — 25 Playwright scenarios on port 5174. Run before pushing.

5. **Light mode is the default.** `:root` is light ("Appetite"). Dark ("Island Depths") is `[data-theme="dark"]`. This was swapped from the original — don't assume dark is default.

---

## Learnings

> Things we discovered that should persist across sessions. Not "what changed" but "what we now know." Newest first. Format:
> ```
> ### [Short title] — YYYY-MM-DD
> **Context:** What we were doing when we discovered this
> **Discovery:** The actual insight
> **Evidence:** How we know this is true (file, test, production incident)
> ```

### PL/pgSQL column ambiguity causes silent wrong results — 2026-02-17
**Context:** Production outage debugging
**Discovery:** `RETURNS TABLE` column names in PL/pgSQL become variables inside the function body. If a joined table also has a column with the same name, bare references are ambiguous. PostgreSQL picks the variable (return column), not the table column — silently returning wrong data, not an error.
**Evidence:** `votes.dish_id` vs bare `dish_id` caused production outage. Always use `tablename.column` in RPCs. Documented in CLAUDE.md §1.5.

### Bayesian shrinkage is essential for small datasets — 2026-02-17
**Context:** Search ranking was naive (`avg_rating DESC`)
**Discovery:** A dish with 1 vote at 10.0 beat a dish with 50 votes at 9.2. Bayesian shrinkage formula: `score = (v/(v+m)) * R + (m/(v+m)) * C` where m=prior strength, C=global mean (7.668). Low-vote dishes shrink toward the global mean. Prior strength schedule: m=3 now (<500 total votes), m=5 at 500, m=10 at 1000+.
**Evidence:** `supabase/schema.sql` → `dish_search_score()`, `NOTES.md` → Bayesian prior schedule.

### Multi-word search tokenizer was silently broken — 2026-02-17
**Context:** "Lobster roll" search only returned results for "lobster"
**Discovery:** The tokenizer took the first word and dropped the rest. Fixed with a 4-level fallback ladder: exact phrase → AND tokens on name → cross-field (name/category/tags) → OR broadest fallback. The fallback chain is important — you need graceful degradation, not just one strategy.
**Evidence:** `src/api/dishesApi.js` → `search()` method.

### react-helmet-async doesn't support React 19 — 2026-02-15
**Context:** Trying to add dynamic OG meta tags for social sharing
**Discovery:** Peer dep conflict with React 19. But more importantly: client-side meta tags don't help for social sharing anyway. Facebook, iMessage, and Twitter crawlers don't execute JavaScript. Need server-side solution (Vercel edge middleware).
**Evidence:** T28 rescoped in TASKS.md. Edge middleware approach deferred to pre-launch.

### Light mode wins every user test — 2026-02-17
**Context:** Dark mode was the original default
**Discovery:** Every user tested preferred light mode. The "premium dark mode" aesthetic that looks good in screenshots loses to readability and familiarity in real usage, especially outdoors on Martha's Vineyard (bright sun).
**Evidence:** Theme swap in `src/index.css`, `src/context/ThemeContext.jsx` defaulting to 'light'.

### Gold at low opacity on dark navy looks green — 2026-02-13
**Context:** Setting `--color-divider` with gold tint in dark mode
**Discovery:** Color mixing is not intuitive. Gold (#D9A765-ish) at low opacity on dark navy (#0D1B22) produces a visible green tint, not a subtle gold. Use rust/brown tints for dividers on dark backgrounds instead.
**Evidence:** Fixed in `src/index.css` dark theme tokens.

### Geolocation blocks initial load — 2026-01-15
**Context:** App was slow to show content on first visit
**Discovery:** The app was waiting for geolocation permission before loading dishes. Users saw a blank screen for seconds. Fix: load dishes immediately with default Martha's Vineyard coordinates, then update when geolocation resolves. Never gate content on optional permissions.
**Evidence:** `src/context/LocationContext.jsx` — loads with defaults, refetches on permission grant.

### Supabase `user_repeated_signup` silently no-ops — 2026-02-15
**Context:** Testing Resend email integration
**Discovery:** When testing auth with an existing account, `user_repeated_signup` causes Supabase to silently do nothing — no error, no email. Looks like a delivery failure but it's expected behavior. Test with magic link login flow or a genuinely new email address.
**Evidence:** DEVLOG 2026-02-15 entry.

### Emoji medals read as cheap — 2026-02-13
**Context:** Homepage top 10 ranking display
**Discovery:** 🥇🥈🥉🏆 in the ranking looked like a mobile game, not a food app. Typography-only rank numbers (with color hierarchy: crimson #1, silver #2-3, bronze #4-10) read as intentional and premium. "Emoji = cheap signal, designed icons = intentional signal."
**Evidence:** Removed in DEVLOG 2026-02-13 homepage simplification.

### `setTimeout` for post-auth modal is unreliable — 2026-01-15
**Context:** Modal should reopen after magic link login completes
**Discovery:** `setTimeout(100)` after auth redirect was a race condition. Sometimes the modal opened, sometimes it didn't. Fix: open immediately without timeout — the auth state is already resolved by the time the callback fires.
**Evidence:** Bug fix in DEVLOG 2026-01-15.

---

## Gotchas

> Mistakes made so the next agent doesn't repeat them. Format:
> ```
> ### [What went wrong] — YYYY-MM-DD
> **Tried:** What seemed like it should work
> **Why it failed:** Root cause
> **Correct approach:** What to do instead
> ```

### `.single()` explodes on zero rows — ongoing
**Tried:** Using `.single()` for profile/user lookups
**Why it failed:** `.single()` throws a PostgreSQL error when zero rows are returned. Common for: user hasn't set up profile, dish has no photos, first-time user with no votes.
**Correct approach:** `.maybeSingle()` for any lookup that might legitimately return zero rows. `.single()` only when zero results is truly an error condition.

### `ROUND()` on floats silently truncates — ongoing
**Tried:** `ROUND(avg_rating, 2)` in SQL
**Why it failed:** PostgreSQL's `ROUND()` requires `NUMERIC` type. Float expressions get silently truncated or error.
**Correct approach:** Always cast first: `ROUND(expression::NUMERIC, 2)`.

### ES2023+ methods crash older browsers — ongoing
**Tried:** `toSorted()`, `Array.at()` in JavaScript
**Why it failed:** Safari <16, Chrome <110 don't support these. App crashes with no fallback — silent white screen.
**Correct approach:** `.slice().sort()` instead of `.toSorted()`. `arr[arr.length - 1]` instead of `.at(-1)`. Always check MDN browser compat.

### `schema.sql` edits don't auto-deploy — ongoing
**Tried:** Adding a new RPC to `schema.sql` and expecting it to work
**Why it failed:** `schema.sql` is documentation/source-of-truth only. Supabase doesn't read it. The function doesn't exist until you run the `CREATE FUNCTION` in Supabase SQL Editor.
**Correct approach:** Edit `schema.sql` first (source of truth), then copy the function definition and run it in SQL Editor. Verify with a test call.

### New Supabase fields need two additions — ongoing
**Tried:** Adding a field to the `selectFields` string only
**Why it failed:** The API layer uses a two-step pattern: `selectFields` defines what to fetch, `.map()` transforms it. Adding to `selectFields` without updating the `.map()` means the data is fetched but never exposed to the UI.
**Correct approach:** Add to both `selectFields` AND the `.map()` transform in the same API method. See `dishesApi.search()` for the canonical pattern.

### RPC names must match schema.sql exactly — ongoing
**Tried:** Renaming an RPC based on a PostgreSQL hint message
**Why it failed:** Postgres sometimes suggests alternate names in error messages. The `.rpc()` call must use the exact name from `schema.sql`, not what Postgres suggests.
**Correct approach:** Always look up the function name in `schema.sql`. Copy-paste it. Don't trust Postgres hint messages for naming.

### `transition-all` on interactive elements causes flash — 2026-02-15
**Tried:** CSS `transition-all` on TownPicker buttons
**Why it failed:** When the picker closes, `transition-all` animates the background-color removal, causing a visible red flash as it transitions from active state to default.
**Correct approach:** Be specific with transitions: `transition-property: transform` or `transition: opacity 0.2s`. Never `transition-all` on elements with background color changes.

### Floating-point display errors in JS — 2026-01-22
**Tried:** Displaying rating deltas directly: `userRating - communityAvg`
**Why it failed:** JavaScript floating point: shows "-0.6000000000000005" instead of "-0.6".
**Correct approach:** `Math.round(value * 10) / 10` for 1 decimal place display. Apply rounding at the display layer, not the data layer.

### `console.log` in production leaks to Sentry — ongoing
**Tried:** Using `console.error()` for debugging
**Why it failed:** In production, `console.error` gets picked up by Sentry as noise. Direct `console.*` calls bypass the logger's environment checks.
**Correct approach:** Always use `logger` from `src/utils/logger.js`. It suppresses `info`/`debug` in production and routes `error`/`warn` to Sentry properly.

### Direct localStorage calls break SSR and testing — ongoing
**Tried:** `localStorage.getItem('key')` directly in a component
**Why it failed:** Breaks in SSR contexts (localStorage undefined), makes testing harder (can't mock centrally), and scatters storage keys across the codebase.
**Correct approach:** Use `getStorageItem`/`setStorageItem` from `src/lib/storage.js`. All keys documented in one place, easy to mock, SSR-safe.

---

## Session Log

> Timestamped record of what each session accomplished. New sessions scan this to quickly catch up. Newest first. Format:
> ```
> ### YYYY-MM-DD — [Agent/Owner] — [Session summary in 5 words or less]
> - What was done (bullet points)
> - What was learned (reference Learnings section if applicable)
> - What's unfinished or blocked
> - **Handoff:** What the next session should know or do
> ```

### 2026-02-27 — Denis-Claude — Agent Phone v2 build
- Built Agent Phone v2 with Learnings, Gotchas, Contacts, Session Log
- Mined DEVLOG, NOTES, CLAUDE.md for real knowledge to seed the system
- 10 learnings and 10 gotchas seeded from actual project history
- **Handoff:** v2 is ready. Every new session should read this file on startup. Add your own learnings/gotchas as you discover them. The value of this file grows with every session that contributes.

### 2026-02-24 — Denis-Claude — Agent Phone v1 + Codex
- Built Agent Phone v1 (cross-fork coordination only)
- Built Codex learning system
- Audited full codebase, identified specials flow as launch priority
- 67 commits ahead on Denis's fork
- **Handoff:** Dan is 67 commits behind. He needs to pull from Denis's fork before starting new work. Issue #5 on Dan's repo has details.

---

## Message Board

> Free-form messages between agents/owners. Newest first.

**2026-02-27 (Denis → All):** Agent Phone v2 is live. The big upgrade: this file now carries knowledge forward between sessions, not just coordination status. Every session should read Learnings and Gotchas on startup. If you discover something that would save the next agent time, add it. If you make a mistake worth documenting, add it to Gotchas. The file gets smarter every session.

**2026-02-24 (Denis → Dan):** Hey Dan — Denis says hi. Your specials/events system is solid, all intact. I've been building on top of it. 67 commits ahead on my fork. Pull from `Denisgingras75/whats-good-here` main before starting new work. Full details in Issue #5 on your repo. Let's coordinate through this file going forward — your Claude reads it, my Claude writes it. If you need to say something back, open an issue on my repo with "Agent Phone:" in the title.

---

## Appendix: What Goes Where

| I discovered something new about the system | → **Learnings** section |
|---|---|
| I made a mistake the next agent shouldn't repeat | → **Gotchas** section |
| I'm starting work and need to claim files | → **Active Agents** table |
| I finished a session and want to hand off context | → **Session Log** |
| I need to tell another agent/owner something | → **Message Board** |
| I made a breaking change to shared code | → **Warnings** section |
| I changed the schema, RPCs, or architecture | → **SPEC.md** (canonical) + brief note in Learnings if non-obvious |
| I completed or scoped a task | → **TASKS.md** |
| I finished a chunk of work worth documenting | → **DEVLOG.md** |
