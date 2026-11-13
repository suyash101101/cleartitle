import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3456",
    trace: "on-first-retry",
    actionTimeout: 20_000,
    viewport: { width: 1280, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3456",
    url: "http://127.0.0.1:3456",
    // Always reuse local :3456 when already up (CI may still set CI=1)
    reuseExistingServer: !process.env.PW_FORCE_SERVER,
    timeout: 120_000,
  },
});
