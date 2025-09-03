// App.tsx — Liberty Tax P&L (Sprint 1: Session Persistence + Region Gating + Preset Gating)
// Includes: saveNow() + beforeunload flush, onBlur save for TaxRush

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
import { presets, type Scenario } from './data/presets'

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
  salariesPct: number
  rentPct: number
  suppliesPct: number
  royaltiesPct: number
  advRoyaltiesPct: number
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
  const [salariesPct, setSal] = useState(25)
  const [rentPct, setRent] = useState(18)
  const [suppliesPct, setSup] = useState(3.5)
  const [royaltiesPct, setRoy] = useState(14)
  const [advRoyaltiesPct, setAdvRoy] = useState(5)
  const [miscPct, setMisc] = useState(2.5)

  const [thr, setThr] = useState<Thresholds>(defaultThresholds)

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
    salariesPct,
    rentPct,
    suppliesPct,
    royaltiesPct,
    advRoyaltiesPct,
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
    setSal(s.salariesPct)
    setRent(s.rentPct)
    setSup(s.suppliesPct)
    setRoy(s.royaltiesPct)
    setAdvRoy(s.advRoyaltiesPct)
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

  // NEW: if we restored a CA value that looks user-edited, make it sticky
  
  // Option B (stricter): treat as sticky if it differs from the preset for that scenario
   const presetTR = presets[restored.scenario]?.taxRushReturns ?? 0
  if (restored.region === 'CA' && restored.taxRushReturns !== presetTR) {
  taxRushDirtyRef.current = true
  dbg('hydrate: taxRushDirtyRef -> true (restored != preset)')

} else {
  dbg('hydrate: nothing to restore; using defaults')
}


  // Defer both flags to AFTER React has applied setState
  // This ensures no other effect (like autosave or presets) runs "between" default state and restored state
  requestAnimationFrame(() => {
    hydratingRef.current = false
    readyRef.current = true
    dbg('hydrate: readyRef -> true (post RAF)')
 
}, [])


  /* ──────────────────────────────────────────────────────────────────────────
     6) PRESETS — apply only when user changes scenario AFTER hydration
     ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (hydratingRef.current || !readyRef.current) { dbg('preset: skipped (hydrating or not ready)'); return }
    if (scenario === 'Custom') { dbg('preset: Custom (no template applied)'); return }

    const p = presets[scenario]

    // Optional: quick no-op check for all NON-TaxRush fields
    if (
      avgNetFee === p.avgNetFee &&
      taxPrepReturns === p.taxPrepReturns &&
      discountsPct === p.discountsPct &&
      salariesPct === p.salariesPct &&
      rentPct === p.rentPct &&
      suppliesPct === p.suppliesPct &&
      royaltiesPct === p.royaltiesPct &&
      advRoyaltiesPct === p.advRoyaltiesPct &&
      miscPct === p.miscPct
    ) {
      dbg('preset: values already match (ignoring TaxRush for stickiness); skipping')
    return
    }
  
    dbg('preset: applying', scenario)
    setANF(p.avgNetFee)
    setReturns(p.taxPrepReturns)

    // only touch TaxRush if appropriate
    if (region === 'CA') {
      if (taxRushDirtyRef.current) {
        dbg('preset: CA taxRush STICKY — user-edited; leaving at', taxRushReturns)
      } else {
        dbg('preset: CA taxRush from preset ->', p.taxRushReturns)
        setTaxRush(p.taxRushReturns)
      }
    } else {
  // US: always force 0 and clear stickiness
  if (taxRushReturns !== 0) dbg('preset: US forces taxRush -> 0')
  setTaxRush(0)
  taxRushDirtyRef.current = false
}

  setDisc(p.discountsPct); setSal(p.salariesPct); setRent(p.rentPct)
  setSup(p.suppliesPct); setRoy(p.royaltiesPct); setAdvRoy(p.advRoyaltiesPct); setMisc(p.miscPct)
}, [scenario])


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
  discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct,
  advRoyaltiesPct, miscPct, thr,
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
     9) RESET — clear storage and revert to defaults (no hard reload)
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
    setSal(25)
    setRent(18)
    setSup(3.5)
    setRoy(14)
    setAdvRoy(5)
    setMisc(2.5)
    setThr(defaultThresholds)
  }

  /* ──────────────────────────────────────────────────────────────────────────
     10) Derived inputs & calculations
     ────────────────────────────────────────────────────────────────────────── */
  const inputs: Inputs = useMemo(
    () => ({
      region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
      discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct, advRoyaltiesPct, miscPct,
      thresholds: thr,
    }),
    [
      region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
      discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct, advRoyaltiesPct, miscPct, thr,
    ],
  )

  const r = useMemo(() => calc(inputs), [inputs])

  const cprStatus = statusForCPR(r.costPerReturn, thr)
  const nimStatus = statusForMargin(r.netMarginPct, thr)
  const niStatus  = statusForNetIncome(r.netIncome, thr)

  const kpiClass = (s: 'green' | 'yellow' | 'red') => `kpi ${s}`

  /* ──────────────────────────────────────────────────────────────────────────
     11) UI
     ────────────────────────────────────────────────────────────────────────── */
 // Debug panel state (place ABOVE return)
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

      <div className="container">
        {/* Left: Wizard + Inputs */}
        <div className="stack">
          <div className="card">
            <div className="card-title">Quick Inputs</div>

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
              <div className="card-title">Totals</div>
              <div className="small">Gross Fees: {currency(r.grossFees)}</div>
              <div className="small">Discounts: {currency(r.discounts)}</div>
              <div className="small">Tax-Prep Income: {currency(r.taxPrepIncome)}</div>
              <div className="small">Expenses: {currency(r.totalExpenses)}</div>
              <div className="small">Returns: {r.totalReturns.toLocaleString()}</div>
            </div>

            <div className="card">
              <div className="card-title">Pro-Tips</div>
              <ul className="small">
                {cprStatus === 'red' && (
                  <li>Cost/Return is high — review Salaries and Rent percentages.</li>
                )}
                {nimStatus === 'red' && (
                  <li>Margin is low — consider raising ANF or reducing discounts.</li>
                )}
                {niStatus === 'red' && (
                  <li>Net Income negative — check Advertising & Royalties burden.</li>
                )}
                {niStatus === 'yellow' && (
                  <li>
                    Close to breakeven — small changes in ANF or Returns can flip green.
                  </li>
                )}
                {cprStatus === 'green' &&
                  nimStatus === 'green' &&
                  niStatus === 'green' && (
                    <li>Great! Consider “Best” scenario to stress-test capacity.</li>
                  )}
              </ul>
            </div>
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
    </div>
  </div>
)}

      
      <div className="footer">
        Preview web app • Persistence enabled • Region gating (TaxRush CA-only) • Preset gating on hydration
      </div>
    </div>
  )
}
