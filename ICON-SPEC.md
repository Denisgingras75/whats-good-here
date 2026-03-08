# WGH Icon System v1.0

The definitive spec for food category icons in What's Good Here. Every icon in the app must follow this system. No exceptions, no "just this one time" deviations.

---

## Design Philosophy

Bold, flat, two-color food silhouettes. The style is closer to a screenprint or zine stamp than an illustration. These icons should feel like they belong on a hand-printed Martha's Vineyard restaurant menu — warm, confident, zero corporate polish.

They must work at 32px next to a dish name AND at 96px as a category hero. The same SVG, scaled.

---

## Technical Spec

### Grid & Sizing

| Property | Value | Notes |
|---|---|---|
| viewBox | `0 0 48 48` | Matches existing inline SVG system |
| Live area | 40x40 centered | 4px padding on all sides |
| Min render size | 24px | Must be recognizable as filled silhouette |
| Standard sizes | 32px (list), 48px (chip), 64px (grid), 96px (hero) | All from same SVG |

### Colors (Exactly Two)

| Role | Value | Usage |
|---|---|---|
| **Fill** | `currentColor` | The main shape. Tinted via CSS. Defaults to `var(--color-primary)` coral. |
| **Detail** | `#1A1A1A` (near-black) | Interior structure lines, separations, accents. Never outlines. |

No gradients. No shadows. No textures. No white fills (use transparent negative space instead).

### Theme

Light mode only (Appetite theme). No dark mode variant needed.

- **Fill:** Coral `#E4440A` on warm stone `#F0ECE8` background
- **Detail lines:** Near-black `#1A1A1A`

Icons can hardcode these colors in the SVG or use `currentColor` for the fill (future-proofing). For launch, hardcoded coral is fine.

### Format & Export

| Deliverable | Format | Purpose |
|---|---|---|
| **Master source** | SVG | Editable, scalable, version-controlled in repo |
| **Production** | SVG (SVGO-optimized) | What the app actually loads |
| **Fallback** | PNG @2x (96px) | OG images, email, contexts where SVG isn't supported |

Master SVGs live in `public/categories/icons/` (new directory).

File naming: `{category-id}.svg` — must exactly match the `id` field in `BROWSE_CATEGORIES` from `src/constants/categories.js`. Hyphenated for multi-word (e.g., `lobster-roll.svg`, `ice-cream.svg`).

---

## Style Rules

### DO

- **One concept per icon.** Pizza = a slice. Sushi = nigiri or maki. Not a platter.
- **Front-on perspective.** Flat, facing the viewer. No isometric, no 3/4 angle.
- **Bold silhouettes.** The overall shape must be instantly recognizable as a filled blob at 24px.
- **Interior detail only.** Black lines define internal structure (grill marks on steak, layers in a burger, chunks in chowder). They do NOT outline the entire shape.
- **Max 3-4 detail elements.** If you're adding a 5th interior detail, you've gone too far. Simplify.
- **Round caps and joins.** All strokes use round line caps and round joins. No sharp corners on strokes.
- **Distinct silhouettes between icons.** If two icons look like the same blob when filled solid, one of them needs redesign. Test: pizza (triangle) vs taco (half-moon) vs sandwich (trapezoid) = good. Bowl vs bowl vs bowl = bad.

### DON'T

