# Agent Phone — WGH Cross-Fork Sync

Last updated by **Denis's Claude** — 2026-02-25

---

## How This Works

Two developers (Denis + Dan), each with their own Claude Code sessions, coordinate through this file. Think of it as a jail phone with a window — you can see the other side's work, and this file is the phone line.

**Denis's Claude:** Reads and writes this file directly. Update the status section every time you start or finish meaningful work.

**Dan's Claude:** Read this file on session startup via:
```bash
curl -s https://raw.githubusercontent.com/Denisgingras75/whats-good-here/main/AGENT-PHONE.md
```
To reply or flag something, open an issue on Denis's repo:
```bash
gh issue create --repo Denisgingras75/whats-good-here --title "Agent Phone: [subject]" --body "[message]"
```

---

## Current Status

### Denis's Side
- **Working on:** Coordination with Dan — reviewed all GitHub messages, aligned on "build on Denis's base" strategy
- **Last session:** 2026-02-25 — Reviewed Dan's Issues #8 and #9, agreed to let Dan's team reskin the frontend
- **Branch:** `main` (67 commits ahead of upstream)
- **Don't touch:** Frontend pages — Dan's team is reskinning. Coordinate in Issue #9 before changing pages.

### Dan's Side
- **Last known:** 2026-02-25 — Dan's Claude confirmed they'll build on Denis's base
- **Working on:** Homepage simplification (Jobs-style), fetching `denis/main` as starting point
- **Branch:** Branching off Denis's `main`
- **Off-limits:** `Home.jsx`, `SearchHero.jsx`, `Top10Compact.jsx` (active redesign)

---

## Active Warnings

- **DishListItem is the single source of truth now.** Denis refactored all dish display into one component with 3 variants. Don't create new dish card components.
- **13 components were deleted** in spring cleaning. Don't import: RankedDishRow, VotedDishCard, TopDishCard, Top10Compact, CategorySkeleton, SearchHero, DishCard, CategoryImageCard, CategoryGrid, or any component from the old profile tabs.
- **Profile uses JournalFeed now.** Old 5-tab profile system is gone. Replaced with shelf-based food journal (Good Here / Not Good Here / Heard That's Good There / All).
- **E2E tests exist.** Run `npm run test:e2e` before pushing. 25 scenarios, Playwright, port 5174.

---

## Recent Changes (Denis's 67 commits)

| What | Impact | Files |
|------|--------|-------|
| Unified DishListItem | All dish display through one component | `src/components/DishListItem.jsx` |
| Food Journal Profile | Profile page completely rebuilt | `src/pages/Profile.jsx`, `src/components/profile/` |
| Dish Page Redesign | Verdict/Action/Evidence layout | `src/pages/Dish.jsx` |
| E2E Test Suite | 25 Playwright scenarios | `e2e/`, `playwright.config.js` |
| Spring Cleaning | 13 dead components removed | Various |
| Pitch Page | `/for-restaurants` route | `src/pages/ForRestaurants.jsx` |
| Shared Components | CategoryChips, SectionHeader extracted | `src/components/` |

---

## Message Board

**2026-02-24 (Denis → Dan):** Hey Dan — Denis says hi. Your specials/events system is solid, all intact. I've been building on top of it. 67 commits ahead on my fork. Pull from `Denisgingras75/whats-good-here` main before starting new work. Full details in Issue #5 on your repo. Let's coordinate through this file going forward — your Claude reads it, my Claude writes it. If you need to say something back, open an issue on my repo with "Agent Phone:" in the title.

**2026-02-25 (Denis → Dan) — RE: Issue #8 (backend branch) & Dan's "build on your base" proposal:** Cool. Denis is in. Building on the existing codebase and reskinning makes way more sense than cherry-picking. Take the week, get your bearings, PR it back when ready. One ask: **use threaded replies on issues with clear subject references** (like "RE: Issue #8" or a tracking number) so both sides know which conversation we're in. These threads are getting hard to follow without that. Let's go — 87 days.
