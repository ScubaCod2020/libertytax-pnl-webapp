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

        {/* Customer Discounts */}
        <FormField label="Customer Discounts">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Dollar Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder={answers.lastYearGrossFees ? Math.round(answers.lastYearGrossFees * 0.03).toString() : '6,000'}
                value={answers.lastYearDiscountsAmt ?? ''}
                onChange={(e) => {
                  const newAmt = parseFloat(e.target.value) || undefined
                  updateAnswers({ lastYearDiscountsAmt: newAmt })
                  if (newAmt && answers.lastYearGrossFees) {
                    const pct = (newAmt / answers.lastYearGrossFees) * 100
                    updateAnswers({ lastYearDiscountsPct: Math.round(pct * 10) / 10 })
                  }
                }}
              />
            </div>
            <span>=</span>
            {/* Percentage Input */}
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
                  updateAnswers({ lastYearDiscountsAmt: Math.round(answers.lastYearGrossFees * (newPct / 100)) })
                }
              }}
            />
            <span>%</span>
          </div>
        </FormField>

        {/* Total Tax Prep Income = Gross − Discounts */}
        <FormField label="Total Tax Prep Income">
          <CurrencyInput
            value={
              answers.lastYearGrossFees
                ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0)
                : undefined
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ manualTaxPrepIncome: value })}
            backgroundColor="#f9fafb"
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
                const income = answers.lastYearGrossFees ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0) : 0
                const other = answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0
                const base = income + other
                return base > 0 ? Math.round(base * 0.76) : undefined
              })()
            }
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
          />
        </FormField>

        {/* Net Income Summary */}
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

        {/* Tax Prep Returns */}
        <FormField label="Tax Prep Returns">
          <NumberInput
            value={answers.taxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </FormField>

        {/* Average Net Fee */}
        <FormField label="Average Net Fee">
          <CurrencyInput
            value={answers.avgNetFee}
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </FormField>

        {/* Gross Tax Prep Fees */}
        <FormField label="Gross Tax Prep Fees">
          <CurrencyInput
            value={
              answers.projectedGrossFees ??
              (answers.taxPrepReturns && answers.avgNetFee
                ? answers.taxPrepReturns * answers.avgNetFee
                : undefined)
            }
            onChange={(value) => updateAnswers({ projectedGrossFees: value })}
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

        {/* Customer Discounts */}
        <FormField label="Customer Discounts">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                value={answers.discountsAmt ?? ''}
                placeholder="e.g., 6,000"
                onChange={(e) => {
                  const amt = parseFloat(e.target.value) || undefined
                  updateAnswers({ discountsAmt: amt })
                  if (amt && answers.avgNetFee && answers.taxPrepReturns) {
                    const gross = answers.avgNetFee * answers.taxPrepReturns
                    updateAnswers({ discountsPct: Math.round((amt / gross) * 1000) / 10 })
                  }
                }}
              />
            </div>
            <span>=</span>
            <input
              type="number"
              value={answers.discountsPct ?? ''}
              placeholder="3.0"
              onChange={(e) => {
                const pct = parseFloat(e.target.value) || undefined
                updateAnswers({ discountsPct: pct })
                if (pct && answers.avgNetFee && answers.taxPrepReturns) {
                  const gross = answers.avgNetFee * answers.taxPrepReturns
                  updateAnswers({ discountsAmt: Math.round(gross * (pct / 100)) })
                }
              }}
            />
            <span>%</span>
          </div>
        </FormField>

        {/* Total Tax Prep Income = Gross − Discounts */}
        <FormField label="Total Tax Prep Income">
          <CurrencyInput
            value={
              answers.projectedTaxPrepIncome ??
              (answers.avgNetFee && answers.taxPrepReturns
                ? answers.avgNetFee * answers.taxPrepReturns - (answers.discountsAmt ?? 0)
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedTaxPrepIncome: value })}
            backgroundColor="#f9fafb"
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
        <FormField label="Total Expenses">
          <CurrencyInput
            value={
              answers.projectedExpenses ??
              (() => {
                const income =
                  answers.projectedTaxPrepIncome ??
                  (answers.avgNetFee && answers.taxPrepReturns
                    ? answers.avgNetFee * answers.taxPrepReturns - (answers.discountsAmt ?? 0)
                    : 0)
                const other = answers.hasOtherIncome ? answers.otherIncome ?? 0 : 0
                const base = income + other
                return base > 0 ? Math.round(base * 0.76) : undefined
              })()
            }
            onChange={(value) => updateAnswers({ projectedExpenses: value })}
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
      </FormSection>
    </>
  )
}
