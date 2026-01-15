import { supabase } from '../lib/supabase'

/**
 * Profile API - Centralized data fetching and mutation for user profiles
 */

export const profileApi = {
  /**
   * Get a user's profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Profile object or null
   */
  async getProfile(userId) {
    try {
      if (!userId) {
        return null
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  },

  /**
   * Create a new profile for a user
   * @param {string} userId - User ID
   * @param {string} displayName - Display name
   * @returns {Promise<Object>} Created profile object
   */
  async createProfile(userId, displayName) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: displayName,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  },

  /**
   * Update a user's profile
   * @param {string} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated profile object
   */
  async updateProfile(userId, updates) {
    try {
      if (!userId) {
        throw new Error('Not logged in')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  /**
   * Get or create a profile for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Profile object
   */
  async getOrCreateProfile(userId) {
    try {
      if (!userId) {
        return null
      }

      // Try to get existing profile
      const existing = await this.getProfile(userId)
      if (existing) {
        return existing
      }

      // Create new profile with email-based display name
      const { data: userData } = await supabase.auth.getUser()
      const email = userData?.user?.email || ''
      const displayName = email.split('@')[0]

      return await this.createProfile(userId, displayName)
    } catch (error) {
      console.error('Error getting or creating profile:', error)
      throw error
    }
  },
}
