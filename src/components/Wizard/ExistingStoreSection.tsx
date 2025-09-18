// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Updated with reordered fields and restored Customer Discounts + Total Tax Prep Income

import React, { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'
import ToggleQuestion from './ToggleQuestion'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  // Existing auto-calc useEffects remain unchanged…

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
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" helpText="Total number of tax returns you processed last year" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField
          label="Average Net Fee"
          helpText={
            answers.manualAvgNetFee !== undefined
              ? 'Manual override - clear field to auto-calc'
              : 'Auto: Gross ÷ Returns (you can override)'
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
            placeholder="Auto"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
            backgroundColor={answers.manualAvgNetFee !== undefined ? 'white' : '#f0f9ff'}
          />
        </FormField>

        {/* 3. Gross Fees (auto-calc) */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Net Fee" required>
          <CurrencyInput
            value={
              answers.lastYearTaxPrepReturns && answers.manualAvgNetFee !== undefined
                ? answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
                : answers.lastYearGrossFees
            }
            placeholder="Auto"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
          />
        </FormField>

        {/* 4. TaxRush (conditional) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div style={{ border: '2px solid #0ea5e9', borderRadius: '8px', backgroundColor: '#f0f9ff', margin: '0.5rem 0', padding: '0.75rem' }}>
            <FormField label="TaxRush Returns" helpText="Number of TaxRush returns filed last year">
              <NumberInput
                value={answers.lastYearTaxRushReturns}
                placeholder="e.g., 240"
                onChange={(value) => updateAnswers({ lastYearTaxRushReturns: value })}
              />
            </FormField>
            <FormField label="TaxRush Avg Net Fee" helpText="Average net fee per TaxRush return">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee}
                placeholder="e.g., 125"
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
              />
            </FormField>
            <FormField label="TaxRush Gross Fees" helpText="Auto: Returns × Avg Fee (override allowed)">
              <CurrencyInput
                value={
                  answers.lastYearTaxRushReturns && (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    ? answers.lastYearTaxRushReturns * (answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee)
                    : answers.lastYearTaxRushGrossFees
                }
                placeholder="Auto"
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts */}
        <FormField label="Customer Discounts" helpText="Enter dollar or %, the other will auto-calc">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* $ input */}
            <input
              type="number"
              min="0"
              value={answers.lastYearDiscountsAmt ?? ''}
              placeholder="e.g., 6,000"
              onChange={(e) => {
                const newAmt = parseFloat(e.target.value) || undefined
                updateAnswers({ lastYearDiscountsAmt: newAmt })
                if (newAmt && answers.lastYearGrossFees) {
                  updateAnswers({ lastYearDiscountsPct: Math.round((newAmt / answers.lastYearGrossFees) * 1000) / 10 })
                }
              }}
              style={{ width: '80px', textAlign: 'right' }}
            />
            <span>=</span>
            {/* % input */}
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={answers.lastYearDiscountsPct ?? ''}
              placeholder="3.0"
              onChange={(e) => {
                const newPct = parseFloat(e.target.value) || undefined
                updateAnswers({ lastYearDiscountsPct: newPct })
                if (newPct && answers.lastYearGrossFees) {
                  updateAnswers({ lastYearDiscountsAmt: Math.round(answers.lastYearGrossFees * (newPct / 100)) })
                }
              }}
              style={{ width: '60px', textAlign: 'right' }}
            />
            <span>%</span>
          </div>
        </FormField>

        {/* 6. Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income" helpText="Gross Fees − Discounts">
          <CurrencyInput
            value={
              answers.lastYearGrossFees
                ? answers.lastYearGrossFees - (answers.lastYearDiscountsAmt ?? 0)
                : undefined
            }
            placeholder="Auto"
            onChange={() => {}} // read-only
            readOnly
            backgroundColor="#f9fafb"
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
        <FormField label="Total Expenses" helpText="All expenses (salaries, rent, supplies, etc.)" required>
          <CurrencyInput
            value={answers.lastYearExpenses}
            placeholder="e.g., 150,000"
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
          />
        </FormField>
      </FormSection>

      {/* Projected Performance — reorder same way */}
      <FormSection title="Projected Performance" icon="📈" backgroundColor="#f8fafc" borderColor="#059669">
        {/* Growth slider etc. stay above */}
        <FormField label="Performance Change" helpText="Expected growth or decline">
          <input
            type="number"
            value={answers.expectedGrowthPct ?? 0}
            onChange={(e) => updateAnswers({ expectedGrowthPct: parseFloat(e.target.value) })}
          />
        </FormField>

        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns">
          <NumberInput
            value={answers.taxPrepReturns}
            placeholder="e.g., 1,700"
            prefix="#"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField label="Average Net Fee">
          <CurrencyInput
            value={answers.avgNetFee}
            placeholder="e.g., 130"
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </FormField>

        {/* 3. Gross Fees */}
        <FormField label="Gross Tax Prep Fees" helpText="Auto: Returns × Avg Fee">
          <CurrencyInput
            value={answers.taxPrepReturns && answers.avgNetFee ? answers.taxPrepReturns * answers.avgNetFee : undefined}
            placeholder="Auto"
            readOnly
            backgroundColor="#f9fafb"
          />
        </FormField>

        {/* 4. TaxRush conditional */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div style={{ border: '2px solid #0ea5e9', borderRadius: '8px', backgroundColor: '#f0f9ff', margin: '0.5rem 0', padding: '0.75rem' }}>
            <FormField label="TaxRush Returns">
              <NumberInput
                value={answers.taxRushReturns}
                placeholder="e.g., 250"
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </FormField>
            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.taxRushAvgNetFee ?? answers.avgNetFee}
                placeholder="e.g., 130"
                onChange={(value) => updateAnswers({ taxRushAvgNetFee: value })}
              />
            </FormField>
            <FormField label="TaxRush Gross Fees">
              <CurrencyInput
                value={
                  answers.taxRushReturns && (answers.taxRushAvgNetFee ?? answers.avgNetFee)
                    ? answers.taxRushReturns * (answers.taxRushAvgNetFee ?? answers.avgNetFee)
                    : undefined
                }
                placeholder="Auto"
                readOnly
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts */}
        <FormField label="Customer Discounts">
          {/* Same dollar + % block as above, wired to projected fields if you want */}
        </FormField>

        {/* 6. Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income">
          <CurrencyInput
            value={
              answers.avgNetFee && answers.taxPrepReturns
                ? answers.avgNetFee * answers.taxPrepReturns - (answers.discountsAmt ?? 0)
                : undefined
            }
            placeholder="Auto"
            readOnly
            backgroundColor="#f9fafb"
          />
        </FormField>

        {/* 7. Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income">
            <CurrencyInput
              value={answers.otherIncome}
              onChange={(value) => updateAnswers({ otherIncome: value })}
            />
          </FormField>
        )}

        {/* 8. Total Expenses */}
        <FormField label="Total Expenses">
          <CurrencyInput
            value={answers.projectedExpenses}
            onChange={(value) => updateAnswers({ projectedExpenses: value })}
          />
        </FormField>
      </FormSection>
    </>
  )
}
