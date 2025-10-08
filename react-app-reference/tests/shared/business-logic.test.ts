/**
 * Framework-Agnostic Business Logic Tests
 * These tests validate core business logic that should remain identical
 * between React and Angular implementations
 */

import { describe, it, expect } from 'vitest'

// Import your business logic functions
// These should be pure functions that work in both React and Angular
import { 
  calc,
  statusForCPR,
  statusForMargin,
  type Inputs as CalculationInputs,
  type Results as CalculationResults,
  type Thresholds
} from '../../src/lib/calcs'

describe('Business Logic - Framework Agnostic', () => {
  
  describe('Revenue Calculations', () => {
    it('should calculate revenue correctly for US region', () => {
      const inputs: CalculationInputs = {
        region: 'US',
        scenario: 'Custom',
        avgNetFee: 125,
        taxPrepReturns: 1600,
        taxRushReturns: 0, // US doesn't have TaxRush
        discountsPct: 3
      }
      
      const result = calc(inputs)
      expect(result.totalRevenue).toBe(200000) // 125 * 1600
    })
    
    it('should calculate revenue correctly for CA region with TaxRush', () => {
      const inputs: CalculationInputs = {
        region: 'CA',
        scenario: 'Custom',
        avgNetFee: 125,
        taxPrepReturns: 1600,
        taxRushReturns: 400,
        discountsPct: 3
      }
      
      const result = calc(inputs)
      expect(result.totalRevenue).toBe(200000) // Only tax prep for now
    })
  })
  
  describe('Status Calculations', () => {
    const defaultThresholds: Thresholds = {
      cprGreen: 25,
      cprYellow: 30,
      nimGreen: 20,
      nimYellow: 15,
      netIncomeWarn: -5000
    }
    
    it('should determine CPR status correctly', () => {
      expect(statusForCPR(20, defaultThresholds)).toBe('green')
      expect(statusForCPR(30, defaultThresholds)).toBe('yellow')
      expect(statusForCPR(40, defaultThresholds)).toBe('red')
    })
    
    it('should determine margin status correctly', () => {
      expect(statusForMargin(25, defaultThresholds)).toBe('green')
      expect(statusForMargin(15, defaultThresholds)).toBe('yellow')
      expect(statusForMargin(5, defaultThresholds)).toBe('red')
    })
  })
  
  describe('Data Validation', () => {
    it('should handle edge cases gracefully', () => {
      const edgeCaseInputs: CalculationInputs = {
        region: 'US',
        scenario: 'Custom',
        avgNetFee: 0.01,
        taxPrepReturns: 1,
        taxRushReturns: 0,
        discountsPct: 0
      }
      
      const result = calc(edgeCaseInputs)
      expect(result.totalRevenue).toBe(0.01)
    })
  })
  
  describe('Regional Differences', () => {
    it('should apply correct business rules per region', () => {
      const usInputs: CalculationInputs = {
        region: 'US',
        scenario: 'Custom',
        avgNetFee: 125,
        taxPrepReturns: 1600,
        taxRushReturns: 0,
        discountsPct: 3
      }
      
      const caInputs: CalculationInputs = {
        region: 'CA',
        scenario: 'Custom',
        avgNetFee: 125,
        taxPrepReturns: 1600,
        taxRushReturns: 400,
        discountsPct: 3
      }
      
      const usResult = calc(usInputs)
      const caResult = calc(caInputs)
      
      // Both should have the same revenue for now (only tax prep)
      expect(usResult.totalRevenue).toBe(caResult.totalRevenue)
    })
  })
})
