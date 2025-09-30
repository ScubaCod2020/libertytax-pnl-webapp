## 2025-09-30 (Session 7)

### Highlights

- Expenses UX and stability
  - Auto-seed strategic defaults on first visit to Expenses (no manual Reset needed).
  - Baselines tuned to “green” targets (Telephone≈1.0%, Utilities≈0.9%, Local Adv≈1.5%, Supplies≈3.0%).
  - Removed per-row Reset buttons; single global "Reset Expenses to Strategic Defaults" retained.
  - Structural template (Option B) retrofitted into existing Expenses form; legacy rows commented.
  - Slider input clamping + scroll‑wheel blur; OnPush + trackBy for snappier UI.

- KPI Rules & Text
  - Added Average Net Fee (ANF) KPI with region-aware bands (US, CA) and boundary handling ([min, max)).
  - Central evaluator exposes `getAnfStatus()` + `getAnfDescriptor()`; shared text yields tooltip/note.
  - Adapter now maps `averageNetFee` for v2 pipelines.

- Income Drivers integration
  - ANF UI: value, stoplight chip, ℹ️ tooltip, note, and “Use recommended” (center of green, rounded to $5).
  - Region changes reactively update ANF status/tooltip/recommended.

- P&L & Dashboard
  - P&L summary shows ANF value (chip/tooltip path wired, ready to surface inline as needed).
  - Dashboard card/tile shows ANF value + region-aware stoplight + tooltip/note.
  - “Review Data →” on Expenses routes to `/wizard/pnl`.

- Debug & Tests
  - Diagnostics overlay: added ANF row (Value, Status, Region, Green Band).
  - Unit tests: ANF boundary matrix for US/CA; tooltip/note region reflection.
  - E2E: ANF chip thresholds and “Use recommended” (US), region switch case (CA) added to Expenses spec.

### Fixes

- First-load Expenses calculation stability (auto-seeding + tuned baselines) → rows now start green.
- Reports navigation button wired from Expenses.

### Files (key)

- `angular/src/app/domain/services/kpi-evaluator.service.ts` (ANF bands + helpers)
- `angular/src/app/shared/expenses/{expenses.service.ts,expense-text.service.ts,kpi-adapter.service.ts}`
- `angular/src/app/pages/wizard/income-drivers/components/projected-income-drivers.component.{ts,html}` (ANF UI)
- `angular/src/app/pages/wizard/expenses/components/expenses.component.{ts,html}` (auto-seed, structural template, clamps)
- `angular/src/app/pages/wizard/pnl/components/pnl.component.{ts,html}` (ANF surfaced; nav fix)
- `angular/src/app/pages/dashboard/*` (ANF tile)
- `angular/src/app/shared/debug/debug-overlay.component.{ts,html,scss}` (ANF row)
- `test/e2e/expenses.spec.ts` (ANF flows)
- `angular/src/app/shared/expenses/__tests__/*` (unit tests)

### Next

- Add P&L inline ANF chip/tooltip row if required; finalize monthly breakdown ANF mentions.
- Expand E2E to cover CA/US end‑to‑end P&L assertions and dashboard tile when region toggles.

---

## 2025-09-29 (Session 5)

### Highlights

- Locked the Quick Start Wizard only after navigating away from Income Drivers; reset unlocks editing.
- Began Expenses UX overhaul: new strategic range card (60–80% expenses / 20–40% net) pulls dynamic min/max from state.
- Refactored payroll & employee deduction rows with dollar-first inputs, percentage sync, guidance button, right-aligned notes, and responsive textareas.
- Added helper methods in `ExpensesFormComponent` for dollar⇄percentage conversions and stored the strategic guardrail values in `WizardStateService`.

### In Flight / Next Session

- Propagate the new row layout (info button, amount→percent order, notes, sliders) across all remaining expense categories.
- Reorder categories (move Dues to Misc, place Franchise last) and rename Travel/Entertainment → Travel.
- Add cost-per-return / net-profit-per-return panel beneath the expenses summary and validate KPI delta text (`=54% vs target`).
- Continue KPI Rules V2 implementation (service + adapter + docs/tests) once layout polish is complete.

---

## Development Progress Log — Context-First Hunt & Port

2025-09-26 (Session 3)

### Major Architectural Achievement: Monthly P&L Breakdown System

**Context:** User had brilliant idea to separate P&L components into two distinct views:

- **P&L Components** = Annual Summary (year-in-review)
- **Reports Components** = 12-Month Breakdown with tax industry seasonality
- **Dashboard Integration** = Monthly view available from dashboard too

**Implementation Completed:**

- ✅ **Monthly Distribution Data**: Created `monthly-distribution.data.ts` with real tax industry seasonality patterns (15.5% Jan, 28.2% Mar peak, 0.5% Dec low)
- ✅ **Navigation Flow**: P&L Annual → "📅 Monthly Breakdown" button → Reports Monthly view
- ✅ **Route Architecture**: Added `/wizard/reports` route for monthly breakdown
- ✅ **Data Layer**: `calculateMonthlyBreakdown()` function distributes annual totals across 12 months with 60% activity-based + 40% fixed expense allocation
- ✅ **P&L Component**: Fully wired annual summary with comprehensive debugging
- ✅ **Reports Component**: Updated to calculate and display monthly data with seasonal insights
- ✅ **Template Created**: Rich monthly breakdown HTML with tables, seasonal analysis, and cumulative progress

