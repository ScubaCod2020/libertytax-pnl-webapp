# Liberty Tax P&L Budget & Forecast – Web App (v0.4 Preview)

This is a **React + TypeScript (Vite)** prototype of the Liberty Tax P&L tool you’ve been designing in Excel. It includes:

- Scenario presets (**Good / Better / Best**)
- **U.S./Canada region logic** (TaxRush applies only to Canada)
- Vertical KPI cards with **traffic‑light indicators** and color‑matched borders
- User‑defined KPI **thresholds**
- Pro‑tips that react to KPI status (red/yellow/green)

## Quick Start

```bash
# 1) Extract the zip
# 2) Install deps
npm install

# 3) Run the dev server
npm run dev

# 4) Open the URL Vite prints (usually http://localhost:5173)
```

## Project Structure

```
libertytax-pnl-webapp/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ src/
│  ├─ styles.css
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ lib/
│  │  └─ calcs.ts        # All the math for fees, expenses, KPIs, and stop-lights
│  ├─ data/
│  │  └─ presets.ts      # Good/Better/Best starting values
│  └─ components/
│     ├─ KPIStoplight.tsx
│     └─ ScenarioSelector.tsx
```

## How the math works (matches the Excel model)

- **Gross Fees** = `Average Net Fee × Tax Prep Returns`
- **Discounts** = `Gross Fees × Discounts%`
- **Tax‑Prep Income** = `Gross Fees − Discounts`
- **Expenses** (Salaries, Rent, Supplies) are % of **Gross Fees**
- **Royalties, Adv. Royalties, Misc** are % of **Tax‑Prep Income**
- **Net Income** = `Tax‑Prep Income − Total Expenses`
- **Total Returns** = `Tax Prep Returns + TaxRush Returns (Canada only)`
- **Cost / Return** = `Total Expenses ÷ Total Returns`
- **Net Margin %** = `Net Income ÷ Tax‑Prep Income`

## KPI Stop‑light thresholds

- **Cost/Return**: Green if ≤ `cprGreen`; Yellow if ≤ `cprYellow`; Red if > `cprYellow`
- **Net Margin %**: Green if ≥ `nimGreen`; Yellow if ≥ `nimYellow`; Red if < `nimYellow`
- **Net Income ($)**: Green if ≥ 0; Yellow if (0 > NI > `netIncomeWarn`); Red if ≤ `netIncomeWarn`

All of the above thresholds are **editable** in the left panel.

## Notes

- This preview intentionally **does not use any chart libraries** to keep setup light. You can add Recharts/Chart.js later.
- Styling is kept lightweight; colors match the current brand direction.
- State can be persisted to `localStorage` in a follow-up revision if desired.
