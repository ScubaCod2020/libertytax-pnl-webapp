AnalysisBlock.tsx → Angular placement and rationale

PerformanceCard.tsx → Angular placement and rationale

- What it is: Reusable performance metrics card (supports value formatting, trends, targets, context).
- Where it belongs in Angular:
  - UI: `angular/src/app/components/performance-card/performance-card.component.ts`
  - Types: `angular/src/app/domain/types/performance.types.ts`
  - Placement: Dashboard middle column grid under feature flag (preview)
- Why that location: Shared visual card for dashboard and other pages; types reusable in services.
- Inputs: `title`, `metrics[]`, `variant`, `showTrends`, `showTargets`, `actions`.
- Outputs: `metricClick` (optional).
- Missing: Actual YTD vs Projected binding; service to compute metrics arrays.

MetricsAssemblerService → Purpose and placement

- What it is: Pure service that builds `PerformanceMetric[]` for dashboard from app state.
- Where it belongs: `angular/src/app/domain/services/metrics-assembler.service.ts`
- Why: Keeps UI simple and reusable; central place to evolve logic from demo → real YTD vs Projected.
- Inputs: `SettingsService`, `ProjectedService`, `CalculationService`
- Outputs: `{ revenue: PerformanceMetric[], returns: PerformanceMetric[] }`
- Next: Replace demo inputs with real Projected vs YTD when available.

Wizard calculations (React) → Angular mapping

- What it is: Utility functions used across wizard pages for growth, revenue, and analysis.
- Where in Angular: `angular/src/app/domain/calculations/wizard-helpers.ts`
- Added now: `calculatePerformanceVsTarget`, `getAdjustmentStatus` to mirror React features.
- Why: Enables AnalysisBlock/PerformanceCard to reference consistent domain helpers; keeps templates free of math.

- What it is: Reusable analysis card showing status color, primary metric, optional comparison and insights.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/analysis-block/analysis-block.component.ts`
  - Types: `angular/src/app/domain/types/analysis.types.ts`
  - Future adapters (if needed): `angular/src/app/domain/adapters/analysis/*` (none yet)
- Why that location: Shared visual component used across wizard, dashboard, forecasting; types live in domain for reuse and testability.
- Inputs: `AnalysisData`, `size`, `showComparison`, `showInsights`, optional `onClick`.
- Outputs: None (presentational). Emits click via handler if provided.
- Missing: No business logic; future service may compute insights and comparison; feature-flag gating for visibility staged separately.

NewStoreSection.tsx → Angular placement and rationale

- What it is: Target performance goals input form for new stores with auto-calculations, bidirectional discount entry ($/%), TaxRush integration for Canada, and real-time net income preview.
- Where it belongs in Angular:
  - UI: `angular/src/app/pages/wizard/income-drivers/components/new-store-section.component.ts`
  - Supporting components: `angular/src/app/components/wizard-ui/` (ToggleQuestion, CurrencyInput, NumberInput)
  - Types: `angular/src/app/domain/types/wizard.types.ts` (complete WizardAnswers interface)
- Why that location: Feature-specific UI for income drivers page; shared wizard components in reusable location; types in domain for service access.
- Inputs: `answers: WizardAnswers`, `region: Region`
- Outputs: `answersChange: EventEmitter<Partial<WizardAnswers>>`
- Missing: None - complete staging with all dependencies present.

StrategicAnalysis.tsx → Angular placement and rationale

- What it is: Educational strategic vs tactical analysis component showing variance between strategic goals and actual field-level adjustments with performance comparisons and business lessons.
- Where it belongs in Angular:
  - UI: `angular/src/app/pages/wizard/income-drivers/components/strategic-analysis.component.ts`
  - Business Logic: `angular/src/app/domain/calculations/wizard-helpers.ts` (extended with calculateBlendedGrowth)
  - Types: `angular/src/app/domain/types/wizard.types.ts` (existing interfaces)
- Why that location: Educational component for income drivers page; calculation logic in domain for reusability; conditional rendering based on adjustments.
- Inputs: `answers: WizardAnswers`
- Outputs: None (presentational component)
- Missing: None - complete staging with calculateBlendedGrowth function added to wizard helpers.

SuggestedFormField.tsx → Angular placement and rationale

- What it is: Enhanced form field components with contextual suggestion display showing calculation flow, smart formatting based on field type (currency, percentage, count), and visual indicators for calculated vs suggested fields.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/wizard-ui/suggested-form-field.component.ts` (main wrapper)
  - Specialized Inputs: `angular/src/app/components/wizard-ui/suggested-*-input.component.ts` (currency, number, percentage)
  - Business Logic: `angular/src/app/domain/services/suggestion-engine.service.ts` (calculation logic)
  - Types: `angular/src/app/domain/types/suggestion.types.ts` (SuggestionProfile, CalculatedSuggestions)
- Why that location: Reusable wizard components for enhanced UX; suggestion engine in domain for business logic; types in domain for service access.
- Inputs: `label`, `helpText`, `required`, `fieldId`, `suggestions`, `isCalculated`
- Outputs: None (wrapper component, specialized inputs emit valueChange)
- Missing: None - complete staging with suggestion engine service and all specialized input components.