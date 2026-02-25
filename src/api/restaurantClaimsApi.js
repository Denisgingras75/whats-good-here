import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Restaurant Claims API — self-service restaurant ownership claims
 */

export const restaurantClaimsApi = {
  /**
   * Submit a claim for a restaurant
   * @param {string} restaurantId - Restaurant ID to claim
   * @param {string} message - Optional message from the claimant
   * @returns {Promise<Object>} Created claim
   */
  async submitClaim(restaurantId, message = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw createClassifiedError(new Error('Not authenticated'))

      const { data, error } = await supabase
        .from('restaurant_claims')
        .insert({
          user_id: user.id,
          restaurant_id: restaurantId,
          message: message || null,
        })
        .select('id, status, created_at')
        .single()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error submitting restaurant claim:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Get the current user's claim for a restaurant (if any)
   * @param {string} restaurantId - Restaurant ID
   * @returns {Promise<Object|null>} Existing claim or null
   */
  async getMyClaimForRestaurant(restaurantId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('restaurant_claims')
        .select('id, status, created_at')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .maybeSingle()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error checking restaurant claim:', error)
      return null
    }
  },

  /**
   * Get all pending claims (admin only)
   * @returns {Promise<Array>} Pending claims with user and restaurant info
   */
  async getPendingClaims() {
    try {
      const { data, error } = await supabase
        .from('restaurant_claims')
        .select(`
          id,
          user_id,
          restaurant_id,
          status,
          message,
          created_at,
          restaurants ( id, name, town ),
          profiles:user_id ( display_name )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw createClassifiedError(error)
      return data || []
    } catch (error) {
      logger.error('Error fetching pending claims:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Approve a claim (admin only) — creates restaurant_managers row
   * @param {string} claimId - Claim ID to approve
   * @returns {Promise<Object>} Updated claim
   */
  async approveClaim(claimId) {
    try {
      // Fetch claim details first
      const { data: claim, error: fetchError } = await supabase
        .from('restaurant_claims')
        .select('id, user_id, restaurant_id, status')
        .eq('id', claimId)
        .single()

      if (fetchError) throw createClassifiedError(fetchError)
      if (claim.status !== 'pending') {
        throw createClassifiedError(new Error('Claim is not pending'))
      }

      const { data: { user } } = await supabase.auth.getUser()

      // Update claim status
      const { error: updateError } = await supabase
        .from('restaurant_claims')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claimId)

      if (updateError) throw createClassifiedError(updateError)

      // Create restaurant_managers row
      const { error: managerError } = await supabase
        .from('restaurant_managers')
        .insert({
          user_id: claim.user_id,
          restaurant_id: claim.restaurant_id,
          role: 'manager',
          accepted_at: new Date().toISOString(),
          created_by: user.id,
        })

      if (managerError) throw createClassifiedError(managerError)

      return { ...claim, status: 'approved' }
    } catch (error) {
      logger.error('Error approving claim:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },

  /**
   * Deny a claim (admin only)
   * @param {string} claimId - Claim ID to deny
   * @returns {Promise<Object>} Updated claim
   */
  async denyClaim(claimId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('restaurant_claims')
        .update({
          status: 'denied',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claimId)
        .select('id, status')
        .single()

      if (error) throw createClassifiedError(error)
      return data
    } catch (error) {
      logger.error('Error denying claim:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
