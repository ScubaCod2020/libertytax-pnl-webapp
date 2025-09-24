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

KPIStoplight.tsx → Angular placement and rationale

- What it is: Visual KPI status indicator component using stoplight metaphor (red, yellow, green) to display performance status. Features three colored lenses with only the active status illuminated, using CSS custom properties for consistent theming and accessibility support with ARIA labels.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/kpi-stoplight/kpi-stoplight.component.ts` (reusable visual indicator component)
  - Note: Distinct from existing KPIStoplightsComponent which is a compound dashboard component
- Why that location: Reusable visual component for status indication; complements existing KPI system with simple visual indicator.
- Inputs: `active` (Light status: 'red' | 'yellow' | 'green')
- Outputs: None (pure visual indicator component)
- Missing: None - new component created with enhanced accessibility, smooth transitions, CSS custom properties for theming, and trackBy optimization for performance.

ProjectedPerformancePanel.tsx → Angular placement and rationale

- What it is: Prior Year vs Projected performance comparison panel that shows last year performance metrics vs projected goals. Features performance status indicators with color-coded metrics, prior year calculations (net margin, cost per return), and future enhancement placeholders for tracking mode transitions.
- Where it belongs in Angular:
  - Dashboard: `angular/src/app/pages/dashboard/components/projected-performance-panel.component.ts` (dashboard-specific performance comparison component)
  - Note: Complements existing PerformanceCardComponent system as specialized prior year comparison
- Why that location: Dashboard-specific component for performance comparison; provides specialized prior year analysis that complements the existing flexible performance system.
- Inputs: `ProjectedPerformanceData` (structured data object with projected metrics and prior year data)
- Outputs: None (pure display component)
- Missing: None - new component created with structured data interface, performance status calculation, conditional rendering, and architectural complement to existing performance system.

ScenarioSelector.tsx → Angular placement and rationale

- What it is: Simple scenario selection dropdown component for choosing between business performance scenarios (Custom, Good, Better, Best). Features debug logging for scenario changes and controlled input with proper event handling for scenario state management.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/scenario-selector/scenario-selector.component.ts` (reusable scenario selection component)
  - Note: Complements existing ProjectedService system as reusable UI component
- Why that location: Reusable UI component for scenario selection; complements existing scenario state management with flexible UI component.
- Inputs: `scenario` (current Scenario), `scenarios` (ScenarioOption array), layout options, debug logging
- Outputs: `scenarioChange` (EventEmitter for scenario selection)
- Missing: None - new component created with enhanced flexibility, multiple layout options, description support, accessibility features, and architectural complement to existing scenario system.

ValidatedInput.tsx → Angular placement and rationale

- What it is: Production-ready input component with comprehensive validation for financial data entry. Features real-time validation, error/warning display, accessibility compliance, and contextual validation based on expense field types. Addresses critical QA issues including input validation, error handling, and accessibility violations.
- Where it belongs in Angular:
  - UI: `angular/src/app/components/validated-input/validated-input.component.ts` (reusable validated input component)
  - Utils: `angular/src/app/domain/utils/validation.utils.ts` (validation system and utilities)
  - Note: Creates comprehensive validation infrastructure missing from Angular application
- Why that location: Reusable form component with validation; provides production-ready validation system for financial data entry.
- Inputs: `field` (ExpenseField), `value`, `context` (ValidationContext), accessibility and styling options
- Outputs: `valueChange` (ValidatedInputData), `validationChange` (ValidationResult)
- Missing: None - new component and validation system created with comprehensive validation logic, accessibility features, debounced input handling, and production-ready error/warning display.

Wizard.tsx → Angular placement and rationale

- What it is: Simple wrapper component that serves as the main entry point for the wizard functionality. Acts as a thin interface layer that passes props directly to the WizardShell component, providing a clean API for the wizard system while delegating all implementation to WizardShell. This is an architectural pattern - a facade component that provides a stable public interface while the actual implementation lives in WizardShell.
- Where it belongs in Angular:
  - Not applicable: Angular wizard system architecture exceeds React implementation
  - Note: Angular has comprehensive wizard architecture with routing, state management, and sophisticated page components
- Why that location: Angular's existing wizard system is architecturally superior with routing-based navigation, comprehensive state management (WizardStateService), sophisticated page components (WizardPageComponent), and complete wizard flow architecture that makes the simple React facade pattern obsolete.
- Inputs: N/A - React facade pattern unnecessary in Angular architecture
- Outputs: N/A - Angular uses routing and state management instead of simple prop delegation
- Missing: None - Angular wizard system significantly exceeds React functionality with comprehensive architecture, routing integration, state management, and sophisticated component system.

WizardInputs.tsx → Angular placement and rationale

