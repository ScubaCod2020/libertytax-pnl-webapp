// Header.tsx - App header with region selector and reset button
// Extracted from App.tsx to improve modularity

import React from 'react'

import type { Region } from '../lib/calcs'
import BrandLogo from './BrandLogo'

interface HeaderProps {
  region: Region
  setRegion: (region: Region) => void
  onReset: () => void
  onShowWizard: () => void
  onShowDashboard?: () => void  // New prop for dashboard navigation
  wizardCompleted?: boolean
  showWizard?: boolean  // New prop to detect when user is actively in wizard
  storeType?: 'new' | 'existing'  // Show store type if selected
}

export default function Header({ region, setRegion, onReset, onShowWizard, onShowDashboard, wizardCompleted = false, showWizard = false, storeType }: HeaderProps) {
  return (
    <>
    <div className="header" style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center', 
      gap: '2rem',
      padding: '16px 0',
      borderBottom: '1px solid #e5e7eb'
    }}>
      {/* Left Column: Regional Logo */}
      <div style={{ justifySelf: 'start' }}>
        <img 
          src={region === 'US' 
            ? '/src/assets/brands/us/LT-2022-Wide-RGB.png'
            : '/src/assets/brands/ca/LT-Canada-Wide-Red.png'
          }
          alt={region === 'US' ? 'Liberty Tax US' : 'Liberty Tax Canada'}
          style={{ 
            height: '60px',
            maxWidth: '220px',
            objectFit: 'contain'
          }}
        />
      </div>
      
      {/* Middle Column: Title + Version (Centered) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifySelf: 'center'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#1e40af',
          lineHeight: '1.2',
          textAlign: 'center'
        }}>
          P&L Budget & Forecast
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontWeight: 500,
          marginTop: '0.25rem'
        }}>
          v0.5 preview
        </span>
      </div>

      {/* Right Column: Action Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        justifySelf: 'end'
      }}>
        {/* Full Reset — clears ALL data and reverts to defaults */}
        <button
          onClick={onReset}
          aria-label="Reset entire application to defaults"
          title="Reset entire application - clears ALL data and starts fresh"
          style={{ 
            background: 'linear-gradient(45deg, #dc2626, #ef4444)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: 'none',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginLeft: '0.75rem'
          }}
        >
          🔄 Reset All Data
        </button>

        {/* Launch Setup Wizard / Review Setup - Hide when user is actively in wizard */}
        {!showWizard && (
          <button
            onClick={onShowWizard}
            aria-label={wizardCompleted ? "Review Setup" : "Launch Setup Wizard"}
            title={wizardCompleted ? "Review and edit your setup configuration" : "Launch Setup Wizard"}
            style={{ 
              background: wizardCompleted 
                ? 'linear-gradient(45deg, #059669, #10b981)' 
                : 'linear-gradient(45deg, #4f46e5, #7c3aed)', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginLeft: '0.75rem'
            }}
          >
            {wizardCompleted ? '⚙️ Review Setup' : '🚀 Launch Setup Wizard'}
          </button>
        )}

        {/* Dashboard Button - Right Side */}
        {wizardCompleted && onShowDashboard && (
          <button
            onClick={onShowDashboard}
            className="dashboard-btn"
            style={{ 
              background: 'linear-gradient(45deg, #1e40af, #3b82f6)', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="Go to Interactive Dashboard"
          >
            📊 Dashboard
          </button>
        )}
      </div>
    </div>

    {/* Configuration Display - Below Header */}
    {wizardCompleted && storeType && (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0.5rem 0',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#059669',
          backgroundColor: '#f0fdf4',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid #bbf7d0'
        }}>
          <span style={{ fontWeight: 500 }}>
            📍 {region === 'US' ? 'United States' : 'Canada'} • {storeType === 'new' ? 'New Store' : 'Existing Store'}
          </span>
        </div>
      </div>
    )}
    </>
  )
}
