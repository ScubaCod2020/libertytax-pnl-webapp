#!/usr/bin/env node

/**
 * 🔄 REAL-TIME FIELD MAPPING MONITOR
 * 
 * Browser console tool to monitor the specific field mapping and data flow issues
 * identified by the bidirectional validator. Watches for:
 * 
 * CRITICAL ISSUES TO MONITOR:
 * 1. expectedGrowthPct disappearing after wizard completion
 * 2. calculatedTotalExpenses not persisting through page reload
 * 3. Data flow failures during wizard → app state transitions
 * 4. Field mapping inconsistencies between components
 * 5. Bidirectional synchronization breaks
 */

console.log('🔄 REAL-TIME FIELD MAPPING MONITOR')
console.log('==================================\n')

const monitoringCode = `
console.log('🔄 LIBERTY TAX P&L - FIELD MAPPING MONITOR ACTIVATED');
console.log('=====================================================');

// Field mapping monitor system
window.FieldMappingMonitor = {
  // State tracking
  wizardState: {},
  appState: {},
  localStorageState: {},
  
  // Issue tracking
  fieldMappingIssues: [],
  dataFlowBreaks: [],
  syncFailures: [],
  
  // Critical fields to watch
  criticalFields: {
    'expectedGrowthPct': {
      description: 'Performance change percentage - critical for calculations',
      wizardField: 'expectedGrowthPct',
      appStateField: 'expectedGrowthPct', // ✅ FIXED - now properly mapped in AppState!
      sessionField: 'expectedGrowthPct',   // ✅ FIXED - now properly mapped in SessionState!
      shouldPersist: true,
      criticalLevel: 'HIGH'
    },
    'calculatedTotalExpenses': {
      description: 'Pre-calculated expense total from Page 2',
      wizardField: 'calculatedTotalExpenses',
      appStateField: 'calculatedTotalExpenses',
      sessionField: 'calculatedTotalExpenses', // ✅ FIXED - now properly mapped in SessionState!
      shouldPersist: true,
      criticalLevel: 'HIGH'
    },
    'otherIncome': {
      description: 'Additional revenue streams',
      wizardField: 'otherIncome',
      appStateField: 'otherIncome', 
      sessionField: 'otherIncome', // Actually exists, but conditional
      shouldPersist: true,
      criticalLevel: 'MEDIUM'
    },
    'hasOtherIncome': {
      description: 'Boolean flag for other income - controls otherIncome field',
      wizardField: 'hasOtherIncome',
      appStateField: null, // Wizard-only
      sessionField: null,   // Wizard-only
      shouldPersist: false,
      criticalLevel: 'LOW'
    },
    'handlesTaxRush': {
      description: 'Boolean flag for TaxRush - controls taxRushReturns field',
      wizardField: 'handlesTaxRush',
      appStateField: null, // Wizard-only
      sessionField: null,   // Wizard-only  
      shouldPersist: false,
      criticalLevel: 'LOW'
    },
    'region': {
      description: 'US or CA - affects calculations and UI',
      wizardField: 'region',
      appStateField: 'region',
      sessionField: 'region',
      shouldPersist: true,
      criticalLevel: 'HIGH'
    },
    'avgNetFee': {
      description: 'Average net fee per return',
      wizardField: 'avgNetFee',
      appStateField: 'avgNetFee',
      sessionField: 'avgNetFee',
      shouldPersist: true,
      criticalLevel: 'HIGH'
    },
    'taxPrepReturns': {
      description: 'Number of tax prep returns',
      wizardField: 'taxPrepReturns',
      appStateField: 'taxPrepReturns', 
      sessionField: 'taxPrepReturns',
      shouldPersist: true,
      criticalLevel: 'HIGH'
    }
  },
  
  // Initialize monitoring
  initialize() {
    this.log('✅ Field mapping monitor initialized', 'success');
    this.log('🎯 Monitoring critical data flow and field mapping issues', 'info');
    
    // Start periodic state monitoring
    this.startPeriodicMonitoring();
    
    // Monitor localStorage changes
    this.monitorLocalStorageChanges();
    
    // Monitor React state changes (if possible)
    this.attemptReactStateMonitoring();
    
    // Show current state
    this.captureCurrentState();
  },
  
  // Capture current state across all layers
  captureCurrentState() {
    this.log('📸 CAPTURING CURRENT STATE:', 'info');
    
    // Try to capture localStorage state
    try {
      const savedData = localStorage.getItem('libertytax-pnl-webapp-v1');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        this.localStorageState = {
          last: parsed.last || {},
          wizardAnswers: parsed.wizardAnswers || {}
        };
        this.log(\`💾 localStorage: \${Object.keys(this.localStorageState.last).length} fields in 'last', \${Object.keys(this.localStorageState.wizardAnswers).length} fields in 'wizardAnswers'\`, 'info');
      } else {
        this.log('💾 localStorage: No saved data found', 'warning');
      }
    } catch (error) {
      this.log(\`💾 localStorage: Error reading data - \${error.message}\`, 'error');
    }
    
    // Try to capture React app state (via DOM inspection)
    this.captureAppStateFromDOM();
    
    // Check field mapping integrity
    this.checkFieldMappingIntegrity();
  },
  
  // Try to capture app state from DOM elements
  captureAppStateFromDOM() {
    const domState = {};
    
    // Look for input fields that might contain app state values
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"], select');
    
    inputs.forEach(input => {
      const name = input.name || input.id || input.placeholder;
      const value = input.value;
      
      if (name && value && name.match(/(region|fee|returns|discount|income|rush|percentage|growth)/i)) {
        domState[name] = isNaN(value) ? value : parseFloat(value);
      }
    });
    
    if (Object.keys(domState).length > 0) {
      this.log(\`🏠 App State (DOM): \${Object.keys(domState).length} fields detected\`, 'info');
      this.appState = domState;
    } else {
      this.log('🏠 App State (DOM): No recognizable fields found', 'warning');
    }
  },
  
  // Check field mapping integrity
  checkFieldMappingIntegrity() {
    this.log('🔍 CHECKING FIELD MAPPING INTEGRITY:', 'info');
    
    const issues = [];
    
    Object.entries(this.criticalFields).forEach(([fieldName, fieldInfo]) => {
      const issue = this.validateFieldIntegrity(fieldName, fieldInfo);
      if (issue) {
        issues.push(issue);
      }
    });
    
    if (issues.length === 0) {
      this.log('✅ All critical fields have proper mapping integrity', 'success');
    } else {
      this.log(\`❌ Found \${issues.length} field mapping integrity issues:\`, 'error');
      issues.forEach(issue => {
        this.log(\`   • \${issue}\`, 'error');
        this.fieldMappingIssues.push({
          timestamp: new Date().toISOString(),
          issue: issue,
          type: 'FIELD_MAPPING_INTEGRITY'
        });
      });
    }
  },
  
  // Validate individual field integrity
  validateFieldIntegrity(fieldName, fieldInfo) {
    const wizardValue = this.localStorageState.wizardAnswers?.[fieldInfo.wizardField];
    const sessionValue = this.localStorageState.last?.[fieldInfo.sessionField];
    
    // Critical field missing from persistence
    if (fieldInfo.shouldPersist && fieldInfo.criticalLevel === 'HIGH' && !fieldInfo.sessionField) {
      return \`CRITICAL: \${fieldName} should persist but has no SessionState mapping\`;
    }
    
    // Critical field present in wizard but lost
    if (wizardValue !== undefined && fieldInfo.shouldPersist && sessionValue === undefined) {
      return \`DATA LOSS: \${fieldName} exists in wizard (\${wizardValue}) but missing from session state\`;
    }
    
    // Type mismatch
    if (wizardValue !== undefined && sessionValue !== undefined && typeof wizardValue !== typeof sessionValue) {
      return \`TYPE MISMATCH: \${fieldName} wizard type (\${typeof wizardValue}) != session type (\${typeof sessionValue})\`;
    }
    
    return null; // No issues
  },
  
  // Monitor localStorage changes in real-time
  monitorLocalStorageChanges() {
    const originalSetItem = localStorage.setItem;
    const self = this;
    
    localStorage.setItem = function(key, value) {
      if (key === 'libertytax-pnl-webapp-v1') {
        self.log('💾 localStorage UPDATE detected', 'info');
        
        try {
          const newData = JSON.parse(value);
          const oldData = self.localStorageState;
          
          self.compareStorageStates(oldData, newData);
          self.localStorageState = newData;
        } catch (error) {
          self.log(\`💾 localStorage: Error parsing new data - \${error.message}\`, 'error');
        }
      }
      
      return originalSetItem.apply(this, arguments);
    };
  },
  
  // Compare storage states to detect changes
  compareStorageStates(oldState, newState) {
    const changes = [];
    
    // Check for changes in critical fields
    Object.entries(this.criticalFields).forEach(([fieldName, fieldInfo]) => {
      if (fieldInfo.sessionField) {
        const oldValue = oldState.last?.[fieldInfo.sessionField];
        const newValue = newState.last?.[fieldInfo.sessionField];
        
        if (oldValue !== newValue) {
          changes.push(\`\${fieldName}: \${oldValue} → \${newValue}\`);
        }
      }
    });
    
    if (changes.length > 0) {
      this.log('📊 Storage state changes detected:', 'info');
      changes.forEach(change => {
        this.log(\`   • \${change}\`, 'info');
      });
    }
  },
  
  // Attempt to monitor React state changes
  attemptReactStateMonitoring() {
    // Try to find React components and monitor their state
    // This is a simplified approach - real implementation would need React DevTools API
    
    const reactRoots = document.querySelectorAll('[data-reactroot], #root, .App');
    
    if (reactRoots.length > 0) {
      this.log('⚛️  React components detected - limited state monitoring available', 'info');
      
      // Monitor input changes as a proxy for React state changes
      document.addEventListener('input', (e) => {
        if (e.target.name || e.target.id) {
          this.handlePotentialStateChange(e.target.name || e.target.id, e.target.value);
        }
      });
    } else {
      this.log('⚛️  No React components detected', 'warning');
    }
  },
  
  // Handle potential React state changes
  handlePotentialStateChange(fieldName, value) {
    // Check if this field maps to any critical fields
    const criticalField = Object.entries(this.criticalFields).find(([key, info]) => 
      info.appStateField === fieldName || info.wizardField === fieldName
    );
    
    if (criticalField) {
      const [fieldKey, fieldInfo] = criticalField;
      this.log(\`🔄 Potential \${fieldKey} change: \${value}\`, 'info');
      
      // Track this change
      this.appState[fieldName] = isNaN(value) ? value : parseFloat(value);
      
      // Check for sync issues
      this.checkSynchronizationIssue(fieldKey, fieldInfo, value);
    }
  },
  
  // Check for synchronization issues
  checkSynchronizationIssue(fieldKey, fieldInfo, newValue) {
    // If this field should persist but has no session mapping, warn about data loss
    if (fieldInfo.shouldPersist && !fieldInfo.sessionField) {
      this.log(\`⚠️  SYNC ISSUE: \${fieldKey} changed to \${newValue} but will not persist (no session mapping)\`, 'warning');
      
      this.syncFailures.push({
        timestamp: new Date().toISOString(),
        field: fieldKey,
        value: newValue,
        issue: 'NO_PERSISTENCE_PATH',
        severity: fieldInfo.criticalLevel
      });
    }
  },
  
  // Start periodic monitoring
  startPeriodicMonitoring() {
    setInterval(() => {
      this.periodicCheck();
    }, 5000); // Check every 5 seconds
  },
  
  // Periodic comprehensive check
  periodicCheck() {
    this.captureCurrentState();
    
    // Check for any new critical field mapping issues
    this.detectCriticalDataLoss();
  },
  
  // Detect critical data loss scenarios
  detectCriticalDataLoss() {
    const criticalLosses = [];
    
    // ✅ FIXED: expectedGrowthPct is now properly mapped - check if it's actually preserved
    const wizardGrowthPct = this.localStorageState.wizardAnswers?.expectedGrowthPct;
    const sessionGrowthPct = this.localStorageState.last?.expectedGrowthPct;
    if (wizardGrowthPct !== undefined && sessionGrowthPct === undefined) {
      // This should no longer happen with our fixes, but keep monitoring
      criticalLosses.push({
        field: 'expectedGrowthPct',
        value: wizardGrowthPct,
        impact: 'Performance change calculations will be incorrect - FIX MAY HAVE FAILED!',
        severity: 'HIGH'
      });
    }
    
    // ✅ FIXED: calculatedTotalExpenses is now properly mapped - check if it's actually preserved  
    const wizardExpenses = this.localStorageState.wizardAnswers?.calculatedTotalExpenses;
    const sessionExpenses = this.localStorageState.last?.calculatedTotalExpenses;
    if (wizardExpenses !== undefined && sessionExpenses === undefined) {
      // This should no longer happen with our fixes, but keep monitoring
      criticalLosses.push({
        field: 'calculatedTotalExpenses',
        value: wizardExpenses,
        impact: 'Page 2 expense calculations will be lost on page reload - FIX MAY HAVE FAILED!',
        severity: 'HIGH'
      });
    }
    
    if (criticalLosses.length > 0) {
      this.log('🚨 CRITICAL DATA LOSS DETECTED:', 'error');
      criticalLosses.forEach(loss => {
        this.log(\`   • \${loss.field}: \${loss.value} - \${loss.impact}\`, 'error');
      });
    } else if (wizardGrowthPct !== undefined || wizardExpenses !== undefined) {
      // ✅ SUCCESS: Data is being preserved as expected!
      this.log('✅ SUCCESS: All critical fields are being preserved correctly!', 'success');
      if (wizardGrowthPct !== undefined) {
        this.log(\`   • expectedGrowthPct: \${wizardGrowthPct} → \${sessionGrowthPct} ✅\`, 'success');
      }
      if (wizardExpenses !== undefined) {
        this.log(\`   • calculatedTotalExpenses: \${wizardExpenses} → \${sessionExpenses} ✅\`, 'success');
      }
    }
  },
  
  // Generate real-time report
  generateReport() {
    console.log('📊 FIELD MAPPING MONITOR REPORT');
    console.log('===============================');
    
    console.log('\\n🗺️  CURRENT STATE SUMMARY:');
    console.log(\`   localStorage fields: \${Object.keys(this.localStorageState.last || {}).length} (last) + \${Object.keys(this.localStorageState.wizardAnswers || {}).length} (wizard)\`);
    console.log(\`   App state fields: \${Object.keys(this.appState).length}\`);
    console.log(\`   Field mapping issues: \${this.fieldMappingIssues.length}\`);
    console.log(\`   Sync failures: \${this.syncFailures.length}\`);
    
    console.log('\\n🔍 CRITICAL FIELD STATUS:');
    Object.entries(this.criticalFields).forEach(([fieldName, fieldInfo]) => {
      const wizardValue = this.localStorageState.wizardAnswers?.[fieldInfo.wizardField];
      const sessionValue = this.localStorageState.last?.[fieldInfo.sessionField];
      const appValue = this.appState[fieldInfo.appStateField];
      
      console.log(\`   \${fieldName} (\${fieldInfo.criticalLevel}):\`);
      console.log(\`     Wizard: \${wizardValue ?? 'missing'}\`);
      console.log(\`     App: \${appValue ?? 'missing'}\`);
      console.log(\`     Session: \${sessionValue ?? 'missing'}\`);
      
      if (fieldInfo.shouldPersist && !fieldInfo.sessionField) {
        console.log(\`     ⚠️  WARNING: Should persist but no session mapping!\`);
      }
    });
    
    if (this.fieldMappingIssues.length > 0) {
      console.log('\\n🚨 FIELD MAPPING ISSUES:');
      this.fieldMappingIssues.forEach((issue, idx) => {
        console.log(\`   \${idx + 1}. \${issue.issue} (at \${issue.timestamp})\`);
      });
    }
    
    if (this.syncFailures.length > 0) {
      console.log('\\n🔄 SYNCHRONIZATION FAILURES:');
      this.syncFailures.forEach((failure, idx) => {
        console.log(\`   \${idx + 1}. \${failure.field}: \${failure.issue} (severity: \${failure.severity})\`);
      });
    }
  },
  
  // Logging with timestamps and colors
  log(message, level = 'info') {
    const colors = {
      info: '#3b82f6',      // Blue
      success: '#059669',   // Green  
      warning: '#f59e0b',   // Orange
      error: '#dc2626'      // Red
    };
    
    const color = colors[level] || colors.info;
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(
      \`%c[FIELD-MONITOR \${timestamp}] \${message}\`,
      \`color: \${color}; font-weight: \${level === 'error' ? 'bold' : 'normal'};\`
    );
  },
  
  // Manual field integrity check
  checkIntegrity() {
    this.captureCurrentState();
    this.checkFieldMappingIntegrity();
    this.detectCriticalDataLoss();
  }
};

// Initialize monitoring
window.FieldMappingMonitor.initialize();

// Add helper commands
window.checkFieldMapping = () => window.FieldMappingMonitor.checkIntegrity();
window.fieldMappingReport = () => window.FieldMappingMonitor.generateReport();

console.log('\\n🔄 FIELD MAPPING COMMANDS:');
console.log('   checkFieldMapping() - Check current field mapping integrity');
console.log('   fieldMappingReport() - Generate comprehensive monitoring report');

console.log('\\n📋 WATCH FOR THESE CRITICAL ISSUES:');
console.log('   • expectedGrowthPct disappearing after wizard completion');
console.log('   • calculatedTotalExpenses not persisting through page reload');
console.log('   • Field mapping integrity violations');
console.log('   • Data synchronization failures between components');
console.log('\\n🎯 Navigate through your app and watch for these data flow issues!');
`;

