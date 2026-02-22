# Home Page Redesign — Map-First with Bottom Sheet

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Home page into a map-first food discovery experience where the map fills the screen and a draggable bottom sheet shows ranked dishes, with category chips controlling both layers simultaneously.

**Architecture:** Full-screen Leaflet map as background. Custom BottomSheet component overlays with three snap points (peek/half/full). Category chips sit sticky at the top of the sheet. Tapping a category filters both the map pins AND the ranked list below. All data comes from existing `useMapDishes` + `useDishes` hooks. No new API calls, no schema changes.

**Tech Stack:** React 19, Leaflet (react-leaflet), existing hooks/API layer, CSS variables, touch events for sheet dragging.

**Research:** See `docs/research/2026-02-22-ui-design-research.md` for design principles and measurements.

**Design Principles (from research):**
- 48dp minimum touch targets everywhere
- 16px minimum body text
- 4.5:1 contrast ratio
- Sticky category chips with half-visible last chip
- Three-color semantic system: Gold (quality), Coral (action), Green (score)
- Content IS the design — emoji pins and ratings are the visual experience
- DM Sans everywhere, consistent weights

---

## Task 1: Create BottomSheet component

**Files:**
- Create: `src/components/BottomSheet.jsx`

**What it does:** A draggable overlay that sits on top of the map. Three snap points: peek (~15% of viewport = search bar visible), half (~50% = list browsable), full (~85% = complete browse). Drag handle at top. Touch-draggable. Snaps to nearest detent on release.

**Step 1: Build the component**

```jsx
import { useState, useRef, useCallback, useEffect } from 'react'

var DETENTS = {
  peek: 0.15,
  half: 0.50,
  full: 0.85,
}

export function BottomSheet({ children, initialDetent, onDetentChange }) {
  var sheetRef = useRef(null)
  var dragRef = useRef({ startY: 0, startHeight: 0, isDragging: false })
  var [heightFraction, setHeightFraction] = useState(initialDetent || DETENTS.half)

  var snapToNearest = useCallback(function(fraction) {
    var detentValues = [DETENTS.peek, DETENTS.half, DETENTS.full]
    var closest = detentValues[0]
    var minDist = Math.abs(fraction - closest)
    for (var i = 1; i < detentValues.length; i++) {
      var dist = Math.abs(fraction - detentValues[i])
      if (dist < minDist) {
        minDist = dist
        closest = detentValues[i]
      }
    }
    setHeightFraction(closest)
    if (onDetentChange) {
      var name = closest === DETENTS.peek ? 'peek' : closest === DETENTS.half ? 'half' : 'full'
      onDetentChange(name)
    }
  }, [onDetentChange])

  var handleTouchStart = useCallback(function(e) {
    var touch = e.touches[0]
    dragRef.current = {
      startY: touch.clientY,
      startHeight: heightFraction,
      isDragging: true,
    }
  }, [heightFraction])

  var handleTouchMove = useCallback(function(e) {
    if (!dragRef.current.isDragging) return
    var touch = e.touches[0]
    var deltaY = dragRef.current.startY - touch.clientY
    var deltaFraction = deltaY / window.innerHeight
    var newFraction = Math.max(0.10, Math.min(0.90, dragRef.current.startHeight + deltaFraction))
    setHeightFraction(newFraction)
  }, [])

  var handleTouchEnd = useCallback(function() {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false
    snapToNearest(heightFraction)
  }, [heightFraction, snapToNearest])

  // Also handle mouse for desktop testing
  var handleMouseDown = useCallback(function(e) {
    dragRef.current = {
      startY: e.clientY,
      startHeight: heightFraction,
      isDragging: true,
    }
    var handleMouseMove = function(ev) {
      var deltaY = dragRef.current.startY - ev.clientY
      var deltaFraction = deltaY / window.innerHeight
      var newFraction = Math.max(0.10, Math.min(0.90, dragRef.current.startHeight + deltaFraction))
      setHeightFraction(newFraction)
    }
    var handleMouseUp = function() {
      dragRef.current.isDragging = false
      snapToNearest(heightFraction)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [heightFraction, snapToNearest])

  var sheetHeight = Math.round(heightFraction * 100)

  return (
    <div
      ref={sheetRef}
      className="fixed left-0 right-0 bottom-0 z-20"
      style={{
        height: sheetHeight + 'vh',
        transition: dragRef.current.isDragging ? 'none' : 'height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
        background: 'var(--color-surface-elevated)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingBottom: '64px', /* BottomNav height */
      }}
    >
      {/* Drag handle */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className="flex-shrink-0 flex justify-center py-3"
        style={{
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--color-divider)',
          }}
        />
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export { DETENTS }
```

**Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/components/BottomSheet.jsx
git commit -m "feat: add draggable BottomSheet component with three snap points"
```

---

## Task 2: Rewrite Home.jsx — map-first with bottom sheet

This is the big one. The entire Home page becomes:
- Full-screen map (background, behind everything)
- BottomSheet overlay with: search, category chips (sticky), ranked list

**Files:**
- Modify: `src/pages/Home.jsx` (full rewrite)
- Modify: `src/components/restaurants/RestaurantMap.jsx` (add `fullScreen` prop)

**Step 1: Add fullScreen prop to RestaurantMap**

In `RestaurantMap.jsx`, the `compact` prop currently sets height to 260px. Add a `fullScreen` prop that makes it fill the viewport. Find the MapContainer height logic and add:

```jsx
// In the main RestaurantMap export function, where mapHeight is determined:
var mapHeight = fullScreen ? '100vh' : compact ? '260px' : '400px'
```

Also update the MapContainer's `style` prop and the fallback/wrapper div.

**Step 2: Rewrite Home.jsx**

Replace the entire Home.jsx with the map-first layout. Key changes:
- Remove SearchHero, NumberOneHero, EmptyState, CategoryNav inline components
- Import BottomSheet, RestaurantMap, useMapDishes
- Full-screen map as the background layer
- Bottom sheet contains: search bar, sticky category chips, ranked dish list
- Category selection controls BOTH map pins and the list
- Keep existing data hooks (useDishes for ranked list, useMapDishes for map pins)

```jsx
import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useMapDishes } from '../hooks/useMapDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { MIN_VOTES_FOR_RANKING } from '../constants/app'
import { BROWSE_CATEGORIES, getCategoryEmoji } from '../constants/categories'
import { BottomSheet } from '../components/BottomSheet'
import { DishSearch } from '../components/DishSearch'
import { TownPicker } from '../components/TownPicker'
import { RadiusSheet } from '../components/LocationPicker'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { getRatingColor } from '../utils/ranking'
import { logger } from '../utils/logger'

var RestaurantMap = lazy(function() {
  return import('../components/restaurants/RestaurantMap').then(function(m) {
    return { default: m.RestaurantMap }
  })
})

