import { useQuery } from '@tanstack/react-query'
import { curatorsApi } from '../api/curatorsApi'
import { getUserMessage } from '../utils/errorHandler'

/**
 * Fetch all curators
 */
export function useCurators() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['curators'],
    queryFn: () => curatorsApi.getCurators(),
    staleTime: 1000 * 60 * 10, // 10 min
  })

  return {
    curators: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading curators') } : null,
  }
}

/**
 * Fetch picks for a specific curator, optionally filtered by list category
 */
export function useCuratorPicks(curatorId, listCategory) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['curator-picks', curatorId, listCategory],
    queryFn: () => curatorsApi.getCuratorPicks(curatorId, listCategory),
    enabled: !!curatorId,
    staleTime: 1000 * 60 * 10, // 10 min
  })

  return {
    picks: data || [],
    loading: isLoading,
    error: error ? { message: getUserMessage(error, 'loading picks') } : null,
  }
}

/**
 * Fetch list categories for a specific curator
 */
export function useCuratorListCategories(curatorId) {
  const { data, isLoading } = useQuery({
    queryKey: ['curator-categories', curatorId],
    queryFn: () => curatorsApi.getCuratorListCategories(curatorId),
    enabled: !!curatorId,
    staleTime: 1000 * 60 * 10, // 10 min
  })

  return {
    categories: data || [],
    loading: isLoading,
  }
}
