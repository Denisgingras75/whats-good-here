import { useSpecials } from '../hooks/useSpecials'
import { SpecialCard } from '../components/SpecialCard'

export function Discover() {
  const { specials, loading, error } = useSpecials()

  return (
    <div className="min-h-screen pb-24" style={{ background: '#FFFFFF' }}>
      <h1 className="sr-only">Discover Specials</h1>

      {/* Header */}
      <header className="px-4 pt-6 pb-4" style={{ background: '#FFFFFF', borderBottom: '2px solid #1A1A1A' }}>
        <h2
          style={{
            fontFamily: "'aglet-sans', sans-serif",
            fontWeight: 800,
            fontSize: '32px',
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
          }}
        >
          Discover
        </h2>
        <p className="text-sm mt-1" style={{ color: '#999999' }}>
          Specials & deals from island restaurants
        </p>
      </header>

      {/* Content */}
      <div className="px-4 py-4">
        {error ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: '#E4440A' }}>
              {error?.message || 'Unable to load specials'}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl animate-pulse"
                style={{ background: '#F5F5F5', border: '2px solid #E0E0E0' }}
              />
            ))}
          </div>
        ) : specials.length > 0 ? (
          <div className="space-y-3">
            {specials.map((special) => (
              <SpecialCard key={special.id} special={special} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E0E0E0',
            }}
          >
            <img src="/empty-plate.png" alt="" className="w-14 h-14 mx-auto mb-3 rounded-full object-cover" />
            <h3
              className="text-lg"
              style={{
                fontFamily: "'aglet-sans', sans-serif",
                fontWeight: 800,
                color: '#1A1A1A',
              }}
            >
              No specials yet
            </h3>
            <p className="text-sm mt-1" style={{ color: '#BBBBBB' }}>
              Check back soon for deals from local restaurants
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
