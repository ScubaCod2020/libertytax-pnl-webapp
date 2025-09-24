AnalysisBlock (UI/Types) migration status

- Staged:
  - Types: `angular/src/app/domain/types/analysis.types.ts`
  - UI: `angular/src/app/components/analysis-block/analysis-block.component.ts`
- Remaining:
  - Service to compute insights/comparisons from wizard/projected state (domain/service)
  - Feature-flag provider and gating for dev-only visibility
  - Placement in Wizard Step 1 and Dashboard (render shells only)
  - Documentation updates and trace hooks

PerformanceCard (UI/Types) migration status

- Staged:
  - Types: `angular/src/app/domain/types/performance.types.ts`
  - UI: `angular/src/app/components/performance-card/performance-card.component.ts`
  - Preview placement: Dashboard middle column under `showPerformanceCards`
- Remaining:
  - MetricsAssembler service to compute YTD vs Projected metrics
  - Multi-store/monthly variants

## Calc Migration Status

- Core P&L Math (src/lib/calcs.ts)
  - [x] Port `calc` → `angular/src/app/domain/calculations/calc.ts`
  - [x] Port KPI helpers → `angular/src/app/domain/calculations/kpi.ts`
  - [x] Types `Inputs/Results/Thresholds/Region` → `angular/src/app/domain/types/calculation.types.ts`
  - [x] Adapters (React-like) → `angular/src/app/domain/calculations/adapters.ts`

- Wizard Helpers (src/components/Wizard/calculations.ts)
  - [x] Growth + projections → `angular/src/app/domain/calculations/wizard-helpers.ts`
  - [ ] Currency/percent formatting → keep UI-layer; domain exposes numbers only

- Expenses Dictionary (src/types/expenses.ts)
  - [ ] Port shapes + defaults → `angular/src/app/domain/types/expenses.types.ts`
  - [ ] Region filtering helpers → domain utils

- Presets (src/data/presets.ts)
  - [ ] Move data under config token or keep as seed in `core/tokens`

- Angular Scaffolding
  - [x] REGION_CONFIGS token → `angular/src/app/core/tokens/region-configs.token.ts`
  - [x] WizardStateService → `angular/src/app/core/services/wizard-state.service.ts`
  - [x] ConfigService → `angular/src/app/core/services/config.service.ts`
  - [x] CalculationService → `angular/src/app/core/services/calculation.service.ts`

## Staged Components & Calculations (2025-09-24)

- AnalysisBlock UI shell + types (dev-gated, not wired)
- PerformanceCard UI shell + types (dev-gated, not wired)  
- Wizard helpers: performance vs target, adjustment status functions
- MetricsAssemblerService + AnalysisDataAssemblerService (demo data)
- **NewStoreSection**: Complete target performance goals form with auto-calculations
- **Wizard UI Components**: ToggleQuestion, CurrencyInput, NumberInput (ControlValueAccessor support)
- **Complete WizardAnswers**: Full interface with all 17 expense fields

## What Remains

- Wire AnalysisBlock + PerformanceCard business logic (replace demo data)
- Connect wizard pages to CalculationService for live updates  
- Complete expense dual-entry system (bidirectional $ ↔ % sync)
- Add remaining React wizard components (existing store sections, expense pages)
- **Integration**: Wire NewStoreSection into income drivers page with state management

Notes:

- Do not wire to UI yet. Ensure app still builds.
- Keep domain pure; no Angular imports in `domain/*`.
- Record deltas in `docs/BLUEPRINT_DELTA.md` and update blueprint mappings later.
