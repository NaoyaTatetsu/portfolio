import { defineConfig, devices } from "@playwright/test";

// 本番と同じ静的出力(dist/)を astro preview で配信してテストする。
// ポートは開発サーバー(4321)と衝突しないよう 4322 を使う
const PORT = 4322;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT}`,
    url: `http://localhost:${PORT}/en/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
