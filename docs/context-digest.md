# Context Digest (Autopilot Wiring Pass)

- Blueprint highlights (libertytax-pnl-blueprint.yml)
  - Angular v20 standalone; REGION_CONFIGS token with DEFAULT_REGION_CONFIGS.
  - Wizard pages: income-drivers, expenses, pnl; Dashboard route.
  - Presets: good/better/best/custom; KPI bands for expenses%, net%, CPR.

- Current staged features
  - AnalysisBlock (UI + types) with dev flag; placed on Wizard Step 1 + Dashboard.
  - PerformanceCard (UI + types) with dev flag; Dashboard preview incl. CPR via MetricsAssembler.
  - Wizard helpers extended: calculatePerformanceVsTarget, getAdjustmentStatus, growth options.
  - Income Drivers templates (PY/Projected) aligned to React; no data wiring yet.
  - Debug Panel toggles: AnalysisBlock, PerformanceCards, MonthlyForecast, Multi-Store.

- Testing status
  - docs/TESTING.md maps React wizard tests to Angular layers.
  - Playwright wizard-flow-matrix approx E2E added; runs deferred.

- Shared UI scaffolds
  - lt-wizard-form-section (with Reset event)
  - lt-wizard-form-field
  - lt-net-income-summary

- Updated matrices/docs
  - missing-import-matrix.csv, calc-migration-status.md, wire-up-plan.md, trace-plan.md, DEVELOPMENT_PROGRESS_LOG.md

- Backlog highlights to wire next
  - Replace wizard markup with shared components; add section-level Reset handlers.
  - Wire wizard inputs → WizardStateService → ConfigService(REGION_CONFIGS) → CalculationService → domain calc.
  - Implement real YTD vs Projected in MetricsAssembler when YTD inputs exist.
  - Build unit/component/E2E layers; parity runner React↔Angular for domain calc.
