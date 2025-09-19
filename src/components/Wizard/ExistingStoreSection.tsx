// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Golden ticket layout: styled inputs + derived auto-calcs + growth preload + full overrides

import { useEffect, useMemo } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // ===== Derived values (auto unless overridden) =====
  const lyGrossAuto = useMemo(() => {
    if (answers.lastYearTaxPrepReturns && answers.manualAvgNetFee) {
      return answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
    }
    return undefined
  }, [answers.lastYearTaxPrepReturns, answers.manualAvgNetFee])

  const lyGross = answers.lastYearGrossFees ?? lyGrossAuto

  const projReturnsAuto = useMemo(() => {
    if (answers.lastYearTaxPrepReturns && answers.expectedGrowthPct !== undefined) {
      return Math.round(answers.lastYearTaxPrepReturns * (1 + answers.expectedGrowthPct / 100))
    }
    return undefined
  }, [answers.lastYearTaxPrepReturns, answers.expectedGrowthPct])

  const projAnfAuto = useMemo(() => {
    if (answers.manualAvgNetFee && answers.expectedGrowthPct !== undefined) {
      return Math.round(answers.manualAvgNetFee * (1 + answers.expectedGrowthPct / 100))
    }
    return undefined
  }, [answers.manualAvgNetFee, answers.expectedGrowthPct])

  const projReturns = answers.taxPrepReturns ?? projReturnsAuto
  const projAnf = answers.avgNetFee ?? projAnfAuto

  const projGrossAuto = useMemo(() => {
    if (projReturns && projAnf) return projReturns * projAnf
    return undefined
  }, [projReturns, projAnf])

  const projGross = answers.projectedGrossFees ?? projGrossAuto

  // ===== Small UX nicety from production: default growth to 0 once projected fields exist =====
  useEffect(() => {
    if (projReturns && projAnf && answers.expectedGrowthPct === undefined) {
      updateAnswers({ expectedGrowthPct: 0 })
    }
  }, [projReturns, projAnf, answers.expectedGrowthPct, updateAnswers])

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
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee (manual source for all last-year calcs) */}
        <FormField label="Average Net Fee">
          <CurrencyInput
            value={answers.manualAvgNetFee}
            placeholder="e.g., 125"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
          />
        </FormField>

        {/* 3. Gross Tax Prep Fees (derived unless user overrides) */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee (clear to re-auto)">
          <CurrencyInput
            value={answers.lastYearGrossFees ?? lyGrossAuto}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
            backgroundColor={answers.lastYearGrossFees !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 4. TaxRush (Last Year, NewStore style) */}
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
                placeholder={
                  answers.lastYearTaxPrepReturns
                    ? Math.round(answers.lastYearTaxPrepReturns * 0.15).toString()
                    : '240'
                }
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
                placeholder={lyGross ? Math.round(lyGross * 0.03).toString() : '6,000'}
                value={answers.lastYearDiscountsAmt ?? ''}
                onChange={(e) => {
                  const newAmt = parseFloat(e.target.value) || undefined
                  updateAnswers({ lastYearDiscountsAmt: newAmt })
                  if (newAmt && lyGross) {
                    const pct = (newAmt / lyGross) * 100
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
                  if (newPct && lyGross) {
                    const calcAmt = lyGross * (newPct / 100)
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
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            Default: 3% • Enter either dollar amount or percentage - the other will auto-calc
          </div>
        </FormField>

        {/* 6. Total Tax Prep Income = Gross − Discounts (overrideable) */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (clear to re-auto)">
          <CurrencyInput
            value={
              answers.manualTaxPrepIncome ??
              (lyGross !== undefined ? lyGross - (answers.lastYearDiscountsAmt ?? 0) : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ manualTaxPrepIncome: value })}
            backgroundColor={answers.manualTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 7. Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income">
            <CurrencyInput
              value={answers.lastYearOtherIncome}
              onChange={(value) => updateAnswers({ lastYearOtherIncome: value })}
            />
          </FormField>
        )}

        {/* 8. Total Expenses = (Tax Prep Income + Other) × 76% (overrideable) */}
        <FormField label="Total Expenses" helpText="Auto: (Tax Prep Income + Other Income) × 76%">
          <CurrencyInput
            value={
              answers.lastYearExpenses ??
              (() => {
                const taxPrepIncome =
                  answers.manualTaxPrepIncome ??
                  (lyGross !== undefined ? lyGross - (answers.lastYearDiscountsAmt ?? 0) : 0)
                const other = answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0
                const base = taxPrepIncome + other
                return base > 0 ? Math.round(base * 0.76) : undefined
              })()
            }
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
            placeholder="Auto-calculated"
            backgroundColor={answers.lastYearExpenses !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* Last Year Net Income Summary */}
        {(lyGross !== undefined || answers.lastYearExpenses !== undefined) && (
          <div
            style={{
              padding: '1rem', 
            backgroundColor: '#f0fdf4', 
            border: '2px solid #16a34a', 
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#15803d',
            }}
          >
            Last Year Net Income: $
            {(() => {
              const gross = lyGross ?? 0
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

        {/* Returns & ANF (preload via growth, overrideable) */}
        <FormField label="Tax Prep Returns">
          <NumberInput
            value={projReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </FormField>

        <FormField label="Average Net Fee">
          <CurrencyInput
            value={projAnf}
            placeholder="e.g., 130"
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </FormField>

        {/* Gross (derived unless override) */}
        <FormField label="Gross Tax Prep Fees">
          <CurrencyInput
            value={answers.projectedGrossFees ?? projGrossAuto}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedGrossFees: value })}
            backgroundColor={answers.projectedGrossFees !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* TaxRush (projected) */}
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
                value={answers.taxRushReturns ?? (projReturns ? Math.round(projReturns * 0.15) : undefined)}
                placeholder={projReturns ? Math.round(projReturns * 0.15).toString() : '240'}
                prefix="#"
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </FormField>

            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.taxRushAvgNetFee ?? projAnf ?? undefined}
                placeholder={(projAnf ?? 125).toString()}
                onChange={(value) => updateAnswers({ taxRushAvgNetFee: value })}
              />
            </FormField>

            <FormField label="TaxRush Gross Fees">
              <CurrencyInput
                value={
                  answers.taxRushGrossFees ??
                  (answers.taxRushReturns && (answers.taxRushAvgNetFee ?? projAnf)
                    ? answers.taxRushReturns * (answers.taxRushAvgNetFee ?? projAnf!)
                    : undefined)
                }
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ taxRushGrossFees: value })}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* Discounts (projected) */}
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
                placeholder={projGross ? Math.round(projGross * 0.03).toString() : '6,000'}
                value={answers.discountsAmt ?? ''}
                onChange={(e) => {
                  const newAmt = parseFloat(e.target.value) || undefined
                  updateAnswers({ discountsAmt: newAmt })
                  if (newAmt && projGross) {
                    const pct = (newAmt / projGross) * 100
                    updateAnswers({ discountsPct: Math.round(pct * 10) / 10 })
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
                  if (newPct && projGross) {
                    const calcAmt = projGross * (newPct / 100)
                    updateAnswers({ discountsAmt: Math.round(calcAmt) })
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
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            Default: 3% • Enter either dollar amount or percentage - the other will auto-calc
          </div>
        </FormField>

        {/* Total Tax Prep Income (projected) */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (clear to re-auto)">
          <CurrencyInput
            value={
              answers.projectedTaxPrepIncome ??
              (projGross !== undefined ? projGross - (answers.discountsAmt ?? 0) : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedTaxPrepIncome: value })}
            backgroundColor={answers.projectedTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* Other Income (projected) */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income">
            <CurrencyInput
              value={answers.otherIncome}
              onChange={(value) => updateAnswers({ otherIncome: value })}
            />
          </FormField>
        )}

        {/* Total Expenses (projected) */}
        <FormField label="Total Expenses" helpText="Auto: (Tax Prep Income + Other Income) × 76%">
          <CurrencyInput
            value={
              answers.projectedExpenses ??
              (() => {
                const taxPrepIncome =
                  answers.projectedTaxPrepIncome ??
                  (projGross !== undefined ? projGross - (answers.discountsAmt ?? 0) : 0)
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
        {(projReturns && projAnf) && (
          <div
            style={{
              padding: '1rem', 
            backgroundColor: '#f0fdf4', 
            border: '2px solid #16a34a', 
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#15803d',
            }}
          >
            Projected Net Income: $
            {(() => {
              const gross = projGross ?? 0
              const discounts = answers.discountsAmt ?? 0
              const other = answers.hasOtherIncome ? answers.otherIncome ?? 0 : 0
              const income = gross - discounts + other
              const expenses = answers.projectedExpenses ?? 0
              return Math.round(income - expenses).toLocaleString()
            })()}
          </div>
        )}
      </FormSection>
    </>
  )
}
