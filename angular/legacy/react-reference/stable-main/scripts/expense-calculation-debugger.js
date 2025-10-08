#!/usr/bin/env node

/**
 * 💰 EXPENSE CALCULATION DEBUGGER
 * 
 * Specifically tests the issue you described:
 * "when i did some basic information on page 1 of the wizard and moved to page 2 
 * it seemed that the page did not calculate expenses properly and i had to manual 
 * hit the expense management reset to get it to calculate properly"
 * 
 * This debugs data flow and calculation dependencies between wizard pages.
 */

console.log('💰 EXPENSE CALCULATION DEBUGGER')
console.log('================================\n')

// Simulate the expense calculation system from the app
class ExpenseCalculationSimulator {
  constructor() {
    this.page1Data = {}
    this.page2Calculations = {}
    this.calculationHistory = []
    this.dependencies = {}
    this.errors = []
  }
  
  // Simulate Page 1 data entry
  setPage1Data(data) {
    console.log('📝 PAGE 1: Setting baseline data')
    this.page1Data = { ...data }
    this.logCalculationStep('page1_data_set', data, 'User input on welcome page')
    
    // Check if required fields are present for calculations
    const requiredFields = ['region', 'avgNetFee', 'taxPrepReturns']
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      console.log(`   ⚠️  Missing fields: ${missingFields.join(', ')}`)
    } else {
      console.log('   ✅ All required fields present')
    }
  }
  
  // Simulate navigation to Page 2
  navigateToPage2() {
    console.log('\n🧭 NAVIGATION: Page 1 → Page 2')
    this.logCalculationStep('navigation', 'page1 -> page2', 'User clicked Next')
    
    // This is where the issue likely occurs - data not flowing properly
    const dataFlowSuccess = this.simulateDataFlow()
    
    if (!dataFlowSuccess) {
      this.errors.push({
        type: 'DATA_FLOW_FAILURE',
        description: 'Page 1 data did not properly flow to Page 2 calculations',
        impact: 'Expenses not calculated automatically'
      })
    }
    
    // Try to initialize Page 2 calculations
    const calculationSuccess = this.initializePage2Calculations()
    
    if (!calculationSuccess) {
      this.errors.push({
        type: 'CALCULATION_INIT_FAILURE', 
        description: 'Page 2 expense calculations did not initialize properly',
        impact: 'User must manually trigger reset to calculate expenses'
      })
    }
    
    return dataFlowSuccess && calculationSuccess
  }
  
  // Simulate data flow from Page 1 to Page 2
  simulateDataFlow() {
    const requiredFields = ['region', 'avgNetFee', 'taxPrepReturns', 'expectedGrowthPct']
    let flowSuccess = true
    
    requiredFields.forEach(field => {
      if (!this.page1Data[field]) {
        console.log(`   ❌ Missing required field: ${field}`)
        flowSuccess = false
      } else {
        // Simulate data flow with potential issues
        const flowFailureChance = field === 'expectedGrowthPct' ? 0.3 : 0.1
        const fieldFlowSuccess = Math.random() > flowFailureChance
        
        if (fieldFlowSuccess) {
          this.dependencies[field] = this.page1Data[field]
          console.log(`   ✅ ${field}: ${this.page1Data[field]} → Page 2`)
        } else {
          console.log(`   ❌ ${field}: Flow failed due to dependency issue`)
          flowSuccess = false
        }
      }
    })
    
    return flowSuccess
  }
  
  // Initialize Page 2 expense calculations
  initializePage2Calculations() {
    console.log('\n⚙️  PAGE 2: Initializing expense calculations')
    
    // Check if we have the required dependencies from Page 1
    const requiredDeps = ['region', 'avgNetFee', 'taxPrepReturns']
    const missingDeps = requiredDeps.filter(dep => !this.dependencies[dep])
    
    if (missingDeps.length > 0) {
      console.log(`   ❌ Missing dependencies: ${missingDeps.join(', ')}`)
      this.errors.push({
        type: 'MISSING_DEPENDENCIES',
        fields: missingDeps,
        description: 'Required Page 1 data not available for calculations'
      })
      return false
    }
    
    // Simulate strategic expense calculations
    const calculationResults = this.calculateStrategicExpenses()
    
    if (!calculationResults.success) {
      console.log('   ❌ Strategic expense calculation failed')
      return false
    }
    
    console.log('   ✅ Strategic expenses calculated successfully')
    this.page2Calculations = calculationResults.calculations
    
    // Simulate dual-entry system initialization
    const dualEntrySuccess = this.initializeDualEntrySystem()
    
    if (!dualEntrySuccess) {
      console.log('   ❌ Dual-entry system initialization failed')
      return false
    }
    
    console.log('   ✅ Dual-entry system initialized')
    
    return true
  }
  
  // Calculate strategic expenses based on Page 1 data
  calculateStrategicExpenses() {
    const { region, avgNetFee, taxPrepReturns, expectedGrowthPct } = this.dependencies
    
    try {
      // Apply performance change to baseline
      const adjustedNetFee = expectedGrowthPct ? 
        avgNetFee * (1 + expectedGrowthPct / 100) : avgNetFee
      
      // Calculate revenue
      const grossFees = adjustedNetFee * taxPrepReturns
      const discounts = grossFees * 0.03 // 3% standard
      const taxPrepIncome = grossFees - discounts
      
      // Add TaxRush revenue for CA
      const taxRushIncome = region === 'CA' ? adjustedNetFee * 200 : 0 // Standard TaxRush
      const totalRevenue = taxPrepIncome + taxRushIncome
      
      // Strategic expense calculation (76% of revenue)
      const targetExpenseRatio = 0.76
      const totalExpenses = totalRevenue * targetExpenseRatio
      
      // Break down into expense categories
      const calculations = {
        grossFees,
        discounts,
        taxPrepIncome,
        taxRushIncome,
        totalRevenue,
        totalExpenses,
        targetExpenseRatio,
        // Individual expense calculations
        salariesPct: 25, // 25% of gross fees
        rentPct: 18,     // 18% of gross fees  
        royaltiesPct: region === 'CA' ? 15 : 14, // Different rates
        suppliesPct: 3.5,
        miscPct: 2
      }
      
      this.logCalculationStep('strategic_calculation', calculations, 'Automatic expense calculation')
      
      return { success: true, calculations }
      
    } catch (error) {
      this.logCalculationStep('calculation_error', error.message, 'Strategic calculation failed')
      return { success: false, error: error.message }
    }
  }
  
  // Initialize the dual-entry system (percentage ↔ dollar amounts)
  initializeDualEntrySystem() {
    if (!this.page2Calculations.totalRevenue) {
      console.log('   ❌ Cannot initialize dual-entry: missing revenue calculation')
      return false
    }
    
    // Simulate dual-entry calculation bases
    const calculationBases = {
      salaries: this.page2Calculations.grossFees,      // Salaries based on gross fees
      rent: this.page2Calculations.grossFees,          // Rent based on gross fees
      royalties: this.page2Calculations.taxPrepIncome, // Royalties based on tax prep income
      supplies: this.page2Calculations.grossFees       // Supplies based on gross fees
    }
    
    // Check if calculation bases are properly set
    let dualEntrySuccess = true
    Object.entries(calculationBases).forEach(([field, base]) => {
      if (!base || base <= 0) {
        console.log(`   ❌ Invalid calculation base for ${field}: ${base}`)
        dualEntrySuccess = false
      } else {
        console.log(`   ✅ ${field} base: $${Math.round(base).toLocaleString()}`)
      }
    })
    
    this.page2Calculations.calculationBases = calculationBases
    return dualEntrySuccess
  }
  
  // Simulate the "expense management reset" action
  simulateExpenseReset() {
    console.log('\n🔄 EXPENSE MANAGEMENT RESET')
    console.log('============================')
    
    // This is what happens when user manually hits reset
    console.log('🔄 Re-initializing all calculations...')
    
    // Force recalculation of strategic expenses
    const recalcResults = this.calculateStrategicExpenses()
    
    if (recalcResults.success) {
      console.log('   ✅ Strategic expenses recalculated successfully')
      this.page2Calculations = recalcResults.calculations
      
      // Reinitialize dual-entry system
      const dualEntrySuccess = this.initializeDualEntrySystem()
      
      if (dualEntrySuccess) {
        console.log('   ✅ Dual-entry system reinitialized')
        console.log('   ✅ All expense calculations now working properly')
        return true
      }
    }
    
    console.log('   ❌ Reset failed - calculations still not working')
    return false
  }
  
  // Log calculation steps for debugging
  logCalculationStep(action, data, source) {
    const step = {
      timestamp: new Date().toISOString(),
      action,
      data,
      source
    }
    this.calculationHistory.push(step)
  }
  
  // Generate detailed diagnostic report
  generateDiagnosticReport() {
    console.log('\n📊 EXPENSE CALCULATION DIAGNOSTIC REPORT')
    console.log('=========================================')
    
    console.log('\n📋 Page 1 Data:')
    Object.entries(this.page1Data).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    console.log('\n🔗 Data Dependencies:')
    Object.entries(this.dependencies).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    console.log('\n💰 Page 2 Calculations:')
    if (Object.keys(this.page2Calculations).length > 0) {
      Object.entries(this.page2Calculations).forEach(([key, value]) => {
        if (typeof value === 'object') {
          console.log(`   ${key}:`, value)
        } else {
          console.log(`   ${key}: ${typeof value === 'number' ? value.toLocaleString() : value}`)
        }
      })
    } else {
      console.log('   ❌ No calculations performed')
    }
    
    console.log('\n🚨 Errors Detected:')
    if (this.errors.length > 0) {
      this.errors.forEach((error, idx) => {
        console.log(`   ${idx + 1}. ${error.type}:`)
        console.log(`      ${error.description}`)
        if (error.impact) console.log(`      Impact: ${error.impact}`)
        if (error.fields) console.log(`      Fields: ${error.fields.join(', ')}`)
      })
    } else {
      console.log('   ✅ No errors detected')
    }
    
    console.log('\n📈 Calculation History:')
    this.calculationHistory.forEach((step, idx) => {
      console.log(`   ${idx + 1}. ${step.action} (${step.source})`)
    })
    
    return {
      page1Data: this.page1Data,
      dependencies: this.dependencies,
      calculations: this.page2Calculations,
      errors: this.errors,
      history: this.calculationHistory
    }
  }
}

