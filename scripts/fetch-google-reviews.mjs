#!/usr/bin/env node

/**
 * Fetch real Google reviews for all MV restaurants, match to dishes,
 * and generate SQL to update AI-seeded votes with real review text.
 *
 * v2: Smarter matching — fuzzy keywords, category matching, multi-vote updates
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-google-reviews.mjs
 *
 * Output: supabase/seed/seed-google-reviews.sql
 */

import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// 1. Config
// ---------------------------------------------------------------------------

let envVars = {}
try {
  const envFile = readFileSync('.env.local', 'utf-8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([A-Z_]+)="?([^"\n]*)"?/)
    if (match) envVars[match[1]] = match[2].replace(/\\n$/, '')
  }
} catch { /* no .env.local */ }

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const GOOGLE_API_KEY = envVars.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing Supabase keys'); process.exit(1) }
if (!GOOGLE_API_KEY) { console.error('Missing GOOGLE_PLACES_API_KEY'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// How many AI votes to update per matched dish (more = richer review section)
const VOTES_PER_DISH = 3

// ---------------------------------------------------------------------------
// 2. Keyword map — food terms that map to dish categories
// ---------------------------------------------------------------------------

const FOOD_KEYWORDS = {
  // Proteins
  'lobster': ['lobster'],
  'lobster roll': ['lobster roll', 'lobster salad roll'],
  'scallop': ['scallop', 'scallops'],
  'shrimp': ['shrimp'],
  'clam': ['clam', 'clams', 'steamers'],
  'oyster': ['oyster', 'oysters'],
  'crab': ['crab'],
  'crab cake': ['crab cake', 'crab cakes'],
  'cod': ['cod', 'codfish'],
  'salmon': ['salmon'],
  'tuna': ['tuna'],
  'swordfish': ['swordfish'],
  'halibut': ['halibut'],
  'mussel': ['mussel', 'mussels'],
  'calamari': ['calamari', 'squid'],
  'steak': ['steak', 'filet', 'ribeye', 'flat iron'],
  'burger': ['burger', 'hamburger'],
  'chicken': ['chicken'],
  'pork': ['pork', 'pork chop', 'pork belly'],
  'duck': ['duck'],
  'lamb': ['lamb'],
  'ribs': ['ribs', 'short rib', 'short ribs'],
  // Dishes
  'pizza': ['pizza'],
  'pasta': ['pasta', 'linguine', 'rigatoni', 'pappardelle', 'gnocchi', 'ravioli'],
  'risotto': ['risotto'],
  'tacos': ['taco', 'tacos'],
  'sandwich': ['sandwich'],
  'banh mi': ['banh mi', 'bahn mi'],
  'sushi': ['sushi', 'roll'],
  'chowder': ['chowder'],
  'bisque': ['bisque'],
  'soup': ['soup'],
  'salad': ['salad', 'caesar'],
  'fish and chips': ['fish and chips', 'fish & chips', 'fish n chips'],
  'wings': ['wings', 'wing'],
  'fries': ['fries', 'french fries', 'truffle fries'],
  // Breakfast
  'pancake': ['pancake', 'pancakes', 'flapjack'],
  'french toast': ['french toast'],
  'eggs benedict': ['eggs benedict', 'benedict'],
  'waffle': ['waffle'],
  'hash': ['hash'],
  'omelette': ['omelette', 'omelet'],
  // Desserts
  'donut': ['donut', 'doughnut'],
  'ice cream': ['ice cream'],
  'cake': ['cake'],
  'pie': ['pie'],
  // Drinks
  'coffee': ['coffee', 'latte', 'espresso', 'cold brew'],
  'smoothie': ['smoothie', 'acai'],
  'cocktail': ['cocktail', 'margarita'],
}

// ---------------------------------------------------------------------------
// 3. Fetch restaurants + dishes from Supabase
// ---------------------------------------------------------------------------

async function getRestaurantsWithDishes() {
  const { data: restaurants, error: rErr } = await supabase
    .from('restaurants')
    .select('id, name, google_place_id')
    .not('google_place_id', 'is', null)

  if (rErr) throw rErr

  // Paginate dishes (Supabase default limit is 1000)
  let allDishes = []
  let page = 0
  const pageSize = 1000
  while (true) {
    const { data: dishes, error: dErr } = await supabase
      .from('dishes')
      .select('id, name, restaurant_id, category')
      .range(page * pageSize, (page + 1) * pageSize - 1)
    if (dErr) throw dErr
    allDishes = allDishes.concat(dishes)
    if (dishes.length < pageSize) break
    page++
  }

  console.log(`Found ${restaurants.length} restaurants with Google Place IDs`)
  console.log(`Found ${allDishes.length} total dishes`)

  const dishMap = {}
  for (const d of allDishes) {
    if (!dishMap[d.restaurant_id]) dishMap[d.restaurant_id] = []
    dishMap[d.restaurant_id].push(d)
  }

  return restaurants.map(r => ({
    ...r,
    dishes: dishMap[r.id] || []
  }))
}

// ---------------------------------------------------------------------------
// 4. Fetch Google reviews via Places API (New)
// ---------------------------------------------------------------------------

async function getGoogleReviews(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'reviews'
    }
  })

  if (!res.ok) {
    return []
  }

  const data = await res.json()
  return (data.reviews || []).map(r => ({
    text: r.text?.text || '',
    author: r.authorAttribution?.displayName || 'Google reviewer',
    rating: r.rating || 0,
    time: r.relativePublishTimeDescription || ''
  }))
}

