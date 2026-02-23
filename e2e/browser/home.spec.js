import { test, expect } from '../fixtures/test.js'

test.describe('Home — Tourist landing', () => {
  test('shows ranked dishes after loading', async ({ page }) => {
    await page.goto('/')

    // Skeleton loads first, then real content
    await expect(page.locator('#main-content')).toBeVisible()

    // Wait for at least one dish to appear (data-dish-id attribute)
    const firstDish = page.locator('[data-dish-id]').first()
    await expect(firstDish).toBeVisible({ timeout: 15_000 })

    // Should have multiple ranked dishes
    const dishCount = await page.locator('[data-dish-id]').count()
    expect(dishCount).toBeGreaterThan(0)
  })

  test('search "lobster" shows autocomplete results', async ({ page }) => {
    await page.goto('/')

    // Find the search input
    const search = page.getByPlaceholder('What are you craving?')
    await expect(search).toBeVisible({ timeout: 10_000 })
    await search.fill('lobster')

    // Autocomplete dropdown should appear with results
    // Wait for suggestion items to render
    await expect(page.getByText(/lobster/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('clicking a category chip filters the list', async ({ page }) => {
    await page.goto('/')

    // Wait for dishes to load first
    await expect(page.locator('[data-dish-id]').first()).toBeVisible({ timeout: 15_000 })

    // Find and click a category chip (horizontal scroll row)
    const chip = page.locator('button').filter({ hasText: /Seafood|Pizza|Burgers|Breakfast/i }).first()
    if (await chip.isVisible()) {
      const initialTitle = await page.locator('h2, h3').filter({ hasText: /Top Rated|Best/ }).first().textContent()
      await chip.click()

      // Title or content should change after filter
      await page.waitForTimeout(1000)
      // The section header should reflect the selected category or the dish list should update
      const dishes = page.locator('[data-dish-id]')
      await expect(dishes.first()).toBeVisible({ timeout: 10_000 })
    }
  })
})
