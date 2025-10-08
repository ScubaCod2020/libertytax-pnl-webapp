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
  // Internal flags
  _isExampleData?: boolean; // Flag to indicate if data is example/placeholder data

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

  // Prior Year (PY) performance for existing stores
  pyTaxPrepReturns?: number;
  pyAvgNetFee?: number;
  pyGrossFees?: number;
  pyTaxPrepIncome?: number;
  pyDiscountsPct?: number;
  pyDiscountsAmt?: number;
  pyTaxRushReturns?: number;
  pyTaxRushReturnsPct?: number; // PY Percentage of tax prep returns (default 15% for CA)
  pyTaxRushGrossFees?: number;
  pyTaxRushAvgNetFee?: number;
  pyOtherIncome?: number;
  manualPyTaxRushReturns?: number; // Flag for manually set PY TaxRush returns

  // Projected Performance
  expectedGrowthPct?: number;
  projectedTaxPrepIncome?: number;
  projectedDiscountsAmt?: number;
  projectedDiscountsPct?: number;
  projectedOtherIncome?: number;
  projectedTaxRushReturns?: number;
  projectedTaxRushAvgNetFee?: number;
  projectedTaxRushGrossFees?: number;
  projectedTaxRushReturnsPct?: number;

  // Manual override flags for projected
  manualProjectedDiscountsAmt?: boolean;
  manualProjectedDiscountsPct?: boolean;
  manualProjectedTaxRushReturns?: number;
  manualProjectedTaxRushReturnsPct?: number;
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

  // Manual override fields for auto-calculated values
  manualAvgNetFee?: number;
  manualTaxPrepIncome?: number;
  manualTaxRushReturns?: number;

  // All 17 expense fields
  // Payroll (renamed): keep backward-compat with salariesPct, prefer payrollPct going forward
  salariesPct?: number;
  payrollPct?: number;
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
  shortagesPct?: number;
  shortagesAmt?: number;
  miscPct?: number;

  // Derived expense values for export (TODO: define ExpenseValues interface if needed)
  expenses?: any; // Placeholder for ExpenseValues when implemented
  expenseBaselines?: Record<string, number>;
  expenseNotes?: Record<string, string>;
  expensesSeeded?: boolean;
  lastExpensesSeedHash?: string; // Hash of upstream state when expenses were last seeded
  minRecommendedExpenses?: number;
  maxRecommendedExpenses?: number;

  // Pre-calculated expense total from Page 2
  calculatedTotalExpenses?: number;
}

// Props for wizard shell component
export interface WizardShellProps {
  region: Region;
  setRegion: (region: Region) => void;
  onComplete: (answers: WizardAnswers) => void;
  onCancel: () => void;
}

// Props for wizard sections
export interface WizardSectionProps {
  answers: WizardAnswers;
  updateAnswers: (updates: Partial<WizardAnswers>) => void;
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