// ---------------------------------------------------------------------------
// 5. Smart matching — exact, fuzzy, keyword, and category
// ---------------------------------------------------------------------------

function buildDishSearchTerms(dish) {
  const name = dish.name.toLowerCase()
  const terms = new Set()

  // Exact name
  terms.add(name)

  // Remove parenthetical: "Clam Chowder (Bowl)" → "clam chowder"
  const noParen = name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  if (noParen !== name && noParen.length > 3) terms.add(noParen)

  // Remove common prefixes: "New England Clam Chowder" → "clam chowder"
  const stripped = name
    .replace(/^(new england|martha's vineyard|mv|classic|our famous|house|traditional|crispy|grilled|fried|pan seared|pan roasted|roasted|baked|broiled|sautéed|sauteed|steamed|blackened|smoked|fresh|hot|cold|jumbo)\s+/gi, '')
    .trim()
  if (stripped !== name && stripped.length > 3) terms.add(stripped)

  // Core words (last 2+ significant words)
  const words = name.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'with', 'our', 'a'].includes(w))
  if (words.length >= 2) {
    terms.add(words.slice(-2).join(' '))
    if (words.length >= 3) terms.add(words.slice(-3).join(' '))
  }

  // Individual significant words (for keyword matching)
  const keywords = []
  for (const word of words) {
    if (word.length >= 5) keywords.push(word) // "lobster", "scallop", "chowder", etc.
  }

  return { terms: [...terms], keywords }
}

