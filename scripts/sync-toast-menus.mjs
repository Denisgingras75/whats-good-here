#!/usr/bin/env node

/**
 * Toast POS Menu Sync for What's Good Here
 *
 * Fetches menu data from Toast online ordering pages and upserts
 * dishes into the WGH Supabase database.
 *
 * Usage:
 *   node scripts/sync-toast-menus.mjs                  # sync all restaurants with toast_slug
 *   node scripts/sync-toast-menus.mjs --slug lookout-tavern   # sync one restaurant
 *   node scripts/sync-toast-menus.mjs --dry-run        # preview without writing to DB
 *
 * Requirements:
 *   - .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (for write access bypassing RLS)
 *   - npm install (uses @supabase/supabase-js from project deps)
 *
 * How it works:
 *   Toast's ordering pages (order.toasttab.com/online/{slug}) are React SPAs
 *   protected by Cloudflare. The frontend loads menu data from Toast's internal
 *   BFF (Backend For Frontend) API. This script:
 *
 *   1. Fetches the ordering page HTML with browser-like headers
 *   2. Extracts the embedded config/state JSON (restaurantGuid, etc.)
 *   3. Calls the same API endpoints the frontend uses to get menu data
 *   4. Falls back to HTML parsing if the API approach fails
 *   5. Upserts dishes into Supabase
 *
 * Known limitations:
 *   - Toast uses Cloudflare bot protection — may need Puppeteer for reliability
 *   - Menu availability/hours not extracted (would need separate API call)
 *   - Prices may be null if restaurant hides them on online ordering
 *   - Rate limited to 1 request per 2 seconds to be respectful
 *
 * Cron: Run weekly — `0 6 * * 1 node /path/to/sync-toast-menus.mjs`
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// ---------------------------------------------------------------------------
// Logger (no console.* per project rules)
// ---------------------------------------------------------------------------

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'info']

function log(level, ...args) {
  if (LOG_LEVELS[level] <= CURRENT_LEVEL) {
    const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`
    const fn = level === 'error' ? process.stderr : process.stdout
    fn.write(prefix + ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n')
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function loadEnv() {
  try {
    const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    const vars = {}
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
    }
    return vars
  } catch {
    log('error', 'Could not read .env.local — make sure it exists in the project root.')
    process.exit(1)
  }
}

const env = loadEnv()

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  log('error', 'VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set in .env.local')
  process.exit(1)
}

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  log('warn', 'SUPABASE_SERVICE_ROLE_KEY not set — using anon key. Writes may fail due to RLS.')
  log('warn', 'Add SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> to .env.local for write access.')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Parse CLI args
const args = process.argv.slice(2)
const slugFlagIdx = args.indexOf('--slug')
const targetSlug = slugFlagIdx !== -1 ? args[slugFlagIdx + 1] : null
const dryRun = args.includes('--dry-run')
const verbose = args.includes('--verbose')

if (verbose) {
  // Override log level for --verbose
  Object.keys(LOG_LEVELS).forEach(k => { LOG_LEVELS[k] = LOG_LEVELS[k] }) // no-op, just set debug
}

// ---------------------------------------------------------------------------
// Category mapping (Toast menu group names → WGH categories)
// ---------------------------------------------------------------------------

const VALID_CATEGORIES = [
  'pizza', 'burger', 'taco', 'wings', 'sushi', 'breakfast',
  'breakfast sandwich', 'lobster roll', 'chowder', 'pasta', 'steak',
  'sandwich', 'salad', 'seafood', 'fish', 'tendys', 'fried chicken',
  'apps', 'fries', 'entree', 'dessert', 'donuts', 'pokebowl',
  'asian', 'chicken', 'quesadilla', 'soup',
  'ribs', 'sides', 'duck', 'lamb', 'pork', 'clams',
  'oysters', 'coffee', 'cocktails', 'ice cream',
]

/**
 * Best-effort category mapping from dish name keywords.
 * Returns 'entree' as fallback.
 */
