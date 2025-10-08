# Known Issues - P&L Budget & Forecast App

## 🚨 Active Bugs (Next Branch Priority)

### Page 2 Expense Reset After Refresh (Critical)
**Bug ID**: `page2-expense-reset-after-refresh`  
**Severity**: High  
**Status**: Confirmed, Not Fixed  

**Description**: 
After completing wizard → refresh browser → go back to Page 2, expense totals reset to default scaled values (~150,932) instead of user's saved values.

**Steps to Reproduce**:
1. Complete fresh wizard (Page 1 → Page 2) with custom expense values
2. Note expense total on Page 2 (should be different from 150,932)
3. Dashboard shows correct values matching Page 2 ✅
4. Refresh browser → Dashboard still correct ✅  
5. Navigate back to Page 2 → Expenses reset to 150,932 ❌

**Expected Behavior**: 
Page 2 should maintain user's saved expense values after refresh, just like Dashboard does.

**Root Cause Analysis**:
- Dashboard persistence: Working ✅ (loads from app state)
- Wizard persistence: Partial failure ❌ (saves but doesn't reload correctly)
- Likely issue in `WizardInputs.tsx` expense calculation/loading logic

**Impact**: 
- Confuses users about data persistence
- Page 2 and Dashboard show different values after refresh
- Breaks bidirectional data flow expectation

**Next Steps**:
- [ ] Debug wizard answer loading in `WizardInputs.tsx` 
- [ ] Check if `calculatedTotalExpenses` is being applied correctly
- [ ] Verify expense field values are restored from saved wizard answers
- [ ] Test expense scaling logic vs saved user modifications

---

## ✅ Fixed Issues (Current Branch)

### KPI Thresholds & Strategic Calculation ✅
- Fixed Cost/Return to use strategic calculation (74.5-77.5% of revenue per return)
- Fixed Net Margin ranges to mirror expense KPI logic (22.5-25.5% green)
- Added expense percentages to Dashboard Expense Breakdown
- Updated KPI thresholds in persistence layer

### Data Persistence Core ✅  
- Fixed wizard answers not loading on app startup after completion
- Dashboard values now persist through page refresh
- Bidirectional data flow working (Dashboard ↔ Wizard)

### Debugging Infrastructure ✅
- Added KPI Strategic Analysis to Debug Sidebar
- Integrated professional debugging instead of console.log statements
- Enhanced debugging visibility for troubleshooting

---

**Branch Ready for Merge**: ✅  
**Major Features Working**: ✅  
**Known Issues Documented**: ✅  
**Next Branch Priorities**: Page 2 persistence debugging
