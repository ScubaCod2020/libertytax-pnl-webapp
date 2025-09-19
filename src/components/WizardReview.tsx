// WizardReview.tsx - Report generation and wizard data compilation
// Print-friendly summary for Excel export and final wizard completion

import React from 'react'
import {
  expenseCategories,
  getFieldsByCategory,
  getFieldsForRegion,
  type ExpenseCategory,
} from '../types/expenses'
import type { WizardAnswers } from './Wizard/types'
import { calc, statusForMargin, type Thresholds } from '../lib/calcs'

// Brand assets
import { US_ASSETS, CA_ASSETS } from '../assets/brands'

interface WizardReviewProps {
  answers: WizardAnswers
  onNext: () => void
  onBack: () => void
}

export default function WizardReview({ answers, onNext, onBack }: WizardReviewProps) {
  // ——— PRINT STYLES (CPA one-pager) ———
  React.useEffect(() => {
    const printStyles = document.createElement('style')
    printStyles.innerHTML = `
      @media print {
        /* Hide everything but the report */
        body * { visibility: hidden !important; }
        [data-print-report], [data-print-report] * { visibility: visible !important; }

        /* Remove app chrome */
        header, nav, .header, .navbar, .site-header,
        .wizard-nav, .btn-secondary, .btn-primary,
        .export-buttons, .wizard-completion, .small { display: none !important; }

        /* Page + body reset */
        html, body {
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        /* Report block */
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

        *, *::before, *::after {
          font-family: "Times New Roman", serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body > *:not([data-print-report]) { display: none !important; }

        h1, h2, h3 {
          page-break-after: avoid !important;
          margin-bottom: 8pt !important;
          margin-top: 6pt !important;
        }
        h2 { font-size: 14pt !important; margin-bottom: 6pt !important; }
        h3 { font-size: 12pt !important; margin-bottom: 4pt !important; margin-top: 12pt !important; }

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

        ul, ol { margin: 3pt 0 6pt 0 !important; padding-left: 18pt !important; }
        li { margin-bottom: 1pt !important; font-size: 9pt !important; }

        @page { size: letter; margin: 0.5in; }
        .page-break-before { page-break-before: always !important; }
        .page-break-avoid { page-break-inside: avoid !important; }
        p { margin: 2pt 0 4pt 0 !important; font-size: 9pt !important; }
      }
    `
    document.head.appendChild(printStyles)
    return () => { document.head.removeChild(printStyles) }
  }, [])

  // ——— KPI Thresholds used for coloring margin ———
  const defaultThresholds: Thresholds = {
    cprGreen: 85,
    cprYellow: 100,
    nimGreen: 22.5,
    nimYellow: 19.5,
    netIncomeWarn: -5000,
  }

  // ——— SINGLE SOURCE OF TRUTH: calc(answers) ———
  const results = calc({
    region: answers.region,
    scenario: 'Custom',
    avgNetFee: answers.avgNetFee ?? 0,
    taxPrepReturns: answers.taxPrepReturns ?? 0,
    taxRushReturns: answers.taxRushReturns ?? 0,
    handlesTaxRush: answers.handlesTaxRush,
    otherIncome: answers.otherIncome ?? 0,
    discountsPct: answers.discountsPct ?? 3,
    calculatedTotalExpenses: answers.calculatedTotalExpenses,
    salariesPct: answers.salariesPct ?? 0,
    empDeductionsPct: answers.empDeductionsPct ?? 0,
    rentPct: answers.rentPct ?? 0,
    telephoneAmt: answers.telephoneAmt ?? 0,
    utilitiesAmt: answers.utilitiesAmt ?? 0,
    localAdvAmt: answers.localAdvAmt ?? 0,
    insuranceAmt: answers.insuranceAmt ?? 0,
    postageAmt: answers.postageAmt ?? 0,
    suppliesPct: answers.suppliesPct ?? 0,
    duesAmt: answers.duesAmt ?? 0,
    bankFeesAmt: answers.bankFeesAmt ?? 0,
    maintenanceAmt: answers.maintenanceAmt ?? 0,
    travelEntAmt: answers.travelEntAmt ?? 0,
    royaltiesPct: answers.royaltiesPct ?? 0,
    advRoyaltiesPct: answers.advRoyaltiesPct ?? 0,
    taxRushRoyaltiesPct: answers.taxRushRoyaltiesPct ?? 0,
    miscPct: answers.miscPct ?? 0,
    thresholds: defaultThresholds,
  })

  // ——— Derived display helpers ———
  const relevantFields = getFieldsForRegion(answers.region, answers.handlesTaxRush)
  const projectedReturns = answers.projectedTaxPrepReturns ?? answers.taxPrepReturns ?? 0
  const projectedAvgNetFee = answers.projectedAvgNetFee ?? answers.avgNetFee ?? 0
  const profitPerReturn = results.totalReturns > 0 ? results.netIncome / results.totalReturns : 0
  const netMarginStatus = statusForMargin(results.netMarginPct, defaultThresholds)

  // Map field.id → calc results key (keeps expense table consistent with calc)
  const resultKeyByFieldId: Record<string, keyof typeof results | undefined> = {
    salariesPct: 'salaries',
    empDeductionsPct: 'empDeductions',
    rentPct: 'rent',
    telephoneAmt: 'telephone',
    utilitiesAmt: 'utilities',
    localAdvAmt: 'localAdv',
    insuranceAmt: 'insurance',
    postageAmt: 'postage',
    suppliesPct: 'supplies',
    duesAmt: 'dues',
    bankFeesAmt: 'bankFees',
    maintenanceAmt: 'maintenance',
    travelEntAmt: 'travelEnt',
    royaltiesPct: 'royalties',
    advRoyaltiesPct: 'advRoyalties',
    taxRushRoyaltiesPct: 'taxRushRoyalties',
    miscPct: 'misc',
  }

  const renderPrintableReport = () => {
    return (
      <div
        style={{
          backgroundColor: 'white',
          border: '2px solid #000',
          padding: '2rem',
          marginBottom: '1.5rem',
          fontFamily: '"Proxima Nova", Arial, sans-serif',
          fontSize: '12px',
          lineHeight: 1.4,
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #dc2626',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <img
              src={answers.region === 'CA' ? CA_ASSETS.logoWide : US_ASSETS.logoWide}
              alt={answers.region === 'CA' ? 'Liberty Tax Canada' : 'Liberty Tax Service'}
              style={{ height: '60px', width: 'auto', maxWidth: '300px' }}
            />
          </div>

          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#333',
              fontFamily: '"Proxima Nova", Arial, sans-serif',
            }}
          >
            P&L Budget & Forecast Summary
          </h2>
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontFamily: '"Proxima Nova", Arial, sans-serif',
              fontWeight: 400,
            }}
          >
            Generated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Configuration Summary */}
        <div
          className="config-summary"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '1.5rem',
            padding: '8px',
            fontSize: '11px',
            borderTop: '1px solid #ddd',
            borderBottom: '1px solid #ddd',
            fontFamily: '"Proxima Nova", Arial, sans-serif',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontWeight: 600 }}>Region:</span>{' '}
            {answers.region === 'US' ? 'United States' : 'Canada'}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Store Type:</span>{' '}
            {answers.storeType === 'new' ? 'New Store (First Year)' : 'Existing Store'}
          </div>
          {answers.storeType === 'existing' && answers.expectedGrowthPct !== undefined && (
            <div>
              <span style={{ fontWeight: 600 }}>Growth Target:</span>{' '}
              {answers.expectedGrowthPct > 0 ? '+' : ''}
              {answers.expectedGrowthPct}% vs Last Year
            </div>
          )}
          <div>
            <span style={{ fontWeight: 600 }}>Projected Returns:</span>{' '}
            {projectedReturns.toLocaleString()}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Projected Avg Net Fee:</span> $
            {projectedAvgNetFee.toLocaleString()}
          </div>
        </div>

        {/* Key Financial Metrics */}
        <div style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 800,
              marginBottom: '1rem',
              borderBottom: '2px solid #000',
              paddingBottom: '4px',
              letterSpacing: '1px',
              fontFamily: '"Proxima Nova", Arial, sans-serif',
            }}
          >
            KEY FINANCIAL METRICS
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid #ddd' }}>
                  Net Income
                </td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color: results.netIncome >= 0 ? '#059669' : '#dc2626',
                  }}
                >
                  ${Math.round(results.netIncome).toLocaleString()}
                </td>
              </tr>

              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid #ddd' }}>
                  Net Margin %
                </td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    color:
                      netMarginStatus === 'green'
                        ? '#059669'
                        : netMarginStatus === 'yellow'
                        ? '#f59e0b'
                        : '#dc2626',
                  }}
                >
                  {results.netMarginPct.toFixed(1)}%
                </td>
              </tr>

              {/* Prominent CPR & Profit/Return */}
              <tr style={{ backgroundColor: '#ecfeff' }}>
                <td style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #ddd' }}>
                  Cost per Return
                </td>
                <td
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    textAlign: 'right',
                    fontWeight: 700,
                  }}
                >
                  ${Math.round(results.costPerReturn).toLocaleString()}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f0fdf4' }}>
                <td style={{ fontWeight: 'bold', padding: '10px', border: '1px solid #ddd' }}>
                  Profit per Return
                </td>
                <td
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    textAlign: 'right',
                    fontWeight: 700,
                  }}
                >
                  ${Math.round(profitPerReturn).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Revenue & Expense Detail */}
        <div style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 800,
              marginBottom: '1rem',
              borderBottom: '2px solid #000',
              paddingBottom: '4px',
              letterSpacing: '1px',
              fontFamily: '"Proxima Nova", Arial, sans-serif',
            }}
          >
            DETAILED P&L BREAKDOWN
          </h3>

          {/* Revenue */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#059669', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  REVENUE
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                  Gross Tax Prep Fees
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    textAlign: 'right',
                  }}
                >
                  ${Math.round(results.grossFees).toLocaleString()}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                  Less: Customer Discounts
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #ddd',
                    textAlign: 'right',
                    color: '#dc2626',
                  }}
                >
                  -${Math.round(results.discounts).toLocaleString()}
                </td>
              </tr>
              {answers.region === 'CA' && answers.handlesTaxRush && results.taxRushIncome > 0 && (
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                    TaxRush Revenue (CA)
                  </td>
                  <td
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      textAlign: 'right',
                    }}
                  >
                    ${Math.round(results.taxRushIncome).toLocaleString()}
                  </td>
                </tr>
              )}
              {results.otherIncome > 0 && (
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>Other Revenue</td>
                  <td
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #ddd',
                      textAlign: 'right',
                    }}
                  >
                    ${Math.round(results.otherIncome).toLocaleString()}
                  </td>
                </tr>
              )}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#e6f7ff' }}>
                <td style={{ padding: '8px', border: '2px solid #059669' }}>TOTAL REVENUE</td>
                <td style={{ padding: '8px', border: '2px solid #059669', textAlign: 'right' }}>
                  ${Math.round(results.totalRevenue).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Expenses (driven by field config but amounts from calc results when possible) */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#dc2626', color: 'white' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  EXPENSE ITEM
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                  RATE
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>
                  AMOUNT
                </th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  NOTES
                </th>
              </tr>
            </thead>
            <tbody>
              {(['personnel', 'facility', 'operations', 'franchise', 'misc'] as ExpenseCategory[]).map(
                (category) => {
                  const categoryFields = getFieldsByCategory(category).filter((f) =>
                    relevantFields.includes(f),
                  )
                  if (categoryFields.length === 0) return null

                  return (
                    <React.Fragment key={category}>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <td
                          colSpan={4}
                          style={{
                            padding: '8px',
                            border: '1px solid #ddd',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            color: '#374151',
                          }}
                        >
                          {getCategoryIcon(category)} {expenseCategories[category].label.toUpperCase()}
                        </td>
                      </tr>

                      {categoryFields.map((field) => {
                        const rate = (answers as any)[field.id] ?? field.defaultValue
                        const isFixed = field.calculationBase === 'fixed_amount'
                        const resultsKey = resultKeyByFieldId[field.id]
                        const amountFromCalc =
                          resultsKey && typeof results[resultsKey] === 'number'
                            ? (results[resultsKey] as number)
                            : undefined

                        // Fallback calculation if we can't map to results (should be rare)
                        let notes = ''
                        if (isFixed) {
                          notes = 'Fixed Amount'
                        } else {
                          // Describe base used (aligned to calc engine)
                          switch (field.id) {
                            case 'royaltiesPct':
                            case 'advRoyaltiesPct':
                            case 'taxRushRoyaltiesPct':
                              notes = `${rate}% of Tax Prep Income`
                              break
                            case 'suppliesPct':
                            case 'miscPct':
                            case 'rentPct':
                              notes = `${rate}% of Gross Tax Prep Fees`
                              break
                            default:
                              // If original metadata has a different base naming, keep it simple:
                              notes = `${rate}%`
                              break
                          }
                        }

                        return (
                          <tr key={field.id}>
                            <td
                              style={{
                                padding: '6px 8px 6px 20px',
                                border: '1px solid #ddd',
                                fontSize: '0.85rem',
                              }}
                            >
                              {field.label}
                              {(answers as any)[field.id] !== undefined && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    backgroundColor: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    marginLeft: '0.5rem',
                                  }}
                                >
                                  customized
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                textAlign: 'center',
                                fontSize: '0.85rem',
                              }}
                            >
                              {isFixed ? 'Fixed' : `${rate}%`}
                            </td>
                            <td
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                textAlign: 'right',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                              }}
                            >
                              ${Math.round(amountFromCalc ?? 0).toLocaleString()}
                            </td>
                            <td
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #ddd',
                                fontSize: '0.75rem',
                                color: '#6b7280',
                              }}
                            >
                              {notes}
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                },
              )}

              {/* Expense Total */}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#fee2e2' }}>
                <td style={{ padding: '10px 8px', border: '2px solid #dc2626', fontSize: '0.9rem' }}>
                  TOTAL EXPENSES
                </td>
                <td style={{ padding: '10px 8px', border: '2px solid #dc2626', textAlign: 'center' }}>
                  {results.totalRevenue > 0
                    ? ((results.totalExpenses / results.totalRevenue) * 100).toFixed(1)
                    : '0.0'}
                  %
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    border: '2px solid #dc2626',
                    textAlign: 'right',
                    fontSize: '0.9rem',
                  }}
                >
                  ${Math.round(results.totalExpenses).toLocaleString()}
                </td>
                <td
                  style={{
                    padding: '10px 8px',
                    border: '2px solid #dc2626',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  of Total Revenue
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Final Net Income */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: results.netIncome >= 0 ? '#f0fdf4' : '#fef2f2',
            border: `3px solid ${results.netIncome >= 0 ? '#059669' : '#dc2626'}`,
            borderRadius: '4px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: results.netIncome >= 0 ? '#059669' : '#dc2626',
            }}
          >
            NET INCOME: ${Math.round(results.netIncome).toLocaleString()} (
            {results.totalRevenue > 0 ? results.netMarginPct.toFixed(1) : '0.0'}% margin)
          </div>
        </div>

        {/* Management Checklist */}
        <div className="management-checklist" style={{ marginTop: '2rem', pageBreakBefore: 'auto' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 800,
              marginBottom: '1rem',
              borderBottom: '2px solid #000',
              paddingBottom: '4px',
              letterSpacing: '1px',
              fontFamily: '"Proxima Nova", Arial, sans-serif',
            }}
          >
            MANAGEMENT REVIEW CHECKLIST
          </h3>

          <div style={{ fontSize: '11px', lineHeight: 1.6, fontFamily: '"Proxima Nova", Arial, sans-serif' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>□ REVENUE OPTIMIZATION:</span>
              <ul style={{ marginTop: '0.25rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Projected returns: {projectedReturns.toLocaleString()}</li>
                <li>Projected average fee: ${projectedAvgNetFee.toLocaleString()}</li>
                <li>Discount policy: {(answers.discountsPct ?? 3).toFixed(1)}% (industry: ~3%)</li>
              </ul>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>□ EXPENSE MANAGEMENT:</span>
              <ul style={{ marginTop: '0.25rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>
                  Total expense ratio:{' '}
                  {results.totalRevenue > 0
                    ? ((results.totalExpenses / results.totalRevenue) * 100).toFixed(1)
                    : '0.0'}
                  % (target: 75–77%)
                </li>
                <li>Cost per return: ${Math.round(results.costPerReturn).toLocaleString()}</li>
                <li>Profit per return: ${Math.round(profitPerReturn).toLocaleString()}</li>
              </ul>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>□ PERFORMANCE TARGETS:</span>
              <ul style={{ marginTop: '0.25rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Net margin target: {results.netMarginPct.toFixed(1)}% (benchmark: 20–25%)</li>
                <li>Total returns (incl. TaxRush if CA): {results.totalReturns.toLocaleString()}</li>
              </ul>
            </div>

            <div>
              <span style={{ fontWeight: 600 }}>□ ACTION ITEMS:</span>
              <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                <li>Review staffing plan & facility costs</li>
                <li>Validate marketing/advertising budget</li>
                <li>Schedule monthly P&L reviews vs this forecast</li>
                <li>Set up dashboard tracking for real-time performance</li>
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
        <strong>Final report ready for review and printing.</strong> This summary compiles all your wizard
        inputs into a professional P&L forecast. Print this page or proceed to the dashboard.
      </p>

      {/* Export Buttons */}
      <div
        className="export-buttons"
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          flexWrap: 'wrap',
        }}
      >
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
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            📄 Print PDF
          </button>
          <button
            type="button"
            onClick={() => {
              const data = {
                region: answers.region,
                storeType: answers.storeType,
                answers: answers,
                results, // include calc results for Excel
                timestamp: new Date().toISOString(),
              }
              console.log('📊 Excel Export - Wizard Data:', data)
              alert('Excel export will use current wizard data & calc results')
            }}
            style={{
              background: 'linear-gradient(45deg, #059669, #10b981)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            📊 Export Excel
          </button>
        </div>
        <div style={{ color: '#0369a1', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
          <div>
            <strong>PDF:</strong> Management review one-pager
            <br />
            <strong>Excel:</strong> Current wizard inputs + calc results
          </div>
        </div>
      </div>

      {/* Printable Report */}
      <div data-print-report>{renderPrintableReport()}</div>

      {/* Navigation */}
      <div
        className="wizard-nav"
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
          padding: '1.5rem 0 1.5rem 0',
          borderTop: '2px solid #e5e7eb',
        }}
      >
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
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Dashboard
        </button>
      </div>
    </div>
  )
}

// Helper: category → icon
function getCategoryIcon(category: ExpenseCategory): string {
  switch (category) {
    case 'personnel':
      return '👥'
    case 'facility':
      return '🏢'
    case 'operations':
      return '⚙️'
    case 'franchise':
      return '🏪'
    case 'misc':
      return '📝'
    default:
      return '📊'
  }
}
