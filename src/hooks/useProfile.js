import { useState, useEffect, useCallback } from 'react'
import { profileApi } from '../api'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    async function fetchProfile() {
      setLoading(true)
      try {
        const data = await profileApi.getOrCreateProfile(userId)
        setProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  const updateProfile = useCallback(async (updates) => {
    if (!userId) return { error: 'Not logged in' }

    try {
      const data = await profileApi.updateProfile(userId, updates)
      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [userId])

  return {
    profile,
    loading,
    updateProfile,
  }
}