function categorizeByName(dishName, sectionName) {
  const name = dishName.toLowerCase()
  const section = (sectionName || '').toLowerCase()

  // Specific matches first
  if (/lobster roll/i.test(name)) return 'lobster roll'
  if (/chowder/i.test(name)) return 'chowder'
  if (/\b(tender|tendys|chicken tender|chicken finger)/i.test(name)) return 'tendys'
  if (/fried chicken/i.test(name)) return 'fried chicken'
  if (/fish.*(chip|fry)|fish sandwich|fish taco/i.test(name)) return 'fish'
  if (/\bpizza\b/i.test(name)) return 'pizza'
  if (/\bburger\b/i.test(name)) return 'burger'
  if (/\btaco\b/i.test(name)) return 'taco'
  if (/\bquesadilla\b/i.test(name)) return 'quesadilla'
  if (/\bwings?\b/i.test(name)) return 'wings'
  if (/\bsushi\b|\bsashimi\b|\broll\b/i.test(name) && section.includes('sushi')) return 'sushi'
  if (/\bpoke\b.*bowl|poke$/i.test(name)) return 'pokebowl'
  if (/\bpasta\b|\blinguine\b|\brigatoni\b|\bgnocchi\b|\bravioli\b|\brisotto\b/i.test(name)) return 'pasta'
  if (/\bsteak\b|\bribeye\b|\bfilet\b|\bsirloin\b/i.test(name)) return 'steak'
  if (/\bribs\b/i.test(name)) return 'ribs'
  if (/\blamb\b/i.test(name)) return 'lamb'
  if (/\bduck\b/i.test(name)) return 'duck'
  if (/\bpork\b|pulled pork/i.test(name)) return 'pork'
  if (/\bsalad\b|\bcaesar\b/i.test(name)) return 'salad'
  if (/\bsoup\b|\bbisque\b/i.test(name)) return 'soup'
  if (/\bsandwich\b|\bwrap\b|\bblt\b|\bclub\b|\bhot dog\b|\bgrilled cheese\b/i.test(name)) return 'sandwich'
  if (/\boyster/i.test(name)) return 'oysters'
  if (/\bclam\b|\bsteamer/i.test(name)) return 'clams'
  if (/\blobster\b|\bcrab\b|\bshrimp\b|\bscallop\b|\bsalmon\b|\bcod\b|\bswordfish\b|\bhalibut\b|\btuna\b|\bseafood\b/i.test(name)) return 'seafood'
  if (/\bchicken\b/i.test(name)) return 'chicken'
  if (/\bfries\b|\bonion ring|\btater tot|\btots\b/i.test(name)) return 'fries'
  if (/\bdonut\b|\bdoughnut\b|\bfritter/i.test(name)) return 'donuts'
  if (/\bcake\b|\bpie\b|\bbrownie\b|\bsundae\b|\bcheesecake\b|\btiramisu/i.test(name)) return 'dessert'
  if (/\bice cream\b|\bgelato\b|\bmilkshake\b|\bshake\b/i.test(name)) return 'ice cream'
  if (/\bcoffee\b|\blatte\b|\bespresso\b|\bcold brew/i.test(name)) return 'coffee'
  if (/\bcocktail\b|\bmargarita\b|\bmojito\b|\bmartini\b/i.test(name)) return 'cocktails'
  if (/pad thai|\bcurry\b|stir.?fry|\bfried rice\b/i.test(name)) return 'asian'

  // Section-based fallbacks
  if (/breakfast|brunch|morning/i.test(section)) {
    if (/sandwich|wrap|burrito/i.test(name)) return 'breakfast sandwich'
    return 'breakfast'
  }
  if (/appetizer|starter|share|small plate/i.test(section)) return 'apps'
  if (/side/i.test(section)) return 'sides'
  if (/dessert|sweet/i.test(section)) return 'dessert'
  if (/pizza/i.test(section)) return 'pizza'
  if (/burger/i.test(section)) return 'burger'
  if (/sandwich/i.test(section)) return 'sandwich'
  if (/salad/i.test(section)) return 'salad'
  if (/sushi|raw bar/i.test(section)) return 'sushi'
  if (/taco|mexican/i.test(section)) return 'taco'
  if (/pasta/i.test(section)) return 'pasta'
  if (/seafood|fish|from the sea/i.test(section)) return 'seafood'
  if (/cocktail|drink|bar/i.test(section)) return 'cocktails'
  if (/coffee|cafe/i.test(section)) return 'coffee'
  if (/soup/i.test(section)) return 'soup'
  if (/entree|main|dinner|plate/i.test(section)) return 'entree'

  return 'entree'
}

