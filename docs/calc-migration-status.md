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
  - [ ] Port shapes + defaults → `angular/src/app/domain/types/expenses.types.ts`
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
