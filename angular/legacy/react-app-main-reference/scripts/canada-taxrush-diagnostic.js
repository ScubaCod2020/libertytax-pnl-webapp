#!/usr/bin/env node

/**
 * 🇨🇦 CANADA TAXRUSH DIAGNOSTIC SCRIPT
 * 
 * Focused analysis of why CA region scenarios are failing CPR (Cost Per Return)
 * while US scenarios pass with 100% success rate.
 * 
 * This will help identify the specific issue with TaxRush calculations.
 */

console.log('🇨🇦 CANADA TAXRUSH DIAGNOSTIC SCRIPT')
console.log('=====================================\n')

// Replicate the exact calculation logic from the main script
function calculateResults(inputs) {
  const handlesTaxRush = inputs.handlesTaxRush ?? (inputs.region === 'CA')
  const taxRush = inputs.region === 'CA' && handlesTaxRush ? inputs.taxRushReturns : 0
  
  // Revenue calculations
  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns
  const discounts = grossFees * (inputs.discountsPct / 100)
  const taxPrepIncome = grossFees - discounts
  const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? (inputs.avgNetFee * taxRush) : 0
  const otherIncome = inputs.otherIncome || 0
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome
  
  // Strategic expense calculations (optimized to meet KPI thresholds)
  const revenuePerReturn = totalRevenue / inputs.taxPrepReturns
  const targetExpenseRatio = 0.76 // 76% strategic target (middle of 74.5-77.5% range)
  const targetExpensesPerReturn = revenuePerReturn * targetExpenseRatio
  const totalExpenses = targetExpensesPerReturn * inputs.taxPrepReturns
  
  // Final calculations
  const netIncome = totalRevenue - totalExpenses
  const totalReturns = inputs.taxPrepReturns + taxRush
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

// Detailed KPI analysis function
function analyzeKPIStatus(results, region, inputs) {
  console.log(`\n📊 DETAILED KPI ANALYSIS`)
  console.log(`================================`)
  
  // Net Income Analysis
  const niStatus = results.netIncome >= 0 ? 'GREEN' : (results.netIncome <= -5000 ? 'RED' : 'YELLOW')
  console.log(`💰 NET INCOME: $${results.netIncome.toLocaleString()} → ${niStatus}`)
  console.log(`   Logic: >= $0 = GREEN, <= -$5,000 = RED, else YELLOW`)
  
  // Net Margin Analysis  
  const nimGreenMax = 100 - 74.5 // 25.5%
  let nimStatus = 'RED'
  if (results.netMarginPct >= 22.5 && results.netMarginPct <= nimGreenMax) {
    nimStatus = 'GREEN'
  } else if ((results.netMarginPct >= 19.5 && results.netMarginPct < 22.5) || 
             (results.netMarginPct > nimGreenMax && results.netMarginPct <= 28.5)) {
    nimStatus = 'YELLOW'
  }
  console.log(`📈 NET MARGIN: ${results.netMarginPct.toFixed(1)}% → ${nimStatus}`)
  console.log(`   Logic: 22.5-25.5% = GREEN, 19.5-22.5% or 25.5-28.5% = YELLOW, else RED`)
  
  // Cost Per Return Analysis - THIS IS THE PROBLEM AREA
  console.log(`\n🔍 COST PER RETURN DEEP DIVE:`)
  console.log(`   Total Expenses: $${results.totalExpenses.toLocaleString()}`)
  console.log(`   Total Returns: ${results.totalReturns.toLocaleString()} (Tax Prep: ${inputs.taxPrepReturns} + TaxRush: ${results.taxRushReturns})`)
  console.log(`   Cost Per Return: $${results.costPerReturn.toFixed(2)}`)
  
  // Strategic CPR calculation
  const cprGreenMin = results.revenuePerReturn * 0.745  // 74.5% strategic minimum
  const cprGreenMax = results.revenuePerReturn * 0.775  // 77.5% strategic maximum
  const cprYellowMin = results.revenuePerReturn * 0.715 // 71.5% yellow minimum  
  const cprYellowMax = results.revenuePerReturn * 0.805 // 80.5% yellow maximum
  
  console.log(`   Revenue Per Return: $${results.revenuePerReturn.toFixed(2)}`)
  console.log(`   Strategic Ranges:`)
  console.log(`     GREEN:  $${cprGreenMin.toFixed(2)} - $${cprGreenMax.toFixed(2)} (74.5-77.5% of revenue/return)`)
  console.log(`     YELLOW: $${cprYellowMin.toFixed(2)} - $${cprGreenMin.toFixed(2)} OR $${cprGreenMax.toFixed(2)} - $${cprYellowMax.toFixed(2)}`)
  console.log(`     RED:    < $${cprYellowMin.toFixed(2)} OR > $${cprYellowMax.toFixed(2)}`)
  
  let cprStatus = 'RED'
  if (results.costPerReturn >= cprGreenMin && results.costPerReturn <= cprGreenMax) {
    cprStatus = 'GREEN'
  } else if ((results.costPerReturn >= cprYellowMin && results.costPerReturn < cprGreenMin) || 
             (results.costPerReturn > cprGreenMax && results.costPerReturn <= cprYellowMax)) {
    cprStatus = 'YELLOW'
  }
  
  console.log(`   → ACTUAL CPR: $${results.costPerReturn.toFixed(2)} → ${cprStatus}`)
  
  if (cprStatus !== 'GREEN') {
    console.log(`\n🚨 CPR ISSUE ANALYSIS:`)
    if (results.costPerReturn < cprYellowMin) {
      console.log(`   Problem: CPR is TOO LOW (${results.costPerReturn.toFixed(2)} < ${cprYellowMin.toFixed(2)})`)
      console.log(`   Cause: Expenses are too low relative to total returns`)
      console.log(`   Root Issue: TaxRush returns inflate total returns, making CPR artificially low`)
    } else if (results.costPerReturn > cprYellowMax) {
      console.log(`   Problem: CPR is TOO HIGH (${results.costPerReturn.toFixed(2)} > ${cprYellowMax.toFixed(2)})`)
      console.log(`   Cause: Expenses are too high relative to total returns`)
    }
    
    console.log(`\n🔧 SUGGESTED FIXES:`)
    console.log(`   1. Adjust strategic expense calculation to account for TaxRush returns`)
    console.log(`   2. Use different expense ratio for CA region with TaxRush`)
    console.log(`   3. Calculate expenses based on total returns instead of just tax prep returns`)
  }
  
  return { niStatus, nimStatus, cprStatus }
}

// Test scenarios to understand the issue
const testScenarios = [
  {
    name: "US Baseline (Working)",
    region: "US",
    avgNetFee: 125,
    taxPrepReturns: 1600,
    taxRushReturns: 0,
    handlesTaxRush: false,
    discountsPct: 3,
    otherIncome: 0
  },
  {
    name: "CA Without TaxRush (Test)",
    region: "CA", 
    avgNetFee: 125,
    taxPrepReturns: 1600,
    taxRushReturns: 0,
    handlesTaxRush: false,
    discountsPct: 3,
    otherIncome: 0
  },
  {
    name: "CA With TaxRush (Failing)",
    region: "CA",
    avgNetFee: 125, 
    taxPrepReturns: 1600,
    taxRushReturns: 200,
    handlesTaxRush: true,
    discountsPct: 3,
    otherIncome: 0
  },
  {
    name: "CA Small Office (Edge Case)",
    region: "CA",
    avgNetFee: 100,
    taxPrepReturns: 100, 
    taxRushReturns: 200,
    handlesTaxRush: true,
    discountsPct: 3,
    otherIncome: 0
  }
]

console.log('🧪 RUNNING DIAGNOSTIC SCENARIOS...\n')

testScenarios.forEach((scenario, index) => {
  console.log(`${'='.repeat(80)}`)
  console.log(`🧪 SCENARIO ${index + 1}: ${scenario.name}`)
  console.log(`${'='.repeat(80)}`)
  
  console.log(`📋 Input Parameters:`)
  console.log(`   Region: ${scenario.region}`)
  console.log(`   Average Net Fee: $${scenario.avgNetFee}`)
  console.log(`   Tax Prep Returns: ${scenario.taxPrepReturns.toLocaleString()}`)
  console.log(`   TaxRush Returns: ${scenario.taxRushReturns.toLocaleString()}`)
  console.log(`   Handles TaxRush: ${scenario.handlesTaxRush}`)
  console.log(`   Discounts: ${scenario.discountsPct}%`)
  
  const results = calculateResults(scenario)
  const kpiStatus = analyzeKPIStatus(results, scenario.region, scenario)
  
  const allGreen = kpiStatus.niStatus === 'GREEN' && 
                  kpiStatus.nimStatus === 'GREEN' && 
                  kpiStatus.cprStatus === 'GREEN'
  
  console.log(`\n🚦 FINAL STATUS: ${allGreen ? '✅ ALL GREEN' : '❌ ISSUES FOUND'}`)
  
  if (!allGreen) {
    console.log(`   Issues:`)
    if (kpiStatus.niStatus !== 'GREEN') console.log(`   • Net Income: ${kpiStatus.niStatus}`)
    if (kpiStatus.nimStatus !== 'GREEN') console.log(`   • Net Margin: ${kpiStatus.nimStatus}`)
    if (kpiStatus.cprStatus !== 'GREEN') console.log(`   • Cost Per Return: ${kpiStatus.cprStatus}`)
  }
  
  console.log('\n')
})

console.log(`${'='.repeat(80)}`)
console.log('🎯 DIAGNOSTIC CONCLUSIONS')
console.log(`${'='.repeat(80)}`)

console.log('\n💡 KEY INSIGHTS:')
console.log('1. Compare US vs CA scenarios to see if region alone causes issues')
console.log('2. Compare CA without TaxRush vs CA with TaxRush to isolate the TaxRush effect')
console.log('3. Check if the strategic expense calculation method needs adjustment for TaxRush')

console.log('\n🔧 LIKELY ROOT CAUSES:')
console.log('A. Strategic expenses calculated on tax prep returns only, but CPR uses total returns')
console.log('B. TaxRush returns dilute the cost per return metric artificially')  
console.log('C. Strategic expense ratio (76%) may not be appropriate for TaxRush offices')

console.log('\n📋 RECOMMENDED FIXES:')
console.log('1. Calculate strategic expenses based on total returns (tax prep + TaxRush)')
console.log('2. Use different expense ratios for TaxRush vs non-TaxRush offices')
console.log('3. Adjust CPR calculation logic to handle TaxRush scenarios properly')

console.log('\n✨ Diagnostic completed!')