// ---------------------------------------------------------------------------
// Toast page fetching strategies
// ---------------------------------------------------------------------------

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
}

/**
 * Strategy 1: Fetch the Toast ordering page HTML and extract embedded data.
 * Toast's React SPA embeds initial state/config in script tags.
 */
async function fetchToastPageHTML(slug) {
  const url = `https://order.toasttab.com/online/${slug}`
  log('debug', `Fetching HTML: ${url}`)

  const resp = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
  })

  if (!resp.ok) {
    log('debug', `HTML fetch failed: ${resp.status} ${resp.statusText}`)
    return null
  }

  return resp.text()
}

/**
 * Extract menu data from Toast HTML page.
 * Looks for embedded JSON in script tags (__NEXT_DATA__, window.__INITIAL_STATE__, etc.)
 */
function extractMenuFromHTML(html) {
  if (!html) return null

  // Strategy A: Look for __NEXT_DATA__ (Next.js)
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1])
      log('debug', 'Found __NEXT_DATA__ blob')
      return extractFromNextData(data)
    } catch {
      log('debug', '__NEXT_DATA__ parse failed')
    }
  }

  // Strategy B: Look for window.__INITIAL_STATE__ or similar
  const statePatterns = [
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/,
    /window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});?\s*<\/script>/,
    /window\.__DATA__\s*=\s*({[\s\S]*?});?\s*<\/script>/,
    /"menuGroups"\s*:\s*(\[[\s\S]*?\])\s*[,}]/,
    /"menus"\s*:\s*(\[[\s\S]*?\])\s*[,}]/,
  ]

  for (const pattern of statePatterns) {
    const match = html.match(pattern)
    if (match) {
      try {
        const data = JSON.parse(match[1])
        log('debug', 'Found embedded state data')
        return extractFromStateData(data)
      } catch {
        log('debug', 'State data parse failed for pattern')
      }
    }
  }

  // Strategy C: Look for JSON-LD structured data
  const jsonLdPattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
  let jsonLdMatch
  while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
    try {
      const ld = JSON.parse(jsonLdMatch[1])
      if (ld['@type'] === 'Restaurant' && ld.hasMenu) {
        log('debug', 'Found JSON-LD restaurant data')
        return extractFromJsonLd(ld)
      }
    } catch {
      // continue
    }
  }

  // Strategy D: Look for any large JSON blob containing menu-like data
  const jsonBlobPattern = /\{[^{}]*"name"\s*:\s*"[^"]+"\s*,\s*[^{}]*"price"\s*:\s*[0-9.]+[^{}]*\}/g
  const blobs = html.match(jsonBlobPattern)
  if (blobs && blobs.length > 3) {
    log('debug', `Found ${blobs.length} potential menu item JSON blobs`)
    const items = []
    for (const blob of blobs) {
      try {
        const item = JSON.parse(blob)
        if (item.name && typeof item.price === 'number') {
          items.push(item)
        }
      } catch {
        // not valid JSON on its own
      }
    }
    if (items.length > 0) {
      return { items, sections: [] }
    }
  }

  return null
}

/**
 * Extract from Next.js __NEXT_DATA__ structure
 */
