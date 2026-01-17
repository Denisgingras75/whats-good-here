export function PastaSVG({ eatenPercent, value }) {
  // For pasta, we'll show a plate/bowl with spaghetti that disappears as eaten
  // The pasta strands will reduce and the plate will empty

  const pastaLevel = 1 - eatenPercent // 1 = full, 0 = empty

  // Sauce splatters that appear as pasta is eaten messily
  const sauceSplatters = eatenPercent > 0.15 ? [
    { x: 20 + eatenPercent * 10, y: 35 - eatenPercent * 5, size: 2 + eatenPercent * 2 },
    { x: 75 - eatenPercent * 8, y: 40 + eatenPercent * 5, size: 1.5 + eatenPercent * 1.5 },
    { x: 30, y: 70 + eatenPercent * 3, size: 1.8 },
  ] : []

  // Generate spaghetti strands - fewer as more is eaten
  const generateStrands = () => {
    const strands = []
    const numStrands = Math.floor(pastaLevel * 12) + (pastaLevel > 0.1 ? 2 : 0)

    for (let i = 0; i < numStrands; i++) {
      const startX = 25 + (i * 4) + Math.sin(i * 2) * 3
      const startY = 35 + Math.cos(i * 1.5) * 5
      const midX = startX + Math.sin(i * 3) * 8
      const midY = startY + 15 + Math.cos(i * 2) * 5
      const endX = startX + Math.sin(i * 2.5) * 12
      const endY = 70 + Math.sin(i) * 5

      strands.push(
        <path
          key={`strand-${i}`}
          d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
          fill="none"
          stroke="#F5DEB3"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.9}
        />
      )
    }
    return strands
  }

  // Generate meatballs - fewer as eaten
  const generateMeatballs = () => {
    const positions = [
      { x: 35, y: 50 },
      { x: 55, y: 45 },
      { x: 68, y: 55 },
      { x: 45, y: 62 },
      { x: 60, y: 65 },
    ]

    const numMeatballs = Math.floor(pastaLevel * positions.length)
    return positions.slice(0, numMeatballs).map((pos, i) => (
      <g key={`meatball-${i}`}>
        <circle cx={pos.x} cy={pos.y} r="7" fill="#5D4037" />
        <circle cx={pos.x} cy={pos.y} r="5.5" fill="#6D4C41" />
        <circle cx={pos.x - 2} cy={pos.y - 2} r="2" fill="#8D6E63" opacity="0.5" />
      </g>
    ))
  }

  return (
    <>
      <defs>
        {/* Plate gradient */}
        <linearGradient id="plate-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </linearGradient>

        {/* Sauce gradient */}
        <radialGradient id="sauce-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D32F2F" />
          <stop offset="100%" stopColor="#B71C1C" />
        </radialGradient>

        {/* Bowl inner shadow */}
        <radialGradient id="bowl-shadow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </radialGradient>
      </defs>

      {/* Plate shadow */}
      <ellipse
        cx="50"
        cy="88"
        rx={35}
        ry={6}
        fill="rgba(0,0,0,0.15)"
      />

      {/* Plate/bowl base */}
      <ellipse cx="50" cy="70" rx="42" ry="12" fill="url(#plate-gradient)" />

      {/* Bowl rim */}
      <ellipse cx="50" cy="30" rx="42" ry="14" fill="url(#plate-gradient)" />

      {/* Bowl inner area */}
      <ellipse cx="50" cy="32" rx="38" ry="11" fill="#F5F5F5" />

      {/* Bowl depth/sides */}
      <path
        d="M 8 30 Q 8 70 50 70 Q 92 70 92 30"
        fill="url(#plate-gradient)"
      />

      {/* Inner bowl shadow */}
      <ellipse cx="50" cy="50" rx="35" ry="20" fill="url(#bowl-shadow)" />

      {/* Tomato sauce layer - reduces as eaten */}
      {pastaLevel > 0.1 && (
        <ellipse
          cx="50"
          cy={50 + (1 - pastaLevel) * 10}
          rx={32 * pastaLevel + 5}
          ry={15 * pastaLevel + 3}
          fill="url(#sauce-gradient)"
          opacity={0.8}
        />
      )}

      {/* Spaghetti strands */}
      {pastaLevel > 0.05 && generateStrands()}

      {/* Meatballs */}
      {pastaLevel > 0.1 && generateMeatballs()}

      {/* Parmesan cheese sprinkle */}
      {pastaLevel > 0.3 && (
        <g opacity={pastaLevel}>
          <circle cx="40" cy="48" r="1" fill="#FFF9C4" />
          <circle cx="52" cy="42" r="1.2" fill="#FFF9C4" />
          <circle cx="58" cy="52" r="1" fill="#FFF9C4" />
          <circle cx="45" cy="55" r="0.8" fill="#FFF9C4" />
          <circle cx="62" cy="48" r="1" fill="#FFF9C4" />
          <circle cx="38" cy="58" r="0.8" fill="#FFF9C4" />
        </g>
      )}

      {/* Basil leaves */}
      {pastaLevel > 0.5 && (
        <g opacity={pastaLevel}>
          <ellipse cx="48" cy="40" rx="4" ry="2.5" fill="#4CAF50" transform="rotate(-20 48 40)" />
          <ellipse cx="56" cy="58" rx="3" ry="2" fill="#4CAF50" transform="rotate(15 56 58)" />
        </g>
      )}

      {/* Fork with pasta twirl - appears when partially eaten */}
      {eatenPercent > 0.1 && eatenPercent < 0.9 && (
        <g transform={`translate(${70 + eatenPercent * 10}, ${20 - eatenPercent * 5}) rotate(${-30 + eatenPercent * 20})`}>
          {/* Fork handle */}
          <rect x="-2" y="-35" width="4" height="30" rx="2" fill="#9E9E9E" />
          {/* Fork tines */}
          <rect x="-6" y="-8" width="2" height="12" rx="1" fill="#BDBDBD" />
          <rect x="-2" y="-8" width="2" height="14" rx="1" fill="#BDBDBD" />
          <rect x="2" y="-8" width="2" height="12" rx="1" fill="#BDBDBD" />
          {/* Pasta twirl on fork */}
          <ellipse cx="0" cy="8" rx="8" ry="5" fill="#F5DEB3" />
          <path d="M -6 6 Q 0 12 6 6" fill="none" stroke="#E8D5B7" strokeWidth="2" />
          {/* Sauce on twirl */}
          <ellipse cx="0" cy="10" rx="5" ry="3" fill="#D32F2F" opacity="0.6" />
        </g>
      )}

      {/* Empty plate shine when fully eaten */}
      {value >= 9.5 && (
        <ellipse cx="45" cy="50" rx="15" ry="8" fill="white" opacity="0.3" />
      )}

      {/* Sauce splatters on bowl rim - messy eating */}
      {sauceSplatters.map((splat, i) => (
        <g key={`splat-${i}`}>
          <circle cx={splat.x} cy={splat.y} r={splat.size} fill="#D32F2F" opacity="0.5" />
          <circle cx={splat.x + splat.size * 0.3} cy={splat.y - splat.size * 0.2} r={splat.size * 0.4} fill="#B71C1C" opacity="0.4" />
        </g>
      ))}

      {/* Sauce drip on side of bowl */}
      {eatenPercent > 0.2 && eatenPercent < 0.9 && (
        <path
          d={`M 15 50 Q 12 ${55 + eatenPercent * 10} 14 ${60 + eatenPercent * 12}`}
          fill="none"
          stroke="#D32F2F"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      )}

      {/* Pasta strand hanging from fork */}
      {eatenPercent > 0.1 && eatenPercent < 0.9 && (
        <g>
          {/* Strand connecting fork to bowl */}
          <path
            d={`M ${70 + eatenPercent * 10} ${20 - eatenPercent * 5}
               Q ${60 + eatenPercent * 5} ${35} ${55} ${45 + (1 - pastaLevel) * 5}`}
            fill="none"
            stroke="#F5DEB3"
            strokeWidth="2"
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* Another loose strand */}
          <path
            d={`M ${72 + eatenPercent * 10} ${22 - eatenPercent * 5}
               Q ${65 + eatenPercent * 3} ${40} ${50} ${50 + (1 - pastaLevel) * 5}`}
            fill="none"
            stroke="#E8D5B7"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.5}
          />
        </g>
      )}

      {/* Sauce smear on plate rim */}
      {eatenPercent > 0.4 && (
        <ellipse
          cx={25 + eatenPercent * 5}
          cy="72"
          rx={4 + eatenPercent * 3}
          ry="2"
          fill="#D32F2F"
          opacity={0.25}
        />
      )}
    </>
  )
}
