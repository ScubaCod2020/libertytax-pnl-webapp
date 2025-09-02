const STORAGE_KEY = 'lt_pnl_v5_session_v1';
type SessionSnapshot = {
  region: Region;
  scenario: Scenario;
  avgNetFee: number;
  taxPrepReturns: number;
  taxRushReturns: number;
  discountsPct: number;
  salariesPct: number;
  rentPct: number;
  suppliesPct: number;
  royaltiesPct: number;
  advRoyaltiesPct: number;
  miscPct: number;
  thresholds: Thresholds;
};

useEffect(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data: SessionSnapshot = JSON.parse(raw);
    // hydrate
    setRegion(data.region);
    setScenario(data.scenario);
    setANF(data.avgNetFee);
    setReturns(data.taxPrepReturns);
    setTaxRush(data.taxRushReturns);
    setDisc(data.discountsPct);
    setSal(data.salariesPct);
    setRent(data.rentPct);
    setSup(data.suppliesPct);
    setRoy(data.royaltiesPct);
    setAdvRoy(data.advRoyaltiesPct);
    setMisc(data.miscPct);
    setThr(data.thresholds);
  } catch {}
}, []);

useEffect(() => {
  const snapshot: SessionSnapshot = {
    region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
    discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct, advRoyaltiesPct, miscPct,
    thresholds: thr
  };
  const id = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, 400); // debounce
  return () => clearTimeout(id);
}, [region, scenario, avgNetFee, taxPrepReturns, taxRushReturns, discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct, advRoyaltiesPct, miscPct, thr]);

function resetSession() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}


import React, { useMemo, useState, useEffect } from 'react'
import { calc, statusForCPR, statusForMargin, statusForNetIncome, type Inputs, type Region, type Thresholds } from './lib/calcs'
import KPIStoplight from './components/KPIStoplight'
import ScenarioSelector from './components/ScenarioSelector'
import { presets, type Scenario } from './data/presets'

const currency = (n:number)=> n.toLocaleString(undefined,{style:'currency',currency:'USD'})
const pct = (n:number)=> n.toLocaleString(undefined,{maximumFractionDigits:1})+'%'

const defaultThresholds: Thresholds = { cprGreen: 25, cprYellow: 35, nimGreen: 20, nimYellow: 10, netIncomeWarn: -5000 }

