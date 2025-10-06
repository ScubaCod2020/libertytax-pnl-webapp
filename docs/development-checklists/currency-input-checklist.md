# Currency Input Checklist

## Problem Statement

Currency fields throughout the app were displaying raw floating-point numbers (e.g., "133212.81600000002") instead of properly formatted currency (e.g., "$133,212.82"). This was caused by missing `appCurrencyInput` directive on currency input fields.

## Mandatory Checklist: Currency Fields

### ✅ EVERY currency input field MUST have:

1. **`appCurrencyInput` directive** - Handles formatting, rounding, and display
2. **`<span class="prefix">$</span>`** - Currency symbol prefix
3. **`type="number"`** - Numeric input type

### ✅ Correct Pattern:

```html
<div class="currency">
  <span class="prefix">$</span>
  <input
    type="number"
    appCurrencyInput
    [ngModel]="someValue$ | async"
    (ngModelChange)="handleChange($event)"
    placeholder="0.00"
  />
</div>
```

### ❌ Incorrect Pattern (Missing directive):

```html
<div class="currency">
  <span class="prefix">$</span>
  <input
    type="number"
    [ngModel]="someValue$ | async"
    (ngModelChange)="handleChange($event)"
    placeholder="0.00"
  />
</div>
```

## How to Find Currency Fields

### Search Commands:

```bash
# Find all currency fields in the app
grep -r "prefix.*\$" angular/src/app --include="*.html" --include="*.ts"

# Find currency inputs missing the directive
grep -r "prefix.*\$" angular/src/app --include="*.html" --include="*.ts" -A 3 | grep -B 3 -A 3 "input.*type.*number" | grep -v "appCurrencyInput"
```

### Components Already Fixed:

✅ **Projected Income Drivers** (`projected-income-drivers.component.html`)
✅ **PY Income Drivers** (`py-income-drivers.component.html`)
✅ **Target Income Drivers** (`target-income-drivers.component.html`)
✅ **Expenses Component** (`expenses.component.html`)
✅ **Dashboard Inputs Panel** (`inputs-panel.component.ts`)

## What `appCurrencyInput` Does:

### On Focus (Editing):

- Shows raw number: `133212.82`
- Allows precise decimal input
- Sets `step="0.01"` for cent-level precision

### On Blur (Display):

- Formats with commas: `133,212.82`
- Rounds to 2 decimal places
- Handles floating-point precision errors

### Benefits:

- **Eliminates floating-point display errors** (no more "133212.81600000002")
- **Professional currency formatting** with commas and proper decimals
- **Consistent user experience** across all currency fields
- **Proper input validation** and step controls

## Code Review Requirements:

### Before Merging ANY PR:

1. **Search for new currency fields**: `grep -r "prefix.*\$" [changed-files]`
2. **Verify `appCurrencyInput` is present** on ALL currency inputs
3. **Test currency display** - should show formatted values like "$1,234.56"
4. **Test currency editing** - should allow precise decimal input

### New Currency Field Checklist:

- [ ] Has `<span class="prefix">$</span>`
- [ ] Has `appCurrencyInput` directive
- [ ] Has `type="number"`
- [ ] Displays formatted currency on blur
- [ ] Allows precise editing on focus
- [ ] No floating-point precision errors

## Prevention Strategy:

### ESLint Rule (Future):

Consider adding a custom ESLint rule to automatically detect currency fields missing the directive:

```javascript
// Future: Custom rule to detect missing appCurrencyInput
"custom/currency-input-directive": "error"
```

### Template Linting:

- Add template linting to catch `<span class="prefix">$</span>` without corresponding `appCurrencyInput`
- Integrate into CI/CD pipeline

---

**Remember**: Every time you add a currency field, you MUST include `appCurrencyInput` directive to prevent floating-point display issues and ensure consistent currency formatting across the application.
