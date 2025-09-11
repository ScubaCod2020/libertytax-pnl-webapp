// InputsPanel.tsx - Dashboard inputs mirroring wizard Page 2 structure
// Bidirectional data flow between wizard and dashboard

import React, { useEffect } from 'react'
import type { Region } from '../lib/calcs'
import type { Scenario } from '../data/presets'
import type { WizardAnswers } from './Wizard/types'
import { 
  expenseFields, 
  expenseCategories,
  getFieldsByCategory,
  getFieldsForRegion,
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

  // Bidirectional persistence functions
  onSaveToWizard?: (updates: Partial<WizardAnswers>) => void

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
    taxRushRoyaltiesPct, setTaxRushRoy, miscPct, setMisc, onSaveToWizard
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
  const getFieldValue = (field: any) => {
    const fieldMap: any = {
      salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
      localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt,
      bankFeesAmt, maintenanceAmt, travelEntAmt, royaltiesPct,
      advRoyaltiesPct, taxRushRoyaltiesPct, miscPct
    }
    return fieldMap[field.id] ?? field.defaultValue
  }

  const setFieldValue = (field: any, value: number) => {
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

  // Render expense field input (compact dashboard version)
  const renderExpenseField = (field: any) => {
    const value = getFieldValue(field)
    const isFixed = field.calculationBase === 'fixed_amount'
    const isDisabled = field.regionSpecific === 'CA' && region !== 'CA'
    const isTaxRushField = field.id === 'taxRushRoyaltiesPct'
    
    // Style for TaxRush fields (blue boxed)
    const fieldStyle = isTaxRushField ? {
      border: '2px solid #3b82f6',
      borderRadius: '6px',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      marginBottom: '0.5rem'
    } : { marginBottom: '0.5rem' }

    return (
      <div key={field.id} style={fieldStyle}>
        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 500 }}>{field.label}:</span>
          {isFixed ? ' $' : ' %'}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setFieldValue(field, Number(e.target.value))}
          min={field.min}
          max={field.max}
          step={field.step}
          disabled={isDisabled}
          style={{
            width: '100%',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            fontSize: '0.9rem',
            backgroundColor: isDisabled ? '#f3f4f6' : isTaxRushField ? '#f0f9ff' : 'white'
          }}
        />
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

      {/* Scenario Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          Scenario:&nbsp;
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
            aria-label="Scenario"
          >
            <option value="Custom">Custom</option>
            <option value="Good">Good</option>
            <option value="Better">Better</option>
            <option value="Best">Best</option>
          </select>
        </label>
      </div>

      {/* 💰 Income Drivers Section - Matching Wizard Page 2 */}
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

        {/* Average Net Fee */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>
            Average Net Fee: $
          </label>
          <input
            type="number"
            value={avgNetFee}
            onChange={(e) => setANF(Number(e.target.value))}
            min="1"
            max="1000"
            step="1"
            style={{
              width: '100%',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Tax-Prep Returns */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>
            Tax-Prep Returns: #
          </label>
          <input
            type="number"
            value={taxPrepReturns}
            onChange={(e) => setReturns(Number(e.target.value))}
            min="0"
            step="1"
            style={{
              width: '100%',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* TaxRush Returns - Blue Boxed for Canada */}
        {region === 'CA' && (
          <div style={{
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            marginBottom: '1rem'
          }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>
              TaxRush Returns: #
            </label>
            <input
              type="number"
              value={taxRushReturns}
              onChange={(e) => setTaxRush(Number(e.target.value))}
              min="0"
              step="1"
              style={{
                width: '100%',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
                backgroundColor: '#f0f9ff'
              }}
            />
          </div>
        )}

        {/* Discounts */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>
            Discounts: %
          </label>
          <input
            type="number"
            value={discountsPct}
            onChange={(e) => setDisc(Number(e.target.value))}
            min="0"
            max="50"
            step="0.1"
            style={{
              width: '100%',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* Expense Management Sections - Matching Wizard Page 2 */}
      {(['personnel', 'facility', 'operations', 'franchise', 'misc'] as ExpenseCategory[]).map(category => {
        const categoryFields = getFieldsByCategory(getFieldsForRegion(expenseFields, region), category)
        if (categoryFields.length === 0) return null

        return (
          <div key={category} style={{ 
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
              {getCategoryIcon(category)} {expenseCategories[category].label}
              <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7, marginLeft: '0.5rem' }}>
                ({categoryFields.length} {categoryFields.length === 1 ? 'field' : 'fields'})
              </span>
            </div>
            
            <div style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.8, fontStyle: 'italic' }}>
              {expenseCategories[category].description}
            </div>
            
            <div>
              {categoryFields.map(renderExpenseField)}
            </div>
          </div>
        )
      })}
    </div>
  )
}