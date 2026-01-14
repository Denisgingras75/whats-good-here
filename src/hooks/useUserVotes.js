import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
      const { data, error } = await supabase
        .from('votes')
        .select(`
          id,
          would_order_again,
          rating_10,
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
        setVotes(data)

        // Transform to dish format
        const transformVote = (vote) => ({
          dish_id: vote.dishes.id,
          dish_name: vote.dishes.name,
          category: vote.dishes.category,
          price: vote.dishes.price,
          photo_url: vote.dishes.photo_url,
          restaurant_name: vote.dishes.restaurants?.name,
          rating_10: vote.rating_10,
          voted_at: vote.created_at,
        })

        // Split into worth it and avoid
        const worthIt = data.filter(v => v.would_order_again).map(transformVote)
        const avoid = data.filter(v => !v.would_order_again).map(transformVote)

        setWorthItDishes(worthIt)
        setAvoidDishes(avoid)

        // Calculate stats
        const totalVotes = data.length
        const worthItCount = worthIt.length
        const avoidCount = avoid.length

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

        setStats({
          totalVotes,
          worthItCount,
          avoidCount,
          avgRating,
          topCategory,
          favoriteRestaurant,
        })
      }
      setLoading(false)
    }

    fetchVotes()
  }, [userId])

  const refetch = async () => {
    if (!userId) return
    // Re-trigger the effect by setting loading
    setLoading(true)
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        would_order_again,
        rating_10,
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
      setVotes(data)
      const transformVote = (vote) => ({
        dish_id: vote.dishes.id,
        dish_name: vote.dishes.name,
        category: vote.dishes.category,
        price: vote.dishes.price,
        photo_url: vote.dishes.photo_url,
        restaurant_name: vote.dishes.restaurants?.name,
        rating_10: vote.rating_10,
        voted_at: vote.created_at,
      })
      setWorthItDishes(data.filter(v => v.would_order_again).map(transformVote))
      setAvoidDishes(data.filter(v => !v.would_order_again).map(transformVote))
    }
    setLoading(false)
  }

  return {
    votes,
    worthItDishes,
    avoidDishes,
    stats,
    loading,
    refetch,
  }
}
