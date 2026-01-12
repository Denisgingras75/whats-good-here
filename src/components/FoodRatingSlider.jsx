import { useState, useEffect, useRef } from 'react'
import { playBiteSound } from '../lib/sounds'

// Food SVG components
import { PizzaSVG } from './foods/PizzaSVG'
import { BurgerSVG } from './foods/BurgerSVG'
import { SandwichSVG } from './foods/SandwichSVG'
import { BreakfastSandwichSVG } from './foods/BreakfastSandwichSVG'
import { PastaSVG } from './foods/PastaSVG'
import { SushiSVG } from './foods/SushiSVG'
import { PokeBowlSVG } from './foods/PokeBowlSVG'
import { TacoSVG } from './foods/TacoSVG'
import { WingsSVG } from './foods/WingsSVG'
import { TendysSVG } from './foods/TendysSVG'
import { LobsterRollSVG } from './foods/LobsterRollSVG'
import { FriesSVG } from './foods/FriesSVG'
import { SeafoodSVG } from './foods/SeafoodSVG'
import { ChowderSVG } from './foods/ChowderSVG'
import { SoupSVG } from './foods/SoupSVG'
import { BreakfastSVG } from './foods/BreakfastSVG'
import { SaladSVG } from './foods/SaladSVG'
import { AppsSVG } from './foods/AppsSVG'
import { FriedChickenSVG } from './foods/FriedChickenSVG'
import { EntreeSVG } from './foods/EntreeSVG'

