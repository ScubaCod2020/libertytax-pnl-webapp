// Stabilization shim — safe to replace with real source later.
export type StoreType = 'new' | 'existing' | 'multi' | 'kiosk';
export type RegionCode = 'US' | 'CA' | 'MX' | 'OTHER';

export interface Scenario {
  id: string;
  region: RegionCode;
  store: StoreType;
  // knobs used by services
  thresholds?: { cprGreen?: number; cprYellow?: number; nimGreen?: number; nimYellow?: number };
  modifiers?: Record<string, number>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'us-new-default',
    region: 'US',
    store: 'new',
    thresholds: { cprGreen: 95, cprYellow: 110, nimGreen: 20, nimYellow: 15 },
  },
  // add more as you formalize
];

// simple lookup with safe defaults
export function getScenario(region: RegionCode, store: StoreType): Scenario {
  return SCENARIOS.find((s) => s.region === region && s.store === store) ?? SCENARIOS[0];
}
