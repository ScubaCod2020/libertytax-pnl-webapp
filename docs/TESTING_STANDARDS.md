# Testing Standards & Component Guidelines

## Overview
This document establishes standards for building testable, maintainable components that work consistently across desktop and mobile.

## Component Testing Standards

### 1. Data Attributes (Required)
Every interactive element must have a `data-testid`:

```tsx
// ✅ Good
<button data-testid="wizard-launch-btn">🚀 Setup Wizard</button>
<h1 data-testid="app-title">P&L Budget & Forecast</h1>
<select data-testid="region-selector" aria-label="Region">

// ❌ Bad
<button>🚀 Setup Wizard</button>
<h1>P&L Budget & Forecast</h1>
```

### 2. Component Structure Standards

#### Page Layout
```tsx
// Standard page structure
<div data-testid="app-container">
  <header data-testid="app-header">
    <h1 data-testid="app-title">App Title</h1>
  </header>
  <main data-testid="app-main">
    <section data-testid="wizard-section">
      <button data-testid="wizard-launch-btn">Launch Wizard</button>
    </section>
  </main>
  <footer data-testid="app-footer">
    <nav data-testid="footer-nav">...</nav>
  </footer>
</div>
```

#### Form Components
```tsx
// Standard form structure
<div data-testid="form-container">
  <label data-testid="field-label" htmlFor="field-input">
    Field Label
  </label>
  <input 
    data-testid="field-input"
    id="field-input"
    type="text"
    aria-describedby="field-help"
  />
  <div data-testid="field-help" id="field-help">
    Help text
  </div>
</div>
```

### 3. Mobile-First Responsive Standards

#### CSS Classes
```css
/* Mobile-first responsive classes */
.mobile-stack { /* Stack elements vertically on mobile */ }
.mobile-full-width { /* Full width on mobile */ }
.mobile-hidden { /* Hide on mobile */ }
.desktop-only { /* Show only on desktop */ }
```

#### Touch Targets
- Minimum 44px height for touch targets
- Adequate spacing between interactive elements
- Clear visual feedback for touch states

### 4. Testing Patterns

#### Page Object Model
```javascript
// tests/pages/AppPage.js
export class AppPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  get title() { return this.page.getByTestId('app-title'); }
  get wizardButton() { return this.page.getByTestId('wizard-launch-btn'); }
  get regionSelector() { return this.page.getByTestId('region-selector'); }

  async launchWizard() {
    await this.wizardButton.click();
  }
}
```

#### Test Structure
```javascript
// tests/app.spec.js
import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage';

test.describe('App Functionality', () => {
  let appPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    await appPage.goto();
  });

  test('displays correctly on mobile', async () => {
    await expect(appPage.title).toBeVisible();
    await expect(appPage.wizardButton).toBeVisible();
  });
});
```

## Implementation Priority

### Phase 1: Critical Components
1. Add `data-testid` to all major UI elements
2. Standardize form structure
3. Fix mobile responsive issues

### Phase 2: Test Infrastructure
1. Create Page Object Model
2. Update all tests to use data attributes
3. Add mobile-specific test patterns

### Phase 3: Advanced Features
1. Accessibility testing standards
2. Performance testing patterns
3. Visual regression testing

## Benefits

- **Stable Tests**: Tests won't break when UI text changes
- **Faster Development**: Clear patterns for new components
- **Better Mobile Support**: Consistent responsive behavior
- **Easier Maintenance**: Standardized component structure
- **Team Collaboration**: Clear guidelines for all developers

## Next Steps

1. Audit current components and add missing `data-testid` attributes
2. Refactor tests to use Page Object Model
3. Update CSS to follow mobile-first standards
4. Create component templates for future development
