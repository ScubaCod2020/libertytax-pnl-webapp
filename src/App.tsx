// App.tsx — Liberty Tax P&L (Sprint 1: Session Persistence + Region Gating + Preset Gating)
// Includes: saveNow() + beforeunload flush, onBlur save for TaxRush
//adding Wizard callouts and integrating 

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  calc,
  statusForCPR,
  statusForMargin,
  statusForNetIncome,
  type Inputs,
  type Region,
  type Thresholds,
} from './lib/calcs'
import KPIStoplight from './components/KPIStoplight'
import ScenarioSelector from './components/ScenarioSelector'
import Wizard from './components/Wizard'
import { type WizardAnswers } from './components/WizardShell'
import { presets, type Scenario } from './data/presets'

// ──────────────────────────────────────────────────────────────────────────────
// Wizard (Welcome → Inputs → Review)
// This shell uses your existing <Wizard/> as the Welcome step and adds the Inputs & Review steps.
// ──────────────────────────────────────────────────────────────────────────────
import WizardShell, { type WizardAnswers } from './components/WizardShell'


// DEV logging toggle — set to false to silence
const DEBUG = true
const dbg = (...args: any[]) => { if (DEBUG) console.log('[persist]', ...args) }


/* ──────────────────────────────────────────────────────────────────────────────
   1) Formatting helpers
   ────────────────────────────────────────────────────────────────────────────── */
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
const pct = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'

/* ──────────────────────────────────────────────────────────────────────────────
   2) Defaults (swap to config-driven later)
   ────────────────────────────────────────────────────────────────────────────── */
const defaultThresholds: Thresholds = {
  cprGreen: 25,
  cprYellow: 35,
  nimGreen: 20,
  nimYellow: 10,
  netIncomeWarn: -5000,
}

/* ──────────────────────────────────────────────────────────────────────────────
   3) Persistence schema (versioned envelope)
   ────────────────────────────────────────────────────────────────────────────── */
// 3) Persistence schema (versioned envelope)
const APP_VERSION = 'v0.5-preview'
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'ssr'
const STORAGE_KEY = `lt_pnl_v5_session_v1_${APP_VERSION}`


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

type PersistEnvelopeV1 = {
  version: 1
  last?: SessionState
  baselines?: {
    questionnaire?: SessionState
    // custom?: SessionState  // optional future slot
  }
  meta?: {
    lastScenario?: SessionState['scenario']
    savedAtISO?: string
  }
}

