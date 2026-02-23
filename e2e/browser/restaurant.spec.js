import { test, expect } from '../fixtures/test.js'

test.describe('Restaurants — Tourist browsing', () => {
  test('/restaurants shows restaurant cards', async ({ page }) => {
    await page.goto('/restaurants')

    // Wait for "Restaurants within" heading to appear (data loaded)
    const heading = page.getByText(/Restaurants within/i)
    await expect(heading).toBeVisible({ timeout: 20_000 })
  })

  test('clicking a restaurant shows its dishes', async ({ page }) => {
    await page.goto('/restaurants')

    // Wait for restaurants to load
    const heading = page.getByText(/Restaurants within/i)
    await expect(heading).toBeVisible({ timeout: 20_000 })

    // Restaurant cards use text-left class (dish items don't)
    const restaurantCard = page.locator('button.text-left').first()
    await expect(restaurantCard).toBeVisible({ timeout: 10_000 })
    await restaurantCard.click()

    // Wait for restaurant detail to render (tab switcher appears)
    const tablist = page.locator('[role="tablist"]')
    await expect(tablist).toBeVisible({ timeout: 20_000 })
  })
})
