import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dishesApi } from '../api/dishesApi'
import { getUserMessage } from '../utils/errorHandler'
import { calculateDistance } from '../utils/distance'
import { logger } from '../utils/logger'

/**
 * Fetch dishes with restaurant coordinates for map display
 * Client-side distance filtering based on user location + radius
 */
export function useMapDishes({ location, radius, town, category } = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['map-dishes', town, category],
    queryFn: () => dishesApi.getMapDishes({ town, category }),
    staleTime: 1000 * 60 * 5,
  })

  if (error) {
    logger.error('Error fetching map dishes:', error)
  }

  // Client-side distance filter + sort by rating
  // Falls back to all dishes (sorted by rating) if nothing is within radius
  const dishes = useMemo(() => {
    if (!data || data.length === 0) return []

    // Add distance to every dish if we have user location
    var withDistance = data
    if (location?.lat && location?.lng) {
      withDistance = data.map(function(d) {
        return Object.assign({}, d, {
          distance_miles: calculateDistance(
            location.lat, location.lng,
            d.restaurant_lat, d.restaurant_lng
          ),
        })
      })
    }

    // Apply distance filter if we have radius
    var filtered = withDistance
    if (radius && withDistance[0] && withDistance[0].distance_miles != null) {
      var nearby = withDistance.filter(function(d) { return d.distance_miles <= radius })
      if (nearby.length > 0) {
        filtered = nearby
      }
      // If nothing nearby, show all (fallback so page always has content)
    }

    // Sort by rating desc
    return filtered.slice().sort(function(a, b) { return (b.avg_rating || 0) - (a.avg_rating || 0) })
  }, [data, location, radius])

  return {
    dishes,
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading map') } : null,
  }
}