function loadEnvelope(): PersistEnvelopeV1 | undefined {
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

function saveEnvelope(mutator: (prev: PersistEnvelopeV1) => PersistEnvelopeV1) {
  const prev = loadEnvelope() ?? ({ version: 1 } as PersistEnvelopeV1)
  const next = mutator(prev)
  dbg('saveEnvelope()', next?.meta?.savedAtISO ?? '(no meta)')
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}


function clearEnvelope() {
  localStorage.removeItem(STORAGE_KEY)
}

/* ──────────────────────────────────────────────────────────────────────────────
   4) The App component
   ────────────────────────────────────────────────────────────────────────────── */
export default function App() {
  /* 4a) UI State */
  const [region, setRegion] = useState<Region>('US')
  const [scenario, setScenario] = useState<Scenario>('Custom')

  const [avgNetFee, setANF] = useState(125)
  const [taxPrepReturns, setReturns] = useState(1600)
  const [taxRushReturns, setTaxRush] = useState(0)

  const [discountsPct, setDisc] = useState(3)
  
  // All 17 expense fields with default values
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

  const [thr, setThr] = useState<Thresholds>(defaultThresholds)

  /* 4b) Wizard state — show on first run, seed baseline on confirm */
  const [showWizard, setShowWizard] = useState<boolean>(() => {
    const env = loadEnvelope()
    const nothingSaved = !env?.last && !env?.baselines?.questionnaire
    return Boolean(nothingSaved)
  })

  /**
   * Seed app state from Wizard answers and persist immediately.
   */
  function seedFromWizard(answers: WizardAnswers) {
    const a = answers
    
    // Basic fields
    setRegion(a.region)
    setANF(a.avgNetFee ?? 125)
    setReturns(a.taxPrepReturns ?? 1600)
    setDisc(a.discountsPct ?? 3)
    
    // All 17 expense fields with defaults from expense structure
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
    
    // Set TaxRush returns to 0 for now (separate from royalties)
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

  
  /* 4b) Hydration + autosave guards
     - hydratingRef: true while restoring from storage
     - readyRef: true after first paint (prevents autosave clobber on load) */
  const hydratingRef = useRef(true)
  const readyRef = useRef(false)
  const settledRef = useRef(false) // first “ready” tick = no-op (prevents clobber)
  
    // NEW: mark when user hand-edits TaxRush while in CA (prevents preset overwrite)
  const taxRushDirtyRef = useRef(false)

    // holds the most recent *complete* snapshot so unload/save never sees defaults
  const latestSnapRef = useRef<SessionState | null>(null)

  
  /* 4c) Snapshot helpers */
  const makeSnapshot = (): SessionState => {
  const snap: SessionState = {
    region,
    scenario,
    avgNetFee,
    taxPrepReturns,
    taxRushReturns,
    discountsPct,
    
    // All 17 expense fields
    salariesPct,
    empDeductionsPct,
    rentPct,
    telephoneAmt,
    utilitiesAmt,
    localAdvAmt,
    insuranceAmt,
    postageAmt,
    suppliesPct,
    duesAmt,
    bankFeesAmt,
    maintenanceAmt,
    travelEntAmt,
    royaltiesPct,
    advRoyaltiesPct,
    taxRushRoyaltiesPct,
    miscPct,
    
    thresholds: thr,
  }
  latestSnapRef.current = snap
  return snap
}


  const applySnapshot = (s: SessionState) => {
    setRegion(s.region)
    setScenario(s.scenario)
    setANF(s.avgNetFee)
    setReturns(s.taxPrepReturns)
    setTaxRush(s.taxRushReturns)
    setDisc(s.discountsPct)
    
    // All 17 expense fields
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
  }

 /* ──────────────────────────────────────────────────────────────────────────
   5) HYDRATION — restore last (or questionnaire baseline), then mark ready
   ────────────────────────────────────────────────────────────────────────── */
useEffect(() => {
  dbg('hydrate: start')
  dbg('hydrate: start @ origin', ORIGIN, 'app', APP_VERSION)

  const env = loadEnvelope()
  const restored = env?.last ?? env?.baselines?.questionnaire

  if (restored) {
    dbg('hydrate: restoring snapshot', restored)
    applySnapshot(restored)

    // Mark CA TaxRush as "user-sticky" if it differs from the scenario preset we restored into.
   const presetTR = presets[restored.scenario]?.taxRushReturns ?? 0
    dbg('hydrate: restored snapshot scenario=%s region=%s taxRush=%s (presetTR=%s)',
    restored.scenario, restored.region, restored.taxRushReturns, presetTR)

// Treat any non-zero CA TaxRush as user-sticky (simplest and robust)
if (restored.region === 'CA' && restored.taxRushReturns !== 0) {
  taxRushDirtyRef.current = true
    dbg('hydrate: taxRushDirtyRef -> true (restored CA non-zero)')
  }
// (Optional stricter variant you can keep as a comment)
// else if (restored.region === 'CA' && restored.taxRushReturns !== presetTR) {
//   taxRushDirtyRef.current = true
//   dbg('hydrate: taxRushDirtyRef -> true (restored != preset)')
// }
  } else {
    taxRushDirtyRef.current = false
    dbg('hydrate: nothing to restore; using defaults')
  }

  // Defer ready flags until state is applied to avoid a clobber window
  requestAnimationFrame(() => {
    hydratingRef.current = false
    readyRef.current = true
    dbg('hydrate: readyRef -> true (post RAF)')
  })
}, [])


 /* ──────────────────────────────────────────────────────────────────────────
   6) PRESETS — apply only when user changes scenario AFTER hydration
   ────────────────────────────────────────────────────────────────────────── */
useEffect(() => {
  if (hydratingRef.current || !readyRef.current) { dbg('preset: skipped (hydrating or not ready)'); return }
  if (scenario === 'Custom') { dbg('preset: Custom (no template applied)'); return }

  const p = presets[scenario]

  // Quick no-op check for NON-TaxRush fields (check key fields only for performance)
  if (
    avgNetFee === p.avgNetFee &&
    taxPrepReturns === p.taxPrepReturns &&
    salariesPct === p.salariesPct &&
    rentPct === p.rentPct
  ) {
    dbg('preset: key values already match (ignoring TaxRush for stickiness); skipping')
    return
  }

  dbg('preset: applying', scenario)
  setANF(p.avgNetFee)
  setReturns(p.taxPrepReturns)
  setDisc(p.discountsPct)
  
  // Apply all 17 expense fields
  setSal(p.salariesPct)
  setEmpDeductions(p.empDeductionsPct)
  setRent(p.rentPct)
  setTelephone(p.telephoneAmt)
  setUtilities(p.utilitiesAmt)
  setLocalAdv(p.localAdvAmt)
  setInsurance(p.insuranceAmt)
  setPostage(p.postageAmt)
  setSup(p.suppliesPct)
  setDues(p.duesAmt)
  setBankFees(p.bankFeesAmt)
  setMaintenance(p.maintenanceAmt)
  setTravelEnt(p.travelEntAmt)
  setRoy(p.royaltiesPct)
  setAdvRoy(p.advRoyaltiesPct)
  setTaxRushRoy(p.taxRushRoyaltiesPct)
  setMisc(p.miscPct)

  if (region === 'US') {
    // US: always force 0 and clear stickiness
    if (taxRushReturns !== 0) dbg('preset: US forces taxRush -> 0')
    setTaxRush(0)
    taxRushDirtyRef.current = false
  } else {
    // CA: DO NOT touch taxRush — leave user value sticky across scenario changes
    dbg('preset: CA — leaving taxRush untouched (sticky)')
  }
}, [scenario, region])  // include region so US/CA rule runs correctly



  /* ──────────────────────────────────────────────────────────────────────────
     7) REGION GATING — Canada-only TaxRush (US forces 0)
     ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (region === 'US' && taxRushReturns !== 0) {
      setTaxRush(0)
    }
    if (region === 'US') {
    taxRushDirtyRef.current = false // NEW: not sticky when US
    }
    // do not depend on taxRushReturns to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region])

  /* ──────────────────────────────────────────────────────────────────────────
     8) AUTOSAVE (debounced) — writes to envelope.last after changes
     ────────────────────────────────────────────────────────────────────────── */
 useEffect(() => {
  if (hydratingRef.current || !readyRef.current) {
    dbg('autosave: skipped (hydrating or not ready)')
    return
  }

  // first ready tick after hydration: do nothing (prevents clobber)
  if (!settledRef.current) {
    settledRef.current = true
    dbg('autosave: first-ready tick (no write)')
    // still capture a snapshot so latestSnapRef is warm
    latestSnapRef.current = makeSnapshot()
    return
  }

  dbg('autosave: scheduled')
  const id = setTimeout(() => {
    const snap = makeSnapshot() // also updates latestSnapRef
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

  /* ──────────────────────────────────────────────────────────────────────────
     8.1) NEW: Immediate save helper + beforeunload flush
          - Fixes "CA TaxRush lost on quick refresh" by flushing final write
     ────────────────────────────────────────────────────────────────────────── */
function saveNow() {
  // prefer the most recent known-good snapshot; fall back to building one
  const snap = latestSnapRef.current ?? makeSnapshot()
  dbg('saveNow: writing immediately (snapshot)', snap)
  saveEnvelope(prev => ({
    version: 1,
    ...prev,
    last: snap,
    meta: { lastScenario: snap.scenario, savedAtISO: new Date().toISOString() },
  }))
}

// beforeunload flush
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

// visibilitychange flush (helps mobile / tab switches)
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

  
  /* ──────────────────────────────────────────────────────────────────────────
     9) WIZARD INTEGRATION — seed from wizard answers
     ────────────────────────────────────────────────────────────────────────── */
  function seedFromWizard(answers: WizardAnswers) {
    const a = answers
    
    // Basic fields
    setRegion(a.region)
    setANF(a.avgNetFee ?? 125)
    setReturns(a.taxPrepReturns ?? 1600)
    setDisc(a.discountsPct ?? 3)
    
    // All 17 expense fields with defaults from expense structure
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
    
    // Set TaxRush returns to 0 for now (separate from royalties)
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
    })
  }

  /* ──────────────────────────────────────────────────────────────────────────
     10) RESET — clear storage and revert to defaults (no hard reload)
     ────────────────────────────────────────────────────────────────────────── */
  function resetSession() {
    clearEnvelope()
    taxRushDirtyRef.current = false // NEW: clear sticky on reset
    setRegion('US')
    setScenario('Custom')
    setANF(125)
    setReturns(1600)
    setTaxRush(0)
    setDisc(3)
    
    // Reset all 17 expense fields to defaults
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
  }

  /* ──────────────────────────────────────────────────────────────────────────
     11) Derived inputs & calculations
     ────────────────────────────────────────────────────────────────────────── */
  const inputs: Inputs = useMemo(
    () => ({
      region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
      discountsPct,
      
      // All 17 expense fields
      salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
      localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt, bankFeesAmt,
      maintenanceAmt, travelEntAmt, royaltiesPct, advRoyaltiesPct, taxRushRoyaltiesPct, miscPct,
      
      thresholds: thr,
    }),
    [
      region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
      discountsPct, salariesPct, empDeductionsPct, rentPct, telephoneAmt, utilitiesAmt,
      localAdvAmt, insuranceAmt, postageAmt, suppliesPct, duesAmt, bankFeesAmt,
      maintenanceAmt, travelEntAmt, royaltiesPct, advRoyaltiesPct, taxRushRoyaltiesPct, miscPct, thr,
    ],
  )

  const r = useMemo(() => calc(inputs), [inputs])

  const cprStatus = statusForCPR(r.costPerReturn, thr)
  const nimStatus = statusForMargin(r.netMarginPct, thr)
  const niStatus  = statusForNetIncome(r.netIncome, thr)

  const kpiClass = (s: 'green' | 'yellow' | 'red') => `kpi ${s}`

  /* ──────────────────────────────────────────────────────────────────────────
     12) Wizard handlers
     ────────────────────────────────────────────────────────────────────────── */
  const handleWizardComplete = (answers: WizardAnswers) => {
    seedFromWizard(answers)
    setShowWizard(false)
    dbg('wizard: completed with answers', answers)
  }

  const handleWizardCancel = () => {
    setShowWizard(false)
    dbg('wizard: cancelled')
  }

  /* ──────────────────────────────────────────────────────────────────────────
     13) UI
     ────────────────────────────────────────────────────────────────────────── */
 // Debug panel state 
const showDebug =
  DEBUG ||
  (typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '1')

const savedAt = (() => {
  try {
    const env = loadEnvelope()
    return env?.meta?.savedAtISO
      ? new Date(env.meta.savedAtISO).toLocaleTimeString()
      : '—'
  } catch {
    return '—'
  }
})()

  return (
    <div>
      <div className="header">
        <div className="brand">Liberty Tax • P&L Budget & Forecast (v0.5 preview)</div>
        <div className="small">
          Region:&nbsp;
          <select
            value={region}
            onChange={(e) => {
            const next = e.target.value as Region
            dbg('ui: region ->', next)
            setRegion(next)
              }}
            aria-label="Region"
          >
            <option value="US">U.S.</option>
            <option value="CA">Canada</option>
          </select>

          {/* Reset — clears storage and reverts to defaults */}
          <button
            onClick={resetSession}
            className="ml-3 text-xs underline opacity-80 hover:opacity-100"
            aria-label="Reset to defaults"
            title="Reset to defaults"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Wizard overlay - shown on first run or when manually toggled */}
      {showWizard ? (
        <div className="container">
          <div className="stack">
            <Wizard
              region={region}
              setRegion={setRegion}
              onComplete={seedFromWizard}
              onCancel={() => setShowWizard(false)}
            />
          </div>
        </div>
      ) : (
        <div className="container">
          {/* Left: Wizard + Inputs */}
          <div className="stack">
            <div className="card">
              <div className="card-title">Quick Inputs</div>
              
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  onClick={() => setShowWizard(true)}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  🧙‍♂️ Launch Setup Wizard
                </button>
                <div className="small" style={{ marginTop: '4px', opacity: 0.7 }}>
                  Comprehensive setup with 17 expense categories
                </div>
              </div>

              {/* Scenario selector drives presets (guarded during hydration) */}
              <ScenarioSelector scenario={scenario} setScenario={setScenario} />

              <div className="section-title">Income Drivers</div>
              <div className="input-row">
                <label>Average Net Fee ($)</label>
                <input
                  type="number"
                  value={avgNetFee}
                  onChange={(e) => setANF(+e.target.value)}
                  onBlur={() => { if (readyRef.current) saveNow() }}
                />
              </div>
              <div className="input-row">
                <label>Tax Prep Returns (#)</label>
                <input
                  type="number"
                  value={taxPrepReturns}
                  onChange={(e) => setReturns(+e.target.value)}
                  onBlur={() => { if (readyRef.current) saveNow() }}
                />
              </div>
              <div className="input-row">
                <label>TaxRush Returns (CA only)</label>
                <input
                  type="number"
                  value={region === 'CA' ? taxRushReturns : 0}
                  disabled={region !== 'CA'}
                  onChange={(e) => {
                    const raw = e.target.value
                    const n = raw === '' ? 0 : +raw
                    setTaxRush(n)
                    if (region === 'CA') taxRushDirtyRef.current = true // NEW: mark sticky
                  }}
                  onBlur={() => { if (region === 'CA' && readyRef.current) { dbg('blur: TaxRush -> saveNow'); saveNow() } }}
                />
              </div>

              <div className="section-title">Expense Percentages</div>
              <div className="grid-2">
                <div className="input-row">
                  <label>Discounts %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={discountsPct}
                    onChange={(e) => setDisc(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Salaries %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salariesPct}
                    onChange={(e) => setSal(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Rent %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rentPct}
                    onChange={(e) => setRent(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Supplies %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={suppliesPct}
                    onChange={(e) => setSup(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Royalties %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={royaltiesPct}
                    onChange={(e) => setRoy(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Adv. Royalties %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={advRoyaltiesPct}
                    onChange={(e) => setAdvRoy(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Misc/Shortages %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={miscPct}
                    onChange={(e) => setMisc(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
              </div>

              <div className="section-title">KPI Thresholds</div>
              <div className="grid-2">
                <div className="input-row">
                  <label>Cost/Return – Green ≤</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.cprGreen}
                    onChange={(e) => setThr({ ...thr, cprGreen: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Cost/Return – Yellow ≤</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.cprYellow}
                    onChange={(e) => setThr({ ...thr, cprYellow: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Net Margin – Green ≥ %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.nimGreen}
                    onChange={(e) => setThr({ ...thr, nimGreen: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Net Margin – Yellow ≥ %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.nimYellow}
                    onChange={(e) => setThr({ ...thr, nimYellow: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Net Income – Red at or below</label>
                  <input
                    type="number"
                    step="100"
                    value={thr.netIncomeWarn}
                    onChange={(e) => setThr({ ...thr, netIncomeWarn: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results Dashboard */}
          <div className="card">
            <div className="card-title">Dashboard</div>

            <div className="kpi-vertical">
              <div className={kpiClass(niStatus)}>
                <KPIStoplight active={niStatus} />
                <div>
                  <div>Net Income</div>
                  <div className="value">{currency(r.netIncome)}</div>
                  <div className="small">Income − Expenses</div>
                </div>
              </div>
=======
      <div className="container">
        {/* Left: Wizard + Inputs */}
        <div className="stack">
          {showWizard ? (
            <Wizard
              region={region}
              setRegion={setRegion}
              onComplete={handleWizardComplete}
              onCancel={handleWizardCancel}
            />
          ) : (
            <div className="card">
              <div className="card-title">Quick Inputs</div>
              
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  onClick={() => setShowWizard(true)}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  🧙‍♂️ Launch Setup Wizard
                </button>
                <div className="small" style={{ marginTop: '4px', opacity: 0.7 }}>
                  Comprehensive setup with 17 expense categories
                </div>
              </div>

              {/* Scenario selector drives presets (guarded during hydration) */}
              <ScenarioSelector scenario={scenario} setScenario={setScenario} />

              <div className="section-title">Income Drivers</div>
              <div className="input-row">
                <label>Average Net Fee ($)</label>
                <input
                  type="number"
                  value={avgNetFee}
                  onChange={(e) => setANF(+e.target.value)}
                  onBlur={() => { if (readyRef.current) saveNow() }}
                />
              </div>
              <div className="input-row">
                <label>Tax Prep Returns (#)</label>
                <input
                  type="number"
                  value={taxPrepReturns}
                  onChange={(e) => setReturns(+e.target.value)}
                  onBlur={() => { if (readyRef.current) saveNow() }}
                />
              </div>
              <div className="input-row">
                <label>TaxRush Returns (CA only)</label>
                <input
                  type="number"
                  value={region === 'CA' ? taxRushReturns : 0}
                  disabled={region !== 'CA'}
                  onChange={(e) => {
                    const raw = e.target.value
                    const n = raw === '' ? 0 : +raw
                    setTaxRush(n)
                    if (region === 'CA') taxRushDirtyRef.current = true // NEW: mark sticky
                  }}
                  onBlur={() => { if (region === 'CA' && readyRef.current) { dbg('blur: TaxRush -> saveNow'); saveNow() } }}
                />
              </div>

              <div className="section-title">Expense Percentages</div>
              <div className="grid-2">
                <div className="input-row">
                  <label>Discounts %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={discountsPct}
                    onChange={(e) => setDisc(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Salaries %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={salariesPct}
                    onChange={(e) => setSal(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Rent %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rentPct}
                    onChange={(e) => setRent(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Supplies %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={suppliesPct}
                    onChange={(e) => setSup(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Royalties %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={royaltiesPct}
                    onChange={(e) => setRoy(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Adv. Royalties %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={advRoyaltiesPct}
                    onChange={(e) => setAdvRoy(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Misc/Shortages %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={miscPct}
                    onChange={(e) => setMisc(+e.target.value)}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
              </div>

              <div className="section-title">KPI Thresholds</div>
              <div className="grid-2">
                <div className="input-row">
                  <label>Cost/Return – Green ≤</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.cprGreen}
                    onChange={(e) => setThr({ ...thr, cprGreen: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Cost/Return – Yellow ≤</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.cprYellow}
                    onChange={(e) => setThr({ ...thr, cprYellow: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Net Margin – Green ≥ %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.nimGreen}
                    onChange={(e) => setThr({ ...thr, nimGreen: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Net Margin – Yellow ≥ %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thr.nimYellow}
                    onChange={(e) => setThr({ ...thr, nimYellow: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
                <div className="input-row">
                  <label>Net Income – Red at or below</label>
                  <input
                    type="number"
                    step="100"
                    value={thr.netIncomeWarn}
                    onChange={(e) => setThr({ ...thr, netIncomeWarn: +e.target.value })}
                    onBlur={() => readyRef.current && saveNow()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results Dashboard */}
        <div className="card">
          <div className="card-title">Dashboard</div>

          <div className="kpi-vertical">
            <div className={kpiClass(niStatus)}>
              <KPIStoplight active={niStatus} />
              <div>
                <div>Net Income</div>
                <div className="value">{currency(r.netIncome)}</div>
                <div className="small">Income − Expenses</div>
              </div>
            </div>

            <div className={kpiClass(nimStatus)}>
                <KPIStoplight active={nimStatus} />
                <div>
                  <div>Net Margin</div>
                  <div className="value">{pct(r.netMarginPct)}</div>
                  <div className="small">Net Income ÷ Tax-Prep Income</div>
                </div>
              </div>

              <div className={kpiClass(cprStatus)}>
                <KPIStoplight active={cprStatus} />
                <div>
                  <div>Cost / Return</div>
                  <div className="value">{currency(r.costPerReturn)}</div>
                  <div className="small">Total Expenses ÷ Returns</div>
                </div>
              </div>
            </div>

                      <div style={{ marginTop: 16 }} className="grid-2">
            <div className="card">
              <div className="card-title">Income Summary</div>
              <div className="small">Gross Fees: {currency(r.grossFees)}</div>
              <div className="small">Discounts: {currency(r.discounts)}</div>
              <div className="small">Tax-Prep Income: {currency(r.taxPrepIncome)}</div>
              <div className="small">Total Returns: {r.totalReturns.toLocaleString()}</div>
            </div>

            <div className="card">
              <div className="card-title">Pro-Tips</div>
              <ul className="small">
                {cprStatus === 'red' && (
                  <li>Cost/Return is high — review Personnel and Facility costs.</li>
                )}
                {nimStatus === 'red' && (
                  <li>Margin is low — consider raising ANF or reducing discounts.</li>
                )}
                {niStatus === 'red' && (
                  <li>Net Income negative — check Franchise fees and Operations costs.</li>
                )}
                {niStatus === 'yellow' && (
                  <li>
                    Close to breakeven — small changes in ANF or Returns can flip green.
                  </li>
                )}
                {cprStatus === 'green' &&
                  nimStatus === 'green' &&
                  niStatus === 'green' && (
                    <li>Great! Consider "Best" scenario to stress-test capacity.</li>
                  )}
              </ul>
            </div>
          </div>

          {/* Comprehensive Expense Breakdown */}
          <div style={{ marginTop: 16 }}>
            <div className="card">
              <div className="card-title">
                Expense Breakdown 
                <span className="small" style={{ fontWeight: 400, marginLeft: '8px' }}>
                  (Total: {currency(r.totalExpenses)})
                </span>
              </div>
              
              <div className="grid-2" style={{ gap: '16px' }}>
                {/* Personnel */}
                <div className="expense-category">
                  <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    👥 Personnel ({currency(r.salaries + r.empDeductions)})
                  </div>
                  <div className="small" style={{ marginLeft: '16px' }}>
                    <div>Salaries: {currency(r.salaries)}</div>
                    <div>Emp. Deductions: {currency(r.empDeductions)}</div>
                  </div>
                </div>

                {/* Facility */}
                <div className="expense-category">
                  <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    🏢 Facility ({currency(r.rent + r.telephone + r.utilities)})
                  </div>
                  <div className="small" style={{ marginLeft: '16px' }}>
                    <div>Rent: {currency(r.rent)}</div>
                    <div>Telephone: {currency(r.telephone)}</div>
                    <div>Utilities: {currency(r.utilities)}</div>
                  </div>
                </div>

                {/* Operations */}
                <div className="expense-category">
                  <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    ⚙️ Operations ({currency(r.localAdv + r.insurance + r.postage + r.supplies + r.dues + r.bankFees + r.maintenance + r.travelEnt)})
                  </div>
                  <div className="small" style={{ marginLeft: '16px' }}>
                    <div>Local Advertising: {currency(r.localAdv)}</div>
                    <div>Insurance: {currency(r.insurance)}</div>
                    <div>Office Supplies: {currency(r.supplies)}</div>
                    <div>Other Ops: {currency(r.postage + r.dues + r.bankFees + r.maintenance + r.travelEnt)}</div>
                  </div>
                </div>

                {/* Franchise */}
                <div className="expense-category">
                  <div className="section-title" style={{ fontSize: '14px', marginBottom: '8px' }}>
                    🏪 Franchise ({currency(r.royalties + r.advRoyalties + r.taxRushRoyalties)})
                  </div>
                  <div className="small" style={{ marginLeft: '16px' }}>
                    <div>Tax Prep Royalties: {currency(r.royalties)}</div>
                    <div>Adv. Royalties: {currency(r.advRoyalties)}</div>
                    {r.taxRushRoyalties > 0 && (
                      <div>TaxRush Royalties: {currency(r.taxRushRoyalties)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Miscellaneous */}
              {r.misc > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div className="section-title" style={{ fontSize: '14px' }}>
                    📝 Miscellaneous: {currency(r.misc)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      
{showDebug && (
  <div style={{ position:'fixed', right:12, bottom:12, padding:12, background:'#111', color:'#eee', borderRadius:8 }}>
    <div style={{ fontWeight:700, marginBottom:6 }}>Debug</div>
    <div style={{ fontSize:12, opacity:.8 }}>key: {STORAGE_KEY}</div>
    <div style={{ fontSize:12, opacity:.8 }}>origin: {ORIGIN}</div>
    <div style={{ fontSize:12, opacity:.8 }}>version: {APP_VERSION}</div>
    <div style={{ fontSize:12, opacity:.8 }}>ready: {String(readyRef.current)} | hydrating: {String(hydratingRef.current)}</div>
    <div style={{ fontSize:12, opacity:.8 }}>last saved: {savedAt}</div>
    <div style={{ display:'flex', gap:8, marginTop:8 }}>
      <button onClick={() => { dbg('ui: Save Now'); saveNow() }} style={{ fontSize:12 }}>Save now</button>
      <button onClick={() => { 
        dbg('ui: Dump storage'); 
        const env = loadEnvelope(); 
        console.log('ENVELOPE', env) 
      }} style={{ fontSize:12 }}>Dump</button>
      <button onClick={() => { 
        try {
          const env = loadEnvelope();
          navigator.clipboard?.writeText(JSON.stringify(env ?? {}, null, 2));
          dbg('ui: Copied envelope to clipboard');
        } catch {}
      }} style={{ fontSize:12 }}>Copy JSON</button>
      <button onClick={() => { 
        dbg('ui: Clear & reset'); 
        localStorage.removeItem(STORAGE_KEY); 
      }} style={{ fontSize:12 }}>Clear key</button>
<button onClick={() => { 
  dbg('ui: Reopen wizard'); 
  setShowWizard(true);
}} style={{ fontSize:12 }}>Wizard</button>

      
    </div>
  </div>
)}

      )}
      
      <div className="footer">
        Preview web app • Persistence enabled • Region gating (TaxRush CA-only) • Preset gating on hydration
      </div>
    </div>
  )
}
