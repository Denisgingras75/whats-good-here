import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useDishes(location, radius, category = null) {
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location) return

    async function fetchDishes() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: rpcError } = await supabase.rpc('get_ranked_dishes', {
          user_lat: location.lat,
          user_lng: location.lng,
          radius_miles: radius,
          filter_category: category,
        })

        if (rpcError) {
          throw rpcError
        }

        setDishes(data || [])
      } catch (err) {
        console.error('Error fetching dishes:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDishes()
  }, [location, radius, category])

  const refetch = async () => {
    if (!location) return

    try {
      setLoading(true)
      const { data, error: rpcError } = await supabase.rpc('get_ranked_dishes', {
        user_lat: location.lat,
        user_lng: location.lng,
        radius_miles: radius,
        filter_category: category,
      })

      if (rpcError) throw rpcError
      setDishes(data || [])
    } catch (err) {
      console.error('Error refetching dishes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    dishes,
    loading,
    error,
    refetch,
  }
}
