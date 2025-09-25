# TODO Backlog (Owner: Cursor)

Priority P1

- Replace wizard templates with lt-wizard-form-section/field/net-income-summary and add Reset handlers
- Wire wizard inputs → WizardStateService → ConfigService(REGION_CONFIGS) → CalculationService → domain
- MetricsAssembler: integrate real YTD vs Projected when YTD inputs/service exist
- Configure unit/integration reporters to write JUnit/HTML to run-reports/unit and run-reports/integration
- Redirect Playwright artifacts (json,junit,html) and videos/traces to run-reports/e2e

Priority P2

- Build unit tests for wizard-helpers (growth, expected revenue, performance vs target)
- Angular TestBed tests: Wizard selections → EffectiveConfig → Calculation inputs contract
- Playwright: run wizard-flow-matrix and stabilize; update QA_SUMMARY_REPORT.md with links

Priority P3

- Parity runner (React vs Angular domain): implement golden dataset comparison in scripts/ps/parity.ps1 and write parity-diff.csv
- Replace hardcoded wizard values with state, add discounts $↔% bi-dir behavior

Links

- docs/context-digest.md
- docs/wire-up-plan.md
- docs/trace-plan.md
- docs/missing-import-matrix.csv
- docs/calc-migration-status.md
