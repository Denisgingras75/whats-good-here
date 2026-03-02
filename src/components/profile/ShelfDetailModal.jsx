import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useShelfItems } from '../../hooks/useShelves'
import { CategoryIcon } from '../home/CategoryIcons'

export function ShelfDetailModal({ shelf, onClose, onDelete, onRemoveItem }) {
  var focusRef = useFocusTrap()
  var navigate = useNavigate()
  var { items, loading } = useShelfItems(shelf.shelf_id)

  var handleKeyDown = useCallback(function (e) {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(function () {
    document.addEventListener('keydown', handleKeyDown)
    return function () { document.removeEventListener('keydown', handleKeyDown) }
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={function (e) { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={focusRef}
        className="w-full max-w-lg rounded-t-3xl"
        style={{ background: 'var(--color-bg)', maxHeight: '80vh', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2
              className="font-bold"
              style={{ color: 'var(--color-text-primary)', fontSize: '20px', letterSpacing: '-0.02em' }}
            >
              {shelf.shelf_name}
            </h2>
            {shelf.shelf_description && (
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }} className="mt-0.5">
                {shelf.shelf_description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-tertiary)' }}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Items */}
        <div className="overflow-y-auto px-5 pb-5" style={{ maxHeight: 'calc(80vh - 120px)' }}>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(function (i) {
                return (
                  <div
                    key={i}
                    className="h-16 rounded-xl animate-pulse"
                    style={{ background: 'var(--color-surface-elevated)' }}
                  />
                )
              })}
            </div>
          ) : items.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-divider)' }}
            >
              <p className="font-semibold" style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
                No dishes yet
              </p>
              <p className="mt-1" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                Add dishes from any dish page
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map(function (item) {
                return (
                  <div
                    key={item.item_id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--color-card)', border: '1px solid var(--color-divider)' }}
                  >
                    <button
                      onClick={function () {
                        onClose()
                        navigate('/dish/' + item.dish_id)
                      }}
                      className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-category-strip)', border: 'none' }}
                    >
                      {item.dish_photo_url ? (
                        <img src={item.dish_photo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <CategoryIcon categoryId={item.dish_category} dishName={item.dish_name} size={24} />
                      )}
                    </button>

                    <button
                      onClick={function () {
                        onClose()
                        navigate('/dish/' + item.dish_id)
                      }}
                      className="flex-1 min-w-0 text-left"
                      style={{ border: 'none', background: 'none', padding: 0 }}
                    >
                      <div
                        className="font-bold truncate"
                        style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}
                      >
                        {item.dish_name}
                      </div>
                      <div
                        className="truncate"
                        style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}
                      >
                        {item.restaurant_name}
                      </div>
                    </button>

                    {onRemoveItem && (
                      <button
                        onClick={function () { onRemoveItem(shelf.shelf_id, item.dish_id) }}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-tertiary)', border: 'none' }}
                      >
                        {'\u2715'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Delete button for custom shelves */}
        {onDelete && (
          <div className="px-5 pb-5">
            <button
              onClick={function () {
                if (window.confirm('Delete this shelf? Items will be removed.')) {
                  onDelete()
                }
              }}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ color: 'var(--color-danger, #ef4444)', background: 'none', border: 'none' }}
            >
              Delete Shelf
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShelfDetailModal
