# Mapping — Features, Files, and Tests
Path: /docs

Purpose: Cross-reference map to navigate where things live and how they connect.

## Wizard (Setup Flow)
- Components: `src/components/WizardShell.tsx`, `src/components/Wizard*.tsx`
- Logic: `src/components/Wizard/calculations.ts`
- State/Persistence: `src/hooks/useAppState.ts`, `src/hooks/usePersistence.ts`
- Types: `src/types/expenses.ts`, `src/types/index.ts`
- Tests: `src/components/Wizard/__tests__/*.test.tsx`
- Docs: `docs/SCOPE.md`, `docs/TESTING.md`

## Dashboard & KPIs
- Components: `src/components/Dashboard/Dashboard.tsx`, `src/components/KPIStoplight.tsx`, `src/components/ProjectedPerformancePanel.tsx`
- Logic: `src/lib/calcs.ts`
- Tests: `src/lib/calcs.test.ts`, `tests/app.spec.ts`
- Docs: `ARCHITECTURE.md`, `docs/COMPREHENSIVE_TESTING_CHECKLIST.md`

## Inputs & Dual-Entry
- Components: `src/components/InputsPanel.tsx`, `src/components/ValidatedInput.tsx`
- Types & Rules: `src/types/expenses.ts`
- Validation Utilities: `src/utils/validation.ts`
- Tests: `tests/basic-functionality.spec.js`, `tests/generated/*`
- Docs: `docs/EDGE_CASE_TESTING.md`

## Debugging & QA Tooling
- Components: `src/components/DebugSystem/*`, `src/components/DebugPanel.tsx`
- Scripts: `scripts/**`, `scripts/automated-debug-sync/**`
- Reports: `QA_ANALYSIS_REPORT.md`, `QA_SUMMARY_REPORT.md`, `OVERNIGHT_QA_REPORT.md`
- Docs: `DEBUGGING-TOOLS-VALIDATION-SUMMARY.md`, `docs/AUTOMATED_TESTING_STRATEGY.md`

## CI/CD & Environments
- Workflows: `.github/workflows/ci.yml`
- Approvals: GitHub Environments `staging`, `preview`
- Vercel: `vercel.json`, Secrets (`VERCEL_*`)
- Docs: `ops/README.md`, `docs/PRE_DEPLOYMENT_CHECKLIST.md`

## Architecture & Scope
- Architecture: `ARCHITECTURE.md`, `DATA-FLOW-ARCHITECTURE-ANALYSIS.md`
- Scope: `docs/SCOPE.md`, `docs/CHANGELOG.md`, `CHANGELOG.md`
- Lessons & Indexes: `docs/LESSONS_LEARNED.md`, `MASTER_INDEX.md`, `docs/INDEX.md`

---

Tip: Use this map with the Master Index for quick jumps during audits and onboarding.
