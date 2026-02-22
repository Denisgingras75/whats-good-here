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
    staleTime: 1000 * 60 * 5,
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
