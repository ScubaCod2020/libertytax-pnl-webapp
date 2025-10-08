# Actionables

## Assets to compress/replace
- None flagged (>200KB)

## CSS to split/normalize
- angular/src/app/components/quick-start-wizard/quick-start-wizard.component.scss (324 lines)
- angular/src/app/pages/wizard/expenses/components/expenses.component.scss (570 lines)
- angular/src/app/pages/wizard/income-drivers/components/projected-income-drivers.component.scss (434 lines)
- angular/src/app/pages/wizard/income-drivers/components/py-income-drivers.component.scss (242 lines)

## Templates with gotchas (to revisit/verify now fixed)
- [ ] angular/src/app/components/demos/suggested-input-demo.component.html (formatCurrency → MoneyPipe)
- [ ] angular/src/app/pages/wizard/income-drivers/components/strategic-analysis.component.html (formatCurrency → MoneyPipe)
- [ ] angular/src/app/pages/wizard/pnl/components/reports.component.html (ensure quarterlyData pipe used; season label helpers acceptable)
