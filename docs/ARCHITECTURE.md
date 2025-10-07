# Architecture Guide - Liberty Tax P&L Webapp

## Overview

This document provides a comprehensive overview of the Liberty Tax P&L webapp architecture, including component structure, data flow, and design patterns for corporate development teams.

## 1. 🏗️ Core Architecture Principles

### 1.1 Component Composability

Each component works independently but can be combined in any configuration:

- **FormField** → Works in wizard, dashboard, settings
- **AnalysisBlock** → Works in wizard, dashboard, forecasting, multi-store
- **PerformanceCard** → Works for single metrics, multi-store comparisons, monthly breakdowns
- **AppHeader** → Consistent branding across all views

### 1.2 Data-Driven Design

Components accept data objects, not hardcoded values:

```typescript
// Bad (hardcoded, not scalable)
<div>Revenue: $248,500 (+6.6%)</div>

// Good (data-driven, infinitely scalable)
<PerformanceCard metrics={monthlyData} />
<AnalysisBlock data={strategicAnalysis} />
```

### 1.3 Context Awareness

Components adapt to their environment:

```typescript
// Same component, different contexts
<PerformanceCard variant="compact" />      // For sidebars
<PerformanceCard variant="dashboard" />    // For main views
<PerformanceCard variant="detailed" />     // For analysis pages
```

## 2. 📊 Component Library Overview

### 2.1 Layout Components

- **`WizardPage`** - Consistent page wrapper with navigation
- **`FormSection`** - Section headers with icons, descriptions, reset buttons
- **`AppHeader`** - App-wide header with branding, breadcrumbs, actions

### 2.2 Form Components

- **`FormField`** - Standardized grid layout (200px label + flexible input)
- **`CurrencyInput`** - Formatted currency with $ symbol
- **`NumberInput`** - Numbers with prefix/suffix options
- **`PercentageInput`** - Percentage values with % symbol

### 2.3 Analysis Components

- **`AnalysisBlock`** - Strategic vs tactical insights with metrics
- **`PerformanceCard`** - Metric displays with trends and targets
- **`ComparisonWidget`** - Before/after, target vs actual comparisons

### 2.4 Core Application Components

#### **Branding & Identity**

- **`BrandLogo.tsx`** - Brand logo image renderer for consistent branding
- **`BrandWatermark.tsx`** - Large watermark background element for identity

#### **Main Application Views**

- **`Dashboard.tsx`** - Results dashboard view (P&L recap, KPIs)
- **`Header.tsx`** - App header with branding and actions
- **`Footer.tsx`** - App footer and utility controls (reset, etc.)

#### **Input Management**

- **`InputsPanel.tsx`** - Main inputs panel mirroring wizard expense entry
- **`ValidatedInput.tsx`** - Input with validation hooks for ranges and messages

#### **KPI & Performance**

- **`KPIStoplight.tsx`** - KPI stoplight cards and status for quick health signals
- **`ProjectedPerformancePanel.tsx`** - Projected performance recap block
- **`ScenarioSelector.tsx`** - Scenario (Good/Better/Best/Custom) picker

## 3. 🧙‍♂️ Wizard Architecture

### 3.1 Wizard Flow Structure

```
WizardShell.tsx (Orchestrator)
├── WizardPage.tsx (Layout & Navigation)
├── NewStoreSection.tsx (New store inputs)
├── ExistingStoreSection.tsx (Existing store inputs)
├── StrategicAnalysis.tsx (Analysis content)
├── FormField.tsx (Individual form fields)
├── FormSection.tsx (Section layout)
└── NetIncomeSummary.tsx (Financial feedback)
```

### 3.2 Wizard Components

- **`Wizard.tsx`** - Wizard launcher and wrapper
- **`WizardShell.tsx`** - Orchestrates wizard flow and persistence sync
- **`WizardPage.tsx`** - Wizard page shell (layout and steps)
- **`WizardInputs.tsx`** - Wizard Page 2 expense entry and dual-entry logic
- **`WizardReview.tsx`** - Wizard review page prior to completion

### 3.3 Form Components

- **`FormField.tsx`** - Form field for wizard inputs with validation, labels, help
- **`FormSection.tsx`** - Section layout for wizard forms
- **`ToggleQuestion.tsx`** - Toggle question UI for boolean decisions
- **`SuggestedFormField.tsx`** - Suggested form field component for guided entry

## 4. 🔄 Data Flow Architecture

### 4.1 State Management

The application uses a centralized state management approach:

```typescript
// Core state structure
interface AppState {
  region: 'US' | 'CA';
  storeType: 'new' | 'existing';
  performance: PerformanceData;
  expenses: ExpenseData;
  calculations: CalculationResults;
  kpiThresholds: KPIThresholds;
}
```

### 4.2 Data Persistence

- **localStorage** - Primary persistence mechanism
- **SessionState** - Temporary state during wizard flow
- **AppState** - Main application state

### 4.3 Critical Data Flow Requirements

#### **Performance Data Flow**

- **expectedGrowthPct** must be persisted from wizard to AppState
- **calculatedTotalExpenses** must be maintained across navigation
- **Regional data** (TaxRush) must be properly gated by region

#### **Expense Calculation Flow**