// Realistic crumb configurations per food type
const CRUMB_CONFIGS = {
  burger: [
    { type: 'chunk', colors: ['#8B4513', '#A0522D', '#D2691E'], weight: 3 }, // Bun chunks
    { type: 'shred', colors: ['#228B22', '#32CD32'], weight: 2 }, // Lettuce
    { type: 'splat', colors: ['#FF6347', '#DC143C'], weight: 1 }, // Ketchup/tomato
    { type: 'crumb', colors: ['#F5DEB3', '#DEB887'], weight: 2 }, // Sesame seeds
  ],
  pizza: [
    { type: 'chunk', colors: ['#D97706', '#B8860B'], weight: 3 }, // Crust
    { type: 'drip', colors: ['#FFA500', '#FFD700'], weight: 2 }, // Cheese stretching
    { type: 'splat', colors: ['#DC143C', '#B22222'], weight: 1 }, // Sauce
    { type: 'crumb', colors: ['#8B0000', '#A52A2A'], weight: 1 }, // Pepperoni bits
  ],
  taco: [
    { type: 'shard', colors: ['#E8C060', '#DAA520', '#F4A460'], weight: 3 }, // Shell shards
    { type: 'shred', colors: ['#228B22', '#90EE90'], weight: 2 }, // Lettuce
    { type: 'chunk', colors: ['#8B4513', '#A0522D'], weight: 2 }, // Meat
    { type: 'splat', colors: ['#FF6347', '#FF4500'], weight: 1 }, // Salsa
  ],
  sandwich: [
    { type: 'chunk', colors: ['#D4A574', '#C4A060', '#B8956E'], weight: 3 }, // Bread
    { type: 'shred', colors: ['#228B22', '#32CD32'], weight: 2 }, // Lettuce
    { type: 'crumb', colors: ['#F5DEB3', '#FAEBD7'], weight: 2 }, // Bread crumbs
  ],
  'breakfast sandwich': [
    { type: 'chunk', colors: ['#D4A056', '#C49040'], weight: 2 }, // Bagel/bread
    { type: 'drip', colors: ['#FFD700', '#FFA500'], weight: 2 }, // Egg yolk
    { type: 'crumb', colors: ['#F5DEB3', '#FFE4B5'], weight: 2 }, // Crumbs
  ],
  pasta: [
    { type: 'strand', colors: ['#F5DEB3', '#FAEBD7', '#FFE4C4'], weight: 3 }, // Noodles
    { type: 'splat', colors: ['#DC143C', '#B22222', '#8B0000'], weight: 2 }, // Sauce
    { type: 'crumb', colors: ['#FFF8DC', '#FFFACD'], weight: 1 }, // Parmesan
  ],
  sushi: [
    { type: 'grain', colors: ['#FFFAFA', '#F5F5F5', '#FFFAF0'], weight: 3 }, // Rice
    { type: 'chunk', colors: ['#FA8072', '#E9967A'], weight: 2 }, // Fish
    { type: 'shred', colors: ['#1B4D3E', '#2F4F4F'], weight: 1 }, // Nori
  ],
  wings: [
    { type: 'chunk', colors: ['#8B4513', '#A0522D', '#D2691E'], weight: 2 }, // Crispy skin
    { type: 'splat', colors: ['#FF4500', '#DC143C', '#B22222'], weight: 3 }, // Buffalo sauce
    { type: 'crumb', colors: ['#DEB887', '#D2B48C'], weight: 1 }, // Breading
  ],
  fries: [
    { type: 'chunk', colors: ['#FFD700', '#FFC107', '#F4D03F'], weight: 3 }, // Fry pieces
    { type: 'crumb', colors: ['#DAA520', '#B8860B'], weight: 2 }, // Crispy bits
    { type: 'grain', colors: ['#FFFFFF', '#F5F5F5'], weight: 1 }, // Salt
  ],
  salad: [
    { type: 'shred', colors: ['#228B22', '#32CD32', '#90EE90', '#98FB98'], weight: 4 }, // Lettuce
    { type: 'chunk', colors: ['#FF6347', '#FF4500'], weight: 1 }, // Tomato
    { type: 'drip', colors: ['#F5DEB3', '#FFE4B5'], weight: 1 }, // Dressing
  ],
  chowder: [
    { type: 'splat', colors: ['#FFFDD0', '#FFF8DC', '#FAEBD7'], weight: 3 }, // Cream
    { type: 'chunk', colors: ['#DEB887', '#F4A460'], weight: 2 }, // Potato/clam
    { type: 'drip', colors: ['#FFFACD', '#FFF8E7'], weight: 1 }, // Broth drip
  ],
  soup: [
    { type: 'splat', colors: ['#FF6347', '#E07020', '#DC143C'], weight: 3 }, // Tomato soup
    { type: 'drip', colors: ['#FF7F50', '#FF6347'], weight: 2 }, // Drips
  ],
  'lobster roll': [
    { type: 'chunk', colors: ['#FFA07A', '#FA8072', '#E9967A'], weight: 3 }, // Lobster
    { type: 'chunk', colors: ['#D4A574', '#C4A060'], weight: 2 }, // Bun
    { type: 'drip', colors: ['#FFFACD', '#FFF8DC'], weight: 1 }, // Mayo/butter
  ],
  breakfast: [
    { type: 'drip', colors: ['#FFD700', '#FFA500'], weight: 3 }, // Egg yolk
    { type: 'shard', colors: ['#8B0000', '#A52A2A'], weight: 2 }, // Bacon
    { type: 'crumb', colors: ['#F5DEB3', '#DEB887'], weight: 1 }, // Toast
  ],
  entree: [
    { type: 'chunk', colors: ['#8B4513', '#A0522D', '#654321'], weight: 3 }, // Meat
    { type: 'drip', colors: ['#8B0000', '#A52A2A'], weight: 2 }, // Juice/sauce
  ],
}

// Get random crumb type based on weights
function getRandomCrumbType(category) {
  const config = CRUMB_CONFIGS[category] || CRUMB_CONFIGS.burger
  const totalWeight = config.reduce((sum, c) => sum + c.weight, 0)
  let random = Math.random() * totalWeight

  for (const crumbType of config) {
    random -= crumbType.weight
    if (random <= 0) {
      return {
        type: crumbType.type,
        color: crumbType.colors[Math.floor(Math.random() * crumbType.colors.length)]
      }
    }
  }
  return { type: 'crumb', color: '#D97706' }
}

