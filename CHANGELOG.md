# Changelog

All notable changes to the Liberty Tax P&L Webapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **🧙‍♂️ Major Wizard Enhancement**: Complete business planning system with performance-based setup
  - New/Existing Store selection with tailored workflows
  - Last Year Performance tracking (Tax Prep Income, Average Net Fee, Tax Prep Returns, TaxRush Returns, Total Expenses)
  - Projected Performance calculation with growth percentage dropdown (-20% to +25% with custom input)
  - Side-by-side performance comparison (Last Year vs Projected)
  - Real-time Net Income and Net Margin preview
  - Other Income field for additional revenue streams
- **💼 Dual-Entry Expense System**: Revolutionary input system for all 17 expense categories
  - Enter either dollar amounts OR percentages with auto-synchronization
  - Dynamic calculation bases (projected revenue, tax prep income, salaries, fixed amounts)
  - Real-time conversion with proper validation and rounding
  - Visual indicators for carried-forward values from wizard page 1
  - Transparent calculation base display for user understanding
- **🎯 Enhanced Thresholds Control Panel**: Comprehensive power-user controls in debug panel
  - KPI color threshold adjustments (Cost/Return, Net Margin, Net Income warning)
  - One-click Good/Better/Best scenario presets with instant UI updates
  - Live expense defaults overview with factory reset capability
- **📊 Advanced Testing Interface**: Collapsible sections for organized control access
- **🔧 Power User Features**: Real-time threshold testing without cluttering main UI
- **✅ Dashboard KPI Cards**: Fixed visibility and styling issues with proper spacing

### Changed

- **🎯 Debug Panel Enhancement**: Renamed "KPI" tab to "Thresholds" with expanded functionality
- **📋 Organized Control Layout**: Three collapsible sections (KPI Thresholds, Scenario Presets, Expense Defaults)
- **⚡ Improved Testing Workflow**: All controls auto-save and update UI instantly
- **🎨 Wizard UI Improvements**: Reduced excessive spacing, better field organization
- **📝 Terminology Updates**: "Baseline" → "Dashboard" throughout wizard for consistency
- **💰 Revenue Rounding**: All projected revenue amounts rounded to nearest dollar
- **🇨🇦 Regional Messaging**: TaxRush fields only show for Canada with contextual help

### Fixed

- **♿ Accessibility Improvements**: Fixed form element accessibility violations in projected income drivers component
  - Added proper labels with `for` attributes for all form elements (select dropdowns, number inputs, range sliders)
  - Added `title` attributes for enhanced screen reader support
  - Implemented screen reader only (sr-only) labels for visual clarity without clutter
  - Moved inline styles to external CSS classes for better maintainability
  - Fixed axe/forms violations: select-name, label requirements for all form controls
- Tooling: Migrated to Husky v9, removed deprecated `.husky/_/husky.sh` shim, and set `core.hooksPath` to `.husky`. Pre-commit now runs `lint-staged` and progress log validation without warnings.

### Angular Maintenance

- Avoided direct `Math.` usage in templates by adding a `round(...)` helper to `StrategicAnalysisComponent` and updating the template accordingly.
- Corrected component metadata to use `styleUrls` where `styleUrl` was mistakenly used.
- Implemented missing helper methods used by `reports.component.html` (season labels, margin class, quarterly and seasonal stats) and extended `ReportData` to include expense sections referenced by the template.
- Increased `anyComponentStyle` budget in `angular.json` to reduce noisy SCSS warnings masking real errors.

### Docs

- Added Angular template guidance (avoid globals in templates; provide component wrappers) and debugging notes to README.

### Technical Details

- package.json: `prepare` now `husky`; added devDependency `husky@^9`; removed `simple-git-hooks` and its config
- Git config: `core.hooksPath=.husky`
- Deleted directory: `.husky/_`
- Verified Angular workspace is on v20.3.x with Node v24.8.0

- **🐛 Custom Growth Dropdown**: Fixed reversion issue when selecting "Custom percentage..."
- **📊 Dashboard KPI Cards**: Restored proper visibility with enhanced styling and spacing
- **🎯 Excel Parity**: Confirmed all 17 expense categories match Excel workbook exactly

---

## [0.5.0-preview.3] - 2025-01-05

🚧 **PREVIEW RELEASE: Complete Wizard Transformation with Performance-Based Business Planning**

_Note: This is a preview release. Full v0.5.0 will be released when branch merges to main._

### Added

- **🧙‍♂️ Enhanced Setup Wizard**: Performance-based business planning with new/existing store types
- **📊 Store Performance Analysis**: Last year revenue, growth projections, and expected revenue calculations
- **💰 Comprehensive Income Modeling**: TaxRush returns count, other income streams, real-time revenue breakdown
- **🎯 Smart Business Planning**: Dropdown growth options (-20% to +25%) with custom input capability
- **📋 Intelligent Data Flow**: Page 1 performance data automatically carries forward to Page 2 with visual indicators
- **🇨🇦 Enhanced Canada Support**: TaxRush returns integrated throughout wizard flow
- **🏗️ Clean Hooks Architecture**: Extracted state, persistence, calculations, and presets into reusable custom hooks
- **🔧 Professional Debug System**: Collapsible sidebar with multiple views (Storage, Calculations, State, Performance)
- **📊 Enhanced Dashboard**: Improved spacing and visual organization of expense breakdown
- **⚡ Local Development**: Full npm build pipeline working with 48+ modules
- Comprehensive 17-category expense system
- Multi-step setup wizard with Welcome, Inputs, and Review stages
- Enhanced expense breakdown with visual categorization
- Detailed commit message template for consistent documentation

### Changed

