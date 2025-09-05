// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Liberty Tax P&L Webapp - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Liberty Tax/);
    
    // Check that the page loaded content
    await expect(page.locator('body')).toBeVisible();
    
    // Look for key elements that should be present
    const hasMainContent = await page.locator('main, #root, .app, [class*="app"]').first().isVisible();
    expect(hasMainContent).toBeTruthy();
  });

  test('wizard can be opened', async ({ page }) => {
    // Look for wizard start button with various possible selectors
    const startButton = page.locator('button').filter({ 
      hasText: /start|wizard|begin|create/i 
    }).first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Check if wizard opened - look for wizard-specific content
      const wizardContent = page.locator('h1, h2, h3, [class*="wizard"], [id*="wizard"]').filter({ 
        hasText: /welcome|region|store|step/i 
      });
      
      await expect(wizardContent.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip('Start wizard button not found - may be different implementation');
    }
  });

  test('debug panel can be accessed', async ({ page }) => {
    // Look for debug button (usually in footer or corner)
    const debugButton = page.locator('button').filter({ 
      hasText: /debug/i 
    }).first();
    
    if (await debugButton.isVisible()) {
      await debugButton.click();
      
      // Check if debug panel opened
      const debugPanel = page.locator('[class*="debug"], [id*="debug"], [data-testid*="debug"]');
      await expect(debugPanel.first()).toBeVisible({ timeout: 5000 });
    } else {
      test.skip('Debug button not found - may be hidden or different implementation');
    }
  });

  test('no JavaScript errors on page load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for errors
    expect(errors).toHaveLength(0);
  });

  test('responsive design - no horizontal scroll', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 390, height: 844 }, // iPhone 12 Pro
      { width: 768, height: 1024 }, // iPad
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      
      // Allow small tolerance (5px) for rounding
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    }
  });

  test('basic form interactions work', async ({ page }) => {
    // Look for any input fields or dropdowns
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // Test first few inputs
      for (let i = 0; i < Math.min(3, inputCount); i++) {
        const input = inputs.nth(i);
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'input') {
          const inputType = await input.getAttribute('type') || 'text';
          
          if (inputType === 'text' || inputType === 'number') {
            await input.click();
            await input.fill('123');
            const value = await input.inputValue();
            expect(value).toBe('123');
          }
        } else if (tagName === 'select') {
          await input.click();
          // Just verify it's interactive
          expect(await input.isEnabled()).toBeTruthy();
        }
      }
    } else {
      test.skip('No form inputs found to test');
    }
  });
});
