# Testing Strategy for Liberty Tax P&L Webapp

## Overview

Comprehensive testing approach to ensure calculation accuracy, data flow integrity, and user experience quality across the multi-step wizard and dual-entry expense system.

## 1. 🧮 Calculation Accuracy Testing

### 1.1 Wizard Step-by-Step Calculation Verification

#### **Page 1 (Welcome) → Page 2 (Inputs) Data Flow**

```
Test Case: Performance Data Carryover
1. Enter Last Year Performance:
   - Tax Prep Income: $200,000
   - Average Net Fee: $125
   - Tax Prep Returns: 1,600
   - TaxRush Returns: 400 (CA only)
   - Total Expenses: $150,000

2. Set Expected Growth: +10%
3. Verify Projected Performance calculations:
   - Tax Prep Income: $220,000 (200k * 1.1)
   - Average Net Fee: $137.50 (125 * 1.1)
   - Tax Prep Returns: 1,760 (1600 * 1.1)
   - TaxRush Returns: 440 (400 * 1.1, CA only)
   - Total Expenses: $165,000 (150k * 1.1)

4. Proceed to Page 2 and verify:
   - Income fields show projected values
   - Visual indicators show "carried forward"
   - Values are editable but marked as inherited
```

#### **Dual-Entry Expense System Verification**

```
Test Case: Percentage ↔ Dollar Auto-Sync
1. For each expense field, test:
   - Enter 25% → Verify dollar calculation
   - Enter $50,000 → Verify percentage calculation
   - Verify calculation base is displayed correctly

2. Test different calculation bases:
   - Salaries (25% of gross fees): Base = Projected Revenue / (1 - discount%)
   - Rent (18% of gross fees): Base = Projected Revenue / (1 - discount%)
   - Employee Deductions (10% of salaries): Base = Salaries amount
   - Fixed amounts (Telephone): No percentage conversion

3. Edge cases:
   - 0% → $0
   - 100% → Full base amount
   - Invalid inputs (negative, >100%) → Validation triggers
```

### 1.2 Dashboard Calculation Verification

#### **KPI Calculations**

```
Test Case: Net Income Calculation
Given:
- Tax Prep Income: $200,000
- TaxRush Income: $20,000 (CA only)
- Other Income: $5,000
- Total Expenses: $150,000

Expected:
- Gross Fees: $225,000
- Discounts (3%): $6,750
- Net Income: $225,000 - $6,750 - $150,000 = $68,250
- Net Margin: 68,250 / 218,250 = 31.3%
- Cost per Return: $150,000 / 1,600 = $93.75
```

#### **KPI Color Thresholds**

```
Test Case: Stoplight Status
1. Set thresholds via debug panel:
   - Cost/Return Green ≤ $25, Yellow ≤ $35
   - Net Margin Green ≥ 20%, Yellow ≥ 10%

2. Test scenarios:
   - Good performance → All green
   - Marginal performance → Yellow indicators
   - Poor performance → Red indicators

3. Verify threshold changes update colors instantly
```

## 2. 🔄 Data Flow Integration Testing

### 2.1 Wizard Flow Testing

```
Test Suite: Complete Wizard Journey
1. Welcome Page:
   - Region selection (US/CA) affects TaxRush visibility
   - Store type affects workflow
   - Performance calculations work correctly
   - Growth percentage dropdown functions
   - Custom percentage input works

2. Inputs Page:
   - Carried-forward values display correctly
   - Dual-entry system functions for all 17 categories
   - Regional fields (TaxRush) show/hide appropriately
   - Validation prevents invalid entries

3. Review Page:
   - All data displays correctly
   - Calculations match expected values
   - Regional differences reflected

4. Dashboard Creation:
   - All wizard data transfers to main app
   - KPI cards display correct values
   - Expense breakdown shows proper categories
```

### 2.2 Debug Panel Integration

```
Test Suite: Advanced Controls
1. Thresholds Tab:
   - KPI threshold changes update dashboard colors
   - Scenario presets apply correctly (Good/Better/Best)
   - Expense defaults display current values
   - Factory reset works properly

2. Other Debug Tabs:
   - Storage shows correct persistence data
   - Calculations display accurate intermediate values
   - State reflects current app values
   - Performance metrics are reasonable
```

## 3. 🌍 Regional Testing

### 3.1 US vs Canada Differences

```
Test Cases: Regional Variations
1. US Region:
   - TaxRush fields hidden throughout
   - TaxRush royalties = 0
   - Expense calculations exclude TaxRush income

2. Canada Region:
   - TaxRush fields visible and functional
   - TaxRush royalties calculated correctly
   - Income includes TaxRush revenue
   - Regional messaging displays
```