- **🎉 MAJOR WIZARD UPGRADE**: Performance-based planning with historical data integration
- **📈 Income Driver Enhancement**: Added TaxRush returns count, other income, revenue calculations
- **✨ Improved UX**: Reduced excessive spacing, better field organization, professional terminology
- **🎯 Regional Awareness**: TaxRush messaging only shows for Canada, "regional stats" terminology for new stores
- **📊 Side-by-side Performance Layout**: Last Year vs Projected Performance columns with complete data structure
- **🔧 Fixed Custom Percentage**: Custom growth input now works properly
- **🚀 MAJOR: App.tsx reduced from 1,268 to 185 lines (85% reduction)**
- **Clean Architecture**: Separated concerns into focused, testable hooks
- **Debug System**: Replaced intrusive debug panel with professional sidebar system
- **UI Improvements**: Better dashboard spacing and field organization
- **Terminology**: "Baseline" → "Dashboard" throughout wizard for consistency
- Expanded expense structure from basic categories to 17 detailed fields
- Updated calculation engine to handle varied expense bases
- Enhanced wizard integration with dashboard saving functionality

### Fixed

- JSX structure errors causing deployment failures
- Git merge conflict markers in component files
- Duplicate variable declarations in App.tsx
- Missing closing tags and mismatched braces
- Debug panel covering wizard navigation buttons
- Dashboard fields bleeding together visually
- Excessive spacing between form fields and descriptions
- Custom percentage dropdown functionality
- TaxRush messaging showing for US region
- Data flow between wizard pages

### Technical Architecture

- **Enhanced WizardAnswers**: Added storeType, lastYearRevenue, expectedGrowthPct, expectedRevenue, taxRushReturns, otherIncome
- **Smart Calculations**: Auto-calculating expected revenue with manual override capability
- **Performance Integration**: Welcome page data flows into income drivers section
- **Visual Indicators**: Carried-forward fields show 📋 icon and special styling
- **Regional Logic**: TaxRush fields and messaging only appear for Canadian offices
- **useAppState.ts**: Centralized state management (250 lines)
- **usePersistence.ts**: Storage and hydration logic (240 lines)
- **useCalculations.ts**: Calculation and KPI logic (100 lines)
- **usePresets.ts**: Preset and region gating logic (50 lines)
- **DebugSystem/**: Professional debug infrastructure with toggle and sidebar
- **Modular Components**: Header, InputsPanel, Dashboard, Footer all extracted

### Scope Compliance (docs/SCOPE.md)

- ✅ **EXCEEDED**: Welcome Wizard now includes performance-based planning beyond basic region/returns/ANF
- ✅ **EXCEEDED**: Inputs now include comprehensive 17-category expense system vs basic 6 categories
- ✅ **EXCEEDED**: Region Logic enhanced with TaxRush integration throughout wizard
- ✅ **EXCEEDED**: Results & KPI Calculations with real-time revenue breakdown
- ✅ **EXCEEDED**: Dashboard with professional debug system and modular architecture
- ✅ **SCOPE COMPLETE**: All v0.5 requirements met and significantly enhanced

---

## Version History

### [0.5.0-preview.3] - 2025-01-05 🚧 **PREVIEW RELEASE**

- **Complete wizard transformation** with performance-based business planning
- **Professional architecture** with clean hooks and modular components
- **Enhanced regional support** with intelligent TaxRush integration
- **Comprehensive income modeling** with 17-category expense system
- **Enterprise-grade debugging** with collapsible sidebar system
- **Bundle**: 48 modules, 200.82 kB (production optimized)
- **Scope**: EXCEEDED all original v0.5 requirements

### [0.4.0] - Previous Release

- Basic wizard and dashboard functionality
- Initial expense system implementation
- Core calculation engine
- **Bundle**: 44 modules, 182.22 kB

### Upcoming Releases

- **v0.6.0**: Monthly breakdown analysis, advanced reporting
- **v0.7.0**: Multi-location consolidation, enhanced analytics
- **v1.0.0**: Production-ready with full feature set

### Technical Details

- **New Files**:
  - `src/types/expenses.ts` - Expense field definitions and helpers
  - `src/components/WizardShell.tsx` - Multi-step wizard orchestrator
  - `src/components/WizardInputs.tsx` - Data-driven expense input form
  - `src/components/WizardReview.tsx` - Comprehensive data review component
  - `src/hooks/usePersistence.ts` - Storage and hydration logic
  - `src/hooks/useCalculations.ts` - Calculation and KPI logic
  - `src/components/Dashboard/Dashboard.tsx` - Modular dashboard component
- **Updated Files**:
  - `src/App.tsx` - Integrated wizard system, expanded state management
  - `src/lib/calcs.ts` - Enhanced calculation engine for 17 expense categories
  - `src/data/presets.ts` - Updated presets with all expense fields

## [v0.4.0] - Previous Version

### Features

- Basic P&L calculation system
- Simple expense categories
- KPI stoplight indicators
- Regional support (US/Canada)
- Basic persistence and presets

---

## How to Use This Changelog

### For Developers:

- **Unreleased**: Current development work
- **Added**: New features and capabilities
- **Changed**: Modifications to existing functionality
- **Fixed**: Bug fixes and error corrections
- **Technical Details**: Implementation specifics for future reference

### For Users:

- Focus on **Added** and **Changed** sections for new capabilities
- Check **Fixed** for resolved issues
- **Technical Details** can be skipped unless you're debugging

### Maintenance:

- Move items from **Unreleased** to a new version section when deploying
- Always include the date and version number for releases
- Link to specific commits or PRs when helpful
- Keep technical details for complex changes

---

## Version History Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New feature descriptions

### Changed

- Modified functionality descriptions

### Fixed

- Bug fix descriptions

### Technical Details

- Implementation specifics
- File changes
- Breaking changes (if any)
```
