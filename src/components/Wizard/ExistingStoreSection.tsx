// ExistingStoreSection.tsx - Last Year Performance & Projected Performance for existing stores
// Includes growth slider, bidirectional calculations, and strategic analysis

import React, { useEffect } from 'react'
import type { WizardSectionProps } from './types'
import { GROWTH_OPTIONS, formatCurrency, parseCurrencyInput } from './calculations'
import FormSection from './FormSection'
import FormField, { CurrencyInput, NumberInput, PercentageInput } from './FormField'

/*
SAVED FOR FUTURE USE - Auto-calc button component:

<button
  type="button"
  onClick={() => {
    const calculatedCount = Math.round(answers.lastYearTaxPrepReturns * 0.15)
    const calculatedPct = 15.0
    
    console.log('🔄 Manual recalculation of TaxRush returns:', {
      taxPrepReturns: answers.lastYearTaxPrepReturns,
      calculatedTaxRushReturns: calculatedCount,
      percentage: calculatedPct
    })
    
    updateAnswers({
      lastYearTaxRushReturns: calculatedCount,
      lastYearTaxRushReturnsPct: calculatedPct
    })
  }}
  style={{
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#374151'
  }}
  onMouseOver={e => e.target.style.backgroundColor = '#e5e7eb'}
  onMouseOut={e => e.target.style.backgroundColor = '#f3f4f6'}
>
  ↻ Auto-calc 15%
</button>
*/

