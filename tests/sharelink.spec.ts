import { test, expect } from '@playwright/test'

test('share link encodes saved planner and restores on navigation', async ({ page }) => {
  // Start on planner
  await page.goto('/resources/scholarships')
  await page.getByRole('button', { name: /build my list/i }).click()
  await page.waitForSelector('article')

  // Save first match
  const save = page.getByRole('button', { name: /save/i }).first()
  await save.click()

  // Generate share link
  const copyBtn = page.getByRole('button', { name: /copy share link/i })
  await copyBtn.click()

  // Wait for share input to appear and read value
  const input = page.locator('input[readonly]')
  await expect(input).toBeVisible()
  const url = await input.inputValue()
  expect(url).toContain('?share=')

  // Navigate to the share URL in a new page
  await page.goto(url)
  await page.waitForSelector('article')

  // Ensure Saved planner shows at least one item
  await page.getByRole('heading', { name: /Saved planner/i }).scrollIntoViewIfNeeded()
  await expect(page.getByText(/Checklist/)).toBeVisible()
})