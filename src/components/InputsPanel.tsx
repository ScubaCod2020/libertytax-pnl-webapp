// InputsPanel.tsx - Dashboard inputs mirroring wizard Page 2 structure
// Enhanced with sliders and bidirectional wizard data flow

import React, { useEffect } from 'react'
import type { Region } from '../lib/calcs'
import type { Scenario } from '../data/presets'
import type { WizardAnswers } from './Wizard/types'
import { 
  expenseFields, 
  expenseCategories,
  getFieldsByCategory,
  getFieldsForRegion,
  type ExpenseField,
  type ExpenseCategory 
} from '../types/expenses'

interface InputsPanelProps {
  // Basic fields
  region: Region
  scenario: Scenario
  setScenario: (scenario: Scenario) => void
  avgNetFee: number
  setANF: (value: number) => void
  taxPrepReturns: number
  setReturns: (value: number) => void
  taxRushReturns: number
  setTaxRush: (value: number) => void
  discountsPct: number
  setDisc: (value: number) => void

  // All 17 expense fields
  salariesPct: number
  setSal: (value: number) => void
  empDeductionsPct: number
  setEmpDeductions: (value: number) => void
  rentPct: number
  setRent: (value: number) => void
  telephoneAmt: number
  setTelephone: (value: number) => void
  utilitiesAmt: number
  setUtilities: (value: number) => void
  localAdvAmt: number
  setLocalAdv: (value: number) => void
  insuranceAmt: number
  setInsurance: (value: number) => void
  postageAmt: number
  setPostage: (value: number) => void
  suppliesPct: number
  setSup: (value: number) => void
  duesAmt: number
  setDues: (value: number) => void
  bankFeesAmt: number
  setBankFees: (value: number) => void
  maintenanceAmt: number
  setMaintenance: (value: number) => void
  travelEntAmt: number
  setTravelEnt: (value: number) => void
  royaltiesPct: number
  setRoy: (value: number) => void
  advRoyaltiesPct: number
  setAdvRoy: (value: number) => void
  taxRushRoyaltiesPct: number
  setTaxRushRoy: (value: number) => void
  miscPct: number
  setMisc: (value: number) => void

  // Bidirectional persistence functions
  onSaveToWizard?: (updates: Partial<WizardAnswers>) => void
  
  // TaxRush handling for expense field filtering
  handlesTaxRush?: boolean
}

