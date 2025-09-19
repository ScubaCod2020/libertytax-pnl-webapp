import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, beforeAll, vi, expect } from 'vitest'
import App from '../../../App'

type Scenario = {
  region: 'US' | 'CA'
  returns: number
  fee: number
  growth: number // percent, may be negative
  otherIncome: number
}

// ~20 representative cases
const scenarios: Scenario[] = [
  // US small/typical/high volume
  { region: 'US', returns: 250, fee: 100, growth: 0, otherIncome: 0 },
  { region: 'US', returns: 500, fee: 250, growth: 5, otherIncome: 0 },
  { region: 'US', returns: 1000, fee: 400, growth: 20, otherIncome: 5000 },
  { region: 'US', returns: 250, fee: 250, growth: 0, otherIncome: 0 },
  { region: 'US', returns: 500, fee: 100, growth: 20, otherIncome: 5000 },
  { region: 'US', returns: 1000, fee: 250, growth: 5, otherIncome: 0 },
  { region: 'US', returns: 500, fee: 400, growth: 0, otherIncome: 0 },
  { region: 'US', returns: 1000, fee: 100, growth: 5, otherIncome: 5000 },
  { region: 'US', returns: 250, fee: 400, growth: 20, otherIncome: 0 },

  // CA mixes
  { region: 'CA', returns: 1000, fee: 100, growth: -10, otherIncome: 0 },
  { region: 'CA', returns: 1600, fee: 250, growth: 0, otherIncome: 0 },
  { region: 'CA', returns: 2500, fee: 400, growth: 5, otherIncome: 10000 },
  { region: 'CA', returns: 1000, fee: 250, growth: 0, otherIncome: 0 },
  { region: 'CA', returns: 1600, fee: 100, growth: 5, otherIncome: 10000 },
  { region: 'CA', returns: 2500, fee: 250, growth: -10, otherIncome: 0 },
  { region: 'CA', returns: 1000, fee: 400, growth: 0, otherIncome: 0 },
  { region: 'CA', returns: 1600, fee: 400, growth: -10, otherIncome: 0 },
  { region: 'CA', returns: 2500, fee: 100, growth: 5, otherIncome: 10000 },
  { region: 'CA', returns: 1600, fee: 250, growth: 5, otherIncome: 0 },
  { region: 'CA', returns: 1000, fee: 250, growth: -10, otherIncome: 10000 },
]

function computeExpected(s: Scenario) {
  const growthFactor = 1 + s.growth / 100
  const projReturns = Math.round(s.returns * growthFactor)
  const projFee = Math.round(s.fee * growthFactor)
  const gross = projReturns * projFee
  const discounts = Math.round(gross * 0.03)
  const netTaxPrepIncome = gross - discounts
  const totalRevenue = netTaxPrepIncome + s.otherIncome
  // Approx 76% expenses when not overridden (dashboard. In wizard review we just verify consistency.)
  const expenses = Math.round(totalRevenue * 0.76)
  const netIncome = totalRevenue - expenses
  const marginPct = totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 100) : 0
  const profitPerReturn = projReturns > 0 ? Math.round(netIncome / projReturns) : 0
  return { projReturns, projFee, gross, discounts, netTaxPrepIncome, totalRevenue, expenses, netIncome, marginPct, profitPerReturn }
}

async function setSelectByLabel(labelRegex: RegExp, optionValue: string) {
  const sel = await screen.findByLabelText(labelRegex)
  await userEvent.selectOptions(sel, optionValue)
}

function getStepContainer(step: 'welcome' | 'inputs' | 'review'): HTMLElement {
  const el = document.querySelector(`[data-wizard-step="${step}"]`)
  return (el as HTMLElement) || document.body
}

async function typeIntoScoped(container: HTMLElement, labelRegex: RegExp, value: string) {
  const scoped = within(container)
  // Strategy 1: Accessible label
  const byLabel = scoped.queryAllByLabelText(labelRegex, { selector: 'input' })
  if (byLabel.length > 0) {
    const target = byLabel.find((el) => !(el as HTMLInputElement).disabled) || byLabel[0]
    await userEvent.clear(target)
    await userEvent.type(target, value)
    return
  }
  // Strategy 2: Find visible text label and then the nearest input in the same row/container
  const labelEl = scoped.queryByText(labelRegex)
  if (labelEl) {
    const containerEl = (labelEl as HTMLElement).closest('div')?.parentElement || (labelEl as HTMLElement).parentElement || container
    const input = containerEl?.querySelector('input[type="number"]') as HTMLInputElement | null
    if (input) {
      await userEvent.clear(input)
      await userEvent.type(input, value)
      return
    }
  }
  // Strategy 3: Best-effort pick a spinbutton that is enabled and empty
  const spins = scoped.queryAllByRole('spinbutton') as HTMLInputElement[]
  const candidate = spins.find((el) => !el.disabled && (el.value === '' || el.getAttribute('placeholder')))
  if (candidate) {
    await userEvent.clear(candidate)
    await userEvent.type(candidate, value)
  }
}

