import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import { createClassifiedError } from '../utils/errorHandler'

/**
 * Diary API - Personal food diary, shelves, and collections
 * SECURITY: All methods use auth.getUser() internally
 */

export const diaryApi = {
  // ── Dish Logs ──

  async logDish({ dishId, rating5, note, occasion, diningWith, photoUrl }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to log dishes')

      const { data, error } = await supabase
        .from('dish_logs')
        .insert({
          user_id: user.id,
          dish_id: dishId,
          rating_5: rating5 || null,
          note: note || null,
          occasion: occasion || null,
          dining_with: diningWith || null,
          photo_url: photoUrl || null,
        })
        .select()
        .maybeSingle()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error logging dish:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async getDiaryFeed({ limit = 20, offset = 0 } = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .rpc('get_diary_feed', {
          p_user_id: user.id,
          p_limit: limit,
          p_offset: offset,
        })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching diary feed:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async deleteLog(logId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { error } = await supabase
        .from('dish_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', user.id)

      if (error) throw createClassifiedError(error)
      return { success: true }
    } catch (error) {
      logger.error('Error deleting log:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  // ── Shelves ──

  async getShelves() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .rpc('get_user_shelves', { p_user_id: user.id })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching shelves:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async getUserShelves(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_shelves', { p_user_id: userId })

      if (error) throw createClassifiedError(error)
      return (data || []).filter(s => s.is_public)
    } catch (error) {
      logger.error('Error fetching user shelves:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async createShelf({ name, description, isPublic = false }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { data, error } = await supabase
        .from('shelves')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_public: isPublic,
          shelf_type: 'custom',
        })
        .select()
        .maybeSingle()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error creating shelf:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async updateShelf(shelfId, { name, description, isPublic }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const updates = {}
      if (name !== undefined) updates.name = name
      if (description !== undefined) updates.description = description
      if (isPublic !== undefined) updates.is_public = isPublic

      const { data, error } = await supabase
        .from('shelves')
        .update(updates)
        .eq('id', shelfId)
        .eq('user_id', user.id)
        .select()
        .maybeSingle()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error updating shelf:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async deleteShelf(shelfId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { error } = await supabase
        .from('shelves')
        .delete()
        .eq('id', shelfId)
        .eq('user_id', user.id)
        .eq('is_default', false)

      if (error) throw createClassifiedError(error)
      return { success: true }
    } catch (error) {
      logger.error('Error deleting shelf:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  // ── Shelf Items ──

  async getShelfItems(shelfId) {
    try {
      const { data, error } = await supabase
        .rpc('get_shelf_items', { p_shelf_id: shelfId })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching shelf items:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async addToShelf(shelfId, dishId, note) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { error } = await supabase
        .from('shelf_items')
        .insert({
          shelf_id: shelfId,
          dish_id: dishId,
          note: note || null,
        })

      if (error) {
        if (error.code === '23505') return { success: true }
        throw createClassifiedError(error)
      }
      return { success: true }
    } catch (error) {
      logger.error('Error adding to shelf:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async removeFromShelf(shelfId, dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { error } = await supabase
        .from('shelf_items')
        .delete()
        .eq('shelf_id', shelfId)
        .eq('dish_id', dishId)

      if (error) throw createClassifiedError(error)
      return { success: true }
    } catch (error) {
      logger.error('Error removing from shelf:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async addToWantToTry(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { data: shelf } = await supabase
        .from('shelves')
        .select('id')
        .eq('user_id', user.id)
        .eq('shelf_type', 'want_to_try')
        .maybeSingle()

      if (!shelf) throw new Error('Want to Try shelf not found')

      return this.addToShelf(shelf.id, dishId)
    } catch (error) {
      logger.error('Error adding to Want to Try:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  async removeFromWantToTry(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      const { data: shelf } = await supabase
        .from('shelves')
        .select('id')
        .eq('user_id', user.id)
        .eq('shelf_type', 'want_to_try')
        .maybeSingle()

      if (!shelf) return { success: true }

      return this.removeFromShelf(shelf.id, dishId)
    } catch (error) {
      logger.error('Error removing from Want to Try:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  // ── Social Feed ──

  async getFriendsFeed({ limit = 20, offset = 0 } = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .rpc('get_friends_feed', {
          p_user_id: user.id,
          p_limit: limit,
          p_offset: offset,
        })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching friends feed:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  // ── Taste Stats ──

  async getTasteStats(userId) {
    try {
      const targetId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!targetId) return null

      const { data, error } = await supabase
        .rpc('get_taste_stats', { p_user_id: targetId })

      if (error) throw createClassifiedError(error)
      return data?.[0] || null
    } catch (error) {
      logger.error('Error fetching taste stats:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
