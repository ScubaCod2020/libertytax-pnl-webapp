// ExistingStoreSection.tsx - Last Year Performance & Projected Performance (unified layout)
// - TaxRush blocks mirror NewStore (Returns → Avg Net Fee → Gross Fees)
// - Total Tax Prep Income = Gross Tax Prep Fees − Discounts
// - Discounts ($ ↔ %) dual-sync
// - Total Expenses default = (Tax Prep Income + Other Income) × 76% (overrideable)
// - Net Income summaries for both sections

import React, { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // Ensure default growth % set if we have the core drivers
  useEffect(() => {
    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct === undefined) {
      updateAnswers({ expectedGrowthPct: 0 })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, updateAnswers])

  // Helpers for projected calcs
  const projectedGross =
    answers.projectedGrossFees !== undefined
      ? answers.projectedGrossFees
      : (answers.taxPrepReturns && answers.avgNetFee ? answers.taxPrepReturns * answers.avgNetFee : undefined)

  const lastYearGross = answers.lastYearGrossFees

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
          'lastYearTaxRushAvgNetFee',
          'lastYearTaxRushGrossFees',
          'taxRushAvgNetFee',
          'taxRushGrossFees',
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

      {/* ===================== Last Year Performance ===================== */}
      <FormSection title="Last Year Performance" icon="📊" backgroundColor="#f8fafc" borderColor="#6b7280">
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField label="Average Net Fee">
          <CurrencyInput
            value={answers.manualAvgNetFee}
            placeholder="e.g., 125"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
          />
        </FormField>

        {/* 3. Gross Tax Prep Fees (auto: Returns × ANF; overrideable) */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee">
          <CurrencyInput
            value={
              lastYearGross ??
              (answers.lastYearTaxPrepReturns && answers.manualAvgNetFee
                ? answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
            backgroundColor="#f9fafb"
          />
        </FormField>

        {/* 4. TaxRush (Last Year) — match NewStore layout */}
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
            <FormField label="TaxRush Returns" helpText="Last year's TaxRush returns (≈15% of total)">
              <NumberInput
                value={
                  answers.lastYearTaxRushReturns ??
                  (answers.lastYearTaxPrepReturns
                    ? Math.round(answers.lastYearTaxPrepReturns * 0.15)
                    : undefined)
                }
                placeholder={
                  answers.lastYearTaxPrepReturns
                    ? Math.round(answers.lastYearTaxPrepReturns * 0.15).toString()
                    : '240'
                }
                prefix="#"
                onChange={(value) => updateAnswers({ lastYearTaxRushReturns: value })}
              />
            </FormField>

            <FormField label="TaxRush Avg Net Fee" helpText="Usually same as Avg Net Fee">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee}
                placeholder={answers.manualAvgNetFee ? String(answers.manualAvgNetFee) : '125'}
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
              />
            </FormField>

            <FormField label="TaxRush Gross Fees" helpText="Auto: Returns × Avg Net Fee (override allowed)">
              <CurrencyInput
                value={
                  answers.lastYearTaxRushGrossFees ??
                  (answers.lastYearTaxRushReturns &&
                  (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    ? answers.lastYearTaxRushReturns *
                      (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    : undefined)
                }
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts ($ ↔ %) */}
        <FormField label="Customer Discounts" helpText="Enter either $ or %, the other auto-calculates">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* $ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</
