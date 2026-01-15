import { useState, useEffect } from 'react'
import { favoritesApi } from '../api'

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
      try {
        const dishIds = await favoritesApi.getFavoriteIds(userId)
        setFavorites(dishIds)
      } catch (error) {
        console.error('Error fetching favorites:', error)
        setFavorites([])
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [userId])

  const isFavorite = (dishId) => favorites.includes(dishId)

  const toggleFavorite = async (dishId) => {
    if (!userId) return { error: 'Not logged in' }

    try {
      if (isFavorite(dishId)) {
        await favoritesApi.removeFavorite(userId, dishId)
        setFavorites(prev => prev.filter(id => id !== dishId))
      } else {
        await favoritesApi.addFavorite(userId, dishId)
        setFavorites(prev => [...prev, dishId])
      }
      return { error: null }
    } catch (error) {
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