describe('Wizard Flow Matrix (dataflow + calcs)', () => {
  beforeAll(() => {
    // jsdom scrollTo stub
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).scrollTo = vi.fn()
  })

  scenarios.forEach((sc, idx) => {
    test(`Scenario #${idx + 1}: ${sc.region} returns=${sc.returns}, fee=${sc.fee}, growth=${sc.growth}%, other=${sc.otherIncome}`, async () => {
      render(<App />)

      // Region in header select
      await setSelectByLabel(/Region/i, sc.region)

      // Launch wizard (if CTA present)
      const launches = screen.queryAllByRole('button', { name: /setup wizard|launch setup wizard/i })
      if (launches.length > 0) {
        await userEvent.click(launches[0])
      }

      // Step 1: Store Type Existing (gives manual entry)
      const storeType = await screen.findByLabelText(/Store Type/i)
      await userEvent.selectOptions(storeType, 'existing')

      // Fill Step 1 basics (scoped to Step 1 container)
      const step1 = getStepContainer('welcome')
      await typeIntoScoped(step1, /Tax Prep Returns/i, String(sc.returns))
      await typeIntoScoped(step1, /Average Net Fee/i, String(sc.fee))

      // Growth
      if (sc.growth !== 0) {
        const step2 = getStepContainer('inputs')
        const labelled = within(step2).queryByLabelText(/performance change/i)
        if (labelled) {
          await userEvent.clear(labelled)
          await userEvent.type(labelled, String(sc.growth))
        } else {
          const growthCandidates = within(step2).queryAllByRole('spinbutton')
          const growthField = growthCandidates.find((el) => /%/.test(el.getAttribute('placeholder') || '') || /growth|change/i.test(el.getAttribute('title') || ''))
          if (growthField) {
            await userEvent.clear(growthField)
            await userEvent.type(growthField, String(sc.growth))
          }
        }
      }

      // Next → Step 2 (click within Step 1)
      const nextToInputs = within(step1).queryByRole('button', { name: /next|next step/i }) || screen.getByRole('button', { name: /next|next step/i })
      await userEvent.click(nextToInputs)

      // Step 2: add other income if specified
      if (sc.otherIncome > 0) {
        const step2 = getStepContainer('inputs')
        const otherInput = within(step2).queryByLabelText(/Other Income/i)
        if (otherInput) {
          await userEvent.clear(otherInput)
          await userEvent.type(otherInput, String(sc.otherIncome))
        }
      }

      // Validate locked fields on Step 2 are disabled (inputs with title "Configured in Step 1")
      const step2Locked = getStepContainer('inputs')
      const configuredInputs = Array.from(step2Locked.querySelectorAll('input[title="Configured in Step 1"]')) as HTMLInputElement[]
      expect(configuredInputs.length).toBeGreaterThanOrEqual(2)
      configuredInputs.forEach((el) => expect(el.disabled).toBe(true))

      // Validate revenue card renders
      expect(await screen.findByText(/Projected Gross Revenue Breakdown/i)).toBeInTheDocument()

      // Compute expected values
      const exp = computeExpected(sc)
      const expectedLog = { scenario: sc, expected: exp }

      // Step 2 assertions: Gross and Net Tax Prep Income numbers should be visible in the breakdown card
      {
        const step2 = getStepContainer('inputs')
        const step2Scope = within(step2)
        const grossRe = new RegExp(`\\$\\s*${exp.gross.toLocaleString()}(?:\\.\\d{2})?`)
        const netTaxPrepRe = new RegExp(`\\$\\s*${exp.netTaxPrepIncome.toLocaleString()}(?:\\.\\d{2})?`)
        // Prefer searching within the revenue breakdown block
        const breakdownHeader = step2Scope.queryByText(/Projected Gross Revenue Breakdown/i)
        const breakdown = breakdownHeader ? breakdownHeader.closest('div') || step2 : step2
        const bdScope = within(breakdown)
        try {
          expect(bdScope.getAllByText(grossRe)[0]).toBeInTheDocument()
        } catch (e) {
          console.error('Scenario Failure (STEP2 GROSS):', { ...expectedLog, actual: 'not found step2 gross' })
          throw e
        }
        try {
          expect(bdScope.getAllByText(netTaxPrepRe)[0]).toBeInTheDocument()
        } catch (e) {
          console.error('Scenario Failure (STEP2 NET TAX PREP):', { ...expectedLog, actual: 'not found step2 netTaxPrep' })
          throw e
        }
      }

      // Next → Step 3 (Review)
      {
        const step2 = getStepContainer('inputs')
        const reviewBtn = within(step2).queryByRole('button', { name: /review data/i }) || within(step2).queryByRole('button', { name: /review/i }) || screen.queryByRole('button', { name: /review/i })
        if (reviewBtn) await userEvent.click(reviewBtn)
      }

      // Wait for review content to render
      await screen.findByText(/Review|Summary|TOTAL REVENUE/i)

      // Review assertions: Total Revenue, Net Income, Margin
      const totalRevenueRe = new RegExp(`\\$\\s*${exp.totalRevenue.toLocaleString()}(?:\\.\\d{2})?`)
      const netIncomeRe = new RegExp(`\\$\\s*${exp.netIncome.toLocaleString()}(?:\\.\\d{2})?`)
      const marginRe = new RegExp(`${exp.marginPct}%`)

      try {
        expect((await screen.findAllByText(totalRevenueRe))[0]).toBeInTheDocument()
      } catch (e) {
        console.error('Scenario Failure (TOTAL REVENUE):', { ...expectedLog, actual: 'not found totalRevenue' })
        throw e
      }
      try {
        expect((await screen.findAllByText(netIncomeRe))[0]).toBeInTheDocument()
      } catch (e) {
        console.error('Scenario Failure (NET INCOME):', { ...expectedLog, actual: 'not found netIncome' })
        throw e
      }
      try {
        expect((await screen.findAllByText(marginRe))[0]).toBeInTheDocument()
      } catch (e) {
        console.error('Scenario Failure (MARGIN):', { ...expectedLog, actual: 'not found margin' })
        throw e
      }

      // Navigate back to dashboard and ensure consistency using the Inputs panel
      const exit = screen.queryByRole('button', { name: /cancel|exit|dashboard/i })
      if (exit) await userEvent.click(exit)

      // On dashboard, verify scenario selector exists (Quick Inputs hidden anchor is rendered)
      expect(await screen.findByText(/Quick Inputs/i)).toBeInTheDocument()
    })
  })
})


