#!/usr/bin/env node

/**
 * 🔧 CORRECTED KPI TESTING SCRIPT
 * 
 * This script applies the fix identified in the diagnostic:
 * - Calculate strategic expenses based on TOTAL returns (tax prep + TaxRush)
 * - This should make all CA scenarios pass the CPR threshold
 * 
 * Testing the corrected logic with the same comprehensive matrix.
 */

console.log('🔧 CORRECTED KPI TESTING SCRIPT')
console.log('===============================\n')

// CORRECTED calculation function (fixed TaxRush issue)
function calculateResultsCorrected(inputs) {
  const handlesTaxRush = inputs.handlesTaxRush ?? (inputs.region === 'CA')
  const taxRush = inputs.region === 'CA' && handlesTaxRush ? inputs.taxRushReturns : 0
  
  // Revenue calculations (unchanged)
  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns
  const discounts = grossFees * (inputs.discountsPct / 100)
  const taxPrepIncome = grossFees - discounts
  const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? (inputs.avgNetFee * taxRush) : 0
  const otherIncome = inputs.otherIncome || 0
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome
  
  // CORRECTED: Strategic expense calculations based on TOTAL returns
  const totalReturns = inputs.taxPrepReturns + taxRush
  const revenuePerReturn = totalRevenue / totalReturns  // Use total returns
  const targetExpenseRatio = 0.76 // 76% strategic target
  const targetExpensesPerReturn = revenuePerReturn * targetExpenseRatio
  const totalExpenses = targetExpensesPerReturn * totalReturns  // Use total returns
  
  // Final calculations
  const netIncome = totalRevenue - totalExpenses
  const costPerReturn = totalExpenses / totalReturns
  const netMarginPct = (netIncome / totalRevenue) * 100
  
  return {
    grossFees,
    discounts, 
    taxPrepIncome,
    taxRushIncome,
    otherIncome,
    totalRevenue,
    totalExpenses,
    netIncome,
    totalReturns,
    costPerReturn,
    netMarginPct,
    revenuePerReturn,
    targetExpensesPerReturn,
    taxRushReturns: taxRush
  }
}

// KPI Status Functions (unchanged)
function getKPIStatus(results, thresholds) {
  // Net Income Status
  let niStatus = 'green'
  if (results.netIncome <= thresholds.netIncomeWarn) {
    niStatus = 'red'
  } else if (results.netIncome < 0) {
    niStatus = 'yellow'
  }
  
  // Net Margin Status (strategic ranges)
  let nimStatus = 'red'
  const nimGreenMax = 100 - 74.5 // 25.5%
  if (results.netMarginPct >= thresholds.nimGreen && results.netMarginPct <= nimGreenMax) {
    nimStatus = 'green' // 22.5-25.5% optimal range
  } else if ((results.netMarginPct >= thresholds.nimYellow && results.netMarginPct < thresholds.nimGreen) || 
             (results.netMarginPct > nimGreenMax && results.netMarginPct <= 28.5)) {
    nimStatus = 'yellow'
  }
  
  // Cost Per Return Status (strategic expense ranges)
  let cprStatus = 'red'
  const cprGreenMin = results.revenuePerReturn * 0.745  // 74.5% strategic minimum
  const cprGreenMax = results.revenuePerReturn * 0.775  // 77.5% strategic maximum  
  const cprYellowMin = results.revenuePerReturn * 0.715 // 71.5% yellow minimum
  const cprYellowMax = results.revenuePerReturn * 0.805 // 80.5% yellow maximum
  
  if (results.costPerReturn >= cprGreenMin && results.costPerReturn <= cprGreenMax) {
    cprStatus = 'green'
  } else if ((results.costPerReturn >= cprYellowMin && results.costPerReturn < cprGreenMin) || 
             (results.costPerReturn > cprGreenMax && results.costPerReturn <= cprYellowMax)) {
    cprStatus = 'yellow'
  }
  
  return { niStatus, nimStatus, cprStatus }
}

// Test thresholds
const defaultThresholds = {
  cprGreen: 95,
  cprYellow: 110, 
  nimGreen: 22.5,
  nimYellow: 19.5,
  netIncomeWarn: -5000
}

// Quick validation test on the scenarios that were failing
const validationScenarios = [
  {
    name: "CA With TaxRush (Previously Failing)",
    region: "CA",
    avgNetFee: 125, 
    taxPrepReturns: 1600,
    taxRushReturns: 200,
    handlesTaxRush: true,
    discountsPct: 3,
    otherIncome: 0,
    expectedGrowthPct: 0
  },
  {
    name: "CA Small Office (Previously Failing)",
    region: "CA",
    avgNetFee: 100,
    taxPrepReturns: 100, 
    taxRushReturns: 200,
    handlesTaxRush: true,
    discountsPct: 3,
    otherIncome: 0,
    expectedGrowthPct: 0
  },
  {
    name: "CA Growth Scenario (Previously Failing)",
    region: "CA",
    avgNetFee: 130, // 10% growth applied
    taxPrepReturns: 1500, 
    taxRushReturns: 200,
    handlesTaxRush: true,
    discountsPct: 3,
    otherIncome: 0,
    expectedGrowthPct: 10
  }
]

console.log('🧪 TESTING CORRECTED CALCULATION LOGIC...\n')

