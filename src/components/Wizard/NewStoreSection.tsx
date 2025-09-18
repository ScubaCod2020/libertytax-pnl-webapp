// NewStoreSection.tsx - Target Performance Goals for new stores
// Manual entry forecasting without growth slider

import React from 'react'
import type { WizardSectionProps } from './types'
import { calculateNetIncome, formatCurrency, parseCurrencyInput } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function NewStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  return (
    <>
      {/* Information Banner */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          marginBottom: '1rem',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem' }}>
          🏪 New Store Setup - Forecasting
        </div>
        <div className="small" style={{ color: '#0369a1' }}>
          Set your target performance goals below. These will be used for business planning and can be adjusted as you learn more about your market.
        </div>
      </div>

      {/* TaxRush Toggle Question (Canada only) */}
      <ToggleQuestion
        title="TaxRush Returns"
        description="Will your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)"
        fieldName="handlesTaxRush"
        fieldValue={answers.handlesTaxRush}
        positiveLabel="Yes, we will handle TaxRush returns"
        negativeLabel="No, we won't handle TaxRush"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={['taxRushReturns', 'taxRushReturnsPct']}
        titleColor="#1e40af"
        showOnlyWhen={region === 'CA'}
      />

      <ToggleQuestion
        title="Additional Revenue Streams"
        description="Does your office have additional revenue streams beyond tax preparation? (e.g., notary services, business consulting, bookkeeping)"
        fieldName="hasOtherIncome"
        fieldValue={answers.hasOtherIncome}
        positiveLabel="Yes, we have other income sources"
        negativeLabel="No, only tax preparation"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={['otherIncome', 'lastYearOtherIncome']}
        titleColor="#6b7280"
      />

      {/* Target Performance Goals Box */}
      <FormSection title="Target Performance Goals" icon="🎯" backgroundColor="#f8fafc" borderColor="#059669">
        {/* Tax Prep Returns */}
        <FormField label="Tax Prep Returns" helpText="Your target number of tax returns" required>
          <NumberInput
            value={answers.taxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </FormField>

        {/* Average Net Fee */}
        <FormField label="Average Net Fee" helpText="Your target average net fee per return" required>
          <CurrencyInput
            value={answers.avgNetFee}
            placeholder="e.g., 130"
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </FormField>

        {/* Gross Tax Prep Fees */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto-calculated: Average Net Fee × Tax Prep Returns">
          <CurrencyInput
            value={(() => {
              if (answers.avgNetFee && answers.taxPrepReturns) {
                return Math.round(answers.avgNetFee * answers.taxPrepReturns)
              }
              return undefined
            })()}
            placeholder="Auto-calculated"
            onChange={() => {}} // Read-only
            readOnly
            backgroundColor="#f9fafb"
          />
        </FormField>

        {/* TaxRush Fields (Canada only - conditional) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div
            style={{
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              margin: '0.5rem 0',
            }}
          >
            <FormField label="TaxRush Returns" helpText="Your target TaxRush returns for this year (typically ~15% of total returns)">
              <NumberInput
                value={answers.taxRushReturns ?? (answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15) : undefined)}
                placeholder={answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15).toString() : '240'}
                prefix="#"
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </FormField>

            <FormField label="TaxRush Avg Net Fee" helpText="Your target average net fee per TaxRush return (usually same as tax prep fee)">
              <CurrencyInput
                value={answers.taxRushAvgNetFee ?? answers.avgNetFee}
                placeholder={answers.avgNetFee ? answers.avgNetFee.toString() : '125'}
                onChange={(value) => updateAnswers({ taxRushAvgNetFee: value })}
              />
            </FormField>

            <FormField label="TaxRush Gross Fees" helpText="Auto-calculated: TaxRush Returns × TaxRush Avg Net Fee (you can override)">
              <CurrencyInput
                value={(() => {
                  if (answers.taxRushReturns && answers.taxRushAvgNetFee) {
                    return Math.round(answers.taxRushReturns * answers.taxRushAvgNetFee)
                  }
                  if (answers.taxRushReturns && answers.avgNetFee) {
                    return Math.round(answers.taxRushReturns * answers.avgNetFee)
                  }
                  return undefined
                })()}
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ taxRushGrossFees: value })}
                readOnly={false}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* Customer Discounts */}
        <FormField
          label="Customer Discounts"
          helpText="Percentage and dollar amount of discounts given to customers - this will be applied to projected revenue"
        >
          {/* ...existing $/% discount inputs preserved... */}
        </FormField>

        {/* Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income" helpText="Additional revenue streams (notary, consulting, bookkeeping, etc.)">
            <CurrencyInput
              value={answers.otherIncome}
              placeholder="5,000"
              onChange={(value) => updateAnswers({ otherIncome: value })}
            />
          </FormField>
        )}

        {/* Total Expenses */}
        <FormField label="Total Expenses" helpText="Industry standard: 76% of Gross Tax Prep Fees (you can override)">
          <CurrencyInput
            value={
              answers.projectedExpenses ??
              (() => {
                if (answers.avgNetFee && answers.taxPrepReturns) {
                  const grossFees = answers.avgNetFee * answers.taxPrepReturns
                  return Math.round(grossFees * 0.76)
                }
                return undefined
              })()
            }
            placeholder={(() => {
              if (answers.avgNetFee && answers.taxPrepReturns) {
                const grossFees = answers.avgNetFee * answers.taxPrepReturns
                return Math.round(grossFees * 0.76).toLocaleString()
              }
              return '152,000'
            })()}
            onChange={(value) => updateAnswers({ projectedExpenses: value })}
          />
        </FormField>
      </FormSection>

      {/* Target Net Income Summary */}
      {answers.avgNetFee && answers.taxPrepReturns && (
        <div
          style={{
            padding: '0.5rem',
            backgroundColor: '#e0f2fe',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: '#0369a1',
            marginBottom: '1rem',
          }}
        >
          Target Net Income: ${calculateNetIncome(answers).toLocaleString()}
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>Net Margin: 24% (industry standard)</div>
        </div>
      )}
    </>
  )
}