function matchReviewsToDishes(reviews, dishes) {
  const matches = []
  const matchedDishIds = new Set()

  // Pass 1: Exact and fuzzy name matching
  for (const review of reviews) {
    if (!review.text || review.text.length < 15) continue
    const textLower = review.text.toLowerCase()

    for (const dish of dishes) {
      const { terms } = buildDishSearchTerms(dish)

      for (const term of terms) {
        if (term.length < 3) continue
        // Word boundary check — avoid matching "rice" inside "price"
        const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i')
        if (regex.test(review.text)) {
          const snippet = extractSnippet(review.text, term, 195)
          if (snippet && snippet.length >= 15) {
            matches.push({
              dish_id: dish.id,
              dish_name: dish.name,
              review_snippet: snippet,
              author: review.author,
              rating: review.rating,
              source_term: term,
              match_type: 'name'
            })
            matchedDishIds.add(dish.id)
          }
          break
        }
      }
    }
  }

  // Pass 2: Keyword/category matching for unmatched dishes
  for (const review of reviews) {
    if (!review.text || review.text.length < 20) continue
    if (review.rating < 4) continue // Only use positive reviews for keyword matches
    const textLower = review.text.toLowerCase()

    for (const dish of dishes) {
      if (matchedDishIds.has(dish.id)) continue // Already matched by name

      const { keywords } = buildDishSearchTerms(dish)

      // Check if any food keyword from the review matches a dish keyword
      for (const [foodTerm, variants] of Object.entries(FOOD_KEYWORDS)) {
        const dishNameLower = dish.name.toLowerCase()
        // Does this food keyword relate to the dish?
        const dishHasKeyword = variants.some(v => dishNameLower.includes(v)) || dishNameLower.includes(foodTerm)
        if (!dishHasKeyword) continue

        // Does the review mention this food term?
        const reviewMentions = variants.some(v => {
          const regex = new RegExp(`\\b${escapeRegex(v)}\\b`, 'i')
          return regex.test(review.text)
        })

        if (reviewMentions) {
          const matchedVariant = variants.find(v => textLower.includes(v)) || foodTerm
          const snippet = extractSnippet(review.text, matchedVariant, 195)
          if (snippet && snippet.length >= 15) {
            matches.push({
              dish_id: dish.id,
              dish_name: dish.name,
              review_snippet: snippet,
              author: review.author,
              rating: review.rating,
              source_term: `keyword:${matchedVariant}`,
              match_type: 'keyword'
            })
            matchedDishIds.add(dish.id)
            break
          }
        }
      }
    }
  }

  // Pass 3: General positive reviews → assign to restaurant's top dish
  for (const review of reviews) {
    if (!review.text || review.text.length < 30) continue
    if (review.rating < 5) continue // Only 5-star for general assignment
    const textLower = review.text.toLowerCase()

    // Skip if review is mostly about service/atmosphere, not food
    const foodWords = ['food', 'dish', 'meal', 'ate', 'order', 'delicious', 'tasty', 'amazing', 'incredible', 'fresh', 'cooked', 'flavor', 'flavour', 'menu', 'appetizer', 'entree', 'dessert', 'breakfast', 'lunch', 'dinner']
    const hasFoodContext = foodWords.some(w => textLower.includes(w))
    if (!hasFoodContext) continue

    // Find first unmatched dish at this restaurant
    const unmatched = dishes.filter(d => !matchedDishIds.has(d.id))
    if (unmatched.length === 0) continue

    // Pick a dish — prefer dishes with food-related names
    const target = unmatched[0]
    const snippet = extractGeneralSnippet(review.text, 195)
    if (snippet && snippet.length >= 20) {
      matches.push({
        dish_id: target.id,
        dish_name: target.name,
        review_snippet: snippet,
        author: review.author,
        rating: review.rating,
        source_term: 'general:positive',
        match_type: 'general'
      })
      matchedDishIds.add(target.id)
    }
  }

  return matches
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Extract best snippet around a term mention
function extractSnippet(text, term, max) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  let bestSentence = ''

  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(term.toLowerCase())) {
      bestSentence = sentence.trim()
      break
    }
  }

  if (bestSentence && bestSentence.length <= max) {
    // Try adding next sentence
    const nextIdx = text.indexOf(bestSentence) + bestSentence.length
    const remaining = text.slice(nextIdx).trim()
    const nextMatch = remaining.match(/^([^.!?]+[.!?])/)
    if (nextMatch && (bestSentence + ' ' + nextMatch[1].trim()).length <= max) {
      return bestSentence + ' ' + nextMatch[1].trim()
    }
    return bestSentence
  }

  if (bestSentence) {
    return bestSentence.slice(0, max - 3) + '...'
  }

  // Fallback
  const idx = text.toLowerCase().indexOf(term.toLowerCase())
  if (idx === -1) return null
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, start + max)
  let snippet = text.slice(start, end).trim()
  if (start > 0) snippet = '...' + snippet
  return snippet.slice(0, max)
}

// Extract the most food-relevant sentence from a general review
function extractGeneralSnippet(text, max) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const foodWords = ['food', 'dish', 'meal', 'delicious', 'tasty', 'amazing', 'incredible', 'fresh', 'cooked', 'flavor', 'order', 'menu', 'appetizer', 'entree']

  let best = ''
  let bestScore = 0

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()
    let score = 0
    for (const w of foodWords) {
      if (lower.includes(w)) score++
    }
    if (score > bestScore && sentence.length >= 20 && sentence.length <= max) {
      best = sentence.trim()
      bestScore = score
    }
  }

  return best || null
}

// ---------------------------------------------------------------------------
// 6. Generate SQL — INSERT new votes with real review text
// ---------------------------------------------------------------------------

// Convert Google 5-star to our 10-point scale
function googleToRating10(stars) {
  const map = { 5: 9.0, 4: 7.5, 3: 5.5, 2: 3.5, 1: 2.0 }
  return map[stars] || 7.0
}

const AI_USER_ID = '00000000-0000-0000-0000-000000000000'

