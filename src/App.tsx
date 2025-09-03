// App.tsx — Liberty Tax P&L (Sprint 1: Session Persistence + Region Gating + Preset Gating)

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

/* ──────────────────────────────────────────────────────────────────────────────
   1) Formatting helpers (unchanged)
   ────────────────────────────────────────────────────────────────────────────── */
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
const pct = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1 }) + '%'

/* ──────────────────────────────────────────────────────────────────────────────
   2) Defaults (use your config later — wired for quick testing)
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
      - `last` is what hydration restores to by default
      - `baselines.questionnaire` becomes your onboarding restore point later
   ────────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'lt_pnl_v5_session_v1'

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
    // custom?: SessionState   // optional future slot if you want it
  }
  meta?: {
    lastScenario?: SessionState['scenario']
    savedAtISO?: string
  }
}

/* Small helpers to keep localStorage access tidy */
function loadEnvelope(): PersistEnvelopeV1 | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as PersistEnvelopeV1
    if (parsed && parsed.version === 1) return parsed
  } catch {
    /* ignore corrupt JSON */
  }
  return
}

function saveEnvelope(mutator: (prev: PersistEnvelopeV1) => PersistEnvelopeV1) {
  const prev = loadEnvelope() ?? { version: 1 } as PersistEnvelopeV1
  const next = mutator(prev)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function clearEnvelope() {
  localStorage.removeItem(STORAGE_KEY)
}

/* ──────────────────────────────────────────────────────────────────────────────
   4) The App component
   ────────────────────────────────────────────────────────────────────────────── */
export default function App() {
  /* 4a) All interactive state (same fields you already had) */
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

  /* 4b) Hydration & autosave guards
     - hydratingRef = true while we restore from storage (prevents preset side effects)
     - readyRef = true after first paint post-hydration (prevents overwriting with defaults) */
  const hydratingRef = useRef(true)
  const readyRef = useRef(false)

  /* 4c) Build & apply a SessionState snapshot (used for save/restore) */
  const makeSnapshot = (): SessionState => ({
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
  })

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
     5) HYDRATION — on first load:
        - Try restoring `envelope.last`
        - Else fall back to `baselines.questionnaire`
        - Else keep defaults
        - After hydration, set readyRef true (enables autosave)
     ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const env = loadEnvelope()
    const restored =
      env?.last ??
      env?.baselines?.questionnaire // (future) when your initial questionnaire is live
    if (restored) {
      applySnapshot(restored)
    }
    hydratingRef.current = false
    // flip ready on next tick to avoid racing with React’s first paint
    setTimeout(() => {
      readyRef.current = true
    }, 0)
  }, [])

  /* ──────────────────────────────────────────────────────────────────────────
     6) PRESET APPLICATION — only when user changes scenario AFTER hydration
        - Prevents presets from overwriting a restored session on app load
     ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (hydratingRef.current) return
    if (scenario === 'Custom') return
    const p = presets[scenario]
    setANF(p.avgNetFee)
    setReturns(p.taxPrepReturns)
    setTaxRush(p.taxRushReturns)
    setDisc(p.discountsPct)
    setSal(p.salariesPct)
    setRent(p.rentPct)
    setSup(p.suppliesPct)
    setRoy(p.royaltiesPct)
    setAdvRoy(p.advRoyaltiesPct)
    setMisc(p.miscPct)
  }, [scenario])

  /* ──────────────────────────────────────────────────────────────────────────
     7) REGION GATING — enforce Canada-only TaxRush
        - This runs on region change (including restored region)
        - If Region = US, force TaxRush to 0 and keep field disabled in UI
     ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (region === 'US' && taxRushReturns !== 0) {
      setTaxRush(0)
    }
    // Intentionally not depending on `taxRushReturns` to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region])

  /* ──────────────────────────────────────────────────────────────────────────
     8) AUTOSAVE — debounce writes to localStorage once ready
        - Saves the current session into `envelope.last`
        - Stores simple meta for debugging
     ────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!readyRef.current) return
    const id = setTimeout(() => {
      const snap = makeSnapshot()
      saveEnvelope((prev) => ({
        version: 1,
        ...prev,
        last: snap,
        meta: {
          lastScenario: snap.scenario,
          savedAtISO: new Date().toISOString(),
        },
      }))
    }, 400) // gentle debounce
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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
    thr,
  ])

  /* ──────────────────────────────────────────────────────────────────────────
     9) RESET — clear storage and revert to defaults (no hard reload)
        - Later, you can add a chevron menu with:
          "Reset to Questionnaire Baseline" vs "Reset to Factory Defaults"
     ────────────────────────────────────────────────────────────────────────── */
  function resetSession() {
    clearEnvelope()
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
     10) Derived inputs & calculations (unchanged)
     ────────────────────────────────────────────────────────────────────────── */
  const inputs: Inputs = useMemo(
    () => ({
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
    }),
    [
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
      thr,
    ],
  )

  const r = useMemo(() => calc(inputs), [inputs])

  // KPI statuses
  const cprStatus = statusForCPR(r.costPerReturn, thr)
  const nimStatus = statusForMargin(r.netMarginPct, thr)
  const niStatus = statusForNetIncome(r.netIncome, thr)

  const kpiClass = (s: 'green' | 'yellow' | 'red') => `kpi ${s}`

  /* ──────────────────────────────────────────────────────────────────────────
     11) UI (your original layout + a small Reset button in the header)
     ────────────────────────────────────────────────────────────────────────── */
  return (
    <div>
      <div className="header">
        <div className="brand">Liberty Tax • P&L Budget & Forecast (v0.4 preview)</div>
        <div className="small">
          Region:&nbsp;
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            aria-label="Region"
          >
            <option value="US">U.S.</option>
            <option value="CA">Canada</option>
          </select>

          {/* Simple Reset — clears storage and reverts to defaults */}
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
              />
            </div>
            <div className="input-row">
              <label>Tax Prep Returns (#)</label>
              <input
                type="number"
                value={taxPrepReturns}
                onChange={(e) => setReturns(+e.target.value)}
              />
            </div>
            <div className="input-row">
              <label>TaxRush Returns (CA only)</label>
              <input
                type="number"
                value={region === 'CA' ? taxRushReturns : 0}
                disabled={region !== 'CA'}
                onChange={(e) => setTaxRush(+e.target.value)}
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
                />
              </div>
              <div className="input-row">
                <label>Salaries %</label>
                <input
                  type="number"
                  step="0.1"
                  value={salariesPct}
                  onChange={(e) => setSal(+e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Rent %</label>
                <input
                  type="number"
                  step="0.1"
                  value={rentPct}
                  onChange={(e) => setRent(+e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Supplies %</label>
                <input
                  type="number"
                  step="0.1"
                  value={suppliesPct}
                  onChange={(e) => setSup(+e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Royalties %</label>
                <input
                  type="number"
                  step="0.1"
                  value={royaltiesPct}
                  onChange={(e) => setRoy(+e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Adv. Royalties %</label>
                <input
                  type="number"
                  step="0.1"
                  value={advRoyaltiesPct}
                  onChange={(e) => setAdvRoy(+e.target.value)}
                />
              </div>
              <div className="input-row">
                <label>Misc/Shortages %</label>
                <input
                  type="number"
                  step="0.1"
                  value={miscPct}
                  onChange={(e) => setMisc(+e.target.value)}
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
                />
              </div>
              <div className="input-row">
                <label>Cost/Return – Yellow ≤</label>
                <input
                  type="number"
                  step="0.1"
                  value={thr.cprYellow}
                  onChange={(e) => setThr({ ...thr, cprYellow: +e.target.value })}
                />
              </div>
              <div className="input-row">
                <label>Net Margin – Green ≥ %</label>
                <input
                  type="number"
                  step="0.1"
                  value={thr.nimGreen}
                  onChange={(e) => setThr({ ...thr, nimGreen: +e.target.value })}
                />
              </div>
              <div className="input-row">
                <label>Net Margin – Yellow ≥ %</label>
                <input
                  type="number"
                  step="0.1"
                  value={thr.nimYellow}
                  onChange={(e) => setThr({ ...thr, nimYellow: +e.target.value })}
                />
              </div>
              <div className="input-row">
                <label>Net Income – Red at or below</label>
                <input
                  type="number"
                  step="100"
                  value={thr.netIncomeWarn}
                  onChange={(e) =>
                    setThr({ ...thr, netIncomeWarn: +e.target.value })
                  }
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

      <div className="footer">
        Preview web app • Persistence enabled • Region gating (TaxRush CA-only) • Preset gating on
        hydration
      </div>
    </div>
  )
}
