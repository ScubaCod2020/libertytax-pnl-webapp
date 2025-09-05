// DebugSidebar.tsx - Collapsible debug sidebar with multiple views
// Professional debug interface that doesn't interfere with main UI

import React, { useState } from 'react'

interface DebugSidebarProps {
  isOpen: boolean
  onClose: () => void
  
  // Debug data
  storageKey: string
  origin: string
  appVersion: string
  isReady: boolean
  isHydrating: boolean
  savedAt: string
  
  // Actions
  onSaveNow: () => void
  onDumpStorage: () => void
  onCopyJSON: () => void
  onClearStorage: () => void
  onShowWizard: () => void
  
  // Additional debug data
  calculations?: any
  appState?: any
}

type DebugView = 'storage' | 'calculations' | 'state' | 'performance'

export default function DebugSidebar(props: DebugSidebarProps) {
  const {
    isOpen, onClose, storageKey, origin, appVersion, isReady, isHydrating, savedAt,
    onSaveNow, onDumpStorage, onCopyJSON, onClearStorage, onShowWizard,
    calculations, appState
  } = props

  const [activeView, setActiveView] = useState<DebugView>('storage')

  if (!isOpen) return null

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 350,
    height: '100vh',
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    color: '#f9fafb',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
    zIndex: 9999,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'monospace',
    fontSize: 12,
  }

  const headerStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#111827',
  }

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #374151',
    background: '#1f2937',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    background: active ? '#374151' : 'transparent',
    color: active ? '#f9fafb' : '#9ca3af',
    cursor: 'pointer',
    fontSize: 11,
    transition: 'all 0.2s ease',
  })

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    overflow: 'auto',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    margin: '4px 0',
    background: '#374151',
    color: '#f9fafb',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    transition: 'background 0.2s ease',
  }

  const renderStorageView = () => (
    <div>
      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#0f172a', borderRadius: 4 }}>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
          📝 <strong>What is this?</strong> Your data is automatically saved to your browser's local storage. 
          This shows the status of your saved data and lets you manage it.
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#f59e0b' }}>💾 Storage Status</div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Storage Key:</div>
        <div style={{ marginBottom: 8, wordBreak: 'break-all' }}>{storageKey}</div>
        
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>App Version:</div>
        <div style={{ marginBottom: 8 }}>{appVersion}</div>
        
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>System Status:</div>
        <div style={{ marginBottom: 8 }}>
          Ready: {isReady ? '✅' : '❌'} | Loading: {isHydrating ? '🔄' : '✅'}
        </div>
        
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Last Auto-Save:</div>
        <div style={{ marginBottom: 8, color: savedAt === '(never)' ? '#ef4444' : '#10b981' }}>{savedAt}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#10b981' }}>🔧 Quick Actions</div>
        <div style={{ display: 'grid', gap: 4 }}>
          <button style={buttonStyle} onClick={onSaveNow} title="Force save your current data now">
            💾 Save Now
          </button>
          <button style={buttonStyle} onClick={onDumpStorage} title="Print all saved data to browser console for debugging">
            🖥️ Dump to Console
          </button>
          <button style={buttonStyle} onClick={onCopyJSON} title="Copy all your data as JSON to clipboard">
            📋 Copy JSON
          </button>
          <button style={buttonStyle} onClick={onShowWizard} title="Restart the setup wizard">
            🧙‍♂️ Reopen Wizard
          </button>
          <button 
            style={{...buttonStyle, backgroundColor: '#dc2626', marginTop: 8}} 
            onClick={onClearStorage} 
            title="⚠️ WARNING: This will delete ALL your saved data!"
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>
    </div>
  )

  const renderCalculationsView = () => (
    <div>
      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#0f172a', borderRadius: 4 }}>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
          🧮 <strong>What is this?</strong> Shows how your P&L numbers are calculated from your inputs. 
          Use this to verify calculations or troubleshoot unexpected results.
        </div>
      </div>

      <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#8b5cf6' }}>📊 Current Calculations</div>
      {calculations ? (
        <div>
          <div style={{ marginBottom: 12, fontSize: 11 }}>
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>Key Results:</div>
            <div>Net Income: ${calculations.netIncome?.toLocaleString() || 'N/A'}</div>
            <div>Net Margin: {calculations.netMarginPct?.toFixed(1) || 'N/A'}%</div>
            <div>Cost/Return: ${calculations.costPerReturn?.toFixed(2) || 'N/A'}</div>
            <div>Total Expenses: ${calculations.totalExpenses?.toLocaleString() || 'N/A'}</div>
          </div>
          
          <details>
            <summary style={{ cursor: 'pointer', color: '#9ca3af', fontSize: 10 }}>
              Show Full Calculation Data
            </summary>
            <pre style={{ fontSize: 9, overflow: 'auto', background: '#111827', padding: 8, borderRadius: 4, marginTop: 8 }}>
              {JSON.stringify(calculations, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div style={{ color: '#9ca3af' }}>No calculation data available</div>
      )}
    </div>
  )

  const renderStateView = () => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#ef4444' }}>App State</div>
      {appState ? (
        <pre style={{ fontSize: 10, overflow: 'auto', background: '#111827', padding: 8, borderRadius: 4 }}>
          {JSON.stringify(appState, null, 2)}
        </pre>
      ) : (
        <div style={{ color: '#9ca3af' }}>No state data available</div>
      )}
    </div>
  )

  const renderPerformanceView = () => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#06b6d4' }}>Performance</div>
      <div>Modules Loaded: {document.querySelectorAll('script').length}</div>
      <div>DOM Nodes: {document.querySelectorAll('*').length}</div>
      <div>Memory: {(performance as any).memory ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A'}</div>
      <div style={{ marginTop: 12 }}>
        <button 
          style={buttonStyle} 
          onClick={() => console.log('Performance timing:', performance.timing)}
        >
          Log Performance Timing
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeView) {
      case 'storage': return renderStorageView()
      case 'calculations': return renderCalculationsView()
      case 'state': return renderStateView()
      case 'performance': return renderPerformanceView()
      default: return renderStorageView()
    }
  }

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>🐛 Debug Panel</div>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#9ca3af', 
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ 
        padding: '8px 16px', 
        fontSize: 11, 
        backgroundColor: '#0f172a', 
        borderBottom: '1px solid #374151',
        color: '#94a3b8'
      }}>
        💡 <strong>Help:</strong> Troubleshoot issues, check data, export for support
      </div>

      <div style={tabsStyle}>
        <button 
          style={tabStyle(activeView === 'storage')} 
          onClick={() => setActiveView('storage')}
          title="💾 Data Storage - Check if changes are saving properly"
        >
          💾 Storage
        </button>
        <button 
          style={tabStyle(activeView === 'calculations')} 
          onClick={() => setActiveView('calculations')}
          title="🧮 Calculations - See how your P&L numbers are computed"
        >
          🧮 Calc
        </button>
        <button 
          style={tabStyle(activeView === 'state')} 
          onClick={() => setActiveView('state')}
          title="📊 Current Values - All your input fields and settings"
        >
          📊 State
        </button>
        <button 
          style={tabStyle(activeView === 'performance')} 
          onClick={() => setActiveView('performance')}
          title="⚡ System Status - App performance and loading states"
        >
          ⚡ Perf
        </button>
      </div>

      <div style={contentStyle}>
        {renderContent()}
      </div>
    </div>
  )
}
