const CATEGORIES = [
  { id: null, label: 'All Dishes', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop&q=80' },
  { id: 'burger', label: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop&q=80' },
  { id: 'sandwich', label: 'Sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=100&h=100&fit=crop&q=80' },
  { id: 'breakfast sandwich', label: 'Breakfast Sandwiches', image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=100&h=100&fit=crop&q=80' },
  { id: 'pizza', label: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop&q=80' },
  { id: 'pasta', label: 'Pasta', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100&h=100&fit=crop&q=80' },
  { id: 'sushi', label: 'Sushi', image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop&q=80' },
  { id: 'pokebowl', label: 'Poke Bowls', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&q=80' },
  { id: 'taco', label: 'Tacos', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100&h=100&fit=crop&q=80' },
  { id: 'wings', label: 'Wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=100&h=100&fit=crop&q=80' },
  { id: 'tendys', label: 'Tendys', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=100&h=100&fit=crop&q=80' },
  { id: 'lobster roll', label: 'Lobster Rolls', image: 'https://images.unsplash.com/photo-1625595117865-037d82c7cac3?w=100&h=100&fit=crop&q=80' },
  { id: 'lobster', label: 'Lobster', image: 'https://images.unsplash.com/photo-1559737558-2f5a767d75e2?w=100&h=100&fit=crop&q=80' },
  { id: 'fish', label: 'Fish', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&h=100&fit=crop&q=80' },
  { id: 'chowder', label: 'Chowder', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop&q=80' },
  { id: 'breakfast', label: 'Breakfast', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=100&h=100&fit=crop&q=80' },
  { id: 'salad', label: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&h=100&fit=crop&q=80' },
  { id: 'fries', label: 'Fries', image: 'https://images.unsplash.com/photo-1630431341973-02e1d0c417ee?w=100&h=100&fit=crop&q=80' },
  { id: 'apps', label: 'Apps', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=100&h=100&fit=crop&q=80' },
  { id: 'fried chicken', label: 'Fried Chicken', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100&h=100&fit=crop&q=80' },
  { id: 'entree', label: 'Entrees', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=100&h=100&fit=crop&q=80' },
]

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="sticky top-0 z-20 glass-header border-b border-neutral-200/60">
      <div className="relative">
        {/* Fade edges for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/90 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent pointer-events-none z-10" />

        {/* Scrollable category chips */}
        <div className="overflow-x-auto scrollbar-hide smooth-scroll">
          <div className="flex gap-2 px-4 py-4 min-w-max">
            {CATEGORIES.map((category, index) => (
              <button
                key={category.id || 'all'}
                onClick={() => onSelectCategory(category.id)}
                className={`
                  flex items-center gap-2
                  px-4 py-2 rounded-full
                  font-semibold text-sm whitespace-nowrap
                  transition-all duration-200 ease-out
                  focus-ring
                  ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-orange-300 hover:bg-orange-50 shadow-sm'
                  }
                `}
                style={{
                  animationDelay: `${index * 0.03}s`,
                }}
              >
                <img
                  src={category.image}
                  alt={category.label}
                  className="w-6 h-6 rounded-full object-cover"
                  loading="lazy"
                />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active category indicator text (optional) */}
      {selectedCategory && (
        <div className="px-4 pb-3 pt-1">
          <p className="text-xs text-neutral-500 font-medium">
            Showing {CATEGORIES.find(c => c.id === selectedCategory)?.label.toLowerCase() || 'all dishes'}
          </p>
        </div>
      )}
    </div>
  )
}
