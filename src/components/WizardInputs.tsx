import React from 'react'
import type { Region } from '../lib/calcs'
import type { WizardAnswers } from './WizardShell'

export default function WizardInputs({
  region,
  values,
  onChange,
  onBack,
  onNext,
}: {
  region: Region
  values: WizardAnswers
  onChange: (patch: Partial<WizardAnswers>) => void
  onBack: () => void
  onNext: () => void
}) {
  const isUS = region === 'US'
  const taxRushVal = isUS ? 0 : (values.taxRushReturns ?? 0)

  return (
    <>
      <div className="section-title">Income Drivers</div>

      <div className="grid-2">
        <div className="input-row">
          <label>Average Net Fee ($)</label>
          <input
            type="number" step="0.01" min={0}
            value={values.avgNetFee ?? 0}
            onChange={e => onChange({ avgNetFee: Number(e.target.value) })}
          />
        </div>
        <div className="input-row">
          <label>Tax Prep Returns (#)</label>
          <input
            type="number" min={0}
            value={values.taxPrepReturns ?? 0}
            onChange={e => onChange({ taxPrepReturns: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="input-row">
          <label>TaxRush Returns (CA only)</label>
          <input
            type="number" min={0}
            disabled={isUS}
            value={taxRushVal}
            onChange={e => onChange({ taxRushReturns: Number(e.target.value) })}
          />
        </div>
        <div className="input-row">
          <label>Customer Discounts (% of Gross Fees)</label>
          <input
            type="number" step="0.1" min={0} max={100}
            value={values.discountsPct ?? 0}
            onChange={e => onChange({ discountsPct: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex" style={{ justifyContent:'space-between', marginTop:12 }}>
        <button className="btn-link" onClick={onBack}>← Back</button>
        <button className="btn-link" onClick={onNext}>Review →</button>
      </div>
    </>
  )
}
