// src/component/WizardShell.tsx
// ─────────────────────────────────────────────────────────────────────────────
// WizardShell
// - Small "conductor" that renders the 3 steps and passes values between them.
// - Uses your existing <Wizard/> component as Step 1 (region chooser).
// - Keeps the wizard self-contained; App.tsx just mounts <WizardShell .../>.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'

// Step 1 (you already have this file)
import Wizard from './Wizard'

// Step 2 & 3 (you said these files exist)
import WizardInputs from './WizardInputs'
import WizardReview from './WizardReview'

// If you already have a Region type somewhere (e.g., ../lib/calcs), import that instead.
export type Region = 'US' | 'CA'

// The data we collect across the steps.
// Keep this minimal now; add fields later as needed.
export type WizardAnswers = {
  region: Region
  avgNetFee?: number
  taxPrepReturns?: number
  taxRushReturns?: number   // CA only; force 0 for US at the App layer
  discountsPct?: number
}

export default function WizardShell(props: {
  /** Current region from App state (keeps wizard in sync with app-wide region) */
  region: Region
  /** App-level setter so Welcome step can change region */
  setRegion: (r: Region) => void
  /** Called when user confirms on the Review step; hands answers back to App */
  onConfirmBaseline: (answers: WizardAnswers) => void
  /** Let user bail out and go to the dashboard (useful during development) */
  onCancel: () => void
}) {
  const { region, setRegion, onConfirmBaseline, onCancel } = props

  // Step index: 0=Welcome, 1=Inputs, 2=Review
  const [step, setStep] = useState<0 | 1 | 2>(0)

  // Aggregate answers from all steps. Initialize with the region passed down from App.
  const [answers, setAnswers] = useState<WizardAnswers>({ region })

  // Navigate helpers
  const goWelcome = () => setStep(0)
  const goInputs  = () => setStep(1)
  const goReview  = () => setStep(2)

  return (
    <div className="container" style={{ marginTop: 16 }}>
      {/* Left column: the wizard card */}
      <div className="stack">
        <div className="card">
          <div className="card-title">Quick Start Wizard</div>
          <div className="small" style={{ marginBottom: 8 }}>Step {step + 1} of 3</div>

          {/* STEP 1 — Welcome (Region chooser). We REUSE your existing <Wizard/> */}
          {step === 0 && (
            <Wizard
              region={answers.region}
              // When region changes in step 1, mirror into App AND into local answers state.
              setRegion={(r) => {
                setRegion(r)
                setAnswers(a => ({ ...a, region: r }))
              }}
              goToInputs={goInputs}
            />
          )}

          {/* STEP 2 — Inputs (Average fee, returns, taxrush, discounts) */}
          {step === 1 && (
            <WizardInputs
              region={answers.region}
              values={answers}
              // Apply tiny patches (only the field that changed).
              onChange={(patch) => setAnswers(a => ({ ...a, ...patch }))}
              onBack={goWelcome}
              onNext={goReview}
            />
          )}

          {/* STEP 3 — Review (show what we will seed; confirm -> App) */}
          {step === 2 && (
            <WizardReview
              values={answers}
              onBack={goInputs}
              onConfirm={() => onConfirmBaseline(answers)}
            />
          )}
        </div>

        {/* Optional: a safe escape hatch while you’re developing */}
        <button className="btn-link" onClick={onCancel}>Skip wizard</button>
      </div>

      {/* Right column: small explainer; you can remove later */}
      <div className="card">
        <div className="card-title">What this does</div>
        <p className="small">
          We use these answers to create a Baseline for the dashboard.
          U.S. forces TaxRush = 0. Canada allows and preserves TaxRush.
        </p>
      </div>
    </div>
  )
}