## 4. 🎯 User Experience Testing

### 4.1 UI/UX Validation

```
Test Suite: Interface Quality
1. Responsive Design:
   - Debug panel doesn't overlap main content
   - Wizard navigation accessible
   - Mobile/tablet layouts work

2. Visual Feedback:
   - Loading states during calculations
   - Error messages for invalid inputs
   - Success indicators for completed steps
   - Proper spacing and alignment

3. Accessibility:
   - Keyboard navigation works
   - Screen reader compatibility
   - Color contrast sufficient
   - Focus indicators visible
```

### 4.2 Performance Testing

```
Test Suite: Performance Metrics
1. Load Times:
   - Initial app load < 3 seconds
   - Wizard step transitions < 500ms
   - Calculation updates < 200ms

2. Bundle Analysis:
   - JavaScript bundle size reasonable
   - No unnecessary dependencies
   - Code splitting effective

3. Memory Usage:
   - No memory leaks during extended use
   - Reasonable RAM consumption
   - Cleanup on component unmount
```

## 5. 🔧 Technical Testing

### 5.1 State Management

```
Test Suite: State Integrity
1. Persistence:
   - Data saves to localStorage correctly
   - Hydration restores state properly
   - Session survives page refresh

2. State Updates:
   - Changes propagate to all components
   - No stale state issues
   - Proper cleanup on reset

3. Hook Integration:
   - useAppState manages all state correctly
   - useCalculations produces accurate results
   - usePersistence handles save/load properly
```

### 5.2 Error Handling

```
Test Suite: Error Scenarios
1. Invalid Inputs:
   - Negative numbers handled gracefully
   - Empty fields don't break calculations
   - Type mismatches caught and corrected

2. Edge Cases:
   - Division by zero scenarios
   - Extremely large numbers
   - Floating point precision issues

3. Network Issues:
   - Graceful degradation if external resources fail
   - Local functionality remains intact
```

## 6. 🚀 Pre-Deployment Checklist

### 6.1 Automated Testing

```bash
# Run these before every deployment:
npm run build          # Verify build succeeds
npm run test          # Run test suite (when implemented)
npm audit             # Check for security vulnerabilities
```

### 6.2 Manual Testing Checklist

```
Pre-Deployment Verification:
□ Complete wizard flow (US and CA)
□ All dual-entry calculations accurate
□ Dashboard KPIs display correctly
□ Debug panel functions properly
□ Threshold changes update UI
□ Preset scenarios apply correctly
□ Regional differences work
□ Data persists across sessions
□ No console errors
□ Bundle size reasonable
□ Performance acceptable
```

## 7. 🧪 Test Data Sets

### 7.1 Standard Test Scenarios

```javascript
// Conservative Store
const conservativeStore = {
  avgNetFee: 120,
  taxPrepReturns: 1500,
  taxRushReturns: 200, // CA only
  salariesPct: 28,
  rentPct: 20,
  expectedGrowth: 5,
};

// Aggressive Store
const aggressiveStore = {
  avgNetFee: 150,
  taxPrepReturns: 2200,
  taxRushReturns: 600, // CA only
  salariesPct: 22,
  rentPct: 15,
  expectedGrowth: 20,
};

// Struggling Store
const strugglingStore = {
  avgNetFee: 100,
  taxPrepReturns: 1200,
  taxRushReturns: 100, // CA only
  salariesPct: 35,
  rentPct: 25,
  expectedGrowth: -10,
};
```

### 7.2 Edge Case Test Data

```javascript
// Extreme Values
const edgeCases = [
  { avgNetFee: 1, taxPrepReturns: 1 }, // Minimum values
  { avgNetFee: 999, taxPrepReturns: 9999 }, // Large values
  { salariesPct: 0 }, // Zero percentage
  { salariesPct: 100 }, // Maximum percentage
  { expectedGrowth: -50 }, // Large decline
  { expectedGrowth: 100 }, // Extreme growth
];
```

## 8. 🔍 Comprehensive UI & Regression Testing

### 8.1 Complete Button Testing Matrix

```
Every Button Must Be Tested:
□ Wizard "Next" buttons (Welcome → Inputs → Review)
□ Wizard "Back" buttons (Review → Inputs → Welcome)
□ Wizard "Cancel" button
□ Wizard "Confirm & Create Dashboard" button
□ Region selector dropdown (US/CA)
□ Store type dropdown (New/Existing)
□ Growth percentage dropdown (all options + custom)
□ Debug panel toggle button
□ Debug panel close (X) button
□ Debug tab buttons (Storage, Calc, State, Perf, Thresholds)
□ Debug section expand/collapse buttons (KPI, Presets, Expenses)
□ Scenario preset buttons (Good, Better, Best)
□ Factory reset button
□ All debug action buttons (Save Now, Dump Storage, etc.)
```

