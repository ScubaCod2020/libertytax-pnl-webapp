/**
 * Wizard Calculation Validation Test
 * Validates that wizard calculations now match main engine
 * Can be run in browser console or Node.js
 */

// Simulate wizard calculation logic (CORRECTED VERSION)
function wizardCalculateBase(answers, calculationBase) {
  // Calculate base amounts using same logic as main engine (calcs.ts)
  const grossFees = answers.avgNetFee && answers.taxPrepReturns ? answers.avgNetFee * answers.taxPrepReturns : 0;
  const discounts = grossFees * ((answers.discountsPct || 3) / 100);
  const taxPrepIncome = grossFees - discounts;
  
  switch (calculationBase) {
    case 'percentage_gross':
      // Use projected revenue if available, otherwise calculate gross fees
      return answers.expectedRevenue ? answers.expectedRevenue / (1 - (answers.discountsPct || 3) / 100) : grossFees;
    case 'percentage_tp_income':
      // Use projected revenue if available, otherwise calculate tax prep income (after discounts)
      return answers.expectedRevenue || taxPrepIncome;
    case 'percentage_salaries':
      const baseGrossFees = answers.expectedRevenue ? answers.expectedRevenue / (1 - (answers.discountsPct || 3) / 100) : grossFees;
      return baseGrossFees * ((answers.salariesPct || 25) / 100);
    case 'fixed_amount':
      return 1; // For fixed amounts, percentage doesn't apply
    default:
      return 0;
  }
}

// Main engine calculation (from calcs.ts)
function mainEngineCalc(inputs) {
  const taxRush = inputs.region === 'CA' ? inputs.taxRushReturns : 0;
  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns;
  const discounts = grossFees * (inputs.discountsPct / 100);
  const taxPrepIncome = grossFees - discounts;

  const salaries = grossFees * (inputs.salariesPct / 100);
  const royalties = taxPrepIncome * (inputs.royaltiesPct / 100);
  const taxRushRoyalties = inputs.region === 'CA' ? taxPrepIncome * (inputs.taxRushRoyaltiesPct / 100) : 0;
  
  return {
    grossFees,
    discounts, 
    taxPrepIncome,
    salaries,
    royalties,
    taxRushRoyalties
  };
}

// Test cases
const testCases = [
  {
    name: "US Standard Office",
    region: 'US',
    avgNetFee: 125,
    taxPrepReturns: 1600,
    taxRushReturns: 0,
    discountsPct: 3,
    salariesPct: 25,
    royaltiesPct: 14,
    taxRushRoyaltiesPct: 0
  },
  {
    name: "CA Office with TaxRush",
    region: 'CA', 
    avgNetFee: 130,
    taxPrepReturns: 1400,
    taxRushReturns: 300,
    discountsPct: 4,
    salariesPct: 28,
    royaltiesPct: 14,
    taxRushRoyaltiesPct: 6
  },
  {
    name: "US High Volume",
    region: 'US',
    avgNetFee: 110,
    taxPrepReturns: 2500,
    taxRushReturns: 0,
    discountsPct: 2,
    salariesPct: 22,
    royaltiesPct: 14,
    taxRushRoyaltiesPct: 0
  },
  {
    name: "CA Premium Office",
    region: 'CA',
    avgNetFee: 180,
    taxPrepReturns: 2000,
    taxRushReturns: 500,
    discountsPct: 1.5,
    salariesPct: 20,
    royaltiesPct: 14,
    taxRushRoyaltiesPct: 4
  }
];

