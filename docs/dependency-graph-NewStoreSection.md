# Dependency Graph - NewStoreSection Feature

## Feature Overview
NewStoreSection component for target performance goals input with auto-calculations, bidirectional discount entry, TaxRush integration, and real-time preview.

## Complete Dependency Tree

### ✅ **Main Component** - STAGED
- **NewStoreSectionComponent** → `angular/src/app/pages/wizard/income-drivers/components/new-store-section.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Target performance goals form with auto-calculations

### ✅ **Supporting UI Components** - ALL STAGED
- **WizardFormSectionComponent** → `angular/src/app/components/wizard-ui/wizard-form-section.component.ts`
  - Status: **EXISTS** ✅ (from previous session)
  - Purpose: Consistent section wrapper with reset capability

- **WizardFormFieldComponent** → `angular/src/app/components/wizard-ui/wizard-form-field.component.ts`
  - Status: **EXISTS** ✅ (from previous session)
  - Purpose: Grid-aligned form field layout

- **ToggleQuestionComponent** → `angular/src/app/components/wizard-ui/toggle-question.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Reusable toggle for TaxRush/OtherIncome with field clearing

- **CurrencyInputComponent** → `angular/src/app/components/wizard-ui/currency-input.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Currency input with $ symbol and formatting

- **NumberInputComponent** → `angular/src/app/components/wizard-ui/number-input.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Number input with prefix/suffix support

- **NetIncomeSummaryComponent** → `angular/src/app/components/wizard-ui/net-income-summary.component.ts`
  - Status: **EXISTS** ✅ (from previous session)
  - Purpose: Real-time net income preview card

### ✅ **Domain Types** - STAGED
- **WizardAnswers Interface** → `angular/src/app/domain/types/wizard.types.ts`
  - Status: **STAGED** ✅
  - Purpose: Complete wizard state interface with all 17 expense fields
  - Dependencies: Region, StoreType, GrowthOption types

### ✅ **Business Logic** - EXISTS
- **Wizard Calculation Helpers** → `angular/src/app/domain/calculations/wizard-helpers.ts`
  - Status: **EXISTS** ✅ (from previous session)
  - Purpose: Auto-calculation functions, performance analysis, adjustment status
  - Functions: `calculateGrossFees`, `calculatePerformanceVsTarget`, `getAdjustmentStatus`

### ✅ **Framework Dependencies** - STANDARD
- **Angular Core** → `@angular/core`
  - Status: **AVAILABLE** ✅
  - Components: Component, Input, Output, EventEmitter, ChangeDetectionStrategy

- **Angular Common** → `@angular/common`
  - Status: **AVAILABLE** ✅
  - Directives: CommonModule, NgIf, NgFor

- **Angular Forms** → `@angular/forms`
  - Status: **AVAILABLE** ✅
  - Features: FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR

## 🎯 **Dependency Completeness Status**

### **COMPLETE** ✅ - All Dependencies Present

| Category | Component/Service | Status | Notes |
|----------|-------------------|---------|-------|
| **Main UI** | NewStoreSectionComponent | ✅ STAGED | Complete implementation |
| **Form Components** | WizardFormSection, WizardFormField | ✅ EXISTS | From previous session |
| **Input Components** | CurrencyInput, NumberInput, ToggleQuestion | ✅ STAGED | All specialized inputs |
| **Summary Component** | NetIncomeSummary | ✅ EXISTS | From previous session |
| **Domain Types** | WizardAnswers, Region, StoreType | ✅ STAGED | Complete interface |
| **Business Logic** | Wizard calculation helpers | ✅ EXISTS | Auto-calc functions |
| **Framework** | Angular Core/Common/Forms | ✅ AVAILABLE | Standard dependencies |

## 🚀 **Ready for Integration**

**All dependencies are present** - this feature can be safely integrated into the income drivers page without any missing components or services.

### **Next Steps for Wiring:**
1. Import NewStoreSectionComponent into income drivers page
2. Add to template with proper inputs/outputs
3. Connect to wizard state management service
4. Test auto-calculations and bidirectional discount logic

### **No Blocking Issues** 
- ✅ All UI components staged or existing
- ✅ All domain types and business logic available  
- ✅ All framework dependencies standard Angular
- ✅ No external service dependencies required