- No outlines around the entire shape (this isn't a coloring book)
- No gradients, shadows, glows, or textures
- No 3D perspective or isometric views
- No white fills — use transparency for negative space
- No compositions of multiple separate objects (exception: breakfast gets egg+toast+bacon as one group)
- No tiny details that disappear below 32px
- No text or labels baked into the icon
- No background shapes (circles, squares) around the icon — the component handles containers

---

## Silhouette Test

Every icon must pass this test before shipping:

1. Fill the entire icon solid black (no interior detail)
2. Render at 24px
3. Can you identify the food category? If not, the shape needs work.
4. Place it next to the other icons as solid black blobs. Is it distinct from every other icon? If two look alike, one needs a different metaphor.

---

## Category Inventory

### Tier 1: Browse Categories (23 icons needed)

These are the primary category shortcuts shown on the Browse page and used throughout the app.

| Category ID | Metaphor | Status | Notes |
|---|---|---|---|
| `pizza` | Whole pie with slice pulling away | GOOD | Reference icon for the system |
| `burger` | Front-on cheeseburger stack | GOOD | Slightly different color temp — normalize |
| `wings` | Drumette with steam curl | GOOD | Clean, readable |
| `breakfast` | Egg + toast + bacon composition | GOOD | Only icon allowed multiple objects |
| `chowder` | Bowl with chunks and spoon | GOOD | Strong silhouette |
| `steak` | T-bone with grill marks | GOOD | Iconic shape |
| `sandwich` | Triangle half with layers | GOOD | Clear sandwich read |
| `salad` | Bowl with leafy greens + toppings | GOOD | Enough detail to not read as "soup" |
| `taco` | Hard shell with filling bumps | GOOD | Distinct half-moon shape |
| `lobster roll` | Split-top bun with lobster chunks | GOOD | Detail-heavy — could simplify slightly |
| `pasta` | Penne pile with herb | REDO | Too much detail — individual tubes become noise at 32px. Simplify to fork-twirl or bowl of noodles. |
| `sushi` | Three maki rolls with chopsticks | REDO | Current is isometric/3D. Redo front-on. |
| `seafood` | Shrimp or shellfish medley | REDO | Current is neon-on-black. Need coral flat. |
| `tendys` | Two chicken tenders | REDO | Current is neon-on-black. Need coral flat. |
| `dessert` | Cake slice or cupcake | NEW | — |
| `fish` | Whole fish profile | NEW | Must be distinct from "seafood" |
| `clams` | Open clam shell | NEW | Must be distinct from "oysters" |
| `chicken` | Roast chicken leg or whole bird | NEW | Must be distinct from "wings" and "fried chicken" |
| `pork` | Pork chop or pulled pork | NEW | — |
| `oysters` | Half-shell oyster | NEW | Must be distinct from "clams" |
| `coffee` | Coffee cup with steam | NEW | — |
| `cocktails` | Cocktail glass | NEW | — |
| `ice cream` | Cone or scoop | NEW | — |

### Tier 2: Sub-Category / Dish-Level Icons (Future)

These are used in `dishNameIcons` for specific dish overrides. They follow the same spec but are lower priority. Do NOT start these until Tier 1 is complete and shipped.

| Category ID | Metaphor | Notes |
|---|---|---|
| `fried chicken` | Fried chicken sandwich or piece | Distinct from plain "chicken" |
| `breakfast sandwich` | Egg sandwich on roll | Distinct from "breakfast" and "sandwich" |
| `fries` | French fry container or pile | Solo-match only (not "burger and fries") |
| `soup` | Bowl with steam | Distinct from "chowder" |
| `ribs` | Rack of ribs | — |
| `lobster` | Whole lobster | Distinct from "lobster roll" |
| `shrimp` | Single shrimp | — |
| `scallops` | Scallop shell | — |
| `calamari` | Fried rings | — |
| `crab` | Crab | — |
| `wrap` | Rolled wrap | Distinct from "burrito" |
| `burrito` | Foil-wrapped burrito | — |
| `quesadilla` | Quesadilla wedge | — |
| `pancakes` | Stack of pancakes | — |
| `waffles` | Waffle with grid pattern | — |
| `onion rings` | Stacked rings | — |
| `bruschetta` | Topped bread slice | — |
| `poke bowl` | Bowl with toppings | Distinct from "salad" |
| `curry` | Curry bowl | Distinct from "chowder" and "soup" |

---

## Implementation Plan

### In the component (`CategoryIcons.jsx`)

The current component has 7 different icon source layers (poster PNGs, dish-name overrides, inline SVGs, dark PNGs, light PNGs, webp, fallback). The new system collapses this to:

1. **SVG icon** (from `public/categories/icons/{id}.svg`) — the one true source
2. **Inline SVG fallback** — for categories that don't have an icon file yet

The component loads the SVG as an `<img>` tag and tints via CSS filter, OR we inline the SVG paths directly in the component (preferred — gives us full `currentColor` control).

### Migration

1. Write the spec (this file)
2. Produce/normalize the 10 good existing icons into SVG
3. Generate + normalize the 13 missing/redo icons
4. Replace the component to use the new system
5. Delete the old PNG/WebP assets (poster/, neon, light/dark variants)
6. Verify at all sizes in both themes

### Quality Gate

No icon ships without:
- [ ] Silhouette test at 24px (recognizable as filled shape)
- [ ] Distinctness test (doesn't collide with neighboring icons)
- [ ] 32px render check in actual DishListItem
- [ ] 64px render check in Browse category grid
- [ ] Contrast check (coral on warm stone background)
- [ ] SVG optimized via SVGO (under 2KB per icon)
- [ ] File named to match category ID exactly

---

## Reference Icons

The following existing webp icons best represent the target style. Use these as the north star when producing new icons:

- `pizza.webp` — Best overall. Strong silhouette, clear metaphor, right amount of detail.
- `steak.webp` — Great use of black detail lines (grill marks) without over-drawing.
- `chowder.webp` — Shows how to handle "bowl" categories with enough interior detail to differentiate.
- `taco.webp` — Simplest icon in the set. Proves that less detail = more readable.
- `wings.webp` — Single object, steam curl adds life without clutter.

When in doubt, ask: "Does this look like it belongs next to the pizza and the steak?" If yes, ship it. If no, simplify.
