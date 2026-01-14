import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch user's favorites
  useEffect(() => {
    if (!userId) {
      setFavorites([])
      setLoading(false)
      return
    }

    async function fetchFavorites() {
      setLoading(true)
      const { data, error } = await supabase
        .from('favorites')
        .select('dish_id')
        .eq('user_id', userId)

      if (!error && data) {
        setFavorites(data.map(f => f.dish_id))
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [userId])

  const isFavorite = (dishId) => favorites.includes(dishId)

  const toggleFavorite = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    if (isFavorite(dishId)) {
      // Remove favorite
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('dish_id', dishId)

      if (!error) {
        setFavorites(prev => prev.filter(id => id !== dishId))
      }
      return { error }
    } else {
      // Add favorite
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, dish_id: dishId })

      if (!error) {
        setFavorites(prev => [...prev, dishId])
      }
      return { error }
    }
  }

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
  }
}
