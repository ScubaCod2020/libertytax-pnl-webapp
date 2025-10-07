# Edge Case & Support-Ready Testing Strategy

## 🎯 Overview

This document covers the "fringe" testing scenarios that support agents encounter and real users experience. These tests go beyond basic functionality to ensure robustness across all edge cases, device configurations, and user behaviors.

---

## 📱 PART 1: Device & Browser Configuration Testing

### 1.1 Mobile Browser Configurations

```
REQUIRED TEST DEVICES/SIZES:
□ iPhone SE (375x667) - Smallest common mobile
□ iPhone 12 Pro (390x844) - Standard mobile
□ iPhone 12 Pro Max (428x926) - Large mobile
□ Samsung Galaxy S21 (360x800) - Android standard
□ iPad (768x1024) - Tablet portrait
□ iPad Pro (1024x1366) - Large tablet
□ Desktop 1920x1080 - Standard desktop
□ Desktop 4K (3840x2160) - High-res desktop
□ Ultrawide (3440x1440) - Wide desktop

BROWSER MATRIX:
□ Chrome Mobile (iOS/Android)
□ Safari Mobile (iOS)
□ Firefox Mobile (Android)
□ Samsung Internet (Android)
□ Chrome Desktop (Windows/Mac/Linux)
□ Firefox Desktop (Windows/Mac/Linux)
□ Safari Desktop (Mac)
□ Edge Desktop (Windows)
```

### 1.2 Responsive Design Critical Tests

```
MOBILE LAYOUT TESTS:
□ Debug panel doesn't break mobile layout
□ Wizard forms remain usable on small screens
□ Dual-entry fields stack properly on mobile
□ All buttons remain tappable (min 44px touch targets)
□ Dropdown menus don't extend off-screen
□ Keyboard doesn't obscure input fields
□ Horizontal scrolling never required
□ Text remains readable at mobile zoom levels

TABLET LAYOUT TESTS:
□ Dashboard layout adapts properly to tablet width
□ Debug panel sidebar works on tablet
□ Touch interactions work smoothly
□ Portrait/landscape orientation both work

DESKTOP SCALING TESTS:
□ App works at 75% browser zoom
□ App works at 125% browser zoom
□ App works at 150% browser zoom (accessibility)
□ High-DPI displays render correctly
```

---

## 🔽 PART 2: Comprehensive Dropdown Testing

### 2.1 Every Dropdown Option Must Be Tested

#### Region Dropdown (2 options)

```
□ "United States" → Verify TaxRush fields hide
□ "Canada" → Verify TaxRush fields show
□ Switch US→CA→US rapidly → Verify no errors
□ Default selection behavior on first load
```

#### Store Type Dropdown (3 states)

```
□ Default empty state → "Select store type..."
□ "New Store (First year)" → Verify messaging changes
□ "Existing Store" → Verify performance sections appear
□ Switch between options rapidly → Verify no errors
□ Clear selection (if possible) → Verify graceful handling
```

#### Growth Percentage Dropdown (9 options)

```
□ "-20% (Decline)" → Verify calculations
□ "-10% (Slight decline)" → Verify calculations
□ "0% (Same as last year)" → Verify calculations
□ "+5% (Conservative growth)" → Verify calculations
□ "+10% (Moderate growth)" → Verify calculations
□ "+15% (Strong growth)" → Verify calculations
□ "+20% (Aggressive growth)" → Verify calculations
□ "+25% (Very aggressive)" → Verify calculations
□ "Custom percentage..." → Verify custom input appears
□ Switch between all options rapidly → Verify no errors
□ Select custom, enter value, switch back → Verify behavior
```

#### Scenario Selector Dropdown (4 options)

```
□ "Custom" → Verify no preset applied
□ "Good" → Verify all preset values applied correctly
□ "Better" → Verify all preset values applied correctly
□ "Best" → Verify all preset values applied correctly
□ Switch between all presets rapidly → Verify performance
□ Custom→Good→Custom → Verify data preservation
```

### 2.2 Dropdown Edge Cases

