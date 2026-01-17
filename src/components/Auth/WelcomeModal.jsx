import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'
import posthog from 'posthog-js'

const STEPS = [
  {
    id: 'welcome',
    emoji: '🍽️',
    title: 'Find the best dishes on Martha\'s Vineyard',
    subtitle: 'Real ratings from locals & visitors like you',
    description: 'No more guessing. See what\'s actually worth ordering.',
  },
  {
    id: 'how-it-works',
    emoji: '👍',
    title: 'Vote on dishes you\'ve tried',
    subtitle: 'Worth It or Avoid — it\'s that simple',
    description: 'Rate 1-10, and watch dishes climb the rankings as the community votes.',
  },
  {
    id: 'name',
    emoji: '👋',
    title: 'What should we call you?',
    subtitle: 'Join the community',
    description: null,
  },
]

export function WelcomeModal() {
  const { user } = useAuth()
  const { profile, updateProfile, loading } = useProfile(user?.id)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Show modal when user is logged in but hasn't completed onboarding
  useEffect(() => {
    if (user && !loading && profile) {
      // Show if no display_name OR hasn't completed onboarding
      if (!profile.display_name || !profile.has_onboarded) {
        setIsOpen(true)
        posthog.capture('onboarding_started')
      }
    }
  }, [user, profile, loading])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    await updateProfile({
      display_name: name.trim(),
      has_onboarded: true
    })
    posthog.capture('onboarding_completed', { name_set: true })
    setSaving(false)
    setIsOpen(false)
  }

  const handleSkipName = async () => {
    setSaving(true)
    await updateProfile({ has_onboarded: true })
    posthog.capture('onboarding_completed', { name_set: false })
    setSaving(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  const currentStep = STEPS[step]
  const isNameStep = currentStep.id === 'name'

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
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-6 bg-orange-500'
                    : i < step
                      ? 'bg-orange-300 cursor-pointer hover:bg-orange-400'
                      : 'bg-neutral-200'
                }`}
                disabled={i > step}
              />
            ))}
          </div>

          {/* Step icon */}
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg transition-all"
            style={{ background: 'var(--color-primary)' }}
          >
            <span className="text-4xl">{currentStep.emoji}</span>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {currentStep.title}
            </h2>
            <p className="text-neutral-600 text-sm">
              {currentStep.subtitle}
            </p>
            {currentStep.description && (
              <p className="text-neutral-400 text-xs mt-2">
                {currentStep.description}
              </p>
            )}
          </div>

          {/* How it works visual - only on step 2 */}
          {currentStep.id === 'how-it-works' && (
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-xl">
                <span className="text-2xl mb-1">👍</span>
                <span className="text-xs font-medium text-emerald-700">Worth It</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-red-50 rounded-xl">
                <span className="text-2xl mb-1">👎</span>
                <span className="text-xs font-medium text-red-600">Avoid</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-amber-50 rounded-xl">
                <span className="text-2xl mb-1">⭐</span>
                <span className="text-xs font-medium text-amber-700">Rate 1-10</span>
              </div>
            </div>
          )}

          {/* Name input - only on last step */}
          {isNameStep ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
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
                {saving ? 'Saving...' : "Let's go! 🎉"}
              </button>
              <button
                type="button"
                onClick={handleSkipName}
                disabled={saving}
                className="w-full py-2 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                Skip for now
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleNext}
                className="w-full px-6 py-4 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ background: 'var(--color-primary)' }}
              >
                Next
              </button>
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="w-full py-2 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
          )}

          {/* Fun footer text */}
          {!isNameStep && (
            <p className="mt-6 text-xs text-center text-neutral-400">
              {step === 0 && "Trusted by island food lovers"}
              {step === 1 && "Dishes need 5+ votes to get ranked"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
