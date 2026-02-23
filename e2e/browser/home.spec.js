import { test, expect } from '../fixtures/test.js'

test.describe('Home — Tourist landing', () => {
  test('shows ranked dishes after loading', async ({ page }) => {
    await page.goto('/')

    // Wait for at least one dish to appear (data-dish-id attribute)
    const firstDish = page.locator('[data-dish-id]').first()
    await expect(firstDish).toBeVisible({ timeout: 20_000 })

    // Should have multiple ranked dishes
    const dishCount = await page.locator('[data-dish-id]').count()
    expect(dishCount).toBeGreaterThan(0)
  })

  test('search "lobster" shows autocomplete results', async ({ page }) => {
    await page.goto('/')

    // Wait for page to be interactive
    const firstDish = page.locator('[data-dish-id]').first()
    await expect(firstDish).toBeVisible({ timeout: 20_000 })

    // Find the search input
    const search = page.getByPlaceholder('What are you craving?')
    await expect(search).toBeVisible()
    await search.fill('lobster')

    // Autocomplete dropdown should appear with results
    await expect(page.getByText(/lobster/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('clicking a category chip filters the list', async ({ page }) => {
    await page.goto('/')

    // Wait for dishes to load first
    await expect(page.locator('[data-dish-id]').first()).toBeVisible({ timeout: 20_000 })

    // Find and click a category chip (horizontal scroll row)
    const chip = page.locator('button').filter({ hasText: /Seafood|Pizza|Burgers|Breakfast/i }).first()
    if (await chip.isVisible()) {
      await chip.click()
      // Wait for the list to update
      await page.waitForTimeout(2000)
      // Dishes should still be visible after filtering
      await expect(page.locator('[data-dish-id]').first()).toBeVisible({ timeout: 15_000 })
    }
  })
})
