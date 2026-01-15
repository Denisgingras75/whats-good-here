import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'

export function WelcomeModal() {
  const { user } = useAuth()
  const { profile, updateProfile, loading } = useProfile(user?.id)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Show modal when user is logged in but has no display name
  useEffect(() => {
    if (user && !loading && profile && !profile.display_name) {
      setIsOpen(true)
    }
  }, [user, profile, loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    await updateProfile({ display_name: name.trim() })
    setSaving(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in-up">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-xl overflow-hidden"
        style={{ animationDelay: '0.1s' }}
      >
        {/* Decorative gradient header */}
        <div className="h-2" style={{ background: 'var(--color-primary)' }} />

        <div className="p-8">
          {/* Welcome icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'var(--color-primary)' }}>
            <span className="text-4xl">👋</span>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Welcome to What's Good Here!
            </h2>
            <p className="text-neutral-600 text-sm">
              What should we call you?
            </p>
          </div>

          {/* Name form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoFocus
              maxLength={50}
              className="w-full px-4 py-4 bg-white border-2 border-neutral-200 rounded-xl text-lg text-center focus:border-orange-400 focus:outline-none transition-colors placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="w-full px-6 py-4 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Saving...' : "Let's go!"}
            </button>
          </form>

          {/* Fun subtext */}
          <p className="mt-6 text-xs text-center text-neutral-400">
            Help others discover the best dishes on Martha's Vineyard
          </p>
        </div>
      </div>
    </div>
  )
}
