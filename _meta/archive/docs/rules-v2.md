# KPI Rules V2 (Snapshot)

- **Lifecycle mapping**: `new` stores → Year 1 bands, `existing` stores → Years 2+ bands (per config stub at `config/kpi-rules-v2.defaults.yml`).
- **Expense evaluators** (planned):
  - Rent: US hard cap $1,500/mo; CA ≤18% of revenue with owner-occupied suppressor.
  - Payroll: 35–45%.
  - Marketing: 8–12%.
  - Tech: 2–5%.
  - Misc: flag red when >5% once evaluator is wired.
- **Feature flag**: `features.kpiRulesV2` (intended for dev-only toggle).
- **Gaps**: rent guard inputs (local average rent), payroll benchmark, store age/years-in-operation are not yet collected. Document in `docs/todo/FUTURE_ENHANCEMENTS.md`.
