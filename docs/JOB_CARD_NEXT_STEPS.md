# Job Card — Next Steps (Pause Checkpoint)

Branch: Dev_09202025
Owner: Cursor
Date: 2025-09-25

Summary of progress
- Expenses realigned to fixed-dollar IDs; UI updated; deltas documented
- Wizard projected income wired: WizardStateService → ConfigService (REGION_CONFIGS) → CalculationService → domain calc
- DevTraceService added and wired
- Parity runner implemented (esbuild bundles); CSV generated
- Build PASS; test reporters configured to run-reports

Remaining items (to be completed)
1. Wizard templates
   - Replace templates with `lt-wizard-form-section`, `lt-wizard-form-field`, `lt-net-income-summary`
   - Add Reset handlers per section
2. Tests
   - Unit: add wizard-helpers tests (growth, expected revenue, performance vs target)
   - Angular TestBed: Wizard selections → EffectiveConfig → Calculation inputs contract tests
   - E2E: run/stabilize wizard-flow-matrix; attach artifacts to run-reports/e2e
   - Parity: expand scenarios and gate in CI
3. Render sanity
   - Ensure all routes render with real data or dev mocks; update docs/render-audit.md
4. Documentation
   - Update CHANGELOG.md, QA_SUMMARY_REPORT.md with artifacts, and teaching-notes
5. Optional
   - Add Angular-specific E2E entry with PW_BASEURL=http://localhost:4200

How to resume
- Parity: `pwsh ./scripts/ps/parity.ps1`
- Build: `pwsh ./scripts/ps/build.ps1`
- Unit: `npm run test:domain` (artifacts to run-reports/unit)
- Integration: `npm run test:integration`
- E2E: `npm run test:e2e`
- Dev server: `pwsh ./scripts/ps/dev-serve.ps1`

If blocked
- Append plain-language questions to `docs/blocking-questions.md` with the exact path and a proposed fix.

