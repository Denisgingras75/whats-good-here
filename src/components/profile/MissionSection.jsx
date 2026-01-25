import { useState } from 'react'

/**
 * Our Mission section with expandable details
 * Explains the philosophy and purpose of the app
 */
export function MissionSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t" style={{ borderColor: 'var(--color-divider)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--color-surface-elevated)] transition-colors"
      >
        <span className="font-medium text-[color:var(--color-text-primary)]">Our Mission</span>
        <svg
          className={`w-5 h-5 text-[color:var(--color-text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            Restaurants collect an incredible amount of data — what you ordered, when you came, how long you stayed, and whether you returned. They have dashboards, analytics, and insights.
          </p>

          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            But when you sit down at a new place, what do you have?
          </p>

          <div className="bg-[color:var(--color-surface-elevated)] rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-[color:var(--color-text-primary)] font-medium">A menu.</p>
            <p className="text-sm text-[color:var(--color-text-secondary)]">No context.</p>
            <p className="text-sm text-[color:var(--color-text-secondary)]">No signal.</p>
            <p className="text-sm text-[color:var(--color-text-tertiary)]">Just a guess.</p>
          </div>

          <p className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-4">
            What's Good Here exists to change that.
          </p>

          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            We give diners access to the data that actually matters when you're ordering: what real people thought of real dishes. No influencers. No hype. Just honest votes.
          </p>

          <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
            When enough people agree a dish is worth ordering, it rises to the top — making it easier for the next person to decide with confidence.
          </p>

          <div className="rounded-xl p-4 mt-4" style={{ background: 'var(--color-primary-muted)' }}>
            <p className="text-sm font-medium text-[color:var(--color-text-primary)] text-center">
              Every vote you cast helps someone else eat better.
            </p>
            <p className="text-xs text-[color:var(--color-text-secondary)] text-center mt-1">
              That's the mission.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MissionSection