export function Home() {
  var navigate = useNavigate()
  var { location, radius, setRadius, town, setTown, permissionState } = useLocationContext()

  var [selectedCategory, setSelectedCategory] = useState(null)
  var [townPickerOpen, setTownPickerOpen] = useState(false)
  var [radiusSheetOpen, setRadiusSheetOpen] = useState(false)
  var [searchQuery, setSearchQuery] = useState('')
  var [searchLimit, setSearchLimit] = useState(10)
  var [sheetDetent, setSheetDetent] = useState('half')

  var handleSearchChange = useCallback(function(q) {
    setSearchQuery(q)
    setSearchLimit(10)
    if (q) setSelectedCategory(null)
  }, [])

  // Search results
  var { results: searchResults, loading: searchLoading } = useDishSearch(searchQuery, searchLimit, town)

  // Ranked dishes for the list
  var { dishes, loading, error } = useDishes(location, radius, null, null, town)

  // Map dishes — filtered by category
  var { dishes: mapDishes } = useMapDishes({ location, radius, town, category: selectedCategory })

  // Rank-sort function
  var rankSort = function(a, b) {
    var aRanked = (a.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    var bRanked = (b.total_votes || 0) >= MIN_VOTES_FOR_RANKING
    if (aRanked && !bRanked) return -1
    if (!aRanked && bRanked) return 1
    return (b.avg_rating || 0) - (a.avg_rating || 0)
  }

  // Filtered + sorted dishes for the list
  var rankedDishes = useMemo(function() {
    if (!dishes || dishes.length === 0) return []
    var filtered = dishes
    if (selectedCategory) {
      filtered = dishes.filter(function(d) {
        return d.category && d.category.toLowerCase() === selectedCategory
      })
    }
    return filtered.slice().sort(rankSort).slice(0, 20)
  }, [dishes, selectedCategory])

  var selectedCategoryLabel = selectedCategory
    ? BROWSE_CATEGORIES.find(function(c) { return c.id === selectedCategory })
    : null

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">What's Good Here - Food Discovery Map</h1>

      {/* Full-screen map — the background layer */}
      <div className="fixed inset-0" style={{ zIndex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
          }>
            <RestaurantMap
              mode="dish"
              dishes={mapDishes}
              userLocation={location}
              town={town}
              onSelectDish={function(dishId) { navigate('/dish/' + dishId) }}
              radiusMi={radius}
              permissionGranted={permissionState === 'granted'}
              fullScreen
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Bottom sheet — the content layer */}
      <BottomSheet initialDetent={0.50} onDetentChange={setSheetDetent}>
        {/* Search + controls row */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <DishSearch
                loading={loading}
                placeholder="What are you craving?"
                town={town}
                onSearchChange={handleSearchChange}
              />
            </div>
            <button
              onClick={function() { setRadiusSheetOpen(true) }}
              aria-label={'Search radius: ' + radius + ' miles'}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-xl font-bold"
              style={{
                fontSize: '13px',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-divider)',
                minHeight: '44px',
              }}
            >
              {radius} mi
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category chips — sticky */}
        <div
          className="sticky top-0 z-10 pb-2"
          style={{
            background: 'var(--color-surface-elevated)',
          }}
        >
          <div
            className="flex gap-2 px-4 overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* "All" chip */}
            <button
              onClick={function() { setSelectedCategory(null) }}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full font-semibold"
              style={{
                padding: '8px 16px',
                minHeight: '40px',
                fontSize: '14px',
                background: selectedCategory === null ? 'var(--color-text-primary)' : 'var(--color-surface)',
                color: selectedCategory === null ? 'var(--color-surface-elevated)' : 'var(--color-text-secondary)',
                border: selectedCategory === null ? 'none' : '1px solid var(--color-divider)',
              }}
            >
              All
            </button>
            {BROWSE_CATEGORIES.slice(0, 12).map(function(cat) {
              var isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={function() { setSelectedCategory(isActive ? null : cat.id) }}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full font-semibold"
                  style={{
                    padding: '8px 14px',
                    minHeight: '40px',
                    fontSize: '14px',
                    background: isActive ? 'var(--color-text-primary)' : 'var(--color-surface)',
                    color: isActive ? 'var(--color-surface-elevated)' : 'var(--color-text-secondary)',
                    border: isActive ? 'none' : '1px solid var(--color-divider)',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <h2
            className="font-bold"
            style={{
              fontSize: '18px',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {selectedCategoryLabel
              ? (town ? 'Best ' + selectedCategoryLabel.label + ' in ' + town : 'Best ' + selectedCategoryLabel.label)
              : (town ? 'Top Rated in ' + town : 'Top Rated on the Vineyard')
            }
          </h2>
          <TownPicker
            town={town}
            onTownChange={setTown}
            isOpen={townPickerOpen}
            onToggle={setTownPickerOpen}
          />
        </div>

        {/* Ranked dish list */}
        <div className="px-4 pb-4">
          {searchQuery ? (
            /* Search results mode */
            searchLoading ? (
              <ListSkeleton />
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col" style={{ gap: '2px' }}>
                {searchResults.map(function(dish, i) {
                  return (
                    <DishRow
                      key={dish.dish_id}
                      dish={dish}
                      rank={i + 1}
                      onClick={function() { navigate('/dish/' + dish.dish_id) }}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="font-medium" style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
                  No dishes found for "{searchQuery}"
                </p>
              </div>
            )
          ) : loading ? (
            <ListSkeleton />
          ) : error ? (
            <div className="py-8 text-center">
              <p role="alert" style={{ fontSize: '14px', color: 'var(--color-danger)' }}>
                {error.message || error}
              </p>
            </div>
          ) : rankedDishes.length > 0 ? (
            <div className="flex flex-col" style={{ gap: '2px' }}>
              {rankedDishes.map(function(dish, i) {
                return (
                  <DishRow
                    key={dish.dish_id}
                    dish={dish}
                    rank={i + 1}
                    onClick={function() { navigate('/dish/' + dish.dish_id) }}
                  />
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="font-medium" style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
                {selectedCategory ? 'No ' + (selectedCategoryLabel ? selectedCategoryLabel.label : '') + ' rated yet' : 'No dishes found'}
              </p>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Radius Sheet */}
      <RadiusSheet
        isOpen={radiusSheetOpen}
        onClose={function() { setRadiusSheetOpen(false) }}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

/* ─── DishRow — clean ranked row for the list ───────────────────────────── */
function DishRow({ dish, rank, onClick }) {
  var isRanked = (dish.total_votes || 0) >= MIN_VOTES_FOR_RANKING
  var emoji = getCategoryEmoji(dish.category)

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 px-3 rounded-xl transition-all active:scale-[0.98]"
      style={{
        background: rank <= 3 ? 'var(--color-surface)' : 'transparent',
        textAlign: 'left',
        minHeight: '48px',
        cursor: 'pointer',
      }}
    >
      {/* Rank */}
      <span
        className="flex-shrink-0 font-bold"
        style={{
          width: '28px',
          textAlign: 'center',
          fontSize: rank <= 3 ? '18px' : '14px',
          color: rank === 1 ? 'var(--color-accent-gold)' : rank <= 3 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          fontWeight: 800,
        }}
      >
        {rank}
      </span>

      {/* Emoji */}
      <span className="flex-shrink-0" style={{ fontSize: '24px' }}>{emoji}</span>

      {/* Name + restaurant */}
      <div className="flex-1 min-w-0">
        <p
          className="font-bold truncate"
          style={{
            fontSize: '15px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
          }}
        >
          {dish.dish_name}
        </p>
        <p
          className="truncate"
          style={{
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            marginTop: '1px',
          }}
        >
          {dish.restaurant_name}
          {dish.distance_miles != null ? ' · ' + Number(dish.distance_miles).toFixed(1) + ' mi' : ''}
        </p>
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 text-right">
        {isRanked ? (
          <span
            className="font-bold"
            style={{
              fontSize: '17px',
              color: getRatingColor(dish.avg_rating),
            }}
          >
            {dish.avg_rating}
          </span>
        ) : (
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              fontWeight: 500,
            }}
          >
            {dish.total_votes ? dish.total_votes + ' vote' + (dish.total_votes === 1 ? '' : 's') : 'New'}
          </span>
        )}
      </div>
    </button>
  )
}

/* ─── Loading skeleton ──────────────────────────────────────────────────── */
function ListSkeleton() {
  return (
    <div className="animate-pulse">
      {[0,1,2,3,4].map(function(i) {
        return (
          <div key={i} className="flex items-center gap-3 py-3 px-3">
            <div className="w-7 h-5 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="w-6 h-6 rounded" style={{ background: 'var(--color-divider)' }} />
            <div className="flex-1">
              <div className="h-4 w-28 rounded mb-1" style={{ background: 'var(--color-divider)' }} />
              <div className="h-3 w-20 rounded" style={{ background: 'var(--color-divider)' }} />
            </div>
            <div className="h-5 w-8 rounded" style={{ background: 'var(--color-divider)' }} />
          </div>
        )
      })}
    </div>
  )
}
```

**Step 3: Update RestaurantMap to support fullScreen prop**

In `src/components/restaurants/RestaurantMap.jsx`, find the main export function signature and add `fullScreen` to props. Then update the MapContainer wrapper height:

- When `fullScreen` is true: height = `100vh`, no border-radius, no border
- Keep existing `compact` (260px) and default (400px) behavior

Also: when `fullScreen` is true, disable the search bar and places loader (those are only for the Restaurants page).

**Step 4: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**

```bash
git add src/pages/Home.jsx src/components/BottomSheet.jsx src/components/restaurants/RestaurantMap.jsx
git commit -m "feat: map-first Home page with draggable bottom sheet and category chips"
```

---

## Task 3: Polish the bottom sheet interaction

After the basic structure works, polish:

**Files:**
- Modify: `src/components/BottomSheet.jsx`

**Improvements:**
1. Add `will-change: height` for GPU acceleration during drag
2. Prevent body scroll when sheet is being dragged
3. Add velocity-based snapping (flick up = go to next higher detent, flick down = go to next lower)
4. Handle edge case: when sheet content is scrolled to top and user drags down, collapse the sheet instead of scrolling

**Step 1: Add velocity tracking**

Track touch velocity (distance / time over last 100ms). If velocity exceeds threshold when released, snap to next detent in direction of movement rather than nearest detent.

**Step 2: Add scroll-to-collapse**

When the sheet's scrollable content `scrollTop === 0` and the user drags down, collapse the sheet instead of doing nothing. This is the Apple Maps interaction pattern.

**Step 3: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/components/BottomSheet.jsx
git commit -m "fix: bottom sheet velocity snap + scroll-to-collapse behavior"
```

---

## Task 4: Map + list synchronization

When user taps a pin on the map, scroll the list to that dish. When user taps a dish in the list, highlight the pin.

**Files:**
- Modify: `src/pages/Home.jsx`
- Modify: `src/components/restaurants/RestaurantMap.jsx` (add `onPinTap` callback)

**Step 1: Add pin tap callback to RestaurantMap**

When a user taps a dish pin on the map, fire `onPinTap(dishId)` instead of navigating directly. The Home page will handle what happens (open the sheet to half, scroll to that dish, highlight it).

**Step 2: In Home.jsx, handle pin taps**

When `onPinTap` fires:
- Set sheet to half detent
- Scroll the dish list to the tapped dish
- Briefly highlight the row (gold background flash, 1s fade)

**Step 3: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add src/pages/Home.jsx src/components/restaurants/RestaurantMap.jsx
git commit -m "feat: map pin tap scrolls to dish in bottom sheet list"
```

---

## Task 5: Visual polish pass

**Files:**
- Modify: `src/index.css` (if needed for new utility classes)
- Modify: `src/pages/Home.jsx` (spacing, typography tweaks)

**Step 1: Ensure all touch targets are 48dp minimum**

Audit every button and interactive element in the new Home:
- Category chips: minHeight 40px (visible), tap area padded to 48px ✓
- Dish rows: minHeight 48px ✓
- Search bar: at least 44px tall ✓
- Radius button: minHeight 44px ✓
- Drag handle area: at least 48px tall (currently py-3 = 24px padding = ~28px + 4px bar = ~32px → increase to py-4)

**Step 2: Typography check**

- Body text (dish names, restaurant names): 15px and 12px ✓ (15px is close enough to 16px for bold text which is more legible)
- Rating numbers: 17px ✓
- Section headers: 18px ✓
- Chip labels: 14px ✓

**Step 3: Ensure half-visible last chip**

The category chip row should show ~4.5 chips. If the container `px-4` (16px each side) leaves room for only 4 full chips, the 5th chip will be partially visible. This is correct and intentional — do NOT add overflow hidden.

**Step 4: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**

```bash
git add src/pages/Home.jsx src/index.css
git commit -m "polish: touch targets, typography, chip scroll affordance"
```

---

## Task 6: Final verification

**Step 1: Build check**

Run: `npm run build`
Expected: SUCCESS

**Step 2: Lint check**

Run: `npm run lint`
Expected: No new errors in our files

**Step 3: Checklist**

- [ ] No `console.*` (use `logger`)
- [ ] No hardcoded hex colors in components (CSS vars only)
- [ ] No ES2023+ syntax (no `toSorted`, no `Array.at()`)
- [ ] No direct Supabase calls from components
- [ ] Map fills viewport and shows emoji pins
- [ ] Bottom sheet drags between peek/half/full
- [ ] Category chips control both map pins and ranked list
- [ ] Tapping a dish in the list navigates to `/dish/:id`
- [ ] Search works within the bottom sheet
- [ ] Radius control is accessible
- [ ] All touch targets >= 44px
- [ ] Works in both Appetite (light) and Island Depths (dark) themes

---

## What's NOT in this plan (future work)

- Bottom tab navigation changes (stays as-is: Home, Restaurants, Hub, You)
- "Get Directions" button on dish detail page (separate task)
- Time-of-day adaptive content (breakfast in morning, etc.)
- Restaurants page changes (already has its own map)
- Logo or brand mark changes
- Hub page changes (already has guides from earlier work)
