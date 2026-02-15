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
          width="150"
          height="8"
          viewBox="0 0 150 8"
          fill="none"
          style={{ opacity: 0.26 }}
        >
          <path
            d="M0 4 C12 1, 25 7, 37 4 S62 1, 75 4 S100 7, 112 4 S137 1, 150 4"
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
