# 🔧 CORRECTED CALCULATION ANALYSIS

## **YOU'RE RIGHT - I HAD IT BACKWARDS!**

After re-reading the code and your explanation, I now understand the correct flow:

## ✅ **CORRECT BUSINESS LOGIC**

### **Main Engine (calcs.ts) is CORRECT:**
```typescript
// Step 1: Calculate Gross Fees from ANF × Returns
const grossFees = inputs.avgNetFee * inputs.taxPrepReturns  // $125 × 1,600 = $200,000

// Step 2: Discounts reduce Gross Fees to get Tax Prep Income  
const discounts = grossFees * (inputs.discountsPct/100)     // $200,000 × 3% = $6,000
const taxPrepIncome = grossFees - discounts                 // $200,000 - $6,000 = $194,000

// Step 3: Expenses reduce Tax Prep Income to get Net Income
const netIncome = taxPrepIncome - totalExpenses
```

### **Wizard Step 1 Logic (SHOULD match main engine):**
```typescript
// Wizard shows: "Projected Net Income: expectedRevenue - projectedExpenses"
// This means expectedRevenue should be TAX PREP INCOME (after discounts)
// NOT Gross Fees
```

## 🚨 **THE ACTUAL BUG: Wizard Calculation Base is Wrong**

### **Problem in WizardInputs.tsx line 44:**
```typescript
// WRONG: Using this as calculation base for expenses
return answers.avgNetFee * answers.taxPrepReturns / (1 - (answers.discountsPct || 3) / 100)
```
This calculates **Gross Fees**, but expenses should be based on different amounts depending on the expense type.

### **Problem in WizardInputs.tsx line 46:**
```typescript  
// WRONG: This should account for discounts
return answers.avgNetFee * answers.taxPrepReturns
```
This gives **Gross Fees** but calls it Tax Prep Income.

## 🛠️ **REQUIRED FIXES**

### **Fix #1: Wizard Calculation Bases**
The wizard needs to use the same logic as the main engine:

```typescript
// CORRECTED WizardInputs.tsx
const getCalculationBase = () => {
  // First calculate the correct base amounts
  const grossFees = answers.avgNetFee * answers.taxPrepReturns
  const discounts = grossFees * ((answers.discountsPct || 3) / 100)  
  const taxPrepIncome = grossFees - discounts
  
  switch (field.calculationBase) {
    case 'percentage_gross':
      return grossFees  // Use actual gross fees
    case 'percentage_tp_income':  
      return taxPrepIncome  // Use tax prep income (after discounts)
    case 'percentage_salaries':
      const salaries = grossFees * ((answers as any).salariesPct || 25) / 100
      return salaries
    case 'fixed_amount':
      return 1
    default:
      return 0
  }
}
```

### **Fix #2: Wizard Step 1 Net Income Calculation**
```typescript
// CORRECTED WizardShell.tsx line 551
// Should use Tax Prep Income (after discounts), not expectedRevenue
const grossFees = answers.avgNetFee * answers.taxPrepReturns
const discounts = grossFees * ((answers.discountsPct || 3) / 100)
const taxPrepIncome = grossFees - discounts

// Net Income = Tax Prep Income - Total Expenses  
const netIncome = taxPrepIncome - answers.projectedExpenses
```

### **Fix #3: Expense Field Descriptions**
Update the expense type definitions to match main engine:
- **Salaries, Rent, Supplies, Misc**: % of Gross Fees
- **Royalties, Adv Royalties**: % of Tax Prep Income  
- **Employee Deductions**: % of Salaries
- **Fixed amounts**: Dollar values

## 📊 **VERIFICATION EXAMPLE**

### **Input:**
- ANF: $125, Returns: 1,600, Discounts: 3%
- Salaries: 25%, Royalties: 14%
- Total Expenses: $150,000

### **CORRECT Calculation Flow:**
```
1. Gross Fees = $125 × 1,600 = $200,000
2. Discounts = $200,000 × 3% = $6,000  
3. Tax Prep Income = $200,000 - $6,000 = $194,000
4. Salaries = $200,000 × 25% = $50,000 (% of Gross Fees)
5. Royalties = $194,000 × 14% = $27,160 (% of Tax Prep Income)
6. Net Income = $194,000 - $150,000 = $44,000
7. Net Margin = $44,000 ÷ $194,000 = 22.7%
```

## 🎯 **ACTION ITEMS**

1. **Fix wizard calculation bases** to match main engine logic
2. **Update wizard Step 1 net income** to use Tax Prep Income  
3. **Verify expense field calculation bases** match their definitions
4. **Test wizard → dashboard data flow** for consistency
5. **Update any misleading field labels** in the wizard

## ✅ **CONCLUSION**

You were absolutely right:
- **Main engine calculations are CORRECT**
- **Wizard calculations need to be fixed** to match the main engine
- **The flow should be**: Gross Fees → (minus discounts) → Tax Prep Income → (minus expenses) → Net Income

Thank you for catching this! The wizard was using incorrect calculation bases and not properly accounting for the discount flow.
