import { useState, useEffect, useCallback } from 'react'
import posthog from 'posthog-js'
import { favoritesApi } from '../api'

export function useSavedDishes(userId) {
  const [savedDishIds, setSavedDishIds] = useState([])
  const [savedDishes, setSavedDishes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch saved dish IDs
  useEffect(() => {
    if (!userId) {
      setSavedDishIds([])
      setSavedDishes([])
      setLoading(false)
      return
    }

    async function fetchSaved() {
      setLoading(true)
      try {
        const { savedDishIds: ids, savedDishes: dishes } = await favoritesApi.getSavedDishes()
        setSavedDishIds(ids)
        setSavedDishes(dishes)
      } catch (err) {
        console.error('Error fetching saved dishes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSaved()
  }, [userId])

  const isSaved = useCallback((dishId) => savedDishIds.includes(dishId), [savedDishIds])

  const saveDish = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    try {
      await favoritesApi.saveDish(dishId)
      // Optimistically update IDs
      setSavedDishIds(prev => [...prev, dishId])
      // Refetch to get full dish data for savedDishes list
      const { savedDishes: dishes } = await favoritesApi.getSavedDishes()
      setSavedDishes(dishes)

      // Track dish saved - shows intent to try
      const savedDish = dishes.find(d => d.dish_id === dishId)
      posthog.capture('dish_saved', {
        dish_id: dishId,
        dish_name: savedDish?.dish_name,
        restaurant_name: savedDish?.restaurant_name,
        category: savedDish?.category,
      })

      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const unsaveDish = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    // Get dish info before removing
    const dishToRemove = savedDishes.find(d => d.dish_id === dishId)

    try {
      await favoritesApi.unsaveDish(dishId)
      setSavedDishIds(prev => prev.filter(id => id !== dishId))
      setSavedDishes(prev => prev.filter(d => d.dish_id !== dishId))

      // Track dish unsaved
      posthog.capture('dish_unsaved', {
        dish_id: dishId,
        dish_name: dishToRemove?.dish_name,
        restaurant_name: dishToRemove?.restaurant_name,
        category: dishToRemove?.category,
      })

      return { error: null }
    } catch (err) {
      return { error: err.message }
    }
  }

  const toggleSave = async (dishId) => {
    if (isSaved(dishId)) {
      return unsaveDish(dishId)
    } else {
      return saveDish(dishId)
    }
  }

  const refetch = async () => {
    if (!userId) return

    try {
      const { savedDishIds: ids, savedDishes: dishes } = await favoritesApi.getSavedDishes()
      setSavedDishIds(ids)
      setSavedDishes(dishes)
    } catch (err) {
      console.error('Error refetching saved dishes:', err)
    }
  }

  return {
    savedDishIds,
    savedDishes,
    loading,
    isSaved,
    saveDish,
    unsaveDish,
    toggleSave,
    refetch,
  }
}
