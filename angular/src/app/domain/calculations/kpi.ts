import type { Thresholds, CalculationInputs } from '../types/calculation.types';

export type Light = 'green' | 'yellow' | 'red';

export function statusForCPR(v: number, t: Thresholds, inputs?: CalculationInputs): Light {
  if (inputs) {
    const handlesTaxRush = inputs.region === 'CA';
    const taxRush = handlesTaxRush ? inputs.taxRushReturns : 0;
    const taxPrepIncome =
      inputs.avgNetFee * (inputs.taxPrepReturns - taxRush) * (1 - inputs.discountsPct / 100);
    const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? inputs.avgNetFee * taxRush : 0;
    const otherIncome = inputs.otherIncome || 0;
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;
    const revenuePerReturn =
      totalRevenue > 0 && inputs.taxPrepReturns > 0 ? totalRevenue / inputs.taxPrepReturns : 0;
    if (revenuePerReturn > 0) {
      const cprGreenMin = revenuePerReturn * 0.745;
      const cprGreenMax = revenuePerReturn * 0.775;
      const cprYellowMin = revenuePerReturn * 0.715;
      const cprYellowMax = revenuePerReturn * 0.805;
      if (v >= cprGreenMin && v <= cprGreenMax) return 'green';
      if ((v >= cprYellowMin && v < cprGreenMin) || (v > cprGreenMax && v <= cprYellowMax))
        return 'yellow';
      return 'red';
    }
  }
  if (v <= t.cprGreen) return 'green';
  if (v <= t.cprYellow) return 'yellow';
  return 'red';
}

export function statusForMargin(v: number, t: Thresholds): Light {
  if (v >= t.nimGreen) return 'green';
  if (v >= t.nimYellow) return 'yellow';
  return 'red';
}

export function statusForNetIncome(v: number, t: Thresholds): Light {
  if (v >= 0) return 'green';
  if (v <= t.netIncomeWarn) return 'red';
  return 'yellow';
}
