import { defineConfig } from '@playwright/test'

// Suite de evidencias: capturas en vez de aserciones, en modo backend.
process.env.E2E_BACKEND = '1'

export default defineConfig({
  testDir: './e2e/evidence',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 180000,
  expect: { timeout: 20000 },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60000,
  },
})