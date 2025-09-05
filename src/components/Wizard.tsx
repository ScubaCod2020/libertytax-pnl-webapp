import React from 'react'
import type { Region } from '../lib/calcs'
import WizardShell, { type WizardAnswers } from './WizardShell'

<<<<<<< Updated upstream
export default function Wizard({
  region,
  setRegion,
  goToInputs,
}: {
  region: Region
  setRegion: (r: Region) => void
  goToInputs: () => void
}) {
  return (
    <>
      <div className="section-title">Welcome to Liberty Tax P&L</div>
      <p className="small" style={{ marginBottom: 16 }}>
        Let's set up your baseline scenario with a few quick questions.
        This will help us create realistic projections for your business.
      </p>

      <div className="input-row">
        <label>Select Your Region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region)}
          style={{ width: '100%' }}
        >
          <option value="US">United States</option>
          <option value="CA">Canada</option>
        </select>
      </div>

      <div className="card" style={{ marginTop: 16, padding: 12, backgroundColor: '#f8f9fa' }}>
        <div className="small">
          <strong>Region Note:</strong> {region === 'US' 
            ? 'U.S. locations do not offer TaxRush services.'
            : 'Canadian locations can include TaxRush returns in their projections.'}
        </div>
      </div>

      <div className="flex" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn-link" onClick={goToInputs}>
          Continue to Income Setup →
        </button>
      </div>
    </>
=======
interface WizardProps {
  region: Region
  setRegion: (region: Region) => void
  onComplete: (answers: WizardAnswers) => void
  onCancel: () => void
}

export default function Wizard({ region, setRegion, onComplete, onCancel }: WizardProps) {
  return (
    <WizardShell
      region={region}
      setRegion={setRegion}
      onComplete={onComplete}
      onCancel={onCancel}
    />
>>>>>>> Stashed changes
  )
}