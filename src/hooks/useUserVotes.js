import { useState, useEffect, useCallback } from 'react'
import { votesApi } from '../api'

/**
 * Transform raw vote data to dish format
 */
function transformVote(vote) {
  return {
    dish_id: vote.dishes.id,
    dish_name: vote.dishes.name,
    category: vote.dishes.category,
    price: vote.dishes.price,
    photo_url: vote.dishes.photo_url,
    restaurant_name: vote.dishes.restaurants?.name,
    rating_10: vote.rating_10,
    voted_at: vote.created_at,
  }
}

/**
 * Calculate stats from votes data
 */
function calculateStats(data) {
  const totalVotes = data.length
  const worthItCount = data.filter(v => v.would_order_again).length
  const avoidCount = data.filter(v => !v.would_order_again).length

  // Average rating
  const ratingsWithValue = data.filter(v => v.rating_10 != null)
  const avgRating = ratingsWithValue.length > 0
    ? ratingsWithValue.reduce((sum, v) => sum + v.rating_10, 0) / ratingsWithValue.length
    : null

  // Top category
  const categoryCounts = {}
  data.forEach(v => {
    const cat = v.dishes.category
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    }
  })
  const topCategory = Object.entries(categoryCounts).length > 0
    ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Favorite restaurant (most votes)
  const restaurantCounts = {}
  data.forEach(v => {
    const name = v.dishes.restaurants?.name
    if (name) {
      restaurantCounts[name] = (restaurantCounts[name] || 0) + 1
    }
  })
  const favoriteRestaurant = Object.entries(restaurantCounts).length > 0
    ? Object.entries(restaurantCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null

  return {
    totalVotes,
    worthItCount,
    avoidCount,
    avgRating,
    topCategory,
    favoriteRestaurant,
  }
}

export function useUserVotes(userId) {
  const [votes, setVotes] = useState([])
  const [worthItDishes, setWorthItDishes] = useState([])
  const [avoidDishes, setAvoidDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVotes: 0,
    worthItCount: 0,
    avoidCount: 0,
    avgRating: null,
    topCategory: null,
    favoriteRestaurant: null,
  })

  const processVotes = useCallback((data) => {
    setVotes(data)

    // Split into worth it and avoid
    const worthIt = data.filter(v => v.would_order_again).map(transformVote)
    const avoid = data.filter(v => !v.would_order_again).map(transformVote)

    setWorthItDishes(worthIt)
    setAvoidDishes(avoid)
    setStats(calculateStats(data))
  }, [])

  useEffect(() => {
    if (!userId) {
      setVotes([])
      setWorthItDishes([])
      setAvoidDishes([])
      setStats({
        totalVotes: 0,
        worthItCount: 0,
        avoidCount: 0,
        avgRating: null,
        topCategory: null,
        favoriteRestaurant: null,
      })
      setLoading(false)
      return
    }

    async function fetchVotes() {
      setLoading(true)
      try {
        const data = await votesApi.getDetailedVotesForUser(userId)
        processVotes(data)
      } catch (error) {
        console.error('Error fetching votes:', error)
      }
      setLoading(false)
    }

    fetchVotes()
  }, [userId, processVotes])

  const refetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await votesApi.getDetailedVotesForUser(userId)
      processVotes(data)
    } catch (error) {
      console.error('Error refetching votes:', error)
    }
    setLoading(false)
  }, [userId, processVotes])

  return {
    votes,
    worthItDishes,
    avoidDishes,
    stats,
    loading,
    refetch,
  }
}