function generateSQL(allMatches) {
  const lines = [
    '-- Auto-generated from real Google reviews (v3 — INSERT mode)',
    '-- Inserts new ai_estimated votes with real review text',
    '-- Run in Supabase SQL Editor',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total raw matches: ${allMatches.length}`,
    '',
  ]

  // Group by dish, keep top VOTES_PER_DISH by rating
  const byDish = {}
  for (const m of allMatches) {
    if (!byDish[m.dish_id]) byDish[m.dish_id] = []
    byDish[m.dish_id].push(m)
  }

  let totalInserts = 0
  const uniqueDishes = Object.keys(byDish).length

  for (const [dishId, matches] of Object.entries(byDish)) {
    // Sort by: name matches first, then by rating desc
    matches.sort((a, b) => {
      if (a.match_type !== b.match_type) {
        const order = { name: 0, keyword: 1, general: 2 }
        return (order[a.match_type] || 3) - (order[b.match_type] || 3)
      }
      return b.rating - a.rating
    })

    // Deduplicate by snippet
    const seen = new Set()
    const unique = []
    for (const m of matches) {
      const key = m.review_snippet.slice(0, 50)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(m)
      }
    }

    const toInsert = unique.slice(0, VOTES_PER_DISH)

    for (const m of toInsert) {
      const escaped = m.review_snippet.replace(/'/g, "''")
      const authorEscaped = m.author.replace(/'/g, "''")
      const rating10 = googleToRating10(m.rating)
      const wouldOrderAgain = m.rating >= 4

      lines.push(`-- ${m.dish_name} [${m.match_type}] "${m.source_term}" by ${m.author} (${m.rating}★)`)
      lines.push(`INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, review_text, source, source_metadata)`)
      lines.push(`VALUES (`)
      lines.push(`  '${m.dish_id}',`)
      lines.push(`  '${AI_USER_ID}',`)
      lines.push(`  ${wouldOrderAgain},`)
      lines.push(`  ${rating10},`)
      lines.push(`  '${escaped}',`)
      lines.push(`  'ai_estimated',`)
      lines.push(`  '{"method":"curated","publication":"Google Reviews","author":"${authorEscaped}","google_rating":${m.rating}}'::jsonb`)
      lines.push(`);`)
      lines.push('')
      totalInserts++
    }
  }

  lines.push(`-- Summary: ${uniqueDishes} unique dishes, ${totalInserts} total INSERTs`)
  lines.push(`SELECT count(*) AS curated_reviews FROM votes WHERE source_metadata->>'method' = 'curated';`)

  return { sql: lines.join('\n'), uniqueDishes, totalInserts }
}

// ---------------------------------------------------------------------------
// 7. Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Google Reviews → Dish Matcher v2 ===\n')

  const restaurants = await getRestaurantsWithDishes()
  const withDishes = restaurants.filter(r => r.dishes.length > 0)
  console.log(`${withDishes.length} restaurants with Place IDs + dishes\n`)

  let allMatches = []
  let totalReviews = 0
  let stats = { name: 0, keyword: 0, general: 0 }

  for (const restaurant of withDishes) {
    process.stdout.write(`${restaurant.name} (${restaurant.dishes.length} dishes)... `)

    const reviews = await getGoogleReviews(restaurant.google_place_id)
    if (reviews.length === 0) {
      console.log('skip')
      await new Promise(r => setTimeout(r, 100))
      continue
    }

    totalReviews += reviews.length
    const matches = matchReviewsToDishes(reviews, restaurant.dishes)

    for (const m of matches) stats[m.match_type] = (stats[m.match_type] || 0) + 1

    allMatches = allMatches.concat(matches.map(m => ({
      ...m,
      restaurant_name: restaurant.name
    })))

    console.log(`${reviews.length} reviews → ${matches.length} matches`)
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\n=== Results ===`)
  console.log(`Reviews fetched: ${totalReviews}`)
  console.log(`Raw matches: ${allMatches.length}`)
  console.log(`  Name matches: ${stats.name || 0}`)
  console.log(`  Keyword matches: ${stats.keyword || 0}`)
  console.log(`  General positive: ${stats.general || 0}`)

  const { sql, uniqueDishes, totalInserts } = generateSQL(allMatches)
  console.log(`\nUnique dishes: ${uniqueDishes}`)
  console.log(`Total INSERTs: ${totalInserts} (up to ${VOTES_PER_DISH} per dish)`)

  const outPath = 'supabase/seed/seed-google-reviews.sql'
  writeFileSync(outPath, sql)
  console.log(`\nSQL → ${outPath}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
