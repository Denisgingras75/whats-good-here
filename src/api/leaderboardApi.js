import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'
import { createClassifiedError } from '../utils/errorHandler'

/**
 * Leaderboard API - Streaks and friends competition
 */

export const leaderboardApi = {
  /**
   * Get the current user's streak info
   * @returns {Promise<Object>} Streak data
   */
  async getMyStreak() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        votesThisWeek: 0,
        lastVoteDate: null,
        status: 'none',
      }
    }

    const { data, error } = await supabase
      .rpc('get_user_streak_info', { p_user_id: user.id })

    if (error) {
      logger.error('Error fetching streak:', error)
      throw createClassifiedError(error)
    }

    const row = data?.[0]
    return {
      currentStreak: row?.current_streak ?? 0,
      longestStreak: row?.longest_streak ?? 0,
      votesThisWeek: row?.votes_this_week ?? 0,
      lastVoteDate: row?.last_vote_date ?? null,
      status: row?.streak_status ?? 'none',
    }
  },

  /**
   * Get another user's streak info
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Streak data
   */
  async getUserStreak(userId) {
    if (!userId) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        votesThisWeek: 0,
        lastVoteDate: null,
        status: 'none',
      }
    }

    const { data, error } = await supabase
      .rpc('get_user_streak_info', { p_user_id: userId })

    if (error) {
      logger.error('Error fetching user streak:', error)
      throw createClassifiedError(error)
    }

    const row = data?.[0]
    return {
      currentStreak: row?.current_streak ?? 0,
      longestStreak: row?.longest_streak ?? 0,
      votesThisWeek: row?.votes_this_week ?? 0,
      lastVoteDate: row?.last_vote_date ?? null,
      status: row?.streak_status ?? 'none',
    }
  },

  /**
   * Get friends leaderboard (mutual follows only)
   * @param {number} limit - Max results (default 10)
   * @returns {Promise<Object>} Leaderboard data with participants and user's rank
   */
  async getFriendsLeaderboard(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { leaderboard: [], myRank: null }
    }

    const { data, error } = await supabase
      .rpc('get_friends_leaderboard', {
        p_user_id: user.id,
        p_limit: limit,
      })

    if (error) {
      logger.error('Error fetching leaderboard:', error)
      throw createClassifiedError(error)
    }

    // Find the current user's rank
    const myEntry = data?.find(entry => entry.is_current_user)

    return {
      leaderboard: (data || []).map(entry => ({
        userId: entry.user_id,
        displayName: entry.display_name || 'Anonymous',
        votesThisWeek: entry.votes_this_week,
        currentStreak: entry.current_streak,
        isCurrentUser: entry.is_current_user,
        rank: entry.rank,
      })),
      myRank: myEntry?.rank ?? null,
    }
  },

  /**
   * Get seconds until weekly leaderboard reset
   * @returns {Promise<number>} Seconds until reset
   */
  async getWeeklyResetCountdown() {
    const { data, error } = await supabase
      .rpc('get_weekly_reset_countdown')

    if (error) {
      logger.error('Error fetching reset countdown:', error)
      // Fall back to calculating it client-side
      const now = new Date()
      const nextMonday = new Date(now)
      nextMonday.setDate(now.getDate() + (7 - now.getDay()) % 7 + 1)
      nextMonday.setHours(0, 0, 0, 0)
      return Math.floor((nextMonday - now) / 1000)
    }

    return data ?? 0
  },
}
