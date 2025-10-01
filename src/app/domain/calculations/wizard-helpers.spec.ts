import { describe, it, expect } from 'vitest';
import {
  calculateExpectedRevenue,
  calculateGrossFees,
  calculateStandardExpenses,
} from './wizard-helpers';

describe('wizard-helpers (domain)', () => {
  it('calculates expected revenue with growth', () => {
    const rev = calculateExpectedRevenue({
      region: 'US',
      avgNetFee: 100,
      taxPrepReturns: 1000,
      expectedGrowthPct: 10,
      hasOtherIncome: false,
    });
    // gross = 110 * 1100 = 121000, discounts 3% = 3630, net = 117370
    expect(rev).toBeCloseTo(117370, 0);
  });

  it('calculates gross fees with/without growth', () => {
    const g0 = calculateGrossFees({
      region: 'US',
      storeType: 'new',
      avgNetFee: 100,
      taxPrepReturns: 1000,
    });
    const g1 = calculateGrossFees({
      region: 'US',
      storeType: 'existing',
      avgNetFee: 100,
      taxPrepReturns: 1000,
      expectedGrowthPct: 10,
    });
    expect(g0).toBe(100000);
    expect(g1).toBe(121000);
  });

  it('calculates standard expenses at 76% of gross', () => {
    const exp = calculateStandardExpenses({
      region: 'US',
      storeType: 'new',
      avgNetFee: 100,
      taxPrepReturns: 1000,
    });
    expect(exp).toBe(76000);
  });
});
