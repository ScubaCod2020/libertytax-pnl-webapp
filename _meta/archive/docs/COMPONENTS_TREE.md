# Components Tree — Developer Guide

Path: /docs

Purpose: Inventory and quick-reference for React components with context for novices and AI tools.

- src/components/BrandLogo.tsx
  - What: Brand logo image renderer.
  - Why: Consistent branding across headers and printable views.

- src/components/BrandWatermark.tsx
  - What: Large watermark background element.
  - Why: On-screen and print identity; low-contrast background.

- src/components/Dashboard/Dashboard.tsx
  - What: Results dashboard view (P&L recap, KPIs).
  - Why: Primary output of planning flow; aligns with Excel parity.

- src/components/DebugPanel.tsx
  - What: Legacy debug panel (superseded by DebugSystem).
  - Why: Backward compatibility; prefer DebugSystem.

- src/components/DebugSystem/DebugSidebar.tsx
  - What: Collapsible debug sidebar shell with multiple views.
  - Why: Non-intrusive debugging for support and QA.

- src/components/DebugSystem/DebugToggle.tsx
  - What: UI toggle to enable debug views.
  - Why: Gate debug-only context in production-like runs.

- src/components/DebugSystem/SuggestionManager.tsx
  - What: Manages debug suggestions content and actions.
  - Why: Central place to evolve coaching/assists.

- src/components/Examples/ModularDemo.tsx
  - What: Example modularization demo UI.
  - Why: Teaching and experimentation sandbox.

- src/components/Footer.tsx
  - What: App footer and utility controls (reset, etc.).
  - Why: Persistent actions; place for future links.

- src/components/Header.tsx
  - What: App header with branding and actions.
  - Why: Primary navigation entry and identity.

- src/components/InputsPanel.tsx
  - What: Main inputs panel mirroring wizard expense entry.
  - Why: Direct editing after wizard; dual-entry behavior.

- src/components/KPIStoplight.tsx
  - What: KPI stoplight cards and status.
  - Why: Quick health signals; mirrors Excel stoplights.

- src/components/ProjectedPerformancePanel.tsx
  - What: Projected performance recap block.
  - Why: Keeps context visible while editing expenses.

- src/components/ScenarioSelector.tsx
  - What: Scenario (Good/Better/Best/Custom) picker.
  - Why: Fast exploration and presentation.

- src/components/Shared/AnalysisBlock.tsx
  - What: Shared card block for analysis sections.
  - Why: Visual consistency and reuse.

- src/components/Shared/AppHeader.tsx
  - What: Shared application header wrapper.
  - Why: Single source-of-truth for header layout.

- src/components/Shared/PerformanceCard.tsx
  - What: KPI performance card.
  - Why: Reusable KPI visualization unit.

- src/components/ValidatedInput.tsx
  - What: Input with validation hooks.
  - Why: Enforce ranges and messages across inputs (expand usage).

- src/components/Wizard.tsx
  - What: Wizard launcher and wrapper.
  - Why: Entry point to guided setup.

- src/components/Wizard/ExistingStoreSection.tsx
  - What: Section for existing store inputs.
  - Why: PY-driven flows and comparisons.

- src/components/Wizard/ExistingStoreSectionNew.tsx
  - What: New variant for existing store inputs.
  - Why: Iteration toward improved UX.

- src/components/Wizard/FormField.tsx
  - What: Form field for wizard inputs.
  - Why: Encapsulated validation, labels, help.

- src/components/Wizard/FormSection.tsx
  - What: Section layout for wizard forms.
  - Why: Structure and readability.

- src/components/Wizard/NetIncomeSummary.tsx
  - What: Net income summary display.
  - Why: Immediate financial feedback.

- src/components/Wizard/NewStoreSection.tsx
  - What: Section for new store inputs.
  - Why: No PY; relies on benchmarks and guidance.

- src/components/Wizard/StrategicAnalysis.tsx
  - What: Strategic analysis content.
  - Why: Narrative insight and recommendations.

- src/components/Wizard/SuggestedFormField.tsx
  - What: Suggested form field component.
  - Why: Guided entry patterns.

- src/components/Wizard/SuggestedInputDemo.tsx
  - What: Demo for suggested inputs.
  - Why: Pattern reference during development.

- src/components/Wizard/ToggleQuestion.tsx
  - What: Toggle question UI for wizard.
  - Why: Clear boolean decisions (e.g., hasOtherIncome).

- src/components/Wizard/WizardPage.tsx
  - What: Wizard page shell (layout and steps).
  - Why: Manages step layout and navigation.

- src/components/WizardInputs.tsx
  - What: Wizard Page 2 expense entry and dual-entry logic.
  - Why: Core expense-editing experience with $↔% sync.

- src/components/WizardReview.tsx
  - What: Wizard review page prior to completion.
  - Why: Final verification before applying to app state.

- src/components/WizardShell.tsx
  - What: Orchestrates wizard flow and persistence sync.
  - Why: Connects wizard answers with app state and storage.

Tests and internal utilities within **tests**/ and calculations.ts are excluded from this list.
