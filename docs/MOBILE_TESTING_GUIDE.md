# Mobile & Support-Ready Testing Guide

## 📱 Quick Mobile Testing Protocol

### Step 1: Browser Dev Tools Testing (5 minutes)
```
Chrome DevTools Device Emulation:
1. Press F12 → Click device icon
2. Test these specific sizes:
   □ iPhone SE (375x667) - Smallest target
   □ iPhone 12 Pro (390x844) - Standard mobile  
   □ iPad (768x1024) - Tablet size
3. For each size, verify:
   □ All buttons tappable (not too small)
   □ Debug panel doesn't break layout
   □ Wizard forms remain usable
   □ Dual-entry fields stack properly
   □ No horizontal scrolling needed
```

### Step 2: Actual Device Testing (10 minutes)
```
Test on Real Devices:
□ iPhone (any model) - Safari & Chrome
□ Android phone - Chrome & Samsung Internet
□ iPad - Safari

Critical Mobile Tests:
□ Touch all buttons → Verify responsive
□ Fill out wizard → Verify keyboard behavior
□ Open debug panel → Verify doesn't break layout
□ Switch orientations → Verify layout adapts
□ Zoom in/out → Verify remains usable
```

---

## 🔍 Support Agent Diagnostic Tools

### Built-in Diagnostic Features
```
Debug Panel → Storage Tab:
□ Shows localStorage size and contents
□ Displays session persistence status
□ "Dump Storage" button for support tickets

Debug Panel → Calculations Tab:
□ Shows all intermediate calculation values
□ Displays calculation bases for dual-entry
□ Reveals KPI threshold logic

Debug Panel → State Tab:
□ Shows complete app state snapshot
□ Reveals all user input values
□ Displays wizard progress and data

Debug Panel → Performance Tab:
□ Shows browser and device info
□ Displays memory usage metrics
□ Shows DOM complexity stats
```

### Support Troubleshooting Workflow
```
When User Reports Issue:
1. Ask user to open Debug Panel (footer button)
2. Have them click "Copy JSON" button
3. User pastes JSON into support ticket
4. Support agent can see:
   - All user input values
   - Current calculation results
   - Browser/device information
   - Error states (if any)
   - Session persistence status
```

---

## ⚠️ Common Mobile Issues & Solutions

### Issue: "App doesn't work on my phone"
```
Diagnostic Steps:
□ Check browser version (need modern browser)
□ Verify JavaScript enabled
□ Test in different mobile browser
□ Check if localStorage disabled/full
□ Verify network connectivity

Common Fixes:
□ Update browser to latest version
□ Clear browser cache and cookies
□ Try Chrome mobile if using other browser
□ Restart browser/device
```

### Issue: "Buttons are too small to tap"
```
Diagnostic Steps:
□ Check device screen size and resolution
□ Verify browser zoom level
□ Test in landscape orientation
□ Check accessibility settings

Common Fixes:
□ Use landscape mode for better spacing
□ Increase browser zoom to 125%
□ Use stylus or capacitive pen
□ Switch to tablet/desktop if available
```

### Issue: "Keyboard covers input fields"
```
Diagnostic Steps:
□ Test different mobile browsers
□ Check device virtual keyboard settings
□ Verify screen orientation
□ Test scrolling behavior

Common Fixes:
□ Scroll manually to see field
□ Use landscape orientation
□ Try different keyboard app
□ Use "Next" button to navigate fields
```

### Issue: "Calculations seem wrong"
```
Diagnostic Steps:
□ Open Debug Panel → Calculations tab
□ Verify all input values in State tab
□ Check for regional differences (US vs CA)
□ Compare with automated test results

Common Fixes:
□ Verify TaxRush fields for Canada
□ Check growth percentage applied correctly
□ Confirm dual-entry sync working
□ Reset to defaults and re-enter data
```

---

## 🌐 Browser Compatibility Matrix

### Fully Supported (Primary Targets)
```
□ Chrome 90+ (Desktop/Mobile)
□ Safari 14+ (Desktop/Mobile) 
□ Firefox 88+ (Desktop/Mobile)
□ Edge 90+ (Desktop)
```

