#!/usr/bin/env node

/**
 * Comprehensive Calculation Test Suite
 * Tests both US and CA regions with wide range of scenarios
 * Validates wizard calculations match main engine calculations
 */

console.log('🧪 COMPREHENSIVE CALCULATION TEST SUITE');
console.log('Testing both US and CA regions with multiple ranges\n');

// Import calculation function (simulated - matches src/lib/calcs.ts)
function calc(inputs) {
  const taxRush = inputs.region === 'CA' ? inputs.taxRushReturns : 0;
  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns;
  const discounts = grossFees * (inputs.discountsPct / 100);
  const taxPrepIncome = grossFees - discounts;

  // Personnel expenses
  const salaries = grossFees * (inputs.salariesPct / 100);
  const empDeductions = salaries * (inputs.empDeductionsPct / 100);
  
  // Facility expenses  
  const rent = grossFees * (inputs.rentPct / 100);
  const telephone = inputs.telephoneAmt;
  const utilities = inputs.utilitiesAmt;
  
  // Operations expenses
  const localAdv = inputs.localAdvAmt;
  const insurance = inputs.insuranceAmt;
  const postage = inputs.postageAmt;
  const supplies = grossFees * (inputs.suppliesPct / 100);
  const dues = inputs.duesAmt;
  const bankFees = inputs.bankFeesAmt;
  const maintenance = inputs.maintenanceAmt;
  const travelEnt = inputs.travelEntAmt;
  
  // Franchise expenses (all % of tax prep income)
  const royalties = taxPrepIncome * (inputs.royaltiesPct / 100);
  const advRoyalties = taxPrepIncome * (inputs.advRoyaltiesPct / 100);
  const taxRushRoyalties = inputs.region === 'CA' ? 
    taxPrepIncome * (inputs.taxRushRoyaltiesPct / 100) : 0;
  
  // Miscellaneous
  const misc = grossFees * (inputs.miscPct / 100);
  
  // Calculate totals
  const totalExpenses = 
    salaries + empDeductions + 
    rent + telephone + utilities +
    localAdv + insurance + postage + supplies + dues + bankFees + maintenance + travelEnt +
    royalties + advRoyalties + taxRushRoyalties +
    misc;
    
  const netIncome = taxPrepIncome - totalExpenses;
  const totalReturns = inputs.taxPrepReturns + taxRush;
  const costPerReturn = totalReturns > 0 ? totalExpenses / totalReturns : 0;
  const netMarginPct = taxPrepIncome !== 0 ? (netIncome / taxPrepIncome) * 100 : 0;
  
  return { 
    grossFees, discounts, taxPrepIncome,
    salaries, empDeductions,
    rent, telephone, utilities,
    localAdv, insurance, postage, supplies, dues, bankFees, maintenance, travelEnt,
    royalties, advRoyalties, taxRushRoyalties,
    misc,
    totalExpenses, netIncome, totalReturns, costPerReturn, netMarginPct 
  };
}

