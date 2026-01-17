export function BurgerSVG({ eatenPercent, value }) {
  // Calculate how far the bite has progressed (from right side)
  const biteX = 90 - (eatenPercent * 75)

  // Generate irregular, realistic bite marks
  const generateBitePath = (x) => {
    // Irregular teeth pattern that varies
    const teeth = [
      { y: 15, depth: 6 + Math.sin(x * 0.3) * 3 },
      { y: 24, depth: 9 + Math.cos(x * 0.4) * 2 },
      { y: 33, depth: 7 + Math.sin(x * 0.5) * 3 },
      { y: 42, depth: 10 + Math.cos(x * 0.3) * 2 },
      { y: 52, depth: 8 + Math.sin(x * 0.6) * 3 },
      { y: 62, depth: 9 + Math.cos(x * 0.4) * 2 },
      { y: 72, depth: 7 + Math.sin(x * 0.5) * 2 },
      { y: 82, depth: 8 + Math.cos(x * 0.3) * 3 },
    ]

    let path = `M ${x} 0 L ${x} ${teeth[0].y - 5}`
    teeth.forEach((tooth, i) => {
      const nextY = i < teeth.length - 1 ? teeth[i + 1].y : 92
      const midY = (tooth.y + nextY) / 2
      path += ` Q ${x - tooth.depth} ${tooth.y}, ${x - tooth.depth * 0.3} ${midY - 2}`
      path += ` Q ${x - tooth.depth * 0.8} ${midY}, ${x} ${midY + 2}`
    })
    path += ` L ${x} 100 L 0 100 L 0 0 Z`
    return path
  }

  // Cheese drip positions that change as burger is eaten
  const cheeseDrips = eatenPercent > 0.05 && eatenPercent < 0.9 ? [
    { x: biteX - 2, startY: 51, length: 8 + Math.sin(eatenPercent * 20) * 4, width: 3 },
    { x: biteX - 5, startY: 52, length: 12 + Math.cos(eatenPercent * 15) * 5, width: 2.5 },
    { x: biteX - 8, startY: 53, length: 6 + Math.sin(eatenPercent * 25) * 3, width: 2 },
  ] : []

  return (
    <>
      <defs>
        {/* Bite-shaped clip path with curved teeth marks */}
        <clipPath id="burger-eaten-clip">
          <path d={generateBitePath(biteX)} />
        </clipPath>

        {/* Bun gradient */}
        <linearGradient id="bun-top-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8B04B" />
          <stop offset="40%" stopColor="#D99A3E" />
          <stop offset="100%" stopColor="#C4862F" />
        </linearGradient>

        <linearGradient id="bun-bottom-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D99A3E" />
          <stop offset="100%" stopColor="#B87325" />
        </linearGradient>

        {/* Patty gradient */}
        <linearGradient id="patty-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5C3D2E" />
          <stop offset="50%" stopColor="#4A2F22" />
          <stop offset="100%" stopColor="#3D261C" />
        </linearGradient>

        {/* Cheese gradient */}
        <linearGradient id="cheese-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFCA28" />
        </linearGradient>
      </defs>

      {/* Shadow under burger */}
      <ellipse
        cx="50"
        cy="88"
        rx={35 - eatenPercent * 15}
        ry={6 - eatenPercent * 3}
        fill="rgba(0,0,0,0.15)"
        className="transition-all duration-200"
      />

      {/* Main burger with bite clip */}
      <g clipPath="url(#burger-eaten-clip)">
        {/* Bottom bun */}
        <path
          d="M 12 72 Q 12 80 22 80 L 78 80 Q 88 80 88 72 L 88 66 Q 88 63 78 63 L 22 63 Q 12 63 12 66 Z"
          fill="url(#bun-bottom-gradient)"
        />
        {/* Bottom bun highlight */}
        <path
          d="M 15 68 Q 15 65 25 65 L 75 65 Q 85 65 85 68"
          fill="none"
          stroke="#E8B04B"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Patty */}
        <ellipse cx="50" cy="58" rx="40" ry="7" fill="url(#patty-gradient)" />
        {/* Patty grill marks */}
        <line x1="25" y1="56" x2="35" y2="56" stroke="#2D1810" strokeWidth="1.5" opacity="0.3" />
        <line x1="45" y1="57" x2="55" y2="57" stroke="#2D1810" strokeWidth="1.5" opacity="0.3" />
        <line x1="65" y1="56" x2="75" y2="56" stroke="#2D1810" strokeWidth="1.5" opacity="0.3" />

        {/* Cheese - melting over edges */}
        <path
          d="M 8 51 L 92 51 L 90 55 Q 82 62 72 55 Q 62 62 50 55 Q 38 62 28 55 Q 18 62 10 55 Z"
          fill="url(#cheese-gradient)"
        />

        {/* Lettuce - wavy green */}
        <path
          d="M 6 47 Q 16 51 26 47 Q 36 51 46 47 Q 56 51 66 47 Q 76 51 86 47 Q 94 51 94 47 L 94 51 L 6 51 Z"
          fill="#4CAF50"
        />
        <path
          d="M 8 46 Q 18 50 28 46 Q 38 50 48 46 Q 58 50 68 46 Q 78 50 88 46"
          fill="none"
          stroke="#66BB6A"
          strokeWidth="2"
        />

        {/* Tomato slices */}
        <ellipse cx="32" cy="43" rx="14" ry="4" fill="#E53935" />
        <ellipse cx="32" cy="43" rx="10" ry="2.5" fill="#EF5350" />
        <ellipse cx="68" cy="43" rx="12" ry="3.5" fill="#E53935" />
        <ellipse cx="68" cy="43" rx="8" ry="2" fill="#EF5350" />

        {/* Onion rings */}
        <ellipse cx="50" cy="39" rx="10" ry="2.5" fill="none" stroke="#F3E5F5" strokeWidth="2.5" />
        <ellipse cx="35" cy="37" rx="6" ry="1.5" fill="none" stroke="#F3E5F5" strokeWidth="2" />
        <ellipse cx="65" cy="38" rx="7" ry="2" fill="none" stroke="#F3E5F5" strokeWidth="2" />

        {/* Top bun */}
        <path
          d="M 12 35 Q 12 12 50 12 Q 88 12 88 35 L 88 38 Q 88 42 78 42 L 22 42 Q 12 42 12 38 Z"
          fill="url(#bun-top-gradient)"
        />

        {/* Top bun shine/highlight */}
        <ellipse cx="40" cy="20" rx="15" ry="5" fill="#F5D67A" opacity="0.3" />

        {/* Sesame seeds */}
        <ellipse cx="30" cy="20" rx="3.5" ry="1.8" fill="#FFF8E1" />
        <ellipse cx="50" cy="16" rx="3.5" ry="1.8" fill="#FFF8E1" />
        <ellipse cx="70" cy="20" rx="3.5" ry="1.8" fill="#FFF8E1" />
        <ellipse cx="40" cy="26" rx="3" ry="1.5" fill="#FFF8E1" />
        <ellipse cx="60" cy="26" rx="3" ry="1.5" fill="#FFF8E1" />
        <ellipse cx="35" cy="32" rx="2.5" ry="1.3" fill="#FFF8E1" />
        <ellipse cx="55" cy="32" rx="2.5" ry="1.3" fill="#FFF8E1" />
        <ellipse cx="75" cy="28" rx="2.5" ry="1.3" fill="#FFF8E1" />
        <ellipse cx="25" cy="28" rx="2.5" ry="1.3" fill="#FFF8E1" />
      </g>

      {/* Exposed bite edge details - shows the "inside" of the burger */}
      {eatenPercent > 0.05 && eatenPercent < 0.95 && (
        <g>
          {/* Inner bun texture - fluffy bread interior */}
          <path
            d={`M ${biteX} 14 Q ${biteX - 4} 18 ${biteX - 2} 22
               Q ${biteX - 5} 26 ${biteX - 3} 30
               Q ${biteX - 4} 34 ${biteX} 38`}
            fill="#FFF8E7"
            stroke="#F5DEB3"
            strokeWidth="1"
            opacity="0.9"
          />
          {/* Bread air pockets */}
          <circle cx={biteX - 3} cy="20" r="1.5" fill="#FFFAF0" opacity="0.7" />
          <circle cx={biteX - 2} cy="28" r="1" fill="#FFFAF0" opacity="0.6" />
          <circle cx={biteX - 4} cy="34" r="1.2" fill="#FFFAF0" opacity="0.7" />

          {/* Patty interior - pink/brown cooked meat */}
          <ellipse cx={biteX - 3} cy="58" rx="5" ry="3" fill="#8B5A3C" />
          <ellipse cx={biteX - 4} cy="57" rx="3" ry="2" fill="#A0695C" opacity="0.8" />

          {/* Patty juices dripping */}
          <path
            d={`M ${biteX - 2} 61 Q ${biteX - 3} 66 ${biteX - 1} 70`}
            fill="none"
            stroke="#8B4513"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <ellipse cx={biteX - 1} cy="72" rx="2" ry="1" fill="#8B4513" opacity="0.4" />

          {/* Multiple cheese drips - melting down */}
          {cheeseDrips.map((drip, i) => (
            <g key={i}>
              <path
                d={`M ${drip.x} ${drip.startY}
                   Q ${drip.x - 1} ${drip.startY + drip.length * 0.5}
                     ${drip.x + 1} ${drip.startY + drip.length}`}
                fill="none"
                stroke="#FFD54F"
                strokeWidth={drip.width}
                strokeLinecap="round"
              />
              {/* Cheese drip blob at end */}
              <ellipse
                cx={drip.x + 1}
                cy={drip.startY + drip.length + 2}
                rx={drip.width * 0.8}
                ry={drip.width}
                fill="#FFCA28"
              />
            </g>
          ))}

          {/* Lettuce pieces sticking out */}
          <path
            d={`M ${biteX - 1} 47 Q ${biteX - 6} 45 ${biteX - 8} 48`}
            fill="none"
            stroke="#66BB6A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M ${biteX - 2} 49 Q ${biteX - 5} 51 ${biteX - 7} 49`}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Tomato slice visible */}
          <ellipse cx={biteX - 4} cy="43" rx="4" ry="2" fill="#E53935" />
          <ellipse cx={biteX - 4} cy="42" rx="2.5" ry="1" fill="#EF5350" opacity="0.8" />

          {/* Onion ring at edge */}
          <path
            d={`M ${biteX - 2} 38 Q ${biteX - 6} 37 ${biteX - 8} 39`}
            fill="none"
            stroke="#F3E5F5"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Sauce smear on lower bun */}
          <ellipse cx={biteX - 5} cy="68" rx="4" ry="1.5" fill="#FF6B35" opacity="0.3" />
        </g>
      )}

      {/* Juice puddle under burger when eating */}
      {eatenPercent > 0.15 && eatenPercent < 0.85 && (
        <ellipse
          cx={50 - eatenPercent * 10}
          cy="89"
          rx={5 + eatenPercent * 8}
          ry={1.5}
          fill="#8B4513"
          opacity={0.15 + eatenPercent * 0.1}
        />
      )}
    </>
  )
}
