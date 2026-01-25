import { useNavigate } from 'react-router-dom'

/**
 * Hero Identity Card for the Profile page
 * Shows user avatar, name, follow stats, primary title, and near-term goal
 *
 * Props:
 * - user: Auth user object
 * - profile: User profile data
 * - stats: User statistics (categoryTiers, categoryProgress, totalVotes, ratingPersonality)
 * - badges: User badges array
 * - followCounts: { followers, following }
 * - editingName: Boolean for name edit mode
 * - newName: Current value in name edit input
 * - nameStatus: 'checking' | 'available' | 'taken' | 'same' | null
 * - setEditingName: Setter for edit mode
 * - setNewName: Setter for name value
 * - setNameStatus: Setter for name status
 * - handleSaveName: Callback to save name
 * - setFollowListModal: Setter to open follow list modal
 */
export function HeroIdentityCard({
  user,
  profile,
  stats,
  badges,
  followCounts,
  editingName,
  newName,
  nameStatus,
  setEditingName,
  setNewName,
  setNameStatus,
  handleSaveName,
  setFollowListModal,
}) {
  const navigate = useNavigate()

  // Derive primary identity title from highest tier or rating personality
  const getPrimaryTitle = () => {
    if (stats.categoryTiers.length > 0) {
      const highestTier = stats.categoryTiers[0]
      return `${highestTier.label} ${highestTier.title}`
    }
    if (stats.ratingPersonality) {
      return stats.ratingPersonality.title
    }
    return 'Food Explorer'
  }

  // Calculate badges earned
  const unlockedBadges = badges?.filter(b => b.unlocked) || []
  const badgeCount = unlockedBadges.length

  // Get near-term goal (closest to unlocking)
  const getNearTermGoal = () => {
    if (stats.categoryProgress.length > 0) {
      const closest = stats.categoryProgress[0]
      return `${closest.votesNeeded} vote${closest.votesNeeded === 1 ? '' : 's'} to ${closest.nextTier.title} in ${closest.label}`
    }
    if (stats.totalVotes === 0) {
      return 'Rate your first dish to get started'
    }
    return null
  }

  const nearTermGoal = getNearTermGoal()

  return (
    <div className="border-b px-4 py-6" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
      {/* Avatar + Name row */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ background: 'var(--color-primary)' }}>
          {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Display Name */}
          {editingName ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-3 py-1.5 border rounded-lg text-lg font-bold focus:outline-none pr-8"
                    style={{
                      background: 'var(--color-surface-elevated)',
                      borderColor: nameStatus === 'taken' ? '#ef4444' : nameStatus === 'available' ? '#10b981' : 'var(--color-divider)',
                      color: 'var(--color-text-primary)'
                    }}
                    autoFocus
                    maxLength={30}
                  />
                  {nameStatus && nameStatus !== 'same' && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
                      {nameStatus === 'checking' && '\u23F3'}
                      {nameStatus === 'available' && '\u2713'}
                      {nameStatus === 'taken' && '\u2717'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={nameStatus === 'taken' || nameStatus === 'checking'}
                  className="px-3 py-1.5 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false)
                    setNewName(profile?.display_name || '')
                    setNameStatus(null)
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Cancel
                </button>
              </div>
              {nameStatus === 'taken' && (
                <p className="text-xs" style={{ color: '#ef4444' }}>This username is already taken</p>
              )}
              {nameStatus === 'available' && (
                <p className="text-xs" style={{ color: '#10b981' }}>Username available!</p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-xl font-bold transition-colors flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {profile?.display_name || 'Set your name'}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[color:var(--color-text-tertiary)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          )}

          {/* Follow Stats */}
          <div className="flex items-center gap-3 mt-1 text-sm">
            <button
              onClick={() => setFollowListModal('followers')}
              className="hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.followers}
              </span> followers
            </button>
            <button
              onClick={() => setFollowListModal('following')}
              className="hover:underline"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {followCounts.following}
              </span> following
            </button>
          </div>
        </div>
      </div>

      {/* Primary Identity Title */}
      <div className="mt-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
          {getPrimaryTitle()}
        </h2>
        {/* Secondary line: rank info + badges */}
        <p className="text-sm text-[color:var(--color-text-secondary)] mt-0.5">
          {stats.totalVotes > 0 ? `${stats.totalVotes} ratings` : 'Getting started'}
          {badgeCount > 0 && ` \u00B7 ${badgeCount} badge${badgeCount === 1 ? '' : 's'} earned`}
        </p>
      </div>

      {/* Near-term Goal CTA */}
      {nearTermGoal && (
        <button
          onClick={() => navigate('/badges')}
          className="mt-4 w-full p-3 rounded-xl text-left transition-colors hover:opacity-90"
          style={{
            background: 'var(--color-primary-muted)',
            border: '1px solid var(--color-primary)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-text-tertiary)] uppercase tracking-wide">
                Next Goal
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                {nearTermGoal}
              </p>
            </div>
            <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      )}
    </div>
  )
}

export default HeroIdentityCard