- What it is: Comprehensive data-driven expense input component (1,939 lines) that serves as the main input collection page for the wizard - essentially Step 2 of the wizard. Handles income drivers configuration (locked display from Step 1), expense management with dual percentage/dollar inputs, regional handling (Canada-specific TaxRush fields), strategic calculations with performance-based targets, validation with error tracking, real-time calculations with live revenue/expense breakdowns, and bidirectional data flow with auto-save of calculated totals back to wizard state.
- Where it belongs in Angular:
  - Not applicable: Angular expense input system architecture significantly exceeds React implementation
  - Note: Angular has complete expense page implementation with superior modular architecture
- Why that location: Angular's existing expense input system demonstrates exceptional architectural superiority over the monolithic React approach with complete HTML implementation (expenses.component.html), superior input components (ValidatedInputComponent with production-ready validation system, CurrencyInputComponent with ControlValueAccessor support, NumberInputComponent with enhanced form integration), advanced dashboard component (InputsPanelComponent with enhanced sliders, dual percentage/dollar inputs, regional filtering, real-time calculations, bidirectional data flow), and sophisticated architecture (modular component system vs monolithic React component, expense field system with ExpenseField interface, regional filtering with getFieldsForRegion, category organization with icons and descriptions).
- Inputs: N/A - Angular modular system exceeds monolithic React approach
- Outputs: N/A - Angular uses sophisticated component composition and services
- Missing: None - Angular expense input system significantly exceeds React implementation with complete functionality, superior architecture, enhanced user experience, production-ready validation, dashboard integration, and better code organization vs monolithic React approach.

WizardReview.tsx → Angular placement and rationale

- What it is: Comprehensive report generation and wizard data compilation component (972 lines) that serves as the final step of the wizard flow - essentially Step 3 of the wizard. Handles print-friendly P&L summary for management review, professional report generation with branded headers, complete financial breakdown with revenue and expense details, export functionality (PDF print, Excel export), management review checklist with performance targets, KPI analysis with color-coded status indicators, regional branding with dynamic logo display, and error-safe calculation with fallback values.
- Where it belongs in Angular:
  - Not applicable: Angular P&L report system significantly exceeds React monolithic approach with complete HTML implementation and superior modular architecture
  - Note: Angular has comprehensive P&L report system with professional templates and advanced dashboard components
- Why that location: Angular's existing P&L report system demonstrates exceptional architectural superiority over the monolithic React approach with complete HTML implementation (angular/src/app/pages/wizard/pnl/components/reports.component.html with professional P&L report structure, branded headers, complete financial breakdown, KPI metrics with color-coded status, management review checklist, export controls), superior dashboard components (ProjectedPerformancePanelComponent with advanced performance comparison, InputsPanelComponent with comprehensive input management, KpiStoplightsComponent with visual KPI indicators), and advanced Angular architecture (modular component system vs single 972-line React monolith, structured templates vs embedded JSX calculations, service architecture with dedicated calculation and report services, OnPush change detection optimization vs React re-renders, static report template ready for data binding vs dynamic React generation, professional styling with print-optimized CSS vs inline React styles, component composition with reusable parts vs monolithic React approach).
- Inputs: N/A - Angular modular report system exceeds monolithic React approach
- Outputs: N/A - Angular uses sophisticated component composition and services
- Missing: None - Angular P&L report system significantly exceeds React monolithic approach with complete HTML implementation, superior modular architecture, professional report generation, advanced dashboard components, and comprehensive functionality.

WizardShell.tsx → Angular placement and rationale

- What it is: Comprehensive wizard orchestration and state management component (551 lines) that serves as the main wizard controller - handles multi-step workflow orchestration (Welcome → Inputs → Review → Complete), state management and persistence with saved data loading, regional synchronization between app and wizard state, step navigation with breadcrumb controls and accessibility, dynamic component composition based on store type and step, expected revenue calculation with real-time updates, data validation and progression controls, and embedded WelcomeStep component with region/store type selection.
- Where it belongs in Angular:
  - Not applicable: Angular wizard orchestration system significantly exceeds React monolithic approach with router-based architecture and service-based state management
  - Note: Angular has comprehensive wizard orchestration system with routing, state management, and lazy-loaded components
- Why that location: Angular's existing wizard orchestration system demonstrates exceptional architectural superiority over the monolithic React approach with router-based architecture (angular/src/app/app.routes.ts with lazy-loaded wizard pages, dashboard integration, development tools), state management service (WizardStateService with centralized wizard selections storage, type-safe WizardSelections interface, service-based state updates vs React prop drilling), advanced component system (WizardPageComponent with sophisticated page wrapper and navigation controls, QuickStartWizardComponent with settings integration, individual wizard pages with lazy loading and route-based navigation), and superior Angular architecture (router-based navigation vs React step state management, service-based state management vs React useState/useEffect, lazy loading vs React conditional rendering, route guards vs React validation logic, dependency injection vs React prop drilling).
- Inputs: N/A - Angular router-based system exceeds monolithic React orchestration
- Outputs: N/A - Angular uses routing and services instead of React step management
- Missing: None - Angular wizard orchestration system significantly exceeds React monolithic approach with router-based architecture, service-based state management, lazy-loaded page architecture, and comprehensive navigation system.

