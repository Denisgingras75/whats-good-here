# Top Dishes Near You + Hub Guides — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add "Top Dishes Near You" utility section to Restaurants page and replace Hub's empty state with auto-generated food guides.

**Architecture:** Both features reuse existing `dishesApi.getRankedDishes` and `useDishes` hook. No new RPCs, no schema changes, no API costs. Pure frontend work reshuffling existing data into better UX.

**Tech Stack:** React 19, existing hooks/API layer, CSS variables.

---

## Part A: "Top Dishes Near You" on Restaurants Page

### Task 1: Create TopDishesNearYou component

**Files:**
- Create: `src/components/restaurants/TopDishesNearYou.jsx`
- Modify: `src/components/restaurants/index.js` (add barrel export)

**Step 1: Build the component**

A horizontal scroll of 5 dish cards between the map and the restaurant list. Each card shows:
- Category emoji (via `getCategoryEmoji`)
- Dish name (truncated)
- Rating badge (green, bold)
- Restaurant name
- Distance (if available)
- Tap → navigates to `/dish/:dishId`

Props: `dishes` (array from mapDishes, pre-sorted), `userLocation`, `onSelectDish`

```jsx
import { useMemo } from 'react'
import { getCategoryEmoji } from '../../constants/categories'
import { calculateDistance } from '../../utils/distance'

export function TopDishesNearYou({ dishes, userLocation, onSelectDish }) {
  // Get top dish per restaurant (avoid showing 5 dishes from the same place)
  const topDishes = useMemo(() => {
    if (!dishes || dishes.length === 0) return []
    const seen = {}
    const result = []
    for (let i = 0; i < dishes.length && result.length < 8; i++) {
      const d = dishes[i]
      if (seen[d.restaurant_id]) continue
      seen[d.restaurant_id] = true

      let distance = null
      if (userLocation?.lat && userLocation?.lng && d.restaurant_lat && d.restaurant_lng) {
        distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          d.restaurant_lat, d.restaurant_lng
        ).toFixed(1)
      }

      result.push({ ...d, distance })
    }
    return result
  }, [dishes, userLocation])

  if (topDishes.length === 0) return null

  return (
    <section className="mb-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-1 h-5 rounded-full"
          style={{ background: 'linear-gradient(180deg, var(--color-accent-gold) 0%, var(--color-accent-orange) 100%)' }}
        />
        <h2
          className="font-bold"
          style={{
            color: 'var(--color-text-primary)',
            fontSize: '16px',
            letterSpacing: '-0.01em',
          }}
        >
          Top dishes near you
        </h2>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {topDishes.map(dish => (
          <button
            key={dish.dish_id}
            onClick={() => onSelectDish(dish.dish_id)}
            className="flex-shrink-0 rounded-xl p-3 transition-all active:scale-[0.97]"
            style={{
              width: '160px',
              scrollSnapAlign: 'start',
              background: 'var(--color-card)',
              border: '1px solid var(--color-divider)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            {/* Emoji + rating row */}
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: '24px' }}>{getCategoryEmoji(dish.category)}</span>
              <span
                className="font-bold"
                style={{
                  fontSize: '15px',
                  color: 'var(--color-rating)',
                }}
              >
                {dish.avg_rating != null ? Number(dish.avg_rating).toFixed(1) : '--'}
              </span>
            </div>

            {/* Dish name */}
            <p
              className="font-semibold truncate"
              style={{
                fontSize: '13px',
                color: 'var(--color-text-primary)',
              }}
            >
              {dish.dish_name}
            </p>

            {/* Restaurant */}
            <p
              className="truncate mt-0.5"
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
              }}
            >
              {dish.restaurant_name}
            </p>

            {/* Distance */}
            {dish.distance && (
              <p
                className="mt-1"
                style={{
                  fontSize: '10px',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                {dish.distance} mi away
              </p>
            )}
          </button>
        ))}
      </div>
    </section>
  )
}
```

**Step 2: Add barrel export**

In `src/components/restaurants/index.js`, add:
```js
export { TopDishesNearYou } from './TopDishesNearYou'
```

**Step 3: Wire into Restaurants.jsx**

In `src/pages/Restaurants.jsx`:
1. Import `TopDishesNearYou` from `../components/restaurants`
2. Add the component between the map and the section header, inside `<div className="p-4 pt-5">`:

```jsx
{/* Top Dishes Near You — the answer layer */}
<TopDishesNearYou
  dishes={mapDishes}
  userLocation={location}
  onSelectDish={(dishId) => navigate(`/dish/${dishId}`)}
/>
```

Place this right after the opening `<div className="p-4 pt-5">` and before the section header `<div className="mb-4 flex items-center justify-between">`.

**Step 4: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**

```bash
git add src/components/restaurants/TopDishesNearYou.jsx src/components/restaurants/index.js src/pages/Restaurants.jsx
git commit -m "feat: add Top Dishes Near You section to Restaurants page"
```

---

## Part B: Hub Guides (Replace Empty State)

### Task 2: Create auto-generated food guides for Hub

The Hub currently shows "Nothing happening yet" when no events exist. Replace with food guides that work with zero user input — powered entirely by seeded dish data.

**Files:**
- Create: `src/components/hub/GuideCard.jsx`
- Modify: `src/pages/Hub.jsx`

**Step 1: Define guide configs**

Hardcoded list of guides, each maps to a category query. These are the 6 killer list categories plus a "best overall" guide:

