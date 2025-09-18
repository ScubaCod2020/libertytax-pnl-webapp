// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Golden ticket layout applied: stacked input fields like NewStore, all overrideable

import { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // Ensure default growth % set
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
      <FormSection
        title="Last Year Performance"
        icon="📊"
        backgroundColor="#f8fafc"
        borderColor="#6b7280"
      >
        {/* Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
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

        {/* Gross Fees */}
        <FormField label="Gross Tax Prep Fees">
          <CurrencyInput
            value={
              answers.lastYearGrossFees ??
              (answers.lastYearTaxPrepReturns && answers.manualAvgNetFee
                ? answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
                : undefined)
            }
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
          />
        </FormField>

        {/* TaxRush (last year) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div
            style={{
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              margin: '0.5rem 0',
              padding: '0.75rem',
            }}
          >
            <FormField label="TaxRush Returns">
              <NumberInput
                value={answers.lastYearTaxRushReturns}
                onChange={(value) => updateAnswers({ lastYearTaxRushReturns: value })}
              />
            </FormField>
            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee}
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
              />
            </FormField>
            <FormField label="TaxRush Gross Fees">
              <CurrencyInput
                value={
                  answers.lastYearTaxRushGrossFees ??
                  (answers.lastYearTaxRushReturns && (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    ? answers.lastYearTaxRushReturns * (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    : undefined)
                }
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
              />
            </FormField>
          </div>
        )}

        {/* Customer Discounts */}
        <FormField label="Customer Discounts">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              value={answers.lastYearDiscountsAmt ?? ''}
              onChange={(e) => {
                const amt = parseFloat(e.target.value) || undefined
                updateAnswers({ lastYearDiscountsAmt: amt })
                if (amt && answers.lastYearGrossFees) {
                  updateAnswers({ lastYearDiscountsPct: Math.round((amt / answers.lastYearGrossFees) * 1000) / 10 })
                }
              }}
            />
            <span>=</span>
            <input
              type="number"
              value={answers.lastYearDiscountsPct ?? ''}
              onChange={(e) => {
                const pct = parseFloat(e.target.value) || undefined
                updateAnswers({ lastYearDiscountsPct: pct })
                if (pct && answers.lastYearGrossFees) {
                  updateAnswers({ lastYearDiscountsAmt: Math.round(answers.lastYearGrossFees * (pct / 100)) })
                }
              }}
            />
            <span>%</span>
          </div>
        </FormField>

        {/* Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income">
          <CurrencyInput
            value={
              answers.manualTaxPrepIncome ??
              (answers.lastYearGrossFees
                ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0)
                : undefined)
            }
            onChange={(value) => updateAnswers({ manualTaxPrepIncome: value })}
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
      </FormSection>

      {/* === Projected Performance === */}
      <FormSection
        title="Projected Performance"
        icon="📈"
        backgroundColor="#f8fafc"
        borderColor="#059669"
      >
        {/* Growth controls at the top */}
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

        {/* Gross Fees */}
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

        {/* TaxRush (projected) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div
            style={{
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              margin: '0.5rem 0',
              padding: '0.75rem',
            }}
          >
            <FormField label="TaxRush Returns">
              <NumberInput
                value={answers.taxRushReturns}
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </FormField>
            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.taxRushAvgNetFee ?? answers.avgNetFee}
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
                onChange={(value) => updateAnswers({ taxRushGrossFees: value })}
              />
            </FormField>
          </div>
        )}

        {/* Customer Discounts */}
        <FormField label="Customer Discounts">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="number"
              value={answers.discountsAmt ?? ''}
              onChange={(e) => {
                const amt = parseFloat(e.target.value) || undefined
                updateAnswers({ discountsAmt: amt })
                if (amt && answers.avgNetFee && answers.taxPrepReturns) {
                  const gross = answers.avgNetFee * answers.taxPrepReturns
                  updateAnswers({ discountsPct: Math.round((amt / gross) * 1000) / 10 })
                }
              }}
            />
            <span>=</span>
            <input
              type="number"
              value={answers.discountsPct ?? ''}
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

        {/* Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income">
          <CurrencyInput
            value={
              answers.projectedTaxPrepIncome ??
              (answers.avgNetFee && answers.taxPrepReturns
                ? answers.avgNetFee * answers.taxPrepReturns - (answers.discountsAmt ?? 0)
                : undefined)
            }
            onChange={(value) => updateAnswers({ projectedTaxPrepIncome: value })}
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
        <FormField label="Total Expenses" helpText="Auto: Tax Prep Income × 76%">
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
            onChange={(value) => updateAnswers({ projectedExpenses: value })}
          />
        </FormField>
      </FormSection>
    </>
  )
}
