import { supabase } from '../lib/supabase'
import { createClassifiedError } from '../utils/errorHandler'

/**
 * Notifications API
 * All methods throw on error - handle in UI layer
 */
export const notificationsApi = {
  /**
   * Get notifications for current user
   * @param {number} limit - Max results
   * @returns {Promise<Array>}
   * @throws {Error} Not authenticated or API error
   */
  async getNotifications(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw createClassifiedError(error)
    }

    return data || []
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>}
   * @throws {Error} Not authenticated or API error
   */
  async getUnreadCount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      throw createClassifiedError(error)
    }

    return count || 0
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<void>}
   * @throws {Error} Not authenticated or API error
   */
  async markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      throw createClassifiedError(error)
    }
  },

  /**
   * Delete all notifications for current user
   * @returns {Promise<void>}
   * @throws {Error} Not authenticated or API error
   */
  async deleteAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      throw createClassifiedError(error)
    }
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   * @returns {Promise<void>}
   * @throws {Error} Not authenticated or API error
   */
  async markAsRead(notificationId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      throw createClassifiedError(error)
    }
  },
}
