import { useState, useEffect } from 'react'

const STORAGE_KEY = 'wgh_has_seen_splash'

const SLIDES = [
  {
    id: 'purpose-1',
    emoji: '🍽️',
    headline: 'At a restaurant?',
    subhead: 'Find the best thing on the menu.',
    description: 'See what dishes are actually worth ordering, ranked by real people.',
  },
  {
    id: 'purpose-2',
    emoji: '🔍',
    headline: 'Craving something?',
    subhead: 'Find the best version near you.',
    description: 'Best pizza, burger, lobster roll — we\'ll show you where to go.',
  },
  {
    id: 'how-it-works',
    emoji: '👍',
    headline: 'Tried something?',
    subhead: 'Vote and help others decide.',
    description: 'Your votes help rank every dish. The more you vote, the better it gets.',
  },
]

/**
 * WelcomeSplash - Multi-step welcome for first-time visitors
 * Explains the two core purposes + how voting works
 */
export function WelcomeSplash() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState('next')

  // Check if user has seen splash before
  useEffect(() => {
    try {
      const hasSeenSplash = localStorage.getItem(STORAGE_KEY)
      if (!hasSeenSplash) {
        setIsVisible(true)
      }
    } catch {
      // localStorage unavailable, show splash anyway
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsFading(true)
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        // localStorage unavailable
      }
      setIsVisible(false)
    }, 400)
  }

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setSlideDirection('next')
      setCurrentSlide(currentSlide + 1)
    } else {
      handleDismiss()
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setSlideDirection('prev')
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleSkip = () => {
    handleDismiss()
  }

  if (!isVisible) return null

  const slide = SLIDES[currentSlide]
  const isLastSlide = currentSlide === SLIDES.length - 1

  return (
    <div
      className={`welcome-splash ${isFading ? 'welcome-splash--fading' : ''}`}
      role="dialog"
      aria-label="Welcome to What's Good Here"
    >
      <div className="welcome-splash__content">
        {/* Progress dots */}
        <div className="welcome-splash__progress">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setSlideDirection(i > currentSlide ? 'next' : 'prev')
                setCurrentSlide(i)
              }}
              className={`welcome-splash__dot ${i === currentSlide ? 'welcome-splash__dot--active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div
          key={slide.id}
          className={`welcome-splash__slide welcome-splash__slide--${slideDirection}`}
        >
          {/* Emoji icon */}
          <div className="welcome-splash__icon">
            <span className="welcome-splash__emoji">{slide.emoji}</span>
          </div>

          {/* Headlines */}
          <h1 className="welcome-splash__headline">{slide.headline}</h1>
          <p className="welcome-splash__subhead">{slide.subhead}</p>
          <p className="welcome-splash__description">{slide.description}</p>
        </div>

        {/* Navigation buttons */}
        <div className="welcome-splash__nav">
          {currentSlide > 0 ? (
            <button
              onClick={handleBack}
              className="welcome-splash__btn welcome-splash__btn--secondary"
            >
              Back
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="welcome-splash__btn welcome-splash__btn--skip"
            >
              Skip
            </button>
          )}

          <button
            onClick={handleNext}
            className="welcome-splash__btn welcome-splash__btn--primary"
          >
            {isLastSlide ? "Let's go!" : 'Next'}
          </button>
        </div>

        {/* Slide counter */}
        <p className="welcome-splash__counter">
          {currentSlide + 1} of {SLIDES.length}
        </p>
      </div>
    </div>
  )
}
