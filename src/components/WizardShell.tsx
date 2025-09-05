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
  expectedGrowthPct?: number
  expectedRevenue?: number // calculated or overridden
  
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
        <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
          TaxRush franchise fees apply only to Canadian offices
        </div>
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
          New stores use industry benchmarks, existing stores use your historical data
        </div>
      </div>

      {answers.storeType === 'existing' && (
        <>
          <div className="input-row" style={{ marginBottom: '1rem' }}>
            <label>Last Year's Total Revenue ($)</label>
            <input
              type="number"
              placeholder="250000"
              value={answers.lastYearRevenue || ''}
              onChange={e => updateAnswers({ lastYearRevenue: parseFloat(e.target.value) || undefined })}
            />
            <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
              Your total gross revenue from last year (before discounts)
            </div>
          </div>

          <div className="input-row" style={{ marginBottom: '1rem' }}>
            <label>Expected Performance Change</label>
            <select 
              value={answers.expectedGrowthPct?.toString() || ''} 
              onChange={e => {
                const val = e.target.value
                if (val === 'custom') {
                  // Don't set a value, let user input custom
                } else {
                  updateAnswers({ expectedGrowthPct: parseFloat(val) })
                }
              }}
            >
              <option value="">Select expected change...</option>
              {growthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
              How do you expect this year to compare to last year?
            </div>
          </div>

          {(answers.expectedGrowthPct === undefined || answers.expectedGrowthPct.toString() === 'custom') && (
            <div className="input-row" style={{ marginBottom: '1rem' }}>
              <label>Custom Growth Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="10"
                value={answers.expectedGrowthPct || ''}
                onChange={e => updateAnswers({ expectedGrowthPct: parseFloat(e.target.value) || undefined })}
              />
              <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
                Enter your custom growth percentage (positive for growth, negative for decline)
              </div>
            </div>
          )}

          <div className="input-row" style={{ marginBottom: '1rem' }}>
            <label>Expected Revenue ($)</label>
            <input
              type="number"
              placeholder="275000"
              value={answers.expectedRevenue || ''}
              onChange={e => updateAnswers({ expectedRevenue: parseFloat(e.target.value) || undefined })}
            />
            <div className="small" style={{ marginTop: '0.3rem', opacity: 0.7 }}>
              {answers.lastYearRevenue && answers.expectedGrowthPct !== undefined ? 
                `Calculated: $${(answers.lastYearRevenue * (1 + answers.expectedGrowthPct / 100)).toLocaleString()} (you can override)` :
                'Your expected total revenue for this year'
              }
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
            Since this is a new store, we'll use industry benchmarks and help you set realistic targets 
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