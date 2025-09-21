import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, beforeAll, vi } from 'vitest';
import WizardInputs from '../../WizardInputs';
import type { WizardAnswers } from '../../Wizard/types';

describe('Expenses & Revenue Breakdown', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).scrollTo = vi.fn();
  });

  const base: WizardAnswers = {
    region: 'US',
    storeType: 'existing',
    avgNetFee: 125,
    taxPrepReturns: 1600,
    expectedGrowthPct: 5,
    discountsPct: 3,
  };

  test('locks ANF, Returns, and Discounts on Page 2', () => {
    render(
      <WizardInputs
        answers={base}
        updateAnswers={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByPlaceholderText(/125/i)).toBeDisabled();
    expect(screen.getByPlaceholderText(/1600/i)).toBeDisabled();
    expect(screen.getAllByPlaceholderText(/3/i)[0]).toBeDisabled();
  });

  test('shows Projected Gross Revenue Breakdown with correct math', () => {
    render(
      <WizardInputs
        answers={base}
        updateAnswers={vi.fn()}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    expect(screen.getByText(/Projected Gross Revenue Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/\$220,080/)).toBeInTheDocument();
    expect(screen.getByText(/-.*6,602/)).toBeInTheDocument();
    expect(screen.getAllByText(/\$213,478/)[0]).toBeInTheDocument();
  });

  test('expense reset buttons call update', () => {
    const mockUpdate = vi.fn();
    render(
      <WizardInputs
        answers={base}
        updateAnswers={mockUpdate}
        onNext={vi.fn()}
        onBack={vi.fn()}
        canProceed={true}
      />
    );

    screen.getByText(/Reset Expenses to Strategic Defaults/i).click();
    expect(mockUpdate).toHaveBeenCalled();
  });
});
