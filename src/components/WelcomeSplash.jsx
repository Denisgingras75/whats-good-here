import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wgh_has_seen_splash'
const AUTO_DISMISS_MS = 5000

/**
 * WelcomeSplash - One-time welcome screen for first-time visitors
 * Shows logo and mission statement, auto-dismisses after 5 seconds
 * Can be dismissed early by tapping anywhere
 */
export function WelcomeSplash() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFading, setIsFading] = useState(false)

  // Check if user has seen splash before
  useEffect(() => {
    const hasSeenSplash = localStorage.getItem(STORAGE_KEY)
    if (!hasSeenSplash) {
      setIsVisible(true)
    }
  }, [])

  // Auto-dismiss timer
  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_MS)

    return () => clearTimeout(timer)
  }, [isVisible])

  const handleDismiss = () => {
    setIsFading(true)
    // Wait for fade animation to complete before hiding
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true')
      setIsVisible(false)
    }, 400)
  }

  if (!isVisible) return null

  return (
    <div
      className={`welcome-splash ${isFading ? 'welcome-splash--fading' : ''}`}
      onClick={handleDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleDismiss()}
      aria-label="Welcome screen. Tap to continue."
    >
      <div className="welcome-splash__content">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="What's Good Here"
          className="welcome-splash__logo"
        />

        {/* Mission statement */}
        <p className="welcome-splash__mission">
          Help people confidently decide what to order, and let rankings emerge honestly.
        </p>

        {/* Subtext */}
        <p className="welcome-splash__subtext">
          Vote on dishes to help rankings form.
        </p>

        {/* Tap hint */}
        <p className="welcome-splash__hint">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  )
}
