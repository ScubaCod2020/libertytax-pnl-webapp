// WizardShell.tsx - Enhanced wizard with comprehensive expense data collection
// Multi-step flow: Welcome → Inputs → Review → Confirm & Create Dashboard

import React, { useState } from 'react'
import type { Region } from '../lib/calcs'
import type { ExpenseValues } from '../types/expenses'
import WizardInputs from './WizardInputs'
import WizardReview from './WizardReview'

// Comprehensive wizard answers including all 17 expense fields
export interface WizardAnswers {
  // Basic info
  region: Region
  
  // Business performance (new fields)
  storeType?: 'new' | 'existing'
  lastYearRevenue?: number
  lastYearExpenses?: number
  expectedGrowthPct?: number
  expectedRevenue?: number // calculated or overridden
  projectedExpenses?: number // calculated or overridden
  
  // Income drivers (enhanced)
  avgNetFee?: number
  taxPrepReturns?: number
  taxRushReturns?: number // for Canada
  otherIncome?: number // new field for additional revenue streams
  discountsPct?: number
  
  // All 17 expense fields
  salariesPct?: number
  empDeductionsPct?: number
  rentPct?: number
  telephoneAmt?: number
  utilitiesAmt?: number
  localAdvAmt?: number
  insuranceAmt?: number
  postageAmt?: number
  suppliesPct?: number
  duesAmt?: number
  bankFeesAmt?: number
  maintenanceAmt?: number
  travelEntAmt?: number
  royaltiesPct?: number
  advRoyaltiesPct?: number
  taxRushRoyaltiesPct?: number
  miscPct?: number
}

export type WizardStep = 'welcome' | 'inputs' | 'review' | 'complete'

interface WizardShellProps {
  region: Region
  setRegion: (region: Region) => void
  onComplete: (answers: WizardAnswers) => void
  onCancel: () => void
}

