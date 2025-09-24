// Complete wizard types for Angular implementation
// Mirrors React WizardAnswers interface with Angular-specific adaptations

export type Region = 'US' | 'CA';
export type StoreType = 'new' | 'existing';
export type WizardStep = 'welcome' | 'inputs' | 'review';

// Growth options for performance change dropdown
export interface GrowthOption {
  value: number;
  label: string;
}

// Complete wizard answers interface
export interface WizardAnswers {
  // Basic info
  region: Region;

  // Business performance
  storeType?: StoreType;
  handlesTaxRush?: boolean; // Canada only - whether office handles TaxRush returns
  hasOtherIncome?: boolean; // Whether office has additional revenue streams

  // Last Year Performance - Complete breakdown
  lastYearGrossFees?: number;
  lastYearDiscountsAmt?: number;
  lastYearDiscountsPct?: number;
  lastYearTaxPrepReturns?: number;
  lastYearOtherIncome?: number;
  lastYearTaxRushReturns?: number; // for Canada
  lastYearTaxRushReturnsPct?: number;
  lastYearTaxRushGrossFees?: number;
  lastYearTaxRushAvgNetFee?: number;
  lastYearExpenses?: number;

  // Projected Performance
  expectedGrowthPct?: number;
  expectedRevenue?: number;
  projectedExpenses?: number;

  // Income drivers
  avgNetFee?: number;
  taxPrepReturns?: number;
  taxRushReturns?: number;
  taxRushReturnsPct?: number;
  taxRushGrossFees?: number;
  taxRushAvgNetFee?: number;
  otherIncome?: number;
  discountsPct?: number;
  discountsAmt?: number;

  // Projected values (for bidirectional wizard flow)
  projectedAvgNetFee?: number;
  projectedTaxPrepReturns?: number;
  projectedGrossFees?: number;
  projectedTaxPrepIncome?: number;

  // Manual override fields for auto-calculated values
  manualAvgNetFee?: number;
  manualTaxPrepIncome?: number;
  manualTaxRushReturns?: number;

  // All 17 expense fields
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
  taxRushShortagesPct?: number;
  miscPct?: number;

  // Pre-calculated expense total from Page 2
  calculatedTotalExpenses?: number;
}

// Props for wizard sections
export interface WizardSectionProps {
  answers: WizardAnswers;
  region: Region;
}

// Strategic analysis calculation results
export interface PerformanceAnalysis {
  actualRevenue: number;
  targetRevenue: number;
  variance: number;
}

// Adjustment status for strategic analysis
export interface AdjustmentStatus {
  hasAdjustments: boolean;
  avgNetFeeStatus?: string;
  taxPrepReturnsStatus?: string;
}
