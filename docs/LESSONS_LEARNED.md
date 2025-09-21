# Maintenance & Auditing — Lessons Learned (Expedition Log)

Path: /docs

Purpose: Curated highlights from changelogs, fixes, and QA to guide future work — with a light narrative for engagement.

## Basecamp: What Went Well

- Calculation engine: Verified accurate across comprehensive scenarios (see QA reports).
- Architecture: Hooks-based separation (state, persistence, calculations, presets) improved maintainability.
- Debugability: Professional DebugSystem and meta-debugging tools increased reliability of diagnostics.
- Documentation: Extensive repo docs and checklists enabled faster onboarding and triage.

## The Climb: What Broke (and Why)

- Systematic data flow loss: Missing mappings (e.g., expectedGrowthPct, calculatedTotalExpenses) caused 63% scenario failures.
- UI test fragility: Label mismatches and ambiguous selectors led to false negatives.
- Validation gaps: Lack of input/persistence validation and error handling increased risk and test flakiness.
- Accessibility: Insufficient ARIA and associations reduced usability and testability.

## Trail Repairs: Key Fixes and Outcomes

- Persistence & AppState: Added missing critical fields; mapped wizard → app → storage consistently.
- Race conditions: Cleaned WizardShell effect dependencies to avoid loops and state thrash.
- Runtime validation: Introduced data-flow validators and real-time monitors.
- CI/Workflow: Unified lint/test/build with preview deploy gate; human approval before Vercel deploy.

## Trail Rules: Process Improvements (Keep Doing)

- Small, documented edits with clear commit templates.
- Maintain Unreleased → Versioned CHANGELOG discipline.
- Use CODEOWNERS and environment approvals to enforce review and deploy gates.
- Centralize ops assets under ops/ and runtime workflows under .github/.

## Guardrails (Start/Continue)

- Validation: Add range/business-rule checks on all inputs; validate persisted envelopes on load.
- Error handling: Wrap calculations; provide fallbacks and user-facing messages.
- Accessibility: Enforce ARIA patterns; ensure label/for and aria-describedby relationships.
- Testing hygiene: Unique selectors (data-testid) for critical inputs; align labels and test expectations.
- Performance: Debounce inputs; avoid unnecessary re-renders; standardize currency formatting.

## Next Waypoints (Prioritized)

1. Implement ValidatedInput and envelope validation; add migration strategy.
2. Fix unit tests: labels/selectors; add IDs and align terminology.
3. Add accessibility pass: labels, roles, keyboard navigation.
4. Add debouncing and memoization in hot paths.
5. Expand automated tests: edge cases and accessibility checks.

## Expedition Sources

- CHANGELOG.md (root and docs)
- FIXES-IMPLEMENTATION-SUMMARY.md
- QA_SUMMARY_REPORT.md, QA_ANALYSIS_REPORT.md, OVERNIGHT_QA_REPORT.md
- DATA-FLOW-ARCHITECTURE-ANALYSIS.md
- DEBUGGING-TOOLS-VALIDATION-SUMMARY.md

## Power Tips: Shell & Tooling Notes

### 2025-09-21 — PowerShell inline escaping caused stalled one-liner

- 2025-09-21 — Husky v9 hooks path and deprecation fix
  - Problem: `core.hooksPath` pointed to `.husky/_` (helper dir), so real hooks were skipped; `pre-commit` sourced deprecated `husky.sh`.
  - Fix: `git config core.hooksPath .husky`; recreate hook with `npx husky set .husky/pre-commit "npx --no-install lint-staged"`; add lint-staged config; enforce LF for `.husky/*` via `.gitattributes`.
  - Tip: Husky v9+ hooks are standalone scripts; do not source `husky.sh`.

- Problem: A long inline `-Command` one-liner failed with "Missing variable name after foreach" when run from a quoted command string. `$` variables were being parsed by the outer layer, breaking `foreach ($m in $moves)`.
- Fix: When using `pwsh -Command "..."`, escape PowerShell sigils as `` `$ `` inside the quoted string, or prefer a `.ps1` script. Also avoid massive one-liners in favor of small, readable loops.
- Safe pattern for bulk moves (idempotent; creates folders; skips missing):

```powershell
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$moves = @(
  @{ from='angular/src/app/src/app/pages/wizard/expenses/expenses/expenses.component.ts'; to='angular/src/app/pages/wizard/expenses/expenses.component.ts' },
  @{ from='angular/src/app/src/app/pages/wizard/expenses/expenses/expenses.component.scss'; to='angular/src/app/pages/wizard/expenses/expenses.component.scss' },
  @{ from='angular/src/app/src/app/pages/wizard/income-drivers/income-drivers/income-drivers.component.ts'; to='angular/src/app/pages/wizard/income-drivers/income-drivers.component.ts' },
  @{ from='angular/src/app/src/app/pages/wizard/income-drivers/income-drivers/income-drivers.component.scss'; to='angular/src/app/pages/wizard/income-drivers/income-drivers.component.scss' },
  @{ from='angular/src/app/src/app/pages/wizard/pnl/pnl/pnl.component.ts'; to='angular/src/app/pages/wizard/pnl/pnl.component.ts' },
  @{ from='angular/src/app/src/app/pages/wizard/pnl/pnl/pnl.component.scss'; to='angular/src/app/pages/wizard/pnl/pnl.component.scss' }
)

foreach ($m in $moves) {
  if (Test-Path $m.from) {
    $destDir = Split-Path $m.to
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }
    Move-Item -Force -Path $m.from -Destination $m.to
  }
}
```

- Recommendation: Prefer checked-in scripts (`ops/scripts/`) over ad‑hoc inline commands for repeatability and clarity.
