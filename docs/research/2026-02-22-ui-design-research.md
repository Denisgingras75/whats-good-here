# UI Design Research: Food Discovery, Maps, Cross-Generational Design, and Timeless Principles

**Date:** February 22, 2026
**Purpose:** Specific design principles, measurements, and references to guide the WGH redesign. Not generic advice -- actionable specifics with real examples.

---

## 1. BEST FOOD DISCOVERY APP UIs (2024-2026)

### The Standout Apps and What They Do Differently

**Beli** -- The breakout food discovery app of 2024-2025. 80% of users are under 35. 30 million reviews logged in 2024 alone.
- Uses **comparison-based rating** instead of direct scoring. You don't rate 1-10; you compare a new spot against your existing list. The algorithm assigns the number. This removes the "what does a 7 even mean?" problem.
- **5 food category icons** (Restaurants, Bars, Bakeries, Coffee & Tea, Ice Cream & Dessert) used consistently throughout the app. Icons replace text labels -- reduces cognitive load.
- **Taste similarity score** between friends. Every friend connection shows a % match. This turns the social graph into a recommendation engine.
- **Leaderboards** -- gamified discovery where users compete on how many unique spots they've logged. Streaks keep people coming back.
- **UX criticism:** Onboarding is too long. Requires filling out extensive food preferences AND inviting 4 friends before you can proceed. Friend profiles are only accessible through feed, search, or leaderboard -- no dedicated social tab.
- Source: [Design Critique: Beli App - IXD@Pratt](https://ixd.prattsi.org/2024/09/design-critique-beli-app/), [Beli App Gamifies Dining - WebProNews](https://www.webpronews.com/beli-app-gamifies-dining-to-attract-gen-z-and-challenge-yelp/)

**The Infatuation** -- Clean, opinionated, memorable design.
- **One typeface (National 2) used relentlessly.** Consistency across every touchpoint compounds into trust.
- **Blue as a food brand color** -- unusual, therefore memorable. Every other food app uses red/orange/warm tones.
- **Playful, quirky aesthetic** that makes browsing feel like entertainment, not research.
- **UX criticism:** Restaurant names aren't obviously clickable (need underline for discoverability). Addresses lack visual prominence. Review navigation is dense.
- Source: [The Infatuation App - DesignRush](https://www.designrush.com/best-designs/apps/the-infatuation), [Design Critique - IXD@Pratt](https://ixd.prattsi.org/2021/09/design-critique-the-infatuation/)

**Google Maps (Explore Tab)** -- The default food discovery tool for 83% of consumers.
- **Trending lists and curated collections** ("Best brunch spots," "New & hot") surfaced in the Explore tab.
- **Horizontal scroll category chips** at the top -- Restaurants, Coffee, Bars, Fast Food, etc. Users tap a broad category, then use secondary filters for granularity.
- **Integrated discovery + navigation** in a single interface. The path from "find food" to "get directions" is zero friction.
- **Weakness:** Review quality is inconsistent. Focus remains on venue-level, not dish-level. Everything rated 4.0-4.8 (star compression).
- Source: [Memolli: Alternative to Yelp and Google Maps](https://www.memolli.com/blog/memolli-alternative-to-yelp-google-maps/)

**Yelp** -- Still dominant in review depth, declining in relevance.
- 37 million monthly active users vs. Google Maps' 1 billion+.
- Most closely associated with reading restaurant reviews. First tab is always restaurants.
- **Photo galleries are disorganized dumps** -- no dish-level organization.
- **Meaningful rating range compressed to 3.5-4.5** (one star of real differentiation).
- Source: [Yelp vs Google Reviews - WPSocialNinja](https://wpsocialninja.com/yelp-vs-google-reviews/)

### Design Trends Across All Top Food Apps (2025-2026)

1. **Bold visual hierarchies** -- dynamic grids, strong contrast, bold typography to steer user behavior. No clutter.
2. **Adaptive layouts by context** -- breakfast categories in the morning, trending deals at lunch, nearby bars at night. Time-of-day and location shape what you see first.
3. **AI-powered personalization** -- DoorDash, Zomato, Deliveroo all using ML to dynamically reorder what users see based on habits, dietary preferences, weather, and trending items.
4. **Minimal color palettes** -- lightweight typography and liberal whitespace. Attention goes to food, not chrome.
5. **Card-based carousels** -- horizontal swipe-through cards organized by contextual groups ("Under 25 Minutes," "New This Week"). But criticism: only one card fully visible at a time hurts discoverability and increases swipe fatigue.
- Source: [Top Food App Design Tips 2025 - Netguru](https://www.netguru.com/blog/food-app-design-tips), [Food Delivery App UI/UX 2025 - Medium](https://medium.com/@prajapatisuketu/food-delivery-app-ui-ux-design-in-2025-trends-principles-best-practices-4eddc91ebaee)

### Relevance to WGH

- Beli is the closest competitor. WGH has two structural advantages: dish-level granularity (Beli rates restaurants) and zero social graph requirement (tourists have no local friends).
- Google Maps' horizontal category chips are the proven pattern for food discovery entry points. WGH should use the same pattern.
- The Infatuation proves a single typeface used relentlessly creates brand trust. WGH's DM Sans should be that typeface.
- Adaptive layouts by time of day: WGH could surface "Breakfast" categories in morning, "Dinner" in evening, "Dessert" late night.

---

## 2. MAP-FIRST MOBILE INTERFACES

### The Bottom Sheet Pattern (The Industry Standard)

Every major map app now uses the draggable bottom sheet over a full-screen map. This is the dominant mobile map interaction pattern, popularized by Apple Maps and Google Maps.

**Three snap points (detents):**

| Detent | Screen Height | What's Shown | Map Visible |
|--------|--------------|--------------|-------------|
| **Peek** | ~10-15% | Search bar + 1-2 list items | Full map visible, fully interactive |
| **Half** | ~50% | List of results, filters, details | Top half of map visible, still interactive |
| **Full** | ~90% | Complete list, full details, reviews | Map hidden or minimal strip at top |

- Apple Maps uses `.medium` (50%) and `.large` (full height) as native iOS detents. Custom detents can be set at any fraction (e.g., 0.1 for peek).
- Google Maps' bottom sheet is **persistent and non-modal** -- it cannot be fully dismissed, only collapsed. The map remains interactive at all states.
- Common React Native implementations use snap points at `['25%', '50%', '90%']` or `['15%', '40%', '90%']`.
- Source: [Bottom Sheets - NN/Group](https://www.nngroup.com/articles/bottom-sheet/), [Bottom Sheet Design - LogRocket](https://blog.logrocket.com/ux-design/bottom-sheets-optimized-ux/)

### Pin Density and Clustering

**The Airbnb Approach:**
- Shows "just enough listings" at any zoom level -- never floods the map with every possible result.
- **Price labels as pins** instead of generic markers. Each pin shows the actual price, making the map scannable without tapping.
- Zoom in = more detail appears. Zoom out = pins cluster automatically.
- Built to work for "a huge metropolis with high density" down to "the smallest rural village" -- the system stays consistent, legible, and useful at all zoom levels.
- On mobile, separates map and list views entirely (on desktop, they're side by side).
- Source: [Airbnb Map Platform - Adam Shutsa](https://adamshutsa.com/map-platform/)

**Google Maps' Clustering:**
- At high zoom: individual pins with labels.
- At low zoom: numbered cluster markers showing density ("12 restaurants in this area").
- Clusters break apart smoothly as users zoom in -- progressive disclosure of density.
- On mobile, leans on **pinch-to-zoom gestures** rather than zoom buttons, reducing UI chrome.
- Source: [Pins vs Clusters - Medium](https://medium.com/@letstalkproduct/the-map-search-experience-pins-vs-clusters-b3d18d8159c5)

**Zillow/Rightmove (Real Estate):**
- Use clustering to manage dense urban listings.
- Clusters show counts at high level, individual listings at street level.
- Boundary overlays (neighborhoods, school districts) provide context without cluttering pin layer.
- Source: [Maps as Core UX in Real Estate - Raw.Studio](https://raw.studio/blog/using-maps-as-the-core-ux-in-real-estate-platforms/)

### Map Layout Patterns

Two fundamental approaches:

1. **Full Map with Overlay (Superposed):** List component overlays the map via bottom sheet. Map is always the background. Used by: Apple Maps, Google Maps, Uber, Airbnb mobile.
   - **Pros:** Maximum map context, spatial understanding maintained.
   - **Cons:** List space constrained, harder to scan many items.

2. **Split View (Juxtaposed):** Map and list side by side (desktop) or toggled (mobile). Used by: Zillow desktop, Airbnb desktop, some travel apps.
   - **Pros:** Both views fully usable simultaneously.
   - **Cons:** Each view gets less space. Not practical on phone screens.

**For mobile food discovery, the bottom sheet pattern is the clear winner.** The map provides spatial context ("how far is this?") while the list provides detail ("what's rated highest?"). The user controls the balance by dragging.

- Source: [Map UI Patterns](https://mapuipatterns.com/), [Map UI - UXPin](https://www.uxpin.com/studio/blog/map-ui/), [Location List Pattern](https://mapuipatterns.com/location-list/)

### What Makes a Map Feel Explorable vs. Overwhelming

| Explorable | Overwhelming |
|------------|-------------|
| 5-15 pins visible at default zoom | 50+ pins crammed together |
| Price or rating labels on pins (scannable) | Generic identical markers |
| Cluster count at low zoom, individual at high zoom | All pins visible at all zoom levels |
| Subtle category coloring on pins | Rainbow of colors with no legend |
| Smooth zoom transitions | Jarring pin pop-in on zoom changes |
| Map controls at screen edge, minimal | Floating buttons everywhere |
| Bottom sheet for detail (not popups) | Info windows blocking map content |

### Relevance to WGH

Martha's Vineyard has ~93 restaurants, not 93,000. Pin density is a minor concern. The real design question is: **what goes on the pin?** Options:
- Consensus badge icon (flame for GREAT, star for Great Here)
- Rating number (8.7)
- Restaurant name (at high zoom only)

The bottom sheet with three snap points (peek/half/full) is the right pattern. At peek: show search bar + "3 GREAT dishes near you." At half: scrollable ranked dish list. At full: complete browse with filters.

---

## 3. DESIGN THAT WORKS ACROSS GENERATIONS

### The Data: What Different Age Groups Need

**Older Adults (55+) -- From a systematic review of age-friendly app design (2025):**
- 73.4% select "easy navigation" as top priority (vs. 52.6% of younger users).
- Rate structured information layouts significantly higher than younger adults.
- Seek simplicity and clarity, gravitating toward intuitive UI.
- Prioritize functionality over flashy aesthetics.
- Need: larger font sizes, high-contrast color schemes, error-tolerant interfaces, voice interaction options.
- Source: [Optimizing Mobile App Design for Older Adults - PubMed](https://pubmed.ncbi.nlm.nih.gov/40804492/)

**Younger Adults (18-34):**
- 68.3% prioritize "fun and dynamic design" (vs. 41.2% of older adults).
- Expect personalization, social features, and gamification.
- 59% of Gen Z regularly use subtitles/captions -- they've mainstreamed accessibility features not out of need but preference.
- Want: speed, personality, social proof, sharing capabilities.
- Source: [Gen Z Mainstreaming Accessibility - Squer](https://www.squer.io/blog/bridging-the-digital-divide-how-gen-z-is-changing-the-accessibility-conversation-part-1-of-2)

### Specific Measurements That Work for Both

**Font Sizes:**
- **16px minimum for body text.** This is the golden standard across accessibility guidelines and platform recommendations. Below 16px, readability drops sharply for users with presbyopia (age-related vision change, affecting most people over 45).
- **Line height: 1.4-1.6x the font size.** At 16px body text, line height should be 22-25px.
- **Android uses "sp" units** that automatically scale with system font size preferences. iOS has Dynamic Type. Support both.
- **Contrast ratio: 4.5:1 minimum** for normal text, 3:1 for large text (18px+ or 14px+ bold). This is WCAG 2.2 Level AA.
- Source: [Mobile Font Size Guide](https://www.islamneddar.com/blog/mobile-development/mobile-font-size-guide-best-practice), [WCAG Font Size Requirements](https://font-converters.com/accessibility/font-size-requirements)

**Touch Targets:**
- **WCAG 2.5.8 (Level AA): 24x24 CSS pixels minimum** -- this is the new legal standard as of 2025. Part of WCAG 2.2, referenced by ADA, Section 508, and European Accessibility Act (effective June 2025).
- **Apple recommends: 44x44 pt minimum.**
- **Google Material Design recommends: 48x48 dp minimum** (about 9mm physical size regardless of screen density).
- **Physical ideal: 7-10mm.** The average adult finger pad is 10mm. Targets below 7mm cause error rates to spike.
- **Spacing alternative:** If a target is smaller than 24px, it can still comply if there's at least 24px of empty space between it and the next interactive element.
- Source: [WCAG 2.5.8 - AllAccessible](https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide), [Touch Targets - Accessibility.digital.gov](https://accessibility.digital.gov/ux/touch-targets/)

**Interaction Patterns That Bridge Generations:**

| Pattern | Why It Works for Older Users | Why It Works for Younger Users |
|---------|------------------------------|-------------------------------|
| Bottom tab navigation | Familiar, always visible, large targets | Thumb-friendly, fast switching |
| Pull-to-refresh | Simple gesture, direct feedback | Expected behavior, satisfying |
| Horizontal swipe for actions | Discoverable with visual cues | Natural, gesture-first interaction |
| Clear back buttons | Prevents getting lost | Faster than gesture navigation |
| Skeleton loading states | Shows something is happening | Feels faster than spinners |

**What Trips Up Older Users:**
- Gesture-only navigation with no visible affordances (swipe to delete with no button alternative).
- Low-contrast placeholder text in form fields.
- Small close/dismiss buttons (the "X" on modals).
- Hamburger menus hiding critical navigation.
- Auto-advancing carousels that move before they finish reading.

**What Bores Younger Users:**
- Static, text-heavy layouts with no visual hierarchy.
- No social proof or activity signals.
- No personality in copy or design.
- Slow transitions, no micro-interactions.
- No dark mode option.

### Relevance to WGH

WGH's user split: 80% tourists (skews older, families, mixed ages) + 5% pioneers (skews younger, foodie culture). The design must serve both without compromising for either.

**Concrete targets:**
- Body text: 16px minimum (currently using DM Sans)
- Touch targets: 48x48dp / 44x44pt minimum for all interactive elements
- Contrast: 4.5:1 for all text against backgrounds
- The Bite Slider thumb: at least 44pt wide and tall
- Category chips: 48dp height, generous horizontal padding
- Rating numbers: 18px+ (large text, can use 3:1 contrast ratio)

---

## 4. FOOD BRANDING WITHOUT PHOTOGRAPHY

### Color Psychology: What Makes People Hungry

**Appetite stimulants (warm colors):**
- **Red:** Stimulates appetite, energizes, draws attention. Studies show red subconsciously encourages eating more and eating faster. Most effective when paired with yellow. Used by: McDonald's, Coca-Cola, Yelp.
- **Orange:** Vitalizes, inspires, stimulates appetite AND social conversation. Used by: Fanta, Dunkin', Popeyes.
- **Yellow:** Stimulates the logical side of the brain and mental activity. Grabs attention. Used by: McDonald's (paired with red), Denny's.
- **Warm gold:** Communicates quality, warmth, premium without pretension. Used by: high-end bakeries, craft food brands.

**Appetite suppressants (cool colors):**
- **Blue:** Known to suppress appetite and reduce hunger. Most weight loss apps use blue. The most unappetizing color.
- **Purple:** Also an appetite suppressant.
- **Cool gray:** Clinical, institutional. Kills the emotional warmth food requires.

**The exception that proves the rule:** The Infatuation uses signature blue and succeeds BECAUSE it's unexpected for food. It reads as "authority" and "trust" rather than "food." This only works with strong editorial voice backing it up.

- Source: [Colors That Influence Food Sales - Jenn David Design](https://jenndavid.com/colors-that-influence-food-sales-infographic/), [Color Psychology for Restaurants - Wasserstrom](https://www.wasserstrom.com/blog/2022/12/07/color-psychology-for-restaurant-design/), [Color Theory in Menus - WISK](https://www.wisk.ai/blog/color-theory-in-menus-why-red-makes-you-hungry)

### Typography-Only Food Branding

**What works:**
- **Bolder type, lowercase, tight spacing** = younger, approachable, casual dining feel.
- **Serif fonts with wide letter-spacing** = elegant, premium, farm-to-table feel.
- **A single typeface used relentlessly** creates brand recognition faster than multiple fonts. The Infatuation's National 2 is the benchmark.
- Chipotle proved you could look premium without fine dining prices using clean, minimal design. Before Chipotle, quick-service restaurants favored busy, colorful branding. The clean aesthetic influenced Sweetgreen, CAVA, and dozens of others.
- Source: [Best Food Fonts - Envato](https://design.tutsplus.com/articles/43-best-food-fonts-for-logos-signs-and-menus--cms-39545), [Food Branding - Kimp](https://www.kimp.io/food-branding/)

### Illustration-Based Approaches

- **Sweetgreen:** Uses hand-drawn quality illustrations inspired by vintage cookbooks. Fun illustrations (like an Uber driver driving a giant radish) add personality without requiring food photography.
- **Le Pain Quotidien:** Hand-drawn sketch of a stone-lined bread-baking hearth. The illustration captures the bakery's passion for rustic bread-making.
- **Dirty Vegan:** Uses nostalgic comic-book-style illustrations as core branding.
- Custom illustrations amplify brand identity. The key is experimenting with diverse styles to find what matches your brand personality.
- Source: [Sweetgreen Brand Refresh](https://www.sweetgreen.com/brand-refresh)

### Emoji as UI Elements

**What the research shows:**
- Emojis have Unicode "alt text" spoken by screen readers, but descriptions are often awkwardly literal ("face with steam from nose") and not customizable.
- Different platforms render the same emoji differently -- Apple, Google, Samsung, Microsoft all design their own versions. A subtle expression change can shift emotional tone.
- **Best practice: Use sparingly. Never as the sole communication.** Emojis enhance text but shouldn't replace it.
- **Maximum 3 emoji per visual element** to maintain clarity.
- **Always place text before emojis, not after.** The message should be clear without the emoji.
- **Add ARIA labels** if emojis carry meaning. `<span role="img" aria-label="fire, top rated">...</span>`
- **Test in dark mode and high contrast mode.** Some emojis become invisible against certain backgrounds.
- **Avoid animated emoji** -- can cause issues for users with vestibular disorders.
- Source: [Emoji Accessibility - Envato](https://webdesign.tutsplus.com/emoji-accessibility--cms-108252a), [Emojis in Accessibility - UX Collective](https://uxdesign.cc/emojis-in-accessibility-how-to-use-them-properly-66b73986b803), [UX Impact of Emojis](https://uxplaybook.org/articles/how-to-use-emojis-in-ux-design)

### Relevance to WGH

WGH's brand is already well-positioned:
- **Gold (#D9A765)** is a warm appetite-stimulant that reads as premium. It's as perfect for food as Untappd's amber is for beer.
- **Warm Coral (#E45A35)** for CTAs is in the red/orange appetite-stimulant zone.
- **No blue in the core palette** -- correct instinct.
- **DM Sans** as the primary typeface, used consistently, builds the Chipotle-style clean-premium-accessible feel.

For dish cards without photos:
- Use category emoji as visual anchors (with ARIA labels and text labels alongside).
- Lean on the rating number and Consensus badge as the visual hero.
- Warm background tones (the existing `--color-surface` warm stone) evoke food warmth without photos.
- Consider: a subtle illustration style for category headers (hand-drawn lobster for Seafood, etc.) as a future brand differentiator.

---

## 5. CATEGORY NAVIGATION AS PRIMARY UI

### How Category Chips Work as Main Navigation

**Google Maps' Pattern (The Reference Implementation):**
- Horizontal scrollable row of category chips near the top of the screen.
- Users tap a broad category (Restaurants, Coffee, Bars) then use secondary filters for more granularity.
- Chips are always visible, scroll off-screen to the right.
- Clear active state (filled background) vs. inactive (outlined).
- Source: [Filter UX Design Patterns - LogRocket](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices/)

**DoorDash / Uber Eats Pattern:**
- Horizontal scrollable icons + text labels for food categories.
- Card-based carousels within each category ("Under 25 Minutes," "New on UberEATS").
- **Criticism: The category bar disappears when scrolling** -- forces users to scroll back up. A persistent sticky category bar is better.
- **Criticism: Only one restaurant card fully visible at a time** -- hurts discoverability.
- Source: [Wireframing Uber Eats - Medium](https://medium.com/@luismperdigao/wireframing-uber-eats-14061d5aaf9b)

### Chip Design Specifications

**Material Design 3 Standards:**
- All components align to an **8dp square baseline grid**.
- Touch target minimum: **48dp height** (even if visible chip is smaller, the tap area extends).
- Physical touch target: **7-10mm** regardless of screen density.
- Screen edge margins: **16dp** left and right on mobile.
- Internal chip padding: sufficient to prevent a cramped feeling. Label text should be brief -- single words work best.
- Source: [Material Design Layout](https://m3.material.io/foundations/layout/understanding-layout/spacing), [Chip UI Design - SetProduct](https://www.setproduct.com/blog/chip-ui-design)

**Best Practices for Category Chip Navigation:**

| Attribute | Recommendation | Why |
|-----------|---------------|-----|
| **Chip height** | 36-40dp visible, 48dp tap area | Large enough to read and tap accurately |
| **Horizontal padding** | 12-16dp per side | Prevents labels from feeling cramped |
| **Gap between chips** | 8dp | Close enough to scan, far enough to avoid mis-taps |
| **Label text** | 13-15sp, medium weight | Readable without dominating the layout |
| **Max visible chips** | 3.5-4.5 (half-visible chip signals scrollability) | Full visibility kills the scroll affordance |
| **Active state** | Filled background + bold text | Immediately scannable which filter is on |
| **Inactive state** | Outlined or ghost background | Clearly available but not selected |
| **Scroll behavior** | Horizontal, free scroll, no snap | Natural feeling, user controls position |
| **Position** | Sticky below search bar | Always accessible, never scrolls away |
| **Icon + label** | Optional icon left of label | Adds scannability for common categories |

**Critical UX detail: Show a half-visible chip on the right edge.** If all chips fit on screen, users don't know they can scroll. The partially visible chip is the universal scroll affordance -- it signals "there's more."

- Source: [Chip UI Design - Mobbin](https://mobbin.com/glossary/chip), [Filter UI Patterns 2025 - BricxLabs](https://bricxlabs.com/blogs/universal-search-and-filters-ui)

### When Chips Fail

- **Too many options:** More than ~15-20 chips creates scroll fatigue. Group into primary (always visible) and secondary (expandable).
- **Long labels:** "Gluten-Free Options" as a chip label is too wide. Truncate to "Gluten-Free" or use an icon.
- **No clear default:** If no chip is selected on load, users don't know where to start. Consider a "For You" or "Nearby" default.
- **No visual feedback on selection:** Must have immediate, obvious state change (color fill, checkmark, bold text).

### Relevance to WGH

WGH has 19 BROWSE_CATEGORIES (shortcuts) and 15 shown on Browse. This is a lot for a single horizontal row. Options:
1. **Two rows:** Primary row (top 6-8 most used: Seafood, Pizza, Burgers, Breakfast, etc.) + "More" chip that expands to full grid.
2. **Single scrollable row:** Show 4.5 chips, the half-chip signals more. Put the most popular/seasonal categories first.
3. **Icon-forward chips:** Small icon + short label reduces perceived width per chip. Seafood gets a shrimp, Pizza gets a slice, etc.

The category bar should be **sticky** -- always visible when scrolling the dish list below. DoorDash's disappearing category bar is a known pain point.

---

## 6. TIMELESS UI DESIGN PRINCIPLES

### What Makes UIs Age Well (And What Kills Them)

**From Imaginary Cloud's "Is Timeless UI Design a Thing?" analysis:**

The core argument: There's no such thing as truly timeless design because it's too dependent on context. But you can shoot for **longevity** by prioritizing usability, clarity, and fundamental design systems over decorative trends.

**What ages well:**
- Structure. Strong grid, clear hierarchy, modular relationships.
- Function-first decisions. Everything decorative will "come back to bite you."
- Accessibility-first design. Designing for the widest possible audience is inherently more durable.
- Content over chrome. Interfaces where the content IS the visual design (Letterboxd's posters, a photo grid) age better than interfaces where decoration IS the visual design.

**What ages badly:**
- Skeuomorphism (leather textures, stitching, drop shadows mimicking physical objects).
- Trendy gradients that date to a specific era (the 2023 mesh gradient, the 2020 glassmorphism).
- Decorative animations that don't serve function.
- Novelty typography (script fonts, display fonts for body text).
- Color palettes that follow trend cycles rather than brand logic.

- Source: [Timeless UI Design - Imaginary Cloud](https://www.imaginarycloud.com/blog/timeless-classic-ui-design), [The Past Is Present - Toptal](https://www.toptal.com/designers/ux/timeless-design)

### Dieter Rams' 10 Principles Applied to Digital Interfaces

Rams created these principles 50+ years ago for physical products at Braun. They remain the most-cited design framework in digital design.

| Principle | Digital Application |
|-----------|-------------------|
| **Good design is innovative** | Solve real problems in new ways, don't add features for novelty |
| **Good design makes a product useful** | Every screen element must serve a purpose users actually need |
| **Good design is aesthetic** | Visual harmony matters -- but beauty comes from order, not decoration |
| **Good design makes a product understandable** | The interface should explain itself. If you need a tutorial, redesign. |
| **Good design is unobtrusive** | The app should feel like a tool, not a performance. Neutral, restrained. |
| **Good design is honest** | Don't make the product appear more than it is. No fake social proof. |
| **Good design is long-lasting** | Avoid fashionable choices. What's trendy today is dated tomorrow. |
| **Good design is thorough down to the last detail** | Edge cases, empty states, error messages all deserve design attention |
| **Good design is environmentally friendly** | In digital: performant, efficient, minimal resource consumption |
| **Good design is as little design as possible** | "Less, but better." Remove until removing hurts function. |

The signature statement: **"Less, but better."**

- Source: [Dieter Rams 10 Principles - IxDF](https://www.interaction-design.org/literature/article/dieter-rams-10-timeless-commandments-for-good-design), [Rams Principles in Digital World - Empathy.co](https://empathy.co/blog/dieter-rams-10-principles-of-good-design-in-a-digital-world/)

### The Imperavi Principles (Modern Addition)

From "The Missing Principles of Timeless Design":

1. **Systems, not styles.** A strong grid, clear hierarchy, and modular relationships hold everything together long after colors or trends change.
2. **Principles should be universal, tech-adaptive, simple, and pragmatic.** They should work whether you're designing for a watch or a wall-mounted display.
3. **Consistency creates familiarity.** Familiar interfaces are naturally more usable. Every inconsistency is a micro-friction.
4. **Progressive disclosure over everything-at-once.** Show what's needed now, reveal complexity as needed. This never goes out of style.

- Source: [Missing Principles of Timeless Design - Imperavi](https://imperavi.com/blog/the-missing-principles-of-timeless-design)

### Real-World Examples of Lasting vs. Dated Design

**Designs that lasted:**
- **Craigslist:** Barely changed since the early 2000s. Plain HTML, minimal JavaScript, no tracking cookies. Still profitable, still useful. The no-frills design means fewer distractions, faster loading, and no behavioral manipulation. Staff of ~50 supporting a top-60 global website. The lesson: function without decoration can be eternal.
- **Google Search:** The search box, 10 blue links, and "I'm Feeling Lucky" button have been essentially the same for 25 years. The constraint IS the brand.
- **Wikipedia:** Text, links, structure. No design trends adopted, no design trends to date.

**The common thread:** All three prioritize **information density and access speed** over visual sophistication. They work because the user's task is clear and the interface doesn't compete with the content.

**The counterpoint for WGH:** These are utility-first interfaces. A food discovery app needs EMOTIONAL warmth that Craigslist doesn't. The lesson isn't "be ugly" -- it's "don't decorate, let the content (food photos, ratings, dish names) be the visual experience."

- Source: [Why Craigslist Still Looks the Same - Slashdot](https://tech.slashdot.org/story/22/09/16/2123239/why-craigslist-still-looks-the-same-after-25-years)

### The Longevity Checklist

A design is more likely to age well if it:

- [ ] Uses a systematic spacing scale (4px or 8px base) rather than arbitrary values
- [ ] Limits the color palette to 3-5 purposeful colors with clear semantic meaning
- [ ] Uses one or two typefaces maximum, with clear roles for each
- [ ] Relies on content (photos, data, text) as the visual centerpiece, not decoration
- [ ] Has generous whitespace rather than decorative fills
- [ ] Uses subtle, functional animations (transitions, state changes) not decorative ones
- [ ] Works in both light and dark themes without feeling like a different app
- [ ] Meets WCAG 2.2 AA accessibility standards
- [ ] Feels "simple" to describe in one sentence ("a list of ranked dishes on a map")
- [ ] Has no element you'd need to explain to a first-time user

### Relevance to WGH

WGH's current design tokens and system are well-set for longevity:
- DM Sans is a neutral, modern sans-serif that won't date quickly.
- The warm stone background (#F0ECE8) is more timeless than pure white (which swings in and out of fashion).
- The dual-theme system (Appetite/Island Depths) with CSS variables is structurally sound.
- Gold (#D9A765) as signature accent is classic, not trendy.

**Risks to watch:**
- Avoid decorative gradients on cards or backgrounds. Flat colors age better.
- Keep animations minimal and functional (state transitions, not entrance effects).
- Don't chase glassmorphism, neumorphism, or whatever the 2026 trend becomes.
- The dish card grid IS the design. Make the food photos, ratings, and consensus badges the visual experience rather than adding decorative elements around them.

---

## 7. SYNTHESIS: DESIGN PRINCIPLES FOR THE WGH REDESIGN

Based on all six research areas, here are the unified principles:

### Principle 1: Content IS the Design
Food photos, rating numbers, and consensus badges should BE the visual experience. No decorative illustrations, background patterns, or UI chrome competing for attention. Like Letterboxd with film posters -- the content does the heavy lifting.

### Principle 2: The Three-Color Rule
Gold (quality/rated), Coral (action/CTA), Green (score/consensus). Every visual element maps to one of these three semantic meanings. Resist adding more. Letterboxd proved three colors is enough.

### Principle 3: One Typeface, Used Relentlessly
DM Sans everywhere. Bold for headlines, Medium for labels, Regular for body. The consistency compounds into trust, like The Infatuation's National 2.

### Principle 4: 48dp Everything
Every interactive element: 48dp minimum tap target. Chips, buttons, slider thumb, list items, close buttons. No exceptions. This single rule solves 80% of cross-generational usability.

### Principle 5: Sticky Categories, Half-Visible Last Chip
Category chips stay visible when scrolling. The partially-visible rightmost chip signals scrollability. 4.5 chips visible at once. This is the Google Maps pattern and it works.

### Principle 6: Bottom Sheet Over Map (Three Detents)
Peek (15%): search bar + quick stat. Half (50%): ranked dish list. Full (90%): complete browse with filters. Map always interactive at peek and half states.

### Principle 7: Warm Palette, High Contrast
Warm gold + coral + green on warm stone/cream backgrounds. Every text-to-background combination must hit 4.5:1 contrast. Warm colors stimulate appetite. High contrast serves all ages.

### Principle 8: Less, But Better
Every element must earn its screen space. If it's not helping a tourist find their next meal or a Pioneer log their experience, remove it. Rams' principle applied to food discovery.

### Principle 9: Fast Default, Rich Optional
The Bite Slider is 2 seconds. Writing a review is 30 seconds. Adding a photo is optional. Browsing the map requires zero taps. The default path is always the fastest path. Depth exists for those who want it.

### Principle 10: Build for the Returning Visitor
Time-of-day adaptive content, "updated weekly" signals on lists, trending sections that change daily. The interface should feel different on Tuesday night than Saturday morning. Freshness is the ultimate anti-dating mechanism -- an app that shows live data never feels stale.

---

## Sources

### Food Discovery App Design
- [Design Critique: Beli App - IXD@Pratt](https://ixd.prattsi.org/2024/09/design-critique-beli-app/)
- [Beli App Gamifies Dining - WebProNews](https://www.webpronews.com/beli-app-gamifies-dining-to-attract-gen-z-and-challenge-yelp/)
- [Beli: Gen Z's New Yelp - YPulse](https://www.ypulse.com/newsfeed/2025/09/23/beli-is-gen-z-and-millennial-foodies-new-yelp/)
- [Beli Changed Food Discovery - Creative Buffs](https://www.creativebuffs.com/how-beli-changed-the-game-in-food-discovery/)
- [The Infatuation App - DesignRush](https://www.designrush.com/best-designs/apps/the-infatuation)
- [Design Critique: The Infatuation - IXD@Pratt](https://ixd.prattsi.org/2021/09/design-critique-the-infatuation/)
- [The 12 Best Food Rating Apps 2025 - Savor](https://www.savortheapp.com/blog/food-memories-journaling/best-food-rating-app/)
- [Top Food App Design Tips 2025 - Netguru](https://www.netguru.com/blog/food-app-design-tips)
- [Memolli: Alternative to Yelp/Google Maps](https://www.memolli.com/blog/memolli-alternative-to-yelp-google-maps/)
- [Yelp vs Google Reviews - WPSocialNinja](https://wpsocialninja.com/yelp-vs-google-reviews/)

### Map UI Design
- [Map UI Patterns](https://mapuipatterns.com/)
- [Map UI Design - Eleken](https://www.eleken.co/blog-posts/map-ui-design)
- [Map UI Layouts - UXPin](https://www.uxpin.com/studio/blog/map-ui/)
- [Pins vs Clusters - Medium](https://medium.com/@letstalkproduct/the-map-search-experience-pins-vs-clusters-b3d18d8159c5)
- [Airbnb Map Platform - Adam Shutsa](https://adamshutsa.com/map-platform/)
- [Maps as Core UX - Raw.Studio](https://raw.studio/blog/using-maps-as-the-core-ux-in-real-estate-platforms/)
- [Location List Pattern - Map UI Patterns](https://mapuipatterns.com/location-list/)
- [Bottom Sheets - NN/Group](https://www.nngroup.com/articles/bottom-sheet/)
- [Bottom Sheet Design - LogRocket](https://blog.logrocket.com/ux-design/bottom-sheets-optimized-ux/)

### Cross-Generational & Accessibility
- [Optimizing Mobile App Design for Older Adults - PubMed](https://pubmed.ncbi.nlm.nih.gov/40804492/)
- [Gen Z Mainstreaming Accessibility - Squer](https://www.squer.io/blog/bridging-the-digital-divide-how-gen-z-is-changing-the-accessibility-conversation-part-1-of-2)
- [WCAG 2.5.8 Target Size Guide - AllAccessible](https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide)
- [WCAG 2.5.8 2025 Guide - TestParty](https://testparty.ai/blog/wcag-2-5-8-target-size-minimum-2025-guide)
- [Touch Targets - Accessibility.digital.gov](https://accessibility.digital.gov/ux/touch-targets/)
- [Mobile Font Size Guide](https://www.islamneddar.com/blog/mobile-development/mobile-font-size-guide-best-practice)
- [WCAG Font Size Requirements](https://font-converters.com/accessibility/font-size-requirements)
- [Designing for Multi-Generational Audience - Big Drop](https://www.bigdropinc.com/blog/designing-for-different-generations-tips-for-a-multi-generational-audience-ux/)
- [Guide to Designing for Older Adults - Smashing Magazine](https://www.smashingmagazine.com/2024/02/guide-designing-older-adults/)

### Food Branding & Color Psychology
- [Colors That Influence Food Sales - Jenn David Design](https://jenndavid.com/colors-that-influence-food-sales-infographic/)
- [Color Psychology for Restaurants - Wasserstrom](https://www.wasserstrom.com/blog/2022/12/07/color-psychology-for-restaurant-design/)
- [Color Theory in Menus - WISK](https://www.wisk.ai/blog/color-theory-in-menus-why-red-makes-you-hungry)
- [Food Branding Lessons - Kimp](https://www.kimp.io/food-branding/)
- [Sweetgreen Brand Refresh](https://www.sweetgreen.com/brand-refresh)
- [Emoji Accessibility - Envato](https://webdesign.tutsplus.com/emoji-accessibility--cms-108252a)
- [Emojis in Accessibility - UX Collective](https://uxdesign.cc/emojis-in-accessibility-how-to-use-them-properly-66b73986b803)
- [UX Impact of Emojis](https://uxplaybook.org/articles/how-to-use-emojis-in-ux-design)

### Category Navigation & Chips
- [Filter UX Design Patterns - LogRocket](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices/)
- [Chip UI Design - Mobbin](https://mobbin.com/glossary/chip)
- [Chip UI Design - SetProduct](https://www.setproduct.com/blog/chip-ui-design)
- [Filter UI Patterns 2025 - BricxLabs](https://bricxlabs.com/blogs/universal-search-and-filters-ui)
- [Material Design 3 Layout/Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)

### Timeless Design
- [Timeless UI Design - Imaginary Cloud](https://www.imaginarycloud.com/blog/timeless-classic-ui-design)
- [The Past Is Present - Toptal](https://www.toptal.com/designers/ux/timeless-design)
- [Missing Principles of Timeless Design - Imperavi](https://imperavi.com/blog/the-missing-principles-of-timeless-design)
- [Dieter Rams 10 Principles - IxDF](https://www.interaction-design.org/literature/article/dieter-rams-10-timeless-commandments-for-good-design)
- [Rams Principles in Digital - Empathy.co](https://empathy.co/blog/dieter-rams-10-principles-of-good-design-in-a-digital-world/)
- [14 Timeless UI Design Examples - Softkraft](https://www.softkraft.co/ui-design-examples/)
- [Craigslist Still Looks the Same - Slashdot](https://tech.slashdot.org/story/22/09/16/2123239/why-craigslist-still-looks-the-same-after-25-years)
