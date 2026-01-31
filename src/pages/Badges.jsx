import { useState, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBadges } from '../hooks/useBadges'
import {
  RARITY_LABELS,
  BADGE_FAMILY,
  FAMILY_INFO,
  CATEGORY_BADGE_TIERS,
  getRarityColor,
  parseCategoryBadgeKey,
} from '../constants/badgeDefinitions'
import { CATEGORY_INFO, MAJOR_CATEGORIES } from '../constants/categories'

export function Badges() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { badges, loading } = useBadges(user?.id, { evaluateOnMount: true })
  const [expandedFamilies, setExpandedFamilies] = useState({})

  // Group badges by family
  const badgesByFamily = useMemo(() => {
    const groups = {}
    badges.forEach(b => {
      const fam = b.family || 'volume'
      if (!groups[fam]) groups[fam] = []
      groups[fam].push(b)
    })
    return groups
  }, [badges])

  // Unlocked counts
  const unlockedBadges = useMemo(() => badges.filter(b => b.unlocked), [badges])

  // 3 closest-to-unlock badges
  const pathForward = useMemo(() => {
    return badges
      .filter(b => !b.unlocked)
      .slice()
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
  }, [badges])

  // Toggle family expansion
  const toggleFamily = (family) => {
    setExpandedFamilies(prev => ({ ...prev, [family]: !prev[family] }))
  }

  // All 4 badge families
  const familyOrder = [BADGE_FAMILY.CATEGORY, BADGE_FAMILY.DISCOVERY, BADGE_FAMILY.CONSISTENCY, BADGE_FAMILY.INFLUENCE]

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <h1 className="sr-only">Your Progression</h1>
      {/* Header */}
      <header className="px-4 py-4" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)' }}>
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
            Your Progression
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Badge Overview */}
        {user && !loading && (
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(200, 90, 84, 0.08) 0%, rgba(200, 90, 84, 0.15) 100%)',
              border: '2px solid rgba(200, 90, 84, 0.3)',
            }}
          >
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{ background: 'var(--color-primary)' }}
                >
                  🏅
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
                    Your Badges
                  </p>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {unlockedBadges.length} of {badges.length}
                  </h2>
                </div>
              </div>

              {/* Path forward — 3 closest badges */}
              {pathForward.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.6)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-tertiary)' }}>
                    Closest to unlock
                  </p>
                  <div className="space-y-2">
                    {pathForward.map(badge => (
                      <div key={badge.key} className="flex items-center gap-2.5">
                        <span className="text-lg flex-shrink-0">{badge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {badge.name}
                            </span>
                            <span className="text-xs font-medium" style={{ color: getRarityColor(badge.rarity) }}>
                              {badge.percentage}%
                            </span>
                          </div>
                          {badge.requirementText && (
                            <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                              {badge.requirementText}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How It Works */}
        <details className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
          <summary className="px-5 py-4 cursor-pointer flex items-center justify-between list-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>How It Works</span>
            </div>
            <svg className="w-5 h-5 transition-transform" style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-5 pb-5 space-y-4">
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <strong>41 badges</strong> across 4 families. Every badge answers: "Does this help someone trust this person's opinion?"
            </p>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>🏅 Category Mastery (30)</h4>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                15 food categories, 2 tiers each. Rate consensus-rated dishes with low bias.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: '#3B82F6', background: '#3B82F620' }}>Specialist</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>10+ consensus-rated, bias within 1.5</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: '#9333EA', background: '#9333EA20' }}>Authority</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>20+ consensus-rated, bias within 1.0</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>🔍 Discovery (6)</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Found hidden gems before they blew up, or called #1 dishes before anyone else. 3 tiers each for gems found and predictions made.
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>🎯 Consistency (3)</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Your rating style after 20+ votes: Steady Hand (consistent ratings), Tough Critic (high standards), or Generous Spirit (finds the good in most dishes).
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>📡 Influence (2)</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                People follow your taste. Taste Maker at 10+ followers, Trusted Voice at 25+.
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Key Terms</h4>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Consensus-rated</strong> = a dish where enough people voted to establish a community rating.
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <strong>Bias</strong> = how far your ratings drift from the community average. Rate honestly and it stays low.
              </p>
            </div>
          </div>
        </details>

        {/* Sign-in prompt for logged-out users */}
        {!user && (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
            <h3 className="mt-4 font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Sign in to track your progress
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Create an account to start earning badges!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 rounded-xl font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Badge Families */}
        {familyOrder.map(family => {
          const familyBadges = badgesByFamily[family]
          if (!familyBadges || familyBadges.length === 0) return null

          const info = FAMILY_INFO[family]
          if (!info) return null
          const earned = familyBadges.filter(b => b.unlocked).length
          const isExpanded = expandedFamilies[family] !== false // default open

          if (family === BADGE_FAMILY.CATEGORY) {
            return (
              <CategoryMasterySection
                key={family}
                badges={familyBadges}
                info={info}
                earned={earned}
                isExpanded={isExpanded}
                onToggle={() => toggleFamily(family)}
                loading={loading}
              />
            )
          }

          return (
            <BadgeListSection
              key={family}
              badges={familyBadges}
              info={info}
              earned={earned}
              isExpanded={isExpanded}
              onToggle={() => toggleFamily(family)}
            />
          )
        })}

        {/* Pro Tips */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-muted) 0%, white 100%)',
            border: '1px solid var(--color-primary)',
          }}
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li className="flex gap-2">
              <span>*</span>
              <span>Category mastery requires both volume AND accuracy</span>
            </li>
            <li className="flex gap-2">
              <span>*</span>
              <span>Rate honestly - your ratings are compared to community consensus</span>
            </li>
            <li className="flex gap-2">
              <span>*</span>
              <span>Experts get featured on dish and category pages</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Generic badge list section for Discovery, Consistency, Influence
