# Changelog

All notable changes to the Liberty Tax P&L Webapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
