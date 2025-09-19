// ExistingStoreSectionNew.tsx - Standardized layout (aligned with golden ticket logic)
// Uses sticky overrides, styled discounts, and shared NetIncomeSummary

import React from 'react'
import type { WizardSectionProps } from './types'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import NetIncomeSummary from './NetIncomeSummary'

export default function ExistingStoreSectionNew({ answers, updateAnswers, region }: WizardSectionProps) {
  // Effective Gross = manual override OR Returns × ANF
  const effectiveGross =
    answers.lastYearGrossFees ??
    (answers.lastYearTaxPrepReturns && answers.manualAvgNetFee
      ? answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
      : undefined)

  return (
    <>
      <FormSection
        title="Last Year Performance"
        icon="📊"
        description="Enter your historical data for accurate projections"
      >
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            prefix="#"
            placeholder="e.g., 1,680"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField label="Average Net Fee" helpText="Auto: Gross ÷ Returns (you can override)">
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
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee (you can override)">
          <CurrencyInput
            value={effectiveGross}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
            backgroundColor={answers.lastYearGrossFees !== undefined ? 'white' : '#f9fafb'}
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
                prefix="#"
                placeholder="e.g., 240"
                onChange={(value) => updateAnswers({ lastYearTaxRushReturns: value })}
              />
            </FormField>
            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee}
                placeholder="e.g., 125"
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
              />
            </FormField>
            <FormField label="TaxRush Gross Fees">
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

        {/* 5. Customer Discounts */}
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
                placeholder={effectiveGross ? Math.round(effectiveGross * 0.03).toString() : '6,000'}
                value={answers.lastYearDiscountsAmt ?? ''}
                onChange={(e) => {
                  const amt = parseFloat(e.target.value) || undefined
                  updateAnswers({ lastYearDiscountsAmt: amt })
                  if (amt && effectiveGross) {
                    const pct = (amt / effectiveGross) * 100
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

            <span>=</span>

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
                  const pct = parseFloat(e.target.value) || undefined
                  updateAnswers({ lastYearDiscountsPct: pct })
                  if (pct && effectiveGross) {
                    updateAnswers({ lastYearDiscountsAmt: Math.round(effectiveGross * (pct / 100)) })
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

        {/* 6. Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (you can override)">
          <CurrencyInput
            value={
              answers.manualTaxPrepIncome ??
              (effectiveGross !== undefined
                ? effectiveGross - (answers.lastYearDiscountsAmt ?? 0)
                : undefined)
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
              placeholder="e.g., 2,500"
              onChange={(value) => updateAnswers({ lastYearOtherIncome: value })}
            />
          </FormField>
        )}

        {/* 8. Total Expenses */}
        <FormField
          label="Total Expenses"
          helpText="Auto: (Tax Prep Income + Other Income) × 76% (you can override)"
        >
          <CurrencyInput
            value={
              answers.lastYearExpenses ??
              (() => {
                const taxPrepIncome =
                  answers.manualTaxPrepIncome ??
                  (effectiveGross !== undefined
                    ? effectiveGross - (answers.lastYearDiscountsAmt ?? 0)
                    : 0)
                const other = answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0
                const base = taxPrepIncome + other
                return base > 0 ? Math.round(base * 0.76) : undefined
              })()
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
            backgroundColor={answers.lastYearExpenses !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 9. Last Year Net Income Summary */}
        <NetIncomeSummary
          label="Last Year"
          gross={effectiveGross ?? 0}
          discounts={answers.lastYearDiscountsAmt ?? 0}
          otherIncome={answers.hasOtherIncome ? answers.lastYearOtherIncome ?? 0 : 0}
          expenses={answers.lastYearExpenses ?? 0}
          color="#15803d"
          background="#f0fdf4"
          border="2px solid #16a34a"
/>
      </FormSection>
    </>
  )
}
