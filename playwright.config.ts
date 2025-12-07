import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  webServer: {
    command: 'cross-env NEXT_DISABLE_TURBOPACK=1 NEXT_CLI_FORCE_LEGACY_BUILDER=1 npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 180_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
}

export default config
