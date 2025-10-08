#!/usr/bin/env node

/**
 * 🔍 REAL-TIME STATE MONITORING TOOL
 * 
 * This script generates JavaScript code that you can paste into the browser console
 * while using the app to monitor state changes in real-time and catch persistence issues.
 * 
 * Usage:
 * 1. Run this script to generate monitoring code
 * 2. Copy the generated code
 * 3. Open the Liberty Tax P&L webapp in browser
 * 4. Open Developer Tools (F12) > Console
 * 5. Paste and run the monitoring code
 * 6. Use the app normally - the monitor will log all state changes
 */

console.log('🔍 REAL-TIME STATE MONITORING TOOL')
console.log('===================================\n')

const monitoringCode = `
console.log('🔍 LIBERTY TAX P&L - REAL-TIME STATE MONITOR ACTIVATED');
console.log('=====================================================');

// Create state monitoring system
window.LibertyTaxStateMonitor = {
  history: [],
  watchers: [],
  
  // Log state changes with detailed info
  logStateChange(layer, field, oldValue, newValue, source, timestamp) {
    const change = {
      timestamp: timestamp || new Date().toISOString(),
      layer,
      field, 
      oldValue,
      newValue,
      source,
      stackTrace: new Error().stack.split('\\n').slice(2, 6).join('\\n')
    };
    
    this.history.push(change);
    
    // Color coding for different layers
    const colors = {
      'App State': '#2563eb',      // Blue
      'Wizard State': '#059669',   // Green  
      'localStorage': '#dc2626',   // Red
      'Component': '#7c2d12'       // Brown
    };
    
    const color = colors[layer] || '#6b7280';
    
    console.log(
      '%c🔍 STATE CHANGE DETECTED',
      'background: #f3f4f6; color: #1f2937; padding: 2px 8px; border-radius: 3px; font-weight: bold;'
    );
    console.log(
      \`%c\${layer}: \${field}\`, 
      \`color: \${color}; font-weight: bold;\`
    );
    console.log(\`   \${oldValue} → \${newValue} (from \${source})\`);
    
    // Alert on critical field changes
    if (['region', 'avgNetFee', 'taxPrepReturns', 'expectedGrowthPct'].includes(field)) {
      console.warn(\`⚠️  CRITICAL FIELD CHANGED: \${field}\`);
    }
    
    // Check for state inconsistencies
    this.checkStateConsistency();
  },
  
  // Monitor localStorage changes
  monitorLocalStorage() {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key, value) {
      if (key.includes('libertytax')) {
        const oldValue = localStorage.getItem(key);
        window.LibertyTaxStateMonitor.logStateChange(
          'localStorage', 
          key, 
          oldValue ? 'existing' : 'null', 
          'updated',
          'localStorage.setItem'
        );
      }
      return originalSetItem.apply(this, arguments);
    };
    
    localStorage.removeItem = function(key) {
      if (key.includes('libertytax')) {
        window.LibertyTaxStateMonitor.logStateChange(
          'localStorage',
          key,
          'existing',
          'removed', 
          'localStorage.removeItem'
        );
      }
      return originalRemoveItem.apply(this, arguments);
    };
  },
  
  // Check for state inconsistencies across layers
  checkStateConsistency() {
    try {
      // Get current state from different sources
      const appRegion = this.getCurrentAppRegion();
      const storageData = this.getStorageData();
      const wizardData = this.getWizardData();
      
      // Check for region inconsistencies
      const regions = {
        app: appRegion,
        storage: storageData?.last?.region || storageData?.wizardAnswers?.region,
        wizard: wizardData?.region
      };
      
      const uniqueRegions = [...new Set(Object.values(regions).filter(Boolean))];
      
      if (uniqueRegions.length > 1) {
        console.error('🚨 REGION STATE INCONSISTENCY DETECTED!');
        console.table(regions);
        console.trace('State inconsistency trace');
      }
      
    } catch (e) {
      // Silently handle errors during state checking
    }
  },
  
  // Try to get current app region
  getCurrentAppRegion() {
    // Try various ways to get the current region from React state
    const buttons = document.querySelectorAll('button');
    for (let button of buttons) {
      if (button.textContent.includes('🇺🇸') && button.style.backgroundColor) return 'US';
      if (button.textContent.includes('🇨🇦') && button.style.backgroundColor) return 'CA';
    }
    return null;
  },
  
  // Get localStorage data
  getStorageData() {
    try {
      const stored = localStorage.getItem('libertytax-pnl-webapp-v1');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Try to extract wizard data
  getWizardData() {
    try {
      const stored = this.getStorageData();
      return stored?.wizardAnswers || null;
    } catch (e) {
      return null;
    }
  },
  
  // Generate state report
  generateReport() {
    console.log('📊 STATE MONITORING REPORT');
    console.log('=========================');
    
    const recentChanges = this.history.slice(-20);
    console.log(\`Total state changes tracked: \${this.history.length}\`);
    console.log('Recent changes:', recentChanges);
    
    // Group by field
    const fieldChanges = {};
    this.history.forEach(change => {
      if (!fieldChanges[change.field]) fieldChanges[change.field] = [];
      fieldChanges[change.field].push(change);
    });
    
    console.log('Changes by field:');
    Object.entries(fieldChanges).forEach(([field, changes]) => {
      if (changes.length > 1) {
        console.log(\`  \${field}: \${changes.length} changes\`);
      }
    });
    
    // Current state consistency
    this.checkStateConsistency();
  },
  
  // Manual state validation
  validateCurrentState() {
    const appRegion = this.getCurrentAppRegion();
    const storageData = this.getStorageData();
    const wizardData = this.getWizardData();
    
    console.log('🔍 CURRENT STATE VALIDATION');
    console.log('===========================');
    console.log('App Region (detected):', appRegion);
    console.log('Storage Data:', storageData?.last || 'No data');
    console.log('Wizard Data:', wizardData || 'No data');
    
    return {
      app: { region: appRegion },
      storage: storageData?.last || {},
      wizard: wizardData || {}
    };
  }
};

// Initialize monitoring
window.LibertyTaxStateMonitor.monitorLocalStorage();

// Add helper functions to window for easy access
window.checkState = () => window.LibertyTaxStateMonitor.validateCurrentState();
window.stateReport = () => window.LibertyTaxStateMonitor.generateReport();
window.stateHistory = () => console.table(window.LibertyTaxStateMonitor.history);

// Monitor React state changes (if React DevTools is available)
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('🔗 React DevTools detected - enhanced monitoring available');
}

// Periodic state consistency checks
setInterval(() => {
  window.LibertyTaxStateMonitor.checkStateConsistency();
}, 5000); // Check every 5 seconds

console.log('✅ State monitoring active! Use these commands:');
console.log('   checkState() - Validate current state');
console.log('   stateReport() - Generate monitoring report');  
console.log('   stateHistory() - View all state changes');

// Monitor wizard form changes
document.addEventListener('change', function(e) {
  if (e.target.name || e.target.id) {
    const field = e.target.name || e.target.id;
    const value = e.target.value;
    
    if (field.includes('region') || field.includes('performance') || field.includes('growth')) {
      window.LibertyTaxStateMonitor.logStateChange(
        'Component',
        field,
        'previous',
        value,
        'form_change'
      );
    }
  }
});

// Monitor navigation changes
let currentPath = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== currentPath) {
    window.LibertyTaxStateMonitor.logStateChange(
      'App State',
      'navigation',
      currentPath,
      window.location.pathname,
      'page_navigation'
    );
    currentPath = window.location.pathname;
    
    // Trigger state validation after navigation
    setTimeout(() => {
      window.LibertyTaxStateMonitor.checkStateConsistency();
    }, 1000);
  }
}, 1000);
`;

