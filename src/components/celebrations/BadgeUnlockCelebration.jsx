import { useState, useEffect } from 'react'
import { playBadgeSound } from '../../lib/sounds'
import { hapticSuccess } from '../../utils/haptics'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { CATEGORY_INFO } from '../../constants/categories'
import { parseCategoryBadgeKey } from '../../constants/badgeDefinitions'
import { logger } from '../../utils/logger'

/**
 * Category badge unlock celebration with share button.
 * Used for Specialist and Authority badges — the 30 category mastery badges.
 */
export function BadgeUnlockCelebration({ badge, onDone }) {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  const parsed = parseCategoryBadgeKey(badge.badge_key || badge.key)
  const isAuthority = parsed?.tier === 'authority'
  const glowColor = isAuthority ? '#9333EA' : '#3B82F6'
  const catInfo = parsed ? CATEGORY_INFO[parsed.categoryId] : null
  const categoryLabel = catInfo?.label || parsed?.categoryId || 'this category'
  const badgeName = badge.name || `${categoryLabel} ${isAuthority ? 'Authority' : 'Specialist'}`

  useEffect(() => {
    playBadgeSound()
    hapticSuccess()

    // Fade in
    const showTimer = setTimeout(() => setVisible(true), 50)

    // Auto-dismiss after 5 seconds
    const autoDismiss = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDone?.(), 300)
    }, 5000)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(autoDismiss)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDone?.(), 300)
  }

  const handleShare = async () => {
    const shareText = `I just earned ${badgeName} on What's Good Here! ${catInfo?.emoji || ''}`

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch (err) {
        // User cancelled or error — fall through to clipboard
        if (err.name !== 'AbortError') {
          logger.error('Share failed:', err)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
      } catch {
        // Clipboard not available — silently fail
      }
    }

    handleDismiss()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{
        zIndex: 10001,
        background: 'rgba(13, 27, 34, 0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        opacity: visible ? 1 : 0,
        transition: prefersReducedMotion ? 'none' : 'opacity 300ms ease-out',
      }}
      onClick={handleDismiss}
      role="dialog"
      aria-label="Badge unlocked"
    >
      <div
        className="text-center max-w-xs w-full p-8 rounded-2xl"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${glowColor}25 0%, transparent 70%), var(--color-bg)`,
          border: `1px solid ${glowColor}30`,
          boxShadow: `0 0 60px ${glowColor}20`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge icon */}
        <div
          className="text-5xl mb-4"
          style={{ filter: `drop-shadow(0 4px 20px ${glowColor}60)` }}
        >
          {badge.icon || catInfo?.emoji || '🏅'}
        </div>

        {/* Badge name */}
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {badgeName}
        </h2>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: glowColor }}
        >
          Unlocked
        </p>

        {/* Description */}
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Your {categoryLabel.toLowerCase()} ratings are now trusted by the community
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: `${glowColor}18`,
              color: glowColor,
              border: `1px solid ${glowColor}30`,
            }}
          >
            Share
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-divider)',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
