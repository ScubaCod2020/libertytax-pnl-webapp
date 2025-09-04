import React from 'react'
import type { WizardAnswers } from './WizardShell'

export default function WizardReview({
  values,
  onBack,
  onConfirm,
}: {
  values: WizardAnswers
  onBack: () => void
  onConfirm: () => void
}) {
  const rows = [
    ['Region', values.region],
    ['Average Net Fee ($)', values.avgNetFee ?? 0],
    ['Tax Prep Returns (#)', values.taxPrepReturns ?? 0],
    ['TaxRush Returns (#)', values.region === 'US' ? 0 : (values.taxRushReturns ?? 0)],
    ['Discounts (% of Gross)', values.discountsPct ?? 0],
  ]

  return (
    <>
      <div className="section-title">Review Baseline</div>
      <div className="grid-2">
        {rows.map(([k,v]) => (
          <div key={String(k)} className="card">
            <div className="small">{k}</div>
            <div style={{ fontWeight:700 }}>{String(v)}</div>
          </div>
        ))}
      </div>

      <div className="flex" style={{ justifyContent:'space-between', marginTop:12 }}>
        <button className="btn-link" onClick={onBack}>← Back</button>
        <button className="btn-link" onClick={onConfirm}>Confirm & Create Baseline →</button>
      </div>
    </>
  )
}