console.log('📋 BROWSER CONSOLE MONITORING CODE')
console.log('===================================')
console.log('Copy and paste this code into your browser console while using the app:\n')
console.log('```javascript')
console.log(monitoringCode)
console.log('```\n')

console.log('🧪 HOW TO USE THE MONITOR:')
console.log('==========================')
console.log('1. Open the Liberty Tax P&L webapp in your browser')
console.log('2. Open Developer Tools (F12) → Console tab')
console.log('3. Copy/paste the code above and press Enter')
console.log('4. The monitor will now track all state changes in real-time')
console.log('')
console.log('5. Test the specific issue you described:')
console.log('   • Change region setting (US ↔ CA)')
console.log('   • Change performance change option')  
console.log('   • Navigate through wizard steps')
console.log('   • Watch the console for state change logs')
console.log('')
console.log('6. Use these commands in console to debug:')
console.log('   • checkState() - See current state across all layers')
console.log('   • stateReport() - Generate comprehensive report')
console.log('   • stateHistory() - View chronological state changes')

console.log('\n🔍 WHAT TO LOOK FOR:')
console.log('====================')
console.log('❌ RED FLAGS:')
console.log('   • "REGION STATE INCONSISTENCY DETECTED" errors')
console.log('   • Region changing unexpectedly during navigation')
console.log('   • localStorage updates not reflected in app state')
console.log('   • Multiple state layers showing different values')
console.log('')
console.log('✅ GOOD SIGNS:')
console.log('   • Region persists across all navigation steps')
console.log('   • Performance changes are maintained')
console.log('   • State layers remain synchronized')

console.log('\n📝 DEBUGGING CHECKLIST:')
console.log('========================')
console.log('Test these specific scenarios with monitoring active:')
console.log('')
console.log('1. **Region + Performance Change** (Your reported issue):')
console.log('   • Start wizard')
console.log('   • Change region from US to CA')
console.log('   • Select performance change (+10%)')
console.log('   • Navigate: Welcome → Inputs → Review → Complete')
console.log('   • Check dashboard - region should still be CA')
console.log('')
console.log('2. **Performance Change + Region Change**:')
console.log('   • Start wizard') 
console.log('   • Select performance change first (+15%)')
console.log('   • Then change region CA to US')
console.log('   • Navigate through wizard steps')
console.log('   • Verify region stays US')
console.log('')
console.log('3. **Browser Refresh Test**:')
console.log('   • Set region to CA and performance change to +5%')
console.log('   • Navigate to inputs page')
console.log('   • Refresh browser (F5)')
console.log('   • Check if settings are preserved')

console.log('\n🎯 EXPECTED RESULTS:')
console.log('====================')
console.log('If the monitoring reveals inconsistencies, you\'ll see:')
console.log('• Console errors about state inconsistency')
console.log('• Different values in checkState() output')
console.log('• Region reverting unexpectedly during navigation')
console.log('')
console.log('This will help pinpoint exactly where the state sync breaks!')

console.log('\n✨ Real-time monitoring tool ready!')
console.log('📋 Next: Copy the JavaScript code and test it in your browser')

// Create a cleaner copy-paste version
const cleanCode = monitoringCode
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)
  .join(' ')
  .replace(/\s+/g, ' ')

console.log('\n📋 COMPACT VERSION (one-liner for easy copying):')
console.log('```javascript')
console.log(cleanCode)
console.log('```')
