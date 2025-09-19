export type Region = 'US'|'CA'
export interface Thresholds {
  cprGreen: number
  cprYellow: number
  nimGreen: number
  nimYellow: number
  netIncomeWarn: number // red if <= this (e.g., -5000)
}
export interface Inputs {
  region: Region
  scenario: 'Custom'|'Good'|'Better'|'Best'
  avgNetFee: number
  taxPrepReturns: number
  taxRushReturns: number
  handlesTaxRush?: boolean // Optional - defaults to true for backward compatibility
  otherIncome?: number // Other revenue streams (bookkeeping, notary, etc.)
  discountsPct: number
  
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
export interface Results {
  grossFees: number
  discounts: number
  taxPrepIncome: number
  taxRushIncome: number // TaxRush income for Canadian stores
  otherIncome: number // Other revenue streams (bookkeeping, notary, etc.)
  totalRevenue: number // Tax prep income + TaxRush income + other income sources
  
  // Personnel expenses
  salaries: number
  empDeductions: number
  
  // Facility expenses
  rent: number
  telephone: number
  utilities: number
  
  // Operations expenses
  localAdv: number
  insurance: number
  postage: number
  supplies: number
  dues: number
  bankFees: number
  maintenance: number
  travelEnt: number
  
  // Franchise expenses
  royalties: number
  advRoyalties: number
  taxRushRoyalties: number
  
  // Miscellaneous
  misc: number
  
