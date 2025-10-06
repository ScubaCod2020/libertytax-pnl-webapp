// PerformanceCard.tsx - Reusable performance metric component
// Works for single/multi-store, monthly/annual periods, different metric types

import React from 'react';

export interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  unit: 'currency' | 'percentage' | 'count' | 'custom';
  customUnit?: string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
    period: string;
    baseline?: number;
  };
  target?: {
    value: number;
    status: 'above' | 'below' | 'on-track';
  };
  context?: {
    period: string; // e.g., "Jan 2024", "Q1 2024", "Last Year"
    storeId?: string;
    storeName?: string;
  };
}

interface PerformanceCardProps {
  title: string;
  metrics: PerformanceMetric[];
  variant?: 'compact' | 'detailed' | 'dashboard';
  showTrends?: boolean;
  showTargets?: boolean;
  onClick?: (metric: PerformanceMetric) => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export default function PerformanceCard({
  title,
  metrics,
  variant = 'detailed',
  showTrends = true,
  showTargets = true,
  onClick,
  actions,
}: PerformanceCardProps) {
  const formatValue = (metric: PerformanceMetric): string => {
    const { value, unit, customUnit } = metric;

    switch (unit) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'count':
        return value.toLocaleString();
      case 'custom':
        return `${value.toLocaleString()}${customUnit ? ` ${customUnit}` : ''}`;
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return '#059669';
      case 'down':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getTargetColor = (status: string) => {
    switch (status) {
      case 'above':
        return '#059669';
      case 'below':
        return '#dc2626';
      default:
        return '#0ea5e9';
    }
  };

  const getCardStyles = () => {
    switch (variant) {
      case 'compact':
        return { padding: '0.75rem', minHeight: 'auto' };
      case 'dashboard':
        return { padding: '1.25rem', minHeight: '150px' };
      default:
        return { padding: '1rem', minHeight: '120px' };
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s ease',
        ...getCardStyles(),
        ...(onClick && {
          cursor: 'pointer',
          ':hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.15)' },
        }),
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: variant === 'compact' ? '0.5rem' : '0.75rem',
        }}
      >
        <h3
          style={{
            fontSize: variant === 'compact' ? '0.9rem' : '1.1rem',
            fontWeight: 600,
            color: '#374151',
            margin: 0,
          }}
        >
          {title}
        </h3>

        {actions && actions.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: action.variant === 'primary' ? '#3b82f6' : 'transparent',
                  color: action.variant === 'primary' ? 'white' : '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            variant === 'compact'
              ? '1fr'
              : metrics.length > 2
                ? 'repeat(auto-fit, minmax(150px, 1fr))'
                : '1fr 1fr',
          gap: variant === 'compact' ? '0.5rem' : '0.75rem',
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.id}
            onClick={() => onClick?.(metric)}
            style={{
              cursor: onClick ? 'pointer' : 'default',
              padding: variant === 'compact' ? '0.5rem' : '0.75rem',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease',
              ...(onClick && { ':hover': { backgroundColor: '#f3f4f6' } }),
            }}
          >
            {/* Metric Label */}
            <div
              style={{
                fontSize: variant === 'compact' ? '0.75rem' : '0.85rem',
                color: '#6b7280',
                marginBottom: '0.25rem',
              }}
            >
              {metric.label}
              {metric.context?.storeName && (
                <span style={{ marginLeft: '0.5rem', fontWeight: 500 }}>
                  ({metric.context.storeName})
                </span>
              )}
            </div>

            {/* Metric Value */}
            <div
              style={{
                fontSize: variant === 'compact' ? '1.1rem' : '1.4rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: showTrends || showTargets ? '0.5rem' : 0,
              }}
            >
              {formatValue(metric)}
            </div>

            {/* Trend Information */}
            {showTrends && metric.trend && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: getTrendColor(metric.trend.direction),
                  marginBottom: showTargets && metric.target ? '0.25rem' : 0,
                }}
              >
                <span>{getTrendIcon(metric.trend.direction)}</span>
                <span>
                  {metric.trend.percentage > 0 ? '+' : ''}
                  {metric.trend.percentage.toFixed(1)}%
                </span>
                <span style={{ color: '#9ca3af' }}>vs {metric.trend.period}</span>
              </div>
            )}

            {/* Target Information */}
            {showTargets && metric.target && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: getTargetColor(metric.target.status),
                  fontWeight: 500,
                }}
              >
                Target: {formatValue({ ...metric, value: metric.target.value })}
                <span style={{ marginLeft: '0.25rem' }}>
                  {metric.target.status === 'above' && '✅'}
                  {metric.target.status === 'below' && '⚠️'}
                  {metric.target.status === 'on-track' && '🎯'}
                </span>
              </div>
            )}

            {/* Context */}
            {metric.context?.period && variant !== 'compact' && (
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem',
                }}
              >
                {metric.context.period}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
