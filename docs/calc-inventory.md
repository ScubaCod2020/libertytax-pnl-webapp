## Calculation Inventory (React Reference → Angular Domain)

- src/lib/calcs.ts
  - Exports: `calc(inputs)`, `statusForCPR(v,t,inputs?)`, `statusForMargin(v,t)`, `statusForNetIncome(v,t)`; types: `Region`, `Inputs`, `Results`, `Thresholds`
  - Purpose: Core P&L math (gross, discounts, income, 17 expense lines, totals, KPIs)
  - Deps/assumptions: TaxRush logic gated by `region==='CA' && handlesTaxRush`; `calculatedTotalExpenses` may override field-based sum; logs/dev branches removed when porting

- src/components/Wizard/calculations.ts
  - Exports: `GROWTH_OPTIONS`, `calculateFieldGrowth`, `getAdjustmentStatus`, `calculateBlendedGrowth`, `calculatePerformanceVsTarget`, `calculateExpectedRevenue`, `calculateGrossFees`, `calculateStandardExpenses`, `calculateNetIncome`, `parseCurrencyInput`, `formatCurrency`
  - Purpose: Wizard-specific helpers for growth and projections; formatting utilities
  - Deps/assumptions: Uses `WizardAnswers` shape; TaxRush projected income placeholder 0 until fields configured

- src/types/expenses.ts
  - Exports: `expenseFields` (17 categories), `expenseCategories`, helpers `getFieldsByCategory`, `getFieldById`, `getFieldsForRegion`, types `ExpenseField`, `ExpenseCategory`, `ExpenseValues`, `defaultExpenseValues`
  - Purpose: Dictionary-first expense meta and defaults; region-aware filtering for TaxRush fields
  - Deps/assumptions: Some fields are percent-of-gross vs percent-of-salaries vs percent-of-tax-prep-income; Canada-only fields for TaxRush

- src/data/presets.ts
  - Exports: `presets` (Good/Better/Best) and `Scenario`
  - Purpose: Example presets including all 17 fields; used for UX flows
  - Deps/assumptions: Values tuned to hit expense target band; TaxRush royalties preset uses gross-fee-based surrogate

- src/hooks/useCalculations.ts
  - Exports: `useCalculations`, helpers `getKpiClass`, `currency`, `pct`
  - Purpose: React adapter that packages `calc` and KPI colors for components
  - Adapter note: Replace with Angular `CalculationService` calling domain functions

- src/hooks/useAppState.ts
  - Purpose: React state container; includes thresholds and 17-line expense values
  - Adapter note: Replace with Angular `WizardStateService` and `ConfigService`

- src/hooks/usePersistence.ts
  - Purpose: Storage envelope (localStorage), hydration, wizard flags
  - Adapter note: Angular persistence service later; not part of domain
