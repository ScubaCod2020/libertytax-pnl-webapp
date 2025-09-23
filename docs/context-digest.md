## Liberty Tax — Angular Context Digest (Expected Structure & Naming)

### Angular target and scope

- Target framework: Angular standalone — Angular 20 (confirmed by `angular/package.json`).

### Expected directory structure (`angular/src/app`)

- `app.component.{ts,html,scss}`, `app.routes.ts`
- `components/` — shared-only UI (header, footer, toolbar, kpi-card)
- `core/` — `contracts/`, `services/`, `tokens/`
- `domain/` — `calculations/` (pure TS math), `types/` (IO shapes, expense dictionaries)
- `pages/`
  - `dashboard/dashboard.component.{ts,html,scss}`
  - `wizard/`
    - `income-drivers/income-drivers.component.{ts,html,scss}`
    - `expenses/expenses.component.{ts,html,scss}`
    - `pnl/pnl.component.{ts,html,scss}`
  - Page-local children go under `pages/<page>/components` (standalone components)

### Styling layout

- Global: `angular/src/styles.scss` imports `styles/_tokens.scss`, `_base.scss`, `_layout.scss`, `_kpi.scss`
- Component styles live next to `.ts`/`.html`. Keep globals light; avoid page-specific rules in globals.

### Naming conventions

- Directories: kebab-case; classes/components: PascalCase; filenames with `.component.ts|.html|.scss`
- Standalone components throughout; route config in `app.routes.ts`
- Keys and field names: `returns`, `avgNetFee`, `discountsPct`, `discountsAMT`, `otherIncome`, `tr_returns`, `tr_avgNetFee`, `py_*` (prior year)
- Visual contract: blue = auto-calculated; white = manual/required inputs
- Injection token for region presets: `REGION_CONFIGS` under `core/tokens/region-configs.token.ts`

### Logic placement and guardrails

- Domain-only logic: `domain/calculations/*`, `domain/types/*` (no Angular imports)
- Services/orchestration: `core/services/*` (`WizardStateService`, `ConfigService`, `CalculationService`)
- UI components: reactive forms; no business math in templates/components; implement $↔% bi-directional conversions in code (lastEdited wins)

### Business semantics (essentials)

- Regions: US, CA; TaxRush only relevant when `region==='CA' && handlesTaxRush`
- KPI bands: expensesPct green 0.745–0.775; netPct mirrors; CPR displays actual and inherits color from expenses%
- Expenses grid: dual-entry ($↔%); rent guard may anchor to local average per blueprint
- Expense categories (top-level): personnel, facility, marketing, utilities, royalties (franchise, listed last), misc — 17 individual line items roll up into these 6 groups. React reference previously grouped marketing+utilities under "operations"; Angular uses the 6-category model. Label changes: Salaries → Payroll; Dues moved from operations → misc.

### Dev servers

- React: 3000; Angular: 4200 default; if 4200 unavailable, use 4201. Dual-run available via npm scripts. Repo blueprint ports take precedence.

### Region configs — explanation for new developers

- What it is: `REGION_CONFIGS` is an Angular `InjectionToken<Record<'US'|'CA', RegionConfig>>` that provides per-region thresholds, expense target bands, and feature flags (e.g., TaxRush availability). See `angular/src/app/core/tokens/region-configs.token.ts`.
- How it’s used: Provided at app bootstrap, injected into services (e.g., `ConfigService`, `CalculationService`) to influence KPI bands, CPR guidance, gating of TaxRush fields, and default presets.
- What’s missing: ensure we add a provider at app startup supplying values (e.g., `DEFAULT_REGION_CONFIGS`) and wire consumers. Example at a high level: add to `providers` in `app.config.ts` or bootstrap, then read it in `ConfigService` and merge with user selections.

### Decisions resolved

1. Angular version: use Angular 20 (confirmed).
2. Ports: Angular default 4200; fallback 4201 if occupied. React remains 3000.
3. Discounts amount variable: standardize on `discountsAMT`.
4. Region configs: token path/name confirmed; will provide app-level provider and wire into services.
5. Persistence keys: use blueprint keys (`LT_W1_V1`, `LT_W2_V1`, `LT_SNAP_V1`, `LT_DASH_V1`). Fields to persist validated in `react-app-reference/src/utils/dataFlowValidation.ts` (region, avgNetFee, taxPrepReturns, expectedGrowthPct, calculatedTotalExpenses, otherIncome, discountsPct, taxRushReturns).

### Remaining clarification

- Expense taxonomy: React reference defines 5 top-level categories (`personnel`, `facility`, `operations`, `franchise`, `misc`) with 17 fields. Blueprint lists 6. Confirm whether Angular should split `operations` into separate `marketing` and `utilities` categories (keeping the same 17 fields), or keep the 5-category model from React.
