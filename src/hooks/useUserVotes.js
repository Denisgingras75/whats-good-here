import { useState, useEffect, useCallback, useRef } from 'react'
import { votesApi } from '../api/votesApi'
import { logger } from '../utils/logger'

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
    community_avg: vote.dishes.avg_rating,
    total_votes: vote.dishes.total_votes,
    voted_at: vote.created_at,
  }
}

/**
 * Compute rating style from avgRating and ratingVariance
 */
function computeRatingStyle(avgRating, ratingVariance) {
  if (avgRating === null) return null

  // Level based on average rating
  let level, emoji
  if (avgRating < 6.0) {
    level = 'tough'
    emoji = '\uD83E\uDDD0' // monocle face
  } else if (avgRating < 7.5) {
    level = 'fair'
    emoji = '\u2696\uFE0F' // balance scale
  } else if (avgRating < 8.5) {
    level = 'generous'
    emoji = '\uD83D\uDE0A' // smiling face
  } else {
    level = 'easy'
    emoji = '\uD83E\uDD70' // smiling face with hearts
  }

  // Consistency based on variance
  const consistency = ratingVariance < 1.5 ? 'consistent' : 'varied'

  // Compose label
  const levelLabels = {
    tough: 'Tough Critic',
    fair: 'Fair Judge',
    generous: 'Generous Rater',
    easy: 'Easy to Please',
  }
  const label = levelLabels[level]

  return { level, consistency, label, emoji }
}

/**
 * Compute standout picks by comparing user ratings to community averages
 */
function computeStandoutPicks(data, communityAvgs) {
  const MIN_COMMUNITY_VOTES = 3
  const picks = {}

  // Build per-dish comparisons
  const comparisons = []
  for (const vote of data) {
    if (vote.rating_10 == null) continue
    const dishId = vote.dishes.id
    const community = communityAvgs[dishId]
    if (!community || community.count < MIN_COMMUNITY_VOTES) continue

    const diff = vote.rating_10 - community.avg
    comparisons.push({
      dish_id: dishId,
      dish_name: vote.dishes.name,
      category: vote.dishes.category,
      restaurant_name: vote.dishes.restaurants?.name,
      userRating: vote.rating_10,
      communityAvg: community.avg,
      diff,
    })
  }

  if (comparisons.length === 0) return picks

  // Best find: highest user rating, tie-break by biggest positive diff
  const sorted = comparisons.slice().sort((a, b) => {
    if (b.userRating !== a.userRating) return b.userRating - a.userRating
    return b.diff - a.diff
  })
  picks.bestFind = sorted[0]

  // Hottest take: biggest negative diff (user rates much lower than community), min -1.0
  const harsh = comparisons.slice().sort((a, b) => a.diff - b.diff)
  if (harsh[0] && harsh[0].diff <= -1.0) {
    picks.harshestTake = harsh[0]
  }

  return picks
}

/**
 * Compute category comparison from user votes and community averages
 */
function computeCategoryComparison(data, communityAvgs) {
  const MIN_COMMUNITY_VOTES = 3
  const MIN_DISHES_PER_CATEGORY = 2

  // Group votes by category
  const catGroups = {}
  for (const vote of data) {
    if (vote.rating_10 == null) continue
    const cat = vote.dishes.category
    if (!cat) continue
    if (!catGroups[cat]) catGroups[cat] = []
    catGroups[cat].push(vote)
  }

  const result = {}
  for (const [cat, votes] of Object.entries(catGroups)) {
    // Only include dishes with enough community data
    const withCommunity = votes.filter(v => {
      const c = communityAvgs[v.dishes.id]
      return c && c.count >= MIN_COMMUNITY_VOTES
    })

    if (withCommunity.length < MIN_DISHES_PER_CATEGORY) continue

    const userAvg = withCommunity.reduce((sum, v) => sum + v.rating_10, 0) / withCommunity.length
    const communityAvg = withCommunity.reduce((sum, v) => sum + communityAvgs[v.dishes.id].avg, 0) / withCommunity.length

    result[cat] = {
      userAvg,
      communityAvg,
      difference: userAvg - communityAvg,
    }
  }

  return result
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

  // Category counts
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

  // Top categories: categories with 3+ votes, sorted by count, top 2-3
  const topCategories = Object.entries(categoryCounts)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)

  // Rating variance (std dev of ratings)
  const ratingVariance = ratingsWithValue.length > 1
    ? Math.sqrt(
        ratingsWithValue.reduce((sum, v) => sum + Math.pow(v.rating_10 - avgRating, 2), 0) / ratingsWithValue.length
      )
    : 0

  // Rating style
  const ratingStyle = computeRatingStyle(avgRating, ratingVariance)

  // Category concentration (Herfindahl index)
  const catValues = Object.values(categoryCounts)
  const catTotal = catValues.reduce((a, b) => a + b, 0)
  const categoryConcentration = catTotal > 0
    ? catValues.reduce((sum, c) => sum + Math.pow(c / catTotal, 2), 0)
    : 0

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

  // Count unique restaurants
  const uniqueRestaurants = Object.keys(restaurantCounts).length

  return {
    totalVotes,
    worthItCount,
    avoidCount,
    avgRating,
    ratingVariance,
    categoryConcentration,
    topCategory,
    topCategories,
    ratingStyle,
    favoriteRestaurant,
    uniqueRestaurants,
    categoryCounts,
    // These will be filled after community data loads
    categoryComparison: {},
    standoutPicks: {},
  }
}

