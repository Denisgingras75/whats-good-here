import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBadges } from '../hooks/useBadges'

export function Badges() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { badges, loading } = useBadges(user?.id)

  // Split badges into private and public
  const privateBadges = badges.filter(b => !b.is_public_eligible)
  const publicBadges = badges.filter(b => b.is_public_eligible)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            How Badges Work
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Intro Card */}
        <div
          className="rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1px solid #FED7AA',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Earn Badges
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Every vote brings you closer to new achievements
              </p>
            </div>
          </div>
          <p className="text-neutral-700 leading-relaxed">
            As you rate dishes and explore restaurants, you'll unlock badges that celebrate your
            contributions to the community. Some badges are personal milestones, while others
            are prestigious achievements that display on your public profile.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>1</span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Rate dishes</h3>
                <p className="text-sm text-neutral-500">Vote on dishes you've tried and rate them honestly</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>2</span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Build progress</h3>
                <p className="text-sm text-neutral-500">Each vote counts toward multiple badge goals</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>3</span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Unlock badges</h3>
                <p className="text-sm text-neutral-500">Get notified when you earn a new achievement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Private Badges */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔒</span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Personal Milestones
            </h2>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            These badges celebrate your journey and are visible only to you.
          </p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {privateBadges.map((badge) => (
                <BadgeRow key={badge.key} badge={badge} />
              ))}
            </div>
          )}
        </div>

        {/* Public Badges */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⭐</span>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Prestigious Badges
            </h2>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            These elite achievements are displayed on your public profile for everyone to see.
          </p>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {publicBadges.map((badge) => (
                <BadgeRow key={badge.key} badge={badge} isPublic />
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Tips for Earning Badges
          </h2>
          <ul className="space-y-3 text-neutral-600">
            <li className="flex gap-3">
              <span>🍽️</span>
              <span>Rate dishes at new restaurants to unlock explorer badges faster</span>
            </li>
            <li className="flex gap-3">
              <span>📍</span>
              <span>Try different spots around the island to maximize your restaurant count</span>
            </li>
            <li className="flex gap-3">
              <span>⚡</span>
              <span>One vote can unlock multiple badges at once!</span>
            </li>
            <li className="flex gap-3">
              <span>🎯</span>
              <span>Check your profile to see how close you are to your next badge</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Badge row component
function BadgeRow({ badge, isPublic }) {
  const isUnlocked = badge.unlocked

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        isUnlocked
          ? isPublic
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
          : 'bg-neutral-50 border border-neutral-200'
      }`}
    >
      {/* Icon */}
      <div className={`text-2xl ${!isUnlocked && 'opacity-40'}`}>
        {badge.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`font-semibold ${isUnlocked ? '' : 'text-neutral-500'}`}
            style={isUnlocked ? { color: 'var(--color-text-primary)' } : {}}
          >
            {badge.name}
          </h3>
          {isUnlocked && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
              Unlocked
            </span>
          )}
        </div>
        <p className={`text-sm ${isUnlocked ? 'text-neutral-600' : 'text-neutral-400'}`}>
          {badge.description}
        </p>

        {/* Progress bar for locked badges */}
        {!isUnlocked && badge.target > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>{badge.progress}/{badge.target}</span>
              <span>{badge.percentage}%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${badge.percentage}%`,
                  background: 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
