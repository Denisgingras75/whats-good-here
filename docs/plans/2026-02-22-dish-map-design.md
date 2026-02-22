# Dish Map — Design Doc

**Date:** 2026-02-22
**Status:** Approved
**Goal:** Add a dish-level discovery map to the Restaurants page by extending the existing RestaurantMap component.

---

## Overview

Replace the generic restaurant pin map with a dish-focused discovery map. Users see emoji food icons on a dark minimal map, tap to get dish details, get directions, and navigate to the full dish page. Includes proximity detection ("I'm here" banner) when near a restaurant.

## Approach: Extend RestaurantMap (Approach A)

No new components or routes. Extend `RestaurantMap.jsx` with a `mode` prop and update `Restaurants.jsx` to use dish mode as the default map view.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Map tiles | CartoDB Dark Matter | Free, no API key, matches Island Depths, gold pins pop |
| Pin style | Emoji divIcon (top dish category) + dish count badge | Uses existing `getCategoryEmoji()`, visually distinctive |
| Tap interaction | Custom mini card overlay on map | Not Leaflet popup — themed, branded, better UX |
| Clustering | One pin per restaurant, top dish emoji, "+N dishes" badge | Clean at any zoom level |
| Directions | `geo:` URI (OS picks native maps app) | Zero platform logic, works iOS + Android + desktop |
| Check-in | Passive banner on map when within ~100m | Non-intrusive, respects "don't gatekeep" philosophy |
| View modes | `list` \| `map` (map = dish map for all users) | Simplified from three-way toggle. Old restaurant map is admin-only. |
| Town filter | Respects existing LocationContext town filter | Map zooms to town and filters pins |

## Tile Layer

```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

Free, attribution required: `© OpenStreetMap contributors © CARTO`

## Pin Design

Custom Leaflet `divIcon` per restaurant:

- **Emoji:** Top-rated dish's category emoji via `getCategoryEmoji(category)`
- **Size:** 44px minimum hit target (mobile-friendly)
- **Badge:** If 2+ dishes, small gold circle with count (top-right of emoji)
- **Glow:** Gold ring on restaurants with a 9+ rated dish
- **Labels:** Restaurant name fades in at higher zoom levels

## Mini Card (On Pin Tap)

Positioned above the tapped pin, custom HTML overlay (not Leaflet Popup):

```
┌──────────────────────────────┐
│ 🦞 Lobster Roll         9.2 │
│ The Net Result               │
│ 0.3 mi · 847 votes          │
│ 92% would order again        │
│                              │
│ [Directions ↗]  [View Dish →]│
└──────────────────────────────┘
```

- **Directions ↗** → `geo:{lat},{lng}` URI (OS-native maps)
- **View Dish →** → `navigate('/dish/:dishId')`
- **Multiple dishes:** Shows top-rated, with "+N more dishes" → `navigate('/restaurants/:id')`
- **Dismiss:** Tap anywhere else on map
- **Styling:** CSS variables, themed for both Appetite and Island Depths

## Proximity Banner ("I'm Here")

When dish map is open and user location is within ~100m of a loaded restaurant:

```
┌─────────────────────────────────────┐
│ 📍 You're at The Net Result    ✕   │
│    See their menu →                 │
└─────────────────────────────────────┘
```

- Slides in from top of map container
- Tap → `navigate('/restaurants/:restaurantId')`
- Dismiss with ✕, won't re-show for that restaurant during session
- Client-side only: `calculateDistance()` from `src/utils/distance.js`
- Only triggers if `permissionState === 'granted'`
- Re-checks when location updates

## Data Flow

**New API method:** `dishesApi.getMapDishes({ lat, lng, radiusMiles })`

Returns dishes with restaurant lat/lng for map pins. Uses existing `get_ranked_dishes` RPC or a lighter query that includes:
- `dish_id`, `dish_name`, `category`, `avg_rating`, `total_votes`, `percent_worth_it`, `price`
- `restaurant_id`, `restaurant_name`, `restaurant_lat`, `restaurant_lng`, `restaurant_town`, `restaurant_address`
- `distance_miles`

**Grouping:** Client-side group by `restaurant_id`. Per restaurant:
- Pin emoji = `getCategoryEmoji(topDish.category)`
- Pin shows top-rated dish
- Badge count = total dishes at that restaurant

**React Query key:** `['map-dishes', lat, lng, radius, town]`

## Files Modified

| File | Change |
|------|--------|
| `src/components/restaurants/RestaurantMap.jsx` | Add `mode` prop, dark tiles, emoji divIcon markers, mini card overlay, proximity banner |
| `src/pages/Restaurants.jsx` | Dish mode as default map, pass dishes + mode prop |
| `src/api/dishesApi.js` | Add `getMapDishes()` method |
| `src/hooks/useDishes.js` (or new `useMapDishes.js`) | Hook for map dish data |

## Not Building (YAGNI)

- Custom SVG food icons (emoji v1)
- Cluster/uncluster animations
- In-app route preview
- Social check-in mechanics
- Search bar in map (existing DishSearch at page top works)
- Separate `/map` route
- Mapbox or paid tile providers

## Technical Constraints

- No ES2023+ syntax (Safari <16 compat)
- All colors via CSS variables
- No direct Supabase calls from components
- No direct localStorage calls
- React Query for data fetching
- `createClassifiedError()` for all API errors
- `logger` not `console`
- `npm run build` must pass
