## Liberty Tax P&L Webapp — Context Digest (Blueprint-Aligned)

### Repo Structure (high level)

- Root docs and governance: `README.md`, `CHANGELOG.md`, `repo-blueprint.yml`, `docs/**/*.md`
- React reference app: `react-app-reference/react-app-reference/src/**`
- Angular target app: `angular/src/app/**`
  - Current: `components/*`, `pages/*`, `core/{services,contracts}`, some utilities
  - Planned per blueprint: add `domain/{calculations,types}` and `core/tokens`

### Naming & Guardrails (from blueprint)

- Angular standalone components; page-local components under `pages/<page>/components`
- Shared UI under `app/components` (header, footer, toolbar, kpi-card)
- Dictionary-first labels; no template math — calculations live in services/utils
- Reactive forms; bi-directional $↔% rules implemented in code (last edited wins)
- Consistent keys: `returns`, `avgNetFee`, `discountsPct/Amount`, `otherIncome`, `tr_*`, `py_*`
- Visual contract: blue = auto-calculated, white = required/manual

### Where Logic Should Live (authoritative locations)

- Pure domain math and business rules:
  - `angular/src/app/domain/calculations/*` — framework-agnostic functions
  - `angular/src/app/domain/types/*` — IO shapes, calc types, expense dictionaries
- Angular glue/services (no heavy math):
  - `angular/src/app/core/services/*` — state, config assembly, orchestration
  - `angular/src/app/core/tokens/REGION_CONFIGS` — region/store/KPI presets
- UI pages/components consume services only; no business math in templates/components

### Business Semantics (essentials)

- Regions: `US`, `CA`; TaxRush only meaningful in `CA` when `handlesTaxRush` is true
- Expense target band: expensesPct 74.5–77.5% green; netPct mirrors (1 − expensesPct)
- CPR color mirrors expenses% color; CPR displayed as actual; guidance uses expenses band
- Expenses model: 17 categories; mixed bases (percent of gross, salaries, tax prep income, fixed)
- Dual-entry: $↔% with deterministic conversion; section and app resets obey reset policy

### React Reference Sources to Port (math-only)

- `src/lib/calcs.ts` → core P&L math + KPI status helpers
- `src/components/Wizard/calculations.ts` → growth, expected revenue, projection helpers
- `src/types/expenses.ts` → 17-line expense dictionary and defaults
- `src/data/presets.ts` → Good/Better/Best presets (as data, not UI)

### Angular Service Roles (stubs now; logic later)

- WizardStateService: holds wizard selections (region, storeType, flags, localAvgRent)
- ConfigService: merges wizard selections with `REGION_CONFIGS` to produce effective config
- CalculationService: typed façade that calls domain calculation functions

### Files to Introduce (Delta to blueprint)

- `src/app/domain/calculations/*` (pure TS)
- `src/app/domain/types/*` (pure TS)
- `src/app/core/tokens/region-configs.token.ts` (`REGION_CONFIGS` injection token)
- Service stubs in `src/app/core/services/` for wizard/config/calculation

### Build & Dev

- React dev: `npm run dev:react` (3000)
- Angular dev: `npm run dev:angular` (4200)
- Dual-run: `npm run dev:dual`

This digest reflects the current repo and aligns the target Angular structure to the app blueprint. All domain logic will be relocated to `domain/*` with types under `domain/types/*`; components remain math-free.
