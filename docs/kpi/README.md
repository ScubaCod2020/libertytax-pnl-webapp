# KPI System - Liberty Tax P&L Webapp

## Overview

This document provides comprehensive guidance on the KPI (Key Performance Indicator) system for the Liberty Tax P&L webapp, including calculation logic, business rules, and implementation details for corporate development teams.

## 1. 🎯 KPI System Overview

### 1.1 Core KPI Pillars

The Liberty Tax P&L webapp tracks three primary KPIs:

- **Expense Ratio**: Strategic guardrail targets 60–80% of gross revenue
- **Net Income Margin**: Healthy range 20–40% of gross revenue
- **Cost per Return (CPR)**: Derived from total expenses ÷ total returns

### 1.2 Current Implementation Status

**Angular Port Status**: KPI logic is currently being ported from React to Angular. The system uses legacy thresholds while KPI Rules V2 is being implemented.

## 2. 📊 KPI Calculation Logic

### 2.1 Correct Business Logic Flow

The main calculation engine follows this flow:

```typescript
// Step 1: Calculate Gross Fees from ANF × Returns
const grossFees = inputs.avgNetFee * inputs.taxPrepReturns; // $125 × 1,600 = $200,000

// Step 2: Discounts reduce Gross Fees to get Tax Prep Income
const discounts = grossFees * (inputs.discountsPct / 100); // $200,000 × 3% = $6,000
const taxPrepIncome = grossFees - discounts; // $200,000 - $6,000 = $194,000

// Step 3: Expenses reduce Tax Prep Income to get Net Income
const netIncome = taxPrepIncome - totalExpenses;
```

### 2.2 Expense Calculation Bases

Different expense types use different calculation bases:

- **Salaries, Rent, Supplies, Misc**: % of Gross Fees
- **Royalties, Adv Royalties**: % of Tax Prep Income (after discounts)
- **Employee Deductions**: % of Salaries
- **Fixed amounts**: Dollar values

### 2.3 Calculation Example

**Input:**

- ANF: $125, Returns: 1,600, Discounts: 3%
- Salaries: 25%, Royalties: 14%
- Total Expenses: $150,000

**Correct Calculation Flow:**

```
1. Gross Fees = $125 × 1,600 = $200,000
2. Discounts = $200,000 × 3% = $6,000
3. Tax Prep Income = $200,000 - $6,000 = $194,000
4. Salaries = $200,000 × 25% = $50,000 (% of Gross Fees)
5. Royalties = $194,000 × 14% = $27,160 (% of Tax Prep Income)
6. Net Income = $194,000 - $150,000 = $44,000
7. Net Margin = $44,000 ÷ $194,000 = 22.7%
```

## 3. 🎨 KPI Color Thresholds

### 3.1 Current Bands (Legacy)

- **Expense ratio guardrail**: 60–80%
- **Net income margin**:
  - ≥25% (green)
  - 15–24% (yellow)
  - <15% (red)
- **CPR thresholds**: Fall back to region-config absolute values until Rules V2 is complete

### 3.2 Stoplight System

The KPI system uses a stoplight color coding:

- **Green**: Healthy performance within target ranges
- **Yellow**: Marginal performance requiring attention
- **Red**: Poor performance requiring immediate action

## 4. 🚀 KPI Rules V2 (Future Implementation)

### 4.1 Lifecycle Mapping

- **New stores** → Year 1 bands
- **Existing stores** → Years 2+ bands
- Configuration: `config/kpi-rules-v2.defaults.yml`

### 4.2 Planned Expense Evaluators

- **Rent**: US hard cap $1,500/mo; CA ≤18% of revenue with owner-occupied suppressor
- **Payroll**: 35–45%
- **Marketing**: 8–12%
- **Tech**: 2–5%
- **Misc**: Flag red when >5% once evaluator is wired

### 4.3 Feature Flag

- **Feature flag**: `features.kpiRulesV2` (intended for dev-only toggle)

### 4.4 Implementation Gaps

**Missing Data Collection:**

- Rent guard inputs (local average rent)
- Payroll benchmark
- Store age/years-in-operation

**Service Stubs:**

- KPI Rules V2 service/adapter stubs exist at `core/services/kpi`
- Once config ingestion is wired, update bands to reflect lifecycle mappings and per-expense limits

## 5. 🔧 Implementation Details

### 5.1 Angular Port Status

**Current State:**

- KPI Rules V2 service/adapter stubs exist (`core/services/kpi`)
- Legacy thresholds in use while Rules V2 is staged
- CPR thresholds fall back to region-config absolute values

**Next Steps:**

1. Wire config ingestion for Rules V2
2. Update bands to reflect lifecycle mappings
3. Implement per-expense limits
4. Add missing data collection fields

