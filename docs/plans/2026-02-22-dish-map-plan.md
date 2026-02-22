# Dish Map Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add emoji-pin dish discovery map to Restaurants page, replacing generic restaurant pins.

**Architecture:** Extend RestaurantMap.jsx with `mode="dish"` prop. New API method fetches dishes with restaurant lat/lng via table join. Client-side grouping by restaurant. Custom HTML overlays for mini cards and proximity banner — no Leaflet Popup.

**Tech Stack:** React 19, Leaflet via react-leaflet, Supabase table query (no new RPC), React Query, CSS variables.

---

### Task 1: Add `getMapDishes()` to dishesApi

**Files:**
- Modify: `src/api/dishesApi.js`

**Step 1: Add the method to dishesApi**

Add after the `getRecent` method (~line 433):

```js
/**
 * Get dishes with restaurant coordinates for map display
 * @param {Object} params
 * @param {string|null} params.town - Optional town filter
 * @returns {Promise<Array>} Dishes with restaurant lat/lng
 */
async getMapDishes({ town = null } = {}) {
  try {
    let query = supabase
      .from('dishes')
      .select(`
        id, name, category, avg_rating, total_votes, price, photo_url,
        restaurants!inner (
          id, name, lat, lng, town, address, is_open
        )
      `)
      .eq('restaurants.is_open', true)
      .gt('total_votes', 0)
      .order('avg_rating', { ascending: false, nullsFirst: false })
      .limit(500)

    if (town) {
      query = query.eq('restaurants.town', town)
    }

    const { data, error } = await query

    if (error) throw createClassifiedError(error)

    // Compute percent_worth_it from votes inline? No — we don't have yes_votes here.
    // For map pins we only need avg_rating and total_votes. percent_worth_it is nice-to-have.
    // We'll add it via a parallel votes count if needed later.

    return (data || [])
      .filter(d => d.restaurants?.lat && d.restaurants?.lng)
      .map(d => ({
        dish_id: d.id,
        dish_name: d.name,
        category: d.category,
        avg_rating: d.avg_rating,
        total_votes: d.total_votes || 0,
        price: d.price,
        photo_url: d.photo_url,
        restaurant_id: d.restaurants.id,
        restaurant_name: d.restaurants.name,
        restaurant_lat: d.restaurants.lat,
        restaurant_lng: d.restaurants.lng,
        restaurant_town: d.restaurants.town,
        restaurant_address: d.restaurants.address,
      }))
  } catch (error) {
    logger.error('Error fetching map dishes:', error)
    throw error.type ? error : createClassifiedError(error)
  }
},
```

**Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/api/dishesApi.js
git commit -m "feat: add getMapDishes() API method for dish map pins"
```

---

### Task 2: Create `useMapDishes` hook

**Files:**
- Create: `src/hooks/useMapDishes.js`

**Step 1: Write the hook**

```js
import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import { getUserMessage } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Fetch dishes with restaurant coordinates for map display
 */
