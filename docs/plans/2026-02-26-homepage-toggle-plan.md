# Homepage Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the BottomSheet-based homepage with two committed full-screen modes (List and Map) toggled by a floating pill button.

**Architecture:** The `Map.jsx` page component gets rewritten to hold two full-screen views (list and map) controlled by a single `mode` state. A `ModeFAB` button toggles between them. Route state from `/dish/:id` can force map mode with a focused pin. The BottomSheet is removed from this page entirely.

**Tech Stack:** React 19, React Router v7 (useLocation/useNavigate for route state), Leaflet via RestaurantMap, existing hooks (useDishes, useDishSearch).

**Design doc:** `docs/plans/2026-02-26-homepage-toggle-design.md`

---

### Task 1: Create the ModeFAB toggle component

**Files:**
- Create: `src/components/ModeFAB.jsx`

**Step 1: Write the component**

A floating pill button that shows "Map" (with map icon) or "List" (with list icon) depending on current mode. Accepts `mode` and `onToggle` props.

```jsx
export function ModeFAB({ mode, onToggle }) {
  var isMap = mode === 'map'

  return (
    <button
      onClick={onToggle}
      aria-label={isMap ? 'Switch to list view' : 'Switch to map view'}
      className="flex items-center gap-2 px-4 py-3"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: 25,
        borderRadius: '28px',
        background: 'var(--color-surface-elevated)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
        border: '1px solid var(--color-divider)',
        fontSize: '14px',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
      }}
    >
      {isMap ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          List
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          Map
        </>
      )}
    </button>
  )
}
```

**Step 2: Verify it builds**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/ModeFAB.jsx
git commit -m "feat: add ModeFAB toggle component for homepage list/map switching"
```

---

### Task 2: Rewrite Map.jsx as dual-mode homepage

This is the core task. Replace the BottomSheet-based layout with two conditional renders based on `mode` state.

**Files:**
- Modify: `src/pages/Map.jsx`

**Step 1: Rewrite Map.jsx**

Key changes:
- Add `mode` state: `useState('list')` — default to list
- Read route state for `focusDish` / forced map mode (from dish detail "See on map")
- Remove all BottomSheet imports, refs, detent state
- Remove `sheetRef`, `sheetDetent`, `handlePinTap` sheet-opening logic, `handleListItemTap` sheet-collapsing logic
- Remove `pinSelected` state and the control-hiding behavior

**List mode renders:**
- Search bar (DishSearch) at the top with shadow
- CategoryChips below search
- Section title
- DishListItem list — tap navigates to `/dish/:id` (not fly-to-pin)
- ModeFAB showing "Map"

**Map mode renders:**
- Floating search bar with zoom buttons (same as current floating controls)
- Radius control
- Full-screen RestaurantMap
- ModeFAB showing "List"
- No CategoryChips (search covers filtering in map mode)

**Shared state:**
- `selectedCategory`, `searchQuery`, `searchLimit` — persist across mode switches
- `scrollPositionRef` — save list scroll offset before switching to map, restore when switching back

**Route state integration:**
```js
var routeLocation = useLocation()
var focusDishFromRoute = routeLocation.state?.focusDish || null

useEffect(function () {
  if (focusDishFromRoute) {
    setMode('map')
    setFocusDishId(focusDishFromRoute)
    // Clear route state so back navigation doesn't re-trigger
    navigate('/', { replace: true, state: {} })
  }
}, [focusDishFromRoute])
```

**Full replacement code for Map.jsx:**

```jsx
import { useState, useCallback, useRef, useEffect, useMemo, lazy, Suspense } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLocationContext } from '../context/LocationContext'
import { useDishes } from '../hooks/useDishes'
import { useDishSearch } from '../hooks/useDishSearch'
import { BROWSE_CATEGORIES } from '../constants/categories'
import { DishSearch } from '../components/DishSearch'
import { RadiusSheet } from '../components/LocationPicker'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { DishListItem } from '../components/DishListItem'
import { CategoryChips } from '../components/CategoryChips'
import { EmptyState } from '../components/EmptyState'
import { ModeFAB } from '../components/ModeFAB'
import { logger } from '../utils/logger'

var RestaurantMap = lazy(function () {
  return import('../components/restaurants/RestaurantMap').then(function (m) {
    return { default: m.RestaurantMap }
  })
})

