import { memo } from 'react'

export var CuratorCard = memo(function CuratorCard({ curator, onClick }) {
  var specialtyColors = {
    food: 'var(--color-accent-gold)',
    cocktails: 'var(--color-primary)',
    wine: 'var(--color-medal-gold)',
  }

  var tagColor = specialtyColors[curator.specialty] || 'var(--color-accent-gold)'

  return (
    <button
      className="flex flex-col items-center text-center flex-shrink-0 w-20"
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      onClick={function () { onClick(curator) }}
    >
      <div
        className="w-14 h-14 rounded-full mb-1 flex-shrink-0"
        style={{
          background: curator.photo_url
            ? 'url(' + curator.photo_url + ') center/cover'
            : 'var(--color-surface)',
          border: '2px solid ' + tagColor,
        }}
      />
      <span
        className="text-xs font-semibold truncate w-full"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {curator.curator_name}
      </span>
      <span
        className="text-xs capitalize"
        style={{ color: tagColor }}
      >
        {curator.specialty}
      </span>
    </button>
  )
})

export default CuratorCard
