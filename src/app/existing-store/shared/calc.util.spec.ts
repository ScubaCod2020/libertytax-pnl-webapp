import {
  calculateAvgNetFee,
  calculateDiscountAmount,
  calculateDiscountPct,
  calculateGrossTaxPrepFees,
  calculateLastYearRevenue,
  calculateNetIncome,
  calculateTaxPrepIncome,
  calculateTaxRushGrossFees,
  calculateTaxRushReturnsCount,
  calculateTaxRushReturnsPct,
  calculateTotalExpensesFromGross,
  defaultTaxRushReturns,
  normalizePriorYearMetrics,
  round2,
  toPct1dp,
} from './calc.util';

describe('calc.util', () => {
  describe('round2', () => {
    it('rounds up at half cents', () => {
      expect(round2(10.005)).toBe(10.01);
    });

    it('rounds down below half cents', () => {
      expect(round2(10.004)).toBe(10);
    });
  });

  describe('toPct1dp', () => {
    it('rounds down below .05', () => {
      expect(toPct1dp(12.34)).toBe(12.3);
    });

    it('rounds up at .05', () => {
      expect(toPct1dp(12.35)).toBe(12.4);
    });
  });

  describe('calculateDiscountPct', () => {
    it('calculates discount percentage rounded to 1 decimal', () => {
      expect(calculateDiscountPct(206000, 6180)).toBe(3);
    });

    it('handles zero gross fees', () => {
      expect(calculateDiscountPct(0, 500)).toBe(0);
    });
  });

  describe('calculateDiscountAmount', () => {
    it('calculates discount amount from pct', () => {
      expect(calculateDiscountAmount(206000, 3)).toBe(6180);
    });

    it('handles tiny percentage values with cent rounding', () => {
      expect(calculateDiscountAmount(999999.99, 0.1)).toBe(1000);
    });
  });

  describe('calculateAvgNetFee', () => {
    it('derives average net fee from totals', () => {
      expect(calculateAvgNetFee(206000, 1680)).toBe(122.62);
    });

    it('returns 0 when returns are 0', () => {
      expect(calculateAvgNetFee(100000, 0)).toBe(0);
    });
  });

  describe('calculateTaxPrepIncome', () => {
    it('subtracts explicit discounts', () => {
      expect(calculateTaxPrepIncome(206000, 6180)).toBe(199820);
    });

    it('applies default 3% discount when none provided', () => {
      expect(calculateTaxPrepIncome(100000)).toBe(97000);
    });

    it('returns 0 when gross fees are 0', () => {
      expect(calculateTaxPrepIncome(0, 100)).toBe(0);
    });
  });

  describe('calculateGrossTaxPrepFees', () => {
    it('multiplies average fee and returns with cent rounding', () => {
      expect(calculateGrossTaxPrepFees(125.5, 1680)).toBe(210840);
    });

    it('returns 0 when any input missing', () => {
      expect(calculateGrossTaxPrepFees(0, 1500)).toBe(0);
    });
  });

  describe('calculateTaxRushGrossFees', () => {
    it('uses provided avg net fee', () => {
      expect(calculateTaxRushGrossFees(240, 125)).toBe(30000);
    });

    it('falls back to avg net fee from gross and returns', () => {
      expect(calculateTaxRushGrossFees(240, undefined, 206000, 1680)).toBe(29428.8);
    });

    it('handles non-integer average fees', () => {
      expect(calculateTaxRushGrossFees(175, 123.45)).toBe(21603.75);
    });
  });

  describe('calculateTaxRushReturnsPct', () => {
    it('calculates percentage rounded to 1 decimal', () => {
      expect(calculateTaxRushReturnsPct(252, 1680)).toBe(15);
    });

    it('returns 0 when total returns is 0', () => {
      expect(calculateTaxRushReturnsPct(200, 0)).toBe(0);
    });
  });

  describe('calculateTaxRushReturnsCount', () => {
    it('converts percentage to count', () => {
      expect(calculateTaxRushReturnsCount(1680, 15)).toBe(252);
    });

    it('handles fractional percentages', () => {
      expect(calculateTaxRushReturnsCount(1600, 12.5)).toBe(200);
    });
  });

  describe('defaultTaxRushReturns', () => {
    it('defaults to 15% of total returns', () => {
      expect(defaultTaxRushReturns(1680)).toBe(252);
    });

    it('handles different totals', () => {
      expect(defaultTaxRushReturns(1000)).toBe(150);
    });
  });

  describe('calculateLastYearRevenue', () => {
    it('combines gross fees, discounts, and other income', () => {
      expect(calculateLastYearRevenue(206000, 6180, 2500)).toBe(202320);
    });

    it('handles fractional cents and rounds to cents', () => {
      expect(calculateLastYearRevenue(100000.55, 3000.12, 0.2)).toBe(97000.63);
    });
  });

  describe('calculateTotalExpensesFromGross', () => {
    it('returns 76% of gross tax prep fees', () => {
      expect(calculateTotalExpensesFromGross(200000)).toBe(152000);
    });

    it('returns 0 for zero gross fees', () => {
      expect(calculateTotalExpensesFromGross(0)).toBe(0);
    });
  });

  describe('calculateNetIncome', () => {
    it('subtracts expenses from revenue with cent rounding', () => {
      expect(calculateNetIncome(202320, 150000.12)).toBe(52319.88);
    });

    it('handles zero revenue', () => {
      expect(calculateNetIncome(0, 500)).toBe(-500);
    });
  });

  describe('normalizePriorYearMetrics', () => {
    it('normalizes raw metrics using calc helpers', () => {
      expect(
        normalizePriorYearMetrics({
          grossFees: 206000,
          discountAmount: 6180,
          otherIncome: 2500,
          expenses: 150000,
          taxPrepReturns: 1680,
          taxRushReturns: 240,
          taxRushAvgNetFee: 125,
        })
      ).toEqual({
        grossFees: 206000,
        discountAmount: 6180,
        discountPct: 3,
        taxPrepIncome: 199820,
        taxRushGrossFees: 30000,
        revenue: 202320,
        expenses: 150000,
        netIncome: 52320,
        avgNetFee: 122.62,
        otherIncome: 2500,
        taxPrepReturns: 1680,
        taxRushReturns: 240,
        taxRushAvgNetFee: 125,
      });
    });

    it('falls back to avg net fee when taxRush fee missing', () => {
      const normalized = normalizePriorYearMetrics({
        grossFees: 206000,
        discountAmount: 6180,
        otherIncome: 2500,
        expenses: 150000,
        taxPrepReturns: 1680,
        taxRushReturns: 240,
      });

      expect(normalized.taxRushAvgNetFee).toBe(122.62);
      expect(normalized.taxRushGrossFees).toBe(29428.8);
    });
  });
});
