// calculation.models.ts - Data models for calculation results
// Based on React app calculation models

export interface ExistingStoreSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netMarginPct: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  otherIncome: number;
  discounts: number;
  expensesByCategory: {
    personnel: number;
    facility: number;
    operations: number;
    franchise: number;
    misc: number;
  };
}

export interface CalculationResults {
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  otherIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  totalReturns: number;
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
  cprStatus?: 'red' | 'yellow' | 'green';
  nimStatus?: 'red' | 'yellow' | 'green';
}

export interface ProjectedPerformanceData {
  grossFees: number;
  discounts: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  netMarginPct: number;
  costPerReturn: number;
  totalReturns: number;
  region: 'US' | 'CA';
  lastYearRevenue: number;
  lastYearExpenses: number;
  lastYearReturns: number;
  expectedGrowthPct: number;
  handlesTaxRush: boolean;
}
