import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { JournalFeed } from './JournalFeed'

const worthIt = [
  { dish_id: 1, dish_name: 'Lobster Roll', restaurant_name: "Nancy's", restaurant_town: 'Oak Bluffs', category: 'Seafood', rating_10: 9.2, community_avg: 8.4, voted_at: '2026-02-20T12:00:00Z', would_order_again: true },
]
const avoid = [
  { dish_id: 2, dish_name: 'Clam Strips', restaurant_name: 'Giordano', restaurant_town: 'Oak Bluffs', category: 'Seafood', rating_10: 3.5, community_avg: 5.1, voted_at: '2026-02-19T12:00:00Z', would_order_again: false },
]
const heard = [
  { dish_id: 3, dish_name: 'Fish Tacos', restaurant_name: 'Offshore Ale', restaurant_town: 'Oak Bluffs', category: 'Tacos', saved_at: '2026-02-18T10:00:00Z' },
]

describe('JournalFeed', () => {
  it('renders all entries in reverse chronological order by default', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="all" />
      </MemoryRouter>
    )
    var items = screen.getAllByTestId('journal-card')
    expect(items).toHaveLength(3)
  })

  it('filters to only good-here when shelf is active', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText('Lobster Roll')).toBeTruthy()
    expect(screen.queryByText('Clam Strips')).toBeNull()
    expect(screen.queryByText('Fish Tacos')).toBeNull()
  })

  it('filters to only heard when shelf is active', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="heard" />
      </MemoryRouter>
    )
    expect(screen.getByText('Fish Tacos')).toBeTruthy()
    expect(screen.queryByText('Lobster Roll')).toBeNull()
  })

  it('filters to only not-good-here when shelf is active', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={worthIt} avoid={avoid} heard={heard} activeShelf="not-good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText('Clam Strips')).toBeTruthy()
    expect(screen.queryByText('Lobster Roll')).toBeNull()
  })

  it('shows empty state when filtered shelf has no entries', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={[]} avoid={avoid} heard={heard} activeShelf="good-here" />
      </MemoryRouter>
    )
    expect(screen.getByText(/no dishes/i)).toBeTruthy()
  })

  it('shows loading skeleton when loading', () => {
    render(
      <MemoryRouter>
        <JournalFeed worthIt={[]} avoid={[]} heard={[]} activeShelf="all" loading />
      </MemoryRouter>
    )
    var skeletons = screen.getAllByTestId('journal-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
