// Wizard Calculations - Extracted calculation utilities for wizard components
// Business logic and calculation helpers

import type { WizardAnswers, PerformanceAnalysis, AdjustmentStatus, GrowthOption } from './types'

// Growth options for the performance change dropdown
export const GROWTH_OPTIONS: GrowthOption[] = [
  { value: -10, label: 'Decline: -10%' },
  { value: -5, label: 'Decline: -5%' },
  { value: 0, label: 'No Change: 0%' },
  { value: 5, label: 'Growth: +5%' },
  { value: 10, label: 'Growth: +10%' },
  { value: 15, label: 'Growth: +15%' },
  { value: 20, label: 'Growth: +20%' }
]

// Calculate field growth percentage
export const calculateFieldGrowth = (currentValue: number, originalValue: number): number => {
  if (!originalValue || originalValue === 0) return 0
  return Math.round(((currentValue - originalValue) / originalValue) * 100)
}

// Get adjustment status for strategic analysis
export const getAdjustmentStatus = (answers: WizardAnswers): AdjustmentStatus => {
  const adjustments = []
  
  // Check Average Net Fee adjustments
  if (answers.projectedAvgNetFee !== undefined && answers.avgNetFee) {
    const actualGrowth = calculateFieldGrowth(answers.projectedAvgNetFee, answers.avgNetFee)
    const expectedGrowth = answers.expectedGrowthPct || 0
    if (Math.abs(actualGrowth - expectedGrowth) > 1) {
      adjustments.push({
        field: 'Average Net Fee',
        actualGrowth,
        expectedGrowth,
        variance: actualGrowth - expectedGrowth
      })
    }
  }
  
  // Check Tax Prep Returns adjustments
  if (answers.projectedTaxPrepReturns !== undefined && answers.taxPrepReturns) {
    const actualGrowth = calculateFieldGrowth(answers.projectedTaxPrepReturns, answers.taxPrepReturns)
    const expectedGrowth = answers.expectedGrowthPct || 0
    if (Math.abs(actualGrowth - expectedGrowth) > 1) {
      adjustments.push({
        field: 'Tax Prep Returns',
        actualGrowth,
        expectedGrowth,
        variance: actualGrowth - expectedGrowth
      })
    }
  }
  
  return {
    hasAdjustments: adjustments.length > 0,
    avgNetFeeStatus: adjustments.find(a => a.field === 'Average Net Fee')?.actualGrowth !== undefined
      ? `Average Net Fee: ${adjustments.find(a => a.field === 'Average Net Fee')?.actualGrowth}% growth (${adjustments.find(a => a.field === 'Average Net Fee')?.variance! > 0 ? '+' : ''}${adjustments.find(a => a.field === 'Average Net Fee')?.variance}% vs ${adjustments.find(a => a.field === 'Average Net Fee')?.expectedGrowth}% plan)`
      : undefined,
    taxPrepReturnsStatus: adjustments.find(a => a.field === 'Tax Prep Returns')?.actualGrowth !== undefined
      ? `Tax Prep Returns: ${adjustments.find(a => a.field === 'Tax Prep Returns')?.actualGrowth}% growth (${adjustments.find(a => a.field === 'Tax Prep Returns')?.variance! > 0 ? '+' : ''}${adjustments.find(a => a.field === 'Tax Prep Returns')?.variance}% vs ${adjustments.find(a => a.field === 'Tax Prep Returns')?.expectedGrowth}% plan)`
      : undefined
  }
}

// Calculate blended growth from individual field adjustments
export const calculateBlendedGrowth = (answers: WizardAnswers): number => {
  if (!answers.avgNetFee || !answers.taxPrepReturns) return answers.expectedGrowthPct || 0
  
  // Calculate actual projected values
  const actualAvgNetFee = answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
    answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
  const actualTaxPrepReturns = answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
    answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
  
  // Calculate what the TARGET should be (expectedGrowthPct growth on both)
  const targetAvgNetFee = answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
  const targetTaxPrepReturns = answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
  
  // Compare ACTUAL performance vs TARGET performance
  const targetRevenue = targetAvgNetFee * targetTaxPrepReturns
  const actualRevenue = actualAvgNetFee * actualTaxPrepReturns
  const originalRevenue = answers.avgNetFee * answers.taxPrepReturns
  
  if (originalRevenue > 0) {
    // Return actual growth vs baseline (for display)
    return Math.round(((actualRevenue - originalRevenue) / originalRevenue) * 100)
  }
  
  return answers.expectedGrowthPct || 0
}

