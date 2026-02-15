import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { placesApi } from '../../api/placesApi'
import { logger } from '../../utils/logger'

// Auto-fit bounds on first render only
function FitBounds({ restaurants, userLocation }) {
  const map = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    if (fittedRef.current) return

    const points = restaurants
      .filter(r => r.lat && r.lng)
      .map(r => [r.lat, r.lng])

    if (userLocation?.lat && userLocation?.lng) {
      points.push([userLocation.lat, userLocation.lng])
    }

    if (points.length === 0) return

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    fittedRef.current = true
  }, [restaurants, userLocation, map])

  return null
}

// Fetches Google Places when the map viewport changes
function MapPlacesLoader({ onPlacesLoaded, existingPlaceIds }) {
  const map = useMap()
  const timerRef = useRef(null)
  const lastCenterRef = useRef(null)

  const fetchPlaces = useCallback(async () => {
    const center = map.getCenter()
    const bounds = map.getBounds()

    // Calculate radius from bounds (diagonal / 2 in meters)
    const ne = bounds.getNorthEast()
    const sw = bounds.getSouthWest()
    const radiusMeters = Math.round(
      map.distance(ne, sw) / 2
    )

    // Skip if center hasn't moved significantly (< 500m)
    if (lastCenterRef.current) {
      const dist = map.distance(center, lastCenterRef.current)
      if (dist < 500) return
    }
    lastCenterRef.current = center

    // Cap at 40km (~25mi) to match edge function limit
    const clampedRadius = Math.min(radiusMeters, 40234)

    try {
      const places = await placesApi.discoverNearby(center.lat, center.lng, clampedRadius)
      // Filter out places already in DB
      const existingSet = new Set(existingPlaceIds || [])
      const filtered = places.filter(p => p.lat && p.lng && !existingSet.has(p.placeId))
      onPlacesLoaded(filtered)
    } catch (err) {
      logger.error('Map places fetch error:', err)
    }
  }, [map, onPlacesLoaded, existingPlaceIds])

  useMapEvents({
    moveend: () => {
      // Debounce: wait 800ms after map stops moving
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(fetchPlaces, 800)
    },
  })

  // Fetch on initial mount too
  useEffect(() => {
    const timer = setTimeout(fetchPlaces, 500)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// Search bar overlay on the map
function MapSearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const map = useMap()

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      // Use Nominatim geocoder (free, no API key)
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

export function RestaurantMap({ restaurants, userLocation, onSelectRestaurant, onAddPlace, isAuthenticated, existingPlaceIds }) {
  const defaultCenter = [41.43, -70.56] // Martha's Vineyard
  const center = userLocation?.lat && userLocation?.lng
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter

  const [discoveredPlaces, setDiscoveredPlaces] = useState([])

  return (
    <div
      style={{
        height: 'calc(100dvh - 160px)',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--color-divider)',
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds restaurants={restaurants} userLocation={userLocation} />

        {/* Search bar */}
        <MapSearchBar />

        {/* Dynamic Google Places loader — only for authenticated users */}
        {isAuthenticated && (
          <MapPlacesLoader
            onPlacesLoaded={setDiscoveredPlaces}
            existingPlaceIds={existingPlaceIds}
          />
        )}

        {/* User location — blue pulsing dot */}
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

        {/* DB restaurant pins — gold solid */}
        {restaurants
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

        {/* Google Places pins — green dashed, discovered dynamically */}
        {discoveredPlaces.map(place => (
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
              <div style={{ minWidth: '140px' }}>
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
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '11px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D9A765', display: 'inline-block' }} />
          <span style={{ color: '#555' }}>On WGH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6BB384', opacity: 0.5, border: '1px dashed #6BB384', display: 'inline-block' }} />
          <span style={{ color: '#555' }}>Google Places</span>
        </div>
      </div>
    </div>
  )
}
