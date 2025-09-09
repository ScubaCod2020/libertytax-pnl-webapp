// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Includes growth slider, bidirectional calculations, and strategic analysis

import React from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS, formatCurrency, parseCurrencyInput } from './calculations'

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  return (
    <>
      {/* Last Year Performance Box */}
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
            borderBottom: '2px solid #6b7280',
            paddingBottom: '0.25rem'
          }}>
            Last Year Performance
          </h4>
          
          {/* Tax Prep Gross Fees Input */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '140px', fontWeight: 500 }}>Tax Prep Gross Fees</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  placeholder="e.g., 206,000"
                  value={formatCurrency(answers.lastYearGrossFees)}
                  onChange={e => {
                    const newValue = parseCurrencyInput(e.target.value)
                    console.log('🧙‍♂️ EXISTING - Tax Prep Gross Fees changed:', { 
                      oldValue: answers.lastYearGrossFees, 
                      newValue 
                    })
                    updateAnswers({ lastYearGrossFees: newValue })
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
              Total tax prep fees charged (before any discounts)
            </div>
          </div>

          {/* Customer Discounts - Bidirectional Calculation */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '140px', fontWeight: 500 }}>Customer Discounts</label>
              
              {/* Dollar Amount Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  placeholder="e.g., 6,000"
                  value={formatCurrency(answers.lastYearDiscountsAmt)}
                  onChange={e => {
                    const newValue = parseCurrencyInput(e.target.value)
                    console.log('🧙‍♂️ EXISTING - Discounts Amount changed:', { 
                      oldValue: answers.lastYearDiscountsAmt, 
                      newValue 
                    })
                    updateAnswers({ lastYearDiscountsAmt: newValue })
                  }}
                  style={{ 
                    width: '110px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem' 
                  }}
                />
              </div>

              {/* Auto-Calculated Percentage Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ color: '#6b7280' }}>= </span>
                <div style={{ 
                  width: '50px', 
                  textAlign: 'right', 
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  {answers.lastYearGrossFees && answers.lastYearDiscountsAmt 
                    ? ((answers.lastYearDiscountsAmt / answers.lastYearGrossFees) * 100).toFixed(1)
                    : '0.0'
                  }
                </div>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
              </div>
            </div>
            <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
              Total discounts given to customers (percentage auto-calculated)
            </div>
          </div>

          {/* Total Tax Prep Income - Auto-calculated Display */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '140px', fontWeight: 500 }}>Total Tax Prep Income</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <div style={{
                  width: '140px',
                  textAlign: 'right',
                  padding: '0.5rem',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #60a5fa',
                  borderRadius: '4px',
                  fontWeight: 600,
                  color: '#1e40af'
                }}>
                  {answers.lastYearGrossFees && answers.lastYearDiscountsAmt 
                    ? Math.round(answers.lastYearGrossFees - answers.lastYearDiscountsAmt).toLocaleString()
                    : answers.lastYearGrossFees 
                    ? Math.round(answers.lastYearGrossFees * 0.97).toLocaleString()
                    : '—'
                  }
                </div>
              </div>
            </div>
            <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
              Auto-calculated: Gross Fees - Customer Discounts (assumes 3% if no discount amount entered)
            </div>
          </div>

          {/* Other Income */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '140px', fontWeight: 500 }}>Other Income</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  placeholder="e.g., 2,500"
                  value={formatCurrency(answers.lastYearOtherIncome)}
                  onChange={e => {
                    const rawValue = e.target.value.replace(/[,$]/g, '')
                    if (rawValue === '') {
                      updateAnswers({ lastYearOtherIncome: undefined })
                    } else {
                      const parsedValue = parseFloat(rawValue)
                      updateAnswers({ 
                        lastYearOtherIncome: isNaN(parsedValue) ? undefined : parsedValue 
                      })
                    }
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
              Optional: Additional revenue streams (bookkeeping, notary, etc.) - Enter 0 or leave blank if none
            </div>
          </div>

          {/* TaxRush Returns (Canada only) */}
          {region === 'CA' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '140px', fontWeight: 500 }}>TaxRush Returns</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={answers.lastYearTaxRushReturns || ''}
                    onChange={e => updateAnswers({ 
                      lastYearTaxRushReturns: parseFloat(e.target.value) || undefined 
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
                Number of TaxRush returns filed (Canada only)
              </div>
            </div>
          )}

          {/* Total Expenses */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '140px', fontWeight: 500 }}>Total Expenses</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  placeholder="e.g., 150,000"
                  value={formatCurrency(answers.lastYearExpenses)}
                  onChange={e => {
                    const newValue = parseCurrencyInput(e.target.value)
                    updateAnswers({ lastYearExpenses: newValue })
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
              All expenses including salaries, rent, supplies, royalties, etc.
            </div>
          </div>

          {/* Last Year Summary Box */}
          <div style={{ 
            padding: '0.5rem', 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #16a34a', 
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: '#15803d'
          }}>
            Total Revenue: ${(() => {
              if (answers.lastYearGrossFees) {
                const lastYearDiscountsPct = answers.lastYearDiscountsPct || 3
                const lastYearDiscountAmt = answers.lastYearGrossFees * (lastYearDiscountsPct / 100)
                const lastYearTaxPrepIncome = answers.lastYearGrossFees - lastYearDiscountAmt
                
                const lastYearOtherIncome = answers.lastYearOtherIncome || 0
                const lastYearTaxRushIncome = region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns
                  ? answers.avgNetFee * answers.lastYearTaxRushReturns
                  : 0
                
                const total = lastYearTaxPrepIncome + lastYearOtherIncome + lastYearTaxRushIncome
                return Math.round(total).toLocaleString()
              }
              return '—'
            })()}
            <span style={{ marginLeft: '1rem', fontWeight: 'normal' }}>
              Net Income: ${(() => {
                if (answers.lastYearGrossFees && answers.lastYearExpenses) {
                  const lastYearDiscountsPct = answers.lastYearDiscountsPct || 3
                  const lastYearDiscountAmt = answers.lastYearGrossFees * (lastYearDiscountsPct / 100)
                  const lastYearTaxPrepIncome = answers.lastYearGrossFees - lastYearDiscountAmt
                  
                  const lastYearOtherIncome = answers.lastYearOtherIncome || 0
                  const lastYearTaxRushIncome = region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns
                    ? answers.avgNetFee * answers.lastYearTaxRushReturns
                    : 0
                  
                  const totalRevenue = lastYearTaxPrepIncome + lastYearOtherIncome + lastYearTaxRushIncome
                  const netIncome = totalRevenue - answers.lastYearExpenses
                  return Math.round(netIncome).toLocaleString()
                }
                return '—'
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Projected Performance Box */}
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
            Projected Performance
          </h4>

          {/* Performance Change Slider Section */}
          <div style={{ marginBottom: '1rem' }}>
            {/* Field Label, Input, and Dropdown - ALL INLINE */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              marginBottom: '0.5rem', 
              flexWrap: 'wrap' 
            }}>
              <label style={{ minWidth: '140px', fontWeight: 500 }}>Performance Change</label>
              
              {/* Direct percentage input - always visible */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="number"
                  step="1"
                  min="-50"
                  max="100"
                  value={answers.expectedGrowthPct || ''}
                  onChange={e => {
                    const value = parseInt(e.target.value)
                    console.log('🎛️ EXISTING - Direct input changed:', { value })
                    updateAnswers({ expectedGrowthPct: isNaN(value) ? undefined : value })
                  }}
                  placeholder="0"
                  style={{ 
                    width: '70px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem' 
                  }}
                />
                <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
              </div>

              {/* Dropdown INLINE with label and input */}
              <select 
                value={
                  answers.expectedGrowthPct !== undefined 
                    ? (GROWTH_OPTIONS.find(opt => opt.value === answers.expectedGrowthPct) 
                        ? answers.expectedGrowthPct.toString() 
                        : 'custom')
                    : ''
                }
                style={{ 
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  minWidth: '200px'
                }}
                onChange={e => {
                  const val = e.target.value
                  console.log('🎛️ EXISTING - Dropdown changed:', { selectedValue: val })
                  
                  if (val === '' || val === 'custom') {
                    // Keep current value, don't override
                    console.log('🎛️ EXISTING - Custom or empty selected, keeping current value')
                  } else {
                    updateAnswers({ expectedGrowthPct: parseFloat(val) })
                  }
                }}
              >
                <option value="custom">Custom percentage</option>
                {GROWTH_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slider underneath for visual feedback and precision */}
            <div style={{ marginLeft: '100px', marginBottom: '0.5rem' }}>
              <input
                type="range"
                min="-50"
                max="100"
                step="1"
                value={answers.expectedGrowthPct || 0}
                onChange={e => {
                  const value = parseInt(e.target.value)
                  console.log('🎛️ EXISTING - Slider changed:', { value })
                  updateAnswers({ expectedGrowthPct: value })
                }}
                style={{
                  width: '280px',
                  height: '6px',
                  borderRadius: '3px',
                  background: '#ddd',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Simplified instructional text */}
            <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
              Enter percentage, use slider for precision, or select preset (+ growth, - decline)
            </div>
          </div>

          {/* Calculated Input Fields */}
          
          {/* Average Net Fee - Calculated with override */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '120px', fontWeight: 500 }}>Average Net Fee</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  placeholder="e.g., 130"
                  value={(() => {
                    if (answers.avgNetFee && answers.expectedGrowthPct !== undefined) {
                      const calculatedValue = Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
                      return calculatedValue.toLocaleString()
                    }
                    return formatCurrency(answers.avgNetFee)
                  })()}
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
              {answers.avgNetFee && answers.expectedGrowthPct !== undefined ? 
                `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                'Your projected average net fee per return'
              }
            </div>
          </div>

          {/* Tax Prep Returns - Calculated with override */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                <input
                  type="number"
                  placeholder="e.g., 1,680"
                  value={
                    answers.taxPrepReturns && answers.expectedGrowthPct !== undefined 
                      ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                      : (answers.taxPrepReturns || '')
                  }
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
              {answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? 
                `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                'Your projected number of tax returns'
              }
            </div>
          </div>

          {/* TaxRush Returns (Canada only) - Calculated with override */}
          {region === 'CA' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={
                      answers.taxRushReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
                        : (answers.taxRushReturns || '')
                    }
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
                {answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? 
                  `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                  'Your projected TaxRush returns (Canada only)'
                }
              </div>
            </div>
          )}

          {/* Gross Tax Prep Fees - Auto-calculated */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '120px', fontWeight: 500 }}>Gross Tax Prep Fees</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  value={(() => {
                    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
                      // Apply growth
                      const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                      const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                      const grossFees = Math.round(projectedAvgNetFee * projectedTaxPrepReturns)
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
              Auto-calculated: Projected Average Net Fee × Projected Tax Prep Returns
            </div>
          </div>

          {/* Total Expenses - Calculated with override */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '120px', fontWeight: 500 }}>Total Expenses</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="text"
                  value={(() => {
                    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
                      const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                      const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                      const grossFees = projectedAvgNetFee * projectedTaxPrepReturns
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
              Industry standard: 76% of Gross Tax Prep Fees above (you can override)
            </div>
          </div>

          {/* Projected Revenue Summary */}
          {answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined && (
            <div style={{ 
              padding: '0.5rem', 
              backgroundColor: '#e0f2fe', 
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: '#0369a1'
            }}>
              Projected Revenue: ${(() => {
                const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                const projectedGrossFees = projectedAvgNetFee * projectedTaxPrepReturns
                
                // Apply discounts
                const discountsPct = answers.lastYearDiscountsPct || 3
                const projectedDiscountAmt = projectedGrossFees * (discountsPct / 100)
                const projectedTaxPrepIncome = projectedGrossFees - projectedDiscountAmt
                
                // Add other income with growth
                const projectedOtherIncome = (answers.lastYearOtherIncome || 0) * (1 + answers.expectedGrowthPct / 100)
                
                // Add TaxRush income
                const projectedTaxRushIncome = region === 'CA' && answers.lastYearTaxRushReturns 
                  ? projectedAvgNetFee * (answers.lastYearTaxRushReturns * (1 + answers.expectedGrowthPct / 100))
                  : 0
                
                const totalRevenue = projectedTaxPrepIncome + projectedOtherIncome + projectedTaxRushIncome
                return Math.round(totalRevenue).toLocaleString()
              })()}
              <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                {(() => {
                  const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                  const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                  const originalRevenue = answers.avgNetFee * answers.taxPrepReturns
                  const projectedRevenue = projectedAvgNetFee * projectedTaxPrepReturns
                  const growthPct = Math.round(((projectedRevenue - originalRevenue) / originalRevenue) * 100)
                  return ` (+${growthPct}% growth)`
                })()}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
