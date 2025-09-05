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
  
  const renderExpenseInput = (field: ExpenseField) => {
    const value = (answers as any)[field.id] ?? field.defaultValue
    const isFixed = field.calculationBase === 'fixed_amount'
    
    return (
      <div key={field.id} className="input-row">
        <label title={field.description}>
          {field.label}
          {isFixed ? ' ($)' : ' (%)'}
          {field.regionSpecific === 'CA' && ' (CA only)'}
        </label>
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={e => updateAnswers({ [field.id]: +e.target.value })}
          disabled={field.regionSpecific === 'CA' && answers.region !== 'CA'}
          placeholder={field.defaultValue.toString()}
        />
        {field.description && (
          <div className="small" style={{ opacity: 0.7, marginTop: '2px' }}>
            {field.description}
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
          {categoryFields.map(renderExpenseInput)}
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
      <div className="expense-section" style={{ marginBottom: '2rem' }}>
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
        
        <div className="grid-2">
          <div className="input-row">
            <label>Average Net Fee ($)</label>
            <input
              type="number"
              min={50}
              max={500}
              step={5}
              value={answers.avgNetFee || ''}
              onChange={e => updateAnswers({ avgNetFee: +e.target.value || undefined })}
              placeholder="125"
              required
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '2px' }}>
              Average fee per tax return after discounts
            </div>
          </div>

          <div className="input-row">
            <label>Tax Prep Returns (#)</label>
            <input
              type="number"
              min={100}
              max={10000}
              step={50}
              value={answers.taxPrepReturns || ''}
              onChange={e => updateAnswers({ taxPrepReturns: +e.target.value || undefined })}
              placeholder="1600"
              required
            />
            <div className="small" style={{ opacity: 0.7, marginTop: '2px' }}>
              Expected number of tax returns for the season
            </div>
          </div>

          <div className="input-row">
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
            <div className="small" style={{ opacity: 0.7, marginTop: '2px' }}>
              Percentage of gross fees given as discounts
            </div>
          </div>

          {answers.region === 'CA' && (
            <div className="input-row">
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
              <div className="small" style={{ opacity: 0.7, marginTop: '2px' }}>
                TaxRush franchise fee percentage (Canada only)
              </div>
            </div>
          )}
        </div>
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