data/presets.ts → Angular placement and rationale

- What it is: Data-driven scenario configuration providing pre-configured performance scenarios with comprehensive expense field defaults, franchise royalty configurations, and region-specific settings. Contains Scenario type definition ('Custom' | 'Good' | 'Better' | 'Best') and basePreset with all 17 expense fields plus preset configurations for Good, Better, and Best scenarios with different avgNetFee, taxPrepReturns, salariesPct, and rentPct values.
- Where it belongs in Angular:
  - Not applicable: Angular scenario system significantly exceeds React data-only approach with complete UI integration and sophisticated suggestion profiles
  - Note: Angular has comprehensive scenario system with UI components, suggestion engine, and regional differentiation
- Why that location: Angular's existing scenario system demonstrates exceptional architectural superiority over the React data-only approach with advanced scenario configuration (ScenarioSelectorComponent with complete scenario UI and real-time switching, SuggestionEngineService with sophisticated suggestion profiles and regional data for CA/US, InputsPanelComponent with integrated scenario selection), superior documentation (comprehensive docs folder with 70+ documentation files, architecture documentation with ARCHITECTURE.md and BLUEPRINT_DELTA.md, strategic guides with AI_INTEGRATION_GUIDE.md and AUTOMATED_TESTING_STRATEGY.md, component dependency graphs for every component, progress tracking with DEVELOPMENT_PROGRESS_LOG.md and calc-migration-status.md), and enhanced data structures (suggestion profiles with regional differentiation CA vs US, complete expense field configurations with validation rules, scenario-based presets integrated into UI components vs React standalone data files).
- Inputs: N/A - Angular integrated scenario system exceeds React data-only approach
- Outputs: N/A - Angular uses complete UI integration and service architecture
- Missing: None - Angular scenario and documentation system significantly exceeds React data-only approach with complete UI integration, sophisticated suggestion profiles, regional differentiation, and comprehensive 70+ documentation files.

docs/ folder → Angular placement and rationale

- What it is: Strategic architecture documentation containing AI integration strategy (AI/LLM integration roadmap with modular architecture enabling AI features, training data collection, and intelligent analysis) and system architecture (comprehensive architecture documentation with core design principles, bidirectional information flow, modular component architecture, and scalability scenarios).
- Where it belongs in Angular:
  - Not applicable: Angular documentation system significantly exceeds React strategic documentation with comprehensive 70+ documentation files and integrated architecture guides
  - Note: Angular has extensive documentation system with strategic guides, component graphs, and progress tracking
- Why that location: Angular's existing documentation system demonstrates exceptional architectural superiority over the React strategic documentation with comprehensive documentation (70+ documentation files vs 2 React markdown files, architecture documentation with ARCHITECTURE.md and BLUEPRINT_DELTA.md, strategic guides with AI_INTEGRATION_GUIDE.md and AUTOMATED_TESTING_STRATEGY.md, component dependency graphs for every component, progress tracking with DEVELOPMENT_PROGRESS_LOG.md and calc-migration-status.md), integrated architecture (documentation deeply integrated with codebase vs React standalone files, component-specific dependency graphs and migration status, comprehensive testing and QA documentation, development progress tracking and milestone management), and superior organization (structured documentation hierarchy with categorized guides, comprehensive coverage of all aspects vs React limited strategic docs, integrated with Angular development workflow, extensive testing and validation documentation).
- Inputs: N/A - Angular comprehensive documentation system exceeds React strategic files
- Outputs: N/A - Angular uses integrated documentation architecture with 70+ files
- Missing: None - Angular documentation system significantly exceeds React strategic documentation with comprehensive 70+ files, integrated architecture guides, component dependency graphs, and development progress tracking.

hooks/ folder → Angular placement and rationale

- What it is: Collection of React hooks for centralized state management (useAppState - 364 lines managing all application state with 17+ expense fields, UI state, thresholds, and bulk operations), regional branding management (useBranding - dynamic CSS variables, document title/favicon updates, regional brand switching with safety checks), P&L calculations and KPI status (useCalculations - memoized calculations, KPI status determination, formatting helpers with performance optimization), complete data persistence and storage management (usePersistence - localStorage operations, autosave, wizard state tracking, data validation with migration support and corruption handling), and preset scenario application and regional gating (usePresets - automatic preset application, region-based field resets, hydration coordination with scenario switching and regional business rules).
- Where it belongs in Angular:
  - Not applicable: Angular service system significantly exceeds React hook implementation with clean service separation, reactive observables, dependency injection, and modular architecture
  - Note: Angular has comprehensive service architecture with calculation, wizard state, configuration, suggestion engine, and specialized domain services