// Calculate performance vs target for strategic analysis
export const calculatePerformanceVsTarget = (answers: WizardAnswers): PerformanceAnalysis => {
  if (!answers.avgNetFee || !answers.taxPrepReturns) {
    return { actualRevenue: 0, targetRevenue: 0, variance: 0 }
  }
  
  const actualAvgNetFee = answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
    answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
  const actualTaxPrepReturns = answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
    answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
  
  const targetAvgNetFee = answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
  const targetTaxPrepReturns = answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
  
  const actualRevenue = actualAvgNetFee * actualTaxPrepReturns
  const targetRevenue = targetAvgNetFee * targetTaxPrepReturns
  const variance = ((actualRevenue - targetRevenue) / targetRevenue) * 100
  
  return { actualRevenue, targetRevenue, variance }
}

// Calculate expected revenue from components (for existing stores)
export const calculateExpectedRevenue = (answers: WizardAnswers): number | undefined => {
  if (!answers.avgNetFee || !answers.taxPrepReturns || answers.expectedGrowthPct === undefined) {
    return undefined
  }
  
  // Apply growth to COMPONENTS (same as Page 2)
  const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
  const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
  
  // Calculate projected gross fees from components
  const projectedGrossFees = projectedAvgNetFee * projectedTaxPrepReturns
  
  // Apply discounts to get net tax prep revenue
  const discountsPct = answers.lastYearDiscountsPct || 3
  const projectedDiscountAmt = projectedGrossFees * (discountsPct / 100)
  const projectedTaxPrepIncome = projectedGrossFees - projectedDiscountAmt
  
  // Add other revenue sources with growth
  const lastYearOtherIncome = answers.lastYearOtherIncome || 0
  const projectedOtherIncome = lastYearOtherIncome * (1 + answers.expectedGrowthPct / 100)
  
  const lastYearTaxRushIncome = answers.region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns 
    ? answers.avgNetFee * answers.lastYearTaxRushReturns 
    : 0
  const projectedTaxRushIncome = lastYearTaxRushIncome * (1 + answers.expectedGrowthPct / 100)
  
  // Calculate total revenue (should match Page 2)
  return projectedTaxPrepIncome + projectedOtherIncome + projectedTaxRushIncome
}

// Calculate gross fees for display
export const calculateGrossFees = (answers: WizardAnswers): number => {
  if (!answers.avgNetFee || !answers.taxPrepReturns) return 0
  
  if (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined) {
    // Existing store: apply growth
    const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
    const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
    return Math.round(projectedAvgNetFee * projectedTaxPrepReturns)
  } else {
    // New store: direct calculation
    return Math.round(answers.avgNetFee * answers.taxPrepReturns)
  }
}

// Calculate industry standard expenses (76% of gross fees)
export const calculateStandardExpenses = (answers: WizardAnswers): number => {
  const grossFees = calculateGrossFees(answers)
  return Math.round(grossFees * 0.76)
}

// Calculate net income for new stores
export const calculateNetIncome = (answers: WizardAnswers): number => {
  if (!answers.avgNetFee || !answers.taxPrepReturns) return 0
  
  const grossFees = answers.avgNetFee * answers.taxPrepReturns
  const expenses = grossFees * 0.76
  return Math.round(grossFees - expenses)
}

// Parse currency input (remove commas and dollar signs)
export const parseCurrencyInput = (value: string): number | undefined => {
  const rawValue = value.replace(/[,$]/g, '')
  const parsedValue = parseFloat(rawValue)
  return isNaN(parsedValue) ? undefined : parsedValue
}

// Format currency for display
export const formatCurrency = (value: number | undefined): string => {
  return value ? value.toLocaleString() : ''
}