export default function WizardShell({ region, setRegion, onComplete, onCancel }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [answers, setAnswers] = useState<WizardAnswers>({
    region
  })

  // Update answers when region changes
  React.useEffect(() => {
    setAnswers(prev => ({ ...prev, region }))
  }, [region])

  const updateAnswers = (updates: Partial<WizardAnswers>) => {
    setAnswers(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('inputs')
        break
      case 'inputs':
        setCurrentStep('review')
        break
      case 'review':
        setCurrentStep('complete')
        // Complete the wizard with final answers
        onComplete(answers)
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'inputs':
        setCurrentStep('welcome')
        break
      case 'review':
        setCurrentStep('inputs')
        break
      case 'complete':
        setCurrentStep('review')
        break
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true // Region is always set
      case 'inputs':
        // Require at least basic income fields to be filled
        return !!(answers.avgNetFee && answers.taxPrepReturns)
      case 'review':
        return true
      default:
        return false
    }
  }

  return (
    <div className="card">
      {/* Progress indicator */}
      <div className="wizard-progress" style={{ marginBottom: '1rem' }}>
        <div className="small" style={{ opacity: 0.7 }}>
          Step {getStepNumber(currentStep)} of 3: {getStepTitle(currentStep)}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          {['welcome', 'inputs', 'review'].map((step, index) => (
            <div
              key={step}
              style={{
                height: '4px',
                flex: 1,
                backgroundColor: getStepNumber(currentStep) > index ? '#22c55e' : '#e5e7eb',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      {currentStep === 'welcome' && (
        <WelcomeStep 
          region={region}
          setRegion={setRegion}
          answers={answers}
          updateAnswers={updateAnswers}
          onNext={handleNext}
          onCancel={onCancel}
        />
      )}

      {currentStep === 'inputs' && (
        <InputsStep
          answers={answers}
          updateAnswers={updateAnswers}
          onNext={handleNext}
          onBack={handleBack}
          canProceed={canProceed()}
        />
      )}

      {currentStep === 'review' && (
        <ReviewStep
          answers={answers}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteStep onCancel={onCancel} />
      )}
    </div>
  )
}

// Welcome step component
function WelcomeStep({ 
  region, 
  setRegion, 
  answers,
  updateAnswers,
  onNext, 
  onCancel 
}: {
  region: Region
  setRegion: (region: Region) => void
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  onNext: () => void
  onCancel: () => void
}) {
  const growthOptions = [
    { value: -20, label: '-20% (Decline)' },
    { value: -10, label: '-10% (Slight decline)' },
    { value: 0, label: '0% (Same as last year)' },
    { value: 5, label: '+5% (Conservative growth)' },
    { value: 10, label: '+10% (Moderate growth)' },
    { value: 15, label: '+15% (Strong growth)' },
    { value: 20, label: '+20% (Aggressive growth)' },
    { value: 25, label: '+25% (Very aggressive)' },
    { value: 'custom', label: 'Custom percentage...' }
  ]

  // Calculate expected revenue when inputs change
  React.useEffect(() => {
    if (answers.lastYearRevenue && answers.expectedGrowthPct !== undefined) {
      const calculated = answers.lastYearRevenue * (1 + answers.expectedGrowthPct / 100)
      updateAnswers({ expectedRevenue: calculated })
    }
  }, [answers.lastYearRevenue, answers.expectedGrowthPct])

  const canProceed = () => {
    if (answers.storeType === 'new') return true
    return !!(answers.lastYearRevenue && answers.expectedRevenue)
  }

  return (
    <>
      <div className="card-title">Welcome – Quick Start Wizard</div>
      <p style={{ marginBottom: '1.2rem' }}>
        This wizard will help you set up your P&L dashboard with comprehensive income and expense data.
      </p>
      
      <div className="input-row" style={{ marginBottom: '1rem' }}>
        <label>Region</label>
        <select value={region} onChange={e => setRegion(e.target.value as Region)}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
        {region === 'CA' && (
          <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
            TaxRush franchise fees apply only to Canadian offices
          </div>
        )}
      </div>

      <div className="input-row" style={{ marginBottom: '1rem' }}>
        <label>Store Type</label>
        <select 
          value={answers.storeType || ''} 
          onChange={e => updateAnswers({ storeType: e.target.value as 'new' | 'existing' })}
        >
          <option value="">Select store type...</option>
          <option value="new">New Store (First year)</option>
          <option value="existing">Existing Store</option>
        </select>
        <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
          New stores use regional stats, existing stores use your historical data
        </div>
      </div>

      {answers.storeType === 'existing' && (
        <>
          {/* Performance Comparison Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1.5rem',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            {/* Last Year Performance */}
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
              
              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Tax Prep Income ($)</label>
                <input
                  type="number"
                  placeholder="200000"
                  value={answers.lastYearRevenue || ''}
                  onChange={e => updateAnswers({ lastYearRevenue: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  Total tax prep revenue (before discounts)
                </div>
              </div>

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Average Net Fee ($)</label>
                <input
                  type="number"
                  placeholder="125"
                  value={answers.avgNetFee || ''}
                  onChange={e => updateAnswers({ avgNetFee: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  Average fee per return after discounts
                </div>
              </div>

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Tax Prep Returns (#)</label>
                <input
                  type="number"
                  placeholder="1600"
                  value={answers.taxPrepReturns || ''}
                  onChange={e => updateAnswers({ taxPrepReturns: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  Number of tax returns completed
                </div>
              </div>

              {answers.region === 'CA' && (
                <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                  <label>TaxRush Returns (#)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={answers.taxRushReturns || ''}
                    onChange={e => updateAnswers({ taxRushReturns: parseFloat(e.target.value) || undefined })}
                  />
                  <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                    TaxRush returns completed (Canada only)
                  </div>
                </div>
              )}

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Total Expenses ($)</label>
                <input
                  type="number"
                  placeholder="120000"
                  value={answers.lastYearExpenses || ''}
                  onChange={e => updateAnswers({ lastYearExpenses: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  Your total expenses from last year
                </div>
              </div>

              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                Total Revenue: ${answers.lastYearRevenue?.toLocaleString() || '—'}
              </div>
            </div>

            {/* Projected Performance */}
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

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Projected Performance Change</label>
                <select 
                  value={
                    answers.expectedGrowthPct !== undefined 
                      ? (growthOptions.find(opt => opt.value === answers.expectedGrowthPct) ? answers.expectedGrowthPct.toString() : 'custom')
                      : ''
                  } 
                  onChange={e => {
                    const val = e.target.value
                    if (val === 'custom') {
                      // Don't clear the value, just trigger custom input
                    } else if (val === '') {
                      updateAnswers({ expectedGrowthPct: undefined })
                    } else {
                      updateAnswers({ expectedGrowthPct: parseFloat(val) })
                    }
                  }}
                >
                  <option value="">Select projected change...</option>
                  {growthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  How do you project this year to compare?
                </div>
              </div>

              {(answers.expectedGrowthPct !== undefined && !growthOptions.find(opt => opt.value === answers.expectedGrowthPct)) && (
                <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                  <label>Custom Growth Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={answers.expectedGrowthPct || ''}
                    onChange={e => updateAnswers({ expectedGrowthPct: parseFloat(e.target.value) || undefined })}
                  />
                  <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                    Enter custom percentage (+ for growth, - for decline)
                  </div>
                </div>
              )}

              {/* Projected fields based on last year + growth */}
              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Tax Prep Income ($)</label>
                <input
                  type="number"
                  placeholder="220000"
                  value={
                    answers.lastYearRevenue && answers.expectedGrowthPct !== undefined 
                      ? Math.round(answers.lastYearRevenue * (1 + answers.expectedGrowthPct / 100))
                      : (answers.expectedRevenue || '')
                  }
                  onChange={e => updateAnswers({ expectedRevenue: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  {answers.lastYearRevenue && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    'Your projected tax prep revenue for this year'
                  }
                </div>
              </div>

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Average Net Fee ($)</label>
                <input
                  type="number"
                  placeholder="130"
                  value={
                    answers.avgNetFee && answers.expectedGrowthPct !== undefined 
                      ? Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
                      : (answers.avgNetFee || '')
                  }
                  onChange={e => updateAnswers({ avgNetFee: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  {answers.avgNetFee && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    'Your projected average net fee per return'
                  }
                </div>
              </div>

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Tax Prep Returns (#)</label>
                <input
                  type="number"
                  placeholder="1680"
                  value={
                    answers.taxPrepReturns && answers.expectedGrowthPct !== undefined 
                      ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                      : (answers.taxPrepReturns || '')
                  }
                  onChange={e => updateAnswers({ taxPrepReturns: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  {answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    'Your projected number of tax returns'
                  }
                </div>
              </div>

              {answers.region === 'CA' && (
                <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                  <label>TaxRush Returns (#)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={
                      answers.taxRushReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
                        : (answers.taxRushReturns || '')
                    }
                    onChange={e => updateAnswers({ taxRushReturns: parseFloat(e.target.value) || undefined })}
                  />
                  <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                    {answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? 
                      `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                      'Your projected TaxRush returns (Canada only)'
                    }
                  </div>
                </div>
              )}

              <div className="input-row" style={{ marginBottom: '0.75rem' }}>
                <label>Total Expenses ($)</label>
                <input
                  type="number"
                  placeholder="130000"
                  value={
                    answers.lastYearExpenses && answers.expectedGrowthPct !== undefined 
                      ? Math.round(answers.lastYearExpenses * (1 + answers.expectedGrowthPct / 100))
                      : (answers.projectedExpenses || '')
                  }
                  onChange={e => updateAnswers({ projectedExpenses: parseFloat(e.target.value) || undefined })}
                />
                <div className="small" style={{ marginTop: '0.25rem', opacity: 0.7 }}>
                  {answers.lastYearExpenses && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    'Your projected total expenses for this year'
                  }
                </div>
              </div>

              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#d1fae5', 
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#065f46'
              }}>
                Projected Revenue: ${
                  answers.expectedRevenue 
                    ? Math.round(answers.expectedRevenue).toLocaleString() 
                    : '—'
                }
                {answers.lastYearRevenue && answers.expectedRevenue && (
                  <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                    ({answers.expectedRevenue > answers.lastYearRevenue ? '+' : ''}
                    {(((answers.expectedRevenue - answers.lastYearRevenue) / answers.lastYearRevenue) * 100).toFixed(1)}% change)
                  </div>
                )}
              </div>
              
              {answers.projectedExpenses && answers.expectedRevenue && (
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#92400e',
                  marginTop: '0.5rem'
                }}>
                  Projected Net Income: ${Math.round(answers.expectedRevenue - answers.projectedExpenses).toLocaleString()}
                  <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                    Net Margin: {(((answers.expectedRevenue - answers.projectedExpenses) / answers.expectedRevenue) * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8, marginTop: '0.25rem' }}>
                    Based on Tax Prep Income (after discounts) minus expenses
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {answers.storeType === 'new' && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem' }}>
            🏪 New Store Setup
          </div>
          <div className="small" style={{ color: '#0369a1' }}>
            Since this is a new store, we'll use regional stats and help you set realistic targets 
            in the next step. You can always adjust these values as you learn more about your market.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Skip Wizard
        </button>
        <button 
          type="button" 
          onClick={onNext} 
          className="btn-primary"
          disabled={!canProceed()}
          style={{ opacity: canProceed() ? 1 : 0.5 }}
        >
          Continue →
        </button>
      </div>
    </>
  )
}

// Inputs step using the comprehensive component
function InputsStep({
  answers,
  updateAnswers,
  onNext,
  onBack,
  canProceed
}: {
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  onNext: () => void
  onBack: () => void
  canProceed: boolean
}) {
  return (
    <WizardInputs
      answers={answers}
      updateAnswers={updateAnswers}
      onNext={onNext}
      onBack={onBack}
      canProceed={canProceed}
    />
  )
}

// Review step using the comprehensive component
function ReviewStep({
  answers,
  onNext,
  onBack
}: {
  answers: WizardAnswers
  onNext: () => void
  onBack: () => void
}) {
  return (
    <WizardReview
      answers={answers}
      onNext={onNext}
      onBack={onBack}
    />
  )
}

// Complete step
function CompleteStep({ onCancel }: { onCancel: () => void }) {
  return (
    <>
      <div className="card-title">✅ Dashboard Created</div>
      <p style={{ marginBottom: '1.5rem' }}>
        Your P&L dashboard has been successfully created with comprehensive income and expense data. 
        You can now use the main dashboard to explore scenarios and make adjustments.
      </p>
      
      <button type="button" onClick={onCancel} className="btn-primary">
        Go to Dashboard
      </button>
    </>
  )
}

// Helper functions
function getStepNumber(step: WizardStep): number {
  switch (step) {
    case 'welcome': return 1
    case 'inputs': return 2
    case 'review': return 3
    case 'complete': return 3
    default: return 1
  }
}

function getStepTitle(step: WizardStep): string {
  switch (step) {
    case 'welcome': return 'Welcome'
    case 'inputs': return 'Income & Expenses'
    case 'review': return 'Review & Confirm'
    case 'complete': return 'Complete'
    default: return 'Welcome'
  }
}