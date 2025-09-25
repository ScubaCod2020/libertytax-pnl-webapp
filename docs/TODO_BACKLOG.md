# TODO Backlog (Owner: Cursor)

Priority P1

- Replace wizard templates with lt-wizard-form-section/field/net-income-summary and add Reset handlers
- Wire wizard inputs → WizardStateService → ConfigService(REGION_CONFIGS) → CalculationService → domain
- MetricsAssembler: integrate real YTD vs Projected when YTD inputs/service exist

Priority P2

- Build unit tests for wizard-helpers (growth, expected revenue, performance vs target)
- Angular TestBed tests: Wizard selections → EffectiveConfig → Calculation inputs contract
- Playwright: run wizard-flow-matrix and stabilize

Priority P3

- Parity runner (React vs Angular domain): scripts/ps:parity.ps1 and parity-diff report
- Replace hardcoded wizard values with state, add discounts $↔% bi-dir behavior

Links

- docs/context-digest.md
- docs/wire-up-plan.md
- docs/trace-plan.md
- docs/missing-import-matrix.csv
- docs/calc-migration-status.md
