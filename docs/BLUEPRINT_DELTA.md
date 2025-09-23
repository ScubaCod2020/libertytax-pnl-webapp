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
