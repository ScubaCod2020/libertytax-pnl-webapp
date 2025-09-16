import { PriorYearMetrics, PriorYearRawMetrics } from './prior-year.models';

/**
 * Pure calculation helpers for existing-store prior-year and income-driver fields.
 *
 * Conventions:
 * - Percentages use 0–100 representations (e.g., 12.5 === 12.5%).
 * - Currency-facing results always flow through {@link round2} to avoid FP artifacts.
 */

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function toPct1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

export function calculateDiscountPct(grossFees: number, discountAmount: number): number {
  if (!grossFees) {
    return 0;
  }
  return toPct1dp((discountAmount / grossFees) * 100);
}

export function calculateDiscountAmount(grossFees: number, discountPct: number): number {
  return round2(grossFees * (discountPct / 100));
}

export function calculateAvgNetFee(grossFees: number, taxPrepReturns: number): number {
  if (!taxPrepReturns) {
    return 0;
  }
  return round2(grossFees / taxPrepReturns);
}

export function calculateGrossTaxPrepFees(avgNetFee: number, taxPrepReturns: number): number {
  if (!avgNetFee || !taxPrepReturns) {
    return 0;
  }
  return round2(avgNetFee * taxPrepReturns);
}

export function calculateTaxPrepIncome(grossFees: number, discountAmount?: number): number {
  if (!grossFees) {
    return 0;
  }

  const appliedDiscount = discountAmount !== undefined ? round2(discountAmount) : round2(grossFees * 0.03);
  return round2(grossFees - appliedDiscount);
}

export function calculateTaxRushGrossFees(
  taxRushReturns: number,
  taxRushAvgNetFee?: number,
  grossFees?: number,
  taxPrepReturns?: number
): number {
  let avg = taxRushAvgNetFee;

  if (avg === undefined && grossFees !== undefined && taxPrepReturns) {
    avg = calculateAvgNetFee(grossFees, taxPrepReturns);
  }

  if (avg === undefined) {
    return 0;
  }

  return round2(taxRushReturns * avg);
}

export function calculateTaxRushReturnsPct(taxRushReturns: number, totalReturns: number): number {
  if (!totalReturns) {
    return 0;
  }
  return toPct1dp((taxRushReturns / totalReturns) * 100);
}

export function calculateTaxRushReturnsCount(totalReturns: number, pct: number): number {
  return Math.round(totalReturns * (pct / 100));
}

export function defaultTaxRushReturns(totalReturns: number): number {
  return Math.round(totalReturns * 0.15);
}

export function calculateLastYearRevenue(grossFees: number, discountAmount: number, otherIncome: number): number {
  return round2(grossFees - discountAmount + otherIncome);
}

export function calculateTotalExpensesFromGross(grossTaxPrepFees: number): number {
  if (!grossTaxPrepFees) {
    return 0;
  }
  return round2(grossTaxPrepFees * 0.76);
}

export function calculateNetIncome(revenue: number, expenses: number): number {
  return round2(revenue - expenses);
}

export function normalizePriorYearMetrics(raw: PriorYearRawMetrics): PriorYearMetrics {
  const gross = Number(raw.grossFees) || 0;
  const discountAmount = Number(raw.discountAmount) || 0;
  const otherIncome = Number(raw.otherIncome) || 0;
  const expenses = Number(raw.expenses) || 0;
  const taxPrepReturns = Number(raw.taxPrepReturns) || 0;
  const taxRushReturns = Number(raw.taxRushReturns) || 0;
  const taxRushAvgNetFee = raw.taxRushAvgNetFee;

  const discountPct = calculateDiscountPct(gross, discountAmount);
  const avgNetFee = calculateAvgNetFee(gross, taxPrepReturns);
  const taxPrepIncome = calculateTaxPrepIncome(gross, discountAmount);
  const taxRushGrossFees = calculateTaxRushGrossFees(
    taxRushReturns,
    taxRushAvgNetFee,
    gross,
    taxPrepReturns
  );
  const revenue = calculateLastYearRevenue(gross, discountAmount, otherIncome);
  const netIncome = calculateNetIncome(revenue, expenses);

  return {
    grossFees: round2(gross),
    discountAmount: round2(discountAmount),
    discountPct,
    taxPrepIncome,
    taxRushGrossFees,
    revenue,
    expenses: round2(expenses),
    netIncome,
    avgNetFee,
    otherIncome: round2(otherIncome),
    taxPrepReturns,
    taxRushReturns,
    taxRushAvgNetFee: round2(taxRushAvgNetFee ?? avgNetFee),
  };
}
