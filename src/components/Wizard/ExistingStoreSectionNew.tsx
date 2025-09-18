// ExistingStoreSectionNew.tsx - standardized layout
// Reordered fields, Discounts + Total Tax Prep Income restored, Total Expenses auto-calc at 76%

import React from 'react'
import type { WizardSectionProps } from './types'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'

export default function ExistingStoreSectionNew({ answers, updateAnswers, region }: WizardSectionProps) {
  return (
    <>
      {/* Last Year Performance Section */}
      <FormSection
        title="Last Year Performance"
        icon="📊"
        description="Enter your historical data for accurate projections"
      >
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField label="Average Net Fee" helpText="Auto: Gross ÷ Returns (override allowed)">
          <CurrencyInput
            value={
              answers.manualAvgNetFee !== undefined
                ? answers.manualAvgNetFee
                : answers.lastYearGrossFees && answers.lastYearTaxPrepReturns
                ? Math.round(answers.lastYearGrossFees / answers.lastYearTaxPrepReturns)
                : undefined
            }
            placeholder="Auto"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
            backgroundColor={answers.manualAvgNetFee !== undefined ? 'white' : '#f0f9ff'}
          />
        </FormField>

        {/* 3. Gross Tax Prep Fees */}
        <FormField label="Gross Tax Prep Fees">
          <CurrencyInput
            value={answers.lastYearGrossFees}
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
          />
        </FormField>

        {/* 4. TaxRush (Canada only, if enabled) */}
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
                  answers.lastYearTaxRushReturns && (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    ? answers.lastYearTaxRushReturns * (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    : answers.lastYearTaxRushGrossFees
                }
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts */}
        <FormField label="Customer Discounts" helpText="Enter $ or %, the other auto-calcs">
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

        {/* 6. Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income">
          <CurrencyInput
            value={
              answers.lastYearGrossFees
                ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0)
                : undefined
            }
            readOnly
            backgroundColor="#f9fafb"
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

        {/* 8. Total Expenses */}
        <FormField label="Total Expenses" helpText="Auto: (Tax Prep Income + Other Income) × 76%">
          <CurrencyInput
            value={
              answers.lastYearExpenses ??
              (() => {
                const income = (answers.lastYearGrossFees ?? 0) - (answers.lastYearDiscountsAmt ?? 0)
                const other = answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0
                const base = income + other
                return base > 0 ? Math.round(base * 0.76) : undefined
              })()
            }
            placeholder="Auto"
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
          />
        </FormField>
      </FormSection>
    </>
  )
}