```
INTERACTION EDGE CASES:
□ Click dropdown then click elsewhere → Verify closes properly
□ Use keyboard navigation (up/down arrows) → Verify works
□ Press Escape key when dropdown open → Verify closes
□ Tab navigation through dropdowns → Verify accessibility
□ Screen reader compatibility → Verify announced properly
□ Touch/tap behavior on mobile → Verify responsive
□ Dropdown overlapping screen edges → Verify repositioning
```

---

## 🔢 PART 3: Field Override & Validation Testing

### 3.1 Every Override Field Must Be Tested

#### Wizard Page 1 Override Fields (5 fields)

```
PROJECTED TAX PREP INCOME:
□ Default calculated value displays correctly
□ User can edit/override calculated value
□ Override value persists when switching pages
□ Invalid inputs (negative, non-numeric) rejected
□ Extreme values (999,999,999) handled gracefully
□ Empty field behavior (does it revert to calculated?)

PROJECTED AVERAGE NET FEE:
□ Default calculated value displays correctly
□ User can edit/override with decimal values ($125.50)
□ Override affects downstream calculations
□ Invalid inputs rejected appropriately

PROJECTED TAX PREP RETURNS:
□ Default calculated value displays correctly
□ User can edit/override (whole numbers only)
□ Override affects cost-per-return calculations
□ Invalid inputs (decimals, negative) rejected

PROJECTED TAXRUSH RETURNS (CA only):
□ Shows/hides based on region correctly
□ Default calculated value displays correctly
□ User can edit/override
□ Override affects TaxRush income calculations

PROJECTED TOTAL EXPENSES:
□ Default calculated value displays correctly
□ User can edit/override
□ Override affects net income calculations
□ Large values handled properly
```

#### Dual-Entry Override Testing (34 field pairs)

```
FOR EACH OF 17 EXPENSE CATEGORIES:
□ Enter percentage → Dollar calculates correctly
□ Enter dollar → Percentage calculates correctly
□ Enter 0% → $0 displays
□ Enter 0$ → 0% displays
□ Enter 100% → Full base amount displays
□ Enter maximum dollar amount → Percentage calculates
□ Clear field → Reverts to default or stays empty
□ Tab between percentage and dollar → Both update
□ Rapid switching between % and $ → No flickering/oscillation
□ Copy/paste values → Handled correctly
□ Decimal precision → Rounds appropriately
```

### 3.2 Field Validation Thresholds

```
NUMERIC FIELD LIMITS:
□ Percentage fields: 0% to 100% (reject >100%)
□ Dollar fields: $0 to $999,999,999 (reasonable max)
□ Return counts: 1 to 99,999 (reasonable business range)
□ Growth percentages: -99% to +999% (extreme but possible)
□ Negative values: Rejected where inappropriate
□ Decimal precision: Handled consistently (2 decimal places for $, 1 for %)

ERROR MESSAGE TESTING:
□ Invalid percentage → "Must be between 0% and 100%"
□ Invalid dollar amount → "Must be a positive number"
□ Invalid return count → "Must be a whole number"
□ Non-numeric input → "Please enter a valid number"
□ Empty required field → "This field is required"
□ Field-specific error messages display correctly
□ Error messages clear when valid input entered
```

---

## 📊 PART 4: Data Threshold & Risk Assessment

### 4.1 Business Logic Risk Scenarios

```
HIGH-RISK DATA COMBINATIONS:
□ Salaries >40% of gross fees → Should trigger warning
□ Rent >30% of gross fees → Should trigger warning
□ Total expenses >90% of gross fees → Should trigger warning
□ Net margin <5% → Should trigger warning
□ Cost per return >$150 → Should trigger warning
□ Negative net income → Should be handled gracefully
□ Zero returns but positive revenue → Mathematical error
□ Zero revenue but positive expenses → Unrealistic scenario

EXTREME VALUE TESTING:
□ $1 ANF, 999,999 returns → Very low fee, high volume
□ $999 ANF, 1 return → Very high fee, low volume
□ -50% growth → Severe business decline
□ +500% growth → Unrealistic but possible expansion
□ All expenses at 100% → Total business loss scenario
□ Single expense >100% of revenue → Mathematical impossibility

CALCULATION EDGE CASES:
□ Division by zero scenarios (0 returns, 0 revenue)
□ Floating point precision issues (0.1 + 0.2 = 0.30000000001)
□ Very large numbers causing overflow
□ Very small numbers causing underflow
□ Percentage calculations with tiny bases
```

