#!/usr/bin/env node

/**
 * 💰 EXPENSE CALCULATION LIVE MONITOR
 * 
 * Browser console tool to monitor expense calculation issues in real-time.
 * Specifically tracks the Page 1 → Page 2 data flow and calculation initialization
 * issues you described.
 * 
 * Usage:
 * 1. Run this script to generate monitoring code
 * 2. Copy the code into browser console while using the app
 * 3. Navigate Page 1 → Page 2 and watch for calculation issues
 */

console.log('💰 EXPENSE CALCULATION LIVE MONITOR')
console.log('====================================\n')

const monitoringCode = `
console.log('💰 LIBERTY TAX P&L - EXPENSE CALCULATION MONITOR ACTIVATED');
console.log('==========================================================');

// Create expense calculation monitoring system
window.ExpenseCalculationMonitor = {
  page1Data: {},
  page2Calculations: {},
  calculationHistory: [],
  issues: [],
  
  // Track Page 1 data entry
  trackPage1Data(field, value, source = 'unknown') {
    const oldValue = this.page1Data[field];
    this.page1Data[field] = value;
    
    this.log(\`📝 PAGE 1 DATA: \${field} = \${value}\`, 'info');
    
    this.calculationHistory.push({
      timestamp: new Date().toISOString(),
      action: 'page1_data_set',
      field,
      oldValue,
      newValue: value,
      source
    });
    
    // Check if this completes required Page 1 data
    this.validatePage1Completeness();
  },
  
  // Validate Page 1 data completeness
  validatePage1Completeness() {
    const requiredFields = ['region', 'avgNetFee', 'taxPrepReturns'];
    const optionalFields = ['expectedGrowthPct', 'storeType'];
    
    const missingRequired = requiredFields.filter(field => !this.page1Data[field]);
    const missingOptional = optionalFields.filter(field => !this.page1Data[field]);
    
    if (missingRequired.length === 0) {
      this.log('✅ PAGE 1 COMPLETE: All required fields present', 'success');
      
      if (missingOptional.length > 0) {
        this.log(\`⚠️  Optional fields missing: \${missingOptional.join(', ')}\`, 'warning');
        this.recordIssue('INCOMPLETE_PAGE1_DATA', \`Missing optional: \${missingOptional.join(', ')}\`);
      }
    } else {
      this.log(\`❌ PAGE 1 INCOMPLETE: Missing \${missingRequired.join(', ')}\`, 'error');
      this.recordIssue('MISSING_REQUIRED_DATA', \`Missing required: \${missingRequired.join(', ')}\`);
    }
  },
  
  // Monitor navigation to Page 2
  trackNavigationToPage2() {
    this.log('🧭 NAVIGATION: Page 1 → Page 2', 'info');
    
    this.calculationHistory.push({
      timestamp: new Date().toISOString(),
      action: 'navigate_to_page2',
      page1Data: {...this.page1Data}
    });
    
    // Check if Page 1 data will flow properly
    setTimeout(() => {
      this.checkDataFlowToPage2();
    }, 500); // Give time for React state updates
  },
  
  // Check if Page 1 data flows to Page 2 calculations
  checkDataFlowToPage2() {
    this.log('🔍 CHECKING: Page 1 → Page 2 data flow', 'info');
    
    // Try to detect if calculations have been initialized
    const hasCalculations = this.detectPage2Calculations();
    
    if (!hasCalculations) {
      this.log('❌ DATA FLOW ISSUE: Page 2 calculations not initialized', 'error');
      this.recordIssue('DATA_FLOW_FAILURE', 'Page 1 data did not flow to Page 2 calculations');
      
      // Check if manual reset would be needed
      this.suggestManualReset();
    } else {
      this.log('✅ DATA FLOW SUCCESS: Page 2 calculations initialized', 'success');
    }
  },
  
  // Try to detect Page 2 calculations
  detectPage2Calculations() {
    try {
      // Look for expense calculation elements on page
      const expenseFields = document.querySelectorAll('input[type="number"]');
      const calculatedValues = Array.from(expenseFields)
        .map(input => parseFloat(input.value))
        .filter(val => !isNaN(val) && val > 0);
      
      // Look for dual-entry system elements
      const percentageInputs = document.querySelectorAll('input[placeholder*="%"], input[placeholder*="percent"]');
      const currencyInputs = document.querySelectorAll('input[placeholder*="$"], input[placeholder*="dollar"]');
      
      // Look for strategic calculation displays
      const strategicElements = document.querySelectorAll('[data-strategic], .strategic, .calculation-base');
      
      const hasCalculations = calculatedValues.length > 0;
      const hasDualEntry = percentageInputs.length > 0 && currencyInputs.length > 0;
      const hasStrategic = strategicElements.length > 0;
      
      this.log(\`🔍 DETECTION RESULTS:\`, 'info');
      this.log(\`   Calculated values found: \${calculatedValues.length}\`, 'info');
      this.log(\`   Dual-entry inputs: \${percentageInputs.length}% + \${currencyInputs.length}$ fields\`, 'info');
      this.log(\`   Strategic elements: \${strategicElements.length}\`, 'info');
      
      this.page2Calculations = {
        hasCalculations,
        hasDualEntry,
        hasStrategic,
        calculatedValues: calculatedValues.length,
        detectedAt: new Date().toISOString()
      };
      
      return hasCalculations || hasDualEntry || hasStrategic;
      
    } catch (error) {
      this.log(\`❌ DETECTION ERROR: \${error.message}\`, 'error');
      return false;
    }
  },
  
  // Track expense reset button click
  trackExpenseReset() {
    this.log('🔄 EXPENSE RESET: Manual reset triggered', 'warning');
    
    this.calculationHistory.push({
      timestamp: new Date().toISOString(),
      action: 'manual_expense_reset',
      reason: 'User clicked expense management reset'
    });
    
    this.recordIssue('MANUAL_RESET_REQUIRED', 'User had to manually reset expense calculations');
    
    // Check if reset fixes the calculations
    setTimeout(() => {
      this.checkPostResetCalculations();
    }, 1000);
  },
  
  // Check calculations after manual reset
  checkPostResetCalculations() {
    this.log('🔍 POST-RESET CHECK: Verifying calculations after reset', 'info');
    
    const hasCalculationsAfterReset = this.detectPage2Calculations();
    
    if (hasCalculationsAfterReset) {
      this.log('✅ RESET SUCCESS: Calculations working after manual reset', 'success');
    } else {
      this.log('❌ RESET FAILED: Calculations still not working after reset', 'error');
      this.recordIssue('RESET_FAILURE', 'Manual reset did not fix calculations');
    }
  },
  
  // Suggest manual reset
  suggestManualReset() {
    this.log('💡 SUGGESTION: Look for expense management reset button', 'warning');
    this.log('   This usually fixes calculation initialization issues', 'warning');
    
    // Try to find reset button
    const resetButtons = document.querySelectorAll('button');
    const possibleResetButton = Array.from(resetButtons).find(btn => 
      btn.textContent.toLowerCase().includes('reset') && 
      (btn.textContent.toLowerCase().includes('expense') || 
       btn.textContent.toLowerCase().includes('management'))
    );
    
    if (possibleResetButton) {
      this.log('🎯 FOUND: Potential reset button detected', 'info');
      this.log(\`   Button text: "\${possibleResetButton.textContent.trim()}"\`, 'info');
    }
  },
  
  // Record issues for analysis
  recordIssue(type, description) {
    const issue = {
      type,
      description,
      timestamp: new Date().toISOString(),
      page1Data: {...this.page1Data},
      page2State: {...this.page2Calculations}
    };
    
    this.issues.push(issue);
  },
  
  // Logging with color coding
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
      \`%c[\${timestamp}] \${message}\`,
      \`color: \${color}; font-weight: \${level === 'error' ? 'bold' : 'normal'};\`
    );
  },
  
  // Generate comprehensive report
  generateReport() {
    console.log('📊 EXPENSE CALCULATION MONITORING REPORT');
    console.log('=======================================');
    
    console.log('\\n📋 Page 1 Data Captured:');
    console.table(this.page1Data);
    
    console.log('\\n💰 Page 2 Calculation State:');
    console.table(this.page2Calculations);
    
    console.log('\\n🚨 Issues Detected:');
    if (this.issues.length > 0) {
      this.issues.forEach((issue, idx) => {
        console.log(\`\${idx + 1}. \${issue.type}: \${issue.description}\`);
      });
    } else {
      console.log('✅ No issues detected');
    }
    
    console.log('\\n📈 Calculation History:');
    console.table(this.calculationHistory);
    
    // Analysis
    const hasDataFlowIssues = this.issues.some(i => i.type.includes('DATA_FLOW'));
    const needsManualReset = this.issues.some(i => i.type.includes('MANUAL_RESET'));
    
    console.log('\\n💡 ANALYSIS:');
    if (hasDataFlowIssues) {
      console.warn('⚠️  Data flow issues detected - Page 1 → Page 2 data not transferring properly');
    }
    if (needsManualReset) {
      console.warn('⚠️  Manual reset required - automatic calculation initialization failed');
    }
    if (!hasDataFlowIssues && !needsManualReset) {
      console.log('✅ No major issues detected - calculations working properly');
    }
  },
  
  // Quick status check
  checkStatus() {
    this.log('🔍 CURRENT STATUS CHECK', 'info');
    this.validatePage1Completeness();
    
    if (Object.keys(this.page2Calculations).length > 0) {
      this.log(\`Page 2 calculations: \${JSON.stringify(this.page2Calculations)}\`, 'info');
    } else {
      this.log('No Page 2 calculations detected yet', 'info');
    }
    
    this.log(\`Issues detected: \${this.issues.length}\`, this.issues.length > 0 ? 'warning' : 'success');
  }
};

// Initialize monitoring with automatic detection
window.ExpenseCalculationMonitor.log('✅ Expense calculation monitoring initialized', 'success');

// Auto-detect Page 1 form changes
document.addEventListener('change', function(e) {
  const field = e.target.name || e.target.id || e.target.placeholder;
  const value = e.target.value;
  
  if (field && value && 
      (field.includes('region') || field.includes('fee') || field.includes('returns') || 
       field.includes('growth') || field.includes('performance'))) {
    window.ExpenseCalculationMonitor.trackPage1Data(field, value, 'form_change');
  }
});

// Auto-detect navigation (simplified)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    
    // Detect navigation to Page 2 (inputs/expenses page)
    if (currentUrl.includes('inputs') || currentUrl.includes('expenses') || 
        document.querySelector('h2, h3')?.textContent?.toLowerCase()?.includes('expense')) {
      window.ExpenseCalculationMonitor.trackNavigationToPage2();
    }
  }
}, 1000);

// Auto-detect reset button clicks
document.addEventListener('click', function(e) {
  const buttonText = e.target.textContent?.toLowerCase() || '';
  
  if (buttonText.includes('reset') && 
      (buttonText.includes('expense') || buttonText.includes('management'))) {
    window.ExpenseCalculationMonitor.trackExpenseReset();
  }
});

// Add helper functions for easy access
window.checkExpenseCalculations = () => window.ExpenseCalculationMonitor.checkStatus();
window.expenseReport = () => window.ExpenseCalculationMonitor.generateReport();
window.detectCalculations = () => window.ExpenseCalculationMonitor.detectPage2Calculations();

// Periodic automatic checks
setInterval(() => {
  // Auto-detect calculations if we're on what looks like Page 2
  if (document.querySelector('input[type="number"]')) {
    window.ExpenseCalculationMonitor.detectPage2Calculations();
  }
}, 3000);

console.log('\\n🧪 EXPENSE CALCULATION COMMANDS:');
console.log('   checkExpenseCalculations() - Check current status');
console.log('   expenseReport() - Generate full monitoring report'); 
console.log('   detectCalculations() - Manually detect Page 2 calculations');
console.log('\\n📋 TEST SCENARIO: Enter Page 1 data → Navigate to Page 2 → Watch for issues');
`;

