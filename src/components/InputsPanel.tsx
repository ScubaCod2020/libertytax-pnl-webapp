// InputsPanel.tsx - Left side input controls
// Extracted from App.tsx to improve modularity

import React from 'react'
import type { Region } from '../lib/calcs'
import type { Scenario } from '../data/presets'

interface InputsPanelProps {
  // Basic fields
  region: Region
  scenario: Scenario
  setScenario: (scenario: Scenario) => void
  avgNetFee: number
  setANF: (value: number) => void
  taxPrepReturns: number
  setReturns: (value: number) => void
  taxRushReturns: number
  setTaxRush: (value: number) => void
  discountsPct: number
  setDisc: (value: number) => void

  // All 17 expense fields
  salariesPct: number
  setSal: (value: number) => void
  empDeductionsPct: number
  setEmpDeductions: (value: number) => void
  rentPct: number
  setRent: (value: number) => void
  telephoneAmt: number
  setTelephone: (value: number) => void
  utilitiesAmt: number
  setUtilities: (value: number) => void
  localAdvAmt: number
  setLocalAdv: (value: number) => void
  insuranceAmt: number
  setInsurance: (value: number) => void
  postageAmt: number
  setPostage: (value: number) => void
  suppliesPct: number
  setSup: (value: number) => void
  duesAmt: number
  setDues: (value: number) => void
  bankFeesAmt: number
  setBankFees: (value: number) => void
  maintenanceAmt: number
  setMaintenance: (value: number) => void
  travelEntAmt: number
  setTravelEnt: (value: number) => void
  royaltiesPct: number
  setRoy: (value: number) => void
  advRoyaltiesPct: number
  setAdvRoy: (value: number) => void
  taxRushRoyaltiesPct: number
  setTaxRushRoy: (value: number) => void
  miscPct: number
  setMisc: (value: number) => void
}

export default function InputsPanel(props: InputsPanelProps) {
  const {
    region, scenario, setScenario, avgNetFee, setANF, taxPrepReturns, setReturns,
    taxRushReturns, setTaxRush, discountsPct, setDisc,
    salariesPct, setSal, empDeductionsPct, setEmpDeductions, rentPct, setRent,
    telephoneAmt, setTelephone, utilitiesAmt, setUtilities, localAdvAmt, setLocalAdv,
    insuranceAmt, setInsurance, postageAmt, setPostage, suppliesPct, setSup,
    duesAmt, setDues, bankFeesAmt, setBankFees, maintenanceAmt, setMaintenance,
    travelEntAmt, setTravelEnt, royaltiesPct, setRoy, advRoyaltiesPct, setAdvRoy,
    taxRushRoyaltiesPct, setTaxRushRoy, miscPct, setMisc
  } = props

  return (
    <div className="card">
      <div className="card-title">Inputs</div>

      <div>
        <label>
          Scenario:&nbsp;
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
            aria-label="Scenario"
          >
            <option value="Custom">Custom</option>
            <option value="Good">Good</option>
            <option value="Better">Better</option>
            <option value="Best">Best</option>
          </select>
        </label>
      </div>

      <div className="section">
        <div className="section-title">💰 Income Drivers</div>
        
        <label>
          Avg. Net Fee:&nbsp;
          <input
            type="number"
            value={avgNetFee}
            onChange={(e) => setANF(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Tax-Prep Returns:&nbsp;
          <input
            type="number"
            value={taxPrepReturns}
            onChange={(e) => setReturns(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        {region === 'CA' && (
          <label>
            TaxRush Returns (CA only):&nbsp;
            <input
              type="number"
              value={taxRushReturns}
              onChange={(e) => setTaxRush(Number(e.target.value))}
              min="0"
              step="1"
            />
          </label>
        )}

        <label>
          Discounts %:&nbsp;
          <input
            type="number"
            value={discountsPct}
            onChange={(e) => setDisc(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>
      </div>

      <div className="section">
        <div className="section-title">👥 Personnel</div>
        
        <label>
          Salaries (% of Gross):&nbsp;
          <input
            type="number"
            value={salariesPct}
            onChange={(e) => setSal(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>

        <label>
          Employee Deductions (% of Salaries):&nbsp;
          <input
            type="number"
            value={empDeductionsPct}
            onChange={(e) => setEmpDeductions(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>
      </div>

      <div className="section">
        <div className="section-title">🏢 Facility</div>
        
        <label>
          Rent (% of Gross):&nbsp;
          <input
            type="number"
            value={rentPct}
            onChange={(e) => setRent(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>

        <label>
          Telephone ($):&nbsp;
          <input
            type="number"
            value={telephoneAmt}
            onChange={(e) => setTelephone(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Utilities ($):&nbsp;
          <input
            type="number"
            value={utilitiesAmt}
            onChange={(e) => setUtilities(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>
      </div>

      <div className="section">
        <div className="section-title">⚙️ Operations</div>
        
        <label>
          Local Advertising ($):&nbsp;
          <input
            type="number"
            value={localAdvAmt}
            onChange={(e) => setLocalAdv(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Insurance ($):&nbsp;
          <input
            type="number"
            value={insuranceAmt}
            onChange={(e) => setInsurance(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Postage ($):&nbsp;
          <input
            type="number"
            value={postageAmt}
            onChange={(e) => setPostage(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Office Supplies (% of Gross):&nbsp;
          <input
            type="number"
            value={suppliesPct}
            onChange={(e) => setSup(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>

        <label>
          Dues & Subscriptions ($):&nbsp;
          <input
            type="number"
            value={duesAmt}
            onChange={(e) => setDues(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Bank Fees ($):&nbsp;
          <input
            type="number"
            value={bankFeesAmt}
            onChange={(e) => setBankFees(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Maintenance ($):&nbsp;
          <input
            type="number"
            value={maintenanceAmt}
            onChange={(e) => setMaintenance(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>

        <label>
          Travel & Entertainment ($):&nbsp;
          <input
            type="number"
            value={travelEntAmt}
            onChange={(e) => setTravelEnt(Number(e.target.value))}
            min="0"
            step="1"
          />
        </label>
      </div>

      <div className="section">
        <div className="section-title">🏪 Franchise</div>
        
        <label>
          Tax Prep Royalties (% of Tax-Prep Income):&nbsp;
          <input
            type="number"
            value={royaltiesPct}
            onChange={(e) => setRoy(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>

        <label>
          Advertising Royalties (% of Tax-Prep Income):&nbsp;
          <input
            type="number"
            value={advRoyaltiesPct}
            onChange={(e) => setAdvRoy(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>

        {region === 'CA' && (
          <label>
            TaxRush Royalties (% of Tax-Prep Income):&nbsp;
            <input
              type="number"
              value={taxRushRoyaltiesPct}
              onChange={(e) => setTaxRushRoy(Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
            />
          </label>
        )}
      </div>

      <div className="section">
        <div className="section-title">📝 Miscellaneous</div>
        
        <label>
          Miscellaneous (% of Gross):&nbsp;
          <input
            type="number"
            value={miscPct}
            onChange={(e) => setMisc(Number(e.target.value))}
            min="0"
            max="100"
            step="0.1"
          />
        </label>
      </div>
    </div>
  )
}
