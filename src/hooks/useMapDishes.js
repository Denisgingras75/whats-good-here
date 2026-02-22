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
  const dishes = useMemo(() => {
    if (!data || data.length === 0) return []

    let filtered = data

    // Apply distance filter if we have user location
    if (location?.lat && location?.lng && radius) {
      filtered = data.filter(d => {
        const dist = calculateDistance(
          location.lat, location.lng,
          d.restaurant_lat, d.restaurant_lng
        )
        return dist <= radius
      })

      // Add distance to each dish
      filtered = filtered.map(d => ({
        ...d,
        distance_miles: calculateDistance(
          location.lat, location.lng,
          d.restaurant_lat, d.restaurant_lng
        ),
      }))
    }

    // Sort by rating desc
    return filtered.slice().sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
  }, [data, location, radius])

  return {
    dishes,
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading map') } : null,
  }
}
