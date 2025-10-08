/**
 * Centralized Suggestion Engine
 * Provides contextual suggestions that demonstrate calculation flow
 */

import { Region } from '../types'
import { WizardAnswers } from '../components/Wizard/types'
import { expenseFields } from '../types/expenses'

export interface SuggestionProfile {
  name: string
  description: string
  region: Region
  storeType: 'new' | 'existing'
  handlesTaxRush?: boolean
  
  // Core financial inputs
  avgNetFee: number
  taxPrepReturns: number
  discountsPct: number
  
  // TaxRush specific (Canada only)
  taxRushReturns?: number
  taxRushAvgNetFee?: number
  
  // Other income
  otherIncome?: number
  
  // Growth expectations (existing stores only)
  expectedGrowthPct?: number
  
  // Expense profiles (17 categories)
  expenses: {
    [K in typeof expenseFields[number]['id']]: number
  }
}

// Regional suggestion profiles
export const suggestionProfiles: { [key: string]: SuggestionProfile } = {
  // Canada profiles
  'CA-new-standard': {
    name: 'Canada - New Store (Standard)',
    description: 'Typical new Canadian franchise without TaxRush',
    region: 'CA',
    storeType: 'new',
    handlesTaxRush: false,
    avgNetFee: 125,
    taxPrepReturns: 1500,
    discountsPct: 3.5,
    otherIncome: 2000,
    expenses: {
      salariesPct: 28,
      empDeductionsPct: 10,
      rentPct: 20,
      telephoneAmt: 250,
      utilitiesAmt: 350,
      localAdvAmt: 600,
      insuranceAmt: 180,
      postageAmt: 120,
      suppliesPct: 4.0,
      duesAmt: 250,
      bankFeesAmt: 120,
      maintenanceAmt: 180,
      travelEntAmt: 200,
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: 0,
      miscPct: 2.5
    }
  },

  'CA-new-taxrush': {
    name: 'Canada - New Store (TaxRush)',
    description: 'New Canadian franchise implementing TaxRush',
    region: 'CA',
    storeType: 'new',
    handlesTaxRush: true,
    avgNetFee: 130,
    taxPrepReturns: 1600,
    taxRushReturns: 240, // ~15% of tax prep returns
    taxRushAvgNetFee: 85,
    discountsPct: 3.0,
    otherIncome: 2500,
    expenses: {
      salariesPct: 26,
      empDeductionsPct: 10,
      rentPct: 18,
      telephoneAmt: 250,
      utilitiesAmt: 350,
      localAdvAmt: 700,
      insuranceAmt: 180,
      postageAmt: 120,
      suppliesPct: 3.8,
      duesAmt: 250,
      bankFeesAmt: 120,
      maintenanceAmt: 180,
      travelEntAmt: 200,
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: 6,
      miscPct: 2.0
    }
  },

  'CA-existing-good': {
    name: 'Canada - Existing Store (Good)',
    description: 'Established Canadian franchise - good performance',
    region: 'CA',
    storeType: 'existing',
    handlesTaxRush: true,
    avgNetFee: 135,
    taxPrepReturns: 1750,
    taxRushReturns: 300,
    taxRushAvgNetFee: 90,
    discountsPct: 2.8,
    otherIncome: 3500,
    expectedGrowthPct: 8,
    expenses: {
      salariesPct: 24,
      empDeductionsPct: 10,
      rentPct: 17,
      telephoneAmt: 220,
      utilitiesAmt: 320,
      localAdvAmt: 550,
      insuranceAmt: 160,
      postageAmt: 100,
      suppliesPct: 3.2,
      duesAmt: 220,
      bankFeesAmt: 110,
      maintenanceAmt: 160,
      travelEntAmt: 200,
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: 6,
      miscPct: 1.8
    }
  },

  // US profiles  
  'US-new-standard': {
    name: 'US - New Store (Standard)',
    description: 'Typical new US franchise',
    region: 'US',
    storeType: 'new',
    handlesTaxRush: false,
    avgNetFee: 120,
    taxPrepReturns: 1400,
    discountsPct: 4.0,
    otherIncome: 1800,
    expenses: {
      salariesPct: 30,
      empDeductionsPct: 12,
      rentPct: 22,
      telephoneAmt: 200,
      utilitiesAmt: 280,
      localAdvAmt: 500,
      insuranceAmt: 150,
      postageAmt: 100,
      suppliesPct: 4.2,
      duesAmt: 200,
      bankFeesAmt: 100,
      maintenanceAmt: 150,
      travelEntAmt: 180,
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: 0,
      miscPct: 3.0
    }
  },

  'US-existing-good': {
    name: 'US - Existing Store (Good)',
    description: 'Established US franchise - good performance',
    region: 'US',
    storeType: 'existing',
    handlesTaxRush: false,
    avgNetFee: 130,
    taxPrepReturns: 1650,
    discountsPct: 3.2,
    otherIncome: 2800,
    expectedGrowthPct: 6,
    expenses: {
      salariesPct: 26,
      empDeductionsPct: 11,
      rentPct: 19,
      telephoneAmt: 180,
      utilitiesAmt: 250,
      localAdvAmt: 450,
      insuranceAmt: 140,
      postageAmt: 90,
      suppliesPct: 3.6,
      duesAmt: 180,
      bankFeesAmt: 90,
      maintenanceAmt: 140,
      travelEntAmt: 160,
      royaltiesPct: 14,
      advRoyaltiesPct: 5,
      taxRushRoyaltiesPct: 0,
      miscPct: 2.2
    }
  }
}