const BadgeListSection = memo(function BadgeListSection({ badges, info, earned, isExpanded, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.emoji}</span>
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{info.label}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: earned > 0 ? 'var(--color-primary-muted)' : 'var(--color-divider)', color: earned > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
            {earned}/{badges.length}
          </span>
        </div>
        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-2.5">
          {badges.map(badge => {
            const rarityColor = getRarityColor(badge.rarity)
            return (
              <div
                key={badge.key}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: badge.unlocked ? `${rarityColor}08` : 'var(--color-bg)',
                  border: `1px solid ${badge.unlocked ? `${rarityColor}30` : 'var(--color-divider)'}`,
                  opacity: badge.unlocked ? 1 : 0.7,
                }}
              >
                <span className="text-xl flex-shrink-0">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: badge.unlocked ? rarityColor : 'var(--color-text-primary)' }}>
                      {badge.name}
                    </span>
                    <RarityPill rarity={badge.rarity} small />
                    {badge.unlocked && (
                      <span className="text-xs text-emerald-500">&#10003;</span>
                    )}
                  </div>
                  {!badge.unlocked && badge.requirementText && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                      {badge.requirementText}
                    </p>
                  )}
                  {!badge.unlocked && badge.target > 1 && (
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${badge.percentage}%`, background: rarityColor }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

// Category Mastery section with transparent requirement breakdowns
const CategoryMasterySection = memo(function CategoryMasterySection({ badges, info, earned, isExpanded, onToggle, loading }) {
  // Group by category
  const categorized = useMemo(() => {
    const map = {}
    badges.forEach(b => {
      const parsed = parseCategoryBadgeKey(b.key)
      if (!parsed) return
      if (!map[parsed.categoryId]) map[parsed.categoryId] = {}
      map[parsed.categoryId][parsed.tier] = b
    })
    return map
  }, [badges])

  const categoryIds = Array.from(MAJOR_CATEGORIES)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-divider)' }}>
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{info.emoji}</span>
          <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{info.label}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: earned > 0 ? 'var(--color-primary-muted)' : 'var(--color-divider)', color: earned > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
            {earned}/{badges.length}
          </span>
        </div>
        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} style={{ color: 'var(--color-text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categoryIds.map(catId => {
                const catInfo = CATEGORY_INFO[catId] || { emoji: '\uD83C\uDF7D\uFE0F', label: catId }
                const specialist = categorized[catId]?.specialist
                const authority = categorized[catId]?.authority
                if (!specialist && !authority) return null

                const highestUnlocked = authority?.unlocked ? 'authority' : specialist?.unlocked ? 'specialist' : null

                return (
                  <CategoryCard
                    key={catId}
                    catInfo={catInfo}
                    specialist={specialist}
                    authority={authority}
                    highestUnlocked={highestUnlocked}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// Individual category card with full requirement breakdown
const CategoryCard = memo(function CategoryCard({ catInfo, specialist, authority, highestUnlocked }) {
  const rarityColor = highestUnlocked
    ? getRarityColor(highestUnlocked === 'authority' ? 'epic' : 'rare')
    : 'var(--color-divider)'

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: highestUnlocked ? `${rarityColor}08` : 'var(--color-bg)',
        border: `1px solid ${highestUnlocked ? `${rarityColor}30` : 'var(--color-divider)'}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{catInfo.emoji}</span>
        <span className="font-bold text-sm" style={{ color: highestUnlocked ? rarityColor : 'var(--color-text-primary)' }}>
          {catInfo.label}
        </span>
        {highestUnlocked && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: `${rarityColor}20`, color: rarityColor }}>
            {highestUnlocked === 'authority' ? 'Authority' : 'Specialist'}
          </span>
        )}
      </div>

      {/* Specialist tier */}
      {specialist && (
        <CategoryTierBreakdown
          badge={specialist}
          tierLabel="Specialist"
          tierMeta={CATEGORY_BADGE_TIERS.specialist}
          catLabel={catInfo.label}
        />
      )}

      {/* Authority tier */}
      {authority && (
        <CategoryTierBreakdown
          badge={authority}
          tierLabel="Authority"
          tierMeta={CATEGORY_BADGE_TIERS.authority}
          catLabel={catInfo.label}
        />
      )}
    </div>
  )
})