### 4.2 Data Consistency Risk Assessment

```
CROSS-PAGE DATA INTEGRITY:
□ Change Page 1 data → Go to Page 2 → Verify updates
□ Change Page 2 data → Go back to Page 1 → Verify preservation
□ Complete wizard → Change dashboard → Re-open wizard → Verify sync
□ Apply preset → Modify fields → Apply different preset → Verify override
□ Regional switch with data → Verify TaxRush data preservation/clearing

PERSISTENCE RISK SCENARIOS:
□ Enter data → Refresh page → Verify persistence
□ Enter data → Close browser → Reopen → Verify persistence
□ Enter data → Clear cookies → Verify clean slate
□ Enter data → Change browser → Verify isolation
□ Multiple tabs → Change data in one → Verify other tab updates
□ LocalStorage full → Verify graceful handling
□ LocalStorage disabled → Verify fallback behavior
```

---

## 🌐 PART 5: Support Agent Diagnostic Scenarios

### 5.1 Common User Issues

```
"MY CALCULATIONS ARE WRONG":
□ Debug panel → Calculations tab → Show intermediate values
□ Debug panel → State tab → Show all input values
□ Console log all calculation steps for support review
□ Export data button for support ticket attachment

"THE APP WON'T SAVE MY DATA":
□ Debug panel → Storage tab → Show persistence status
□ LocalStorage size and quota information
□ Browser compatibility check (localStorage supported?)
□ Network connectivity check (for future cloud sync)

"FIELDS ARE MISSING/BROKEN":
□ Region-specific field visibility (TaxRush for CA only)
□ Store type conditional fields (existing vs new)
□ Browser compatibility issues (old browser versions)
□ JavaScript errors preventing field rendering

"THE APP IS SLOW/BROKEN":
□ Debug panel → Performance tab → Show metrics
□ Console errors and warnings
□ Network requests and timing
□ Memory usage and potential leaks
```

### 5.2 Diagnostic Information Collection

```
AUTOMATIC DIAGNOSTIC DATA:
□ Browser version and user agent
□ Screen resolution and viewport size
□ JavaScript errors and stack traces
□ LocalStorage size and contents
□ Performance timing data
□ Current app state snapshot
□ Calculation intermediate values
□ User interaction timeline

SUPPORT-FRIENDLY FEATURES:
□ "Export Debug Info" button → JSON file for support
□ "Copy Support Code" → Unique session identifier
□ "Reset Everything" → Clean slate for troubleshooting
□ Console logging with timestamps
□ Error boundary catching and reporting
```

---

## 📱 PART 6: Mobile-Specific Testing

### 6.1 Mobile Interaction Patterns

```
TOUCH INTERACTIONS:
□ Tap targets minimum 44px (Apple guidelines)
□ Double-tap behavior (zoom vs. action)
□ Long press behavior (context menus)
□ Pinch-to-zoom behavior (should be disabled for app)
□ Swipe gestures (should not interfere with scrolling)
□ Touch and drag (for sliders if any)

MOBILE KEYBOARD TESTING:
□ Numeric keypad appears for number fields
□ Decimal keypad for currency fields
□ Keyboard doesn't obscure input fields
□ "Next" button navigates between fields
□ "Done" button closes keyboard properly
□ Auto-capitalization disabled for numeric fields

MOBILE PERFORMANCE:
□ App loads quickly on 3G connection
□ Smooth scrolling on older devices
□ Memory usage reasonable on low-RAM devices
□ Battery usage acceptable during extended use
□ Works offline (if applicable)
```

### 6.2 Mobile Layout Edge Cases

```
ORIENTATION CHANGES:
□ Portrait → Landscape → All elements visible
□ Landscape → Portrait → Layout reflows properly
□ Data preserved during orientation change
□ No layout breaking or content clipping

MOBILE BROWSER QUIRKS:
□ iOS Safari address bar hiding/showing
□ Android Chrome pull-to-refresh disabled
□ Mobile browser zoom controls
□ Full-screen mode compatibility
□ Home screen app icon (PWA features)
```

---

## 🔍 PART 7: Accessibility & Edge User Testing

### 7.1 Accessibility Requirements

