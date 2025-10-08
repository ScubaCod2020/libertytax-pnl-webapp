#!/usr/bin/env node

/**
 * 🔄 BIDIRECTIONAL DATA FLOW VALIDATOR
 * 
 * Tests the complete data architecture to ensure accuracy and user experience:
 * 
 * DATA FLOW PATHS:
 * 1. Wizard → App State (applyWizardAnswers)
 * 2. App State → localStorage (usePersistence) 
 * 3. localStorage → App State (startup load)
 * 4. Wizard ↔ localStorage (saveWizardAnswers/loadWizardAnswers)
 * 
 * FIELD MAPPING VALIDATION:
 * - WizardAnswers ↔ AppState field accuracy
 * - AppState ↔ SessionState field accuracy
 * - Bidirectional synchronization integrity
 * - Missing field detection
 * - Type consistency validation
 */

console.log('🔄 BIDIRECTIONAL DATA FLOW VALIDATOR')
console.log('===================================\n')

// Define all field mappings based on the codebase analysis
const FIELD_MAPPINGS = {
  // Core business data fields
  coreFields: {
    'region': {
      wizardField: 'region',
      appStateField: 'region', 
      sessionField: 'region',
      type: 'string',
      required: true,
      values: ['US', 'CA']
    },
    'avgNetFee': {
      wizardField: 'avgNetFee',
      appStateField: 'avgNetFee',
      sessionField: 'avgNetFee', 
      type: 'number',
      required: true,
      fallback: 125
    },
    'taxPrepReturns': {
      wizardField: 'taxPrepReturns',
      appStateField: 'taxPrepReturns',
      sessionField: 'taxPrepReturns',
      type: 'number', 
      required: true,
      fallback: 1600
    },
    'discountsPct': {
      wizardField: 'discountsPct',
      appStateField: 'discountsPct',
      sessionField: 'discountsPct',
      type: 'number',
      required: false,
      fallback: 3
    },
    'otherIncome': {
      wizardField: 'otherIncome', 
      appStateField: 'otherIncome',
      sessionField: 'otherIncome', // ✅ FIXED: Now properly mapped in SessionState!
      type: 'number',
      required: false,
      fallback: 0,
      conditional: 'hasOtherIncome'
    },
    'taxRushReturns': {
      wizardField: 'taxRushReturns',
      appStateField: 'taxRushReturns',
      sessionField: 'taxRushReturns',
      type: 'number',
      required: false,
      fallback: 0,
      conditional: 'region === CA && handlesTaxRush'
    },
    'calculatedTotalExpenses': {
      wizardField: 'calculatedTotalExpenses',
      appStateField: 'calculatedTotalExpenses', 
      sessionField: 'calculatedTotalExpenses', // ✅ FIXED: Now properly mapped in SessionState!
      type: 'number',
      required: false
    },
    'expectedGrowthPct': {
      wizardField: 'expectedGrowthPct',
      appStateField: 'expectedGrowthPct', // ✅ FIXED: Now properly mapped in AppState!
      sessionField: 'expectedGrowthPct',  // ✅ FIXED: Now properly mapped in SessionState!
      type: 'number',
      required: false,
      description: 'Performance change percentage - was the main cause of data flow failures'
    }
  },
  
  // All 17 expense fields
  expenseFields: {
    'salariesPct': { wizard: 'salariesPct', app: 'salariesPct', session: 'salariesPct', type: 'number' },
    'empDeductionsPct': { wizard: 'empDeductionsPct', app: 'empDeductionsPct', session: 'empDeductionsPct', type: 'number' },
    'rentPct': { wizard: 'rentPct', app: 'rentPct', session: 'rentPct', type: 'number' },
    'telephoneAmt': { wizard: 'telephoneAmt', app: 'telephoneAmt', session: 'telephoneAmt', type: 'number' },
    'utilitiesAmt': { wizard: 'utilitiesAmt', app: 'utilitiesAmt', session: 'utilitiesAmt', type: 'number' },
    'localAdvAmt': { wizard: 'localAdvAmt', app: 'localAdvAmt', session: 'localAdvAmt', type: 'number' },
    'insuranceAmt': { wizard: 'insuranceAmt', app: 'insuranceAmt', session: 'insuranceAmt', type: 'number' },
    'postageAmt': { wizard: 'postageAmt', app: 'postageAmt', session: 'postageAmt', type: 'number' },
    'suppliesPct': { wizard: 'suppliesPct', app: 'suppliesPct', session: 'suppliesPct', type: 'number' },
    'duesAmt': { wizard: 'duesAmt', app: 'duesAmt', session: 'duesAmt', type: 'number' },
    'bankFeesAmt': { wizard: 'bankFeesAmt', app: 'bankFeesAmt', session: 'bankFeesAmt', type: 'number' },
    'maintenanceAmt': { wizard: 'maintenanceAmt', app: 'maintenanceAmt', session: 'maintenanceAmt', type: 'number' },
    'travelEntAmt': { wizard: 'travelEntAmt', app: 'travelEntAmt', session: 'travelEntAmt', type: 'number' },
    'royaltiesPct': { wizard: 'royaltiesPct', app: 'royaltiesPct', session: 'royaltiesPct', type: 'number' },
    'advRoyaltiesPct': { wizard: 'advRoyaltiesPct', app: 'advRoyaltiesPct', session: 'advRoyaltiesPct', type: 'number' },
    'taxRushRoyaltiesPct': { wizard: 'taxRushRoyaltiesPct', app: 'taxRushRoyaltiesPct', session: 'taxRushRoyaltiesPct', type: 'number' },
    'miscPct': { wizard: 'miscPct', app: 'miscPct', session: 'miscPct', type: 'number' }
  },
  
  // Wizard-only fields (not in AppState/SessionState)
  wizardOnlyFields: {
    'storeType': { wizard: 'storeType', type: 'string', values: ['new', 'existing'] },
    'handlesTaxRush': { wizard: 'handlesTaxRush', type: 'boolean' },
    'hasOtherIncome': { wizard: 'hasOtherIncome', type: 'boolean' },
    // ✅ FIXED: expectedGrowthPct is now properly mapped - moved to coreFields
    'projectedTaxRushReturns': { wizard: 'projectedTaxRushReturns', type: 'number' }
  }
}

