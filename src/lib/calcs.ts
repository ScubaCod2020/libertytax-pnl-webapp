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
  discountsPct: number
  salariesPct: number
  rentPct: number
  suppliesPct: number
  royaltiesPct: number
  advRoyaltiesPct: number
  miscPct: number
  thresholds: Thresholds
}
export interface Results {
  grossFees: number
  discounts: number
  taxPrepIncome: number
  salaries: number
  rent: number
  supplies: number
  royalties: number
  advRoyalties: number
  misc: number
  totalExpenses: number
  netIncome: number
  totalReturns: number
  costPerReturn: number
  netMarginPct: number
}
export function calc(inputs: Inputs): Results {
  const taxRush = inputs.region==='CA' ? inputs.taxRushReturns : 0
  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns
  const discounts = grossFees * (inputs.discountsPct/100)
  const taxPrepIncome = grossFees - discounts
  const salaries = grossFees * (inputs.salariesPct/100)
  const rent = grossFees * (inputs.rentPct/100)
  const supplies = grossFees * (inputs.suppliesPct/100)
  const royalties = taxPrepIncome * (inputs.royaltiesPct/100)
  const advRoyalties = taxPrepIncome * (inputs.advRoyaltiesPct/100)
  const misc = taxPrepIncome * (inputs.miscPct/100)
  const totalExpenses = salaries+rent+supplies+royalties+advRoyalties+misc
  const netIncome = taxPrepIncome - totalExpenses
  const totalReturns = inputs.taxPrepReturns + taxRush
  const denom = Math.max(totalReturns, 1)
  const costPerReturn = totalExpenses/denom
  const netMarginPct = taxPrepIncome !== 0 ? (netIncome/taxPrepIncome)*100 : 0
  return { grossFees, discounts, taxPrepIncome, salaries, rent, supplies, royalties, advRoyalties, misc, totalExpenses, netIncome, totalReturns, costPerReturn, netMarginPct }
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
