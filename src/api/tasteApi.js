import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

export const tasteApi = {
  /**
   * Get users with highest taste compatibility who the caller doesn't follow
   * @param {number} limit - Max results (default 5)
   * @returns {Promise<Array<{user_id, display_name, shared_dishes, compatibility_pct}>>}
   */
  async getSimilarTasteUsers(limit = 5) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase.rpc('get_similar_taste_users', {
      p_user_id: user.id,
      p_limit: limit,
    })

    if (error) {
      logger.error('Error fetching similar taste users:', error)
      return []
    }

    return data || []
  },
}