**Technical Architecture:**

```typescript
// Monthly distribution with real tax industry data
MONTHLY_RETURN_DISTRIBUTION: MonthlyDistribution[] = [
  { month: 'January', returnsPercentage: 15.5, description: 'Tax season begins' },
  { month: 'March', returnsPercentage: 28.2, description: 'Busiest month - deadline approaching' },
  // ... realistic seasonal distribution totaling 100%
]

// Smart expense allocation
const activityBasedExpenses = annualExpenses * (month.returnsPercentage / 100) * 0.6;
const fixedExpenses = (annualExpenses / 12) * 0.4;
```

**Remaining TODOs for Next Session:**

- Add helper methods to ReportsComponent for template functionality
- Create SCSS styles for monthly breakdown table and cards
- Test navigation between annual P&L and monthly breakdown
- Plan dashboard integration for monthly view

**Files Modified:**

- `angular/src/app/domain/data/monthly-distribution.data.ts` (NEW)
- `angular/src/app/pages/wizard/pnl/components/pnl.component.ts` (comprehensive rebuild)
- `angular/src/app/pages/wizard/pnl/components/pnl.component.html` (added monthly button)
- `angular/src/app/pages/wizard/pnl/components/reports.component.ts` (monthly logic added)
- `angular/src/app/pages/wizard/pnl/components/reports.component.html` (NEW monthly template)
- `angular/src/app/app.routes.ts` (added `/wizard/reports` route)

2025-09-24

- Tooling maintenance: Migrated repo to Husky v9 and removed deprecated shims
  - Set `git config core.hooksPath .husky`
  - Deleted `.husky/_` helper dir to eliminate `husky.sh` deprecation banner
  - Switched from `simple-git-hooks` → Husky (`prepare` script now runs `husky`)
  - Verified `.husky/pre-commit` runs `lint-staged` and `scripts/validate-progress-log.js`
- Angular verification: `angular/` workspace confirmed on Angular 20.3.x (CLI 20.3.2)
- Node verified: v24.8.0 (meets Angular 20 requirements)

- Manual Navigator: Ported and staged AnalysisBlock (UI + types) with dev gating
  - Added `analysis.types.ts`, `analysis-block.component.ts`, and demo route `/dev/analysis-demo`
  - Placed shells on Wizard Step 1 (Projected section) and Dashboard middle column
  - Implemented `AnalysisDataAssemblerService` (Custom vs Preset variance) and feature-flag toggle in Debug Panel
  - Updated docs: teaching notes, wire-up plan, trace plan, render audit, migration status, blueprint delta
  - Added feature flags for Monthly Forecast and Multi-Store Summary; wired Monthly Forecast card to Dashboard under flag and added toggles in Debug Panel
  - PerformanceCards: staged reusable component + types; added Dashboard preview under flag with Debug Panel toggle

- Stopping point (Manual Navigator):
  - React→Angular port in progress for AnalysisBlock and PerformanceCard complete (staged, dev-gated).
  - Wizard helpers extended (performance vs target, adjustment status).
  - Income Drivers (PY/Projected) templates aligned to React sections; presentational only (no business logic wiring yet).
  - New shared wizard UI components scaffolded: wizard-form-section (with Reset), wizard-form-field, net-income-summary.
  - Playwright E2E “wizard-flow-matrix” approximation added; full run deferred.
  - Feature flags toggles added in Debug Panel for AnalysisBlock, PerformanceCards, MonthlyForecast, Multi-Store.

Next session TODOs:

- Replace repeated markup in Income Drivers with new wizard UI components; add section-level reset handlers.
- Implement MetricsAssembler real YTD vs Projected once YTD inputs exist.
- Wire discounts $↔% bi-directional behavior to state; connect auto/override logic using wizard-helpers.
- Run/stabilize E2E suite; expand scenarios to mirror React WizardFlowMatrix.

2025-09-22

- Created feature branch `feat/context-first-hunt-port`.
- Authored docs: `context-digest.md`, `calc-inventory.md`, `calc-migration-status.md`, `BLUEPRINT_DELTA.md`.
- Updated `repo-blueprint.yml` to include `domain/*` and `core/tokens/*` paths.
- Added Angular scaffolding:
  - `core/tokens/region-configs.token.ts` with `DEFAULT_REGION_CONFIGS`.
  - Service stubs: `WizardStateService`, `ConfigService`, `CalculationService`.
  - Domain: `domain/types/calculation.types.ts`, `domain/calculations/{calc,kpi,wizard-helpers,adapters}.ts`.
- Restored `pages/wizard/pnl/*` stub to satisfy routing.
- Relaxed Angular style budgets minimally (anyComponentStyle: warn 3kb, error 6kb).
- Verified Angular build succeeds.
- Ran wizard tests (n-3) in React reference; saved logs to `.logs/wizard-tests-pass{1..3}.log`.
  - Noted WizardFlowMatrix failures (expected pre-wiring); added QA analysis triage.
