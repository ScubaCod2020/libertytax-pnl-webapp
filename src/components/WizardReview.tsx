// WizardReview.tsx - Report generation and wizard data compilation
// Print-friendly summary for Excel export and final wizard completion

import React from 'react'
import { 
  expenseFields, 
  expenseCategories,
  getFieldsByCategory,
  getFieldsForRegion,
  getFieldById,
  type ExpenseCategory 
} from '../types/expenses'
import type { WizardAnswers } from './Wizard/types'
import { formatCurrency } from './Wizard/calculations'

// Import brand assets from centralized system
import { US_ASSETS, CA_ASSETS } from '../assets/brands'

interface WizardReviewProps {
  answers: WizardAnswers
  onNext: () => void
  onBack: () => void
}

export default function WizardReview({ answers, onNext, onBack }: WizardReviewProps) {
  
  // Add print-specific styles to hide site elements
  React.useEffect(() => {
    const printStyles = document.createElement('style')
    printStyles.innerHTML = `
      @media print {
        /* Hide all site elements except the report */
        body * { visibility: hidden !important; }
        [data-print-report], [data-print-report] * { visibility: visible !important; }
        
        /* Hide site header, navigation, and UI elements */
        header, nav, .header, .navbar, .site-header { display: none !important; }
        .wizard-nav, .btn-secondary, .btn-primary, .export-buttons, .wizard-completion { display: none !important; }
        .small, p.small { display: none !important; }
        
        /* Reset body and page layout */
        html, body { 
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        /* Position report as main content */
        [data-print-report] {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0.6in 0.75in !important;
          background: white !important;
          font-family: "Times New Roman", serif !important;
          font-size: 10pt !important;
          line-height: 1.25 !important;
          color: black !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        /* Professional document styling for print */
        @media print {
          /* Force Times New Roman everywhere */
          *, *::before, *::after {
            font-family: "Times New Roman", serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Hide all web elements completely */
          body > *:not([data-print-report]) { display: none !important; }
          
          /* Professional document spacing - much tighter */
          h1, h2, h3 {
            font-family: "Times New Roman", serif !important;
            page-break-after: avoid !important;
            margin-bottom: 8pt !important;
            margin-top: 6pt !important;
          }
          
          h2 { 
            font-size: 14pt !important; 
            margin-bottom: 6pt !important;
          }
          
          h3 { 
            font-size: 12pt !important; 
            margin-bottom: 4pt !important;
            margin-top: 12pt !important;
          }
          
          /* Compact table styling */
          table {
            font-size: 9pt !important;
            border-collapse: collapse !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            margin-bottom: 8pt !important;
          }
          
          th, td {
            border: 0.5pt solid #333 !important;
            padding: 3pt 5pt !important;
            vertical-align: top !important;
          }
          
          th {
            background-color: #f8f8f8 !important;
            font-weight: bold !important;
            font-size: 9pt !important;
          }
          
          /* Remove all web-specific elements */
          .export-buttons,
          .wizard-completion,
          .wizard-nav,
          .debug-panel,
          .header,
          .footer,
          button:not([data-print-keep]) {
            display: none !important;
          }
          
          /* Compact professional margins */
          .management-checklist {
            margin-top: 14pt !important;
            page-break-inside: avoid !important;
          }
          
          /* Tighter list formatting */
          ul, ol {
            margin: 3pt 0 6pt 0 !important;
            padding-left: 18pt !important;
          }
          
          li {
            margin-bottom: 1pt !important;
            font-size: 9pt !important;
          }
          
          /* Professional logo sizing */
          img {
            max-height: 32pt !important;
            max-width: 180pt !important;
          }
          
          /* Configuration summary - more compact */
          .config-summary {
            margin-bottom: 6pt !important;
            font-size: 9pt !important;
          }
          
          /* Remove all margins from containers */
          div, section {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          /* Page break controls */
          .page-break-before { page-break-before: always !important; }
          .page-break-avoid { page-break-inside: avoid !important; }
          
          /* Force document-style paragraph spacing */
          p { 
            margin: 2pt 0 4pt 0 !important; 
            font-size: 9pt !important;
          }
        }
        
        /* Optimize colors for print */
        * { 
          -webkit-print-color-adjust: exact !important; 
          color-adjust: exact !important;
        }
        
        /* Professional page styling */
        @page {
          size: letter;
          margin: 0.5in;
        }
        
        /* Table improvements for print */
        table { 
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        /* Logo sizing for print */
        img { 
          max-height: 40px !important;
          max-width: 200px !important;
        }
        
        /* Page break controls */
        .page-break-before { page-break-before: always !important; }
        .page-break-avoid { page-break-inside: avoid !important; }
        
        /* Management checklist formatting */
        .management-checklist {
          page-break-inside: avoid !important;
          margin-top: 1rem !important;
        }
      }
    `
    document.head.appendChild(printStyles)
    
    return () => {
      document.head.removeChild(printStyles)
    }
  }, [])
  // Get fields relevant to current region and TaxRush settings
  const relevantFields = getFieldsForRegion(answers.region, answers.handlesTaxRush)
  
  // Calculate sophisticated projections using same logic as Page 2
  const currentAvgNetFee = answers.projectedAvgNetFee || (answers.avgNetFee && answers.expectedGrowthPct !== undefined ? answers.avgNetFee * (1 + answers.expectedGrowthPct / 100) : answers.avgNetFee) || 125
  const currentTaxPrepReturns = answers.projectedTaxPrepReturns || (answers.taxPrepReturns && answers.expectedGrowthPct !== undefined ? answers.taxPrepReturns * (1 + answers.expectedGrowthPct / 100) : answers.taxPrepReturns) || 1600
  const currentTaxRushReturns = answers.region === 'CA' && answers.handlesTaxRush && answers.taxRushReturns 
    ? (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined 
       ? Math.round(answers.taxRushReturns * (1 + answers.expectedGrowthPct / 100))
       : answers.taxRushReturns)
    : 0
  const currentTaxRushAvgNetFee = answers.region === 'CA' && answers.handlesTaxRush && answers.taxRushAvgNetFee
    ? (answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined 
       ? answers.taxRushAvgNetFee * (1 + answers.expectedGrowthPct / 100)
       : answers.taxRushAvgNetFee)
    : 0

  const grossFees = currentAvgNetFee * currentTaxPrepReturns
  const discountAmount = grossFees * ((answers.discountsPct || 3) / 100)
  const taxPrepIncome = grossFees - discountAmount
  const taxRushIncome = currentTaxRushAvgNetFee * currentTaxRushReturns
  const otherIncome = answers.otherIncome || 0
  const totalGrossRevenue = taxPrepIncome + taxRushIncome + otherIncome
  
  // Calculate strategic targets for performance analysis
  const strategicTarget = answers.expectedRevenue || 0
  const hasRevenueMismatch = strategicTarget > 0 && Math.abs(totalGrossRevenue - strategicTarget) > 1000
  const revenueVariance = !hasRevenueMismatch && strategicTarget > 0 ? ((totalGrossRevenue - strategicTarget) / strategicTarget) * 100 : 0


  const renderPrintableReport = () => {
    // Calculate final totals for report
    const totalExpenses = relevantFields.reduce((total, field) => {
      const value = (answers as any)[field.id] ?? field.defaultValue
      if (field.calculationBase === 'fixed_amount') {
        return total + value
      } else {
        let calculationBase = 0
        if (field.id === 'taxRushRoyaltiesPct' && answers.handlesTaxRush) {
          calculationBase = answers.taxRushGrossFees || 0
        } else {
          switch (field.calculationBase) {
            case 'percentage_gross': calculationBase = totalGrossRevenue; break
            case 'percentage_tp_income': calculationBase = taxPrepIncome; break
            case 'percentage_salaries': calculationBase = totalGrossRevenue * ((answers as any).salariesPct || 25) / 100; break
          }
        }
        return total + Math.round(calculationBase * value / 100)
      }
    }, 0)
    
    const netIncome = totalGrossRevenue - totalExpenses
    const netMargin = totalGrossRevenue > 0 ? (netIncome / totalGrossRevenue) * 100 : 0
    const totalReturns = currentTaxPrepReturns + (answers.region === 'CA' && answers.handlesTaxRush ? currentTaxRushReturns : 0)
    const costPerReturn = totalReturns > 0 ? totalExpenses / totalReturns : 0

    return (
      <div style={{ 
        backgroundColor: 'white',
        border: '2px solid #000',
        padding: '2rem',
        marginBottom: '1.5rem',
        fontFamily: '"Proxima Nova", Arial, sans-serif',
        fontSize: '12px',
        lineHeight: 1.4,
        '@media print': {
          border: 'none',
          boxShadow: 'none',
          fontFamily: '"Times New Roman", serif'
        }
      }}>
        {/* Report Header with Dynamic Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #dc2626'
        }}>
          {/* Dynamic Brand Logo based on region */}
          <div style={{ marginBottom: '1rem' }}>
            <img 
              src={answers.region === 'CA' ? CA_ASSETS.logoWide : US_ASSETS.logoWide} 
              alt={answers.region === 'CA' ? 'Liberty Tax Canada' : 'Liberty Tax Service'}
              style={{ 
                height: '60px',
                width: 'auto',
                maxWidth: '300px'
              }}
            />
          </div>
          
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600', // PROXIMA NOVA SEMIBOLD
            marginBottom: '1rem',
            color: '#333',
            fontFamily: '"Proxima Nova", Arial, sans-serif'
          }}>
            P&L Budget & Forecast Summary
          </h2>
          <div style={{ 
            fontSize: '11px', 
            color: '#666',
            fontFamily: '"Proxima Nova", Arial, sans-serif',
            fontWeight: '400' // PROXIMA NOVA REGULAR
          }}>
            Generated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        {/* Configuration Summary */}
        <div className="config-summary" style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1.5rem',
          padding: '8px',
          fontSize: '11px',
          borderTop: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          fontFamily: '"Proxima Nova", Arial, sans-serif'
        }}>
          <div>
            <span style={{ fontWeight: '600' }}>Region:</span> {answers.region === 'US' ? 'United States' : 'Canada'}
          </div>
          <div>
            <span style={{ fontWeight: '600' }}>Store Type:</span> {answers.storeType === 'new' ? 'New Store (First Year)' : 'Existing Store'}
          </div>
          {answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && (
            <div>
              <span style={{ fontWeight: '600' }}>Growth Target:</span> {answers.expectedGrowthPct > 0 ? '+' : ''}{answers.expectedGrowthPct}% vs Last Year
            </div>
          )}
        </div>

        {/* Key Metrics Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '800', // PROXIMA NOVA EXTRABOLD
            marginBottom: '1rem',
            borderBottom: '2px solid #000',
            paddingBottom: '4px',
            letterSpacing: '1px',
            fontFamily: '"Proxima Nova", Arial, sans-serif'
          }}>
            KEY FINANCIAL METRICS
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid #ddd' }}>Net Income</td>
                <td style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: netIncome >= 0 ? '#059669' : '#dc2626'
                }}>
                  ${Math.round(netIncome).toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid #ddd' }}>Net Margin %</td>
                <td style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: netMargin >= 20 ? '#059669' : netMargin >= 15 ? '#f59e0b' : '#dc2626'
                }}>
                  {netMargin.toFixed(1)}%
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid #ddd' }}>Cost per Return</td>
                <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                  ${Math.round(costPerReturn).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Revenue & Expense Detail */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '800', // PROXIMA NOVA EXTRABOLD
            marginBottom: '1rem',
            borderBottom: '2px solid #000',
            paddingBottom: '4px',
            letterSpacing: '1px',
            fontFamily: '"Proxima Nova", Arial, sans-serif'
          }}>
            DETAILED P&L BREAKDOWN
          </h3>
          
          {/* Revenue Section */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#059669', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>REVENUE</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Gross Tax Prep Fees</td>
                <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'right' }}>
                  ${grossFees.toLocaleString()}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Less: Customer Discounts</td>
                <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'right', color: '#dc2626' }}>
                  -${Math.round(discountAmount).toLocaleString()}
                </td>
              </tr>
              {currentTaxRushReturns > 0 && (
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>TaxRush Revenue (CA)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    ${Math.round(taxRushIncome).toLocaleString()}
                  </td>
                </tr>
              )}
              {otherIncome > 0 && (
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Other Revenue</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd', textAlign: 'right' }}>
                    ${otherIncome.toLocaleString()}
                  </td>
                </tr>
              )}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#e6f7ff' }}>
                <td style={{ padding: '8px', border: '2px solid #059669' }}>TOTAL REVENUE</td>
                <td style={{ padding: '8px', border: '2px solid #059669', textAlign: 'right' }}>
                  ${Math.round(totalGrossRevenue).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Detailed Expense Section */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#dc2626', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>EXPENSE ITEM</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>RATE</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>AMOUNT</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>NOTES</th>
              </tr>
            </thead>
            <tbody>
              {(['personnel', 'facility', 'operations', 'franchise', 'misc'] as ExpenseCategory[]).map(category => {
                const categoryFields = getFieldsByCategory(category).filter(field => relevantFields.includes(field))
    if (categoryFields.length === 0) return null
                
                let categoryTotal = 0

    return (
                  <React.Fragment key={category}>
                    {/* Category Header */}
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan={4} style={{ 
                        padding: '8px', 
                        border: '1px solid #ddd', 
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        color: '#374151'
                      }}>
                        {getCategoryIcon(category)} {expenseCategories[category].label.toUpperCase()}
                      </td>
                    </tr>
                    
                    {/* Individual Line Items */}
          {categoryFields.map(field => {
            const value = (answers as any)[field.id] ?? field.defaultValue
            const isFixed = field.calculationBase === 'fixed_amount'
                      const isCustomized = (answers as any)[field.id] !== undefined
                      
                      let dollarAmount = 0
                      let calculationBase = 0
                      let baseDescription = ''
                      
                      if (isFixed) {
                        dollarAmount = value
                        baseDescription = 'Fixed Amount'
                      } else {
                        if (field.id === 'taxRushRoyaltiesPct' && answers.handlesTaxRush) {
                          calculationBase = answers.taxRushGrossFees || 0
                          baseDescription = 'TaxRush Gross Fees'
                        } else {
                          switch (field.calculationBase) {
                            case 'percentage_gross': 
                              calculationBase = totalGrossRevenue
                              baseDescription = 'Gross Fees'
                              break
                            case 'percentage_tp_income': 
                              calculationBase = taxPrepIncome
                              baseDescription = 'Tax Prep Income'
                              break
                            case 'percentage_salaries': 
                              calculationBase = totalGrossRevenue * ((answers as any).salariesPct || 25) / 100
                              baseDescription = 'Salary Amount'
                              break
                          }
                        }
                        dollarAmount = Math.round(calculationBase * value / 100)
                      }
                      
                      categoryTotal += dollarAmount

            return (
                        <tr key={field.id}>
                          <td style={{ 
                            padding: '6px 8px 6px 20px', 
                            border: '1px solid #ddd',
                            fontSize: '0.85rem'
                }}>
                  {field.label}
                            {isCustomized && (
                    <span style={{ 
                                fontSize: '0.7rem',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                      padding: '1px 4px',
                                borderRadius: '3px',
                                marginLeft: '0.5rem'
                    }}>
                                customized
                    </span>
                  )}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            border: '1px solid #ddd', 
                            textAlign: 'center',
                            fontSize: '0.85rem'
                          }}>
                            {isFixed ? 'Fixed' : `${value}%`}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            border: '1px solid #ddd', 
                            textAlign: 'right',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            ${dollarAmount.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '6px 8px', 
                            border: '1px solid #ddd',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                          }}>
                            {!isFixed && `${value}% of ${baseDescription}`}
                            {field.id.includes('Royalties') && ' (Franchise Required)'}
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}
              
              {/* Total Row */}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#fee2e2' }}>
                <td style={{ padding: '10px 8px', border: '2px solid #dc2626', fontSize: '0.9rem' }}>
                  TOTAL EXPENSES
                </td>
                <td style={{ padding: '10px 8px', border: '2px solid #dc2626', textAlign: 'center' }}>
                  {((totalExpenses / totalGrossRevenue) * 100).toFixed(1)}%
                </td>
                <td style={{ padding: '10px 8px', border: '2px solid #dc2626', textAlign: 'right', fontSize: '0.9rem' }}>
                  ${Math.round(totalExpenses).toLocaleString()}
                </td>
                <td style={{ padding: '10px 8px', border: '2px solid #dc2626', fontSize: '0.75rem', color: '#6b7280' }}>
                  of Total Revenue
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Final Net Income */}
        <div style={{ 
          padding: '1rem', 
          backgroundColor: netIncome >= 0 ? '#f0fdf4' : '#fef2f2',
          border: `3px solid ${netIncome >= 0 ? '#059669' : '#dc2626'}`,
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: netIncome >= 0 ? '#059669' : '#dc2626'
          }}>
            NET INCOME: ${Math.round(netIncome).toLocaleString()} ({netMargin.toFixed(1)}% margin)
          </div>
        </div>

        {/* Management Action Items */}
        <div className="management-checklist" style={{ marginTop: '2rem', pageBreakBefore: 'auto' }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '800', // PROXIMA NOVA EXTRABOLD
            marginBottom: '1rem',
            borderBottom: '2px solid #000',
            paddingBottom: '4px',
            letterSpacing: '1px',
            fontFamily: '"Proxima Nova", Arial, sans-serif'
          }}>
            MANAGEMENT REVIEW CHECKLIST
          </h3>
          
          <div style={{ 
            fontSize: '11px', 
            lineHeight: 1.6,
            fontFamily: '"Proxima Nova", Arial, sans-serif'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600', fontFamily: '"Proxima Nova", Arial, sans-serif' }}>□ REVENUE OPTIMIZATION:</span>
              <ul style={{ marginTop: '0.25rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Average fee vs market rates: ${currentAvgNetFee} (adjust pricing strategy?)</li>
                <li>Return volume vs capacity: {currentTaxPrepReturns.toLocaleString()} returns planned</li>
                <li>Discount policy: {(answers.discountsPct || 3)}% (industry standard: 3%)</li>
                {currentTaxRushReturns > 0 && (
                  <li>TaxRush penetration: {currentTaxRushReturns.toLocaleString()} returns ({Math.round((currentTaxRushReturns / currentTaxPrepReturns) * 100)}% of total)</li>
                )}
              </ul>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600', fontFamily: '"Proxima Nova", Arial, sans-serif' }}>□ EXPENSE MANAGEMENT:</span>
              <ul style={{ marginTop: '0.25rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Total expense ratio: {((totalExpenses / totalGrossRevenue) * 100).toFixed(1)}% (target: 75-77%)</li>
                <li>Salary efficiency: Review staffing levels and scheduling</li>
                <li>Facility costs: Rent and utilities vs location value</li>
                <li>Franchise compliance: All required royalties and advertising fees included</li>
                <li>Variable expense control: Supplies, maintenance, and operational costs</li>
              </ul>
          </div>
          
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600', fontFamily: '"Proxima Nova", Arial, sans-serif' }}>□ PERFORMANCE TARGETS:</span>
              <ul style={{ marginTop: '0.25rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Net margin target: {netMargin.toFixed(1)}% (industry benchmark: 20-25%)</li>
                <li>Cost per return: ${Math.round(costPerReturn)} (monitor for efficiency)</li>
                <li>Break-even analysis: Monthly targets and seasonal adjustments</li>
                <li>Cash flow planning: Tax season vs off-season operations</li>
              </ul>
          </div>
          
            <div>
              <span style={{ fontWeight: '600', fontFamily: '"Proxima Nova", Arial, sans-serif' }}>□ ACTION ITEMS:</span>
              <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                <li>Review and approve staffing plan with HR/Payroll</li>
                <li>Confirm facility lease terms and utility budgets</li>
                <li>Validate marketing spend and local advertising strategy</li>
                <li>Schedule monthly P&L reviews vs this forecast</li>
                <li>Set up dashboard tracking for real-time performance monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-wizard-step="review">
      <div className="card-title">📋 P&L Report Summary</div>
      <p className="small" style={{ marginBottom: '1.5rem' }}>
        <strong>Final report ready for review and printing.</strong> This summary compiles all your wizard inputs 
        into a professional P&L forecast report. Print this page or proceed to create your interactive dashboard.
      </p>

      {/* Export Options */}
      <div className="export-buttons" style={{ 
          display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => window.print()}
            style={{
              background: 'linear-gradient(45deg, #1e40af, #3b82f6)', 
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
            📄 Print PDF
          </button>
          <button 
            type="button" 
            onClick={() => {
              // Create Excel export using current wizard data
              const data = {
                region: answers.region,
                storeType: answers.storeType,
                answers: answers,
                timestamp: new Date().toISOString()
              }
              console.log('📊 Excel Export - Wizard Data:', data)
              // TODO: Implement actual Excel generation
              alert('Excel export functionality will be implemented - using current wizard data')
            }}
            style={{
              background: 'linear-gradient(45deg, #059669, #10b981)', 
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
            📊 Export Excel
          </button>
        </div>
        <div style={{ color: '#0369a1', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          <div>
            <strong>PDF:</strong> Management review meetings<br />
            <strong>Excel:</strong> Current wizard data & calculations
          </div>
        </div>
        </div>
        
      {/* Printable Report */}
      <div data-print-report>
        {renderPrintableReport()}
      </div>

      {/* Wizard Completion Summary */}
      <div className="wizard-completion" style={{ 
        padding: '1rem', 
        backgroundColor: '#fffbeb',
        border: '2px solid #f59e0b',
        borderRadius: '6px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ color: '#92400e', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1rem' }}>
          ✅ Setup Complete - Dashboard Ready
        </div>
        <div style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: 1.4 }}>
          Your P&L configuration is complete! Click 'Dashboard' to access your interactive dashboard with:
          <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>Real-time calculations and adjustments</li>
            <li>Scenario planning tools</li>
            <li>Performance tracking</li>
            <li>Excel export capabilities</li>
          </ul>
        </div>
      </div>

      {/* Navigation */}
      <div className="wizard-nav" style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'space-between',
        padding: '1.5rem 0 1.5rem 0',
        borderTop: '2px solid #e5e7eb'
      }}>
        <button 
          type="button" 
          onClick={onBack} 
          style={{
            background: 'linear-gradient(45deg, #6b7280, #9ca3af)', 
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
          ← Back to Customize
        </button>
        <button 
          type="button" 
          onClick={onNext} 
          style={{
            background: 'linear-gradient(45deg, #1e40af, #3b82f6)', 
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
          Dashboard
        </button>
      </div>
    </div>
  )
}

// Helper function to get category icons
function getCategoryIcon(category: ExpenseCategory): string {
  switch (category) {
    case 'personnel': return '👥'
    case 'facility': return '🏢'
    case 'operations': return '⚙️'
    case 'franchise': return '🏪'
    case 'misc': return '📝'
    default: return '📊'
  }
}