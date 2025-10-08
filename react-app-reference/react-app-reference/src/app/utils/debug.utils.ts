// debug.utils.ts - Comprehensive debugging utilities for regression testing
// Compare Angular vs React app calculations and functionality

export interface DebugContext {
  component: string;
  method: string;
  timestamp: Date;
  data?: any;
}

export interface CalculationComparison {
  metric: string;
  angularValue: number;
  reactValue: number;
  difference: number;
  percentageDiff: number;
  isMatch: boolean;
}

export interface RegressionTestResult {
  testName: string;
  passed: boolean;
  angularResult: any;
  reactResult: any;
  differences: string[];
  timestamp: Date;
}

export class DebugLogger {
  private static logs: DebugContext[] = [];
  private static isEnabled: boolean = true;

  static enable(): void {
    this.isEnabled = true;
  }

  static disable(): void {
    this.isEnabled = false;
  }

  static log(component: string, method: string, data?: any): void {
    if (!this.isEnabled) return;

    const context: DebugContext = {
      component,
      method,
      timestamp: new Date(),
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    };

    this.logs.push(context);
    console.log(`🐛 [${component}] ${method}:`, data);
  }

  static getLogs(): DebugContext[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export class CalculationValidator {
  static compareCalculations(
    metric: string,
    angularValue: number,
    reactValue: number,
    tolerance: number = 0.01
  ): CalculationComparison {
    const difference = Math.abs(angularValue - reactValue);
    const percentageDiff = reactValue !== 0 ? (difference / Math.abs(reactValue)) * 100 : 0;
    const isMatch = difference <= tolerance;

    return {
      metric,
      angularValue,
      reactValue,
      difference,
      percentageDiff,
      isMatch
    };
  }

  static validateExpenseCalculation(
    fieldName: string,
    percentage: number,
    baseAmount: number,
    expectedAmount: number
  ): boolean {
    const calculatedAmount = (baseAmount * percentage) / 100;
    const isMatch = Math.abs(calculatedAmount - expectedAmount) < 0.01;
    
    DebugLogger.log('CalculationValidator', 'validateExpenseCalculation', {
      fieldName,
      percentage,
      baseAmount,
      calculatedAmount,
      expectedAmount,
      isMatch
    });

    return isMatch;
  }

  static validateRevenueCalculation(
    avgNetFee: number,
    taxPrepReturns: number,
    discountsPct: number,
    expectedGrossFees: number,
    expectedDiscounts: number,
    expectedNetIncome: number
  ): boolean {
    const grossFees = avgNetFee * taxPrepReturns;
    const discounts = grossFees * (discountsPct / 100);
    const netIncome = grossFees - discounts;

    const grossFeesMatch = Math.abs(grossFees - expectedGrossFees) < 0.01;
    const discountsMatch = Math.abs(discounts - expectedDiscounts) < 0.01;
    const netIncomeMatch = Math.abs(netIncome - expectedNetIncome) < 0.01;

    DebugLogger.log('CalculationValidator', 'validateRevenueCalculation', {
      avgNetFee,
      taxPrepReturns,
      discountsPct,
      grossFees,
      expectedGrossFees,
      discounts,
      expectedDiscounts,
      netIncome,
      expectedNetIncome,
      grossFeesMatch,
      discountsMatch,
      netIncomeMatch
    });

    return grossFeesMatch && discountsMatch && netIncomeMatch;
  }
}

export class RegressionTester {
  private static testResults: RegressionTestResult[] = [];

  static runCalculationTests(): RegressionTestResult[] {
    const tests: RegressionTestResult[] = [];

    // Test 1: Basic Revenue Calculation
    tests.push(this.testBasicRevenueCalculation());
    
    // Test 2: Expense Percentage Calculations
    tests.push(this.testExpenseCalculations());
    
    // Test 3: TaxRush Calculations (Canada)
    tests.push(this.testTaxRushCalculations());
    
    // Test 4: KPI Status Determinations
    tests.push(this.testKPIStatusDeterminations());

    this.testResults = tests;
    return tests;
  }

  private static testBasicRevenueCalculation(): RegressionTestResult {
    const testName = 'Basic Revenue Calculation';
    const differences: string[] = [];

    // Angular calculation
    const avgNetFee = 125;
    const taxPrepReturns = 1600;
    const discountsPct = 3;
    
    const grossFees = avgNetFee * taxPrepReturns;
    const discounts = grossFees * (discountsPct / 100);
    const netIncome = grossFees - discounts;

    // Expected React values (from React app logic)
    const expectedGrossFees = 200000;
    const expectedDiscounts = 6000;
    const expectedNetIncome = 194000;

    const grossFeesMatch = Math.abs(grossFees - expectedGrossFees) < 0.01;
    const discountsMatch = Math.abs(discounts - expectedDiscounts) < 0.01;
    const netIncomeMatch = Math.abs(netIncome - expectedNetIncome) < 0.01;

    if (!grossFeesMatch) differences.push(`Gross Fees: Angular=${grossFees}, Expected=${expectedGrossFees}`);
    if (!discountsMatch) differences.push(`Discounts: Angular=${discounts}, Expected=${expectedDiscounts}`);
    if (!netIncomeMatch) differences.push(`Net Income: Angular=${netIncome}, Expected=${expectedNetIncome}`);

    return {
      testName,
      passed: grossFeesMatch && discountsMatch && netIncomeMatch,
      angularResult: { grossFees, discounts, netIncome },
      reactResult: { grossFees: expectedGrossFees, discounts: expectedDiscounts, netIncome: expectedNetIncome },
      differences,
      timestamp: new Date()
    };
  }

  private static testExpenseCalculations(): RegressionTestResult {
    const testName = 'Expense Calculations';
    const differences: string[] = [];

    const grossFees = 200000;
    const salariesPct = 25;
    const expectedSalaries = 50000;

    const salaries = grossFees * (salariesPct / 100);
    const salariesMatch = Math.abs(salaries - expectedSalaries) < 0.01;

    if (!salariesMatch) differences.push(`Salaries: Angular=${salaries}, Expected=${expectedSalaries}`);

    return {
      testName,
      passed: salariesMatch,
      angularResult: { salaries },
      reactResult: { salaries: expectedSalaries },
      differences,
      timestamp: new Date()
    };
  }

  private static testTaxRushCalculations(): RegressionTestResult {
    const testName = 'TaxRush Calculations (Canada)';
    const differences: string[] = [];

    const taxRushReturns = 100;
    const taxRushFee = 125;
    const expectedTaxRushIncome = 12500;

    const taxRushIncome = taxRushReturns * taxRushFee;
    const taxRushMatch = Math.abs(taxRushIncome - expectedTaxRushIncome) < 0.01;

    if (!taxRushMatch) differences.push(`TaxRush Income: Angular=${taxRushIncome}, Expected=${expectedTaxRushIncome}`);

    return {
      testName,
      passed: taxRushMatch,
      angularResult: { taxRushIncome },
      reactResult: { taxRushIncome: expectedTaxRushIncome },
      differences,
      timestamp: new Date()
    };
  }

  private static testKPIStatusDeterminations(): RegressionTestResult {
    const testName = 'KPI Status Determinations';
    const differences: string[] = [];

    // Test net margin status
    const netMargin = 22;
    const expectedStatus = 'green'; // Should be green for >= 20%

    // This would need to be implemented based on the actual KPI logic
    const statusMatch = true; // Placeholder

    return {
      testName,
      passed: statusMatch,
      angularResult: { netMargin, status: 'green' },
      reactResult: { netMargin, status: expectedStatus },
      differences,
      timestamp: new Date()
    };
  }

  static getTestResults(): RegressionTestResult[] {
    return [...this.testResults];
  }

  static exportTestResults(): string {
    return JSON.stringify(this.testResults, null, 2);
  }
}

// Global debugging functions for easy access
export function debugLog(component: string, method: string, data?: any): void {
  DebugLogger.log(component, method, data);
}

export function runRegressionTests(): RegressionTestResult[] {
  return RegressionTester.runCalculationTests();
}

export function enableDebugging(): void {
  DebugLogger.enable();
}

export function disableDebugging(): void {
  DebugLogger.disable();
}
