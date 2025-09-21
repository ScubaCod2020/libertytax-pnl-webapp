# Comprehensive Testing Checklist

## Every Button, Every Field, Every Regression Test

_Time Required: 45-60 minutes for complete testing_
_Critical for major releases and before production deployment_

---

## 🎯 PART 1: Complete Button Testing (15 minutes)

### Wizard Navigation Buttons

- [ ] **Welcome → Inputs "Next"**: Click and verify page transition
- [ ] **Inputs → Review "Next"**: Click and verify page transition
- [ ] **Review → Complete "Confirm & Create Dashboard"**: Click and verify wizard completion
- [ ] **Inputs ← Welcome "Back"**: Click and verify page transition
- [ ] **Review ← Inputs "Back"**: Click and verify page transition
- [ ] **Wizard "Cancel"**: Click and verify returns to main dashboard
- [ ] **"Start Wizard" button**: Click and verify wizard opens

### Debug Panel Buttons

- [ ] **Debug Toggle (Footer)**: Click to open debug panel
- [ ] **Debug Close (X)**: Click to close debug panel
- [ ] **Storage Tab**: Click and verify content loads
- [ ] **Calc Tab**: Click and verify calculations display
- [ ] **State Tab**: Click and verify app state displays
- [ ] **Perf Tab**: Click and verify performance metrics display
- [ ] **Thresholds Tab**: Click and verify threshold controls display

### Debug Panel Action Buttons

- [ ] **"Save Now"**: Click and verify data saves
- [ ] **"Dump Storage"**: Click and verify console output
- [ ] **"Copy JSON"**: Click and verify clipboard copy
- [ ] **"Clear Storage"**: Click and verify storage clears
- [ ] **"Show Wizard"**: Click and verify wizard opens

### Debug Thresholds Section Buttons

- [ ] **KPI Thresholds Expand/Collapse**: Click header and verify toggle
- [ ] **Scenario Presets Expand/Collapse**: Click header and verify toggle
- [ ] **Expense Defaults Expand/Collapse**: Click header and verify toggle
- [ ] **"Good" Preset Button**: Click and verify all fields update
- [ ] **"Better" Preset Button**: Click and verify all fields update
- [ ] **"Best" Preset Button**: Click and verify all fields update
- [ ] **"Reset All to Factory Defaults"**: Click and verify complete reset

### Main Dashboard Buttons

- [ ] **Scenario Selector Dropdown**: Test all options (Custom, Good, Better, Best)
- [ ] **Region Toggle**: Switch between US/CA and verify TaxRush fields

---

## 📝 PART 2: Complete Field Testing (20 minutes)

### Wizard Page 1 Fields

#### Basic Fields

- [ ] **Region Dropdown**:
  - Select US → Verify TaxRush fields hidden
  - Select CA → Verify TaxRush fields visible
  - Switch back to US → Verify fields hide again
- [ ] **Store Type Dropdown**:
  - Leave empty → Verify "Select store type..." shows
  - Select "New Store" → Verify message updates
  - Select "Existing Store" → Verify performance sections appear
  - Switch back to "New Store" → Verify sections hide

#### Existing Store Performance Fields (CA Region)

- [ ] **Last Year Tax Prep Income**: Enter $200000, verify accepts
- [ ] **Last Year Average Net Fee**: Enter $125, verify accepts
- [ ] **Last Year Tax Prep Returns**: Enter 1600, verify accepts
- [ ] **Last Year TaxRush Returns**: Enter 400, verify accepts (CA only)
- [ ] **Last Year Total Expenses**: Enter $150000, verify accepts

#### Growth Calculation Testing

- [ ] **Growth Dropdown**: Test each option:
  - [ ] -20% (Decline) → Verify projected values calculate
  - [ ] -10% (Slight decline) → Verify calculation
  - [ ] 0% (Same as last year) → Verify calculation
  - [ ] +5% (Conservative growth) → Verify calculation
  - [ ] +10% (Moderate growth) → Verify calculation
  - [ ] +15% (Strong growth) → Verify calculation
  - [ ] +20% (Aggressive growth) → Verify calculation
  - [ ] +25% (Very aggressive) → Verify calculation
  - [ ] Custom percentage... → Verify custom input appears

#### Custom Growth Testing

