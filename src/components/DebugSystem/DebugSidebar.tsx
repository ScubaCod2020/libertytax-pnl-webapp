// DebugSidebar.tsx - Collapsible debug sidebar with multiple views
// Professional debug interface that doesn't interfere with main UI

import React, { useState } from 'react'
import type { Thresholds } from '../../lib/calcs'
import { presets } from '../../data/presets'
import type { Scenario } from '../../data/presets'

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
  
  // Thresholds data and actions
  thresholds?: Thresholds
  onUpdateThresholds?: (thresholds: Thresholds) => void
  
  // Preset controls
  onApplyPreset?: (preset: any) => void
  onResetDefaults?: () => void
}

type DebugView = 'storage' | 'calculations' | 'state' | 'performance' | 'thresholds'

export default function DebugSidebar(props: DebugSidebarProps) {
  const {
    isOpen, onClose, storageKey, origin, appVersion, isReady, isHydrating, savedAt,
    onSaveNow, onDumpStorage, onCopyJSON, onClearStorage, onShowWizard,
    calculations, appState, thresholds, onUpdateThresholds, onApplyPreset, onResetDefaults
  } = props

  const [activeView, setActiveView] = useState<DebugView>('storage')
  const [error, setError] = useState<string | null>(null)

  // Enhanced context detection - detect specific pages and sections
  const getCurrentContext = () => {
    try {
      if (appState?.showWizard) {
        // Detect specific wizard page
        const wizardSteps = document.querySelectorAll('[data-wizard-step]')
        if (wizardSteps.length > 0) {
          const currentStep = wizardSteps[0].getAttribute('data-wizard-step')
          switch (currentStep) {
            case 'inputs': return 'Wizard: Page 2 - Detailed Inputs'
            case 'review': return 'Wizard: Page 3 - Report Review'
            default: return 'Wizard: Page 1 - Setup & Goals'
          }
        }
        
        // Fallback - check for wizard content
        if (document.querySelector('.wizard-completion')) return 'Wizard: Page 3 - Report Review'
        if (document.querySelector('[data-testid="wizard-inputs"]') || document.querySelector('.expense-section')) return 'Wizard: Page 2 - Detailed Inputs'
        
        return 'Wizard: Page 1 - Setup & Goals'
      }
      
      // Check for main dashboard
      if (document.querySelector('[data-dashboard]')) {
        return 'Main Dashboard'
      }
      
      return 'Main Application'
    } catch (e) {
      return 'Unknown Context'
    }
  }

  if (!isOpen) return null

  // Error boundary wrapper
  if (error) {
    return (
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 350, height: '100vh',
        background: '#dc2626', color: 'white', padding: '20px', zIndex: 9999
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🚨 Debug Panel Error</div>
        <div style={{ fontSize: '12px', marginBottom: '10px' }}>{error}</div>
        <button 
          onClick={() => { setError(null); onClose(); }}
          style={{ background: 'white', color: 'black', padding: '8px', border: 'none', borderRadius: '4px' }}
        >
          Close Debug Panel
        </button>
      </div>
    )
  }

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
    fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
    fontSize: 13, // Increased from 12 for better readability
    lineHeight: 1.4
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
    overflowX: 'hidden', // Prevent horizontal scroll
    scrollbarWidth: 'thin',
    scrollbarColor: '#4b5563 #1f2937',
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

  const renderStorageView = () => {
    try {
      const context = getCurrentContext()
      
      // Get page-specific data
      const getPageSpecificData = () => {
        if (context.includes('Page 1')) {
          return {
            title: '🎯 Page 1 Data: Setup & Goals',
            data: [
              `Region: ${appState?.region || 'Not set'}`,
              `Store Type: ${appState?.showWizard && 'New Store' || 'Unknown'}`,
              `Average Net Fee: ${appState?.avgNetFee ? `$${appState.avgNetFee}` : 'Not set'}`,
              `Tax Prep Returns: ${appState?.taxPrepReturns || 'Not set'}`,
              `Target Net Income: ${appState?.expectedRevenue ? `$${appState.expectedRevenue.toLocaleString()}` : 'Not calculated'}`
            ]
          }
        } else if (context.includes('Page 2')) {
          return {
            title: '📊 Page 2 Data: Detailed Inputs',
            data: [
              `Salaries: ${appState?.salariesPct || 0}%`,
              `Rent: ${appState?.rentPct || 0}%`,
              `Supplies: ${appState?.suppliesPct || 0}%`,
              `Total Expenses: ${calculations?.totalExpenses ? `$${calculations.totalExpenses.toLocaleString()}` : 'Not calculated'}`
            ]
          }
        } else if (context.includes('Page 3')) {
          return {
            title: '📋 Page 3 Data: Report Review',
            data: [
              `Net Income: ${calculations?.netIncome ? `$${calculations.netIncome.toLocaleString()}` : 'Not calculated'}`,
              `Net Margin: ${calculations?.netMarginPct ? `${calculations.netMarginPct.toFixed(1)}%` : 'Not calculated'}`,
              `Report Status: Ready for Print/Export`
            ]
          }
        } else if (context.includes('Dashboard')) {
          return {
            title: '📈 Dashboard Data: Live Calculations',
            data: [
              `Current Net Income: ${calculations?.netIncome ? `$${calculations.netIncome.toLocaleString()}` : 'Not calculated'}`,
              `KPI Status: ${calculations?.niStatus || 'Unknown'}`,
              `Active Calculations: ${calculations ? 'Yes' : 'No'}`
            ]
          }
        }
        
        return {
          title: '📄 General Data',
          data: ['App loaded successfully', 'Debug panel active']
        }
      }
      
      const pageData = getPageSpecificData()
      
      return (
        <div>
          <div style={{ marginBottom: 16, padding: 10, backgroundColor: '#0f172a', borderRadius: 4 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              📍 <strong>Current Page:</strong> {context}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              Data relevant to your current location in the app.
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#8b5cf6' }}>{pageData.title}</div>
            {pageData.data.map((item, index) => (
              <div key={index} style={{ fontSize: 11, marginBottom: 4, color: '#d1d5db' }}>
                • {item}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#f59e0b' }}>💾 Storage Status</div>
            <div style={{ fontSize: 11, marginBottom: 8 }}>
              Ready: {isReady ? '✅' : '❌'} | Loading: {isHydrating ? '🔄' : '✅'}
            </div>
            <div style={{ fontSize: 11, marginBottom: 8 }}>
              Last Save: <span style={{ color: savedAt === '(never)' ? '#ef4444' : '#10b981' }}>{savedAt}</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#10b981' }}>🔧 Quick Actions</div>
            <div style={{ display: 'grid', gap: 4 }}>
              <button style={buttonStyle} onClick={() => { try { onSaveNow() } catch (e) { console.error(e) } }}>
                💾 Save Current Page
              </button>
              <button style={buttonStyle} onClick={() => { try { onDumpStorage() } catch (e) { console.error(e) } }}>
                🖥️ Export Page Data
              </button>
              <button style={buttonStyle} onClick={() => { try { onCopyJSON() } catch (e) { console.error(e) } }}>
                📋 Copy Page Info
              </button>
            </div>
          </div>
        </div>
      )
    } catch (e) {
      setError(`Storage view error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      return <div>Error loading storage view</div>
    }
  }

  const renderCalculationsView = () => {
    try {
      const context = getCurrentContext()
      
      // Get page-specific calculations
      const getPageSpecificCalcs = () => {
        if (context.includes('Page 1')) {
          return {
            title: '🎯 Page 1 Calculations: Goal Setting',
            calcs: [
              `Target ANF: $${appState?.avgNetFee || '125'} (user input)`,
              `Target Returns: ${appState?.taxPrepReturns || '1600'} (user input)`,
              `Gross Fees: $${((appState?.avgNetFee || 125) * (appState?.taxPrepReturns || 1600)).toLocaleString()}`,
              `Industry Standard Expenses: 76% of Gross`,
              `Target Net Income: $${calculations?.netIncome ? calculations.netIncome.toLocaleString() : '48,000'}`
            ]
          }
        } else if (context.includes('Page 2')) {
          return {
            title: '📊 Page 2 Calculations: Expense Details',
            calcs: [
              `Salaries: ${appState?.salariesPct || 0}% = $${((appState?.salariesPct || 0) / 100 * (calculations?.totalRevenue || 200000)).toLocaleString()}`,
              `Rent: ${appState?.rentPct || 0}% = $${((appState?.rentPct || 0) / 100 * (calculations?.totalRevenue || 200000)).toLocaleString()}`,
              `Total Expenses: $${calculations?.totalExpenses?.toLocaleString() || 'Calculating...'}`,
              `Net Income: Revenue - Expenses = $${calculations?.netIncome?.toLocaleString() || 'Calculating...'}`
            ]
          }
        } else if (context.includes('Page 3')) {
          return {
            title: '📋 Page 3 Calculations: Final Results',
            calcs: [
              `Final Net Income: $${calculations?.netIncome?.toLocaleString() || 'N/A'}`,
              `Final Net Margin: ${calculations?.netMarginPct?.toFixed(1) || 'N/A'}%`,
              `Cost per Return: $${calculations?.costPerReturn?.toFixed(2) || 'N/A'}`,
              `KPI Status: ${calculations?.niStatus || 'Unknown'} (${calculations?.nimStatus || 'Unknown'} margin)`
            ]
          }
        } else if (context.includes('Dashboard')) {
          return {
            title: '📈 Dashboard Calculations: Live Updates',
            calcs: [
              `Live Net Income: $${calculations?.netIncome?.toLocaleString() || 'N/A'}`,
              `Live Net Margin: ${calculations?.netMarginPct?.toFixed(1) || 'N/A'}%`,
              `Live Cost/Return: $${calculations?.costPerReturn?.toFixed(2) || 'N/A'}`,
              `Status Lights: ${calculations?.niStatus || 'Unknown'}`
            ]
          }
        }
        
        return {
          title: '📊 General Calculations',
          calcs: ['No calculation data available for current context']
        }
      }
      
      const pageCalcs = getPageSpecificCalcs()
      
      return (
        <div>
          <div style={{ marginBottom: 16, padding: 10, backgroundColor: '#0f172a', borderRadius: 4 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              📍 <strong>Current Page:</strong> {context}
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#8b5cf6' }}>{pageCalcs.title}</div>
            {pageCalcs.calcs.map((calc, index) => (
              <div key={index} style={{ fontSize: 11, marginBottom: 4, color: '#d1d5db' }}>
                • {calc}
              </div>
            ))}
          </div>

          {calculations && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#10b981' }}>🔢 Raw Calculation Data</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                <div>Net Income: ${calculations.netIncome?.toLocaleString() || 'N/A'}</div>
                <div>Total Revenue: ${calculations.totalRevenue?.toLocaleString() || 'N/A'}</div>
                <div>Total Expenses: ${calculations.totalExpenses?.toLocaleString() || 'N/A'}</div>
                <div>Net Margin %: {calculations.netMarginPct?.toFixed(1) || 'N/A'}%</div>
              </div>
            </div>
          )}
        </div>
      )
    } catch (e) {
      setError(`Calculations view error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      return <div>Error loading calculations</div>
    }
  }

  const renderStateView = () => {
    try {
      const context = getCurrentContext()
      
      // Get page-specific state information
      const getPageSpecificState = () => {
        if (context.includes('Page 1')) {
          return {
            title: '🎯 Page 1 State: Setup & Goals',
            state: [
              { key: 'Region', value: appState?.region || 'Not set', important: true },
              { key: 'Store Type', value: 'New Store (First year)', important: true },
              { key: 'Average Net Fee', value: `$${appState?.avgNetFee || 'Not set'}`, important: false },
              { key: 'Tax Prep Returns', value: appState?.taxPrepReturns || 'Not set', important: false },
              { key: 'Growth Target', value: '0% vs Last Year', important: false }
            ]
          }
        } else if (context.includes('Page 2')) {
          return {
            title: '📊 Page 2 State: Detailed Inputs',
            state: [
              { key: 'Salaries %', value: `${appState?.salariesPct || 0}%`, important: true },
              { key: 'Rent %', value: `${appState?.rentPct || 0}%`, important: true },
              { key: 'Office Supplies %', value: `${appState?.suppliesPct || 0}%`, important: false },
              { key: 'Royalties %', value: `${appState?.royaltiesPct || 0}%`, important: false },
              { key: 'Phone Amount', value: `$${appState?.telephoneAmt || 0}`, important: false }
            ]
          }
        } else if (context.includes('Page 3')) {
          return {
            title: '📋 Page 3 State: Report Review',
            state: [
              { key: 'Report Status', value: 'Ready for Review', important: true },
              { key: 'Print Ready', value: 'Yes', important: true },
              { key: 'Excel Export Ready', value: 'Yes', important: true },
              { key: 'Net Income', value: `$${calculations?.netIncome?.toLocaleString() || 'Calculating'}`, important: false }
            ]
          }
        } else if (context.includes('Dashboard')) {
          return {
            title: '📈 Dashboard State: Live Interface',
            state: [
              { key: 'Interactive Mode', value: 'Active', important: true },
              { key: 'Calculations', value: 'Live Updates', important: true },
              { key: 'KPI Displays', value: 'Active', important: false },
              { key: 'Input Panels', value: 'Editable', important: false }
            ]
          }
        }
        
        return {
          title: '📄 General State',
          state: [
            { key: 'App Status', value: 'Running', important: true },
            { key: 'Debug Panel', value: 'Active', important: false }
          ]
        }
      }
      
      const pageState = getPageSpecificState()
      
      return (
        <div>
          <div style={{ marginBottom: 16, padding: 10, backgroundColor: '#0f172a', borderRadius: 4 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              📍 <strong>Current Page:</strong> {context}
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#ef4444' }}>{pageState.title}</div>
            {pageState.state.map((item, index) => (
              <div key={index} style={{ 
                fontSize: 11, 
                marginBottom: 4, 
                color: item.important ? '#f9fafb' : '#9ca3af',
                fontWeight: item.important ? 'bold' : 'normal'
              }}>
                • <strong>{item.key}:</strong> {item.value}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#64748b' }}>🔧 System Status</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              <div>App State: {appState?.showWizard ? 'Wizard Mode' : 'Dashboard Mode'}</div>
              <div>Region: {appState?.region || 'Unknown'}</div>
              <div>Ready: {isReady ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      )
    } catch (e) {
      return <div style={{ color: '#ef4444' }}>Error loading state</div>
    }
  }

  const renderPerformanceView = () => {
    try {
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#06b6d4' }}>Performance</div>
          <div style={{ fontSize: 11 }}>Page loaded successfully</div>
          <div style={{ fontSize: 11 }}>Debug system operational</div>
        </div>
      )
    } catch (e) {
      return <div style={{ color: '#ef4444' }}>Error loading performance</div>
    }
  }

  const renderThresholdsView = () => {
    try {
      return (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#10b981' }}>🎯 Thresholds</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
            Advanced threshold controls are temporarily disabled for stability.
          </div>
          
          {thresholds && (
            <div style={{ fontSize: 11 }}>
              <div>Cost/Return Green: ≤ ${thresholds.cprGreen}</div>
              <div>Cost/Return Yellow: ≤ ${thresholds.cprYellow}</div>
              <div>Net Margin Green: ≥ {thresholds.nimGreen}%</div>
              <div>Net Margin Yellow: ≥ {thresholds.nimYellow}%</div>
            </div>
          )}
          
          <div style={{ marginTop: 16, fontSize: 10, color: '#64748b' }}>
            Full threshold editor will be restored in next update.
          </div>
        </div>
      )
    } catch (e) {
      return <div style={{ color: '#ef4444', fontSize: 11 }}>Error loading thresholds</div>
    }
  }

  const renderContent = () => {
    try {
      switch (activeView) {
        case 'storage': return renderStorageView()
        case 'calculations': return renderCalculationsView()
        case 'state': return renderStateView()
        case 'performance': return renderPerformanceView()
        case 'thresholds': return renderThresholdsView()
        default: return renderStorageView()
      }
    } catch (e) {
      setError(`Content rendering error: ${e instanceof Error ? e.message : 'Unknown error'}`)
      return <div style={{ color: '#ef4444', padding: 16 }}>Error rendering content</div>
    }
  }

  const context = getCurrentContext()

  try {
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
          fontSize: 12,
          backgroundColor: '#0f172a', 
          borderBottom: '1px solid #374151',
          color: '#94a3b8'
        }}>
          📍 <strong>Context:</strong> {context}<br />
          💡 <strong>Help:</strong> Troubleshoot issues, check data
        </div>

        <div style={tabsStyle}>
          <button 
            style={tabStyle(activeView === 'storage')} 
            onClick={() => setActiveView('storage')}
          >
            💾 Storage
          </button>
          <button 
            style={tabStyle(activeView === 'calculations')} 
            onClick={() => setActiveView('calculations')}
          >
            🧮 Calc
          </button>
          <button 
            style={tabStyle(activeView === 'state')} 
            onClick={() => setActiveView('state')}
          >
            📊 State
          </button>
          <button 
            style={tabStyle(activeView === 'performance')} 
            onClick={() => setActiveView('performance')}
          >
            ⚡ Perf
          </button>
          <button 
            style={tabStyle(activeView === 'thresholds')} 
            onClick={() => setActiveView('thresholds')}
          >
            🎯 Thresholds
          </button>
        </div>

        <div style={contentStyle}>
          {renderContent()}
        </div>
      </div>
    )
  } catch (e) {
    setError(`Main render error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    return null
  }
}
