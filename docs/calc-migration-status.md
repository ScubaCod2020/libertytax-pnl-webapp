AnalysisBlock (UI/Types) migration status

- Staged:
  - Types: `angular/src/app/domain/types/analysis.types.ts`
  - UI: `angular/src/app/components/analysis-block/analysis-block.component.ts`
- Remaining:
  - Service to compute insights/comparisons from wizard/projected state (domain/service)
  - Feature-flag provider and gating for dev-only visibility
  - Placement in Wizard Step 1 and Dashboard (render shells only)
  - Documentation updates and trace hooks

PerformanceCard (UI/Types) migration status

- Staged:
  - Types: `angular/src/app/domain/types/performance.types.ts`
  - UI: `angular/src/app/components/performance-card/performance-card.component.ts`
  - Preview placement: Dashboard middle column under `showPerformanceCards`
- Remaining:
  - MetricsAssembler service to compute YTD vs Projected metrics
  - Multi-store/monthly variants

## Calc Migration Status

- Core P&L Math (src/lib/calcs.ts)
  - [x] Port `calc` → `angular/src/app/domain/calculations/calc.ts`
  - [x] Port KPI helpers → `angular/src/app/domain/calculations/kpi.ts`
  - [x] Types `Inputs/Results/Thresholds/Region` → `angular/src/app/domain/types/calculation.types.ts`
  - [x] Adapters (React-like) → `angular/src/app/domain/calculations/adapters.ts`

- Wizard Helpers (src/components/Wizard/calculations.ts)
  - [x] Growth + projections → `angular/src/app/domain/calculations/wizard-helpers.ts`
  - [ ] Currency/percent formatting → keep UI-layer; domain exposes numbers only

- Expenses Dictionary (src/types/expenses.ts)
  - [x] Port shapes + defaults → `angular/src/app/domain/types/expenses.types.ts`
  - [x] Align operational/utility fields to fixed-dollar (`*Amt`)
  - [ ] Region filtering helpers → domain utils

- Presets (src/data/presets.ts)
  - [ ] Move data under config token or keep as seed in `core/tokens`

- Angular Scaffolding
  - [x] REGION_CONFIGS token → `angular/src/app/core/tokens/region-configs.token.ts`
  - [x] WizardStateService → `angular/src/app/core/services/wizard-state.service.ts`
  - [x] ConfigService → `angular/src/app/core/services/config.service.ts`
  - [x] CalculationService → `angular/src/app/core/services/calculation.service.ts`

## Staged Components & Calculations (2025-09-24)

