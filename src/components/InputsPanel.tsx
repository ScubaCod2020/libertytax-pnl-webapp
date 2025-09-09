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
        
        {/* Average Net Fee with Gross Fees Calculation */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Average Net Fee ⟷ Gross Fees (Bidirectional)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ minWidth: '70px', fontSize: '0.9rem' }}>Net Fee: $</span>
            <input
              type="number"
              value={avgNetFee}
              onChange={(e) => setANF(Number(e.target.value))}
              min="1"
              max="1000"
              step="1"
              aria-label="Average net fee amount in dollars"
              style={{ width: '80px', textAlign: 'right' }}
            />
            <span style={{ color: '#6b7280', margin: '0 0.5rem' }}>⟷</span>
            <span style={{ minWidth: '80px', fontSize: '0.9rem' }}>Gross Fees: $</span>
            <input
              type="number"
              value={Math.round(avgNetFee * taxPrepReturns / (1 - discountsPct / 100))}
              onChange={(e) => {
                const grossFees = Number(e.target.value)
                if (grossFees && taxPrepReturns) {
                  const newAvgNetFee = Math.round(grossFees * (1 - discountsPct / 100) / taxPrepReturns)
                  setANF(newAvgNetFee)
                }
              }}
              min="1"
              step="1"
              aria-label="Gross Fees calculated from Average Net Fee"
              style={{ width: '100px', textAlign: 'right', backgroundColor: '#f0f9ff' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '75px' }}>
            Edit either field • Gross = Net × Returns ÷ (1 - Discount%)
          </div>
        </div>

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
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              TaxRush Returns (Canada) ⟷ Percentage
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Count: #</span>
              <input
                type="number"
                value={taxRushReturns}
                onChange={(e) => setTaxRush(Number(e.target.value))}
                min="0"
                max="20000"
                step="1"
                aria-label="TaxRush returns count"
                style={{ width: '80px', textAlign: 'right' }}
              />
              <span style={{ color: '#6b7280', margin: '0 0.5rem' }}>⟷</span>
              <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Percent:</span>
              <input
                type="number"
                value={taxPrepReturns > 0 ? Math.round((taxRushReturns / taxPrepReturns) * 100 * 10) / 10 : 0}
                onChange={(e) => {
                  const pct = Number(e.target.value)
                  if (taxPrepReturns > 0) {
                    setTaxRush(Math.round(taxPrepReturns * pct / 100))
                  }
                }}
                min="0"
                max="50"
                step="0.1"
                aria-label="TaxRush Returns as percentage of Tax Prep Returns"
                style={{ width: '50px', textAlign: 'right', backgroundColor: '#f0f9ff' }}
              />
              <span style={{ fontSize: '0.9rem' }}>%</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '55px' }}>
              Edit count or percentage • Typically ~15% of Tax Prep Returns
            </div>
          </div>
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

        {/* Revenue Summary */}
        {avgNetFee && taxPrepReturns && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            backgroundColor: '#f0fdf4',
            border: '1px solid #22c55e',
            borderRadius: '6px',
            fontSize: '0.85rem'
          }}>
            <div style={{ fontWeight: 'bold', color: '#15803d', marginBottom: '0.25rem' }}>
              💰 Revenue Breakdown
            </div>
            <div style={{ color: '#15803d' }}>
              Tax Prep Income: <strong>${(avgNetFee * taxPrepReturns).toLocaleString()}</strong>
              {region === 'CA' && taxRushReturns > 0 && (
                <span> • TaxRush: <strong>${(avgNetFee * taxRushReturns).toLocaleString()}</strong></span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
              Total Returns: {(taxPrepReturns + (region === 'CA' ? taxRushReturns : 0)).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">👥 Personnel</div>
        
        {/* Salaries - Bidirectional Percentage/Dollar */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Salaries ⟷ Dollar Amount (% of Gross Fees)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Percent:</span>
            <input
              type="number"
              value={salariesPct}
              onChange={(e) => setSal(Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
              aria-label="Salaries percentage of gross fees"
              style={{ width: '60px', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.9rem' }}>%</span>
            <span style={{ color: '#6b7280', margin: '0 0.5rem' }}>⟷</span>
            <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Amount: $</span>
            <input
              type="number"
              value={Math.round(avgNetFee * taxPrepReturns / (1 - discountsPct / 100) * salariesPct / 100)}
              onChange={(e) => {
                const dollarAmount = Number(e.target.value)
                const grossFees = avgNetFee * taxPrepReturns / (1 - discountsPct / 100)
                if (grossFees > 0) {
                  setSal(Math.round((dollarAmount / grossFees) * 100 * 10) / 10)
                }
              }}
              min="0"
              step="100"
              aria-label="Salaries dollar amount calculated from percentage"
              style={{ width: '100px', textAlign: 'right', backgroundColor: '#f0f9ff' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '55px' }}>
            Edit percentage or dollar amount • Typically 20-30% of Gross Fees
          </div>
        </div>

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
        
        {/* Rent - Bidirectional Percentage/Dollar */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Rent ⟷ Dollar Amount (% of Gross Fees)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Percent:</span>
            <input
              type="number"
              value={rentPct}
              onChange={(e) => setRent(Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
              aria-label="Rent percentage of gross fees"
              style={{ width: '60px', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.9rem' }}>%</span>
            <span style={{ color: '#6b7280', margin: '0 0.5rem' }}>⟷</span>
            <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Amount: $</span>
            <input
              type="number"
              value={Math.round(avgNetFee * taxPrepReturns / (1 - discountsPct / 100) * rentPct / 100)}
              onChange={(e) => {
                const dollarAmount = Number(e.target.value)
                const grossFees = avgNetFee * taxPrepReturns / (1 - discountsPct / 100)
                if (grossFees > 0) {
                  setRent(Math.round((dollarAmount / grossFees) * 100 * 10) / 10)
                }
              }}
              min="0"
              step="100"
              aria-label="Rent dollar amount calculated from percentage"
              style={{ width: '100px', textAlign: 'right', backgroundColor: '#f0f9ff' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '55px' }}>
            Edit percentage or dollar amount • Typically 10-20% of Gross Fees
          </div>
        </div>

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

        {/* Office Supplies - Bidirectional Percentage/Dollar */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Office Supplies ⟷ Dollar Amount (% of Gross Fees)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Percent:</span>
            <input
              type="number"
              value={suppliesPct}
              onChange={(e) => setSup(Number(e.target.value))}
              min="0"
              max="100"
              step="0.1"
              aria-label="Office supplies percentage of gross fees"
              style={{ width: '60px', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.9rem' }}>%</span>
            <span style={{ color: '#6b7280', margin: '0 0.5rem' }}>⟷</span>
            <span style={{ minWidth: '50px', fontSize: '0.9rem' }}>Amount: $</span>
            <input
              type="number"
              value={Math.round(avgNetFee * taxPrepReturns / (1 - discountsPct / 100) * suppliesPct / 100)}
              onChange={(e) => {
                const dollarAmount = Number(e.target.value)
                const grossFees = avgNetFee * taxPrepReturns / (1 - discountsPct / 100)
                if (grossFees > 0) {
                  setSup(Math.round((dollarAmount / grossFees) * 100 * 10) / 10)
                }
              }}
              min="0"
              step="50"
              aria-label="Office Supplies dollar amount calculated from percentage"
              style={{ width: '100px', textAlign: 'right', backgroundColor: '#f0f9ff' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '55px' }}>
            Edit percentage or dollar amount • Typically 1-3% of Gross Fees
          </div>
        </div>

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
