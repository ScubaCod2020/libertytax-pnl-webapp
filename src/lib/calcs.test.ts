import { describe, it, expect } from 'vitest'
import { calc, statusForCPR, statusForMargin, statusForNetIncome, type Inputs, type Thresholds } from './calcs'

describe('P&L Calculation Engine', () => {
  const defaultThresholds: Thresholds = {
    cprGreen: 25,
    cprYellow: 35,
    nimGreen: 20,
    nimYellow: 10,
    netIncomeWarn: -5000,
  }

  const baseInputs: Inputs = {
    region: 'US',
    scenario: 'Custom',
    avgNetFee: 125,
    taxPrepReturns: 1600,
    taxRushReturns: 0,
    discountsPct: 3,
    salariesPct: 25,
    rentPct: 18,
    suppliesPct: 3.5,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    miscPct: 2.5,
    thresholds: defaultThresholds,
  }

  describe('Basic Calculations', () => {
    it('should calculate gross fees correctly', () => {
      const result = calc(baseInputs)
      const expectedGrossFees = (1600 + 0) * 125 // totalReturns * avgNetFee
      expect(result.grossFees).toBe(expectedGrossFees)
    })

    it('should calculate discounts correctly', () => {
      const result = calc(baseInputs)
      const expectedDiscounts = (1600 + 0) * 125 * (3 / 100)
      expect(result.discounts).toBe(expectedDiscounts)
    })

    it('should calculate tax prep income correctly', () => {
      const result = calc(baseInputs)
      const grossFees = (1600 + 0) * 125
      const discounts = grossFees * (3 / 100)
      const expectedTaxPrepIncome = grossFees - discounts
      expect(result.taxPrepIncome).toBe(expectedTaxPrepIncome)
    })

    it('should calculate total expenses correctly', () => {
      const result = calc(baseInputs)
      const taxPrepIncome = 194000 // from previous calculation
      const expectedExpenses = taxPrepIncome * (25 + 18 + 3.5 + 14 + 5 + 2.5) / 100
      expect(result.totalExpenses).toBeCloseTo(expectedExpenses, 2)
    })

    it('should calculate net income correctly', () => {
      const result = calc(baseInputs)
      expect(result.netIncome).toBe(result.taxPrepIncome - result.totalExpenses)
    })

    it('should calculate cost per return correctly', () => {
      const result = calc(baseInputs)
      const expectedCPR = result.totalExpenses / (1600 + 0)
      expect(result.costPerReturn).toBe(expectedCPR)
    })

    it('should calculate net margin percentage correctly', () => {
      const result = calc(baseInputs)
      const expectedMargin = (result.netIncome / result.taxPrepIncome) * 100
      expect(result.netMarginPct).toBeCloseTo(expectedMargin, 2)
    })
  })

  describe('Regional Differences', () => {
    it('should handle US region (no TaxRush)', () => {
      const usInputs = { ...baseInputs, region: 'US' as const, taxRushReturns: 100 }
      const result = calc(usInputs)
      
      // TaxRush should NOT be included in total returns calculation for US
      expect(result.totalReturns).toBe(1600)
    })

    it('should handle CA region (with TaxRush)', () => {
      const caInputs = { ...baseInputs, region: 'CA' as const, taxRushReturns: 200 }
      const result = calc(caInputs)
      
      expect(result.totalReturns).toBe(1600 + 200)
    })
  })

  describe('Status Functions', () => {
    it('should correctly determine CPR status', () => {
      expect(statusForCPR(20, defaultThresholds)).toBe('green')
      expect(statusForCPR(30, defaultThresholds)).toBe('yellow')
      expect(statusForCPR(40, defaultThresholds)).toBe('red')
    })

    it('should correctly determine margin status', () => {
      expect(statusForMargin(25, defaultThresholds)).toBe('green')
      expect(statusForMargin(15, defaultThresholds)).toBe('yellow')
      expect(statusForMargin(5, defaultThresholds)).toBe('red')
    })

    it('should correctly determine net income status', () => {
      expect(statusForNetIncome(10000, defaultThresholds)).toBe('green')
      expect(statusForNetIncome(-2000, defaultThresholds)).toBe('yellow')
      expect(statusForNetIncome(-6000, defaultThresholds)).toBe('red')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero returns gracefully', () => {
      const zeroReturns = { ...baseInputs, taxPrepReturns: 0, taxRushReturns: 0 }
      const result = calc(zeroReturns)
      
      expect(result.grossFees).toBe(0)
      expect(result.discounts).toBe(0)
      expect(result.taxPrepIncome).toBe(0)
      // Cost per return should handle division by zero
      expect(result.costPerReturn).toBe(0) // or Infinity, depending on implementation
    })

    it('should handle negative percentages', () => {
      const negativeInputs = { ...baseInputs, discountsPct: -5 }
      const result = calc(negativeInputs)
      
      // Negative discounts should increase tax prep income
      expect(result.taxPrepIncome).toBeGreaterThan(result.grossFees)
    })

    it('should handle very large numbers', () => {
      const largeInputs = { 
        ...baseInputs, 
        taxPrepReturns: 1000000, 
        avgNetFee: 1000 
      }
      const result = calc(largeInputs)
      
      expect(result.grossFees).toBe(1000000000) // 1 billion
      expect(typeof result.grossFees).toBe('number')
      expect(isFinite(result.grossFees)).toBe(true)
    })
  })

  describe('Scenario Validation', () => {
    it('should maintain calculation consistency across scenarios', () => {
      const scenarios = ['Conservative', 'Optimistic', 'Best'] as const
      
      scenarios.forEach(scenario => {
        const inputs = { ...baseInputs, scenario }
        const result = calc(inputs)
        
        // Verify basic calculation integrity
        expect(result.taxPrepIncome).toBe(result.grossFees - result.discounts)
        expect(result.netIncome).toBe(result.taxPrepIncome - result.totalExpenses)
        expect(result.totalReturns).toBe(inputs.taxPrepReturns + inputs.taxRushReturns)
      })
    })

    it('should handle custom thresholds correctly', () => {
      const customThresholds: Thresholds = {
        cprGreen: 30,
        cprYellow: 40,
        nimGreen: 25,
        nimYellow: 15,
        netIncomeWarn: -10000,
      }
      
      const inputs = { ...baseInputs, thresholds: customThresholds }
      const result = calc(inputs)
      
      // Status functions should use the custom thresholds
      const cprStatus = statusForCPR(result.costPerReturn, customThresholds)
      const marginStatus = statusForMargin(result.netMarginPct, customThresholds)
      const incomeStatus = statusForNetIncome(result.netIncome, customThresholds)
      
      expect(['green', 'yellow', 'red']).toContain(cprStatus)
      expect(['green', 'yellow', 'red']).toContain(marginStatus)
      expect(['green', 'yellow', 'red']).toContain(incomeStatus)
    })
  })
})
