# Liberty Tax P&L App - Specification Analysis & Architecture Mapping

## Executive Summary

This document analyzes the original Liberty Tax P&L app specification against our current implementation, identifying alignment areas, gaps, and architectural opportunities. **Bottom line: Our modular component architecture is well-positioned to implement the full spec, but we need systematic additions in several key areas.**

---

## ✅ What We've Built Well (Strong Foundation)

### 1. **Modular Component Architecture**

- ✅ `FormField`, `FormSection`, `WizardPage` components align perfectly with validation needs
- ✅ Consistent styling and layout foundation
- ✅ Regional gating (US vs CA) and TaxRush conditional logic
- ✅ Basic wizard flow with multi-step data collection

### 2. **Data Structure Foundation**

- ✅ Region and StoreType handling
- ✅ TaxRush boolean gating for Canada
- ✅ Basic calculation engine structure

---

## 🔧 Major Implementation Gaps

### 1. **Core KPI Dashboard** ✅ **Well Implemented**

**Spec Requirements:**

- Net Income (NI) ✅ Implemented with proper calculations
- Net Margin % (NIM = NI / Net Tax Prep Income × 100) ✅ Implemented
- Cost per Return (CPR = Total Expenses / Total Returns) ✅ Implemented
- Stoplight indicators (Red/Yellow/Green) ✅ KPIStoplight component with proper logic
- Mini traffic light visuals with only active lens lit ✅ Exactly per spec

**Current State:** ✅ **Excellent implementation** - matches spec requirements closely
**Enhancement Needed:** Configurable thresholds (currently hardcoded)

### 2. **Pro-Tips Engine** ⚠️ **Good Foundation, Needs Enhancement**

**Spec Requirements:**

- Rule-based tip system with severity levels ✅ Basic implementation exists
- 9+ predefined rules (negative NI, low margin, high CPR, etc.) ⚠️ 5 rules implemented, could add more
- One-click "Try this" actions to test scenarios ❌ Missing interactive actions
- Contextual advice based on current performance ✅ Works well

**Current State:** ⚠️ **Solid foundation** - contextual tips based on KPI status work well
**Enhancement Needed:** More sophisticated rule engine, one-click scenario testing

### 3. **Practice Module** (Medium Priority)

**Spec Requirements:**

- 5 training scenarios (+10% returns, +$5 ANF, etc.)
- Progress tracking with traffic light segments
- User response notes and completion status
- Mini progress bar on dashboard

**Current State:** ❌ **Missing entirely**
**Impact:** Training/onboarding value for users

### 4. **State Management** (High Priority)

**Spec Requirements:**

- Single centralized store (Zustand recommended)
- All derivations in selectors, not component state
- Avoid stale state between wizard and dashboard

**Current State:** ⚠️ **Using prop drilling**
**Impact:** Will become unwieldy as we add KPIs, tips, practice module

---

## 🔄 Data Model Alignment Needed

### Current vs Spec Model Structure

**Our Current Approach:**

```typescript
// Scattered across components, no central model
const answers = { lastYearGrossFees, avgNetFee, expectedGrowthPct, ... }
```

**Spec Model (Target):**

```typescript
type Model = {
  region: Region; // ✅ We have this
  storeType: StoreType; // ✅ We have this
  returns: number; // ⚠️ We call it taxPrepReturns
  taxRushEnabled: boolean; // ✅ We call it handlesTaxRush
  taxRushReturns?: number; // ✅ We have this
  anf: number; // ⚠️ We call it avgNetFee
  discountsPct: number; // ⚠️ We have amount, need percentage

  // Expense percentages - we need to add these
  salariesPct: number; // ❌ Missing
  rentPct: number; // ❌ Missing
  suppliesPct: number; // ❌ Missing
  tpRoyaltyPct: number; // ❌ Missing
  advRoyaltyPct: number; // ❌ Missing
  miscPct: number; // ❌ Missing

  thresholds: Thresholds; // ❌ Missing entirely
};
```

---

## 🎯 Strategic Implementation Phases

### **Phase 1: Foundation Alignment** (Current Sprint)

1. **Data Model Standardization**
   - Create central TypeScript model matching spec
   - Implement Zustand store for state management
   - Standardize field names (anf, returns, etc.)

2. **Calculation Engine Alignment**
   - Implement `derive()` function from spec
   - Move all calculations to centralized selectors
   - Add missing expense percentage calculations

### **Phase 2: Core Dashboard** (Next Sprint)

1. **KPI Cards with Stoplights**
   - Net Income, Net Margin %, Cost per Return
   - Configurable threshold system
   - Traffic light indicators with proper styling

2. **Validation System Enhancement**
   - Add bounds checking to FormField components
   - Implement warning messages for out-of-range values
   - One-click "snap to recommended" actions

### **Phase 3: Intelligence Features** (Future Sprint)

1. **Pro-Tips Engine**
   - Rule-based tip system
   - Contextual advice with severity levels
   - One-click scenario testing

2. **Practice Module**
   - Training scenarios with progress tracking
   - Interactive learning component
   - Dashboard integration

### **Phase 4: Visualization & Export** (Future Sprint)

1. **Charts and Gauges**
   - Expense mix visualization
   - Net margin gauge
   - Liberty Tax styling integration

2. **Export Functionality**
   - PDF executive summary
   - Excel workbook with multiple sheets
   - Branded formatting

---

## 🏗️ How Our Modular Architecture Helps

### **FormField Components → Enhanced with Validation**

```typescript
<FormField
  validation={{
    min: 0, max: 5, warnAbove: 3,
    message: "Keep discounts ≤3% to protect margin"
  }}
  onValidationWarning={showProTip}
>
  <PercentageInput ... />
</FormField>
```

### **FormSection Components → Ready for KPI Integration**

```typescript
<FormSection title="Performance Metrics" icon="📊">
  <KPICard metric="netIncome" value={derived.netIncome} />
  <KPICard metric="netMargin" value={derived.nim} />
  <KPICard metric="costPerReturn" value={derived.cpr} />
</FormSection>
```

### **WizardPage → Dashboard Flow**

- Same components, different data sources
- Centralized state makes wizard→dashboard seamless
- Modular design supports multiple views of same data

---

## 🔍 Validation Rules to Implement

**Recommended Bounds (from spec):**

- Discounts: 0–5% (warn >3%)
- Salaries: 15–35% (warn >30%)
- Rent: 10–25% (warn >20%)
- Supplies: 1–6%
- Misc: 0–3%

**Implementation in FormField:**

- Amber helper text when out-of-range
- One-click "Snap to recommended" button
- Block only egregious values (negative, impossible totals)

---

## 🎨 UI/UX Enhancements Needed

### **Liberty Tax Styling** (CSS tokens from spec)

```css
:root {
  --liberty-blue: #002d72;
  --liberty-red: #ea0029;
  --liberty-green: #006341;
  --kpi-green: #00a651;
  --kpi-yellow: #ffc107;
  --kpi-red: #d0021b;
}
```

### **Stoplight Indicators**

- Vertical mini traffic light SVGs
- Only active lens lit, others grey
- Card borders match active color

---

## ✅ Immediate Next Steps

1. **Start with Data Model** - Create central Model type and Zustand store
2. **Implement derive() function** - Centralize all calculations
3. **Add KPI dashboard foundation** - Basic cards without full styling
4. **Enhance FormField validation** - Add bounds checking system
5. **Convert remaining wizard sections** - Complete the modular architecture

**This analysis positions us perfectly for systematic implementation of the full specification while leveraging our solid modular foundation.**
