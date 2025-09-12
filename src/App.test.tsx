import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock the calculation functions
vi.mock('./lib/calcs', () => ({
  calc: vi.fn(() => ({
    grossFees: 200000,
    discounts: 6000,
    taxPrepIncome: 194000,
    totalExpenses: 131720,
    netIncome: 62280,
    costPerReturn: 82.32,
    netMarginPct: 32.1,
    totalReturns: 1600
  })),
  statusForCPR: vi.fn(() => 'green'),
  statusForMargin: vi.fn(() => 'green'),
  statusForNetIncome: vi.fn(() => 'green'),
}))

describe('Liberty Tax P&L App', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the main header and brand', () => {
      render(<App />)
      expect(screen.getByText(/Liberty Tax • P&L Budget & Forecast/)).toBeInTheDocument()
    })

    it('renders region selector with US as default', () => {
      render(<App />)
      const regionSelect = screen.getByLabelText(/Region/)
      expect(regionSelect).toHaveValue('US')
    })

    it('renders scenario selector', () => {
      render(<App />)
      expect(screen.getByText(/Quick Inputs/)).toBeInTheDocument()
    })

    it('renders all input fields with default values', () => {
      render(<App />)
      
      // Income drivers
      expect(screen.getByDisplayValue('125')).toBeInTheDocument() // Average Net Fee
      expect(screen.getByDisplayValue('1600')).toBeInTheDocument() // Tax Prep Returns
      
      // Expense percentages should be visible
      expect(screen.getByDisplayValue('3')).toBeInTheDocument() // Discounts
      expect(screen.getByDisplayValue('25')).toBeInTheDocument() // Salaries
    })

    it('renders KPI dashboard with calculated values', () => {
      render(<App />)
      
      expect(screen.getByText('Net Income')).toBeInTheDocument()
      expect(screen.getByText('Net Margin')).toBeInTheDocument()
      expect(screen.getByText('Cost / Return')).toBeInTheDocument()
    })
  })

  describe('Region Functionality', () => {
    it('enables TaxRush input when region is CA', async () => {
      render(<App />)
      
      const regionSelect = screen.getByLabelText(/Region/)
      await user.selectOptions(regionSelect, 'CA')
      
      const taxRushInput = screen.getByLabelText(/TaxRush Returns/)
      expect(taxRushInput).not.toBeDisabled()
    })

    it('disables TaxRush input when region is US', async () => {
      render(<App />)
      
      const regionSelect = screen.getByLabelText(/Region/)
      await user.selectOptions(regionSelect, 'US')
      
      const taxRushInput = screen.getByLabelText(/TaxRush Returns/)
      expect(taxRushInput).toBeDisabled()
    })

    it('sets TaxRush to 0 when switching to US region', async () => {
      render(<App />)
      
      // First set to CA and add some TaxRush returns
      const regionSelect = screen.getByLabelText(/Region/)
      await user.selectOptions(regionSelect, 'CA')
      
      const taxRushInput = screen.getByLabelText(/TaxRush Returns/)
      await user.clear(taxRushInput)
      await user.type(taxRushInput, '100')
      
      // Switch back to US
      await user.selectOptions(regionSelect, 'US')
      
      // TaxRush should be reset to 0
      expect(taxRushInput).toHaveValue(0)
    })
  })

  describe('Input Interactions', () => {
    it('updates average net fee when typed', async () => {
      render(<App />)
      
      const anfInput = screen.getByLabelText(/Average Net Fee/)
      await user.clear(anfInput)
      await user.type(anfInput, '150')
      
      expect(anfInput).toHaveValue(150)
    })

    it('updates tax prep returns when typed', async () => {
      render(<App />)
      
      const returnsInput = screen.getByLabelText(/Tax Prep Returns/)
      await user.clear(returnsInput)
      await user.type(returnsInput, '2000')
      
      expect(returnsInput).toHaveValue(2000)
    })

    it('updates expense percentages when typed', async () => {
      render(<App />)
      
      const discountsInput = screen.getByLabelText(/Discounts %/)
      await user.clear(discountsInput)
      await user.type(discountsInput, '5')
      
      expect(discountsInput).toHaveValue(5)
    })
  })

  describe('Persistence', () => {
    it('saves data to localStorage on input change', async () => {
      render(<App />)
      
      const anfInput = screen.getByLabelText(/Average Net Fee/)
      await user.clear(anfInput)
      await user.type(anfInput, '150')
      
      // Wait for debounced save
      await waitFor(() => {
        const stored = localStorage.getItem(expect.stringContaining('lt_pnl_v5_session'))
        expect(stored).toBeTruthy()
      }, { timeout: 1000 })
    })

    it('restores data from localStorage on mount', () => {
      // Pre-populate localStorage
      const storageKey = 'lt_pnl_v5_session_v1_v0.5-preview'
      const mockData = {
        version: 1,
        last: {
          region: 'CA',
          scenario: 'Conservative',
          avgNetFee: 200,
          taxPrepReturns: 2000,
          taxRushReturns: 100,
          discountsPct: 5,
          salariesPct: 30,
          rentPct: 20,
          suppliesPct: 4,
          royaltiesPct: 15,
          advRoyaltiesPct: 6,
          miscPct: 3,
          thresholds: {
            cprGreen: 95,      // Aligned with strategic baseline ($92 cost/return)
            cprYellow: 110,    // Monitor range for cost management
            nimGreen: 22.5,    // Mirror expense KPI ranges (22.5-25.5% green)
            nimYellow: 19.5,   // Mirror expense KPI ranges (19.5-22.5% yellow)
            netIncomeWarn: -5000,
          }
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(mockData))
      
      render(<App />)
      
      // Check that values were restored
      expect(screen.getByDisplayValue('200')).toBeInTheDocument() // ANF
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument() // Returns
      expect(screen.getByLabelText(/Region/)).toHaveValue('CA')
    })

    it('clears data when reset button is clicked', async () => {
      // Pre-populate localStorage
      const storageKey = 'lt_pnl_v5_session_v1_v0.5-preview'
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, last: {} }))
      
      render(<App />)
      
      const resetButton = screen.getByRole('button', { name: /Reset/ })
      await user.click(resetButton)
      
      // Should clear localStorage
      expect(localStorage.getItem(storageKey)).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all inputs', () => {
      render(<App />)
      
      expect(screen.getByLabelText(/Average Net Fee/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tax Prep Returns/)).toBeInTheDocument()
      expect(screen.getByLabelText(/TaxRush Returns/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Region/)).toBeInTheDocument()
    })

    it('has proper ARIA attributes', () => {
      render(<App />)
      
      const regionSelect = screen.getByLabelText(/Region/)
      expect(regionSelect).toHaveAttribute('aria-label', 'Region')
      
      const resetButton = screen.getByRole('button', { name: /Reset/ })
      expect(resetButton).toHaveAttribute('aria-label', 'Reset to defaults')
    })
  })

  describe('Scenario Selection', () => {
    it('changes scenario when selected', async () => {
      render(<App />)
      
      // Assuming ScenarioSelector renders a select element
      const scenarioElement = screen.getByText(/Custom/) // or however scenarios are displayed
      expect(scenarioElement).toBeInTheDocument()
    })
  })

  describe('Debug Panel', () => {
    it('shows debug panel when DEBUG is true or debug=1 in URL', () => {
      // Mock URLSearchParams to return debug=1
      const mockURLSearchParams = vi.fn(() => ({
        get: vi.fn(() => '1')
      }))
      vi.stubGlobal('URLSearchParams', mockURLSearchParams)
      
      render(<App />)
      
      expect(screen.getByText('Debug')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage error')
      })
      
      // Should not crash
      expect(() => render(<App />)).not.toThrow()
      
      // Restore
      localStorage.getItem = originalGetItem
    })

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('lt_pnl_v5_session_v1_v0.5-preview', 'invalid json')
      
      // Should not crash and should render with defaults
      expect(() => render(<App />)).not.toThrow()
      expect(screen.getByDisplayValue('125')).toBeInTheDocument() // Default ANF
    })
  })
})
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock the calculation functions
vi.mock('./lib/calcs', () => ({
  calc: vi.fn(() => ({
    grossFees: 200000,
    discounts: 6000,
    taxPrepIncome: 194000,
    totalExpenses: 131720,
    netIncome: 62280,
    costPerReturn: 82.32,
    netMarginPct: 32.1,
    totalReturns: 1600
  })),
  statusForCPR: vi.fn(() => 'green'),
  statusForMargin: vi.fn(() => 'green'),
  statusForNetIncome: vi.fn(() => 'green'),
}))

