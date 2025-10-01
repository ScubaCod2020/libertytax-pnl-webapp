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

/**
 * Performance analysis result for comparing actual vs target revenue.
 */
export interface PerformanceAnalysisLike {
  actualRevenue: number;
  targetRevenue: number;
  variance: number; // percent, positive means above target
}

/**
 * Calculate performance vs target based on expectedGrowthPct.
 * - actual uses projected* fields when provided, otherwise applies expectedGrowthPct to baselines
 * - target applies expectedGrowthPct to both baselines
 */
export function calculatePerformanceVsTarget(answers: WizardAnswersLike): PerformanceAnalysisLike {
  if (!answers.avgNetFee || !answers.taxPrepReturns) {
    return { actualRevenue: 0, targetRevenue: 0, variance: 0 };
  }

  const expected = answers.expectedGrowthPct ?? 0;

  const actualAvgNetFee =
    answers.projectedAvgNetFee !== undefined
      ? answers.projectedAvgNetFee
      : answers.avgNetFee * (1 + expected / 100);
  const actualTaxPrepReturns =
    answers.projectedTaxPrepReturns !== undefined
      ? answers.projectedTaxPrepReturns
      : answers.taxPrepReturns * (1 + expected / 100);

  const targetAvgNetFee = answers.avgNetFee * (1 + expected / 100);
  const targetTaxPrepReturns = answers.taxPrepReturns * (1 + expected / 100);

  const actualRevenue = actualAvgNetFee * actualTaxPrepReturns;
  const targetRevenue = targetAvgNetFee * targetTaxPrepReturns;
  const variance = targetRevenue > 0 ? ((actualRevenue - targetRevenue) / targetRevenue) * 100 : 0;

  return { actualRevenue, targetRevenue, variance };
}

/**
 * Structured adjustment entry used by getAdjustmentStatus
 */
export interface AdjustmentEntryLike {
  field: 'Average Net Fee' | 'Tax Prep Returns';
  actualGrowth: number;
  expectedGrowth: number;
  variance: number;
}

export interface AdjustmentStatusLike {
  hasAdjustments: boolean;
  avgNetFeeStatus?: string;
  taxPrepReturnsStatus?: string;
  adjustments?: AdjustmentEntryLike[];
}

/**
 * Detects differences between actual projected field growth and expectedGrowthPct
 * and returns human-readable status strings for strategic analysis.
 */
export function getAdjustmentStatus(answers: WizardAnswersLike): AdjustmentStatusLike {
  const adjustments: AdjustmentEntryLike[] = [];
  const expectedGrowth = answers.expectedGrowthPct ?? 0;

  if (answers.projectedAvgNetFee !== undefined && answers.avgNetFee) {
    const actualGrowth = calculateFieldGrowth(answers.projectedAvgNetFee, answers.avgNetFee);
    if (Math.abs(actualGrowth - expectedGrowth) > 1) {
      adjustments.push({
        field: 'Average Net Fee',
        actualGrowth,
        expectedGrowth,
        variance: actualGrowth - expectedGrowth,
      });
    }
  }

  if (answers.projectedTaxPrepReturns !== undefined && answers.taxPrepReturns) {
    const actualGrowth = calculateFieldGrowth(
      answers.projectedTaxPrepReturns,
      answers.taxPrepReturns
    );
    if (Math.abs(actualGrowth - expectedGrowth) > 1) {
      adjustments.push({
        field: 'Tax Prep Returns',
        actualGrowth,
        expectedGrowth,
        variance: actualGrowth - expectedGrowth,
      });
    }
  }

  const avg = adjustments.find((a) => a.field === 'Average Net Fee');
  const rts = adjustments.find((a) => a.field === 'Tax Prep Returns');

  const avgNetFeeStatus = avg
    ? `Average Net Fee: ${avg.actualGrowth}% growth (${avg.variance > 0 ? '+' : ''}${avg.variance}% vs ${avg.expectedGrowth}% plan)`
    : undefined;
  const taxPrepReturnsStatus = rts
    ? `Tax Prep Returns: ${rts.actualGrowth}% growth (${rts.variance > 0 ? '+' : ''}${rts.variance}% vs ${rts.expectedGrowth}% plan)`
    : undefined;

  return {
    hasAdjustments: adjustments.length > 0,
    avgNetFeeStatus,
    taxPrepReturnsStatus,
    adjustments: adjustments.length ? adjustments : undefined,
  };
}

/**
 * Calculate blended growth rate based on actual field values vs original targets.
 * Used for strategic analysis to show combined effect of individual field adjustments.
 */
export function calculateBlendedGrowth(answers: WizardAnswersLike): number {
  if (!answers.avgNetFee || !answers.taxPrepReturns) return answers.expectedGrowthPct ?? 0;

  // Calculate actual projected values
  const actualAvgNetFee =
    answers.projectedAvgNetFee !== undefined
      ? answers.projectedAvgNetFee
      : answers.avgNetFee * (1 + (answers.expectedGrowthPct ?? 0) / 100);
  const actualTaxPrepReturns =
    answers.projectedTaxPrepReturns !== undefined
      ? answers.projectedTaxPrepReturns
      : answers.taxPrepReturns * (1 + (answers.expectedGrowthPct ?? 0) / 100);

  // Calculate blended growth based on revenue impact
  const originalRevenue = answers.avgNetFee * answers.taxPrepReturns;
  const actualRevenue = actualAvgNetFee * actualTaxPrepReturns;
  
  if (originalRevenue === 0) return 0;
  
  return Math.round(((actualRevenue - originalRevenue) / originalRevenue) * 100);
}