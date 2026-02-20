/**
 * FlatFoodIcon — Simple two-tone (orange + black) food icons.
 * Flat cartoon style: bold black outlines, orange fills, no gradients.
 * Used on Home page category grid, Top 10 rows, and More Top Picks cards.
 */

const ORANGE = '#F97316'
const BLACK = '#000000'

function PizzaFlat() {
  return (
    <g>
      {/* Pizza slice - triangle */}
      <path
        d="M50 8 L18 88 Q50 98 82 88 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Crust arc */}
      <path
        d="M18 88 Q50 98 82 88"
        fill="none"
        stroke={BLACK}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Pepperoni circles */}
      <circle cx="44" cy="38" r="7" fill={BLACK} opacity="0.8" />
      <circle cx="58" cy="52" r="6" fill={BLACK} opacity="0.8" />
      <circle cx="40" cy="64" r="7" fill={BLACK} opacity="0.8" />
      <circle cx="56" cy="74" r="5.5" fill={BLACK} opacity="0.8" />
    </g>
  )
}

function BurgerFlat() {
  return (
    <g>
      {/* Top bun */}
      <path
        d="M14 40 Q14 14 50 14 Q86 14 86 40 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Sesame seeds */}
      <ellipse cx="35" cy="24" rx="4" ry="2" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="55" cy="20" rx="4" ry="2" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="68" cy="28" rx="3.5" ry="1.8" fill="#FFFFFF" opacity="0.7" />
      {/* Lettuce wave */}
      <path
        d="M10 44 Q22 50 34 44 Q46 50 58 44 Q70 50 82 44 Q90 50 92 44"
        fill="none"
        stroke="#22C55E"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Patty */}
      <rect x="12" y="48" width="76" height="14" rx="4" fill={BLACK} />
      {/* Cheese triangle hanging */}
      <polygon points="12,48 8,58 20,48" fill={ORANGE} stroke={BLACK} strokeWidth="2" />
      <polygon points="80,48 92,58 88,48" fill={ORANGE} stroke={BLACK} strokeWidth="2" />
      {/* Bottom bun */}
      <path
        d="M14 66 L86 66 Q86 84 50 84 Q14 84 14 66 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </g>
  )
}

function SandwichFlat() {
  return (
    <g>
      {/* Top bread */}
      <path
        d="M12 35 Q12 18 50 18 Q88 18 88 35 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Lettuce */}
      <path
        d="M8 40 Q20 46 32 40 Q44 46 56 40 Q68 46 80 40 Q88 46 92 40"
        fill="none"
        stroke="#22C55E"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Meat layer */}
      <rect x="10" y="44" width="80" height="10" rx="3" fill={BLACK} />
      {/* Tomato */}
      <rect x="14" y="56" width="72" height="6" rx="3" fill="#EF4444" />
      {/* Bottom bread */}
      <path
        d="M12 64 L88 64 L88 74 Q88 82 50 82 Q12 82 12 74 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </g>
  )
}

function WingsFlat() {
  return (
    <g>
      {/* Drumstick 1 - angled left */}
      <g transform="translate(24, 22) rotate(-20, 20, 30)">
        <ellipse cx="20" cy="18" rx="16" ry="14" fill={ORANGE} stroke={BLACK} strokeWidth="3.5" />
        <rect x="16" y="30" width="8" height="28" rx="4" fill={ORANGE} stroke={BLACK} strokeWidth="3.5" />
        <rect x="14" y="54" width="12" height="6" rx="3" fill="#FFFFFF" stroke={BLACK} strokeWidth="2.5" />
      </g>
      {/* Drumstick 2 - angled right */}
      <g transform="translate(52, 22) rotate(15, 20, 30)">
        <ellipse cx="20" cy="18" rx="16" ry="14" fill={ORANGE} stroke={BLACK} strokeWidth="3.5" />
        <rect x="16" y="30" width="8" height="28" rx="4" fill={ORANGE} stroke={BLACK} strokeWidth="3.5" />
        <rect x="14" y="54" width="12" height="6" rx="3" fill="#FFFFFF" stroke={BLACK} strokeWidth="2.5" />
      </g>
    </g>
  )
}

