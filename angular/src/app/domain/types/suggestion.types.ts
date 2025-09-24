// Suggestion engine types for Angular implementation
// Mirrors React suggestion engine interfaces

import { Region } from './wizard.types';

// Individual expense field interface for suggestion profiles
export interface ExpenseField {
  id: string;
  label: string;
  category: string;
  type: 'percentage' | 'fixed';
  base?: string;
  min?: number;
  max?: number;
  defaultValue: number;
}

// Suggestion profile for different store types and regions
export interface SuggestionProfile {
  name: string;
  description: string;
  region: Region;
  storeType: 'new' | 'existing';
  handlesTaxRush?: boolean;

  // Core financial inputs
  avgNetFee: number;
  taxPrepReturns: number;
  discountsPct: number;

  // TaxRush specific (Canada only)
  taxRushReturns?: number;
  taxRushAvgNetFee?: number;

  // Other income
  otherIncome?: number;

  // Growth expectations (existing stores only)
  expectedGrowthPct?: number;

  // Expense profiles (17 categories)
  expenses: Record<string, number>;
}

// Calculated suggestions interface
export interface CalculatedSuggestions {
  // Input fields
  avgNetFee: number;
  taxPrepReturns: number;
  discountsPct: number;
  taxRushReturns: number;
  taxRushAvgNetFee: number;
  otherIncome: number;

  // Calculated revenue fields (show flow)
  grossFees: number;
  discountAmount: number;
  taxPrepIncome: number;
  taxRushIncome: number;
  totalRevenue: number;

  // Calculated expense fields (show impact)
  totalExpenses: number;
  netIncome: number;

  // Individual expense suggestions (17 categories)
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
  taxRushShortagesPct: number;
  miscPct: number;
}

// Regional suggestion profiles registry
export interface SuggestionProfileRegistry {
  [key: string]: SuggestionProfile;
}
