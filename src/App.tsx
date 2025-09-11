// App.tsx - Clean main application component using hooks architecture
// Dramatically simplified using custom hooks for state and logic management

import React from 'react'
import WizardShell from './components/WizardShell'
import type { WizardAnswers } from './components/WizardShell'
import Header from './components/Header'
import InputsPanel from './components/InputsPanel'
import Dashboard from './components/Dashboard/Dashboard'
import DebugToggle from './components/DebugSystem/DebugToggle'
import DebugSidebar from './components/DebugSystem/DebugSidebar'
import DebugErrorBoundary from './components/DebugSystem/DebugErrorBoundary'
import Footer from './components/Footer'
import BrandWatermark from './components/BrandWatermark'
import { useAppState } from './hooks/useAppState'
import { useCalculations } from './hooks/useCalculations'
import { usePersistence } from './hooks/usePersistence'
import { usePresets } from './hooks/usePresets'
import { useBranding } from './hooks/useBranding'

export default function App() {
  // Custom hooks for clean separation of concerns
  const appState = useAppState()
  const calculations = useCalculations(appState)
  const persistence = usePersistence()
  const presets = usePresets(appState)
  const branding = useBranding(appState.region) // Apply regional branding
  
  // Initialize wizard state from persistence on app startup
  React.useEffect(() => {
    const wizardState = persistence.getWizardState()
    if (wizardState.showWizard && !appState.showWizard) {
      console.log('🧙‍♂️ Restoring incomplete wizard session')
      appState.setShowWizard(true)
    }
  }, [persistence, appState])
  
  // Debug system state
  const [debugOpen, setDebugOpen] = React.useState(false)
  
  // Reset counter to force wizard remount when reset happens
  const [resetCounter, setResetCounter] = React.useState(0)

  // Wizard handlers
  const handleWizardComplete = (answers: WizardAnswers) => {
    appState.applyWizardAnswers(answers)
    persistence.saveBaseline(appState)
    persistence.saveWizardAnswers(answers) // Save wizard answers for review mode
    persistence.markWizardCompleted() // Mark wizard as completed in storage
    appState.setShowWizard(false)
    persistence.dbg('wizard: completed with answers', answers)
  }

  const handleWizardCancel = () => {
    appState.setShowWizard(false)
    persistence.dbg('wizard: cancelled')
  }

  // Reset handler - now forces wizard remount and shows wizard
  const handleReset = () => {
    persistence.dbg('ui: Reset session - forcing wizard remount')
    appState.resetToDefaults()
    localStorage.removeItem(persistence.STORAGE_KEY)
    setResetCounter(prev => prev + 1) // Force wizard remount by changing key
    appState.setShowWizard(true) // Always show wizard after reset
  }

  // 🔄 BIDIRECTIONAL FLOW: Handle dashboard changes flowing back to wizard
  const handleDashboardToWizard = (updates: any) => {
    // Load current wizard answers
    const currentAnswers = persistence.loadWizardAnswers() || {}
    
    // Merge dashboard changes with existing wizard answers
    const updatedAnswers = { ...currentAnswers, ...updates }
    
    // Save back to wizard persistence
    persistence.saveWizardAnswers(updatedAnswers)
    
    persistence.dbg('dashboard: Updated wizard persistence from dashboard changes', {
      updates,
      mergedAnswers: updatedAnswers
    })
  }

  // Debug panel handlers
  const handleSaveNow = () => { 
    persistence.dbg('ui: Save Now')
    persistence.saveNow() 
  }
  
  const handleDumpStorage = () => { 
    persistence.dbg('ui: Dump storage')
    const env = persistence.loadEnvelope()
    console.log('ENVELOPE', env) 
  }
  
  const handleCopyJSON = () => {
    try {
      const env = persistence.loadEnvelope()
      navigator.clipboard?.writeText(JSON.stringify(env ?? {}, null, 2))
      persistence.dbg('ui: Copied envelope to clipboard')
    } catch {}
  }
  
  const handleClearStorage = () => { 
    persistence.dbg('ui: Clear & reset')
    localStorage.removeItem(persistence.STORAGE_KEY)
    setResetCounter(prev => prev + 1) // Force wizard remount to clear state
  }

  // Debug panel configuration
  const showDebug = persistence.DEBUG || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1')

const savedAt = (() => {
  try {
      const env = persistence.loadEnvelope()
      const iso = env?.meta?.savedAtISO
      return iso ? new Date(iso).toLocaleString() : '(never)'
  } catch {
    return '—'
  }
})()

  // Main render - clean and focused
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Regional Brand Watermark */}
      <BrandWatermark region={appState.region} />
      
      <div style={{ 
        flex: 1, 
        transition: 'margin-right 0.3s ease',
        marginRight: debugOpen ? '350px' : '0',
        position: 'relative',
        zIndex: 1 // Ensure content is above watermark
      }}>
        <Header 
          region={appState.region} 
          setRegion={(newRegion) => {
            appState.setRegion(newRegion)
            // Save region change immediately to persistence
            persistence.saveBaseline({ ...appState, region: newRegion })
          }}
          onReset={handleReset} 
          onShowWizard={() => appState.setShowWizard(true)}
          onShowDashboard={() => appState.setShowWizard(false)}
          onShowReports={() => {
            // Future: Navigate to reports page
            console.log('📊 Reports feature coming soon!')
            // For now, trigger export or show reports modal
          }}
          wizardCompleted={persistence.getWizardState().wizardCompleted}
          showWizard={appState.showWizard}
          currentPage={appState.showWizard ? 'wizard' : 'dashboard'}
          storeType={persistence.loadWizardAnswers()?.storeType}
        />

        {appState.showWizard ? (
          <WizardShell
            key={resetCounter} // Force remount on reset to clear wizard state
            region={appState.region}
            setRegion={(newRegion) => {
              appState.setRegion(newRegion)
              // Save region change immediately to persistence
              persistence.saveBaseline({ ...appState, region: newRegion })
            }}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
            persistence={persistence} // Pass persistence for loading saved answers
          />
        ) : (
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem', alignItems: 'start' }}>
            <InputsPanel
              region={appState.region}
              scenario={appState.scenario}
              setScenario={appState.setScenario}
              avgNetFee={appState.avgNetFee}
              setANF={appState.setANF}
              taxPrepReturns={appState.taxPrepReturns}
              setReturns={appState.setReturns}
              taxRushReturns={appState.taxRushReturns}
              setTaxRush={appState.setTaxRush}
              discountsPct={appState.discountsPct}
              setDisc={appState.setDisc}
              salariesPct={appState.salariesPct}
              setSal={appState.setSal}
              empDeductionsPct={appState.empDeductionsPct}
              setEmpDeductions={appState.setEmpDeductions}
              rentPct={appState.rentPct}
              setRent={appState.setRent}
              telephoneAmt={appState.telephoneAmt}
              setTelephone={appState.setTelephone}
              utilitiesAmt={appState.utilitiesAmt}
              setUtilities={appState.setUtilities}
              localAdvAmt={appState.localAdvAmt}
              setLocalAdv={appState.setLocalAdv}
              insuranceAmt={appState.insuranceAmt}
              setInsurance={appState.setInsurance}
              postageAmt={appState.postageAmt}
              setPostage={appState.setPostage}
              suppliesPct={appState.suppliesPct}
              setSup={appState.setSup}
              duesAmt={appState.duesAmt}
              setDues={appState.setDues}
              bankFeesAmt={appState.bankFeesAmt}
              setBankFees={appState.setBankFees}
              maintenanceAmt={appState.maintenanceAmt}
              setMaintenance={appState.setMaintenance}
              travelEntAmt={appState.travelEntAmt}
              setTravelEnt={appState.setTravelEnt}
              royaltiesPct={appState.royaltiesPct}
              setRoy={appState.setRoy}
              advRoyaltiesPct={appState.advRoyaltiesPct}
              setAdvRoy={appState.setAdvRoy}
              taxRushRoyaltiesPct={appState.taxRushRoyaltiesPct}
              setTaxRushRoy={appState.setTaxRushRoy}
              miscPct={appState.miscPct}
              setMisc={appState.setMisc}
              onSaveToWizard={handleDashboardToWizard}
            />

            <Dashboard results={calculations} />
          </div>
        )}

        <Footer 
          onNavigate={(page) => {
            switch(page) {
              case 'wizard':
                appState.setShowWizard(true)
                break
              case 'dashboard':
                if (persistence.getWizardState().wizardCompleted) {
                  appState.setShowWizard(false)
                }
                break
              case 'pro-tips':
                // Future: Open Pro-Tips modal/panel
                console.log('🔮 Pro-Tips feature coming soon!')
                break
              case 'practice':
                // Future: Open Practice Problems module
                console.log('🎯 Practice Problems feature coming soon!')
                break
              case 'export':
                // Future: Export current state to PDF/Excel
                console.log('📄 Export functionality coming soon!')
                break
              case 'settings':
              case 'reports':
                // Placeholder for future navigation
                console.log(`Navigate to ${page}`)
                break
            }
          }}
          showWizard={appState.showWizard}
          wizardCompleted={persistence.getWizardState().wizardCompleted}
          currentPage={appState.showWizard ? 'wizard' : 'dashboard'}
        />
      </div>

      <DebugToggle
        key={`debug-${appState.region}`}
        show={showDebug}
        isOpen={debugOpen}
        onToggle={() => setDebugOpen(!debugOpen)}
        region={appState.region}
      />

      <DebugErrorBoundary onClose={() => setDebugOpen(false)}>
        <DebugSidebar
          isOpen={debugOpen}
          onClose={() => setDebugOpen(false)}
          storageKey={persistence.STORAGE_KEY}
          origin={persistence.ORIGIN}
          appVersion={persistence.APP_VERSION}
          isReady={persistence.readyRef.current}
          isHydrating={persistence.hydratingRef.current}
          savedAt={savedAt}
          onSaveNow={handleSaveNow}
          onDumpStorage={handleDumpStorage}
          onCopyJSON={handleCopyJSON}
          onClearStorage={handleClearStorage}
          onShowWizard={() => appState.setShowWizard(true)}
          calculations={calculations}
          appState={appState}
          thresholds={appState.thresholds}
          onUpdateThresholds={appState.setThr}
          onApplyPreset={appState.applyPreset}
          onResetDefaults={appState.resetToDefaults}
        />
      </DebugErrorBoundary>
    </div>
  )
}
