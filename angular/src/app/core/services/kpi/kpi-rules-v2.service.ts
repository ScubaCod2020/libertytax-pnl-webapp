import { Injectable } from '@angular/core';

export interface KpiRuleBand {
  minPct?: number;
  maxPct?: number;
  hardCapMonthly?: number;
}

export interface KpiLifecycleBand {
  yearBand: string;
}

export interface KpiRulesConfig {
  features: {
    kpiRulesV2: boolean;
  };
  bands: {
    rent: {
      us: { hard_cap_monthly: number };
      ca: { revenue_pct_max: number; owner_occupied_suppression: boolean };
    };
    payroll: { min_pct: number; max_pct: number };
    marketing: { min_pct: number; max_pct: number };
    tech: { min_pct: number; max_pct: number };
    misc: { warning_pct: number };
  };
  lifecycle: {
    new: KpiLifecycleBand;
    existing: KpiLifecycleBand;
  };
}

export interface KpiEvaluationInput {
  rentMonthly?: number;
  rentRevenuePct?: number;
  rentOwnerOccupied?: boolean;
  payrollPct?: number;
  marketingPct?: number;
  techPct?: number;
  miscPct?: number;
  storeType?: 'new' | 'existing';
}

export interface KpiEvaluationResult {
  rent: 'green' | 'yellow' | 'red';
  payroll: 'green' | 'yellow' | 'red';
  marketing: 'green' | 'yellow' | 'red';
  tech: 'green' | 'yellow' | 'red';
  misc: 'green' | 'yellow' | 'red';
  lifecycleBand: string;
}

@Injectable({ providedIn: 'root' })
export class KpiRulesV2Service {
  constructor() {}

  // TODO: Inject real config once YAML loader exists
  // eslint-disable-next-line class-methods-use-this
  evaluate(input: KpiEvaluationInput): KpiEvaluationResult {
    // Placeholder evaluation: always green with lifecycle defaults
    return {
      rent: 'green',
      payroll: 'green',
      marketing: 'green',
      tech: 'green',
      misc: input.miscPct !== undefined && input.miscPct > 5 ? 'red' : 'green',
      lifecycleBand: input.storeType === 'existing' ? 'Year 2+' : 'Year 1',
    };
  }
}
