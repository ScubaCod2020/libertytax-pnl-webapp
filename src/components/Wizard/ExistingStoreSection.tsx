// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Golden ticket layout: NewStore formatting + Production auto-calcs + Growth preload

import { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // === Auto-calcs from production ===

  // Ensure default growth % is set
  useEffect(() => {
    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct === undefined) {
      updateAnswers({ expectedGrowthPct: 0 })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, updateAnswers])

    // Auto-calc Gross when no manual override
useEffect(() => {
  if (
    answers.lastYearGrossFees === undefined && // only if no override
    answers.lastYearTaxPrepReturns &&
    answers.manualAvgNetFee
  ) {
    const autoGross = answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
    updateAnswers({ lastYearGrossFees: autoGross })
  }
}, [answers.lastYearTaxPrepReturns, answers.manualAvgNetFee, answers.lastYearGrossFees, updateAnswers])

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

<FormField
  label="Gross Tax Prep Fees"
  helpText="Auto: Returns × Avg Net Fee (you can override)"
>
  <CurrencyInput
    value={answers.lastYearGrossFees}
    placeholder="Auto-calculated"
    onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
    backgroundColor={answers.lastYearGrossFees !== undefined ? 'white' : '#f9fafb'}
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
              />
            </FormField>

            <FormField label="TaxRush Gross Fees" helpText="Auto: Returns × Avg Net Fee (override allowed)">
              <CurrencyInput
                value={
                  answers.lastYearTaxRushGrossFees ??
                  (answers.lastYearTaxRushReturns && (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    ? answers.lastYearTaxRushReturns * (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    : undefined)
                }
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

       {/* Customer Discounts (Last Year, styled like NewStore) */}
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
        placeholder={
          answers.lastYearGrossFees
            ? Math.round(answers.lastYearGrossFees * 0.03).toString()
            : '6,000'
        }
        value={
          answers.lastYearDiscountsAmt ??
          (answers.lastYearGrossFees
            ? Math.round(answers.lastYearGrossFees * 0.03)
            : '')
        }
        onChange={(e) => {
          const newAmt = parseFloat(e.target.value) || undefined
          updateAnswers({ lastYearDiscountsAmt: newAmt })
          if (newAmt && answers.lastYearGrossFees) {
            const pct = (newAmt / answers.lastYearGrossFees) * 100
            updateAnswers({ lastYearDiscountsPct: Math.round(pct * 10) / 10 })
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
        value={answers.lastYearDiscountsPct ?? ''}
        onChange={(e) => {
          const newPct = parseFloat(e.target.value) || undefined
          updateAnswers({ lastYearDiscountsPct: newPct })
          if (newPct && answers.lastYearGrossFees) {
            const calcAmt = answers.lastYearGrossFees * (newPct / 100)
            updateAnswers({ lastYearDiscountsAmt: Math.round(calcAmt) })
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
      <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
    </div>
  </div>
  <div
    style={{
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6b7280',
      fontStyle: 'italic',
    }}
  >
    Default: 3% • Enter either dollar amount or percentage - the other will auto-calc
  </div>
</FormField>


        {/* Total Tax Prep Income = Gross − Discounts */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (you can override)">
          <CurrencyInput
            value={
              answers.manualTaxPrepIncome ??
              (answers.lastYearGrossFees
                ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0)
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ manualTaxPrepIncome: value })}
            backgroundColor={answers.manualTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income">
            <CurrencyInput
              value={answers.lastYearOtherIncome}
              onChange={(value) => updateAnswers({ lastYearOtherIncome: value })}
            />
          </FormField>
        )}

        {/* Total Expenses */}
        <FormField label="Total Expenses" helpText="Auto: (Tax Prep Income + Other Income) × 76%">
          <CurrencyInput
            value={
              answers.lastYearExpenses ??
              (() => {
                const taxPrepIncome =
                  answers.manualTaxPrepIncome ??
                  (answers.lastYearGrossFees ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0) : 0)
                const other = answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0
                const base = taxPrepIncome + other
                return base > 0 ? Math.round(base * 0.76) : undefined
              })()
            }
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
          />
        </FormField>

        {/* Last Year Net Income Summary */}
        {(answers.lastYearGrossFees || answers.lastYearExpenses) && (
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#e0f2fe',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#0369a1',
              marginTop: '1rem',
            }}
          >
            Last Year Net Income: $
            {(() => {
              const gross = answers.lastYearGrossFees ?? 0
              const discounts = answers.lastYearDiscountsAmt ?? 0
              const other = answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0
              const income = gross - discounts + other
              const expenses = answers.lastYearExpenses ?? 0
              return Math.round(income - expenses).toLocaleString()
            })()}
          </div>
        )}
      </FormSection>

      {/* === Projected Performance === */}
      <FormSection title="Projected Performance" icon="📈" backgroundColor="#f8fafc" borderColor="#059669">
        {/* Growth controls */}
        <FormField label="Performance Change">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="number"
              step="1"
              min="-50"
              max="100"
              value={answers.expectedGrowthPct ?? 0}
              onChange={(e) => updateAnswers({ expectedGrowthPct: parseFloat(e.target.value) })}
            />
            <span>%</span>
            <select
              value={
                answers.expectedGrowthPct !== undefined
                  ? (GROWTH_OPTIONS.find(opt => opt.value === answers.expectedGrowthPct)
                      ? answers.expectedGrowthPct.toString()
                      : 'custom')
                  : '0'
              }
              onChange={(e) => {
                const val = e.target.value
                if (val !== 'custom') updateAnswers({ expectedGrowthPct: parseFloat(val) })
              }}
            >
              <option value="custom">Custom</option>
              {GROWTH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            step="1"
            value={answers.expectedGrowthPct ?? 0}
            onChange={(e) => updateAnswers({ expectedGrowthPct: parseInt(e.target.value) })}
            style={{ width: '280px', marginTop: '0.5rem' }}
          />
        </FormField>

        {/* Tax Prep Returns (preload from lastYear × growth) */}
       // Auto-calc Tax Prep Returns when no manual override
useEffect(() => {
  if (
    answers.taxPrepReturns === undefined &&
    answers.lastYearTaxPrepReturns &&
    answers.expectedGrowthPct !== undefined
  ) {
    const autoReturns = Math.round(
      answers.lastYearTaxPrepReturns * (1 + answers.expectedGrowthPct / 100)
    )
    updateAnswers({ taxPrepReturns: autoReturns })
  }
}, [answers.lastYearTaxPrepReturns, answers.expectedGrowthPct, answers.taxPrepReturns, updateAnswers])

<FormField label="Tax Prep Returns">
  <NumberInput
    value={answers.taxPrepReturns}
    placeholder="e.g., 1,680"
    prefix="#"
    onChange={(value) => updateAnswers({ taxPrepReturns: value })}
  />
</FormField>


        {/* Average Net Fee (preload from lastYear × growth) */}
        // Auto-calc Avg Net Fee when no manual override
useEffect(() => {
  if (
    answers.avgNetFee === undefined &&
    answers.manualAvgNetFee &&
    answers.expectedGrowthPct !== undefined
  ) {
    const autoAvgNetFee = Math.round(
      answers.manualAvgNetFee * (1 + answers.expectedGrowthPct / 100)
    )
    updateAnswers({ avgNetFee: autoAvgNetFee })
  }
}, [answers.manualAvgNetFee, answers.expectedGrowthPct, answers.avgNetFee, updateAnswers])

<FormField label="Average Net Fee">
  <CurrencyInput
    value={answers.avgNetFee}
    placeholder="e.g., 130"
    onChange={(value) => updateAnswers({ avgNetFee: value })}
  />
</FormField>


        {/* Gross Tax Prep Fees */}
        useEffect(() => {
  if (
    answers.projectedGrossFees === undefined &&
    answers.taxPrepReturns &&
    answers.avgNetFee
  ) {
    const autoGross = answers.taxPrepReturns * answers.avgNetFee
    updateAnswers({ projectedGrossFees: autoGross })
  }
}, [answers.taxPrepReturns, answers.avgNetFee, answers.projectedGrossFees, updateAnswers])

        <FormField label="Gross Tax Prep Fees">
          <CurrencyInput
            value={
              answers.projectedGrossFees ??
              (answers.taxPrepReturns && answers.avgNetFee
                ? answers.taxPrepReturns * answers.avgNetFee
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedGrossFees: value })}
            backgroundColor="#f9fafb"
          />
        </FormField>

        {/* TaxRush (projected, NewStore-style) */}
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
            <FormField label="TaxRush Returns" helpText="Projected TaxRush returns (≈15% of total)">
              <NumberInput
                value={answers.taxRushReturns}
                placeholder="e.g., 240"
                prefix="#"
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </FormField>

            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.taxRushAvgNetFee ?? answers.avgNetFee}
                placeholder={answers.avgNetFee ? answers.avgNetFee.toString() : '125'}
                onChange={(value) => updateAnswers({ taxRushAvgNetFee: value })}
              />
            </FormField>

            <FormField label="TaxRush Gross Fees">
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

        {/* Customer Discounts (Projected, styled like NewStore) */}
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
        placeholder={
          answers.avgNetFee && answers.taxPrepReturns
            ? Math.round(answers.avgNetFee * answers.taxPrepReturns * 0.03).toString()
            : '6,000'
        }
        value={
          answers.discountsAmt ??
          (answers.avgNetFee && answers.taxPrepReturns
            ? Math.round(answers.avgNetFee * answers.taxPrepReturns * 0.03)
            : '')
        }
        onChange={(e) => {
          const newAmt = parseFloat(e.target.value) || undefined
          updateAnswers({ discountsAmt: newAmt })
          if (newAmt && answers.avgNetFee && answers.taxPrepReturns) {
            const grossFees = answers.avgNetFee * answers.taxPrepReturns
            if (grossFees > 0) {
              updateAnswers({ discountsPct: Math.round((newAmt / grossFees) * 1000) / 10 })
            }
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
        value={answers.discountsPct ?? ''}
        onChange={(e) => {
          const newPct = parseFloat(e.target.value) || undefined
          updateAnswers({ discountsPct: newPct })
          if (newPct && answers.avgNetFee && answers.taxPrepReturns) {
            const grossFees = answers.avgNetFee * answers.taxPrepReturns
            updateAnswers({ discountsAmt: Math.round(grossFees * (newPct / 100)) })
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
      <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
    </div>
  </div>
  <div
    style={{
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6b7280',
      fontStyle: 'italic',
    }}
  >
    Default: 3% • Enter either dollar amount or percentage - the other will auto-calc
  </div>
</FormField>


        {/* Total Tax Prep Income = Gross − Discounts */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (you can override)">
          <CurrencyInput
            value={
              answers.projectedTaxPrepIncome ??
              (answers.avgNetFee && answers.taxPrepReturns
                ? answers.avgNetFee * answers.taxPrepReturns - (answers.discountsAmt ?? 0)
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedTaxPrepIncome: value })}
            backgroundColor={answers.projectedTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

{/* Other Income */}
{answers.hasOtherIncome && (
  <FormField label="Other Income">
    <CurrencyInput
      value={answers.otherIncome}
      onChange={(value) => updateAnswers({ otherIncome: value })}
    />
  </FormField>
)}

{/* Total Expenses */}
<FormField label="Total Expenses" helpText="Auto: (Tax Prep Income + Other Income) × 76%">
  <CurrencyInput
    value={
      answers.projectedExpenses ??
      (() => {
        const taxPrepIncome =
          answers.projectedTaxPrepIncome ??
          (answers.avgNetFee && answers.taxPrepReturns
            ? answers.avgNetFee * answers.taxPrepReturns - (answers.discountsAmt ?? 0)
            : 0)
        const other = answers.hasOtherIncome ? answers.otherIncome ?? 0 : 0
        const base = taxPrepIncome + other
        return base > 0 ? Math.round(base * 0.76) : undefined
      })()
    }
    placeholder="Auto-calculated"
    onChange={(value) => updateAnswers({ projectedExpenses: value })}
    backgroundColor={answers.projectedExpenses !== undefined ? 'white' : '#f9fafb'}
  />
</FormField>

{/* Projected Net Income Summary */}
{(answers.avgNetFee && answers.taxPrepReturns) && (
  <div
    style={{
      padding: '0.5rem',
      backgroundColor: '#e0f2fe',
      borderRadius: '4px',
      fontWeight: 600,
      fontSize: '0.9rem',
      color: '#0369a1',
      marginTop: '1rem',
    }}
  >
    Projected Net Income: $
    {(() => {
      const gross = answers.avgNetFee * answers.taxPrepReturns
      const discounts = answers.discountsAmt ?? 0
      const other = answers.hasOtherIncome ? answers.otherIncome ?? 0 : 0
      const income = gross - discounts + other
      const expenses = answers.projectedExpenses ?? 0
      return Math.round(income - expenses).toLocaleString()
    })()}
  </div>
)}
        {/* Projected Net Income Summary */}
        {(answers.avgNetFee && answers.taxPrepReturns) && (
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#e0f2fe',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#0369a1',
              marginTop: '1rem',
            }}
          >
            Projected Net Income: $
            {(() => {
              const gross = answers.avgNetFee * answers.taxPrepReturns
              const discounts = answers.discountsAmt ?? 0
              const other = answers.hasOtherIncome ? answers.otherIncome ?? 0 : 0
              const income = gross - discounts + other
              const expenses = answers.projectedExpenses ?? 0
              return Math.round(income - expenses).toLocaleString()
            })()}
          </div>
        )}
      </FormSection>   {/* 👈 CLOSE THE Projected Performance FormSection */}
    </>
  )
}
