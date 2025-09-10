// AnalysisBlock.tsx - Reusable strategic vs tactical analysis component
// Can be used in wizard, dashboard, forecasting, and multi-store views

import React from 'react'

export interface AnalysisData {
  title: string
  icon?: string
  status: 'positive' | 'negative' | 'neutral' | 'warning'
  primaryMetric: {
    label: string
    value: string | number
    change?: {
      amount: number
      percentage: number
      period: string
    }
  }
  secondaryMetrics?: Array<{
    label: string
    value: string | number
    unit?: string
  }>
  insights?: Array<{
    type: 'strategic' | 'tactical' | 'warning' | 'opportunity'
    message: string
  }>
  comparison?: {
    label: string
    baseline: string | number
    current: string | number
    variance: number
  }
}

interface AnalysisBlockProps {
  data: AnalysisData
  size?: 'small' | 'medium' | 'large'
  showComparison?: boolean
  showInsights?: boolean
  onClick?: () => void
}

export default function AnalysisBlock({ 
  data, 
  size = 'medium',
  showComparison = true,
  showInsights = true,
  onClick 
}: AnalysisBlockProps) {
  
  const getStatusColor = (status: AnalysisData['status']) => {
    switch (status) {
      case 'positive': return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' }
      case 'negative': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' }
      case 'warning': return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' }
      default: return { bg: '#f8fafc', border: '#64748b', text: '#475569' }
    }
  }

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small': return { padding: '0.75rem', fontSize: '0.875rem' }
      case 'large': return { padding: '1.5rem', fontSize: '1.1rem' }
      default: return { padding: '1rem', fontSize: '1rem' }
    }
  }

  const colors = getStatusColor(data.status)
  const sizeStyles = getSizeStyles(size)

  return (
    <div 
      onClick={onClick}
      style={{ 
        ...sizeStyles,
        backgroundColor: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        marginBottom: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        ...(onClick && { ':hover': { transform: 'scale(1.02)' } })
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        fontWeight: 'bold',
        color: colors.text
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {data.icon && <span style={{ fontSize: '1.2em' }}>{data.icon}</span>}
          {data.title}
        </div>
        
        {data.primaryMetric.change && (
          <div style={{ 
            fontSize: '0.8em', 
            fontWeight: 'normal',
            opacity: 0.8 
          }}>
            {data.primaryMetric.change.percentage > 0 ? '+' : ''}
            {data.primaryMetric.change.percentage}% {data.primaryMetric.change.period}
          </div>
        )}
      </div>

      {/* Primary Metric */}
      <div style={{ 
        color: colors.text,
        marginBottom: showComparison || showInsights ? '0.75rem' : '0'
      }}>
        <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: '0.25rem' }}>
          {data.primaryMetric.label}
        </div>
        <div style={{ fontSize: '1.4em', fontWeight: 'bold' }}>
          {typeof data.primaryMetric.value === 'number' 
            ? data.primaryMetric.value.toLocaleString()
            : data.primaryMetric.value
          }
        </div>
      </div>

      {/* Secondary Metrics */}
      {data.secondaryMetrics && data.secondaryMetrics.length > 0 && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: size === 'small' ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          fontSize: '0.85em'
        }}>
          {data.secondaryMetrics.map((metric, index) => (
            <div key={index} style={{ color: colors.text }}>
              <div style={{ opacity: 0.7 }}>{metric.label}:</div>
              <div style={{ fontWeight: 'bold' }}>
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString() 
                  : metric.value
                }
                {metric.unit && ` ${metric.unit}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison */}
      {showComparison && data.comparison && (
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem',
          backgroundColor: 'rgba(255,255,255,0.5)',
          borderRadius: '4px',
          marginBottom: '0.75rem',
          fontSize: '0.85em'
        }}>
          <div>
            <span style={{ opacity: 0.7 }}>{data.comparison.label}: </span>
            <span style={{ fontWeight: 'bold' }}>{data.comparison.baseline}</span>
            <span style={{ margin: '0 0.5rem', opacity: 0.5 }}>→</span>
            <span style={{ fontWeight: 'bold' }}>{data.comparison.current}</span>
          </div>
          <div style={{ 
            fontWeight: 'bold',
            color: data.comparison.variance > 0 ? '#059669' : data.comparison.variance < 0 ? '#dc2626' : colors.text
          }}>
            {data.comparison.variance > 0 ? '+' : ''}{data.comparison.variance}%
          </div>
        </div>
      )}

      {/* Insights */}
      {showInsights && data.insights && data.insights.length > 0 && (
        <div style={{ fontSize: '0.8em' }}>
          {data.insights.map((insight, index) => (
            <div 
              key={index}
              style={{ 
                color: colors.text,
                marginBottom: index < data.insights!.length - 1 ? '0.5rem' : '0',
                opacity: 0.9
              }}
            >
              <span style={{ 
                fontWeight: 'bold',
                marginRight: '0.25rem'
              }}>
                {insight.type === 'strategic' && '🎯'}
                {insight.type === 'tactical' && '⚡'}
                {insight.type === 'warning' && '⚠️'}
                {insight.type === 'opportunity' && '💡'}
              </span>
              {insight.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
