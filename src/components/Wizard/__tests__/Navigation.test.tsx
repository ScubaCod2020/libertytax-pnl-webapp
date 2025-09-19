import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, test, expect, beforeAll, vi } from 'vitest'
import WizardShell, { type WizardAnswers } from '../../WizardShell'

const mockSetRegion = vi.fn()
const mockOnComplete = vi.fn()
const mockOnCancel = vi.fn()

const persistedAnswers: WizardAnswers = {
  region: 'US',
  storeType: 'existing',
  avgNetFee: 125,
  taxPrepReturns: 1600,
  expectedGrowthPct: 5,
  discountsPct: 3,
  handlesTaxRush: false,
  hasOtherIncome: false,
}

const persistence = {
  loadWizardAnswers: () => persistedAnswers,
}

describe('Navigation & Flow', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).scrollTo = vi.fn()
  })

  test('renders pages in sequence and navigates forward/back', async () => {
    render(
      <WizardShell
        region={persistedAnswers.region}
        setRegion={mockSetRegion}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        persistence={persistence}
      />
    )

    // Step 1 (Welcome) visible and nav present
    expect(screen.getByText(/Welcome – Quick Start Wizard/i)).toBeInTheDocument()
    expect(screen.getByText(/Step 1/i)).toBeInTheDocument()

    // Next to Inputs
    screen.getByText(/Next Step: Detailed Inputs/i).click()
    await screen.findByText(/Income & Expense Inputs/i)

    // Next to Review
    screen.getByText(/Review Data/i).click()
    await screen.findByText(/📋 P&L Report Summary/i)

    // Back to Inputs via nav button
    screen.getByText(/← Back/i).click()
    await screen.findByText(/Income & Expense Inputs/i)

    // Tabs/links visible (step nav)
    expect(screen.getByRole('button', { name: /Step 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Step 2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Step 3/i })).toBeInTheDocument()
  })
})
