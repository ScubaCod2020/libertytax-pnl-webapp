# Known Issues - P&L Budget & Forecast App

## 🚨 Active Bugs (Next Branch Priority)

### Angular compile errors: unknown elements after component moves (2025-09-21)

**Bug ID**: `ng-unknown-elements-after-move`  
**Severity**: High  
**Status**: New

**Description**:
Angular dev server fails to compile with NG8001 for `app-header`, `app-footer`, `app-form-toolbar`, and `app-kpi-card` after file moves and dashboard refactors. Likely missing declarations/imports in the root module or updated standalone component imports.

**Observed Errors**:

- `NG8001: 'app-header' is not a known element`
- `NG8001: 'app-footer' is not a known element`
- `NG8001: 'app-form-toolbar' is not a known element`
- `NG8001: 'app-kpi-card' is not a known element`

**Hypothesis**:

- Components were relocated; module/standalone imports were not updated in `app.routes.ts` or `AppComponent`/page components. Some dashboard files removed; templates still reference them.

**Next Steps**:

- [ ] Verify each referenced component exists and is exported (standalone: `standalone: true` with `imports` wired; NgModule: declared and exported).
- [ ] Update `app.routes.ts` to point to new pages and remove stale routes/usages.
- [ ] Replace or remove stale tag usages in `app.component.html` and dashboard page if components were intentionally deleted.
- [ ] Run `npm run dev:angular` to re-test.

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

### Husky hooks not running due to misconfigured core.hooksPath and deprecated shim (2025-09-21)

**Bug ID**: `husky-hooks-not-running`  
**Severity**: Medium  
**Status**: Fixed

**Description**:
Git was configured with `core.hooksPath=.husky/_` causing Git to ignore real hooks in `.husky/` and run only helper stubs. The `pre-commit` hook used a deprecated `husky.sh` shim that prints a deprecation warning and will fail in v10.

**Resolution**:

- Set hooks path to `.husky` (`git config core.hooksPath .husky`).
- Recreated `pre-commit` in Husky v9 format without sourcing `husky.sh`:
  - `npx --no-install husky set .husky/pre-commit "npx --no-install lint-staged"`
- Added `lint-staged` config to `package.json`.
- Enforced LF endings for hooks via `.gitattributes`.

**Verification**:

- `git commit --allow-empty -m "test hooks"` triggers `lint-staged`.

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
