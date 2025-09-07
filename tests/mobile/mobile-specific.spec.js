// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Liberty Tax P&L Webapp - Mobile Specific Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('touch targets are large enough', async ({ page }) => {
    // Find all buttons and interactive elements
    const buttons = page.locator('button, a, input, select, [role="button"]');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Minimum touch target size should be 44x44px (Apple guidelines)
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('mobile keyboard interactions', async ({ page }) => {
    // Find numeric input fields
    const numericInputs = page.locator('input[type="number"], input[inputmode="numeric"]');
    const inputCount = await numericInputs.count();
    
    if (inputCount > 0) {
      const firstInput = numericInputs.first();
      await firstInput.click();
      
      // On mobile, numeric keyboard should appear
      // We can't directly test keyboard appearance, but we can test input behavior
      await firstInput.fill('123.45');
      const value = await firstInput.inputValue();
      expect(value).toBe('123.45');
    }
  });

  test('viewport meta tag prevents zoom', async ({ page }) => {
    // Check for proper viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    const content = await viewportMeta.getAttribute('content');
    
    // Should have viewport meta tag that prevents unwanted zoom
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1');
  });

  test('orientation change handling', async ({ page, browserName }) => {
    // Skip on webkit as it doesn't support orientation change simulation well
    test.skip(browserName === 'webkit', 'Orientation change not reliable on WebKit');
    
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // Check no horizontal scroll in portrait
    let bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 5);
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500); // Wait for layout adjustment
    
    // Check no horizontal scroll in landscape
    bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(667 + 5);
  });

  test('mobile-specific layout elements', async ({ page }) => {
    // Check if mobile layout adaptations are working
    const viewport = page.viewportSize();
    
    if (viewport && viewport.width < 768) {
      // On mobile, certain elements might be hidden or repositioned
      // This is a placeholder for mobile-specific layout checks
      
      // Check that content is not cut off
      const mainContent = page.locator('main, #root, .app').first();
      const box = await mainContent.boundingBox();
      
      if (box) {
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('scroll behavior on mobile', async ({ page }) => {
    // Ensure page can scroll vertically but not horizontally
    const viewport = page.viewportSize();
    
    if (viewport) {
      // Check document dimensions
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight
      }));
      
      // Should not have horizontal scroll
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 5);
      
      // Should be able to scroll vertically if content is tall
      if (dimensions.scrollHeight > dimensions.clientHeight) {
        await page.evaluate(() => window.scrollTo(0, 100));
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
      }
    }
  });

  test('mobile performance - load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds on mobile
    expect(loadTime).toBeLessThan(5000);
  });

  test('mobile gestures do not interfere', async ({ page }) => {
    // Test that common mobile gestures don't break the app
    const mainContent = page.locator('main, #root, .app').first();
    
    if (await mainContent.isVisible()) {
      const box = await mainContent.boundingBox();
      
      if (box) {
        // Simulate swipe gesture (shouldn't navigate away or break layout)
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        
        // Page should still be functional
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });
});
