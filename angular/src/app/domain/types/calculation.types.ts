// Domain calculation types (framework-agnostic)

export type Region = 'US' | 'CA';

export interface Thresholds {
  cprGreen: number;
  cprYellow: number;
  nimGreen: number;
  nimYellow: number;
  netIncomeWarn: number;
}

export interface CalculationInputs {
  // Basics
  region: Region;
  scenario: string;
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  handlesTaxRush?: boolean; // Optional - defaults to true for backward compatibility
  otherIncome?: number; // Other revenue streams (bookkeeping, notary, etc.)
  discountsPct: number;

  // Optional pre-calculated total (from Expenses page)
  calculatedTotalExpenses?: number;

  // 17 expense fields (current engine subset; percent vs fixed as indicated by name)
  salariesPct: number; // keep type name for calc engine compatibility; value source now payrollPct
  empDeductionsPct: number; // % of salaries
  rentPct: number;
  telephoneAmt: number;
  utilitiesAmt: number;
  localAdvAmt: number;
  insuranceAmt: number;
  postageAmt: number;
  suppliesPct: number;
  duesAmt: number;
  bankFeesAmt: number;
  maintenanceAmt: number;
  travelEntAmt: number;
  royaltiesPct: number; // % of tax prep income
  advRoyaltiesPct: number; // % of tax prep income
  taxRushRoyaltiesPct: number; // % surrogate
  miscPct: number;

  thresholds: Thresholds;
}

export interface CalculationResults {
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  otherIncome: number;
  totalRevenue: number;

  salaries: number;
  empDeductions: number;
  rent: number;
  telephone: number;
  utilities: number;
  localAdv: number;
  insurance: number;
  postage: number;
  supplies: number;
  dues: number;
  bankFees: number;
  maintenance: number;
  travelEnt: number;
  royalties: number;
  advRoyalties: number;
  taxRushRoyalties: number;
  misc: number;

  totalExpenses: number;
  netIncome: number;
  totalReturns: number;
  costPerReturn: number;
  netMarginPct: number;
}