console.log('📋 BROWSER CONSOLE EXPENSE MONITORING CODE')
console.log('===========================================')
console.log('Copy and paste this code into your browser console:\n')

console.log('```javascript')
console.log(monitoringCode)
console.log('```\n')

console.log('🧪 HOW TO TEST THE EXPENSE CALCULATION ISSUE:')
console.log('=============================================')
console.log('1. Open your Liberty Tax P&L webapp')
console.log('2. Open Developer Tools (F12) → Console')
console.log('3. Paste the monitoring code above and press Enter')
console.log('4. Test the specific scenarios that showed issues:')
console.log('')
console.log('📋 TEST SCENARIO A (Should work fine):')
console.log('   • Region: US')
console.log('   • Store Type: Existing')
console.log('   • Average Net Fee: $150')
console.log('   • Tax Prep Returns: 1200')
console.log('   • Performance Change: +10%')
console.log('   • Navigate to Page 2')
console.log('   • Expected: Calculations work automatically')
console.log('')
console.log('📋 TEST SCENARIO B (May need manual reset):')
console.log('   • Region: US')
console.log('   • Store Type: New')  
console.log('   • Average Net Fee: $175')
console.log('   • Tax Prep Returns: 800')
console.log('   • Performance Change: 0% (or leave blank)')
console.log('   • Navigate to Page 2')
console.log('   • Expected: May need manual "expense management reset"')
console.log('')
console.log('📋 TEST SCENARIO C (Likely to fail):')
console.log('   • Region: CA') 
console.log('   • Store Type: Existing')
console.log('   • Average Net Fee: $140')
console.log('   • Tax Prep Returns: 1400')
console.log('   • Skip performance change (leave blank)')
console.log('   • Navigate to Page 2')
console.log('   • Expected: Will need manual reset, may still not work')

