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
1) Implement ValidatedInput and envelope validation; add migration strategy.
2) Fix unit tests: labels/selectors; add IDs and align terminology.
3) Add accessibility pass: labels, roles, keyboard navigation.
4) Add debouncing and memoization in hot paths.
5) Expand automated tests: edge cases and accessibility checks.

## Expedition Sources
- CHANGELOG.md (root and docs)
- FIXES-IMPLEMENTATION-SUMMARY.md
- QA_SUMMARY_REPORT.md, QA_ANALYSIS_REPORT.md, OVERNIGHT_QA_REPORT.md
- DATA-FLOW-ARCHITECTURE-ANALYSIS.md
- DEBUGGING-TOOLS-VALIDATION-SUMMARY.md
