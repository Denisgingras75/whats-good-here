import { test, expect } from '../fixtures/test.js'

test.describe('Browse — Category discovery', () => {
  test('/browse shows category grid, clicking one loads dishes', async ({ page }) => {
    await page.goto('/browse')

    await expect(page.locator('#main-content')).toBeVisible()

    // Should show category cards (19 browse categories)
    // Look for category text or images
    const categoryCard = page.getByText(/Seafood|Pizza|Burgers|Breakfast|Tacos|Sushi|Lobster/i).first()
    await expect(categoryCard).toBeVisible({ timeout: 10_000 })

    // Click a category
    await categoryCard.click()

    // Should now show a dish list with results
    await page.waitForTimeout(1000)
    const heading = page.getByText(/The Best|Results for/i).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })
})
