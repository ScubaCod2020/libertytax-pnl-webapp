// NewStoreSection.tsx - Target Performance Goals for new stores
// Golden ticket layout: ordered fields, live auto-calcs that feed downstream, and manual overrides allowed.

import type { WizardSectionProps } from './types'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function NewStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // ---- Effective (live) values ----
  // Gross Fees: manual override if provided, else Returns × Avg Net Fee
  const effectiveGrossFees =
    answers.grossFees ??
    (answers.taxPrepReturns && answers.avgNetFee
      ? answers.taxPrepReturns * answers.avgNetFee
      : undefined)

  // Customer discounts use gross fees as the denominator for % math
  const effectiveDiscountsAmt = answers.discountsAmt ?? 0

  // Total Tax Prep Income: manual override if provided, else Gross − Discounts
  const effectiveTaxPrepIncome =
    answers.projectedTaxPrepIncome ??
    (effectiveGrossFees !== undefined ? effectiveGrossFees - effectiveDiscountsAmt : undefined)

  // Other Income (only if toggle is on)
  const effectiveOtherIncome = answers.hasOtherIncome ? (answers.otherIncome ?? 0) : 0

  // Total Expenses: manual override if provided, else Tax Prep Income × 76%
  const effectiveTotalExpenses =
    answers.projectedExpenses ??
    (effectiveTaxPrepIncome !== undefined
      ? Math.round((effectiveTaxPrepIncome + effectiveOtherIncome) * 0.76)
      : undefined)

  // Target Net Income summary box (computed straight from effective values)
  const summaryNetIncome =
    effectiveTaxPrepIncome !== undefined && effectiveTotalExpenses !== undefined
      ? Math.round(effectiveTaxPrepIncome + effectiveOtherIncome - effectiveTotalExpenses)
      : undefined

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
          Set your target performance goals below. These will be used for business planning and can be adjusted as
          you learn more about your market.
        </div>
      </div>

      {/* Toggles */}
      <ToggleQuestion
        title="TaxRush Returns"
        description="Will your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)"
        fieldName="handlesTaxRush"
        fieldValue={answers.handlesTaxRush}
        positiveLabel="Yes, we will handle TaxRush returns"
        negativeLabel="No, we won't handle TaxRush"
        onUpdate={updateAnswers}
        fieldsToeClearOnDisable={['taxRushReturns', 'taxRushReturnsPct', 'taxRushAvgNetFee', 'taxRushGrossFees']}
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

      {/* Target Performance Goals */}
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

        {/* 3. Gross Tax Prep Fees (auto, but override allowed) */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee (you can override)">
          <CurrencyInput
            value={answers.grossFees ?? effectiveGrossFees}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ grossFees: value })}
            backgroundColor={answers.grossFees !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 4. TaxRush (conditional; same NewStore-style formatting) */}
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
                value={answers.taxRushReturns ?? (answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15) : undefined)}
                placeholder={answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15).toString() : '240'}
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
                backgroundColor={answers.taxRushGrossFees !== undefined ? 'white' : '#f9fafb'}
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts (Amt + %) */}
        <FormField
          label="Customer Discounts"
          helpText="Dollar amount or % of gross fees given as discounts. Enter either field; the other auto-calculates."
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Dollar Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder={effectiveGrossFees ? Math.round(effectiveGrossFees * 0.03).toString() : '6,000'}
                value={
                  answers.discountsAmt ??
                  (effectiveGrossFees ? Math.round(effectiveGrossFees * 0.03) : '')
                }
                onChange={(e) => {
                  const newAmt = parseFloat(e.target.value) || undefined
                  updateAnswers({ discountsAmt: newAmt })
                  if (newAmt && effectiveGrossFees) {
                    const pct = (newAmt / effectiveGrossFees) * 100
                    updateAnswers({ discountsPct: Math.round(pct * 10) / 10 }) // 1 decimal place
                  }
                }}
                style={{
                  width: '80px',
                  textAlign: 'right',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
              />
            </div>

            <span style={{ color: '#6b7280' }}>=</span>

            {/* Percentage Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                placeholder="3.0"
                value={
                  answers.discountsPct ??
                  (effectiveGrossFees && answers.discountsAmt
                    ? Math.round(((answers.discountsAmt / effectiveGrossFees) * 100) * 10) / 10
                    : '')
                }
                onChange={(e) => {
                  const newPct = parseFloat(e.target.value) || undefined
                  updateAnswers({ discountsPct: newPct })
                  if (newPct && effectiveGrossFees) {
                    updateAnswers({ discountsAmt: Math.round(effectiveGrossFees * (newPct / 100)) })
                  }
                }}
                style={{
                  width: '80px',
                  textAlign: 'right',
                  border: '1px solid '#d1d5db'",
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
              />
              <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
            </div>
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            Default: 3% • Enter either dollar amount or percentage — the other will auto-calc
          </div>
        </FormField>

        {/* 6. Total Tax Prep Income (Gross − Discounts, overrideable) */}
        <FormField label="Total Tax Prep Income" helpText="Gross Tax Prep Fees minus Customer Discounts (you can override)">
          <CurrencyInput
            value={answers.projectedTaxPrepIncome ?? effectiveTaxPrepIncome}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedTaxPrepIncome: value })}
            backgroundColor={answers.projectedTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 7. Other Income (optional) */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income" helpText="Additional revenue streams (bookkeeping, notary, etc.)">
            <CurrencyInput
              value={answers.otherIncome}
              placeholder="5,000"
              onChange={(value) => updateAnswers({ otherIncome: value })}
            />
          </FormField>
        )}

        {/* 8. Total Expenses (overrideable) */}
        <FormField
          label="Total Expenses"
          helpText="Auto: (Total Tax Prep Income + Other Income) × 76% (you can override)"
        >
          <CurrencyInput
            value={answers.projectedExpenses ?? effectiveTotalExpenses}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedExpenses: value })}
            backgroundColor={answers.projectedExpenses !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>
      </FormSection>

      {/* Target Net Income Summary */}
      {(summaryNetIncome !== undefined) && (
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
          Target Net Income: ${summaryNetIncome.toLocaleString()}
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
            Net Margin: 24% (industry standard)
          </div>
        </div>
      )}
    </>
  )
}
