# 📋 MANUAL CALCULATION TEST CHECKLIST

## 🎯 **PURPOSE**
Validate that wizard calculations now match the main dashboard after our fixes.

## 🧪 **TEST SCENARIOS**

### **Test 1: US Standard Office**
**Setup:**
- Region: US
- ANF: $125
- Tax Prep Returns: 1,600
- Discounts: 3%
- Salaries: 25%
- Royalties: 14%

**Expected Results:**
- Gross Fees: $200,000
- Discounts: $6,000
- Tax Prep Income: $194,000
- Salaries: $50,000 (25% of $200,000)
- Royalties: $27,160 (14% of $194,000)

**Test Steps:**
1. ✅ Complete wizard with above values
2. ✅ Go to main dashboard
3. ✅ Verify all numbers match exactly
4. ✅ Check that TaxRush fields are hidden (US region)

---

### **Test 2: CA Office with TaxRush**
**Setup:**
- Region: CA
- ANF: $130
- Tax Prep Returns: 1,400
- TaxRush Returns: 300
- Discounts: 4%
- Salaries: 28%
- Royalties: 14%
- TaxRush Royalties: 6%

**Expected Results:**
- Gross Fees: $182,000
- Discounts: $7,280
- Tax Prep Income: $174,720
- Salaries: $50,960 (28% of $182,000)
- Royalties: $24,461 (14% of $174,720)
- TaxRush Royalties: $10,483 (6% of $174,720)
- Total Returns: 1,700 (1,400 + 300)

**Test Steps:**
1. ✅ Complete wizard with above values
2. ✅ Go to main dashboard
3. ✅ Verify all numbers match exactly
4. ✅ Check that TaxRush fields are visible (CA region)
5. ✅ Verify TaxRush returns included in total return count

---

### **Test 3: Zero Discounts Edge Case**
**Setup:**
- Region: US
- ANF: $150
- Tax Prep Returns: 1,000
- Discounts: 0%
- Salaries: 30%

**Expected Results:**
- Gross Fees: $150,000
- Discounts: $0
- Tax Prep Income: $150,000 (same as gross when no discounts)
- Salaries: $45,000 (30% of $150,000)

**Test Steps:**
1. ✅ Complete wizard with 0% discounts
2. ✅ Verify Gross Fees = Tax Prep Income
3. ✅ Verify calculations still work correctly

---

### **Test 4: High Discounts Edge Case**
**Setup:**
- Region: CA
- ANF: $100
- Tax Prep Returns: 1,000
- Discounts: 15%
- Salaries: 25%

**Expected Results:**
- Gross Fees: $100,000
- Discounts: $15,000
- Tax Prep Income: $85,000
- Salaries: $25,000 (25% of $100,000, not $85,000)

**Test Steps:**
1. ✅ Complete wizard with high discount percentage
2. ✅ Verify salaries calculated on Gross Fees, not Tax Prep Income
3. ✅ Verify royalties calculated on Tax Prep Income

---

### **Test 5: Dual-Entry Expense System**
**Setup:**
- Any region
- ANF: $125, Returns: 1,600, Discounts: 3%
- Test each expense field

**Expected Behavior:**
- Gross Fees: $200,000
- Tax Prep Income: $194,000

**Test Steps:**
1. ✅ Enter 25% in Salaries field
   - Should show $50,000 in dollar field (25% of $200,000)
2. ✅ Enter $40,000 in Salaries dollar field  
   - Should show 20% in percentage field ($40,000 ÷ $200,000)
3. ✅ Enter 14% in Royalties field
   - Should show $27,160 in dollar field (14% of $194,000)
4. ✅ Enter $19,400 in Royalties dollar field
   - Should show 10% in percentage field ($19,400 ÷ $194,000)

---

## 🔍 **VALIDATION CHECKLIST**

### **Wizard Step 1 (Welcome)**
- [ ] Net Income calculation shows: Tax Prep Income - Total Expenses
- [ ] Growth percentages apply correctly to all projected fields
- [ ] Regional differences clear (TaxRush for CA only)

### **Wizard Step 2 (Inputs)**
- [ ] Revenue flow display shows: Gross Fees → Discounts → Tax Prep Income
- [ ] Dual-entry fields sync correctly (% ↔ $)
- [ ] Calculation bases shown correctly for each expense type
- [ ] TaxRush fields visible only for CA region

### **Wizard Step 3 (Review)**
- [ ] All values match what was entered
- [ ] Calculations preview matches expected results
- [ ] Regional-specific fields displayed correctly

### **Main Dashboard**
- [ ] All values from wizard transfer correctly
- [ ] KPI calculations match wizard preview
- [ ] Regional behavior consistent (US vs CA)
- [ ] Debug panel shows same calculation values

---

## 🚨 **CRITICAL VALIDATION POINTS**

### **✅ MUST PASS:**
1. **Gross Fees = ANF × Tax Prep Returns** (always)
2. **Tax Prep Income = Gross Fees - Discounts** (always)
3. **Salaries = % of Gross Fees** (not Tax Prep Income)
4. **Royalties = % of Tax Prep Income** (not Gross Fees)
5. **TaxRush = 0 for US, included for CA**
6. **Wizard values = Dashboard values** (exactly)

### **❌ FAILURE INDICATORS:**
- Wizard shows different numbers than dashboard
- Salaries calculated on Tax Prep Income instead of Gross Fees
- Royalties calculated on Gross Fees instead of Tax Prep Income
- TaxRush fields visible in US region
- Dual-entry fields don't sync properly
- Percentage/dollar conversions incorrect

---

## 📊 **QUICK REFERENCE CALCULATIONS**

### **Standard Test Case (ANF: $125, Returns: 1,600, Discounts: 3%)**
```
Gross Fees = $125 × 1,600 = $200,000
Discounts = $200,000 × 3% = $6,000
Tax Prep Income = $200,000 - $6,000 = $194,000

Salaries (25%) = $200,000 × 25% = $50,000
Royalties (14%) = $194,000 × 14% = $27,160
```

### **CA with TaxRush (ANF: $130, Returns: 1,400, TaxRush: 300, Discounts: 4%)**
```
Gross Fees = $130 × 1,400 = $182,000
Discounts = $182,000 × 4% = $7,280
Tax Prep Income = $182,000 - $7,280 = $174,720
Total Returns = 1,400 + 300 = 1,700

TaxRush Royalties (6%) = $174,720 × 6% = $10,483
```

---

## ✅ **SIGN-OFF**

**Test Completed By:** ________________  
**Date:** ________________  
**All Tests Passed:** ☐ Yes ☐ No  
**Issues Found:** ________________  
**Ready for Production:** ☐ Yes ☐ No  

**Notes:**
_________________________________________________
_________________________________________________
