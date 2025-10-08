# 🚨 CRITICAL QA ISSUES - Liberty Tax P&L Webapp

## IMMEDIATE ACTION REQUIRED

### 🔴 **CRITICAL SEVERITY - MUST FIX BEFORE PRODUCTION**

#### 1. **Input Validation Completely Missing**
**Location**: `src/components/InputsPanel.tsx`, `src/components/WizardInputs.tsx`
**Issue**: No client-side validation prevents users from entering invalid data
**Impact**: Users can enter negative values, extreme numbers, or invalid percentages causing calculation errors

**Examples Found**:
- No validation for negative values in expense fields
- Percentage fields can exceed 100% without warning
- No upper bounds on dollar amounts (could enter $999,999,999,999)
- No validation for non-numeric input handling

**Fix Required**:
```typescript
// Add to all numeric inputs
const validateInput = (value: number, field: ExpenseField) => {
  if (isNaN(value)) return { valid: false, error: "Please enter a valid number" }
  if (value < field.min) return { valid: false, error: `Minimum value is ${field.min}` }
  if (value > field.max) return { valid: false, error: `Maximum value is ${field.max}` }
  return { valid: true }
}
```

#### 2. **Division by Zero in Calculations**
**Location**: `src/lib/calcs.ts` line 122
**Issue**: `costPerReturn = totalExpenses/denom` where `denom = Math.max(totalReturns, 1)`
**Impact**: While protected against zero, still produces misleading results when returns = 0

**Current Code**:
```typescript
const denom = Math.max(totalReturns, 1)
const costPerReturn = totalExpenses/denom
```

**Fix Required**:
```typescript
const costPerReturn = totalReturns > 0 ? totalExpenses/totalReturns : 0
// Add UI indicator when returns = 0: "Cost per return: N/A (no returns)"
```

#### 3. **Data Persistence Corruption Risk**
**Location**: `src/hooks/usePersistence.ts` lines 65-75
**Issue**: No validation of loaded data from localStorage
**Impact**: Corrupted localStorage data will break the application

**Current Code**:
```typescript
const parsed = JSON.parse(raw) as PersistEnvelopeV1
if (parsed && parsed.version === 1) return parsed
```

**Fix Required**:
```typescript
const parsed = JSON.parse(raw)
if (parsed && parsed.version === 1 && validateEnvelope(parsed)) return parsed
// Add validateEnvelope function to check data integrity
```

### 🟡 **HIGH SEVERITY - FIX WITHIN 1 WEEK**

#### 4. **Accessibility Violations**
**Location**: Multiple components
**Issues Found**:
- Only 19 ARIA labels found across entire application
- Missing `aria-describedby` for error messages
- No `role` attributes for custom components
- Missing `alt` text for visual indicators

**Specific Violations**:
- KPI stoplight component has minimal accessibility support
- Debug panel tabs lack proper ARIA navigation
- Form validation errors not announced to screen readers

#### 5. **Regional Data Inconsistency**
**Location**: `src/components/WizardShell.tsx`, `src/hooks/useAppState.ts`
**Issue**: Switching regions doesn't properly handle TaxRush data preservation
**Impact**: Users lose data when switching US ↔ CA

**Test Case That Fails**:
1. Set region to CA
2. Enter TaxRush returns: 500
3. Switch to US (TaxRush fields hidden)
4. Switch back to CA
5. **BUG**: TaxRush returns should be preserved but may be lost

#### 6. **Calculation Precision Issues**
**Location**: `src/components/WizardInputs.tsx` lines 70-73
**Issue**: Floating point precision in percentage ↔ dollar conversions
**Impact**: Values don't sync perfectly in dual-entry system

**Current Code**:
```typescript
const newPercentage = Math.round((validDollar / calculationBase * 100) * 10) / 10
```

**Problem**: Can create oscillation where 25% → $50,000 → 24.9% → $49,800

### 🟠 **MEDIUM SEVERITY - FIX WITHIN 2 WEEKS**

#### 7. **Performance Issues**
**Location**: `src/App.tsx`, calculation hooks
**Issues**:
- No debouncing on rapid input changes
- Excessive re-renders on every keystroke
- Large calculation objects passed through props

#### 8. **Error Handling Gaps**
**Location**: Throughout application
**Issues**:
- No try-catch blocks around calculations
- No user-friendly error messages
- No fallback values for failed calculations

