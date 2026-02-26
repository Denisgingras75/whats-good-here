import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import { createClassifiedError } from '../utils/errorHandler'
import { validateUserContent } from '../lib/reviewBlocklist'

export const specialsApi = {
  /**
   * Get all active specials with restaurant info
   */
  async getActiveSpecials() {
    try {
      const { data, error } = await supabase
        .from('specials')
        .select(`
          *,
          restaurants (
            id,
            name,
            town,
            address
          )
        `)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching specials:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get specials for a specific restaurant
   */
  async getByRestaurant(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('specials')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching restaurant specials:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Create a new special
   */
  async create({ restaurantId, dealName, description, price, expiresAt }) {
    try {
      // Content moderation
      const nameError = validateUserContent(dealName, 'Special name')
      if (nameError) throw createClassifiedError(new Error(nameError))
      if (description) {
        const descError = validateUserContent(description, 'Description')
        if (descError) throw createClassifiedError(new Error(descError))
      }

      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('specials')
        .insert({
          restaurant_id: restaurantId,
          deal_name: dealName,
          description,
          price,
          expires_at: expiresAt,
          created_by: user?.id
        })
        .select()
        .single()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error creating special:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Update a special
   */
  async update(id, updates) {
    try {
      const allowed = {}
      if (updates.deal_name !== undefined) allowed.deal_name = updates.deal_name
      if (updates.description !== undefined) allowed.description = updates.description
      if (updates.price !== undefined) allowed.price = updates.price
      if (updates.expires_at !== undefined) allowed.expires_at = updates.expires_at
      if (updates.is_active !== undefined) allowed.is_active = updates.is_active

      const { data, error } = await supabase
        .from('specials')
        .update(allowed)
        .eq('id', id)
        .select()
        .single()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error updating special:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Deactivate a special (soft delete)
   */
  async deactivate(id) {
    return this.update(id, { is_active: false })
  },

  /**
   * Record a view for a special (anonymous, fire-and-forget)
   */
  async recordView(specialId) {
    try {
      const { error } = await supabase
        .from('special_views')
        .insert({ special_id: specialId })
      if (error) throw createClassifiedError(error)
    } catch (error) {
      // Silent fail — view tracking should never break UX
      logger.warn('Failed to record special view:', error)
    }
  },
}

export default specialsApi
