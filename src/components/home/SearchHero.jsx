import { DishSearch } from '../DishSearch'

/**
 * SearchHero - Hero section with value proposition, search, and category scroll
 */
export function SearchHero({ town, loading, categoryScroll }) {
  return (
    <section
      className="pt-8 pb-5"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="mb-5 text-center px-4">
        <h1
          className="font-bold mb-1"
          style={{
            color: 'var(--color-primary)',
            fontSize: '22px',
            letterSpacing: '-0.02em',
          }}
        >
          What's Good Here
        </h1>
        {/* Decorative wave underline */}
        <svg
          className="mx-auto mb-1"
          width="120"
          height="8"
          viewBox="0 0 120 8"
          fill="none"
          style={{ opacity: 0.26 }}
        >
          <path
            d="M0 4 C10 1, 20 7, 30 4 S50 1, 60 4 S80 7, 90 4 S110 1, 120 4"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <p
          style={{
            color: '#F07A52',
            fontSize: '13px',
          }}
        >
          the #1 bite near you
        </p>
      </div>

      <div className="px-4">
        <DishSearch loading={loading} placeholder="What are you craving?" town={town} />
      </div>

      {categoryScroll && (
        <div className="mt-4">
          {categoryScroll}
        </div>
      )}
    </section>
  )
}
