import { useCelebration } from '../../context/CelebrationContext'
import { BadgeUnlockCeremony } from './BadgeUnlockCeremony'
import { BadgeUnlockCelebration } from './BadgeUnlockCelebration'
import { isCategoryBadge } from '../../constants/badgeDefinitions'

/**
 * Reads the celebration queue and renders the current ceremony.
 * Category badges (Specialist/Authority) get a dedicated celebration.
 * Other badges use the existing rarity-based ceremony.
 */
export function CelebrationOrchestrator() {
  const { current, dismiss } = useCelebration()

  if (!current) return null

  if (current.type === 'badge') {
    const categoryBadge = current.badges.find(b => isCategoryBadge(b.badge_key || b.key))

    if (categoryBadge) {
      return (
        <BadgeUnlockCelebration
          key={current.id}
          badge={categoryBadge}
          onDone={dismiss}
        />
      )
    }

    return (
      <BadgeUnlockCeremony
        key={current.id}
        badges={current.badges}
        onDone={dismiss}
      />
    )
  }

  return null
}
