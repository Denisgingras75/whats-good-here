import { supabase } from '../lib/supabase'
import posthog from 'posthog-js'

/**
 * Auth API - Centralized authentication operations
 */

export const authApi = {
  /**
   * Sign in with Google OAuth
   * @param {string|null} redirectUrl - Optional custom redirect URL
   * @returns {Promise<Object>} Auth response
   */
  async signInWithGoogle(redirectUrl = null) {
    try {
      posthog.capture('login_started', { method: 'google' })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl || window.location.origin,
        },
      })
      if (error) {
        posthog.capture('login_failed', { method: 'google', error: error.message })
        throw error
      }
      return { success: true }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  },

  /**
   * Sign in with magic link via email
   * @param {string} email - User email
   * @param {string|null} redirectUrl - Optional custom redirect URL
   * @returns {Promise<Object>} Auth response
   */
  async signInWithMagicLink(email, redirectUrl = null) {
    try {
      posthog.capture('login_started', { method: 'magic_link' })

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl || window.location.origin,
        },
      })
      if (error) {
        posthog.capture('login_failed', { method: 'magic_link', error: error.message })
        throw error
      }
      posthog.capture('magic_link_sent')
      return { success: true }
    } catch (error) {
      console.error('Error sending magic link:', error)
      throw error
    }
  },

  /**
   * Get current user's vote for a dish
   * @param {string} dishId - Dish ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Vote data or null
   */
  async getUserVoteForDish(dishId, userId) {
    try {
      if (!userId) {
        return null
      }

      const { data, error } = await supabase
        .from('votes')
        .select('would_order_again, rating_10')
        .eq('dish_id', dishId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw error
      }

      return data || null
    } catch (error) {
      console.error('Error fetching user vote:', error)
      throw error
    }
  },
}
