export type Scenario = 'Custom'|'Good'|'Better'|'Best'

// Base preset with all 17 expense fields
const basePreset = {
  taxRushReturns: 0,
  discountsPct: 3,
  
  // Personnel
  empDeductionsPct: 10,
  
  // Facility
  telephoneAmt: 200,
  utilitiesAmt: 300,
  
  // Operations
  localAdvAmt: 500,
  insuranceAmt: 150,
  postageAmt: 100,
  suppliesPct: 3.5,
  duesAmt: 200,
  bankFeesAmt: 100,
  maintenanceAmt: 150,
  travelEntAmt: 200,
  
  // Franchise
  royaltiesPct: 14,
  advRoyaltiesPct: 5,
  taxRushRoyaltiesPct: 0,
  
  // Miscellaneous
  miscPct: 2.5
}

export const presets = {
  Good: { 
    ...basePreset,
    avgNetFee: 130, 
    taxPrepReturns: 1680, 
    salariesPct: 26, 
    rentPct: 18 
  },
  Better: { 
    ...basePreset,
    avgNetFee: 135, 
    taxPrepReturns: 1840, 
    salariesPct: 24, 
    rentPct: 17 
  },
  Best: { 
    ...basePreset,
    avgNetFee: 140, 
    taxPrepReturns: 2000, 
    salariesPct: 22, 
    rentPct: 16 
  }
} as const
