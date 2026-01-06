import { useState, useEffect } from 'react'
import { useVote } from '../hooks/useVote'
import { supabase } from '../lib/supabase'

export function VoteButtons({ dishId, onVote, onLoginRequired }) {
  const { submitVote, submitting } = useVote()
  const [user, setUser] = useState(null)
  const [userVote, setUserVote] = useState(null)
  const [optimisticVote, setOptimisticVote] = useState(null)

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Fetch user's existing vote for this dish
    async function fetchUserVote() {
      if (!user) {
        setUserVote(null)
        return
      }

      const { data } = await supabase
        .from('votes')
        .select('would_order_again')
        .eq('dish_id', dishId)
        .eq('user_id', user.id)
        .single()

      if (data) {
        setUserVote(data.would_order_again)
      }
    }

    fetchUserVote()
  }, [dishId, user])

  const handleVote = async (wouldOrderAgain) => {
    if (!user) {
      onLoginRequired?.()
      return
    }

    // Optimistic update
    setOptimisticVote(wouldOrderAgain)

    const result = await submitVote(dishId, wouldOrderAgain)

    if (result.success) {
      setUserVote(wouldOrderAgain)
      onVote?.() // Trigger refetch of dishes
    } else {
      // Rollback optimistic update
      setOptimisticVote(null)
    }
  }

  const currentVote = optimisticVote !== null ? optimisticVote : userVote

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Worth It Button */}
      <button
        onClick={() => handleVote(true)}
        disabled={submitting}
        className={`
          relative overflow-hidden
          flex items-center justify-center gap-2
          py-4 px-4 rounded-xl
          font-semibold text-sm
          transition-all duration-200 ease-out
          focus-ring
          ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
          ${
            currentVote === true
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50 shadow-sm'
          }
        `}
      >
        {/* Background shimmer effect when active */}
        {currentVote === true && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}

        <span className="text-xl relative z-10">
          {currentVote === true ? '✅' : '👍'}
        </span>
        <span className="relative z-10">Worth It</span>
      </button>

      {/* Avoid Button */}
      <button
        onClick={() => handleVote(false)}
        disabled={submitting}
        className={`
          relative overflow-hidden
          flex items-center justify-center gap-2
          py-4 px-4 rounded-xl
          font-semibold text-sm
          transition-all duration-200 ease-out
          focus-ring
          ${submitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
          ${
            currentVote === false
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
              : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-red-400 hover:bg-red-50 shadow-sm'
          }
        `}
      >
        {/* Background shimmer effect when active */}
        {currentVote === false && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        )}

        <span className="text-xl relative z-10">
          {currentVote === false ? '❌' : '👎'}
        </span>
        <span className="relative z-10">Avoid</span>
      </button>
    </div>
  )
}
