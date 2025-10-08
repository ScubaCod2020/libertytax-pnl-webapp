// Angular models matching React app types
export type Region = 'US' | 'CA';

export type WizardStep = 'welcome' | 'inputs' | 'review' | 'complete';

export interface WizardAnswers {
  // Basic info
  region: Region;
  storeType?: 'new' | 'existing';
  handlesTaxRush?: boolean;
  hasOtherIncome?: boolean;
  
  // New store targets
  avgNetFee?: number;
  taxPrepReturns?: number;
  discountsAmt?: number;
  discountsPct?: number;
  totalExpenses?: number;
  
  // Existing store data
  lastYearGrossFees?: number;
  lastYearDiscountsAmt?: number;
  lastYearOtherIncome?: number;
  lastYearExpenses?: number;
  lastYearTaxPrepReturns?: number;
  expectedGrowthPct?: number;
  
  // TaxRush data (Canada only)
  taxRushReturns?: number;
  taxRushGrossFees?: number;
  
  // Other income
  otherIncome?: number;
  
  // Expense breakdown
  salariesPct?: number;
  empDeductionsPct?: number;
  rentPct?: number;
  telephoneAmt?: number;
  utilitiesAmt?: number;
  localAdvAmt?: number;
  insuranceAmt?: number;
  postageAmt?: number;
  suppliesPct?: number;
  duesAmt?: number;
  bankFeesAmt?: number;
  maintenanceAmt?: number;
  travelEntAmt?: number;
  royaltiesPct?: number;
  advRoyaltiesPct?: number;
  taxRushRoyaltiesPct?: number;
  miscPct?: number;
}

export interface CalculationResults {
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
}

export interface AppState {
  region: Region;
  showWizard: boolean;
  scenario: string;
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  otherIncome: number;
  salariesPct: number;
  empDeductionsPct: number;
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
  royaltiesPct: number;
  advRoyaltiesPct: number;
  taxRushRoyaltiesPct: number;
  miscPct: number;
  thresholds: any;
}
