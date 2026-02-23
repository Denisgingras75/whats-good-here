import { test, expect } from '../fixtures/test.js'

test.describe('Restaurants — Tourist browsing', () => {
  test('/restaurants shows restaurant cards', async ({ page }) => {
    await page.goto('/restaurants')

    // Wait for restaurant list to load
    await expect(page.locator('#main-content')).toBeVisible()

    // Should show at least one restaurant (link or card)
    const restaurantLink = page.locator('a[href*="/restaurants/"]').first()
    await expect(restaurantLink).toBeVisible({ timeout: 15_000 })

    // Should have multiple restaurants (MV has ~69)
    const count = await page.locator('a[href*="/restaurants/"]').count()
    expect(count).toBeGreaterThan(0)
  })

  test('clicking a restaurant shows its dishes', async ({ page }) => {
    await page.goto('/restaurants')

    // Click first restaurant
    const restaurantLink = page.locator('a[href*="/restaurants/"]').first()
    await expect(restaurantLink).toBeVisible({ timeout: 15_000 })
    await restaurantLink.click()

    // Should navigate to restaurant detail
    await page.waitForURL(/\/restaurants\//)

    // Should have tab switcher (Top Rated / Menu)
    const tablist = page.locator('[role="tablist"]')
    await expect(tablist).toBeVisible({ timeout: 10_000 })

    // At least the "Top Rated" or "Menu" tab should be visible
    const topRatedTab = page.getByRole('tab', { name: /Top Rated/i })
    const menuTab = page.getByRole('tab', { name: /Menu/i })
    const hasTopRated = await topRatedTab.isVisible().catch(() => false)
    const hasMenu = await menuTab.isVisible().catch(() => false)
    expect(hasTopRated || hasMenu).toBeTruthy()
  })
})
