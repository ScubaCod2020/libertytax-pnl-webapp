import { test, expect, Page } from '@playwright/test';

const base = (process.env['PW_BASEURL'] as string) || 'http://localhost:3001';

async function gotoRoute(page: Page, path: string) {
  await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  const ready = await Promise.race([
    page
      .waitForSelector('app-root[ng-version]', { timeout: 4000 })
      .then(() => true)
      .catch(() => false),
    page
      .waitForSelector('[data-view]', { timeout: 4000 })
      .then(() => true)
      .catch(() => false),
    page
      .waitForSelector('[data-test="gate-locked"]', { timeout: 4000 })
      .then(() => true)
      .catch(() => false),
    page
      .waitForSelector('.dashboard-grid', { timeout: 4000 })
      .then(() => true)
      .catch(() => false),
  ]);
  if (!ready) {
    const html = await page.content();
    throw new Error(
      `Bootstrap never became ready for ${path}.` +
        `\nCurrent URL: ${page.url()}` +
        `\nBody snippet:\n${html.slice(0, 400)}`
    );
  }
}

test.describe.skip('Mini Smoke', () => {
  test('Wizard flow Next/Back/Reload', async ({ page }) => {
    const url = `${base}/wizard`;
    await page.goto(url);
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    // try basic nav: presence of any button and click
    await page.waitForTimeout(200);
    // reload and verify still loads
    await page.reload();
    await page.waitForTimeout(200);
    expect(consoleErrors.length).toBeLessThan(1);
  });

  test('Reports wrapper shows $ somewhere', async ({ page }) => {
    await page.goto(`${base}/wizard/pnl`);
    // navigate to reports route used in app
    await page.goto(`${base}/wizard/reports`);
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toMatch(/\$/);
  });

  test('Dashboard has three logical columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${base}/dashboard`);
    const panels = page.locator('.dashboard-panel');
    await expect(panels).toHaveCount(3, { timeout: 5000 });
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(panels).toHaveCount(3, { timeout: 5000 });
  });
});

// Additional smoke for dashboard gate & layout
test.describe('Dashboard Gate & Layout', () => {
  test('gate shows when forecast is NOT complete', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('forecast.complete'));
    await gotoRoute(page, '/dashboard');
    await expect(page.locator('[data-test="gate-locked"]')).toBeVisible({ timeout: 5000 });
  });

  test('dashboard shows 3 panels when complete (desktop width)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => localStorage.setItem('forecast.complete', '1'));
    await gotoRoute(page, '/dashboard');
    await expect(page.locator('.dashboard-grid')).toHaveCount(1);
    await expect(page.locator('.dashboard-panel')).toHaveCount(3);
  });

  test('panels still render at mobile width (stacked)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.addInitScript(() => localStorage.setItem('forecast.complete', '1'));
    await gotoRoute(page, '/dashboard');
    await expect(page.locator('.dashboard-panel')).toHaveCount(3);
  });

  test('basic nav sanity: wizard → reports → dashboard', async ({ page }) => {
    await gotoRoute(page, '/wizard');
    await expect(page.locator('[data-view="wizard"]')).toBeVisible();
    await gotoRoute(page, '/wizard/pnl');
    await expect(page.locator('[data-view="reports"]')).toBeVisible();
    await page.addInitScript(() => localStorage.setItem('forecast.complete', '1'));
    await gotoRoute(page, '/dashboard');
    await expect(page.locator('[data-view="dashboard"]')).toBeVisible();
  });
});
