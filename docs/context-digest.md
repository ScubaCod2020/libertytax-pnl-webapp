# Context Digest (Autopilot Wiring + QA)

- Blueprint highlights (repo-blueprint.yml, libertytax-pnl-blueprint*.yml)
  - Angular app (standalone) alongside React reference. Core wiring path: Inputs → `WizardStateService` → `ConfigService` (`REGION_CONFIGS`) → `CalculationService` → domain `calc` and helpers.
  - REGION_CONFIGS provided via token with `DEFAULT_REGION_CONFIGS` for US/CA thresholds and feature flags (TaxRush).
  - Wizard steps: Income Drivers → Expenses → P&L/Reports; Dashboard presents summaries and cards.

- Staged domain/UI (per docs)
  - UI shells present for AnalysisBlock, PerformanceCard, Suggested* inputs, WizardPage, KPI Stoplight, ScenarioSelector, Debug panel, etc. Many are dev-gated and not yet integrated into routes.
  - Domain calc ports exist: `domain/calculations/calc.ts`, `kpi.ts`, wizard helpers for growth/performance/adjustments. Types exist for `wizard.types.ts`, `calculation.types.ts`; expenses types are referenced and file exists.
  - Services scaffolding in place: `wizard-state.service.ts`, `config.service.ts`, `calculation.service.ts` (thin adapter over pure calc).

- Wiring intent (docs/wire-up-plan.md)
  - Dashboard and Wizard steps should strictly flow through services to domain. REGION_CONFIGS merges per selection. DEV_TRACE breadcrumbs called out in trace-plan.

- Render status (docs/render-audit.md)
  - Multiple components are staged but hidden; NewStoreSection/StrategicAnalysis/Suggested inputs ready for integration on Wizard Step 1. Dashboard inputs panel exists; performance cards preview available under flag.

- Migration/calc status (docs/calc-migration-status.md)
  - Core P&L math and KPI helpers ported. Wizard helpers ported; expenses dictionary/types referenced. Remaining: wire AnalysisBlock/PerformanceCard to real assemblers; complete bidirectional expense inputs; ensure presets live under config.

- Testing stack (COMPREHENSIVE_TESTING_CHECKLIST.md, TESTING*.md)
  - Unit: vitest configs present (domain/integration/wizard). Need reporters output to run-reports/*.
  - E2E: Playwright config present; reporters enabled. Output directories adjusted to `run-reports/e2e` in this pass.
  - Parity: PS stub exists; golden dataset comparison to be implemented.

- Ops scripts (scripts/ps/*.ps1)
  - Watchdog implemented in `build.ps1` and reused by unit/int/e2e wrappers. `dev-serve.ps1` updated to import watchdog; all write timestamped logs under run-reports/* and append SESSION_LOG on stall/kill.

- Immediate backlog (authoritative: docs/TODO_BACKLOG.md)
  - Wire wizard inputs → services → domain; replace templates with standardized wizard components + Reset.
  - MetricsAssembler real YTD vs Projected.
  - Unit/Integration/E2E reporters to run-reports; stabilize Playwright wizard flow matrix.
  - Parity runner React↔Angular domain with golden dataset; write CSV to run-reports/parity.
