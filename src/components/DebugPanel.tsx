// DebugPanel.tsx - Debug panel for development
// Extracted from App.tsx to improve modularity

import React from 'react'

interface DebugPanelProps {
  show: boolean
  storageKey: string
  origin: string
  appVersion: string
  isReady: boolean
  isHydrating: boolean
  savedAt: string
  onSaveNow: () => void
  onDumpStorage: () => void
  onCopyJSON: () => void
  onClearStorage: () => void
  onShowWizard: () => void
}

export default function DebugPanel(props: DebugPanelProps) {
  const {
    show, storageKey, origin, appVersion, isReady, isHydrating, savedAt,
    onSaveNow, onDumpStorage, onCopyJSON, onClearStorage, onShowWizard
  } = props

  if (!show) return null

  return (
    <div style={{ 
      position: 'fixed', 
      right: 12, 
      bottom: 12, 
      padding: 12, 
      background: '#111', 
      color: '#eee', 
      borderRadius: 8 
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Debug</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>key: {storageKey}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>origin: {origin}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>version: {appVersion}</div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        ready: {String(isReady)} | hydrating: {String(isHydrating)}
      </div>
      <div style={{ fontSize: 12, opacity: 0.8 }}>last saved: {savedAt}</div>
      
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button 
          onClick={onSaveNow} 
          style={{ fontSize: 12 }}
        >
          Save now
        </button>
        
        <button 
          onClick={onDumpStorage} 
          style={{ fontSize: 12 }}
        >
          Dump
        </button>
        
        <button 
          onClick={onCopyJSON} 
          style={{ fontSize: 12 }}
        >
          Copy JSON
        </button>
        
        <button 
          onClick={onClearStorage} 
          style={{ fontSize: 12 }}
        >
          Clear key
        </button>
        
        <button 
          onClick={onShowWizard} 
          style={{ fontSize: 12 }}
        >
          Wizard
        </button>
      </div>
    </div>
  )
}
