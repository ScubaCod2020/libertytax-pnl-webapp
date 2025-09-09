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
  persistence?: any // Optional persistence for loading saved data
}

export default function WizardShell({ region, setRegion, onComplete, onCancel, persistence }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  
  // Initialize answers from saved data if available, otherwise start fresh
  const [answers, setAnswers] = useState<WizardAnswers>(() => {
    if (persistence) {
      const savedAnswers = persistence.loadWizardAnswers()
      if (savedAnswers) {
        console.log('🧙‍♂️ Loading saved wizard answers for review mode:', savedAnswers)
        // Use saved region instead of overriding it - this preserves CA/US selection
        return savedAnswers
      }
    }
    console.log('🧙‍♂️ Starting fresh wizard (no saved answers)')
    return { region }
  })
  
  // Sync app region with wizard region when loading saved data
  React.useEffect(() => {
    if (persistence && answers.region && answers.region !== region) {
      console.log(`🧙‍♂️ Syncing app region: ${region} → ${answers.region} (from saved wizard data)`)
      setRegion(answers.region)
    }
  }, [answers.region, region, setRegion, persistence])

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
  
  // Reset wizard data but stay in wizard (for "Reset Data" button on Page 1)
  const handleResetWizardData = () => {
    console.log('🔄 Resetting wizard data - staying in wizard')
    setAnswers({ region }) // Reset to just region, clear all other data
    // Stay on current step - don't exit wizard
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
    
    // For new stores, calculate expected revenue from target performance goals
    if (answers.storeType === 'new' && answers.avgNetFee && answers.taxPrepReturns) {
      // Direct calculation for new stores (no growth applied)
      const grossFees = answers.avgNetFee * answers.taxPrepReturns
      
      // Apply discounts (default 3% if not specified)
      const discountsPct = answers.discountsPct || 3
      const discountAmt = grossFees * (discountsPct / 100)
      const netTaxPrepRevenue = grossFees - discountAmt
      
      // Add other revenue sources
      const otherIncome = answers.otherIncome || 0
      const taxRushIncome = (region === 'CA' && answers.taxRushReturns) 
        ? answers.avgNetFee * answers.taxRushReturns 
        : 0
      
      const totalRevenue = netTaxPrepRevenue + otherIncome + taxRushIncome
      updateAnswers({ expectedRevenue: totalRevenue })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, answers.lastYearDiscountsPct, answers.lastYearOtherIncome, answers.lastYearTaxRushReturns, answers.region, answers.storeType, answers.discountsPct, answers.otherIncome, answers.taxRushReturns])

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
      onResetData={handleResetWizardData}
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
  onResetData,
  canProceed
}: {
  region: Region
  setRegion: (region: Region) => void
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  onNext: () => void
  onCancel: () => void
  onResetData: () => void
  canProceed: () => boolean
}) {
  return (
    <div data-wizard-step="welcome">
      <div className="card-title">Welcome – Quick Start Wizard</div>
      <div className="card-subtitle">
        Create your customized P&L dashboard in just a few quick steps
      </div>

      {/* Region Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <label htmlFor="region-select" style={{ minWidth: '60px', fontWeight: 500 }}>Region</label>
          <select 
            id="region-select"
            value={region} 
            onChange={e => {
              const newRegion = e.target.value as Region
              setRegion(newRegion) // Update app state
              updateAnswers({ region: newRegion }) // Update wizard answers for saving
            }}
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
          <label htmlFor="store-type-select" style={{ minWidth: '80px', fontWeight: 500 }}>Store Type</label>
          <select 
            id="store-type-select"
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
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onResetData} 
            title="Reset all wizard data and start fresh (stays in wizard)"
            style={{
              background: 'linear-gradient(45deg, #dc2626, #ef4444)', 
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
            🔄 Reset Data
          </button>
          <button 
            onClick={onCancel} 
            title="Cancel wizard and return to dashboard"
            style={{
              background: 'linear-gradient(45deg, #6b7280, #9ca3af)', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '6px', 
              border: 'none',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              opacity: 0.8
            }}
          >
            ❌ Cancel & Exit
          </button>
        </div>
        <button 
          onClick={onNext} 
          disabled={!canProceed()}
          style={{
            background: canProceed()
              ? 'linear-gradient(45deg, #059669, #10b981)' 
              : 'linear-gradient(45deg, #9ca3af, #d1d5db)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: 'none',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: canProceed() ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: canProceed() ? 1 : 0.6
          }}
        >
          Next Step: Detailed Inputs →
        </button>
      </div>
    </div>
  )
}
