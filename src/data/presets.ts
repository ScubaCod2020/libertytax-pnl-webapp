export type Scenario = 'Custom'|'Good'|'Better'|'Best'
export const presets = {
  Good:   { avgNetFee: 130, taxPrepReturns: 1680, taxRushReturns: 0, discountsPct: 3, salariesPct: 26, rentPct: 18, suppliesPct: 3.5, royaltiesPct: 14, advRoyaltiesPct: 5, miscPct: 2.5 },
  Better: { avgNetFee: 135, taxPrepReturns: 1840, taxRushReturns: 0, discountsPct: 3, salariesPct: 24, rentPct: 17, suppliesPct: 3.5, royaltiesPct: 14, advRoyaltiesPct: 5, miscPct: 2.5 },
  Best:   { avgNetFee: 140, taxPrepReturns: 2000, taxRushReturns: 0, discountsPct: 3, salariesPct: 22, rentPct: 16, suppliesPct: 3.5, royaltiesPct: 14, advRoyaltiesPct: 5, miscPct: 2.5 }
} as const
