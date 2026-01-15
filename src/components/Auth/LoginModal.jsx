import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getPendingVoteFromStorage } from '../ReviewFlow'

export function LoginModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  if (!isOpen) return null

  const handleMagicLink = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)

      // Build redirect URL with pending dish ID so we can reopen the modal after login
      const redirectUrl = new URL(window.location.href)
      const pending = getPendingVoteFromStorage()
      if (pending?.dishId) {
        redirectUrl.searchParams.set('votingDish', pending.dishId)
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl.toString(),
        },
      })

      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Check your email for the login link!',
      })
      setEmail('')
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animationDelay: '0.1s' }}
      >
        {/* Decorative gradient header */}
        <div className="h-2" style={{ background: 'var(--color-primary)' }} />

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors focus-ring"
            aria-label="Close"
          >
            <svg
              className="w-4 h-4 text-neutral-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>

          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--color-primary)' }}>
            <span className="text-3xl">🍽️</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              Sign in to vote
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              Join the community and help others discover the best dishes
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Email Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="
                  w-full px-4 py-3
                  bg-white text-neutral-900
                  border-2 border-neutral-200
                  rounded-xl
                  focus-ring
                  hover:border-orange-300
                  transition-colors
                  placeholder:text-neutral-400
                "
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="
                w-full px-6 py-4
                text-white font-semibold rounded-xl
                hover:opacity-90
                active:scale-98
                transition-all duration-200
                focus-ring
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg
              "
              style={{ background: 'var(--color-primary)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send magic link'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-xs text-center text-neutral-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
