// Header.tsx - App header with region selector and reset button
// Extracted from App.tsx to improve modularity

import React from 'react'

import type { Region } from '../lib/calcs'

interface HeaderProps {
  region: Region
  setRegion: (region: Region) => void
  onReset: () => void
  onShowWizard: () => void
  onShowDashboard?: () => void  // New prop for dashboard navigation
  wizardCompleted?: boolean
  showWizard?: boolean  // New prop to detect when user is actively in wizard
}

export default function Header({ region, setRegion, onReset, onShowWizard, onShowDashboard, wizardCompleted = false, showWizard = false }: HeaderProps) {
  return (
    <div className="header">
      <div className="brand">Liberty Tax • P&L Budget & Forecast (v0.5 preview)</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="small">
        Region:&nbsp;
        <select
          value={region}
          onChange={(e) => {
            const next = e.target.value as Region
            console.log('[header] region ->', next)
            setRegion(next)
          }}
          aria-label="Region"
        >
          <option value="US">U.S.</option>
          <option value="CA">Canada</option>
        </select>

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
        </div>
        
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
  )
}
