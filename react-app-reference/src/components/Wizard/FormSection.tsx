// FormSection.tsx - Standardized section wrapper for consistent wizard styling
// Provides consistent section headers and styling across all wizard pages

import React from 'react'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  icon?: string
  backgroundColor?: string
  borderColor?: string
  resetButton?: {
    text: string
    onClick: () => void
    title?: string
  }
}

export default function FormSection({ 
  title, 
  description, 
  children, 
  icon,
  backgroundColor = '#fafafa',
  borderColor = '#d1d5db',
  resetButton
}: FormSectionProps) {
  return (
    <div className="expense-section" style={{ 
      marginBottom: '1.5rem',
      border: `1px solid ${borderColor}`,
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor
    }}>
      <div className="section-title" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        fontWeight: 600,
        color: '#374151',
        fontSize: '1.1rem',
        borderBottom: `2px solid #6b7280`,
        paddingBottom: '0.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span>{icon}</span>}
          {title}
        </div>
        
        {resetButton && (
          <button
            type="button"
            onClick={resetButton.onClick}
            title={resetButton.title}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {resetButton.text}
          </button>
        )}
      </div>
      
      {description && (
        <div className="small" style={{ 
          marginBottom: '0.75rem', 
          opacity: 0.8,
          fontStyle: 'italic'
        }}>
          {description}
        </div>
      )}
      
      <div>
        {children}
      </div>
    </div>
  )
}
