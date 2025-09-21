// DebugSidebar.tsx - Collapsible debug sidebar with multiple views
// Professional debug interface that doesn't interfere with main UI

import React, { useState } from 'react';
import type { Thresholds } from '../../lib/calcs';
import { presets } from '../../data/presets';
import type { Scenario } from '../../data/presets';
import SuggestionManager from './SuggestionManager';

interface DebugSidebarProps {
  isOpen: boolean;
  onClose: () => void;

  // Debug data
  storageKey: string;
  origin: string;
  appVersion: string;
  isReady: boolean;
  isHydrating: boolean;
  savedAt: string;

  // Actions
  onSaveNow: () => void;
  onDumpStorage: () => void;
  onCopyJSON: () => void;
  onClearStorage: () => void;
  onShowWizard: () => void;

  // Additional debug data
  calculations?: any;
  appState?: any;

  // Thresholds data and actions
  thresholds?: Thresholds;
  onUpdateThresholds?: (thresholds: Thresholds) => void;

  // Preset controls
  onApplyPreset?: (preset: any) => void;
  onResetDefaults?: () => void;
}

type DebugView =
  | 'storage'
  | 'calculations'
  | 'state'
  | 'performance'
  | 'thresholds'
  | 'suggestions';

export default function DebugSidebar(props: DebugSidebarProps) {
  const {
    isOpen,
    onClose,
    storageKey,
    origin,
    appVersion,
    isReady,
    isHydrating,
    savedAt,
    onSaveNow,
    onDumpStorage,
    onCopyJSON,
    onClearStorage,
    onShowWizard,
    calculations,
    appState,
    thresholds,
    onUpdateThresholds,
    onApplyPreset,
    onResetDefaults,
  } = props;

  const [activeView, setActiveView] = useState<DebugView>('storage');

  if (!isOpen) return null;

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
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#111827',
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #374151',
    background: '#1f2937',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    background: active ? '#374151' : 'transparent',
    color: active ? '#f9fafb' : '#9ca3af',
    cursor: 'pointer',
    fontSize: 11,
    transition: 'all 0.2s ease',
  });

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: '16px',
    overflow: 'auto',
  };

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
  };

  const renderStorageView = () => (
    <div>
      <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#0f172a', borderRadius: 4 }}>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
          📝 <strong>What is this?</strong> Your data is automatically saved to your browser's local
          storage. This shows the status of your saved data and lets you manage it.
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#f59e0b' }}>
          💾 Storage Status
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Storage Key:</div>
        <div style={{ marginBottom: 8, wordBreak: 'break-all' }}>{storageKey}</div>

        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>App Version:</div>
        <div style={{ marginBottom: 8 }}>{appVersion}</div>

        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>System Status:</div>
        <div style={{ marginBottom: 8 }}>
          Ready: {isReady ? '✅' : '❌'} | Loading: {isHydrating ? '🔄' : '✅'}
        </div>

        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 4 }}>Last Auto-Save:</div>
        <div style={{ marginBottom: 8, color: savedAt === '(never)' ? '#ef4444' : '#10b981' }}>
          {savedAt}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#10b981' }}>
          🔧 Quick Actions
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <button style={buttonStyle} onClick={onSaveNow} title="Force save your current data now">
            💾 Save Now
          </button>
          <button
            style={buttonStyle}
            onClick={onDumpStorage}
            title="Print all saved data to browser console for debugging"
          >
            🖥️ Dump to Console
          </button>
          <button
            style={buttonStyle}
            onClick={onCopyJSON}
            title="Copy all your data as JSON to clipboard"
          >
            📋 Copy JSON
          </button>
          <button style={buttonStyle} onClick={onShowWizard} title="Restart the setup wizard">
            🧙‍♂️ Reopen Wizard
          </button>
          <button
            style={{ ...buttonStyle, backgroundColor: '#dc2626', marginTop: 8 }}
            onClick={onClearStorage}
            title="⚠️ WARNING: This will delete ALL your saved data!"
          >
            🗑️ Clear All Data
          </button>
          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: 'pointer', color: '#9ca3af' }}>
              Show all localStorage keys
            </summary>
            <div style={{ marginTop: 8, fontSize: 10, color: '#9ca3af' }}>
              {Object.keys(window.localStorage).length === 0 ? (
                <div>(empty)</div>
              ) : (
                <ul>
                  {Object.keys(window.localStorage).map((k) => (
                    <li key={k} style={{ wordBreak: 'break-all' }}>
                      {k}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );

  const renderCalculationsView = () => {
    // KPI Strategic Analysis for debugging
    const debugKPIStrategic = () => {
      if (!calculations || !appState) return null;

      const revenuePerReturn =
        calculations.totalRevenue > 0 && appState.taxPrepReturns > 0
          ? calculations.totalRevenue / appState.taxPrepReturns
          : 0;

      const cprGreenMin = revenuePerReturn * 0.745; // 74.5%
      const cprGreenMax = revenuePerReturn * 0.775; // 77.5%
      const nimGreenMin = 22.5;
      const nimGreenMax = 25.5;

      return (
        <div
          style={{
            marginBottom: 16,
            padding: 8,
            backgroundColor: '#0f172a',
            borderRadius: 4,
            fontSize: 10,
          }}
        >
          <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: 8 }}>
            🎯 KPI Strategic Analysis
          </div>
          <div style={{ color: '#94a3b8' }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Revenue per Return:</strong> ${revenuePerReturn.toFixed(2)}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Cost/Return Strategic Range:</strong> ${cprGreenMin.toFixed(2)} - $
              {cprGreenMax.toFixed(2)} (GREEN)
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Actual Cost/Return:</strong> ${calculations.costPerReturn?.toFixed(2)}
              <span
                style={{
                  color:
                    calculations.cprStatus === 'green'
                      ? '#10b981'
                      : calculations.cprStatus === 'yellow'
                        ? '#f59e0b'
                        : '#ef4444',
                  fontWeight: 'bold',
                  marginLeft: 4,
                }}
              >
                ({calculations.cprStatus?.toUpperCase()})
              </span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Net Margin Strategic Range:</strong> {nimGreenMin}% - {nimGreenMax}% (GREEN)
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Actual Net Margin:</strong> {calculations.netMarginPct?.toFixed(1)}%
              <span
                style={{
                  color:
                    calculations.nimStatus === 'green'
                      ? '#10b981'
                      : calculations.nimStatus === 'yellow'
                        ? '#f59e0b'
                        : '#ef4444',
                  fontWeight: 'bold',
                  marginLeft: 4,
                }}
              >
                ({calculations.nimStatus?.toUpperCase()})
              </span>
            </div>
            <div style={{ fontSize: 9, color: '#6b7280', marginTop: 8 }}>
              💡 <strong>Expected Result:</strong> When Page 2 shows green, Dashboard should show
              all green KPIs
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#0f172a', borderRadius: 4 }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
            🧮 <strong>What is this?</strong> Shows how your P&L numbers are calculated from your
            inputs. Use this to verify calculations or troubleshoot unexpected results.
          </div>
        </div>

        {debugKPIStrategic()}

        <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#8b5cf6' }}>
          📊 Current Calculations
        </div>
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
              <pre
                style={{
                  fontSize: 9,
                  overflow: 'auto',
                  background: '#111827',
                  padding: 8,
                  borderRadius: 4,
                  marginTop: 8,
                }}
              >
                {JSON.stringify(calculations, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>No calculation data available</div>
        )}
      </div>
    );
  };

  const renderStateView = () => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#ef4444' }}>App State</div>
      {appState ? (
        <pre
          style={{
            fontSize: 10,
            overflow: 'auto',
            background: '#111827',
            padding: 8,
            borderRadius: 4,
          }}
        >
          {JSON.stringify(appState, null, 2)}
        </pre>
      ) : (
        <div style={{ color: '#9ca3af' }}>No state data available</div>
      )}
    </div>
  );

  const renderPerformanceView = () => (
    <div>
      <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#06b6d4' }}>Performance</div>
      <div>Modules Loaded: {document.querySelectorAll('script').length}</div>
      <div>DOM Nodes: {document.querySelectorAll('*').length}</div>
      <div>
        Memory:{' '}
        {(performance as any).memory
          ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB`
          : 'N/A'}
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          style={buttonStyle}
          onClick={() => console.log('Performance timing:', performance.timing)}
        >
          Log Performance Timing
        </button>
      </div>
    </div>
  );

  const renderThresholdsView = () => {
    const [expandedSection, setExpandedSection] = useState<string | null>('kpi');

    // Common styles
    const inputStyle: React.CSSProperties = {
      width: '70px',
      padding: '3px 5px',
      background: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '3px',
      color: '#f9fafb',
      fontSize: '10px',
      fontFamily: 'monospace',
    };

    const labelStyle: React.CSSProperties = {
      display: 'block',
      marginBottom: '3px',
      fontSize: '10px',
      color: '#d1d5db',
    };

    const sectionStyle: React.CSSProperties = {
      marginBottom: '16px',
      background: '#1f2937',
      borderRadius: '6px',
      border: '1px solid #374151',
    };

    const headerStyle: React.CSSProperties = {
      padding: '8px 12px',
      background: '#111827',
      borderRadius: '6px 6px 0 0',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '11px',
      fontWeight: 'bold',
    };

    const contentStyle: React.CSSProperties = {
      padding: '12px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      fontSize: '10px',
    };

    const buttonStyle: React.CSSProperties = {
      padding: '4px 8px',
      background: '#374151',
      border: '1px solid #4b5563',
      borderRadius: '4px',
      color: '#f9fafb',
      cursor: 'pointer',
      fontSize: '10px',
      fontFamily: 'monospace',
    };

    // Section toggle
    const toggleSection = (section: string) => {
      setExpandedSection(expandedSection === section ? null : section);
    };

    return (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 16, color: '#10b981' }}>
          🎯 Advanced Controls
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 16 }}>
          💡 <strong>Power User Controls:</strong> Modify thresholds, presets, and defaults to test
          different scenarios.
        </div>

        {/* KPI Thresholds Section */}
        <div style={sectionStyle}>
          <div style={{ ...headerStyle, color: '#fbbf24' }} onClick={() => toggleSection('kpi')}>
            <span>🎯 KPI Color Thresholds</span>
            <span>{expandedSection === 'kpi' ? '▼' : '▶'}</span>
          </div>
          {expandedSection === 'kpi' && thresholds && onUpdateThresholds && (
            <div style={contentStyle}>
              <div>
                <label style={labelStyle}>Cost/Return Green ≤ $</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.cprGreen}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      cprGreen: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="15.0"
                  aria-label="Cost per Return Green threshold"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Cost/Return Yellow ≤ $</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.cprYellow}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      cprYellow: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="20.0"
                  aria-label="Cost per Return Yellow threshold"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Net Margin Green ≥ %</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.nimGreen}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      nimGreen: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="25.0"
                  aria-label="Net Income Margin Green threshold"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Net Margin Yellow ≥ %</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.nimYellow}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      nimYellow: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="15.0"
                  aria-label="Net Income Margin Yellow threshold"
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Net Income Warning ≤ $</label>
                <input
                  type="number"
                  step="100"
                  value={thresholds.netIncomeWarn}
                  onChange={(e) =>
                    onUpdateThresholds({
                      ...thresholds,
                      netIncomeWarn: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="-5000"
                  aria-label="Net Income Warning threshold"
                  style={inputStyle}
                />
                <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
                  Usually negative (e.g., -5000)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scenario Presets Section */}
        <div style={sectionStyle}>
          <div
            style={{ ...headerStyle, color: '#06b6d4' }}
            onClick={() => toggleSection('presets')}
          >
            <span>📊 Scenario Presets</span>
            <span>{expandedSection === 'presets' ? '▼' : '▶'}</span>
          </div>
          {expandedSection === 'presets' && (
            <div style={{ padding: '12px' }}>
              <div style={{ marginBottom: 12, fontSize: 10, color: '#9ca3af' }}>
                Quick-apply Good/Better/Best scenarios to see different performance levels.
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  marginBottom: 12,
                }}
              >
                {(['Good', 'Better', 'Best'] as const).map((scenario) => (
                  <button
                    key={scenario}
                    style={{
                      ...buttonStyle,
                      background:
                        scenario === 'Good'
                          ? '#065f46'
                          : scenario === 'Better'
                            ? '#1e40af'
                            : '#7c2d12',
                    }}
                    onClick={() => onApplyPreset && onApplyPreset(presets[scenario])}
                  >
                    {scenario}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, color: '#9ca3af' }}>
                <strong>Good:</strong> ANF $130, 1680 returns, 26% salaries
                <br />
                <strong>Better:</strong> ANF $135, 1840 returns, 24% salaries
                <br />
                <strong>Best:</strong> ANF $140, 2000 returns, 22% salaries
              </div>
            </div>
          )}
        </div>

        {/* Expense Defaults Section */}
        <div style={sectionStyle}>
          <div
            style={{ ...headerStyle, color: '#10b981' }}
            onClick={() => toggleSection('expenses')}
          >
            <span>💼 Expense Defaults</span>
            <span>{expandedSection === 'expenses' ? '▼' : '▶'}</span>
          </div>
          {expandedSection === 'expenses' && appState && (
            <div style={{ padding: '12px' }}>
              <div style={{ marginBottom: 12, fontSize: 10, color: '#9ca3af' }}>
                Current expense values. Changes update the main UI instantly.
              </div>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: 9 }}
              >
                <div>
                  <strong>Personnel</strong>
                  <div>Salaries: {appState.salariesPct}%</div>
                  <div>Emp. Deductions: {appState.empDeductionsPct}%</div>
                </div>
                <div>
                  <strong>Facility</strong>
                  <div>Rent: {appState.rentPct}%</div>
                  <div>Phone: ${appState.telephoneAmt}</div>
                  <div>Utilities: ${appState.utilitiesAmt}</div>
                </div>
                <div>
                  <strong>Operations</strong>
                  <div>Supplies: {appState.suppliesPct}%</div>
                  <div>Insurance: ${appState.insuranceAmt}</div>
                  <div>Postage: ${appState.postageAmt}</div>
                </div>
                <div>
                  <strong>Franchise</strong>
                  <div>Royalties: {appState.royaltiesPct}%</div>
                  <div>Adv. Roy: {appState.advRoyaltiesPct}%</div>
                  <div>Misc: {appState.miscPct}%</div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <button style={buttonStyle} onClick={() => onResetDefaults && onResetDefaults()}>
                  🔄 Reset All to Factory Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div
          style={{
            marginTop: 16,
            padding: '8px',
            background: '#0f172a',
            borderRadius: '4px',
            fontSize: 9,
            color: '#94a3b8',
          }}
        >
          <strong>💡 Usage Tips:</strong>
          <br />• <strong>KPI Thresholds:</strong> Lower = easier green status
          <br />• <strong>Scenarios:</strong> Test Good/Better/Best performance levels
          <br />• <strong>Expenses:</strong> View current values, reset if needed
          <br />• All changes auto-save and update UI instantly
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case 'storage':
        return renderStorageView();
      case 'calculations':
        return renderCalculationsView();
      case 'state':
        return renderStateView();
      case 'performance':
        return renderPerformanceView();
      case 'thresholds':
        return renderThresholdsView();
      case 'suggestions':
        return renderSuggestionsView();
      default:
        return renderStorageView();
    }
  };

  const renderSuggestionsView = () => {
    const region = appState?.region || 'US';

    return (
      <SuggestionManager
        region={region}
        onProfileUpdate={(profileKey, profile) => {
          console.log('🎯 DEBUG: Updating suggestion profile', { profileKey, profile });
          // Could save to localStorage or send to server in the future
        }}
      />
    );
  };

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

      <div
        style={{
          padding: '8px 16px',
          fontSize: 11,
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #374151',
          color: '#94a3b8',
        }}
      >
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
        <button
          style={tabStyle(activeView === 'thresholds')}
          onClick={() => setActiveView('thresholds')}
          title="🎯 Thresholds - Adjust KPI thresholds, scenario defaults, and expense defaults"
        >
          🎯 Thresholds
        </button>
        <button
          style={tabStyle(activeView === 'suggestions')}
          onClick={() => setActiveView('suggestions')}
          title="💡 Suggestion Profiles - Manage contextual suggestions and examples"
        >
          💡 Suggest
        </button>
      </div>

      <div style={contentStyle}>{renderContent()}</div>
    </div>
  );
}