- [ ] **Custom Growth Input**:
  - Enter 12 → Verify dropdown shows "custom"
  - Enter -5 → Verify negative growth works
  - Enter 50 → Verify extreme positive growth
  - Clear field → Verify dropdown resets

#### Projected Performance Override Testing

- [ ] **Projected Tax Prep Income**: Edit calculated value, verify accepts
- [ ] **Projected Average Net Fee**: Edit calculated value, verify accepts
- [ ] **Projected Tax Prep Returns**: Edit calculated value, verify accepts
- [ ] **Projected TaxRush Returns**: Edit calculated value, verify accepts (CA)
- [ ] **Projected Total Expenses**: Edit calculated value, verify accepts

### Wizard Page 2 Fields

#### Income Drivers Section

- [ ] **Average Net Fee**: Verify carries forward from Page 1, test edit
- [ ] **Tax Prep Returns**: Verify carries forward from Page 1, test edit
- [ ] **TaxRush Returns**: Verify carries forward from Page 1 (CA only), test edit
- [ ] **Other Income**: Enter $5000, verify accepts
- [ ] **Discounts %**: Enter 3, verify accepts

#### Dual-Entry Expense Testing (Test ALL 17 categories)

For each expense field, perform this test:

1. **Personnel - Salaries**:
   - [ ] Enter 25% → Verify dollar amount calculates and displays
   - [ ] Clear and enter $50000 → Verify percentage calculates
   - [ ] Verify calculation base shows correctly
2. **Personnel - Employee Deductions**:
   - [ ] Enter 10% → Verify dollar amount (should be % of salaries)
   - [ ] Clear and enter $5000 → Verify percentage
3. **Facility - Rent**:
   - [ ] Enter 18% → Verify dollar amount
   - [ ] Clear and enter $35000 → Verify percentage
4. **Facility - Telephone**:
   - [ ] Enter $200 → Verify (fixed amount, no percentage)
5. **Facility - Utilities**:
   - [ ] Enter $300 → Verify (fixed amount)
6. **Operations - Local Advertising**:
   - [ ] Enter $500 → Verify (fixed amount)
7. **Operations - Insurance**:
   - [ ] Enter $150 → Verify (fixed amount)
8. **Operations - Postage**:
   - [ ] Enter $100 → Verify (fixed amount)
9. **Operations - Office Supplies**:
   - [ ] Enter 3.5% → Verify dollar calculation
   - [ ] Clear and enter $7000 → Verify percentage
10. **Operations - Dues & Subscriptions**:
    - [ ] Enter $200 → Verify (fixed amount)
11. **Operations - Bank Fees**:
    - [ ] Enter $100 → Verify (fixed amount)
12. **Operations - Maintenance**:
    - [ ] Enter $150 → Verify (fixed amount)
13. **Operations - Travel & Entertainment**:
    - [ ] Enter $200 → Verify (fixed amount)
14. **Franchise - Tax Prep Royalties**:
    - [ ] Enter 14% → Verify dollar calculation
    - [ ] Clear and enter $28000 → Verify percentage
15. **Franchise - Advertising Royalties**:
    - [ ] Enter 5% → Verify dollar calculation
    - [ ] Clear and enter $10000 → Verify percentage
16. **Franchise - TaxRush Royalties**:
    - [ ] Enter 0% (US) or test value (CA) → Verify calculation
17. **Miscellaneous - Miscellaneous**:
    - [ ] Enter 2.5% → Verify dollar calculation
    - [ ] Clear and enter $5000 → Verify percentage

### Debug Panel Field Testing

#### KPI Thresholds (5 numeric inputs)

- [ ] **Cost/Return Green ≤ $**: Enter 20, verify dashboard color updates
- [ ] **Cost/Return Yellow ≤ $**: Enter 30, verify dashboard color updates
- [ ] **Net Margin Green ≥ %**: Enter 25, verify dashboard color updates
- [ ] **Net Margin Yellow ≥ %**: Enter 15, verify dashboard color updates
- [ ] **Net Income Warning ≤ $**: Enter -10000, verify dashboard color updates

---

## 🔄 PART 3: Regression & Data Flow Testing (15 minutes)

### Cross-Step Data Consistency

