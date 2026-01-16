import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import posthog from 'posthog-js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const prevUserRef = useRef(null)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Identify user in PostHog
        posthog.identify(user.id, {
          email: user.email,
          auth_provider: user.app_metadata?.provider || 'unknown',
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      setLoading(false)

      // Track login success when user signs in
      if (newUser && !prevUserRef.current) {
        posthog.identify(newUser.id, {
          email: newUser.email,
          auth_provider: newUser.app_metadata?.provider || 'unknown',
        })
        posthog.capture('login_completed', {
          method: newUser.app_metadata?.provider || 'unknown',
        })
      }

      // Track logout
      if (!newUser && prevUserRef.current) {
        posthog.capture('logout')
        posthog.reset() // Clear user identity
      }

      prevUserRef.current = newUser
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
