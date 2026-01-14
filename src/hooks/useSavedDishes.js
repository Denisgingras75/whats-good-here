import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

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
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          dish_id,
          created_at,
          dishes (
            id,
            name,
            category,
            price,
            photo_url,
            restaurants (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSavedDishIds(data.map(f => f.dish_id))
        setSavedDishes(data.map(f => ({
          dish_id: f.dishes.id,
          dish_name: f.dishes.name,
          category: f.dishes.category,
          price: f.dishes.price,
          photo_url: f.dishes.photo_url,
          restaurant_name: f.dishes.restaurants?.name,
          saved_at: f.created_at,
        })))
      }
      setLoading(false)
    }

    fetchSaved()
  }, [userId])

  const isSaved = useCallback((dishId) => savedDishIds.includes(dishId), [savedDishIds])

  const saveDish = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, dish_id: dishId })

    if (!error) {
      setSavedDishIds(prev => [...prev, dishId])
    }
    return { error }
  }

  const unsaveDish = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('dish_id', dishId)

    if (!error) {
      setSavedDishIds(prev => prev.filter(id => id !== dishId))
      setSavedDishes(prev => prev.filter(d => d.dish_id !== dishId))
    }
    return { error }
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

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        dish_id,
        created_at,
        dishes (
          id,
          name,
          category,
          price,
          photo_url,
          restaurants (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setSavedDishIds(data.map(f => f.dish_id))
      setSavedDishes(data.map(f => ({
        dish_id: f.dishes.id,
        dish_name: f.dishes.name,
        category: f.dishes.category,
        price: f.dishes.price,
        photo_url: f.dishes.photo_url,
        restaurant_name: f.dishes.restaurants?.name,
        saved_at: f.created_at,
      })))
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
