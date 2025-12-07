import { test, expect } from '@playwright/test'
import fs from 'fs'

test('Add to calendar button disabled until saved and downloads ICS', async ({ page }) => {
  await page.goto('/resources/scholarships')

  const calendarButton = page.getByRole('button', { name: /add to calendar/i })
  await expect(calendarButton).toBeVisible()
  await expect(calendarButton).toBeDisabled()

  // Build list and save first match
  await page.getByRole('button', { name: /build my list/i }).click()
  await page.waitForSelector('article')
  const saveButton = page.getByRole('button', { name: /save/i }).first()
  await saveButton.click()

  // Button should be enabled now
  await expect(calendarButton).toBeEnabled()

  // Capture download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    calendarButton.click(),
  ])

  const path = await download.path()
  expect(path).toBeTruthy()

  // Read the downloaded file and check content
  if (path) {
    const content = fs.readFileSync(path, 'utf8')
    expect(content).toContain('BEGIN:VCALENDAR')
    expect(content).toContain('END:VCALENDAR')
  }
})
