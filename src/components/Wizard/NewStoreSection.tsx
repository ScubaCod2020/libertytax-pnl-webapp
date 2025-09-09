// NewStoreSection.tsx - Target Performance Goals for new stores
// Manual entry forecasting without growth slider

import React from 'react'
import type { WizardSectionProps } from './types'
import { calculateNetIncome, formatCurrency, parseCurrencyInput } from './calculations'

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
      <div style={{
        marginBottom: '1rem',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <div>
          <h4 style={{ 
            margin: '0 0 0.75rem 0', 
            fontSize: '1rem', 
            fontWeight: 600, 
            color: '#374151',
            borderBottom: '2px solid #059669',
            paddingBottom: '0.25rem'
          }}>
            Target Performance Goals
          </h4>

          {/* Average Net Fee - Manual entry */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label htmlFor="avg-net-fee" style={{ minWidth: '120px', fontWeight: 500 }}>Average Net Fee</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  id="avg-net-fee"
                  type="text"
                  placeholder="e.g., 130"
                  value={formatCurrency(answers.avgNetFee)}
                  onChange={e => {
                    const newValue = parseCurrencyInput(e.target.value)
                    updateAnswers({ avgNetFee: newValue })
                  }}
                  style={{ 
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem' 
                  }}
                />
              </div>
            </div>
            <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
              Your target average net fee per return
            </div>
          </div>

          {/* Tax Prep Returns - Manual entry */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label htmlFor="tax-prep-returns" style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                <input
                  id="tax-prep-returns"
                  type="number"
                  placeholder="e.g., 1,680"
                  value={answers.taxPrepReturns || ''}
                  onChange={e => updateAnswers({ 
                    taxPrepReturns: parseFloat(e.target.value) || undefined 
                  })}
                  style={{ 
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem' 
                  }}
                />
              </div>
            </div>
            <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
              Your target number of tax returns
            </div>
          </div>

          {/* TaxRush Returns (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label htmlFor="taxrush-returns" style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                  <input
                    id="taxrush-returns"
                    type="number"
                    placeholder="0"
                    value={answers.taxRushReturns || (answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * 0.15) : '')}
                    onChange={e => updateAnswers({ 
                      taxRushReturns: parseFloat(e.target.value) || undefined 
                    })}
                    style={{ 
                      width: '140px', 
                      textAlign: 'right', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '0.5rem' 
                    }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                Your target TaxRush returns for this year (typically ~15% of total returns)
              </div>
            </div>
          )}

          {/* TaxRush Gross Fees (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label htmlFor="taxrush-gross-fees" style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Gross Fees</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                  <input
                    id="taxrush-gross-fees"
                    type="number"
                    placeholder="0"
                    value={answers.taxRushGrossFees || ''}
                    onChange={e => updateAnswers({ 
                      taxRushGrossFees: parseFloat(e.target.value) || undefined 
                    })}
                    style={{ 
                      width: '140px', 
                      textAlign: 'right', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '0.5rem' 
                    }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                Your target gross fees from TaxRush returns (separate from tax prep fees)
              </div>
            </div>
          )}

          {/* TaxRush Average Net Fee (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label htmlFor="taxrush-avg-net-fee" style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Avg Net Fee</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                  <input
                    id="taxrush-avg-net-fee"
                    type="number"
                    placeholder="0"
                    value={answers.taxRushAvgNetFee || ''}
                    onChange={e => updateAnswers({ 
                      taxRushAvgNetFee: parseFloat(e.target.value) || undefined 
                    })}
                    style={{ 
                      width: '140px', 
                      textAlign: 'right', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '0.5rem' 
                    }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                Your target average net fee per TaxRush return (separate from tax prep average)
              </div>
            </div>
          )}

          {/* Gross Tax Prep Fees - Auto-calculated */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label htmlFor="gross-tax-prep-fees" style={{ minWidth: '120px', fontWeight: 500 }}>Gross Tax Prep Fees</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  id="gross-tax-prep-fees"
                  type="text"
                  value={(() => {
                    if (answers.avgNetFee && answers.taxPrepReturns) {
                      const grossFees = Math.round(answers.avgNetFee * answers.taxPrepReturns)
                      return grossFees.toLocaleString()
                    }
                    return ''
                  })()}
                  readOnly
                  style={{ 
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem', 
                    backgroundColor: '#f9fafb' 
                  }}
                />
              </div>
            </div>
            <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
              Auto-calculated: Average Net Fee × Tax Prep Returns
            </div>
          </div>

          {/* Total Expenses - Auto-calculated with override */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label htmlFor="total-expenses" style={{ minWidth: '120px', fontWeight: 500 }}>Total Expenses</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  id="total-expenses"
                  type="text"
                  value={(() => {
                    if (answers.avgNetFee && answers.taxPrepReturns) {
                      const grossFees = answers.avgNetFee * answers.taxPrepReturns
                      const expenses = Math.round(grossFees * 0.76)
                      return expenses.toLocaleString()
                    }
                    return ''
                  })()}
                  onChange={e => {
                    const newValue = parseCurrencyInput(e.target.value)
                    updateAnswers({ projectedExpenses: newValue })
                  }}
                  style={{ 
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem' 
                  }}
                />
              </div>
            </div>
            <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
              Industry standard: 76% of Gross Tax Prep Fees (you can override)
            </div>
          </div>

          {/* Target Net Income Summary */}
          {answers.avgNetFee && answers.taxPrepReturns && (
            <div style={{ 
              padding: '0.5rem', 
              backgroundColor: '#e0f2fe', 
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#0369a1'
            }}>
              Target Net Income: ${calculateNetIncome(answers).toLocaleString()}
              <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                Net Margin: 24% (industry standard)
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