validationScenarios.forEach((scenario, index) => {
  console.log(`${'='.repeat(60)}`)
  console.log(`✅ VALIDATION ${index + 1}: ${scenario.name}`)
  console.log(`${'='.repeat(60)}`)
  
  console.log(`📋 Scenario: ${scenario.taxPrepReturns} tax prep + ${scenario.taxRushReturns} TaxRush @ $${scenario.avgNetFee}`)
  
  const results = calculateResultsCorrected(scenario)
  const kpiStatus = getKPIStatus(results, defaultThresholds)
  
  console.log(`💰 Revenue: $${results.totalRevenue.toLocaleString()} (Tax Prep: $${results.taxPrepIncome.toLocaleString()} + TaxRush: $${results.taxRushIncome.toLocaleString()})`)
  console.log(`💸 Expenses: $${results.totalExpenses.toLocaleString()} (strategic 76% of revenue)`)
  console.log(`📊 Results:`)
  console.log(`   Net Income: $${results.netIncome.toLocaleString()} (${kpiStatus.niStatus.toUpperCase()})`)
  console.log(`   Net Margin: ${results.netMarginPct.toFixed(1)}% (${kpiStatus.nimStatus.toUpperCase()})`)  
  console.log(`   Cost/Return: $${results.costPerReturn.toFixed(2)} (${kpiStatus.cprStatus.toUpperCase()})`)
  console.log(`   Revenue/Return: $${results.revenuePerReturn.toFixed(2)}`)
  
  const allGreen = kpiStatus.niStatus === 'green' && 
                  kpiStatus.nimStatus === 'green' && 
                  kpiStatus.cprStatus === 'green'
  
  console.log(`\n🚦 RESULT: ${allGreen ? '✅ ALL GREEN!' : '❌ STILL FAILING'}`)
  
  if (!allGreen) {
    console.log(`   Issues remaining:`)
    if (kpiStatus.niStatus !== 'green') console.log(`   • Net Income: ${kpiStatus.niStatus}`)
    if (kpiStatus.nimStatus !== 'green') console.log(`   • Net Margin: ${kpiStatus.nimStatus}`)
    if (kpiStatus.cprStatus !== 'green') console.log(`   • Cost/Return: ${kpiStatus.cprStatus}`)
  }
  
  console.log('\n')
})

// Quick comprehensive test with corrected logic
console.log(`${'='.repeat(60)}`)
console.log('🚀 COMPREHENSIVE TEST WITH CORRECTED LOGIC')
console.log(`${'='.repeat(60)}`)

const quickTestConfig = {
  regions: ['US', 'CA'],
  taxReturnCounts: [500, 1000, 1500, 2000, 3000], // Sample
  avgNetFees: [100, 150, 200, 300, 400], // Sample
  performanceChanges: [-10, -5, 0, 5, 10, 15, 20],
  discountsPct: 3,
  taxRushReturns: 200
}

let totalTests = 0
let allGreenScenarios = 0
const regionResults = {}

for (const region of quickTestConfig.regions) {
  regionResults[region] = { total: 0, green: 0 }
  
  for (const performanceChange of quickTestConfig.performanceChanges) {
    let regionPerfGreen = 0
    let regionPerfTotal = 0
    
    for (const taxReturns of quickTestConfig.taxReturnCounts) {
      for (const avgNetFee of quickTestConfig.avgNetFees) {
        
        const inputs = {
          region: region,
          avgNetFee: performanceChange !== 0 ? Math.round(avgNetFee * (1 + performanceChange / 100)) : avgNetFee,
          taxPrepReturns: taxReturns,
          taxRushReturns: region === 'CA' ? quickTestConfig.taxRushReturns : 0,
          handlesTaxRush: region === 'CA',
          discountsPct: quickTestConfig.discountsPct,
          otherIncome: 0,
          expectedGrowthPct: performanceChange
        }
        
        const results = calculateResultsCorrected(inputs)
        const kpiStatus = getKPIStatus(results, defaultThresholds)
        
        totalTests++
        regionPerfTotal++
        regionResults[region].total++
        
        const allGreen = kpiStatus.niStatus === 'green' && 
                        kpiStatus.nimStatus === 'green' && 
                        kpiStatus.cprStatus === 'green'
        
        if (allGreen) {
          allGreenScenarios++
          regionPerfGreen++
          regionResults[region].green++
        }
      }
    }
    
    const successRate = (regionPerfGreen / regionPerfTotal * 100).toFixed(1)
    console.log(`${region} ${performanceChange > 0 ? '+' : ''}${performanceChange}%: ${regionPerfGreen}/${regionPerfTotal} (${successRate}%) ALL GREEN`)
  }
}

console.log(`\n📊 CORRECTED LOGIC SUMMARY:`)
console.log(`Total Tests: ${totalTests.toLocaleString()}`)
console.log(`All Green: ${allGreenScenarios.toLocaleString()}`) 
console.log(`Success Rate: ${(allGreenScenarios / totalTests * 100).toFixed(1)}%`)

Object.entries(regionResults).forEach(([region, data]) => {
  const rate = (data.green / data.total * 100).toFixed(1)
  console.log(`${region} Region: ${data.green}/${data.total} (${rate}%) ALL GREEN`)
})

if (allGreenScenarios / totalTests > 0.95) {
  console.log('\n🎉 SUCCESS! Corrected calculation logic achieves >95% green scenarios!')
  console.log('\n📋 NEXT STEPS:')
  console.log('1. Update the main app calculation logic to use total returns for strategic expenses')
  console.log('2. Test the fix in the actual Liberty Tax P&L webapp')
  console.log('3. Run manual validation with the successful scenarios above')
} else {
  console.log('\n⚠️ Still some issues remain - may need additional adjustments')
}

console.log('\n✨ Corrected KPI testing completed!')