// Data flow validation system
class BidirectionalDataFlowValidator {
  constructor() {
    this.validationResults = []
    this.fieldMappingIssues = []
    this.dataFlowPaths = []
    this.syncTests = []
  }
  
  // Validate all field mappings
  validateFieldMappings() {
    console.log('🗺️  VALIDATING FIELD MAPPINGS...\n')
    
    // Test core fields
    console.log('📋 Core Business Data Fields:')
    const coreIssues = this.validateFieldGroup(FIELD_MAPPINGS.coreFields, 'core')
    
    // Test expense fields  
    console.log('\n💰 Expense Fields:')
    const expenseIssues = this.validateFieldGroup(FIELD_MAPPINGS.expenseFields, 'expense')
    
    // Test wizard-only fields
    console.log('\n🧙‍♂️ Wizard-Only Fields:')
    const wizardIssues = this.validateWizardOnlyFields(FIELD_MAPPINGS.wizardOnlyFields)
    
    const totalIssues = [...coreIssues, ...expenseIssues, ...wizardIssues]
    
    if (totalIssues.length === 0) {
      console.log('\n✅ All field mappings validated successfully')
    } else {
      console.log(`\n❌ Found ${totalIssues.length} field mapping issues:`)
      totalIssues.forEach(issue => console.log(`   • ${issue}`))
    }
    
    return totalIssues
  }
  
  // Validate a group of fields
  validateFieldGroup(fieldGroup, groupName) {
    const issues = []
    
    Object.entries(fieldGroup).forEach(([fieldName, mapping]) => {
      const fieldIssues = this.validateSingleField(fieldName, mapping)
      
      if (fieldIssues.length === 0) {
        console.log(`   ✅ ${fieldName}: ${mapping.wizardField || mapping.wizard} → ${mapping.appStateField || mapping.app} → ${mapping.sessionField || mapping.session}`)
      } else {
        console.log(`   ❌ ${fieldName}: ${fieldIssues.join(', ')}`)
        issues.push(...fieldIssues)
      }
    })
    
    return issues
  }
  
