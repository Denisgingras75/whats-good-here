import { useNavigate } from 'react-router-dom'
import { useStreak } from '../hooks/useStreak'
import { StreakBadge } from './StreakBadge'

/**
 * StreakCard - Profile card showing current streak and weekly progress
 * Implements loss aversion and goal-gradient psychology
 */
export function StreakCard({ userId }) {
  const navigate = useNavigate()
  const {
    currentStreak,
    longestStreak,
    votesThisWeek,
    status,
    loading,
  } = useStreak(userId)

  if (loading) {
    return (
      <div className="rounded-2xl p-4 animate-pulse" style={{ background: 'var(--color-surface-elevated)' }} role="status" aria-label="Loading streak">
        <div className="h-6 w-32 rounded" style={{ background: 'var(--color-divider)' }} />
        <div className="h-3 w-full rounded mt-3" style={{ background: 'var(--color-divider)' }} />
      </div>
    )
  }

  // Don't show card if user has no streak history
  if (status === 'none' && currentStreak === 0 && longestStreak === 0) {
    return (
      <div
        className="rounded-2xl p-4 border-2 border-dashed text-center"
        style={{ borderColor: 'var(--color-divider)' }}
      >
        <p className="text-2xl mb-2">🔥</p>
        <p className="font-semibold text-[color:var(--color-text-primary)]">Start Your Streak!</p>
        <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
          Vote on a dish to begin
        </p>
      </div>
    )
  }

  // Calculate progress toward weekly goal (10 votes)
  const weeklyGoal = 10
  const progressPercent = Math.min((votesThisWeek / weeklyGoal) * 100, 100)
  const isNearGoal = progressPercent >= 70

  // Status-based styling
  const getCardStyle = () => {
    if (status === 'at_risk') {
      return {
        background: 'linear-gradient(135deg, var(--color-streak-at-risk-bg) 0%, #FDE68A 100%)',
        border: '2px solid var(--color-streak-at-risk-border)',
      }
    }
    if (status === 'active') {
      return {
        background: 'linear-gradient(135deg, var(--color-streak-active-bg) 0%, var(--color-streak-active-bg-end) 100%)',
        border: '2px solid var(--color-primary)',
      }
    }
    return {
      background: 'var(--color-surface-elevated)',
      border: '1px solid var(--color-divider)',
    }
  }

  // Get CTA message based on status
  const getCtaMessage = () => {
    if (status === 'at_risk') {
      return {
        text: 'Vote today to keep your streak!',
        urgent: true,
      }
    }
    if (votesThisWeek < weeklyGoal) {
      const remaining = weeklyGoal - votesThisWeek
      if (remaining <= 3) {
        return { text: `Just ${remaining} more to hit your weekly goal!`, urgent: true }
      }
      return { text: `${remaining} votes to weekly goal`, urgent: false }
    }
    return { text: 'Weekly goal reached!', urgent: false }
  }

  const cta = getCtaMessage()

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={getCardStyle()}
    >
      {/* Warning banner for at-risk streaks */}
      {status === 'at_risk' && (
        <div className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-amber-800 bg-amber-200 rounded-bl-lg">
          AT RISK
        </div>
      )}

      {/* Header with streak */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">
            {status === 'at_risk' ? '⚠️' : '🔥'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: status === 'at_risk' ? 'var(--color-amber-dark)' : 'var(--color-primary)' }}>
                {currentStreak}
              </span>
              <span className="text-sm font-medium" style={{ color: status === 'at_risk' ? 'var(--color-amber-dark)' : 'var(--color-text-secondary)' }}>
                day streak
              </span>
            </div>
            {longestStreak > currentStreak && (
              <p className="text-xs text-[color:var(--color-text-tertiary)]">
                Best: {longestStreak} days
              </p>
            )}
          </div>
        </div>

        {/* Streak badge */}
        {currentStreak > 0 && (
          <StreakBadge streak={currentStreak} status={status} size="md" />
        )}
      </div>

      {/* Weekly progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span style={{ color: isNearGoal ? 'var(--color-amber-dark)' : 'var(--color-text-secondary)' }}>
            Weekly Progress
          </span>
          <span className="font-semibold" style={{ color: isNearGoal ? 'var(--color-amber)' : 'var(--color-primary)' }}>
            {votesThisWeek}/{weeklyGoal}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: isNearGoal
                ? 'linear-gradient(90deg, var(--color-amber) 0%, var(--color-amber-light) 100%)'
                : 'linear-gradient(90deg, var(--color-primary) 0%, #FB923C 100%)',
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <p
        className={`text-sm font-medium text-center mt-3 ${cta.urgent ? 'animate-pulse' : ''}`}
        style={{ color: cta.urgent ? 'var(--color-amber-dark)' : 'var(--color-text-secondary)' }}
      >
        {cta.text}
      </p>

      {/* Tap to browse hint */}
      {status === 'at_risk' && (
        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--color-amber)', color: 'white' }}
        >
          Vote Now
        </button>
      )}
    </div>
  )
}
