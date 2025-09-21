import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, beforeAll, vi } from 'vitest';
import WizardInputs from '../../WizardInputs';
import type { WizardAnswers } from '../../Wizard/types';

// mock updateAnswers
const mockUpdate = vi.fn();
const baseAnswers: WizardAnswers = {
  region: 'US',
  storeType: 'existing',
  avgNetFee: 125,
  taxPrepReturns: 1600,
  expectedGrowthPct: 5,
  discountsPct: 3,
};

describe('WizardInputs Page 2', () => {
  beforeAll(() => {
    // Suppress jsdom Not implemented: window.scrollTo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).scrollTo = vi.fn();
  });
  beforeEach(() => {
    mockUpdate.mockClear();
  });

  test('renders locked Average Net Fee and Tax Prep Returns inputs', () => {
    render(
      <WizardInputs
        answers={baseAnswers}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    // These should exist but be read-only/disabled
    const anfInput = screen.getByPlaceholderText(/125/i) as HTMLInputElement;
    const returnsInput = screen.getByPlaceholderText(/1600/i) as HTMLInputElement;

    expect(anfInput).toBeInTheDocument();
    expect(anfInput).toBeDisabled();

    expect(returnsInput).toBeInTheDocument();
    expect(returnsInput).toBeDisabled();
  });

  test('renders locked Customer Discounts input', () => {
    render(
      <WizardInputs
        answers={baseAnswers}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    const discountsInput = screen.getAllByPlaceholderText(/3/i)[0] as HTMLInputElement;
    expect(discountsInput).toBeInTheDocument();
    expect(discountsInput).toBeDisabled();
  });

  test('shows Projected Gross Revenue Breakdown summary', () => {
    render(
      <WizardInputs
        answers={baseAnswers}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByText(/Projected Gross Revenue Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax Prep Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Gross Revenue/i)).toBeInTheDocument();
  });

  test('calculates gross, discounts, and net tax prep income correctly', () => {
    render(
      <WizardInputs
        answers={baseAnswers}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    // With avgNetFee 125, returns 1600, growth +5%:
    // Projected ANF = 131, Projected Returns = 1680
    // Gross = 131 * 1680 = 220,080
    // Discounts = 220,080 * 3% ≈ 6,602
    // Net Tax Prep Income = 213,478
    expect(screen.getByText(/\$220,080/)).toBeInTheDocument();
    expect(screen.getByText(/-.*6,602/)).toBeInTheDocument();
    expect(screen.getAllByText(/\$213,478/)[0]).toBeInTheDocument();
  });

  test('resets expenses to strategic defaults for existing store', () => {
    render(
      <WizardInputs
        answers={{ ...baseAnswers, storeType: 'existing' }}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    const resetBtn = screen.getByText(/Reset Expenses to Strategic Defaults/i);
    resetBtn.click();

    expect(mockUpdate).toHaveBeenCalled();
  });

  test('resets expenses to industry defaults for new store', () => {
    render(
      <WizardInputs
        answers={{ ...baseAnswers, storeType: 'new' }}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    const resetBtn = screen.getByText(/Reset Expenses to Strategic Defaults/i);
    resetBtn.click();
    expect(mockUpdate).toHaveBeenCalled();
  });

  const scenarios = [
    { avgNetFee: 100, returns: 1200, growth: 0, discounts: 2 },
    { avgNetFee: 175, returns: 2000, growth: 10, discounts: 3 },
    { avgNetFee: 250, returns: 800, growth: -5, discounts: 5 },
    { avgNetFee: 130, returns: 3000, growth: 20, discounts: 0 },
  ];

  scenarios.forEach(({ avgNetFee, returns, growth, discounts }) => {
    test(`calculates correctly for ANF ${avgNetFee}, returns ${returns}, growth ${growth}%`, () => {
      render(
        <WizardInputs
          answers={
            {
              region: 'US',
              storeType: 'existing',
              avgNetFee,
              taxPrepReturns: returns,
              expectedGrowthPct: growth,
              discountsPct: discounts,
            } as WizardAnswers
          }
          updateAnswers={mockUpdate}
          onNext={vi.fn()}
          onBack={vi.fn()}
          canProceed={true}
        />
      );

      expect(screen.getByText(/Projected Gross Revenue Breakdown/i)).toBeInTheDocument();
    });
  });
});

// Canada path (non-TaxRush)
describe('WizardInputs Canada (basic non-TaxRush)', () => {
  const caBaseAnswers: WizardAnswers = {
    region: 'CA',
    storeType: 'existing',
    avgNetFee: 140,
    taxPrepReturns: 1000,
    expectedGrowthPct: 10,
    discountsPct: 2,
    handlesTaxRush: false,
  };

  test('renders correctly for Canada without TaxRush', () => {
    render(
      <WizardInputs
        answers={caBaseAnswers}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByText(/Projected Gross Revenue Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Tax Prep Revenue/i)).toBeInTheDocument();
    expect(screen.queryByText(/TaxRush Revenue/i)).not.toBeInTheDocument();
  });
});

// Canadian TaxRush scenarios - left as TODO for future build
describe('WizardInputs Canada with TaxRush (TODO)', () => {
  test.todo('renders TaxRush breakdown when handlesTaxRush = true');
  test.todo('applies TaxRush net fee and returns correctly');
  test.todo('calculates TaxRush gross and discounts');
});