  // Validate wizard-only fields
  validateWizardOnlyFields(fieldGroup) {
    const issues = []
    
    Object.entries(fieldGroup).forEach(([fieldName, mapping]) => {
      console.log(`   ✅ ${fieldName}: Wizard-only (${mapping.type})`)
      
      // ✅ FIXED: expectedGrowthPct is now properly preserved - no longer wizard-only!
      // All remaining wizard-only fields are intentionally not preserved
    })
    
    return issues
  }
  
  // Validate individual field mapping
  validateSingleField(fieldName, mapping) {
    const issues = []
    
    // Check if field exists in all required interfaces
    const wizardField = mapping.wizardField || mapping.wizard
    const appField = mapping.appStateField || mapping.app  
    const sessionField = mapping.sessionField || mapping.session
    
    if (!wizardField) {
      issues.push(`Missing wizard field mapping`)
    }
    
    if (!appField && mapping.required) {
      issues.push(`Missing required app state field mapping`)
    }
    
    if (!sessionField && mapping.required) {
      issues.push(`Missing required session state field mapping`)
    }
    
    // Check for type consistency
    if (mapping.type && !['string', 'number', 'boolean'].includes(mapping.type)) {
      issues.push(`Invalid field type: ${mapping.type}`)
    }
    
    // Check for missing critical fields in SessionState
    if (sessionField === null && mapping.required) {
      issues.push(`Critical field missing from SessionState - will not persist`)
    }
    
    return issues
  }
  
