# DEV_NOTES_V5

## Tech Stack
- Python 3.10+
- openpyxl for Excel generation

## Build Output
- `dist/LT_PnL_Tool_v0.5.xlsx`

## Key Implementation Notes
- Practice progress bars use **5 adjacent cells** with conditional formatting:
  - Green when completed >= segment index
  - Yellow when completed > 0 and < index
  - Red when 0 and index not yet reached
- Region logic locks TaxRush to 0 when Region = U.S.
- Stop‑light indicators are achieved with conditional fill + helper status cells.
- Charts are openpyxl BarChart (expense mix) and DoughnutChart (margin).

## Sheet Overview
- **Welcome** — guided inputs + links
- **Inputs** — drivers, expense %, thresholds
- **Presets** — scenario values
- **Results** — core computations
- **Dashboard** — KPIs + charts + mini progress
- **Practice** — prompts + responses + full progress bar
- **ProTips** — auto suggestions
- **Report** — printable summary

## Known XLSX Limitations
- Gridline visibility and some cosmetic preferences vary by viewer.
- Conditional formats for icons are approximated with fills/text.
