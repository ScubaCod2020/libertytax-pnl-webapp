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
  expectedGrowthPct = 0
}: ProjectedPerformancePanelProps) {
  
  // Calculate prior year metrics
  const pyNetIncome = lastYearRevenue - lastYearExpenses
  const pyNetMarginPct = lastYearRevenue > 0 ? (pyNetIncome / lastYearRevenue) * 100 : 0
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

      {/* Projected Performance Goals */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '0.9rem', 
          color: '#059669', 
          marginBottom: '0.5rem',
          borderBottom: '1px solid #d1d5db',
          paddingBottom: '0.25rem'
        }}>
          🎯 Projected Performance Goals
          {expectedGrowthPct !== 0 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#6b7280' }}>
              ({expectedGrowthPct > 0 ? '+' : ''}{expectedGrowthPct}% growth target)
            </span>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.4rem',
          backgroundColor: `${projectedNetMarginStatus.color}15`,
          border: `1px solid ${projectedNetMarginStatus.color}`,
          borderRadius: '6px',
          marginBottom: '0.4rem'
        }}>
          <span style={{ fontSize: '1rem' }}>{projectedNetMarginStatus.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>Target Net Margin</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: projectedNetMarginStatus.color }}>
              {pct(netMarginPct)}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.4rem',
          backgroundColor: `${projectedCostPerReturnStatus.color}15`,
          border: `1px solid ${projectedCostPerReturnStatus.color}`,
          borderRadius: '6px',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1rem' }}>{projectedCostPerReturnStatus.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 500 }}>Target Cost / Return</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: projectedCostPerReturnStatus.color }}>
              {currency(costPerReturn)}
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4' }}>
          <div>Target Revenue: {currency(totalRevenue)}</div>
          <div>Target Expenses: {currency(totalExpenses)}</div>
          <div>Target Returns: {totalReturns.toLocaleString()}</div>
        </div>
      </div>

      {/* Industry Benchmarks */}
      <div style={{ 
        padding: '0.5rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Industry Benchmarks:</div>
        <div>• Net Margin: 20-25% (Excellent)</div>
        <div>• Cost/Return: $85-100 (Good)</div>
        <div>• Expense Ratio: 75-80% (Target)</div>
        <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
          {expectedGrowthPct > 0 && `Growth projection: ${expectedGrowthPct}%`}
        </div>
      </div>
    </div>
  )
}
