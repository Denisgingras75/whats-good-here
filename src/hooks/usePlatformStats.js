import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/statsApi'

export function usePlatformStats() {
  var { data, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: function () { return statsApi.getPlatformStats() },
    staleTime: 5 * 60 * 1000
  })

  return {
    stats: data || null,
    loading: isLoading
  }
}