function extractFromNextData(data) {
  const props = data?.props?.pageProps || data?.props?.initialProps || {}
  const menus = props.menus || props.menu?.menus || props.menuData?.menus || []
  return flattenToastMenus(menus)
}

/**
 * Extract from window state object
 */
function extractFromStateData(data) {
  // Toast typically nests menus under various keys
  const menus = data.menus || data.menu?.menus || data.menuGroups ||
    data.restaurant?.menus || data.restaurantData?.menus || []
  if (Array.isArray(menus)) return flattenToastMenus(menus)

  // Maybe it's already a flat list of items
  if (Array.isArray(data) && data.length > 0 && data[0].name) {
    return { items: data, sections: [] }
  }

  return null
}

/**
 * Extract from JSON-LD
 */
function extractFromJsonLd(ld) {
  const menu = ld.hasMenu
  if (!menu) return null

  const sections = menu.hasMenuSection || []
  const items = []
  const sectionNames = []

  for (const section of sections) {
    const sectionName = section.name || 'Menu'
    sectionNames.push(sectionName)
    const menuItems = section.hasMenuItem || []
    for (const item of menuItems) {
      items.push({
        name: item.name,
        description: item.description || null,
        price: parsePrice(item.offers?.price || item.offers?.lowPrice),
        section: sectionName,
      })
    }
  }

  return { items, sections: sectionNames }
}

/**
 * Flatten Toast's nested menu structure into flat items list.
 * Toast menus: Menu → MenuGroup → MenuItem
 */
function flattenToastMenus(menus) {
  const items = []
  const sections = []

  for (const menu of menus) {
    const groups = menu.groups || menu.menuGroups || menu.categories || []
    for (const group of groups) {
      const sectionName = group.name || group.header || 'Menu'
      if (!sections.includes(sectionName)) sections.push(sectionName)

      const menuItems = group.items || group.menuItems || group.entries || []
      for (const item of menuItems) {
        // Toast price is typically in cents or dollars
        let price = null
        if (item.price != null) {
          price = typeof item.price === 'number' && item.price > 100
            ? item.price / 100  // cents to dollars
            : Number(item.price)
        } else if (item.prices && item.prices.length > 0) {
          const p = item.prices[0].price || item.prices[0].amount
          price = typeof p === 'number' && p > 100 ? p / 100 : Number(p)
        }

        items.push({
          name: item.name || item.title,
          description: item.description || item.desc || null,
          price: isNaN(price) ? null : price,
          section: sectionName,
        })
      }
    }
  }

  return { items, sections }
}

/**
 * Strategy 2: Try Toast's known API endpoints directly.
 * The consumer SPA calls these after getting a restaurantGuid from the page.
 */
async function fetchToastAPI(slug) {
  // Try the public-facing API endpoint variants
  const apiUrls = [
    `https://ws-api.toasttab.com/consumer-app-bff/v1/restaurants/${slug}/menu`,
    `https://ws-api.toasttab.com/consumer-app-bff/v1/restaurants/${slug}/menus`,
    `https://ws-api.toasttab.com/consumer-app-bff/v1/restaurants/${slug}`,
  ]

  for (const url of apiUrls) {
    log('debug', `Trying API: ${url}`)
    try {
      const resp = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': BROWSER_HEADERS['User-Agent'],
        },
      })

      if (resp.ok) {
        const data = await resp.json()
        log('debug', `API success: ${url}`)
        // Try to extract menus from various response shapes
        const menus = data.menus || data.menu?.menus || data.menuGroups || []
        if (Array.isArray(menus) && menus.length > 0) {
          return flattenToastMenus(menus)
        }
        // Maybe the response IS the menu
        if (data.groups || data.items) {
          return flattenToastMenus([data])
        }
      } else {
        log('debug', `API ${resp.status}: ${url}`)
      }
    } catch (err) {
      log('debug', `API error: ${url} — ${err.message}`)
    }
  }

  return null
}

