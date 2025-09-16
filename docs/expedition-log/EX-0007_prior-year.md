# EX-0007 Prior Year

## Terrain
- PriorYearPerformanceComponent now delegates all math to shared calc utilities, emitting normalized metrics for shell consumers while sourcing all labels from the shared dictionary.【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L32-L238】

## Artifacts
- Dictionary-driven template renders inputs/summary metrics without hard-coded copy, binding validators and units from field specs.【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L42-L132】
- Reactive form captures raw prior-year inputs and streams debounced value changes into `normalizePriorYearMetrics`.【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L188-L238】
- Calc util consolidates discount, revenue, net income, and TaxRush helpers into a normalization pipeline for parity comparisons.【F:src/app/existing-store/shared/calc.util.ts†L3-L137】
- Spec suite asserts both individual helpers and the aggregated normalizer using React baseline payloads.【F:src/app/existing-store/shared/calc.util.spec.ts†L138-L209】

## Fault Lines
- Normalizer still relies on injected discount/other income values; without explicit prior-year fields, user edits remain constrained to provided metrics.【F:src/app/components/income-drivers/income-drivers.component.ts†L264-L283】

## Hypotheses
- Surfacing prior-year discount and other-income overrides alongside the normalizer will let stakeholders validate parity against historical adjustments.

## Evidence
| Example | Calculation | Expected | Source |
|---------|-------------|----------|--------|
| Discount % | `calculateDiscountPct(206000, 6180)` | 3.0% | 【F:src/app/existing-store/shared/calc.util.spec.ts†L40-L47】 |
| Net Income | `calculateNetIncome(202320, 150000.12)` | 52,319.88 | 【F:src/app/existing-store/shared/calc.util.spec.ts†L158-L165】 |
| Normalized Snapshot | `normalizePriorYearMetrics` React payload | Matches baseline metrics | 【F:src/app/existing-store/shared/calc.util.spec.ts†L168-L209】 |

## Trail Marker
1. Add explicit prior-year discount and other-income form controls to complement the normalizer inputs.
2. Feed normalized metrics into projected-performance cards to validate downstream parity.
3. Extend specs with zero-input guard cases for `calculateTaxRushGrossFees` to mirror React fail-safe logic.
