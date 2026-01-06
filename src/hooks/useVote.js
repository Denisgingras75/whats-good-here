import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useVote() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const submitVote = async (dishId, wouldOrderAgain) => {
    try {
      setSubmitting(true)
      setError(null)

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to vote')
      }

      // Upsert vote (insert or update if exists)
      const { error: voteError } = await supabase
        .from('votes')
        .upsert(
          {
            dish_id: dishId,
            user_id: user.id,
            would_order_again: wouldOrderAgain,
          },
          {
            onConflict: 'dish_id,user_id',
          }
        )

      if (voteError) {
        throw voteError
      }

      return { success: true }
    } catch (err) {
      console.error('Error submitting vote:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setSubmitting(false)
    }
  }

  const getUserVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('votes')
        .select('dish_id, would_order_again')
        .eq('user_id', user.id)

      if (error) throw error

      // Return as a map for easy lookup
      return data.reduce((acc, vote) => {
        acc[vote.dish_id] = vote.would_order_again
        return acc
      }, {})
    } catch (err) {
      console.error('Error fetching user votes:', err)
      return {}
    }
  }

  return {
    submitVote,
    getUserVotes,
    submitting,
    error,
  }
}
