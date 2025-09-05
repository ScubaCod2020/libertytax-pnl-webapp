// App.tsx - Main application component (REFACTORED VERSION)
// Now using modular components for better maintainability

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { calc, statusForCPR, statusForMargin, statusForNetIncome } from './lib/calcs'
import type { Region, Thresholds } from './lib/calcs'
import { presets } from './data/presets'
import type { Scenario } from './data/presets'
import KPIStoplight from './components/KPIStoplight'
import WizardShell from './components/WizardShell'
import type { WizardAnswers } from './components/WizardShell'
import Header from './components/Header'
import InputsPanel from './components/InputsPanel'
import Dashboard from './components/Dashboard/Dashboard'
import DebugPanel from './components/DebugPanel'
import Footer from './components/Footer'

// App configuration
const APP_VERSION = 'v0.5-preview'
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'ssr'
const STORAGE_KEY = `lt_pnl_v5_session_v1_${APP_VERSION}`

// DEV logging toggle
const DEBUG = true
const dbg = (...args: any[]) => { if (DEBUG) console.log('[app]', ...args) }

// Default thresholds
const defaultThresholds: Thresholds = {
  cprGreen: 25,
  cprYellow: 35,
  nimGreen: 20,
  nimYellow: 10,
  netIncomeWarn: -5000,
}

// Session state type
type SessionState = {
  region: Region
  scenario: Scenario
  avgNetFee: number
  taxPrepReturns: number
  taxRushReturns: number
  discountsPct: number
  
  // All 17 expense fields
  salariesPct: number
  empDeductionsPct: number
  rentPct: number
  telephoneAmt: number
  utilitiesAmt: number
  localAdvAmt: number
  insuranceAmt: number
  postageAmt: number
  suppliesPct: number
  duesAmt: number
  bankFeesAmt: number
  maintenanceAmt: number
  travelEntAmt: number
  royaltiesPct: number
  advRoyaltiesPct: number
  taxRushRoyaltiesPct: number
  miscPct: number
  
  thresholds: Thresholds
}

// Persistence envelope type
type PersistEnvelopeV1 = {
  version: 1
  last?: SessionState
  baselines?: {
    questionnaire?: SessionState
  }
  meta?: {
    lastScenario?: SessionState['scenario']
    savedAtISO?: string
  }
}

