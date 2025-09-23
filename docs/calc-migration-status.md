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

Notes:

- Do not wire to UI yet. Ensure app still builds.
- Keep domain pure; no Angular imports in `domain/*`.
- Record deltas in `docs/BLUEPRINT_DELTA.md` and update blueprint mappings later.
