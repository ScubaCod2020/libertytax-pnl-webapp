#!/usr/bin/env node

/**
 * Manual Testing Script for Liberty Tax P&L Webapp
 * Run this to verify calculation accuracy and data flow
 */

console.log('🧪 Liberty Tax P&L Testing Suite\n');

// Test data scenarios
const testScenarios = {
  conservative: {
    name: "Conservative Store",
    lastYearRevenue: 180000,
    avgNetFee: 120,
    taxPrepReturns: 1500,
    taxRushReturns: 200, // CA only
    expectedGrowth: 5,
    discountsPct: 3,
    salariesPct: 28,
    rentPct: 20,
    royaltiesPct: 14
  },
  
  aggressive: {
    name: "Aggressive Store", 
    lastYearRevenue: 300000,
    avgNetFee: 150,
    taxPrepReturns: 2000,
    taxRushReturns: 600, // CA only
    expectedGrowth: 20,
    discountsPct: 2,
    salariesPct: 22,
    rentPct: 15,
    royaltiesPct: 14
  },
  
  struggling: {
    name: "Struggling Store",
    lastYearRevenue: 120000,
    avgNetFee: 100,
    taxPrepReturns: 1200,
    taxRushReturns: 100, // CA only
    expectedGrowth: -10,
    discountsPct: 5,
    salariesPct: 35,
    rentPct: 25,
    royaltiesPct: 14
  }
};

// Calculation functions (mirror app logic)
function calculateProjectedRevenue(lastYear, growthPct) {
  return Math.round(lastYear * (1 + growthPct / 100));
}

function calculateGrossFees(avgNetFee, returns, discountsPct) {
  const taxPrepIncome = avgNetFee * returns;
  return Math.round(taxPrepIncome / (1 - discountsPct / 100));
}

function calculateNetIncome(grossFees, discountsPct, totalExpenses) {
  const discounts = grossFees * discountsPct / 100;
  return grossFees - discounts - totalExpenses;
}

function calculateNetMargin(netIncome, taxPrepIncome) {
  return netIncome / taxPrepIncome * 100;
}

function calculateCostPerReturn(totalExpenses, returns) {
  return totalExpenses / returns;
}

// Test dual-entry calculations
function testDualEntry(percentage, calculationBase, fieldName) {
  const dollarValue = Math.round(calculationBase * percentage / 100);
  const backToPercentage = Math.round((dollarValue / calculationBase * 100) * 10) / 10;
  
  console.log(`  ${fieldName}:`);
  console.log(`    ${percentage}% → $${dollarValue.toLocaleString()}`);
  console.log(`    $${dollarValue.toLocaleString()} → ${backToPercentage}%`);
  console.log(`    Sync Check: ${Math.abs(percentage - backToPercentage) < 0.1 ? '✅' : '❌'}`);
}

// Test KPI thresholds
function testKPIStatus(value, greenThreshold, yellowThreshold, isHigherBetter = false) {
  let status;
  if (isHigherBetter) {
    status = value >= greenThreshold ? 'green' : 
             value >= yellowThreshold ? 'yellow' : 'red';
  } else {
    status = value <= greenThreshold ? 'green' : 
             value <= yellowThreshold ? 'yellow' : 'red';
  }
  return status;
}

