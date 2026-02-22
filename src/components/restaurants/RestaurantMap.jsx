import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { placesApi } from '../../api/placesApi'
import { logger } from '../../utils/logger'
import { getCategoryEmoji } from '../../constants/categories'
import { calculateDistance } from '../../utils/distance'

const MILES_TO_METERS = 1609.34
const EXTRA_RADIUS_MI = 5
const PROXIMITY_THRESHOLD_MI = 0.062 // ~100m

// ─── Shared: Auto-fit bounds on first render ─────────────────────────────────
function FitBounds({ points }) {
  const map = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    if (fittedRef.current || points.length === 0) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    fittedRef.current = true
  }, [points, map])

  return null
}

// ─── Shared: Click handler to dismiss dish mini-card ─────────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: () => {
      if (onMapClick) onMapClick()
    },
  })
  return null
}

// ─── Restaurant Mode: Google Places loader ───────────────────────────────────
function MapPlacesLoader({ onPlacesLoaded, existingPlaceIds, userLocation, radiusMi }) {
  const map = useMap()
  const timerRef = useRef(null)
  const lastFetchRef = useRef(null)
  const discoveryRadiusMeters = Math.round((radiusMi + EXTRA_RADIUS_MI) * MILES_TO_METERS)

  const fetchPlaces = useCallback(async (center) => {
    if (!center) return
    if (lastFetchRef.current) {
      const dist = map.distance(center, lastFetchRef.current)
      if (dist < 500) return
    }
    lastFetchRef.current = center
    const clampedRadius = Math.min(discoveryRadiusMeters, 40234)

    try {
      const places = await placesApi.discoverNearby(center.lat, center.lng, clampedRadius)
      const existingSet = new Set(existingPlaceIds || [])
      const filtered = places.filter(p => p.lat && p.lng && !existingSet.has(p.placeId))
      onPlacesLoaded(filtered)
    } catch (err) {
      logger.error('Map places fetch error:', err)
    }
  }, [map, onPlacesLoaded, existingPlaceIds, discoveryRadiusMeters])

  useMapEvents({
    moveend: () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      const center = map.getCenter()
      timerRef.current = setTimeout(() => fetchPlaces(center), 800)
    },
  })

  useEffect(() => {
    const center = userLocation?.lat && userLocation?.lng
      ? L.latLng(userLocation.lat, userLocation.lng)
      : map.getCenter()
    const timer = setTimeout(() => fetchPlaces(center), 500)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// ─── Restaurant Mode: Search bar ─────────────────────────────────────────────
function MapSearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const map = useMap()

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const encoded = encodeURIComponent(query.trim())
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon } = data[0]
        map.flyTo([parseFloat(lat), parseFloat(lon)], 14, { duration: 1.5 })
        if (onSearch) onSearch(query.trim())
      }
    } catch (err) {
      logger.error('Map geocode error:', err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '50px',
        zIndex: 1000,
        display: 'flex',
        gap: '6px',
      }}
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search a location..."
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.2)',
          background: 'white',
          fontSize: '13px',
          color: '#333',
          outline: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      />
      <button
        onClick={handleSearch}
        disabled={searching}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          background: '#6BB384',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          cursor: searching ? 'wait' : 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          opacity: searching ? 0.7 : 1,
        }}
      >
        {searching ? '...' : 'Go'}
      </button>
    </div>
  )
}

// ─── Restaurant Mode: Place popup content ────────────────────────────────────
function PlacePopupContent({ place, onAddPlace }) {
  const [details, setDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const fetchedRef = useRef(false)

  const fetchDetails = useCallback(async () => {
    if (fetchedRef.current || !place.placeId) return
    fetchedRef.current = true
    setLoadingDetails(true)
    try {
      const d = await placesApi.getDetails(place.placeId)
      setDetails(d)
    } catch (err) {
      logger.error('Place details fetch error:', err)
    } finally {
      setLoadingDetails(false)
    }
  }, [place.placeId])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const googleMapsUrl = details?.googleMapsUrl
  const websiteUrl = details?.websiteUrl

  return (
    <div style={{ minWidth: '160px' }}>
      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
        {place.name}
      </div>
      {place.address && (
        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
          {place.address}
        </div>
      )}
      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px', fontStyle: 'italic' }}>
        Not on WGH yet
      </div>
      {loadingDetails && (
        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '6px' }}>
          Loading details...
        </div>
      )}
      {(googleMapsUrl || websiteUrl) && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#4A90D9',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Google Maps
            </a>
          )}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#4A90D9',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.97.633-3.792 1.708-5.272" />
              </svg>
              Website
            </a>
          )}
        </div>
      )}
      {onAddPlace && (
        <button
          onClick={() => onAddPlace(place.name)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            background: 'rgba(107, 179, 132, 0.15)',
            color: '#6BB384',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add to WGH
        </button>
      )}
    </div>
  )
}

