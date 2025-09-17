# 🚨 CRITICAL CALCULATION BUG REPORT

## **MAJOR DISCREPANCY FOUND**

The wizard and main calculation engine use **completely different formulas** for the same calculations, causing incorrect results.

## 🔴 **BUG #1: Gross Fees Calculation Mismatch**

### **Main Engine (calcs.ts line 79):**
```typescript
const grossFees = inputs.avgNetFee * inputs.taxPrepReturns
```
**This is WRONG** - This calculates Tax Prep Income, not Gross Fees!

### **Wizard (WizardInputs.tsx line 44):**
```typescript
return answers.avgNetFee * answers.taxPrepReturns / (1 - (answers.discountsPct || 3) / 100)
```
**This is CORRECT** - This properly calculates Gross Fees by backing out discounts.

## 🔴 **BUG #2: Tax Prep Income Calculation Mismatch**

### **Main Engine (calcs.ts line 81):**
```typescript
const taxPrepIncome = grossFees - discounts
```
**This is WRONG** because `grossFees` is actually Tax Prep Income!

### **Wizard (WizardInputs.tsx line 46):**
```typescript
return answers.avgNetFee * answers.taxPrepReturns
```
**This is CORRECT** - Average Net Fee × Returns = Tax Prep Income.

## 🔴 **BUG #3: Percentage Base Calculations Wrong**

### **Main Engine:**
- Salaries: `grossFees * (salariesPct/100)` ← Uses wrong base
- Rent: `grossFees * (rentPct/100)` ← Uses wrong base  
- Supplies: `grossFees * (suppliesPct/100)` ← Uses wrong base

### **Wizard:**
- Uses correct calculation bases per expense type
- Properly distinguishes between gross fees and tax prep income

## 📊 **IMPACT ANALYSIS**

### **Example Scenario:**
- Average Net Fee: $125
- Tax Prep Returns: 1,600  
- Discounts: 3%

### **CORRECT Calculations (Wizard):**
```
Tax Prep Income = $125 × 1,600 = $200,000
Gross Fees = $200,000 ÷ (1 - 0.03) = $206,186
Discounts = $206,186 × 0.03 = $6,186
```

### **WRONG Calculations (Main Engine):**
```
grossFees = $125 × 1,600 = $200,000  ← This is actually Tax Prep Income!
discounts = $200,000 × 0.03 = $6,000  ← Wrong base amount
taxPrepIncome = $200,000 - $6,000 = $194,000  ← Completely wrong!
```

### **Financial Impact:**
- **Tax Prep Income**: Off by $6,000 (3% error)
- **All percentage-based expenses**: Calculated on wrong base
- **Net Income**: Significantly incorrect
- **KPIs**: All wrong (Cost per Return, Net Margin, etc.)

## 🛠️ **REQUIRED FIXES**

### **Fix #1: Correct Main Calculation Engine**
```typescript
// src/lib/calcs.ts - CORRECTED VERSION
export function calc(inputs: Inputs): Results {
  const taxRush = inputs.region === 'CA' ? inputs.taxRushReturns : 0
  
  // CORRECT: Tax Prep Income first
  const taxPrepIncome = inputs.avgNetFee * inputs.taxPrepReturns
  
  // CORRECT: Gross Fees = Tax Prep Income / (1 - discount rate)
  const grossFees = taxPrepIncome / (1 - inputs.discountsPct/100)
  
  // CORRECT: Discounts = Gross Fees - Tax Prep Income
  const discounts = grossFees - taxPrepIncome
  
  // CORRECT: Use appropriate bases for each expense type
  const salaries = grossFees * (inputs.salariesPct/100)  // % of gross fees
  const empDeductions = salaries * (inputs.empDeductionsPct/100)  // % of salaries
  const rent = grossFees * (inputs.rentPct/100)  // % of gross fees
  
  // Fixed amounts remain the same
  const telephone = inputs.telephoneAmt
  const utilities = inputs.utilitiesAmt
  // ... etc
  
  // CORRECT: Royalties based on Tax Prep Income
  const royalties = taxPrepIncome * (inputs.royaltiesPct/100)
  const advRoyalties = taxPrepIncome * (inputs.advRoyaltiesPct/100)
  const taxRushRoyalties = inputs.region === 'CA' ? 
    taxPrepIncome * (inputs.taxRushRoyaltiesPct/100) : 0
  
  // Rest of calculations...
}
```

### **Fix #2: Verify Expense Calculation Bases**
According to `src/types/expenses.ts`, each expense has a specific calculation base:
- `percentage_gross`: Should use Gross Fees
- `percentage_tp_income`: Should use Tax Prep Income  
- `percentage_salaries`: Should use Salaries amount
- `fixed_amount`: Dollar amount (no percentage)

### **Fix #3: Update Tests**
All existing tests are likely passing with wrong expected values. Need to:
1. Recalculate all test expectations with correct formulas
2. Add specific tests for Gross Fees vs Tax Prep Income distinction
3. Verify wizard calculations match corrected main engine

## 🧪 **VERIFICATION STEPS**

### **Test Case 1: Basic Calculation**
```
Input:
- ANF: $125, Returns: 1,600, Discounts: 3%
- Salaries: 25%, Royalties: 14%

Expected Results:
- Tax Prep Income: $200,000
- Gross Fees: $206,186  
- Discounts: $6,186
- Salaries: $51,547 (25% of $206,186)
- Royalties: $28,000 (14% of $200,000)
```

### **Test Case 2: Zero Discounts**
```
Input:
- ANF: $100, Returns: 1,000, Discounts: 0%

Expected Results:
- Tax Prep Income: $100,000
- Gross Fees: $100,000 (same when no discounts)
- Discounts: $0
```

### **Test Case 3: High Discounts**
```
Input:
- ANF: $100, Returns: 1,000, Discounts: 20%

Expected Results:
- Tax Prep Income: $100,000
- Gross Fees: $125,000
- Discounts: $25,000
```

## ⚠️ **DEPLOYMENT IMPACT**

This is a **CRITICAL BUG** that affects:
- ❌ All financial calculations
- ❌ All KPI indicators  
- ❌ All expense projections
- ❌ Business decision accuracy

**IMMEDIATE ACTION REQUIRED:**
1. Fix calculation engine immediately
2. Verify all test cases
3. Re-validate all existing data
4. Notify users of calculation corrections

## 📋 **NEXT STEPS**

1. **Immediate**: Fix `src/lib/calcs.ts` with correct formulas
2. **Verify**: Update and run all calculation tests  
3. **Validate**: Compare wizard and main engine results
4. **Document**: Update calculation documentation
5. **Communicate**: Inform stakeholders of bug and fix

---

**Priority**: 🚨 CRITICAL - DEPLOYMENT BLOCKER  
**Impact**: All financial calculations incorrect  
**Timeline**: Fix immediately before any production use
