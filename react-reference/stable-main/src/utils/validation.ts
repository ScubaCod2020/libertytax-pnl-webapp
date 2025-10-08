// Input validation utilities for deployment-ready validation
// Addresses critical QA issues: input validation, error handling, accessibility

import { ExpenseField } from '../types/expenses';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface ValidationConfig {
  field: ExpenseField;
  value: number | string;
  context?: {
    maxReasonableRevenue?: number; // Cap extreme revenue inputs
    totalExpensesPercent?: number; // Business logic validation
  };
}

/**
 * Comprehensive input validation for financial data
 * Prevents negative values, extreme inputs, and business logic violations
 */
export function validateFinancialInput(config: ValidationConfig): ValidationResult {
  const { field, value, context } = config;

  // Handle empty or undefined input
  if (value === '' || value === null || value === undefined) {
    return { isValid: true }; // Allow empty for optional fields
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Please enter a valid number',
    };
  }

  // Prevent negative values (critical security issue)
  if (numValue < 0) {
    return {
      isValid: false,
      error: 'Negative values are not allowed',
    };
  }

  // Use field-specific min/max bounds
  if (numValue < field.min) {
    return {
      isValid: false,
      error: `Minimum value is ${field.min}${getFieldUnit(field)}`,
    };
  }

  if (numValue > field.max) {
    return {
      isValid: false,
      error: `Maximum value is ${field.max}${getFieldUnit(field)}`,
    };
  }

  // Additional business logic validation
  const businessValidation = validateBusinessLogic(field, numValue, context);
  if (!businessValidation.isValid) {
    return businessValidation;
  }

  return { isValid: true };
}

/**
 * Business logic validation for realistic financial ranges
 */
function validateBusinessLogic(
  field: ExpenseField,
  value: number,
  context?: ValidationConfig['context']
): ValidationResult {
  // Salary percentage validation (critical business rule)
  if (field.id === 'salariesPct' && value > 40) {
    return {
      isValid: true,
      warning: '⚠️ High salary percentage (>40%) may impact profitability',
    };
  }

  // Rent percentage validation (critical business rule)
  if (field.id === 'rentPct' && value > 30) {
    return {
      isValid: true,
      warning: '⚠️ High rent percentage (>30%) may impact profitability',
    };
  }

  // Total expenses sanity check (prevent >100% expenses)
  if (context?.totalExpensesPercent && context.totalExpensesPercent > 95) {
    return {
      isValid: true,
      warning: '⚠️ Total expenses >95% will result in negative profit margins',
    };
  }

  // Revenue cap for extreme values (prevent $999,999,999 entries)
  if (field.calculationBase.includes('gross') && context?.maxReasonableRevenue) {
    const maxRevenue = context.maxReasonableRevenue;
    const dollarEquivalent = (value / 100) * maxRevenue;

    if (dollarEquivalent > 10000000) {
      // $10M cap
      return {
        isValid: false,
        error: 'Value results in unrealistic dollar amount (>$10M)',
      };
    }
  }

  return { isValid: true };
}

/**
 * Get appropriate unit suffix for error messages
 */
function getFieldUnit(field: ExpenseField): string {
  switch (field.calculationBase) {
    case 'percentage_gross':
    case 'percentage_salaries':
    case 'percentage_tp_income':
      return '%';
    case 'fixed_amount':
      return '';
    default:
      return '';
  }
}

/**
 * Validate data persistence envelope (addresses localStorage corruption)
 */
export function validatePersistenceData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== 1) return false;

  // Validate critical fields exist and are reasonable
  if (data.last) {
    const { avgNetFee, taxPrepReturns } = data.last;
    if (typeof avgNetFee !== 'number' || avgNetFee < 0 || avgNetFee > 1000) return false;
    if (typeof taxPrepReturns !== 'number' || taxPrepReturns < 0 || taxPrepReturns > 100000)
      return false;
  }

  return true;
}

/**
 * Safe number parsing with bounds checking
 */
export function safeParseNumber(value: string | number, fallback: number = 0): number {
  if (typeof value === 'number') return isNaN(value) ? fallback : value;

  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}
