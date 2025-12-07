import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const paths = ['/', '/resources', '/resources/scholarships', '/programs']

test.describe('accessibility baseline', () => {
  for (const path of paths) {
    test(`axe scan ${path}`, async ({ page }) => {
      await page.goto(path)
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    })
  }
})
