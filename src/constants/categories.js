// Centralized category definitions for the app
// Used for Browse shortcuts, category picker, fuzzy matching, and profile stats

// Browse shortcuts - curated high-frequency categories for Browse page
// Note: Categories are shortcuts, NOT containers. All dishes are searchable regardless of category.
export const BROWSE_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burgers', emoji: '🍔' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lobster roll', label: 'Lobster Rolls', emoji: '🦞' },
  { id: 'chowder', label: 'Chowder', emoji: '🍲' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'sandwich', label: 'Sandwiches', emoji: '🥪' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
  { id: 'taco', label: 'Tacos', emoji: '🌮' },
  { id: 'tendys', label: 'Tenders', emoji: '🍗' },
  { id: 'dessert', label: 'Desserts', emoji: '🍰' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'clams', label: 'Clams', emoji: '🐚' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔' },
  { id: 'pork', label: 'Pork', emoji: '🐷' },
  { id: 'oysters', label: 'Oysters', emoji: '🦪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'ice cream', label: 'Ice Cream', emoji: '🍦' },
]

// Main categories shown in category picker (singular labels)
export const MAIN_CATEGORIES = [
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'taco', label: 'Taco', emoji: '🌮' },
  { id: 'wings', label: 'Wings', emoji: '🍗' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lobster roll', label: 'Lobster Roll', emoji: '🦞' },
  { id: 'chowder', label: 'Chowder', emoji: '🥣' },
  { id: 'pasta', label: 'Pasta', emoji: '🍝' },
  { id: 'steak', label: 'Steak', emoji: '🥩' },
  { id: 'sandwich', label: 'Sandwich', emoji: '🥪' },
  { id: 'salad', label: 'Salad', emoji: '🥗' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'tendys', label: 'Tenders', emoji: '🍗' },
  { id: 'dessert', label: 'Dessert', emoji: '🍰' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'clams', label: 'Clams', emoji: '🐚' },
  { id: 'chicken', label: 'Chicken', emoji: '🐔' },
  { id: 'pork', label: 'Pork', emoji: '🐷' },
  { id: 'oysters', label: 'Oysters', emoji: '🦪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'beer', label: 'Beer', emoji: '🍺' },
  { id: 'ice cream', label: 'Ice Cream', emoji: '🍦' },
]

// All categories in the system (including sub-categories)
// Used for fuzzy matching when user types custom input
export const ALL_CATEGORIES = [
  ...MAIN_CATEGORIES,
  { id: 'pokebowl', label: 'Poke Bowl', emoji: '🥗' },
  { id: 'soup', label: 'Soup', emoji: '🍜' },
  { id: 'fries', label: 'Fries', emoji: '🍟' },
  { id: 'apps', label: 'Appetizers', emoji: '🍤' },
  { id: 'fried chicken', label: 'Fried Chicken', emoji: '🍗' },
  { id: 'entree', label: 'Entree', emoji: '🍽️' },
  { id: 'donuts', label: 'Donuts', emoji: '🍩' },
  { id: 'asian', label: 'Asian', emoji: '🥢' },
  { id: 'quesadilla', label: 'Quesadilla', emoji: '🫓' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwich', emoji: '🥯' },
  { id: 'ribs', label: 'Ribs', emoji: '🍖' },
  { id: 'sides', label: 'Sides', emoji: '🥦' },
  { id: 'duck', label: 'Duck', emoji: '🦆' },
  { id: 'lamb', label: 'Lamb', emoji: '🍖' },
  { id: 'clams', label: 'Clams', emoji: '🐚' },
  { id: 'oysters', label: 'Oysters', emoji: '🦪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'cocktails', label: 'Cocktails', emoji: '🍸' },
  { id: 'ice cream', label: 'Ice Cream', emoji: '🍦' },
  { id: 'bruschetta', label: 'Bruschetta', emoji: '🍞' },
  { id: 'burrito', label: 'Burrito', emoji: '🌯' },
  { id: 'calamari', label: 'Calamari', emoji: '🦑' },
  { id: 'crab', label: 'Crab', emoji: '🦀' },
  { id: 'curry', label: 'Curry', emoji: '🍛' },
  { id: 'lobster', label: 'Lobster', emoji: '🦞' },
  { id: 'mussels', label: 'Mussels', emoji: '🐚' },
  { id: 'onion rings', label: 'Onion Rings', emoji: '🧅' },
  { id: 'pancakes', label: 'Pancakes', emoji: '🥞' },
  { id: 'scallops', label: 'Scallops', emoji: '🐚' },
  { id: 'shrimp', label: 'Shrimp', emoji: '🦐' },
  { id: 'waffles', label: 'Waffles', emoji: '🧇' },
  { id: 'wrap', label: 'Wrap', emoji: '🌯' },
]

// Fuzzy match a search term to existing categories
// Returns matching categories sorted by relevance
export function matchCategories(searchTerm) {
  if (!searchTerm || searchTerm.trim().length < 2) return []

  const term = searchTerm.toLowerCase().trim()

  return ALL_CATEGORIES
    .map(cat => {
      const id = cat.id.toLowerCase()
      const label = cat.label.toLowerCase()

      // Exact match scores highest
      if (id === term || label === term) {
        return { ...cat, score: 100 }
      }

      // Starts with term
      if (id.startsWith(term) || label.startsWith(term)) {
        return { ...cat, score: 80 }
      }

      // Contains term
      if (id.includes(term) || label.includes(term)) {
        return { ...cat, score: 60 }
      }

      // Check for partial word matches (e.g., "acai" -> no match, but "chicken" -> "fried chicken")
      const words = [...id.split(' '), ...label.split(' ')]
      if (words.some(word => word.startsWith(term))) {
        return { ...cat, score: 40 }
      }

      return { ...cat, score: 0 }
    })
    .filter(cat => cat.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Return top 5 matches
}

// Get category by id
export function getCategoryById(id) {
  return ALL_CATEGORIES.find(cat => cat.id.toLowerCase() === id?.toLowerCase())
}

// Get emoji for a category id
export function getCategoryEmoji(id) {
  const category = getCategoryById(id)
  return category?.emoji || '🍽️'
}

// Hand-drawn poster icons — WGH Icon System v1.0
// Coral fill + black outlines + white details
// See ICON-SPEC.md for the full spec
const CATEGORY_IMAGES = {
  pizza: '/categories/icons/pizza.png',
  burger: '/categories/icons/burger.png',
  wings: '/categories/icons/wings.png',
  breakfast: '/categories/icons/breakfast.png',
  'lobster roll': '/categories/icons/lobster-roll.png',
  chowder: '/categories/icons/chowder.png',
  steak: '/categories/icons/steak.png',
  sandwich: '/categories/icons/sandwich.png',
  salad: '/categories/icons/salad.png',
  taco: '/categories/icons/taco.png',
  pasta: '/categories/icons/pasta.png',
  seafood: '/categories/icons/seafood.png',
  sushi: '/categories/icons/sushi.png',
  tendys: '/categories/icons/tendys.png',
  dessert: '/categories/icons/dessert.png',
  fish: '/categories/icons/fish.png',
  clams: '/categories/icons/clams.png',
  chicken: '/categories/icons/chicken.png',
  pork: '/categories/icons/pork.png',
  'fried chicken': '/categories/icons/fried-chicken.png',
  'breakfast sandwich': '/categories/icons/breakfast-sandwich.png',
  soup: '/categories/icons/soup.png',
  fries: '/categories/icons/fries.png',
  ribs: '/categories/icons/ribs.png',
  quesadilla: '/categories/icons/quesadilla.png',
}

// Get category image path (light mode only)
export function getCategoryNeonImage(id) {
  if (!id) return null
  return CATEGORY_IMAGES[id.toLowerCase()] || null
}

// Preload category images for smooth Browse page loading
export function preloadCategoryImages() {
  Object.values(CATEGORY_IMAGES).forEach(src => {
    const img = new Image()
    img.src = src
  })
}

// Category display info - used for profile stats and tier display
// Maps category id to emoji and label
export const CATEGORY_INFO = {
  'pizza': { emoji: '🍕', label: 'Pizza' },
  'burger': { emoji: '🍔', label: 'Burgers' },
  'taco': { emoji: '🌮', label: 'Tacos' },
  'wings': { emoji: '🍗', label: 'Wings' },
  'sushi': { emoji: '🍣', label: 'Sushi' },
  'sandwich': { emoji: '🥪', label: 'Sandwiches' },
  'breakfast sandwich': { emoji: '🥯', label: 'Breakfast Sandwiches' },
  'pasta': { emoji: '🍝', label: 'Pasta' },
  'pokebowl': { emoji: '🥗', label: 'Poke' },
  'lobster roll': { emoji: '🦞', label: 'Lobster Rolls' },
  'seafood': { emoji: '🦐', label: 'Seafood' },
  'chowder': { emoji: '🍲', label: 'Chowder' },
  'soup': { emoji: '🍜', label: 'Soup' },
  'breakfast': { emoji: '🍳', label: 'Breakfast' },
  'salad': { emoji: '🥗', label: 'Salads' },
  'fries': { emoji: '🍟', label: 'Fries' },
  'tendys': { emoji: '🍗', label: 'Tenders' },
  'fried chicken': { emoji: '🍗', label: 'Fried Chicken' },
  'apps': { emoji: '🧆', label: 'Apps' },
  'entree': { emoji: '🥩', label: 'Entrees' },
  'steak': { emoji: '🥩', label: 'Steak' },
  'dessert': { emoji: '🍰', label: 'Desserts' },
  'ribs': { emoji: '🍖', label: 'Ribs' },
  'sides': { emoji: '🥦', label: 'Sides' },
  'duck': { emoji: '🦆', label: 'Duck' },
  'lamb': { emoji: '🍖', label: 'Lamb' },
  'pork': { emoji: '🐷', label: 'Pork' },
  'fish': { emoji: '🐟', label: 'Fish' },
  'chicken': { emoji: '🐔', label: 'Chicken' },
  'clams': { emoji: '🐚', label: 'Clams' },
  'oysters': { emoji: '🦪', label: 'Oysters' },
  'coffee': { emoji: '☕', label: 'Coffee' },
  'cocktails': { emoji: '🍸', label: 'Cocktails' },
  'ice cream': { emoji: '🍦', label: 'Ice Cream' },
  'bruschetta': { emoji: '🍞', label: 'Bruschetta' },
  'burrito': { emoji: '🌯', label: 'Burrito' },
  'calamari': { emoji: '🦑', label: 'Calamari' },
  'crab': { emoji: '🦀', label: 'Crab' },
  'curry': { emoji: '🍛', label: 'Curry' },
  'lobster': { emoji: '🦞', label: 'Lobster' },
  'mussels': { emoji: '🐚', label: 'Mussels' },
  'onion rings': { emoji: '🧅', label: 'Onion Rings' },
  'pancakes': { emoji: '🥞', label: 'Pancakes' },
  'scallops': { emoji: '🐚', label: 'Scallops' },
  'shrimp': { emoji: '🦐', label: 'Shrimp' },
  'waffles': { emoji: '🧇', label: 'Waffles' },
  'wrap': { emoji: '🌯', label: 'Wrap' },
}

// Get category info with fuzzy matching
// Handles case differences and strips trailing IDs/characters
export function getCategoryInfo(category) {
  if (!category) return { emoji: '🍽️', label: 'Food' }

  // Normalize: lowercase, trim, remove trailing IDs (e.g., "_abc123")
  const normalized = category.toLowerCase().trim().replace(/_[a-z0-9]+$/i, '')

  // Direct match
  if (CATEGORY_INFO[normalized]) {
    return CATEGORY_INFO[normalized]
  }

  // Try matching just the first word for compound categories
  const firstWord = normalized.split(/[\s&,]+/)[0]
  if (CATEGORY_INFO[firstWord]) {
    return CATEGORY_INFO[firstWord]
  }

  // Fallback: capitalize the normalized category name
  const fallbackLabel = normalized
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return { emoji: '🍽️', label: fallbackLabel }
}

