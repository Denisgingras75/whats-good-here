# Review Decay — Time-Weighted Dish Scores

## Problem
Old reviews misrepresent current quality. Restaurants change — chefs leave, menus rotate, ownership flips. A 5-star lobster roll review from 2024 shouldn't carry the same weight as one from last week. MV restaurants close for winter; off-season reviews are noise.

## Solution
Time-weighted review scoring with seasonal awareness. Reviews fade over time. Archive, don't delete.

## Anti-Bot Bonus
Review decay forces bot farms to re-buy reviews every season. Combined with dish-level granularity (30 dishes = 30x attack cost vs Yelp's 1), faking becomes economically unsustainable at volume.

---

## Decay Curve

| Age | Weight | Rationale |
|-----|--------|-----------|
| 0-7 days | 1.00 | Fresh — full trust |
| 8-90 days | 1.0 → 0.50 | Linear decay — still relevant but fading |
| 91-180 days | 0.50 → 0.25 | Old — context only |
| 181-365 days | 0.25 (floor) | Stale — minimal influence |
| 365+ days | 0.00 (archived) | Visible in history, excluded from score |

Formula (linear interpolation):
```
days = NOW() - vote.created_at
if days <= 7:        weight = 1.0
elif days <= 90:     weight = 1.0 - ((days - 7) / 83) * 0.5
elif days <= 180:    weight = 0.5 - ((days - 90) / 90) * 0.25
elif days <= 365:    weight = 0.25
else:                weight = 0.0  (archived)
```

## MV Seasonal Awareness

MV season: **Memorial Day weekend (late May) → Columbus Day (mid Oct)**

Rules:
- Reviews created during off-season (Nov-May) when restaurant was closed: `is_archived = true` immediately
- Reviews from previous season start at 0.25 weight when new season opens (not 1.0)
- Seasonal constant: `constants/towns.js` → `MV_SEASON = { open: '05-22', close: '10-15' }`

## Schema Changes

### votes table — add columns
```sql
ALTER TABLE votes ADD COLUMN IF NOT EXISTS review_weight NUMERIC(4,3) DEFAULT 1.000;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Index for weighted scoring queries
CREATE INDEX IF NOT EXISTS idx_votes_decay ON votes (dish_id, is_archived, created_at);
```

### New function — calculate_review_weight
```sql
CREATE OR REPLACE FUNCTION calculate_review_weight(vote_created_at TIMESTAMPTZ)
RETURNS NUMERIC AS $$
DECLARE
  days_old NUMERIC;
BEGIN
  days_old := EXTRACT(EPOCH FROM (NOW() - vote_created_at)) / 86400;

  IF days_old <= 7 THEN RETURN 1.000;
  ELSIF days_old <= 90 THEN RETURN ROUND((1.0 - ((days_old - 7) / 83) * 0.5)::NUMERIC, 3);
  ELSIF days_old <= 180 THEN RETURN ROUND((0.5 - ((days_old - 90) / 90) * 0.25)::NUMERIC, 3);
  ELSIF days_old <= 365 THEN RETURN 0.250;
  ELSE RETURN 0.000;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Updated get_ranked_dishes RPC — weighted scoring
```sql
-- Inside get_ranked_dishes, replace simple AVG with weighted average:
weighted_avg = SUM(votes.rating_10 * calculate_review_weight(votes.created_at))
             / NULLIF(SUM(calculate_review_weight(votes.created_at)), 0)

-- Active vote count (excluding archived):
active_votes = COUNT(*) FILTER (WHERE NOT votes.is_archived AND calculate_review_weight(votes.created_at) > 0)
```

### Daily batch job — refresh weights + archive
```sql
-- Run via pg_cron daily at 4 AM ET
UPDATE votes SET
  review_weight = calculate_review_weight(created_at),
  is_archived = CASE WHEN calculate_review_weight(created_at) = 0 THEN true ELSE is_archived END
WHERE NOT is_archived;
```

## Frontend

### DishListItem (ranked/voted variants)
- Show recency indicator: "Last reviewed 3 days ago" or "120 days ago" in muted text
- Style: `style={{ color: 'var(--color-text-tertiary)' }}` — subtle, not loud
- No decay percentage shown to users — they don't need to understand the math

### DishDetail page
- Vote list sorted by date (newest first)
- Archived votes: show with italic text + "Archived" label, collapsed by default
- "X active reviews" count excludes archived

### No changes to
- Vote submission flow (new votes always weight=1.0)
- SearchHero
- Browse/CategoryBar

## Jitter Integration (Phase 2)

Passport age as trust multiplier (ADDITIVE, not multiplicative — caps at ±20%):
```
passport_days = NOW() - profiles.created_at
passport_factor = CLAMP(passport_days / 180 * 0.2, -0.2, 0.2)
final_weight = review_weight * (1 + passport_factor)
```

- New passport (<30 days) reviewing = slight penalty (−10-20%)
- Old passport (180+ days) reviewing = slight boost (+20%)
- This is Phase 2 — ship decay first, add passport multiplier after Jitter integration

## Testing

1. Unit: `calculate_review_weight()` at boundaries (0, 7, 8, 90, 91, 180, 365, 366 days)
2. Integration: seed 5 votes at different ages, verify `get_ranked_dishes` returns correct weighted average
3. Seasonal: seed off-season vote, verify `is_archived = true`
4. Edge: dish with only archived votes → should show "No recent reviews" not a stale score

## Decisions (2026-03-07)

1. **MV season**: Memorial Day (May 22) → Columbus Day (Oct 15)
2. **Archive visibility**: Show faded, never hide. Transparency IS the defense.
3. **Floor weight**: 0.25 before full archive at 365 days
4. **Early Reviewer badge**: Yes — their review decayed but their contribution didn't
5. **Core principle**: Transparency over algorithm. Show exactly how scores work. The opposite of Yelp's hidden filter. Users trust systems they can see through. Faking becomes pointless when everyone can see the math.

## Build Strategy

**Ship the foundation now. Build the engine when you have fuel.**

At launch there are zero real reviews. Decay scoring on an empty database is engineering for a problem 3-6 months away. Every review is fresh at launch — weights are all 1.0.

### Phase 1 — Memorial Day (NOW)
- Schema: add `review_weight` + `is_archived` columns (dormant)
- Deploy `calculate_review_weight()` function (no queries use it yet)
- Build transparency display: "Based on X reviews this season", review dates always visible, season dates on restaurant cards
- Early Reviewer badge definition in badges table

### Phase 2 — Post-Launch (~August)
- Activate weighted scoring in `get_ranked_dishes` RPC
- Daily pg_cron job to refresh weights + archive
- Seasonal archive trigger
- Frontend: faded archived reviews, decay indicators

### Phase 3 — Post-Jitter Integration
- Passport age multiplier (additive, ±20% cap)
- Cross-session trust scoring
