// WizardReview.tsx - Comprehensive review of all wizard data before baseline creation
// Shows income drivers, all expense categories, and calculated projections

import React from 'react'
import { 
  expenseFields, 
  expenseCategories,
  getFieldsByCategory,
  getFieldsForRegion,
  getFieldById,
  type ExpenseCategory 
} from '../types/expenses'
import type { WizardAnswers } from './WizardShell'

interface WizardReviewProps {
  answers: WizardAnswers
  onNext: () => void
  onBack: () => void
}

export default function WizardReview({ answers, onNext, onBack }: WizardReviewProps) {
  // Get fields relevant to current region
  const relevantFields = getFieldsForRegion(answers.region)
  
  // Calculate basic projections for preview
  const grossFees = (answers.avgNetFee || 125) * (answers.taxPrepReturns || 1600)
  const discounts = grossFees * ((answers.discountsPct || 3) / 100)
  const netIncome = grossFees - discounts

  const renderIncomeSection = () => (
    <div className="review-section" style={{ marginBottom: '1.5rem' }}>
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
      
      <div className="review-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '12px' 
      }}>
        <div className="review-item">
          <div className="small" style={{ opacity: 0.7 }}>Average Net Fee</div>
          <div style={{ fontWeight: 500 }}>
            ${(answers.avgNetFee || 125).toLocaleString()}
          </div>
        </div>
        
        <div className="review-item">
          <div className="small" style={{ opacity: 0.7 }}>Tax Prep Returns</div>
          <div style={{ fontWeight: 500 }}>
            {(answers.taxPrepReturns || 1600).toLocaleString()}
          </div>
        </div>
        
        <div className="review-item">
          <div className="small" style={{ opacity: 0.7 }}>Discounts</div>
          <div style={{ fontWeight: 500 }}>
            {(answers.discountsPct || 3)}%
          </div>
        </div>

        {answers.region === 'CA' && (
          <div className="review-item">
            <div className="small" style={{ opacity: 0.7 }}>TaxRush Royalties</div>
            <div style={{ fontWeight: 500 }}>
              {(answers.taxRushRoyaltiesPct || 0)}%
            </div>
          </div>
        )}
      </div>

      {/* Quick income projection */}
      <div style={{ 
        marginTop: '12px', 
        padding: '12px', 
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '6px'
      }}>
        <div className="small" style={{ color: '#166534', fontWeight: 500, marginBottom: '4px' }}>
          Projected Income
        </div>
        <div className="small" style={{ color: '#166534' }}>
          Gross Fees: ${grossFees.toLocaleString()} • 
          After Discounts: ${netIncome.toLocaleString()}
        </div>
      </div>
    </div>
  )

  const renderExpenseCategory = (category: ExpenseCategory) => {
    const categoryFields = getFieldsByCategory(category).filter(field =>
      relevantFields.includes(field)
    )
    
    if (categoryFields.length === 0) return null

    return (
      <div key={category} className="review-section" style={{ marginBottom: '1rem' }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '0.5rem',
          fontWeight: 600,
          color: '#374151',
          fontSize: '14px'
        }}>
          {getCategoryIcon(category)}
          {expenseCategories[category].label}
          <span className="small" style={{ fontWeight: 400, opacity: 0.7 }}>
            ({categoryFields.length})
          </span>
        </div>
        
        <div className="review-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '8px',
          marginLeft: '24px'
        }}>
          {categoryFields.map(field => {
            const value = (answers as any)[field.id] ?? field.defaultValue
            const isFixed = field.calculationBase === 'fixed_amount'
            const isDefault = (answers as any)[field.id] === undefined

            return (
              <div key={field.id} className="review-item">
                <div className="small" style={{ 
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {field.label}
                  {isDefault && (
                    <span style={{ 
                      fontSize: '10px', 
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      default
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontWeight: isDefault ? 400 : 500,
                  color: isDefault ? '#6b7280' : '#111827'
                }}>
                  {isFixed ? `$${value.toLocaleString()}` : `${value}%`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderSummaryStats = () => {
    const customizedFields = relevantFields.filter(field => 
      (answers as any)[field.id] !== undefined
    ).length
    const totalFields = relevantFields.length
    const completionPct = Math.round((customizedFields / totalFields) * 100)

    return (
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
          Baseline Summary
        </div>
        
        <div className="review-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px'
        }}>
          <div className="review-item">
            <div className="small" style={{ opacity: 0.7 }}>Region</div>
            <div style={{ fontWeight: 500 }}>
              {answers.region === 'US' ? 'United States' : 'Canada'}
            </div>
          </div>
          
          <div className="review-item">
            <div className="small" style={{ opacity: 0.7 }}>Customized Fields</div>
            <div style={{ fontWeight: 500 }}>
              {customizedFields} of {totalFields}
            </div>
          </div>
          
          <div className="review-item">
            <div className="small" style={{ opacity: 0.7 }}>Completion</div>
            <div style={{ fontWeight: 500 }}>
              {completionPct}%
            </div>
          </div>
          
          <div className="review-item">
            <div className="small" style={{ opacity: 0.7 }}>Est. Annual Revenue</div>
            <div style={{ fontWeight: 500, color: '#059669' }}>
              ${netIncome.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card-title">Review Your Baseline</div>
      <p className="small" style={{ marginBottom: '1.5rem' }}>
        Review all your inputs before creating the baseline. You can go back to make changes, 
        or proceed to create your P&L baseline with this data.
      </p>

      {renderSummaryStats()}
      {renderIncomeSection()}

      {/* Expense Categories */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '1rem',
          fontWeight: 600,
          color: '#dc2626'
        }}>
          📊 Expense Categories
        </div>
        
        {(['personnel', 'facility', 'operations', 'franchise', 'misc'] as ExpenseCategory[])
          .map(renderExpenseCategory)}
      </div>

      {/* Final confirmation note */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: '#fffbeb',
        border: '1px solid #fed7aa',
        borderRadius: '6px',
        marginBottom: '1.5rem'
      }}>
        <div className="small" style={{ color: '#92400e', fontWeight: 500, marginBottom: '4px' }}>
          📝 Note
        </div>
        <div className="small" style={{ color: '#92400e' }}>
          This baseline will be saved and used as your starting point. You can always 
          adjust individual values later using the main dashboard controls.
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
          ← Back to Edit
        </button>
        <button type="button" onClick={onNext} className="btn-primary">
          ✅ Confirm & Create Baseline
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