/**
 * Calculate suggested values that demonstrate calculation flow
 */
export interface CalculatedSuggestions {
  // Input fields
  avgNetFee: number
  taxPrepReturns: number
  discountsPct: number
  taxRushReturns: number
  taxRushAvgNetFee: number
  otherIncome: number
  
  // Calculated revenue fields (show flow)
  grossFees: number
  discountAmount: number
  taxPrepIncome: number
  taxRushIncome: number
  totalRevenue: number
  
  // Calculated expense fields (show impact)
  totalExpenses: number
  netIncome: number
  
  // Individual expense suggestions
  expenses: { [key: string]: number }
}

export function calculateSuggestions(
  profile: SuggestionProfile, 
  currentAnswers?: Partial<WizardAnswers>
): CalculatedSuggestions {
  
  // Use current user inputs if available, otherwise profile defaults
  const avgNetFee = currentAnswers?.avgNetFee ?? profile.avgNetFee
  const taxPrepReturns = currentAnswers?.taxPrepReturns ?? profile.taxPrepReturns
  const discountsPct = currentAnswers?.discountsPct ?? profile.discountsPct
  const otherIncome = currentAnswers?.otherIncome ?? profile.otherIncome ?? 0
  
  // TaxRush calculations
  const taxRushReturns = profile.handlesTaxRush 
    ? (currentAnswers?.taxRushReturns ?? profile.taxRushReturns ?? 0)
    : 0
  const taxRushAvgNetFee = profile.handlesTaxRush
    ? (currentAnswers?.taxRushAvgNetFee ?? profile.taxRushAvgNetFee ?? 0)
    : 0
  
  // Calculate flow: inputs → calculations → results
  const grossFees = avgNetFee * taxPrepReturns
  const discountAmount = grossFees * (discountsPct / 100)
  const taxPrepIncome = grossFees - discountAmount
  const taxRushIncome = taxRushReturns * taxRushAvgNetFee
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome
  
  // Calculate expense suggestions based on profile
  const expenses: { [key: string]: number } = {}
  let totalExpenses = 0
  
  expenseFields.forEach(field => {
    const profileValue = profile.expenses[field.id as keyof typeof profile.expenses]
    
    switch (field.calculationBase) {
      case 'percentage_gross':
        expenses[field.id] = grossFees * (profileValue / 100)
        break
      case 'percentage_tp_income':
        expenses[field.id] = taxPrepIncome * (profileValue / 100)
        break
      case 'percentage_salaries':
        const salaryBase = grossFees * (profile.expenses.salariesPct / 100)
        expenses[field.id] = salaryBase * (profileValue / 100)
        break
      case 'fixed_amount':
        expenses[field.id] = profileValue
        break
    }
    
    totalExpenses += expenses[field.id]
  })
  
  const netIncome = totalRevenue - totalExpenses
  
  return {
    avgNetFee,
    taxPrepReturns,
    discountsPct,
    taxRushReturns,
    taxRushAvgNetFee,
    otherIncome,
    grossFees: Math.round(grossFees),
    discountAmount: Math.round(discountAmount),
    taxPrepIncome: Math.round(taxPrepIncome),
    taxRushIncome: Math.round(taxRushIncome),
    totalRevenue: Math.round(totalRevenue),
    totalExpenses: Math.round(totalExpenses),
    netIncome: Math.round(netIncome),
    expenses
  }
}

/**
 * Get appropriate suggestion profile based on context
 */
export function getSuggestionProfile(
  region: Region,
  storeType: 'new' | 'existing',
  handlesTaxRush: boolean = false
): SuggestionProfile {
  
  if (region === 'CA') {
    if (storeType === 'new') {
      return handlesTaxRush ? suggestionProfiles['CA-new-taxrush'] : suggestionProfiles['CA-new-standard']
    } else {
      return suggestionProfiles['CA-existing-good']
    }
  } else {
    if (storeType === 'new') {
      return suggestionProfiles['US-new-standard']
    } else {
      return suggestionProfiles['US-existing-good']
    }
  }
}

/**
 * Format suggestion for display
 */
export function formatSuggestion(value: number, type: 'currency' | 'number' | 'percentage'): string {
  switch (type) {
    case 'currency':
      return value.toLocaleString()
    case 'number':
      return value.toLocaleString()
    case 'percentage':
      return value.toFixed(1)
    default:
      return value.toString()
  }
}