export default function InputsPanel(props: InputsPanelProps) {
  const {
    region, scenario, setScenario, avgNetFee, setANF, taxPrepReturns, setReturns,
    taxRushReturns, setTaxRush, discountsPct, setDisc,
    salariesPct, setSal, empDeductionsPct, setEmpDeductions, rentPct, setRent,
    telephoneAmt, setTelephone, utilitiesAmt, setUtilities, localAdvAmt, setLocalAdv,
    insuranceAmt, setInsurance, postageAmt, setPostage, suppliesPct, setSup,
    duesAmt, setDues, bankFeesAmt, setBankFees, maintenanceAmt, setMaintenance,
    travelEntAmt, setTravelEnt, royaltiesPct, setRoy, advRoyaltiesPct, setAdvRoy,
    taxRushRoyaltiesPct, setTaxRushRoy, miscPct, setMisc, onSaveToWizard,
    handlesTaxRush = false
  } = props

  // 🔄 BIDIRECTIONAL FLOW: Save dashboard changes back to wizard persistence
  useEffect(() => {
    if (onSaveToWizard) {
      const wizardUpdates: Partial<WizardAnswers> = {
        avgNetFee,
        taxPrepReturns,
        taxRushReturns,
        discountsPct,
        // Expense fields
        salariesPct,
        empDeductionsPct,
        rentPct,
        telephoneAmt,
        utilitiesAmt,
        localAdvAmt,
        insuranceAmt,
        postageAmt,
        suppliesPct,
        duesAmt,
        bankFeesAmt,
        maintenanceAmt,
        travelEntAmt,
        royaltiesPct,
        advRoyaltiesPct,
        taxRushRoyaltiesPct,
        miscPct
      }
      
      console.log('🔄 Dashboard → Wizard: Saving changes to wizard persistence', wizardUpdates)
      onSaveToWizard(wizardUpdates)
    }
  }, [
    avgNetFee, taxPrepReturns, taxRushReturns, discountsPct,
    salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
    localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt,
    bankFeesAmt, maintenanceAmt, travelEntAmt, royaltiesPct,
    advRoyaltiesPct, taxRushRoyaltiesPct, miscPct, onSaveToWizard
  ])

  // Expense field value getters and setters mapping
  const getFieldValue = (field: ExpenseField) => {
    const fieldMap: any = {
      salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
      localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt,
      bankFeesAmt, maintenanceAmt, travelEntAmt, royaltiesPct,
      advRoyaltiesPct, taxRushRoyaltiesPct, miscPct
    }
    return fieldMap[field.id] ?? field.defaultValue
  }

  const setFieldValue = (field: ExpenseField, value: number) => {
    const setterMap: any = {
      salariesPct: setSal, empDeductionsPct: setEmpDeductions, rentPct: setRent,
      telephoneAmt: setTelephone, utilitiesAmt: setUtilities, localAdvAmt: setLocalAdv,
      insuranceAmt: setInsurance, postageAmt: setPostage, suppliesPct: setSup,
      duesAmt: setDues, bankFeesAmt: setBankFees, maintenanceAmt: setMaintenance,
      travelEntAmt: setTravelEnt, royaltiesPct: setRoy, advRoyaltiesPct: setAdvRoy,
      taxRushRoyaltiesPct: setTaxRushRoy, miscPct: setMisc
    }
    setterMap[field.id]?.(value)
  }

  // Get category icon (matching wizard)
  const getCategoryIcon = (category: ExpenseCategory): string => {
    switch (category) {
      case 'personnel': return '👥'
      case 'facility': return '🏢'
      case 'operations': return '⚙️'
      case 'franchise': return '🏪'
      case 'misc': return '📝'
      default: return '📊'
    }
  }

  // Calculate gross fees for discount calculation
  const grossFees = avgNetFee * taxPrepReturns
  const discountDollarAmount = grossFees * (discountsPct / 100)

  // Handle discount percentage/dollar changes
  const handleDiscountPctChange = (newPct: number) => {
    setDisc(Math.max(0, Math.min(50, newPct)))
  }

  const handleDiscountDollarChange = (newDollar: number) => {
    const validDollar = Math.max(0, newDollar)
    if (grossFees > 0) {
      const newPct = (validDollar / grossFees) * 100
      setDisc(Math.max(0, Math.min(50, newPct)))
    }
  }

  // Render expense field with dual percentage/dollar inputs and slider (enhanced for dashboard)
  const renderExpenseFieldWithSlider = (field: ExpenseField) => {
    const value = getFieldValue(field)
    const isFixed = field.calculationBase === 'fixed_amount'
    const isDisabled = field.regionSpecific === 'CA' && region !== 'CA'
    const isTaxRushField = field.id === 'taxRushRoyaltiesPct'
    const isFranchiseRoyalty = field.category === 'franchise' && field.id.includes('oyalties')
    const isLocked = isFranchiseRoyalty // Franchise royalties are locked
    
    // Calculate dollar value for percentage-based fields
    let dollarValue = 0
    if (!isFixed) {
      if (field.calculationBase === 'percentage_gross') {
        dollarValue = Math.round(grossFees * value / 100)
      } else if (field.calculationBase === 'percentage_tp_income') {
        const taxPrepIncome = grossFees - discountDollarAmount
        dollarValue = Math.round(taxPrepIncome * value / 100)
      } else if (field.calculationBase === 'percentage_salaries') {
        const salariesAmount = grossFees * salariesPct / 100
        dollarValue = Math.round(salariesAmount * value / 100)
      }
    }

    const handlePercentageChange = (newPercentage: number) => {
      const validPercentage = Math.max(0, Math.min(100, newPercentage))
      setFieldValue(field, validPercentage)
    }

    const handleDollarChange = (newDollar: number) => {
      const validDollar = Math.max(0, newDollar)
      if (isFixed) {
        setFieldValue(field, validDollar)
      } else {
        let base = 0
        if (field.calculationBase === 'percentage_gross') {
          base = grossFees
        } else if (field.calculationBase === 'percentage_tp_income') {
          base = grossFees - discountDollarAmount
        } else if (field.calculationBase === 'percentage_salaries') {
          base = grossFees * salariesPct / 100
        }
        
        if (base > 0) {
          const newPercentage = Math.round(validDollar / base * 100)
          const cappedPercentage = Math.max(0, Math.min(100, newPercentage))
          setFieldValue(field, cappedPercentage)
        }
      }
    }
    
    // Style for TaxRush fields (blue boxed)
    const fieldStyle = isTaxRushField ? {
      border: '2px solid #3b82f6',
      borderRadius: '6px',
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      marginBottom: '0.75rem'
    } : { marginBottom: '0.75rem' }

    return (
      <div key={field.id} style={fieldStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: isLocked ? '#6b7280' : 'inherit' }}>
            {field.label}
            {isLocked && ' (Locked)'}
          </label>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {field.description && (
              <button
                type="button"
                title={field.description}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'help',
                  fontSize: '0.8rem',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ℹ️
              </button>
            )}
            {/* Percentage/Fixed Amount Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isFixed && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>}
              <input
                type="number"
                min="0"
                max={isFixed ? undefined : 100}
                step="1"
                value={value}
                onChange={(e) => handlePercentageChange(Number(e.target.value) || 0)}
                disabled={isDisabled || isLocked}
                title={`${field.label} ${isFixed ? 'amount' : 'percentage'}`}
                aria-label={`${field.label} ${isFixed ? 'amount' : 'percentage'}`}
                style={{
                  width: '60px',
                  padding: '0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  textAlign: 'right',
                  backgroundColor: isDisabled ? '#f3f4f6' : isTaxRushField ? '#f0f9ff' : 'white'
                }}
              />
              {!isFixed && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>%</span>}
            </div>

            {/* Dollar Input - only for percentage-based fields */}
            {!isFixed && !isLocked && (
              <>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>=</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={dollarValue || ''}
                    onChange={(e) => handleDollarChange(Number(e.target.value) || 0)}
                    disabled={isDisabled || grossFees === 0}
                    title={`${field.label} dollar amount`}
                    aria-label={`${field.label} dollar amount`}
                    placeholder="0"
                    style={{
                      width: '80px',
                      padding: '0.25rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      textAlign: 'right',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Slider for percentage-based fields */}
        {!isFixed && !isLocked && (
          <input
            type="range"
            min="0"
            max={Math.min(field.max, 50)} // Cap at reasonable max
            step={field.step}
            value={value}
            onChange={(e) => handlePercentageChange(Number(e.target.value))}
            disabled={isDisabled}
            title={`${field.label}: ${value}% ($${dollarValue.toLocaleString()}) - Range: 0% - ${Math.min(field.max, 50)}%`}
            aria-label={`${field.label} slider`}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
        )}
      </div>
    )
  }

  // Render expense field with dual percentage/dollar inputs (matching wizard Page 2)
  const renderExpenseField = (field: ExpenseField) => {
    const value = getFieldValue(field)
    const isFixed = field.calculationBase === 'fixed_amount'
    const isDisabled = field.regionSpecific === 'CA' && region !== 'CA'
    const isTaxRushField = field.id === 'taxRushRoyaltiesPct'
    const isFranchiseRoyalty = field.category === 'franchise' && field.id.includes('oyalties')
    const isLocked = isFranchiseRoyalty // Franchise royalties are locked
    
    // Calculate dollar value for percentage-based fields
    let dollarValue = 0
    if (!isFixed) {
      if (field.calculationBase === 'percentage_gross') {
        dollarValue = Math.round(grossFees * value / 100)
      } else if (field.calculationBase === 'percentage_tp_income') {
        const taxPrepIncome = grossFees - discountDollarAmount
        dollarValue = Math.round(taxPrepIncome * value / 100)
      } else if (field.calculationBase === 'percentage_salaries') {
        const salariesAmount = grossFees * salariesPct / 100
        dollarValue = Math.round(salariesAmount * value / 100)
      }
    }

    const handlePercentageChange = (newPercentage: number) => {
      const validPercentage = Math.max(0, Math.min(100, newPercentage))
      setFieldValue(field, validPercentage)
    }

    const handleDollarChange = (newDollar: number) => {
      const validDollar = Math.max(0, newDollar)
      if (isFixed) {
        setFieldValue(field, validDollar)
      } else {
        let base = 0
        if (field.calculationBase === 'percentage_gross') {
          base = grossFees
        } else if (field.calculationBase === 'percentage_tp_income') {
          base = grossFees - discountDollarAmount
        } else if (field.calculationBase === 'percentage_salaries') {
          base = grossFees * salariesPct / 100
        }
        
        if (base > 0) {
          const newPercentage = Math.round(validDollar / base * 100)
          const cappedPercentage = Math.max(0, Math.min(100, newPercentage))
          setFieldValue(field, cappedPercentage)
        }
      }
    }
    
    // Style for TaxRush fields (blue boxed)
    const fieldStyle = isTaxRushField ? {
      border: '2px solid #3b82f6',
      borderRadius: '6px',
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      marginBottom: '0.75rem'
    } : { marginBottom: '0.75rem' }

    return (
      <div key={field.id} style={fieldStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: isLocked ? '#6b7280' : 'inherit' }}>
            {field.label}
            {isLocked && ' (Locked)'}
          </label>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Percentage/Fixed Amount Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isFixed && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>}
              <input
                type="number"
                min="0"
                max={isFixed ? undefined : 100}
                step="1"
                value={value}
                onChange={(e) => handlePercentageChange(Number(e.target.value) || 0)}
                disabled={isDisabled || isLocked}
                title={`${field.label} ${isFixed ? 'amount' : 'percentage'}`}
                aria-label={`${field.label} ${isFixed ? 'amount' : 'percentage'}`}
                style={{
                  width: '60px',
                  padding: '0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  textAlign: 'right',
                  backgroundColor: isDisabled ? '#f3f4f6' : isTaxRushField ? '#f0f9ff' : 'white'
                }}
              />
              {!isFixed && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>%</span>}
            </div>

            {/* Dollar Input - only for percentage-based fields */}
            {!isFixed && !isLocked && (
              <>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>=</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={dollarValue || ''}
                    onChange={(e) => handleDollarChange(Number(e.target.value) || 0)}
                    disabled={isDisabled || grossFees === 0}
                    title={`${field.label} dollar amount`}
                    aria-label={`${field.label} dollar amount`}
                    placeholder="0"
                    style={{
                      width: '80px',
                      padding: '0.25rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      textAlign: 'right',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {field.description && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {field.description}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card" style={{ minWidth: '420px', maxWidth: '500px' }}>
      <div className="card-title">Inputs</div>

      {/* Scenario Selector - IMPORTANT for post-wizard adjustments */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <strong>Scenario:</strong>&nbsp;
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
            aria-label="Scenario"
            style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
          >
            <option value="Custom">Custom</option>
            <option value="Good">Good</option>
            <option value="Better">Better</option>
            <option value="Best">Best</option>
          </select>
        </label>
      </div>

      {/* 💰 Income Drivers Section - Enhanced with sliders */}
      <div style={{ 
        marginBottom: '1.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1rem',
          fontWeight: 600,
          color: '#059669',
          fontSize: '1.1rem',
          borderBottom: '2px solid #059669',
          paddingBottom: '0.25rem'
        }}>
          💰 Income Drivers
        </div>

        {/* Average Net Fee with Manual Input + Slider */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Average Net Fee
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>
              <input
                type="number"
                min="50"
                max="500"
                step="1"
                value={avgNetFee}
                onChange={(e) => setANF(Number(e.target.value) || 50)}
                title="Average Net Fee"
                aria-label="Average Net Fee"
                placeholder="125"
                style={{
                  width: '80px',
                  padding: '0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  textAlign: 'right'
                }}
              />
            </div>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="1"
            value={avgNetFee}
            onChange={(e) => setANF(Number(e.target.value))}
            title={`Average Net Fee: $${avgNetFee} (Range: $50 - $500)`}
            aria-label="Average Net Fee slider"
            style={{ width: '100%' }}
          />
        </div>

        {/* Tax-Prep Returns with Manual Input + Slider */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Tax-Prep Returns
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>#</span>
              <input
                type="number"
                min="100"
                max="10000"
                step="1"
                value={taxPrepReturns}
                onChange={(e) => setReturns(Number(e.target.value) || 100)}
                title="Tax Prep Returns"
                aria-label="Tax Prep Returns"
                placeholder="1600"
                style={{
                  width: '100px',
                  padding: '0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  textAlign: 'right'
                }}
              />
            </div>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="1"
            value={taxPrepReturns}
            onChange={(e) => setReturns(Number(e.target.value))}
            title={`Tax-Prep Returns: ${taxPrepReturns.toLocaleString()} (Range: 100 - 5,000)`}
            aria-label="Tax Prep Returns slider"
            style={{ width: '100%' }}
          />
        </div>

        {/* TaxRush Returns - Blue Boxed for Canada with Slider */}
        {region === 'CA' && (
          <div style={{
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                TaxRush Returns
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>#</span>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={taxRushReturns}
                  onChange={(e) => setTaxRush(Number(e.target.value) || 0)}
                  title="TaxRush Returns"
                  aria-label="TaxRush Returns"
                  placeholder="0"
                  style={{
                    width: '80px',
                    padding: '0.25rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textAlign: 'right',
                    backgroundColor: '#f0f9ff'
                  }}
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="1"
              value={taxRushReturns}
              onChange={(e) => setTaxRush(Number(e.target.value))}
              title={`TaxRush Returns: ${taxRushReturns.toLocaleString()} (Range: 0 - 1,000)`}
              aria-label="TaxRush Returns slider"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Customer Discounts - Dual Dollar/Percentage with Slider */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Customer Discounts
            </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.1"
                          value={discountsPct || ''}
                          onChange={(e) => handleDiscountPctChange(Number(e.target.value) || 0)}
                          title="Customer Discounts Percentage"
                          aria-label="Customer Discounts Percentage"
                          placeholder="3"
                          style={{
                            width: '60px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            textAlign: 'right'
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>%</span>
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>=</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={Math.round(discountDollarAmount) || ''}
                          onChange={(e) => handleDiscountDollarChange(Number(e.target.value) || 0)}
                          title="Customer Discounts Dollar Amount"
                          aria-label="Customer Discounts Dollar Amount"
                          placeholder="0"
                          style={{
                            width: '80px',
                            padding: '0.25rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            textAlign: 'right',
                            backgroundColor: '#f9fafb'
                          }}
                        />
                      </div>
                    </div>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="1"
            value={discountsPct}
            onChange={(e) => handleDiscountPctChange(Number(e.target.value))}
            title={`Customer Discounts: ${discountsPct}% ($${Math.round(discountDollarAmount).toLocaleString()}) - Range: 0% - 25%`}
            aria-label="Customer Discounts slider"
            style={{ width: '100%' }}
          />
        </div>
      </div>


      {/* Expense Management Section - Flattened like Income Drivers */}
      <div style={{ 
        marginBottom: '1.5rem',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1rem',
          fontWeight: 600,
          color: '#6b7280',
          fontSize: '1.1rem',
          borderBottom: '2px solid #6b7280',
          paddingBottom: '0.25rem'
        }}>
          📊 Expense Management
        </div>
        
        <div>
          {(() => {
            // Get all expense fields filtered by region and TaxRush
            const allExpenseFields = expenseFields.filter(field => {
              // First filter by region
              const regionMatch = !field.regionSpecific || field.regionSpecific === region || field.regionSpecific === 'both'
              if (!regionMatch) return false
              
              // Then filter out TaxRush-related fields if handlesTaxRush is false
              const isTaxRushField = field.id === 'taxRushRoyaltiesPct' || field.id === 'taxRushShortagesPct'
              if (isTaxRushField && handlesTaxRush === false) return false
              
              return true
            })
            
            // Debug logging
            console.log('🔍 All Expense Fields:', {
              region,
              handlesTaxRush,
              totalFields: expenseFields.length,
              filteredFields: allExpenseFields.length,
              fieldIds: allExpenseFields.map(f => f.id)
            })
            
            return allExpenseFields.map(renderExpenseFieldWithSlider)
          })()}
        </div>
      </div>
    </div>
  )
}