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

SuggestedInputDemo.tsx → Angular placement and rationale

- What it is: Demo/educational component showing complete integration of the suggestion system with flow from input suggestions to calculated results, visual indicators, regional conditional logic, and educational explanations.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/demos/suggested-input-demo.component.ts` (demo component)
  - Business Logic: `angular/src/app/domain/services/suggestion-engine.service.ts` (extended with getSuggestionProfile)
  - Dependencies: All SuggestedFormField components from previous session
- Why that location: Educational/demo component for showcasing suggestion system; service extension for profile selection logic; reuses all existing suggested components.
- Inputs: `answers: WizardAnswers`, `region: Region`
- Outputs: `answersChange: EventEmitter<Partial<WizardAnswers>>`
- Missing: None - complete staging with getSuggestionProfile function added and all visual styling preserved.

ToggleQuestion.tsx → Angular placement and rationale

- What it is: Reusable toggle question component for wizard sections that eliminates duplication between NewStoreSection and ExistingStoreSection, providing yes/no radio button interface with field clearing logic, conditional rendering, and customizable styling.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/wizard-ui/toggle-question.component.ts` (reusable toggle component)
  - Dependencies: WizardAnswers type from domain types
- Why that location: Shared wizard UI component for consistent yes/no questions across wizard sections; eliminates duplication between store sections.
- Inputs: `title`, `description`, `fieldName`, `fieldValue`, `positiveLabel`, `negativeLabel`, `fieldsToClearOnDisable`, `titleColor`, `showOnlyWhen`
- Outputs: `valueChange: EventEmitter<{ [key: string]: any }>`
- Missing: None - component already exists with identical functionality, minor typo fix applied (fieldsToeClearOnDisable → fieldsToClearOnDisable).

types.ts → Angular placement and rationale

- What it is: Central type definitions for the entire wizard system, extracted for better modularity. Defines comprehensive data contracts including WizardAnswers with all 85+ fields, component props, strategic analysis types, and wizard step management.
- Where it belongs in Angular:
  - Types: `angular/src/app/domain/types/wizard.types.ts` (central wizard types)
  - Dependencies: Region and ExpenseValues types from other domain files
- Why that location: Domain types for framework-agnostic data contracts; central location for all wizard-related interfaces; supports type safety across components.
- Exports: `WizardStep`, `WizardAnswers`, `GrowthOption`, `WizardShellProps`, `WizardSectionProps`, `PerformanceAnalysis`, `AdjustmentStatus`
- Missing: Minor additions made - added WizardShellProps interface and updateAnswers method to WizardSectionProps, added expenses field placeholder to WizardAnswers for complete compatibility.

WizardPage.tsx → Angular placement and rationale

- What it is: Standardized page wrapper for all wizard pages providing consistent spacing, headers, and navigation across all wizard steps. Handles step management, navigation buttons (Next/Back/Cancel), and conditional button states.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/wizard-ui/wizard-page.component.ts` (page wrapper component)
  - Dependencies: WizardStep type from domain types
- Why that location: Reusable page-level wrapper for consistent wizard layout and navigation; shared across all wizard steps for standardized UX.
- Inputs: `title`, `subtitle`, `step`, `canProceed`, `nextLabel`, `backLabel`
- Outputs: `nextClick`, `backClick`, `cancelClick` EventEmitters
- Missing: None - complete staging with Angular EventEmitter patterns for navigation, conditional button display based on observer pattern, consistent styling matching React implementation.

BrandLogo.tsx → Angular placement and rationale

- What it is: Regional brand logo component with multiple variants (main, wide, watermark), size options (small, medium, large), error handling with text fallback, and responsive design. Supports both US and Canadian branding with appropriate asset loading.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/brand-logo/brand-logo.component.ts` (shared branding component)
  - Dependencies: BrandAssets configuration from lib/brands, Region type
- Why that location: Shared branding component used across multiple pages/features; centralized location for consistent brand display.
- Inputs: `region`, `variant`, `size`, `customClass`, `customStyle`
- Outputs: None (display component)
- Missing: None - component already exists with excellent implementation, enhanced with React parity features (customClass/customStyle inputs, improved variant logic, enhanced error logging).