export function Map() {
  var navigate = useNavigate()
  var routeLocation = useLocation()
  var { location, radius, setRadius, permissionState } = useLocationContext()

  var [mode, setMode] = useState('list')
  var [selectedCategory, setSelectedCategory] = useState(null)
  var [radiusSheetOpen, setRadiusSheetOpen] = useState(false)
  var [searchQuery, setSearchQuery] = useState('')
  var [searchLimit, setSearchLimit] = useState(10)
  var [focusDishId, setFocusDishId] = useState(null)
  var [highlightedDishId, setHighlightedDishId] = useState(null)

  var mapRef = useRef(null)
  var listScrollRef = useRef(null)
  var scrollPositionRef = useRef(0)
  var highlightTimerRef = useRef(null)

  // ─── Route state: "See on map" from dish detail ─────────
  var focusDishFromRoute = routeLocation.state?.focusDish || null

  useEffect(function () {
    if (focusDishFromRoute) {
      setMode('map')
      setFocusDishId(null)
      setTimeout(function () { setFocusDishId(focusDishFromRoute) }, 0)
      // Clear route state so back button doesn't re-trigger
      navigate('/', { replace: true, state: {} })
    }
  }, [focusDishFromRoute, navigate])

  // ─── Mode toggle with scroll position save/restore ─────────
  var handleToggle = useCallback(function () {
    if (mode === 'list') {
      // Save scroll position before switching to map
      if (listScrollRef.current) {
        scrollPositionRef.current = listScrollRef.current.scrollTop
      }
      setMode('map')
    } else {
      setMode('list')
    }
  }, [mode])

  // Restore scroll position when switching back to list
  useEffect(function () {
    if (mode === 'list' && listScrollRef.current && scrollPositionRef.current > 0) {
      listScrollRef.current.scrollTop = scrollPositionRef.current
    }
  }, [mode])

  var handleSearchChange = useCallback(function (q) {
    setSearchQuery(q)
    setSearchLimit(10)
    if (q) setSelectedCategory(null)
  }, [])

  // Search results (no town filter — shows whole island)
  var searchData = useDishSearch(searchQuery, searchLimit, null)
  var searchResults = searchData.results
  var searchLoading = searchData.loading

  // Ranked dishes — single source of truth for both modes
  var rankedData = useDishes(location, radius, selectedCategory, null, null)
  var rankedDishes = rankedData.dishes

  var selectedCategoryLabel = selectedCategory
    ? BROWSE_CATEGORIES.find(function (c) { return c.id === selectedCategory })
    : null

  var sortedDishes = rankedDishes ? rankedDishes.slice(0, 10) : []

  var dishesWithCoords = sortedDishes.filter(function (d) {
    return d.restaurant_lat != null && d.restaurant_lng != null
  })

  var displayedOnMap = (searchQuery && searchResults && searchResults.length > 0)
    ? searchResults.filter(function (d) { return d.restaurant_lat != null && d.restaurant_lng != null })
    : dishesWithCoords

  var listTitle = searchQuery
    ? 'Results'
    : selectedCategoryLabel
      ? 'Best ' + selectedCategoryLabel.label + ' Nearby'
      : 'Top Rated Nearby'

  var activeDishes = searchQuery ? searchResults : sortedDishes

  // Build dish rank map for mini-card display
  var dishRanks = useMemo(function () {
    var ranks = {}
    var list = activeDishes || []
    for (var i = 0; i < list.length; i++) {
      ranks[list[i].dish_id] = i + 1
    }
    return ranks
  }, [activeDishes])

  var rankingContext = useMemo(function () {
    var categoryLabel = selectedCategoryLabel ? selectedCategoryLabel.label : null
    if (categoryLabel) return categoryLabel + ' nearby'
    return 'nearby'
  }, [selectedCategoryLabel])

  // ─── Map pin tap: highlight in mini-card ─────────
  var handlePinTap = useCallback(function (dishId) {
    logger.debug('Pin tapped, dishId:', dishId)
    setHighlightedDishId(dishId)
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current)
    }
    highlightTimerRef.current = setTimeout(function () {
      setHighlightedDishId(null)
    }, 1500)
  }, [])

  useEffect(function () {
    return function () {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <h1 className="sr-only">What's Good Here</h1>

      {/* ─── LIST MODE ─── */}
      {mode === 'list' && (
        <div
          ref={listScrollRef}
          className="fixed inset-0 overflow-y-auto"
          style={{
            paddingBottom: '80px',
            background: 'var(--color-bg)',
            zIndex: 1,
          }}
        >
          {/* Search bar */}
          <div className="px-4 pt-3 pb-2" style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--color-bg)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              borderRadius: '14px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            }}>
              <DishSearch
                loading={false}
                placeholder="What are you craving?"
                onSearchChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Category chips */}
          <CategoryChips
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            sticky
            maxVisible={23}
          />

          {/* Section title */}
          <div className="px-4 pt-2 pb-2">
            <h2 style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}>
              {listTitle}
            </h2>
          </div>

          {/* Dish list */}
          <div className="px-4 pb-4">
            {searchQuery && searchLoading ? (
              <ListSkeleton />
            ) : activeDishes && activeDishes.length > 0 ? (
              <div className="flex flex-col" style={{ gap: '2px' }}>
                {activeDishes.map(function (dish, i) {
                  return (
                    <DishListItem
                      key={dish.dish_id}
                      dish={dish}
                      rank={i + 1}
                      showDistance
                      onClick={function () { navigate('/dish/' + dish.dish_id) }}
                    />
                  )
                })}
              </div>
            ) : searchQuery ? (
              <EmptyState
                emoji="🔍"
                title={'No dishes found for \u201c' + searchQuery + '\u201d'}
              />
            ) : (
              <EmptyState
                emoji="🍽️"
                title="No dishes found nearby"
              />
            )}
          </div>
        </div>
      )}

      {/* ─── MAP MODE ─── */}
      {mode === 'map' && (
        <>
          {/* Full-screen map */}
          <div className="fixed inset-0" style={{ zIndex: 1 }}>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
              }>
                <RestaurantMap
                  mode="dish"
                  dishes={displayedOnMap}
                  userLocation={location}
                  onSelectDish={handlePinTap}
                  radiusMi={radius}
                  permissionGranted={permissionState === 'granted'}
                  fullScreen
                  focusDishId={focusDishId}
                  mapRef={mapRef}
                  dishRanks={dishRanks}
                  rankingContext={rankingContext}
                />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Floating controls: search + zoom */}
          <div
            className="fixed left-0 right-0"
            style={{
              top: 'env(safe-area-inset-top, 0px)',
              zIndex: 15,
              padding: '12px 12px 0',
              pointerEvents: 'none',
            }}
          >
            <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
              <MapZoomButton label="Zoom in" direction="in" mapRef={mapRef} />
              <div className="flex-1" style={{
                borderRadius: '14px',
                boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
              }}>
                <DishSearch
                  loading={false}
                  placeholder="What are you craving?"
                  onSearchChange={handleSearchChange}
                />
              </div>
              <MapZoomButton label="Zoom out" direction="out" mapRef={mapRef} />
            </div>

            {/* Radius control */}
            <div className="flex justify-end" style={{ marginTop: '8px', pointerEvents: 'auto' }}>
              <button
                onClick={function () { setRadiusSheetOpen(true) }}
                aria-label={'Search radius: ' + radius + ' miles'}
                className="flex items-center gap-1 px-3 py-2 rounded-xl font-bold"
                style={{
                  fontSize: '13px',
                  background: 'var(--color-surface-elevated)',
                  color: 'var(--color-text-primary)',
                  border: 'none',
                  minHeight: '36px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                }}
              >
                {radius} mi
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── Toggle FAB (both modes) ─── */}
      <ModeFAB mode={mode} onToggle={handleToggle} />

      <RadiusSheet
        isOpen={radiusSheetOpen}
        onClose={function () { setRadiusSheetOpen(false) }}
        radius={radius}
        onRadiusChange={setRadius}
      />
    </div>
  )
}

