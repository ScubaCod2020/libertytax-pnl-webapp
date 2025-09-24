# Dependency Graph - SuggestedFormField Feature

## Feature Overview
SuggestedFormField components for enhanced form fields with contextual suggestion display, smart formatting, and visual indicators for calculated vs suggested fields.

## Complete Dependency Tree

### ✅ **Main Component** - STAGED
- **SuggestedFormFieldComponent** → `angular/src/app/components/wizard-ui/suggested-form-field.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Enhanced form field wrapper with suggestion display and smart formatting

### ✅ **Specialized Input Components** - ALL STAGED
- **SuggestedCurrencyInputComponent** → `angular/src/app/components/wizard-ui/suggested-currency-input.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Currency input with suggestion integration and ControlValueAccessor support

- **SuggestedNumberInputComponent** → `angular/src/app/components/wizard-ui/suggested-number-input.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Number input with suggestion integration and prefix support

- **SuggestedPercentageInputComponent** → `angular/src/app/components/wizard-ui/suggested-percentage-input.component.ts`
  - Status: **STAGED** ✅
  - Purpose: Percentage input with suggestion integration and % suffix

### ✅ **Supporting UI Components** - EXISTS
- **WizardFormFieldComponent** → `angular/src/app/components/wizard-ui/wizard-form-field.component.ts`
  - Status: **EXISTS** ✅ (from previous session)
  - Purpose: Base form field component for consistent layout

### ✅ **Business Logic Service** - STAGED
- **SuggestionEngineService** → `angular/src/app/domain/services/suggestion-engine.service.ts`
  - Status: **STAGED** ✅
  - Purpose: Suggestion calculation engine with profile management
  - Functions:
    - `calculateSuggestions` → Calculate suggestions based on profile and current inputs
    - `getProfile` → Get suggestion profile by key
    - `getAllProfiles` → Get all available profiles
    - `getProfilesForContext` → Filter profiles by region and store type

### ✅ **Domain Types** - STAGED
- **Suggestion Types** → `angular/src/app/domain/types/suggestion.types.ts`
  - Status: **STAGED** ✅
  - Interfaces:
    - `SuggestionProfile` → Store type profiles with expense configurations
    - `CalculatedSuggestions` → Complete calculated suggestion results
    - `ExpenseField` → Individual expense field definitions
    - `SuggestionProfileRegistry` → Profile registry interface

### ✅ **Framework Dependencies** - STANDARD
- **Angular Core** → `@angular/core`
  - Status: **AVAILABLE** ✅
  - Components: Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Injectable

- **Angular Common** → `@angular/common`
  - Status: **AVAILABLE** ✅
  - Directives: CommonModule, NgIf

- **Angular Forms** → `@angular/forms`
  - Status: **AVAILABLE** ✅
  - Features: ControlValueAccessor, NG_VALUE_ACCESSOR

## 🎯 **Dependency Completeness Status**

### **COMPLETE** ✅ - All Dependencies Present

| Category | Component/Service | Status | Notes |
|----------|-------------------|---------|-------|
| **Main UI** | SuggestedFormFieldComponent | ✅ STAGED | Enhanced wrapper with smart formatting |
| **Specialized Inputs** | SuggestedCurrency/Number/PercentageInput | ✅ STAGED | All with ControlValueAccessor support |
| **Base Components** | WizardFormFieldComponent | ✅ EXISTS | From previous session |
| **Business Logic** | SuggestionEngineService | ✅ STAGED | Complete calculation engine |
| **Domain Types** | SuggestionProfile, CalculatedSuggestions | ✅ STAGED | Complete interface definitions |
| **Framework** | Angular Core/Common/Forms | ✅ AVAILABLE | Standard dependencies |

## 🚀 **Ready for Integration**

**All dependencies are present** - this feature can be safely integrated into wizard pages without any missing components or services.

### **Component Features:**
- ✅ Smart field type detection and formatting (currency, percentage, count)
- ✅ Visual suggestion badges with calculated vs suggested indicators
- ✅ Enhanced help text with suggestion information
- ✅ ControlValueAccessor support for form integration
- ✅ Placeholder integration with suggested values
- ✅ Flexible suggestion engine with regional profiles

### **Suggestion Engine Features:**
- ✅ Regional profile management (US/CA)
- ✅ Store type differentiation (new/existing)
- ✅ Complete expense calculation (17 categories)
- ✅ Revenue flow calculations (gross → discounts → net)
- ✅ TaxRush integration for Canadian profiles

### **Next Steps for Wiring:**
1. Import SuggestedFormFieldComponent and specialized inputs into wizard pages
2. Inject SuggestionEngineService into components that need suggestions
3. Calculate suggestions based on current wizard answers and selected profile
4. Pass suggestions to suggested form field components
5. Test suggestion display and formatting across different field types

### **No Blocking Issues** 
- ✅ All UI components staged with proper styling
- ✅ Complete suggestion engine service with sample profiles
- ✅ All domain types and interfaces defined
- ✅ ControlValueAccessor implementation for form compatibility
- ✅ All framework dependencies standard Angular
- ✅ No external service dependencies required

## 📊 **Testing Scenarios**

### **Scenario 1: Currency Field Suggestions**
- Test with grossFees, totalRevenue, netIncome fields
- Verify $ formatting and locale-based number display
- Test placeholder integration with suggested values

### **Scenario 2: Percentage Field Suggestions**
- Test with discountsPct, salariesPct, royaltiesPct fields
- Verify % formatting with proper decimal places
- Test suggestion badge display and calculation indicators

### **Scenario 3: Count Field Suggestions**
- Test with taxPrepReturns, taxRushReturns fields
- Verify number formatting without currency/percentage symbols
- Test prefix display (# for returns count)

### **Scenario 4: Suggestion Engine Profiles**
- Test US vs CA profile selection
- Test new vs existing store type profiles
- Verify TaxRush integration for Canadian profiles only
- Test expense calculation accuracy across all 17 categories

### **Scenario 5: Dynamic Suggestion Updates**
- Test suggestion recalculation when user inputs change
- Verify calculated vs suggested field differentiation
- Test visual flow indicators for calculated fields