const COMMUNITY_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

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
    ratingVariance: 0,
    categoryConcentration: 0,
    topCategory: null,
    topCategories: [],
    ratingStyle: null,
    favoriteRestaurant: null,
    uniqueRestaurants: 0,
    categoryCounts: {},
    dishesHelpedRank: 0,
    categoryComparison: {},
    standoutPicks: {},
  })

  const communityCache = useRef({ data: null, timestamp: 0 })

  const processVotes = useCallback(async (data, helpedCount = 0) => {
    setVotes(data)

    // Split into worth it and avoid, then sort by rating (highest first)
    const sortByRating = (a, b) => {
      if (a.rating_10 == null && b.rating_10 == null) return 0
      if (a.rating_10 == null) return 1
      if (b.rating_10 == null) return -1
      return b.rating_10 - a.rating_10
    }

    const worthIt = data.filter(v => v.would_order_again).map(transformVote).sort(sortByRating)
    const avoid = data.filter(v => !v.would_order_again).map(transformVote).sort(sortByRating)

    setWorthItDishes(worthIt)
    setAvoidDishes(avoid)

    const baseStats = { ...calculateStats(data), dishesHelpedRank: helpedCount }
    setStats(baseStats)

    // Fetch community averages for rated dishes
    const ratedDishIds = data
      .filter(v => v.rating_10 != null)
      .map(v => v.dishes.id)

    if (ratedDishIds.length === 0) return

    try {
      const now = Date.now()
      let communityAvgs = communityCache.current.data
      if (!communityAvgs || (now - communityCache.current.timestamp) > COMMUNITY_CACHE_TTL) {
        communityAvgs = await votesApi.getCommunityAvgsForDishes(ratedDishIds)
        communityCache.current = { data: communityAvgs, timestamp: now }
      }

      const categoryComparison = computeCategoryComparison(data, communityAvgs)
      const standoutPicks = computeStandoutPicks(data, communityAvgs)

      setStats(prev => ({ ...prev, categoryComparison, standoutPicks }))
    } catch (error) {
      logger.error('Error fetching community averages:', error)
    }
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
        topCategories: [],
        ratingStyle: null,
        favoriteRestaurant: null,
        uniqueRestaurants: 0,
        categoryCounts: {},
        dishesHelpedRank: 0,
        categoryComparison: {},
        standoutPicks: {},
      })
      setLoading(false)
      return
    }

    async function fetchVotes() {
      setLoading(true)
      try {
        const [data, helpedCount] = await Promise.all([
          votesApi.getDetailedVotesForUser(userId),
          votesApi.getDishesHelpedRank(userId)
        ])
        await processVotes(data, helpedCount)
      } catch (error) {
        logger.error('Error fetching votes:', error)
      }
      setLoading(false)
    }

    fetchVotes()
  }, [userId, processVotes])

  const refetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [data, helpedCount] = await Promise.all([
        votesApi.getDetailedVotesForUser(userId),
        votesApi.getDishesHelpedRank(userId)
      ])
      // Invalidate community cache on refetch
      communityCache.current = { data: null, timestamp: 0 }
      await processVotes(data, helpedCount)
    } catch (error) {
      logger.error('Error refetching votes:', error)
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
