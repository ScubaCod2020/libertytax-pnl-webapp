// Wizard Types - Extracted from WizardShell.tsx for better modularity
// All interfaces and types used across wizard components

import type { Region } from '../../lib/calcs';
import type { ExpenseValues } from '../../types/expenses';

// Wizard step management
export type WizardStep = 'welcome' | 'inputs' | 'review';

// Comprehensive wizard answers including all fields
export interface WizardAnswers {
  // Basic info
  region: Region;

  // Business performance (new fields)
  storeType?: 'new' | 'existing';
  handlesTaxRush?: boolean; // Canada only - whether office handles TaxRush returns
  hasOtherIncome?: boolean; // Whether office has additional revenue streams

  // Last Year Performance - Complete breakdown (Page 1) - RESTRUCTURED for franchise UX
  lastYearGrossFees?: number; // new field - what franchisee actually charged
  lastYearDiscountsAmt?: number; // new field - dollar amount of discounts given
  lastYearDiscountsPct?: number; // auto-calculated from amount/gross fees
  // lastYearTaxPrepIncome auto-calculated as grossFees - discountsAmt
  lastYearTaxPrepReturns?: number; // new field - count of returns processed last year
  lastYearOtherIncome?: number;
  lastYearTaxRushReturns?: number; // for Canada
  lastYearTaxRushReturnsPct?: number; // auto-calculated percentage of TaxRush returns vs total returns
  lastYearTaxRushGrossFees?: number; // for Canada - historical TaxRush gross fees
  lastYearTaxRushAvgNetFee?: number; // for Canada - historical TaxRush average net fee
  lastYearExpenses?: number;

  // Projected Performance - Complete breakdown (Page 1)
  expectedGrowthPct?: number;
  expectedRevenue?: number; // calculated total revenue or overridden
  projectedExpenses?: number; // calculated or overridden

  // Income drivers (enhanced)
  avgNetFee?: number;
  taxPrepReturns?: number;
  taxRushReturns?: number; // for Canada
  taxRushReturnsPct?: number; // percentage of TaxRush returns vs total returns
  taxRushGrossFees?: number; // for Canada - separate TaxRush gross fees
  taxRushAvgNetFee?: number; // for Canada - separate TaxRush average net fee
  otherIncome?: number; // new field for additional revenue streams
  discountsPct?: number;
  discountsAmt?: number; // projected discount amount (dollar value)

  // Projected values (for bidirectional wizard flow)
  projectedAvgNetFee?: number; // manually adjusted projected value
  projectedTaxPrepReturns?: number; // manually adjusted projected value
  projectedGrossFees?: number; // derived or manually overridden projected gross fees
  projectedTaxPrepIncome?: number; // derived or manually overridden projected tax prep income

  // Manual override fields for auto-calculated values
  manualAvgNetFee?: number; // override for calculated average net fee
  manualTaxPrepIncome?: number; // override for calculated tax prep income
  manualTaxRushReturns?: number; // override for projected TaxRush returns

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

  // Derived expense values for export
  expenses?: ExpenseValues;

  // Pre-calculated expense total from Page 2 (overrides calc engine when available)
  calculatedTotalExpenses?: number;
}

// Growth options for the performance change dropdown
export interface GrowthOption {
  value: number;
  label: string;
}

// Props for wizard shell
export interface WizardShellProps {
  region: Region;
  setRegion: (region: Region) => void;
  onComplete: (answers: WizardAnswers) => void;
  onCancel: () => void;
}

// Props for individual wizard sections
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