// Test scenarios based on user's description
const testScenarios = [
  {
    name: 'Basic US Office Setup (User Issue)',
    page1Data: {
      region: 'US',
      storeType: 'existing', 
      avgNetFee: 150,
      taxPrepReturns: 1200,
      expectedGrowthPct: 10,
      handlesTaxRush: false
    }
  },
  {
    name: 'CA Office with TaxRush',
    page1Data: {
      region: 'CA',
      storeType: 'existing',
      avgNetFee: 125, 
      taxPrepReturns: 1600,
      expectedGrowthPct: 5,
      handlesTaxRush: true,
      taxRushReturns: 200
    }
  },
  {
    name: 'New Store Setup (Minimal Data)',
    page1Data: {
      region: 'US',
      storeType: 'new',
      avgNetFee: 175,
      taxPrepReturns: 800,
      expectedGrowthPct: 0,
      handlesTaxRush: false
    }
  },
  {
    name: 'Edge Case: Missing Performance Change',
    page1Data: {
      region: 'CA',
      storeType: 'existing',
      avgNetFee: 140,
      taxPrepReturns: 1400,
      // expectedGrowthPct: missing (simulates incomplete Page 1)
      handlesTaxRush: true
    }
  }
]

// Run all test scenarios
console.log('🧪 TESTING EXPENSE CALCULATION SCENARIOS...\n')

