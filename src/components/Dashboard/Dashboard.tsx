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
    <div className="card" data-dashboard>
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

      <div style={{ marginTop: 20, gap: '16px' }} className="grid-2">
        <div className="card">
          <div className="card-title">Income Summary</div>
          <div className="small">Gross Fees: {currency(results.grossFees)}</div>
          <div className="small">Discounts: {currency(results.discounts)}</div>
          <div className="small">Tax-Prep Income: {currency(results.taxPrepIncome)}</div>
          <div className="small">Total Returns: {results.totalReturns.toLocaleString()}</div>
        </div>

        <div className="card">
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
          </ul>
        </div>
      </div>

      {/* Comprehensive Expense Breakdown */}
      <div style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-title">
            Expense Breakdown 
            <span className="small" style={{ fontWeight: 400, marginLeft: '8px' }}>
              (Total: {currency(results.totalExpenses)})
            </span>
          </div>
          
          <div className="grid-2" style={{ gap: '20px', marginTop: '12px' }}>
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
