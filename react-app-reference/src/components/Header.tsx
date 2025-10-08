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
  currentPage?: 'wizard' | 'dashboard' | 'reports'  // Track current page
  onShowReports?: () => void  // Navigate to reports page
}

export default function Header({ region, setRegion, onReset, onShowWizard, onShowDashboard, wizardCompleted = false, showWizard = false, storeType, currentPage = 'dashboard', onShowReports }: HeaderProps) {
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
        <div 
          data-testid="app-title"
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1e40af',
            lineHeight: '1.2',
            textAlign: 'center'
          }}
        >
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

      {/* Right Column: Action Buttons - Stacked for better 3-column distribution */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'end',
        gap: '0.5rem',
        justifySelf: 'end',
        minWidth: '180px'
      }}>
        {/* Top Row: Primary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Launch Setup Wizard / Review Setup - Hide when user is actively in wizard */}
          {!showWizard && (
            <button
              data-testid="wizard-launch-btn"
              onClick={onShowWizard}
              aria-label={wizardCompleted ? "Review Setup" : "Launch Setup Wizard"}
              title={wizardCompleted ? "Review and edit your setup configuration" : "Launch Setup Wizard"}
              style={{ 
                background: wizardCompleted 
                  ? 'linear-gradient(45deg, #059669, #10b981)' 
                  : 'linear-gradient(45deg, #4f46e5, #7c3aed)', 
                color: 'white', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                border: 'none',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {wizardCompleted ? '⚙️ Review Setup' : '🚀 Setup Wizard'}
            </button>
          )}

          {/* Dashboard Button - Only show when NOT on dashboard */}
          {wizardCompleted && onShowDashboard && currentPage !== 'dashboard' && (
            <button
              data-testid="dashboard-btn"
              onClick={onShowDashboard}
              style={{ 
                background: 'linear-gradient(45deg, #1e40af, #3b82f6)', 
                color: 'white', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                border: 'none',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title="Go to Interactive Dashboard"
            >
              📊 Dashboard
            </button>
          )}

          {/* Reports Button - Show when on dashboard and wizard is completed */}
          {wizardCompleted && currentPage === 'dashboard' && onShowReports && (
            <button
              onClick={onShowReports}
              style={{ 
                background: 'linear-gradient(45deg, #7c2d12, #dc2626)', 
                color: 'white', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                border: 'none',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title="Generate Reports and Analysis"
            >
              📈 Reports
            </button>
          )}
        </div>

        {/* Bottom Row: Reset Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onReset}
            aria-label="Reset entire application to defaults"
            title="Reset entire application - clears ALL data and starts fresh"
            style={{ 
              background: 'linear-gradient(45deg, #dc2626, #ef4444)', 
              color: 'white', 
              padding: '5px 10px', 
              borderRadius: '5px', 
              border: 'none',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            🔄 Reset All
          </button>
        </div>
      </div>
    </div>

    {/* Configuration Display - Below Header - Match Page 1 Read-Only Format */}
    {wizardCompleted && storeType && (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem 0',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          padding: '1rem',
          border: '2px solid #6b7280',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
          fontSize: '0.9rem',
          minWidth: '500px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏷️ Your Configuration
            <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#6b7280' }}>
              (From Setup Wizard - Read Only)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#374151', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500 }}>Region:</span> 
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                backgroundColor: region === 'US' ? '#dbeafe' : '#fef3c7',
                color: region === 'US' ? '#1e40af' : '#92400e',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {region === 'US' ? 'United States 🇺🇸' : 'Canada 🇨🇦'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500 }}>Store Type:</span>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                backgroundColor: storeType === 'new' ? '#dcfce7' : '#fef3c7',
                color: storeType === 'new' ? '#166534' : '#92400e',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {storeType === 'new' ? '🏢 New Store' : '🏢 Existing Store'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
