// Using Jasmine APIs (Angular default) instead of Vitest
import { calc } from './calc';
import type { CalculationInputs } from '../types/calculation.types';

function baseInputs(overrides: Partial<CalculationInputs> = {}): CalculationInputs {
  return {
    region: 'US',
    scenario: 'Custom',
    avgNetFee: 100,
    taxPrepReturns: 1000,
    taxRushReturns: 0,
    discountsPct: 3,
    otherIncome: 0,
    salariesPct: 25,
    empDeductionsPct: 10,
    rentPct: 18,
    telephoneAmt: 200,
    utilitiesAmt: 300,
    localAdvAmt: 500,
    insuranceAmt: 150,
    postageAmt: 100,
    suppliesPct: 3.5,
    duesAmt: 200,
    bankFeesAmt: 100,
    maintenanceAmt: 150,
    travelEntAmt: 200,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 1,
    thresholds: {
      cprGreen: 95,
      cprYellow: 110,
      nimGreen: 22.5,
      nimYellow: 19.5,
      netIncomeWarn: -5000,
    },
    ...overrides,
  };
}

describe('calc (domain)', () => {
  it('computes totals with 3% discounts and 17-line expenses', () => {
    const inputs = baseInputs({ avgNetFee: 250, taxPrepReturns: 1600 });
    const r = calc(inputs);
    expect(r.grossFees).toBe(400000);
    expect(r.discounts).toBe(12000);
    expect(r.taxPrepIncome).toBe(388000);
    expect(r.totalRevenue).toBe(388000);
    expect(r.totalExpenses).toBeGreaterThan(0);
    expect(r.netIncome).toBeCloseTo(r.totalRevenue - r.totalExpenses, 6);
    expect(r.netMarginPct).toBeCloseTo((r.netIncome / r.totalRevenue) * 100, 6);
  });

  it('handles CA with TaxRush returns', () => {
    const inputs = baseInputs({
      region: 'CA',
      avgNetFee: 200,
      taxPrepReturns: 1000,
      taxRushReturns: 200,
    });
    const r = calc(inputs);
    expect(r.taxRushIncome).toBe(200 * 200);
    expect(r.totalReturns).toBe(1200);
  });
});
