import { supabase } from '../lib/supabase'

/**
 * Favorites API - Centralized data fetching and mutation for saved dishes
 */

export const favoritesApi = {
  /**
   * Get favorite dish IDs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of dish IDs
   */
  async getFavoriteIds(userId) {
    try {
      if (!userId) {
        return []
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('dish_id')
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return (data || []).map(f => f.dish_id)
    } catch (error) {
      console.error('Error fetching favorite IDs:', error)
      throw error
    }
  },

  /**
   * Add a dish to favorites
   * @param {string} userId - User ID
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Success status
   */
  async addFavorite(userId, dishId) {
    try {
      if (!userId) {
        throw new Error('Not logged in')
      }

      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, dish_id: dishId })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
  },

  /**
   * Remove a dish from favorites
   * @param {string} userId - User ID
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Success status
   */
  async removeFavorite(userId, dishId) {
    try {
      if (!userId) {
        throw new Error('Not logged in')
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('dish_id', dishId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  },

  /**
   * Get all saved dishes for the current user
   * @returns {Promise<Object>} Object with savedDishIds array and savedDishes array
   */
  async getSavedDishes() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return { savedDishIds: [], savedDishes: [] }
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          dish_id,
          created_at,
          dishes (
            id,
            name,
            category,
            price,
            photo_url,
            restaurants (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const savedDishIds = (data || []).map(f => f.dish_id)
      const savedDishes = (data || []).map(f => ({
        dish_id: f.dishes.id,
        dish_name: f.dishes.name,
        category: f.dishes.category,
        price: f.dishes.price,
        photo_url: f.dishes.photo_url,
        restaurant_name: f.dishes.restaurants?.name,
        saved_at: f.created_at,
      }))

      return { savedDishIds, savedDishes }
    } catch (error) {
      console.error('Error fetching saved dishes:', error)
      throw error
    }
  },

  /**
   * Save a dish
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Success status
   */
  async saveDish(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not logged in')
      }

      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, dish_id: dishId })

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving dish:', error)
      throw error
    }
  },

  /**
   * Unsave a dish
   * @param {string} dishId - Dish ID
   * @returns {Promise<Object>} Success status
   */
  async unsaveDish(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not logged in')
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('dish_id', dishId)

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error unsaving dish:', error)
      throw error
    }
  },
}