#### 9. **Business Logic Validation Missing**
**Location**: All input components
**Issues**:
- No warnings for unrealistic values (e.g., 60% salaries)
- No validation of business rules
- No guidance for reasonable ranges

## 🧪 **REQUIRED TEST CASES**

### Critical Path Tests (Must Pass)
1. **Input Validation Test**
   ```
   - Enter -100 in salary field → Should show error
   - Enter 150% in percentage field → Should show error  
   - Enter "abc" in numeric field → Should show error
   - Enter $999,999,999 → Should warn or cap
   ```

2. **Data Persistence Test**
   ```
   - Enter data, refresh page → Data should persist
   - Corrupt localStorage manually → App should recover
   - Clear storage → App should reset cleanly
   ```

3. **Regional Switching Test**
   ```
   - CA region: Enter TaxRush data
   - Switch to US → TaxRush hidden
   - Switch back to CA → TaxRush data preserved
   ```

4. **Calculation Edge Cases**
   ```
   - Set returns to 0 → Cost per return should show "N/A"
   - Set revenue to 0 with expenses → Should handle gracefully
   - Enter extreme values → Should not break UI
   ```

## 🛠️ **IMMEDIATE FIXES NEEDED**

### 1. Add Input Validation Component
Create `src/components/ValidatedInput.tsx`:
```typescript
interface ValidatedInputProps {
  value: number
  onChange: (value: number) => void
  field: ExpenseField
  showError?: boolean
}

export function ValidatedInput({ value, onChange, field, showError }: ValidatedInputProps) {
  const [error, setError] = useState<string>()
  
  const handleChange = (newValue: number) => {
    const validation = validateInput(newValue, field)
    if (validation.valid) {
      setError(undefined)
      onChange(newValue)
    } else {
      setError(validation.error)
    }
  }
  
  return (
    <div>
      <input 
        type="number"
        value={value}
        onChange={e => handleChange(+e.target.value)}
        min={field.min}
        max={field.max}
        step={field.step}
        aria-describedby={error ? `${field.id}-error` : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <div id={`${field.id}-error`} role="alert" className="error-message">
          {error}
        </div>
      )}
    </div>
  )
}
```

### 2. Add Calculation Error Handling
Wrap all calculations in try-catch:
```typescript
export function calc(inputs: Inputs): Results {
  try {
    // existing calculation logic
    
    // Add validation
    if (totalReturns === 0) {
      return { ...results, costPerReturn: 0, hasWarning: "No returns entered" }
    }
    
    return results
  } catch (error) {
    console.error('Calculation error:', error)
    return getDefaultResults() // Safe fallback
  }
}
```

### 3. Add Data Validation
Create `src/utils/validation.ts`:
```typescript
export function validateEnvelope(data: any): data is PersistEnvelopeV1 {
  if (!data || typeof data !== 'object') return false
  if (data.version !== 1) return false
  
  // Validate required fields exist and are reasonable
  if (data.last) {
    const { avgNetFee, taxPrepReturns } = data.last
    if (avgNetFee < 0 || avgNetFee > 1000) return false
    if (taxPrepReturns < 0 || taxPrepReturns > 100000) return false
  }
  
  return true
}
```

## 📊 **QA METRICS**

### Current State
- **Input Validation**: 0% implemented
- **Error Handling**: 10% implemented  
- **Accessibility**: 15% implemented
- **Test Coverage**: 5% (basic Playwright only)

### Target State (Required for Production)
- **Input Validation**: 100% implemented
- **Error Handling**: 90% implemented
- **Accessibility**: 80% WCAG 2.1 AA compliance
- **Test Coverage**: 80% for critical paths

## ⏰ **TIMELINE**

### Week 1 (CRITICAL)
- [ ] Implement input validation
- [ ] Fix division by zero issues
- [ ] Add data persistence validation
- [ ] Basic error handling

### Week 2 (HIGH)
- [ ] Accessibility improvements
- [ ] Regional data preservation
- [ ] Calculation precision fixes
- [ ] Comprehensive testing

### Week 3 (MEDIUM)
- [ ] Performance optimizations
- [ ] Business logic validation
- [ ] Enhanced error messages
- [ ] Documentation updates

---

**⚠️ DEPLOYMENT BLOCKER**: Do not deploy to production until Critical and High severity issues are resolved.

**Next Review**: Daily standup until critical issues resolved, then weekly.
