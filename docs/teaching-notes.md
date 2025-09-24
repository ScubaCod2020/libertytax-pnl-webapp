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
