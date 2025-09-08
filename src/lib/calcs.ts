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
  otherIncome?: number // Other revenue streams (bookkeeping, notary, etc.)
  discountsPct: number
  
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
  totalRevenue: number // Tax prep income + other income sources
  
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
  // 🐛 DEBUG: Log key calculations for debugging
  const taxRush = inputs.region==='CA' ? inputs.taxRushReturns : 0
  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns
  const discounts = grossFees * (inputs.discountsPct/100)
  const taxPrepIncome = grossFees - discounts
  
  // Calculate total revenue including all income sources
  const taxRushIncome = inputs.region === 'CA' ? (inputs.avgNetFee * taxRush) : 0
  const otherIncome = inputs.otherIncome || 0
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome
  
  // 🔧 CURSOR TERMINAL DEBUG - This will show in Cursor's terminal
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
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
  const taxRushRoyalties = inputs.region === 'CA' ? 
    taxPrepIncome * (inputs.taxRushRoyaltiesPct/100) : 0
  
  // Miscellaneous
  const misc = grossFees * (inputs.miscPct/100)
  
  // Calculate totals
  const totalExpenses = 
    salaries + empDeductions + 
    rent + telephone + utilities +
    localAdv + insurance + postage + supplies + dues + bankFees + maintenance + travelEnt +
    royalties + advRoyalties + taxRushRoyalties +
    misc
    
  const netIncome = totalRevenue - totalExpenses
  const totalReturns = inputs.taxPrepReturns + taxRush
  const costPerReturn = totalReturns > 0 ? totalExpenses/totalReturns : 0
  const netMarginPct = totalRevenue !== 0 ? (netIncome/totalRevenue)*100 : 0
  
  console.log('🧮 FINAL RESULTS:', {
    totalRevenue,
    totalExpenses,
    netIncome,
    netMarginPct: `${netMarginPct.toFixed(1)}%`
  })
  
  return { 
    grossFees, discounts, taxPrepIncome, totalRevenue,
    salaries, empDeductions,
    rent, telephone, utilities,
    localAdv, insurance, postage, supplies, dues, bankFees, maintenance, travelEnt,
    royalties, advRoyalties, taxRushRoyalties,
    misc,
    totalExpenses, netIncome, totalReturns, costPerReturn, netMarginPct 
  }
}
export type Light = 'green'|'yellow'|'red'
export function statusForCPR(v:number, t:Thresholds):Light{
  if (v <= t.cprGreen) return 'green'
  if (v <= t.cprYellow) return 'yellow'
  return 'red'
}
export function statusForMargin(v:number, t:Thresholds):Light{
  if (v >= t.nimGreen) return 'green'
  if (v >= t.nimYellow) return 'yellow'
  return 'red'
}
export function statusForNetIncome(v:number, t:Thresholds):Light{
  if (v >= 0) return 'green'
  if (v <= t.netIncomeWarn) return 'red'
  return 'yellow'
}