console.log('📋 REAL-TIME FIELD MAPPING MONITORING CODE')
console.log('===========================================')
console.log('Copy and paste this code into your browser console:\n')

console.log('```javascript')
console.log(monitoringCode)
console.log('```\n')

console.log('🧪 HOW TO USE THE FIELD MAPPING MONITOR:')
console.log('========================================')
console.log('1. Open your Liberty Tax P&L webapp')
console.log('2. Open Developer Tools (F12) → Console')
console.log('3. Paste the monitoring code above and press Enter')
console.log('4. Navigate through the app normally:')
console.log('   • Start/complete the wizard')
console.log('   • Move between pages')
console.log('   • Change values in forms')
console.log('   • Refresh the page')
console.log('5. Watch for real-time field mapping issues')

console.log('\n🎯 SPECIFIC SCENARIOS TO TEST:')
console.log('==============================')
console.log('📋 Critical Data Loss Test:')
console.log('   1. Complete wizard with performance change (e.g., +10%)')
console.log('   2. Navigate to dashboard')
console.log('   3. Refresh page')
console.log('   4. Watch for "expectedGrowthPct disappearing" warnings')

console.log('\n📋 Expense Calculation Persistence Test:')
console.log('   1. Complete wizard through Page 2 (expense calculations)')
console.log('   2. Navigate to dashboard')
console.log('   3. Refresh page')
console.log('   4. Watch for "calculatedTotalExpenses not persisting" warnings')

console.log('\n📋 Region Persistence Test:')
console.log('   1. Change region from US to CA (or vice versa)')
console.log('   2. Navigate between wizard pages')
console.log('   3. Refresh page')
console.log('   4. Watch for region synchronization issues')

console.log('\n🔍 WHAT THE MONITOR SHOWS:')
console.log('==========================')
console.log('✅ SUCCESS INDICATORS:')
console.log('   • "All critical fields have proper mapping integrity"')
console.log('   • localStorage updates tracked successfully')
console.log('   • No critical data loss detected')

console.log('\n❌ PROBLEM INDICATORS:')
console.log('   • "CRITICAL DATA LOSS DETECTED"')
console.log('   • "Field should persist but has no SessionState mapping"')
console.log('   • "SYNC ISSUE: field changed but will not persist"')
console.log('   • "Field mapping integrity issues found"')

console.log('\n💡 DEBUGGING COMMANDS:')
console.log('======================')
console.log('Use these in the browser console after pasting the monitor:')
console.log('• checkFieldMapping() - Manual integrity check')
console.log('• fieldMappingReport() - Comprehensive status report')

console.log('\n✨ Real-time field mapping monitor ready!')
console.log('📊 This will help you see exactly when and where data flow breaks occur')