1. **Page 1 → Page 2 Flow**:
   - [ ] Enter data on Page 1 → Go to Page 2 → Verify all values carried forward
   - [ ] Modify Page 2 values → Go back to Page 1 → Verify original values preserved
   - [ ] Change Page 1 values → Return to Page 2 → Verify updates reflected

2. **Wizard → Dashboard Flow**:
   - [ ] Complete wizard with specific values
   - [ ] Verify dashboard shows exact same values
   - [ ] Verify calculations match expected results

3. **Dashboard → Debug Flow**:
   - [ ] Change values in dashboard
   - [ ] Open debug panel → State tab → Verify values match
   - [ ] Change thresholds → Verify dashboard colors update immediately

### Preset Regression Testing

1. **Apply Good Preset**:
   - [ ] Click Good preset button
   - [ ] Verify ANF = $130, Returns = 1680, Salaries = 26%, Rent = 18%
   - [ ] Verify all other fields update appropriately

2. **Apply Better Preset**:
   - [ ] Click Better preset button
   - [ ] Verify ANF = $135, Returns = 1840, Salaries = 24%, Rent = 17%
   - [ ] Verify calculations update

3. **Apply Best Preset**:
   - [ ] Click Best preset button
   - [ ] Verify ANF = $140, Returns = 2000, Salaries = 22%, Rent = 16%
   - [ ] Verify calculations update

### Regional Regression Testing

1. **US → CA → US Flow**:
   - [ ] Start in US region with data
   - [ ] Switch to CA → Verify TaxRush fields appear
   - [ ] Enter TaxRush data
   - [ ] Switch back to US → Verify TaxRush fields hidden, data preserved

### Persistence Regression Testing

1. **Data Survival Test**:
   - [ ] Enter complex data set
   - [ ] Refresh page → Verify all data persists
   - [ ] Close/reopen browser → Verify data still there
   - [ ] Clear storage → Verify clean slate

---

## 🚨 PART 4: Edge Cases & Error Handling (10 minutes)

### Invalid Input Testing

- [ ] **Negative Values**: Enter -100 in expense fields → Verify validation
- [ ] **Extreme Values**: Enter 999999999 → Verify handling
- [ ] **Invalid Percentages**: Enter 150% → Verify validation prevents
- [ ] **Empty Required Fields**: Try to proceed with empty fields → Verify blocks
- [ ] **Non-numeric Input**: Enter "abc" in numeric fields → Verify handling

### Calculation Edge Cases

- [ ] **Division by Zero**: Set returns to 0 → Verify cost/return handles gracefully
- [ ] **Zero Revenue**: Set ANF to 0 → Verify percentage calculations handle
- [ ] **Maximum Expenses**: Set all expenses to maximum → Verify negative income handles

### UI Edge Cases

- [ ] **Rapid Clicking**: Click buttons rapidly → Verify no duplicate actions
- [ ] **Tab Switching**: Switch debug tabs rapidly → Verify no errors
- [ ] **Window Resize**: Resize browser → Verify responsive design works

---

## ✅ PART 5: Final Verification (5 minutes)

### Console Check

- [ ] **No Errors**: Open dev tools console → Verify no red errors
- [ ] **No Warnings**: Verify no yellow warnings during testing
- [ ] **Network Tab**: Verify no failed requests

### Performance Check

- [ ] **Smooth Interactions**: All clicks/inputs respond quickly
- [ ] **No Memory Leaks**: Performance tab shows stable memory usage
- [ ] **Bundle Size**: Verify reasonable bundle size in Network tab

### Cross-Browser Spot Check

- [ ] **Chrome**: Core functionality works
- [ ] **Firefox**: No major layout issues
- [ ] **Safari**: Basic functionality intact

---

## 🎯 Pass/Fail Criteria

### ✅ PASS Requirements:

- All buttons function as expected
- All fields accept valid input and reject invalid input
- Data flows correctly between all steps
- Calculations are mathematically correct
- Regional differences work properly
- Debug panel fully functional
- No console errors
- Performance is acceptable

### ❌ FAIL Conditions:

- Any button doesn't work
- Any field accepts invalid data
- Data doesn't flow between steps correctly
- Calculations are wrong
- Console shows errors
- App crashes or becomes unresponsive
- Major UI elements broken

---

**🚀 Ready for deployment when ALL checklist items pass!**

_This comprehensive testing ensures every interactive element works correctly and all data flows maintain integrity throughout the entire application._