- Added domain unit tests and Vitest config; ran n-3 domain test passes, all green. Logs: `.logs/domain-tests-pass{1..3}.log`.

Merge/Next Steps:

- NOTE: Merge `feat/context-first-hunt-port` into `dev_09202025` before proceeding next session.
- Next session TODOs: add more domain edge-case tests; begin Angular UI wiring to `CalculationService` on wizard pages.

# Development Progress Log

- - 2025-09-21T19:15:29.641Z - Exported progress log to clipboard

## 2025-09-22 23:15 – Checkpoint

- Consolidated P&L to single component group under `pages/wizard/pnl/components`
- `pnl.component.html` now renders `<app-reports>` only; removed duplicate shell
- Reports UI scaffolded to match React WizardReview; typography consistent
- Quick Start Wizard stacked layout refined; added rent inputs (amount + period)
- Income Drivers (PY/Projected/Target) UI parity improved; scenario controls wired to service scaffolds
- Footer spans full width via `site-footer`; debug panel pushes layout; header height tuned
- Style system: tokens/base/layout partials active; utilities applied across pages

## 2025-09-21 15:41 – Checkpoint

- QS Wizard: stacked layout; region/store/taxYear/taxRush/otherIncome bound to SettingsService
- BrandingService applies regional CSS vars; AppConfigService gates TaxRush
- Income Drivers: PY/Projected/Target shells with visibility by storeType
- Header/footer/debug polish; typography tokens/utilities in place

2025-09-27 (Session 4)

- E2E stabilization (Angular-only): added stable data-testids for header summary, region radios, KPI cards, and Total Expenses summary; corrected styleUrls metadata; exposed template-safe wrappers (e.g., round()); increased per-component style budget to reduce noise.
- Playwright config: added Mobile Chrome project (hasTouch), ignored React comparison; split desktop vs mobile specs.
- Desktop E2E: progressed from 39→55→59 passes; remaining 2 failures are selector/value assertions against directive-managed inputs and region fallback on specific views.
- Mobile E2E: added groundwork; remaining failures due to strict size assertions, generic selectors, and directive-managed inputs. Planned to target testids and relax strict size checks where appropriate.

Next session TODOs

- Add testids for header nav buttons and per-page card titles; add readonly mirrors for formatted inputs to assert defaults consistently.
- Finalize region CA fallback in tests; ensure radios exist on Income Drivers before asserting.
- Update mobile specs to use testids, relax 44px checks where component design is smaller, and use container-level tap targets.

## 2025-09-29 (Session 6)

### Highlights

- Unified revenue basis for expense guardrails/baselines to include projected tax prep income + (CA TaxRush gross if enabled) + other income when enabled.
- One-time seeding gated until projected drivers are ready to prevent zero/partial seeds.
- Region-aware payroll placeholder (25% CA / 35% US).
- Telephone KPI tightened (red > 1.2%) and rounding aligned with UI.
- Centralized KPI layer:
  - `domain/expenses/expense-rules.ts` with thresholds and support for region/store-type overrides.
  - `domain/services/kpi-evaluator.service.ts` resolves rules (store-type → region → base) and computes statuses.
  - `domain/services/expense-text.service.ts` generates helper notes/ℹ️ from same rules and revenue basis.
- Component wiring:
  - `expenses.component.ts/html` now consumes evaluator + text service; template is presentational.
  - Helper notes and tooltips derived from services for consistency.
- Naming consistency: switched from `salariesPct` → `payrollPct` end-to-end in UI/logic; reporting paths updated.
- Expense metadata registry: `domain/expenses/expense-metadata.ts` defines canonical field per line and conversion base.
- Bidirectional editing template implemented for Telephone using metadata-driven helpers.

### Files Touched (key)

- `angular/src/app/core/services/wizard-state.service.ts`
- `angular/src/app/pages/wizard/expenses/components/expenses.component.{ts,html}`
- `angular/src/app/domain/expenses/{expense-rules.ts,expense-metadata.ts}`
- `angular/src/app/domain/services/{kpi-evaluator.service.ts,expense-text.service.ts}`
- Reporting/KPI adapters updated to use `payrollPct`.

### Current Struggles / Open Items

- Ensure every expense line uses the unified revenue basis for conversions and KPIs.
- Roll the bidirectional template across all lines; keep royalties locked.
- Add more region/store-type overrides where business rules diverge (e.g., rent nuances, local adv).
- Finish removing legacy `salariesPct` from types after external consumers are confirmed.

### Next Steps

- Apply the metadata-driven amount↔percent helpers to Utilities and Local Advertising, then all remaining lines.
- Add sample overrides in `expense-rules.ts` (e.g., Local Adv tighter band for existing stores); surface via notes.
- Generate `hasUserExpenseOverrides()` from metadata (done) and consider using metadata for placeholders.
- Write deterministic test plan for CA/US existing flows, reset/seed semantics, and KPI coloring.

---
