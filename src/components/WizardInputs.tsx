// WizardInputs.tsx - Comprehensive data-driven expense input component
// Organized sections with validation and region-specific handling

import React from 'react'
import { 
  expenseFields, 
  expenseCategories, 
  getFieldsByCategory,
  getFieldsForRegion,
  type ExpenseField,
  type ExpenseCategory 
} from '../types/expenses'
import type { WizardAnswers } from './WizardShell'

interface WizardInputsProps {
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  onNext: () => void
  onBack: () => void
  canProceed: boolean
}

export default function WizardInputs({ 
  answers, 
  updateAnswers, 
  onNext, 
  onBack, 
  canProceed 
}: WizardInputsProps) {
  
  // Helper function to format currency for display
  const formatCurrency = (value: number): string => {
    return value.toLocaleString()
  }
  
  // Helper functions for independent field growth tracking
  const calculateFieldGrowth = (currentValue: number, originalValue: number): number => {
    if (!originalValue || originalValue === 0) return 0
    return Math.round(((currentValue - originalValue) / originalValue) * 100)
  }
  
  const getFieldVarianceMessage = (fieldName: string, actualGrowth: number, expectedGrowth: number): string => {
    const variance = actualGrowth - expectedGrowth
    if (Math.abs(variance) <= 1) {
      return `📋 Projected ${fieldName.toLowerCase()} with ${expectedGrowth > 0 ? '+' : ''}${expectedGrowth}% growth (matches projection)`
    } else if (variance > 0) {
      return `📋 ${actualGrowth > 0 ? '+' : ''}${actualGrowth}% growth (${Math.abs(variance)}% higher than your ${expectedGrowth}% projection)`
    } else {
      return `📋 ${actualGrowth > 0 ? '+' : ''}${actualGrowth}% growth (${Math.abs(variance)}% lower than your ${expectedGrowth}% projection)`
    }
  }
  
  // 🧙‍♂️ DEBUG: Log when inputs page loads or answers change
  React.useEffect(() => {
    console.log('🧙‍♂️ WIZARD INPUTS DEBUG - Page loaded/updated:', {
      page: 'inputs_step',
      region: answers.region,
      avgNetFee: answers.avgNetFee,
      taxPrepReturns: answers.taxPrepReturns,
      expectedRevenue: answers.expectedRevenue,
      totalFieldsSet: Object.keys(answers).filter(key => (answers as any)[key] !== undefined).length
    })
  }, [answers])
  
  // Get fields appropriate for current region
  const relevantFields = getFieldsForRegion(answers.region)
  
  const renderDualExpenseInput = (field: ExpenseField) => {
    // Force correct franchise royalty values
    let percentageValue
    if (field.id === 'royaltiesPct') {
      percentageValue = 14 // Always 14% for Tax Prep Royalties
    } else if (field.id === 'advRoyaltiesPct') {
      percentageValue = 5 // Always 5% for Advertising Royalties
    } else {
      percentageValue = (answers as any)[field.id] ?? field.defaultValue
    }
    
    const isFixed = field.calculationBase === 'fixed_amount'
    const isDisabled = field.regionSpecific === 'CA' && answers.region !== 'CA'
    const isFranchiseRoyalty = field.category === 'franchise' && field.id.includes('oyalties')
    const isLocked = isFranchiseRoyalty // Franchise royalties are locked/read-only
    
    // Calculate the base for dollar conversion - USING PROJECTED PERFORMANCE
    const getCalculationBase = () => {
      // Use PROJECTED values (same logic as revenue breakdown)
      const currentAvgNetFee = answers.projectedAvgNetFee || (answers.avgNetFee && answers.expectedGrowthPct !== undefined ? answers.avgNetFee * (1 + answers.expectedGrowthPct / 100) : answers.avgNetFee)
      const currentTaxPrepReturns = answers.projectedTaxPrepReturns || (answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100) : answers.taxPrepReturns)
      
      const grossFees = currentAvgNetFee && currentTaxPrepReturns ? currentAvgNetFee * currentTaxPrepReturns : 0
      const discounts = grossFees * ((answers.discountsPct || 3) / 100)
      const taxPrepIncome = grossFees - discounts
      
      switch (field.calculationBase) {
        case 'percentage_gross':
          // Use actual gross fees (before discounts)
          return grossFees
        case 'percentage_tp_income':
          // Use tax prep income (after discounts) - this is the Net Tax Prep Revenue
          return taxPrepIncome
        case 'percentage_salaries':
          // Base on actual gross fees, then apply salary percentage
          return grossFees * ((answers as any).salariesPct || 25) / 100
        case 'fixed_amount':
          return 1 // For fixed amounts, percentage doesn't apply
        default:
          return 0
      }
    }

    const calculationBase = getCalculationBase()
    const dollarValue = isFixed ? percentageValue : Math.round(calculationBase * percentageValue / 100)
    
    const handlePercentageChange = (newPercentage: number) => {
      const validPercentage = Math.max(0, Math.min(100, newPercentage))
      updateAnswers({ [field.id]: validPercentage })
    }
    
    const handleDollarChange = (newDollar: number) => {
      const validDollar = Math.max(0, newDollar)
      if (isFixed) {
        updateAnswers({ [field.id]: validDollar })
      } else if (calculationBase > 0) {
        const newPercentage = Math.round(validDollar / calculationBase * 100) // Round to whole number
        const cappedPercentage = Math.max(0, Math.min(100, newPercentage))
        updateAnswers({ [field.id]: cappedPercentage })
      }
    }
    
    return (
      <div key={field.id} style={{ marginBottom: '0.75rem' }}>
        {/* Field label and inputs - horizontal layout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <label 
            title={field.description}
            style={{ minWidth: '120px', fontWeight: 500 }}
          >
          {field.label}
          {field.regionSpecific === 'CA' && ' (CA only)'}
        </label>
        
          {/* Input group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Percentage/Fixed Amount Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isFixed && <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>}
            <input
              type="number"
              min={0}
              max={isFixed ? undefined : 100}
                step={1}
              value={percentageValue}
              onChange={e => handlePercentageChange(+e.target.value || 0)}
                disabled={isDisabled || isLocked}
                readOnly={isLocked}
              placeholder={field.defaultValue.toString()}
                style={{ 
                  width: '80px', 
                  textAlign: 'right',
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem'
                }}
              />
              {!isFixed && <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>}
          </div>
          
          {/* Dollar Input - only show for percentage-based fields */}
          {!isFixed && (
              <>
                <span style={{ color: '#6b7280' }}>=</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min={0}
                step={1}
                value={dollarValue || ''}
                onChange={e => handleDollarChange(+e.target.value || 0)}
                    disabled={isDisabled || calculationBase === 0 || isLocked}
                    readOnly={isLocked}
                placeholder="0"
                    style={{ 
                      width: '80px', 
                      textAlign: 'right',
                      border: '1px solid #d1d5db', 
                      borderRadius: '4px', 
                      padding: '0.5rem'
                    }}
                  />
              </div>
              </>
            )}
            </div>
        </div>
        
        {/* Percentage Slider - only for percentage-based, non-locked fields */}
        {!isFixed && !isLocked && (
          <div style={{ marginLeft: '100px', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={percentageValue}
              onChange={e => handlePercentageChange(+e.target.value)}
              disabled={isDisabled}
              style={{
                width: '200px',
                height: '6px',
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        )}
        
        {/* Locked field indicator */}
        {isLocked && (
          <div style={{ marginLeft: '100px', marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
            🔒 Locked per franchise agreement
          </div>
        )}
        
        {/* Field description */}
        {field.description && (
          <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
            {field.description}
            {!isFixed && calculationBase > 0 && (
              <span style={{ color: '#059669' }}>
                {' '}• Base: ${calculationBase.toLocaleString()}
                {field.calculationBase === 'percentage_gross' && ' (gross fees - fixed)'}
                {field.calculationBase === 'percentage_salaries' && ' (salary amount - updates when salaries change)'}
                {field.calculationBase === 'percentage_tp_income' && ' (tax prep income - fixed)'}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderCategorySection = (category: ExpenseCategory) => {
    const categoryFields = getFieldsByCategory(category).filter(field =>
      relevantFields.includes(field)
    )
    
    if (categoryFields.length === 0) return null

    return (
      <div key={category} className="expense-section" style={{ 
        marginBottom: '1.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fafafa'
      }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#374151',
          fontSize: '1.1rem',
          borderBottom: '2px solid #6b7280',
          paddingBottom: '0.25rem'
        }}>
          {getCategoryIcon(category)}
          {expenseCategories[category].label}
          <span className="small" style={{ fontWeight: 400, opacity: 0.7 }}>
            ({categoryFields.length} {categoryFields.length === 1 ? 'field' : 'fields'})
          </span>
        </div>
        <div className="small" style={{ 
          marginBottom: '0.75rem', 
          opacity: 0.8,
          fontStyle: 'italic'
        }}>
          {expenseCategories[category].description}
        </div>
        
        <div>
          {categoryFields.map(renderDualExpenseInput)}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card-title">Income & Expense Inputs</div>
      <p className="small" style={{ marginBottom: '1.5rem' }}>
        Enter your expected income and expense values. All fields have reasonable defaults, 
        but customizing them will give you more accurate P&L projections.
      </p>

      {/* Income Drivers Section */}
      <div className="expense-section" style={{ 
        marginBottom: '1.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#fafafa'
      }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          fontWeight: 600,
          color: '#059669',
          fontSize: '1.1rem',
          borderBottom: '2px solid #059669',
          paddingBottom: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          💰 Income Drivers
          </div>
          
          {/* Strategic Reset Button - show if we have strategic capability */}
          {answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && answers.avgNetFee && answers.taxPrepReturns && (
            <button
              type="button"
              onClick={() => {
                console.log('🎯 STRATEGIC RESET - Resetting income drivers to strategic targets')
                updateAnswers({ 
                  projectedAvgNetFee: undefined,
                  projectedTaxPrepReturns: undefined
                })
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Reset ONLY income fields back to your strategic growth targets from Page 1"
            >
              🎯 Reset Income to Strategic Goals
            </button>
          )}
        </div>

        {/* Performance-based calculations for existing stores */}
        {answers.expectedRevenue && (
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem' }}>
              📊 Performance-Based Targets
            </div>
            <div style={{ color: '#0369a1' }}>
              Expected Net Income: <strong>${answers.expectedRevenue.toLocaleString()}</strong>
              {answers.expectedGrowthPct !== undefined && (
                <span> (based on {answers.expectedGrowthPct > 0 ? '+' : ''}{answers.expectedGrowthPct}% growth projection)</span>
              )}
            </div>
            
            {/* Show Strategic Target Breakdown */}
            {answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && answers.avgNetFee && answers.taxPrepReturns && (
              <div style={{ color: '#0369a1', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Strategic Targets:</div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>Average Net Fee: <strong>${Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)).toLocaleString()}</strong></span>
                  <span>Tax Prep Returns: <strong>{Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)).toLocaleString()}</strong></span>
                </div>
              </div>
            )}
            
            <div className="small" style={{ color: '#0369a1', marginTop: '0.25rem' }}>
              Build your gross revenue below, then set expenses to achieve this net income target
            </div>
          </div>
        )}
        
        {/* Average Net Fee */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <label style={{ minWidth: '120px', fontWeight: 500 }}>Average Net Fee {answers.storeType === 'existing' && '📋'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
            <input
              type="number"
              min={50}
              max={500}
                step={1}
                value={
                  // Priority order: manual projected value > calculated projection > direct input
                  answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
                  answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && answers.avgNetFee
                    ? Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
                    : (answers.avgNetFee || '')
                }
                onChange={e => {
                  const newValue = +e.target.value || undefined
                  
                  // Independent field tracking: calculate individual growth without affecting global projection
                  if (answers.storeType === 'existing' && newValue && answers.avgNetFee) {
                    const originalAvgNetFee = answers.avgNetFee
                      
                    if (originalAvgNetFee && originalAvgNetFee > 0) {
                      // Calculate individual growth for this field only
                      const individualGrowthPct = calculateFieldGrowth(newValue, originalAvgNetFee)
                      console.log('🔄 INDEPENDENT TRACKING - Average Net Fee manually adjusted:', {
                        newValue,
                        originalAvgNetFee, 
                        individualGrowthPct,
                        globalProjection: answers.expectedGrowthPct
                      })
                      
                      // Store the manual projected value (don't update global growth percentage)
                      updateAnswers({ 
                        projectedAvgNetFee: newValue
                      })
                      return
                    }
                  }
                  
                  // Standard update for new stores
                  updateAnswers({ avgNetFee: newValue })
                }}
                placeholder="e.g., 125"
              required
                style={{
                  width: '140px', 
                  textAlign: 'right', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem',
                  ...(answers.storeType === 'existing' ? { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' } : {})
                }}
              />
            </div>
          </div>
          <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
            {(() => {
              if (answers.storeType !== 'existing') {
                return 'Average fee per tax return after discounts'
              }
              
              if (answers.expectedGrowthPct === undefined) {
                return '📋 Carried forward from page 1 (you can adjust)'
              }
              
              // Calculate current field growth vs original
              const currentValue = answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
                answers.avgNetFee ? Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)) : 0
              
              if (answers.avgNetFee && currentValue) {
                const actualGrowth = calculateFieldGrowth(currentValue, answers.avgNetFee)
                return getFieldVarianceMessage('fee', actualGrowth, answers.expectedGrowthPct)
              }
              
              return `📋 Projected fee with ${answers.expectedGrowthPct > 0 ? '+' : ''}${answers.expectedGrowthPct}% growth`
            })()}
            </div>
          </div>

        {/* Tax Prep Returns */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <label style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns {answers.storeType === 'existing' && '📋'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
            <input
              type="number"
              min={100}
              max={10000}
                step={1}
                value={
                  // Priority order: manual projected value > calculated projection > direct input
                  answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
                  answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && answers.taxPrepReturns
                    ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                    : (answers.taxPrepReturns || '')
                }
                onChange={e => {
                  const newValue = +e.target.value || undefined
                  
                  // Independent field tracking: calculate individual growth without affecting global projection
                  if (answers.storeType === 'existing' && newValue && answers.taxPrepReturns) {
                    const originalTaxPrepReturns = answers.taxPrepReturns
                      
                    if (originalTaxPrepReturns && originalTaxPrepReturns > 0) {
                      // Calculate individual growth for this field only
                      const individualGrowthPct = calculateFieldGrowth(newValue, originalTaxPrepReturns)
                      console.log('🔄 INDEPENDENT TRACKING - Tax Prep Returns manually adjusted:', {
                        newValue,
                        originalTaxPrepReturns, 
                        individualGrowthPct,
                        globalProjection: answers.expectedGrowthPct
                      })
                      
                      // Store the manual projected value (don't update global growth percentage)
                      updateAnswers({ 
                        projectedTaxPrepReturns: newValue
                      })
                      return
                    }
                  }
                  
                  // Standard update for new stores
                  updateAnswers({ taxPrepReturns: newValue })
                }}
                placeholder="e.g., 1,600"
              required
                style={{
                  width: '140px', 
                  textAlign: 'right', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem',
                  ...(answers.storeType === 'existing' ? { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' } : {})
                }}
              />
            </div>
          </div>
          <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
            {(() => {
              if (answers.storeType !== 'existing') {
                return 'Expected number of tax returns for the season'
              }
              
              if (answers.expectedGrowthPct === undefined) {
                return '📋 Carried forward from page 1 (you can adjust)'
              }
              
              // Calculate current field growth vs original
              const currentValue = answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
                answers.taxPrepReturns ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)) : 0
              
              if (answers.taxPrepReturns && currentValue) {
                const actualGrowth = calculateFieldGrowth(currentValue, answers.taxPrepReturns)
                return getFieldVarianceMessage('returns', actualGrowth, answers.expectedGrowthPct)
              }
              
              return `📋 Projected returns with ${answers.expectedGrowthPct > 0 ? '+' : ''}${answers.expectedGrowthPct}% growth`
            })()}
            </div>
          </div>

        {/* TaxRush Returns (Canada only) */}
          {answers.region === 'CA' && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns {answers.storeType === 'existing' && '📋'}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
              <input
                type="number"
                min={0}
                max={5000}
                step={25}
                value={answers.taxRushReturns || ''}
                onChange={e => updateAnswers({ taxRushReturns: +e.target.value || undefined })}
                placeholder="0"
                  style={{
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem',
                    ...(answers.storeType === 'existing' ? { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' } : {})
                  }}
                />
              </div>
            </div>
            <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
                {answers.storeType === 'existing' ? 
                  '📋 Carried forward from page 1 (you can adjust)' : 
                  'Expected TaxRush returns (Canada only)'
                }
              </div>
            </div>
          )}

        {/* Other Revenue */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <label style={{ minWidth: '120px', fontWeight: 500 }}>Other Revenue</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
            <input
              type="number"
              min={0}
              max={100000}
              step={100}
              value={answers.otherIncome || ''}
              onChange={e => updateAnswers({ otherIncome: +e.target.value || undefined })}
                placeholder="e.g., 2,500"
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
          <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
              Additional revenue (bookkeeping, notary, etc.)
            </div>
          </div>

        {/* Customer Discounts */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <label style={{ minWidth: '120px', fontWeight: 500 }}>Customer Discounts</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={answers.discountsPct ?? 3}
              onChange={e => updateAnswers({ discountsPct: +e.target.value })}
              placeholder="3"
                style={{
                  width: '140px', 
                  textAlign: 'right', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem'
                }}
              />
              <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
            </div>
          </div>
          <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
            <strong>Should not exceed 3%</strong> of gross tax prep fees - reduces your net revenue
            </div>
          </div>

        {/* TaxRush Royalties (Canada only) */}
          {answers.region === 'CA' && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Royalties</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={answers.taxRushRoyaltiesPct ?? 0}
                onChange={e => updateAnswers({ taxRushRoyaltiesPct: +e.target.value })}
                placeholder="0"
                  style={{
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem'
                  }}
                />
                <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
              </div>
            </div>
            <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
                TaxRush franchise fee percentage (Canada only)
              </div>
            </div>
          )}

        {/* Revenue Breakdown with Stoplight Colors */}
        {(answers.avgNetFee && answers.taxPrepReturns) && (() => {
          // Use the same projected logic as the input fields display
          const currentAvgNetFee = answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
            answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && answers.avgNetFee
              ? Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
              : answers.avgNetFee
          
          const currentTaxPrepReturns = answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
            answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && answers.taxPrepReturns
              ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
              : answers.taxPrepReturns
          
          const currentTaxRushReturns = answers.region === 'CA' && answers.taxRushReturns 
            ? (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined 
               ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
               : answers.taxRushReturns)
            : 0
          
          const grossFees = (currentAvgNetFee || 0) * (currentTaxPrepReturns || 0)
          const discountAmount = grossFees * (answers.discountsPct || 3) / 100
          const taxPrepIncome = grossFees - discountAmount
          const taxRushIncome = currentAvgNetFee && currentTaxRushReturns ? currentAvgNetFee * currentTaxRushReturns : 0
          const totalRevenue = taxPrepIncome + taxRushIncome + (answers.otherIncome || 0)
          
          // 🚨 DEBUG: Track down the massive calculation error
          console.log('🚨 PAGE 2 REVENUE CALCULATION DEBUG:', {
            baseValues: {
              avgNetFee: answers.avgNetFee,
              taxPrepReturns: answers.taxPrepReturns,
              expectedGrowthPct: answers.expectedGrowthPct
            },
            projectedOverrides: {
              projectedAvgNetFee: answers.projectedAvgNetFee,
              projectedTaxPrepReturns: answers.projectedTaxPrepReturns
            },
            calculatedValues: {
              currentAvgNetFee: currentAvgNetFee,
              currentTaxPrepReturns: currentTaxPrepReturns,
              grossFees: grossFees,
              discountAmount: discountAmount,
              taxPrepIncome: taxPrepIncome,
              totalRevenue: totalRevenue
            },
            expectedFromPage1: answers.expectedRevenue
          })
          
          // Calculate performance vs strategic targets for stoplight colors
          const strategicTarget = answers.expectedRevenue || 0
          const revenueVariance = strategicTarget > 0 ? ((totalRevenue - strategicTarget) / strategicTarget) * 100 : 0
          
          // Determine stoplight color with consistent thresholds
          let borderColor, backgroundColor, statusColor, statusIcon, statusText
          if (revenueVariance >= 5) {
            // Green: 5%+ above target
            borderColor = '#22c55e'
            backgroundColor = '#f0fdf4'
            statusColor = '#15803d'
            statusIcon = '🟢'
            statusText = 'Excellent! Well above target'
          } else if (revenueVariance >= -5) {
            // Yellow: Within 5% of target (reasonable buffer zone)
            borderColor = '#f59e0b'
            backgroundColor = '#fffbeb'
            statusColor = '#92400e'
            statusIcon = '🟡'
            statusText = 'On track with strategic plan'
          } else {
            // Red: More than 5% below target
            borderColor = '#ef4444'
            backgroundColor = '#fef2f2'
            statusColor = '#dc2626'
            statusIcon = '🔴'
            statusText = 'Below target - needs attention'
          }
          
          return (
          <div style={{ 
            marginTop: '1rem',
              padding: '1rem', 
              backgroundColor,
              border: `2px solid ${borderColor}`,
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <div style={{ fontWeight: 'bold', color: statusColor, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                💰 Projected Gross Revenue Breakdown
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {statusIcon} {statusText}
                </span>
              </div>
              
              <div style={{ color: statusColor }}>Gross Fees: <strong>${grossFees.toLocaleString()}</strong></div>
              <div style={{ color: '#dc2626' }}>Less Customer Discounts ({answers.discountsPct || 3}%): <strong>-${Math.round(discountAmount).toLocaleString()}</strong></div>
              <div style={{ fontWeight: 'bold', color: '#059669' }}>Net Tax Prep Revenue: <strong>${Math.round(taxPrepIncome).toLocaleString()}</strong></div>
              {answers.region === 'CA' && currentTaxRushReturns > 0 && (
                <div style={{ color: statusColor }}>TaxRush Revenue: <strong>${Math.round(taxRushIncome).toLocaleString()}</strong></div>
            )}
            {answers.otherIncome && (
                <div style={{ color: statusColor }}>Other Revenue: <strong>${answers.otherIncome.toLocaleString()}</strong></div>
              )}
              
              <div style={{ 
                fontWeight: 'bold', 
                borderTop: '1px solid #d1d5db', 
                paddingTop: '0.5rem', 
                marginTop: '0.5rem',
                color: statusColor
              }}>
                Total Gross Revenue: <strong>${Math.round(totalRevenue).toLocaleString()}</strong>
                {strategicTarget > 0 && (
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({revenueVariance > 0 ? '+' : ''}{Math.round(revenueVariance)}% vs target)
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '0.75rem', color: statusColor, marginTop: '0.5rem' }}>
                This is your projected gross revenue before expenses. Your net income (profit) will be this amount minus all expenses below.
              </div>
            </div>
          )
        })()}
      </div>

      {/* Expense Management */}
      <div style={{ 
        border: '2px solid #dc2626', 
        borderRadius: '8px', 
        padding: '1.5rem', 
        backgroundColor: '#fef2f2',
        marginBottom: '2rem'
      }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          fontWeight: 600,
          color: '#dc2626',
          fontSize: '1.1rem',
          borderBottom: '2px solid #dc2626',
          paddingBottom: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            💰 Expense Management
          </div>
          
          {/* Strategic Reset Button for Expenses */}
          {answers.storeType === 'existing' && answers.avgNetFee && answers.taxPrepReturns && (
            <button
              type="button"
              onClick={() => {
                console.log('💸 STRATEGIC RESET - Resetting expenses to strategic defaults')
                const strategicExpenseUpdates: any = {}
                relevantFields.forEach(field => {
                  strategicExpenseUpdates[field.id] = field.defaultValue
                })
                updateAnswers(strategicExpenseUpdates)
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Reset ONLY expense fields back to strategic defaults (keeps your income adjustments intact)"
            >
              💸 Reset Expenses to Strategic Defaults
            </button>
          )}
        </div>

        {/* Performance-Based Targets for Expenses */}
        {(() => {
          // Calculate strategic expense targets
          const currentAvgNetFee = answers.projectedAvgNetFee || (answers.avgNetFee && answers.expectedGrowthPct !== undefined ? answers.avgNetFee * (1 + answers.expectedGrowthPct / 100) : answers.avgNetFee)
          const currentTaxPrepReturns = answers.projectedTaxPrepReturns || (answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100) : answers.taxPrepReturns)
          const currentTaxRushReturns = answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100) : (answers.taxRushReturns || 0)
          
          if (currentAvgNetFee && currentTaxPrepReturns) {
            const grossFees = currentAvgNetFee * currentTaxPrepReturns
            const discountAmount = grossFees * (answers.discountsPct || 3) / 100
            const taxPrepIncome = grossFees - discountAmount
            const taxRushIncome = currentAvgNetFee && currentTaxRushReturns ? currentAvgNetFee * currentTaxRushReturns : 0
            const totalGrossRevenue = taxPrepIncome + taxRushIncome + (answers.otherIncome || 0)
            
            // FIXED LOGIC: expectedRevenue from Page 1 should EQUAL totalGrossRevenue on Page 2
            // Strategic expenses should be industry standard percentages, NOT derived from net income
            const expectedRevenueMatchesActual = answers.expectedRevenue && 
              Math.abs(answers.expectedRevenue - totalGrossRevenue) < 100 // Allow $100 tolerance
            
            // Calculate strategic expenses using industry standard percentages
            const defaultExpenseTotal = relevantFields.reduce((total, field) => {
              if (field.calculationBase === 'percentage_gross') {
                return total + field.defaultValue
              } else if (field.calculationBase === 'percentage_tp_income') {
                return total + (field.defaultValue * taxPrepIncome / totalGrossRevenue)
              } else if (field.calculationBase === 'percentage_salaries') {
                return total + (field.defaultValue * 25 / 100) // 25% is default salaries
              }
              return total
            }, 0)
            
            const strategicExpenseTarget = totalGrossRevenue * defaultExpenseTotal / 100
            const expensePercentageOfRevenue = defaultExpenseTotal
            const strategicNetIncome = totalGrossRevenue - strategicExpenseTarget
            
            return (
              <div style={{ 
                backgroundColor: '#dbeafe', 
                border: '1px solid #93c5fd', 
                borderRadius: '6px', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>
                  📊 Performance-Based Targets
                </div>
                <div style={{ color: '#1e40af' }}>
                  Strategic Total Expenses: <strong>${Math.round(strategicExpenseTarget).toLocaleString()}</strong>
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({expensePercentageOfRevenue.toFixed(1)}% of gross revenue)
                  </span>
                </div>
                
                <div style={{ color: '#1e40af', marginTop: '0.25rem' }}>
                  Expected Net Income: <strong>${Math.round(strategicNetIncome).toLocaleString()}</strong>
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({(strategicNetIncome / totalGrossRevenue * 100).toFixed(1)}% margin)
                  </span>
                </div>
                
                {/* Page 1 vs Page 2 Revenue Verification */}
                <div style={{ 
                  backgroundColor: expectedRevenueMatchesActual ? '#f0fdf4' : '#fef2f2', 
                  border: `1px solid ${expectedRevenueMatchesActual ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '4px',
                  padding: '0.5rem',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem'
                }}>
                  <div style={{ fontWeight: 'bold', color: expectedRevenueMatchesActual ? '#15803d' : '#dc2626', marginBottom: '0.25rem' }}>
                    {expectedRevenueMatchesActual ? '✅ Revenue Flow Verified' : '🚨 Revenue Flow Mismatch'}
                  </div>
                  <div style={{ color: expectedRevenueMatchesActual ? '#14532d' : '#7f1d1d', lineHeight: 1.4 }}>
                    • Page 1 Expected Revenue: ${answers.expectedRevenue?.toLocaleString() || 'Not Set'}<br/>
                    • Page 2 Calculated Revenue: ${Math.round(totalGrossRevenue).toLocaleString()}<br/>
                    • Difference: ${answers.expectedRevenue ? Math.abs(answers.expectedRevenue - totalGrossRevenue).toLocaleString() : 'N/A'}<br/>
                    • Strategic Expenses: {expensePercentageOfRevenue.toFixed(1)}% = ${Math.round(strategicExpenseTarget).toLocaleString()}<br/>
                    • Strategic Net Income: {(strategicNetIncome / totalGrossRevenue * 100).toFixed(1)}% = ${Math.round(strategicNetIncome).toLocaleString()}
                    {!expectedRevenueMatchesActual && (
                      <><br/><br/><strong>Fix:</strong> Page 1 and Page 2 calculations should match. Check growth rates and base amounts.</>
                    )}
                  </div>
                </div>
                
                <div className="small" style={{ color: '#1e40af', marginTop: '0.25rem' }}>
                  Strategic targets based on industry-standard expense ratios for tax preparation businesses ({expensePercentageOfRevenue.toFixed(1)}% total expenses)
                </div>
              </div>
            )
          }
          return null
        })()}

        <div style={{ 
          fontWeight: 600,
          color: '#dc2626',
          marginBottom: '1rem',
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          📊 Expense Categories
          <span className="small" style={{ fontWeight: 400, opacity: 0.7 }}>
            ({relevantFields.length} total fields)
          </span>
        </div>
        
        {(['personnel', 'facility', 'operations', 'franchise', 'misc'] as ExpenseCategory[])
          .map(renderCategorySection)}
          
        {/* Expense Summary & Reset */}
        {(() => {
          const currentAvgNetFee = answers.projectedAvgNetFee || (answers.avgNetFee && answers.expectedGrowthPct !== undefined ? answers.avgNetFee * (1 + answers.expectedGrowthPct / 100) : answers.avgNetFee)
          const currentTaxPrepReturns = answers.projectedTaxPrepReturns || (answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100) : answers.taxPrepReturns)
          const currentTaxRushReturns = answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100) : (answers.taxRushReturns || 0)
          
          if (currentAvgNetFee && currentTaxPrepReturns) {
            const grossFees = currentAvgNetFee * currentTaxPrepReturns
            const discountAmount = grossFees * (answers.discountsPct || 3) / 100
            const taxPrepIncome = grossFees - discountAmount
            const taxRushIncome = currentAvgNetFee && currentTaxRushReturns ? currentAvgNetFee * currentTaxRushReturns : 0
            const totalGrossRevenue = taxPrepIncome + taxRushIncome + (answers.otherIncome || 0)
            
            // Calculate total actual expenses from all expense fields
            const actualTotalExpenses = relevantFields.reduce((total, field) => {
              const fieldValue = (answers as any)[field.id] ?? field.defaultValue
              
              if (field.calculationBase === 'fixed_amount') {
                return total + fieldValue
              } else if (field.calculationBase === 'percentage_gross') {
                return total + (totalGrossRevenue * fieldValue / 100)
              } else if (field.calculationBase === 'percentage_tp_income') {
                return total + (taxPrepIncome * fieldValue / 100)
              } else if (field.calculationBase === 'percentage_salaries') {
                const salariesAmount = totalGrossRevenue * ((answers as any).salariesPct || 25) / 100
                return total + (salariesAmount * fieldValue / 100)
              }
              return total
            }, 0)
            
            const actualExpensePercentage = totalGrossRevenue > 0 ? (actualTotalExpenses / totalGrossRevenue) * 100 : 0
            const finalNetIncome = totalGrossRevenue - actualTotalExpenses
            
            // Use same strategic calculation as the targets section - industry standard percentages
            const defaultExpenseTotal = relevantFields.reduce((total, field) => {
              if (field.calculationBase === 'percentage_gross') {
                return total + field.defaultValue
              } else if (field.calculationBase === 'percentage_tp_income') {
                return total + (field.defaultValue * taxPrepIncome / totalGrossRevenue)
              } else if (field.calculationBase === 'percentage_salaries') {
                return total + (field.defaultValue * 25 / 100) // 25% is default salaries
              }
              return total
            }, 0)
            const strategicExpenseTarget = totalGrossRevenue * defaultExpenseTotal / 100
            
            // Calculate expense variance for stoplight colors
            const expenseVariance = strategicExpenseTarget > 0 ? ((actualTotalExpenses - strategicExpenseTarget) / strategicExpenseTarget) * 100 : 0
            
            // Determine stoplight color for expenses - Bidirectional franchise-aware logic
            let borderColor, backgroundColor, statusColor, statusIcon, statusText
            if (expenseVariance <= -10) {
              // Red: 10%+ UNDER target - potential brand/quality risk
              borderColor = '#ef4444'
              backgroundColor = '#fef2f2'
              statusColor = '#dc2626'
              statusIcon = '🔴'
              statusText = 'Under-investment risk - check brand standards'
            } else if (expenseVariance <= -5) {
              // Yellow: 5-10% under target - monitor for quality issues
              borderColor = '#f59e0b'
              backgroundColor = '#fffbeb'
              statusColor = '#92400e'
              statusIcon = '🟡'
              statusText = 'Below target - ensure quality standards'
            } else if (expenseVariance < 5) {
              // Green: Within 5% of target (optimal range)
              borderColor = '#22c55e'
              backgroundColor = '#f0fdf4'
              statusColor = '#15803d'
              statusIcon = '🟢'
              statusText = 'Optimal expense management!'
            } else if (expenseVariance < 10) {
              // Yellow: 5-10% over target - monitor costs
              borderColor = '#f59e0b'
              backgroundColor = '#fffbeb'
              statusColor = '#92400e'
              statusIcon = '🟡'
              statusText = 'Slightly over target - monitor costs'
            } else {
              // Red: 10%+ over target - budget concerns
              borderColor = '#ef4444'
              backgroundColor = '#fef2f2'
              statusColor = '#dc2626'
              statusIcon = '🔴'
              statusText = 'Over budget - needs immediate attention'
            }
            
            return (
              <div style={{ 
                backgroundColor, 
                border: `2px solid ${borderColor}`, 
                borderRadius: '6px', 
                padding: '1rem', 
                marginTop: '1.5rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ fontWeight: 'bold', color: statusColor, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  💰 Actual Expense Breakdown
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {statusIcon} {statusText}
                  </span>
                </div>
                
                <div style={{ color: statusColor }}>
                  Total Expenses: <strong>${Math.round(actualTotalExpenses).toLocaleString()}</strong>
                  <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({actualExpensePercentage.toFixed(1)}% of gross revenue)
                  </span>
                </div>
                
                <div style={{ color: statusColor, marginTop: '0.25rem' }}>
                  Final Net Income: <strong>${Math.round(finalNetIncome).toLocaleString()}</strong>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    marginLeft: '0.5rem',
                    color: Math.abs(expenseVariance) >= 10 ? '#dc2626' : statusColor,
                    fontWeight: 'bold'
                  }}>
                    {expenseVariance >= 10 ? '⚠️ Over strategic target' : 
                     expenseVariance <= -10 ? '⚠️ Under-investment risk' :
                     '✅ Within acceptable range'}
                  </span>
                </div>
                
                <div className="small" style={{ color: statusColor, marginTop: '0.25rem' }}>
                  Strategic Target: ${Math.round(strategicExpenseTarget).toLocaleString()} ({((strategicExpenseTarget / totalGrossRevenue) * 100).toFixed(1)}% of revenue) • 
                  {expenseVariance >= 10 
                    ? ` Reduce by $${Math.round(actualTotalExpenses - strategicExpenseTarget).toLocaleString()} to meet target`
                    : expenseVariance >= 5
                    ? ` $${Math.round(actualTotalExpenses - strategicExpenseTarget).toLocaleString()} over target - monitor costs closely`
                    : expenseVariance <= -10
                    ? ` $${Math.round(strategicExpenseTarget - actualTotalExpenses).toLocaleString()} under target - risk of under-investment in brand standards`
                    : expenseVariance <= -5
                    ? ` $${Math.round(strategicExpenseTarget - actualTotalExpenses).toLocaleString()} under target - ensure quality standards maintained`
                    : ` $${Math.abs(Math.round(strategicExpenseTarget - actualTotalExpenses)).toLocaleString()} ${actualTotalExpenses > strategicExpenseTarget ? 'over' : 'under'} target - optimal expense management!`
                  }
                </div>
              </div>
            )
          }
          return null
        })()}
      </div>

      {/* Validation Summary */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: canProceed ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${canProceed ? '#bbf7d0' : '#fecaca'}`,
        borderRadius: '6px',
        marginBottom: '1.5rem'
      }}>
        <div className="small" style={{ 
          color: canProceed ? '#166534' : '#dc2626',
          fontWeight: 500
        }}>
          {canProceed ? (
            <>✅ Ready to proceed - All required fields completed</>
          ) : (
            <>⚠️ Please complete required fields: Average Net Fee and Tax Prep Returns</>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button 
          type="button" 
          onClick={onNext} 
          className="btn-primary"
          disabled={!canProceed}
        >
          Review Data →
        </button>
      </div>
    </>
  )
}

// Helper function to get category icons
function getCategoryIcon(category: ExpenseCategory): string {
  switch (category) {
    case 'personnel': return '👥'
    case 'facility': return '🏢'
    case 'operations': return '⚙️'
    case 'franchise': return '🏪'
    case 'misc': return '📝'
    default: return '📊'
  }
}