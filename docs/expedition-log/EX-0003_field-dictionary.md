# EX-0003 Field Dictionary

## Terrain
- Centralized field metadata drives both prior-year normalization and income-driver goal forms through a single dictionary of keys, labels, validators, and derivations.【F:src/app/existing-store/shared/fields.dictionary.ts†L1-L197】

## Artifacts
- Dictionary rows inform schema selection and reactive control generation inside the income-drivers component.【F:src/app/components/income-drivers/income-drivers.component.ts†L46-L119】【F:src/app/components/income-drivers/income-drivers.component.ts†L227-L358】
- Prior-year performance surface renders input labels and summary metrics straight from the dictionary, eliminating hard-coded copy.【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L42-L192】
- Goals schema references the same keys by mode × region × store type to gate visibility and rules.【F:src/app/existing-store/income-drivers/goals.config.ts†L1-L134】

## Fault Lines
- Prior-year discount and other-income overrides are still surfaced through injected metrics rather than explicit fields, limiting alias flexibility for Canadian workflows.【F:src/app/components/income-drivers/income-drivers.component.ts†L264-L283】

## Hypotheses
- Extending the dictionary with prior-year discount/other-income inputs will align Angular parity with the React baseline once API payloads land.

## Evidence
| Field | Label | Type | Derive From | Validators | Usage |
|-------|-------|------|-------------|------------|--------|
| `avgNetFee` | Average Net Fee | money | — | required, min 50, max 500, step 1 | Schema-driven builder seeds and validates control.【F:src/app/existing-store/shared/fields.dictionary.ts†L44-L50】【F:src/app/components/income-drivers/income-drivers.component.ts†L227-L257】 |
| `taxPrepReturns` | Tax Prep Returns | number | — | required, min 100, max 10000, step 1 | Drives gross-fee derivations inside the reactive form.【F:src/app/existing-store/shared/fields.dictionary.ts†L52-L58】【F:src/app/components/income-drivers/income-drivers.component.ts†L227-L257】【F:src/app/components/income-drivers/income-drivers.component.ts†L419-L434】 |
| `taxRushReturns` | TaxRush Returns | number | — | min 0, max 10000, step 1 | Feeds TaxRush share and gross-fee calculations when enabled.【F:src/app/existing-store/shared/fields.dictionary.ts†L60-L66】【F:src/app/components/income-drivers/income-drivers.component.ts†L419-L438】 |
| `taxRushPercentage` | TaxRush % of Returns | percent | `taxRushReturns`, `taxPrepReturns` | min 0, max 100, step 0.1 | Derived control showing share of returns in TaxRush scenarios.【F:src/app/existing-store/shared/fields.dictionary.ts†L68-L75】【F:src/app/components/income-drivers/income-drivers.component.ts†L419-L438】 |
| `taxRushFee` | TaxRush Average Net Fee | money | — | min 0, max 500, step 1 | User-supplied average fee for TaxRush calculations.【F:src/app/existing-store/shared/fields.dictionary.ts†L77-L83】【F:src/app/components/income-drivers/income-drivers.component.ts†L427-L433】 |
| `grossTaxPrepFees` | Gross Tax Prep Fees | money | `avgNetFee`, `taxPrepReturns` | — | Auto-calculated gross revenue baseline for goals.【F:src/app/existing-store/shared/fields.dictionary.ts†L85-L91】【F:src/app/components/income-drivers/income-drivers.component.ts†L419-L423】 |
| `grossTaxRushFees` | Gross TaxRush Fees | money | `taxRushReturns`, `taxRushFee`, `avgNetFee`, `taxPrepReturns` | — | Derived TaxRush gross earnings including fallback to avg fee.【F:src/app/existing-store/shared/fields.dictionary.ts†L93-L99】【F:src/app/components/income-drivers/income-drivers.component.ts†L427-L434】 |
| `discountsAmt` | Customer Discounts ($) | money | `grossTaxPrepFees`, `discountsPct` | — | Locked behind derivation to mirror percent-based adjustments.【F:src/app/existing-store/shared/fields.dictionary.ts†L101-L107】【F:src/app/components/income-drivers/income-drivers.component.ts†L422-L426】 |
| `discountsPct` | Customer Discounts (%) | percent | — | min 0, max 100, step 0.1 | Manual percentage input mirrored by derived dollar amount and defaulted to 3%.【F:src/app/existing-store/shared/fields.dictionary.ts†L109-L115】【F:src/app/components/income-drivers/income-drivers.component.ts†L286-L304】【F:src/app/components/income-drivers/income-drivers.component.ts†L422-L424】 |
| `netTaxPrepFees` | Net Tax Prep Fees | money | `grossTaxPrepFees`, `discountsAmt` | — | Derived net revenue after discounts for downstream expense heuristics.【F:src/app/existing-store/shared/fields.dictionary.ts†L117-L123】【F:src/app/components/income-drivers/income-drivers.component.ts†L422-L426】 |
| `otherIncome` | Other Income | money | — | min 0, step 1 | Optional revenue streams toggled per schema rules.【F:src/app/existing-store/shared/fields.dictionary.ts†L125-L131】【F:src/app/existing-store/income-drivers/goals.config.ts†L10-L109】 |
| `totalExpenses` | Total Expenses | money | `grossTaxPrepFees` | — | Auto-fills to 76% benchmark for projections.【F:src/app/existing-store/shared/fields.dictionary.ts†L133-L139】【F:src/app/components/income-drivers/income-drivers.component.ts†L435-L436】 |
| `lastYearGrossFees` | Prior-Year Gross Fees | money | — | min 0, step 1 | Seeds prior-year revenue alignment for existing mode.【F:src/app/existing-store/shared/fields.dictionary.ts†L141-L149】【F:src/app/components/income-drivers/income-drivers.component.ts†L264-L283】 |
| `lastYearExpenses` | Prior-Year Expenses | money | — | min 0, step 1 | Populates baseline expenses for comparisons.【F:src/app/existing-store/shared/fields.dictionary.ts†L150-L156】【F:src/app/components/income-drivers/income-drivers.component.ts†L264-L283】 |
| `lastYearReturns` | Prior-Year Returns | number | — | min 0, max 10000, step 1 | Captures prior-year return volume for growth deltas.【F:src/app/existing-store/shared/fields.dictionary.ts†L158-L164】【F:src/app/components/income-drivers/income-drivers.component.ts†L264-L283】 |
| `expectedGrowthPct` | Expected Growth % | percent | — | min -50, max 100, step 0.5 | Controls growth scenarios across new/existing schemas.【F:src/app/existing-store/shared/fields.dictionary.ts†L166-L172】【F:src/app/existing-store/income-drivers/goals.config.ts†L10-L109】 |
| `handlesTaxRush` | Handles TaxRush | boolean | — | — | Boolean toggle gating TaxRush-dependent controls.【F:src/app/existing-store/shared/fields.dictionary.ts†L174-L178】【F:src/app/existing-store/income-drivers/goals.config.ts†L10-L109】 |
| `lastYearRevenue` | Prior-Year Revenue | money | `lastYearGrossFees` | min 0, step 1 | Derived revenue using injected prior-year metrics for alias parity.【F:src/app/existing-store/shared/fields.dictionary.ts†L180-L188】【F:src/app/components/income-drivers/income-drivers.component.ts†L439-L445】【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L65-L83】 |
| `netIncome` | Net Income | money | `lastYearRevenue`, `lastYearExpenses` | — | Summary metric emitted by prior-year normalizer and rendered via dictionary labels.【F:src/app/existing-store/shared/fields.dictionary.ts†L190-L197】【F:src/app/components/prior-year-performance/prior-year-performance.component.ts†L65-L83】【F:src/app/existing-store/shared/calc.util.ts†L110-L137】 |

## Trail Marker
1. Add dictionary entries for prior-year discount and other-income overrides to unlock full alias coverage.
2. Sync validators with forthcoming API contracts once upstream payload requirements land.
3. Document schema-specific business rules (e.g., TaxRush mandates in CA) alongside the dictionary for quick auditing.
