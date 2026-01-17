export function SandwichSVG({ eatenPercent, value }) {
  // Calculate how far the bite has progressed (from right side)
  const biteX = 92 - (eatenPercent * 80)

  // Generate irregular bite path with realistic teeth impressions
  const generateBitePath = (x) => {
    const teeth = [
      { y: 22, depth: 6 + Math.sin(x * 0.4) * 3 },
      { y: 30, depth: 9 + Math.cos(x * 0.3) * 2 },
      { y: 40, depth: 7 + Math.sin(x * 0.5) * 4 },
      { y: 50, depth: 10 + Math.cos(x * 0.4) * 3 },
      { y: 60, depth: 8 + Math.sin(x * 0.6) * 3 },
      { y: 70, depth: 9 + Math.cos(x * 0.5) * 2 },
      { y: 78, depth: 6 + Math.sin(x * 0.3) * 3 },
    ]

    let path = `M ${x} 0 L ${x} 18`
    teeth.forEach((tooth, i) => {
      const nextY = i < teeth.length - 1 ? teeth[i + 1].y : 82
      path += ` Q ${x - tooth.depth} ${tooth.y}, ${x - tooth.depth * 0.4} ${(tooth.y + nextY) / 2}`
    })
    path += ` L ${x} 100 L 0 100 L 0 0 Z`
    return path
  }

  // Filling pieces that shift/fall as sandwich is eaten
  const fallingCrumbs = eatenPercent > 0.1 ? [
    { x: biteX - 3, y: 82 + eatenPercent * 5, size: 1.5, type: 'bread' },
    { x: biteX - 8, y: 84 + eatenPercent * 3, size: 1, type: 'bread' },
    { x: biteX - 5, y: 83 + eatenPercent * 4, size: 2, type: 'lettuce' },
  ] : []

  return (
    <>
      <defs>
        <clipPath id="sandwich-eaten-clip">
          <path d={generateBitePath(biteX)} />
        </clipPath>

        {/* Bread gradient */}
        <linearGradient id="bread-top-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8C78E" />
          <stop offset="50%" stopColor="#D4A76A" />
          <stop offset="100%" stopColor="#C49A5C" />
        </linearGradient>

        <linearGradient id="bread-bottom-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A76A" />
          <stop offset="100%" stopColor="#B8864A" />
        </linearGradient>

        {/* Meat gradient */}
        <linearGradient id="meat-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A5A5" />
          <stop offset="100%" stopColor="#C48B8B" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse
        cx="50"
        cy="88"
        rx={38 - eatenPercent * 18}
        ry={5 - eatenPercent * 2}
        fill="rgba(0,0,0,0.12)"
        className="transition-all duration-200"
      />

      {/* Main sandwich with bite clip */}
      <g clipPath="url(#sandwich-eaten-clip)">
        {/* Bottom bread slice */}
        <path
          d="M 8 68 L 8 75 Q 8 82 18 82 L 82 82 Q 92 82 92 75 L 92 68 Q 92 62 82 62 L 18 62 Q 8 62 8 68 Z"
          fill="url(#bread-bottom-gradient)"
        />
        {/* Bottom bread texture */}
        <path
          d="M 12 70 L 88 70"
          stroke="#C49A5C"
          strokeWidth="1"
          opacity="0.4"
        />

        {/* Turkey/meat layer */}
        <path
          d="M 5 56 Q 15 62 30 58 Q 50 64 70 58 Q 85 62 95 56 L 95 62 L 5 62 Z"
          fill="url(#meat-gradient)"
        />
        <path
          d="M 6 54 Q 20 60 35 55 Q 55 61 75 55 Q 90 60 94 54 L 94 58 L 6 58 Z"
          fill="#E8B8B8"
        />

        {/* Cheese slice */}
        <path
          d="M 4 48 L 96 48 L 94 54 Q 80 58 65 52 Q 50 58 35 52 Q 20 58 6 54 Z"
          fill="#FFD54F"
        />
        {/* Cheese fold */}
        <path
          d="M 70 48 L 75 54 L 80 48"
          fill="#FFCA28"
        />

        {/* Lettuce layer */}
        <path
          d="M 2 42 Q 12 48 25 42 Q 38 48 50 42 Q 62 48 75 42 Q 88 48 98 42 L 98 48 L 2 48 Z"
          fill="#66BB6A"
        />
        <path
          d="M 4 40 Q 16 46 30 40 Q 44 46 58 40 Q 72 46 86 40 Q 96 46 96 40"
          fill="none"
          stroke="#81C784"
          strokeWidth="3"
        />

        {/* Tomato slices */}
        <ellipse cx="25" cy="36" rx="12" ry="4" fill="#E53935" />
        <ellipse cx="25" cy="36" rx="8" ry="2.5" fill="#EF5350" />
        <ellipse cx="55" cy="37" rx="14" ry="4" fill="#E53935" />
        <ellipse cx="55" cy="37" rx="10" ry="2.5" fill="#EF5350" />
        <ellipse cx="82" cy="36" rx="10" ry="3.5" fill="#E53935" />
        <ellipse cx="82" cy="36" rx="7" ry="2" fill="#EF5350" />

        {/* Top bread slice */}
        <path
          d="M 8 32 Q 8 18 50 18 Q 92 18 92 32 L 92 36 Q 92 40 82 40 L 18 40 Q 8 40 8 36 Z"
          fill="url(#bread-top-gradient)"
        />

        {/* Bread crust line on top */}
        <path
          d="M 12 22 Q 50 16 88 22"
          fill="none"
          stroke="#B8864A"
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Bread texture/highlight */}
        <ellipse cx="45" cy="26" rx="20" ry="6" fill="#F5DEB3" opacity="0.3" />

        {/* Seeds on bread (optional artisan look) */}
        <circle cx="30" cy="24" r="1.5" fill="#8B7355" opacity="0.6" />
        <circle cx="50" cy="22" r="1.5" fill="#8B7355" opacity="0.6" />
        <circle cx="70" cy="24" r="1.5" fill="#8B7355" opacity="0.6" />
        <circle cx="40" cy="30" r="1" fill="#8B7355" opacity="0.6" />
        <circle cx="60" cy="29" r="1" fill="#8B7355" opacity="0.6" />
      </g>

      {/* Bite edge details */}
      {eatenPercent > 0.05 && eatenPercent < 0.95 && (
        <g>
          {/* Inner bread texture - soft white bread interior */}
          <path
            d={`M ${biteX} 20 Q ${biteX - 5} 25 ${biteX - 3} 30
               Q ${biteX - 6} 35 ${biteX} 40`}
            fill="#FFF8F0"
            stroke="#F5DEB3"
            strokeWidth="1"
            opacity="0.9"
          />
          {/* Bread air pockets */}
          <circle cx={biteX - 3} cy="24" r="1.2" fill="#FFFAF5" opacity="0.6" />
          <circle cx={biteX - 4} cy="32" r="1" fill="#FFFAF5" opacity="0.5" />
          <circle cx={biteX - 2} cy="36" r="0.8" fill="#FFFAF5" opacity="0.6" />

          {/* Lettuce leaves sticking out */}
          <path
            d={`M ${biteX - 1} 43 Q ${biteX - 7} 41 ${biteX - 10} 44`}
            fill="none"
            stroke="#81C784"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M ${biteX - 2} 46 Q ${biteX - 6} 48 ${biteX - 9} 46`}
            fill="none"
            stroke="#66BB6A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={`M ${biteX} 48 Q ${biteX - 4} 50 ${biteX - 7} 48`}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Turkey meat layers at edge */}
          <ellipse cx={biteX - 3} cy="56" rx="5" ry="3" fill="#E8B8B8" />
          <ellipse cx={biteX - 4} cy="58" rx="4" ry="2.5" fill="#D4A5A5" />
          <path
            d={`M ${biteX - 1} 54 Q ${biteX - 5} 56 ${biteX - 2} 60`}
            fill="none"
            stroke="#C48B8B"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Cheese stretching and folding */}
          <path
            d={`M ${biteX} 50 Q ${biteX - 4} 52 ${biteX - 2} 56
               Q ${biteX - 6} 58 ${biteX - 4} 62`}
            fill="none"
            stroke="#FFD54F"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={`M ${biteX - 2} 51 Q ${biteX - 5} 54 ${biteX - 3} 58`}
            fill="none"
            stroke="#FFCA28"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Tomato slice visible at edge */}
          <ellipse cx={biteX - 4} cy="37" rx="5" ry="2.5" fill="#E53935" />
          <ellipse cx={biteX - 4} cy="36" rx="3" ry="1.5" fill="#EF5350" opacity="0.8" />

          {/* Mayo/spread smear at edge */}
          <ellipse cx={biteX - 5} cy="42" rx="3" ry="1.5" fill="#FFFDE7" opacity="0.7" />
          <ellipse cx={biteX - 3} cy="64" rx="2.5" ry="1" fill="#FFFDE7" opacity="0.6" />

          {/* Bottom bread interior */}
          <path
            d={`M ${biteX} 68 Q ${biteX - 4} 72 ${biteX - 2} 76`}
            fill="#FFF8F0"
            stroke="#DEB887"
            strokeWidth="1"
            opacity="0.8"
          />
        </g>
      )}

      {/* Falling crumbs */}
      {fallingCrumbs.map((crumb, i) => (
        <circle
          key={i}
          cx={crumb.x}
          cy={crumb.y}
          r={crumb.size}
          fill={crumb.type === 'bread' ? '#D4A76A' : '#66BB6A'}
          opacity={0.6}
        />
      ))}

      {/* Crumb mess on surface */}
      {eatenPercent > 0.15 && (
        <g opacity={eatenPercent * 0.4}>
          <circle cx={40 - eatenPercent * 5} cy="88" r="1" fill="#D4A76A" />
          <circle cx={50 - eatenPercent * 8} cy="87" r="0.8" fill="#C49A5C" />
          <circle cx={45 - eatenPercent * 3} cy="89" r="1.2" fill="#D4A76A" />
          <ellipse cx={55 - eatenPercent * 10} cy="88" rx="1.5" ry="0.8" fill="#66BB6A" opacity="0.5" />
        </g>
      )}
    </>
  )
}
