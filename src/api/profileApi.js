import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

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
        .maybeSingle()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error fetching profile:', error)
      throw error
    }
  },

  /**
   * Create a new profile for current authenticated user
   * @param {string} displayName - Display name (optional)
   * @returns {Promise<Object>} Created profile object
   */
  async createProfile(displayName = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to create a profile')
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: displayName,
          has_onboarded: false,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error creating profile:', error)
      throw error
    }
  },

  /**
   * Update current authenticated user's profile
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated profile object
   */
  async updateProfile(updates) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to update your profile')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      logger.error('Error updating profile:', error)
      throw error
    }
  },

  /**
   * Get or create a profile for current authenticated user
   * @returns {Promise<Object>} Profile object
   */
  async getOrCreateProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return null
      }

      // Try to get existing profile
      const existing = await this.getProfile(user.id)
      if (existing) {
        return existing
      }

      // Create new profile without display name - they'll set it in onboarding
      return await this.createProfile()
    } catch (error) {
      logger.error('Error getting or creating profile:', error)
      throw error
    }
  },
}
