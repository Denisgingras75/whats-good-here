import { supabase } from '../lib/supabase'

/**
 * Follows API - Social connections
 */

export const followsApi = {
  /**
   * Follow a user
   * @param {string} followedId - User ID to follow
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async follow(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (user.id === followedId) {
      return { success: false, error: 'Cannot follow yourself' }
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        followed_id: followedId,
      })

    if (error) {
      // Handle duplicate follow gracefully
      if (error.code === '23505') {
        return { success: true } // Already following
      }
      console.error('Error following user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Unfollow a user
   * @param {string} followedId - User ID to unfollow
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async unfollow(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)

    if (error) {
      console.error('Error unfollowing user:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Check if current user follows another user
   * @param {string} followedId - User ID to check
   * @returns {Promise<boolean>}
   */
  async isFollowing(followedId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('followed_id', followedId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking follow status:', error)
      throw error
    }

    return !!data
  },

  /**
   * Get followers of a user
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getFollowers(userId, limit = 50) {
    try {
      // Get follower IDs first
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('follower_id, created_at')
        .eq('followed_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (followError) {
        console.error('Error fetching followers:', followError)
        throw new Error('Failed to fetch followers')
      }

      if (!followData || followData.length === 0) {
        return []
      }

      // Get profile info for each follower
      const followerIds = followData.map(f => f.follower_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, follower_count')
        .in('id', followerIds)

      if (profileError) {
        console.error('Error fetching follower profiles:', profileError)
      }

      const profileMap = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })

      return followData.map(f => ({
        id: f.follower_id,
        display_name: profileMap[f.follower_id]?.display_name || 'Anonymous',
        follower_count: profileMap[f.follower_id]?.follower_count || 0,
        followed_at: f.created_at,
      }))
    } catch (err) {
      console.error('Unexpected error in getFollowers:', err)
      throw err
    }
  },

  /**
   * Get users that a user follows
   * @param {string} userId - User ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async getFollowing(userId, limit = 50) {
    try {
      // Get followed IDs first
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('followed_id, created_at')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (followError) {
        console.error('Error fetching following:', followError)
        throw new Error('Failed to fetch following')
      }

      if (!followData || followData.length === 0) {
        return []
      }

      // Get profile info for each followed user
      const followedIds = followData.map(f => f.followed_id)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, follower_count')
        .in('id', followedIds)

      if (profileError) {
        console.error('Error fetching following profiles:', profileError)
      }

      const profileMap = {}
      ;(profiles || []).forEach(p => { profileMap[p.id] = p })

      return followData.map(f => ({
        id: f.followed_id,
        display_name: profileMap[f.followed_id]?.display_name || 'Anonymous',
        follower_count: profileMap[f.followed_id]?.follower_count || 0,
        followed_at: f.created_at,
      }))
    } catch (err) {
      console.error('Unexpected error in getFollowing:', err)
      throw err
    }
  },

  /**
   * Get follow counts for a user (counted live from follows table)
   * @param {string} userId - User ID
   * @returns {Promise<{followers: number, following: number}>}
   */
  async getFollowCounts(userId) {
    // Count followers (people who follow this user)
    const { count: followerCount, error: followerError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', userId)

    // Count following (people this user follows)
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    if (followerError || followingError) {
      console.error('Error fetching follow counts:', followerError || followingError)
      throw (followerError || followingError)
    }

    return {
      followers: followerCount || 0,
      following: followingCount || 0,
    }
  },

  /**
   * Get friends (people you follow) who voted on a dish
   * @param {string} dishId - Dish ID
   * @returns {Promise<Array>}
   */
  async getFriendsVotesForDish(dishId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .rpc('get_friends_votes_for_dish', {
          p_user_id: user.id,
          p_dish_id: dishId,
        })

      if (error) {
        console.error('Error fetching friends votes:', error)
        throw new Error('Failed to fetch friends votes')
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error in getFriendsVotesForDish:', err)
      throw err
    }
  },

  /**
   * Search users by name
   * @param {string} query - Search query
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   */
  async searchUsers(query, limit = 10) {
    try {
      if (!query?.trim() || query.length < 2) return []

      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, follower_count, following_count')
        .ilike('display_name', `%${query}%`)
        .order('follower_count', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error searching users:', error)
        throw new Error('Failed to search users')
      }

      return data || []
    } catch (err) {
      console.error('Unexpected error in searchUsers:', err)
      throw err
    }
  },

  /**
   * Get a user's public profile data
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>}
   */
  async getUserProfile(userId) {
    // Get basic profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, created_at')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    // Get live follow counts from follows table
    const { count: followerCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('followed_id', userId)

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    // Add counts to profile
    profile.follower_count = followerCount || 0
    profile.following_count = followingCount || 0

    // Get vote stats
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('rating_10, would_order_again, created_at')
      .eq('user_id', userId)

    if (votesError) {
      console.error('Error fetching user votes:', votesError)
    }

    const voteList = votes || []
    const totalVotes = voteList.length
    const worthItCount = voteList.filter(v => v.would_order_again).length
    const avoidCount = voteList.filter(v => !v.would_order_again).length
    const avgRating = totalVotes > 0
      ? Math.round((voteList.reduce((sum, v) => sum + (v.rating_10 || 0), 0) / totalVotes) * 10) / 10
      : null

    // Get all votes with dish info (for expand/collapse in UI)
    const { data: recentVotes, error: recentError } = await supabase
      .from('votes')
      .select(`
        rating_10,
        would_order_again,
        created_at,
        dishes (
          id,
          name,
          photo_url,
          category,
          avg_rating,
          restaurants (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (recentError) {
      console.error('Error fetching recent votes:', recentError)
    }

    // Get all unlocked badges (not just public-eligible ones)
    const { data: badges, error: badgesError } = await supabase
      .rpc('get_user_badges', { p_user_id: userId, p_public_only: false })

    if (badgesError) {
      console.error('Error fetching badges:', badgesError)
    }

    // Map badge_key to key for consistency with UI
    const mappedBadges = (badges || []).map(b => ({
      key: b.badge_key,
      name: b.name,
      subtitle: b.subtitle,
      description: b.description,
      icon: b.icon,
      unlocked_at: b.unlocked_at,
    }))

    return {
      ...profile,
      stats: {
        total_votes: totalVotes,
        worth_it: worthItCount,
        avoid: avoidCount,
        avg_rating: avgRating,
      },
      recent_votes: (recentVotes || []).map(v => ({
        rating: v.rating_10,
        would_order_again: v.would_order_again,
        voted_at: v.created_at,
        dish: v.dishes ? {
          id: v.dishes.id,
          name: v.dishes.name,
          photo_url: v.dishes.photo_url,
          category: v.dishes.category,
          avg_rating: v.dishes.avg_rating,
          restaurant_name: v.dishes.restaurants?.name,
          restaurant_id: v.dishes.restaurants?.id,
        } : null,
      })),
      badges: mappedBadges,
    }
  },
}