### Limited Support (Secondary Targets)
```
□ Samsung Internet 14+
□ Chrome Mobile (older versions)
□ Safari Mobile (older versions)
```

### Not Supported (Known Issues)
```
❌ Internet Explorer (all versions)
❌ Chrome < 80
❌ Safari < 13
❌ Browsers with JavaScript disabled
```

---

## 📊 Performance Benchmarks

### Acceptable Performance Targets
```
Mobile Devices:
□ Initial load: < 5 seconds on 3G
□ Button response: < 300ms
□ Calculation updates: < 500ms
□ Wizard transitions: < 200ms
□ Debug panel open: < 400ms

Desktop/Tablet:
□ Initial load: < 3 seconds
□ Button response: < 100ms
□ Calculation updates: < 200ms
□ Wizard transitions: < 100ms
□ Debug panel open: < 200ms
```

### Performance Red Flags
```
❌ Any interaction > 1 second
❌ Visible layout shifts during load
❌ Janky scrolling or animations
❌ Memory usage > 100MB
❌ CPU usage consistently high
```

---

## 🧪 Quick Validation Tests

### 30-Second Mobile Check
```
1. Open app on mobile device
2. Tap "Start Wizard" button
3. Select region and store type
4. Enter some test numbers
5. Proceed to next page
6. Verify dual-entry works
7. Complete wizard
8. Open debug panel
9. Change a threshold
10. Verify dashboard updates

✅ If all steps work smoothly → Mobile OK
❌ If any step fails/slow → Needs investigation
```

### 60-Second Support Readiness Check
```
1. Open debug panel
2. Click each tab (Storage, Calc, State, Perf, Thresholds)
3. Verify all show relevant data
4. Click "Copy JSON" button
5. Paste into text editor → Verify readable
6. Click "Save Now" → Verify no errors
7. Refresh page → Verify data persists
8. Click "Clear Storage" → Verify resets
9. Enter new data → Verify calculations update
10. Apply preset → Verify all fields change

✅ If all diagnostic tools work → Support Ready
❌ If any tool broken → Fix before deployment
```

---

## 🚨 Pre-Deployment Mobile Checklist

### Critical Mobile Tests (Must Pass)
```
□ App loads on iPhone Safari
□ App loads on Android Chrome
□ All buttons respond to touch
□ Wizard can be completed on mobile
□ Debug panel opens without breaking layout
□ Data persists across page refresh
□ No console errors on mobile
□ Performance acceptable on 3G
```

### Support Readiness Tests (Must Pass)
```
□ Debug panel provides useful diagnostic info
□ "Copy JSON" button works for support tickets
□ Error messages are clear and helpful
□ Common issues have clear resolution steps
□ Performance metrics available for troubleshooting
□ All edge cases handled gracefully
```

### Nice-to-Have Tests
```
□ Works in landscape orientation
□ Supports browser zoom 75%-150%
□ Accessible with screen readers
□ Works in incognito/private mode
□ Handles slow network connections
□ Graceful offline behavior
```

---

## 📞 Support Script Templates

### "App Not Working" Support Script
```
Hi! I can help troubleshoot that. Let's gather some diagnostic info:

1. What device and browser are you using?
2. Can you open the app and click the debug button in the bottom right?
3. In the debug panel, click "State" tab - do you see your data there?
4. Click "Copy JSON" and paste it into this chat/email
5. Are you seeing any error messages?

Based on the diagnostic info, I can help identify the specific issue.
```

### "Calculations Wrong" Support Script
```
Let's verify your calculations together:

1. Open the debug panel (button in bottom right)
2. Click "Calculations" tab
3. This shows all the intermediate calculation steps
4. Click "State" tab to see all your input values
5. Can you copy and paste both sections?

I'll compare with our test scenarios to identify any discrepancies.
```

---

This guide ensures your app works reliably across all mobile scenarios and gives support agents the tools they need to help users effectively!
