// useCalculations.ts - Extract calculation logic from App.tsx
// Handles all P&L calculations and KPI status determination

import { useMemo } from 'react'
import { 
  calc, 
  statusForCPR, 
  statusForMargin, 
  statusForNetIncome,
  type Inputs,
  type Results,
  type Thresholds 
} from '../lib/calcs'

export interface CalculationInputs {
  // Basic fields
  region: 'US' | 'CA'
  scenario: string
  avgNetFee: number
  taxPrepReturns: number
  taxRushReturns: number
  discountsPct: number
  otherIncome: number
  
  // Pre-calculated expense total from Page 2 (overrides field-based calculation)
  calculatedTotalExpenses?: number
  
  // All 17 expense fields
  salariesPct: number
  empDeductionsPct: number
  rentPct: number
  telephoneAmt: number
  utilitiesAmt: number
  localAdvAmt: number
  insuranceAmt: number
  postageAmt: number
  suppliesPct: number
  duesAmt: number
  bankFeesAmt: number
  maintenanceAmt: number
  travelEntAmt: number
  royaltiesPct: number
  advRoyaltiesPct: number
  taxRushRoyaltiesPct: number
  miscPct: number
  
  thresholds: Thresholds
}

export interface CalculationResults extends Results {
  // KPI statuses
  cprStatus: 'green' | 'yellow' | 'red'
  nimStatus: 'green' | 'yellow' | 'red'
  niStatus: 'green' | 'yellow' | 'red'
}

export function useCalculations(inputs: CalculationInputs): CalculationResults {
  // Prepare inputs for calculation engine
  const calcInputs: Inputs = useMemo(
    () => ({
      region: inputs.region,
      scenario: inputs.scenario as any,
      avgNetFee: inputs.avgNetFee,
      taxPrepReturns: inputs.taxPrepReturns,
      taxRushReturns: inputs.taxRushReturns,
      discountsPct: inputs.discountsPct,
      otherIncome: inputs.otherIncome,
      calculatedTotalExpenses: inputs.calculatedTotalExpenses,
      
      // All 17 expense fields
      salariesPct: inputs.salariesPct,
      empDeductionsPct: inputs.empDeductionsPct,
      rentPct: inputs.rentPct,
      telephoneAmt: inputs.telephoneAmt,
      utilitiesAmt: inputs.utilitiesAmt,
      localAdvAmt: inputs.localAdvAmt,
      insuranceAmt: inputs.insuranceAmt,
      postageAmt: inputs.postageAmt,
      suppliesPct: inputs.suppliesPct,
      duesAmt: inputs.duesAmt,
      bankFeesAmt: inputs.bankFeesAmt,
      maintenanceAmt: inputs.maintenanceAmt,
      travelEntAmt: inputs.travelEntAmt,
      royaltiesPct: inputs.royaltiesPct,
      advRoyaltiesPct: inputs.advRoyaltiesPct,
      taxRushRoyaltiesPct: inputs.taxRushRoyaltiesPct,
      miscPct: inputs.miscPct,
      
      thresholds: inputs.thresholds,
    }),
    [
      inputs.region, inputs.scenario, inputs.avgNetFee, inputs.taxPrepReturns, inputs.taxRushReturns,
      inputs.discountsPct, inputs.otherIncome, inputs.calculatedTotalExpenses, inputs.salariesPct, inputs.empDeductionsPct, inputs.rentPct, 
      inputs.telephoneAmt, inputs.utilitiesAmt, inputs.localAdvAmt, inputs.insuranceAmt, 
      inputs.postageAmt, inputs.suppliesPct, inputs.duesAmt, inputs.bankFeesAmt,
      inputs.maintenanceAmt, inputs.travelEntAmt, inputs.royaltiesPct, inputs.advRoyaltiesPct, 
      inputs.taxRushRoyaltiesPct, inputs.miscPct, inputs.thresholds,
    ]
  )

  // Run calculations
  const results = useMemo(() => calc(calcInputs), [calcInputs])

  // Calculate KPI statuses
  const cprStatus = useMemo(() => statusForCPR(results.costPerReturn, inputs.thresholds), [results.costPerReturn, inputs.thresholds])
  const nimStatus = useMemo(() => statusForMargin(results.netMarginPct, inputs.thresholds), [results.netMarginPct, inputs.thresholds])
  const niStatus = useMemo(() => statusForNetIncome(results.netIncome, inputs.thresholds), [results.netIncome, inputs.thresholds])

  return {
    ...results,
    cprStatus,
    nimStatus,
    niStatus,
  }
}

// Helper function for KPI CSS classes
export function getKpiClass(status: 'green' | 'yellow' | 'red'): string {
  return `kpi ${status}`
}

// Currency formatting helper
export const currency = (n: number) => {
  if (typeof n !== 'number' || isNaN(n)) return '$0.00'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

// Percentage formatting helper  
export const pct = (n: number) => {
  if (typeof n !== 'number' || isNaN(n)) return '0.0%'
  return n.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'
}