describe('Liberty Tax P&L App', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear all mocks
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders the main header and brand', () => {
      render(<App />)
      expect(screen.getByText(/Liberty Tax • P&L Budget & Forecast/)).toBeInTheDocument()
    })

    it('renders region selector with US as default', () => {
      render(<App />)
      const regionSelect = screen.getByLabelText(/Region/)
      expect(regionSelect).toHaveValue('US')
    })

    it('renders scenario selector', () => {
      render(<App />)
      expect(screen.getByText(/Quick Inputs/)).toBeInTheDocument()
    })

    it('renders all input fields with default values', () => {
      render(<App />)
      
      // Income drivers
      expect(screen.getByDisplayValue('125')).toBeInTheDocument() // Average Net Fee
      expect(screen.getByDisplayValue('1600')).toBeInTheDocument() // Tax Prep Returns
      
      // Expense percentages should be visible
      expect(screen.getByDisplayValue('3')).toBeInTheDocument() // Discounts
      expect(screen.getByDisplayValue('25')).toBeInTheDocument() // Salaries
    })

    it('renders KPI dashboard with calculated values', () => {
      render(<App />)
      
      expect(screen.getByText('Net Income')).toBeInTheDocument()
      expect(screen.getByText('Net Margin')).toBeInTheDocument()
      expect(screen.getByText('Cost / Return')).toBeInTheDocument()
    })
  })

  describe('Region Functionality', () => {
    it('enables TaxRush input when region is CA', async () => {
      render(<App />)
      
      const regionSelect = screen.getByLabelText(/Region/)
      await user.selectOptions(regionSelect, 'CA')
      
      const taxRushInput = screen.getByLabelText(/TaxRush Returns/)
      expect(taxRushInput).not.toBeDisabled()
    })

    it('disables TaxRush input when region is US', async () => {
      render(<App />)
      
      const regionSelect = screen.getByLabelText(/Region/)
      await user.selectOptions(regionSelect, 'US')
      
      const taxRushInput = screen.getByLabelText(/TaxRush Returns/)
      expect(taxRushInput).toBeDisabled()
    })

    it('sets TaxRush to 0 when switching to US region', async () => {
      render(<App />)
      
      // First set to CA and add some TaxRush returns
      const regionSelect = screen.getByLabelText(/Region/)
      await user.selectOptions(regionSelect, 'CA')
      
      const taxRushInput = screen.getByLabelText(/TaxRush Returns/)
      await user.clear(taxRushInput)
      await user.type(taxRushInput, '100')
      
      // Switch back to US
      await user.selectOptions(regionSelect, 'US')
      
      // TaxRush should be reset to 0
      expect(taxRushInput).toHaveValue(0)
    })
  })

  describe('Input Interactions', () => {
    it('updates average net fee when typed', async () => {
      render(<App />)
      
      const anfInput = screen.getByLabelText(/Average Net Fee/)
      await user.clear(anfInput)
      await user.type(anfInput, '150')
      
      expect(anfInput).toHaveValue(150)
    })

    it('updates tax prep returns when typed', async () => {
      render(<App />)
      
      const returnsInput = screen.getByLabelText(/Tax Prep Returns/)
      await user.clear(returnsInput)
      await user.type(returnsInput, '2000')
      
      expect(returnsInput).toHaveValue(2000)
    })

    it('updates expense percentages when typed', async () => {
      render(<App />)
      
      const discountsInput = screen.getByLabelText(/Discounts %/)
      await user.clear(discountsInput)
      await user.type(discountsInput, '5')
      
      expect(discountsInput).toHaveValue(5)
    })
  })

  describe('Persistence', () => {
    it('saves data to localStorage on input change', async () => {
      render(<App />)
      
      const anfInput = screen.getByLabelText(/Average Net Fee/)
      await user.clear(anfInput)
      await user.type(anfInput, '150')
      
      // Wait for debounced save
      await waitFor(() => {
        const stored = localStorage.getItem(expect.stringContaining('lt_pnl_v5_session'))
        expect(stored).toBeTruthy()
      }, { timeout: 1000 })
    })

    it('restores data from localStorage on mount', () => {
      // Pre-populate localStorage
      const storageKey = 'lt_pnl_v5_session_v1_v0.5-preview'
      const mockData = {
        version: 1,
        last: {
          region: 'CA',
          scenario: 'Conservative',
          avgNetFee: 200,
          taxPrepReturns: 2000,
          taxRushReturns: 100,
          discountsPct: 5,
          salariesPct: 30,
          rentPct: 20,
          suppliesPct: 4,
          royaltiesPct: 15,
          advRoyaltiesPct: 6,
          miscPct: 3,
          thresholds: {
            cprGreen: 25,
            cprYellow: 35,
            nimGreen: 20,
            nimYellow: 10,
            netIncomeWarn: -5000,
          }
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(mockData))
      
      render(<App />)
      
      // Check that values were restored
      expect(screen.getByDisplayValue('200')).toBeInTheDocument() // ANF
      expect(screen.getByDisplayValue('2000')).toBeInTheDocument() // Returns
      expect(screen.getByLabelText(/Region/)).toHaveValue('CA')
    })

    it('clears data when reset button is clicked', async () => {
      // Pre-populate localStorage
      const storageKey = 'lt_pnl_v5_session_v1_v0.5-preview'
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, last: {} }))
      
      render(<App />)
      
      const resetButton = screen.getByRole('button', { name: /Reset/ })
      await user.click(resetButton)
      
      // Should clear localStorage
      expect(localStorage.getItem(storageKey)).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all inputs', () => {
      render(<App />)
      
      expect(screen.getByLabelText(/Average Net Fee/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tax Prep Returns/)).toBeInTheDocument()
      expect(screen.getByLabelText(/TaxRush Returns/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Region/)).toBeInTheDocument()
    })

    it('has proper ARIA attributes', () => {
      render(<App />)
      
      const regionSelect = screen.getByLabelText(/Region/)
      expect(regionSelect).toHaveAttribute('aria-label', 'Region')
      
      const resetButton = screen.getByRole('button', { name: /Reset/ })
      expect(resetButton).toHaveAttribute('aria-label', 'Reset to defaults')
    })
  })

  describe('Scenario Selection', () => {
    it('changes scenario when selected', async () => {
      render(<App />)
      
      // Assuming ScenarioSelector renders a select element
      const scenarioElement = screen.getByText(/Custom/) // or however scenarios are displayed
      expect(scenarioElement).toBeInTheDocument()
    })
  })

  describe('Debug Panel', () => {
    it('shows debug panel when DEBUG is true or debug=1 in URL', () => {
      // Mock URLSearchParams to return debug=1
      const mockURLSearchParams = vi.fn(() => ({
        get: vi.fn(() => '1')
      }))
      vi.stubGlobal('URLSearchParams', mockURLSearchParams)
      
      render(<App />)
      
      expect(screen.getByText('Debug')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage error')
      })
      
      // Should not crash
      expect(() => render(<App />)).not.toThrow()
      
      // Restore
      localStorage.getItem = originalGetItem
    })

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('lt_pnl_v5_session_v1_v0.5-preview', 'invalid json')
      
      // Should not crash and should render with defaults
      expect(() => render(<App />)).not.toThrow()
      expect(screen.getByDisplayValue('125')).toBeInTheDocument() // Default ANF
    })
  })
})
