# Search Engine v2 — Design Doc

**Date:** 2026-02-17
**Status:** Approved
**Priority:** Tags + ranking first, then FTS + parser

---

## Problem

Current search takes the first meaningful word from a query and runs 3 parallel ILIKE substring matches. "Fried chicken" searches for "fried". Ranking is raw `avg_rating DESC`. Tags column exists but is nearly empty (18 tags, mostly cuisine types redundant with `restaurants.cuisine`). The result: search feels like a database lookup, not intent interpretation.

## Goals

1. Multi-word search that respects phrase intent ("lobster roll" returns lobster rolls, not lobster bisque)
2. Tag vocabulary that captures user intent ("something light", "spicy", "quick lunch")
3. Ranking that accounts for vote confidence, not just raw rating
4. Deterministic query parsing for structured intent (town, price, restaurant)
5. No LLM dependency. No food graph. Pure data + math.

---

## Layer 1: Tags (~32 intent-driven tags)

### Vocabulary

Each tag has a one-line operational definition (what qualifies).

#### Texture/Preparation
| Tag | Definition |
|-----|-----------|
| `crispy` | Fried, breaded, or has a deliberately crunchy exterior |
| `tender` | Slow-cooked, braised, or falls-apart texture |
| `smoky` | Grilled, smoked, or charred preparation |
| `raw` | Sashimi, tartare, crudo — uncooked protein |
| `fried` | Deep-fried or pan-fried as primary cooking method |
| `grilled` | Cooked on a grill as primary method |

#### Flavor Profile
| Tag | Definition |
|-----|-----------|
| `spicy` | Noticeable heat — jalapeño level or above |
| `sweet` | Dessert-level sweetness or sweet glaze/sauce |
| `tangy` | Vinegar, citrus, or fermented sour notes |
| `savory` | Umami-forward — cheese, soy, mushroom, bacon |
| `rich` | Heavy cream, butter, cheese, or high-fat preparation |

#### Occasion/Vibe
| Tag | Definition |
|-----|-----------|
| `quick-bite` | Ordered and eaten in <15 min, counter service or grab-and-go |
| `date-night` | Plated, sit-down, presentation matters |
| `late-night` | Available after 9pm at places open late |
| `brunch` | Typically served at brunch service (eggs, mimosas territory) |
| `comfort` | Nostalgic, warming, "mom's cooking" energy |

#### Dietary
| Tag | Definition |
|-----|-----------|
| `vegetarian` | No meat or fish |
| `vegan` | No animal products |
| `gluten-free` | No wheat/gluten (naturally or modified) |
| `dairy-free` | No milk, cheese, butter, cream |

#### Format
| Tag | Definition |
|-----|-----------|
| `shareable` | Typical serving intended for 2+ people or commonly split |
| `handheld` | Eaten without utensils — sandwich, taco, roll, wrap |
| `big-plate` | Large entree, full meal on its own |
| `snack` | Small portion, appetizer-sized, not a full meal |
| `side-dish` | Accompaniment, not ordered as main |

#### Price Feel
| Tag | Definition |
|-----|-----------|
| `budget-friendly` | Under $15 and feels like a deal |
| `splurge` | Over $30 or premium positioning |

#### Local Signal
| Tag | Definition |
|-----|-----------|
| `local-catch` | Uses locally sourced seafood from MV/Cape waters |
| `island-favorite` | Consistently top-rated or iconic MV dish (editorial) |
| `tourist-classic` | What visitors specifically come for (lobster rolls, chowder) |

#### Meta
| Tag | Definition |
|-----|-----------|
| `healthy` | Low-calorie, whole ingredients, no heavy sauces or frying |
| `fresh` | Made to order, raw ingredients, not reheated or processed |
| `light` | Low satiety — salad, poke, grain bowl, no heavy starch/cream |

### Synonym Expansion Table (query-time)

When a user searches for a term, expand it to matching tags before querying:

