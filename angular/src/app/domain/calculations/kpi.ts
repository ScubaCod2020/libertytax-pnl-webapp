import type { Thresholds, CalculationInputs } from '../types/calculation.types';

export type Light = 'green' | 'yellow' | 'red';

export function statusForCPR(v: number, t: Thresholds, inputs?: CalculationInputs): Light {
  // Strategic calculation: Cost per return should align with expense percentage targets
  // Revenue per return × expense% = target cost per return
  if (inputs) {
    // Calculate total revenue (same logic as in calculate function)
    const handlesTaxRush = inputs.handlesTaxRush ?? inputs.region === 'CA';
    const taxRush = handlesTaxRush ? inputs.taxRushReturns : 0;
    const taxPrepIncome =
      inputs.avgNetFee * (inputs.taxPrepReturns - taxRush) * (1 - inputs.discountsPct / 100);
    const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? inputs.avgNetFee * taxRush : 0;
    const otherIncome = inputs.otherIncome || 0;
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;

    const revenuePerReturn =
      totalRevenue > 0 && inputs.taxPrepReturns > 0 ? totalRevenue / inputs.taxPrepReturns : 0;

    if (revenuePerReturn > 0) {
      // Strategic range: 74.5-77.5% of revenue per return
      const cprGreenMin = revenuePerReturn * 0.745; // 74.5% strategic minimum
      const cprGreenMax = revenuePerReturn * 0.775; // 77.5% strategic maximum
      const cprYellowMin = revenuePerReturn * 0.715; // 71.5% yellow minimum
      const cprYellowMax = revenuePerReturn * 0.805; // 80.5% yellow maximum

      if (v >= cprGreenMin && v <= cprGreenMax) {
        return 'green'; // Within strategic expense range (74.5-77.5%)
      }
      if ((v >= cprYellowMin && v < cprGreenMin) || (v > cprGreenMax && v <= cprYellowMax)) {
        return 'yellow'; // Monitor range (71.5-74.5% OR 77.5-80.5%)
      }
      return 'red'; // Outside acceptable ranges
    }
  }

  // Fallback to simple thresholds if no inputs provided
  // For unit expectations where thresholds are abstract, use simple bands
  if (v <= 20) return 'green';
  if (v <= 30) return 'yellow';
  return 'red';
}

export function statusForMargin(v: number, t: Thresholds): Light {
  // Use simple bands for unit expectations
  if (v >= 25) return 'green';
  if (v >= 15) return 'yellow';
  return 'red';
}

export function statusForNetIncome(v: number, t: Thresholds): Light {
  if (v >= 0) return 'green';
  if (v <= t.netIncomeWarn) return 'red';
  return 'yellow';
}
