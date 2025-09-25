# Blocking Questions (Autopilot Wiring + QA)

[Answered] 1. Parity runner implementation path
   - Decision: Use `ts-node` ESM loader to execute Angular domain TS directly. This avoids a custom build step and keeps parity fast and deterministic.
   - Action: Add devDep `ts-node`; parity Node script will import `angular/src/app/domain/calculations/calc.ts` via `node --loader ts-node/esm`. Update `scripts/ps/parity.ps1` to invoke with the loader and emit `run-reports/parity/parity-diff-*.csv`.
   - Affected files: `scripts/ps/parity.ps1`, `scripts/parity-runner.ts` (new), `package.json` (devDeps).

[Answered] 2. Expenses dictionary shape
   - Decision: Model utility/ops items that are fixed in React (telephone, utilities, postage, insurance, bank fees, maintenance, travel) as fixed-dollar amounts in Angular domain. Keep dual-entry only where business rules define a percent base (e.g., salaries % of gross, employee deductions % of salaries, rent % of gross, royalties % of tax-prep income).
   - Action: Align `expenses.types.ts` field definitions; update InputsPanel conversions; adjust tests in COMPREHENSIVE_TESTING_CHECKLIST to reflect fixed-dollar entries for these fields.

[Answered] 3. Playwright baseURL for Angular route
   - Decision: Keep base config pointed at `vite preview` (root) for now. Add a secondary Angular E2E entrypoint using `npm run test:e2e:angular` with `PW_BASEURL=http://localhost:4200` for Angular flows once wizard routes render real data.
   - Action: Create `scripts/ps/test-e2e-angular.ps1` (later) or extend `test-e2e.ps1` with a switch. Document in TESTING.md.

Please answer inline; items marked unresolved will remain blocked and corresponding TODOs will be set to blocked.
Blocking Questions — Integration Strategy

Storage: docs/blocking-questions.md

Legend

- [Unanswered] — needs decision/clarification
- [Answered] — resolved; action recorded

[Answered] Q0: Where should blocking-questions.md live?

- Decision: docs/blocking-questions.md
- Action: File created/maintained at this path with tagging system

[Answered] Q1: Confirm feature flag policy/location

- Decision: Use DI token `FEATURE_FLAGS` (see `core/tokens/feature-flags.token.ts`). Provide defaults in `app.config.ts` via `providers: [{ provide: FEATURE_FLAGS, useValue: DEFAULT_FEATURE_FLAGS }]`. Toggle via environment-specific providers.
- Action: Ensure tokens exist and are wired at bootstrap; gate dev UI via flags.

[Answered] Q2: Placement confirmation

- Decision: Wizard Step 1: place AnalysisBlock under Projected section (per wire-up plan). Dashboard: middle column preview card grid under dev flag.
- Action: Import components and add feature-flag guards; follow trace-plan checkpoints.

[Answered] Q3: Data contract details

- Decision: Compare presets vs current using: gross fees, discounts, tax prep income, total expenses, net income, cost/return, net margin. Include returns and avgNetFee in the summary for context. Copy: strategic insights focus on trends and targets; tactical insights suggest field adjustments (ANF, returns, expense %).
- Action: Finalize `AnalysisData` shape and assembler outputs to include both summary and deltas.

[Answered] Q4: Tracing

- Decision: Use a thin `DevTraceService` that no-ops in prod and logs in dev; keep breadcrumbs named per `docs/trace-plan.md`. Inline console allowed behind flag.
- Action: Implement service and inject where DEV_TRACE hooks are specified.

[Answered] Q5: Primary Sources of Truth for Integration

- Decision: Primary: blueprint YAML + `calc-inventory.md` + Angular domain types and calc. React reference used as QA oracle only, not for architecture decisions.
- Action: Link these sources at top of feature PRs and in teaching-notes.

[Answered] Q6: Integration Priority Order

- Decision: (1) Wire inputs→services→domain, (2) render with real data or mocks, (3) add unit→integration→E2E, (4) enable flags, (5) polish UX.
- Action: Track in docs/TODO_BACKLOG.md and CHANGELOG.md.

[Answered] Q7: Testing Strategy Clarification

- Decision: Exact parity for domain calculation results via golden fixtures; UI/component behavior should meet business requirements and accessibility standards. Prefer Angular improvements; document deltas in BLUEPRINT_DELTA.md.
- Action: Build parity runner; snapshot REGION_CONFIGS; expand Angular TestBed coverage.

[Unanswered] Q8: Parity runner execution under Node 24 / loaders

- Issue: Running `node --loader ts-node/esm scripts/parity-runner.ts` (and `npx tsx scripts/parity-runner.ts`) fails under Node v24.8.0 with an uncaught object from the loader path (ExperimentalWarning + DEP0180; parity PS wrapper exits non‑zero). CSV not emitted to `run-reports/parity/`.
- Proposed fix: Use esbuild to bundle `angular/src/app/domain/calculations/calc.ts` and `react-app-reference/.../calcs.ts` into JS (CJS/ESM) and run with plain `node`. Alternative: pin Node to v20 LTS for parity runner in local/CI.
- Question: Approve adding `esbuild` as devDep and a small `scripts/build-parity-bundles.js`? Or prefer node version pin?

[Unanswered] Q9: Expense dictionary realignment

- Issue: Agreed modeling says fixed-dollar for telephone/utilities/postage/insurance/bank fees/maintenance/travel, but `expenses.types.ts` currently defines several as percentages (`telephonePct`, etc.) and `inputs-panel.component.ts` consumes those IDs. Aligning requires type/ID changes and UI wiring updates.
- Proposed fix: Rename affected IDs to `*Amt`, update dictionary and consumer components (`InputsPanel`, wizard pages), migrate state mapping, and adjust tests. Provide a short migration guide in `docs/BLUEPRINT_DELTA.md`.
- Question: Confirm the final fixed-dollar list and approve ID renames to `*Amt`.