function SushiFlat() {
  return (
    <g>
      {/* Sushi piece 1 - left */}
      <g transform="translate(8, 28)">
        {/* Rice block */}
        <rect x="0" y="12" width="36" height="22" rx="6" fill="#FFFFFF" stroke={BLACK} strokeWidth="3.5" />
        {/* Nori wrap */}
        <rect x="10" y="12" width="16" height="22" rx="2" fill={BLACK} />
        {/* Fish on top */}
        <ellipse cx="18" cy="12" rx="18" ry="9" fill={ORANGE} stroke={BLACK} strokeWidth="3" />
      </g>
      {/* Sushi piece 2 - right */}
      <g transform="translate(54, 24)">
        <rect x="0" y="12" width="36" height="22" rx="6" fill="#FFFFFF" stroke={BLACK} strokeWidth="3.5" />
        <rect x="10" y="12" width="16" height="22" rx="2" fill={BLACK} />
        <ellipse cx="18" cy="12" rx="18" ry="9" fill={ORANGE} stroke={BLACK} strokeWidth="3" />
      </g>
      {/* Chopsticks */}
      <line x1="70" y1="8" x2="90" y2="78" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <line x1="76" y1="8" x2="84" y2="78" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

function TacoFlat() {
  return (
    <g>
      {/* Taco shell */}
      <path
        d="M10 68 Q10 28 50 20 Q90 28 90 68 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Fillings - lettuce peeking out */}
      <path
        d="M22 48 Q30 38 38 44 Q46 36 54 42 Q62 34 70 42 Q78 36 82 46"
        fill="#22C55E"
        stroke={BLACK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Meat */}
      <path
        d="M26 54 Q38 48 50 54 Q62 48 74 54 L72 62 Q60 56 50 62 Q40 56 28 62 Z"
        fill={BLACK}
        opacity="0.8"
      />
      {/* Cheese bits */}
      <circle cx="36" cy="42" r="3" fill={ORANGE} stroke={BLACK} strokeWidth="1.5" />
      <circle cx="56" cy="38" r="3" fill={ORANGE} stroke={BLACK} strokeWidth="1.5" />
      <circle cx="66" cy="44" r="2.5" fill={ORANGE} stroke={BLACK} strokeWidth="1.5" />
    </g>
  )
}

function BreakfastFlat() {
  return (
    <g>
      {/* Plate */}
      <ellipse cx="50" cy="58" rx="44" ry="30" fill="#FFFFFF" stroke={BLACK} strokeWidth="3.5" />
      {/* Egg */}
      <ellipse cx="38" cy="50" rx="18" ry="15" fill="#FFFFFF" stroke={BLACK} strokeWidth="3" />
      <circle cx="38" cy="48" r="8" fill={ORANGE} />
      {/* Bacon strips */}
      <path d="M60 38 Q65 42 60 48 Q65 52 60 56" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
      <path d="M72 36 Q77 40 72 46 Q77 50 72 54" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

function SeafoodFlat() {
  return (
    <g>
      {/* Shrimp body */}
      <path
        d="M30 28 Q60 18 72 30 Q80 42 72 56 Q60 68 42 66 Q28 62 24 50"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Shrimp segments */}
      <path d="M42 28 Q44 38 40 46" fill="none" stroke={BLACK} strokeWidth="2.5" />
      <path d="M54 24 Q54 36 50 46" fill="none" stroke={BLACK} strokeWidth="2.5" />
      <path d="M64 28 Q62 40 58 50" fill="none" stroke={BLACK} strokeWidth="2.5" />
      {/* Tail */}
      <path d="M24 50 Q14 44 10 50 Q14 56 24 52" fill={ORANGE} stroke={BLACK} strokeWidth="3" />
      {/* Eye */}
      <circle cx="72" cy="36" r="3" fill={BLACK} />
    </g>
  )
}

function LobsterRollFlat() {
  return (
    <g>
      {/* Bun */}
      <path
        d="M14 42 Q14 28 50 28 Q86 28 86 42 L86 68 Q86 76 50 76 Q14 76 14 68 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="4"
      />
      {/* Bun split line */}
      <path d="M20 42 L80 42" stroke={BLACK} strokeWidth="3" />
      {/* Lobster meat peeking out */}
      <path
        d="M22 42 Q30 32 38 38 Q46 30 54 36 Q62 28 70 34 Q78 30 82 38"
        fill="#FCA5A5"
        stroke={BLACK}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Butter drip */}
      <circle cx="50" cy="36" r="3" fill={ORANGE} />
      <circle cx="38" cy="34" r="2.5" fill={ORANGE} />
    </g>
  )
}

function PastaFlat() {
  return (
    <g>
      {/* Bowl */}
      <path
        d="M10 46 Q10 80 50 80 Q90 80 90 46 Z"
        fill="#FFFFFF"
        stroke={BLACK}
        strokeWidth="4"
      />
      {/* Pasta swirls */}
      <path d="M28 46 Q32 56 28 66" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
      <path d="M42 44 Q46 56 42 68" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
      <path d="M56 44 Q60 56 56 68" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
      <path d="M70 46 Q74 56 70 66" fill="none" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
      {/* Sauce on top */}
      <ellipse cx="50" cy="46" rx="30" ry="10" fill="#EF4444" stroke={BLACK} strokeWidth="2.5" />
    </g>
  )
}

function SaladFlat() {
  return (
    <g>
      {/* Bowl */}
      <path d="M10 48 Q10 82 50 82 Q90 82 90 48 Z" fill="#FFFFFF" stroke={BLACK} strokeWidth="4" />
      {/* Greens */}
      <path
        d="M18 48 Q28 38 38 46 Q48 36 58 44 Q68 34 78 44 Q84 40 88 48"
        fill="#22C55E"
        stroke={BLACK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Tomato */}
      <circle cx="36" cy="56" r="6" fill="#EF4444" stroke={BLACK} strokeWidth="2" />
      {/* Carrot */}
      <rect x="52" y="50" width="16" height="6" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="2" />
      {/* Egg slice */}
      <circle cx="64" cy="64" r="5" fill="#FFFFFF" stroke={BLACK} strokeWidth="2" />
      <circle cx="64" cy="64" r="2.5" fill={ORANGE} />
    </g>
  )
}

function DessertFlat() {
  return (
    <g>
      {/* Cake base */}
      <rect x="18" y="46" width="64" height="32" rx="6" fill={ORANGE} stroke={BLACK} strokeWidth="4" />
      {/* Frosting layer */}
      <path
        d="M18 46 Q30 36 42 44 Q54 34 66 42 Q78 34 82 44"
        fill="#FFFFFF"
        stroke={BLACK}
        strokeWidth="3"
      />
      {/* Cherry on top */}
      <circle cx="50" cy="28" r="8" fill="#EF4444" stroke={BLACK} strokeWidth="3" />
      <line x1="50" y1="20" x2="54" y2="14" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
      {/* Cake layers */}
      <line x1="22" y1="58" x2="78" y2="58" stroke={BLACK} strokeWidth="2" />
    </g>
  )
}

function CoffeeFlat() {
  return (
    <g>
      {/* Cup body */}
      <path d="M22 30 L28 82 Q50 88 72 82 L78 30 Z" fill="#FFFFFF" stroke={BLACK} strokeWidth="4" />
      {/* Coffee fill */}
      <path d="M24 40 L28 78 Q50 84 72 78 L76 40 Z" fill={ORANGE} />
      {/* Handle */}
      <path d="M78 40 Q92 40 92 54 Q92 68 78 68" fill="none" stroke={BLACK} strokeWidth="4" strokeLinecap="round" />
      {/* Steam */}
      <path d="M38 24 Q42 16 38 8" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M50 22 Q54 14 50 6" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M62 24 Q66 16 62 8" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </g>
  )
}

function CocktailFlat() {
  return (
    <g>
      {/* Glass triangle */}
      <path d="M22 20 L50 60 L78 20 Z" fill={ORANGE} stroke={BLACK} strokeWidth="4" strokeLinejoin="round" />
      {/* Stem */}
      <line x1="50" y1="60" x2="50" y2="78" stroke={BLACK} strokeWidth="4" />
      {/* Base */}
      <line x1="34" y1="78" x2="66" y2="78" stroke={BLACK} strokeWidth="5" strokeLinecap="round" />
      {/* Olive */}
      <circle cx="56" cy="34" r="5" fill="#22C55E" stroke={BLACK} strokeWidth="2.5" />
      {/* Olive stick */}
      <line x1="42" y1="20" x2="60" y2="38" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  )
}

function ChowderFlat() {
  return (
    <g>
      {/* Bowl */}
      <path d="M8 48 Q8 84 50 84 Q92 84 92 48 Z" fill="#FFFFFF" stroke={BLACK} strokeWidth="4" />
      {/* Chowder fill */}
      <path d="M12 48 Q12 78 50 78 Q88 78 88 48 Z" fill={ORANGE} opacity="0.6" />
      {/* Steam */}
      <path d="M34 40 Q38 30 34 20" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M50 38 Q54 28 50 18" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M66 40 Q70 30 66 20" fill="none" stroke={BLACK} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      {/* Crackers */}
      <rect x="30" y="46" width="12" height="8" rx="2" fill={ORANGE} stroke={BLACK} strokeWidth="2" />
      <rect x="56" y="44" width="14" height="8" rx="2" fill={ORANGE} stroke={BLACK} strokeWidth="2" />
    </g>
  )
}

function FriesFlat() {
  return (
    <g>
      {/* Container */}
      <path d="M24 42 L30 84 L70 84 L76 42 Z" fill="#EF4444" stroke={BLACK} strokeWidth="4" />
      {/* Fries sticking out */}
      <rect x="28" y="18" width="8" height="34" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="2.5" />
      <rect x="38" y="14" width="8" height="38" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="2.5" />
      <rect x="48" y="10" width="8" height="42" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="2.5" />
      <rect x="58" y="16" width="8" height="36" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="2.5" />
      <rect x="66" y="22" width="8" height="30" rx="3" fill={ORANGE} stroke={BLACK} strokeWidth="2.5" />
    </g>
  )
}

function TendysFlat() {
  return (
    <g>
      {/* Tender 1 */}
      <path
        d="M20 30 Q26 24 36 26 L56 38 Q60 42 56 48 L36 54 Q26 56 22 48 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="3.5"
      />
      {/* Tender 2 */}
      <path
        d="M36 46 Q42 40 52 42 L72 54 Q76 58 72 64 L52 70 Q42 72 38 64 Z"
        fill={ORANGE}
        stroke={BLACK}
        strokeWidth="3.5"
      />
      {/* Crispy bumps on tender 1 */}
      <circle cx="34" cy="36" r="3" fill={BLACK} opacity="0.2" />
      <circle cx="44" cy="40" r="2.5" fill={BLACK} opacity="0.2" />
      {/* Dipping sauce cup */}
      <path d="M62 72 Q62 86 74 86 Q86 86 86 72 Z" fill="#FFFFFF" stroke={BLACK} strokeWidth="3" />
      <ellipse cx="74" cy="72" rx="12" ry="4" fill="#EF4444" stroke={BLACK} strokeWidth="2" />
    </g>
  )
}

// Generic plate icon for unmapped categories
function GenericFlat() {
  return (
    <g>
      {/* Plate */}
      <ellipse cx="50" cy="56" rx="40" ry="28" fill="#FFFFFF" stroke={BLACK} strokeWidth="4" />
      {/* Fork */}
      <line x1="36" y1="32" x2="36" y2="56" stroke={BLACK} strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="32" x2="30" y2="44" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="32" x2="42" y2="44" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" />
      {/* Knife */}
      <line x1="64" y1="32" x2="64" y2="56" stroke={BLACK} strokeWidth="3.5" strokeLinecap="round" />
      {/* Food on plate */}
      <ellipse cx="50" cy="52" rx="18" ry="12" fill={ORANGE} stroke={BLACK} strokeWidth="2.5" />
    </g>
  )
}

// Map category IDs to flat icon components
const FLAT_ICON_MAP = {
  pizza: PizzaFlat,
  burger: BurgerFlat,
  sandwich: SandwichFlat,
  wings: WingsFlat,
  sushi: SushiFlat,
  taco: TacoFlat,
  breakfast: BreakfastFlat,
  seafood: SeafoodFlat,
  'lobster roll': LobsterRollFlat,
  chowder: ChowderFlat,
  pasta: PastaFlat,
  salad: SaladFlat,
  dessert: DessertFlat,
  coffee: CoffeeFlat,
  cocktails: CocktailFlat,
  fries: FriesFlat,
  tendys: TendysFlat,
}

/**
 * Flat two-tone food icon.
 * @param {string} category - Category ID (e.g., "pizza", "burger")
 * @param {number} size - Icon size in pixels (default 48)
 */
export function FlatFoodIcon({ category, size = 48 }) {
  const IconComponent = FLAT_ICON_MAP[category?.toLowerCase()] || GenericFlat
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
    >
      <IconComponent />
    </svg>
  )
}