```js
const TAG_SYNONYMS = {
  'light':    ['light', 'fresh', 'healthy'],
  'healthy':  ['healthy', 'fresh', 'light'],
  'comfort':  ['comfort', 'rich', 'savory'],
  'hearty':   ['comfort', 'rich', 'big-plate'],
  'fresh':    ['fresh', 'light', 'raw'],
  'cheap':    ['budget-friendly'],
  'fancy':    ['date-night', 'splurge'],
  'quick':    ['quick-bite', 'handheld', 'snack'],
  'fried':    ['fried', 'crispy'],
  'bbq':      ['smoky', 'grilled'],
  'filling':  ['big-plate', 'comfort', 'rich'],
  'snack':    ['snack', 'quick-bite', 'side-dish'],
  'local':    ['local-catch', 'island-favorite'],
  'share':    ['shareable'],
  'kids':     ['handheld', 'comfort', 'budget-friendly'],
}
```

This is a flat 1-page map. No ontology. Maintained in `src/constants/tags.js`.

### Tagging Rules
- Every dish gets 5-12 tags
- Tags are lowercase, hyphenated (`quick-bite` not `Quick Bite`)
- Cuisine tags removed from dishes (redundant with `restaurants.cuisine`)
- Migration script assigns tags based on category + dish name pattern matching
- Manual curation pass on top 150 dishes by vote count

---

## Layer 2: Multi-Word Search + FTS

### Phase A: Multi-token AND retrieval (ship first)

Replace single-word ILIKE with a fallback ladder:

1. **Exact phrase match** on dish name (`name ILIKE '%fried chicken%'`) — highest priority
2. **All-token AND** on dish name (`name ILIKE '%fried%' AND name ILIKE '%chicken%'`)
3. **Token match across fields** — AND tokens across name + category + restaurant name + cuisine + tags
4. **OR-token fallback** if results < 3 — broadens to any token matching any field

Default is AND for intent-bearing tokens. OR is the last resort.

### Phase B: Postgres FTS (ship after Phase A is stable)

Add to dishes table:
```sql
ALTER TABLE dishes ADD COLUMN search_vector TSVECTOR;
```

**Denormalize restaurant fields into dishes** for clean single-index FTS:
```sql
ALTER TABLE dishes ADD COLUMN restaurant_name_cache TEXT;
ALTER TABLE dishes ADD COLUMN town_cache TEXT;
ALTER TABLE dishes ADD COLUMN cuisine_cache TEXT;
```

**Trigger on dishes** (INSERT/UPDATE): builds search_vector from:
- Weight A: dish name
- Weight B: restaurant_name_cache, category
- Weight C: tags (array_to_string), town_cache
- Weight D: cuisine_cache

**Trigger on restaurants** (UPDATE of name/town/cuisine): updates denormalized fields + rebuilds search_vector for all dishes of that restaurant. Lightweight — restaurant renames are rare.

**Query with** `websearch_to_tsquery` for natural multi-word + phrase behavior.

**Fuzzy fallback** with `pg_trgm` extension:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_dishes_name_trgm ON dishes USING GIN(name gin_trgm_ops);
```
If FTS returns < 3 results, fall back to trigram similarity instead of ILIKE.

### Sanity Checks
- "lobster roll" → lobster rolls first, not lobster bisque
- "fried chicken" → fried chicken dishes, not "fried rice"
- "what's good at Larsen's" → dishes at Larsen's

---

## Layer 3: Ranking Function

### Replace `avg_rating DESC` with Bayesian shrinkage + bonuses

```
score = base_score + distance_bonus + trend_bonus

WHERE:
  base_score = (v / (v + m)) * R + (m / (v + m)) * C

  v = total_votes for this dish
  R = dish avg_rating
  C = global mean rating across all dishes (recomputed periodically)
  m = prior strength (tunable, start at 10)

  distance_bonus = CASE
    WHEN distance_miles < 1 THEN 0.3
    WHEN distance_miles < 3 THEN 0.15
    ELSE 0
  END

  trend_bonus = LEAST(0.05 * LN(1 + recent_votes_14d), 0.25)
