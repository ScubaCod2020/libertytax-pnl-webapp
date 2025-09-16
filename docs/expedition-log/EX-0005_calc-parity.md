# EX-0005 Calc Parity

## Terrain
- Hardened prior-year and income-driver math into shared utilities with explicit rounding helpers for cents, percentages, and prior-year normalization.【F:src/app/existing-store/shared/calc.util.ts†L3-L137】

## Artifacts
- `calc.util.ts` exposes pure functions: rounding helpers, discount/TaxRush math, prior-year revenue + net income, and a `normalizePriorYearMetrics` aggregator.【F:src/app/existing-store/shared/calc.util.ts†L3-L137】
- `calc.util.spec.ts` documents parity vectors, covering legacy React scenarios, new boundary guards (tiny percentages, zeros, non-integer averages), and normalization fallbacks.【F:src/app/existing-store/shared/calc.util.spec.ts†L1-L211】

## Fault Lines
- Missing vector: `calculateTaxRushGrossFees` case without avg fee or gross fees still pending to mirror React fail-safe.

## Hypotheses
- Aligning rounding behavior with currency conventions will keep Angular results consistent with the React reference and reduce penny drift.

## Evidence
| Function | Scenario | Expected | Source |
|----------|----------|----------|--------|
| `round2` | 10.005 cents rounding | 10.01 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L17-L23】 |
| `toPct1dp` | 12.35 rounds up | 12.4 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L26-L33】 |
| `calculateDiscountPct` | 206000 gross, 6180 discount | 3 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L36-L43】 |
| `calculateDiscountAmount` | 999999.99 gross, 0.1% | 1000 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L46-L53】 |
| `calculateAvgNetFee` | 206000 ÷ 1680 | 122.62 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L60-L67】 |
| `calculateTaxPrepIncome` | 100000 gross default discount | 97000 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L70-L80】 |
| `calculateTaxRushGrossFees` | fallback avg from gross/returns | 29428.8 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L94-L105】 |
| `calculateTaxRushReturnsPct` | 252 of 1680 | 15 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L108-L115】 |
| `calculateTaxRushReturnsCount` | 1600 @ 12.5% | 200 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L118-L125】 |
| `defaultTaxRushReturns` | 1680 total | 252 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L128-L135】 |
| `calculateLastYearRevenue` | 100000.55 − 3000.12 + 0.2 | 97000.63 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L138-L145】 |
| `calculateTotalExpensesFromGross` | 200000 × 0.76 | 152000 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L148-L155】 |
| `calculateNetIncome` | 202320 − 150000.12 | 52319.88 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L158-L165】 |
| `normalizePriorYearMetrics` | React baseline payload | snapshot parity | 【F:src/app/existing-store/shared/calc.util.spec.ts†L168-L209】 |

## Trail Marker
1. Capture TODO vector for `calculateTaxRushGrossFees` with zeroed inputs.
2. Backfill Angular callers to adopt `round2` outputs end-to-end.
3. Add integration test confirming wizard summaries align with util outputs.