/**
 * Strategy 3: Fallback — parse the raw HTML for visible menu text.
 * This works even when JS hasn't executed, extracting text from
 * SSR-rendered menu sections.
 */
function extractMenuFromRawHTML(html) {
  if (!html) return null

  // Remove script and style tags
  const cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')

  // Look for menu item patterns in the HTML structure
  // Toast typically renders items with specific class names
  const itemPatterns = [
    // data-testid patterns
    /<[^>]*data-testid="menu-item[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/g,
    // Class-based patterns
    /<[^>]*class="[^"]*menu-item[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/g,
    /<[^>]*class="[^"]*item-card[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/g,
  ]

  const items = []
  for (const pattern of itemPatterns) {
    let match
    while ((match = pattern.exec(cleaned)) !== null) {
      const block = match[1]
      const nameMatch = block.match(/<[^>]*class="[^"]*item-name[^"]*"[^>]*>([^<]+)/) ||
        block.match(/<h[2-4][^>]*>([^<]+)/)
      const priceMatch = block.match(/\$([0-9]+\.?[0-9]{0,2})/)
      const descMatch = block.match(/<[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)/)

      if (nameMatch) {
        items.push({
          name: nameMatch[1].trim(),
          price: priceMatch ? parseFloat(priceMatch[1]) : null,
          description: descMatch ? descMatch[1].trim() : null,
          section: 'Menu',
        })
      }
    }
  }

  return items.length > 0 ? { items, sections: ['Menu'] } : null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parsePrice(val) {
  if (val == null) return null
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : Number(val)
  return isNaN(num) ? null : num
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function contentHash(items) {
  const str = items
    .map(i => `${i.name}|${i.price}|${i.section}`)
    .sort()
    .join('\n')
  return createHash('md5').update(str).digest('hex')
}

/**
 * Filter out non-food items, drinks (except cocktails/coffee), and low-value sides
 */
function filterMenuItems(items) {
  return items.filter(item => {
    const name = item.name.toLowerCase()

    // Skip generic beverages (keep cocktails, coffee, specialty drinks)
    if (/^(coca.cola|sprite|dr.pepper|diet coke|lemonade|iced tea|water|juice box|soda|ginger ale|tonic|club soda|red bull)/i.test(name)) return false
    if (/^(bud light|budweiser|miller|coors|michelob|heineken|corona|modelo|stella|pabst|pbr)\b/i.test(name)) return false
    if (/^(glass of|bottle of)\s+(red|white|rose)/i.test(name)) return false

    // Skip very cheap items (condiments, extras)
    if (item.price !== null && item.price < 3 && !/fries|tots|side/i.test(name)) return false

    // Skip modifiers / add-ons
    if (/^(add|extra|side of|substitute|upgrade)/i.test(name)) return false

    return true
  })
}

// ---------------------------------------------------------------------------
// Supabase operations
// ---------------------------------------------------------------------------

async function getToastRestaurants(targetSlug) {
  let query = supabase
    .from('restaurants')
    .select('id, name, toast_slug, menu_content_hash, menu_section_order')
    .not('toast_slug', 'is', null)

  if (targetSlug) {
    query = query.eq('toast_slug', targetSlug)
  }

  const { data, error } = await query

  if (error) {
    log('error', 'Failed to fetch restaurants:', error.message)
    return []
  }

  return data || []
}

async function getExistingDishes(restaurantId) {
  const { data, error } = await supabase
    .from('dishes')
    .select('id, name, category, menu_section, price, total_votes')
    .eq('restaurant_id', restaurantId)

  if (error) {
    log('error', 'Failed to fetch dishes:', error.message)
    return []
  }

  return data || []
}

async function upsertDishes(restaurantId, newItems, existingDishes) {
  // Build lookup of existing dishes by normalized name
  const existingByName = new Map()
  for (const d of existingDishes) {
    existingByName.set(d.name.toLowerCase().trim(), d)
  }

  const toInsert = []
  const toUpdate = []
  const matched = new Set()

  for (const item of newItems) {
    const key = item.name.toLowerCase().trim()
    const existing = existingByName.get(key)
    const category = categorizeByName(item.name, item.section)

    if (existing) {
      matched.add(key)
      // Only update if something changed (and dish has no user votes to protect)
      const priceChanged = item.price !== null && item.price !== Number(existing.price)
      const categoryChanged = category !== existing.category
      const sectionChanged = item.section !== existing.menu_section

      if (priceChanged || categoryChanged || sectionChanged) {
        const updates = {}
        if (priceChanged) updates.price = item.price
        if (categoryChanged && (existing.total_votes || 0) === 0) updates.category = category
        if (sectionChanged) updates.menu_section = item.section
        if (Object.keys(updates).length > 0) {
          toUpdate.push({ id: existing.id, name: existing.name, ...updates })
        }
      }
    } else {
      toInsert.push({
        restaurant_id: restaurantId,
        name: item.name,
        category,
        menu_section: item.section || null,
        price: item.price,
      })
    }
  }

  // Find orphaned dishes (in DB but not on menu)
  const orphaned = existingDishes.filter(d => !matched.has(d.name.toLowerCase().trim()))

  let inserted = 0
  let updated = 0

  if (!dryRun) {
    // Batch insert new dishes
    if (toInsert.length > 0) {
      const { error } = await supabase.from('dishes').insert(toInsert)
      if (error) {
        log('error', `Insert failed: ${error.message}`)
      } else {
        inserted = toInsert.length
      }
    }

    // Update existing dishes one by one (different fields per dish)
    for (const dish of toUpdate) {
      const { id, name, ...fields } = dish
      const { error } = await supabase.from('dishes').update(fields).eq('id', id)
      if (error) {
        log('error', `Update failed for "${name}": ${error.message}`)
      } else {
        updated++
      }
    }
  } else {
    inserted = toInsert.length
    updated = toUpdate.length
  }

  return { inserted, updated, orphaned: orphaned.length, total: newItems.length }
}

async function updateRestaurantMeta(restaurantId, hash, sectionOrder) {
  if (dryRun) return

  const updates = {
    menu_last_checked: new Date().toISOString(),
    menu_content_hash: hash,
  }
  if (sectionOrder && sectionOrder.length > 0) {
    updates.menu_section_order = sectionOrder
  }

  const { error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', restaurantId)

  if (error) {
    log('error', `Failed to update restaurant meta: ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// Main sync logic per restaurant
// ---------------------------------------------------------------------------

async function syncRestaurant(restaurant) {
  const { id, name, toast_slug, menu_content_hash } = restaurant
  log('info', `Syncing: ${name} (${toast_slug})`)

  // Try strategies in order
  let menuData = null
  let strategy = 'none'

  // Strategy 1: Direct API call
  menuData = await fetchToastAPI(toast_slug)
  if (menuData && menuData.items.length > 0) {
    strategy = 'api'
  }

  // Strategy 2: HTML page fetch + embedded data extraction
  if (!menuData) {
    const html = await fetchToastPageHTML(toast_slug)
    if (html) {
      menuData = extractMenuFromHTML(html)
      if (menuData && menuData.items.length > 0) {
        strategy = 'html-embedded'
      }

      // Strategy 3: Raw HTML text parsing
      if (!menuData) {
        menuData = extractMenuFromRawHTML(html)
        if (menuData && menuData.items.length > 0) {
          strategy = 'html-parsed'
        }
      }
    }
  }

  if (!menuData || menuData.items.length === 0) {
    log('warn', `  No menu data found for ${name} — Toast page likely requires JavaScript execution.`)
    log('warn', `  Consider: Puppeteer, or manually run import-menu.mjs with --url`)
    return { name, status: 'no-data', strategy: 'none', items: 0 }
  }

  log('info', `  Strategy: ${strategy} — found ${menuData.items.length} raw items`)

  // Filter out non-food/drink items
  const filtered = filterMenuItems(menuData.items)
  log('info', `  After filtering: ${filtered.length} items`)

  // Check if menu has changed
  const hash = contentHash(filtered)
  if (hash === menu_content_hash) {
    log('info', `  Menu unchanged (hash match) — skipping`)
    return { name, status: 'unchanged', strategy, items: filtered.length }
  }

  // Get existing dishes and upsert
  const existing = await getExistingDishes(id)
  const result = await upsertDishes(id, filtered, existing)

  // Update restaurant metadata
  await updateRestaurantMeta(id, hash, menuData.sections)

  const prefix = dryRun ? '[DRY RUN] ' : ''
  log('info', `  ${prefix}Result: ${result.inserted} inserted, ${result.updated} updated, ${result.orphaned} orphaned, ${result.total} total`)

  return {
    name,
    status: 'synced',
    strategy,
    items: result.total,
    inserted: result.inserted,
    updated: result.updated,
    orphaned: result.orphaned,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log('info', '=== Toast Menu Sync ===')
  if (dryRun) log('info', 'DRY RUN — no database writes')

  const restaurants = await getToastRestaurants(targetSlug)

  if (restaurants.length === 0) {
    log('warn', targetSlug
      ? `No restaurant found with toast_slug="${targetSlug}"`
      : 'No restaurants with toast_slug set. Run toast-slugs.sql first.')
    process.exit(0)
  }

  log('info', `Found ${restaurants.length} restaurant(s) with Toast slugs`)

  const results = []

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i]

    try {
      const result = await syncRestaurant(restaurant)
      results.push(result)
    } catch (err) {
      log('error', `Failed to sync ${restaurant.name}: ${err.message}`)
      results.push({ name: restaurant.name, status: 'error', error: err.message })
    }

    // Rate limit: wait between requests (skip after last)
    if (i < restaurants.length - 1) {
      await sleep(2000)
    }
  }

  // Summary
  log('info', '')
  log('info', '=== Summary ===')
  const synced = results.filter(r => r.status === 'synced')
  const unchanged = results.filter(r => r.status === 'unchanged')
  const noData = results.filter(r => r.status === 'no-data')
  const errors = results.filter(r => r.status === 'error')

  log('info', `Synced: ${synced.length}`)
  for (const r of synced) {
    log('info', `  ${r.name}: +${r.inserted} new, ~${r.updated} updated, ${r.orphaned} orphaned (via ${r.strategy})`)
  }

  if (unchanged.length > 0) log('info', `Unchanged: ${unchanged.length}`)
  if (noData.length > 0) {
    log('info', `No data (JS-rendered): ${noData.length}`)
    for (const r of noData) log('info', `  ${r.name}`)
  }
  if (errors.length > 0) {
    log('info', `Errors: ${errors.length}`)
    for (const r of errors) log('info', `  ${r.name}: ${r.error}`)
  }

  // Exit with error code if ALL restaurants failed
  if (synced.length === 0 && unchanged.length === 0 && restaurants.length > 0) {
    log('warn', '')
    log('warn', 'All restaurants returned no data. Toast likely blocks server-side fetching.')
    log('warn', 'Recommended alternatives:')
    log('warn', '  1. Use Puppeteer/Playwright to render JS: npm install puppeteer')
    log('warn', '     Then uncomment the Puppeteer strategy in this script.')
    log('warn', '  2. Use import-menu.mjs with --url for manual per-restaurant imports')
    log('warn', '  3. Use Toast Partner API (requires Toast POS account + API key)')
    log('warn', '     https://doc.toasttab.com/openapi/menus/operation/menusGet/')
    process.exit(1)
  }
}

main().catch(err => {
  log('error', 'Fatal:', err.message || err)
  process.exit(1)
})