// Generate SVG path for different crumb shapes
function getCrumbPath(type, size) {
  const s = size
  switch (type) {
    case 'chunk': // Irregular polygon chunk
      return `M${-s*0.8},${-s*0.3} L${-s*0.2},${-s} L${s*0.7},${-s*0.6} L${s},${s*0.2} L${s*0.4},${s*0.9} L${-s*0.5},${s*0.7} Z`
    case 'shard': // Sharp triangular shard (taco shell)
      return `M${-s},${s*0.5} L${-s*0.3},${-s} L${s*0.8},${-s*0.7} L${s},${s*0.3} L${s*0.2},${s} Z`
    case 'shred': // Long thin shred (lettuce)
      return `M${-s*1.5},${-s*0.2} Q${-s*0.5},${-s*0.5} ${0},${-s*0.1} Q${s*0.5},${s*0.3} ${s*1.5},${s*0.1} Q${s*0.7},${s*0.5} ${0},${s*0.3} Q${-s*0.7},${0} ${-s*1.5},${-s*0.2} Z`
    case 'splat': // Sauce splatter
      return `M${0},${-s} Q${s*0.5},${-s*0.5} ${s*0.8},${-s*0.3} Q${s},${0} ${s*0.6},${s*0.4} Q${s*0.3},${s*0.8} ${0},${s*0.6} Q${-s*0.4},${s*0.9} ${-s*0.7},${s*0.4} Q${-s},${0} ${-s*0.6},${-s*0.5} Q${-s*0.3},${-s*0.8} ${0},${-s} Z`
    case 'drip': // Dripping liquid
      return `M${-s*0.3},${-s} Q${-s*0.5},${0} ${-s*0.2},${s*0.5} Q${0},${s*1.2} ${s*0.2},${s*0.5} Q${s*0.5},${0} ${s*0.3},${-s} Q${0},${-s*0.7} ${-s*0.3},${-s} Z`
    case 'strand': // Pasta strand
      return `M${-s*2},${-s*0.15} Q${-s},${-s*0.4} ${0},${0} Q${s},${s*0.4} ${s*2},${s*0.15} L${s*2},${s*0.35} Q${s},${s*0.6} ${0},${s*0.2} Q${-s},${-s*0.2} ${-s*2},${s*0.05} Z`
    case 'grain': // Rice grain or salt crystal
      return `M${0},${-s*0.8} Q${s*0.4},${-s*0.4} ${s*0.35},${0} Q${s*0.4},${s*0.4} ${0},${s*0.8} Q${-s*0.4},${s*0.4} ${-s*0.35},${0} Q${-s*0.4},${-s*0.4} ${0},${-s*0.8} Z`
    case 'crumb': // Small irregular crumb
    default:
      return `M${-s*0.6},${-s*0.4} L${s*0.2},${-s*0.7} L${s*0.7},${-s*0.1} L${s*0.5},${s*0.6} L${-s*0.3},${s*0.5} L${-s*0.8},${0} Z`
  }
}

