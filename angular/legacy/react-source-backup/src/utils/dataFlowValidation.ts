// 🔄 DATA FLOW VALIDATION UTILITIES
// Runtime validation functions to ensure data integrity during transfers
// Created to prevent the 63% data flow failure rate identified in comprehensive testing

export interface DataFlowValidationResult {
  isValid: boolean
  issues: string[]
  warnings: string[]
  criticalFields: string[]
}

/**
 * Validates critical field preservation during wizard → app state transfer
 */
export function validateWizardToAppStateTransfer(
  wizardAnswers: any,
  appState: any
): DataFlowValidationResult {
  const result: DataFlowValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    criticalFields: []
  }

  // Critical fields that MUST be preserved
  const criticalMappings = [
    { wizard: 'region', app: 'region', required: true },
    { wizard: 'avgNetFee', app: 'avgNetFee', required: true },
    { wizard: 'taxPrepReturns', app: 'taxPrepReturns', required: true },
    { wizard: 'expectedGrowthPct', app: 'expectedGrowthPct', required: false }, // NEW FIX
    { wizard: 'calculatedTotalExpenses', app: 'calculatedTotalExpenses', required: false },
    { wizard: 'discountsPct', app: 'discountsPct', required: false },
    { wizard: 'otherIncome', app: 'otherIncome', required: false }
  ]

  criticalMappings.forEach(mapping => {
    const wizardValue = wizardAnswers?.[mapping.wizard]
    const appValue = appState?.[mapping.app]

    if (mapping.required && wizardValue === undefined) {
      result.issues.push(`Missing required field in wizard: ${mapping.wizard}`)
      result.isValid = false
    }

    if (wizardValue !== undefined && appValue === undefined) {
      if (mapping.required) {
        result.issues.push(`Critical field lost in transfer: ${mapping.wizard} → ${mapping.app}`)
        result.isValid = false
        result.criticalFields.push(mapping.wizard)
      } else {
        result.warnings.push(`Optional field not transferred: ${mapping.wizard} → ${mapping.app}`)
      }
    }

    if (wizardValue !== undefined && appValue !== undefined && wizardValue !== appValue) {
      result.warnings.push(`Value mismatch: ${mapping.wizard} (${wizardValue}) ≠ ${mapping.app} (${appValue})`)
    }
  })

  return result
}

/**
 * Validates critical field preservation during app state → localStorage transfer  
 */
export function validateAppStateToStorageTransfer(
  appState: any,
  sessionState: any
): DataFlowValidationResult {
  const result: DataFlowValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    criticalFields: []
  }

  // Fields that should persist to localStorage
  const persistenceMappings = [
    { app: 'region', session: 'region', required: true },
    { app: 'avgNetFee', session: 'avgNetFee', required: true },
    { app: 'taxPrepReturns', session: 'taxPrepReturns', required: true },
    { app: 'expectedGrowthPct', session: 'expectedGrowthPct', required: false }, // NEW FIX
    { app: 'calculatedTotalExpenses', session: 'calculatedTotalExpenses', required: false }, // NEW FIX
    { app: 'otherIncome', session: 'otherIncome', required: false },
    { app: 'discountsPct', session: 'discountsPct', required: false },
    { app: 'taxRushReturns', session: 'taxRushReturns', required: false }
  ]

  persistenceMappings.forEach(mapping => {
    const appValue = appState?.[mapping.app]
    const sessionValue = sessionState?.[mapping.session]

    if (mapping.required && appValue === undefined) {
      result.issues.push(`Missing required field in app state: ${mapping.app}`)
      result.isValid = false
    }

    if (appValue !== undefined && sessionValue === undefined) {
      if (mapping.required) {
        result.issues.push(`Critical field will not persist: ${mapping.app} → ${mapping.session}`)
        result.isValid = false
        result.criticalFields.push(mapping.app)
      } else {
        result.warnings.push(`Field will not persist (data loss on reload): ${mapping.app}`)
      }
    }
  })

  return result
}

/**
 * Validates complete round-trip data integrity: wizard → app → storage → app
 */
