// NewStoreSection.tsx - Target Performance Goals for new stores
// Manual entry forecasting without growth slider

import { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { calculateNetIncome } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function NewStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // Auto-calc Gross when no manual override
  useEffect(() => {
    if (
      answers.grossFees === undefined && // only if no override
      answers.taxPrepReturns &&
      answers.avgNetFee
    ) {
      const autoGross = answers.taxPrepReturns * answers.avgNetFee
      updateAnswers({ grossFees: autoGross })
    }
  }, [answers.grossFees, answers.taxPrepReturns, answers.avgNetFee, updateAnswers])

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
        fieldsToeClearOnDisable={['otherIncome']}
        titleColor="#6b7280"
      />

      {/* Target Performance Goals Box */}
      <FormSection title="Target Performance Goals" icon="🎯" backgroundColor="#f8fafc" borderColor="#059669">
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" helpText="Your target number of tax returns" required>
          <NumberInput
            value={answers.taxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField label="Average Net Fee" helpText="Your target average net fee per return" required>
          <CurrencyInput
            value={answers.avgNetFee}
            placeholder="e.g., 130"
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </FormField>

        {/* 3. Gross Tax Prep Fees (auto-calc with override) */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee (you can override)">
          <CurrencyInput
            value={
              answers.grossFees ??
              (answers.taxPrepReturns && answers.avgNetFee
                ? answers.taxPrepReturns * answers.avgNetFee
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ grossFees: value })}
            backgroundColor={answers.grossFees !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 4. TaxRush (conditional) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div
            style={{
              padding: '0.75rem',
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              margin: '0.5rem 0',
            }}
          >
            <FormField label="TaxRush Returns" helpText="Your target TaxRush returns (≈15% of total)">
              <NumberInput
                value={
                  answers.taxRushReturns ??
                  (answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15) : undefined)
                }
                placeholder={
                  answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15).toString() : '240'
                }
                prefix="#"
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </FormField>

            <FormField label="TaxRush Avg Net Fee" helpText="Target avg net fee per TaxRush return">
              <CurrencyInput
                value={answers.taxRushAvgNetFee ?? answers.avgNetFee}
                placeholder={answers.avgNetFee ? answers.avgNetFee.toString() : '125'}
                onChange={(value) => updateAnswers({ taxRushAvgNetFee: value })}
              />
            </FormField>

            <FormField label="TaxRush Gross Fees" helpText="Auto: Returns × Avg Net Fee (override allowed)">
              <CurrencyInput
                value={
                  answers.taxRushGrossFees ??
                  (answers.taxRushReturns && (answers.taxRushAvgNetFee ?? answers.avgNetFee)
                    ? answers.taxRushReturns * (answers.taxRushAvgNetFee ?? answers.avgNetFee)
                    : undefined)
                }
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ taxRushGrossFees: value })}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts (Amt + %) */}
        {/* (unchanged from your version) */}

        {/* 6. Total Tax Prep Income */}
        {/* (unchanged from your version) */}

        {/* 7. Other Income (optional) */}
        {/* (unchanged from your version) */}

        {/* 8. Total Expenses */}
        {/* (unchanged from your version) */}
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
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
            Net Margin: 24% (industry standard)
          </div>
        </div>
      )}
    </>
  )
}
