// FormField.tsx - Standardized form field component with consistent grid alignment
// Ensures all form fields across the wizard have the same professional layout

import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  helpText?: string;
  required?: boolean;
}

export default function FormField({ label, children, helpText, required }: FormFieldProps) {
  return (
    <div
      style={{
        marginBottom: '0.75rem',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gridTemplateRows: 'auto auto',
        gap: '0.25rem 0.75rem',
        alignItems: 'center',
      }}
    >
      <label
        style={{
          fontWeight: 500,
          gridColumn: '1',
          gridRow: '1',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
      </label>

      <div
        style={{
          gridColumn: '2',
          gridRow: '1',
        }}
      >
        {children}
      </div>

      {helpText && (
        <div
          className="small"
          style={{
            opacity: 0.7,
            gridColumn: '2',
            gridRow: '2',
          }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
}

// Specialized input components that work with FormField
interface CurrencyInputProps {
  value?: number | string;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  width?: string;
  disabled?: boolean;
  readOnly?: boolean;
  backgroundColor?: string;
  ariaLabel?: string;
}

export function CurrencyInput({
  value,
  placeholder,
  onChange,
  width = '140px',
  disabled = false,
  readOnly = false,
  backgroundColor = 'white',
  ariaLabel,
}: CurrencyInputProps) {
  const formatValue = (val: number | string | undefined): string => {
    if (val === undefined || val === '') return '';
    if (typeof val === 'string') return val;
    return val.toLocaleString();
  };

  const parseValue = (inputValue: string): number | undefined => {
    const cleaned = inputValue.replace(/[,$]/g, '');
    if (cleaned === '') return undefined;
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
      <input
        type="text"
        placeholder={placeholder}
        value={formatValue(value)}
        onChange={(e) => onChange(parseValue(e.target.value))}
        aria-label={ariaLabel}
        disabled={disabled}
        readOnly={readOnly}
        style={{
          width,
          textAlign: 'right',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '0.5rem',
          backgroundColor,
          cursor: readOnly ? 'not-allowed' : 'text',
        }}
      />
    </div>
  );
}

interface NumberInputProps {
  value?: number | string;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  width?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  ariaLabel?: string;
}

export function NumberInput({
  value,
  placeholder,
  onChange,
  prefix,
  suffix,
  width = '140px',
  disabled = false,
  min,
  max,
  ariaLabel,
}: NumberInputProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {prefix && <span style={{ fontWeight: 500, color: '#6b7280' }}>{prefix}</span>}
      <input
        type="number"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || undefined)}
        aria-label={ariaLabel}
        disabled={disabled}
        min={min}
        max={max}
        style={{
          width,
          textAlign: 'right',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '0.5rem',
        }}
      />
      {suffix && <span style={{ fontWeight: 500, color: '#6b7280' }}>{suffix}</span>}
    </div>
  );
}

interface PercentageInputProps {
  value?: number;
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  width?: string;
  disabled?: boolean;
  max?: number;
}

export function PercentageInput({
  value,
  placeholder,
  onChange,
  width = '140px',
  disabled = false,
  max = 100,
}: PercentageInputProps) {
  return (
    <NumberInput
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      suffix="%"
      width={width}
      disabled={disabled}
      min={0}
      max={max}
    />
  );
}
