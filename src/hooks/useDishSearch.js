import { useMemo } from 'react'
import { useAllDishes } from './useAllDishes'
import { searchDishes } from '../utils/dishSearch'

/**
 * Search dishes with instant client-side filtering.
 * Same API signature as previous server-based version.
 * @param {string} query - Search query
 * @param {number} limit - Max results (default 5)
 * @param {string|null} town - Optional town filter
 * @returns {Object} { results, loading, error }
 */
export function useDishSearch(query, limit = 5, town = null) {
  const { dishes, loading: cacheLoading, error } = useAllDishes()

  const trimmedQuery = query?.trim() || ''

  const results = useMemo(() => {
    if (trimmedQuery.length < 2) return []
    if (!dishes.length) return []
    return searchDishes(dishes, trimmedQuery, { town, limit })
  }, [dishes, trimmedQuery, town, limit])

  return {
    results,
    loading: cacheLoading && trimmedQuery.length >= 2,
    error,
  }
}