function MapZoomButton({ label, direction, mapRef }) {
  var handleClick = useCallback(function () {
    if (!mapRef.current) return
    if (direction === 'in') {
      mapRef.current.zoomIn()
    } else {
      mapRef.current.zoomOut()
    }
  }, [mapRef, direction])

  return (
    <button
      onClick={handleClick}
      aria-label={label}
      className="flex-shrink-0 flex items-center justify-center"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'var(--color-surface-elevated)',
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
      }}
    >
      {direction === 'in' ? '+' : '\u2212'}
    </button>
  )
}

function ListSkeleton() {
  return (
    <div className="animate-pulse">
      {[0, 1, 2, 3].map(function (i) {
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

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Manual smoke test**

Run: `npm run dev`
- Verify list mode loads by default with ranked dishes
- Verify "Map" FAB is visible bottom-right
- Tap FAB → map mode with pins
- Tap FAB again → back to list, scroll position preserved
- Search in list mode → results update
- Search in map mode → pins update
- Category chip in list mode → list filters
- Tap dish in list → navigates to `/dish/:id`

**Step 4: Commit**

```bash
git add src/pages/Map.jsx
git commit -m "feat: rewrite homepage as dual-mode list/map with toggle FAB

Kill BottomSheet. List mode is default (ranked dishes full-screen).
Map mode is full-screen Leaflet with search. Toggle via floating pill button.
Scroll position preserved across mode switches."
```

---

### Task 3: Update BottomNav — center tab becomes "Home"

**Files:**
- Modify: `src/components/BottomNav.jsx`

**Step 1: Change the center tab**

Replace the Map tab:
- Icon: home icon (house SVG) instead of map icon
- Label: "Home" instead of "Map"
- Route stays `/`

```jsx
// Replace the Map tab entry with:
{
  to: '/',
  label: 'Home',
  prefetch: prefetchRoutes.map,
  icon: (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
},
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/BottomNav.jsx
git commit -m "feat: rename center nav tab from Map to Home"
```

---

### Task 4: Add "See on map" to Dish detail page

**Files:**
- Modify: `src/pages/Dish.jsx` (around line 617-632)

**Step 1: Replace the town/distance line with a "See on map" tappable element**

Find the block after the restaurant name button (around line 617-633) that shows distance and town. Replace with a "See on map" link that includes the distance and town info.

Replace the existing distance + town block:

```jsx
// OLD (lines ~617-633): distance label + dot + town
{distanceLabel && ( ... )}
{dish.restaurant_town && ( ... )}
```

With:

```jsx
{(dish.restaurant_lat && dish.restaurant_lng) && (
  <button
    onClick={function () {
      navigate('/', { state: { focusDish: dish.dish_id } })
    }}
    className="flex items-center gap-1"
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      color: 'var(--color-accent-gold)',
    }}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
    {distanceLabel ? distanceLabel + ' · ' : ''}{dish.restaurant_town || 'See on map'}
  </button>
)}
{(!dish.restaurant_lat || !dish.restaurant_lng) && dish.restaurant_town && (
  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
    {dish.restaurant_town}
  </span>
)}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: PASS

**Step 3: Manual test**

- Navigate to a dish detail page
- Verify "See on map" shows with pin icon, distance, and town
- Tap it → navigates to homepage in map mode, zoomed to the dish's pin
- Verify dishes without coordinates just show town name (no "See on map")

**Step 4: Commit**

```bash
git add src/pages/Dish.jsx
git commit -m "feat: replace address line with 'See on map' button on dish detail

Tapping navigates to homepage in map mode, flying to the dish's pin.
Falls back to plain town name for dishes without coordinates."
```

---

### Task 5: Clean up — remove BottomSheet from homepage imports

**Files:**
- Modify: `src/pages/Map.jsx` (verify no BottomSheet import remains)

**Step 1: Verify BottomSheet is no longer imported in Map.jsx**

This should already be done in Task 2, but double-check. The `BottomSheet` component itself stays in `src/components/BottomSheet.jsx` in case it's needed elsewhere in the future, but it's no longer imported by any file.

Run grep to confirm:
```bash
grep -r "BottomSheet" src/ --include="*.jsx" --include="*.js"
```

Expected: Only `src/components/BottomSheet.jsx` itself shows up.

**Step 2: Remove `onMapClick` prop handling**

In Task 2's rewrite, the `onMapClick` prop was removed from RestaurantMap since we no longer need to dismiss pin-selected state. Verify RestaurantMap still works without it (it should — `onMapClick` was optional).

**Step 3: Run full build + tests**

Run: `npm run build && npm run test`
Expected: Both PASS

**Step 4: Commit**

```bash
git commit -m "chore: verify BottomSheet removed from homepage, clean up unused props"
```

---

### Task 6: Update App.jsx route — remove BottomNav wrapper from Map route

**Files:**
- Modify: `src/App.jsx` (line 127)

**Step 1: Check if BottomNav needs updating**

Currently line 127:
```jsx
<Route path="/" element={<><MapPage /><BottomNav /></>} />
```

The BottomNav should still render on the homepage — it's the main navigation. This route stays as-is. No change needed.

However, verify the `prefetchRoutes.map` key still works since we renamed nothing at the route level.

**Step 2: Run final build**

Run: `npm run build`
Expected: PASS

---

### Task 7: Update TASKS.md and SPEC.md

**Files:**
- Modify: `TASKS.md`
- Modify: `SPEC.md`

**Step 1: Add completed task entry to TASKS.md**

Add after T40:

```markdown
## ~~T41: Homepage Toggle — Kill BottomSheet, Add List/Map Modes~~ DONE

**Why:** The BottomSheet half-state was always a compromise — neither map nor list got full attention. Users couldn't commit to either mode.

**What was done:**
- Replaced BottomSheet with two committed full-screen modes (List default, Map toggle)
- Floating pill FAB (bottom-right) toggles between modes
- List mode: search + category chips + ranked dish list
- Map mode: search + zoom/radius + full-screen Leaflet with pins
- Scroll position preserved across mode switches
- Dish detail "See on map" button navigates to homepage in map mode
- BottomNav center tab renamed from "Map" to "Home"

**Files:** `src/pages/Map.jsx`, `src/components/ModeFAB.jsx`, `src/components/BottomNav.jsx`, `src/pages/Dish.jsx`
```

**Step 2: Update SPEC.md Feature 1 (Home/Landing)**

Update the homepage feature description to reflect the new dual-mode architecture. Replace the map+BottomSheet description with the list/map toggle description.

**Step 3: Commit**

```bash
git add TASKS.md SPEC.md
git commit -m "docs: update TASKS.md and SPEC.md for homepage toggle"
```
