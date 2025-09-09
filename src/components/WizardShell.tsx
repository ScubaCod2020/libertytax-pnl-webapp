// WizardShell.tsx - Refactored and modularized wizard orchestration
// Multi-step flow: Welcome → Inputs → Review → Confirm & Create Dashboard

import React, { useState, useEffect } from 'react'
import type { Region } from '../lib/calcs'
import type { WizardAnswers, WizardStep } from './Wizard/types'
import { calculateExpectedRevenue } from './Wizard/calculations'
import WizardInputs from './WizardInputs'
import WizardReview from './WizardReview'
import NewStoreSection from './Wizard/NewStoreSection'
import ExistingStoreSection from './Wizard/ExistingStoreSection'
import StrategicAnalysis from './Wizard/StrategicAnalysis'

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

  console.log('🧙‍♂️ WIZARD WELCOME DEBUG:', { 
    currentStep, 
    answers, 
    region,
    storeType: answers.storeType,
    hasHistoricalData: !!(answers.lastYearGrossFees && answers.avgNetFee && answers.taxPrepReturns)
  })

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
    }
  }

  const canProceed = () => {
    if (answers.storeType === 'new') {
      // New stores need target performance inputs
      return !!(answers.avgNetFee && answers.taxPrepReturns)
    }
    // Existing stores need historical data and projections  
    return !!(answers.avgNetFee && answers.taxPrepReturns && answers.expectedRevenue)
  }

  // Calculate expected revenue when inputs change - Component-based calculation
  useEffect(() => {
    if (answers.storeType === 'existing' && answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
      const calculated = calculateExpectedRevenue(answers)
      if (calculated) {
        updateAnswers({ expectedRevenue: calculated })
      }
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, answers.lastYearDiscountsPct, answers.lastYearOtherIncome, answers.lastYearTaxRushReturns, answers.region, answers.storeType])

  if (currentStep === 'inputs') {
    return <WizardInputs 
      answers={answers} 
      updateAnswers={updateAnswers} 
      onNext={handleNext} 
      onBack={handleBack} 
      canProceed={canProceed()} 
    />
  }

  if (currentStep === 'review') {
    return <WizardReview 
      answers={answers} 
      onNext={() => onComplete(answers)} 
      onBack={handleBack} 
    />
  }

  return (
    <WelcomeStep 
      region={region} 
      setRegion={setRegion} 
      answers={answers}
      updateAnswers={updateAnswers}
      onNext={handleNext}
      onCancel={onCancel}
      canProceed={canProceed}
    />
  )
}

// Welcome step component - Clean orchestration of modular sections
function WelcomeStep({ 
  region, 
  setRegion, 
  answers,
  updateAnswers,
  onNext,
  onCancel,
  canProceed
}: {
  region: Region
  setRegion: (region: Region) => void
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  onNext: () => void
  onCancel: () => void
  canProceed: () => boolean
}) {
  return (
    <>
      <div className="card-title">Welcome – Quick Start Wizard</div>
      <div className="card-subtitle">
        Create your customized P&L dashboard in just a few quick steps
      </div>

      {/* Region Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <label style={{ minWidth: '60px', fontWeight: 500 }}>Region</label>
          <select 
            value={region} 
            onChange={e => setRegion(e.target.value as Region)}
            style={{ 
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
        <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
          Affects tax calculations and available features
        </div>
      </div>

      {/* Store Type Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <label style={{ minWidth: '80px', fontWeight: 500 }}>Store Type</label>
          <select 
            value={answers.storeType || ''} 
            onChange={e => updateAnswers({ storeType: e.target.value as 'new' | 'existing' })}
            style={{ 
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white',
              minWidth: '200px'
            }}
          >
            <option value="">Select store type...</option>
            <option value="new">New Store (First year)</option>
            <option value="existing">Existing Store</option>
          </select>
        </div>
        <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
          New stores use regional stats, existing stores use your historical data
        </div>
      </div>

      {/* Store-specific sections */}
      {answers.storeType === 'existing' && (
        <ExistingStoreSection 
          answers={answers} 
          updateAnswers={updateAnswers} 
          region={region} 
        />
      )}

      {answers.storeType === 'new' && (
        <NewStoreSection 
          answers={answers} 
          updateAnswers={updateAnswers} 
          region={region} 
        />
      )}

      {/* Strategic Analysis - Only for existing stores with adjustments */}
      {answers.storeType === 'existing' && (
        <StrategicAnalysis 
          answers={answers} 
          updateAnswers={updateAnswers} 
          region={region} 
        />
      )}

      {/* Projected Net Income Summary - Only for stores with complete data */}
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
            Net Margin: {Math.round(((answers.expectedRevenue - answers.projectedExpenses) / answers.expectedRevenue) * 100)}%
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8, marginTop: '0.25rem' }}>
            Based on Tax Prep Income (after discounts) minus expenses
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="card-actions">
        <button 
          onClick={onCancel} 
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button 
          onClick={onNext} 
          className="btn btn-primary"
          disabled={!canProceed()}
        >
          Next Step: Detailed Inputs →
        </button>
      </div>
    </>
  )
}
