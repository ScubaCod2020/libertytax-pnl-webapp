// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Golden ticket layout applied: TaxRush block matches NewStore, Total Tax Prep Income = Gross - Discounts

import { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // Ensure default growth % is set
  useEffect(() => {
    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct === undefined) {
      updateAnswers({ expectedGrowthPct: 0 })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, updateAnswers])

  return (
    <>
      {/* Toggles */}
      <ToggleQuestion
        title="TaxRush Returns"
        description="Does your office handle TaxRush returns? (Canada only)"
        fieldName="handlesTaxRush"
        fieldValue={answers.handlesTaxRush}
        positiveLabel="Yes, we handle TaxRush returns"
        negativeLabel="No, we don't handle TaxRush"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={[
          'lastYearTaxRushReturns',
          'lastYearTaxRushReturnsPct',
          'taxRushReturns',
          'taxRushReturnsPct',
        ]}
        titleColor="#1e40af"
        showOnlyWhen={region === 'CA'}
      />

      <ToggleQuestion
        title="Additional Revenue Streams"
        description="Does your office have other income (bookkeeping, notary, etc.)?"
        fieldName="hasOtherIncome"
        fieldValue={answers.hasOtherIncome}
        positiveLabel="Yes, we have other income"
        negativeLabel="No, only tax prep"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={['otherIncome', 'lastYearOtherIncome']}
        titleColor="#6b7280"
      />

      {/* === Last Year Performance === */}
      <FormSection title="Last Year Performance" icon="📊" backgroundColor="#f8fafc" borderColor="#6b7280">
        {/* Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* Average Net Fee */}
        <FormField label="Average Net Fee">
          <CurrencyInput
            value={answers.manualAvgNetFee}
            placeholder="e.g., 125"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
          />
        </FormField>

        {/* Gross Tax Prep Fees */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee">
          <CurrencyInput
            value={
              answers.lastYearGrossFees ??
              (answers.lastYearTaxPrepReturns && answers.manualAvgNetFee
                ? answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
            backgroundColor="#f9fafb"
          />
        </FormField>

        {/* TaxRush (last year, NewStore-style) */}
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
            <FormField label="TaxRush Returns" helpText="Your TaxRush returns last year (≈15% of total)">
              <NumberInput
                value={answers.lastYearTaxRushReturns}
                placeholder={answers.lastYearTaxPrepReturns ? Math.round(answers.lastYearTaxPrepReturns * 0.15).toString() : '240'}
                prefix="#"
                onChange={(value) => updateAnswers({ lastYearTaxRushReturns: value })}
              />
            </FormField>

            <FormField label="TaxRush Avg Net Fee" helpText="Avg fee per TaxRush return">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee}
                placeholder={answers.manualAvgNetFee ? answers.manualAvgNetFee.toString() : '125'}
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
