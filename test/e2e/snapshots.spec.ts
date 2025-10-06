import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const routes = ['/', '/wizard/step-1', '/wizard/step-2', '/wizard/step-3', '/dashboard'];

function safeName(route: string): string {
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/\//g, '_');
}

test.describe('UI Snapshots', () => {
  test('capture key screens', async ({ page, baseURL }) => {
    const dateTag =
      process.env.SNAP_DATE || new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const snapBase =
      process.env.SNAP_DIR || path.join(process.cwd(), 'docs', 'ui-snapshots', dateTag);
    fs.mkdirSync(snapBase, { recursive: true });

    for (const route of routes) {
      const url = new URL(route, baseURL || 'http://localhost:4173').toString();
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const file = path.join(snapBase, `${safeName(route)}.png`);
      await page.screenshot({ path: file, fullPage: true });
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