- AnalysisBlock UI shell + types (dev-gated, not wired)
- PerformanceCard UI shell + types (dev-gated, not wired)  
- Wizard helpers: performance vs target, adjustment status functions
- MetricsAssemblerService + AnalysisDataAssemblerService (demo data)
- **NewStoreSection**: Complete target performance goals form with auto-calculations
- **StrategicAnalysis**: Educational strategic vs tactical analysis with performance comparisons
- **SuggestedFormField**: Enhanced form fields with contextual suggestion display and smart formatting
- **SuggestedInputDemo**: Educational demo component showing complete suggestion system integration
- **WizardPage**: Standardized page wrapper with consistent navigation and step management
- **BrandLogo**: Regional brand display with variants and error handling (enhanced with React parity)
- **BrandWatermark**: Fixed-position watermark with regional branding and error handling (enhanced with React parity)
- **AppStateDebug**: Development debug panel with app state display and debugging actions (new component for development use)
- **AppFooter**: Professional navigation footer with multi-column layout (existing Angular component exceeds React functionality)
- **AppHeader**: Three-column header with regional branding and actions (existing Angular component exceeds React functionality)
- **InputsPanel**: Dashboard inputs panel with enhanced sliders and bidirectional wizard data flow (comprehensive expense management with dual percentage/dollar inputs)
- **KPIStoplight**: Visual KPI status indicator with stoplight metaphor and accessibility support (reusable visual component complementing existing KPI system)
- **ProjectedPerformancePanel**: Prior year vs projected performance comparison with status indicators and metrics display (specialized dashboard component complementing existing performance system)
- **ScenarioSelector**: Scenario selection dropdown with debug logging and flexible layout options (reusable UI component complementing existing scenario state management)
- **ValidatedInput**: Production-ready input with comprehensive validation and accessibility compliance (new validation infrastructure addressing critical QA issues)
- **Wizard**: Simple facade wrapper for wizard entry point (Angular wizard system significantly exceeds with comprehensive routing architecture and state management)
- **WizardInputs**: Comprehensive expense input component - Step 2 of wizard (Angular expense system significantly exceeds with complete HTML implementation and superior modular architecture)
- **WizardReview**: Comprehensive report generation component - Step 3 of wizard (Angular P&L report system significantly exceeds with complete HTML implementation and superior modular architecture)
- **WizardShell**: Comprehensive wizard orchestration component - main wizard controller (Angular wizard orchestration system significantly exceeds with router-based architecture and service-based state management)
- **Data and Documentation**: Data-driven scenario configuration and strategic architecture documentation (Angular data and documentation systems significantly exceed with complete UI integration and comprehensive 70+ files)
- **Service Architecture**: Collection of React hooks for state management and business logic (Angular service system significantly exceeds with clean service separation and reactive observables)
- **API Client**: Auto-generated lightweight API client with typed functions and OpenAPI definitions (Angular API client system matches with superior service architecture)
- **API Client Delegation**: Simple delegation/re-export layer with facade pattern for clean abstraction (Angular API client service exceeds with superior service architecture)
- **Calculation Engine**: Comprehensive P&L calculation engine with business logic and extensive test coverage (Angular calculation system enhanced with React features and superior domain architecture)
- **Regional Branding System**: Centralized regional branding configuration with comprehensive design system (Angular branding system enhanced with React comprehensive branding and superior theme service architecture)
- **Test Setup**: Test environment configuration and mocking (Angular testing configuration enhanced with React test setup features)
- **Types Folder**: Central type definitions and API types (Angular type system significantly exceeds with domain-first organization and enhanced functionality)
- **Utils Folder**: Utility functions for validation and suggestions (Angular utility system significantly exceeds with service-integrated architecture and framework optimization)
- **App Files**: Main application component with state management and testing (Angular application system significantly exceeds with router-integrated architecture and service-based organization)
- **Main Entry**: Application entry point with DOM rendering and styling (Angular bootstrap system significantly exceeds with framework-integrated bootstrap and enterprise features)
- **Styles & Environment**: Styling system and environment types (Angular styling and environment system significantly exceeds with modular SCSS architecture and dynamic theming)
- **HTML & TypeScript Config**: HTML entry point and TypeScript configuration (Angular configuration system significantly exceeds with enterprise-level configuration and framework integration)
- **Testing Infrastructure**: Testing infrastructure and automation scripts (Angular testing infrastructure significantly exceeds with framework-integrated testing and enterprise capabilities)
- **P&L Tool Builder**: Excel P&L tool generation with Python scripting (Angular P&L system significantly exceeds with real-time calculations and enterprise features)
- **Wizard UI Components**: ToggleQuestion (typo fix applied), CurrencyInput, NumberInput, SuggestedInputs (ControlValueAccessor support)
- **SuggestionEngineService**: Profile-based suggestion calculation with regional differentiation and context-based profile selection
- **Complete Type System**: WizardAnswers interface with 85+ fields, WizardShellProps, WizardSectionProps, strategic analysis types
- **Extended Wizard Helpers**: Added calculateBlendedGrowth function for strategic analysis
- **Suggestion Types**: SuggestionProfile and CalculatedSuggestions interfaces

## What Remains

- Wire AnalysisBlock + PerformanceCard business logic (replace demo data)
- Connect wizard pages to CalculationService for live updates  
- Complete expense dual-entry system (bidirectional $ ↔ % sync)
- Add remaining React wizard components (existing store sections, expense pages)
- **Integration**: Wire NewStoreSection + StrategicAnalysis + SuggestedFormField + SuggestedInputDemo into wizard pages with state management and suggestion engine

Notes:

- Do not wire to UI yet. Ensure app still builds.
- Keep domain pure; no Angular imports in `domain/*`.
- Record deltas in `docs/BLUEPRINT_DELTA.md` and update blueprint mappings later.
