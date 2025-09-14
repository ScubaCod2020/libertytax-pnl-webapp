// ExistingStoreSectionNew.tsx - EXAMPLE of new standardized approach
// This shows how clean and consistent the code becomes with the new architecture

import React from 'react'
import type { WizardSectionProps } from './types'
import { formatCurrency, parseCurrencyInput } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput, PercentageInput } from './FormField'

export default function ExistingStoreSectionNew({ answers, updateAnswers, region }: WizardSectionProps) {
  
  return (
    <>
      {/* TaxRush Toggle Question (Canada only) */}
      {region === 'CA' && (
        <FormSection title="TaxRush Service" icon="🍁" backgroundColor="#f8fafc" borderColor="#e2e8f0">
          <FormField 
            label="Do you offer TaxRush?" 
            helpText="TaxRush is Canada's rapid refund service"
          >
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input 
                  type="radio" 
                  name="taxrush" 
                  checked={answers.handlesTaxRush === true}
                  onChange={() => updateAnswers({ handlesTaxRush: true })}
                />
                Yes
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input 
                  type="radio" 
                  name="taxrush" 
                  checked={answers.handlesTaxRush === false}
                  onChange={() => updateAnswers({ handlesTaxRush: false })}
                />
                No
              </label>
            </div>
          </FormField>
        </FormSection>
      )}

      {/* Last Year Performance Section */}
      <FormSection 
        title="Last Year Performance" 
        icon="📊" 
        description="Enter your historical data for accurate projections"
      >
        <FormField 
          label="Tax Prep Gross Fees" 
          helpText="Total tax prep fees charged (before any discounts)"
          required
        >
          <CurrencyInput
            value={answers.lastYearGrossFees}
            placeholder="e.g., 206,000"
            onChange={value => updateAnswers({ lastYearGrossFees: value })}
          />
        </FormField>

        <FormField 
          label="Customer Discounts" 
          helpText="Total discounts given to customers (percentage auto-calculated)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CurrencyInput
              value={answers.lastYearDiscountsAmt}
              placeholder="e.g., 6,000"
              onChange={value => updateAnswers({ lastYearDiscountsAmt: value })}
              width="110px"
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#6b7280' }}>= </span>
              <div style={{ 
                width: '50px', 
                textAlign: 'right', 
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                {answers.lastYearGrossFees && answers.lastYearDiscountsAmt 
                  ? ((answers.lastYearDiscountsAmt / answers.lastYearGrossFees) * 100).toFixed(1)
                  : '0.0'
                }
              </div>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
            </div>
          </div>
        </FormField>

        <FormField 
          label="Tax Prep Returns" 
          helpText="Total number of tax returns you processed last year"
          required
        >
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            placeholder="e.g., 1,680"
            prefix="#"
            onChange={value => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        <FormField 
          label="Average Net Fee" 
          helpText={
            answers.manualAvgNetFee !== undefined ? 
              'Manual override - clear field to auto-calculate from Gross Fees ÷ Tax Prep Returns' :
              'Auto-calculated: Gross Fees ÷ Tax Prep Returns (you can override)'
          }
        >
          <CurrencyInput
            value={(() => {
              if (answers.manualAvgNetFee !== undefined) {
                return answers.manualAvgNetFee
              }
              if (answers.lastYearGrossFees && answers.lastYearTaxPrepReturns) {
                return Math.round(answers.lastYearGrossFees / answers.lastYearTaxPrepReturns)
              }
              return undefined
            })()}
            placeholder="Auto-calculated"
            onChange={value => updateAnswers({ manualAvgNetFee: value })}
            backgroundColor={answers.manualAvgNetFee !== undefined ? 'white' : '#f0f9ff'}
          />
        </FormField>

        <FormField 
          label="Other Income" 
          helpText="Optional: Additional revenue streams (bookkeeping, notary, etc.) - Enter 0 or leave blank if none"
        >
          <CurrencyInput
            value={answers.lastYearOtherIncome}
            placeholder="e.g., 2,500"
            onChange={value => updateAnswers({ lastYearOtherIncome: value })}
          />
        </FormField>

        <FormField 
          label="Total Expenses" 
          helpText="All expenses including salaries, rent, supplies, royalties, etc."
          required
        >
          <CurrencyInput
            value={answers.lastYearExpenses}
            placeholder="e.g., 150,000"
            onChange={value => updateAnswers({ lastYearExpenses: value })}
          />
        </FormField>
      </FormSection>

      {/* Projected Performance Section */}
      <FormSection 
        title="Projected Performance" 
        icon="🎯" 
        description="Set your growth targets for this year"
        resetButton={{
          text: "🎯 Reset to Strategic Goals",
          onClick: () => {
            updateAnswers({ 
              projectedAvgNetFee: undefined,
              projectedTaxPrepReturns: undefined
            })
          },
          title: "Reset income fields back to your strategic growth targets"
        }}
      >
        <FormField 
          label="Performance Change" 
          helpText="Expected growth or decline compared to last year"
        >
          <PercentageInput
            value={answers.expectedGrowthPct}
            placeholder="e.g., 5"
            onChange={value => updateAnswers({ expectedGrowthPct: value })}
            max={50}
          />
        </FormField>
      </FormSection>
    </>
  )
}