### 8.2 Complete Field Testing Matrix

```
Every Input Field Must Be Tested:
WIZARD PAGE 1:
□ Region dropdown (US → CA → US)
□ Store Type dropdown (empty → new → existing → new)
□ Last Year Tax Prep Income (valid/invalid/edge cases)
□ Last Year Average Net Fee (valid/invalid/edge cases)
□ Last Year Tax Prep Returns (valid/invalid/edge cases)
□ Last Year TaxRush Returns (CA only, show/hide)
□ Last Year Total Expenses (valid/invalid/edge cases)
□ Growth percentage dropdown (all 9 options)
□ Custom growth percentage input (when selected)
□ Projected performance overrides (5 fields, editable)

WIZARD PAGE 2:
□ All income driver fields (ANF, Returns, TaxRush, Other Income)
□ All 17 dual-entry expense fields (% and $ for each)
□ Discounts percentage field

MAIN DASHBOARD:
□ All input fields when not in wizard mode
□ Scenario selector dropdown
□ All expense fields in main interface

DEBUG PANEL:
□ All KPI threshold inputs (5 numeric fields)
□ All debug panel buttons and controls
```

### 8.3 Regression Testing Protocol

```
Data Flow Consistency Tests:
1. Enter value in Page 1 → Verify appears in Page 2
2. Change value in Page 2 → Verify calculations update
3. Go back to Page 1 → Change value → Return to Page 2 → Verify update
4. Complete wizard → Verify all data in dashboard
5. Change dashboard values → Verify calculations update
6. Use debug presets → Verify all fields update
7. Change thresholds → Verify colors update immediately
8. Reset to defaults → Verify everything resets properly
```

### 8.4 Cross-Step Data Integrity Testing

```
Test Case: Full Data Journey
1. Page 1: Enter complete performance data
2. Page 2: Verify all carried-forward values
3. Page 2: Modify some expense values
4. Review: Verify all changes reflected
5. Dashboard: Verify final calculations correct
6. Debug: Change thresholds, verify colors update
7. Debug: Apply preset, verify all fields change
8. Back to inputs: Verify preset values applied
9. Modify inputs: Verify calculations update everywhere
10. Refresh page: Verify persistence works
```

## 9. 📊 Testing Tools & Automation

### 9.1 Recommended Testing Framework

```javascript
// Future implementation with Jest + React Testing Library
describe('Complete UI Testing Suite', () => {
  describe('Button Functionality', () => {
    test('wizard navigation buttons', () => {
      // Test all Next/Back/Cancel buttons
    });

    test('debug panel buttons', () => {
      // Test all debug panel interactions
    });

    test('preset buttons', () => {
      // Test Good/Better/Best preset application
    });
  });

  describe('Field Validation', () => {
    test('all numeric inputs accept valid values', () => {
      // Test every numeric field
    });

    test('all dropdowns function correctly', () => {
      // Test every dropdown
    });

    test('dual-entry synchronization', () => {
      // Test all 17 expense field pairs
    });
  });

  describe('Data Flow Regression', () => {
    test('wizard to dashboard data flow', () => {
      // Test complete data journey
    });

    test('cross-step data consistency', () => {
      // Test data changes propagate correctly
    });
  });
});
```

### 8.2 Manual Testing Tools

```
Browser Developer Tools:
- Console: Check for errors/warnings
- Network: Verify no unnecessary requests
- Performance: Monitor load times
- Application: Check localStorage data

Debug Panel Tabs:
- Storage: Verify persistence
- Calculations: Check intermediate values
- State: Confirm data accuracy
- Performance: Monitor metrics
```

## 9. 🎯 Testing Schedule

### 9.1 Pre-Commit Testing

- [ ] Build verification
- [ ] Core calculation spot-checks
- [ ] No console errors

### 9.2 Pre-Deployment Testing

- [ ] Full wizard flow (both regions)
- [ ] All dual-entry calculations
- [ ] Debug panel functionality
- [ ] Performance verification

### 9.3 Post-Deployment Testing

- [ ] Production environment verification
- [ ] Cross-browser compatibility
- [ ] Mobile device testing
- [ ] Performance monitoring

---

## 🚀 Implementation Priority

1. **High Priority**: Calculation accuracy, data flow integrity
2. **Medium Priority**: UI/UX validation, performance testing
3. **Low Priority**: Edge case handling, automated test setup

This comprehensive testing strategy ensures our dual-entry system and enhanced wizard provide accurate, reliable business planning capabilities.