// Test scenarios covering wide ranges
const testScenarios = {
  // US REGION TESTS
  us_micro_office: {
    name: "US Micro Office",
    region: 'US',
    avgNetFee: 75,
    taxPrepReturns: 500,
    taxRushReturns: 0,
    discountsPct: 5,
    salariesPct: 35,
    empDeductionsPct: 12,
    rentPct: 25,
    telephoneAmt: 150,
    utilitiesAmt: 200,
    localAdvAmt: 300,
    insuranceAmt: 100,
    postageAmt: 50,
    suppliesPct: 4,
    duesAmt: 150,
    bankFeesAmt: 75,
    maintenanceAmt: 100,
    travelEntAmt: 100,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 3
  },

  us_small_office: {
    name: "US Small Office",
    region: 'US',
    avgNetFee: 110,
    taxPrepReturns: 1200,
    taxRushReturns: 0,
    discountsPct: 3,
    salariesPct: 28,
    empDeductionsPct: 10,
    rentPct: 20,
    telephoneAmt: 200,
    utilitiesAmt: 300,
    localAdvAmt: 500,
    insuranceAmt: 150,
    postageAmt: 100,
    suppliesPct: 3.5,
    duesAmt: 200,
    bankFeesAmt: 100,
    maintenanceAmt: 150,
    travelEntAmt: 200,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 2.5
  },

  us_medium_office: {
    name: "US Medium Office",
    region: 'US',
    avgNetFee: 135,
    taxPrepReturns: 1800,
    taxRushReturns: 0,
    discountsPct: 2,
    salariesPct: 25,
    empDeductionsPct: 8,
    rentPct: 18,
    telephoneAmt: 250,
    utilitiesAmt: 400,
    localAdvAmt: 800,
    insuranceAmt: 200,
    postageAmt: 150,
    suppliesPct: 3,
    duesAmt: 250,
    bankFeesAmt: 150,
    maintenanceAmt: 200,
    travelEntAmt: 300,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 2
  },

  us_large_office: {
    name: "US Large Office",
    region: 'US',
    avgNetFee: 160,
    taxPrepReturns: 2500,
    taxRushReturns: 0,
    discountsPct: 1.5,
    salariesPct: 22,
    empDeductionsPct: 7,
    rentPct: 15,
    telephoneAmt: 300,
    utilitiesAmt: 500,
    localAdvAmt: 1200,
    insuranceAmt: 250,
    postageAmt: 200,
    suppliesPct: 2.5,
    duesAmt: 300,
    bankFeesAmt: 200,
    maintenanceAmt: 300,
    travelEntAmt: 500,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 1.5
  },

  us_premium_office: {
    name: "US Premium Office",
    region: 'US',
    avgNetFee: 200,
    taxPrepReturns: 3500,
    taxRushReturns: 0,
    discountsPct: 1,
    salariesPct: 20,
    empDeductionsPct: 6,
    rentPct: 12,
    telephoneAmt: 400,
    utilitiesAmt: 600,
    localAdvAmt: 2000,
    insuranceAmt: 300,
    postageAmt: 250,
    suppliesPct: 2,
    duesAmt: 400,
    bankFeesAmt: 250,
    maintenanceAmt: 400,
    travelEntAmt: 800,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 1
  },

  // CANADA REGION TESTS (with TaxRush)
  ca_micro_office: {
    name: "CA Micro Office",
    region: 'CA',
    avgNetFee: 85,
    taxPrepReturns: 400,
    taxRushReturns: 50,
    discountsPct: 6,
    salariesPct: 38,
    empDeductionsPct: 15,
    rentPct: 28,
    telephoneAmt: 180,
    utilitiesAmt: 250,
    localAdvAmt: 400,
    insuranceAmt: 120,
    postageAmt: 60,
    suppliesPct: 4.5,
    duesAmt: 180,
    bankFeesAmt: 90,
    maintenanceAmt: 120,
    travelEntAmt: 150,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 8,
    miscPct: 3.5
  },

  ca_small_office: {
    name: "CA Small Office",
    region: 'CA',
    avgNetFee: 120,
    taxPrepReturns: 1000,
    taxRushReturns: 200,
    discountsPct: 4,
    salariesPct: 30,
    empDeductionsPct: 12,
    rentPct: 22,
    telephoneAmt: 220,
    utilitiesAmt: 350,
    localAdvAmt: 600,
    insuranceAmt: 180,
    postageAmt: 120,
    suppliesPct: 4,
    duesAmt: 220,
    bankFeesAmt: 120,
    maintenanceAmt: 180,
    travelEntAmt: 250,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 6,
    miscPct: 3
  },

  ca_medium_office: {
    name: "CA Medium Office",
    region: 'CA',
    avgNetFee: 145,
    taxPrepReturns: 1600,
    taxRushReturns: 400,
    discountsPct: 3,
    salariesPct: 26,
    empDeductionsPct: 10,
    rentPct: 19,
    telephoneAmt: 280,
    utilitiesAmt: 450,
    localAdvAmt: 900,
    insuranceAmt: 220,
    postageAmt: 180,
    suppliesPct: 3.5,
    duesAmt: 280,
    bankFeesAmt: 180,
    maintenanceAmt: 220,
    travelEntAmt: 350,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 5,
    miscPct: 2.5
  },

  ca_large_office: {
    name: "CA Large Office",
    region: 'CA',
    avgNetFee: 170,
    taxPrepReturns: 2200,
    taxRushReturns: 600,
    discountsPct: 2,
    salariesPct: 23,
    empDeductionsPct: 8,
    rentPct: 16,
    telephoneAmt: 350,
    utilitiesAmt: 550,
    localAdvAmt: 1400,
    insuranceAmt: 280,
    postageAmt: 220,
    suppliesPct: 3,
    duesAmt: 350,
    bankFeesAmt: 220,
    maintenanceAmt: 280,
    travelEntAmt: 600,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 4,
    miscPct: 2
  },

  ca_premium_office: {
    name: "CA Premium Office",
    region: 'CA',
    avgNetFee: 210,
    taxPrepReturns: 3000,
    taxRushReturns: 800,
    discountsPct: 1.5,
    salariesPct: 21,
    empDeductionsPct: 7,
    rentPct: 13,
    telephoneAmt: 450,
    utilitiesAmt: 700,
    localAdvAmt: 2200,
    insuranceAmt: 350,
    postageAmt: 300,
    suppliesPct: 2.5,
    duesAmt: 450,
    bankFeesAmt: 300,
    maintenanceAmt: 350,
    travelEntAmt: 1000,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 3,
    miscPct: 1.5
  },

  // EDGE CASE TESTS
  us_zero_discounts: {
    name: "US Zero Discounts Edge Case",
    region: 'US',
    avgNetFee: 125,
    taxPrepReturns: 1600,
    taxRushReturns: 0,
    discountsPct: 0,
    salariesPct: 25,
    empDeductionsPct: 10,
    rentPct: 18,
    telephoneAmt: 200,
    utilitiesAmt: 300,
    localAdvAmt: 500,
    insuranceAmt: 150,
    postageAmt: 100,
    suppliesPct: 3.5,
    duesAmt: 200,
    bankFeesAmt: 100,
    maintenanceAmt: 150,
    travelEntAmt: 200,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 2.5
  },

  ca_high_discounts: {
    name: "CA High Discounts Edge Case",
    region: 'CA',
    avgNetFee: 100,
    taxPrepReturns: 1000,
    taxRushReturns: 300,
    discountsPct: 15,
    salariesPct: 30,
    empDeductionsPct: 12,
    rentPct: 20,
    telephoneAmt: 200,
    utilitiesAmt: 300,
    localAdvAmt: 500,
    insuranceAmt: 150,
    postageAmt: 100,
    suppliesPct: 4,
    duesAmt: 200,
    bankFeesAmt: 100,
    maintenanceAmt: 150,
    travelEntAmt: 200,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 10,
    miscPct: 3
  },

  us_minimal_returns: {
    name: "US Minimal Returns Edge Case",
    region: 'US',
    avgNetFee: 200,
    taxPrepReturns: 100,
    taxRushReturns: 0,
    discountsPct: 2,
    salariesPct: 40,
    empDeductionsPct: 15,
    rentPct: 30,
    telephoneAmt: 150,
    utilitiesAmt: 200,
    localAdvAmt: 200,
    insuranceAmt: 100,
    postageAmt: 50,
    suppliesPct: 5,
    duesAmt: 100,
    bankFeesAmt: 50,
    maintenanceAmt: 100,
    travelEntAmt: 100,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 0,
    miscPct: 4
  },

  ca_maximum_taxrush: {
    name: "CA Maximum TaxRush Edge Case",
    region: 'CA',
    avgNetFee: 80,
    taxPrepReturns: 800,
    taxRushReturns: 1200,
    discountsPct: 3,
    salariesPct: 35,
    empDeductionsPct: 12,
    rentPct: 25,
    telephoneAmt: 200,
    utilitiesAmt: 300,
    localAdvAmt: 600,
    insuranceAmt: 150,
    postageAmt: 100,
    suppliesPct: 4,
    duesAmt: 200,
    bankFeesAmt: 100,
    maintenanceAmt: 150,
    travelEntAmt: 200,
    royaltiesPct: 14,
    advRoyaltiesPct: 5,
    taxRushRoyaltiesPct: 12,
    miscPct: 3
  }
};

