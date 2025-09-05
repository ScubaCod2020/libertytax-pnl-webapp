// WizardShell.tsx - Enhanced wizard with comprehensive expense data collection
// Multi-step flow: Welcome → Inputs → Review → Confirm & Create Baseline

import React, { useState } from 'react'
import type { Region } from '../lib/calcs'
import type { ExpenseValues } from '../types/expenses'
import WizardInputs from './WizardInputs'
import WizardReview from './WizardReview'

// Comprehensive wizard answers including all 17 expense fields
export interface WizardAnswers {
  // Basic info
  region: Region
  
  // Income drivers
  avgNetFee?: number
  taxPrepReturns?: number
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
  onNext, 
  onCancel 
}: {
  region: Region
  setRegion: (region: Region) => void
  onNext: () => void
  onCancel: () => void
}) {
  return (
    <>
      <div className="card-title">Welcome – Quick Start Wizard</div>
      <p style={{ marginBottom: '1rem' }}>
        This wizard will help you set up your P&L baseline with comprehensive income and expense data.
      </p>
      
      <div className="input-row">
        <label>Region</label>
        <select value={region} onChange={e => setRegion(e.target.value as Region)}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>
      
      <p className="small" style={{ marginBottom: '1.5rem' }}>
        TaxRush franchise fees apply only to Canadian offices. 
        Selecting U.S. will disable TaxRush in calculations.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Skip Wizard
        </button>
        <button type="button" onClick={onNext} className="btn-primary">
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
      <div className="card-title">✅ Baseline Created</div>
      <p style={{ marginBottom: '1.5rem' }}>
        Your P&L baseline has been successfully created with comprehensive income and expense data. 
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