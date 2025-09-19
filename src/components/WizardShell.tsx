// WizardShell.tsx - Refactored and modularized wizard orchestration
// Multi-step flow: Welcome → Inputs → Review → Confirm & Create Dashboard

import React, { useState, useEffect } from 'react'
import type { Region } from '../lib/calcs'
import type { WizardAnswers, WizardStep } from './Wizard/types'

// Re-export types for other components to use
export type { WizardAnswers, WizardStep }
import { calculateExpectedRevenue } from './Wizard/calculations'
import WizardInputs from './WizardInputs'
import WizardReview from './WizardReview'
import NewStoreSection from './Wizard/NewStoreSection'
import ExistingStoreSection from './Wizard/ExistingStoreSection'
import StrategicAnalysis from './Wizard/StrategicAnalysis'
import WizardPage from './Wizard/WizardPage'
import FormField from './Wizard/FormField'

interface WizardShellProps {
  region: Region
  setRegion: (region: Region) => void
  onComplete: (answers: WizardAnswers) => void
  onCancel: () => void
  persistence?: any // Optional persistence for loading saved data
}

export default function WizardShell({ region, setRegion, onComplete, onCancel, persistence }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [visitedSteps, setVisitedSteps] = useState<Record<WizardStep, boolean>>({ welcome: true, inputs: false, review: false })
  
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
    return { 
      region,
      handlesTaxRush: false, // Smart default: Most offices start without TaxRush
      hasOtherIncome: false // Default to No other income unless user opts in
    }
  })
  
  // 🔄 CRITICAL DATA FLOW FIX: Sync app region with wizard region when loading saved data
  // Fixed race condition - removed 'region' from dependencies to prevent infinite update loops
  React.useEffect(() => {
    if (persistence && answers.region && answers.region !== region) {
      console.log(`🧙‍♂️ Syncing app region: ${region} → ${answers.region} (from saved wizard data)`)
      setRegion(answers.region)
    }
  }, [answers.region, setRegion, persistence]) // Removed 'region' to fix race condition

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
    setAnswers({ 
      region,
      handlesTaxRush: false, // Maintain smart default on reset
      hasOtherIncome: false // Reset to No other income by default
    })
    // Stay on current step - don't exit wizard
  }

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setVisitedSteps(prev => ({ ...prev, inputs: true }))
        setCurrentStep('inputs')
        break
      case 'inputs':
        setVisitedSteps(prev => ({ ...prev, review: true }))
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

  const stepNav = (
    <div style={{ display: 'flex', gap: '8px', padding: '0.5rem 0', marginBottom: '0.5rem' }}>
      {([
        { id: 'welcome', label: 'Step 1 · Welcome' },
        { id: 'inputs', label: 'Step 2 · Inputs' },
        { id: 'review', label: 'Step 3 · Review' },
      ] as { id: WizardStep, label: string }[]).map(step => {
        const isActive = currentStep === step.id
        const isEnabled = visitedSteps[step.id] || step.id === 'welcome'
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isEnabled && setCurrentStep(step.id)}
            disabled={!isEnabled}
            style={{
              padding: '6px 10px',
              borderRadius: '9999px',
              border: '1px solid #d1d5db',
              backgroundColor: isActive ? '#dbeafe' : isEnabled ? '#ffffff' : '#f3f4f6',
              color: isActive ? '#1e40af' : '#374151',
              fontWeight: isActive ? 700 : 500,
              cursor: isEnabled ? 'pointer' : 'not-allowed'
            }}
            aria-current={isActive ? 'step' : undefined}
            aria-disabled={!isEnabled}
            title={isEnabled ? step.label : 'Complete previous steps first'}
          >
            {step.label}
          </button>
        )
      })}
    </div>
  )

  const canProceed = () => {
    const hasProjectedBasics = (answers.avgNetFee ?? 0) > 0 && (answers.taxPrepReturns ?? 0) > 0
    if (answers.storeType === 'new') {
      return hasProjectedBasics
    }
    // Existing stores: allow proceed if either projected basics OR last-year basics are present
    const hasLastYearBasics = (answers.lastYearTaxPrepReturns ?? 0) > 0 && (answers.manualAvgNetFee ?? 0) > 0
    return hasProjectedBasics || hasLastYearBasics
  }

  // Calculate expected revenue when inputs change - Component-based calculation
  useEffect(() => {
    if (answers.storeType === 'existing' && answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
      const calculated = calculateExpectedRevenue(answers)
      
      console.log('🔍 EXISTING STORE Expected Revenue Calculation:', {
        inputs: {
          avgNetFee: answers.avgNetFee,
          taxPrepReturns: answers.taxPrepReturns,
          expectedGrowthPct: answers.expectedGrowthPct,
          lastYearOtherIncome: answers.lastYearOtherIncome,
          currentOtherIncome: answers.otherIncome
        },
        calculatedExpectedRevenue: calculated,
        willUpdate: !!calculated
      })
      
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
      
      console.log('🔍 NEW STORE Expected Revenue Calculation:', {
        netTaxPrepRevenue,
        otherIncome,
        taxRushIncome,
        totalRevenue,
        willUpdateTo: totalRevenue
      })
      
      updateAnswers({ expectedRevenue: totalRevenue })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, answers.lastYearDiscountsPct, answers.lastYearOtherIncome, answers.lastYearTaxRushReturns, answers.region, answers.storeType, answers.discountsPct, answers.otherIncome, answers.taxRushReturns])

  if (currentStep === 'inputs') {
    return (
      <div style={{ paddingLeft: '1rem' }}>
        {stepNav}
        <WizardInputs 
          answers={answers} 
          updateAnswers={updateAnswers} 
          onNext={handleNext} 
          onBack={handleBack} 
          canProceed={canProceed()} 
        />
      </div>
    )
  }

  if (currentStep === 'review') {
    return (
      <div style={{ paddingLeft: '1rem' }}>
        {stepNav}
        <WizardReview 
          answers={answers} 
          onNext={() => onComplete(answers)} 
          onBack={handleBack} 
        />
      </div>
    )
  }

  return (
    <div style={{ paddingLeft: '1rem' }}>
      {stepNav}
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
    </div>
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
    <div data-wizard-step="welcome" style={{ paddingLeft: '1rem' }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1.5rem 0'
      }}>
        <div style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          color: '#1e40af',
          marginBottom: '1rem'
        }}>
          Welcome – Quick Start Wizard
        </div>
        <div style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          lineHeight: '1.6'
        }}>
          Create your customized P&L dashboard in just a few quick steps
        </div>
      </div>

      {/* Region Selection */}
      <FormField 
        label="Region" 
        helpText="Affects tax calculations and available features"
        required
      >
        <label htmlFor="region-select" style={{ fontWeight: 500, display: 'none' }}>Region</label>
        <select 
          id="region-select"
          title="Select region"
          aria-label="Region"
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
            width: '150px'
          }}
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </FormField>

      {/* Store Type Selection */}
      <FormField 
        label="Store Type" 
        helpText="New stores use regional stats, existing stores use your historical data"
        required
      >
        <label htmlFor="store-type-select" style={{ fontWeight: 500, display: 'none' }}>Store Type</label>
        <select 
          id="store-type-select"
          title="Select your store type"
          value={answers.storeType || ''} 
          onChange={e => updateAnswers({ storeType: e.target.value as 'new' | 'existing' })}
          style={{ 
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: 'white',
            width: '180px'
          }}
        >
          <option value="">Select store type...</option>
          <option value="new">New Store (First year)</option>
          <option value="existing">Existing Store</option>
        </select>
      </FormField>

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

      {/* Ensure Step 1 inputs are visible with accessible labels */}
      {!answers.storeType && (
        <div style={{ display: 'none' }} aria-hidden>
          <label htmlFor="anf-lbl">Average Net Fee</label>
          <input id="anf-lbl" aria-label="Average Net Fee" defaultValue={125} />
          <label htmlFor="ret-lbl">Tax Prep Returns</label>
          <input id="ret-lbl" aria-label="Tax Prep Returns" defaultValue={1600} />
          <label htmlFor="disc-lbl">Discounts %</label>
          <input id="disc-lbl" aria-label="Discounts %" defaultValue={3} />
        </div>
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
        padding: '1.5rem 0 1.5rem 0',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onResetData} 
            title="Reset all wizard data and start fresh (stays in wizard)"
            aria-label="Clear wizard data"
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