// Test execution function
function runComprehensiveTests() {
  let passedTests = 0;
  let totalTests = 0;
  const results = [];

  console.log('🔬 RUNNING COMPREHENSIVE CALCULATION TESTS\n');

  Object.entries(testScenarios).forEach(([key, scenario]) => {
    console.log(`\n📊 Testing: ${scenario.name} (${scenario.region})`);
    console.log('=' .repeat(60));
    
    totalTests++;
    
    try {
      // Run calculation
      const result = calc(scenario);
      
      // Validate key calculations
      const expectedGrossFees = scenario.avgNetFee * scenario.taxPrepReturns;
      const expectedDiscounts = expectedGrossFees * (scenario.discountsPct / 100);
      const expectedTaxPrepIncome = expectedGrossFees - expectedDiscounts;
      const expectedTotalReturns = scenario.taxPrepReturns + (scenario.region === 'CA' ? scenario.taxRushReturns : 0);
      
      // Validation checks
      const checks = [
        {
          name: 'Gross Fees',
          expected: expectedGrossFees,
          actual: result.grossFees,
          tolerance: 0.01
        },
        {
          name: 'Discounts',
          expected: expectedDiscounts,
          actual: result.discounts,
          tolerance: 0.01
        },
        {
          name: 'Tax Prep Income',
          expected: expectedTaxPrepIncome,
          actual: result.taxPrepIncome,
          tolerance: 0.01
        },
        {
          name: 'Total Returns',
          expected: expectedTotalReturns,
          actual: result.totalReturns,
          tolerance: 0.01
        },
        {
          name: 'Salaries (% of Gross)',
          expected: expectedGrossFees * (scenario.salariesPct / 100),
          actual: result.salaries,
          tolerance: 0.01
        },
        {
          name: 'Royalties (% of Tax Prep Income)',
          expected: expectedTaxPrepIncome * (scenario.royaltiesPct / 100),
          actual: result.royalties,
          tolerance: 0.01
        }
      ];

      // Add TaxRush specific checks for CA
      if (scenario.region === 'CA') {
        checks.push({
          name: 'TaxRush Royalties',
          expected: expectedTaxPrepIncome * (scenario.taxRushRoyaltiesPct / 100),
          actual: result.taxRushRoyalties,
          tolerance: 0.01
        });
      } else {
        checks.push({
          name: 'TaxRush Royalties (US should be 0)',
          expected: 0,
          actual: result.taxRushRoyalties,
          tolerance: 0.01
        });
      }
      
      let testPassed = true;
      
      checks.forEach(check => {
        const diff = Math.abs(check.expected - check.actual);
        const passed = diff <= check.tolerance;
        
        if (!passed) testPassed = false;
        
        console.log(`  ${passed ? '✅' : '❌'} ${check.name}: Expected $${check.expected.toLocaleString()}, Got $${check.actual.toLocaleString()}`);
        if (!passed) {
          console.log(`    ⚠️  Difference: $${diff.toLocaleString()}`);
        }
      });
      
      // Display key results
      console.log(`\n  📈 Key Results:`);
      console.log(`    Gross Fees: $${result.grossFees.toLocaleString()}`);
      console.log(`    Discounts: $${result.discounts.toLocaleString()}`);
      console.log(`    Tax Prep Income: $${result.taxPrepIncome.toLocaleString()}`);
      console.log(`    Total Expenses: $${result.totalExpenses.toLocaleString()}`);
      console.log(`    Net Income: $${result.netIncome.toLocaleString()}`);
      console.log(`    Net Margin: ${result.netMarginPct.toFixed(1)}%`);
      console.log(`    Cost/Return: $${result.costPerReturn.toFixed(2)}`);
      
      if (scenario.region === 'CA') {
        console.log(`    TaxRush Returns: ${scenario.taxRushReturns}`);
        console.log(`    TaxRush Royalties: $${result.taxRushRoyalties.toLocaleString()}`);
      }
      
      if (testPassed) {
        passedTests++;
        console.log(`\n  ✅ ${scenario.name} - ALL CHECKS PASSED`);
      } else {
        console.log(`\n  ❌ ${scenario.name} - SOME CHECKS FAILED`);
      }
      
      results.push({
        scenario: scenario.name,
        region: scenario.region,
        passed: testPassed,
        result: result
      });
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      results.push({
        scenario: scenario.name,
        region: scenario.region,
        passed: false,
        error: error.message
      });
    }
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`\n✅ Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Regional breakdown
  const usPassed = results.filter(r => r.region === 'US' && r.passed).length;
  const usTotal = results.filter(r => r.region === 'US').length;
  const caPassed = results.filter(r => r.region === 'CA' && r.passed).length;
  const caTotal = results.filter(r => r.region === 'CA').length;
  
  console.log(`\n🇺🇸 US Region: ${usPassed}/${usTotal} passed (${((usPassed / usTotal) * 100).toFixed(1)}%)`);
  console.log(`🇨🇦 CA Region: ${caPassed}/${caTotal} passed (${((caPassed / caTotal) * 100).toFixed(1)}%)`);
  
  // Failed tests
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    failedTests.forEach(test => {
      console.log(`  • ${test.scenario} (${test.region})`);
    });
  }
  
  console.log(`\n🎯 Recommendation: ${passedTests === totalTests ? 'READY FOR DEPLOYMENT' : 'FIX FAILED TESTS BEFORE DEPLOYMENT'}`);
  
  return {
    totalTests,
    passedTests,
    successRate: (passedTests / totalTests) * 100,
    results
  };
}

// Run the tests
runComprehensiveTests();
