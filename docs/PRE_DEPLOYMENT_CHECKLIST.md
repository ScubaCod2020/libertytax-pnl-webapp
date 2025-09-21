# Pre-Deployment Testing Checklist

## 🚀 Quick Deployment Verification

Use this checklist before every deployment to ensure quality and functionality.

### ✅ Build & Technical Checks

- [ ] `npm run build` completes successfully
- [ ] Bundle size is reasonable (< 250kB)
- [ ] No console errors in browser dev tools
- [ ] No TypeScript compilation errors
- [ ] Version number updated in package.json

### ✅ Wizard Flow Testing (5 minutes)

#### US Region Test

- [ ] Select "US" region
- [ ] Choose "Existing Store"
- [ ] Enter test data:
  - Last Year Tax Prep Income: $200,000
  - Average Net Fee: $125
  - Tax Prep Returns: 1,600
  - Total Expenses: $150,000
- [ ] Set growth to +10%
- [ ] Verify projected values calculate correctly:
  - Projected Tax Prep Income: $220,000
  - Projected ANF: $137.50
  - Projected Returns: 1,760
- [ ] Proceed to Page 2
- [ ] Verify carried-forward values appear with indicators
- [ ] TaxRush fields are hidden
- [ ] Test dual-entry on Salaries field:
  - Enter 25% → Should show dollar amount
  - Change to $55,000 → Should update percentage
- [ ] Complete wizard and verify dashboard loads

#### Canada Region Test

- [ ] Select "CA" region
- [ ] Same test as US but verify:
  - TaxRush fields are visible
  - TaxRush returns included in calculations
  - Regional messaging appears

### ✅ Dashboard Verification (3 minutes)

- [ ] KPI cards are visible and properly styled
- [ ] Net Income calculation looks correct
- [ ] Net Margin percentage is reasonable
- [ ] Cost per Return matches expectations
- [ ] Stoplight colors make sense for values
- [ ] Expense breakdown shows all categories

### ✅ Debug Panel Testing (3 minutes)

- [ ] Debug panel opens/closes properly
- [ ] Thresholds tab has three collapsible sections
- [ ] KPI threshold changes update dashboard colors
- [ ] Good/Better/Best preset buttons work
- [ ] Expense defaults display current values
- [ ] Storage tab shows session data
- [ ] Calculations tab shows intermediate values

### ✅ Regional Differences (2 minutes)

- [ ] Switch between US/CA regions
- [ ] TaxRush fields show/hide appropriately
- [ ] Income calculations include/exclude TaxRush
- [ ] Regional messaging updates correctly

### ✅ Data Persistence (1 minute)

- [ ] Enter some data and refresh page
- [ ] Verify data persists across refresh
- [ ] Clear storage and verify clean state

### ✅ Error Handling (2 minutes)

- [ ] Enter invalid values (negative, >100%)
- [ ] Verify validation prevents submission
- [ ] Try edge cases (0%, 100%, very large numbers)
- [ ] Confirm no crashes or console errors

## 🔍 Spot Check Calculations

Use these quick mental math checks:

### Example Store

- ANF: $125, Returns: 1,600, Discounts: 3%
- Expected calculations:
  - Tax Prep Income: $200,000 (125 × 1,600)
  - Gross Fees: ~$206,200 (200k ÷ 0.97)
  - Salaries at 25%: ~$51,550
  - Cost/Return with $150k expenses: ~$94

### Red Flags

- Net margin > 50% (too high)
- Net margin < -20% (too low)
- Cost per return > $200 (too expensive)
- Salaries > 40% of gross fees (too high)

## 📱 Cross-Browser Quick Check

- [ ] Chrome: Core functionality works
- [ ] Firefox: Layout looks correct
- [ ] Safari: No major issues
- [ ] Mobile: Responsive design intact

## 🎯 Performance Spot Check

- [ ] Initial load < 3 seconds
- [ ] Wizard transitions smooth
- [ ] Calculation updates instant
- [ ] No memory leaks during use

## 🚨 Stop Deployment If:

- Build fails
- Console shows errors
- Calculations are obviously wrong
- Wizard flow breaks
- Data doesn't persist
- Major UI elements missing

## ✅ Ready to Deploy When:

- All checklist items pass
- Calculations spot-checked and reasonable
- No console errors
- Core user flows work smoothly
- Performance is acceptable

---

**Time Required**: ~15 minutes for full checklist
**Critical Path**: Build → Wizard Flow → Dashboard → Debug Panel