// ─── Dish Mode: Build emoji divIcon ──────────────────────────────────────────
function buildEmojiIcon(emoji, dishCount, hasHighRating) {
  const badge = dishCount >= 2
    ? `<span style="
        position:absolute;top:-4px;right:-4px;
        background:var(--color-accent-gold);color:var(--color-bg);
        font-size:10px;font-weight:700;
        min-width:16px;height:16px;line-height:16px;
        border-radius:8px;text-align:center;
        padding:0 3px;
        box-shadow:0 1px 3px rgba(0,0,0,0.3);
      ">${dishCount}</span>`
    : ''

  const glow = hasHighRating
    ? 'box-shadow:0 0 8px 3px rgba(217,167,101,0.5);'
    : ''

  return L.divIcon({
    className: '',
    html: `<div style="
      position:relative;width:44px;height:44px;
      display:flex;align-items:center;justify-content:center;
      font-size:26px;cursor:pointer;
      border-radius:50%;
      background:var(--color-surface-elevated);
      border:2px solid var(--color-divider);
      ${glow}
    ">${emoji}${badge}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function RestaurantMap({
  mode = 'dish',
  restaurants = [],
  dishes = [],
  userLocation,
  town,
  onSelectRestaurant,
  onSelectDish,
  onAddPlace,
  isAuthenticated,
  existingPlaceIds,
  radiusMi,
  permissionGranted,
  compact = false,
  fullScreen = false,
}) {
  const defaultCenter = [41.43, -70.56]
  const center = userLocation?.lat && userLocation?.lng
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

  // ─── Restaurant mode state ───
  const [discoveredPlaces, setDiscoveredPlaces] = useState([])

  // ─── Dish mode state ───
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null)
  const [dismissedProximity, setDismissedProximity] = useState({})

  // ─── Dish mode: group dishes by restaurant ───
  const restaurantGroups = useMemo(() => {
    if (mode !== 'dish' || !dishes || dishes.length === 0) return []

    const groupMap = {}
    for (let i = 0; i < dishes.length; i++) {
      const d = dishes[i]
      const rid = d.restaurant_id
      if (!rid) continue
      if (!groupMap[rid]) {
        groupMap[rid] = {
          restaurant_id: rid,
          restaurant_name: d.restaurant_name,
          restaurant_lat: d.restaurant_lat,
          restaurant_lng: d.restaurant_lng,
          restaurant_address: d.restaurant_address,
          dishes: [],
        }
      }
      groupMap[rid].dishes.push(d)
    }

    // Sort dishes within each group by avg_rating desc
    const groups = Object.values(groupMap)
    for (let i = 0; i < groups.length; i++) {
      groups[i].dishes = groups[i].dishes.slice().sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    }

    return groups
  }, [mode, dishes])

  // ─── Dish mode: selected group for mini card ───
  const selectedGroup = useMemo(() => {
    if (!selectedRestaurantId) return null
    for (let i = 0; i < restaurantGroups.length; i++) {
      if (restaurantGroups[i].restaurant_id === selectedRestaurantId) {
        return restaurantGroups[i]
      }
    }
    return null
  }, [selectedRestaurantId, restaurantGroups])

  // ─── Dish mode: proximity detection ───
  const nearbyRestaurant = useMemo(() => {
    if (mode !== 'dish' || !permissionGranted || !userLocation?.lat || !userLocation?.lng) return null

    for (let i = 0; i < restaurantGroups.length; i++) {
      const g = restaurantGroups[i]
      if (dismissedProximity[g.restaurant_id]) continue
      const dist = calculateDistance(
        userLocation.lat, userLocation.lng,
        g.restaurant_lat, g.restaurant_lng
      )
      if (dist <= PROXIMITY_THRESHOLD_MI) return g
    }
    return null
  }, [mode, permissionGranted, userLocation, restaurantGroups, dismissedProximity])

  // ─── Dish mode: compute distance for selected group ───
  const selectedGroupDistance = useMemo(() => {
    if (!selectedGroup || !userLocation?.lat || !userLocation?.lng) return null
    const dist = calculateDistance(
      userLocation.lat, userLocation.lng,
      selectedGroup.restaurant_lat, selectedGroup.restaurant_lng
    )
    return dist.toFixed(1)
  }, [selectedGroup, userLocation])

  // ─── Fit bounds points ───
  const fitBoundsPoints = useMemo(() => {
    const pts = []
    if (userLocation?.lat && userLocation?.lng) {
      pts.push([userLocation.lat, userLocation.lng])
    }

    if (mode === 'dish') {
      for (let i = 0; i < restaurantGroups.length; i++) {
        const g = restaurantGroups[i]
        if (g.restaurant_lat && g.restaurant_lng) {
          pts.push([g.restaurant_lat, g.restaurant_lng])
        }
      }
    } else {
      for (let i = 0; i < restaurants.length; i++) {
        const r = restaurants[i]
        if (r.lat && r.lng) pts.push([r.lat, r.lng])
      }
    }

    return pts
  }, [mode, restaurantGroups, restaurants, userLocation])

  // ─── Dish mode: total votes for selected group ───
  const selectedGroupVotes = useMemo(() => {
    if (!selectedGroup) return 0
    let total = 0
    for (let i = 0; i < selectedGroup.dishes.length; i++) {
      total += selectedGroup.dishes[i].total_votes || 0
    }
    return total
  }, [selectedGroup])

  // ────────────────────── RENDER ──────────────────────

  const isDishMode = mode === 'dish'

  var mapHeight = fullScreen ? '100vh' : compact ? '260px' : 'calc(100dvh - 160px)'

  return (
    <div
      style={{
        height: mapHeight,
        width: '100%',
        borderRadius: fullScreen ? '0' : '12px',
        overflow: 'hidden',
        border: fullScreen ? 'none' : '1px solid var(--color-divider)',
        position: 'relative',
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
        zoomControl={true}
      >
        {/* Tiles */}
        {isDishMode ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Fit bounds */}
        <FitBounds points={fitBoundsPoints} />

        {/* Click handler — dismisses dish mini-card */}
        {isDishMode && (
          <MapClickHandler onMapClick={() => setSelectedRestaurantId(null)} />
        )}

        {/* ─── Restaurant mode internals (disabled in fullScreen) ─── */}
        {!isDishMode && !fullScreen && <MapSearchBar />}
        {!isDishMode && !fullScreen && isAuthenticated && (
          <MapPlacesLoader
            onPlacesLoaded={setDiscoveredPlaces}
            existingPlaceIds={existingPlaceIds}
            userLocation={userLocation}
            radiusMi={radiusMi || 10}
          />
        )}

        {/* User location — blue pulsing dot (both modes) */}
        {userLocation?.lat && userLocation?.lng && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={16}
              pathOptions={{
                color: '#4A90D9',
                fillColor: '#4A90D9',
                fillOpacity: 0.15,
                weight: 1,
                opacity: 0.3,
              }}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={7}
              pathOptions={{
                color: '#fff',
                fillColor: '#4A90D9',
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Popup>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>You are here</span>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* ─── Dish mode: emoji pins ─── */}
        {isDishMode && restaurantGroups.map(group => {
          const topDish = group.dishes[0]
          if (!topDish) return null
          const emoji = getCategoryEmoji(topDish.category)
          const hasHighRating = group.dishes.some(d => (d.avg_rating || 0) >= 9)
          const icon = buildEmojiIcon(emoji, group.dishes.length, hasHighRating)

          return (
            <Marker
              key={group.restaurant_id}
              position={[group.restaurant_lat, group.restaurant_lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (fullScreen && onSelectDish) {
                    // In fullScreen (Home page): signal dish selection to parent
                    onSelectDish(topDish.dish_id)
                  } else {
                    // In non-fullScreen (Restaurants page): show mini-card
                    setSelectedRestaurantId(group.restaurant_id)
                  }
                },
              }}
            />
          )
        })}

        {/* ─── Restaurant mode: gold pins ─── */}
        {!isDishMode && restaurants
          .filter(r => r.lat && r.lng)
          .map(restaurant => {
            const isOpen = restaurant.is_open !== false
            const dishCount = restaurant.dish_count ?? restaurant.dishCount ?? 0
            const distanceMiles = restaurant.distance_miles

            return (
              <CircleMarker
                key={restaurant.id}
                center={[restaurant.lat, restaurant.lng]}
                radius={8}
                pathOptions={{
                  color: isOpen ? '#D9A765' : '#7D7168',
                  fillColor: isOpen ? '#D9A765' : '#7D7168',
                  fillOpacity: isOpen ? 0.9 : 0.5,
                  weight: 2,
                  opacity: 1,
                }}
              >
                <Popup>
                  <div style={{ minWidth: '140px' }}>
                    <button
                      onClick={() => onSelectRestaurant(restaurant)}
                      style={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'block',
                        width: '100%',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                        {restaurant.name}
                      </div>
                      {restaurant.cuisine && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '2px' }}>
                          {restaurant.cuisine}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {dishCount} {dishCount === 1 ? 'dish' : 'dishes'}
                        {distanceMiles != null && ` \u00b7 ${distanceMiles} mi`}
                      </div>
                      {!isOpen && (
                        <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '2px', fontWeight: 600 }}>
                          Closed for Season
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: 'var(--color-accent-gold)', marginTop: '4px', fontWeight: 500 }}>
                        View dishes &rarr;
                      </div>
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}

        {/* ─── Restaurant mode: Google Places pins ─── */}
        {!isDishMode && discoveredPlaces.map(place => (
          <CircleMarker
            key={place.placeId}
            center={[place.lat, place.lng]}
            radius={7}
            pathOptions={{
              color: '#6BB384',
              fillColor: '#6BB384',
              fillOpacity: 0.35,
              weight: 2,
              dashArray: '4 4',
              opacity: 0.8,
            }}
          >
            <Popup>
              <PlacePopupContent place={place} onAddPlace={onAddPlace} />
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* ─── Dish mode: Proximity banner ─── */}
      {isDishMode && nearbyRestaurant && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-accent-gold)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              You're at {nearbyRestaurant.restaurant_name}
            </div>
            <button
              onClick={() => {
                if (onSelectRestaurant) {
                  onSelectRestaurant({ id: nearbyRestaurant.restaurant_id, name: nearbyRestaurant.restaurant_name })
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-accent-gold)',
                cursor: 'pointer',
                marginTop: '2px',
              }}
            >
              See their menu &rarr;
            </button>
          </div>
          <button
            onClick={() => setDismissedProximity(prev => ({ ...prev, [nearbyRestaurant.restaurant_id]: true }))}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
              color: 'var(--color-text-tertiary)',
              padding: '2px',
              flexShrink: 0,
            }}
          >
            &#10005;
          </button>
        </div>
      )}

      {/* ─── Dish mode: Mini card overlay ─── */}
      {isDishMode && selectedGroup && (() => {
        const topDish = selectedGroup.dishes[0]
        const emoji = getCategoryEmoji(topDish.category)
        const moreDishes = selectedGroup.dishes.length - 1

        return (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              width: 'calc(100% - 20px)',
              maxWidth: '320px',
              borderRadius: '12px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-divider)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              padding: '12px 14px',
            }}
          >
            {/* Top dish row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {emoji} {topDish.dish_name}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-rating)',
                    flexShrink: 0,
                  }}>
                    {topDish.avg_rating != null ? Number(topDish.avg_rating).toFixed(1) : '--'}
                  </span>
                </div>

                {/* Restaurant name */}
                <div style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                }}>
                  {selectedGroup.restaurant_name}
                </div>

                {/* Meta line */}
                <div style={{
                  fontSize: '11px',
                  color: 'var(--color-text-tertiary)',
                  marginTop: '2px',
                }}>
                  {selectedGroupDistance != null ? `${selectedGroupDistance} mi` : ''}
                  {selectedGroupDistance != null && selectedGroupVotes > 0 ? ' \u00b7 ' : ''}
                  {selectedGroupVotes > 0 ? `${selectedGroupVotes} vote${selectedGroupVotes !== 1 ? 's' : ''}` : ''}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '10px',
            }}>
              <a
                href={`geo:${selectedGroup.restaurant_lat},${selectedGroup.restaurant_lng}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-divider)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Directions
              </a>
              <button
                onClick={() => {
                  if (onSelectDish) onSelectDish(topDish.dish_id)
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 0',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                }}
              >
                View Dish
              </button>
            </div>

            {/* More dishes link */}
            {moreDishes > 0 && (
              <button
                onClick={() => {
                  if (onSelectRestaurant) {
                    onSelectRestaurant({ id: selectedGroup.restaurant_id, name: selectedGroup.restaurant_name })
                  }
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  marginTop: '8px',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-accent-gold)',
                  cursor: 'pointer',
                }}
              >
                +{moreDishes} more dish{moreDishes !== 1 ? 'es' : ''}
              </button>
            )}
          </div>
        )
      })()}

      {/* ─── Legend ─── */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          background: isDishMode ? 'rgba(13,27,34,0.9)' : 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {isDishMode ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🍕</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Dish category</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '8px',
                background: 'var(--color-accent-gold)',
                color: 'var(--color-bg)',
                fontSize: '9px',
                fontWeight: 700,
              }}>3</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>Dish count</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                boxShadow: '0 0 6px 2px rgba(217,167,101,0.5)',
                border: '2px solid var(--color-divider)',
              }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>Rated 9+</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D9A765', display: 'inline-block' }} />
              <span style={{ color: '#555' }}>On WGH</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6BB384', opacity: 0.5, border: '1px dashed #6BB384', display: 'inline-block' }} />
              <span style={{ color: '#555' }}>Google Places</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
