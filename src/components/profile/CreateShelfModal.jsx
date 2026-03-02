import { useState, useEffect, useCallback } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

export function CreateShelfModal({ onClose, onCreate }) {
  var focusRef = useFocusTrap()
  var [name, setName] = useState('')
  var [description, setDescription] = useState('')
  var [isPublic, setIsPublic] = useState(false)

  var handleKeyDown = useCallback(function (e) {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(function () {
    document.addEventListener('keydown', handleKeyDown)
    return function () { document.removeEventListener('keydown', handleKeyDown) }
  }, [handleKeyDown])

  var handleSubmit = function (e) {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name: name.trim(), description: description.trim(), isPublic })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={function (e) { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={focusRef}
        className="w-full max-w-lg rounded-t-3xl p-6"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-bold"
            style={{ color: 'var(--color-text-primary)', fontSize: '20px', letterSpacing: '-0.02em' }}
          >
            New Shelf
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-surface-elevated)', color: 'var(--color-text-tertiary)' }}
          >
            {'\u2715'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={function (e) { setName(e.target.value) }}
              placeholder="Best Date Spots"
              maxLength={50}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                background: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-divider)',
                color: 'var(--color-text-primary)',
                fontSize: '15px',
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={function (e) { setDescription(e.target.value) }}
              placeholder="My favorite spots for a night out"
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border"
              style={{
                background: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-divider)',
                color: 'var(--color-text-primary)',
                fontSize: '15px',
              }}
            />
          </div>

          <button
            type="button"
            onClick={function () { setIsPublic(!isPublic) }}
            className="w-full px-4 py-3 flex items-center justify-between rounded-xl border"
            style={{
              background: 'var(--color-surface-elevated)',
              borderColor: 'var(--color-divider)',
            }}
          >
            <span className="font-medium" style={{ color: 'var(--color-text-primary)', fontSize: '15px' }}>
              Make public
            </span>
            <div
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: isPublic ? 'var(--color-primary)' : 'var(--color-surface)' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: isPublic ? '22px' : '2px' }}
              />
            </div>
          </button>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-base"
            style={{
              background: name.trim() ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
              color: name.trim() ? 'var(--color-text-on-primary)' : 'var(--color-text-tertiary)',
              border: 'none',
            }}
          >
            Create Shelf
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateShelfModal
