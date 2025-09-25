## 2025-09-25 — Expense Fields Realignment (Percent → Fixed Amount)

- Changed expense identifiers and bases to align with business rules and React parity:
  - telephonePct → telephoneAmt (fixed amount)
  - utilitiesPct → utilitiesAmt (fixed amount)
  - localAdvPct → localAdvAmt (fixed amount)
  - insurancePct → insuranceAmt (fixed amount)
  - postagePct → postageAmt (fixed amount)
  - duesPct → duesAmt (fixed amount)
  - bankFeesPct → bankFeesAmt (fixed amount)
  - maintenancePct → maintenanceAmt (fixed amount)
  - travelEntPct → travelEntAmt (fixed amount)

Impacted areas:
- `angular/src/app/domain/types/expenses.types.ts` (dictionary updated)
- `angular/src/app/pages/dashboard/components/inputs-panel.component.ts` (bindings and dual-entry logic)
- Domain calc already expects `*Amt` for these fields; no change required
- Tests and fixtures: adjust to use the new `*Amt` keys

## Blueprint Delta (pre-port)

- Added planned folders to align with domain-first architecture:
  - `angular/src/app/domain/calculations/*` (pure math, KPI helpers, wizard projections)
  - `angular/src/app/domain/types/*` (calc IO, expenses dictionary)
  - `angular/src/app/core/tokens/region-configs.token.ts` (REGION_CONFIGS)
- Service stubs (no heavy logic):
  - `WizardStateService`, `ConfigService`, `CalculationService` under `angular/src/app/core/services/`

Additional alignment items:

- Confirm 6-category expense grouping in Angular (personnel, facility, marketing, utilities, franchise/royalties, misc) with 17 fields mapped from React's 5-category structure.
- Standardize discounts key to `discountsAMT` across UI/services/domain.
- Provide `REGION_CONFIGS` via app bootstrap and wire into `ConfigService`.

Rationale: Move framework-agnostic logic into `domain/*`. Centralize region/KPI presets behind an injection token. Keep components math-free per blueprint guardrails.
