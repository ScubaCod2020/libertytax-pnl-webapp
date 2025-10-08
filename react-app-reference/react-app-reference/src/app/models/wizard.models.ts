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
  grossTaxPrepFees?: number;
  netTaxPrepFees?: number;
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
  taxRushPercentage?: number;
  taxRushFee?: number;
  grossTaxRushFees?: number;
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

// Brand Colors interface
export interface BrandColors {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Background colors for auto-calculating fields
  autoCalcEditable: string;    // Light primary tint for editable auto-calc fields
  autoCalcDisplayOnly: string; // Light gray for display-only auto-calc fields
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

// Brand Typography interface
export interface BrandTypography {
  // Font families
  primaryFont: string;        // Main brand font with fallbacks
  printFont: string;         // Font for print/PDF documents
  
  // Font weights following Proxima Nova hierarchy
  weights: {
    regular: number;         // 400 - Proxima Nova Regular
    medium: number;          // 500 - Proxima Nova Medium  
    semibold: number;        // 600 - Proxima Nova Semibold
    extrabold: number;       // 800 - Proxima Nova Extrabold
  };
  
  // Letter spacing for headlines (+200 tracking as per guidelines)
  headlineSpacing: string;
}

// Brand Assets interface
export interface BrandAssets {
  logoUrl: string;
  logoWide?: string;        // Wide/horizontal version for headers
  watermarkUrl: string;
  faviconUrl: string;
}

// Regional Brand interface
export interface RegionalBrand {
  colors: BrandColors;
  typography: BrandTypography;
  assets: BrandAssets;
  name: string;
  country: string;
}
