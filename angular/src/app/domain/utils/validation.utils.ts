import { ExpenseField } from '../types/expenses.types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface ValidationContext {
  maxReasonableRevenue?: number;
  totalExpensesPercent?: number;
}

export interface ValidationInput {
  field: ExpenseField;
  value: string | number;
  context?: ValidationContext;
}

/**
 * Safely parse a string to a number with fallback
 */
export function safeParseNumber(value: string | number, fallback: number = 0): number {
  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Validate financial input based on field constraints and context
 */
export function validateFinancialInput(input: ValidationInput): ValidationResult {
  const { field, value, context } = input;
  const numericValue = safeParseNumber(value);

  // Check if empty (optional fields)
  if (!value || value === '') {
    return { isValid: true };
  }

  // Basic range validation
  if (numericValue < field.min) {
    return {
      isValid: false,
      error: `${field.label} cannot be less than ${field.min}${getFieldUnit(field)}`,
    };
  }

  if (numericValue > field.max) {
    return {
      isValid: false,
      error: `${field.label} cannot exceed ${field.max}${getFieldUnit(field)}`,
    };
  }

  // Contextual validation based on field type
  const contextualValidation = validateFieldContext(field, numericValue, context);
  if (!contextualValidation.isValid) {
    return contextualValidation;
  }

  // Warning thresholds for reasonable values
  const warningValidation = checkWarningThresholds(field, numericValue, context);
  if (warningValidation.warning) {
    return { isValid: true, warning: warningValidation.warning };
  }

  return { isValid: true };
}

/**
 * Validate field-specific business logic
 */
function validateFieldContext(
  field: ExpenseField,
  value: number,
  context?: ValidationContext
): ValidationResult {
  // Salary-specific validation
  if (field.id === 'salariesPct' && value > 50) {
    return {
      isValid: false,
      error: 'Payroll exceeding 50% of gross fees may indicate unsustainable labor costs',
    };
  }

  // Rent-specific validation
  if (field.id === 'rentPct' && value > 15) {
    return {
      isValid: false,
      error: 'Rent exceeding 15% of gross fees may impact profitability',
    };
  }

  // Total expense validation
  if (context?.totalExpensesPercent && context.totalExpensesPercent > 90) {
    return {
      isValid: false,
      error: 'Total expenses approaching 90% may result in minimal profit margins',
    };
  }

  // Revenue reasonableness check
  if (context?.maxReasonableRevenue && field.calculationBase === 'fixed_amount') {
    const percentOfRevenue = (value / context.maxReasonableRevenue) * 100;
    if (percentOfRevenue > 25) {
      return {
        isValid: false,
        error: `Fixed expense of ${formatCurrency(value)} represents ${percentOfRevenue.toFixed(1)}% of revenue, which may be excessive`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Check for warning thresholds that don't invalidate but suggest caution
 */
function checkWarningThresholds(
  field: ExpenseField,
  value: number,
  context?: ValidationContext
): { warning?: string } {
  // High percentage warnings
  if (field.calculationBase.includes('percentage') && value > field.max * 0.8) {
    return {
      warning: `${field.label} is approaching the maximum recommended value of ${field.max}${getFieldUnit(field)}`,
    };
  }

  // Low value warnings for critical fields
  if (field.id === 'salariesPct' && value < 10) {
    return {
      warning: 'Very low payroll percentage may indicate insufficient staffing',
    };
  }

  // Regional considerations
  if (field.regionSpecific === 'CA' && field.id === 'insurancePct' && value < 2) {
    return {
      warning: 'Canadian operations typically require higher insurance coverage',
    };
  }

  return {};
}

/**
 * Get the appropriate unit suffix for a field
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
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Validate multiple fields and return overall validation state
 */
export function validateFieldGroup(fields: ValidationInput[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of fields) {
    const result = validateFinancialInput(field);
    if (!result.isValid && result.error) {
      errors.push(result.error);
    }
    if (result.warning) {
      warnings.push(result.warning);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get field description for accessibility
 */
export function getFieldDescription(field: ExpenseField): string {
  const unitSuffix = getFieldUnit(field);
  return `${field.min}–${field.max}${unitSuffix}`;
}
