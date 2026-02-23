import { test, expect } from '../fixtures/test.js'

test.describe('Browse — Category discovery', () => {
  test('/browse shows category grid, clicking one loads dishes', async ({ page }) => {
    await page.goto('/browse')

    // Should show category cards (19 browse categories)
    const categoryCard = page.getByText(/Seafood|Pizza|Burgers|Breakfast|Tacos|Sushi|Lobster/i).first()
    await expect(categoryCard).toBeVisible({ timeout: 20_000 })

    // Click a category
    await categoryCard.click()

    // Should now show a dish list heading
    const heading = page.getByText(/The Best|Results for/i).first()
    await expect(heading).toBeVisible({ timeout: 15_000 })
  })
})