console.log('🧪 WIZARD CALCULATION VALIDATION TEST');
console.log('=====================================\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(40));
  
  // Main engine results
  const mainResult = mainEngineCalc(testCase);
  
  // Wizard calculation bases
  const wizardGrossBase = wizardCalculateBase(testCase, 'percentage_gross');
  const wizardTpIncomeBase = wizardCalculateBase(testCase, 'percentage_tp_income');
  const wizardSalariesBase = wizardCalculateBase(testCase, 'percentage_salaries');
  
  // Calculate wizard values
  const wizardSalaries = wizardGrossBase * (testCase.salariesPct / 100);
  const wizardRoyalties = wizardTpIncomeBase * (testCase.royaltiesPct / 100);
  const wizardTaxRushRoyalties = testCase.region === 'CA' ? 
    wizardTpIncomeBase * (testCase.taxRushRoyaltiesPct / 100) : 0;
  
  console.log(`Input: ANF $${testCase.avgNetFee}, Returns ${testCase.taxPrepReturns}, Discounts ${testCase.discountsPct}%`);
  if (testCase.region === 'CA') {
    console.log(`       TaxRush Returns: ${testCase.taxRushReturns}`);
  }
  
  console.log('\nMain Engine Results:');
  console.log(`  Gross Fees: $${mainResult.grossFees.toLocaleString()}`);
  console.log(`  Discounts: $${mainResult.discounts.toLocaleString()}`);
  console.log(`  Tax Prep Income: $${mainResult.taxPrepIncome.toLocaleString()}`);
  console.log(`  Salaries (${testCase.salariesPct}% of Gross): $${mainResult.salaries.toLocaleString()}`);
  console.log(`  Royalties (${testCase.royaltiesPct}% of TP Income): $${mainResult.royalties.toLocaleString()}`);
  if (testCase.region === 'CA') {
    console.log(`  TaxRush Royalties (${testCase.taxRushRoyaltiesPct}% of TP Income): $${mainResult.taxRushRoyalties.toLocaleString()}`);
  }
  
  console.log('\nWizard Calculation Bases:');
  console.log(`  Gross Fees Base: $${wizardGrossBase.toLocaleString()}`);
  console.log(`  Tax Prep Income Base: $${wizardTpIncomeBase.toLocaleString()}`);
  console.log(`  Salaries Base: $${wizardSalariesBase.toLocaleString()}`);
  
  console.log('\nWizard Calculated Values:');
  console.log(`  Salaries: $${wizardSalaries.toLocaleString()}`);
  console.log(`  Royalties: $${wizardRoyalties.toLocaleString()}`);
  if (testCase.region === 'CA') {
    console.log(`  TaxRush Royalties: $${wizardTaxRushRoyalties.toLocaleString()}`);
  }
  
  // Validation
  const grossMatch = Math.abs(mainResult.grossFees - wizardGrossBase) < 0.01;
  const tpIncomeMatch = Math.abs(mainResult.taxPrepIncome - wizardTpIncomeBase) < 0.01;
  const salariesMatch = Math.abs(mainResult.salaries - wizardSalaries) < 0.01;
  const royaltiesMatch = Math.abs(mainResult.royalties - wizardRoyalties) < 0.01;
  const taxRushMatch = Math.abs(mainResult.taxRushRoyalties - wizardTaxRushRoyalties) < 0.01;
  
  console.log('\nValidation:');
  console.log(`  ✅ Gross Fees Match: ${grossMatch ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Tax Prep Income Match: ${tpIncomeMatch ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Salaries Match: ${salariesMatch ? 'PASS' : 'FAIL'}`);
  console.log(`  ✅ Royalties Match: ${royaltiesMatch ? 'PASS' : 'FAIL'}`);
  if (testCase.region === 'CA') {
    console.log(`  ✅ TaxRush Royalties Match: ${taxRushMatch ? 'PASS' : 'FAIL'}`);
  }
  
  const allMatch = grossMatch && tpIncomeMatch && salariesMatch && royaltiesMatch && taxRushMatch;
  console.log(`\n🎯 Overall Result: ${allMatch ? '✅ PASS - Wizard matches Main Engine' : '❌ FAIL - Discrepancies found'}`);
  
  console.log('\n' + '='.repeat(60) + '\n');
});

console.log('📊 SUMMARY');
console.log('This test validates that the wizard calculation bases now match the main engine.');
console.log('All tests should show PASS for the wizard to work correctly.');
console.log('\n🔍 To run this test:');
console.log('1. Copy this code into browser console on the app page');
console.log('2. Or run with Node.js: node wizard-calculation-validation.js');
console.log('3. Or integrate into existing test suite');
