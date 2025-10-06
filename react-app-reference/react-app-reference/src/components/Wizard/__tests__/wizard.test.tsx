import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeEach, beforeAll, vi } from 'vitest';
import WizardInputs from '../../WizardInputs';
import type { WizardAnswers } from '../../Wizard/types';

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
    // Mock scrollTo for jsdom
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

    const anfInput = screen.getByPlaceholderText(/125/i) as HTMLInputElement;
    const returnsInput = screen.getByPlaceholderText(/1600/i) as HTMLInputElement;

    expect(anfInput).toBeDisabled();
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
    // Gross = 220,080
    // Discounts = 6,602
    // Net Tax Prep Income = 213,478
    expect(screen.getByText(/\$220,080/)).toBeInTheDocument();
    expect(screen.getByText(/-.*6,602/)).toBeInTheDocument();
    expect(screen.getAllByText(/\$213,478/)[0]).toBeInTheDocument();
  });

  test('renders 🟡 On track when revenue variance within ±5%', () => {
    render(
      <WizardInputs
        answers={{ ...baseAnswers, expectedRevenue: 213478 }}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByText(/On track with strategic plan/i)).toBeInTheDocument();
  });

  test('renders 🟢 Excellent when revenue variance ≥ +5%', () => {
    render(
      <WizardInputs
        answers={{ ...baseAnswers, expectedRevenue: 190000 }}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByText(/Excellent!\s+Well above target/i)).toBeInTheDocument();
  });

  test('renders 🔴 Below target when revenue variance < -5%', () => {
    render(
      <WizardInputs
        answers={{ ...baseAnswers, expectedRevenue: 250000 }}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByText(/Below target/i)).toBeInTheDocument();
  });
});
