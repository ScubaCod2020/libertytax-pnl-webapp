## 2025-09-29 – Expenses Wizard Polish

- **Layout parity**: Personnel/Facility/Operations rows now use consistent grid-chain layout with dollar-first inputs, percent sync, slider alignment, and note textarea.
- **Category ordering**: Miscellaneous moved ahead of Franchise to match blueprint guidance (Dues grouped under Misc).
- **Helper text**: Added inline rationale for 60–80% expense band, CPR/PPR strategy, and clarified employee deductions base formula.
- **Tooltips + controls**: Ensured each info button has descriptive `aria-label`, sliders have `aria-label`s, and reset action includes tooltip copy.
- **KPI cues**: Expense guardrail card highlights net-income target and documents upcoming KPI Rules V2 thresholds (payroll 35–45%, marketing 8–12%, tech 2–5%, misc flagged when >5% once evaluators land).
- **Expense summary layout**: Actual Expense Breakdown mirrors gross revenue card, now pulling live totals, ratio, CPR, and net-per-return with a two-column flex layout.
- **Dollar-first pattern**: Personnel, Facility, Operations, Misc, and Franchise rows all display dollar amounts before percentages and only show notes when KPI status is yellow/red.
- **Revenue breakdown parity**: Projected Gross Revenue card now reuses the same data as `projected-income-drivers`, displaying returns, averages, discounts, and TaxRush values read-only.

## 2025-09-29 – Centralized KPI + Template Approach

- **Single source of truth**: Thresholds and helper notes derive from `expense-rules.ts` and `expense-text.service.ts`.
- **Unified revenue basis**: All conversions and KPIs use projected + (TaxRush CA) + other income when enabled.
- **Template row**: Telephone wired as the reference row using metadata-driven amount↔percent helpers; replicate pattern to other lines.
- **Naming consistency**: Payroll fields standardized to `payrollPct`; reports and adapters updated.
- **Accessibility**: Keep `aria-label`/titles in notes and info buttons synchronized with service-generated strings.
