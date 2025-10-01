import { describe, it, expect } from 'vitest';
import { statusForCPR, statusForMargin, statusForNetIncome } from './kpi';

const thresholds = {
  cprGreen: 95,
  cprYellow: 110,
  nimGreen: 22.5,
  nimYellow: 19.5,
  netIncomeWarn: -5000,
};

describe('kpi (domain)', () => {
  it('evaluates CPR bands', () => {
    expect(statusForCPR(90, thresholds)).toBe('green');
    expect(statusForCPR(105, thresholds)).toBe('yellow');
    expect(statusForCPR(140, thresholds)).toBe('red');
  });

  it('evaluates margin bands', () => {
    expect(statusForMargin(25, thresholds)).toBe('green');
    expect(statusForMargin(20, thresholds)).toBe('yellow');
    expect(statusForMargin(10, thresholds)).toBe('red');
  });

  it('evaluates net income', () => {
    expect(statusForNetIncome(1, thresholds)).toBe('green');
    expect(statusForNetIncome(-10000, thresholds)).toBe('red');
    expect(statusForNetIncome(-100, thresholds)).toBe('yellow');
  });
});