console.log('\n🔍 WHAT THE MONITOR WILL SHOW:')
console.log('==============================')
console.log('✅ SUCCESS INDICATORS:')
console.log('   • "PAGE 1 COMPLETE: All required fields present"')
console.log('   • "DATA FLOW SUCCESS: Page 2 calculations initialized"')  
console.log('   • "Calculated values found: [number > 0]"')
console.log('')
console.log('❌ PROBLEM INDICATORS:')
console.log('   • "DATA FLOW ISSUE: Page 2 calculations not initialized"')
console.log('   • "MANUAL RESET REQUIRED: User had to manually reset"')
console.log('   • "Missing optional: expectedGrowthPct"')
console.log('   • "Calculated values found: 0"')

console.log('\n💡 DEBUGGING COMMANDS:')
console.log('======================')
console.log('Use these in the browser console after pasting the monitor:')
console.log('• checkExpenseCalculations() - Check current status')
console.log('• expenseReport() - Generate comprehensive report')
console.log('• detectCalculations() - Force detection of Page 2 calculations')

console.log('\n🎯 WHAT THIS WILL PROVE:')
console.log('========================')
console.log('The monitor will show you exactly:')
console.log('1. Which Page 1 data is captured properly')
console.log('2. Whether data flows from Page 1 → Page 2')
console.log('3. If expense calculations initialize automatically')
console.log('4. When you need to hit the manual reset button')
console.log('5. Whether the reset actually fixes the calculations')

console.log('\n✨ Expense calculation monitoring tool ready!')
console.log('📋 This will help identify the exact data flow and calculation issues')
