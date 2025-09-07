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
import Footer from './components/Footer'
import { useAppState } from './hooks/useAppState'
import { useCalculations } from './hooks/useCalculations'
import { usePersistence } from './hooks/usePersistence'
import { usePresets } from './hooks/usePresets'

export default function App() {
  // Custom hooks for clean separation of concerns
  const appState = useAppState()
  const calculations = useCalculations(appState)
  const persistence = usePersistence()
  const presets = usePresets(appState)
  
  // Debug system state
  const [debugOpen, setDebugOpen] = React.useState(false)

  // Wizard handlers
  const handleWizardComplete = (answers: WizardAnswers) => {
    appState.applyWizardAnswers(answers)
    persistence.saveBaseline(appState)
    appState.setShowWizard(false)
    persistence.dbg('wizard: completed with answers', answers)
  }

  const handleWizardCancel = () => {
    appState.setShowWizard(false)
    persistence.dbg('wizard: cancelled')
  }

  // Reset handler
  const handleReset = () => {
    persistence.dbg('ui: Reset session')
    appState.resetToDefaults()
    localStorage.removeItem(persistence.STORAGE_KEY)
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
      <div style={{ 
        flex: 1, 
        transition: 'margin-right 0.3s ease',
        marginRight: debugOpen ? '350px' : '0'
      }}>
        <Header
          region={appState.region}
          setRegion={appState.setRegion}
          onReset={handleReset}
          onShowWizard={() => appState.setShowWizard(true)}
        />

        {appState.showWizard ? (
          <WizardShell
            region={appState.region}
            setRegion={appState.setRegion}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        ) : (
          <div className="container">
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
            />

            <Dashboard results={calculations} />
          </div>
        )}

        <Footer />
      </div>

      <DebugToggle
        show={showDebug}
        isOpen={debugOpen}
        onToggle={() => setDebugOpen(!debugOpen)}
      />

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
    </div>
  )
}
