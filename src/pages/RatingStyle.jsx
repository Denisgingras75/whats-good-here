import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRatingIdentity } from '../hooks/useRatingIdentity'
import { FEATURES } from '../constants/features'

/**
 * Rating Style Explanation Page
 * Explains how the rating bias system works
 */
export function RatingStyle() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const ratingIdentity = useRatingIdentity(FEATURES.RATING_IDENTITY_ENABLED ? user?.id : null)

  const biasLabels = [
    { range: '−2.5 or less', label: 'Brutal Critic', color: '#ef4444', description: 'Rates dishes much lower than most people' },
    { range: '−1.5 to −2.4', label: 'Tough Critic', color: '#f97316', description: 'Has high standards, rates below average' },
    { range: '−0.5 to −1.4', label: 'Discerning', color: '#fb923c', description: 'Slightly pickier than the crowd' },
    { range: '−0.4 to +0.4', label: 'Fair Judge', color: '#a3a3a3', description: 'Rates dishes close to the consensus' },
    { range: '+0.5 to +1.4', label: 'Generous', color: '#4ade80', description: 'Tends to rate a bit higher than most' },
    { range: '+1.5 to +2.4', label: 'Loves Everything', color: '#22c55e', description: 'Very positive rater, sees the best in dishes' },
    { range: '+2.5 or more', label: 'Eternal Optimist', color: '#10b981', description: 'Rates dishes much higher than most people' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b px-4 py-3 flex items-center gap-3" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-divider)' }}>
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Rating Style
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Your Rating Style Card */}
        {user && ratingIdentity && !ratingIdentity.loading && (
          <div
            className="p-5 rounded-2xl border"
            style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Your Rating Style
            </p>
            {ratingIdentity.votesWithConsensus > 0 ? (
              <>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-4xl font-bold tabular-nums"
                    style={{ color: ratingIdentity.ratingBias < 0 ? '#f97316' : ratingIdentity.ratingBias > 0 ? '#22c55e' : 'var(--color-text-secondary)' }}
                  >
                    {ratingIdentity.ratingBias > 0 ? '+' : ''}{ratingIdentity.ratingBias?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {ratingIdentity.biasLabel}
                  </span>
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Based on {ratingIdentity.votesWithConsensus} dish{ratingIdentity.votesWithConsensus === 1 ? '' : 'es'} with consensus
                </p>
              </>
            ) : (
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Rate more dishes to discover your rating style!
                {ratingIdentity.votesPending > 0 && (
                  <span className="block mt-1" style={{ color: 'var(--color-primary)' }}>
                    {ratingIdentity.votesPending} vote{ratingIdentity.votesPending === 1 ? '' : 's'} waiting for consensus
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {/* What is Rating Style */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            What is Rating Style?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Your Rating Style shows how your ratings compare to everyone else's. It's calculated by comparing your ratings to the <strong style={{ color: 'var(--color-text-primary)' }}>consensus rating</strong> — the average rating a dish receives once 5+ people have rated it.
          </p>
          <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Example:</strong> If a dish has a consensus of 7.5 and you rated it 6.5, your deviation for that dish is <span className="font-bold" style={{ color: '#f97316' }}>−1.0</span>
            </p>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Your overall Rating Style number is the average of all your deviations across every dish you've rated that has reached consensus.
          </p>
        </div>

        {/* Rating Style Labels */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Rating Style Labels
          </h2>
          <div className="space-y-3">
            {biasLabels.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--color-bg)' }}
              >
                <div
                  className="w-16 text-center text-sm font-bold tabular-nums py-1 px-2 rounded"
                  style={{ color: item.color, background: `${item.color}15` }}
                >
                  {item.range.split(' ')[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Consensus Works */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            How Consensus Works
          </h2>
          <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--color-primary)' }}>1</div>
              <div className="flex-1 pt-1">
                <p><strong style={{ color: 'var(--color-text-primary)' }}>You rate a dish</strong> — your vote goes into the "pending" pool</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--color-primary)' }}>2</div>
              <div className="flex-1 pt-1">
                <p><strong style={{ color: 'var(--color-text-primary)' }}>Once 5 people rate it</strong> — the dish reaches "consensus" and gets an official rating</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--color-primary)' }}>3</div>
              <div className="flex-1 pt-1">
                <p><strong style={{ color: 'var(--color-text-primary)' }}>Your vote is scored</strong> — we compare your rating to the consensus and update your Rating Style</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why It Matters */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Why It Matters
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Knowing someone's Rating Style helps you interpret their reviews. A "Tough Critic" giving an 8.0 means more than an "Eternal Optimist" giving an 8.0 — it's like calibrating a scale before you weigh something.
          </p>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            There's no "right" rating style. Some people have high standards, some see the best in every dish. What matters is understanding the lens through which someone rates food.
          </p>
        </div>

        {/* Badges & Your Rating Style */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            How Accuracy Unlocks Badges
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Your rating accuracy directly affects which badges you can earn.
            <strong style={{ color: '#3B82F6' }}> Category Mastery</strong> badges require both volume <em>and</em> accuracy in a specific food category.
          </p>

          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ color: '#3B82F6', background: '#3B82F618', border: '1px solid #3B82F630' }}
                >
                  Rare
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Specialist
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                10+ consensus-rated dishes in a category with |bias| &le; 1.5
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ color: '#9333EA', background: '#9333EA18', border: '1px solid #9333EA30' }}
                >
                  Epic
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Authority
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                20+ consensus-rated dishes in a category with |bias| &le; 1.0
              </p>
            </div>
          </div>

          <p className="text-sm mt-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: '#10B981' }}>Consistency</strong> badges also depend on your overall rating style.
            <em> Steady Hand</em> rewards low bias (|bias| &le; 0.5 with 20+ consensus ratings), while <em>Tough Critic</em> and <em>Generous Spirit</em> recognize strong rating tendencies.
          </p>
        </div>

        {/* Early Voters */}
        <div
          className="p-5 rounded-2xl border"
          style={{ background: 'var(--color-surface-elevated)', borderColor: 'var(--color-divider)' }}
        >
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Early Voters & Discovery
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Be one of the first 3 people to rate a dish? You're an <strong style={{ color: 'var(--color-primary)' }}>Early Voter</strong> — you helped establish the consensus before others could see it. This earns progress toward
            <strong style={{ color: '#3B82F6' }}> Discovery</strong> badges.
          </p>
          {ratingIdentity && ratingIdentity.dishesHelpedEstablish > 0 && (
            <p className="text-sm mt-3 font-medium" style={{ color: 'var(--color-primary)' }}>
              You've helped establish {ratingIdentity.dishesHelpedEstablish} dish{ratingIdentity.dishesHelpedEstablish === 1 ? '' : 'es'}!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RatingStyle
