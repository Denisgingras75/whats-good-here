# Food Journal Profile Redesign

**Date:** 2026-02-22
**Status:** Approved
**Branch target:** main

---

## Problem

The Pioneer (local foodie) persona is the weakest link in the WGH flywheel. They generate 10-50x the data of a Browser, but the current profile is a filing cabinet — five tabs of data rows with no narrative, no identity, no reason to come back tomorrow. The app collects data brilliantly but doesn't reflect it back compellingly.

Meanwhile, the profile IS the viral distribution mechanism. "I'm coming to the vineyard, where should we eat?" → Pioneer shares their profile link → recipient gets a curated food guide from someone they trust → downloads WGH. This only works if the profile feels like a food diary worth sharing, not a spreadsheet.

## Foundational Principle

**The personal food page IS the product for Pioneers. The rankings are the product for Browsers. Same data, different frame.**

Goodreads works because people track books for themselves. The community data is a side effect of selfish behavior. WGH must work the same way — a Pioneer "builds their food life" (selfish, strong motivation), not "rates dishes to help strangers" (altruistic, weak).

Reference: Denis's original vision (Codex, Feb 2026): "Do we use good reads style of your own collection of foods, so it can be almost bloggy and self indulgent so even if there's not a lot of people initially, it still works for them to track it over time."

Reference models: Goodreads (shelves + collection), Letterboxd (chronological diary), Untappd (check-in feed + social).

## Design

### Approach: Journal + Shelves (Hybrid)

Default view is a reverse-chronological journal feed. Shelf filters let you narrow to a specific category. Stats hero at top with identity and food map.

### The Profile Hero

Always visible at top:

- **Identity row:** Avatar (or initials) + display name + follow stats (followers/following). Unchanged from current.
- **Food Map strip:** Compact horizontal bar: `47 dishes · 18 restaurants · 8 categories`. Tappable to expand into full food map (categories explored, top 3 with emoji counts).
- **Rating identity:** One-line personality tag: "Tough Critic · 0.3 below crowd" or "Generous Rater · Pizza Authority". From existing `ratingStyle` + `topCategory` data.
- **Share My Picks button:** Prominent in hero when on-island. Generates location-filtered profile link.

The hero consolidation aligns with ui-overhaul's `HeroIdentityCard` changes (stats moved into hero as compact pills). Cherry-pick that work.

### Shelf Filters

Sticky horizontal row below the hero:

```
All | Good Here | Heard That's Good There | Wasn't Good Here
```

- **All** = full journal feed (default, selected on load)
- Tapping a shelf filters the feed to just those entries
- Active filter gets visual indicator (underline or pill)
- Replaces the current 5-tab system

**What gets cut:**
- "Unrated" tab → becomes a badge/prompt in the hero or a floating action
- "Reviews" tab → reviews are inline on vote cards

**Naming:** Keep brand language. "Good Here" / "Wasn't Good Here" / "Heard That's Good There" — not generic labels like "Worth It" or "Saved". The shelf names ARE the product vocabulary.

### Journal Feed (Default View)

Reverse-chronological feed of all food activity. Each entry is a card.

### Entry Card Types

**"Good Here" card:**
- Dish photo (left thumbnail) or category food icon placeholder
- **Dish name** (bold) + restaurant name + town/city (secondary)
- Your rating: big, color-coded `/10`
- Community consensus: small, next to yours ("Crowd: 8.4")
- Review text inline if written (2-line clamp, tappable to expand)
- Timestamp: "2 days ago" or "Jan 15"
- Tappable → navigates to Dish page

**"Wasn't Good Here" card:**
- Same layout but muted styling
- Rating visible but card doesn't celebrate it
- Feels like a note-to-self: "skip this next time"

