import { useAuth } from '../context/AuthContext'
import { useFriendsFeed } from '../hooks/useFriendsFeed'
import { FriendsFeed } from '../components/profile'
import { LoginModal } from '../components/Auth/LoginModal'
import { useState } from 'react'

export function Activity() {
  const { user, loading: authLoading } = useAuth()
  const { feed, loading } = useFriendsFeed(user?.id)
  const [showLogin, setShowLogin] = useState(false)

  if (authLoading) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'var(--color-surface)' }}>
        <div className="h-8 w-48 rounded-lg animate-pulse mb-4" style={{ background: 'var(--color-surface-elevated)' }} />
        <div className="space-y-3">
          {[0, 1, 2].map(function (i) {
            return (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-elevated)' }} />
            )
          })}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'var(--color-surface)' }}>
        <div
          className="rounded-2xl border p-8 text-center mt-8"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
        >
          <p className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: '18px' }}>
            See what friends are eating
          </p>
          <p className="mb-4" style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
            Sign in to follow people and see their food discoveries
          </p>
          <button
            onClick={function () { setShowLogin(true) }}
            className="px-6 py-2.5 rounded-xl font-semibold"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)', border: 'none' }}
          >
            Sign In
          </button>
        </div>
        {showLogin && <LoginModal onClose={function () { setShowLogin(false) }} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <div className="px-4 pt-4 pb-2">
        <h1
          className="font-bold"
          style={{ color: 'var(--color-text-primary)', fontSize: '24px', letterSpacing: '-0.02em' }}
        >
          Friends
        </h1>
        <p style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }} className="mt-0.5">
          What people you follow are eating
        </p>
      </div>

      <div className="px-4 pb-4">
        <FriendsFeed feed={feed} loading={loading} />
      </div>
    </div>
  )
}

export default Activity
