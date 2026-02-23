import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShelfFilter } from './ShelfFilter'

describe('ShelfFilter', () => {
  const shelves = [
    { id: 'all', label: 'All' },
    { id: 'good-here', label: 'Good Here' },
    { id: 'heard', label: "Heard That's Good There" },
    { id: 'not-good-here', label: "Wasn't Good Here" },
  ]

  it('renders all shelf labels', () => {
    render(<ShelfFilter shelves={shelves} active="all" onSelect={() => {}} />)
    expect(screen.getByText('All')).toBeTruthy()
    expect(screen.getByText('Good Here')).toBeTruthy()
    expect(screen.getByText("Heard That's Good There")).toBeTruthy()
    expect(screen.getByText("Wasn't Good Here")).toBeTruthy()
  })

  it('highlights the active shelf', () => {
    render(<ShelfFilter shelves={shelves} active="good-here" onSelect={() => {}} />)
    const activeButton = screen.getByText('Good Here')
    expect(activeButton.style.fontWeight).toBe('700')
  })

  it('calls onSelect when a shelf is tapped', () => {
    const onSelect = vi.fn()
    render(<ShelfFilter shelves={shelves} active="all" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Good Here'))
    expect(onSelect).toHaveBeenCalledWith('good-here')
  })

  it('does not highlight inactive shelves', () => {
    render(<ShelfFilter shelves={shelves} active="all" onSelect={() => {}} />)
    const inactiveButton = screen.getByText('Good Here')
    expect(inactiveButton.style.fontWeight).toBe('400')
  })
})
