# Curated Local Lists — Design

**Date:** 2026-02-27
**Status:** Approved

## Problem

Tourists land on WGH and see algorithm-ranked dishes — useful but impersonal. The app's promise is "know what's good here like a local would tell you." That requires actual locals, with names and faces, sharing their picks.

Meanwhile, existing users have no way to see their own voting history as a ranked personal list.

## Solution: Two Features

### 1. Curator Lists (Launch Content)

~15 hand-picked locals (Denis's friends — restaurant people, bartenders, wine guys, taxi drivers) each publish ranked top 10 lists with personal blurbs per pick.

**Curator types:**
- Food curators: overall top 10 + optional category-specific lists (burgers, vegan, etc.)
- Cocktail specialists: top 10 cocktails
- Wine specialists: top wine selections

**Each curator has:** name, photo, one-liner bio, specialty tag.
**Each pick has:** rank position (1-10), dish reference, short blurb (~200 chars).
**Curator picks auto-generate votes** in the crowd system at full weight (1x).

### 2. Auto-Profile Lists (Every User)

Every user's profile auto-shows their personal top 10 from vote history. Category chips filter to sub-lists (your top burgers, your top seafood, etc.). No new tables — query on existing votes.

## Data Model

### `curators` table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → profiles | Nullable — curator may not have app account yet |
| name | TEXT NOT NULL | Display name |
| photo_url | TEXT | Profile photo |
| bio | TEXT | One-liner: "MV local, 15 years" |
| specialty | TEXT | "food", "cocktails", "wine" |
| is_active | BOOLEAN DEFAULT true | Controls visibility |
| display_order | INT | Homepage card sort order |
| created_at | TIMESTAMPTZ | |

### `curator_picks` table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| curator_id | UUID FK → curators | |
| dish_id | UUID FK → dishes | |
| rank_position | INT (1-10) | Position in list |
| blurb | TEXT | ~200 chars, personal recommendation |
| list_category | TEXT | NULL = overall, "burger" = burger list, etc. |
| created_at | TIMESTAMPTZ | |

**Unique constraint:** `(curator_id, list_category, rank_position)` — one dish per rank per list.

### Auto-vote trigger

On `curator_picks` INSERT, create a `votes` row:
- `source = 'curator'`
- `rating_10` derived from rank: #1 = 9.8, #2 = 9.5, descending to #10 = 8.0
- Full weight (1x), not 0.5x like AI votes

## Homepage Experience

**Layout (top to bottom):**
1. Search bar (existing)
2. **"Local Picks"** — horizontal scroll of curator cards (photo circle, name, specialty, bio)
3. Tap curator → full list view with ranked picks and blurbs
4. Existing "Top Rated Nearby" ranked dish list below (unchanged)

Two stories: "what the locals love" (editorial) + "what everyone's rating" (algorithmic).

## Curator List Detail

Route: `/curator/:id` (shareable link)

- Curator header: photo, name, bio, specialty
- Ranked picks #1-10 with podium treatment (#1-3 gold/silver/bronze)
- Each pick: dish name, restaurant, curator's blurb in italics
- Tap pick → DishDetail page
- If curator has multiple lists: category chips to switch (All | Burgers | Seafood)

## Auto-Profile Lists

On every user's profile page:
- "Your Top 10" auto-generated from highest `rating_10` votes
- "See All" expands full history
- Category chips filter by dish category (only categories user has voted in)
- Curator profiles show BOTH editorial picks and personal vote history

## Query: Auto Profile List

```sql
SELECT d.name, d.category, v.rating_10, r.name as restaurant_name
FROM votes v
JOIN dishes d ON d.id = v.dish_id
JOIN restaurants r ON r.id = d.restaurant_id
WHERE v.user_id = $1 AND v.source = 'user'
ORDER BY v.rating_10 DESC
LIMIT 10;
```

Category filter: add `AND d.category = $2`.

## RLS

- `curators`: public read (everyone sees curator profiles), admin insert/update
- `curator_picks`: public read, admin insert/update/delete
- `votes` from curator trigger: inherits existing votes RLS

## Cost

$0. All local data, no external APIs.