### 5.2 Data Flow Requirements

**Critical Data Flow:**

- **expectedGrowthPct** must be persisted from wizard to AppState
- **calculatedTotalExpenses** must be maintained across navigation
- **Regional data** (TaxRush) must be properly gated by region

### 5.3 Wizard Integration

**Wizard Step 1 Logic:**

- Should match main engine calculations
- Use Tax Prep Income (after discounts) as base for expense calculations
- Net Income = Tax Prep Income - Total Expenses

**Required Fixes:**

1. Fix wizard calculation bases to match main engine logic
2. Update wizard Step 1 net income to use Tax Prep Income
3. Verify expense field calculation bases match their definitions
4. Test wizard → dashboard data flow for consistency

## 6. 🧪 Testing & Validation

### 6.1 Calculation Verification

**Test Scenarios:**

- Verify Gross Fees calculation (ANF × Returns)
- Verify discount application (Gross Fees × discount %)
- Verify Tax Prep Income (Gross Fees - discounts)
- Verify expense calculations by type and base
- Verify Net Income calculation (Tax Prep Income - expenses)
- Verify Net Margin calculation (Net Income ÷ Tax Prep Income)

### 6.2 Data Flow Testing

**Critical Tests:**

- Wizard to dashboard data consistency
- Regional differences (US vs CA)
- Store type differences (new vs existing)
- Edge cases (0% discounts, 100% expenses, etc.)

### 6.3 KPI Threshold Testing

**Test Cases:**

- Green threshold scenarios
- Yellow threshold scenarios
- Red threshold scenarios
- Threshold boundary conditions
- Regional threshold differences

## 7. 🎯 Business Rules

### 7.1 Expense Ratio Rules

- **Target Range**: 60–80% of gross revenue
- **Strategic Guardrail**: Prevents over-spending
- **Calculation**: Total Expenses ÷ Gross Fees × 100

### 7.2 Net Income Margin Rules

- **Healthy Range**: 20–40% of gross revenue
- **Green Threshold**: ≥25%
- **Yellow Threshold**: 15–24%
- **Red Threshold**: <15%
- **Calculation**: Net Income ÷ Tax Prep Income × 100

### 7.3 Cost per Return Rules

- **Calculation**: Total Expenses ÷ Total Returns
- **Regional Variations**: Different thresholds for US vs CA
- **Store Type Variations**: Different thresholds for new vs existing stores

## 8. 🔄 Regional Differences

### 8.1 US vs Canada KPI Variations

**US Region:**

- TaxRush fields hidden
- TaxRush royalties = 0
- Expense calculations exclude TaxRush income
- Standard KPI thresholds apply

**Canada Region:**

- TaxRush fields visible and functional
- TaxRush royalties calculated correctly
- Income includes TaxRush revenue
- Regional KPI thresholds may differ

### 8.2 Regional Configuration

- **Thresholds**: Stored in region-specific configuration
- **Calculations**: Same logic, different threshold values
- **Display**: Regional messaging and guidance

## 9. 🚨 Common Issues & Solutions

### 9.1 Calculation Inconsistencies

**Problem**: Wizard calculations don't match dashboard calculations
**Solution**: Ensure wizard uses same calculation bases as main engine

**Problem**: Discounts not properly applied
**Solution**: Verify discount calculation in wizard matches main engine

### 9.2 Data Flow Issues

**Problem**: KPI values lost on page reload
**Solution**: Ensure all KPI data is properly persisted to localStorage

**Problem**: Regional differences not reflected
**Solution**: Verify regional gating logic in KPI calculations

### 9.3 Threshold Issues

**Problem**: KPI colors not updating with threshold changes
**Solution**: Ensure threshold changes trigger KPI recalculation

## 10. 📈 Future Enhancements

### 10.1 KPI Rules V2 Implementation

- **Lifecycle-based thresholds**: Different rules for new vs existing stores
- **Per-expense limits**: Individual expense category thresholds
- **Dynamic thresholds**: Thresholds that adjust based on store performance
- **Advanced analytics**: Trend analysis and forecasting

### 10.2 Enhanced Data Collection

- **Local market data**: Average rent, payroll benchmarks
- **Store lifecycle data**: Years in operation, growth stage
- **Performance history**: Historical KPI trends
- **Benchmarking**: Industry and regional comparisons

### 10.3 Advanced Features

- **KPI forecasting**: Project future KPI values
- **Scenario modeling**: What-if analysis for different inputs
- **Alert system**: Notifications when KPIs fall outside target ranges
- **Reporting**: Detailed KPI reports and analytics

---

This comprehensive KPI system ensures accurate financial calculations and provides clear performance indicators for Liberty Tax franchisees to optimize their business operations.
