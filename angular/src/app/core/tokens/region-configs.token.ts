import { InjectionToken } from '@angular/core';

export type RegionCode = 'US' | 'CA';

export interface RegionThresholds {
  cprGreen: number;
  cprYellow: number;
  nimGreen: number;
  nimYellow: number;
  netIncomeWarn: number;
}

export interface RegionConfig {
  code: RegionCode;
  label: string;
  thresholds: RegionThresholds;
  expenseTargetBand: { minPct: number; maxPct: number };
  features: { taxRush: boolean };
}

export const REGION_CONFIGS = new InjectionToken<Record<RegionCode, RegionConfig>>(
  'REGION_CONFIGS'
);

// Stub defaults; values will be refined per blueprint during porting
export const DEFAULT_REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  US: {
    code: 'US',
    label: 'United States',
    thresholds: {
      cprGreen: 95,
      cprYellow: 110,
      nimGreen: 22.5,
      nimYellow: 19.5,
      netIncomeWarn: -5000,
    },
    expenseTargetBand: { minPct: 0.745, maxPct: 0.775 },
    features: { taxRush: false },
  },
  CA: {
    code: 'CA',
    label: 'Canada',
    thresholds: {
      cprGreen: 95,
      cprYellow: 110,
      nimGreen: 22.5,
      nimYellow: 19.5,
      netIncomeWarn: -5000,
    },
    expenseTargetBand: { minPct: 0.745, maxPct: 0.775 },
    features: { taxRush: true },
  },
};
