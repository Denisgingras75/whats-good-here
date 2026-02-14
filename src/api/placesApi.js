import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

/**
 * Places API - Google Places proxy via Supabase Edge Functions
 */

export const placesApi = {
  /**
   * Autocomplete restaurant search via Google Places
   * @param {string} input - Search text (min 2 chars)
   * @param {number} lat - User latitude
   * @param {number} lng - User longitude
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Array>} Array of { placeId, name, address }
   */
  async autocomplete(input, lat, lng, radius) {
    if (!input || input.trim().length < 2) return []

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return []

      const response = await supabase.functions.invoke('places-autocomplete', {
        body: { input: input.trim(), lat, lng, radius },
      })

      if (response.error) {
        throw createClassifiedError(response.error)
      }

      return response.data?.predictions || []
    } catch (error) {
      logger.error('Places autocomplete error:', error)
      // Don't throw — graceful degradation, just show local results
      return []
    }
  },

  /**
   * Get place details from Google Places
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>} { name, address, lat, lng, phone, websiteUrl, googleMapsUrl }
   */
  async getDetails(placeId) {
    if (!placeId) return null

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null

      const response = await supabase.functions.invoke('places-details', {
        body: { placeId },
      })

      if (response.error) {
        throw createClassifiedError(response.error)
      }

      return response.data || null
    } catch (error) {
      logger.error('Places details error:', error)
      throw error.type ? error : createClassifiedError(error)
    }
  },
}
