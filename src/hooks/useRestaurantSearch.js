import { useState, useEffect, useRef } from 'react'
import { restaurantsApi } from '../api/restaurantsApi'
import { placesApi } from '../api/placesApi'
import { logger } from '../utils/logger'

/**
 * Combined local DB + Google Places restaurant search
 * Deduplicates by google_place_id
 *
 * @param {string} query - Search term (min 2 chars)
 * @param {number|null} lat - User latitude
 * @param {number|null} lng - User longitude
 * @param {boolean} enabled - Whether to search (default true)
 * @returns {{ localResults: Array, externalResults: Array, loading: boolean }}
 */
export function useRestaurantSearch(query, lat, lng, enabled = true) {
  const [localResults, setLocalResults] = useState([])
  const [externalResults, setExternalResults] = useState([])
  const [loading, setLoading] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!enabled || !query || query.trim().length < 2) {
      setLocalResults([])
      setExternalResults([])
      return
    }

    const trimmed = query.trim()
    setLoading(true)

    const fetchResults = async () => {
      try {
        // Run local + Google Places searches in parallel
        const [local, external] = await Promise.all([
          restaurantsApi.search(trimmed, 5).catch((err) => {
            logger.error('Local restaurant search error:', err)
            return []
          }),
          placesApi.autocomplete(trimmed, lat, lng, 50000).catch((err) => {
            logger.error('Places autocomplete error:', err)
            return []
          }),
        ])

        if (!mountedRef.current) return

        // Collect google_place_ids from local results for dedup
        const localPlaceIds = new Set()
        local.forEach(r => {
          if (r.google_place_id) localPlaceIds.add(r.google_place_id)
        })

        // Filter out external results that already exist locally
        const dedupedExternal = external.filter(p => !localPlaceIds.has(p.placeId))

        setLocalResults(local)
        setExternalResults(dedupedExternal)
      } catch (err) {
        logger.error('Restaurant search error:', err)
        if (mountedRef.current) {
          setLocalResults([])
          setExternalResults([])
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    // Debounce
    const timer = setTimeout(fetchResults, 250)
    return () => clearTimeout(timer)
  }, [query, lat, lng, enabled])

  return { localResults, externalResults, loading }
}
