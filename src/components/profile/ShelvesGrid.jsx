import { useState } from 'react'
import { CreateShelfModal } from './CreateShelfModal'
import { ShelfDetailModal } from './ShelfDetailModal'

var SHELF_ICONS = {
  tried: '\u2705',
  want_to_try: '\uD83D\uDCCC',
  top_10: '\u2B50',
  custom: '\uD83D\uDCDA',
}

export function ShelvesGrid({ shelves, loading, onCreateShelf, onDeleteShelf, onRemoveItem }) {
  var [showCreate, setShowCreate] = useState(false)
  var [activeShelf, setActiveShelf] = useState(null)

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(function (i) {
            return (
              <div
                key={i}
                className="h-24 rounded-2xl animate-pulse"
                style={{ background: 'var(--color-surface-elevated)' }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  if (!shelves || shelves.length === 0) return null

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-bold"
          style={{ color: 'var(--color-text-primary)', fontSize: '17px', letterSpacing: '-0.01em' }}
        >
          My Shelves
        </h2>
        <button
          onClick={function () { setShowCreate(true) }}
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
            border: 'none',
          }}
        >
          + New
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shelves.map(function (shelf) {
          var icon = SHELF_ICONS[shelf.shelf_type] || SHELF_ICONS.custom
          return (
            <button
              key={shelf.shelf_id}
              onClick={function () { setActiveShelf(shelf) }}
              className="rounded-2xl border p-4 text-left"
              style={{
                background: 'var(--color-card)',
                borderColor: 'var(--color-divider)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span
                  className="font-bold truncate"
                  style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
                >
                  {shelf.shelf_name}
                </span>
              </div>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
                {shelf.item_count} {shelf.item_count === 1 ? 'dish' : 'dishes'}
              </p>
              {shelf.is_public && (
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'var(--color-accent-gold-muted)', color: 'var(--color-accent-gold)' }}
                >
                  Public
                </span>
              )}
            </button>
          )
        })}
      </div>

      {showCreate && (
        <CreateShelfModal
          onClose={function () { setShowCreate(false) }}
          onCreate={function (params) {
            onCreateShelf(params)
            setShowCreate(false)
          }}
        />
      )}

      {activeShelf && (
        <ShelfDetailModal
          shelf={activeShelf}
          onClose={function () { setActiveShelf(null) }}
          onDelete={!activeShelf.is_default ? function () {
            onDeleteShelf(activeShelf.shelf_id)
            setActiveShelf(null)
          } : null}
          onRemoveItem={onRemoveItem}
        />
      )}
    </div>
  )
}

export default ShelvesGrid
