/**
 * Demo component showing how to integrate the suggestion system
 * This demonstrates the flow from input suggestions to calculated results
 */

import React, { useState, useMemo } from 'react'
import { Region } from '../../types'
import { WizardAnswers } from './types'
import SuggestedFormField, { 
  SuggestedCurrencyInput, 
  SuggestedNumberInput, 
  SuggestedPercentageInput 
} from './SuggestedFormField'
import FormSection from './FormSection'
import { 
  getSuggestionProfile, 
  calculateSuggestions 
} from '../../utils/suggestionEngine'

interface SuggestedInputDemoProps {
  answers: WizardAnswers
  updateAnswers: (updates: Partial<WizardAnswers>) => void
  region: Region
}

export default function SuggestedInputDemo({ 
  answers, 
  updateAnswers, 
  region 
}: SuggestedInputDemoProps) {
  
  // Get appropriate suggestion profile based on context
  const suggestionProfile = useMemo(() => {
    return getSuggestionProfile(
      region,
      answers.storeType || 'new',
      answers.handlesTaxRush || false
    )
  }, [region, answers.storeType, answers.handlesTaxRush])

  // Calculate suggestions that flow from inputs to results
  const suggestions = useMemo(() => {
    return calculateSuggestions(suggestionProfile, answers)
  }, [suggestionProfile, answers])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <FormSection
        title="💡 Income Drivers (With Suggestions)"
        icon="💰"
        description={`Suggestions based on: ${suggestionProfile.name}`}
      >
        
        {/* Input Fields - These drive calculations */}
        <SuggestedFormField
          label="Average Net Fee"
          helpText="Fee charged per tax return (before discounts)"
          fieldId="avgNetFee"
          suggestions={suggestions}
          required
        >
          <SuggestedCurrencyInput
            value={answers.avgNetFee}
            fieldId="avgNetFee"
            suggestions={suggestions}
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </SuggestedFormField>

        <SuggestedFormField
          label="Tax Prep Returns"
          helpText="Number of tax returns you plan to process"
          fieldId="taxPrepReturns"
          suggestions={suggestions}
          required
        >
          <SuggestedNumberInput
            value={answers.taxPrepReturns}
            fieldId="taxPrepReturns"
            suggestions={suggestions}
            prefix="#"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </SuggestedFormField>

        <SuggestedFormField
          label="Customer Discounts"
          helpText="Percentage discounts given to customers"
          fieldId="discountsPct"
          suggestions={suggestions}
        >
          <SuggestedPercentageInput
            value={answers.discountsPct}
            fieldId="discountsPct"
            suggestions={suggestions}
            max={20}
            onChange={(value) => updateAnswers({ discountsPct: value })}
          />
        </SuggestedFormField>

        {/* TaxRush fields for Canada */}
        {region === 'CA' && answers.handlesTaxRush && (
          <>
            <SuggestedFormField
              label="TaxRush Returns"
              helpText="Number of TaxRush returns (typically 15% of tax prep returns)"
              fieldId="taxRushReturns"
              suggestions={suggestions}
            >
              <SuggestedNumberInput
                value={answers.taxRushReturns}
                fieldId="taxRushReturns"
                suggestions={suggestions}
                prefix="#"
                onChange={(value) => updateAnswers({ taxRushReturns: value })}
              />
            </SuggestedFormField>

            <SuggestedFormField
              label="TaxRush Average Fee"
              helpText="Average fee per TaxRush return (usually lower than regular returns)"
              fieldId="taxRushAvgNetFee"
              suggestions={suggestions}
            >
              <SuggestedCurrencyInput
                value={answers.taxRushAvgNetFee}
                fieldId="taxRushAvgNetFee"
                suggestions={suggestions}
                onChange={(value) => updateAnswers({ taxRushAvgNetFee: value })}
              />
            </SuggestedFormField>
          </>
        )}

        {/* Other Income - conditional */}
        {answers.hasOtherIncome && (
          <SuggestedFormField
            label="Other Income"
            helpText="Additional revenue (bookkeeping, notary, etc.)"
            fieldId="otherIncome"
            suggestions={suggestions}
          >
            <SuggestedCurrencyInput
              value={answers.otherIncome}
              fieldId="otherIncome"
              suggestions={suggestions}
              onChange={(value) => updateAnswers({ otherIncome: value })}
            />
          </SuggestedFormField>
        )}

      </FormSection>

      <FormSection
        title="📊 Calculated Results (Flow Demonstration)"
        icon="🧮"
        description="These values are calculated from your inputs above - suggestions show the flow"
      >
        
        {/* Calculated Fields - These show the flow */}
        <SuggestedFormField
          label="Gross Fees"
          helpText="Total fees before discounts"
          fieldId="grossFees"
          suggestions={suggestions}
          isCalculated
        >
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '4px',
            fontWeight: 500,
            color: '#059669',
            width: '140px',
            textAlign: 'right'
          }}>
            ${suggestions.grossFees.toLocaleString()}
          </div>
        </SuggestedFormField>

        <SuggestedFormField
          label="Discount Amount"
          helpText="Dollar amount of discounts given"
          fieldId="discountAmount"
          suggestions={suggestions}
          isCalculated
        >
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            fontWeight: 500,
            color: '#dc2626',
            width: '140px',
            textAlign: 'right'
          }}>
            -${suggestions.discountAmount.toLocaleString()}
          </div>
        </SuggestedFormField>

        <SuggestedFormField
          label="Tax Prep Income"
          helpText="Net income after discounts"
          fieldId="taxPrepIncome"
          suggestions={suggestions}
          isCalculated
        >
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '4px',
            fontWeight: 500,
            color: '#2563eb',
            width: '140px',
            textAlign: 'right'
          }}>
            ${suggestions.taxPrepIncome.toLocaleString()}
          </div>
        </SuggestedFormField>

        {region === 'CA' && answers.handlesTaxRush && suggestions.taxRushIncome > 0 && (
          <SuggestedFormField
            label="TaxRush Income"
            helpText="Revenue from TaxRush returns"
            fieldId="taxRushIncome"
            suggestions={suggestions}
            isCalculated
          >
            <div style={{
              padding: '0.5rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '4px',
              fontWeight: 500,
              color: '#0369a1',
              width: '140px',
              textAlign: 'right'
            }}>
              ${suggestions.taxRushIncome.toLocaleString()}
            </div>
          </SuggestedFormField>
        )}

        <SuggestedFormField
          label="Total Revenue"
          helpText="All income sources combined"
          fieldId="totalRevenue"
          suggestions={suggestions}
          isCalculated
        >
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '4px',
            fontWeight: 600,
            color: '#15803d',
            width: '140px',
            textAlign: 'right',
            fontSize: '1rem'
          }}>
            ${suggestions.totalRevenue.toLocaleString()}
          </div>
        </SuggestedFormField>

      </FormSection>

      {/* Educational Summary */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '1rem',
        fontSize: '0.875rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontWeight: 600 }}>
          🎓 How This Works
        </h4>
        <div style={{ color: '#475569', lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Suggestion Flow:</strong> Input field suggestions → Calculated result suggestions
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>💡 Blue badges:</strong> Suggested input values based on {suggestionProfile.name}
          </p>
          <p style={{ margin: '0' }}>
            <strong>📊 Blue badges:</strong> Calculated results showing how inputs flow to outcomes
          </p>
        </div>
      </div>

    </div>
  )
}
