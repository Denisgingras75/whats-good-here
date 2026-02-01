// Badge system definitions — rarity tiers, category mastery badge helpers
import { CATEGORY_INFO, MAJOR_CATEGORIES } from './categories'

// Rarity tiers (RPG-style)
export const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
}

// Colors per rarity tier
export const RARITY_COLORS = {
  [RARITY.COMMON]: '#6B7280',
  [RARITY.UNCOMMON]: '#10B981',
  [RARITY.RARE]: '#3B82F6',
  [RARITY.EPIC]: '#9333EA',
  [RARITY.LEGENDARY]: '#F59E0B',
}

// Display labels per rarity
export const RARITY_LABELS = {
  [RARITY.COMMON]: 'Common',
  [RARITY.UNCOMMON]: 'Uncommon',
  [RARITY.RARE]: 'Rare',
  [RARITY.EPIC]: 'Epic',
  [RARITY.LEGENDARY]: 'Legendary',
}

// Badge families
export const BADGE_FAMILY = {
  CATEGORY: 'category',
  DISCOVERY: 'discovery',
  CONSISTENCY: 'consistency',
  INFLUENCE: 'influence',
}

// Family display info
export const FAMILY_INFO = {
  [BADGE_FAMILY.CATEGORY]: { emoji: '🏅', label: 'Category Mastery' },
  [BADGE_FAMILY.DISCOVERY]: { emoji: '🔍', label: 'Discovery' },
  [BADGE_FAMILY.CONSISTENCY]: { emoji: '🎯', label: 'Consistency' },
  [BADGE_FAMILY.INFLUENCE]: { emoji: '📡', label: 'Influence' },
}

// Discovery badge thresholds
// Hidden gems: voted early on dishes that later became top-rated
// Called it: predicted #1 dishes before they got there
export const DISCOVERY_BADGES = {
  hidden_gem_finder: { type: 'gem', threshold: 1 },
  gem_hunter: { type: 'gem', threshold: 5 },
  gem_collector: { type: 'gem', threshold: 10 },
  good_call: { type: 'prediction', threshold: 1 },
  taste_prophet: { type: 'prediction', threshold: 3 },
  oracle: { type: 'prediction', threshold: 5 },
}

// Consistency badge thresholds — requires 20+ ratings minimum
export const CONSISTENCY_BADGES = {
  steady_hand: { stat: 'variance', maxVariance: 1.0, minVotes: 20 },
  tough_critic: { stat: 'avgRating', maxAvgRating: 6.0, minVotes: 20 },
  generous_spirit: { stat: 'avgRating', minAvgRating: 8.5, minVotes: 20 },
}

// Influence badge thresholds
export const INFLUENCE_BADGES = {
  taste_maker: { minFollowers: 10 },
  trusted_voice: { minFollowers: 25 },
}

// Maps rarity to celebration tier
// common/uncommon -> 'standard' (toast), rare -> 'rare' (overlay), epic/legendary -> 'major' (overlay + confetti)
export const CELEBRATION_TIER_MAP = {
  [RARITY.COMMON]: 'standard',
  [RARITY.UNCOMMON]: 'standard',
  [RARITY.RARE]: 'rare',
  [RARITY.EPIC]: 'major',
  [RARITY.LEGENDARY]: 'major',
}

// Category badge tiers
export const CATEGORY_BADGE_TIERS = {
  specialist: { volumeThreshold: 10, maxAbsBias: 1.5 },
  authority: { volumeThreshold: 20, maxAbsBias: 1.0 },
}

// Generate a category badge key from category id and tier
export function generateCategoryBadgeKey(categoryId, tier) {
  const normalized = categoryId.replace(/\s+/g, '_')
  return `${tier}_${normalized}`
}

// Parse a category badge key back into { tier, categoryId }
export function parseCategoryBadgeKey(key) {
  const match = key.match(/^(specialist|authority)_(.+)$/)
  if (!match) return null
  return {
    tier: match[1],
    categoryId: match[2].replace(/_/g, ' '),
  }
}

// Check if a badge key is a category badge
export function isCategoryBadge(key) {
  return parseCategoryBadgeKey(key) !== null
}

// Get the rarity color for a given rarity string
export function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || RARITY_COLORS[RARITY.COMMON]
}

// Get display name for a category badge
export function getCategoryBadgeName(key) {
  const parsed = parseCategoryBadgeKey(key)
  if (!parsed) return key
  const info = CATEGORY_INFO[parsed.categoryId] || { label: parsed.categoryId }
  const tierLabel = parsed.tier === 'authority' ? 'Authority' : 'Specialist'
  return `${info.label} ${tierLabel}`
}

// Get all major category IDs as an array (for iteration)
export function getMajorCategoryIds() {
  return Array.from(MAJOR_CATEGORIES)
}

// Filter out specialist badges when the authority badge for the same category exists
export function filterSupersededBadges(badges) {
  const authorityCategories = new Set()
  badges.forEach(b => {
    const parsed = parseCategoryBadgeKey(b.key || b.badge_key || '')
    if (parsed && parsed.tier === 'authority') {
      authorityCategories.add(parsed.categoryId)
    }
  })
  return badges.filter(b => {
    const parsed = parseCategoryBadgeKey(b.key || b.badge_key || '')
    if (parsed && parsed.tier === 'specialist' && authorityCategories.has(parsed.categoryId)) {
      return false
    }
    return true
  })
}