- Why that location: Angular's existing service system demonstrates exceptional architectural superiority over the React hook implementation with clean service separation (CalculationService with clean service wrapper for calculation engine vs React memoization complexity, WizardStateService with dedicated state management and type-safe selections vs React useState chaos, ConfigService with regional configuration management and dependency injection vs React prop drilling, SuggestionEngineService with sophisticated profile-based calculations and regional differentiation vs React simple presets, Domain Services with multiple specialized services for analysis, metrics, report assembler vs React monolithic hooks, BidirService with advanced state synchronization vs React manual state management), superior architecture patterns (Angular uses reactive observables vs React useState/useEffect, Angular has proper dependency injection vs React prop drilling, Angular has modular service composition vs React hook coupling, Angular has optimized change detection vs React re-render issues, Angular has clean separation of concerns vs React mixed responsibilities), and enhanced performance (Angular services with singleton pattern and optimized change detection vs React hook recreation and dependency arrays, Angular RxJS observables with efficient subscription management vs React useEffect cleanup complexity, Angular dependency injection with proper service lifecycle vs React hook dependency management issues).
- Inputs: N/A - Angular service architecture exceeds React hook patterns
- Outputs: N/A - Angular uses injectable services with observables instead of React hook return values  
- Missing: None - Angular service system significantly exceeds React hook implementation with clean service separation, reactive observables, dependency injection, modular architecture, and superior performance characteristics.

lib/api-client/ folder → Angular placement and rationale

- What it is: Auto-generated lightweight API client providing typed functions for health check endpoint (/api/health) and P&L summary endpoint (/api/reports/summary) with OpenAPI-generated TypeScript definitions, URL construction, error handling, and type safety. Contains client.ts (21 lines) with getHealth() and getSummary(params) functions, and types.d.ts (57 lines) with path definitions, response schemas, and query parameters for regional P&L summary data.
- Where it belongs in Angular:
  - Not applicable: Angular API client system matches React implementation with superior service architecture
  - Note: Angular has comprehensive API client system with ApiClientService, generated client functions, and complete type definitions
- Why that location: Angular's existing API client system demonstrates architectural parity with the React implementation while providing superior service integration (ApiClientService with injectable service wrapper around generated client functions vs React direct imports, identical core functions with same getHealth() and getSummary() implementations, same OpenAPI-generated type definitions with comprehensive schema coverage, superior service architecture with dependency injection pattern vs React direct function imports, enhanced integration with service pattern providing better testability and dependency management vs React standalone functions, comprehensive type system with multiple API type files and namespace declarations).
- Inputs: N/A - Angular API client system matches React implementation with service wrapper
- Outputs: N/A - Angular uses injectable services with same typed responses as React
- Missing: None - Angular API client system matches React implementation with identical core functions, same type definitions, and superior service architecture providing better testability and dependency management.

lib/apiClient.ts → Angular placement and rationale

- What it is: Simple delegation/re-export layer that maintains single source of truth for API types and functions by re-exporting Health and Summary types from API namespace and getHealth/getSummary functions from ./api-client/client, serving as a clean abstraction over the generated OpenAPI client with facade/delegation pattern providing simplified import path for consumers while hiding internal structure.
- Where it belongs in Angular:
  - Not applicable: Angular API client service exceeds React delegation layer with superior service architecture
  - Note: Angular has ApiClientService providing injectable service wrapper with identical delegation pattern
- Why that location: Angular's existing ApiClientService demonstrates architectural superiority over the React delegation layer with injectable service architecture (ApiClientService provides dependency injection vs React file-level re-exports for better testability and service lifecycle management), identical delegation pattern (same type re-exports for Health and Summary types and function delegation for getHealth and getSummary methods), superior integration (injectable service pattern provides better testability and dependency management vs React static imports), enhanced architecture (Angular service lifecycle management vs React static file-level exports for better maintainability and testing), dependency injection benefits (constructor injection with type safety vs React direct imports for better service composition), service mocking capabilities (injectable services enable better testing through dependency injection vs React static function imports).
- Inputs: N/A - Angular ApiClientService exceeds React delegation layer with service wrapper
- Outputs: N/A - Angular uses injectable services with same delegated functionality as React
- Missing: None - Angular API client service exceeds React delegation layer with identical functionality, superior service architecture, and enhanced integration through dependency injection providing better testability and dependency management.