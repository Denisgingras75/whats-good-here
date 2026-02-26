# Homepage Toggle Design — "Lemme See"

**Date:** 2026-02-26
**Status:** Approved
**Author:** Dan + Claude

---

## Problem

The homepage tries to show a map and a ranked dish list on the same screen via a BottomSheet with 3 detents (peek/half/full). Neither view gets full attention. The half-state is always a compromise — map is partially covered, list is partially visible. Users can't commit to either mode.

## Solution

Kill the BottomSheet. Two committed full-screen modes on the homepage — **List** (default) and **Map** — toggled by a floating pill button. Each mode gets 100% of the screen. No half-states.

## Design

### List Mode (Default)

Full-screen ranked dish list. This is what opens when you launch the app.

**Layout (top to bottom):**
1. Search bar (top, with shadow)
2. Category chips (horizontal scroll below search)
3. Section title ("Top Rated Nearby" / "Best [Category] Nearby" / "Results")
4. Ranked dish list (`DishListItem` components)
5. Empty states for no results

**Behavior:**
- Tapping a dish navigates to `/dish/:id`
- Category chip filters the list
- Search filters the list (2+ chars, debounced)
- Scrollable, full-height content area

**Toggle FAB:** Bottom-right, map icon + "Map" label. Floats above BottomNav.

### Map Mode

Full-screen Leaflet map with emoji dish pins.

**Layout:**
1. Search bar (top, same position as list mode)
2. Zoom buttons (flanking search bar: `[+] [search] [-]`)
3. Radius control (below search, right-aligned)
4. Full-screen map with dish pins
5. Mini-card popup on pin tap (existing RestaurantMap behavior)

**Behavior:**
- Search updates map pins to show results
- Pin tap shows mini-card with dish name, rating, restaurant, rank
- Mini-card tap navigates to `/dish/:id`
- Zoom and pan the map freely
- Category chips are NOT shown (search covers this use case in map mode)

**Toggle FAB:** Bottom-right, list icon + "List" label. Floats above BottomNav.

### The Toggle Button

- Rounded pill capsule
- Bottom-right corner, ~16px above BottomNav, ~16px from right edge
- `var(--color-surface-elevated)` background with shadow
- Contains: icon + label text
  - List mode: map icon + "Map"
  - Map mode: list icon + "List"
- Tap triggers instant mode switch (200ms crossfade)
- State persists during session via React state (not localStorage)
- Resets to List on fresh app open

### Dish Detail → Map Bridge

On `/dish/:id`, replace the text address line with a tappable "See on map" element.

- Tapping it navigates to `/` and activates map mode
- Map flies to the dish's pin with mini-card open
- Pass dish ID via route state: `navigate('/', { state: { focusDish: dishId, mode: 'map' } })`

### Navigation Changes

BottomNav center tab changes:
- **Before:** Map icon, label "Map", navigates to `/`
- **After:** Home icon, label "Home", navigates to `/`

The 4 tabs remain: Discover | Restaurants | **Home** | You

Tapping Home while already on Home resets to list mode (standard tab behavior).

## What Gets Removed

- `BottomSheet.jsx` usage on homepage (component may still exist if used elsewhere)
- The 3-detent system on `/`
- Sheet drag handle, scroll-to-collapse gesture
- Pin-selected state hiding floating controls (no longer needed — modes are separate)
- `handleListItemTap` flying-to-pin behavior (replaced by dish detail navigation)
- `handlePinTap` opening the sheet (replaced by mini-card which already exists)

## What Stays Unchanged

- `RestaurantMap` component — gets full screen in map mode, all existing props work
- `DishListItem` — used in list mode exactly as today
- `CategoryChips` — used in list mode
- `DishSearch` — used in both modes
- `useDishes` hook — same data source for both modes
- `useDishSearch` hook — same search in both modes
- Radius control behavior
- Mini-card on pin tap in RestaurantMap

## Data Flow

Both modes share the same data:
- `useDishes(location, radius, selectedCategory)` — ranked dishes
- `useDishSearch(query)` — search results
- Active list = search results (if searching) or ranked dishes (if not)
- Map pins = same active list, filtered to those with coordinates

Mode toggle is purely a UI concern — no additional API calls.

## Risk: BottomSheet Used Elsewhere

Check if `BottomSheet` is imported anywhere besides `Map.jsx`. If yes, keep the component. If no, consider deleting it.

## Risk: Scroll Position

When toggling List → Map → List, the list should preserve scroll position. Use a ref to store scroll offset before switching to map mode, restore it when switching back.