export function validateRoundTripDataIntegrity(
  originalWizardData: any,
  finalAppState: any
): DataFlowValidationResult {
  const result: DataFlowValidationResult = {
    isValid: true,
    issues: [],
    warnings: [],
    criticalFields: []
  }

  // Critical fields that should survive the complete round trip
  const roundTripFields = [
    { field: 'region', critical: true },
    { field: 'avgNetFee', critical: true },
    { field: 'taxPrepReturns', critical: true },
    { field: 'expectedGrowthPct', critical: true }, // This was the main issue!
    { field: 'calculatedTotalExpenses', critical: true } // This was also getting lost!
  ]

  roundTripFields.forEach(({ field, critical }) => {
    const originalValue = originalWizardData?.[field]
    const finalValue = finalAppState?.[field]

    if (originalValue !== undefined && finalValue === undefined) {
      if (critical) {
        result.issues.push(`CRITICAL DATA LOSS: ${field} (${originalValue}) lost in round trip`)
        result.isValid = false
        result.criticalFields.push(field)
      } else {
        result.warnings.push(`Data loss: ${field} (${originalValue}) not preserved`)
      }
    } else if (originalValue !== undefined && finalValue !== undefined && originalValue !== finalValue) {
      result.warnings.push(`Data modified in round trip: ${field} ${originalValue} → ${finalValue}`)
    }
  })

  return result
}

/**
 * Logs validation results with appropriate console styling
 */
export function logValidationResult(
  validationName: string,
  result: DataFlowValidationResult
): void {
  const timestamp = new Date().toLocaleTimeString()

  if (result.isValid && result.warnings.length === 0) {
    console.log(
      `%c[${timestamp}] ✅ ${validationName}: PASSED`,
      'color: #059669; font-weight: bold;'
    )
  } else if (result.isValid && result.warnings.length > 0) {
    console.log(
      `%c[${timestamp}] ⚠️  ${validationName}: PASSED WITH WARNINGS`,
      'color: #f59e0b; font-weight: bold;'
    )
    result.warnings.forEach(warning => {
      console.log(`%c  • ${warning}`, 'color: #f59e0b;')
    })
  } else {
    console.log(
      `%c[${timestamp}] ❌ ${validationName}: FAILED`,
      'color: #dc2626; font-weight: bold;'
    )
    result.issues.forEach(issue => {
      console.log(`%c  • ${issue}`, 'color: #dc2626;')
    })
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`%c  • ${warning}`, 'color: #f59e0b;')
      })
    }
  }

  if (result.criticalFields.length > 0) {
    console.log(
      `%c  🚨 Critical fields affected: ${result.criticalFields.join(', ')}`,
      'color: #dc2626; font-weight: bold;'
    )
  }
}

/**
 * Quick validation helper for development debugging
 */
export function validateDataFlow(
  wizardData: any,
  appState: any,
  sessionData: any
): void {
  console.log('🔄 RUNNING DATA FLOW VALIDATION CHECKS...')

  const wizardToApp = validateWizardToAppStateTransfer(wizardData, appState)
  logValidationResult('Wizard → App State', wizardToApp)

  const appToStorage = validateAppStateToStorageTransfer(appState, sessionData)
  logValidationResult('App State → localStorage', appToStorage)

  const roundTrip = validateRoundTripDataIntegrity(wizardData, appState)
  logValidationResult('Round Trip Integrity', roundTrip)

  const totalIssues = wizardToApp.issues.length + appToStorage.issues.length + roundTrip.issues.length
  const totalWarnings = wizardToApp.warnings.length + appToStorage.warnings.length + roundTrip.warnings.length

  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('%c🎯 DATA FLOW VALIDATION: ALL CHECKS PASSED!', 'color: #059669; font-weight: bold; font-size: 14px;')
  } else if (totalIssues === 0) {
    console.log(`%c⚠️  DATA FLOW VALIDATION: ${totalWarnings} warnings found`, 'color: #f59e0b; font-weight: bold;')
  } else {
    console.log(`%c🚨 DATA FLOW VALIDATION: ${totalIssues} issues, ${totalWarnings} warnings`, 'color: #dc2626; font-weight: bold;')
  }
}
