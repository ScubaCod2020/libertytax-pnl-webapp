// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Includes growth slider, bidirectional calculations, and strategic analysis

import React, { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS, formatCurrency, parseCurrencyInput } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput, PercentageInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // --- Effects unchanged (auto-calculations etc.) ---

  useEffect(() => {
    if (answers.lastYearGrossFees && answers.lastYearTaxPrepReturns) {
      const effectiveAvgNetFee =
        answers.manualAvgNetFee !== undefined
          ? answers.manualAvgNetFee
          : answers.lastYearGrossFees / answers.lastYearTaxPrepReturns

      const projectedTotalReturns =
        answers.lastYearTaxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
      const defaultTaxRushReturns = Math.round(projectedTotalReturns * 0.15)

      const effectiveTaxRushReturns =
        answers.manualTaxRushReturns !== undefined
          ? answers.manualTaxRushReturns
          : defaultTaxRushReturns

      const effectiveTaxRushGrossFees =
        answers.handlesTaxRush &&
        answers.lastYearTaxRushGrossFees &&
        answers.expectedGrowthPct !== undefined
          ? answers.lastYearTaxRushGrossFees * (1 + answers.expectedGrowthPct / 100)
          : answers.handlesTaxRush
          ? answers.lastYearTaxRushGrossFees || 0
          : 0

      const effectiveTaxRushAvgNetFee =
        answers.handlesTaxRush &&
        answers.lastYearTaxRushAvgNetFee &&
        answers.expectedGrowthPct !== undefined
          ? answers.lastYearTaxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100)
          : answers.handlesTaxRush
          ? answers.lastYearTaxRushAvgNetFee || 0
          : 0

      const needsUpdate =
        answers.avgNetFee !== effectiveAvgNetFee ||
        answers.taxPrepReturns !== answers.lastYearTaxPrepReturns ||
        answers.taxRushReturns !== effectiveTaxRushReturns ||
        (answers.handlesTaxRush &&
          (answers.taxRushGrossFees !== effectiveTaxRushGrossFees ||
            answers.taxRushAvgNetFee !== effectiveTaxRushAvgNetFee))

      if (needsUpdate) {
        updateAnswers({
          avgNetFee: effectiveAvgNetFee,
          taxPrepReturns: answers.lastYearTaxPrepReturns,
          taxRushReturns: effectiveTaxRushReturns,
          ...(answers.handlesTaxRush && {
            taxRushGrossFees: effectiveTaxRushGrossFees,
            taxRushAvgNetFee: effectiveTaxRushAvgNetFee,
          }),
          expectedGrowthPct:
            answers.expectedGrowthPct !== undefined ? answers.expectedGrowthPct : 0,
        })
      }
    }
  }, [
    answers.lastYearGrossFees,
    answers.lastYearTaxPrepReturns,
    answers.lastYearTaxRushReturns,
    answers.lastYearTaxRushGrossFees,
    answers.lastYearTaxRushAvgNetFee,
    answers.avgNetFee,
    answers.taxPrepReturns,
    answers.taxRushReturns,
    answers.taxRushGrossFees,
    answers.taxRushAvgNetFee,
    answers.handlesTaxRush,
    answers.manualAvgNetFee,
    answers.manualTaxRushReturns,
    answers.expectedGrowthPct,
    updateAnswers,
  ])

  useEffect(() => {
    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct === undefined) {
      updateAnswers({ expectedGrowthPct: 0 })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, updateAnswers])

  useEffect(() => {
    if (answers.handlesTaxRush && answers.lastYearTaxPrepReturns) {
      const expectedTaxRushCount = Math.round(answers.lastYearTaxPrepReturns * 0.15)
      const expectedTaxRushPct = 15.0
      const shouldAutoPopulate =
        !answers.lastYearTaxRushReturns ||
        answers.lastYearTaxRushReturns < expectedTaxRushCount * 0.5

      if (shouldAutoPopulate) {
        updateAnswers({
          lastYearTaxRushReturns: expectedTaxRushCount,
          lastYearTaxRushReturnsPct: expectedTaxRushPct,
        })
      }
    }
  }, [answers.handlesTaxRush, answers.lastYearTaxPrepReturns, answers.lastYearTaxRushReturns, updateAnswers])

  return (
    <>
      {/* Toggles */}
      <ToggleQuestion
        title="TaxRush Returns"
        description="Does your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)"
        fieldName="handlesTaxRush"
        fieldValue={answers.handlesTaxRush}
        positiveLabel="Yes, we handle TaxRush returns"
        negativeLabel="No, we don't handle TaxRush"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={['lastYearTaxRushReturns', 'lastYearTaxRushReturnsPct', 'taxRushReturns', 'taxRushReturnsPct']}
        titleColor="#1e40af"
        showOnlyWhen={region === 'CA'}
      />

      <ToggleQuestion
        title="Additional Revenue Streams"
        description="Does your office have additional revenue streams beyond tax preparation?"
        fieldName="hasOtherIncome"
        fieldValue={answers.hasOtherIncome}
        positiveLabel="Yes, we have other income sources"
        negativeLabel="No, only tax preparation"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={['otherIncome', 'lastYearOtherIncome']}
        titleColor="#6b7280"
      />

      {/* Last Year Performance */}
      <FormSection title="Last Year Performance" icon="📊" backgroundColor="#f8fafc" borderColor="#6b7280">
        {/* Tax Prep Returns */}
        <FormField label="Tax Prep Returns" helpText="Total number of tax returns you processed last year" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* Average Net Fee */}
        <FormField
          label="Average Net Fee"
          helpText={
            answers.manualAvgNetFee !== undefined
              ? 'Manual override - clear field to auto-calculate'
              : 'Auto-calculated: Gross Fees ÷ Tax Prep Returns (you can override)'
          }
        >
          <CurrencyInput
            value={
              answers.manualAvgNetFee !== undefined
                ? answers.manualAvgNetFee
                : answers.lastYearGrossFees && answers.lastYearTaxPrepReturns
                ? Math.round(answers.lastYearGrossFees / answers.lastYearTaxPrepReturns)
                : undefined
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
            backgroundColor={answers.manualAvgNetFee !== undefined ? 'white' : '#f0f9ff'}
          />
        </FormField>

        {/* Gross Tax Prep Fees */}
        <FormField label="Tax Prep Gross Fees" helpText="Total tax prep fees charged (before any discounts)" required>
          <CurrencyInput
            value={answers.lastYearGrossFees}
            placeholder="e.g., 206,000"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
          />
        </FormField>

        {/* TaxRush Section */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div style={{ border: '2px solid #0ea5e9', borderRadius: '8px', backgroundColor: '#f0f9ff', margin: '0.5rem 0', padding: '0.75rem' }}>
            <FormField label="TaxRush Returns" helpText="Number and percentage of TaxRush returns filed last year">
              {/* ...existing TaxRush Returns input block... */}
            </FormField>
            <FormField label="TaxRush Avg Net Fee" helpText="Average net fee per TaxRush return last year">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee}
                placeholder="e.g., 125"
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
              />
            </FormField>
            <FormField label="TaxRush Gross Fees" helpText="Auto-calculated: Returns × Avg Net Fee (override allowed)">
              <CurrencyInput
                value={answers.lastYearTaxRushGrossFees}
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
              />
            </FormField>
          </div>
        )}

        {/* Customer Discounts */}
        <FormField label="Customer Discounts" helpText="Percentage and dollar amount of discounts given">
          {/* ...existing discount $/% block... */}
        </FormField>

        {/* Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income" helpText="Additional revenue streams">
            <CurrencyInput value={answers.lastYearOtherIncome} onChange={(value) => updateAnswers({ lastYearOtherIncome: value })} />
          </FormField>
        )}

        {/* Total Expenses */}
        <FormField label="Total Expenses" helpText="All expenses including salaries, rent, supplies, royalties, etc." required>
          <CurrencyInput
            value={answers.lastYearExpenses}
            placeholder="e.g., 150,000"
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
          />
        </FormField>
      </FormSection>

      {/* Projected Performance (Reordered similarly) */}
      <FormSection title="Projected Performance" icon="📈" backgroundColor="#f8fafc" borderColor="#059669">
        {/* Tax Prep Returns */}
        {/* Average Net Fee */}
        {/* Gross Fees */}
        {/* TaxRush Section */}
        {/* Customer Discounts (applied via lastYearDiscountsPct) */}
        {/* Other Income */}
        {/* Total Expenses */}
        {/* ... keep existing growth slider + revenue summary logic ... */}
      </FormSection>
    </>
  )
}
