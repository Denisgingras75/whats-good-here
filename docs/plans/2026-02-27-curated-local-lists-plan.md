# Curated Local Lists — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Launch with ~15 real locals' curated top 10 lists as the homepage's primary content, plus auto-generated personal top 10 lists on every user's profile.

**Architecture:** Two new tables (`curators`, `curator_picks`) with an auto-vote trigger. New API file + hooks + 3 new components. Homepage gets a curator cards section above the ranked list. New `/curator/:id` route for shareable list detail. Profile page gets an auto-generated "Your Top 10" section from existing vote data.

**Tech Stack:** Supabase (schema + RPCs + RLS), React 19, React Query, CSS variables, existing DishListItem component.

---

### Task 1: Schema — Add `curators` and `curator_picks` tables

**Files:**
- Modify: `supabase/schema.sql` (add after profiles table, ~line 104)
- Create: `supabase/migrations/20260227_curators.sql`

**Step 1: Add tables to schema.sql**

Add after the `profiles` table block (~line 104):

```sql
-- 1e. curators (hand-picked local experts who publish top 10 lists)
CREATE TABLE IF NOT EXISTS curators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  specialty TEXT NOT NULL DEFAULT 'food',
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1f. curator_picks (ranked dish picks with personal blurbs)
CREATE TABLE IF NOT EXISTS curator_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curator_id UUID NOT NULL REFERENCES curators(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  rank_position INT NOT NULL CHECK (rank_position >= 1 AND rank_position <= 10),
  blurb TEXT,
  list_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (curator_id, list_category, rank_position)
);
```

Also update the `votes.source` CHECK constraint to allow 'curator':

```sql
source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'ai_estimated', 'curator')),
```

**Step 2: Create migration file**

Write `supabase/migrations/20260227_curators.sql` with the same CREATE TABLE statements plus the ALTER for votes source constraint:

```sql
-- Add curator source to votes
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_source_check;
ALTER TABLE votes ADD CONSTRAINT votes_source_check CHECK (source IN ('user', 'ai_estimated', 'curator'));
```

**Step 3: Commit**

```bash
git add supabase/schema.sql supabase/migrations/20260227_curators.sql
git commit -m "feat: add curators and curator_picks schema"
```

---

### Task 2: Trigger — Auto-generate votes from curator picks

**Files:**
- Modify: `supabase/schema.sql` (add trigger after existing triggers section)
- Modify: `supabase/migrations/20260227_curators.sql` (append trigger)

**Step 1: Write the trigger function**

Append to the migration file and add to schema.sql triggers section:

```sql
-- Auto-generate a vote when a curator pick is inserted
CREATE OR REPLACE FUNCTION create_vote_from_curator_pick()
RETURNS TRIGGER AS $$
DECLARE
  v_rating DECIMAL(3,1);
BEGIN
  -- Rank 1 = 9.8, rank 2 = 9.5, rank 3 = 9.2, ..., rank 10 = 7.1
  v_rating := 10.0 - (NEW.rank_position * 0.3) + 0.1;

  -- Only insert if curator has a user_id linked
  IF (SELECT user_id FROM curators WHERE id = NEW.curator_id) IS NOT NULL THEN
    INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, source, review_text)
    VALUES (
      NEW.dish_id,
      (SELECT user_id FROM curators WHERE id = NEW.curator_id),
      true,
      v_rating,
      'curator',
      NEW.blurb
    )
    ON CONFLICT (dish_id, user_id) WHERE source = 'user'
    DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER curator_pick_auto_vote
  AFTER INSERT ON curator_picks
  FOR EACH ROW
  EXECUTE FUNCTION create_vote_from_curator_pick();
```

**Note:** The ON CONFLICT targets the existing partial unique index on `(dish_id, user_id) WHERE source = 'user'`. Curator votes won't conflict since they have `source = 'curator'`. But if a curator also voted as a regular user, the curator vote is a separate row — this is intentional (curator picks are editorial, user votes are personal).

**Step 2: Commit**

```bash
git add supabase/schema.sql supabase/migrations/20260227_curators.sql
git commit -m "feat: add auto-vote trigger for curator picks"
```

---

### Task 3: RLS — Row-level security for curator tables

**Files:**
- Modify: `supabase/schema.sql` (RLS section)
- Modify: `supabase/migrations/20260227_curators.sql` (append)

