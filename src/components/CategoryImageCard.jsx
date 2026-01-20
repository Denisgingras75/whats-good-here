/**
 * CategoryImageCard - Premium image-based category selector
 *
 * Design: Circular containers on warm charcoal surface
 * Warm-neutral shadows create grounded "resting on surface" feel
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
        flex flex-col items-center gap-1.5
        w-full
        transition-all duration-200
        active:scale-[0.97]
      "
    >
      {/* Circular container - warm-neutral shadows for grounded feel */}
      <div
        className="
          relative w-[85%] aspect-square
          rounded-full
          overflow-hidden
          transition-all duration-200
        "
        style={{
          border: '2px solid #1a1816',
          background: '#131211',
          boxShadow: isActive
            ? `
              0 8px 24px rgba(30,25,20,0.7),
              0 2px 6px rgba(25,20,15,0.5),
              0 0 0 2px var(--color-primary),
              0 0 20px rgba(244, 162, 97, 0.3),
              inset 0 1px 2px rgba(255,250,245,0.05)
            `
            : `
              0 8px 24px rgba(30,25,20,0.7),
              0 2px 6px rgba(25,20,15,0.5),
              inset 0 1px 2px rgba(255,250,245,0.05)
            `,
        }}
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
          <div className="w-full h-full" style={{ background: '#131211' }} />
        )}
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
