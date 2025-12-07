import { test, expect } from '@playwright/test'

const pages = ['/', '/resources', '/resources/scholarships', '/programs']

test.describe('core pages render', () => {
  for (const path of pages) {
    test(`loads ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('body')).toBeVisible()
      await expect(page).toHaveTitle(/Destination College/i)
    })
  }
})

test('homepage CTA buttons are accessible', async ({ page }) => {
  await page.goto('/')
  const buttons = page.getByRole('link', { name: /explore programs|invest/i })
  await expect(buttons.first()).toBeVisible()
})
