import { defineConfig } from '@playwright/test';
import path from 'path';

const base = (process.env['PW_BASEURL'] as string) || 'http://localhost:3001';
const distDir = path.join(__dirname, 'dist', 'angular');

export default defineConfig({
  testDir: 'test/e2e',
  reporter: 'line',
  use: {
    baseURL: base,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npx http-server "${distDir}" -p 3001 -s`,
    url: 'http://localhost:3001/index.html',
    reuseExistingServer: true,
    timeout: 60_000,
    cwd: __dirname,
  },
});