// Tier breakdown showing volume + accuracy as separate lines
const CategoryTierBreakdown = memo(function CategoryTierBreakdown({ badge, tierLabel, tierMeta, catLabel }) {
  const rarityColor = getRarityColor(badge.rarity)
  const volumeMet = badge.progress >= badge.target
  const accuracyMet = badge.accuracyStatus?.met
  const reqsMet = (volumeMet ? 1 : 0) + (accuracyMet ? 1 : 0)

  if (badge.unlocked) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <span className="text-xs text-emerald-500">&#10003;</span>
        <span className="text-sm font-medium" style={{ color: rarityColor }}>
          {tierLabel}
        </span>
        <RarityPill rarity={badge.rarity} small />
      </div>
    )
  }

  return (
    <div className="mt-2 first:mt-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          {tierLabel}
        </span>
        <RarityPill rarity={badge.rarity} small />
        <span className="text-[10px] ml-auto" style={{ color: 'var(--color-text-tertiary)' }}>
          {reqsMet}/2 requirements met
        </span>
      </div>

      {/* Volume requirement */}
      <div className="flex items-start gap-1.5 mb-1">
        <span className="text-[10px] mt-0.5" style={{ color: volumeMet ? '#10B981' : '#F59E0B' }}>
          {volumeMet ? '\u2713' : '\u26A0'}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Volume: {badge.progress} / {badge.target} consensus-rated dishes
            </span>
          </div>
          {!volumeMet && (
            <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
              Rate {badge.target - badge.progress} more consensus-rated {catLabel.toLowerCase()} dishes
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-divider)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${badge.percentage}%`, background: rarityColor }}
            />
          </div>
        </div>
      </div>

      {/* Accuracy requirement */}
      {badge.accuracyStatus && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <span className="text-[10px] mt-0.5" style={{ color: accuracyMet ? '#10B981' : '#F59E0B' }}>
            {accuracyMet ? '\u2713' : '\u26A0'}
          </span>
          <div className="flex-1">
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Accuracy: |bias| {Math.abs(badge.accuracyStatus.currentBias).toFixed(1)} (needs &le; {badge.accuracyStatus.maxBias?.toFixed(1)})
            </span>
            {!accuracyMet && (
              <p className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
                Your {catLabel.toLowerCase()} ratings average {Math.abs(badge.accuracyStatus.currentBias).toFixed(1)} from consensus
              </p>
            )}
          </div>
        </div>
      )}
      {!badge.accuracyStatus && (
        <div className="flex items-start gap-1.5 mt-1.5">
          <span className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>-</span>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Accuracy: rate more dishes to calculate
          </span>
        </div>
      )}
    </div>
  )
})

// Rarity pill component
function RarityPill({ rarity, small = false }) {
  const color = getRarityColor(rarity)
  const label = RARITY_LABELS[rarity] || 'Common'

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-wide rounded-full ${small ? 'text-[9px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5'}`}
      style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  )
}

