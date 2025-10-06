# CHANGELOG

## v0.5 — 2025-09-02

- Added **Practice Prompts** sheet with 5 questions and response cells
- Implemented **traffic‑light progress bars** (full on Practice sheet, mini on Dashboard)
- Polished **Dashboard**: vertical KPI cards + stop‑light indicators + status text
- Added **navigation links** between Welcome/Inputs/Dashboard/Practice/ProTips/Report
- Extended **Pro Tips** tied to KPI status & thresholds
- Added **Report** sheet (print‑friendly)
- Applied Liberty styling (colors), muted inputs, hidden gridlines
- Kept macro‑free; all logic via formulas & conditional formats

## v0.4

- Welcome sheet feeding Inputs
- Region logic (U.S. vs. Canada; TaxRush only in Canada)
- Initial Dashboard, charts, Pro Tips

## 2025-09-23

- Docs updated: blueprint delta added (Angular 20, REGION_CONFIGS, dashboard split), architecture/service boundaries, context digest refreshed
- BrandingService: sets favicon/title; typography variables expanded
- Dashboard: results panel split into page-local components (`kpi-stoplights`, `income-summary-card`, `expense-breakdown-card`, `pro-tips-card`)
- Roadmap scaffolds (visual only): `monthly-forecast-card`, `multi-store-summary-card` added to right column
- Debug tools: Baseline Manager (formerly Suggestion Manager) integrated under debug panel; baseline engine/types added as pure TS
- Global error handling: `DebugErrorHandler` opens debug panel on uncaught errors
- Expenses taxonomy: 6-category model affirmed (personnel, facility, marketing, utilities, franchise, misc); Salaries→Payroll label; Dues moved to misc; franchise last
