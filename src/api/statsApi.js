import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const statsApi = {
  async getPlatformStats() {
    try {
      const { data, error } = await supabase.rpc('get_platform_stats')
      if (error) throw createClassifiedError(error)
      return data || { dish_count: 0, restaurant_count: 0, vote_count: 0 }
    } catch (e) {
      logger.error('statsApi.getPlatformStats:', e)
      throw e.type ? e : createClassifiedError(e)
    }
  }
}
