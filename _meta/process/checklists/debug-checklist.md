# 🐛 Debug Checklist - Liberty Tax P&L App

## Current Issues Identified

- [ ] **Calculations not working** - Values not updating/computing correctly
- [ ] **Expenses page not loading** - Route/component issues
- [ ] **Reports page not loading** - Route/component issues
- [ ] **State management** - Data not flowing between components
- [ ] **Component wiring** - Services not properly connected

## Debugging Steps (Execute in Order)

### 1. Browser Console Check

- [ ] Open DevTools (F12) on http://localhost:4200
- [ ] Check Console tab for JavaScript errors
- [ ] Check Network tab for failed requests
- [ ] Note any red error messages

### 2. Route Testing

- [ ] Test `/wizard/income-drivers` - Should load Income Drivers page
- [ ] Test `/wizard/expenses` - Should load Expenses page
- [ ] Test `/wizard/pnl` - Should load P&L/Reports page
- [ ] Test `/dashboard` - Should load Dashboard
- [ ] Note which routes fail vs succeed

### 3. State Management Verification

- [ ] Open DevTools → Application → Local Storage
- [ ] Check if `wizard-answers` key exists and has data
- [ ] Try entering values in Quick Start Wizard
- [ ] Verify localStorage updates when values change
- [ ] Check if values persist across page refreshes

### 4. Component Loading Test

- [ ] Navigate to Income Drivers - verify Quick Start Wizard appears
- [ ] Try changing Region from US to CA - verify UI updates
- [ ] Try changing Store Type from Existing to New - verify components switch
- [ ] Enter values in form fields - verify they save and calculate

### 5. Service Injection Check

- [ ] Check if WizardStateService is properly injected in all components
- [ ] Check if calculations are happening in BiDirService
- [ ] Verify MetricsAssemblerService is using real data vs demo data

### 6. Calculation Flow Test

- [ ] Enter Tax Prep Returns: 1000
- [ ] Enter Average Net Fee: 150
- [ ] Verify Gross Fees auto-calculates to 150,000
- [ ] Enter Discount %: 5%
- [ ] Verify Discount Amount auto-calculates
- [ ] Verify Tax Prep Income updates

## Error Tracking Template

```
ERROR: [Description]
LOCATION: [Component/Service/Route]
CONSOLE MESSAGE: [Exact error text]
REPRODUCTION STEPS: [How to trigger]
STATUS: [Investigating/Fixed/Blocked]
```

## Next Steps After Diagnosis

1. **High Priority**: Fix critical errors preventing page loads
2. **Medium Priority**: Fix calculation/state issues
3. **Low Priority**: UI/UX improvements and edge cases

## Tools Available

- Browser DevTools (Console, Network, Application)
- Angular DevTools extension (if installed)
- `ng serve` output in terminal
- Playwright test results
- Linting tools (`npx ng lint`)
