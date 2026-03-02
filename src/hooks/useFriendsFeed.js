import { useQuery } from '@tanstack/react-query'
import { diaryApi } from '../api/diaryApi'

export function useFriendsFeed(userId) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['friendsFeed', userId],
    queryFn: () => diaryApi.getFriendsFeed({ limit: 30 }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })

  return {
    feed: data || [],
    loading: userId ? isLoading : false,
    refetch,
  }
}
