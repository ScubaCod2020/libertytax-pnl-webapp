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
  
  // Get fields appropriate for current region
  const relevantFields = getFieldsForRegion(answers.region)
  
  const renderDualExpenseInput = (field: ExpenseField) => {
    const percentageValue = (answers as any)[field.id] ?? field.defaultValue
    const isFixed = field.calculationBase === 'fixed_amount'
    const isDisabled = field.regionSpecific === 'CA' && answers.region !== 'CA'
    
    // Calculate the base for dollar conversion
    const getCalculationBase = () => {
      switch (field.calculationBase) {
        case 'percentage_gross':
          // Use projected revenue if available, otherwise use current inputs
          return answers.expectedRevenue || (answers.avgNetFee && answers.taxPrepReturns ? answers.avgNetFee * answers.taxPrepReturns / (1 - (answers.discountsPct || 3) / 100) : 0)
        case 'percentage_tp_income':
          return answers.expectedRevenue || (answers.avgNetFee && answers.taxPrepReturns ? answers.avgNetFee * answers.taxPrepReturns : 0)
        case 'percentage_salaries':
          const grossFees = answers.expectedRevenue || (answers.avgNetFee && answers.taxPrepReturns ? answers.avgNetFee * answers.taxPrepReturns / (1 - (answers.discountsPct || 3) / 100) : 0)
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
        const newPercentage = Math.round((validDollar / calculationBase * 100) * 10) / 10 // Round to 1 decimal
        const cappedPercentage = Math.max(0, Math.min(100, newPercentage))
        updateAnswers({ [field.id]: cappedPercentage })
      }
    }
    
    return (
      <div key={field.id} className="input-row" style={{ marginBottom: '0.75rem' }}>
        <label title={field.description}>
          {field.label}
          {field.regionSpecific === 'CA' && ' (CA only)'}
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {/* Percentage Input */}
          <div>
            <input
              type="number"
              min={0}
              max={isFixed ? undefined : 100}
              step={isFixed ? 1 : 0.1}
              value={percentageValue}
              onChange={e => handlePercentageChange(+e.target.value || 0)}
              disabled={isDisabled}
              placeholder={field.defaultValue.toString()}
              style={{ textAlign: 'right' }}
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '0.1rem', textAlign: 'center' }}>
              {isFixed ? '$' : '%'}
            </div>
          </div>
          
          {/* Dollar Input - only show for percentage-based fields */}
          {!isFixed && (
            <div>
              <input
                type="number"
                min={0}
                step={1}
                value={dollarValue || ''}
                onChange={e => handleDollarChange(+e.target.value || 0)}
                disabled={isDisabled || calculationBase === 0}
                placeholder="0"
                style={{ textAlign: 'right' }}
              />
              <div className="small" style={{ opacity: 0.7, marginTop: '0.1rem', textAlign: 'center' }}>
                $
              </div>
            </div>
          )}
        </div>
        
        {field.description && (
          <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
            {field.description}
            {!isFixed && calculationBase > 0 && (
              <span style={{ color: '#059669' }}>
                {' '}• Base: ${calculationBase.toLocaleString()}
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
      <div key={category} className="expense-section" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#374151'
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
        
        <div className={categoryFields.length > 2 ? 'grid-2' : ''}>
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
      <div className="expense-section" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '0.75rem',
          fontWeight: 600,
          color: '#059669'
        }}>
          💰 Income Drivers
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
              Expected Revenue: <strong>${answers.expectedRevenue.toLocaleString()}</strong>
              {answers.lastYearRevenue && answers.expectedGrowthPct !== undefined && (
                <span> ({answers.expectedGrowthPct > 0 ? '+' : ''}{answers.expectedGrowthPct}% vs last year)</span>
              )}
            </div>
            <div className="small" style={{ color: '#0369a1', marginTop: '0.25rem' }}>
              Use the fields below to break down how you'll achieve this target
            </div>
          </div>
        )}
        
        <div className="grid-2">
          <div className="input-row" style={{ marginBottom: '0.75rem' }}>
            <label>Average Net Fee ($) {answers.storeType === 'existing' && '📋'}</label>
            <input
              type="number"
              min={50}
              max={500}
              step={5}
              value={answers.avgNetFee || ''}
              onChange={e => updateAnswers({ avgNetFee: +e.target.value || undefined })}
              placeholder="125"
              required
              style={answers.storeType === 'existing' ? { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' } : {}}
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
              {answers.storeType === 'existing' ? 
                '📋 Carried forward from page 1 (you can adjust)' : 
                'Average fee per tax return after discounts'
              }
            </div>
          </div>

          <div className="input-row" style={{ marginBottom: '0.75rem' }}>
            <label>Tax Prep Returns (#) {answers.storeType === 'existing' && '📋'}</label>
            <input
              type="number"
              min={100}
              max={10000}
              step={50}
              value={answers.taxPrepReturns || ''}
              onChange={e => updateAnswers({ taxPrepReturns: +e.target.value || undefined })}
              placeholder="1600"
              required
              style={answers.storeType === 'existing' ? { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' } : {}}
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
              {answers.storeType === 'existing' ? 
                '📋 Carried forward from page 1 (you can adjust)' : 
                'Expected number of tax returns for the season'
              }
            </div>
          </div>

          {answers.region === 'CA' && (
            <div className="input-row" style={{ marginBottom: '0.75rem' }}>
              <label>TaxRush Returns (#) {answers.storeType === 'existing' && '📋'}</label>
              <input
                type="number"
                min={0}
                max={5000}
                step={25}
                value={answers.taxRushReturns || ''}
                onChange={e => updateAnswers({ taxRushReturns: +e.target.value || undefined })}
                placeholder="0"
                style={answers.storeType === 'existing' ? { backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' } : {}}
              />
              <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
                {answers.storeType === 'existing' ? 
                  '📋 Carried forward from page 1 (you can adjust)' : 
                  'Expected TaxRush returns (Canada only)'
                }
              </div>
            </div>
          )}

          <div className="input-row" style={{ marginBottom: '0.75rem' }}>
            <label>Other Income ($)</label>
            <input
              type="number"
              min={0}
              max={100000}
              step={100}
              value={answers.otherIncome || ''}
              onChange={e => updateAnswers({ otherIncome: +e.target.value || undefined })}
              placeholder="0"
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
              Additional revenue (bookkeeping, notary, etc.)
            </div>
          </div>

          <div className="input-row" style={{ marginBottom: '0.75rem' }}>
            <label>Discounts (%)</label>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={answers.discountsPct ?? 3}
              onChange={e => updateAnswers({ discountsPct: +e.target.value })}
              placeholder="3"
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
              Percentage of gross fees given as discounts
            </div>
          </div>

          {answers.region === 'CA' && (
            <div className="input-row" style={{ marginBottom: '0.75rem' }}>
              <label>TaxRush Royalties % (CA only)</label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={answers.taxRushRoyaltiesPct ?? 0}
                onChange={e => updateAnswers({ taxRushRoyaltiesPct: +e.target.value })}
                placeholder="0"
              />
              <div className="small" style={{ opacity: 0.7, marginTop: '0.25rem' }}>
                TaxRush franchise fee percentage (Canada only)
              </div>
            </div>
          )}
        </div>

        {/* Revenue calculation display */}
        {(answers.avgNetFee && answers.taxPrepReturns) && (
          <div style={{ 
            marginTop: '1rem',
            padding: '0.5rem', 
            backgroundColor: '#f9fafb', 
            border: '1px solid #d1d5db', 
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Projected Revenue Breakdown:</div>
            <div>Tax Prep: ${((answers.avgNetFee * answers.taxPrepReturns) / (1 - (answers.discountsPct || 3) / 100)).toLocaleString()}</div>
            {answers.region === 'CA' && answers.taxRushReturns && (
              <div>TaxRush: ${(answers.avgNetFee * answers.taxRushReturns).toLocaleString()}</div>
            )}
            {answers.otherIncome && (
              <div>Other Income: ${answers.otherIncome.toLocaleString()}</div>
            )}
            <div style={{ fontWeight: 'bold', borderTop: '1px solid #d1d5db', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
              Total: ${(
                (answers.avgNetFee * answers.taxPrepReturns) / (1 - (answers.discountsPct || 3) / 100) +
                (answers.region === 'CA' && answers.taxRushReturns ? answers.avgNetFee * answers.taxRushReturns : 0) +
                (answers.otherIncome || 0)
              ).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Expense Categories */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '1rem',
          fontWeight: 600,
          color: '#dc2626'
        }}>
          📊 Expense Categories
          <span className="small" style={{ fontWeight: 400, opacity: 0.7 }}>
            ({relevantFields.length} total fields)
          </span>
        </div>
        
        {(['personnel', 'facility', 'operations', 'franchise', 'misc'] as ExpenseCategory[])
          .map(renderCategorySection)}
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