// Framework-agnostic helpers derived from React Wizard calculations

export interface WizardAnswersLike {
  region: 'US' | 'CA';
  storeType?: 'new' | 'existing';
  handlesTaxRush?: boolean;
  hasOtherIncome?: boolean;
  avgNetFee?: number;
  taxPrepReturns?: number;
  expectedGrowthPct?: number;
  projectedAvgNetFee?: number;
  projectedTaxPrepReturns?: number;
  otherIncome?: number;
  lastYearOtherIncome?: number;
  lastYearDiscountsPct?: number;
}

export const GROWTH_OPTIONS = [
  { value: -10, label: 'Decline: -10%' },
  { value: -5, label: 'Decline: -5%' },
  { value: 0, label: 'No Change: 0%' },
  { value: 5, label: 'Growth: +5%' },
  { value: 10, label: 'Growth: +10%' },
  { value: 15, label: 'Growth: +15%' },
  { value: 20, label: 'Growth: +20%' },
];

export function calculateFieldGrowth(currentValue: number, originalValue: number): number {
  if (!originalValue) return 0;
  return Math.round(((currentValue - originalValue) / originalValue) * 100);
}

export function calculateExpectedRevenue(answers: WizardAnswersLike): number | undefined {
  if (!answers.avgNetFee || !answers.taxPrepReturns || answers.expectedGrowthPct === undefined)
    return undefined;
  const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100);
  const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100);
  const projectedGrossFees = projectedAvgNetFee * projectedTaxPrepReturns;
  const discountsPct = answers.lastYearDiscountsPct ?? 3;
  const projectedDiscountAmt = projectedGrossFees * (discountsPct / 100);
  const projectedTaxPrepIncome = projectedGrossFees - projectedDiscountAmt;
  const projectedOtherIncome = answers.hasOtherIncome
    ? (answers.lastYearOtherIncome ?? answers.otherIncome ?? 0) *
      (1 + answers.expectedGrowthPct / 100)
    : 0;
  const projectedTaxRushIncome = 0; // placeholder per reference
  return projectedTaxPrepIncome + projectedOtherIncome + projectedTaxRushIncome;
}

export function calculateGrossFees(answers: WizardAnswersLike): number {
  if (!answers.avgNetFee || !answers.taxPrepReturns) return 0;
  if (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined) {
    const anf = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100);
    const rts = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100);
    return Math.round(anf * rts);
  }
  return Math.round(answers.avgNetFee * answers.taxPrepReturns);
}

export function calculateStandardExpenses(answers: WizardAnswersLike): number {
  const gross = calculateGrossFees(answers);
  return Math.round(gross * 0.76);
}
