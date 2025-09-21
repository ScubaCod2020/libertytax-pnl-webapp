// Dashboard.tsx - Main dashboard component extracted from App.tsx
// Handles the right-side results display with KPIs and expense breakdown

import React from 'react';
import type { CalculationResults } from '../../hooks/useCalculations';
import { currency, pct, getKpiClass } from '../../hooks/useCalculations';
import KPIStoplight from '../KPIStoplight';

interface DashboardProps {
  results: CalculationResults;
  hasOtherIncome?: boolean;
}

export default function Dashboard({ results, hasOtherIncome }: DashboardProps) {
  const { cprStatus, nimStatus, niStatus } = results;

  // Compute ANF safely from projected results flowing into the hook
  const avgNetFee = results.totalReturns > 0 ? results.grossFees / results.totalReturns : 0;

  return (
    <div
      className="card"
      data-dashboard
      style={{ minWidth: '600px', width: '100%', maxWidth: '100%' }}
    >
      <div className="card-title">Dashboard</div>

      {/* KPI Cards */}
      <div className="kpi-vertical" style={{ marginBottom: '1rem' }}>
        <div
          className={getKpiClass(niStatus)}
          style={{ minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <KPIStoplight active={niStatus} />
          <div>
            <div>Net Income</div>
            <div className="value">{currency(results.netIncome)}</div>
            <div className="small">Income − Expenses</div>
          </div>
        </div>

        <div
          className={getKpiClass(nimStatus)}
          style={{ minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <KPIStoplight active={nimStatus} />
          <div>
            <div>Net Margin</div>
            <div className="value">{pct(results.netMarginPct)}</div>
            <div className="small">Net Income ÷ Tax-Prep Income</div>
          </div>
        </div>

        <div
          className={getKpiClass(cprStatus)}
          style={{ minHeight: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <KPIStoplight active={cprStatus} />
          <div>
            <div>Cost / Return</div>
            <div className="value">{currency(results.costPerReturn)}</div>
            <div className="small">Total Expenses ÷ Returns</div>
          </div>
        </div>
      </div>

      {/* Pro-Tips + Income Summary */}
      <div
        style={{
          marginTop: 20,
          gap: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          maxWidth: '100%',
        }}
      >
        {/* Pro-Tips Card */}
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
              <li>Close to breakeven — small changes in ANF or Returns can flip green.</li>
            )}
            {cprStatus === 'green' && nimStatus === 'green' && niStatus === 'green' && (
              <li>Great! Consider "Best" scenario to stress-test capacity.</li>
            )}
          </ul>
        </div>

        {/* Income Summary Card (ordered to match the app-wide template) */}
        <div className="card" style={{ order: 1 }}>
          <div
            className="card-title"
            style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            💰 Income Summary
          </div>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            {/* 1) Tax Prep Returns */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}
            >
              <span>Tax Prep Returns:</span>
              <strong>{results.totalReturns.toLocaleString()}</strong>
            </div>

            {/* 2) Average Net Fee */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}
            >
              <span>Average Net Fee:</span>
              <strong>{currency(avgNetFee)}</strong>
            </div>

            {/* 3) Gross Tax Prep Fees */}
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}
            >
              <span>Gross Tax Prep Fees:</span>
              <strong>{currency(results.grossFees)}</strong>
            </div>

            {/* 4) TaxRush Revenue (if applicable) */}
            {results.taxRushIncome > 0 && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>TaxRush Revenue:</span>
                <strong>{currency(results.taxRushIncome)}</strong>
              </div>
            )}

            {/* 5) Customer Discounts */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.3rem',
                color: '#dc2626',
              }}
            >
              <span>
                Less Discounts:{' '}
                {results.grossFees > 0
                  ? ((results.discounts / results.grossFees) * 100).toFixed(0)
                  : '0'}
                %
              </span>
              <strong>-{currency(results.discounts)}</strong>
            </div>

            {/* 6) Other Income */}
            {hasOtherIncome && results.otherIncome > 0 && (
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span style={{ fontWeight: 'bold', color: '#6b7280' }}>Other Revenue:</span>
                <strong>{currency(results.otherIncome)}</strong>
              </div>
            )}

            {/* 7) Total Expenses */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                color: '#ef4444',
              }}
            >
              <span>Total Expenses:</span>
              <strong>{currency(results.totalExpenses)}</strong>
            </div>

            {/* Total Revenue (footer) */}
            <div
              style={{
                borderTop: '2px solid #059669',
                paddingTop: '0.75rem',
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                fontSize: '1rem',
                color: '#059669',
              }}
            >
              <span>Total Revenue:</span>
              <strong>{currency(results.totalRevenue)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div style={{ marginTop: 16 }}>
        <div className="card">
          <div
            className="card-title"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            💰 Expense Breakdown
            <span className="small" style={{ fontWeight: 400, marginLeft: '8px' }}>
              (Total: {currency(results.totalExpenses)})
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '12px',
              maxWidth: '100%',
            }}
          >
            {/* Personnel */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                👥 Personnel ({currency(results.salaries + results.empDeductions)} •{' '}
                {(
                  ((results.salaries + results.empDeductions) / results.totalRevenue) *
                  100
                ).toFixed(1)}
                %)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>
                  Salaries: {currency(results.salaries)} (
                  {((results.salaries / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Emp. Deductions: {currency(results.empDeductions)} (
                  {((results.empDeductions / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Facility */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                🏢 Facility ({currency(results.rent + results.telephone + results.utilities)} •{' '}
                {(
                  ((results.rent + results.telephone + results.utilities) / results.totalRevenue) *
                  100
                ).toFixed(1)}
                %)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>
                  Rent: {currency(results.rent)} (
                  {((results.rent / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Telephone: {currency(results.telephone)} (
                  {((results.telephone / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Utilities: {currency(results.utilities)} (
                  {((results.utilities / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                ⚙️ Operations (
                {currency(
                  results.localAdv +
                    results.insurance +
                    results.postage +
                    results.supplies +
                    results.dues +
                    results.bankFees +
                    results.maintenance +
                    results.travelEnt
                )}{' '}
                •{' '}
                {(
                  ((results.localAdv +
                    results.insurance +
                    results.postage +
                    results.supplies +
                    results.dues +
                    results.bankFees +
                    results.maintenance +
                    results.travelEnt) /
                    results.totalRevenue) *
                  100
                ).toFixed(1)}
                %)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>
                  Local Advertising: {currency(results.localAdv)} (
                  {((results.localAdv / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Insurance: {currency(results.insurance)} (
                  {((results.insurance / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Office Supplies: {currency(results.supplies)} (
                  {((results.supplies / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Other Ops:{' '}
                  {currency(
                    results.postage +
                      results.dues +
                      results.bankFees +
                      results.maintenance +
                      results.travelEnt
                  )}{' '}
                  (
                  {(
                    ((results.postage +
                      results.dues +
                      results.bankFees +
                      results.maintenance +
                      results.travelEnt) /
                      results.totalRevenue) *
                    100
                  ).toFixed(1)}
                  %)
                </div>
              </div>
            </div>

            {/* Franchise */}
            <div className="expense-category">
              <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                🏪 Franchise (
                {currency(results.royalties + results.advRoyalties + results.taxRushRoyalties)} •{' '}
                {(
                  ((results.royalties + results.advRoyalties + results.taxRushRoyalties) /
                    results.totalRevenue) *
                  100
                ).toFixed(1)}
                %)
              </div>
              <div className="small" style={{ marginLeft: '16px' }}>
                <div>
                  Tax Prep Royalties: {currency(results.royalties)} (
                  {((results.royalties / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                <div>
                  Adv. Royalties: {currency(results.advRoyalties)} (
                  {((results.advRoyalties / results.totalRevenue) * 100).toFixed(1)}%)
                </div>
                {results.taxRushRoyalties > 0 && (
                  <div>
                    TaxRush Royalties: {currency(results.taxRushRoyalties)} (
                    {((results.taxRushRoyalties / results.totalRevenue) * 100).toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Miscellaneous */}
          {results.misc > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div className="section-title" style={{ fontSize: '14px' }}>
                📝 Miscellaneous: {currency(results.misc)} (
                {((results.misc / results.totalRevenue) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