export default function ExistingStoreSection({ answers, updateAnswers, region }: WizardSectionProps) {
  
  // Auto-calculate avgNetFee and taxPrepReturns from historical data for projected performance fields
  useEffect(() => {
    if (answers.lastYearGrossFees && answers.lastYearTaxPrepReturns) {
      // Use manual override if available, otherwise calculate from historical data
      const effectiveAvgNetFee = answers.manualAvgNetFee !== undefined 
        ? answers.manualAvgNetFee 
        : answers.lastYearGrossFees / answers.lastYearTaxPrepReturns
      
      // Calculate projected TaxRush Returns for Page 2 - should be 15% of total returns by default
      const projectedTotalReturns = answers.lastYearTaxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
      const defaultTaxRushReturns = Math.round(projectedTotalReturns * 0.15) // 15% of total returns
      
      const effectiveTaxRushReturns = answers.manualTaxRushReturns !== undefined
        ? answers.manualTaxRushReturns
        : defaultTaxRushReturns // Prioritize 15% calculation over historical growth
        
      // Calculate projected TaxRush Gross Fees and Average Net Fee (if TaxRush enabled)
      const effectiveTaxRushGrossFees = answers.handlesTaxRush && answers.lastYearTaxRushGrossFees && answers.expectedGrowthPct !== undefined
        ? answers.lastYearTaxRushGrossFees * (1 + answers.expectedGrowthPct / 100)
        : answers.handlesTaxRush ? (answers.lastYearTaxRushGrossFees || 0) : 0
        
      const effectiveTaxRushAvgNetFee = answers.handlesTaxRush && answers.lastYearTaxRushAvgNetFee && answers.expectedGrowthPct !== undefined
        ? answers.lastYearTaxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100)  
        : answers.handlesTaxRush ? (answers.lastYearTaxRushAvgNetFee || 0) : 0
      
      // Only update if values have changed to avoid infinite loops
      const needsUpdate = answers.avgNetFee !== effectiveAvgNetFee || 
                         answers.taxPrepReturns !== answers.lastYearTaxPrepReturns ||
                         answers.taxRushReturns !== effectiveTaxRushReturns ||
                         (answers.handlesTaxRush && (
                           answers.taxRushGrossFees !== effectiveTaxRushGrossFees ||
                           answers.taxRushAvgNetFee !== effectiveTaxRushAvgNetFee
                         ))
      
      if (needsUpdate) {
        console.log('🧙‍♂️ Auto-calculating from historical data:', {
          effectiveAvgNetFee,
          useManualOverride: answers.manualAvgNetFee !== undefined,
          historicalReturns: answers.lastYearTaxPrepReturns,
          effectiveTaxRushReturns,
          useTaxRushOverride: answers.manualTaxRushReturns !== undefined
        })
        
        updateAnswers({
          avgNetFee: effectiveAvgNetFee,
          taxPrepReturns: answers.lastYearTaxPrepReturns,
          taxRushReturns: effectiveTaxRushReturns, // This is what Page 2 needs!
          ...(answers.handlesTaxRush && {
            taxRushGrossFees: effectiveTaxRushGrossFees, // New TaxRush gross fees for Page 2
            taxRushAvgNetFee: effectiveTaxRushAvgNetFee, // New TaxRush average net fee for Page 2
          }),
          expectedGrowthPct: answers.expectedGrowthPct !== undefined ? answers.expectedGrowthPct : 0 // Default to 0% growth
        })
      }
    }
  }, [
    answers.lastYearGrossFees, 
    answers.lastYearTaxPrepReturns, 
    answers.lastYearTaxRushReturns, 
    answers.lastYearTaxRushGrossFees, 
    answers.lastYearTaxRushAvgNetFee,
    answers.avgNetFee, 
    answers.taxPrepReturns, 
    answers.taxRushReturns,
    answers.taxRushGrossFees, 
    answers.taxRushAvgNetFee,
    answers.handlesTaxRush, // Include handlesTaxRush in dependencies
    answers.manualAvgNetFee, 
    answers.manualTaxRushReturns, 
    answers.expectedGrowthPct, 
    updateAnswers
  ])

  // Ensure default growth rate is set for UX
  useEffect(() => {
    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct === undefined) {
      console.log('🧙‍♂️ Setting default growth rate to 0% for immediate calculations')
      updateAnswers({ expectedGrowthPct: 0 })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, updateAnswers])

  // Auto-populate TaxRush returns when tax prep returns changes (15% default)
  useEffect(() => {
    if (answers.handlesTaxRush && answers.lastYearTaxPrepReturns) {
      const expectedTaxRushCount = Math.round(answers.lastYearTaxPrepReturns * 0.15)
      const expectedTaxRushPct = 15.0
      
      // Auto-populate if no TaxRush returns set, or if current value seems incorrect (like 2 vs 240)
      const shouldAutoPopulate = !answers.lastYearTaxRushReturns || 
                                (answers.lastYearTaxRushReturns < expectedTaxRushCount * 0.5) // If way too low, recalculate
      
      if (shouldAutoPopulate) {
        console.log('🧙‍♂️ Auto-populating TaxRush returns based on tax prep returns:', {
          taxPrepReturns: answers.lastYearTaxPrepReturns,
          currentTaxRushReturns: answers.lastYearTaxRushReturns,
          calculatedTaxRushReturns: expectedTaxRushCount,
          percentage: expectedTaxRushPct,
          reason: !answers.lastYearTaxRushReturns ? 'no value' : 'value too low'
        })
        
        updateAnswers({
          lastYearTaxRushReturns: expectedTaxRushCount,
          lastYearTaxRushReturnsPct: expectedTaxRushPct
        })
      }
    }
  }, [answers.handlesTaxRush, answers.lastYearTaxPrepReturns, answers.lastYearTaxRushReturns, updateAnswers])

  return (
    <>
      {/* TaxRush Toggle Question (Canada only) */}
      {region === 'CA' && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 600, color: '#1e40af' }}>TaxRush Returns</label>
          </div>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>
            Does your office handle TaxRush returns? (TaxRush is Liberty Tax's same-day refund service)
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
              <span style={{ fontWeight: 500 }}>Yes, we handle TaxRush returns</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="handlesTaxRush"
                checked={answers.handlesTaxRush === false}
                onChange={() => updateAnswers({ 
                  handlesTaxRush: false,
                  // Clear TaxRush-related fields when disabled
                  lastYearTaxRushReturns: undefined,
                  lastYearTaxRushReturnsPct: undefined,
                  taxRushReturns: undefined,
                  taxRushReturnsPct: undefined
                })}
                style={{ marginRight: '0.25rem' }}
              />
              <span style={{ fontWeight: 500 }}>No, we don't handle TaxRush</span>
            </label>
          </div>
        </div>
      )}

      {/* Last Year Performance Box */}
      <FormSection 
        title="Last Year Performance" 
        icon="📊" 
        backgroundColor="#f8fafc" 
        borderColor="#6b7280"
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
            onChange={value => {
              console.log('🧙‍♂️ EXISTING - Tax Prep Gross Fees changed:', { 
                oldValue: answers.lastYearGrossFees, 
                newValue: value 
              })
              updateAnswers({ lastYearGrossFees: value })
            }}
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
              width="110px"
              onChange={value => {
                console.log('🧙‍♂️ EXISTING - Discounts Amount changed:', { 
                  oldValue: answers.lastYearDiscountsAmt, 
                  newValue: value 
                })
                updateAnswers({ lastYearDiscountsAmt: value })
              }}
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
              // Use manual override if set, otherwise auto-calculate
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
          label="Total Tax Prep Income" 
          helpText={
            answers.manualTaxPrepIncome !== undefined ? 
              'Manual override - clear field to auto-calculate from Gross Fees - Customer Discounts' :
              'Auto-calculated: Gross Fees - Customer Discounts (assumes 3% if no discount amount entered)'
          }
        >
          <CurrencyInput
            value={(() => {
              // Use manual override if set, otherwise auto-calculate
              if (answers.manualTaxPrepIncome !== undefined) {
                return answers.manualTaxPrepIncome
              }
              if (answers.lastYearGrossFees && answers.lastYearDiscountsAmt) {
                return Math.round(answers.lastYearGrossFees - answers.lastYearDiscountsAmt)
              }
              if (answers.lastYearGrossFees) {
                return Math.round(answers.lastYearGrossFees * 0.97)
              }
              return undefined
            })()}
            placeholder="Auto-calculated"
            onChange={value => updateAnswers({ manualTaxPrepIncome: value })}
            backgroundColor={answers.manualTaxPrepIncome !== undefined ? 'white' : '#f0f9ff'}
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

        {/* TaxRush Gross Fees (Canada only - conditional) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <FormField 
            label="TaxRush Gross Fees" 
            helpText="Total gross fees from TaxRush returns last year (separate from tax prep fees)"
          >
            <CurrencyInput
              value={answers.lastYearTaxRushGrossFees}
              placeholder="0"
              onChange={value => updateAnswers({ lastYearTaxRushGrossFees: value })}
            />
          </FormField>
        )}

          {/* TaxRush Returns - Bidirectional Calculation (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '140px', fontWeight: 500 }}>TaxRush Returns</label>
                
                {/* Return Count Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={(() => {
                      // Show the stored value if available
                      if (answers.lastYearTaxRushReturns) {
                        return answers.lastYearTaxRushReturns
                      }
                      // Otherwise show calculated 15% value
                      if (answers.lastYearTaxPrepReturns) {
                        return Math.round(answers.lastYearTaxPrepReturns * 0.15)
                      }
                      return ''
                    })()}
                    onChange={e => {
                      const newCount = parseFloat(e.target.value) || undefined
                      // Calculate percentage from count
                      const newPct = newCount && answers.lastYearTaxPrepReturns 
                        ? Math.round((newCount / answers.lastYearTaxPrepReturns) * 100 * 10) / 10 // Round to 1 decimal
                        : 15 // Default to 15%
                      
                      console.log('🧙‍♂️ EXISTING - TaxRush Returns count changed:', { 
                        oldCount: answers.lastYearTaxRushReturns, 
                        newCount,
                        calculatedPct: newPct
                      })
                      updateAnswers({ 
                        lastYearTaxRushReturns: newCount,
                        lastYearTaxRushReturnsPct: newPct
                      })
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

                {/* Percentage Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>= </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    placeholder="15"
                    value={answers.lastYearTaxRushReturnsPct !== undefined ? answers.lastYearTaxRushReturnsPct : 15}
                    onChange={e => {
                      const newPct = parseFloat(e.target.value)
                      // Calculate count from percentage
                      const newCount = !isNaN(newPct) && answers.lastYearTaxPrepReturns 
                        ? Math.round(answers.lastYearTaxPrepReturns * (newPct / 100))
                        : undefined
                      
                      console.log('🧙‍♂️ EXISTING - TaxRush Returns percentage changed:', { 
                        oldPct: answers.lastYearTaxRushReturnsPct, 
                        newPct,
                        calculatedCount: newCount
                      })
                      updateAnswers({ 
                        lastYearTaxRushReturnsPct: isNaN(newPct) ? undefined : newPct,
                        lastYearTaxRushReturns: newCount
                      })
                    }}
                    style={{ 
                      width: '60px', 
                      textAlign: 'right',
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '0.5rem' 
                    }}
                  />
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                Number and percentage of TaxRush returns filed last year (typically ~15% of total returns)
              </div>
            </div>
          )}

          {/* TaxRush Average Net Fee (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '140px', fontWeight: 500 }}>TaxRush Avg Net Fee</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={answers.lastYearTaxRushAvgNetFee || ''}
                    onChange={e => updateAnswers({ 
                      lastYearTaxRushAvgNetFee: parseFloat(e.target.value) || undefined 
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
                Average net fee per TaxRush return last year (separate from tax prep average)
              </div>
            </div>
          )}

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

          {/* Last Year Summary Box */}
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f0fdf4', 
            border: '2px solid #16a34a', 
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#15803d'
          }}>
            Total Revenue: ${(() => {
              if (answers.lastYearGrossFees) {
                const lastYearDiscountsPct = answers.lastYearDiscountsPct || 3
                const lastYearDiscountAmt = answers.lastYearGrossFees * (lastYearDiscountsPct / 100)
                const lastYearTaxPrepIncome = answers.lastYearGrossFees - lastYearDiscountAmt
                
                const lastYearOtherIncome = answers.lastYearOtherIncome || 0
                // TaxRush income disabled until TaxRush fields are properly configured
                const lastYearTaxRushIncome = 0
                // TODO: Re-enable when TaxRush gross fees and average net fee are properly set up
                // const lastYearTaxRushIncome = region === 'CA' && answers.handlesTaxRush && answers.taxRushAvgNetFee && answers.lastYearTaxRushReturns
                //   ? answers.taxRushAvgNetFee * answers.lastYearTaxRushReturns
                //   : 0
                
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
                  // TaxRush income disabled until TaxRush fields are properly configured
                  const lastYearTaxRushIncome = 0
                  // TODO: Re-enable when TaxRush gross fees and average net fee are properly set up
                  // const lastYearTaxRushIncome = region === 'CA' && answers.handlesTaxRush && answers.taxRushAvgNetFee && answers.lastYearTaxRushReturns
                  //   ? answers.taxRushAvgNetFee * answers.lastYearTaxRushReturns
                  //   : 0
                  
                  const totalRevenue = lastYearTaxPrepIncome + lastYearOtherIncome + lastYearTaxRushIncome
                  const netIncome = totalRevenue - answers.lastYearExpenses
                  return Math.round(netIncome).toLocaleString()
                }
                return '—'
              })()}
            </span>
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
                  value={answers.expectedGrowthPct !== undefined ? answers.expectedGrowthPct : 0}
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
                aria-label="Performance change growth percentage options"
                value={
                  answers.expectedGrowthPct !== undefined 
                    ? (GROWTH_OPTIONS.find(opt => opt.value === answers.expectedGrowthPct) 
                        ? answers.expectedGrowthPct.toString() 
                        : 'custom')
                    : '0'
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
                aria-label="Expected growth percentage slider"
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

          {/* TaxRush Returns - Bidirectional Calculation (Canada only - conditional) */}
          {region === 'CA' && answers.handlesTaxRush && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                
                {/* Return Count Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={(() => {
                      // Use manual override if available
                      if (answers.manualTaxRushReturns !== undefined) {
                        return answers.manualTaxRushReturns
                      }
                      
                      // Calculate projected tax prep returns first
                      const projectedTaxPrepReturns = answers.lastYearTaxPrepReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.lastYearTaxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                        : answers.lastYearTaxPrepReturns
                      
                      // Default to 15% of projected tax prep returns
                      if (projectedTaxPrepReturns) {
                        return Math.round(projectedTaxPrepReturns * 0.15)
                      }
                      
                      // Fallback to historical TaxRush returns with growth
                      if (answers.lastYearTaxRushReturns && answers.expectedGrowthPct !== undefined) {
                        return Math.round(answers.lastYearTaxRushReturns * (1 + answers.expectedGrowthPct / 100))
                      }
                      
                      return answers.lastYearTaxRushReturns || ''
                    })()}
                    onChange={e => {
                      const newCount = parseFloat(e.target.value) || undefined
                      
                      // Calculate percentage from count using projected tax prep returns
                      const projectedTaxPrepReturns = answers.lastYearTaxPrepReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.lastYearTaxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                        : answers.lastYearTaxPrepReturns
                      
                      const newPct = newCount && projectedTaxPrepReturns 
                        ? Math.round((newCount / projectedTaxPrepReturns) * 100 * 10) / 10 // Round to 1 decimal
                        : 15 // Default to 15%
                      
                      console.log('🧙‍♂️ PROJECTED - TaxRush Returns count changed:', { 
                        oldCount: answers.manualTaxRushReturns, 
                        newCount,
                        projectedTaxPrepReturns,
                        calculatedPct: newPct
                      })
                      
                      updateAnswers({ 
                        manualTaxRushReturns: newCount, // Track manual override
                        taxRushReturns: newCount || 0,   // Set main field for Page 2
                        taxRushReturnsPct: newPct       // Update projected percentage
                      })
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

                {/* Percentage Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ color: '#6b7280' }}>= </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    placeholder="15"
                    value={(() => {
                      // Use manual percentage if available
                      if (answers.taxRushReturnsPct !== undefined) {
                        return answers.taxRushReturnsPct
                      }
                      
                      // Calculate percentage from projected count
                      const projectedTaxPrepReturns = answers.lastYearTaxPrepReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.lastYearTaxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                        : answers.lastYearTaxPrepReturns
                      
                      const currentCount = answers.manualTaxRushReturns !== undefined
                        ? answers.manualTaxRushReturns
                        : (projectedTaxPrepReturns ? Math.round(projectedTaxPrepReturns * 0.15) : 0)
                      
                      return projectedTaxPrepReturns && currentCount 
                        ? Math.round((currentCount / projectedTaxPrepReturns) * 100 * 10) / 10
                        : 15
                    })()}
                    onChange={e => {
                      const newPct = parseFloat(e.target.value)
                      
                      // Calculate count from percentage using projected tax prep returns  
                      const projectedTaxPrepReturns = answers.lastYearTaxPrepReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.lastYearTaxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                        : answers.lastYearTaxPrepReturns
                      
                      const newCount = !isNaN(newPct) && projectedTaxPrepReturns 
                        ? Math.round(projectedTaxPrepReturns * (newPct / 100))
                        : undefined
                      
                      console.log('🧙‍♂️ PROJECTED - TaxRush Returns percentage changed:', { 
                        oldPct: answers.taxRushReturnsPct, 
                        newPct,
                        projectedTaxPrepReturns,
                        calculatedCount: newCount
                      })
                      
                      updateAnswers({ 
                        taxRushReturnsPct: isNaN(newPct) ? undefined : newPct,
                        manualTaxRushReturns: newCount, // Track manual override
                        taxRushReturns: newCount || 0   // Set main field for Page 2
                      })
                    }}
                    style={{ 
                      width: '60px', 
                      textAlign: 'right',
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '0.5rem' 
                    }}
                  />
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                {answers.manualTaxRushReturns !== undefined ?
                  'Manual override applied (you can edit or clear to use auto-calculation)' :
                  'Auto-calculated as 15% of projected tax prep returns (you can override)'
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
                  title="Auto-calculated Gross Tax Prep Fees based on projected average net fee and tax prep returns"
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
                  title="Total Expenses"
                  placeholder="Enter total expenses"
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
              padding: '1rem', 
              backgroundColor: '#e0f2fe', 
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#0369a1',
              border: '2px solid #0ea5e9'
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
                
                // Add TaxRush income (disabled until TaxRush fields are fully configured)
                const projectedTaxRushIncome = 0
                // TODO: Re-enable when TaxRush gross fees and average net fee are properly set up
                // const projectedTaxRushIncome = region === 'CA' && answers.lastYearTaxRushReturns && answers.taxRushAvgNetFee
                //   ? (answers.taxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100)) * (answers.lastYearTaxRushReturns * (1 + answers.expectedGrowthPct / 100))
                //   : 0
                
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