**Step 1: Add RLS policies**

```sql
-- Curators: public read, admin-only write
ALTER TABLE curators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active curators"
  ON curators FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage curators"
  ON curators FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin')
  );

-- Curator picks: public read, admin-only write
ALTER TABLE curator_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view curator picks"
  ON curator_picks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage curator picks"
  ON curator_picks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_app_meta_data->>'role' = 'admin')
  );
```

**Step 2: Commit**

```bash
git add supabase/schema.sql supabase/migrations/20260227_curators.sql
git commit -m "feat: add RLS policies for curators"
```

---

### Task 4: RPCs — `get_curators` and `get_curator_picks`

**Files:**
- Modify: `supabase/schema.sql` (RPCs section)
- Modify: `supabase/migrations/20260227_curators.sql` (append)

**Step 1: Write `get_curators` RPC**

```sql
CREATE OR REPLACE FUNCTION get_curators()
RETURNS TABLE (
  curator_id UUID,
  curator_name TEXT,
  photo_url TEXT,
  bio TEXT,
  specialty TEXT,
  display_order INT,
  pick_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS curator_id,
    c.name AS curator_name,
    c.photo_url,
    c.bio,
    c.specialty,
    c.display_order,
    COUNT(cp.id) AS pick_count
  FROM curators c
  LEFT JOIN curator_picks cp ON cp.curator_id = c.id
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.photo_url, c.bio, c.specialty, c.display_order
  ORDER BY c.display_order ASC;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Step 2: Write `get_curator_picks` RPC**

```sql
CREATE OR REPLACE FUNCTION get_curator_picks(p_curator_id UUID, p_list_category TEXT DEFAULT NULL)
RETURNS TABLE (
  pick_id UUID,
  dish_id UUID,
  dish_name TEXT,
  category TEXT,
  price DECIMAL,
  photo_url TEXT,
  restaurant_name TEXT,
  restaurant_town TEXT,
  rank_position INT,
  blurb TEXT,
  list_category TEXT,
  avg_rating DECIMAL,
  total_votes INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id AS pick_id,
    d.id AS dish_id,
    d.name AS dish_name,
    d.category,
    d.price,
    d.photo_url,
    r.name AS restaurant_name,
    r.town AS restaurant_town,
    cp.rank_position,
    cp.blurb,
    cp.list_category,
    d.avg_rating,
    d.total_votes
  FROM curator_picks cp
  JOIN dishes d ON d.id = cp.dish_id
  JOIN restaurants r ON r.id = d.restaurant_id
  WHERE cp.curator_id = p_curator_id
    AND (p_list_category IS NULL OR cp.list_category IS NOT DISTINCT FROM p_list_category)
  ORDER BY cp.rank_position ASC;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Step 3: Write `get_curator_list_categories` RPC**

Returns distinct list categories for a curator (for the tab chips):

```sql
CREATE OR REPLACE FUNCTION get_curator_list_categories(p_curator_id UUID)
RETURNS TABLE (
  list_category TEXT,
  pick_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.list_category,
    COUNT(*) AS pick_count
  FROM curator_picks cp
  WHERE cp.curator_id = p_curator_id
  GROUP BY cp.list_category
  ORDER BY cp.list_category NULLS FIRST;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Step 4: Commit**

```bash
git add supabase/schema.sql supabase/migrations/20260227_curators.sql
git commit -m "feat: add curator RPCs (get_curators, get_curator_picks, get_curator_list_categories)"
```

---

### Task 5: API Layer — `curatorsApi.js`

**Files:**
- Create: `src/api/curatorsApi.js`
- Modify: `src/api/index.js` (add export)

**Step 1: Create `curatorsApi.js`**

Follow the exact pattern from `dishesApi.js`:

```js
import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const curatorsApi = {
  async getCurators() {
    try {
      var { data, error } = await supabase.rpc('get_curators')
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching curators:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async getCuratorPicks(curatorId, listCategory) {
    try {
      var params = { p_curator_id: curatorId }
      if (listCategory !== undefined && listCategory !== null) {
        params.p_list_category = listCategory
      }
      var { data, error } = await supabase.rpc('get_curator_picks', params)
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching curator picks:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async getCuratorListCategories(curatorId) {
    try {
      var { data, error } = await supabase.rpc('get_curator_list_categories', {
        p_curator_id: curatorId,
      })
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching curator list categories:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
```

**Step 2: Add to barrel export**

In `src/api/index.js`, add:

```js
export { curatorsApi } from './curatorsApi'
```

**Step 3: Commit**

```bash
git add src/api/curatorsApi.js src/api/index.js
git commit -m "feat: add curatorsApi with getCurators, getCuratorPicks, getCuratorListCategories"
```

---

### Task 6: Hooks — `useCurators` and `useCuratorPicks`

**Files:**
- Create: `src/hooks/useCurators.js`

**Step 1: Write hooks**

```js
import { useQuery } from '@tanstack/react-query'
import { curatorsApi } from '../api/curatorsApi'
import { getUserMessage } from '../utils/errorHandler'

export function useCurators() {
  var { data, isLoading, error } = useQuery({
    queryKey: ['curators'],
    queryFn: function () { return curatorsApi.getCurators() },
    staleTime: 1000 * 60 * 10, // 10 minutes — curators rarely change
  })

  return {
    curators: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading curators') } : null,
  }
}

export function useCuratorPicks(curatorId, listCategory) {
  var { data, isLoading, error } = useQuery({
    queryKey: ['curator-picks', curatorId, listCategory],
    queryFn: function () { return curatorsApi.getCuratorPicks(curatorId, listCategory) },
    enabled: !!curatorId,
    staleTime: 1000 * 60 * 10,
  })

  return {
    picks: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading picks') } : null,
  }
}

export function useCuratorListCategories(curatorId) {
  var { data, isLoading } = useQuery({
    queryKey: ['curator-categories', curatorId],
    queryFn: function () { return curatorsApi.getCuratorListCategories(curatorId) },
    enabled: !!curatorId,
    staleTime: 1000 * 60 * 10,
  })

  return {
    categories: data || [],
    loading: isLoading,
  }
}
```

**Step 2: Commit**

```bash
git add src/hooks/useCurators.js
git commit -m "feat: add useCurators, useCuratorPicks, useCuratorListCategories hooks"
```

---

### Task 7: Component — `CuratorCard`

**Files:**
- Create: `src/components/home/CuratorCard.jsx`
- Modify: `src/components/home/index.js` (add export)

**Step 1: Build the card component**

This is the horizontal-scroll card shown on the homepage. Photo circle, name, specialty tag, bio.

```jsx
import { memo } from 'react'

export var CuratorCard = memo(function CuratorCard({ curator, onClick }) {
  var specialtyColors = {
    food: 'var(--color-accent-gold)',
    cocktails: 'var(--color-primary)',
    wine: 'var(--color-medal-gold)',
  }

  var tagColor = specialtyColors[curator.specialty] || 'var(--color-accent-gold)'

  return (
    <button
      className="flex flex-col items-center text-center flex-shrink-0 w-20"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      onClick={function () { onClick(curator) }}
    >
      <div
        className="w-14 h-14 rounded-full mb-1 flex-shrink-0"
        style={{
          background: curator.photo_url
            ? 'url(' + curator.photo_url + ') center/cover'
            : 'var(--color-surface)',
          border: '2px solid ' + tagColor,
        }}
      />
      <span
        className="text-xs font-semibold truncate w-full"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {curator.curator_name}
      </span>
      <span
        className="text-xs capitalize"
        style={{ color: tagColor }}
      >
        {curator.specialty}
      </span>
    </button>
  )
})

export default CuratorCard
```

**Step 2: Add to barrel**

In `src/components/home/index.js`:

```js
export { CuratorCard } from './CuratorCard'
```

**Step 3: Commit**

```bash
git add src/components/home/CuratorCard.jsx src/components/home/index.js
git commit -m "feat: add CuratorCard component for homepage"
```

---

### Task 8: Component — `CuratorListSection` (homepage integration)

**Files:**
- Create: `src/components/home/CuratorListSection.jsx`
- Modify: `src/components/home/index.js` (add export)
- Modify: `src/pages/Home.jsx` (add section above ranked list)

**Step 1: Build the section component**

Horizontal scroll row of CuratorCards with "Local Picks" header:

```jsx
import { useCurators } from '../../hooks/useCurators'
import { CuratorCard } from './CuratorCard'
import { SectionHeader } from '../SectionHeader'

export function CuratorListSection({ onCuratorClick }) {
  var { curators, loading } = useCurators()

  if (loading) {
    return (
      <div className="px-4 pb-3">
        <SectionHeader title="Local Picks" />
        <div className="flex gap-3 overflow-x-auto py-2">
          {[0, 1, 2, 3, 4].map(function (i) {
            return (
              <div key={i} className="flex flex-col items-center flex-shrink-0 w-20 animate-pulse">
                <div className="w-14 h-14 rounded-full mb-1" style={{ background: 'var(--color-divider)' }} />
                <div className="h-3 w-12 rounded" style={{ background: 'var(--color-divider)' }} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!curators || curators.length === 0) return null

  return (
    <div className="px-4 pb-3">
      <SectionHeader title="Local Picks" />
      <div
        className="flex gap-3 overflow-x-auto py-2"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {curators.map(function (curator) {
          return (
            <CuratorCard
              key={curator.curator_id}
              curator={curator}
              onClick={onCuratorClick}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CuratorListSection
```

**Step 2: Add to barrel**

```js
export { CuratorListSection } from './CuratorListSection'
```

**Step 3: Integrate into Home.jsx**

Import `CuratorListSection` and add between the search/category area and the section header:

```jsx
import { CuratorListSection } from '../components/home'
```

Add `useNavigate` handler and section JSX:

```jsx
{/* Local Picks — curator cards */}
<CuratorListSection
  onCuratorClick={function (curator) { navigate('/curator/' + curator.curator_id) }}
/>
```

Place this between the `CategoryChips` block and the `{/* Section header */}` block.

**Step 4: Commit**

```bash
git add src/components/home/CuratorListSection.jsx src/components/home/index.js src/pages/Home.jsx
git commit -m "feat: add Local Picks curator section to homepage"
```

---

### Task 9: Page — `CuratorDetail` at `/curator/:id`

**Files:**
- Create: `src/pages/CuratorDetail.jsx`
- Modify: `src/App.jsx` (add route)

**Step 1: Build the curator detail page**

Shows curator header + ranked picks with blurbs. Category tabs if multiple lists.

```jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCuratorPicks, useCuratorListCategories } from '../hooks/useCurators'
import { curatorsApi } from '../api/curatorsApi'
import { useQuery } from '@tanstack/react-query'
import { DishListItem } from '../components/DishListItem'
import { SectionHeader } from '../components/SectionHeader'
import { getRatingColor } from '../utils/ranking'

export function CuratorDetail() {
  var { curatorId } = useParams()
  var navigate = useNavigate()
  var [selectedCategory, setSelectedCategory] = useState(undefined) // undefined = overall (null list_category)

  // Fetch all curators and find this one
  var { data: curators } = useQuery({
    queryKey: ['curators'],
    queryFn: function () { return curatorsApi.getCurators() },
    staleTime: 1000 * 60 * 10,
  })
  var curator = curators && curators.find(function (c) { return c.curator_id === curatorId })

  // Fetch picks for selected category
  var listCategoryParam = selectedCategory === undefined ? null : selectedCategory
  var { picks, loading: picksLoading } = useCuratorPicks(curatorId, listCategoryParam)
  var { categories } = useCuratorListCategories(curatorId)

  if (!curator) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          className="text-sm font-medium"
          style={{ color: 'var(--color-accent-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={function () { navigate(-1) }}
        >
          &larr; Back
        </button>
      </div>

      {/* Curator header */}
      <div className="flex flex-col items-center text-center px-4 pt-4 pb-6">
        <div
          className="w-20 h-20 rounded-full mb-3"
          style={{
            background: curator.photo_url
              ? 'url(' + curator.photo_url + ') center/cover'
              : 'var(--color-surface)',
            border: '3px solid var(--color-accent-gold)',
          }}
        />
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {curator.curator_name}
        </h1>
        {curator.bio && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {curator.bio}
          </p>
        )}
        <span
          className="text-xs font-semibold mt-2 px-3 py-1 rounded-full capitalize"
          style={{
            color: 'var(--color-accent-gold)',
            background: 'var(--color-surface)',
          }}
        >
          {curator.specialty}
        </span>
      </div>

      {/* Category tabs (if multiple lists) */}
      {categories.length > 1 && (
        <div
          className="flex gap-2 px-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map(function (cat) {
            var isSelected = (selectedCategory === undefined && cat.list_category === null)
              || selectedCategory === cat.list_category
            return (
              <button
                key={cat.list_category || 'overall'}
                className="px-3 py-1 rounded-full text-sm font-medium flex-shrink-0"
                style={{
                  background: isSelected ? 'var(--color-accent-gold)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={function () {
                  setSelectedCategory(cat.list_category === null ? undefined : cat.list_category)
                }}
              >
                {cat.list_category || 'Top 10'}
              </button>
            )
          })}
        </div>
      )}

      {/* Picks list */}
      <div className="px-4">
        <SectionHeader
          title={selectedCategory
            ? curator.curator_name + "'s Top " + (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1))
            : curator.curator_name + "'s Top 10"
          }
        />
        {picksLoading ? (
          <div className="animate-pulse">
            {[0, 1, 2, 3, 4].map(function (i) {
              return (
                <div key={i} className="flex items-center gap-3 py-3 px-3">
                  <div className="w-7 h-5 rounded" style={{ background: 'var(--color-divider)' }} />
                  <div className="flex-1">
                    <div className="h-4 w-28 rounded mb-1" style={{ background: 'var(--color-divider)' }} />
                    <div className="h-3 w-20 rounded" style={{ background: 'var(--color-divider)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {picks.map(function (pick) {
              return (
                <div key={pick.pick_id}>
                  <DishListItem
                    dish={{
                      dish_id: pick.dish_id,
                      dish_name: pick.dish_name,
                      category: pick.category,
                      price: pick.price,
                      photo_url: pick.photo_url,
                      restaurant_name: pick.restaurant_name,
                      restaurant_town: pick.restaurant_town,
                      avg_rating: pick.avg_rating,
                      total_votes: pick.total_votes,
                    }}
                    rank={pick.rank_position}
                    onClick={function () { navigate('/dish/' + pick.dish_id) }}
                  />
                  {pick.blurb && (
                    <p
                      className="text-sm italic px-12 pb-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      "{pick.blurb}"
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CuratorDetail
```

**Step 2: Add route to App.jsx**

Add lazy import near other page imports:

```js
const CuratorDetail = lazyWithRetry(() => import('./pages/CuratorDetail'), 'CuratorDetail')
```

Add route inside `<Routes>`:

```jsx
<Route path="/curator/:curatorId" element={<Layout><CuratorDetail /></Layout>} />
```

**Step 3: Commit**

```bash
git add src/pages/CuratorDetail.jsx src/App.jsx
git commit -m "feat: add CuratorDetail page with /curator/:id route"
```

---

### Task 10: Profile — Auto-generated "Your Top 10" section

**Files:**
- Create: `src/components/profile/YourTopList.jsx`
- Modify: `src/components/profile/index.js` (add export — check barrel file first)
- Modify: `src/pages/Profile.jsx` (add section)

**Step 1: Build the component**

Uses existing `useUserVotes` data — no new API calls needed. Sorts by `rating_10` descending, filters by category chips.

```jsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DishListItem } from '../DishListItem'
import { SectionHeader } from '../SectionHeader'

export function YourTopList({ votes }) {
  var navigate = useNavigate()
  var [selectedCategory, setSelectedCategory] = useState(null)
  var [showAll, setShowAll] = useState(false)

  // Get unique categories from user's votes
  var categories = useMemo(function () {
    if (!votes || votes.length === 0) return []
    var cats = {}
    votes.forEach(function (v) {
      var cat = v.category || v.dish_category
      if (cat) cats[cat] = (cats[cat] || 0) + 1
    })
    return Object.keys(cats).sort()
  }, [votes])

  // Filter and sort
  var topDishes = useMemo(function () {
    if (!votes || votes.length === 0) return []
    var filtered = votes
    if (selectedCategory) {
      filtered = votes.filter(function (v) {
        var cat = v.category || v.dish_category
        return cat && cat.toLowerCase() === selectedCategory.toLowerCase()
      })
    }
    var sorted = filtered.slice().sort(function (a, b) {
      return (b.rating_10 || 0) - (a.rating_10 || 0)
    })
    return showAll ? sorted : sorted.slice(0, 10)
  }, [votes, selectedCategory, showAll])

  if (!votes || votes.length === 0) return null

  return (
    <div className="px-4 pb-4">
      <SectionHeader title={selectedCategory
        ? 'Your Top ' + (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1))
        : 'Your Top 10'
      } />

      {/* Category chips */}
      {categories.length > 1 && (
        <div
          className="flex gap-2 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
            style={{
              background: !selectedCategory ? 'var(--color-accent-gold)' : 'var(--color-surface)',
              color: !selectedCategory ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={function () { setSelectedCategory(null) }}
          >
            All
          </button>
          {categories.map(function (cat) {
            return (
              <button
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 capitalize"
                style={{
                  background: selectedCategory === cat ? 'var(--color-accent-gold)' : 'var(--color-surface)',
                  color: selectedCategory === cat ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={function () { setSelectedCategory(cat) }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Dish list */}
      <div className="flex flex-col" style={{ gap: '2px' }}>
        {topDishes.map(function (dish, i) {
          return (
            <DishListItem
              key={dish.dish_id || dish.id}
              dish={dish}
              rank={i + 1}
              onClick={function () { navigate('/dish/' + (dish.dish_id || dish.id)) }}
            />
          )
        })}
      </div>

      {/* See all toggle */}
      {!showAll && votes.length > 10 && (
        <button
          className="w-full py-2 mt-2 text-sm font-medium"
          style={{
            color: 'var(--color-accent-gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={function () { setShowAll(true) }}
        >
          See All ({votes.length})
        </button>
      )}
    </div>
  )
}

export default YourTopList
```

**Step 2: Add to barrel and integrate into Profile**

Add export to `src/components/profile/index.js`:
```js
export { YourTopList } from './YourTopList'
```

In `src/pages/Profile.jsx`, import and add the section. The `worthItDishes` array from `useUserVotes` is the data source. Place the `YourTopList` section after the existing shelves/journal section.

```jsx
import { YourTopList } from '../components/profile'
```

```jsx
{/* Your Top 10 auto-list */}
<YourTopList votes={worthItDishes} />
```

**Step 3: Commit**

```bash
git add src/components/profile/YourTopList.jsx src/components/profile/index.js src/pages/Profile.jsx
git commit -m "feat: add auto-generated Your Top 10 list to profile"
```

---

### Task 11: Seed Data — Test curators

**Files:**
- Create: `supabase/seed/seed-curators-test.sql`

**Step 1: Write test seed data**

3 test curators with picks, enough to verify the homepage and detail page work:

```sql
-- Test curator seed data (remove before launch, replace with real locals)

-- Insert test curators
INSERT INTO curators (id, name, bio, specialty, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sarah Mitchell', 'MV local, 15 years. Knows every kitchen on-island.', 'food', 1),
  ('22222222-2222-2222-2222-222222222222', 'Jake Torres', 'Bartender at The Wharf. Cocktail obsessive.', 'cocktails', 2),
  ('33333333-3333-3333-3333-333333333333', 'Tom Ellis', 'Wine buyer, sommelier. 20 years in the industry.', 'wine', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert picks (use real dish IDs from your database)
-- Run: SELECT id, name FROM dishes ORDER BY avg_rating DESC NULLS LAST LIMIT 30;
-- Then replace the UUIDs below with real dish IDs

-- NOTE: Before running, query your dishes table for real IDs:
-- SELECT d.id, d.name, r.name as restaurant FROM dishes d JOIN restaurants r ON r.id = d.restaurant_id ORDER BY d.avg_rating DESC NULLS LAST LIMIT 30;
-- Then fill in curator_picks with those IDs.
```

**Step 2: Commit**

```bash
git add supabase/seed/seed-curators-test.sql
git commit -m "feat: add test curator seed template"
```

---

### Task 12: Run migration in Supabase SQL Editor

**This is a manual step — not automated.**

1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/20260227_curators.sql`
3. Verify: `SELECT * FROM curators;` returns empty table
4. Verify: `SELECT get_curators();` returns empty result set
5. Insert a test curator and pick to verify trigger fires

---

### Task 13: Build verification

**Step 1: Run build**

```bash
cd /Users/denisgingras/whats-good-here && npm run build
```

Expected: Build succeeds with no errors.

**Step 2: Run tests**

```bash
npm run test -- --run
```

Expected: All existing tests pass (new code has no test conflicts).

**Step 3: Commit any fixes if needed**
