// Wizard Types - Extracted from WizardShell.tsx for better modularity
// All interfaces and types used across wizard components

import type { Region } from '../../lib/calcs'
import type { ExpenseValues } from '../../types/expenses'

// Wizard step management
export type WizardStep = 'welcome' | 'inputs' | 'review'

// Comprehensive wizard answers including all fields
export interface WizardAnswers {
  // Basic info
  region: Region
  
  // Business performance (new fields)
  storeType?: 'new' | 'existing'
  
  // Last Year Performance - Complete breakdown (Page 1) - RESTRUCTURED for franchise UX
  lastYearGrossFees?: number // new field - what franchisee actually charged
  lastYearDiscountsAmt?: number // new field - dollar amount of discounts given
  lastYearDiscountsPct?: number // auto-calculated from amount/gross fees
  // lastYearTaxPrepIncome auto-calculated as grossFees - discountsAmt
  lastYearOtherIncome?: number
  lastYearTaxRushReturns?: number // for Canada
  lastYearExpenses?: number
  
  // Projected Performance - Complete breakdown (Page 1)
  expectedGrowthPct?: number
  expectedRevenue?: number // calculated total revenue or overridden
  projectedExpenses?: number // calculated or overridden
  
  // Income drivers (enhanced)
  avgNetFee?: number
  taxPrepReturns?: number
  taxRushReturns?: number // for Canada
  otherIncome?: number // new field for additional revenue streams
  discountsPct?: number
  
  // Projected values (for bidirectional wizard flow)
  projectedAvgNetFee?: number // manually adjusted projected value
  projectedTaxPrepReturns?: number // manually adjusted projected value
  
  // All 17 expense fields
  salariesPct?: number
  empDeductionsPct?: number
  rentPct?: number
  telephoneAmt?: number
  utilitiesAmt?: number
  localAdvAmt?: number
  insuranceAmt?: number
  postageAmt?: number
  suppliesPct?: number
  duesAmt?: number
  bankFeesAmt?: number
  maintenanceAmt?: number
  travelEntAmt?: number
  royaltiesPct?: number
  advRoyaltiesPct?: number
  taxRushRoyaltiesPct?: number
  miscPct?: number
  
  // Derived expense values for export
  expenses?: ExpenseValues
}

// Growth options for the performance change dropdown
export interface GrowthOption {
  value: number
  label: string
}

// Props for wizard shell
export interface WizardShellProps {
  region: Region
  setRegion: (region: Region) => void
  onComplete: (answers: WizardAnswers) => void
  onCancel: () => void
}

// Props for individual wizard sections
export interface WizardSectionProps {
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  region: Region
}

// Strategic analysis calculation results
export interface PerformanceAnalysis {
  actualRevenue: number
  targetRevenue: number
  variance: number
}

// Adjustment status for strategic analysis
export interface AdjustmentStatus {
  hasAdjustments: boolean
  avgNetFeeStatus?: string
  taxPrepReturnsStatus?: string
}
