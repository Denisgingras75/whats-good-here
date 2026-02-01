import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { restaurantManagerApi } from '../api/restaurantManagerApi'
import { logger } from '../utils/logger'

export function useRestaurantManager() {
  const { user } = useAuth()
  const [isManager, setIsManager] = useState(false)
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsManager(false)
      setRestaurant(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function checkManager() {
      try {
        const result = await restaurantManagerApi.getMyRestaurant()
        if (cancelled) return
        if (result) {
          setIsManager(true)
          setRestaurant(result.restaurant)
        } else {
          setIsManager(false)
          setRestaurant(null)
        }
      } catch (error) {
        if (cancelled) return
        logger.error('Error checking manager status:', error)
        setIsManager(false)
        setRestaurant(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    checkManager()
    return () => { cancelled = true }
  }, [user])

  return { isManager, restaurant, loading }
}
