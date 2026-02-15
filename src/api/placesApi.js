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
  /**
   * Discover nearby restaurants via Google Places Nearby Search
   * @param {number} lat - User latitude
   * @param {number} lng - User longitude
   * @param {number} radiusMeters - Search radius in meters (capped at 10mi server-side)
   * @returns {Promise<Array>} Array of { placeId, name, address, lat, lng }
   */
  async discoverNearby(lat, lng, radiusMeters) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return []

      // Try nearby search first
      const response = await supabase.functions.invoke('places-nearby-search', {
        body: { lat, lng, radiusMeters },
      })

      if (response.error) {
        throw createClassifiedError(response.error)
      }

      const places = response.data?.places || []
      if (places.length > 0) return places

      // Fallback: nearby search returned empty, try autocomplete instead
      logger.warn('places-nearby-search returned no results, falling back to autocomplete')
      return await this._discoverViaAutocomplete(lat, lng, radiusMeters)
    } catch (error) {
      logger.warn('places-nearby-search failed, falling back to autocomplete:', error)
      try {
        return await this._discoverViaAutocomplete(lat, lng, radiusMeters)
      } catch (fallbackError) {
        logger.error('Places discover fallback also failed:', fallbackError)
        return []
      }
    }
  },

  /**
   * Internal fallback: discover restaurants via autocomplete endpoint
   */
  async _discoverViaAutocomplete(lat, lng, radiusMeters) {
    const response = await supabase.functions.invoke('places-autocomplete', {
      body: { input: 'restaurants', lat, lng, radius: radiusMeters },
    })

    if (response.error) {
      throw createClassifiedError(response.error)
    }

    const predictions = response.data?.predictions || []
    return predictions.map(p => ({
      placeId: p.placeId,
      name: p.name,
      address: p.address,
    }))
  },

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
