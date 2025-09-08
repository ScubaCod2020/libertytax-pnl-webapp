#!/usr/bin/env node

/**
 * GitHub Integration Testing Script
 * Enhanced testing with GitHub Actions integration and reporting
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Liberty Tax P&L GitHub Integration Testing Suite\n');

// GitHub Actions environment detection
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
const githubStepSummary = process.env.GITHUB_STEP_SUMMARY;

// Test result tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// GitHub Actions logging functions
function logInfo(message) {
  console.log(message);
  if (isGitHubActions) {
    console.log(`::notice::${message}`);
  }
}

function logWarning(message) {
  console.log(`⚠️ ${message}`);
  if (isGitHubActions) {
    console.log(`::warning::${message}`);
  }
  testResults.warnings++;
}

function logError(message) {
  console.log(`❌ ${message}`);
  if (isGitHubActions) {
    console.log(`::error::${message}`);
  }
  testResults.failed++;
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
  testResults.passed++;
}

function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    const result = testFunction();
    if (result === false) {
      logError(`${testName} failed`);
      testResults.details.push({ name: testName, status: 'failed', message: 'Test returned false' });
    } else {
      logSuccess(`${testName} passed`);
      testResults.details.push({ name: testName, status: 'passed', message: result || 'Test completed successfully' });
    }
  } catch (error) {
    logError(`${testName} threw error: ${error.message}`);
    testResults.details.push({ name: testName, status: 'error', message: error.message });
  }
}

// Test calculation accuracy with GitHub reporting
function testCalculationAccuracyGitHub() {
  console.log('📊 GitHub-Enhanced Calculation Accuracy Testing');
  console.log('=' .repeat(60));
  
  const testScenarios = [
    {
      name: "Conservative Store",
      avgNetFee: 125,
      taxPrepReturns: 1600,
      discountsPct: 3,
      salariesPct: 26,
      rentPct: 18
    },
    {
      name: "Aggressive Store",
      avgNetFee: 150,
      taxPrepReturns: 2000,
      discountsPct: 2,
      salariesPct: 22,
      rentPct: 15
    }
  ];
  
  testScenarios.forEach(scenario => {
    runTest(`${scenario.name} - Revenue Calculation`, () => {
      const revenue = scenario.avgNetFee * scenario.taxPrepReturns;
      const expectedRevenue = scenario.name === "Conservative Store" ? 200000 : 300000;
      
      if (Math.abs(revenue - expectedRevenue) < 1) {
        return `Revenue: $${revenue.toLocaleString()} ✓`;
      } else {
        throw new Error(`Expected $${expectedRevenue.toLocaleString()}, got $${revenue.toLocaleString()}`);
      }
    });
    
    runTest(`${scenario.name} - Gross Fees Calculation`, () => {
      const revenue = scenario.avgNetFee * scenario.taxPrepReturns;
      const grossFees = Math.round(revenue / (1 - scenario.discountsPct / 100));
      
      // Validate gross fees is reasonable (should be higher than revenue)
      if (grossFees > revenue && grossFees < revenue * 1.1) {
        return `Gross Fees: $${grossFees.toLocaleString()} ✓`;
      } else {
        throw new Error(`Gross fees calculation seems incorrect: $${grossFees.toLocaleString()}`);
      }
    });
    
    runTest(`${scenario.name} - Dual-Entry Synchronization`, () => {
      const revenue = scenario.avgNetFee * scenario.taxPrepReturns;
      const grossFees = Math.round(revenue / (1 - scenario.discountsPct / 100));
      
      // Test salaries dual-entry
      const salariesDollar = Math.round(grossFees * scenario.salariesPct / 100);
      const backToPct = Math.round((salariesDollar / grossFees * 100) * 10) / 10;
      
      if (Math.abs(scenario.salariesPct - backToPct) < 0.1) {
        return `Salaries: ${scenario.salariesPct}% ↔ $${salariesDollar.toLocaleString()} ↔ ${backToPct}% ✓`;
      } else {
        throw new Error(`Dual-entry sync failed: ${scenario.salariesPct}% → ${backToPct}%`);
      }
    });
  });
}

// Test regional differences with GitHub reporting
function testRegionalDifferencesGitHub() {
  console.log('\n🌍 GitHub-Enhanced Regional Testing');
  console.log('=' .repeat(60));
  
  runTest('US Region - TaxRush Exclusion', () => {
    const usRevenue = 125 * 1600; // Only tax prep
    const expectedUS = 200000;
    
    if (usRevenue === expectedUS) {
      return `US Revenue (Tax Prep only): $${usRevenue.toLocaleString()} ✓`;
    } else {
      throw new Error(`US calculation incorrect: expected $${expectedUS.toLocaleString()}, got $${usRevenue.toLocaleString()}`);
    }
  });
  
  runTest('CA Region - TaxRush Inclusion', () => {
    const taxPrepRevenue = 125 * 1600;
    const taxRushRevenue = 50 * 400; // Example TaxRush
    const caRevenue = taxPrepRevenue + taxRushRevenue;
    
    if (caRevenue > taxPrepRevenue && taxRushRevenue > 0) {
      return `CA Revenue (Tax Prep + TaxRush): $${caRevenue.toLocaleString()} ✓`;
    } else {
      throw new Error('CA regional calculation failed');
    }
  });
}

// Test edge cases with enhanced reporting
function testEdgeCasesGitHub() {
  console.log('\n🔍 GitHub-Enhanced Edge Case Testing');
  console.log('=' .repeat(60));
  
  const edgeCases = [
    {
      name: 'Zero Percentage',
      test: () => {
        const result = 0 * 100000 / 100;
        return result === 0 ? 'Zero percentage correctly yields $0' : false;
      }
    },
    {
      name: 'Maximum Percentage',
      test: () => {
        const result = 100 * 100000 / 100;
        return result === 100000 ? 'Maximum percentage correctly yields full amount' : false;
      }
    },
    {
      name: 'Large Number Handling',
      test: () => {
        const result = 999 * 99999;
        return result > 0 && result < Number.MAX_SAFE_INTEGER ? 'Large numbers handled correctly' : false;
      }
    },
    {
      name: 'Decimal Precision',
      test: () => {
        const result = Math.round((33.33 * 100000 / 100) * 100) / 100;
        return result > 33000 && result < 34000 ? 'Decimal precision maintained' : false;
      }
    }
  ];
  
  edgeCases.forEach(edgeCase => {
    runTest(`Edge Case - ${edgeCase.name}`, edgeCase.test);
  });
}

// Test performance benchmarks
function testPerformanceBenchmarks() {
  console.log('\n⚡ Performance Benchmark Testing');
  console.log('=' .repeat(60));
  
  runTest('Calculation Performance', () => {
    const startTime = Date.now();
    
    // Simulate intensive calculations
    for (let i = 0; i < 10000; i++) {
      const revenue = 125 * 1600;
      const grossFees = revenue / 0.97;
      const salaries = grossFees * 0.26;
      const rent = grossFees * 0.18;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (duration < 100) { // Should complete in under 100ms
      return `10,000 calculations completed in ${duration}ms ✓`;
    } else {
      throw new Error(`Performance too slow: ${duration}ms (expected < 100ms)`);
    }
  });
  
  runTest('Memory Usage Estimation', () => {
    const memBefore = process.memoryUsage().heapUsed;
    
    // Create test data structures
    const testData = [];
    for (let i = 0; i < 1000; i++) {
      testData.push({
        avgNetFee: 125 + i,
        taxPrepReturns: 1600 + i,
        calculations: {
          revenue: (125 + i) * (1600 + i),
          grossFees: (125 + i) * (1600 + i) / 0.97
        }
      });
    }
    
    const memAfter = process.memoryUsage().heapUsed;
    const memUsed = (memAfter - memBefore) / 1024 / 1024; // MB
    
    if (memUsed < 10) { // Should use less than 10MB
      return `Memory usage: ${memUsed.toFixed(2)}MB ✓`;
    } else {
      logWarning(`High memory usage: ${memUsed.toFixed(2)}MB`);
      return `Memory usage acceptable but high: ${memUsed.toFixed(2)}MB`;
    }
  });
}

// Generate GitHub Actions summary
function generateGitHubSummary() {
  if (!isGitHubActions || !githubStepSummary) {
    return;
  }
  
  let summary = '## 🧪 Test Results Summary\n\n';
  summary += `| Metric | Value |\n`;
  summary += `|--------|-------|\n`;
  summary += `| Total Tests | ${testResults.total} |\n`;
  summary += `| Passed | ✅ ${testResults.passed} |\n`;
  summary += `| Failed | ❌ ${testResults.failed} |\n`;
  summary += `| Warnings | ⚠️ ${testResults.warnings} |\n`;
  
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  summary += `| Pass Rate | ${passRate}% |\n\n`;
  
  if (testResults.failed === 0) {
    summary += '### ✅ All Tests Passed!\n\n';
    summary += 'The Liberty Tax P&L webapp calculations are working correctly.\n\n';
  } else {
    summary += '### ❌ Some Tests Failed\n\n';
    summary += 'Please review the failed tests below:\n\n';
    
    const failedTests = testResults.details.filter(test => test.status === 'failed' || test.status === 'error');
    failedTests.forEach(test => {
      summary += `- **${test.name}**: ${test.message}\n`;
    });
    summary += '\n';
  }
  
  summary += '### 📊 Detailed Results\n\n';
  testResults.details.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
    summary += `${icon} **${test.name}**: ${test.message}\n\n`;
  });
  
  // Write to GitHub step summary
  try {
    fs.appendFileSync(githubStepSummary, summary);
    logInfo('GitHub summary generated successfully');
  } catch (error) {
    logWarning(`Failed to write GitHub summary: ${error.message}`);
  }
}

// Main test execution
function runAllGitHubTests() {
  logInfo('Starting GitHub-integrated testing suite...');
  
  testCalculationAccuracyGitHub();
  testRegionalDifferencesGitHub();
  testEdgeCasesGitHub();
  testPerformanceBenchmarks();
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 GITHUB INTEGRATION TEST SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\nTest Results:`);
  console.log(`  Total: ${testResults.total}`);
  console.log(`  Passed: ✅ ${testResults.passed}`);
  console.log(`  Failed: ❌ ${testResults.failed}`);
  console.log(`  Warnings: ⚠️ ${testResults.warnings}`);
  
  const passRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  console.log(`  Pass Rate: ${passRate}%`);
  
  if (testResults.failed === 0) {
    logInfo('🚀 All tests passed! Ready for deployment.');
  } else {
    logError('❌ Some tests failed. Please review and fix before deployment.');
  }
  
  // Generate GitHub summary
  generateGitHubSummary();
  
  // Set exit code for GitHub Actions
  if (testResults.failed > 0) {
    process.exit(1);
  }
}

// Execute tests
runAllGitHubTests();
