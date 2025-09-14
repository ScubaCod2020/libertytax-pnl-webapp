import React from 'react'
import type { Region } from '../lib/calcs'
import WizardShell, { type WizardAnswers } from './WizardShell'

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
  )
}