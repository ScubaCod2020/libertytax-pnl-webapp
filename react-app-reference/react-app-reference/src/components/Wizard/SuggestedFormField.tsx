/**
 * Enhanced FormField with Suggestion Display
 * Shows suggested values that demonstrate calculation flow
 */

import React from 'react';
import FormField from './FormField';
import { CalculatedSuggestions } from '../../utils/suggestionEngine';

interface SuggestedFormFieldProps {
  label: string;
  helpText?: string;
  required?: boolean;
  fieldId: keyof CalculatedSuggestions;
  suggestions?: CalculatedSuggestions | null;
  isCalculated?: boolean;
  children: React.ReactNode;
}

export default function SuggestedFormField({
  label,
  helpText,
  required,
  fieldId,
  suggestions,
  isCalculated = false,
  children,
}: SuggestedFormFieldProps) {
  const suggestedValue = suggestions?.[fieldId];
  const hasSuggestion = suggestedValue !== undefined && suggestedValue !== null;

  // Format suggestion display based on field type
  const formatSuggestion = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '';

    // Currency fields
    if (
      fieldId.includes('fees') ||
      fieldId.includes('income') ||
      fieldId.includes('revenue') ||
      fieldId.includes('expenses') ||
      fieldId.includes('Amount')
    ) {
      return `$${value.toLocaleString()}`;
    }

    // Percentage fields
    if (fieldId.includes('Pct') || fieldId === 'discountsPct') {
      return `${value.toFixed(1)}%`;
    }

    // Count fields (returns)
    if (fieldId.includes('Returns') || fieldId.includes('returns')) {
      return value.toLocaleString();
    }

    // Default number formatting
    return value.toLocaleString();
  };

  // Enhanced help text with suggestion and calculation info
  const enhancedHelpText = () => {
    if (!hasSuggestion) return helpText;

    const suggestionText = `Suggested: ${formatSuggestion(suggestedValue as number)}`;

    if (isCalculated) {
      const calculationText = 'Auto-calculated from inputs above';
      return helpText
        ? `${helpText} • ${calculationText} • ${suggestionText}`
        : `${calculationText} • ${suggestionText}`;
    }

    return helpText ? `${helpText} • ${suggestionText}` : suggestionText;
  };

  return (
    <FormField label={label} helpText={enhancedHelpText()} required={required}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Input Field */}
        <div style={{ flex: 1 }}>{children}</div>

        {/* Suggestion Display */}
        {hasSuggestion && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 'fit-content',
            }}
          >
            {/* Suggestion Badge */}
            <div
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: isCalculated ? '#dbeafe' : '#f0f9ff',
                border: isCalculated ? '1px solid #3b82f6' : '1px solid #0ea5e9',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: isCalculated ? '#1d4ed8' : '#0369a1',
                whiteSpace: 'nowrap',
              }}
            >
              {isCalculated ? '📊' : '💡'} {formatSuggestion(suggestedValue as number)}
            </div>

            {/* Visual flow indicator for calculated fields */}
            {isCalculated && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontWeight: 500,
                }}
              >
                ←
              </div>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}

/**
 * Currency input with suggestion
 */
export function SuggestedCurrencyInput({
  value,
  placeholder,
  onChange,
  width = '140px',
  disabled = false,
  fieldId,
  suggestions,
}: {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  width?: string;
  disabled?: boolean;
  fieldId: keyof CalculatedSuggestions;
  suggestions?: CalculatedSuggestions | null;
}) {
  const suggestedValue = suggestions?.[fieldId] as number;
  const displayPlaceholder =
    placeholder || (suggestedValue ? `${suggestedValue.toLocaleString()}` : undefined);

  return (
    <input
      type="number"
      value={value ?? ''}
      placeholder={displayPlaceholder}
      onChange={(e) => onChange(+e.target.value || undefined)}
      disabled={disabled}
      style={{
        width,
        padding: '0.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '0.875rem',
        backgroundColor: disabled ? '#f9fafb' : 'white',
        color: disabled ? '#6b7280' : '#111827',
      }}
    />
  );
}

/**
 * Number input with suggestion
 */
export function SuggestedNumberInput({
  value,
  placeholder,
  onChange,
  prefix,
  width = '140px',
  disabled = false,
  fieldId,
  suggestions,
}: {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  prefix?: string;
  width?: string;
  disabled?: boolean;
  fieldId: keyof CalculatedSuggestions;
  suggestions?: CalculatedSuggestions | null;
}) {
  const suggestedValue = suggestions?.[fieldId] as number;
  const displayPlaceholder =
    placeholder || (suggestedValue ? `${suggestedValue.toLocaleString()}` : undefined);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {prefix && (
        <span
          style={{
            marginRight: '0.25rem',
            fontWeight: 500,
            color: '#6b7280',
          }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value ?? ''}
        placeholder={displayPlaceholder}
        onChange={(e) => onChange(+e.target.value || undefined)}
        disabled={disabled}
        style={{
          width,
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.875rem',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          color: disabled ? '#6b7280' : '#111827',
        }}
      />
    </div>
  );
}

/**
 * Percentage input with suggestion
 */
export function SuggestedPercentageInput({
  value,
  placeholder,
  onChange,
  width = '140px',
  disabled = false,
  max = 100,
  fieldId,
  suggestions,
}: {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  width?: string;
  disabled?: boolean;
  max?: number;
  fieldId: keyof CalculatedSuggestions;
  suggestions?: CalculatedSuggestions | null;
}) {
  const suggestedValue = suggestions?.[fieldId] as number;
  const displayPlaceholder =
    placeholder || (suggestedValue ? `${suggestedValue.toFixed(1)}` : undefined);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="number"
        step="0.1"
        min="0"
        max={max}
        value={value ?? ''}
        placeholder={displayPlaceholder}
        onChange={(e) => onChange(+e.target.value || undefined)}
        disabled={disabled}
        style={{
          width,
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.875rem',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          color: disabled ? '#6b7280' : '#111827',
        }}
      />
      <span
        style={{
          marginLeft: '0.25rem',
          fontWeight: 500,
          color: '#6b7280',
        }}
      >
        %
      </span>
    </div>
  );
}
