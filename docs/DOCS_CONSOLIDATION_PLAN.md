# Documentation Consolidation Plan — Liberty Tax P&L

Goal: Reduce duplication, improve discoverability, and keep Liberty-specific content curated while preserving deep dives for future reference.

Principles
- Canonical single source per topic; other docs link instead of repeating.
- Liberty-specific guides prioritized; generic methodology moved to appendix references.
- Keep top-level indexes current: `MASTER_INDEX.md` and `docs/INDEX.md`.

Proposed Consolidations
- AI/Automation
  - Merge `AUTOMATED_TESTING_STRATEGY.md`, `PRO_TIPS_TESTING_FRAMEWORK.md` into `TESTING.md` sections. Keep unique flowcharts as images referenced by anchor links.
  - Move meta-debugging docs (`AUTOMATED-DEBUGGING-INFRASTRUCTURE.md`, `DEBUGGING-TOOLS-VALIDATION-SUMMARY.md`) under a single `DEBUGGING_GUIDE.md` with section anchors.

- Testing Artifacts
  - Keep `COMPREHENSIVE_TESTING_CHECKLIST.md` as canonical. Link from `TESTING.md` instead of duplicating content.
  - Consolidate `QA_ANALYSIS_REPORT.md`, `QA_SUMMARY_REPORT.md`, `OVERNIGHT_QA_REPORT.md` into `QA_SUMMARY_REPORT.md` with dated sections.

- Architecture & Wiring
  - `ARCHITECTURE.md` remains canonical. Inline detailed wiring in `wire-up-plan.md` and keep an overview here. Deprecate overlapping content in `DATA-FLOW-ARCHITECTURE-ANALYSIS.md` by converting to a short appendix in `ARCHITECTURE.md`.
  - Merge `INTEGRATION_STRATEGY.md` into `SEQUENTIAL_WORKFLOW_STRATEGY.md` as a section.

- Migration & Parity
  - Keep `calc-inventory.md`, `calc-migration-status.md` canonical. Migrate overlapping items from `MIGRATION_COMPLETENESS_REPORT.md` into those.
  - Keep `parity-checklist.md` canonical and link from QA/testing docs.

- Indexes & Changelogs
  - Maintain only two: root `CHANGELOG.md` and `docs/CHANGELOG.md` can be merged; prefer root `CHANGELOG.md` with section for docs.
  - Ensure `MASTER_INDEX.md` and `docs/INDEX.md` are generated/updated together.

Immediate Actions
- Add deprecation banners at top of docs identified for merge with pointer links.
- Update `MASTER_INDEX.md` to reference consolidated files.
- Track this plan in `CHANGELOG.md` under docs.

Acceptance
- No broken links (validate with `docs-index-validate.js`).
- Reduced doc count by ~20–30% without losing Liberty-specific guidance.


