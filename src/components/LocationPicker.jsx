const RADIUS_OPTIONS = [1, 5, 10, 20]

export function LocationPicker({ radius, onRadiusChange, location, error }) {
  return (
    <div className="bg-white border-b border-neutral-200 py-4 px-4">
      <div className="flex items-center justify-between gap-4">
        {/* Location Status */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {error ? (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <span className="text-base flex-shrink-0">⚠️</span>
              <span className="text-xs font-medium truncate">{error}</span>
            </div>
          ) : location ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">📍</span>
              </div>
              <p className="text-sm font-semibold text-neutral-900">Near you</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center animate-pulse">
                <span className="text-neutral-400 text-sm">📍</span>
              </div>
              <p className="text-sm font-medium text-neutral-500">Getting location...</p>
            </div>
          )}
        </div>

        {/* Radius Selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label htmlFor="radius" className="text-xs font-semibold text-neutral-600 whitespace-nowrap">
            Radius:
          </label>
          <div className="relative">
            <select
              id="radius"
              value={radius}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="
                appearance-none
                pl-3 pr-8 py-2
                bg-white text-neutral-900
                border-2 border-neutral-200
                rounded-lg
                text-sm font-semibold
                focus-ring
                hover:border-orange-300
                transition-colors
                cursor-pointer
              "
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} {r === 1 ? 'mi' : 'mi'}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-neutral-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
