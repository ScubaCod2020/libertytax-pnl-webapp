// WizardInputs.tsx - Comprehensive data-driven expense input component
// Organized sections with validation and region-specific handling

import React, { useState, useEffect } from 'react'
import { 
  expenseFields, 
  expenseCategories, 
  getFieldsByCategory,
  getFieldsForRegion,
  type ExpenseField,
  type ExpenseCategory 
} from '../types/expenses'
import { WizardAnswers } from './Wizard/types'
import { ValidatedInput } from './ValidatedInput'

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

  // Validation tracking state (addresses critical QA issue: input validation)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  const [hasValidationErrors, setHasValidationErrors] = useState(false)

  // Update validation status when errors change
  useEffect(() => {
    const hasErrors = Object.values(validationErrors).some(hasError => hasError)
    setHasValidationErrors(hasErrors)
  }, [validationErrors])
  
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
  
  // Handle validation changes for input fields
  const handleValidationChange = (fieldId: string, isValid: boolean) => {
    setValidationErrors(prev => ({
      ...prev,
      [fieldId]: !isValid
    }))
  }

  // Calculate context for validation (business logic)
  const validationContext = {
    maxReasonableRevenue: (answers.avgNetFee || 125) * (answers.taxPrepReturns || 1600), // Calculate from fee * returns
    totalExpensesPercent: 0 // Would be calculated from all current expense percentages
  }

  // Get fields appropriate for current region and TaxRush settings
  const relevantFields = getFieldsForRegion(answers.region, answers.handlesTaxRush)
  
  const renderDualExpenseInput = (field: ExpenseField) => {
    // Dynamic label for TaxRush Shortages field
    const fieldLabel = field.id === 'taxRushShortagesPct' && answers.handlesTaxRush 
      ? 'Shortages (TaxRush)'
      : field.label

    // Force correct franchise royalty values - all franchise royalties are locked
    let percentageValue
    if (field.id === 'royaltiesPct') {
      percentageValue = 14 // Always 14% for Tax Prep Royalties
    } else if (field.id === 'advRoyaltiesPct') {
      percentageValue = 5 // Always 5% for Advertising Royalties
    } else if (field.id === 'taxRushRoyaltiesPct') {
      percentageValue = 6 // Always 6% for TaxRush Royalties (Canada only) - 40% of TaxRush gross fees ≈ 6% of total
    } else {
      percentageValue = (answers as any)[field.id] ?? field.defaultValue
    }
    
    const isFixed = field.calculationBase === 'fixed_amount'
    const isDisabled = field.regionSpecific === 'CA' && answers.region !== 'CA'
    const isFranchiseRoyalty = field.category === 'franchise' && field.id.includes('oyalties')
    // Only franchise royalties are locked - can only be adjusted via debug tool
    const isLocked = isFranchiseRoyalty
    
    // Calculate the base for dollar conversion - USING PROJECTED PERFORMANCE
    const getCalculationBase = () => {
      // Special handling for TaxRush Royalties - calculated on TaxRush gross fees only
      if (field.id === 'taxRushRoyaltiesPct' && answers.handlesTaxRush) {
        // Use projected TaxRush gross fees
        const currentTaxRushGrossFees = answers.taxRushGrossFees && answers.expectedGrowthPct !== undefined 
          ? answers.taxRushGrossFees * (1 + answers.expectedGrowthPct / 100)
          : answers.taxRushGrossFees || 0
        return currentTaxRushGrossFees
      }
      
      // Use PROJECTED values (same logic as revenue breakdown)
      const currentAvgNetFee = answers.projectedAvgNetFee || (answers.avgNetFee && answers.expectedGrowthPct !== undefined ? answers.avgNetFee * (1 + answers.expectedGrowthPct / 100) : answers.avgNetFee)
      const currentTaxPrepReturns = answers.projectedTaxPrepReturns || (answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100) : answers.taxPrepReturns)
      
      const grossTaxPrepFees = currentAvgNetFee && currentTaxPrepReturns ? currentAvgNetFee * currentTaxPrepReturns : 0
      const discounts = grossTaxPrepFees * ((answers.discountsPct || 3) / 100)
      const taxPrepIncome = grossTaxPrepFees - discounts
      
      switch (field.calculationBase) {
        case 'percentage_gross':
          // Use actual gross fees (before discounts) - but exclude TaxRush royalties handled above
          return grossTaxPrepFees
        case 'percentage_tp_income':
          // Use tax prep income (after discounts) - this is the Net Tax Prep Revenue
          return taxPrepIncome
        case 'percentage_salaries':
          // Base on actual gross fees, then apply salary percentage
          return grossTaxPrepFees * ((answers as any).salariesPct || 25) / 100
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
    
    // TaxRush fields need blue box styling like other TaxRush sections
    const isTaxRushField = field.id === 'taxRushRoyaltiesPct' && answers.region === 'CA' && answers.handlesTaxRush
    
    const fieldContent = (
      <div key={field.id} style={{ 
        marginBottom: '0.75rem',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gridTemplateRows: 'auto auto auto auto',
        gap: '0.25rem 0.75rem',
        alignItems: 'center'
      }}>
        <label 
          title={field.description}
          style={{ 
            fontWeight: 500, 
            gridColumn: '1', 
            gridRow: '1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          {fieldLabel}
        </label>
        
        {/* Input group */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          gridColumn: '2', 
          gridRow: '1'
        }}>
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
        
        {/* Percentage Slider - only for percentage-based, non-locked fields */}
        {!isFixed && !isLocked && (
          <div style={{ 
            gridColumn: '2', 
            gridRow: '2',
            marginTop: '0.5rem', 
            marginBottom: '0.25rem' 
          }}>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              title="Adjust percentage value"
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
          <div style={{ 
            gridColumn: '2', 
            gridRow: '2',
            marginTop: '0.25rem', 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            fontStyle: 'italic' 
          }}>
            🔒 Locked per franchise agreement
          </div>
        )}
        
        {/* Field description */}
        {field.description && (
          <div className="small" style={{ 
            gridColumn: '2', 
            gridRow: '3',
            opacity: 0.7 
          }}>
            {field.description}
            {!isFixed && calculationBase > 0 && (
              <span style={{ color: '#059669' }}>
                {' '}• Base: ${calculationBase.toLocaleString()}
                {field.calculationBase === 'percentage_gross' && ' (gross fees)'}
                {field.calculationBase === 'percentage_salaries' && ' (salary amount)'}
                {field.calculationBase === 'percentage_tp_income' && ' (tax prep income)'}
              </span>
            )}
          </div>
        )}
      </div>
    )
    
    // Return with or without TaxRush blue box styling
    if (isTaxRushField) {
      return (
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
          {fieldContent}
        </div>
      )
    }
    
    return fieldContent
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
    <div data-wizard-step="inputs" style={{ paddingLeft: '1rem' }}>
      {/* Page Header with Selections Summary */}
      {(answers.region || answers.storeType || answers.handlesTaxRush !== undefined) && (
        <div style={{
          padding: '1rem',
          border: '2px solid #6b7280',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏷️ Your Selections
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#6b7280' }}>
              (From Step 1 - Read Only)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#374151' }}>
            {answers.region && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500 }}>Region:</span> 
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: answers.region === 'US' ? '#dbeafe' : '#fef3c7',
                  color: answers.region === 'US' ? '#1e40af' : '#92400e',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {answers.region === 'US' ? 'United States 🇺🇸' : 'Canada 🇨🇦'}
                </span>
              </div>
            )}
            {answers.storeType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500 }}>Store Type:</span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: answers.storeType === 'new' ? '#dcfce7' : '#fef3c7',
                  color: answers.storeType === 'new' ? '#166534' : '#92400e',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {answers.storeType === 'new' ? '🏢 New Store' : '🏢 Existing Store'}
                </span>
              </div>
            )}
            {answers.region === 'CA' && answers.handlesTaxRush !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500 }}>TaxRush:</span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: answers.handlesTaxRush ? '#dbeafe' : '#f3f4f6',
                  color: answers.handlesTaxRush ? '#1e40af' : '#6b7280',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {answers.handlesTaxRush ? 'Yes, we handle TaxRush returns' : 'No, we don\'t handle TaxRush'}
                </span>
              </div>
            )}
            {answers.hasOtherIncome !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontWeight: 500 }}>Other Income:</span>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  backgroundColor: answers.hasOtherIncome ? '#dbeafe' : '#f3f4f6',
                  color: answers.hasOtherIncome ? '#1e40af' : '#6b7280',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {answers.hasOtherIncome ? 'Yes, we have other income sources' : 'No, only tax preparation'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card-title">Income & Expense Inputs</div>
      
      {/* REMOVED: Store Type Indicator - redundant with header */}
      {false && answers.storeType && (
        <div style={{ 
          padding: '0.5rem 1rem', 
          marginBottom: '1rem',
          backgroundColor: answers.storeType === 'new' ? '#f0f9ff' : '#f0fdf4', 
          border: answers.storeType === 'new' ? '1px solid #0ea5e9' : '1px solid #22c55e',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          <span style={{ 
            color: answers.storeType === 'new' ? '#0369a1' : '#15803d' 
          }}>
            {answers.storeType === 'new' ? '🏪' : '🏢'} 
            {answers.storeType === 'new' ? 'New Store' : 'Existing Store'} Profile
          </span>
          <span style={{ 
            fontSize: '0.8rem', 
            opacity: 0.8,
            color: answers.storeType === 'new' ? '#0369a1' : '#15803d'
          }}>
            (Selected on Page 1)
          </span>
        </div>
      )}
      
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Tax Prep Targets:</div>
                    <div>Average Net Fee: <strong>${Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)).toLocaleString()}</strong></div>
                    <div>Tax Prep Returns: <strong>{Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)).toLocaleString()}</strong></div>
                    <div>Gross Tax Prep Fees: <strong>${Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100) * answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)).toLocaleString()}</strong></div>
                  </div>
                  {answers.region === 'CA' && answers.handlesTaxRush && answers.taxRushReturns && (
                    <div style={{ paddingLeft: '0.75rem', borderLeft: '2px solid #0ea5e9' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.8rem' }}>TaxRush Targets:</div>
                      <div>TaxRush Returns: <strong>{Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100)).toLocaleString()}</strong></div>
                      <div>TaxRush Avg Net Fee: <strong>${answers.taxRushAvgNetFee ? Math.round(answers.taxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100)).toLocaleString() : 'Same as Tax Prep'}</strong></div>
                      <div>TaxRush Gross Fees: <strong>${answers.taxRushGrossFees ? Math.round(answers.taxRushGrossFees * (1 + answers.expectedGrowthPct / 100)).toLocaleString() : 'Auto-calculated'}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Show Target Breakdown for New Stores */}
            {answers.storeType === 'new' && answers.avgNetFee && answers.taxPrepReturns && (
              <div style={{ color: '#0369a1', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Target Goals:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Tax Prep Targets:</div>
                    <div>Average Net Fee: <strong>${answers.avgNetFee.toLocaleString()}</strong></div>
                    <div>Tax Prep Returns: <strong>{answers.taxPrepReturns.toLocaleString()}</strong></div>
                    <div>Gross Tax Prep Fees: <strong>${Math.round(answers.avgNetFee * answers.taxPrepReturns).toLocaleString()}</strong></div>
                  </div>
                  {answers.region === 'CA' && answers.handlesTaxRush && answers.taxRushReturns && (
                    <div style={{ paddingLeft: '0.75rem', borderLeft: '2px solid #0ea5e9' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.8rem' }}>TaxRush Targets:</div>
                      <div>TaxRush Returns: <strong>{answers.taxRushReturns.toLocaleString()}</strong></div>
                      <div>TaxRush Avg Net Fee: <strong>${answers.taxRushAvgNetFee ? answers.taxRushAvgNetFee.toLocaleString() : 'Same as Tax Prep'}</strong></div>
                      <div>TaxRush Gross Fees: <strong>${answers.taxRushGrossFees ? answers.taxRushGrossFees.toLocaleString() : 'Auto-calculated'}</strong></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="small" style={{ color: '#0369a1', marginTop: '0.25rem' }}>
              Build your gross revenue below, then set expenses to achieve this net income target
            </div>
          </div>
        )}
        
        {/* Average Net Fee */}
        <div style={{ 
          marginBottom: '0.75rem',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gridTemplateRows: 'auto auto',
          gap: '0.25rem 0.75rem',
          alignItems: 'center'
        }}>
          <label style={{ 
            fontWeight: 500, 
            gridColumn: '1', 
            gridRow: '1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            Average Net Fee {answers.storeType === 'existing' && '📋'}
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            gridColumn: '2', 
            gridRow: '1'
          }}>
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
          <div className="small" style={{ 
            opacity: 0.7,
            gridColumn: '2',
            gridRow: '2'
          }}>
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
        <div style={{ 
          marginBottom: '0.75rem',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gridTemplateRows: 'auto auto',
          gap: '0.25rem 0.75rem',
          alignItems: 'center'
        }}>
          <label style={{ 
            fontWeight: 500, 
            gridColumn: '1', 
            gridRow: '1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            Tax Prep Returns {answers.storeType === 'existing' && '📋'}
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            gridColumn: '2', 
            gridRow: '1'
          }}>
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
          <div className="small" style={{ 
            opacity: 0.7,
            gridColumn: '2',
            gridRow: '2'
          }}>
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

        {/* TaxRush Returns (Canada only) - Blue Box Styled */}
        {answers.region === 'CA' && (
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
            <div style={{ 
              marginBottom: '0.75rem',
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gridTemplateRows: 'auto auto',
              gap: '0.25rem 0.75rem',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontWeight: 500, 
                gridColumn: '1', 
                gridRow: '1',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                TaxRush Returns {answers.storeType === 'existing' && '📋'}
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                gridColumn: '2', 
                gridRow: '1'
              }}>
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
                    ...(answers.storeType === 'existing' ? { backgroundColor: '#ffffff', borderColor: '#0ea5e9' } : {})
                  }}
                />
              </div>
              <div className="small" style={{ 
                opacity: 0.7,
                gridColumn: '2',
                gridRow: '2'
              }}>
                {answers.storeType === 'existing' ? 
                  '📋 Carried forward from page 1 (you can adjust)' : 
                  'Expected TaxRush returns (Canada only)'
                }
              </div>
            </div>
          </div>
        )}

        {/* TaxRush Average Net Fee (Canada only) - Blue Box Styled */}
        {answers.region === 'CA' && answers.handlesTaxRush && (
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
            <div style={{ 
              marginBottom: '0.75rem',
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gridTemplateRows: 'auto auto',
              gap: '0.25rem 0.75rem',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontWeight: 500, 
                gridColumn: '1', 
                gridRow: '1',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                TaxRush Avg Net Fee {answers.storeType === 'existing' && '📋'}
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                gridColumn: '2', 
                gridRow: '1'
              }}>
                <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                <input
                  type="number"
                  min={50}
                  max={500}
                  step={1}
                  value={answers.taxRushAvgNetFee || (answers.avgNetFee || '')}
                  onChange={e => updateAnswers({ taxRushAvgNetFee: +e.target.value || undefined })}
                  placeholder={(answers.avgNetFee || 125).toString()}
                  style={{
                    width: '140px', 
                    textAlign: 'right', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px', 
                    padding: '0.5rem',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              <div className="small" style={{ 
                opacity: 0.7,
                gridColumn: '2',
                gridRow: '2'
              }}>
                {answers.storeType === 'existing' ? 
                  '📋 Default: Same as Tax Prep fee (you can adjust)' : 
                  'Average fee per TaxRush return (usually same as Tax Prep fee)'
                }
              </div>
            </div>
          </div>
        )}

        {/* Other Revenue */}
        <div style={{ 
          marginBottom: '0.75rem',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gridTemplateRows: 'auto auto',
          gap: '0.25rem 0.75rem',
          alignItems: 'center'
        }}>
          <label style={{ 
            fontWeight: 500, 
            gridColumn: '1', 
            gridRow: '1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            Other Revenue
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            gridColumn: '2', 
            gridRow: '1'
          }}>
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
          <div className="small" style={{ 
            opacity: 0.7,
            gridColumn: '2',
            gridRow: '2'
          }}>
            Additional revenue (bookkeeping, notary, etc.)
          </div>
        </div>

        {/* Customer Discounts */}
        <div style={{ 
          marginBottom: '0.75rem',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gridTemplateRows: 'auto auto',
          gap: '0.25rem 0.75rem',
          alignItems: 'center'
        }}>
          <label style={{ 
            fontWeight: 500, 
            gridColumn: '1', 
            gridRow: '1',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            Customer Discounts
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem',
            gridColumn: '2', 
            gridRow: '1'
          }}>
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
          <div className="small" style={{ 
            opacity: 0.7,
            gridColumn: '2',
            gridRow: '2'
          }}>
            <strong>Should not exceed 3%</strong> of gross tax prep fees - reduces your net revenue
          </div>
        </div>

        {/* Other Income - conditional */}
        {answers.hasOtherIncome && (
          <div style={{ 
            marginBottom: '0.75rem',
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gridTemplateRows: 'auto auto',
            gap: '0.25rem 0.75rem',
            alignItems: 'center'
          }}>
            <label style={{ 
              fontWeight: 500, 
              gridColumn: '1', 
              gridRow: '1',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Other Income
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              gridColumn: '2', 
              gridRow: '1'
            }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min={0}
                max={50000}
                step={100}
                value={answers.otherIncome ?? 0}
                onChange={e => updateAnswers({ otherIncome: +e.target.value || 0 })}
                placeholder="0"
                style={{
                  width: '140px', 
                  textAlign: 'right', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  padding: '0.5rem'
                }}
              />
            </div>
            <div className="small" style={{ 
              opacity: 0.7,
              gridColumn: '2',
              gridRow: '2'
            }}>
              Additional revenue sources (e.g., notary services, business consulting)
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
          
          const currentTaxRushReturns = answers.region === 'CA' && answers.handlesTaxRush && answers.taxRushReturns 
            ? (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined 
               ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
               : answers.taxRushReturns)
            : 0
          
          // Fix double counting: Subtract TaxRush returns from Tax Prep returns since they have different fees
          const adjustedTaxPrepReturns = currentTaxRushReturns > 0 ? (currentTaxPrepReturns || 0) - currentTaxRushReturns : (currentTaxPrepReturns || 0)
          
          const grossTaxPrepFees = (currentAvgNetFee || 0) * adjustedTaxPrepReturns
          const discountAmount = grossTaxPrepFees * (answers.discountsPct || 3) / 100
          const taxPrepIncome = grossTaxPrepFees - discountAmount
          
          // TaxRush income calculation - NOW ENABLED with proper fee handling
          const currentTaxRushAvgNetFee = answers.taxRushAvgNetFee || currentAvgNetFee || 0 // Default to same as Tax Prep fee
          const grossTaxRushFees = answers.region === 'CA' && answers.handlesTaxRush && currentTaxRushReturns > 0
            ? currentTaxRushAvgNetFee * currentTaxRushReturns
            : 0
          const taxRushDiscountAmount = grossTaxRushFees * (answers.discountsPct || 3) / 100
          const taxRushIncome = grossTaxRushFees - taxRushDiscountAmount
          
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
              adjustedTaxPrepReturns: adjustedTaxPrepReturns,
              grossTaxPrepFees: grossTaxPrepFees,
              grossTaxRushFees: grossTaxRushFees,
              discountAmount: discountAmount,
              taxPrepIncome: taxPrepIncome,
              taxRushIncome: taxRushIncome,
              totalRevenue: totalRevenue
            },
            expectedFromPage1: answers.expectedRevenue
          })
          
          // Calculate performance vs strategic targets for stoplight colors  
          const strategicTarget = answers.expectedRevenue || 0
          const hasRevenueMismatch = strategicTarget > 0 && Math.abs(totalRevenue - strategicTarget) > 1000
          const revenueVariance = !hasRevenueMismatch && strategicTarget > 0 ? ((totalRevenue - strategicTarget) / strategicTarget) * 100 : 0
          
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                {/* Tax Prep Revenue Breakdown */}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: statusColor, marginBottom: '0.25rem' }}>Tax Prep Revenue:</div>
                  <div style={{ color: statusColor, fontSize: '0.8rem' }}>Gross Tax Prep Fees: <strong>${grossTaxPrepFees.toLocaleString()}</strong></div>
                  <div style={{ color: statusColor, fontSize: '0.8rem' }}>Returns: {adjustedTaxPrepReturns.toLocaleString()} @ ${(currentAvgNetFee || 0).toLocaleString()}</div>
                  <div style={{ color: '#dc2626', fontSize: '0.8rem' }}>Less Discounts ({answers.discountsPct || 3}%): <strong>-${Math.round(discountAmount).toLocaleString()}</strong></div>
                  <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '0.85rem' }}>Net Tax Prep Income: <strong>${Math.round(taxPrepIncome).toLocaleString()}</strong></div>
                </div>
                
                {/* TaxRush Revenue Breakdown */}
                {answers.region === 'CA' && answers.handlesTaxRush && (
                  <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid #0ea5e9' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0369a1', marginBottom: '0.25rem' }}>TaxRush Revenue:</div>
                    <div style={{ color: '#0369a1', fontSize: '0.8rem' }}>Gross TaxRush Fees: <strong>${grossTaxRushFees.toLocaleString()}</strong></div>
                    <div style={{ color: '#0369a1', fontSize: '0.8rem' }}>Returns: {currentTaxRushReturns.toLocaleString()} @ ${currentTaxRushAvgNetFee.toLocaleString()}</div>
                    <div style={{ color: '#dc2626', fontSize: '0.8rem' }}>Less Discounts ({answers.discountsPct || 3}%): <strong>-${Math.round(taxRushDiscountAmount).toLocaleString()}</strong></div>
                    <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '0.85rem' }}>Net TaxRush Income: <strong>${Math.round(taxRushIncome).toLocaleString()}</strong></div>
                  </div>
                )}
              </div>
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
                {strategicTarget > 0 && !hasRevenueMismatch && Math.abs(revenueVariance) >= 1 && (
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
          
          {/* Reset Button for Expenses - Different logic for new vs existing stores */}
          {answers.avgNetFee && answers.taxPrepReturns && (
            <button
              type="button"
              onClick={() => {
                if (answers.storeType === 'existing') {
                  console.log('💸 STRATEGIC RESET - Resetting expenses to strategic defaults')
                  const strategicExpenseUpdates: any = {}
                  relevantFields.forEach(field => {
                    strategicExpenseUpdates[field.id] = field.defaultValue
                  })
                  updateAnswers(strategicExpenseUpdates)
                } else {
                  console.log('🏪 NEW STORE RESET - Resetting expenses to industry defaults')
                  const industryDefaultUpdates: any = {}
                  relevantFields.forEach(field => {
                    industryDefaultUpdates[field.id] = field.defaultValue
                  })
                  updateAnswers(industryDefaultUpdates)
                }
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
              title={
                answers.storeType === 'existing'
                  ? "Reset ONLY expense fields back to strategic defaults (keeps your income adjustments intact)"
                  : "Reset ONLY expense fields back to strategic defaults (keeps your target performance goals intact)"
              }
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
          const currentTaxRushReturns = answers.handlesTaxRush && answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100) : (answers.handlesTaxRush ? (answers.taxRushReturns || 0) : 0)
          const currentTaxRushAvgNetFee = answers.handlesTaxRush && answers.taxRushAvgNetFee && answers.expectedGrowthPct !== undefined ? answers.taxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100) : (answers.handlesTaxRush ? (answers.taxRushAvgNetFee || 0) : 0)
          
          if (currentAvgNetFee && currentTaxPrepReturns) {
            const grossTaxPrepFees = currentAvgNetFee * currentTaxPrepReturns
            const discountAmount = grossTaxPrepFees * (answers.discountsPct || 3) / 100
            const taxPrepIncome = grossTaxPrepFees - discountAmount
            // TaxRush income calculation (conditional on handlesTaxRush setting)
            const taxRushIncome = answers.handlesTaxRush && currentTaxRushAvgNetFee && currentTaxRushReturns 
              ? currentTaxRushAvgNetFee * currentTaxRushReturns
              : 0
            const totalGrossRevenue = taxPrepIncome + taxRushIncome + (answers.otherIncome || 0)
            
            // FIXED LOGIC: expectedRevenue from Page 1 should EQUAL totalGrossRevenue on Page 2
            // Strategic expenses should be industry standard percentages, NOT derived from net income
            const expectedRevenueMatchesActual = answers.expectedRevenue && 
              Math.abs(answers.expectedRevenue - totalGrossRevenue) < 100 // Allow $100 tolerance
            
            // Calculate strategic expenses using operational best practices (force to 76% target)
            // NEW APPROACH: Always calculate what 76% should be, regardless of field combinations
            const targetExpensePercentage = 76
            const targetExpenseAmount = totalGrossRevenue * targetExpensePercentage / 100
            
            // Calculate raw total from current field set (without TaxRush special handling)
            const rawExpenseTotal = relevantFields.reduce((total, field) => {
              if (field.calculationBase === 'percentage_gross') {
                return total + field.defaultValue
              } else if (field.calculationBase === 'percentage_tp_income') {
                return total + (field.defaultValue * taxPrepIncome / totalGrossRevenue)
              } else if (field.calculationBase === 'percentage_salaries') {
                return total + (field.defaultValue * 25 / 100) // 25% is default salaries
              }
              return total
            }, 0)
            
            // Scale all fields proportionally to hit exactly 76% target
            const scalingFactor = rawExpenseTotal > 0 ? targetExpensePercentage / rawExpenseTotal : 1
            const defaultExpenseTotal = rawExpenseTotal * scalingFactor
            
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
                {/* Revenue flow verification - only show if significant mismatch for debugging */}
                {!expectedRevenueMatchesActual && answers.expectedRevenue && 
                 Math.abs(answers.expectedRevenue - totalGrossRevenue) > 5000 && (
                  <div style={{ 
                    backgroundColor: '#fffbeb',
                    border: '1px solid #f59e0b',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    marginTop: '0.5rem',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.25rem' }}>
                      ⚠️ Revenue Calculation Notice
                    </div>
                    <div style={{ color: '#92400e', lineHeight: 1.4 }}>
                      There's a difference between your Page 1 projections (${answers.expectedRevenue?.toLocaleString()}) 
                      and Page 2 calculations (${Math.round(totalGrossRevenue).toLocaleString()}). 
                      This might indicate different growth rates or base amounts between pages.
                    </div>
                  </div>
                )}
                
                <div className="small" style={{ color: '#1e40af', marginTop: '0.25rem' }}>
                  Operational best practices for expense management (75-77% optimal range)
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
          const currentTaxRushReturns = answers.handlesTaxRush && answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100) : (answers.handlesTaxRush ? (answers.taxRushReturns || 0) : 0)
          const currentTaxRushAvgNetFee = answers.handlesTaxRush && answers.taxRushAvgNetFee && answers.expectedGrowthPct !== undefined ? answers.taxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100) : (answers.handlesTaxRush ? (answers.taxRushAvgNetFee || 0) : 0)
          
          if (currentAvgNetFee && currentTaxPrepReturns) {
            const grossTaxPrepFees = currentAvgNetFee * currentTaxPrepReturns
            const discountAmount = grossTaxPrepFees * (answers.discountsPct || 3) / 100
            const taxPrepIncome = grossTaxPrepFees - discountAmount
            // TaxRush income calculation (conditional on handlesTaxRush setting)
            const taxRushIncome = answers.handlesTaxRush && currentTaxRushAvgNetFee && currentTaxRushReturns 
              ? currentTaxRushAvgNetFee * currentTaxRushReturns
              : 0
            const totalGrossRevenue = taxPrepIncome + taxRushIncome + (answers.otherIncome || 0)
            
            // Calculate scaling factor for default values to match strategic targets
            const rawExpenseForScaling = relevantFields.reduce((total, field) => {
              if (field.calculationBase === 'percentage_gross') {
                return total + field.defaultValue
              } else if (field.calculationBase === 'percentage_tp_income') {
                return total + (field.defaultValue * taxPrepIncome / totalGrossRevenue)
              } else if (field.calculationBase === 'percentage_salaries') {
                return total + (field.defaultValue * 25 / 100) // 25% is default salaries
              }
              return total
            }, 0)
            const targetExpensePercentage = 76
            const scalingFactor = rawExpenseForScaling > 0 ? targetExpensePercentage / rawExpenseForScaling : 1
            
            // Calculate total actual expenses from all expense fields
            // Scale user's defaults to match strategic targets for better UX
            const userHasMadeExpenseChanges = relevantFields.some(field => 
              (answers as any)[field.id] !== undefined && (answers as any)[field.id] !== field.defaultValue
            )
            
            const actualTotalExpenses = relevantFields.reduce((total, field) => {
              let fieldValue = (answers as any)[field.id] ?? field.defaultValue
              
              // If user hasn't made changes, scale default values to match strategic target
              if (!userHasMadeExpenseChanges && (answers as any)[field.id] === undefined) {
                fieldValue = field.defaultValue * scalingFactor
              }
              
              // Calculate expense amount based on field type
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
            
            // Use same strategic calculation as the targets section - operational best practices (76% target)
            const rawExpenseTotal = relevantFields.reduce((total, field) => {
              // Special handling for TaxRush Royalties - calculated on TaxRush gross fees only
              if (field.id === 'taxRushRoyaltiesPct' && answers.handlesTaxRush) {
                const taxRushGrossFees = answers.taxRushGrossFees || 0
                return total + (field.defaultValue * taxRushGrossFees / totalGrossRevenue) // Convert to percentage of total revenue for comparison
              } else if (field.calculationBase === 'percentage_gross') {
                return total + field.defaultValue
              } else if (field.calculationBase === 'percentage_tp_income') {
                return total + (field.defaultValue * taxPrepIncome / totalGrossRevenue)
              } else if (field.calculationBase === 'percentage_salaries') {
                return total + (field.defaultValue * 25 / 100) // 25% is default salaries
              }
              return total
            }, 0)
            
            // Reuse scaling factor calculated earlier for strategic calculations
            const defaultExpenseTotal = rawExpenseTotal * scalingFactor
            
            const actualExpensePercentage = totalGrossRevenue > 0 ? (actualTotalExpenses / totalGrossRevenue) * 100 : 0
            const finalNetIncome = totalGrossRevenue - actualTotalExpenses
            const strategicExpenseTarget = totalGrossRevenue * defaultExpenseTotal / 100
            
            // Calculate expense variance for stoplight colors
            const expenseVariance = strategicExpenseTarget > 0 ? ((actualTotalExpenses - strategicExpenseTarget) / strategicExpenseTarget) * 100 : 0
            
            // Determine stoplight color for expenses - Based on operational best practices (75-77% target)
            let borderColor, backgroundColor, statusColor, statusIcon, statusText
            if (actualExpensePercentage >= 74.5 && actualExpensePercentage <= 77.5) {
              // Green: 74.5-77.5% - optimal expense management
              borderColor = '#22c55e'
              backgroundColor = '#f0fdf4'
              statusColor = '#15803d'
              statusIcon = '🟢'
              statusText = 'Excellent - optimal expense management'
            } else if ((actualExpensePercentage >= 71.5 && actualExpensePercentage < 74.5) || 
                       (actualExpensePercentage > 77.5 && actualExpensePercentage <= 80.5)) {
              // Yellow: 71.5-74.5% or 77.5-80.5% - monitor closely
              borderColor = '#f59e0b'
              backgroundColor = '#fffbeb'
              statusColor = '#92400e'
              statusIcon = '🟡'
              statusText = actualExpensePercentage < 74.5 ? 'Below optimal range - monitor operations' : 'Above optimal range - monitor costs'
            } else {
              // Red: Below 71.5% or above 80.5% - action required
              borderColor = '#ef4444'
              backgroundColor = '#fef2f2'
              statusColor = '#dc2626'
              statusIcon = '🔴'
              statusText = actualExpensePercentage < 71.5 ? 'Under-investment risk - ensure quality standards' : 'Over budget - reduce expenses immediately'
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
                    color: (actualExpensePercentage < 71.5 || actualExpensePercentage > 80.5) ? '#dc2626' : statusColor,
                    fontWeight: 'bold'
                  }}>
                    {actualExpensePercentage > 80.5 ? '⚠️ Over optimal range' : 
                     actualExpensePercentage < 71.5 ? '⚠️ Under-investment risk' :
                     '✅ Within operational best practices'}
                  </span>
                </div>
                
                <div className="small" style={{ color: statusColor, marginTop: '0.25rem' }}>
                  Operational Target: ${Math.round(strategicExpenseTarget).toLocaleString()} ({((strategicExpenseTarget / totalGrossRevenue) * 100).toFixed(1)}% of revenue) • 
                  {actualExpensePercentage > 80.5
                    ? ` Reduce by $${Math.round(actualTotalExpenses - strategicExpenseTarget).toLocaleString()} to reach optimal range (75-77%)`
                    : actualExpensePercentage > 77.5
                    ? ` $${Math.round(actualTotalExpenses - strategicExpenseTarget).toLocaleString()} over optimal range - monitor costs closely`
                    : actualExpensePercentage < 71.5
                    ? ` $${Math.round(strategicExpenseTarget - actualTotalExpenses).toLocaleString()} under optimal range - ensure operational standards maintained`
                    : actualExpensePercentage < 74.5
                    ? ` $${Math.round(strategicExpenseTarget - actualTotalExpenses).toLocaleString()} under optimal range - monitor operations closely`
                    : ` Excellent expense management within 75-77% operational best practices!`
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
        padding: '1.5rem 0 1.5rem 0',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button 
          type="button" 
          onClick={onBack} 
          style={{
            background: 'linear-gradient(45deg, #6b7280, #9ca3af)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: 'none',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ← Back
        </button>
        <button 
          type="button" 
          onClick={onNext} 
          disabled={!canProceed || hasValidationErrors}
          style={{
            background: canProceed && !hasValidationErrors 
              ? 'linear-gradient(45deg, #059669, #10b981)' 
              : 'linear-gradient(45deg, #9ca3af, #d1d5db)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: 'none',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: canProceed ? 1 : 0.6
          }}
        >
          Review Data →
        </button>
      </div>
    </div>
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