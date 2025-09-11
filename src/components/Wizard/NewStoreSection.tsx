// NewStoreSection.tsx - Target Performance Goals for new stores
// Manual entry forecasting without growth slider

import React from 'react'
import type { WizardSectionProps } from './types'
import { calculateNetIncome, formatCurrency, parseCurrencyInput } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput } from './FormField'

export default function NewStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  return (
    <>
      {/* Information Banner */}
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        borderRadius: '6px',
        marginBottom: '1rem'
      }}>
        <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem' }}>
          🏪 New Store Setup - Forecasting
        </div>
        <div className="small" style={{ color: '#0369a1' }}>
          Set your target performance goals below. These will be used for business planning and can be adjusted as you learn more about your market.
        </div>
      </div>

      {/* TaxRush Toggle Question (Canada only) */}
      {region === 'CA' && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 600, color: '#1e40af' }}>TaxRush Returns</label>
          </div>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
            Will your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="handlesTaxRush"
                checked={answers.handlesTaxRush === true}
                onChange={() => updateAnswers({ handlesTaxRush: true })}
                style={{ marginRight: '0.25rem' }}
              />
              <span style={{ fontWeight: 500 }}>Yes, we will handle TaxRush returns</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="handlesTaxRush"
                checked={answers.handlesTaxRush === false}
                onChange={() => updateAnswers({ 
                  handlesTaxRush: false,
                  // Clear TaxRush-related fields when disabled
                  taxRushReturns: undefined,
                  taxRushReturnsPct: undefined
                })}
                style={{ marginRight: '0.25rem' }}
              />
              <span style={{ fontWeight: 500 }}>No, we won't handle TaxRush</span>
            </label>
          </div>
        </div>
      )}

      {/* Target Performance Goals Box */}
      <FormSection 
        title="Target Performance Goals" 
        icon="🎯" 
        backgroundColor="#f8fafc" 
        borderColor="#059669"
      >

          <FormField 
            label="Average Net Fee" 
            helpText="Your target average net fee per return"
            required
          >
            <CurrencyInput
              value={answers.avgNetFee}
              placeholder="e.g., 130"
              onChange={value => updateAnswers({ avgNetFee: value })}
            />
          </FormField>

          <FormField 
            label="Tax Prep Returns" 
            helpText="Your target number of tax returns"
            required
          >
            <NumberInput
              value={answers.taxPrepReturns}
              placeholder="e.g., 1,680"
              prefix="#"
              onChange={value => updateAnswers({ taxPrepReturns: value })}
            />
          </FormField>

          {/* TaxRush Fields (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              paddingLeft: '0.75rem',
              paddingRight: '0.75rem',
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              margin: '0.5rem 0'
            }}>
              <FormField 
                label="TaxRush Returns" 
                helpText="Your target TaxRush returns for this year (typically ~15% of total returns)"
              >
                <NumberInput
                  value={answers.taxRushReturns || (answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15) : undefined)}
                  placeholder="0"
                  prefix="#"
                  onChange={value => updateAnswers({ taxRushReturns: value })}
                />
              </FormField>

              <FormField 
                label="TaxRush Gross Fees" 
                helpText="Your target gross fees from TaxRush returns (separate from tax prep fees)"
              >
                <CurrencyInput
                  value={answers.taxRushGrossFees}
                  placeholder="0"
                  onChange={value => updateAnswers({ taxRushGrossFees: value })}
                />
              </FormField>

              <FormField 
                label="TaxRush Avg Net Fee" 
                helpText="Your target average net fee per TaxRush return (separate from tax prep average)"
              >
                <CurrencyInput
                  value={answers.taxRushAvgNetFee}
                  placeholder="0"
                  onChange={value => updateAnswers({ taxRushAvgNetFee: value })}
                />
              </FormField>
            </div>
          )}

        <FormField 
          label="Customer Discounts" 
          helpText="Percentage and dollar amount of discounts given to customers - this will be applied to projected revenue"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Percentage Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                placeholder="3.0"
                value={answers.discountsPct ?? ''}
                onChange={e => {
                  const newPct = parseFloat(e.target.value) || undefined
                  updateAnswers({ discountsPct: newPct })
                  
                  // Auto-calculate dollar amount if we have gross fees
                  if (newPct && answers.avgNetFee && answers.taxPrepReturns) {
                    const grossFees = answers.avgNetFee * answers.taxPrepReturns
                    const calculatedAmount = grossFees * (newPct / 100)
                    updateAnswers({ discountsAmt: Math.round(calculatedAmount) })
                  }
                }}
                style={{ 
                  width: '80px', 
                  textAlign: 'right',
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem' 
                }}
              />
              <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
            </div>

            <span style={{ color: '#6b7280' }}>=</span>
            
            {/* Dollar Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder={(answers.avgNetFee && answers.taxPrepReturns) ? Math.round(answers.avgNetFee * answers.taxPrepReturns * 0.03).toString() : '0'}
                value={answers.discountsAmt ?? ''}
                onChange={e => {
                  const newAmt = parseFloat(e.target.value) || undefined
                  updateAnswers({ discountsAmt: newAmt })
                  
                  // Auto-calculate percentage if we have gross fees
                  if (newAmt && answers.avgNetFee && answers.taxPrepReturns) {
                    const grossFees = answers.avgNetFee * answers.taxPrepReturns
                    if (grossFees > 0) {
                      const calculatedPct = (newAmt / grossFees) * 100
                      updateAnswers({ discountsPct: Math.round(calculatedPct * 10) / 10 }) // Round to 1 decimal
                    }
                  }
                }}
                style={{ 
                  width: '80px', 
                  textAlign: 'right',
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem' 
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            Default: 3% • Enter either percentage or dollar amount - the other will auto-calculate
          </div>
        </FormField>

        <FormField 
          label="Gross Tax Prep Fees" 
          helpText="Auto-calculated: Average Net Fee × Tax Prep Returns"
        >
          <CurrencyInput
            value={(() => {
              if (answers.avgNetFee && answers.taxPrepReturns) {
                return Math.round(answers.avgNetFee * answers.taxPrepReturns)
              }
              return undefined
            })()}
            placeholder="Auto-calculated"
            onChange={() => {}} // Read-only
            readOnly
            backgroundColor="#f9fafb"
          />
        </FormField>

        <FormField 
          label="Total Expenses" 
          helpText="Industry standard: 76% of Gross Tax Prep Fees (you can override)"
        >
          <CurrencyInput
            value={(() => {
              if (answers.avgNetFee && answers.taxPrepReturns) {
                const grossFees = answers.avgNetFee * answers.taxPrepReturns
                return Math.round(grossFees * 0.76)
              }
              return undefined
            })()}
            placeholder="Auto-calculated"
            onChange={value => updateAnswers({ projectedExpenses: value })}
          />
        </FormField>

      </FormSection>

      {/* Target Net Income Summary */}
      {answers.avgNetFee && answers.taxPrepReturns && (
        <div style={{ 
          padding: '0.5rem', 
          backgroundColor: '#e0f2fe', 
          borderRadius: '4px',
          fontWeight: 600,
          fontSize: '0.9rem',
          color: '#0369a1',
          marginBottom: '1rem'
        }}>
          Target Net Income: ${calculateNetIncome(answers).toLocaleString()}
          <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
            Net Margin: 24% (industry standard)
          </div>
        </div>
      )}
    </>
  )
}