export default function App() {
  // State management refs
  const hydratingRef = useRef(true)
  const readyRef = useRef(false)
  const settledRef = useRef(false)
  const taxRushDirtyRef = useRef(false)
  const latestSnapRef = useRef<SessionState | null>(null)

  // UI state
  const [showWizard, setShowWizard] = useState(false)

  // Basic state
  const [region, setRegion] = useState<Region>('US')
  const [scenario, setScenario] = useState<Scenario>('Custom')
  const [avgNetFee, setANF] = useState(125)
  const [taxPrepReturns, setReturns] = useState(1600)
  const [taxRushReturns, setTaxRush] = useState(0)
  const [discountsPct, setDisc] = useState(3)

  // All 17 expense fields
  const [salariesPct, setSal] = useState(25)
  const [empDeductionsPct, setEmpDeductions] = useState(10)
  const [rentPct, setRent] = useState(18)
  const [telephoneAmt, setTelephone] = useState(200)
  const [utilitiesAmt, setUtilities] = useState(300)
  const [localAdvAmt, setLocalAdv] = useState(500)
  const [insuranceAmt, setInsurance] = useState(150)
  const [postageAmt, setPostage] = useState(100)
  const [suppliesPct, setSup] = useState(3.5)
  const [duesAmt, setDues] = useState(200)
  const [bankFeesAmt, setBankFees] = useState(100)
  const [maintenanceAmt, setMaintenance] = useState(150)
  const [travelEntAmt, setTravelEnt] = useState(200)
  const [royaltiesPct, setRoy] = useState(14)
  const [advRoyaltiesPct, setAdvRoy] = useState(5)
  const [taxRushRoyaltiesPct, setTaxRushRoy] = useState(0)
  const [miscPct, setMisc] = useState(2.5)

  // Thresholds
  const [thr, setThr] = useState<Thresholds>(defaultThresholds)

  // Persistence functions
  const loadEnvelope = (): PersistEnvelopeV1 | undefined => {
  try {
    dbg('loadEnvelope()', STORAGE_KEY)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) { dbg('loadEnvelope: no key'); return }
    const parsed = JSON.parse(raw) as PersistEnvelopeV1
    dbg('loadEnvelope: parsed', parsed?.meta?.savedAtISO ?? '(no meta)')
    if (parsed && parsed.version === 1) return parsed
  } catch (e) { dbg('loadEnvelope: ERROR', e) }
  return
}

  const saveEnvelope = (mutator: (prev: PersistEnvelopeV1) => PersistEnvelopeV1) => {
  const prev = loadEnvelope() ?? ({ version: 1 } as PersistEnvelopeV1)
  const next = mutator(prev)
  dbg('saveEnvelope()', next?.meta?.savedAtISO ?? '(no meta)')
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

  const makeSnapshot = (): SessionState => {
  const snap: SessionState = {
      region, scenario, avgNetFee, taxPrepReturns, taxRushReturns, discountsPct,
      salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
      localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt, bankFeesAmt,
      maintenanceAmt, travelEntAmt, royaltiesPct, advRoyaltiesPct, taxRushRoyaltiesPct, miscPct,
    thresholds: thr,
  }
  latestSnapRef.current = snap
  return snap
}

  const saveNow = () => {
    const snap = latestSnapRef.current ?? makeSnapshot()
    dbg('saveNow: writing immediately (snapshot)', snap)
    saveEnvelope(prev => ({
      version: 1,
      ...prev,
      last: snap,
      meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
    }))
  }

  // Wizard integration
  const seedFromWizard = (answers: WizardAnswers) => {
    const a = answers
    
    // Basic fields
    setRegion(a.region)
    setANF(a.avgNetFee ?? 125)
    setReturns(a.taxPrepReturns ?? 1600)
    setDisc(a.discountsPct ?? 3)
    
    // All 17 expense fields with defaults
    setSal(a.salariesPct ?? 25)
    setEmpDeductions(a.empDeductionsPct ?? 10)
    setRent(a.rentPct ?? 18)
    setTelephone(a.telephoneAmt ?? 200)
    setUtilities(a.utilitiesAmt ?? 300)
    setLocalAdv(a.localAdvAmt ?? 500)
    setInsurance(a.insuranceAmt ?? 150)
    setPostage(a.postageAmt ?? 100)
    setSup(a.suppliesPct ?? 3.5)
    setDues(a.duesAmt ?? 200)
    setBankFees(a.bankFeesAmt ?? 100)
    setMaintenance(a.maintenanceAmt ?? 150)
    setTravelEnt(a.travelEntAmt ?? 200)
    setRoy(a.royaltiesPct ?? 14)
    setAdvRoy(a.advRoyaltiesPct ?? 5)
    setTaxRushRoy(a.taxRushRoyaltiesPct ?? 0)
    setMisc(a.miscPct ?? 2.5)
    
    // Set TaxRush returns to 0 for now
    setTaxRush(0)
    
    // Save as questionnaire baseline
    requestAnimationFrame(() => {
      const snap = makeSnapshot()
      saveEnvelope(prev => ({
        version: 1,
        ...prev,
        baselines: {
          ...prev.baselines,
          questionnaire: snap
        },
        last: snap,
        meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
      }))
      setShowWizard(false)
    })
  }

  // Reset session
  const resetSession = () => {
    dbg('ui: Reset session')
    
    setRegion('US')
    setScenario('Custom')
    setANF(125)
    setReturns(1600)
    setTaxRush(0)
    setDisc(3)
    
    // Reset all 17 expense fields
    setSal(25)
    setEmpDeductions(10)
    setRent(18)
    setTelephone(200)
    setUtilities(300)
    setLocalAdv(500)
    setInsurance(150)
    setPostage(100)
    setSup(3.5)
    setDues(200)
    setBankFees(100)
    setMaintenance(150)
    setTravelEnt(200)
    setRoy(14)
    setAdvRoy(5)
    setTaxRushRoy(0)
    setMisc(2.5)
    
    setThr(defaultThresholds)
    
    localStorage.removeItem(STORAGE_KEY)
  }

  // Wizard handlers
  const handleWizardComplete = (answers: WizardAnswers) => {
    seedFromWizard(answers)
    setShowWizard(false)
    dbg('wizard: completed with answers', answers)
  }

  const handleWizardCancel = () => {
    setShowWizard(false)
    dbg('wizard: cancelled')
  }

  // Hydration effect
  useEffect(() => {
    const envelope = loadEnvelope()
    if (envelope?.last) {
      const s = envelope.last
      dbg('hydrate: restoring session', s)
      
    setRegion(s.region)
    setScenario(s.scenario)
    setANF(s.avgNetFee)
    setReturns(s.taxPrepReturns)
    setTaxRush(s.taxRushReturns)
    setDisc(s.discountsPct)
      
      // Restore all 17 expense fields
    setSal(s.salariesPct)
      setEmpDeductions(s.empDeductionsPct)
    setRent(s.rentPct)
      setTelephone(s.telephoneAmt)
      setUtilities(s.utilitiesAmt)
      setLocalAdv(s.localAdvAmt)
      setInsurance(s.insuranceAmt)
      setPostage(s.postageAmt)
    setSup(s.suppliesPct)
      setDues(s.duesAmt)
      setBankFees(s.bankFeesAmt)
      setMaintenance(s.maintenanceAmt)
      setTravelEnt(s.travelEntAmt)
    setRoy(s.royaltiesPct)
    setAdvRoy(s.advRoyaltiesPct)
      setTaxRushRoy(s.taxRushRoyaltiesPct)
    setMisc(s.miscPct)
      
    setThr(s.thresholds)
      
      if (s.region === 'CA' && s.taxRushReturns !== 0) {
  taxRushDirtyRef.current = true
    dbg('hydrate: taxRushDirtyRef -> true (restored CA non-zero)')
  }
  } else {
    taxRushDirtyRef.current = false
    dbg('hydrate: nothing to restore; using defaults')
  }

    // Mark as ready
  requestAnimationFrame(() => {
    hydratingRef.current = false
    readyRef.current = true
      dbg('hydrate: complete, ready=true')
  })
}, [])

  // Preset application effect
useEffect(() => {
    if (hydratingRef.current || !readyRef.current) return
    if (scenario === 'Custom') return

    const preset = presets[scenario]
    if (!preset) return

    // Check if key values already match
    if (preset.avgNetFee === avgNetFee && preset.taxPrepReturns === taxPrepReturns) {
      dbg('preset: key values already match; skipping')
    return
  }

  dbg('preset: applying', scenario)
    setANF(preset.avgNetFee)
    setReturns(preset.taxPrepReturns)
    setDisc(preset.discountsPct)
    
    // Apply all 17 expense fields
    setSal(preset.salariesPct)
    setEmpDeductions(preset.empDeductionsPct)
    setRent(preset.rentPct)
    setTelephone(preset.telephoneAmt)
    setUtilities(preset.utilitiesAmt)
    setLocalAdv(preset.localAdvAmt)
    setInsurance(preset.insuranceAmt)
    setPostage(preset.postageAmt)
    setSup(preset.suppliesPct)
    setDues(preset.duesAmt)
    setBankFees(preset.bankFeesAmt)
    setMaintenance(preset.maintenanceAmt)
    setTravelEnt(preset.travelEntAmt)
    setRoy(preset.royaltiesPct)
    setAdvRoy(preset.advRoyaltiesPct)
    setTaxRushRoy(preset.taxRushRoyaltiesPct)
    setMisc(preset.miscPct)

  if (region === 'US') {
      dbg('preset: US — leaving taxRush untouched (sticky)')
    }
  }, [scenario, region])

  // Region gating effect
  useEffect(() => {
    if (region === 'US' && taxRushReturns !== 0) {
      setTaxRush(0)
    }
    if (region === 'US') {
      taxRushDirtyRef.current = false
    }
  }, [region])

  // Autosave effect
 useEffect(() => {
  if (hydratingRef.current || !readyRef.current) {
    dbg('autosave: skipped (hydrating or not ready)')
    return
  }

  if (!settledRef.current) {
    settledRef.current = true
    latestSnapRef.current = makeSnapshot()
    return
  }

  dbg('autosave: scheduled')
  const id = setTimeout(() => {
      const snap = makeSnapshot()
    dbg('autosave: firing snapshot', snap)
    saveEnvelope(prev => ({
      version: 1,
      ...prev,
      last: snap,
      meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
    }))
  }, 250)

  return () => clearTimeout(id)
}, [
  region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
    discountsPct, salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
    localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt, bankFeesAmt,
    maintenanceAmt, travelEntAmt, royaltiesPct, advRoyaltiesPct, taxRushRoyaltiesPct, miscPct, thr,
  ])

  // Beforeunload flush
useEffect(() => {
  const handleBeforeUnload = () => {
    if (readyRef.current) {
      dbg('beforeunload: flush (using latestSnapRef)')
      saveNow()
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [])

  // Visibility change flush
useEffect(() => {
  const handleVis = () => {
    if (document.visibilityState === 'hidden' && readyRef.current) {
      dbg('visibilitychange: hidden -> flush (using latestSnapRef)')
      saveNow()
    }
  }
  document.addEventListener('visibilitychange', handleVis)
  return () => document.removeEventListener('visibilitychange', handleVis)
}, [])

  // Calculations
  const results = useMemo(() => calc({
    region, scenario, avgNetFee, taxPrepReturns, taxRushReturns, discountsPct,
    salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
    localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt, bankFeesAmt,
    maintenanceAmt, travelEntAmt, royaltiesPct, advRoyaltiesPct, taxRushRoyaltiesPct, miscPct,
      thresholds: thr,
  }), [
    region, scenario, avgNetFee, taxPrepReturns, taxRushReturns, discountsPct,
    salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
    localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt, bankFeesAmt,
    maintenanceAmt, travelEntAmt, royaltiesPct, advRoyaltiesPct, taxRushRoyaltiesPct, miscPct, thr,
  ])

  // KPI statuses
  const cprStatus = useMemo(() => statusForCPR(results.costPerReturn, thr), [results.costPerReturn, thr])
  const nimStatus = useMemo(() => statusForMargin(results.netMarginPct, thr), [results.netMarginPct, thr])
  const niStatus = useMemo(() => statusForNetIncome(results.netIncome, thr), [results.netIncome, thr])

  // Debug panel configuration
  const showDebug = DEBUG || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1')

const savedAt = (() => {
  try {
    const env = loadEnvelope()
      const iso = env?.meta?.savedAtISO
      return iso ? new Date(iso).toLocaleString() : '(never)'
  } catch {
    return '—'
  }
})()

  // Debug panel handlers
  const handleSaveNow = () => { dbg('ui: Save Now'); saveNow() }
  const handleDumpStorage = () => { dbg('ui: Dump storage'); const env = loadEnvelope(); console.log('ENVELOPE', env) }
  const handleCopyJSON = () => {
    try {
      const env = loadEnvelope()
      navigator.clipboard?.writeText(JSON.stringify(env ?? {}, null, 2))
      dbg('ui: Copied envelope to clipboard')
    } catch {}
  }
  const handleClearStorage = () => { dbg('ui: Clear & reset'); localStorage.removeItem(STORAGE_KEY) }
  const handleShowWizard = () => { dbg('ui: Reopen wizard'); setShowWizard(true) }

  // Enhanced results with KPI statuses
  const enhancedResults = { ...results, cprStatus, nimStatus, niStatus }

  // Main render
  return (
    <div> {/* main container */}
      <Header
        region={region}
        setRegion={setRegion}
        onReset={resetSession}
        onShowWizard={() => setShowWizard(true)}
      />

      {showWizard ? (
        <WizardShell
          region={region}
          setRegion={setRegion}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      ) : (
        <div className="container"> {/* main content */}
          <InputsPanel
            region={region}
            scenario={scenario}
            setScenario={setScenario}
            avgNetFee={avgNetFee}
            setANF={setANF}
            taxPrepReturns={taxPrepReturns}
            setReturns={setReturns}
            taxRushReturns={taxRushReturns}
            setTaxRush={setTaxRush}
            discountsPct={discountsPct}
            setDisc={setDisc}
            salariesPct={salariesPct}
            setSal={setSal}
            empDeductionsPct={empDeductionsPct}
            setEmpDeductions={setEmpDeductions}
            rentPct={rentPct}
            setRent={setRent}
            telephoneAmt={telephoneAmt}
            setTelephone={setTelephone}
            utilitiesAmt={utilitiesAmt}
            setUtilities={setUtilities}
            localAdvAmt={localAdvAmt}
            setLocalAdv={setLocalAdv}
            insuranceAmt={insuranceAmt}
            setInsurance={setInsurance}
            postageAmt={postageAmt}
            setPostage={setPostage}
            suppliesPct={suppliesPct}
            setSup={setSup}
            duesAmt={duesAmt}
            setDues={setDues}
            bankFeesAmt={bankFeesAmt}
            setBankFees={setBankFees}
            maintenanceAmt={maintenanceAmt}
            setMaintenance={setMaintenance}
            travelEntAmt={travelEntAmt}
            setTravelEnt={setTravelEnt}
            royaltiesPct={royaltiesPct}
            setRoy={setRoy}
            advRoyaltiesPct={advRoyaltiesPct}
            setAdvRoy={setAdvRoy}
            taxRushRoyaltiesPct={taxRushRoyaltiesPct}
            setTaxRushRoy={setTaxRushRoy}
            miscPct={miscPct}
            setMisc={setMisc}
          />

          <Dashboard results={enhancedResults} />
  </div>
)}

      <DebugPanel
        show={showDebug}
        storageKey={STORAGE_KEY}
        origin={ORIGIN}
        appVersion={APP_VERSION}
        isReady={readyRef.current}
        isHydrating={hydratingRef.current}
        savedAt={savedAt}
        onSaveNow={handleSaveNow}
        onDumpStorage={handleDumpStorage}
        onCopyJSON={handleCopyJSON}
        onClearStorage={handleClearStorage}
        onShowWizard={handleShowWizard}
      />

      <Footer />
    </div> {/* main container */}
  )
}
