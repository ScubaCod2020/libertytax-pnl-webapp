Wire-Up Plan — AnalysisBlock

Targets

- Wizard Step 1 (Income Drivers): show projected growth analysis vs presets (now placed under Projected section)
- Dashboard: show projected vs baseline snapshot analysis (middle column preview)

Connections

- Inputs: ProjectedService (growthPct, scenario)
- Assembler: `AnalysisDataAssemblerService` (domain/service) → returns `AnalysisData`
- UI: `AnalysisBlockComponent` consumes `AnalysisData`

Rationale

- Keep UI presentational; compute AnalysisData in pure TS service for reuse.
- Gate UI via feature flag until fully configured.

Performance Cards wiring (planned)

- Inputs: SettingsService (region/flags), CalculationService (compute), future YTD service
- Assembler: `MetricsAssemblerService` → returns `PerformanceMetric[]` groups
- UI: `PerformanceCardComponent` consumes arrays

# Wire-Up Plan (Inputs → Services → Domain)

## Dashboard

- Inputs: scenario, avgNetFee, taxPrepReturns, taxRushReturns, discountsPct/discountsAMT, otherIncome
- Services: `WizardStateService` (read/write), `ConfigService` (thresholds, bands), `CalculationService` (compute)
- Domain: `calc`, KPI helpers in `kpi.ts`

## Wizard Step 1 (Income Drivers)

- Inputs: region, storeType, flags (handlesTaxRush, hasOtherIncome), presets
- Services: `WizardStateService` (persist), `ConfigService` (REGION_CONFIGS merge)
- Domain: wizard helpers (`wizard-helpers.ts`) and core calc inputs assembly

## Wizard Step 2 (Expenses)

- Inputs: 17 expense fields grouped under 6 categories (personnel, facility, marketing, utilities, franchise/royalties, misc)
- Services: `WizardStateService` (persist), `CalculationService` (dual-entry conversions via `bidir.service`)
- Domain: expense dictionary types; conversions in domain utils if needed

## Wizard Step 3 (P&L / Reports)

- Inputs: none (read-only assemble)
- Services: `ReportAssemblerService` (existing), `CalculationService`
- Domain: `calc`, KPI helpers

## Naming resolution

- Discounts variable canonical name: `discountsAMT` (dollars) and `discountsPct` (percent)
- Persisted keys align with blueprint: `LT_W1_V1`, `LT_W2_V1`, `LT_SNAP_V1`, `LT_DASH_V1`

## REGION_CONFIGS usage

- Provide token at bootstrap with `DEFAULT_REGION_CONFIGS`
- `ConfigService` injects token and exposes effective thresholds/bands per selected region
- Consumers: `CalculationService`, `ReportAssemblerService`, UI gating for TaxRush fields