```

**Behavior:**
- 9.0 rating / 2 votes / C=7.5 / m=10 → base = (2/12)*9.0 + (10/12)*7.5 = 1.5 + 6.25 = **7.75**
- 8.5 rating / 30 votes / C=7.5 / m=10 → base = (30/40)*8.5 + (10/40)*7.5 = 6.375 + 1.875 = **8.25**
- Well-tested dish wins. New dish is skeptically placed, not buried.

**Trend:** log-based, capped at 0.25. No cliff. A dish with 10 recent votes gets ~0.12 bonus. 50 recent votes gets ~0.20.

**Implementation:** New Postgres function `search_score()` used in both `get_ranked_dishes` ORDER BY and search result ranking. One brain, everywhere.

**Global mean C:** Materialized view or periodic recompute. Doesn't need to be real-time.

---

## Layer 4: Query Parser (server-side)

### Location: Postgres function called by search RPC

Not an Edge Function (no extra network hop). Not client-side (consistency).

### Input/Output

Input: raw query string
Output: structured query plan (JSONB)

```json
{
  "text": "fried chicken",
  "tokens": ["fried", "chicken"],
  "town": "Oak Bluffs",
  "max_price": null,
  "tags": ["crispy"],
  "restaurant": null,
  "open_now": false
}
```

### Patterns Parsed

| Pattern | Examples | Extraction |
|---------|----------|------------|
| Town names | "in Oak Bluffs", "OB pizza", "VH tacos" | town filter |
| Town abbreviations | OB, VH, ET, WT, CH, AQ | mapped to full names |
| Price ceiling | "under $20", "<$15", "cheap" | max_price or budget-friendly tag |
| Restaurant prefix | "at Larsen's", "from Back Door" | restaurant name filter |
| Open now | "open now", "tonight" | open_now flag (noop until hours exist) |
| Tag synonyms | "something light", "cheap lunch" | expanded via synonym table |

### Client-side helper

A thin JS version of the parser in `src/utils/queryParser.js` — for **display only** (showing chips like "Oak Bluffs", "<$30" as the user types). Not the source of truth for execution.

---

## Layer 5: What We're NOT Building

- **LLM intent resolver** — Phase 2. Parser + tags + FTS handles 80%+ of queries.
- **"Open now" filtering** — Parser recognizes intent, but no hours data exists. Noop flag.
- **Food graph / hierarchy** — Tags + synonym expansion cover intent without maintenance burden.
- **Personalized ranking** — No user taste profile weighting yet.
- **Category search results in dropdown** — Keep existing behavior, just improve dish results.

---

## Implementation Order

### Sprint 1: Tags + Ranking (ship this week)
1. Define tag vocabulary in `src/constants/tags.js` with synonym expansion map
2. Write SQL migration to populate tags on all existing dishes (category + name pattern matching)
3. Manual curation pass on top dishes
4. Implement `search_score()` Postgres function (Bayesian shrinkage + distance + trend)
5. Update `get_ranked_dishes` to use `search_score()` for ORDER BY
6. Compute and cache global mean rating C

### Sprint 2: Multi-word Search (immediately after)
7. Rewrite `dishesApi.search()` with multi-token AND + fallback ladder
8. Add tag synonym expansion at query time
9. Ship and validate sanity checks

### Sprint 3: FTS + Parser
10. Denormalize restaurant fields into dishes (migration + triggers)
11. Add `search_vector` tsvector column + trigger + GIN index
12. Enable `pg_trgm` extension + trigram index on dish name
13. New `search_dishes` RPC using FTS with trigram fallback
14. Implement server-side query parser in the search RPC
15. Add client-side parser helper for UI chips
16. Wire everything together in `dishesApi.search()`

### Sprint 4: Discovery (later)
17. "Top in [town]" preset queries
18. "Trending this week" based on trend_bonus
19. "Open now" (requires hours data schema addition)

---

## Files Touched

| File | Change |
|------|--------|
| `src/constants/tags.js` | New tag vocabulary + synonym expansion map |
| `supabase/schema.sql` | search_vector, denormalized cols, triggers, search_score(), search RPC |
| `supabase/migrations/` | Tag population, FTS setup, ranking function |
| `src/api/dishesApi.js` | Rewrite search() to use new RPC + multi-token logic |
| `src/utils/queryParser.js` | New: client-side parser helper for UI display |
| `src/hooks/useDishSearch.js` | Pass structured query plan instead of raw string |
| `src/components/DishSearch.jsx` | Show parsed chips (town, price) in UI |
