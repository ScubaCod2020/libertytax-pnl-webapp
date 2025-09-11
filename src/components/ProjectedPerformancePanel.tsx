// ProjectedPerformancePanel.tsx - Performance targets and projections panel
// Shows projected performance metrics that update with input changes

import React from 'react'
import { currency, pct } from '../hooks/useCalculations'

interface ProjectedPerformancePanelProps {
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
  region 
}: ProjectedPerformancePanelProps) {
  
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

  const netMarginStatus = getPerformanceStatus('netMargin', netMarginPct)
  const costPerReturnStatus = getPerformanceStatus('costPerReturn', costPerReturn)

  // Calculate key ratios and benchmarks
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0
  const revenuePerReturn = totalReturns > 0 ? totalRevenue / totalReturns : 0
  const profitPerReturn = totalReturns > 0 ? netIncome / totalReturns : 0

  return (
    <div className="card" style={{ minWidth: '300px', maxWidth: '350px' }}>
      <div className="card-title" style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📊 Projected Performance
      </div>
      
      {/* Key Performance Metrics */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: `${netMarginStatus.color}15`,
          border: `1px solid ${netMarginStatus.color}`,
          borderRadius: '6px',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{netMarginStatus.icon}</span>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Net Margin</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: netMarginStatus.color }}>
              {pct(netMarginPct)}
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: `${costPerReturnStatus.color}15`,
          border: `1px solid ${costPerReturnStatus.color}`,
          borderRadius: '6px',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{costPerReturnStatus.icon}</span>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>Cost / Return</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: costPerReturnStatus.color }}>
              {currency(costPerReturn)}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Projections */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '0.9rem', 
          color: '#059669', 
          marginBottom: '0.5rem',
          borderBottom: '1px solid #d1d5db',
          paddingBottom: '0.25rem'
        }}>
          Revenue Projections
        </div>
        <div style={{ fontSize: '0.8rem', color: '#374151', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax Prep Income:</span>
            <strong>{currency(taxPrepIncome)}</strong>
          </div>
          {taxRushIncome > 0 && region === 'CA' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0ea5e9' }}>
              <span>TaxRush Income:</span>
              <strong>{currency(taxRushIncome)}</strong>
            </div>
          )}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontWeight: 'bold',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '0.25rem',
            marginTop: '0.25rem'
          }}>
            <span>Total Revenue:</span>
            <strong>{currency(totalRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Performance Ratios */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '0.9rem', 
          color: '#6b7280', 
          marginBottom: '0.5rem',
          borderBottom: '1px solid #d1d5db',
          paddingBottom: '0.25rem'
        }}>
          Key Ratios
        </div>
        <div style={{ fontSize: '0.8rem', color: '#374151', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Revenue / Return:</span>
            <strong>{currency(revenuePerReturn)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Profit / Return:</span>
            <strong>{currency(profitPerReturn)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Expense Ratio:</span>
            <strong>{expenseRatio.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Performance Targets */}
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
        <div>• Returns: {totalReturns.toLocaleString()} processed</div>
      </div>
    </div>
  )
}