export function FoodRatingSlider({ value, onChange, min = 0, max = 10, step = 0.1, category }) {
  const [crumbs, setCrumbs] = useState([])
  const lastValue = useRef(value)
  const crumbIdRef = useRef(0)

  // Calculate how much food is eaten (0 = full, 1 = fully eaten)
  const eatenPercent = (value - min) / (max - min)

  // Track last bite sound time to throttle
  const lastBiteSoundTime = useRef(0)

  // Generate realistic crumbs when slider moves up
  useEffect(() => {
    if (value > lastValue.current) {
      const valueDiff = value - lastValue.current
      const numCrumbs = Math.ceil(valueDiff * 3) + 1
      const newCrumbs = []

      for (let i = 0; i < numCrumbs; i++) {
        const { type, color } = getRandomCrumbType(category)
        const size = type === 'grain' ? 1 + Math.random() * 1.5
                   : type === 'strand' ? 1.5 + Math.random() * 2
                   : type === 'shred' ? 2 + Math.random() * 2
                   : 2 + Math.random() * 3

        newCrumbs.push({
          id: crumbIdRef.current++,
          x: 35 + Math.random() * 30,
          y: 25 + Math.random() * 25,
          size,
          type,
          color,
          path: getCrumbPath(type, size),
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 720, // How much it spins while falling
          fallDirection: (Math.random() - 0.5) * 2, // -1 to 1
          fallDistance: 35 + Math.random() * 25, // How far it falls
          delay: i * 40 + Math.random() * 30,
          duration: 600 + Math.random() * 400, // Varying fall speeds
          bounce: type === 'chunk' || type === 'shard' ? 0.15 + Math.random() * 0.1 : 0,
        })
      }

      setCrumbs(prev => [...prev, ...newCrumbs])

      setTimeout(() => {
        setCrumbs(prev => prev.filter(c => !newCrumbs.find(nc => nc.id === c.id)))
      }, 1200)

      // Play bite sound
      const now = Date.now()
      if (now - lastBiteSoundTime.current > 80 && valueDiff > 0.3) {
        playBiteSound(category)
        lastBiteSoundTime.current = now
      }
    }
    lastValue.current = value
  }, [value, min, max, category])

  // Get the right food SVG based on category
  const FoodComponent = getFoodComponent(category)
  const crumbColor = getCrumbColor(category)
  const isPlatedFood = hasPlate(category)

  return (
    <div className="space-y-4">
      {/* Food visualization */}
      <div className="relative flex justify-center items-center h-40">
        {/* Perfect 10 - Clean plate celebration */}
        {value >= 10 && (
          <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
            <div className="text-6xl animate-bounce">🍽️</div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl animate-pulse">✨</div>
            <div className="absolute top-6 left-1/4 text-xl animate-pulse" style={{ animationDelay: '0.2s' }}>✨</div>
            <div className="absolute top-6 right-1/4 text-xl animate-pulse" style={{ animationDelay: '0.4s' }}>✨</div>
          </div>
        )}

        <svg
          viewBox="0 0 100 100"
          className="w-32 h-32 drop-shadow-lg transition-all duration-300"
          style={{
            // Plated foods don't shrink - the plate stays, only food disappears
            transform: isPlatedFood
              ? 'scale(1)'
              : `scale(${value >= 10 ? 0 : 1 - eatenPercent * 0.3})`,
            opacity: isPlatedFood ? 1 : (value >= 10 ? 0 : 1)
          }}
        >
          {/* Render the food SVG */}
          <FoodComponent eatenPercent={eatenPercent} value={value} />

          {/* Falling crumbs - realistic shapes */}
          {crumbs.map(crumb => (
            <g
              key={crumb.id}
              style={{
                transform: `translate(${crumb.x}px, ${crumb.y}px)`,
                '--fall-direction': crumb.fallDirection,
                '--fall-distance': `${crumb.fallDistance}px`,
                '--rotation-speed': `${crumb.rotationSpeed}deg`,
                '--initial-rotation': `${crumb.rotation}deg`,
                '--bounce': crumb.bounce,
                '--duration': `${crumb.duration}ms`,
                animation: `crumbFallPhysics var(--duration) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                animationDelay: `${crumb.delay}ms`,
              }}
            >
              <path
                d={crumb.path}
                fill={crumb.color}
                style={{
                  filter: crumb.type === 'splat' || crumb.type === 'drip' ? 'blur(0.3px)' : 'none',
                  opacity: crumb.type === 'grain' ? 0.9 : 1,
                }}
              />
              {/* Add highlight/shadow for depth */}
              {(crumb.type === 'chunk' || crumb.type === 'shard') && (
                <path
                  d={crumb.path}
                  fill="white"
                  opacity="0.2"
                  style={{ transform: 'translate(-0.5px, -0.5px) scale(0.7)' }}
                />
              )}
            </g>
          ))}
        </svg>

        {/* Rating display overlaid */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-4xl font-bold text-neutral-900">{value.toFixed(1)}</span>
          <span className="text-xl text-neutral-400">/10</span>
        </div>
      </div>

      {/* Label based on rating */}
      <div className="text-center">
        <span className="text-sm font-medium text-neutral-500">
          {getRatingLabel(value, category)}
        </span>
      </div>

      {/* Slider */}
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-emerald-400 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-9 [&::-webkit-slider-thumb]:h-9
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-xl
            [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:bg-orange-600
            [&::-webkit-slider-thumb]:active:scale-95
            [&::-moz-range-thumb]:w-9 [&::-moz-range-thumb]:h-9 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:shadow-xl [&::-moz-range-thumb]:border-4
            [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-neutral-400 mt-2 px-1">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )
}

// Map category to food component
function getFoodComponent(category) {
  const foodMap = {
    'burger': BurgerSVG,
    'pizza': PizzaSVG,
    'sandwich': SandwichSVG,
    'breakfast sandwich': BreakfastSandwichSVG,
    'pasta': PastaSVG,
    'sushi': SushiSVG,
    'pokebowl': PokeBowlSVG,
    'taco': TacoSVG,
    'wings': WingsSVG,
    'tendys': TendysSVG,
    'lobster roll': LobsterRollSVG,
    'fries': FriesSVG,
    'seafood': SeafoodSVG,
    'chowder': ChowderSVG,
    'soup': SoupSVG,
    'breakfast': BreakfastSVG,
    'salad': SaladSVG,
    'apps': AppsSVG,
    'fried chicken': FriedChickenSVG,
    'entree': EntreeSVG,
  }

  return foodMap[category] || PizzaSVG // Default to pizza for now
}

// Check if food is served on a plate (doesn't shrink, plate stays)
function hasPlate(category) {
  const platedFoods = ['pasta', 'salad', 'breakfast', 'entree', 'apps', 'seafood', 'fried chicken', 'sushi', 'pokebowl', 'wings', 'tendys', 'fries', 'chowder', 'soup']
  return platedFoods.includes(category)
}

// Get crumb color based on food type
function getCrumbColor(category) {
  const colorMap = {
    'burger': '#8B4513', // Brown for burger bun
    'pizza': '#D97706', // Orange-brown for pizza crust
    'sandwich': '#D4A574', // Tan for bread
    'breakfast sandwich': '#D4A056', // Bagel color
    'pasta': '#E8D5B7', // Pasta color
    'fries': '#F4D03F', // Golden for fries
    'tendys': '#D4A574', // Breading color
    'wings': '#8B4513', // Brown
    'seafood': '#FA8072', // Salmon pink
    'chowder': '#F5E6C8', // Cream color
    'soup': '#E07020', // Tomato soup color
    'breakfast': '#FFD700', // Egg yolk
    'salad': '#228B22', // Green
    'apps': '#D4AA4A', // Breading color
    'fried chicken': '#8B4513', // Brown
    'entree': '#8B4513', // Steak brown
    'lobster roll': '#FFA07A', // Lobster meat color
    'taco': '#E8C060', // Tortilla color
  }

  return colorMap[category] || '#D97706'
}

function getRatingLabel(value, category) {
  if (value >= 10) return "🏆 PERFECT! Ate every bite!"
  if (value >= 9.5) return "🏆 The absolute BEST!"
  if (value >= 9) return "⭐ Exceptional - almost perfect!"
  if (value >= 8) return "🔥 Really great!"
  if (value >= 7) return "👍 Pretty good!"
  if (value >= 6) return "😐 It's okay"
  if (value >= 5) return "🤷 Meh..."
  if (value >= 3) return "😕 Not great"
  if (value >= 1) return "❌ Skip this one"

  // Category-specific "slide to rate" messages
  const categoryEmojis = {
    'burger': '🍔',
    'pizza': '🍕',
    'sandwich': '🥪',
    'breakfast sandwich': '🥪',
    'pasta': '🍝',
    'sushi': '🍣',
    'pokebowl': '🥗',
    'taco': '🌮',
    'wings': '🍗',
    'tendys': '🍗',
    'lobster roll': '🦞',
    'seafood': '🦐',
    'chowder': '🍲',
    'soup': '🍜',
    'breakfast': '🍳',
    'salad': '🥗',
    'fries': '🍟',
    'apps': '🍽️',
    'fried chicken': '🍗',
    'entree': '🍽️',
  }

  const emoji = categoryEmojis[category] || '🍽️'
  return `${emoji} Slide to rate!`
}
