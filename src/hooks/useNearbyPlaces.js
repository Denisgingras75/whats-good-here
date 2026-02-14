import { useQuery } from '@tanstack/react-query'
import { placesApi } from '../api/placesApi'
import { logger } from '../utils/logger'

const MILES_TO_METERS = 1609.34

/**
 * Discover nearby restaurants via Google Places that aren't already in the DB.
 * Only runs when: user is authenticated AND radius >= 10 miles (off-island discovery).
 *
 * @param {Object} params
 * @param {number} params.lat - User latitude
 * @param {number} params.lng - User longitude
 * @param {number} params.radius - Radius in miles
 * @param {boolean} params.isAuthenticated - Whether user is logged in
 * @param {string[]} params.existingPlaceIds - Google Place IDs already in DB
 */
export function useNearbyPlaces({ lat, lng, radius, isAuthenticated, existingPlaceIds = [] }) {
  const enabled = !!isAuthenticated && radius >= 10 && !!lat && !!lng
  const radiusMeters = Math.round(radius * MILES_TO_METERS)

  const { data, isLoading, error } = useQuery({
    queryKey: ['nearbyPlaces', lat, lng, radius],
    queryFn: async () => {
      const predictions = await placesApi.discoverNearby(lat, lng, radiusMeters)
      return predictions
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Google Places API is rate-limited — retries make it worse
  })

  // Filter out places already in the DB
  const existingSet = new Set(existingPlaceIds)
  const places = (data || []).filter(p => !existingSet.has(p.placeId))

  if (error) {
    logger.error('Error discovering nearby places:', error)
  }

  return {
    places,
    loading: isLoading && enabled,
    error: error ? { message: 'Could not load nearby restaurant suggestions' } : null,
  }
}