- **Dual-entry system** (percentage ↔ dollar) must maintain sync
- **Calculation bases** must be clearly defined and consistent
- **Validation** must prevent invalid inputs

## 5. 🌍 Regional Architecture

### 5.1 US vs Canada Differences

```typescript
// Regional gating logic
if (region === 'US') {
  // TaxRush fields hidden
  // TaxRush royalties = 0
  // Expense calculations exclude TaxRush income
} else if (region === 'CA') {
  // TaxRush fields visible and functional
  // TaxRush royalties calculated correctly
  // Income includes TaxRush revenue
}
```

### 5.2 Regional Components

- **Region selector** affects visibility of TaxRush fields
- **Store type** affects workflow (new vs existing)
- **Regional messaging** displays appropriate guidance

## 6. 🎯 Scalability Architecture

### 6.1 Multi-Store Operations

```typescript
// Single store
const singleStoreData = { storeId: 'store1', revenue: 248500 }

// Multi-store (same component!)
const multiStoreData = [
  { storeId: 'store1', name: 'Downtown', revenue: 248500 },
  { storeId: 'store2', name: 'Mall', revenue: 186300 },
  { storeId: 'store3', name: 'Suburban', revenue: 312750 }
]

<PerformanceCard metrics={multiStoreData} />
```

### 6.2 12-Month Forecasting

```typescript
// Annual view
<AnalysisBlock data={annualAnalysis} />

// Monthly breakdown (same component!)
<AnalysisBlock data={monthlyAnalysis} />
<PerformanceCard metrics={monthlyMetrics} />
```

### 6.3 Strategic vs Tactical Analysis

```typescript
// In wizard
<AnalysisBlock data={wizardInsights} size="medium" />

// In dashboard
<AnalysisBlock data={dashboardInsights} size="large" />

// In mobile view
<AnalysisBlock data={mobileInsights} size="small" />
```

## 7. 🛠️ Debug System Architecture

### 7.1 Debug Components

- **`DebugSidebar.tsx`** - Collapsible debug sidebar shell with multiple views
- **`DebugToggle.tsx`** - UI toggle to enable debug views
- **`SuggestionManager.tsx`** - Manages debug suggestions content and actions
- **`DebugErrorBoundary.tsx`** - Error boundary for debug components

### 7.2 Debug Features

- **Storage inspection** - View and modify localStorage data
- **Calculation debugging** - View intermediate calculation values
- **State monitoring** - Real-time app state inspection
- **Performance metrics** - Monitor app performance
- **Threshold management** - Configure KPI thresholds

## 8. 🚀 Implementation Strategy

### 8.1 Phase 1: Foundation (Current)

✅ Create core components (`FormField`, `FormSection`, `AppHeader`)
✅ Demonstrate with Store Type field
✅ Build examples showing scalability

### 8.2 Phase 2: Systematic Replacement

- Replace all wizard fields with `FormField` components
- Convert sections to use `FormSection`
- Standardize all headers with `AppHeader`

### 8.3 Phase 3: Advanced Features

- Add `AnalysisBlock` throughout app
- Implement `PerformanceCard` for metrics
- Build multi-store and forecasting views

### 8.4 Phase 4: Scale Features

- Monthly forecasting dashboard
- Multi-store management
- Advanced analytics and comparisons

## 9. 💡 Key Benefits

### 9.1 Maintainability

- Fix alignment once → works everywhere
- Update styling once → applies to all instances
- Add features once → available across all scenarios

### 9.2 Scalability

- Multi-store: Same components, different data
- Monthly forecasting: Same analysis, different periods
- New features: Compose existing components

### 9.3 Consistency

- Visual language unified across all views
- User experience consistent everywhere
- Professional appearance maintained

### 9.4 Development Speed

- New pages = combining existing components
- New features = data changes, not UI changes
- Testing = component-level, not page-level

## 10. 🔧 Technical Implementation

### 10.1 Component Dependencies

The application follows a clear dependency hierarchy:

```
Root Components
├── Header.tsx → BrandLogo.tsx
├── InputsPanel.tsx → Wizard/types.ts
├── Wizard.tsx → WizardShell.tsx
└── Dashboard.tsx → KPIStoplight.tsx

Wizard Components
├── WizardShell.tsx → Wizard/types.ts, calculations.ts
├── WizardInputs.tsx → ValidatedInput.tsx
└── WizardReview.tsx → Wizard/types.ts

Shared Components
├── AnalysisBlock.tsx (standalone)
├── AppHeader.tsx (standalone)
└── PerformanceCard.tsx (standalone)
```

### 10.2 Data Flow Patterns

- **Unidirectional data flow** from parent to child components
- **Event-driven updates** for user interactions
- **Centralized state management** for complex data
- **Local component state** for UI-only concerns

## 11. 🎯 Architecture Validation

### 11.1 Component Testing

- **Unit tests** for individual components
- **Integration tests** for component interactions
- **E2E tests** for complete user flows

### 11.2 Performance Considerations

- **Lazy loading** for large components
- **Memoization** for expensive calculations
- **Virtual scrolling** for large data sets
- **Bundle splitting** for optimal loading

---

This modular architecture provides a solid foundation for scalable development, ensuring consistency, maintainability, and professional quality across all application features.