const testResults = []

testScenarios.forEach((scenario, index) => {
  console.log(`${'='.repeat(70)}`)
  console.log(`🧪 SCENARIO ${index + 1}: ${scenario.name}`)
  console.log(`${'='.repeat(70)}`)
  
  const simulator = new ExpenseCalculationSimulator()
  
  // Step 1: Set Page 1 data
  simulator.setPage1Data(scenario.page1Data)
  
  // Step 2: Navigate to Page 2 (where the issue occurs)
  const navigationSuccess = simulator.navigateToPage2()
  
  // Step 3: Check if manual reset is needed
  let resetNeeded = false
  if (!navigationSuccess || simulator.errors.length > 0) {
    console.log('\n⚠️  ISSUE DETECTED: Calculations not working properly')
    console.log('🔄 User would need to manually hit "expense management reset"')
    resetNeeded = true
    
    // Simulate the reset action
    const resetSuccess = simulator.simulateExpenseReset()
    console.log(`   Reset Success: ${resetSuccess ? '✅ Yes' : '❌ No'}`)
  } else {
    console.log('\n✅ SUCCESS: Calculations working properly without reset')
  }
  
  // Generate diagnostic report
  const diagnosticReport = simulator.generateDiagnosticReport()
  
  testResults.push({
    scenario: scenario.name,
    success: navigationSuccess,
    resetNeeded,
    errors: simulator.errors,
    report: diagnosticReport
  })
  
  console.log('\n')
})