export default function App(){
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

  // Apply scenario presets (non-destructive for Custom)
  useEffect(()=>{
    if (scenario==='Custom') return
    const p = presets[scenario]
    setANF(p.avgNetFee); setReturns(p.taxPrepReturns); setTaxRush(p.taxRushReturns)
    setDisc(p.discountsPct); setSal(p.salariesPct); setRent(p.rentPct)
    setSup(p.suppliesPct); setRoy(p.royaltiesPct); setAdvRoy(p.advRoyaltiesPct); setMisc(p.miscPct)
  },[scenario])

  const inputs:Inputs = useMemo(()=> ({
    region, scenario, avgNetFee, taxPrepReturns, taxRushReturns,
    discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct, advRoyaltiesPct, miscPct,
    thresholds: thr
  }), [region, scenario, avgNetFee, taxPrepReturns, taxRushReturns, discountsPct, salariesPct, rentPct, suppliesPct, royaltiesPct, advRoyaltiesPct, miscPct, thr])

  const r = useMemo(()=> calc(inputs), [inputs])

  // KPI statuses
  const cprStatus = statusForCPR(r.costPerReturn, thr)
  const nimStatus = statusForMargin(r.netMarginPct, thr)
  const niStatus  = statusForNetIncome(r.netIncome, thr)

  const kpiClass = (s:'green'|'yellow'|'red') => `kpi ${s}`

  return (
    <div>
      <div className="header">
        <div className="brand">Liberty Tax • P&L Budget & Forecast (v0.4 preview)</div>
        <div className="small">Region:&nbsp;
          <select value={region} onChange={e=>setRegion(e.target.value as Region)}>
            <option value="US">U.S.</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>

      <div className="container">
        {/* Left: Wizard + Inputs */}
        <div className="stack">
          <div className="card">
            <div className="card-title">Quick Inputs</div>
            <ScenarioSelector scenario={scenario} setScenario={setScenario} />

            <div className="section-title">Income Drivers</div>
            <div className="input-row"><label>Average Net Fee ($)</label><input type="number" value={avgNetFee} onChange={e=>setANF(+e.target.value)} /></div>
            <div className="input-row"><label>Tax Prep Returns (#)</label><input type="number" value={taxPrepReturns} onChange={e=>setReturns(+e.target.value)} /></div>
            <div className="input-row"><label>TaxRush Returns (CA only)</label><input type="number" value={region==='CA'?taxRushReturns:0} disabled={region!=='CA'} onChange={e=>setTaxRush(+e.target.value)} /></div>

            <div className="section-title">Expense Percentages</div>
            <div className="grid-2">
              <div className="input-row"><label>Discounts %</label><input type="number" step="0.1" value={discountsPct} onChange={e=>setDisc(+e.target.value)} /></div>
              <div className="input-row"><label>Salaries %</label><input type="number" step="0.1" value={salariesPct} onChange={e=>setSal(+e.target.value)} /></div>
              <div className="input-row"><label>Rent %</label><input type="number" step="0.1" value={rentPct} onChange={e=>setRent(+e.target.value)} /></div>
              <div className="input-row"><label>Supplies %</label><input type="number" step="0.1" value={suppliesPct} onChange={e=>setSup(+e.target.value)} /></div>
              <div className="input-row"><label>Royalties %</label><input type="number" step="0.1" value={royaltiesPct} onChange={e=>setRoy(+e.target.value)} /></div>
              <div className="input-row"><label>Adv. Royalties %</label><input type="number" step="0.1" value={advRoyaltiesPct} onChange={e=>setAdvRoy(+e.target.value)} /></div>
              <div className="input-row"><label>Misc/Shortages %</label><input type="number" step="0.1" value={miscPct} onChange={e=>setMisc(+e.target.value)} /></div>
            </div>

            <div className="section-title">KPI Thresholds</div>
            <div className="grid-2">
              <div className="input-row"><label>Cost/Return – Green ≤</label><input type="number" step="0.1" value={thr.cprGreen} onChange={e=>setThr({...thr, cprGreen:+e.target.value})} /></div>
              <div className="input-row"><label>Cost/Return – Yellow ≤</label><input type="number" step="0.1" value={thr.cprYellow} onChange={e=>setThr({...thr, cprYellow:+e.target.value})} /></div>
              <div className="input-row"><label>Net Margin – Green ≥ %</label><input type="number" step="0.1" value={thr.nimGreen} onChange={e=>setThr({...thr, nimGreen:+e.target.value})} /></div>
              <div className="input-row"><label>Net Margin – Yellow ≥ %</label><input type="number" step="0.1" value={thr.nimYellow} onChange={e=>setThr({...thr, nimYellow:+e.target.value})} /></div>
              <div className="input-row"><label>Net Income – Red at or below</label><input type="number" step="100" value={thr.netIncomeWarn} onChange={e=>setThr({...thr, netIncomeWarn:+e.target.value})} /></div>
            </div>
          </div>
        </div>

        {/* Right: Results Dashboard */}
        <div className="card">
          <div className="card-title">Dashboard</div>
          <div className="kpi-vertical">
            <div className={kpiClass(niStatus)}>
              <KPIStoplight active={niStatus}/>
              <div>
                <div>Net Income</div>
                <div className="value">{currency(r.netIncome)}</div>
                <div className="small">Income − Expenses</div>
              </div>
            </div>

            <div className={kpiClass(nimStatus)}>
              <KPIStoplight active={nimStatus}/>
              <div>
                <div>Net Margin</div>
                <div className="value">{pct(r.netMarginPct)}</div>
                <div className="small">Net Income ÷ Tax‑Prep Income</div>
              </div>
            </div>

            <div className={kpiClass(cprStatus)}>
              <KPIStoplight active={cprStatus}/>
              <div>
                <div>Cost / Return</div>
                <div className="value">{currency(r.costPerReturn)}</div>
                <div className="small">Total Expenses ÷ Returns</div>
              </div>
            </div>
          </div>

          <div style={{marginTop:16}} className="grid-2">
            <div className="card">
              <div className="card-title">Totals</div>
              <div className="small">Gross Fees: {currency(r.grossFees)}</div>
              <div className="small">Discounts: {currency(r.discounts)}</div>
              <div className="small">Tax‑Prep Income: {currency(r.taxPrepIncome)}</div>
              <div className="small">Expenses: {currency(r.totalExpenses)}</div>
              <div className="small">Returns: {r.totalReturns.toLocaleString()}</div>
            </div>
            <div className="card">
              <div className="card-title">Pro‑Tips</div>
              <ul className="small">
                {cprStatus==='red' && <li>Cost/Return is high — review Salaries and Rent percentages.</li>}
                {nimStatus==='red' && <li>Margin is low — consider raising ANF or reducing discounts.</li>}
                {niStatus==='red' && <li>Net Income negative — check Advertising & Royalties burden.</li>}
                {niStatus==='yellow' && <li>Close to breakeven — small changes in ANF or Returns can flip green.</li>}
                {(cprStatus==='green' && nimStatus==='green' && niStatus==='green') && <li>Great! Consider “Best” scenario to stress‑test capacity.</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">Preview web app • No external libraries • Ready to expand with charts & persistence</div>
    </div>
  )
}
