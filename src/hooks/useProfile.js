import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      } else if (error?.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: userData } = await supabase.auth.getUser()
        const email = userData?.user?.email || ''
        const displayName = email.split('@')[0]

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            display_name: displayName
          })
          .select()
          .single()

        if (!insertError && newProfile) {
          setProfile(newProfile)
        }
      }
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  const updateProfile = async (updates) => {
    if (!userId) return { error: 'Not logged in' }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }
    return { data, error }
  }

  return {
    profile,
    loading,
    updateProfile,
  }
}