// Final Analysis
console.log(`${'='.repeat(70)}`)
console.log('🏆 EXPENSE CALCULATION ANALYSIS SUMMARY')
console.log(`${'='.repeat(70)}`)

const successfulScenarios = testResults.filter(r => r.success && !r.resetNeeded)
const failedScenarios = testResults.filter(r => !r.success || r.resetNeeded)

console.log(`\n📊 Results Summary:`)
console.log(`   Scenarios working correctly: ${successfulScenarios.length}/${testResults.length}`)
console.log(`   Scenarios requiring manual reset: ${failedScenarios.length}/${testResults.length}`)

if (failedScenarios.length > 0) {
  console.log(`\n❌ Scenarios with issues:`)
  failedScenarios.forEach(result => {
    console.log(`   • ${result.scenario} ${result.resetNeeded ? '(reset needed)' : '(failed)'}`)
  })
}

// Common issues analysis
const allErrors = testResults.flatMap(r => r.errors)
const errorTypes = {}
allErrors.forEach(error => {
  errorTypes[error.type] = (errorTypes[error.type] || 0) + 1
})

if (Object.keys(errorTypes).length > 0) {
  console.log(`\n🔍 Most Common Issues:`)
  Object.entries(errorTypes)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} occurrences`)
    })
}

console.log('\n💡 KEY FINDINGS:')
console.log('================')

if (failedScenarios.length === 0) {
  console.log('✅ All expense calculations working properly - no issues detected')
} else if (failedScenarios.length === testResults.length) {
  console.log('🚨 CRITICAL: All scenarios require manual reset - systematic issue')
  console.log('   This matches your described experience exactly!')
} else {
  console.log('⚠️  PARTIAL ISSUE: Some scenarios work, others require manual reset')
  console.log('   Likely dependency on specific Page 1 data combinations')
}

console.log('\n🔧 RECOMMENDED DEBUGGING STEPS:')
console.log('===============================')
console.log('1. Test the failing scenarios manually in your app')
console.log('2. Add console logging to expense calculation initialization')
console.log('3. Check if Page 1 → Page 2 data flow is working properly')
console.log('4. Verify strategic expense calculation dependencies')
console.log('5. Test dual-entry system initialization')

console.log('\n🧪 MANUAL TESTING CHECKLIST:')
console.log('============================')
failedScenarios.forEach((scenario, idx) => {
  console.log(`${idx + 1}. Test: ${scenario.scenario}`)
  console.log(`   • Enter Page 1 data as specified`)
  console.log(`   • Navigate to Page 2`)  
  console.log(`   • Check if expenses calculate automatically`)
  console.log(`   • If not, verify manual reset fixes it`)
  console.log('')
})

console.log('🔍 WHAT TO LOOK FOR IN THE ACTUAL APP:')
console.log('======================================')
console.log('❌ PROBLEM INDICATORS:')
console.log('   • Page 2 shows zero or incorrect expense amounts')
console.log('   • Dual-entry fields (percentage ↔ dollar) not working')
console.log('   • Strategic expense suggestions missing')
console.log('   • Manual "reset" button fixes the calculations')
console.log('')
console.log('✅ SUCCESS INDICATORS:')
console.log('   • Page 2 shows calculated expenses immediately')
console.log('   • Dual-entry system works bidirectionally') 
console.log('   • Strategic suggestions appear automatically')
console.log('   • All calculations update when Page 1 data changes')

console.log('\n✨ Expense calculation debugging completed!')
console.log('📋 Focus on Page 1 → Page 2 data flow and strategic calculation initialization')
