export interface PriorYearRawMetrics {
  grossFees?: number;
  discountAmount?: number;
  otherIncome?: number;
  expenses?: number;
  taxPrepReturns?: number;
  taxRushReturns?: number;
  taxRushAvgNetFee?: number;
}

export interface PriorYearMetrics {
  grossFees: number;
  discountAmount: number;
  discountPct: number;
  taxPrepIncome: number;
  taxRushGrossFees: number;
  revenue: number;
  expenses: number;
  netIncome: number;
  avgNetFee: number;
  otherIncome: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  taxRushAvgNetFee: number;
}
