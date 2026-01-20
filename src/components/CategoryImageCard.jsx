/**
 * CategoryImageCard - Premium image-based category selector
 *
 * Uses real image assets, not SVGs or icons.
 * Feels editorial and curated, like a food magazine.
 */

// Category image mappings
const CATEGORY_IMAGES = {
  pizza: '/categories/pizza.webp',
  burger: '/categories/burgers.webp',
  taco: '/categories/tacos.webp',
  wings: '/categories/wings.webp',
  sushi: '/categories/sushi.webp',
  breakfast: '/categories/breakfast.webp',
  'lobster roll': '/categories/lobster-rolls.webp',
  seafood: '/categories/seafood.webp',
  chowder: '/categories/chowder.webp',
  pasta: '/categories/pasta.webp',
  steak: '/categories/steak.webp',
  sandwich: '/categories/sandwiches.webp',
  salad: '/categories/salads.webp',
  tendys: '/categories/tendys.webp',
}

export function CategoryImageCard({
  category,
  isActive = false,
  onClick,
}) {
  const imageSrc = CATEGORY_IMAGES[category.id] || null

  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center gap-2
        w-full
        transition-all duration-200
        active:scale-[0.97]
      "
    >
      {/* Image container with vignette blend */}
      <div
        className="
          relative w-full aspect-square
          overflow-hidden
          transition-all duration-200
        "
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={category.label}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: '#1A1A1A' }} />
        )}

        {/* Vignette overlay - fades edges into background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 30%, rgba(18, 18, 18, 0.6) 70%, rgba(18, 18, 18, 0.95) 100%)`,
            boxShadow: isActive
              ? 'inset 0 0 0 2px var(--color-primary)'
              : 'none',
            borderRadius: '16px',
          }}
        />
      </div>

      {/* Label below image */}
      <span
        className="text-xs font-medium"
        style={{
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'
        }}
      >
        {category.label}
      </span>
    </button>
  )
}

export default CategoryImageCard
