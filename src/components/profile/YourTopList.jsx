import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DishListItem } from '../DishListItem'
import { SectionHeader } from '../SectionHeader'

export function YourTopList({ votes }) {
  var navigate = useNavigate()
  var [selectedCategory, setSelectedCategory] = useState(null)
  var [showAll, setShowAll] = useState(false)

  // Get unique categories from user's votes
  var categories = useMemo(function () {
    if (!votes || votes.length === 0) return []
    var cats = {}
    votes.forEach(function (v) {
      var cat = v.category || v.dish_category
      if (cat) cats[cat] = (cats[cat] || 0) + 1
    })
    return Object.keys(cats).sort()
  }, [votes])

  // Filter and sort
  var topDishes = useMemo(function () {
    if (!votes || votes.length === 0) return []
    var filtered = votes
    if (selectedCategory) {
      filtered = votes.filter(function (v) {
        var cat = v.category || v.dish_category
        return cat && cat.toLowerCase() === selectedCategory.toLowerCase()
      })
    }
    var sorted = filtered.slice().sort(function (a, b) {
      return (b.rating_10 || 0) - (a.rating_10 || 0)
    })
    return showAll ? sorted : sorted.slice(0, 10)
  }, [votes, selectedCategory, showAll])

  if (!votes || votes.length === 0) return null

  return (
    <div className="px-4 pb-4">
      <SectionHeader title={selectedCategory
        ? 'Your Top ' + (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1))
        : 'Your Top 10'
      } />

      {/* Category chips */}
      {categories.length > 1 && (
        <div
          className="flex gap-2 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
            style={{
              background: !selectedCategory ? 'var(--color-accent-gold)' : 'var(--color-surface)',
              color: !selectedCategory ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={function () { setSelectedCategory(null) }}
          >
            All
          </button>
          {categories.map(function (cat) {
            return (
              <button
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 capitalize"
                style={{
                  background: selectedCategory === cat ? 'var(--color-accent-gold)' : 'var(--color-surface)',
                  color: selectedCategory === cat ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={function () { setSelectedCategory(cat) }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Dish list */}
      <div className="flex flex-col" style={{ gap: '2px' }}>
        {topDishes.map(function (dish, i) {
          return (
            <DishListItem
              key={dish.dish_id || dish.id}
              dish={dish}
              rank={i + 1}
              onClick={function () { navigate('/dish/' + (dish.dish_id || dish.id)) }}
            />
          )
        })}
      </div>

      {/* See all toggle */}
      {!showAll && votes.length > 10 && (
        <button
          className="w-full py-2 mt-2 text-sm font-medium"
          style={{
            color: 'var(--color-accent-gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={function () { setShowAll(true) }}
        >
          See All ({votes.length})
        </button>
      )}
    </div>
  )
}

export default YourTopList
