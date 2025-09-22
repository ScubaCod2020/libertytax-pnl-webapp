## Blueprint Delta (pre-port)

- Added planned folders to align with domain-first architecture:
  - `angular/src/app/domain/calculations/*` (pure math, KPI helpers, wizard projections)
  - `angular/src/app/domain/types/*` (calc IO, expenses dictionary)
  - `angular/src/app/core/tokens/region-configs.token.ts` (REGION_CONFIGS)
- Service stubs (no heavy logic):
  - `WizardStateService`, `ConfigService`, `CalculationService` under `angular/src/app/core/services/`

Rationale: Move framework-agnostic logic into `domain/*`. Centralize region/KPI presets behind an injection token. Keep components math-free per blueprint guardrails.
