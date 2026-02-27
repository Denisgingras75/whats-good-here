import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCuratorPicks, useCuratorListCategories } from '../hooks/useCurators'
import { curatorsApi } from '../api/curatorsApi'
import { useQuery } from '@tanstack/react-query'
import { DishListItem } from '../components/DishListItem'
import { SectionHeader } from '../components/SectionHeader'

export function CuratorDetail() {
  var { curatorId } = useParams()
  var navigate = useNavigate()
  var [selectedCategory, setSelectedCategory] = useState(undefined)

  // Fetch all curators and find this one
  var { data: curators } = useQuery({
    queryKey: ['curators'],
    queryFn: function () { return curatorsApi.getCurators() },
    staleTime: 1000 * 60 * 10,
  })
  var curator = curators && curators.find(function (c) { return c.curator_id === curatorId })

  // Fetch picks for selected category
  var listCategoryParam = selectedCategory === undefined ? null : selectedCategory
  var { picks, loading: picksLoading } = useCuratorPicks(curatorId, listCategoryParam)
  var { categories } = useCuratorListCategories(curatorId)

  if (!curator) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Back button */}
      <div className="px-4 pt-4">
        <button
          className="text-sm font-medium"
          style={{ color: 'var(--color-accent-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={function () { navigate(-1) }}
        >
          &larr; Back
        </button>
      </div>

      {/* Curator header */}
      <div className="flex flex-col items-center text-center px-4 pt-4 pb-6">
        <div
          className="w-20 h-20 rounded-full mb-3"
          style={{
            background: curator.photo_url
              ? 'url(' + curator.photo_url + ') center/cover'
              : 'var(--color-surface)',
            border: '3px solid var(--color-accent-gold)',
          }}
        />
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {curator.curator_name}
        </h1>
        {curator.bio && (
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {curator.bio}
          </p>
        )}
        <span
          className="text-xs font-semibold mt-2 px-3 py-1 rounded-full capitalize"
          style={{
            color: 'var(--color-accent-gold)',
            background: 'var(--color-surface)',
          }}
        >
          {curator.specialty}
        </span>
      </div>

      {/* Category tabs (if multiple lists) */}
      {categories.length > 1 && (
        <div
          className="flex gap-2 px-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map(function (cat) {
            var isSelected = (selectedCategory === undefined && cat.list_category === null)
              || selectedCategory === cat.list_category
            return (
              <button
                key={cat.list_category || 'overall'}
                className="px-3 py-1 rounded-full text-sm font-medium flex-shrink-0"
                style={{
                  background: isSelected ? 'var(--color-accent-gold)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={function () {
                  setSelectedCategory(cat.list_category === null ? undefined : cat.list_category)
                }}
              >
                {cat.list_category || 'Top 10'}
              </button>
            )
          })}
        </div>
      )}

      {/* Picks list */}
      <div className="px-4">
        <SectionHeader
          title={selectedCategory
            ? curator.curator_name + "'s Top " + (selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1))
            : curator.curator_name + "'s Top 10"
          }
        />
        {picksLoading ? (
          <div className="animate-pulse">
            {[0, 1, 2, 3, 4].map(function (i) {
              return (
                <div key={i} className="flex items-center gap-3 py-3 px-3">
                  <div className="w-7 h-5 rounded" style={{ background: 'var(--color-divider)' }} />
                  <div className="flex-1">
                    <div className="h-4 w-28 rounded mb-1" style={{ background: 'var(--color-divider)' }} />
                    <div className="h-3 w-20 rounded" style={{ background: 'var(--color-divider)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {picks.map(function (pick) {
              return (
                <div key={pick.pick_id}>
                  <DishListItem
                    dish={{
                      dish_id: pick.dish_id,
                      dish_name: pick.dish_name,
                      category: pick.category,
                      price: pick.price,
                      photo_url: pick.photo_url,
                      restaurant_name: pick.restaurant_name,
                      restaurant_town: pick.restaurant_town,
                      avg_rating: pick.avg_rating,
                      total_votes: pick.total_votes,
                    }}
                    rank={pick.rank_position}
                    onClick={function () { navigate('/dish/' + pick.dish_id) }}
                  />
                  {pick.blurb && (
                    <p
                      className="text-sm italic px-12 pb-2"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      &ldquo;{pick.blurb}&rdquo;
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CuratorDetail