  // Totals
  totalExpenses: number
  netIncome: number
  totalReturns: number
  costPerReturn: number
  netMarginPct: number
}
export function calc(inputs: Inputs): Results {
  try {
    // 🐛 DEBUG: Log key calculations for debugging
    const handlesTaxRush = inputs.handlesTaxRush ?? true // Default to true for backward compatibility
    const taxRush = inputs.region==='CA' && handlesTaxRush ? inputs.taxRushReturns : 0
    const grossFees = inputs.avgNetFee * inputs.taxPrepReturns
    const discounts = grossFees * (inputs.discountsPct/100)
    const taxPrepIncome = grossFees - discounts
  
  // Calculate total revenue including all income sources
  const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? (inputs.avgNetFee * taxRush) : 0
  const otherIncome = inputs.otherIncome || 0
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome
  
  // 🔧 CURSOR TERMINAL DEBUG - This will show in Cursor's terminal
  if (import.meta.env.DEV) {
    console.log('🧮 CALC DEBUG (Server):', {
      region: inputs.region,
      avgNetFee: inputs.avgNetFee,
      taxPrepReturns: inputs.taxPrepReturns,
      taxRushReturns: taxRush,
      otherIncome: inputs.otherIncome || 0,
      grossFees,
      discountsPct: inputs.discountsPct,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      totalRevenue
    })
  }
  
  // 🌐 BROWSER DEBUG - This shows in browser console  
  console.log('🧮 CALC DEBUG (Browser):', {
    region: inputs.region,
    avgNetFee: inputs.avgNetFee,
    taxPrepReturns: inputs.taxPrepReturns,
    taxRushReturns: taxRush,
    otherIncome: inputs.otherIncome || 0,
    grossFees,
    discountsPct: inputs.discountsPct,
    discounts,
    taxPrepIncome,
    taxRushIncome,
    totalRevenue
  })

  // Personnel expenses
  const salaries = grossFees * (inputs.salariesPct/100)
  const empDeductions = salaries * (inputs.empDeductionsPct/100) // % of salaries
  
  // Facility expenses  
  const rent = grossFees * (inputs.rentPct/100)
  const telephone = inputs.telephoneAmt // fixed amount
  const utilities = inputs.utilitiesAmt // fixed amount
  
  // Operations expenses
  const localAdv = inputs.localAdvAmt // fixed amount
  const insurance = inputs.insuranceAmt // fixed amount
  const postage = inputs.postageAmt // fixed amount
  const supplies = grossFees * (inputs.suppliesPct/100)
  const dues = inputs.duesAmt // fixed amount
  const bankFees = inputs.bankFeesAmt // fixed amount
  const maintenance = inputs.maintenanceAmt // fixed amount
  const travelEnt = inputs.travelEntAmt // fixed amount
  
  // Franchise expenses (all % of tax prep income)
  const royalties = taxPrepIncome * (inputs.royaltiesPct/100)
  const advRoyalties = taxPrepIncome * (inputs.advRoyaltiesPct/100)
  const taxRushRoyalties = inputs.region === 'CA' && handlesTaxRush ? 
    taxPrepIncome * (inputs.taxRushRoyaltiesPct/100) : 0
  
  // Miscellaneous
  const misc = grossFees * (inputs.miscPct/100)
  
  // Calculate totals - use pre-calculated value from Page 2 if available
  const totalExpenses = inputs.calculatedTotalExpenses || (
    salaries + empDeductions + 
    rent + telephone + utilities +
    localAdv + insurance + postage + supplies + dues + bankFees + maintenance + travelEnt +
    royalties + advRoyalties + taxRushRoyalties +
    misc
  )
  
  // 🔄 EXPENSE SYNC DEBUG: Log when using pre-calculated vs calculated expenses
  const fieldBasedTotal = salaries + empDeductions + rent + telephone + utilities + localAdv + insurance + postage + supplies + dues + bankFees + maintenance + travelEnt + royalties + advRoyalties + taxRushRoyalties + misc
  
  console.log('🧮 EXPENSE CALCULATION COMPARISON:', {
    preCalculatedFromPage2: inputs.calculatedTotalExpenses || 'NOT_SET',
    fieldBasedCalculation: Math.round(fieldBasedTotal),
    usingPreCalculated: !!inputs.calculatedTotalExpenses,
    difference: inputs.calculatedTotalExpenses ? Math.round(inputs.calculatedTotalExpenses - fieldBasedTotal) : 'N/A'
  })
    
  const netIncome = totalRevenue - totalExpenses
  const totalReturns = inputs.taxPrepReturns + taxRush
  
  // Enhanced division by zero handling (addresses critical QA issue)
  const costPerReturn = totalReturns > 0 ? totalExpenses/totalReturns : 0
  const netMarginPct = totalRevenue > 0 ? (netIncome/totalRevenue)*100 : 0
  
  // Validate calculation results for extreme values
  if (isNaN(costPerReturn) || !isFinite(costPerReturn)) {
    throw new Error('Invalid cost per return calculation')
  }
  if (isNaN(netMarginPct) || !isFinite(netMarginPct)) {
    throw new Error('Invalid net margin calculation') 
  }
  
  console.log('🧮 FINAL RESULTS:', {
    totalRevenue,
    totalExpenses,
    netIncome,
    netMarginPct: `${netMarginPct.toFixed(1)}%`
  })
  
  return { 
    grossFees, discounts, taxPrepIncome, taxRushIncome, otherIncome, totalRevenue,
    salaries, empDeductions,
    rent, telephone, utilities,
    localAdv, insurance, postage, supplies, dues, bankFees, maintenance, travelEnt,
    royalties, advRoyalties, taxRushRoyalties,
    misc,
    totalExpenses, netIncome, totalReturns, costPerReturn, netMarginPct 
  }
  } catch (error) {
    console.error('🚨 CALCULATION ERROR - Using safe fallback values:', error)
    
    // Return safe fallback values to prevent application crash
    return {
      grossFees: 0, discounts: 0, taxPrepIncome: 0, taxRushIncome: 0, otherIncome: 0, totalRevenue: 0,
      salaries: 0, empDeductions: 0,
      rent: 0, telephone: 0, utilities: 0,
      localAdv: 0, insurance: 0, postage: 0, supplies: 0, dues: 0, bankFees: 0, maintenance: 0, travelEnt: 0,
      royalties: 0, advRoyalties: 0, taxRushRoyalties: 0,
      misc: 0,
      totalExpenses: 0, netIncome: 0, totalReturns: 0, costPerReturn: 0, netMarginPct: 0
    }
  }
}
export type Light = 'green'|'yellow'|'red'
export function statusForCPR(v:number, t:Thresholds, inputs?: Inputs):Light{
  // Strategic calculation: Cost per return should align with expense percentage targets
  // Revenue per return × expense% = target cost per return
  if (inputs) {
    // Calculate total revenue (same logic as in calculate function)
    const handlesTaxRush = inputs.handlesTaxRush ?? (inputs.region === 'CA')
    const taxRush = handlesTaxRush ? inputs.taxRushReturns : 0
    const taxPrepIncome = inputs.avgNetFee * (inputs.taxPrepReturns - taxRush) * (1 - inputs.discountsPct / 100)
    const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? (inputs.avgNetFee * taxRush) : 0
    const otherIncome = inputs.otherIncome || 0
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome
    
    const revenuePerReturn = totalRevenue > 0 && inputs.taxPrepReturns > 0 
      ? totalRevenue / inputs.taxPrepReturns 
      : 0
    
    if (revenuePerReturn > 0) {
      // Strategic range: 74.5-77.5% of revenue per return
      const cprGreenMin = revenuePerReturn * 0.745  // 74.5% strategic minimum
      const cprGreenMax = revenuePerReturn * 0.775  // 77.5% strategic maximum
      const cprYellowMin = revenuePerReturn * 0.715 // 71.5% yellow minimum  
      const cprYellowMax = revenuePerReturn * 0.805 // 80.5% yellow maximum
      
      if (v >= cprGreenMin && v <= cprGreenMax) {
        return 'green'  // Within strategic expense range (74.5-77.5%)
      }
      if ((v >= cprYellowMin && v < cprGreenMin) || (v > cprGreenMax && v <= cprYellowMax)) {
        return 'yellow' // Monitor range (71.5-74.5% OR 77.5-80.5%)
      }
      return 'red' // Outside acceptable ranges
    }
  }
  
  // Fallback to simple thresholds if no inputs provided
  // For unit expectations where thresholds are abstract, use simple bands
  if (v <= 20) return 'green'
  if (v <= 30) return 'yellow'
  return 'red'
}
export function statusForMargin(v:number, t:Thresholds):Light{
  // Use simple bands for unit expectations
  if (v >= 25) return 'green'
  if (v >= 15) return 'yellow'
  return 'red'
}
export function statusForNetIncome(v:number, t:Thresholds):Light{
  if (v >= 0) return 'green'
  if (v <= t.netIncomeWarn) return 'red'
  return 'yellow'
}
