var steps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Rate dishes you love',
    desc: 'Score any dish 1\u201310. Quick, honest, done.'
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'See what locals recommend',
    desc: 'Real ratings from people who eat here.'
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Find the best food on MV',
    desc: 'Skip the guesswork. Eat what\u2019s actually good.'
  }
]

export function HowItWorks() {
  return (
    <div className="px-4 pt-6 pb-4">
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px'
        }}
      >
        How it works
      </p>
      <div className="flex flex-col" style={{ gap: '14px' }}>
        {steps.map(function (step, i) {
          return (
            <div key={i} className="flex items-start" style={{ gap: '12px' }}>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--color-primary-muted)',
                  color: 'var(--color-primary)'
                }}
              >
                {step.icon}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  {step.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HowItWorks
