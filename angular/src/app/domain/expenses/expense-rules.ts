// Centralized rules for expense KPI evaluation and baselines

export type RegionCode = 'US' | 'CA';
export type KpiStatus = 'green' | 'yellow' | 'red';
export type StoreType = 'new' | 'existing';

export interface PercentRule {
  type: 'percent';
  // Thresholds expressed in percent-of-gross revenue
  redAbove?: number; // red if > value
  yellowAbove?: number; // yellow if > value (and <= redAbove)
  redBelow?: number; // red if < value
  yellowBelow?: number; // yellow if < value (and >= redBelow)
}

export interface TargetPercentRule {
  type: 'targetPercent';
  getTarget: (region: RegionCode) => number; // e.g., payroll 25% (CA) or 35% (US)
}

export interface DollarRangeRule {
  type: 'dollarRange';
  // Annual dollar bands
  greenMin: number;
  greenMax: number;
  yellowMax?: number; // yellow if > greenMax and <= yellowMax; red if > yellowMax
}

export type ExpenseRule = PercentRule | TargetPercentRule | DollarRangeRule;

export interface ExpenseRuleEntry {
  id: string;
  rule: ExpenseRule;
  // Optional overrides by region and/or store type
  overrides?: {
    region?: Partial<Record<RegionCode, ExpenseRule>>;
    storeType?: Partial<Record<StoreType, ExpenseRule>>;
  };
}

/**
 * Minimal initial rule set. Rent is handled separately due to mixed unit logic (CA % vs US monthly cap).
 * This concentrates thresholds to a single location. We can expand as needed.
 */
export const EXPENSE_RULES: Record<string, ExpenseRuleEntry> = {
  payroll: {
    id: 'payroll',
    rule: { type: 'targetPercent', getTarget: (region) => (region === 'CA' ? 25 : 35) },
  },
  shortages: {
    id: 'shortages',
    rule: { type: 'percent', yellowAbove: 2.0, redAbove: 2.5 },
  },
  telephone: {
    id: 'telephone',
    rule: { type: 'percent', yellowAbove: 1.05, redAbove: 1.2 },
  },
  utilities: {
    id: 'utilities',
    rule: { type: 'percent', yellowAbove: 1.05, redAbove: 1.25 },
  },
  localAdv: {
    id: 'localAdv',
    rule: { type: 'percent', yellowAbove: 1.75, redAbove: 2.0 },
  },
  supplies: {
    id: 'supplies',
    rule: { type: 'percent', yellowAbove: 3.5, redAbove: 4.0 },
  },
  dues: {
    id: 'dues',
    rule: { type: 'percent', yellowBelow: 0.25, redBelow: 0.2 },
  },
  bankFees: {
    id: 'bankFees',
    rule: { type: 'percent', yellowBelow: 0.15, redBelow: 0.1 },
  },
  maintenance: {
    id: 'maintenance',
    rule: { type: 'percent', yellowBelow: 0.25, redBelow: 0.2 },
  },
  travel: {
    id: 'travel',
    rule: { type: 'percent', yellowBelow: 1.0, redBelow: 0.8 },
  },
  insurance: {
    id: 'insurance',
    rule: { type: 'dollarRange', greenMin: 4800, greenMax: 6000, yellowMax: 7200 },
  },
  misc: {
    id: 'misc',
    // Dollar range derived from percent-of-gross; evaluator will compute $ then apply this band
    rule: { type: 'dollarRange', greenMin: 600, greenMax: 1200 },
  },
};
