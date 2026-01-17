import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVote } from '../hooks/useVote'
import { votesApi } from '../api'

// Mock the API
vi.mock('../api', () => ({
  votesApi: {
    submitVote: vi.fn(),
    getUserVotes: vi.fn(),
    deleteVote: vi.fn(),
  },
}))

describe('useVote Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitVote', () => {
    it('should submit a vote successfully', async () => {
      votesApi.submitVote.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useVote())

      let response
      await act(async () => {
        response = await result.current.submitVote('dish-1', true, 8)
      })

      expect(response.success).toBe(true)
      expect(votesApi.submitVote).toHaveBeenCalledWith({
        dishId: 'dish-1',
        wouldOrderAgain: true,
        rating10: 8,
      })
    })

    it('should handle vote submission errors', async () => {
      const error = new Error('Not authenticated')
      votesApi.submitVote.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useVote())

      let response
      await act(async () => {
        response = await result.current.submitVote('dish-1', true, 8)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Not authenticated')
      expect(result.current.error).toBe('Not authenticated')
    })

    it('should set submitting state correctly', async () => {
      votesApi.submitVote.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useVote())

      expect(result.current.submitting).toBe(false)

      let submittingDuringCall = null
      await act(async () => {
        const promise = result.current.submitVote('dish-1', true)
        // Check submitting state during the async call
        // Note: We can't check it synchronously in the same tick, so we check after a micro-task
        await Promise.resolve()
        submittingDuringCall = result.current.submitting
        await promise
      })

      expect(submittingDuringCall).toBe(true)

      // After the promise resolves, submitting should be false
      expect(result.current.submitting).toBe(false)
    })

    it('should handle votes without a rating', async () => {
      votesApi.submitVote.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useVote())

      await act(async () => {
        await result.current.submitVote('dish-1', false)
      })

      expect(votesApi.submitVote).toHaveBeenCalledWith({
        dishId: 'dish-1',
        wouldOrderAgain: false,
        rating10: undefined,
      })
    })
  })

  describe('getUserVotes', () => {
    it('should fetch user votes successfully', async () => {
      const mockVotes = {
        'dish-1': { wouldOrderAgain: true, rating10: 8 },
        'dish-2': { wouldOrderAgain: false, rating10: 4 },
      }
      votesApi.getUserVotes.mockResolvedValueOnce(mockVotes)

      const { result } = renderHook(() => useVote())

      let votes
      await act(async () => {
        votes = await result.current.getUserVotes()
      })

      expect(votes).toEqual(mockVotes)
      expect(votesApi.getUserVotes).toHaveBeenCalled()
    })

    it('should return empty object on error', async () => {
      votesApi.getUserVotes.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useVote())

      let votes
      await act(async () => {
        votes = await result.current.getUserVotes()
      })

      expect(votes).toEqual({})
    })
  })
})
