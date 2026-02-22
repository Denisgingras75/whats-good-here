# What Changed Since the Merge

**Date:** Feb 22, 2026
**Branch:** `main` (live on Vercel)
**Commits:** 9 new commits, 16 files changed

---

## 1. Dish Page Redesign — "Quick Read, Quick Vote"

**Files:** `src/pages/Dish.jsx`, `src/components/ReviewFlow.jsx`

The dish page is the most important screen — it's where people decide what to order and where they leave reviews. It got a full rework.

### What changed:

**Section reorder** — Reviews and voting used to be buried below photos, variants, and friend ratings. Now the page flows: Hero image > Stats > Smart Snippet (pull quote) > Vote buttons > Reviews > everything else. The stuff people care about is above the fold.

**Smart snippet** — The best review for each dish now shows as a pull quote right below the stats card. Uses the existing `getSmartSnippetForDish` API that was built but never wired up. Shows the review text, author name, and rating. Instant social proof before you even scroll.

**Flattened vote flow** — Used to be a 2-step process that felt like navigating between pages (yes/no > animation > slider/review form). Now it's inline: tap yes/no, the slider + review textarea + photo upload expand right below the buttons. No page transition, no back button needed. The review textarea shows immediately — not hidden behind another tap. This is the single biggest friction reducer for getting people to write reviews.

**Review cards restyled** — Reviews now look like social posts: card backgrounds with rounded corners (instead of divider lines), timestamp in the header next to the name, rating badge in top-right, trust badge at the bottom. Review text is the visual hero.

**Order CTA** — "View menu & order" button links to the restaurant's website. Shows below the stats card so browsers can go straight to ordering.

**Design tightening** — Above-the-fold density improved: tighter padding, smaller hero aspect ratio, compact stats layout. More content visible before scrolling.

---

## 2. Hub Page — "What's Happening"

**Files:** `src/pages/Hub.jsx`, `src/App.jsx`

Brand new page accessible from the bottom nav. Shows events and specials happening on-island.

### Features:
- **Smart heading** — Changes based on time of day: "Friday Night", "Saturday Afternoon", etc.
- **Featured Tonight card** — If there are events today, the first one gets a hero card at the top
- **Filter tabs** — All / Events / Specials
- **Event cards** with date, time, restaurant name, description
- **Special cards** with restaurant branding
- **Empty states** when nothing's happening (with a note that restaurants are still adding events for summer)

The Hub feeds from the `events` and `specials` tables that restaurants manage through their portal.

---

## 3. Home Page — Distance Radius Chip

**File:** `src/pages/Home.jsx`

Added a radius filter chip on the home page. When location is enabled, shows a tappable chip like "Within 5 mi" that lets users adjust how far they want to search. Integrates with the existing `LocationContext` radius preference.

---

## 4. Bottom Nav Reorder

**File:** `src/components/BottomNav.jsx`

Tab order is now: **Home > Restaurants > Hub > You** (was Home > Hub > Restaurants > You). Restaurants is higher priority than Hub for launch.

---

## 5. Real Review Data Pipeline

**Files:** `scripts/harvest-reviews.mjs`, `scripts/fetch-google-reviews.mjs`, `supabase/seed/seed-google-reviews.sql`, `supabase/seed/seed-curated-reviews.sql`

This is backend/data work, not visible in the UI yet (needs SQL run in Supabase). But it's a big deal for launch readiness.

### The problem:
The app had AI-generated template reviews ("The lobster roll here is exceptional..."). They read like AI. We needed real human voices.

### What we built:
A 3-step pipeline that pulls real Google reviews and matches them to specific dishes:

1. **Harvest** — Calls Google Places API for all 96 MV restaurants, saves 461 real reviews with author names, dates, ratings, and full text
2. **Match** — Quality-filters reviews and matches them to dishes in our database. Uses exact dish name matching first, then strong keyword matching. Rejects vague or low-quality reviews. Result: 287 verified matches covering 227 dishes.
3. **Generate** — Creates SQL INSERT statements with full attribution: real author name, real date, Google star rating converted to our 10-point scale, match confidence level

### Also:
- 63 hand-curated reviews from food blogs, MV Times, TripAdvisor, and local press — verified quotes about specific dishes
- Every review tagged with `source_metadata` so we can show "via Google Reviews" attribution
- Pipeline supports Yelp too (just needs an API key) — would add ~288 more reviews

### To activate:
Run the generated SQL in Supabase SQL Editor. The 287 Google reviews + 63 curated reviews are ready to go.

---

## Summary

| Change | User Impact | Status |
|--------|------------|--------|
| Dish page redesign | Faster to read, faster to vote | Live |
| Smart snippet | Instant social proof | Live |
| Flattened vote flow | Less friction = more reviews | Live |
| Review card restyle | Feels like real social content | Live |
| Hub page | Events & specials feed | Live |
| Distance radius chip | Better location filtering | Live |
| Nav reorder | Restaurants more prominent | Live |
| Real review pipeline | 350 real reviews ready | SQL needs to be run |

**Total: 16,400 lines added across 16 files. $0 in new costs (Google Places API is free tier).**
