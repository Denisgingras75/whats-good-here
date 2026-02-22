#!/usr/bin/env node

/**
 * Review Harvesting Pipeline for What's Good Here
 *
 * Step 1: HARVEST — pull all reviews from Google (+ Yelp when key available)
 *         Save raw to JSON with full metadata
 * Step 2: MATCH — quality-match reviews to dishes (name + strong keyword only)
 * Step 3: GENERATE — create INSERT SQL for verified matches
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/harvest-reviews.mjs harvest
 *   node scripts/harvest-reviews.mjs match
 *   node scripts/harvest-reviews.mjs generate
 *   GOOGLE_PLACES_API_KEY=xxx node scripts/harvest-reviews.mjs all   # does all 3
 *
 * Optional:
 *   YELP_API_KEY=xxx  — adds Yelp Fusion reviews (3 per restaurant)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

let envVars = {}
try {
  const envFile = readFileSync('.env.local', 'utf-8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([A-Z_]+)="?([^"\n]*)"?/)
    if (match) envVars[match[1]] = match[2].replace(/\\n$/, '')
  }
} catch {}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const GOOGLE_API_KEY = envVars.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY
const YELP_API_KEY = envVars.YELP_API_KEY || process.env.YELP_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing Supabase keys'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const RAW_FILE = 'supabase/seed/data/harvested-reviews.json'
const MATCHED_FILE = 'supabase/seed/data/matched-reviews.json'
const SQL_FILE = 'supabase/seed/seed-google-reviews.sql'

const AI_USER_ID = '00000000-0000-0000-0000-000000000000'

// MV towns to filter Martha's Vineyard restaurants only
const MV_TOWNS = ['oak bluffs', 'edgartown', 'vineyard haven', 'tisbury', 'west tisbury', 'chilmark', 'aquinnah', 'menemsha']

// ---------------------------------------------------------------------------
// STEP 1: HARVEST
// ---------------------------------------------------------------------------

async function harvest() {
  if (!GOOGLE_API_KEY) { console.error('GOOGLE_PLACES_API_KEY required for harvest'); process.exit(1) }

  console.log('=== STEP 1: HARVEST RAW REVIEWS ===\n')

  // Get all restaurants
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, google_place_id, town, address')
    .not('google_place_id', 'is', null)

  if (error) throw error

  // Filter to MV restaurants
  const mvRestaurants = restaurants.filter(r => {
    const town = (r.town || r.address || '').toLowerCase()
    return MV_TOWNS.some(t => town.includes(t)) || !r.town // include if no town (might be MV)
  })

  console.log(`Total restaurants with Place IDs: ${restaurants.length}`)
  console.log(`Martha's Vineyard restaurants: ${mvRestaurants.length}\n`)

  const allReviews = []
  let googleCount = 0
  let yelpCount = 0

  for (const restaurant of mvRestaurants) {
    process.stdout.write(`${restaurant.name}... `)

    // Google Reviews
    const googleReviews = await fetchGoogleReviews(restaurant.google_place_id)
    for (const r of googleReviews) {
      allReviews.push({
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        source: 'google',
        author: r.author,
        text: r.text,
        rating: r.rating,
        date_description: r.time, // "3 months ago", "a year ago"
        publish_time: r.publishTime || null,
        harvested_at: new Date().toISOString(),
      })
    }
    googleCount += googleReviews.length

    // Yelp Reviews (if key available)
    if (YELP_API_KEY) {
      const yelpReviews = await fetchYelpReviews(restaurant.name, restaurant.town || restaurant.address)
      for (const r of yelpReviews) {
        allReviews.push({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          source: 'yelp',
          author: r.author,
          text: r.text,
          rating: r.rating,
          date_description: r.time_created,
          publish_time: r.time_created || null,
          harvested_at: new Date().toISOString(),
        })
      }
      yelpCount += yelpReviews.length
    }

    console.log(`${googleReviews.length} Google` + (YELP_API_KEY ? ` + ${yelpCount} Yelp` : ''))
    await new Promise(r => setTimeout(r, 100))
  }

  // Save raw
  writeFileSync(RAW_FILE, JSON.stringify(allReviews, null, 2))

  console.log(`\n=== HARVEST COMPLETE ===`)
  console.log(`Google reviews: ${googleCount}`)
  console.log(`Yelp reviews: ${yelpCount}`)
  console.log(`Total raw reviews: ${allReviews.length}`)
  console.log(`Saved to ${RAW_FILE}`)

  return allReviews
}

async function fetchGoogleReviews(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'reviews'
    }
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.reviews || []).map(r => ({
    text: r.text?.text || '',
    author: r.authorAttribution?.displayName || 'Google reviewer',
    rating: r.rating || 0,
    time: r.relativePublishTimeDescription || '',
    publishTime: r.publishTime || null,
  }))
}

async function fetchYelpReviews(name, location) {
  // Yelp Fusion: search for business, then get reviews
  try {
    const searchUrl = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(name)}&location=${encodeURIComponent(location + ' Martha\'s Vineyard MA')}&limit=1`
    const searchRes = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${YELP_API_KEY}` }
    })
    if (!searchRes.ok) return []
    const searchData = await searchRes.json()
    if (!searchData.businesses?.[0]) return []

    const bizId = searchData.businesses[0].id
    const reviewsUrl = `https://api.yelp.com/v3/businesses/${bizId}/reviews?limit=3&sort_by=yelp_sort`
    const reviewsRes = await fetch(reviewsUrl, {
      headers: { 'Authorization': `Bearer ${YELP_API_KEY}` }
    })
    if (!reviewsRes.ok) return []
    const reviewsData = await reviewsRes.json()

    return (reviewsData.reviews || []).map(r => ({
      text: r.text || '',
      author: r.user?.name || 'Yelp reviewer',
      rating: r.rating || 0,
      time_created: r.time_created || '',
    }))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// STEP 2: MATCH — quality-filter and match to dishes
// ---------------------------------------------------------------------------

async function match() {
  console.log('=== STEP 2: QUALITY MATCH TO DISHES ===\n')

  // Load raw reviews
  if (!existsSync(RAW_FILE)) {
    console.error(`No raw reviews found at ${RAW_FILE}. Run harvest first.`)
    process.exit(1)
  }
  const rawReviews = JSON.parse(readFileSync(RAW_FILE, 'utf-8'))
  console.log(`Loaded ${rawReviews.length} raw reviews`)

  // Get all dishes from Supabase
  let allDishes = []
  let page = 0
  while (true) {
    const { data, error } = await supabase
      .from('dishes')
      .select('id, name, restaurant_id, category')
      .range(page * 1000, (page + 1) * 1000 - 1)
    if (error) throw error
    allDishes = allDishes.concat(data)
    if (data.length < 1000) break
    page++
  }
  console.log(`Loaded ${allDishes.length} dishes`)

  // Group dishes by restaurant
  const dishByRestaurant = {}
  for (const d of allDishes) {
    if (!dishByRestaurant[d.restaurant_id]) dishByRestaurant[d.restaurant_id] = []
    dishByRestaurant[d.restaurant_id].push(d)
  }

  const matches = []
  const stats = { name: 0, keyword: 0, rejected: 0 }

  for (const review of rawReviews) {
    if (!review.text || review.text.length < 20) { stats.rejected++; continue }

    const dishes = dishByRestaurant[review.restaurant_id] || []
    if (dishes.length === 0) continue

    const textLower = review.text.toLowerCase()

    // Pass 1: Exact dish name match
    let matched = false
    for (const dish of dishes) {
      const { terms } = buildDishSearchTerms(dish)
      for (const term of terms) {
        if (term.length < 4) continue
        const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i')
        if (regex.test(review.text)) {
          const snippet = extractSnippet(review.text, term, 195)
          if (snippet && snippet.length >= 20) {
            matches.push({
              dish_id: dish.id,
              dish_name: dish.name,
              restaurant_id: review.restaurant_id,
              restaurant_name: review.restaurant_name,
              review_snippet: snippet,
              full_review: review.text,
              author: review.author,
              rating: review.rating,
              date_description: review.date_description,
              publish_time: review.publish_time,
              source: review.source,
              match_type: 'name',
              match_term: term,
              confidence: 'high',
            })
            stats.name++
            matched = true
          }
          break
        }
      }
    }

    if (matched) continue

    // Pass 2: Strong keyword match (food term in review matches dish name)
    // Only for 4-5 star reviews
    if (review.rating < 4) { stats.rejected++; continue }

    for (const dish of dishes) {
      const dishLower = dish.name.toLowerCase()

      for (const [foodTerm, variants] of Object.entries(FOOD_KEYWORDS)) {
        const dishHasKeyword = variants.some(v => dishLower.includes(v)) || dishLower.includes(foodTerm)
        if (!dishHasKeyword) continue

        const matchedVariant = variants.find(v => {
          const regex = new RegExp(`\\b${escapeRegex(v)}\\b`, 'i')
          return regex.test(review.text)
        })

        if (matchedVariant) {
          // Quality check: does the review DESCRIBE the food? Not just mention it in passing
          const hasDescription = /delicious|amazing|incredible|fresh|perfect|best|great|excellent|outstanding|tender|crispy|flavorful|tasty|love|fantastic|superb|heavenly|divine|wonderful/i.test(review.text)
          if (!hasDescription) { stats.rejected++; break }

          const snippet = extractSnippet(review.text, matchedVariant, 195)
          if (snippet && snippet.length >= 20) {
            matches.push({
              dish_id: dish.id,
              dish_name: dish.name,
              restaurant_id: review.restaurant_id,
              restaurant_name: review.restaurant_name,
              review_snippet: snippet,
              full_review: review.text,
              author: review.author,
              rating: review.rating,
              date_description: review.date_description,
              publish_time: review.publish_time,
              source: review.source,
              match_type: 'keyword',
              match_term: matchedVariant,
              confidence: 'medium',
            })
            stats.keyword++
            matched = true
          }
          break
        }
      }
      if (matched) break
    }

    if (!matched) stats.rejected++
  }

  // Deduplicate: best match per dish (prefer name > keyword, then highest rating)
  const byDish = {}
  for (const m of matches) {
    if (!byDish[m.dish_id]) byDish[m.dish_id] = []
    byDish[m.dish_id].push(m)
  }

  // Keep up to 3 per dish, prioritized
  const finalMatches = []
  for (const [dishId, dishMatches] of Object.entries(byDish)) {
    dishMatches.sort((a, b) => {
      if (a.match_type !== b.match_type) return a.match_type === 'name' ? -1 : 1
      return b.rating - a.rating
    })

    // Deduplicate snippets
    const seen = new Set()
    let count = 0
    for (const m of dishMatches) {
      const key = m.review_snippet.slice(0, 40)
      if (seen.has(key)) continue
      seen.add(key)
      finalMatches.push(m)
      count++
      if (count >= 3) break
    }
  }

  writeFileSync(MATCHED_FILE, JSON.stringify(finalMatches, null, 2))

  console.log(`\n=== MATCH RESULTS ===`)
  console.log(`Name matches: ${stats.name}`)
  console.log(`Keyword matches: ${stats.keyword}`)
  console.log(`Rejected (low quality / no match): ${stats.rejected}`)
  console.log(`Final verified matches: ${finalMatches.length}`)
  console.log(`Unique dishes covered: ${Object.keys(byDish).length}`)
  console.log(`Saved to ${MATCHED_FILE}`)

  return finalMatches
}

// ---------------------------------------------------------------------------
// STEP 3: GENERATE SQL
// ---------------------------------------------------------------------------

function generate() {
  console.log('=== STEP 3: GENERATE SQL ===\n')

  if (!existsSync(MATCHED_FILE)) {
    console.error(`No matched reviews at ${MATCHED_FILE}. Run match first.`)
    process.exit(1)
  }
  const matches = JSON.parse(readFileSync(MATCHED_FILE, 'utf-8'))
  console.log(`Loaded ${matches.length} verified matches`)

  const lines = [
    '-- Real reviews from Google (+ Yelp) matched to dishes',
    '-- Quality-filtered: name matches + strong keyword matches only',
    '-- Each review includes real author name, date, and source',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total inserts: ${matches.length}`,
    '',
  ]

  let inserted = 0
  for (const m of matches) {
    const escaped = m.review_snippet.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().replace(/'/g, "''")
    const authorEscaped = (m.author || 'Reviewer').replace(/'/g, "''")
    const rating10 = googleToRating10(m.rating)
    const wouldOrderAgain = m.rating >= 4
    const dateDesc = (m.date_description || '').replace(/'/g, "''")
    const source = (m.source || 'google').replace(/'/g, "''")

    lines.push(`-- ${m.restaurant_name} → ${m.dish_name} [${m.match_type}:${m.match_term}]`)
    lines.push(`-- "${escaped.slice(0, 60)}..." — ${m.author} (${m.rating}★, ${m.date_description || 'recent'})`)
    lines.push(`INSERT INTO votes (dish_id, user_id, would_order_again, rating_10, review_text, review_created_at, source, source_metadata)`)
    lines.push(`VALUES (`)
    lines.push(`  '${m.dish_id}',`)
    lines.push(`  '${AI_USER_ID}',`)
    lines.push(`  ${wouldOrderAgain},`)
    lines.push(`  ${rating10},`)
    lines.push(`  '${escaped}',`)
    // Use publish_time if available, otherwise NOW()
    if (m.publish_time) {
      lines.push(`  '${m.publish_time}'::timestamptz,`)
    } else {
      lines.push(`  NOW() - INTERVAL '${dateDescToInterval(m.date_description)}',`)
    }
    lines.push(`  'ai_estimated',`)
    lines.push(`  '${JSON.stringify({
      method: 'curated',
      publication: source === 'yelp' ? 'Yelp' : 'Google Reviews',
      author: m.author,
      google_rating: m.rating,
      date: m.date_description || null,
      match_type: m.match_type,
      match_term: m.match_term,
    }).replace(/'/g, "''")}'::jsonb`)
    lines.push(`);`)
    lines.push('')
    inserted++
  }

  lines.push(`-- Total: ${inserted} reviews inserted`)
  lines.push(`SELECT count(*) AS curated_reviews FROM votes WHERE source_metadata->>'method' = 'curated';`)

  const sql = lines.join('\n')
  writeFileSync(SQL_FILE, sql)

  console.log(`Generated ${inserted} INSERT statements`)
  console.log(`SQL → ${SQL_FILE}`)

  return sql
}

function googleToRating10(stars) {
  const map = { 5: 9.0, 4: 7.5, 3: 5.5, 2: 3.5, 1: 2.0 }
  return map[stars] || 7.0
}

function dateDescToInterval(desc) {
  if (!desc) return '30 days'
  const d = desc.toLowerCase()
  if (d.includes('week')) return d.match(/(\d+)/)?.[1] + ' weeks' || '1 week'
  if (d.includes('month')) return d.match(/(\d+)/)?.[1] + ' months' || '1 month'
  if (d.includes('year')) return d.match(/(\d+)/)?.[1] + ' years' || '1 year'
  if (d.includes('day')) return d.match(/(\d+)/)?.[1] + ' days' || '7 days'
  return '30 days'
}

// ---------------------------------------------------------------------------
// Search terms + matching helpers (same as v2 but tighter)
// ---------------------------------------------------------------------------

const FOOD_KEYWORDS = {
  'lobster': ['lobster'],
  'lobster roll': ['lobster roll'],
  'scallop': ['scallop', 'scallops'],
  'shrimp': ['shrimp'],
  'clam': ['clam', 'clams'],
  'oyster': ['oyster', 'oysters'],
  'crab': ['crab'],
  'crab cake': ['crab cake', 'crab cakes'],
  'cod': ['cod', 'codfish'],
  'salmon': ['salmon'],
  'tuna': ['tuna'],
  'swordfish': ['swordfish'],
  'halibut': ['halibut'],
  'mussel': ['mussel', 'mussels'],
  'calamari': ['calamari'],
  'steak': ['steak', 'filet', 'ribeye'],
  'burger': ['burger'],
  'chicken': ['chicken'],
  'pork': ['pork', 'pork chop', 'pork belly'],
  'duck': ['duck'],
  'lamb': ['lamb'],
  'ribs': ['ribs', 'short rib'],
  'pizza': ['pizza'],
  'pasta': ['pasta', 'linguine', 'rigatoni', 'gnocchi', 'ravioli'],
  'risotto': ['risotto'],
  'taco': ['taco', 'tacos'],
  'sandwich': ['sandwich'],
  'banh mi': ['banh mi'],
  'chowder': ['chowder'],
  'bisque': ['bisque'],
  'fish and chips': ['fish and chips', 'fish & chips'],
  'wings': ['wings'],
  'pancake': ['pancake', 'pancakes'],
  'french toast': ['french toast'],
  'benedict': ['benedict'],
  'donut': ['donut', 'doughnut'],
  'ice cream': ['ice cream'],
}

function buildDishSearchTerms(dish) {
  const name = dish.name.toLowerCase()
  const terms = new Set()
  terms.add(name)

  const noParen = name.replace(/\s*\(.*?\)\s*/g, ' ').trim()
  if (noParen !== name && noParen.length > 3) terms.add(noParen)

  const stripped = name
    .replace(/^(new england|martha's vineyard|mv|classic|our famous|house|traditional|crispy|grilled|fried|pan seared|pan roasted|roasted|baked|broiled|sautéed|sauteed|steamed|blackened|smoked|fresh|hot|cold|jumbo)\s+/gi, '')
    .trim()
  if (stripped !== name && stripped.length > 3) terms.add(stripped)

  const words = name.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'with', 'our', 'a', 'of'].includes(w))
  if (words.length >= 2) {
    terms.add(words.slice(-2).join(' '))
  }

  return { terms: [...terms] }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSnippet(text, term, max) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  let best = ''
  for (const s of sentences) {
    if (s.toLowerCase().includes(term.toLowerCase())) { best = s.trim(); break }
  }
  if (best && best.length <= max) {
    const nextIdx = text.indexOf(best) + best.length
    const remaining = text.slice(nextIdx).trim()
    const nextMatch = remaining.match(/^([^.!?]+[.!?])/)
    if (nextMatch && (best + ' ' + nextMatch[1].trim()).length <= max) {
      return best + ' ' + nextMatch[1].trim()
    }
    return best
  }
  if (best) return best.slice(0, max - 3) + '...'
  return null
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const command = process.argv[2] || 'all'

async function main() {
  if (command === 'harvest' || command === 'all') {
    await harvest()
    console.log('')
  }
  if (command === 'match' || command === 'all') {
    await match()
    console.log('')
  }
  if (command === 'generate' || command === 'all') {
    generate()
  }

  if (!['harvest', 'match', 'generate', 'all'].includes(command)) {
    console.log('Usage: node scripts/harvest-reviews.mjs [harvest|match|generate|all]')
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