```
SCREEN READER COMPATIBILITY:
□ All form fields have proper labels
□ Error messages announced properly
□ Navigation landmarks present
□ Focus management works correctly
□ Alt text for all meaningful images/icons

KEYBOARD NAVIGATION:
□ Tab order logical and complete
□ All interactive elements reachable
□ Escape key closes modals/dropdowns
□ Enter key activates buttons
□ Arrow keys navigate within components

VISUAL ACCESSIBILITY:
□ Color contrast meets WCAG AA standards
□ Text remains readable at 200% zoom
□ Focus indicators clearly visible
□ No information conveyed by color alone
□ Motion/animation can be disabled
```

### 7.2 Edge User Scenarios

```
POWER USERS:
□ Keyboard shortcuts work properly
□ Rapid data entry doesn't break calculations
□ Multiple preset applications in sequence
□ Debug panel power features function
□ Export/import functionality (future)

NOVICE USERS:
□ Clear error messages and guidance
□ Tooltips and help text available
□ Forgiving input validation
□ Easy recovery from mistakes
□ Intuitive navigation flow

INTERNATIONAL USERS:
□ Number formatting (commas vs periods)
□ Currency symbols and placement
□ Date formats (if applicable)
□ Right-to-left language support (future)
□ Timezone handling (if applicable)
```

---

## 🚨 PART 8: Failure Mode Testing

### 8.1 Graceful Degradation

```
JAVASCRIPT DISABLED:
□ Basic functionality still available
□ Clear message about JavaScript requirement
□ No broken interface elements

NETWORK ISSUES:
□ Offline functionality (localStorage only)
□ Slow network doesn't break app
□ Connection loss handled gracefully
□ Retry mechanisms work properly

BROWSER LIMITATIONS:
□ LocalStorage not available → Fallback behavior
□ Old browser versions → Compatibility warnings
□ Cookies disabled → Alternative storage
□ Pop-up blockers → Alternative UI patterns
```

### 8.2 Error Recovery Testing

```
CALCULATION ERRORS:
□ Division by zero → Display "N/A" or handle gracefully
□ Overflow/underflow → Cap at reasonable limits
□ Invalid intermediate results → Reset to defaults
□ Circular dependencies → Break gracefully

USER ERROR RECOVERY:
□ Accidental data clearing → Undo functionality
□ Wrong preset application → Easy revert
□ Invalid data entry → Clear guidance on fixes
□ Lost session data → Recovery suggestions
```

---

## ✅ TESTING EXECUTION CHECKLIST

### Phase 1: Automated Edge Case Testing

```bash
# Run existing automated tests
node scripts/regression-test.js

# Add edge case tests to script:
□ Test all dropdown options programmatically
□ Test field validation boundaries
□ Test calculation edge cases
□ Test data persistence scenarios
```

### Phase 2: Manual Device Testing (2-3 hours)

```
□ Test on 3+ mobile devices (iOS/Android)
□ Test on 2+ tablet sizes
□ Test on 2+ desktop resolutions
□ Test in 4+ different browsers
□ Test with keyboard-only navigation
□ Test with screen reader (basic)
```

### Phase 3: Support Scenario Testing (1 hour)

```
□ Simulate common user issues
□ Test diagnostic information collection
□ Verify error messages are helpful
□ Test recovery from error states
□ Verify debug panel provides useful info
```

### Phase 4: Performance & Load Testing (30 minutes)

```
□ Test with maximum realistic data
□ Test rapid user interactions
□ Monitor memory usage during extended use
□ Test on slower devices/connections
□ Verify no memory leaks
```

---

## 🎯 CRITICAL SUCCESS METRICS

**Deploy Only When:**

- All automated tests pass ✅
- App works on mobile devices ✅
- All dropdown options tested ✅
- Field validation works properly ✅
- Data persists correctly ✅
- Error messages are helpful ✅
- Performance is acceptable ✅
- No console errors ✅

**Red Flags (Stop Deployment):**

- App broken on mobile
- Any dropdown option causes errors
- Field validation allows invalid data
- Data loss occurs
- Calculations are wrong
- App unusable with keyboard only
- Major accessibility issues
- Performance unacceptable

This comprehensive edge case testing ensures your app works reliably for all users, in all scenarios, and provides support agents with the tools they need to help users effectively.
