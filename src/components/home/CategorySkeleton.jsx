// Loading skeleton for category section
export function CategorySkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading category">
      <div className="h-6 w-48 rounded mb-3" style={{ background: 'var(--color-divider)' }} />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl"
            style={{ background: 'var(--color-divider)' }}
          />
        ))}
      </div>
    </div>
  )
}
