import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.e2e.ts',
  use: { baseURL: 'http://127.0.0.1:4183', launchOptions: { executablePath: process.env.ENVOY_CHROMIUM_PATH } },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4183', reuseExistingServer: false },
});
