// Dashboard.tsx - Main dashboard component extracted from App.tsx
// Handles the right-side results display with KPIs and expense breakdown

import React from 'react'
import type { CalculationResults } from '../../hooks/useCalculations'
import { currency, pct, getKpiClass } from '../../hooks/useCalculations'
import KPIStoplight from '../KPIStoplight'

interface DashboardProps {
  results: CalculationResults
  hasOtherIncome?: boolean
}

export default function Dashboard({ results, hasOtherIncome }: DashboardProps) {
  const { cprStatus, nimStatus, niStatus } = results

  return (
    <div className="card" data-dashboard style={{ minWidth: '600px', width: '100%', maxWidth: '100%' }}>
      <div className="card-title">Dashboard</div>

      <div className="kpi-vertical" style={{ marginBottom: '1rem' }}>
        <div className={getKpiClass(niStatus)} style={{ minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <KPIStoplight active={niStatus} />
          <div>
            <div>Net Income</div>
            <div className="value">{currency(results.netIncome)}</div>
            <div className="small">Income − Expenses</div>
          </div>
        </div>

        <div className={getKpiClass(nimStatus)} style={{ minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <KPIStoplight active={nimStatus} />
          <div>
            <div>Net Margin</div>
            <div className="value">{pct(results.netMarginPct)}</div>
            <div className="small">Net Income ÷ Tax-Prep Income</div>
          </div>
        </div>

        <div className={getKpiClass(cprStatus)} style={{ minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <KPIStoplight active={cprStatus} />
          <div>
            <div>Cost / Return</div>
            <div className="value">{currency(results.costPerReturn)}</div>
            <div className="small">Total Expenses ÷ Returns</div>
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: 20, 
        gap: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        maxWidth: '100%'
      }}>
        {/* Pro-Tips Card - Shows first when stacked on narrow screens */}
        <div className="card" style={{ order: 2 }}>
          <div className="card-title">Pro-Tips</div>
          <ul className="small">
            {cprStatus === 'red' && (
              <li>Cost/Return is high — review Personnel and Facility costs.</li>
            )}
            {nimStatus === 'red' && (
              <li>Margin is low — consider raising ANF or reducing discounts.</li>
            )}
            {niStatus === 'red' && (
              <li>Net Income negative — check Franchise fees and Operations costs.</li>
            )}
            {niStatus === 'yellow' && (
              <li>
                Close to breakeven — small changes in ANF or Returns can flip green.
              </li>
            )}
            {cprStatus === 'green' &&
              nimStatus === 'green' &&
              niStatus === 'green' && (
                <li>Great! Consider "Best" scenario to stress-test capacity.</li>
              )}
            <li><strong>Industry Benchmarks:</strong> Net Margin: 20-25% (Excellent) • Cost/Return: $85-100 (Good) • Expense Ratio: 75-80% (Target)</li>
          </ul>
        </div>

        {/* Income Summary Card - Shows second when stacked */}
        <div className="card" style={{ order: 1 }}>
          <div className="card-title" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💰 Income Summary
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            {/* Tax Prep Revenue Breakdown */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Gross Tax Prep Fees:</span>
                <strong>{currency(results.grossFees)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem', color: '#6b7280' }}>
                <span>Returns: {(results.totalReturns - (results.taxRushIncome > 0 ? Math.round(results.taxRushIncome / 125) : 0)).toLocaleString()} @ ${Math.round(results.grossFees / (results.totalReturns - (results.taxRushIncome > 0 ? Math.round(results.taxRushIncome / 125) : 0))).toLocaleString()}</span>
                <span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#dc2626' }}>
                <span>Less Discounts ({((results.discounts / results.grossFees) * 100).toFixed(0)}%):</span>
                <strong>-{currency(results.discounts)}</strong>
              </div>
            </div>

            {/* Tax Prep Net Revenue */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: '#059669' }}>Tax Prep Net Revenue:</span>
              <strong>{currency(results.taxPrepIncome)}</strong>
            </div>

            {/* TaxRush Revenue (if applicable) */}
            {results.taxRushIncome > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>TaxRush Revenue:</span>
                <strong>{currency(results.taxRushIncome)}</strong>
              </div>
            )}

            {/* Other Revenue */}
            {hasOtherIncome && results.otherIncome > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', color: '#6b7280' }}>Other Revenue:</span>
                <strong>{currency(results.otherIncome)}</strong>
              </div>
            )}
            
            {/* Total Gross Revenue */}
            <div style={{ 
              borderTop: '2px solid #059669', 
              paddingTop: '0.75rem', 
              marginTop: '1rem',
              display: 'flex', 
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#059669'
            }}>
              <span>Total Gross Revenue:</span>
              <strong>{currency(results.totalRevenue)}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Expense Breakdown */}
      <div style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💰 Expense Breakdown
            <span className="small" style={{ fontWeight: 400, marginLeft: '8px' }}>
              (Total: {currency(results.totalExpenses)})
            </span>
          </div>
          
          {/* 
          TODO: FUTURE ENHANCEMENT - Actual vs Strategic Expense Analysis
          
          When transitioning from forecasting to tracking mode, restore this section:
          - Color-coded expense performance summary (green/yellow/red)
          - Strategic target comparison (76% operational best practices)
          - Variance alerts and recommendations for optimization
          - "Actual" vs "Projected" expense tracking with actionable insights
          
          This will provide real-time expense management guidance when users
          start entering actual expense data vs their forecasted amounts.
          */}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px', 
            marginTop: '12px',
            maxWidth: '100%'
          }}>
            {/* Personnel */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                👥 Personnel ({currency(results.salaries + results.empDeductions)} • {((results.salaries + results.empDeductions) / results.totalRevenue * 100).toFixed(1)}%)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Salaries: {currency(results.salaries)} ({(results.salaries / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Emp. Deductions: {currency(results.empDeductions)} ({(results.empDeductions / results.totalRevenue * 100).toFixed(1)}%)</div>
              </div>
            </div>

            {/* Facility */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                🏢 Facility ({currency(results.rent + results.telephone + results.utilities)} • {((results.rent + results.telephone + results.utilities) / results.totalRevenue * 100).toFixed(1)}%)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Rent: {currency(results.rent)} ({(results.rent / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Telephone: {currency(results.telephone)} ({(results.telephone / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Utilities: {currency(results.utilities)} ({(results.utilities / results.totalRevenue * 100).toFixed(1)}%)</div>
              </div>
            </div>

            {/* Operations */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                ⚙️ Operations ({currency(results.localAdv + results.insurance + results.postage + results.supplies + results.dues + results.bankFees + results.maintenance + results.travelEnt)} • {((results.localAdv + results.insurance + results.postage + results.supplies + results.dues + results.bankFees + results.maintenance + results.travelEnt) / results.totalRevenue * 100).toFixed(1)}%)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Local Advertising: {currency(results.localAdv)} ({(results.localAdv / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Insurance: {currency(results.insurance)} ({(results.insurance / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Office Supplies: {currency(results.supplies)} ({(results.supplies / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Other Ops: {currency(results.postage + results.dues + results.bankFees + results.maintenance + results.travelEnt)} ({((results.postage + results.dues + results.bankFees + results.maintenance + results.travelEnt) / results.totalRevenue * 100).toFixed(1)}%)</div>
              </div>
            </div>

            {/* Franchise */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                🏪 Franchise ({currency(results.royalties + results.advRoyalties + results.taxRushRoyalties)} • {((results.royalties + results.advRoyalties + results.taxRushRoyalties) / results.totalRevenue * 100).toFixed(1)}%)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Tax Prep Royalties: {currency(results.royalties)} ({(results.royalties / results.totalRevenue * 100).toFixed(1)}%)</div>
                <div>Adv. Royalties: {currency(results.advRoyalties)} ({(results.advRoyalties / results.totalRevenue * 100).toFixed(1)}%)</div>
                {results.taxRushRoyalties > 0 && (
                  <div>TaxRush Royalties: {currency(results.taxRushRoyalties)} ({(results.taxRushRoyalties / results.totalRevenue * 100).toFixed(1)}%)</div>
                )}
              </div>
            </div>
          </div>

          {/* Miscellaneous */}
          {results.misc > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div className="section-title" style={{ fontSize: '14px' }}>
                📝 Miscellaneous: {currency(results.misc)} ({(results.misc / results.totalRevenue * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
