// Dashboard.tsx - Main dashboard component extracted from App.tsx
// Handles the right-side results display with KPIs and expense breakdown

import React from 'react'
import type { CalculationResults } from '../../hooks/useCalculations'
import { currency, pct, getKpiClass } from '../../hooks/useCalculations'
import KPIStoplight from '../KPIStoplight'

interface DashboardProps {
  results: CalculationResults
}

export default function Dashboard({ results }: DashboardProps) {
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
            💰 Projected Income Summary
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            {/* Revenue Components in Proper Order */}
            <div style={{ marginBottom: '1rem' }}>
              {/* Tax Prep Revenue Breakdown */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#059669', marginBottom: '0.25rem' }}>Tax Prep Revenue:</div>
                <div style={{ color: '#374151', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>
                  <div>Gross Tax Prep Fees: <strong>{currency(results.grossFees)}</strong></div>
                  <div>Returns: {(results.totalReturns - (results.taxRushIncome > 0 ? Math.round(results.taxRushIncome / 125) : 0)).toLocaleString()} @ ${Math.round(results.grossFees / (results.totalReturns - (results.taxRushIncome > 0 ? Math.round(results.taxRushIncome / 125) : 0))).toLocaleString()}</div>
                  <div style={{ color: '#dc2626' }}>Less Discounts: <strong>-{currency(results.discounts)}</strong></div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '0.85rem', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '3px solid #059669' }}>
                  Net Tax Prep Income: <strong>{currency(results.taxPrepIncome)}</strong>
                </div>
              </div>
              
              {/* TaxRush Revenue Breakdown */}
              {results.taxRushIncome && results.taxRushIncome > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0ea5e9', marginBottom: '0.25rem' }}>TaxRush Revenue:</div>
                  <div style={{ color: '#374151', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>
                    <div>TaxRush Returns: {Math.round(results.taxRushIncome / 125).toLocaleString()}</div>
                    <div>Average Net Fee: $125</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#0ea5e9', fontSize: '0.85rem', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '3px solid #0ea5e9' }}>
                    TaxRush Income: <strong>{currency(results.taxRushIncome)}</strong>
                  </div>
                </div>
              )}
              
              {/* Other Income - Show actual otherIncome value if > 0 */}
              {(() => {
                const otherIncome = results.totalRevenue - results.taxPrepIncome - (results.taxRushIncome || 0)
                return otherIncome > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Other Income:</div>
                    <div style={{ color: '#374151', fontSize: '0.8rem', paddingLeft: '0.5rem' }}>
                      <div>Notary, consulting, etc.</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '3px solid #6b7280' }}>
                      Other Income: <strong>{currency(otherIncome)}</strong>
                    </div>
                  </div>
                )
              })()}
            </div>
            
            {/* Revenue Calculation Summary */}
            <div style={{ 
              borderTop: '2px solid #059669', 
              paddingTop: '0.75rem', 
              marginTop: '1rem',
              backgroundColor: '#f0f9ff',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                📊 Revenue Calculation:
              </div>
              
              <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                  <span>Net Tax Prep Income:</span>
                  <span><strong>{currency(results.taxPrepIncome)}</strong></span>
                </div>
                
                {results.taxRushIncome > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                    <span>+ TaxRush Income:</span>
                    <span><strong>{currency(results.taxRushIncome)}</strong></span>
                  </div>
                )}
                
                {(() => {
                  const otherIncome = results.totalRevenue - results.taxPrepIncome - (results.taxRushIncome || 0)
                  return otherIncome > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                      <span>+ Other Income:</span>
                      <span><strong>{currency(otherIncome)}</strong></span>
                    </div>
                  )
                })()}
                
                <div style={{ 
                  borderTop: '1px solid #bae6fd',
                  paddingTop: '0.5rem',
                  marginTop: '0.5rem',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  color: '#059669',
                  fontSize: '0.95rem'
                }}>
                  <span>Total Projected Revenue:</span>
                  <span>{currency(results.totalRevenue)}</span>
                </div>
                
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center', fontStyle: 'italic' }}>
                  Total Returns: {results.totalReturns.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Expense Breakdown */}
      <div style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💰 Actual Expense Breakdown
            <span className="small" style={{ fontWeight: 400, marginLeft: '8px' }}>
              (Total: {currency(results.totalExpenses)})
            </span>
          </div>
          
          {/* Actual Performance Summary */}
          <div style={{
            padding: '0.75rem',
            backgroundColor: (() => {
              const expensePercentage = results.totalRevenue > 0 ? (results.totalExpenses / results.totalRevenue) * 100 : 0
              if (expensePercentage >= 75 && expensePercentage <= 77) return '#f0f9ff'
              if (expensePercentage <= 80) return '#fffbeb'
              return '#fef2f2'
            })(),
            border: (() => {
              const expensePercentage = results.totalRevenue > 0 ? (results.totalExpenses / results.totalRevenue) * 100 : 0
              if (expensePercentage >= 75 && expensePercentage <= 77) return '1px solid #0ea5e9'
              if (expensePercentage <= 80) return '1px solid #f59e0b'
              return '1px solid #ef4444'
            })(),
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            <div style={{ 
              fontWeight: 'bold',
              color: (() => {
                const expensePercentage = results.totalRevenue > 0 ? (results.totalExpenses / results.totalRevenue) * 100 : 0
                if (expensePercentage >= 75 && expensePercentage <= 77) return '#0369a1'
                if (expensePercentage <= 80) return '#d97706'
                return '#dc2626'
              })(),
              marginBottom: '0.25rem'
            }}>
              Total Expenses: {currency(results.totalExpenses)}
              <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                ({results.totalRevenue > 0 ? ((results.totalExpenses / results.totalRevenue) * 100).toFixed(1) : '0.0'}% of gross revenue)
              </span>
            </div>
            <div style={{
              color: (() => {
                const expensePercentage = results.totalRevenue > 0 ? (results.totalExpenses / results.totalRevenue) * 100 : 0
                if (expensePercentage >= 75 && expensePercentage <= 77) return '#0369a1'
                if (expensePercentage <= 80) return '#d97706'
                return '#dc2626'
              })(),
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}>
              {(() => {
                const expensePercentage = results.totalRevenue > 0 ? (results.totalExpenses / results.totalRevenue) * 100 : 0
                const isStrategicTarget = Math.abs(expensePercentage - 76) <= 1 // Within 1% of Page 2's 76% strategic target
                
                if (isStrategicTarget) {
                  return '🎯 Matches Page 2 Strategic Target (76%) - Excellent alignment with operational best practices!'
                } else if (expensePercentage >= 75 && expensePercentage <= 77) {
                  return '✅ Excellent - optimal expense management within 75-77% operational best practices!'
                } else if (expensePercentage < 75) {
                  return `⚠️ ${expensePercentage < 76 ? 'Below' : 'Above'} Page 2 Strategic Target (76%) - Under-investment risk, consider increasing operational investments`
                } else if (expensePercentage <= 80) {
                  return `⚠️ Above Page 2 Strategic Target (76%) - Slightly over optimal range, review and optimize expenses`
                } else {
                  return `🚨 Well above Page 2 Strategic Target (76%) - Over budget, reduce expenses immediately`
                }
              })()}
            </div>
            
            {/* Strategic vs Actual Status */}
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem',
              fontStyle: 'italic',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '0.5rem'
            }}>
              {(() => {
                const expensePercentage = results.totalRevenue > 0 ? (results.totalExpenses / results.totalRevenue) * 100 : 0
                const isStrategicTarget = Math.abs(expensePercentage - 76) <= 1
                
                if (isStrategicTarget) {
                  return '📋 Current expenses align with Page 2 strategic targets (76% industry standard)'
                } else {
                  return `📋 Current expenses (${expensePercentage.toFixed(1)}%) differ from Page 2 strategic target (76%) due to Inputs Panel adjustments`
                }
              })()}
            </div>
          </div>
          
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
                👥 Personnel ({currency(results.salaries + results.empDeductions)})
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Salaries: {currency(results.salaries)}</div>
                <div>Emp. Deductions: {currency(results.empDeductions)}</div>
              </div>
            </div>

            {/* Facility */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                🏢 Facility ({currency(results.rent + results.telephone + results.utilities)})
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Rent: {currency(results.rent)}</div>
                <div>Telephone: {currency(results.telephone)}</div>
                <div>Utilities: {currency(results.utilities)}</div>
              </div>
            </div>

            {/* Operations */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                ⚙️ Operations ({currency(results.localAdv + results.insurance + results.postage + results.supplies + results.dues + results.bankFees + results.maintenance + results.travelEnt)})
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Local Advertising: {currency(results.localAdv)}</div>
                <div>Insurance: {currency(results.insurance)}</div>
                <div>Office Supplies: {currency(results.supplies)}</div>
                <div>Other Ops: {currency(results.postage + results.dues + results.bankFees + results.maintenance + results.travelEnt)}</div>
              </div>
            </div>

            {/* Franchise */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                🏪 Franchise ({currency(results.royalties + results.advRoyalties + results.taxRushRoyalties)})
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>Tax Prep Royalties: {currency(results.royalties)}</div>
                <div>Adv. Royalties: {currency(results.advRoyalties)}</div>
                {results.taxRushRoyalties > 0 && (
                  <div>TaxRush Royalties: {currency(results.taxRushRoyalties)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Miscellaneous */}
          {results.misc > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div className="section-title" style={{ fontSize: '14px' }}>
                📝 Miscellaneous: {currency(results.misc)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
