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
  
  // Last Year Performance - Complete breakdown (Page 1) - RESTRUCTURED for franchise UX
  lastYearGrossFees?: number // new field - what franchisee actually charged
  lastYearDiscountsAmt?: number // new field - dollar amount of discounts given
  lastYearDiscountsPct?: number // auto-calculated from amount/gross fees
  // lastYearTaxPrepIncome auto-calculated as grossFees - discountsAmt
  lastYearOtherIncome?: number
  lastYearTaxRushReturns?: number // for Canada
  lastYearExpenses?: number
  
  // Projected Performance - Complete breakdown (Page 1)
  expectedGrowthPct?: number
  expectedRevenue?: number // calculated total revenue or overridden
  projectedExpenses?: number // calculated or overridden
  
  // Income drivers (enhanced)
  avgNetFee?: number
  taxPrepReturns?: number
  taxRushReturns?: number // for Canada
  otherIncome?: number // new field for additional revenue streams
  discountsPct?: number
  
  // Projected values (for bidirectional wizard flow)
  projectedAvgNetFee?: number // manually adjusted projected value
  projectedTaxPrepReturns?: number // manually adjusted projected value
  
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
  
  // Educational Business Planning Helper Functions
  const calculateFieldGrowth = (currentValue: number, originalValue: number): number => {
    if (!originalValue || originalValue === 0) return 0
    return Math.round(((currentValue - originalValue) / originalValue) * 100)
  }
  
  const getAdjustmentStatus = () => {
    const adjustments = []
    
    // Check Average Net Fee adjustments
    if (answers.projectedAvgNetFee !== undefined && answers.avgNetFee) {
      const actualGrowth = calculateFieldGrowth(answers.projectedAvgNetFee, answers.avgNetFee)
      const expectedGrowth = answers.expectedGrowthPct || 0
      if (Math.abs(actualGrowth - expectedGrowth) > 1) {
        adjustments.push({
          field: 'Average Net Fee',
          actualGrowth,
          expectedGrowth,
          variance: actualGrowth - expectedGrowth
        })
      }
    }
    
    // Check Tax Prep Returns adjustments
    if (answers.projectedTaxPrepReturns !== undefined && answers.taxPrepReturns) {
      const actualGrowth = calculateFieldGrowth(answers.projectedTaxPrepReturns, answers.taxPrepReturns)
      const expectedGrowth = answers.expectedGrowthPct || 0
      if (Math.abs(actualGrowth - expectedGrowth) > 1) {
        adjustments.push({
          field: 'Tax Prep Returns',
          actualGrowth,
          expectedGrowth,
          variance: actualGrowth - expectedGrowth
        })
      }
    }
    
    return adjustments
  }
  
  const calculateBlendedGrowth = (): number => {
    if (!answers.avgNetFee || !answers.taxPrepReturns) return answers.expectedGrowthPct || 0
    
    // Calculate actual projected values
    const actualAvgNetFee = answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
      answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
    const actualTaxPrepReturns = answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
      answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
    
    // Calculate what the TARGET should be (10% growth on both)
    const targetAvgNetFee = answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
    const targetTaxPrepReturns = answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
    
    // Compare ACTUAL performance vs TARGET performance
    const targetRevenue = targetAvgNetFee * targetTaxPrepReturns
    const actualRevenue = actualAvgNetFee * actualTaxPrepReturns
    const originalRevenue = answers.avgNetFee * answers.taxPrepReturns
    
    if (originalRevenue > 0) {
      // Return actual growth vs baseline (for display)
      return Math.round(((actualRevenue - originalRevenue) / originalRevenue) * 100)
    }
    
    return answers.expectedGrowthPct || 0
  }
  
  const calculatePerformanceVsTarget = (): { actualRevenue: number, targetRevenue: number, variance: number } => {
    if (!answers.avgNetFee || !answers.taxPrepReturns) {
      return { actualRevenue: 0, targetRevenue: 0, variance: 0 }
    }
    
    const actualAvgNetFee = answers.projectedAvgNetFee !== undefined ? answers.projectedAvgNetFee :
      answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
    const actualTaxPrepReturns = answers.projectedTaxPrepReturns !== undefined ? answers.projectedTaxPrepReturns :
      answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
    
    const targetAvgNetFee = answers.avgNetFee * (1 + (answers.expectedGrowthPct || 0) / 100)
    const targetTaxPrepReturns = answers.taxPrepReturns * (1 + (answers.expectedGrowthPct || 0) / 100)
    
    const actualRevenue = actualAvgNetFee * actualTaxPrepReturns
    const targetRevenue = targetAvgNetFee * targetTaxPrepReturns
    const variance = ((actualRevenue - targetRevenue) / targetRevenue) * 100
    
    return { actualRevenue, targetRevenue, variance }
  }
  
  // Note: Custom growth input is now always visible, no state tracking needed

  // Calculate expected revenue when inputs change - FIXED to match Page 2 logic
  React.useEffect(() => {
    if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
      // Apply growth to COMPONENTS (same as Page 2)
      const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
      const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
      
      // Calculate projected gross fees from components
      const projectedGrossFees = projectedAvgNetFee * projectedTaxPrepReturns
      
      // Apply discounts to get net tax prep revenue
      const discountsPct = answers.lastYearDiscountsPct || 3
      const projectedDiscountAmt = projectedGrossFees * (discountsPct / 100)
      const projectedTaxPrepIncome = projectedGrossFees - projectedDiscountAmt
      
      // Add other revenue sources with growth
      const lastYearOtherIncome = answers.lastYearOtherIncome || 0
      const projectedOtherIncome = lastYearOtherIncome * (1 + answers.expectedGrowthPct / 100)
      
      const lastYearTaxRushIncome = answers.region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns 
        ? answers.avgNetFee * answers.lastYearTaxRushReturns 
        : 0
      const projectedTaxRushIncome = lastYearTaxRushIncome * (1 + answers.expectedGrowthPct / 100)
      
      // Calculate total revenue (should match Page 2)
      const calculated = projectedTaxPrepIncome + projectedOtherIncome + projectedTaxRushIncome
      
      // 🧙‍♂️ WIZARD WELCOME PAGE DEBUG - FIXED CALCULATION
      console.log('🧙‍♂️ WIZARD WELCOME DEBUG (FIXED):', {
        page: 'welcome_step_fixed',
        components: {
          avgNetFee: answers.avgNetFee,
          taxPrepReturns: answers.taxPrepReturns,
          expectedGrowthPct: answers.expectedGrowthPct
        },
        projected: {
          projectedAvgNetFee: projectedAvgNetFee,
          projectedTaxPrepReturns: projectedTaxPrepReturns,
          projectedGrossFees: projectedGrossFees,
          projectedDiscountAmt: projectedDiscountAmt,
          projectedTaxPrepIncome: projectedTaxPrepIncome
        },
        finalCalculation: {
          calculatedRevenue: calculated,
          shouldMatchPage2: true
        }
      })
      
      updateAnswers({ expectedRevenue: calculated })
    }
  }, [answers.avgNetFee, answers.taxPrepReturns, answers.expectedGrowthPct, answers.lastYearDiscountsPct, answers.lastYearOtherIncome, answers.lastYearTaxRushReturns, answers.region])

  const canProceed = () => {
    if (answers.storeType === 'new') {
      // New stores need target performance inputs
      return !!(answers.avgNetFee && answers.taxPrepReturns)
    }
    // Existing stores need historical data and projections  
    return !!(answers.avgNetFee && answers.taxPrepReturns && answers.expectedRevenue)
  }

  return (
    <>
      <div className="card-title">Welcome – Quick Start Wizard</div>
      <p style={{ marginBottom: '1.2rem' }}>
        This wizard will help you set up your P&L dashboard with comprehensive income and expense data.
      </p>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <label style={{ minWidth: '60px', fontWeight: 500 }}>Region</label>
          <select 
            value={region} 
            onChange={e => setRegion(e.target.value as Region)}
            style={{ 
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
        {region === 'CA' && (
          <div className="small" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
            TaxRush franchise fees apply only to Canadian offices
          </div>
        )}
      </div>

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
        <div className="small" style={{ marginLeft: '135px', opacity: 0.7 }}>
          New stores use regional stats, existing stores use your historical data
        </div>
      </div>

      {answers.storeType === 'existing' && (
        <>
          {/* Last Year Performance Box */}
          <div style={{
            marginBottom: '1rem',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
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
              
              {/* 1. Tax Prep Gross Fees (INPUT) */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '140px', fontWeight: 500 }}>Tax Prep Gross Fees</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 206,000"
                      value={answers.lastYearGrossFees ? answers.lastYearGrossFees.toLocaleString() : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        console.log('🧙‍♂️ WELCOME - Tax Prep Gross Fees changed:', { oldValue: answers.lastYearGrossFees, newValue })
                        updateAnswers({ lastYearGrossFees: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Total tax prep fees charged (before any discounts)
                </div>
              </div>

              {/* 2. Customer Discounts (BIDIRECTIONAL CALCULATION) */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '140px', fontWeight: 500 }}>Customer Discounts</label>
                  
                  {/* Dollar Amount Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 6,000"
                      value={answers.lastYearDiscountsAmt ? answers.lastYearDiscountsAmt.toLocaleString() : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        console.log('🧙‍♂️ WELCOME - Discounts Amount changed:', { oldValue: answers.lastYearDiscountsAmt, newValue })
                        updateAnswers({ lastYearDiscountsAmt: newValue })
                      }}
                      style={{ width: '110px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>

                  {/* Auto-Calculated Percentage Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#6b7280' }}>= </span>
                    <div style={{ 
                      width: '50px', 
                      textAlign: 'right', 
                      padding: '0.5rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      {answers.lastYearGrossFees && answers.lastYearDiscountsAmt 
                        ? ((answers.lastYearDiscountsAmt / answers.lastYearGrossFees) * 100).toFixed(1)
                        : '0.0'
                      }
                    </div>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Total discounts given to customers (percentage auto-calculated)
                </div>
              </div>

              {/* 3. Total Tax Prep Income (AUTO-CALCULATED DISPLAY) */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '140px', fontWeight: 500 }}>Total Tax Prep Income</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <div style={{ 
                      width: '140px', 
                      textAlign: 'right', 
                      padding: '0.5rem',
                      backgroundColor: '#f0f9ff',
                      border: '2px solid #93c5fd',
                      borderRadius: '4px',
                      fontWeight: 600,
                      color: '#1e40af'
                    }}>
                      {answers.lastYearGrossFees && answers.lastYearDiscountsAmt !== undefined
                        ? Math.round(answers.lastYearGrossFees - (answers.lastYearDiscountsAmt || 0)).toLocaleString()
                        : answers.lastYearGrossFees
                        ? Math.round(answers.lastYearGrossFees).toLocaleString()
                        : '—'
                      }
                    </div>
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  <strong>Auto-calculated:</strong> Gross Fees minus Discounts
                </div>
              </div>

              {/* NEW FIELD: Other Income */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '140px', fontWeight: 500 }}>Other Income</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 5,000"
                      value={answers.lastYearOtherIncome !== undefined ? answers.lastYearOtherIncome.toLocaleString() : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        if (rawValue === '') {
                          updateAnswers({ lastYearOtherIncome: undefined })
                        } else {
                          const parsedValue = parseFloat(rawValue)
                          updateAnswers({ lastYearOtherIncome: isNaN(parsedValue) ? undefined : parsedValue })
                        }
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  <strong>Optional:</strong> Additional revenue streams (bookkeeping, notary, etc.) - Enter 0 or leave blank if none
                </div>
              </div>

              {/* NEW FIELD: TaxRush Returns (Canada Only) */}
              {region === 'CA' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                      <input
                        type="number"
                        placeholder="e.g., 400"
                        value={answers.lastYearTaxRushReturns || ''}
                        onChange={e => {
                          const newValue = parseFloat(e.target.value) || undefined
                          updateAnswers({ lastYearTaxRushReturns: newValue })
                        }}
                        style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                      />
                    </div>
                  </div>
                  <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                    TaxRush returns filed last year (Canada only)
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Average Net Fee</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 125"
                      value={answers.avgNetFee ? answers.avgNetFee.toLocaleString() : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        updateAnswers({ avgNetFee: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Average fee per return after discounts
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                    <input
                      type="number"
                      placeholder="e.g., 1,600"
                      value={answers.taxPrepReturns || ''}
                      onChange={e => updateAnswers({ taxPrepReturns: parseFloat(e.target.value) || undefined })}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Number of tax returns completed
                </div>
              </div>

              {answers.region === 'CA' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={answers.taxRushReturns || ''}
                        onChange={e => updateAnswers({ taxRushReturns: parseFloat(e.target.value) || undefined })}
                        style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                      />
                    </div>
                  </div>
                  <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                    TaxRush returns completed (Canada only)
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Total Expenses</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 120,000"
                      value={answers.lastYearExpenses ? answers.lastYearExpenses.toLocaleString() : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        updateAnswers({ lastYearExpenses: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
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
                Total Revenue: ${(() => {
                  if (answers.avgNetFee && answers.taxPrepReturns) {
                    // Calculate from components for consistency with Page 2
                    const lastYearGrossFees = answers.avgNetFee * answers.taxPrepReturns
                    const lastYearDiscountsPct = answers.lastYearDiscountsPct || 3
                    const lastYearDiscountAmt = lastYearGrossFees * (lastYearDiscountsPct / 100)
                    const lastYearTaxPrepIncome = lastYearGrossFees - lastYearDiscountAmt
                    
                    const lastYearOtherIncome = answers.lastYearOtherIncome || 0
                    const lastYearTaxRushIncome = answers.region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns 
                      ? answers.avgNetFee * answers.lastYearTaxRushReturns : 0
                    const lastYearTotalRevenue = lastYearTaxPrepIncome + lastYearOtherIncome + lastYearTaxRushIncome
                    
                    console.log('🐛 BUG 1 FIX - COMPONENTS-BASED Total Revenue calculation:', {
                      avgNetFee: answers.avgNetFee,
                      taxPrepReturns: answers.taxPrepReturns,
                      grossFees: lastYearGrossFees,
                      discountsPct: lastYearDiscountsPct,
                      discountAmt: lastYearDiscountAmt,
                      taxPrepIncome: lastYearTaxPrepIncome,
                      otherIncome: lastYearOtherIncome,
                      taxRushIncome: lastYearTaxRushIncome,
                      totalRevenue: lastYearTotalRevenue
                    })
                    return Math.round(lastYearTotalRevenue).toLocaleString()
                  }
                  return '—'
                })()}
              </div>
            </div>
          </div>

        </>
      )}

      {/* NEW STORE SECTION */}
      {answers.storeType === 'new' && (
        <>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '0.5rem' }}>
              🏪 New Store Setup - Forecasting
            </div>
            <div className="small" style={{ color: '#0369a1' }}>
              Set your target performance goals below. These will be used for business planning and can be adjusted as you learn more about your market.
            </div>
          </div>

          {/* Target Performance Goals Box for New Stores */}
          <div style={{
            marginBottom: '1rem',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <div>
              <h4 style={{ 
                margin: '0 0 0.75rem 0', 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#374151',
                borderBottom: '2px solid #059669',
                paddingBottom: '0.25rem'
              }}>
                Target Performance Goals
              </h4>

              {/* Average Net Fee - Manual entry for new stores */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Average Net Fee</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 130"
                      value={answers.avgNetFee ? answers.avgNetFee.toLocaleString() : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        updateAnswers({ avgNetFee: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Your target average net fee per return
                </div>
              </div>

              {/* Tax Prep Returns - Manual entry for new stores */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                    <input
                      type="number"
                      placeholder="e.g., 1,680"
                      value={answers.taxPrepReturns || ''}
                      onChange={e => updateAnswers({ taxPrepReturns: parseFloat(e.target.value) || undefined })}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Your target number of tax returns
                </div>
              </div>

              {/* TaxRush Returns (Canada only) */}
              {answers.region === 'CA' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={answers.taxRushReturns || ''}
                        onChange={e => updateAnswers({ taxRushReturns: parseFloat(e.target.value) || undefined })}
                        style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                      />
                    </div>
                  </div>
                  <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                    Your target TaxRush returns (Canada only)
                  </div>
                </div>
              )}

              {/* Gross Tax Prep Fees - Auto-calculated */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Gross Tax Prep Fees</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      value={(() => {
                        if (answers.avgNetFee && answers.taxPrepReturns) {
                          const grossFees = Math.round(answers.avgNetFee * answers.taxPrepReturns)
                          return grossFees.toLocaleString()
                        }
                        return ''
                      })()}
                      readOnly
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', backgroundColor: '#f9fafb' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Auto-calculated: Average Net Fee × Tax Prep Returns
                </div>
              </div>

              {/* Total Expenses - Auto-calculated from gross fees */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Total Expenses</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      value={(() => {
                        if (answers.avgNetFee && answers.taxPrepReturns) {
                          const grossFees = answers.avgNetFee * answers.taxPrepReturns
                          const expenses = Math.round(grossFees * 0.76)
                          return expenses.toLocaleString()
                        }
                        return ''
                      })()}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        updateAnswers({ projectedExpenses: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  Industry standard: 76% of Gross Tax Prep Fees (you can override)
                </div>
              </div>

              {/* Summary for new stores */}
              {answers.avgNetFee && answers.taxPrepReturns && (
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: '#e0f2fe', 
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#0369a1'
                }}>
                  Target Net Income: ${(() => {
                    const grossFees = answers.avgNetFee * answers.taxPrepReturns
                    const expenses = grossFees * 0.76
                    const netIncome = grossFees - expenses
                    return Math.round(netIncome).toLocaleString()
                  })()}
                  <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                    Net Margin: 24% (industry standard)
                  </div>
                </div>
              )}
            </div>
          </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 130"
                      value={(() => {
                        if (answers.avgNetFee && answers.expectedGrowthPct !== undefined) {
                          const calculatedValue = Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
                          return calculatedValue.toLocaleString()
                        }
                        return answers.avgNetFee ? answers.avgNetFee.toLocaleString() : ''
                      })()}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        updateAnswers({ avgNetFee: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  {answers.avgNetFee && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    'Your projected average net fee per return'
                  }
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                    <input
                      type="number"
                      placeholder="e.g., 1,680"
                      value={
                        answers.taxPrepReturns && answers.expectedGrowthPct !== undefined 
                          ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                          : (answers.taxPrepReturns || '')
                      }
                      onChange={e => updateAnswers({ taxPrepReturns: parseFloat(e.target.value) || undefined })}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  {answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    'Your projected number of tax returns'
                  }
                </div>
              </div>

              {answers.region === 'CA' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={
                          answers.taxRushReturns && answers.expectedGrowthPct !== undefined 
                            ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
                            : (answers.taxRushReturns || '')
                        }
                        onChange={e => updateAnswers({ taxRushReturns: parseFloat(e.target.value) || undefined })}
                        style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                      />
                    </div>
                  </div>
                  <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                    {answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? 
                      `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                      'Your projected TaxRush returns (Canada only)'
                    }
                  </div>
                </div>
              )}

              {/* Gross Tax Prep Fees - MOVED HERE for logical flow (inputs → calculation → expenses) */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Gross Tax Prep Fees</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 220,000"
                      value={(() => {
                        if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
                          // Use same calculation as the fixed useEffect logic
                          const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                          const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                          const projectedGrossFees = projectedAvgNetFee * projectedTaxPrepReturns
                          
                          const discountsPct = answers.lastYearDiscountsPct || 3
                          const projectedDiscountAmt = projectedGrossFees * (discountsPct / 100)
                          const projectedTaxPrepIncome = projectedGrossFees - projectedDiscountAmt
                          
                          const lastYearOtherIncome = answers.lastYearOtherIncome || 0
                          const projectedOtherIncome = lastYearOtherIncome * (1 + answers.expectedGrowthPct / 100)
                          
                          const lastYearTaxRushIncome = answers.region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns 
                            ? answers.avgNetFee * answers.lastYearTaxRushReturns : 0
                          const projectedTaxRushIncome = lastYearTaxRushIncome * (1 + answers.expectedGrowthPct / 100)
                          
                          const calculatedRevenue = Math.round(projectedTaxPrepIncome + projectedOtherIncome + projectedTaxRushIncome)
                          return calculatedRevenue.toLocaleString()
                        }
                        return answers.expectedRevenue ? answers.expectedRevenue.toLocaleString() : ''
                      })()}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        const newValue = parseFloat(rawValue) || undefined
                        updateAnswers({ expectedRevenue: newValue })
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  {answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? 
                    `Components-based calculation: ($${Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))} ANF × ${Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))} returns) minus discounts` :
                    'Total revenue from all sources after applying growth to individual components'
                  }
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>Total Expenses</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                    <input
                      type="text"
                      placeholder="e.g., 130,000"
                      value={(() => {
                        // Calculate as 76% of Gross Tax Prep Fees (industry standard 75-77%)
                        if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined) {
                          const projectedAvgNetFee = Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
                          const projectedTaxPrepReturns = Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                          const grossTaxPrepFees = projectedAvgNetFee * projectedTaxPrepReturns
                          const industryStandardExpenses = Math.round(grossTaxPrepFees * 0.76) // 76% industry standard
                          return industryStandardExpenses.toLocaleString()
                        }
                        return answers.projectedExpenses !== undefined ? answers.projectedExpenses.toLocaleString() : ''
                      })()}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[,$]/g, '')
                        if (rawValue === '') {
                          updateAnswers({ projectedExpenses: undefined })
                        } else {
                          const parsedValue = parseFloat(rawValue)
                          const newValue = isNaN(parsedValue) ? undefined : parsedValue
                          console.log('🧙‍♂️ WELCOME - Total Expenses changed:', { oldValue: answers.projectedExpenses, newValue })
                          updateAnswers({ projectedExpenses: newValue })
                        }
                      }}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  {answers.avgNetFee && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? 
                    `Industry standard: 76% of Gross Tax Prep Fees above (you can override)` :
                    'Industry standard: ~76% of gross tax prep fees (calculated above)'
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
                Projected Revenue: ${(() => {
                  console.log('🐛 UI FIX 2 - Projected Revenue check:', {
                    expectedRevenue: answers.expectedRevenue,
                    projectedExpenses: answers.projectedExpenses,
                    hasExpectedRevenue: !!answers.expectedRevenue,
                    hasProjectedExpenses: !!answers.projectedExpenses
                  })
                  
                  if (answers.expectedRevenue && answers.projectedExpenses) {
                    const netProjectedRevenue = answers.expectedRevenue - answers.projectedExpenses
                    console.log('🐛 UI FIX 2 - Calculating Projected Revenue:', {
                      expectedRevenue: answers.expectedRevenue,
                      projectedExpenses: answers.projectedExpenses,
                      netProjectedRevenue: netProjectedRevenue
                    })
                    return Math.round(netProjectedRevenue).toLocaleString()
                  } else if (answers.expectedRevenue) {
                    // If we have expected revenue but no projected expenses, show the revenue
                    console.log('🐛 UI FIX 2 - Showing expected revenue (no expenses set):', answers.expectedRevenue)
                    return Math.round(answers.expectedRevenue).toLocaleString()
                  }
                  return '—'
                })()}
                {(() => {
                  if (answers.avgNetFee && answers.taxPrepReturns && answers.expectedRevenue) {
                    // Calculate last year total revenue from components for comparison
                    const lastYearGrossFees = answers.avgNetFee * answers.taxPrepReturns
                    const lastYearDiscountsPct = answers.lastYearDiscountsPct || 3
                    const lastYearDiscountAmt = lastYearGrossFees * (lastYearDiscountsPct / 100)
                    const lastYearTaxPrepIncome = lastYearGrossFees - lastYearDiscountAmt
                    
                    const lastYearOtherIncome = answers.lastYearOtherIncome || 0
                    const lastYearTaxRushIncome = answers.region === 'CA' && answers.avgNetFee && answers.lastYearTaxRushReturns 
                      ? answers.avgNetFee * answers.lastYearTaxRushReturns : 0
                    const lastYearTotalRevenue = lastYearTaxPrepIncome + lastYearOtherIncome + lastYearTaxRushIncome
                    
                    return (
                      <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                        ({answers.expectedRevenue > lastYearTotalRevenue ? '+' : ''}
                        {Math.round(((answers.expectedRevenue - lastYearTotalRevenue) / lastYearTotalRevenue) * 100)}% change)
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Educational Business Planning Feedback - CORRECTED TARGET COMPARISON */}
              {(() => {
                const adjustments = getAdjustmentStatus()
                const blendedGrowth = calculateBlendedGrowth()
                const originalGrowth = answers.expectedGrowthPct || 0
                const performance = calculatePerformanceVsTarget()
                
                // Only show if there are adjustments
                if (adjustments.length === 0) return null
                
                return (
                  <div style={{ 
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                      📊 Strategic vs. Tactical Analysis
                    </div>
                    
                    <div style={{ color: '#92400e', marginBottom: '0.5rem' }}>
                      <strong>Strategic Target:</strong> {originalGrowth > 0 ? '+' : ''}{originalGrowth}% growth on all metrics
                    </div>
                    
                    <div style={{ color: '#92400e', marginBottom: '0.5rem' }}>
                      <strong>Individual Field Performance:</strong>
                    </div>
                    
                    {adjustments.map((adj, idx) => (
                      <div key={idx} style={{ color: '#92400e', marginLeft: '1rem', marginBottom: '0.25rem' }}>
                        • <strong>{adj.field}:</strong> {adj.actualGrowth > 0 ? '+' : ''}{adj.actualGrowth}% 
                        ({adj.variance > 0 ? '+' : ''}{adj.variance}% {adj.variance > 0 ? 'above' : 'below'} target)
                      </div>
                    ))}
                    
                    <div style={{ 
                      color: '#92400e', 
                      marginTop: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid #f59e0b',
                      fontWeight: 'bold'
                    }}>
                      🎯 <strong>Target vs. Actual Performance:</strong>
                      
                      <div style={{ fontWeight: 'normal', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        💰 <strong>Revenue Performance:</strong><br/>
                        • Target: ${Math.round(performance.targetRevenue).toLocaleString()}<br/>
                        • Actual: ${Math.round(performance.actualRevenue).toLocaleString()}<br/>
                        • Variance: {performance.variance > 0 ? '+' : ''}{Math.round(performance.variance)}% 
                        {performance.variance > 0 ? 'above' : 'below'} target
                        
                        <br/><br/>
                        💸 <strong>Expense Control:</strong><br/>
                        • Strategic Target: ${Math.round(answers.expectedRevenue ? performance.actualRevenue - answers.expectedRevenue : 0).toLocaleString()}<br/>
                        • Current Page 2 Total: <em>Calculated on Page 2</em><br/>
                        • Status: <em>Review on Page 2 for detailed breakdown</em>
                      </div>
                      
                      <div style={{ 
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: performance.variance >= 0 ? '#d1fae5' : '#fee2e2',
                        borderRadius: '4px',
                        border: performance.variance >= 0 ? '1px solid #10b981' : '1px solid #ef4444'
                      }}>
                        {performance.variance >= 0 ? '🎉' : '⚠️'} <strong>
                          {performance.variance >= 0 ? 'Exceeding' : 'Missing'} your strategic target
                        </strong>
                      </div>
                    </div>
                    
                    <div className="small" style={{ 
                      color: '#a16207', 
                      marginTop: '0.5rem',
                      fontStyle: 'italic',
                      backgroundColor: '#fef9e7',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #fcd34d'
                    }}>
                      💡 <strong>Business Lesson:</strong> Revenue = Fee × Returns. Small individual shortfalls can compound into larger revenue misses. 
                      Strategic planning requires considering how metrics multiply, not just add together.
                    </div>
                  </div>
                )
              })()}
              
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
            🏪 New Store Setup - Forecasting
          </div>
          <div className="small" style={{ color: '#0369a1' }}>
            Set your target performance goals below. These will be used for business planning and can be adjusted as you learn more about your market.
          </div>
        </div>
      )}

      {/* Projected Performance Box - NOW AVAILABLE FOR BOTH NEW AND EXISTING STORES */}
      {answers.storeType && (
        <div style={{
          marginBottom: '1rem',
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        }}>
          <div>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: '#374151',
              borderBottom: '2px solid #059669',
              paddingBottom: '0.25rem'
            }}>
              {answers.storeType === 'existing' ? 'Projected Performance' : 'Target Performance Goals'}
            </h4>

            {/* Performance Change Slider - ONLY FOR EXISTING STORES */}
            {answers.storeType === 'existing' && (
              <div style={{ marginBottom: '1rem' }}>
                {/* Field Label, Input, and Dropdown - ALL INLINE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <label style={{ minWidth: '140px', fontWeight: 500 }}>Performance Change</label>
                  
                  {/* Direct percentage input - always visible */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <input
                      type="number"
                      step="1"
                      min="-50"
                      max="100"
                      value={answers.expectedGrowthPct || ''}
                      onChange={e => {
                        const value = parseInt(e.target.value)
                        console.log('🎛️ INLINE LAYOUT - Direct input changed:', { value })
                        updateAnswers({ expectedGrowthPct: isNaN(value) ? undefined : value })
                      }}
                      placeholder="0"
                      style={{ width: '70px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
                  </div>

                  {/* Dropdown INLINE with label and input */}
                  <select 
                    value={
                      answers.expectedGrowthPct !== undefined 
                        ? (growthOptions.find(opt => opt.value === answers.expectedGrowthPct) ? answers.expectedGrowthPct.toString() : 'custom')
                        : ''
                    }
                    style={{ 
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: 'white',
                      minWidth: '200px'
                    }}
                    onChange={e => {
                      const val = e.target.value
                      console.log('🎛️ INLINE LAYOUT - Dropdown changed:', { selectedValue: val })
                      
                      if (val === '' || val === 'custom') {
                        // Keep current value, don't override
                        console.log('🎛️ INLINE LAYOUT - Custom or empty selected, keeping current value')
                      } else {
                        updateAnswers({ expectedGrowthPct: parseFloat(val) })
                      }
                    }}
                  >
                    <option value="custom">Custom percentage</option>
                    {growthOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slider underneath for visual feedback and precision */}
                <div style={{ marginLeft: '100px', marginBottom: '0.5rem' }}>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    step="1"
                    value={answers.expectedGrowthPct || 0}
                    onChange={e => {
                      const value = parseInt(e.target.value)
                      console.log('🎛️ ALIGNED LAYOUT - Slider changed:', { value })
                      updateAnswers({ expectedGrowthPct: value })
                    }}
                    style={{
                      width: '280px',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Simplified instructional text */}
                <div className="small" style={{ marginLeft: '100px', opacity: 0.7 }}>
                  Enter percentage, use slider for precision, or select preset (+ growth, - decline)
                </div>
              </div>
            )}

            {/* Input Fields - CONDITIONAL LOGIC FOR NEW VS EXISTING STORES */}

            {/* Average Net Fee - Manual for new stores, calculated for existing */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '120px', fontWeight: 500 }}>Average Net Fee</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                  <input
                    type="text"
                    placeholder="e.g., 130"
                    value={(() => {
                      if (answers.storeType === 'existing' && answers.avgNetFee && answers.expectedGrowthPct !== undefined) {
                        const calculatedValue = Math.round(answers.avgNetFee * (1 + answers.expectedGrowthPct / 100))
                        return calculatedValue.toLocaleString()
                      }
                      return answers.avgNetFee ? answers.avgNetFee.toLocaleString() : ''
                    })()}
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[,$]/g, '')
                      const newValue = parseFloat(rawValue) || undefined
                      updateAnswers({ avgNetFee: newValue })
                    }}
                    style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                {answers.storeType === 'existing' && answers.avgNetFee && answers.expectedGrowthPct !== undefined ? 
                  `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                  answers.storeType === 'new' ? 
                    'Your target average net fee per return' :
                    'Your projected average net fee per return'
                }
              </div>
            </div>

            {/* Tax Prep Returns - Manual for new stores, calculated for existing */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '120px', fontWeight: 500 }}>Tax Prep Returns</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                  <input
                    type="number"
                    placeholder="e.g., 1,680"
                    value={
                      answers.storeType === 'existing' && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined 
                        ? Math.round(answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100))
                        : (answers.taxPrepReturns || '')
                    }
                    onChange={e => updateAnswers({ taxPrepReturns: parseFloat(e.target.value) || undefined })}
                    style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                {answers.storeType === 'existing' && answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? 
                  `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                  answers.storeType === 'new' ? 
                    'Your target number of tax returns' :
                    'Your projected number of tax returns'
                }
              </div>
            </div>

            {/* TaxRush Returns (Canada only) */}
            {answers.region === 'CA' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <label style={{ minWidth: '120px', fontWeight: 500 }}>TaxRush Returns</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>#</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={
                        answers.storeType === 'existing' && answers.taxRushReturns && answers.expectedGrowthPct !== undefined 
                          ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
                          : (answers.taxRushReturns || '')
                      }
                      onChange={e => updateAnswers({ taxRushReturns: parseFloat(e.target.value) || undefined })}
                      style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                    />
                  </div>
                </div>
                <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                  {answers.storeType === 'existing' && answers.taxRushReturns && answers.expectedGrowthPct !== undefined ? 
                    `Calculated from last year + ${answers.expectedGrowthPct}% growth (you can override)` :
                    answers.storeType === 'new' ? 
                      'Your target TaxRush returns (Canada only)' :
                      'Your projected TaxRush returns (Canada only)'
                  }
                </div>
              </div>
            )}

            {/* Gross Tax Prep Fees - Auto-calculated for both new and existing */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '120px', fontWeight: 500 }}>Gross Tax Prep Fees</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                  <input
                    type="text"
                    placeholder="e.g., 220,000"
                    value={(() => {
                      if (answers.avgNetFee && answers.taxPrepReturns) {
                        if (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined) {
                          // Existing store: apply growth
                          const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                          const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                          const grossFees = Math.round(projectedAvgNetFee * projectedTaxPrepReturns)
                          return grossFees.toLocaleString()
                        } else {
                          // New store: direct calculation
                          const grossFees = Math.round(answers.avgNetFee * answers.taxPrepReturns)
                          return grossFees.toLocaleString()
                        }
                      }
                      return answers.expectedRevenue ? answers.expectedRevenue.toLocaleString() : ''
                    })()}
                    readOnly
                    style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem', backgroundColor: '#f9fafb' }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                {answers.storeType === 'existing' ? 
                  'Auto-calculated: Average Net Fee × Tax Prep Returns (with growth applied)' :
                  'Auto-calculated: Average Net Fee × Tax Prep Returns'
                }
              </div>
            </div>

            {/* Total Expenses - Auto-calculated from gross fees */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <label style={{ minWidth: '120px', fontWeight: 500 }}>Total Expenses</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
                  <input
                    type="text"
                    placeholder="e.g., 130,000"
                    value={(() => {
                      if (answers.avgNetFee && answers.taxPrepReturns) {
                        let grossFees;
                        if (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined) {
                          const projectedAvgNetFee = answers.avgNetFee * (1 + answers.expectedGrowthPct / 100)
                          const projectedTaxPrepReturns = answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100)
                          grossFees = projectedAvgNetFee * projectedTaxPrepReturns
                        } else {
                          grossFees = answers.avgNetFee * answers.taxPrepReturns
                        }
                        const industryStandardExpenses = Math.round(grossFees * 0.76) // 76% industry standard
                        return industryStandardExpenses.toLocaleString()
                      }
                      return answers.projectedExpenses !== undefined ? answers.projectedExpenses.toLocaleString() : ''
                    })()}
                    onChange={e => {
                      const rawValue = e.target.value.replace(/[,$]/g, '')
                      if (rawValue === '') {
                        updateAnswers({ projectedExpenses: undefined })
                      } else {
                        const parsedValue = parseFloat(rawValue)
                        const newValue = isNaN(parsedValue) ? undefined : parsedValue
                        updateAnswers({ projectedExpenses: newValue })
                      }
                    }}
                    style={{ width: '140px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.5rem' }}
                  />
                </div>
              </div>
              <div className="small" style={{ marginTop: '0.25rem', marginLeft: '100px', opacity: 0.7 }}>
                Industry standard: 76% of Gross Tax Prep Fees (you can override for specific circumstances)
              </div>
            </div>

            {/* Summary for new stores */}
            {answers.storeType === 'new' && answers.avgNetFee && answers.taxPrepReturns && (
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: '#e0f2fe', 
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#0369a1'
              }}>
                Target Net Income: ${(() => {
                  const grossFees = answers.avgNetFee * answers.taxPrepReturns
                  const expenses = grossFees * 0.76
                  const netIncome = grossFees - expenses
                  return Math.round(netIncome).toLocaleString()
                })()}
                <div style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>
                  Net Margin: 24% (industry standard)
                </div>
              </div>
            )}
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