BrandWatermark.tsx → Angular placement and rationale

- What it is: Fixed-position watermark component with regional branding support, responsive sizing, error handling with text fallback, and subtle visual styling (low opacity, grayscale filter, no pointer events). Designed for document/page background branding with centered positioning and rotation effects.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/brand-watermark/brand-watermark.component.ts` (specialized watermark component)
  - Dependencies: BrandAssets configuration from lib/brands, Region type
- Why that location: Specialized branding component for watermark use cases; separate from BrandLogo for focused functionality.
- Inputs: `region`
- Outputs: None (display component)
- Missing: None - component already exists with excellent implementation, enhanced with React parity features (improved asset selection logic, dynamic brand name resolution, enhanced error logging for debugging).

DebugPanel.tsx → Angular placement and rationale

- What it is: Development debug panel with fixed positioning (top-right corner), application state display (storage key, origin, version, ready/hydrating status), and debugging actions (save, dump, copy JSON, clear storage, show wizard). Designed for development-only use with conditional visibility.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/dev/app-state-debug.component.ts` (development debugging component)
  - Note: Different from existing DebugPanelComponent which handles milestones/feature flags
- Why that location: Development-only component for app state debugging; separate from existing debug panel which serves different purpose (milestones vs app state).
- Inputs: `show`, `storageKey`, `origin`, `appVersion`, `isReady`, `isHydrating`, `savedAt`
- Outputs: `saveNow`, `dumpStorage`, `copyJSON`, `clearStorage`, `showWizard` EventEmitters
- Missing: None - new component created as AppStateDebugComponent to avoid naming conflict with existing DebugPanelComponent (which serves different debugging purpose).

Footer.tsx → Angular placement and rationale

- What it is: Professional navigation footer with multi-column layout, app navigation (wizard, dashboard, reports), quick links (pro-tips, practice, export), external resources (settings, training, support), and about/version information with progress milestones. Features conditional navigation based on wizard completion status.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/app-footer/app-footer.component.ts` (existing core layout component)
  - Note: Angular implementation significantly more advanced than React version
- Why that location: Core application layout component; existing Angular version has superior functionality.
- Inputs: Router-based navigation (more advanced than React props)
- Outputs: Angular Router navigation (more advanced than React callbacks)
- Missing: None - existing Angular component exceeds React functionality with Router integration, dynamic milestones, debug integration, and advanced state management.

Header.tsx → Angular placement and rationale

- What it is: App header with three-column layout: regional logo display, centered title with version, and action buttons (region selector, setup wizard, dashboard, reports, reset). Features conditional button display based on wizard completion and current page, plus configuration display showing region and store type.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/app-header/app-header.component.ts` (existing core layout component)
  - Note: Angular implementation significantly more advanced than React version
- Why that location: Core application layout component; existing Angular version has superior functionality.
- Inputs: Settings service integration (more advanced than React props)
- Outputs: Router-based navigation and service integration (more advanced than React callbacks)
- Missing: None - existing Angular component exceeds React functionality with BrandLogoComponent integration, settings service integration, flexible actions system, and comprehensive router-based navigation.

InputsPanel.tsx → Angular placement and rationale

- What it is: Dashboard inputs panel mirroring wizard Page 2 structure with enhanced sliders and bidirectional wizard data flow. Features comprehensive expense management with dual percentage/dollar inputs, regional filtering, TaxRush field handling, scenario selection, and automatic persistence back to wizard state.
- Where it belongs in Angular:
  - UI: `angular/src/app/pages/dashboard/components/inputs-panel.component.ts` (dashboard-specific input management component)
  - Dependencies: Expense field definitions, regional filtering, bidirectional data flow
- Why that location: Dashboard-specific component for input management; provides enhanced user experience with sliders and real-time persistence.
- Inputs: Complex props including region, scenario, all income/expense fields, and bidirectional persistence
- Outputs: EventEmitters for field changes and wizard persistence
- Missing: None - new component created with comprehensive dashboard input management, dual percentage/dollar inputs, regional filtering, TaxRush handling, scenario selection, enhanced sliders, and bidirectional wizard persistence.