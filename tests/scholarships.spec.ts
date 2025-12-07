import { test, expect } from '@playwright/test'

test('builds scholarship list and saves item', async ({ page }) => {
  await page.goto('/resources/scholarships')
  await page.getByRole('button', { name: /build my list/i }).click()
  await expect(page.getByText(/Recommended scholarships/i)).toBeVisible()
  const saveButton = page.getByRole('button', { name: /save/i }).first()
  await saveButton.click()
  await page.getByRole('heading', { name: /Saved planner/i }).scrollIntoViewIfNeeded()
  await expect(page.getByText(/Checklist/)).toBeVisible()
})
