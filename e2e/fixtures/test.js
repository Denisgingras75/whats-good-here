import { test as base, expect } from '@playwright/test'

/**
 * Custom test fixture that handles the WelcomeSplash animation.
 *
 * The splash uses a module-level variable and auto-dismisses after 2.5s.
 * Clicking it is unreliable due to pointer-events:none during opacity
 * transitions and React state timing. We simply wait for auto-dismiss.
 *
 * Only triggers once per test (module-level var persists across SPA navigations).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    let splashHandled = false

    const originalGoto = page.goto.bind(page)
    page.goto = async (url, options) => {
      const response = await originalGoto(url, options)
      if (!splashHandled) {
        splashHandled = true
        // Wait for splash to auto-dismiss (2.5s animation + 500ms buffer)
        await page.waitForTimeout(3000)
      }
      return response
    }

    await use(page)
  },
})

export { expect }
