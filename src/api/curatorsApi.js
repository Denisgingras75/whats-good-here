import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Curators API - Data fetching for curated lists
 */
export const curatorsApi = {
  /**
   * Get all curators with their profile info
   * @returns {Promise<Array>} Array of curator profiles
   */
  async getCurators() {
    try {
      const { data, error } = await supabase.rpc('get_curators')
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching curators:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get picks for a specific curator, optionally filtered by list category
   * @param {string} curatorId - Curator's user ID
   * @param {string|null} listCategory - Optional list category filter
   * @returns {Promise<Array>} Array of curator picks with dish/restaurant info
   */
  async getCuratorPicks(curatorId, listCategory) {
    try {
      const params = { p_curator_id: curatorId }
      if (listCategory !== undefined && listCategory !== null) {
        params.p_list_category = listCategory
      }
      const { data, error } = await supabase.rpc('get_curator_picks', params)
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching curator picks:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get list categories for a specific curator
   * @param {string} curatorId - Curator's user ID
   * @returns {Promise<Array>} Array of list categories with pick counts
   */
  async getCuratorListCategories(curatorId) {
    try {
      const { data, error } = await supabase.rpc('get_curator_list_categories', {
        p_curator_id: curatorId,
      })
      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching curator list categories:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