**"Heard That's Good There" card:**
- No rating (haven't tried it yet)
- Dish name + restaurant + town/city
- Prominent CTA: **"Tried it?"** button → opens vote flow directly
- Once voted, auto-moves from Heard shelf to Good Here or Wasn't Good Here
- The lifecycle: **Heard → Tried → Rated**

**All cards show location** (restaurant + town/city). Critical once journal goes beyond MV — Boston tacos sit next to Vineyard lobster rolls.

### Dish Lifecycle

```
Heard That's Good There  →  Vote  →  Good Here
                                  →  Wasn't Good Here
```

The "Heard" shelf is explicitly the **want-to-try list**. It's not a general bookmark — it's "someone told me about this, I haven't tried it yet." Once you try and rate it, it moves.

### Scope: Universal Journal

The food journal works **anywhere**, not just Martha's Vineyard. A Pioneer in Boston logs a taco — that entry lives in their journal. Community rankings only appear where there's enough local data, but personal tracking is universal.

This is how WGH spreads: Pioneers carry their food journal home. By Memorial Day, they already have profiles with history. The journal works as a personal tool even with zero other users in their city.

### Visibility: Public by Default

The food journal is your public identity. Other users can browse your diary, follow your taste. This is how foodies build reputation and how taste-matching works. Your ratings feed community rankings anyway — the journal just makes that visible.

### Sharing

- **Share button** in hero generates a public link to your profile
- **Location filter on public profiles:** Viewer can filter by location — "Show me just your Martha's Vineyard entries"
- **Share link defaults to location-filtered:** `whatsgoodhere.com/@denis?location=marthas-vineyard`
- The recipient sees a **curated food guide** from someone they trust, not a raw diary
- **No account required to view** — the shared profile is the acquisition funnel

### What Changes From Current

**Redesigned:**
- Profile page layout: hero → shelf filters → journal feed (replaces 5-tab system)
- Cards become journal entries with timestamps, not data rows
- "Heard" entries get "Tried it?" CTA with auto-reclassification on vote
- Share button with location-filtered link generation

**Stays the same:**
- All existing hooks (`useUserVotes`, `useFavorites`, `useUnratedDishes`) — data layer untouched
- HeroIdentityCard (minor tweaks)
- Rating identity / standout picks logic
- Follow system, taste compatibility
- UserProfile (other people's profiles) gets same feed layout

**Cut:**
- 5-tab navigation → 4 shelf filters (All / Good Here / Heard / Wasn't Good Here)
- Separate "Reviews" tab → reviews inline on cards
- Separate "Unrated" tab → badge or prompt, not a shelf

**New work:**
- Journal feed component (reverse chronological card list)
- Three card types (Good Here, Wasn't Good Here, Heard)
- Shelf filter bar (horizontal, sticky)
- Location filter on public profiles
- Share link generation with location param
- "Tried it?" flow on Heard cards (tap → vote modal → auto-reclassify)

### Not in Launch Scope

- Combined social activity feed (follow people's entries)
- Notifications ("your review was featured")
- Streaks / weekly digests
- Category leaderboards

---

## Compatibility with ui-overhaul Branch

The ui-overhaul agent made profile changes:
- Renamed tabs to generic labels ("Worth It", "Skip", "Saved") — **we override this** with brand language
- Removed "Unrated" tab — **aligned** with our design
- Consolidated stats into HeroIdentityCard as compact pills — **cherry-pick this**
- Created `VotedDishCard` component — **superseded** by our journal card types
- Still uses tab structure — **we replace entirely** with journal feed

**Build against main, not ui-overhaul.** Cherry-pick only the HeroIdentityCard consolidation.

---

## Bug Fix: Map Tile Underlay

**Root cause:** CARTO dark tiles (`basemaps.cartocdn.com`) are blocked by Content-Security-Policy in `vercel.json`. Only `*.tile.openstreetmap.org` is allowed in `img-src` and `connect-src`.

**Fix:** Add `https://*.basemaps.cartocdn.com` to both `img-src` and `connect-src` in `vercel.json` line 33.

The ui-overhaul agent worked around this by replacing the compact map with a static "View Map" card — but that's a workaround, not a fix. The full-screen map overlay also fails to load CARTO tiles in production.
