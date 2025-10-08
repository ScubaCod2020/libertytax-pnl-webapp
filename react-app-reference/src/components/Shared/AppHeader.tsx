// AppHeader.tsx - Reusable header component for consistent branding across all views
// Works for wizard, dashboard, forecasting, multi-store, etc.

import React from 'react'

export interface HeaderAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: string
}

interface AppHeaderProps {
  title: string
  subtitle?: string
  version?: string
  region?: string
  storeInfo?: {
    name?: string
    type: 'single' | 'multi'
    count?: number
  }
  actions?: HeaderAction[]
  breadcrumb?: Array<{
    label: string
    onClick?: () => void
  }>
}

export default function AppHeader({ 
  title, 
  subtitle, 
  version,
  region,
  storeInfo,
  actions = [],
  breadcrumb
}: AppHeaderProps) {
  
  const getActionStyles = (variant: HeaderAction['variant'] = 'secondary') => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#3b82f6',
          color: 'white',
          border: '1px solid #3b82f6'
        }
      case 'danger':
        return {
          backgroundColor: '#ef4444',
          color: 'white', 
          border: '1px solid #ef4444'
        }
      default:
        return {
          backgroundColor: 'white',
          color: '#374151',
          border: '1px solid #d1d5db'
        }
    }
  }

  return (
    <div style={{
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white',
      padding: '1rem 1.5rem',
      marginBottom: '1rem'
    }}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <div style={{ 
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontSize: 'inherit'
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumb.length - 1 && (
                <span style={{ color: '#d1d5db' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header Content */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        {/* Title Section */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.25rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#111827',
              margin: 0,
              fontFamily: 'var(--brand-font-stack, "Proxima Nova", "Inter", Arial, sans-serif)'
            }}>
              {title}
            </h1>
            
            {version && (
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 500
              }}>
                {version}
              </span>
            )}
          </div>

          {subtitle && (
            <p style={{
              color: '#6b7280',
              margin: '0 0 0.75rem 0',
              fontSize: '1rem'
            }}>
              {subtitle}
            </p>
          )}

          {/* Store & Region Info */}
          <div style={{ 
            display: 'flex',
            gap: '1rem',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            {region && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ fontWeight: 500 }}>Region:</span>
                <select 
                  value={region}
                  title="Select region"
                  aria-label="Select region"
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                  // onChange would be handled by parent component
                >
                  <option value="US">🇺🇸 United States</option>
                  <option value="CA">🇨🇦 Canada</option>
                </select>
              </div>
            )}

            {storeInfo && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ fontWeight: 500 }}>Store:</span>
                <span style={{
                  backgroundColor: storeInfo.type === 'multi' ? '#dbeafe' : '#f0fdf4',
                  color: storeInfo.type === 'multi' ? '#1e40af' : '#15803d',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}>
                  {storeInfo.type === 'multi' ? 
                    `🏢 ${storeInfo.count} Stores` : 
                    `🏪 ${storeInfo.name || 'Single Store'}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div style={{ 
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                style={{
                  ...getActionStyles(action.variant),
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
