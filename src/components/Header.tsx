// Header.tsx - App header with region selector and reset button
// Extracted from App.tsx to improve modularity

import React from 'react'

import type { Region } from '../lib/calcs'

interface HeaderProps {
  region: Region
  setRegion: (region: Region) => void
  onReset: () => void
  onShowWizard: () => void
}

export default function Header({ region, setRegion, onReset, onShowWizard }: HeaderProps) {
  return (
    <div className="header">
      <div className="brand">Liberty Tax • P&L Budget & Forecast (v0.5 preview)</div>
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
          className="ml-3 text-xs underline opacity-80 hover:opacity-100"
          aria-label="Reset entire application to defaults"
          title="Reset entire application - clears ALL data and starts fresh"
        >
          🔄 Reset All Data
        </button>

        {/* Launch Setup Wizard */}
        <button
          onClick={onShowWizard}
          className="ml-3 text-xs underline opacity-80 hover:opacity-100"
          aria-label="Launch Setup Wizard"
          title="Launch Setup Wizard"
          style={{ 
            background: 'linear-gradient(45deg, #4f46e5, #7c3aed)', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: 'none',
            textDecoration: 'none'
          }}
        >
          🚀 Launch Setup Wizard
        </button>
      </div>
    </div>
  )
}