export function useMapDishes(town = null, enabled = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['map-dishes', town],
    queryFn: () => dishesApi.getMapDishes({ town }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes — map data changes slowly
  })

  if (error) {
    logger.error('Error fetching map dishes:', error)
  }

  return {
    dishes: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading map') } : null,
  }
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/hooks/useMapDishes.js
git commit -m "feat: add useMapDishes hook for dish map data"
```

---

### Task 3: Rewrite RestaurantMap with dish mode

This is the big task. Replaces the existing RestaurantMap with a dual-mode component.

**Files:**
- Modify: `src/components/restaurants/RestaurantMap.jsx`

**Step 1: Rewrite RestaurantMap.jsx**

Full replacement. The new component:

1. **Props:** `mode` ("restaurant" | "dish"), `restaurants`, `dishes`, `userLocation`, `onSelectRestaurant`, `onSelectDish`, `onAddPlace`, `isAuthenticated`, `existingPlaceIds`, `radiusMi`, `town`
2. **Dark tiles:** CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
3. **Emoji divIcon pins:** One per restaurant, top dish category emoji, gold badge for dish count, gold glow ring for 9+ rated
4. **Mini card overlay:** Custom positioned div (NOT Leaflet Popup), shows top dish info, directions link (`geo:` URI), view dish link
5. **Proximity banner:** Slides in from top when within ~100m of a restaurant
6. **FitBounds:** Reuse existing, also handle town-based zoom
7. **Restaurant mode:** Preserved for backwards compat (existing CircleMarker behavior)

Key implementation details:
- `L.divIcon` with `className: ''` to remove Leaflet's default icon styling
- Mini card positioned with CSS `transform` relative to map container
- `useMapEvents` click handler to dismiss mini card
- Proximity check uses `calculateDistance()` from `src/utils/distance.js`
- All colors via CSS variables
- 44px minimum hit target on pins

The grouping logic (client-side):
```js
// Group dishes by restaurant
const grouped = useMemo(() => {
  const map = {}
  for (const dish of dishes) {
    const rid = dish.restaurant_id
    if (!map[rid]) {
      map[rid] = {
        restaurant_id: rid,
        restaurant_name: dish.restaurant_name,
        lat: dish.restaurant_lat,
        lng: dish.restaurant_lng,
        town: dish.restaurant_town,
        address: dish.restaurant_address,
        dishes: [],
      }
    }
    map[rid].dishes.push(dish)
  }
  // Sort each restaurant's dishes by rating desc
  Object.values(map).forEach(r => {
    r.dishes.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
  })
  return Object.values(map)
}, [dishes])
```

Mini card component (inside RestaurantMap):
```jsx
function MiniCard({ restaurant, userLocation, onDishClick, onDismiss }) {
  const topDish = restaurant.dishes[0]
  const otherCount = restaurant.dishes.length - 1
  const distance = userLocation?.lat
    ? calculateDistance(userLocation.lat, userLocation.lng, restaurant.lat, restaurant.lng).toFixed(1)
    : null

  return (
    <div style={{
      position: 'absolute',
      zIndex: 1000,
      background: 'var(--color-card)',
      borderRadius: '12px',
      padding: '12px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      border: '1px solid var(--color-divider)',
      minWidth: '220px',
      maxWidth: '280px',
    }}>
      {/* Top dish */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {getCategoryEmoji(topDish.category)} {topDish.dish_name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {restaurant.restaurant_name}
          </div>
        </div>
        <div style={{
          fontSize: '16px', fontWeight: 700, color: 'var(--color-rating)',
          flexShrink: 0,
        }}>
          {topDish.avg_rating?.toFixed(1)}
        </div>
      </div>

      {/* Meta line */}
      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
        {distance && `${distance} mi · `}{topDish.total_votes} votes
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <a
          href={`geo:${restaurant.lat},${restaurant.lng}`}
          style={{
            flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
            background: 'rgba(217, 167, 101, 0.12)', color: 'var(--color-accent-gold)',
          }}
        >
          Directions
        </a>
        <button
          onClick={() => onDishClick(topDish.dish_id)}
          style={{
            flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
            background: 'var(--color-primary)', color: 'white',
          }}
        >
          View Dish
        </button>
      </div>

      {/* More dishes link */}
      {otherCount > 0 && (
        <button
          onClick={() => onDismiss('navigate', restaurant.restaurant_id)}
          style={{
            width: '100%', textAlign: 'center', marginTop: '8px', padding: '4px',
            fontSize: '11px', fontWeight: 500, color: 'var(--color-accent-gold)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          +{otherCount} more {otherCount === 1 ? 'dish' : 'dishes'}
        </button>
      )}
    </div>
  )
}
```

Proximity banner:
```jsx
function ProximityBanner({ restaurants, userLocation, permissionGranted, onNavigate }) {
  const [nearbyRestaurant, setNearbyRestaurant] = useState(null)
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    if (!permissionGranted || !userLocation?.lat) {
      setNearbyRestaurant(null)
      return
    }
    for (const r of restaurants) {
      if (dismissed.has(r.restaurant_id)) continue
      const dist = calculateDistance(userLocation.lat, userLocation.lng, r.lat, r.lng)
      if (dist <= 0.062) { // ~100m in miles
        setNearbyRestaurant(r)
        return
      }
    }
    setNearbyRestaurant(null)
  }, [restaurants, userLocation, permissionGranted, dismissed])

  if (!nearbyRestaurant) return null

  return (
    <div style={{
      position: 'absolute', top: '10px', left: '10px', right: '10px', zIndex: 1001,
      background: 'var(--color-card)', borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)', border: '1px solid var(--color-divider)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <button
        onClick={() => onNavigate(nearbyRestaurant.restaurant_id)}
        style={{ all: 'unset', cursor: 'pointer', flex: 1 }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          You're at {nearbyRestaurant.restaurant_name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '2px' }}>
          See their menu
        </div>
      </button>
      <button
        onClick={() => setDismissed(prev => new Set([...prev, nearbyRestaurant.restaurant_id]))}
        style={{ all: 'unset', cursor: 'pointer', padding: '4px', color: 'var(--color-text-tertiary)', fontSize: '16px' }}
      >
        x
      </button>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/components/restaurants/RestaurantMap.jsx
git commit -m "feat: dish map with emoji pins, mini card, proximity banner"
```

---

### Task 4: Wire up Restaurants.jsx

**Files:**
- Modify: `src/pages/Restaurants.jsx`

**Step 1: Import and use `useMapDishes`**

Changes to Restaurants.jsx:
1. Import `useMapDishes` from hooks
2. Import `useLocationContext` town (already imported via LocationContext)
3. Call `useMapDishes(town, viewMode === 'map')` — only fetches when map is visible
4. Pass `dishes`, `mode="dish"`, `town` to RestaurantMap
5. Add `onSelectDish` handler that navigates to `/dish/:dishId`
6. Add restaurant navigation handler for "+N more dishes" and proximity banner

```jsx
// Add to imports:
import { useMapDishes } from '../hooks/useMapDishes'

// Inside component, after existing hooks:
const { town } = useLocationContext()  // town is already destructured if available, check
const { dishes: mapDishes, loading: mapLoading } = useMapDishes(town, viewMode === 'map')

// Update RestaurantMap usage:
<RestaurantMap
  mode="dish"
  restaurants={filteredRestaurants}
  dishes={mapDishes}
  userLocation={location}
  town={town}
  onSelectRestaurant={handleRestaurantSelect}
  onSelectDish={(dishId) => navigate(`/dish/${dishId}`)}
  onAddPlace={(placeName) => {
    setAddRestaurantInitialQuery(placeName)
    setAddRestaurantModalOpen(true)
  }}
  isAuthenticated={!!user}
  existingPlaceIds={existingPlaceIds}
  radiusMi={radius}
  permissionGranted={permissionState === 'granted'}
/>
```

Also update the map loading condition to account for mapLoading.

**Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Manual smoke test**

Run: `npm run dev`
- Toggle to map view on Restaurants page
- Verify emoji pins appear at restaurant locations
- Tap a pin → mini card shows with dish info
- Tap "Directions" → OS maps opens
- Tap "View Dish" → navigates to dish page
- Tap "+N more dishes" → navigates to restaurant page
- Tap elsewhere → mini card dismisses
- Dark tiles render correctly in both themes

**Step 4: Commit**

```bash
git add src/pages/Restaurants.jsx
git commit -m "feat: wire dish map into Restaurants page"
```

---

### Task 5: Final verification and cleanup

**Step 1: Full build check**

Run: `npm run build`
Expected: SUCCESS with no warnings about unused imports

**Step 2: Lint check**

Run: `npm run lint`
Fix any issues.

**Step 3: Check for rule violations**

- Grep for `console.` in new code → should use `logger`
- Grep for hardcoded hex in new code → should use CSS vars
- Grep for `localStorage` in new code → should not exist
- Grep for ES2023+ (`toSorted`, `.at(`) → should not exist
- Verify no `text-gray`, `text-white`, `bg-gray` Tailwind color classes in new code

**Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "fix: dish map lint and rule compliance"
```
