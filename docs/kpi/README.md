# KPI Reference (Angular Port)

This README summarizes the current state of KPI logic while the Angular port is still in flight.

## Pillars

- **Expense Ratio**: Strategic guardrail targets 60–80% of gross revenue (adopted from KPI Rules V1).
- **Net Income Margin**: Healthy range 20–40% of gross revenue.
- **Cost per Return (CPR)**: Derived from total expenses ÷ total returns; color logic still uses legacy thresholds while Rules V2 is staged.

## Current Bands

- Expense ratio guardrail: 60–80%.
- Net income margin: ≥25% (green), 15–24% (yellow), <15% (red) (legacy thresholds).
- CPR thresholds fall back to region-config absolute values until Rules V2 wiring is complete.

> **Note**: KPI Rules V2 service/adapter stubs exist (`core/services/kpi`). Once config ingestion is wired, update these bands to reflect lifecycle mappings and per-expense limits.
