# Liberty Tax P&L Tool - Consolidated Dependency Analysis

**Generated:** September 25, 2025  
**Purpose:** Consolidated view of all component dependencies and architecture

## Core Architecture Components

### 🏗️ Application Foundation

- **Main Entry Point**: Angular bootstrapping and core configuration
- **App Files**: Root application components and routing
- **HTML/TS Config**: TypeScript and build configuration
- **Testing Infrastructure**: Jest setup and testing utilities
- **Styles/Environment**: SCSS theming and environment configuration

### 🎨 UI Component System

- **Brand System**: Logo, watermark, and regional branding components
- **Footer/Header**: Navigation and layout components
- **Wizard Shell**: Main wizard container and navigation
- **Input Components**: Validated inputs, suggested form fields, toggle questions
- **Display Components**: KPI stoplight, debug panel, brand watermark

### 🧙‍♂️ Wizard Flow Components

- **Wizard Pages**: Step-by-step wizard navigation
- **Wizard Inputs**: Income drivers and expense input forms
- **Wizard Review**: Summary and review components
- **Quick Start Wizard**: Initial configuration wizard
- **Projected Performance Panel**: Growth projections and targets
- **Scenario Selector**: Performance scenario selection

### 📊 Business Logic & Data

- **Calculation Engine**: Core P&L calculations and formulas
- **Types System**: TypeScript interfaces and data models
- **API Client**: Backend communication and data delegation
- **Hooks**: React-style state management utilities
- **Strategic Analysis**: Business intelligence and recommendations

### 🛠️ Utilities & Infrastructure

- **Utils Folder**: Helper functions and utilities
- **Types Folder**: Shared type definitions
- **Test Setup**: Testing configuration and mocks
- **Data Documentation**: API schemas and data structures

## Key Dependencies & Relationships

### State Management Flow

```
WizardStateService → Components → UI Updates
     ↓
Calculation Engine → Derived Values → Display
     ↓
API Client → Backend Data → Persistence
```

### Component Hierarchy

```
App Root
├── Header/Footer (Navigation)
├── Quick Start Wizard (Configuration)
├── Wizard Pages
│   ├── Income Drivers
│   ├── Expenses
│   └── Review
└── Dashboard (Results)
```

### Data Flow

```
User Input → Validation → State Update → Calculations → UI Refresh
```

## Architecture Insights

### Strengths

- **Modular Design**: Clear separation of concerns
- **Type Safety**: Comprehensive TypeScript coverage
- **Reactive Updates**: Observable-based state management
- **Regional Flexibility**: Multi-region branding and calculations

### Areas for Improvement

- **Bundle Size**: Consider lazy loading for wizard steps
- **State Complexity**: Simplify calculation dependencies
- **Testing Coverage**: Expand unit test coverage
- **Documentation**: Keep architectural docs current

## Recent Changes (Sept 2025)

### Completed Features

- ✅ Streamlined expenses page income drivers section
- ✅ Dynamic revenue breakdown based on store type
- ✅ Enhanced currency formatting across application
- ✅ Fixed TaxRush calculation logic
- ✅ Improved navigation and state management

### Technical Debt

- 🔧 Dev server startup issues (environment related)
- 🔧 Floating-point precision in calculations
- 🔧 Component selector conflicts (resolved)
- 🔧 Accessibility improvements needed

---

_This document consolidates information from 35 individual dependency analysis files. For detailed component-specific information, refer to the original files or the codebase directly._
