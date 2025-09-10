// ValidatedInput.tsx - Production-ready input component with comprehensive validation
// Addresses critical QA issues: input validation, error handling, accessibility

import React, { useState, useEffect } from 'react'
import { ExpenseField } from '../types/expenses'
import { validateFinancialInput, ValidationResult, safeParseNumber } from '../utils/validation'

interface ValidatedInputProps {
  field: ExpenseField
  value: number | string
  onChange: (value: number, isValid: boolean) => void
  disabled?: boolean
  placeholder?: string
  context?: {
    maxReasonableRevenue?: number
    totalExpensesPercent?: number
  }
  style?: React.CSSProperties
  className?: string
}

export function ValidatedInput({
  field,
  value,
  onChange,
  disabled = false,
  placeholder,
  context,
  style,
  className
}: ValidatedInputProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true })
  const [displayValue, setDisplayValue] = useState<string>('')

  // Update display value when prop value changes
  useEffect(() => {
    const stringValue = typeof value === 'number' ? value.toString() : value
    setDisplayValue(stringValue || '')
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setDisplayValue(inputValue)

    // Validate the input
    const validationResult = validateFinancialInput({
      field,
      value: inputValue,
      context
    })

    setValidation(validationResult)

    // Convert to number and call onChange
    const numericValue = safeParseNumber(inputValue, 0)
    onChange(numericValue, validationResult.isValid)
  }

  const handleBlur = () => {
    // Revalidate on blur for final check
    const finalValidation = validateFinancialInput({
      field,
      value: displayValue,
      context
    })
    setValidation(finalValidation)
  }

  // Determine input styling based on validation state
  const getInputStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '1rem',
      width: '100%',
      ...style
    }

    if (!validation.isValid) {
      return {
        ...baseStyle,
        borderColor: '#dc2626',
        backgroundColor: '#fef2f2'
      }
    }

    if (validation.warning) {
      return {
        ...baseStyle,
        borderColor: '#f59e0b',
        backgroundColor: '#fffbeb'
      }
    }

    return baseStyle
  }

  // Generate unique IDs for accessibility
  const inputId = `input-${field.id}`
  const errorId = `error-${field.id}`
  const warningId = `warning-${field.id}`

  return (
    <div className={className}>
      <input
        id={inputId}
        type="number"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        style={getInputStyle()}
        // Accessibility attributes (addresses critical accessibility violations)
        aria-label={`${field.label} (${getFieldDescription(field)})`}
        aria-describedby={getAriaDescribedBy(validation, errorId, warningId)}
        aria-invalid={!validation.isValid ? 'true' : 'false'}
        aria-required="false" // Most expense fields are optional
      />
      
      {/* Error message display */}
      {!validation.isValid && validation.error && (
        <div
          id={errorId}
          role="alert"
          style={{
            color: '#dc2626',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span>❌</span>
          {validation.error}
        </div>
      )}

      {/* Warning message display */}
      {validation.isValid && validation.warning && (
        <div
          id={warningId}
          role="alert"
          aria-live="polite"
          style={{
            color: '#f59e0b',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span>⚠️</span>
          {validation.warning}
        </div>
      )}

      {/* Helper text for field ranges */}
      {validation.isValid && !validation.warning && (
        <div
          style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            marginTop: '0.25rem'
          }}
        >
          Range: {field.min}–{field.max}{getFieldUnit(field)}
        </div>
      )}
    </div>
  )
}

/**
 * Helper functions
 */
function getFieldDescription(field: ExpenseField): string {
  const unitSuffix = getFieldUnit(field)
  return `${field.min}–${field.max}${unitSuffix}`
}

function getFieldUnit(field: ExpenseField): string {
  switch (field.calculationBase) {
    case 'percentage_gross':
    case 'percentage_salaries':  
    case 'percentage_tp_income':
      return '%'
    case 'fixed_amount':
      return ''
    default:
      return ''
  }
}

function getAriaDescribedBy(
  validation: ValidationResult,
  errorId: string,
  warningId: string
): string {
  const describedBy: string[] = []
  
  if (!validation.isValid && validation.error) {
    describedBy.push(errorId)
  }
  
  if (validation.isValid && validation.warning) {
    describedBy.push(warningId)
  }
  
  return describedBy.join(' ') || undefined
}
