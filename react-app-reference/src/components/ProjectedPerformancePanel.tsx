// ProjectedPerformancePanel.tsx - Prior Year vs Projected performance comparison
// Shows last year performance metrics vs projected goals

import React from 'react'
import { currency, pct } from '../hooks/useCalculations'

interface ProjectedPerformancePanelProps {
  // Projected performance (current inputs)
  grossFees: number
  discounts: number
  taxPrepIncome: number
  taxRushIncome: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  netMarginPct: number
  costPerReturn: number
  totalReturns: number
  region: string
  
  // Prior Year data (from wizard answers)
  lastYearRevenue?: number
  lastYearExpenses?: number
  lastYearReturns?: number
  expectedGrowthPct?: number
  handlesTaxRush?: boolean
}

export default function ProjectedPerformancePanel({ 
  grossFees, 
  discounts, 
  taxPrepIncome, 
  taxRushIncome,
  totalRevenue, 
  totalExpenses, 
  netIncome, 
  netMarginPct, 
  costPerReturn, 
  totalReturns,
  region,
  lastYearRevenue = 0,
  lastYearExpenses = 0, 
  lastYearReturns = 0,
  expectedGrowthPct = 0,
  handlesTaxRush = false
}: ProjectedPerformancePanelProps) {
  
  // Calculate prior year metrics using same logic as target calculations
  // PY Net Income = Last Year Revenue - Last Year Expenses  
  const pyNetIncome = lastYearRevenue - lastYearExpenses
  
  // PY Net Margin = (PY Net Income ÷ Last Year Revenue) × 100
  const pyNetMarginPct = lastYearRevenue > 0 ? (pyNetIncome / lastYearRevenue) * 100 : 0
  
  // PY Cost Per Return = Last Year Expenses ÷ Last Year Returns
  const pyCostPerReturn = lastYearReturns > 0 ? lastYearExpenses / lastYearReturns : 0
  
  // Performance status indicators
  const getPerformanceStatus = (metric: string, value: number) => {
    switch (metric) {
      case 'netMargin':
        if (value >= 20) return { status: 'excellent', color: '#059669', icon: '🎯' }
        if (value >= 15) return { status: 'good', color: '#0369a1', icon: '✅' }
        if (value >= 10) return { status: 'fair', color: '#d97706', icon: '⚠️' }
        return { status: 'poor', color: '#dc2626', icon: '🚨' }
      
      case 'costPerReturn':
        if (value <= 85) return { status: 'excellent', color: '#059669', icon: '🎯' }
        if (value <= 100) return { status: 'good', color: '#0369a1', icon: '✅' }
        if (value <= 120) return { status: 'fair', color: '#d97706', icon: '⚠️' }
        return { status: 'poor', color: '#dc2626', icon: '🚨' }
      
      default:
        return { status: 'neutral', color: '#6b7280', icon: '📊' }
    }
  }

  const pyNetMarginStatus = getPerformanceStatus('netMargin', pyNetMarginPct)
  const pyCostPerReturnStatus = getPerformanceStatus('costPerReturn', pyCostPerReturn)
  const projectedNetMarginStatus = getPerformanceStatus('netMargin', netMarginPct)
  const projectedCostPerReturnStatus = getPerformanceStatus('costPerReturn', costPerReturn)

  return (
    <div className="card" style={{ minWidth: '300px', maxWidth: '350px' }}>
      <div className="card-title" style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📈 PY Performance
      </div>
      
      {/* Last Year Performance */}
      {lastYearRevenue > 0 && lastYearExpenses > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '0.9rem', 
            color: '#6b7280', 
            marginBottom: '0.5rem',
            borderBottom: '1px solid #d1d5db',
            paddingBottom: '0.25rem'
          }}>
            📅 Last Year Performance
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.4rem',
            backgroundColor: `${pyNetMarginStatus.color}15`,
            border: `1px solid ${pyNetMarginStatus.color}`,
            borderRadius: '6px',
            marginBottom: '0.4rem'
          }}>
            <span style={{ fontSize: '1rem' }}>{pyNetMarginStatus.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>PY Net Margin</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: pyNetMarginStatus.color }}>
                {pct(pyNetMarginPct)}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.4rem',
            backgroundColor: `${pyCostPerReturnStatus.color}15`,
            border: `1px solid ${pyCostPerReturnStatus.color}`,
            borderRadius: '6px',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>{pyCostPerReturnStatus.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>PY Cost / Return</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: pyCostPerReturnStatus.color }}>
                {currency(pyCostPerReturn)}
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4' }}>
            <div>Revenue: {currency(lastYearRevenue)}</div>
            <div>Expenses: {currency(lastYearExpenses)}</div>
            <div>Returns: {lastYearReturns.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 
      TODO: FUTURE ENHANCEMENT - Projected Performance Goals Section
      
      When transitioning from forecasting to tracking mode, restore this section:
      - Target Net Margin (Reference) with calculated projections
      - Target Cost/Return (Reference) with performance targets  
      - Performance Change display from Page 1 expectedGrowthPct
      - Static reference metrics for PY vs Projected vs Actual comparisons
      
      This will be valuable when users start entering actual numbers to compare
      against their forecasted targets and see performance variance.
      */}

    </div>
  )
}
