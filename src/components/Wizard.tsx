import React, { useState } from 'react'
import type { Region } from '../lib/calcs'
import Wizard from './Wizard'              // your existing Welcome step (Region) ✔
import WizardInputs from './WizardInputs'
import WizardReview from './WizardReview'

export type WizardAnswers = {
  region: Region
  avgNetFee?: number
  taxPrepReturns?: number
  taxRushReturns?: number  // CA only; US forced 0
  discountsPct?: number
}

export default function WizardShell({
  region,
  setRegion,
  onConfirmBaseline,
  onCancel,
}: {
  region: Region
  setRegion: (r: Region) => void
  onConfirmBaseline: (answers: WizardAnswers) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [answers, setAnswers] = useState<WizardAnswers>({ region })

  return (
    <div className="container">
      <div className="stack">
        <div className="card">
          <div className="card-title">Quick Start Wizard</div>
          <div className="small">Step {step + 1} of 3</div>

          {step === 0 && (
            <Wizard
              region={answers.region}
              setRegion={(r) => { setRegion(r); setAnswers(a => ({ ...a, region: r })) }}
              goToInputs={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <WizardInputs
              region={answers.region}
              values={answers}
              onChange={(patch) => setAnswers(a => ({ ...a, ...patch }))}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <WizardReview
              values={answers}
              onBack={() => setStep(1)}
              onConfirm={() => onConfirmBaseline(answers)}
            />
          )}
        </div>

        <button className="btn-link" onClick={onCancel}>Skip wizard</button>
      </div>
      <div className="card">
        <div className="card-title">What this does</div>
        <p className="small">
          We use these answers to create a Baseline scenario and feed the dashboard.
          U.S. forces TaxRush = 0. Canada can enter TaxRush returns (sticky across refresh).
        </p>
      </div>
    </div>
  )
}