```js
var GUIDES = [
  { id: 'must-try', title: 'Must-Try on MV', subtitle: 'The island\'s best dishes', category: null, emoji: '\u2B50' },
  { id: 'lobster-roll', title: 'Best Lobster Rolls', subtitle: 'Ranked by the crowd', category: 'lobster roll', emoji: '\uD83E\uDD9E' },
  { id: 'seafood', title: 'Best Seafood', subtitle: 'Fresh catch, top picks', category: 'seafood', emoji: '\uD83E\uDD90' },
  { id: 'pizza', title: 'Best Pizza', subtitle: 'Slice by slice', category: 'pizza', emoji: '\uD83C\uDF55' },
  { id: 'breakfast', title: 'Best Breakfast', subtitle: 'Morning favorites', category: 'breakfast', emoji: '\uD83C\uDF73' },
  { id: 'burger', title: 'Best Burgers', subtitle: 'Stacked and ranked', category: 'burger', emoji: '\uD83C\uDF54' },
  { id: 'chowder', title: 'Best Chowder', subtitle: 'Island comfort', category: 'chowder', emoji: '\uD83C\uDF72' },
]
```

**Step 2: Create GuideCard component**

`src/components/hub/GuideCard.jsx`:

A tappable card showing:
- Emoji + title + subtitle
- Preview: top 3 dish names with ratings (inline)
- Tap → navigate to `/browse` with category pre-selected (or Home with category if Browse doesn't support URL params)

```jsx
import { useNavigate } from 'react-router-dom'

export function GuideCard({ guide, dishes }) {
  const navigate = useNavigate()

  // Top 3 dishes for preview
  const preview = (dishes || []).slice(0, 3)

  const handleTap = () => {
    if (guide.category) {
      // Navigate to Browse with category
      navigate('/?category=' + encodeURIComponent(guide.category))
    } else {
      // "Must-Try" goes to Home top 10
      navigate('/')
    }
  }

  return (
    <button
      onClick={handleTap}
      className="w-full rounded-xl p-4 transition-all active:scale-[0.98]"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-divider)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '28px' }}>{guide.emoji}</span>
        <div>
          <h3
            className="font-bold"
            style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
          >
            {guide.title}
          </h3>
          <p
            style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}
          >
            {guide.subtitle}
          </p>
        </div>
        {/* Arrow */}
        <svg
          className="w-4 h-4 ml-auto flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Preview: top 3 dishes */}
      {preview.length > 0 && (
        <div className="space-y-1 ml-10">
          {preview.map((dish, i) => (
            <div
              key={dish.dish_id || i}
              className="flex items-center justify-between"
              style={{ fontSize: '12px' }}
            >
              <span
                className="truncate"
                style={{ color: 'var(--color-text-secondary)', maxWidth: '70%' }}
              >
                {i + 1}. {dish.dish_name}
                <span style={{ color: 'var(--color-text-tertiary)' }}> — {dish.restaurant_name}</span>
              </span>
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: 'var(--color-rating)' }}
              >
                {dish.avg_rating != null ? Number(dish.avg_rating).toFixed(1) : '--'}
              </span>
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
```

**Step 3: Create useGuides hook**

`src/hooks/useGuides.js`:

Fetches top 3 dishes per guide category in a single batch. Uses existing `dishesApi.getRankedDishes`.

```js
import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import { logger } from '../utils/logger'

var GUIDE_CATEGORIES = [null, 'lobster roll', 'seafood', 'pizza', 'breakfast', 'burger', 'chowder']

export function useGuides(location, radius) {
  var { data, isLoading } = useQuery({
    queryKey: ['guides', location?.lat, location?.lng, radius],
    queryFn: async function() {
      // Fetch all ranked dishes once, then slice per category
      var allDishes = await dishesApi.getRankedDishes({
        lat: location?.lat || 41.43,
        lng: location?.lng || -70.56,
        radiusMiles: radius || 50,
        category: null,
        town: null,
      })

      var result = {}
      // "must-try" = top 3 overall
      result[String(null)] = allDishes.slice(0, 3)

      // Per category: filter and take top 3
      for (var i = 0; i < GUIDE_CATEGORIES.length; i++) {
        var cat = GUIDE_CATEGORIES[i]
        if (cat === null) continue
        var filtered = allDishes.filter(function(d) {
          return d.category && d.category.toLowerCase() === cat
        })
        result[cat] = filtered.slice(0, 3)
      }

      return result
    },
    enabled: true,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  if (!data) {
    logger.debug('Guides data not yet loaded')
  }

  return {
    guideData: data || {},
    loading: isLoading,
  }
}
```

**Step 4: Rewrite Hub.jsx**

Key changes:
1. Import `GuideCard`, `useGuides`, `useLocationContext`
2. Show guides section ALWAYS (above events/specials)
3. Replace the empty state: instead of "Nothing happening yet," show guides + a softer "No events this week" note at the bottom
4. Keep events/specials functionality — it shows when data exists (summer)

Structure:
```
Header ("Saturday Afternoon")
↓
"Guides" section header
Guide cards (7 guides with preview dishes)
↓
"Events & Specials" section (only if they exist)
  Filter chips → Featured event → Grouped events → Specials
↓
"No events this week — check back in season" (soft note, not empty state)
```

The empty state with the big calendar icon and "Nothing happening yet" goes away entirely. The page always has content because guides always have data.

**Step 5: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 6: Commit**

```bash
git add src/components/hub/GuideCard.jsx src/hooks/useGuides.js src/pages/Hub.jsx
git commit -m "feat: Hub guides — auto-generated food lists replace empty state"
```

---

## Verification Checklist

After both tasks:

1. `npm run build` passes
2. `npm run lint` — zero new errors in our files
3. No `console.*` (use `logger`)
4. No hardcoded hex in new components (CSS vars only)
5. No ES2023+ syntax
6. No direct Supabase calls from components
7. Restaurants page: map → top dishes → restaurant list (all visible)
8. Hub page: guides show with preview dishes, events show below when available