// Run tests for each scenario
Object.entries(testScenarios).forEach(([key, scenario]) => {
  console.log(`\n🏪 Testing: ${scenario.name}`);
  console.log('=' .repeat(50));
  
  // 1. Test projected revenue calculation
  const projectedRevenue = calculateProjectedRevenue(scenario.lastYearRevenue, scenario.expectedGrowth);
  console.log(`\n📊 Revenue Projections:`);
  console.log(`  Last Year: $${scenario.lastYearRevenue.toLocaleString()}`);
  console.log(`  Growth: ${scenario.expectedGrowth > 0 ? '+' : ''}${scenario.expectedGrowth}%`);
  console.log(`  Projected: $${projectedRevenue.toLocaleString()}`);
  
  // 2. Test gross fees calculation
  const grossFees = calculateGrossFees(scenario.avgNetFee, scenario.taxPrepReturns, scenario.discountsPct);
  const taxPrepIncome = scenario.avgNetFee * scenario.taxPrepReturns;
  console.log(`\n💰 Income Calculations:`);
  console.log(`  Tax Prep Income: $${taxPrepIncome.toLocaleString()}`);
  console.log(`  Gross Fees: $${grossFees.toLocaleString()}`);
  console.log(`  Discounts (${scenario.discountsPct}%): $${(grossFees * scenario.discountsPct / 100).toLocaleString()}`);
  
  // 3. Test dual-entry expense calculations
  console.log(`\n🧮 Dual-Entry Expense Tests:`);
  
  // Salaries (percentage of gross fees)
  testDualEntry(scenario.salariesPct, grossFees, 'Salaries');
  
  // Rent (percentage of gross fees) 
  testDualEntry(scenario.rentPct, grossFees, 'Rent');
  
  // Employee deductions (percentage of salaries)
  const salariesAmount = grossFees * scenario.salariesPct / 100;
  testDualEntry(10, salariesAmount, 'Employee Deductions');
  
  // 4. Calculate total expenses and KPIs
  const totalExpenses = (grossFees * scenario.salariesPct / 100) + 
                       (grossFees * scenario.rentPct / 100) + 
                       (salariesAmount * 10 / 100) + 
                       (grossFees * scenario.royaltiesPct / 100) + 
                       5000; // Other fixed expenses
  
  const netIncome = calculateNetIncome(grossFees, scenario.discountsPct, totalExpenses);
  const netMargin = calculateNetMargin(netIncome, taxPrepIncome);
  const costPerReturn = calculateCostPerReturn(totalExpenses, scenario.taxPrepReturns);
  
  console.log(`\n📈 KPI Results:`);
  console.log(`  Total Expenses: $${Math.round(totalExpenses).toLocaleString()}`);
  console.log(`  Net Income: $${Math.round(netIncome).toLocaleString()}`);
  console.log(`  Net Margin: ${netMargin.toFixed(1)}%`);
  console.log(`  Cost/Return: $${costPerReturn.toFixed(2)}`);
  
  // 5. Test KPI status with default thresholds
  const cprStatus = testKPIStatus(costPerReturn, 25, 35, false);
  const nimStatus = testKPIStatus(netMargin, 20, 10, true);
  const niStatus = netIncome <= -5000 ? 'red' : netIncome < 0 ? 'yellow' : 'green';
  
  console.log(`\n🚦 KPI Status (Default Thresholds):`);
  console.log(`  Cost/Return: ${cprStatus.toUpperCase()} (≤$25 green, ≤$35 yellow)`);
  console.log(`  Net Margin: ${nimStatus.toUpperCase()} (≥20% green, ≥10% yellow)`);
  console.log(`  Net Income: ${niStatus.toUpperCase()} (>$0 green, >-$5k yellow)`);
});

// Edge case testing
console.log(`\n\n🔬 Edge Case Testing`);
console.log('=' .repeat(50));

const edgeCases = [
  { name: "Zero Percentage", percentage: 0, base: 100000 },
  { name: "Maximum Percentage", percentage: 100, base: 100000 },
  { name: "Small Base", percentage: 25, base: 100 },
  { name: "Large Base", percentage: 25, base: 10000000 },
  { name: "Decimal Percentage", percentage: 12.5, base: 80000 }
];

edgeCases.forEach(testCase => {
  console.log(`\n${testCase.name}:`);
  testDualEntry(testCase.percentage, testCase.base, 'Test Field');
});

// Regional testing
console.log(`\n\n🌍 Regional Testing`);
console.log('=' .repeat(50));

console.log(`\nUS Region (TaxRush = 0):`);
const usIncome = 120 * 1500; // ANF * Returns
console.log(`  Tax Prep Income: $${usIncome.toLocaleString()}`);
console.log(`  TaxRush Income: $0`);
console.log(`  Total Income: $${usIncome.toLocaleString()}`);

console.log(`\nCA Region (TaxRush included):`);
const caIncome = 120 * 1500 + 50 * 300; // ANF * Returns + TaxRush ANF * TaxRush Returns
console.log(`  Tax Prep Income: $${(120 * 1500).toLocaleString()}`);
console.log(`  TaxRush Income: $${(50 * 300).toLocaleString()}`);
console.log(`  Total Income: $${caIncome.toLocaleString()}`);

console.log(`\n✅ Testing Complete!`);
console.log(`\n📋 Manual Verification Steps:`);
console.log(`1. Run the app and compare these calculated values`);
console.log(`2. Test wizard data flow from Page 1 → Page 2`);
console.log(`3. Verify dual-entry sync in expense fields`);
console.log(`4. Check KPI colors match status indicators`);
console.log(`5. Test debug panel threshold changes`);
console.log(`6. Verify regional differences (US vs CA)`);
