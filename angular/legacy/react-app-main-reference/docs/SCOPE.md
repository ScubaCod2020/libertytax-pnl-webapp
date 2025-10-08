# SCOPE — Liberty Tax P&L Budget & Forecast Tool

## Purpose
Enable Liberty Tax franchisees to budget/forecast and explore scenarios for returns, pricing, and expenses, with instant KPIs and coaching.

## Primary Users
- Franchise owners/managers (beginner-friendly)
- Trainers/field support (facilitation)

## Core Outcomes
- Understand profitability (Net Income), Net Margin %, and Cost per Return
- Scenario planning (Custom, Good/Better/Best)
- Region-aware behavior (U.S./Canada; TaxRush for Canada only)
- Guided training via Practice Prompts + visual progress

## In-Scope Features (v0.5)
1. **Welcome Wizard**
   - Region (U.S./Canada)
   - Planned returns (2026), Average Net Fee (ANF), Discounts %
   - KPI thresholds (Net Margin green target; Cost/Return green & yellow bounds)
2. **Inputs**
   - Drivers (ANF, Returns, TaxRush)
   - Expense % lines (Salaries, Rent, Office Supplies, Royalties, Adv Royalties, Misc)
   - Scenario presets (Good/Better/Best) with override
3. **Region Logic**
   - If U.S. → TaxRush = 0 (inactive)
   - If Canada → TaxRush participates in totals
4. **Results & KPI Calculations**
   - Gross Fees, Discounts, Tax Prep Income
   - Expenses & Total Expenses
   - Net Income, Cost per Return, Net Margin %
5. **Dashboard (Polished)**
   - Vertical KPI cards with stop‑light indicators (Green/Yellow/Red)
   - Mini **Practice Progress** bar (traffic‑light segments)
   - Expense Mix chart (bar), Net Margin gauge (doughnut)
   - Navigation links
6. **Practice Prompts**
   - 5 prompts with response cells
   - Full **Practice Progress** bar on Practice sheet (traffic‑light segments)
   - “All Practice Complete ✅” indicator
7. **Pro Tips**
   - Contextual coaching when KPIs are Yellow/Red
8. **Report (Print/Export)**
   - One‑page summary for sharing
9. **Branding & Usability**
   - Liberty colors, clean layout, hidden gridlines, freeze panes
   - Macro‑free, formula‑driven

## Out-of-Scope (v0.5)
- Multi‑location consolidation
- Multi‑tab actuals import
- Advanced what‑if drivers (marketing → volume elasticities), to be considered later

## KPI Stop‑Light Rules (defaults)
- **Cost/Return**: Green ≤ CPr_Green; Yellow ≤ CPr_Yellow; Red > CPr_Yellow
- **Net Margin %**: Green ≥ NIM_Green; Yellow ≥ NIM_Yellow; Red < NIM_Yellow
- **Net Income ($)**: Red ≤ NI_Red (warning)

## Data Model (High Level)
- Inputs (drivers & %)
- Presets (Good/Better/Best)
- Outputs (KPI calculations)
- Dashboard visuals and tips read from Outputs