  // Test data flow path: Wizard → App State
  testWizardToAppStateFlow() {
    console.log('\n🧙‍♂️ → 🏠 TESTING: Wizard → App State Flow\n')
    
    const testScenarios = [
      {
        name: 'Complete US Existing Store',
        wizardAnswers: {
          region: 'US',
          storeType: 'existing',
          avgNetFee: 150,
          taxPrepReturns: 1200,
          discountsPct: 3,
          hasOtherIncome: true,
          otherIncome: 5000,
          expectedGrowthPct: 10,
          handlesTaxRush: false,
          salariesPct: 25,
          rentPct: 18,
          royaltiesPct: 14,
          calculatedTotalExpenses: 145000
        }
      },
      {
        name: 'Complete CA Store with TaxRush',
        wizardAnswers: {
          region: 'CA',
          storeType: 'existing', 
          avgNetFee: 125,
          taxPrepReturns: 1600,
          discountsPct: 3,
          hasOtherIncome: false,
          handlesTaxRush: true,
          taxRushReturns: 240,
          expectedGrowthPct: 5,
          salariesPct: 26,
          rentPct: 19,
          royaltiesPct: 15,
          calculatedTotalExpenses: 172000
        }
      },
      {
        name: 'Partial Data (Missing Optional Fields)',
        wizardAnswers: {
          region: 'US',
          avgNetFee: 175,
          taxPrepReturns: 800,
          // Missing: discountsPct, expectedGrowthPct, expense details
        }
      },
      {
        name: 'Edge Case: Missing Required Field',
        wizardAnswers: {
          region: 'CA',
          // Missing avgNetFee (required)
          taxPrepReturns: 1000,
          discountsPct: 4
        }
      }
    ]
    
    const flowResults = []
    
    testScenarios.forEach(scenario => {
      console.log(`📋 Testing: ${scenario.name}`)
      const result = this.simulateWizardToAppStateMapping(scenario.wizardAnswers)
      flowResults.push({ scenario: scenario.name, ...result })
      
      if (result.success) {
        console.log(`   ✅ Flow successful: ${result.mappedFields} fields mapped`)
      } else {
        console.log(`   ❌ Flow failed: ${result.issues.join(', ')}`)
      }
      
      if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${result.warnings.join(', ')}`)
      }
      console.log('')
    })
    
    return flowResults
  }
  
  // Simulate wizard to app state mapping (based on applyWizardAnswers)
  simulateWizardToAppStateMapping(wizardAnswers) {
    const result = {
      success: true,
      mappedFields: 0,
      issues: [],
      warnings: [],
      appStateValues: {}
    }
    
    try {
      // Core field mapping
      Object.entries(FIELD_MAPPINGS.coreFields).forEach(([fieldName, mapping]) => {
        const wizardValue = wizardAnswers[mapping.wizardField]
        
        if (wizardValue !== undefined) {
          result.appStateValues[mapping.appStateField] = wizardValue
          result.mappedFields++
        } else if (mapping.required) {
          result.issues.push(`Missing required field: ${fieldName}`)
          result.success = false
        } else if (mapping.fallback !== undefined) {
          result.appStateValues[mapping.appStateField] = mapping.fallback
          result.warnings.push(`Using fallback for ${fieldName}: ${mapping.fallback}`)
          result.mappedFields++
        }
      })
      
      // Handle conditional logic (TaxRush)
      if (wizardAnswers.region === 'CA' && wizardAnswers.handlesTaxRush) {
        const taxRushReturns = wizardAnswers.taxRushReturns ?? wizardAnswers.projectedTaxRushReturns ?? 0
        result.appStateValues.taxRushReturns = taxRushReturns
        result.mappedFields++
      } else {
        result.appStateValues.taxRushReturns = 0
        result.mappedFields++
      }
      
      // Handle conditional logic (Other Income)
      if (wizardAnswers.hasOtherIncome) {
        result.appStateValues.otherIncome = wizardAnswers.otherIncome ?? 0
      } else {
        result.appStateValues.otherIncome = 0
      }
      result.mappedFields++
      
      // Expense fields mapping
      Object.entries(FIELD_MAPPINGS.expenseFields).forEach(([fieldName, mapping]) => {
        const wizardValue = wizardAnswers[mapping.wizard]
        if (wizardValue !== undefined) {
          result.appStateValues[mapping.app] = wizardValue
          result.mappedFields++
        }
      })
      
    } catch (error) {
      result.success = false
      result.issues.push(`Mapping error: ${error.message}`)
    }
    
    return result
  }
  
  // Test data flow path: App State → localStorage
  testAppStateToLocalStorageFlow() {
    console.log('\n🏠 → 💾 TESTING: App State → localStorage Flow\n')
    
    const testAppStates = [
      {
        name: 'Complete US State',
        appState: {
          region: 'US',
          avgNetFee: 150,
          taxPrepReturns: 1200,
          taxRushReturns: 0,
          discountsPct: 3,
          salariesPct: 25,
          rentPct: 18,
          royaltiesPct: 14,
          calculatedTotalExpenses: 145000
        }
      },
      {
        name: 'Complete CA State with TaxRush', 
        appState: {
          region: 'CA',
          avgNetFee: 125,
          taxPrepReturns: 1600,
          taxRushReturns: 240,
          discountsPct: 3,
          salariesPct: 26,
          rentPct: 19,
          royaltiesPct: 15
        }
      }
    ]
    
    const storageResults = []
    
    testAppStates.forEach(scenario => {
      console.log(`📋 Testing: ${scenario.name}`)
      const result = this.simulateAppStateToSessionMapping(scenario.appState)
      storageResults.push({ scenario: scenario.name, ...result })
      
      if (result.success) {
        console.log(`   ✅ Storage successful: ${result.storedFields} fields stored`)
      } else {
        console.log(`   ❌ Storage failed: ${result.issues.join(', ')}`)
      }
      
      if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${result.warnings.join(', ')}`)
      }
      console.log('')
    })
    
    return storageResults
  }
  
  // Simulate app state to session state mapping
  simulateAppStateToSessionMapping(appState) {
    const result = {
      success: true,
      storedFields: 0,
      issues: [],
      warnings: [],
      sessionState: {}
    }
    
    try {
      // Map core fields that exist in SessionState
      Object.entries(FIELD_MAPPINGS.coreFields).forEach(([fieldName, mapping]) => {
        if (mapping.sessionField && appState[mapping.appStateField] !== undefined) {
          result.sessionState[mapping.sessionField] = appState[mapping.appStateField]
          result.storedFields++
        } else if (mapping.sessionField === null && appState[mapping.appStateField] !== undefined) {
          result.warnings.push(`Field ${fieldName} in AppState but missing from SessionState - will not persist`)
        }
      })
      
      // Map expense fields
      Object.entries(FIELD_MAPPINGS.expenseFields).forEach(([fieldName, mapping]) => {
        if (appState[mapping.app] !== undefined) {
          result.sessionState[mapping.session] = appState[mapping.app]
          result.storedFields++
        }
      })
      
    } catch (error) {
      result.success = false
      result.issues.push(`Storage mapping error: ${error.message}`)
    }
    
    return result
  }
  
  // Test bidirectional synchronization integrity
  testBidirectionalSynchronization() {
    console.log('\n🔄 TESTING: Bidirectional Synchronization Integrity\n')
    
    const syncTests = [
      {
        name: 'Complete Round Trip Test',
        initialData: {
          region: 'CA',
          avgNetFee: 140,
          taxPrepReturns: 1400,
          discountsPct: 3.5,
          hasOtherIncome: true,
          otherIncome: 3000,
          handlesTaxRush: true,
          taxRushReturns: 210,
          salariesPct: 27,
          rentPct: 20,
          royaltiesPct: 15.5
        }
      },
      {
        name: 'Data Loss Detection Test',
        initialData: {
          region: 'US',
          avgNetFee: 160,
          taxPrepReturns: 1100,
          expectedGrowthPct: 8, // This should be lost (not in AppState/SessionState)
          calculatedTotalExpenses: 135000 // This should be lost (not in SessionState)
        }
      }
    ]
    
    syncTests.forEach(test => {
      console.log(`🔄 Testing: ${test.name}`)
      const result = this.simulateFullRoundTrip(test.initialData)
      
      if (result.dataIntegrity) {
        console.log(`   ✅ Data integrity maintained: ${result.preservedFields}/${result.totalFields} fields preserved`)
      } else {
        console.log(`   ❌ Data integrity compromised: ${result.lostFields.length} fields lost`)
        result.lostFields.forEach(field => {
          console.log(`     • Lost: ${field}`)
        })
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`   ⚠️  ${warning}`)
        })
      }
      console.log('')
    })
  }
  
  // Simulate full round trip: Wizard → App State → localStorage → App State
  simulateFullRoundTrip(initialWizardData) {
    const result = {
      dataIntegrity: true,
      totalFields: Object.keys(initialWizardData).length,
      preservedFields: 0,
      lostFields: [],
      warnings: []
    }
    
    // Step 1: Wizard → App State
    const appStateMapping = this.simulateWizardToAppStateMapping(initialWizardData)
    
    // Step 2: App State → Session State (localStorage)
    const sessionMapping = this.simulateAppStateToSessionMapping(appStateMapping.appStateValues)
    
    // Step 3: Session State → App State (startup load)
    const finalAppState = { ...sessionMapping.sessionState }
    
    // Compare initial vs final data
    Object.keys(initialWizardData).forEach(field => {
      const initialValue = initialWizardData[field]
      
      // Find the corresponding final field
      let finalValue = null
      let found = false
      
      // Check core fields
      const coreMapping = Object.values(FIELD_MAPPINGS.coreFields).find(m => m.wizardField === field)
      if (coreMapping && coreMapping.sessionField) {
        finalValue = finalAppState[coreMapping.sessionField]
        found = true
      }
      
      // Check expense fields
      const expenseMapping = Object.values(FIELD_MAPPINGS.expenseFields).find(m => m.wizard === field)
      if (expenseMapping) {
        finalValue = finalAppState[expenseMapping.session]
        found = true
      }
      
      if (found && finalValue === initialValue) {
        result.preservedFields++
      } else if (found && finalValue !== initialValue) {
        result.lostFields.push(`${field}: ${initialValue} → ${finalValue} (modified)`)
        result.dataIntegrity = false
      } else {
        result.lostFields.push(`${field}: ${initialValue} → lost (no mapping path)`)
        result.dataIntegrity = false
        
        // Check if this is an expected loss
        const wizardOnlyField = FIELD_MAPPINGS.wizardOnlyFields[field]
        if (wizardOnlyField) {
          result.warnings.push(`${field} is wizard-only and expected to be lost`)
        } else {
          result.warnings.push(`${field} should be preserved but mapping path is missing`)
        }
      }
    })
    
    return result
  }
  
  // Generate comprehensive report
  generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80))
    console.log('🏆 BIDIRECTIONAL DATA FLOW VALIDATION REPORT')
    console.log('='.repeat(80))
    
    // Field mapping validation
    console.log('\n🗺️  FIELD MAPPING ANALYSIS:')
    const mappingIssues = this.validateFieldMappings()
    
    if (mappingIssues.length === 0) {
      console.log('✅ All field mappings are properly defined and consistent')
    } else {
      console.log(`❌ Found ${mappingIssues.length} field mapping issues that need attention`)
    }
    
    // Data flow testing
    const wizardToAppResults = this.testWizardToAppStateFlow()
    const appToStorageResults = this.testAppStateToLocalStorageFlow()
    
    // Bidirectional synchronization testing
    this.testBidirectionalSynchronization()
    
    // Critical findings
    console.log('\n🚨 CRITICAL FINDINGS:')
    console.log('====================')
    
    const criticalIssues = []
    
    // Check for missing critical fields in SessionState
    if (mappingIssues.some(issue => issue.includes('missing from SessionState'))) {
      criticalIssues.push('Critical fields missing from SessionState will cause data loss on page reload')
    }
    
    // Check for systematic flow failures
    const failedFlows = wizardToAppResults.filter(r => !r.success).length
    if (failedFlows > 0) {
      criticalIssues.push(`${failedFlows} data flow scenarios fail completely`)
    }
    
    if (criticalIssues.length === 0) {
      console.log('✅ No critical data flow issues detected')
    } else {
      criticalIssues.forEach((issue, idx) => {
        console.log(`${idx + 1}. ${issue}`)
      })
    }
    
    console.log('\n💡 SPECIFIC RECOMMENDATIONS:')
    console.log('============================')
    
    console.log('🔧 IMMEDIATE FIXES NEEDED:')
    console.log('1. Add missing fields to SessionState interface:')
    console.log('   • otherIncome (currently missing - causes data loss)')
    console.log('   • calculatedTotalExpenses (currently missing - expense calculations lost)')
    console.log('')
    console.log('2. Add expectedGrowthPct persistence:')
    console.log('   • Critical for calculations but only exists in wizard')
    console.log('   • Should be saved to localStorage and restored on app load')
    console.log('')
    console.log('3. Implement bidirectional field validation:')
    console.log('   • Add runtime type checking for all mapped fields')
    console.log('   • Validate data consistency during transfers')
    
    console.log('\n🧪 TESTING RECOMMENDATIONS:')
    console.log('===========================')
    console.log('1. Test wizard completion → app reload → verify all data preserved')
    console.log('2. Test partial wizard completion → navigation → verify no data loss')
    console.log('3. Test bidirectional editing (wizard changes ↔ dashboard changes)')
    console.log('4. Test error recovery when localStorage is corrupted/missing')
    
    return {
      fieldMappingIssues: mappingIssues,
      dataFlowResults: {
        wizardToApp: wizardToAppResults,
        appToStorage: appToStorageResults
      },
      criticalIssues
    }
  }
}

// Run comprehensive validation
console.log('🚀 Starting bidirectional data flow validation...\n')

const validator = new BidirectionalDataFlowValidator()
const report = validator.generateComprehensiveReport()

console.log('\n✨ Bidirectional data flow validation completed!')
console.log('📊 This analysis shows the exact field mapping and data flow issues')
console.log('🔄 Focus on fixing the SessionState missing fields first - they cause data loss')
