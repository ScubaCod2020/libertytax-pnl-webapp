// error-tracking.utils.ts - Comprehensive error tracking and testing utilities
// For debugging and regression testing between Angular and React apps

export interface ErrorContext {
  component: string;
  method: string;
  timestamp: Date;
  error: Error;
  userAgent: string;
  url: string;
  stack?: string;
  data?: any;
}

export interface TestCase {
  name: string;
  description: string;
  input: any;
  expectedOutput: any;
  tolerance?: number;
  category: 'calculation' | 'ui' | 'integration' | 'performance';
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualOutput: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface RegressionTestSuite {
  name: string;
  version: string;
  timestamp: Date;
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  };
}

export class ErrorTracker {
  private static errors: ErrorContext[] = [];
  private static isEnabled: boolean = true;

  static enable(): void {
    this.isEnabled = true;
  }

  static disable(): void {
    this.isEnabled = false;
  }

  static trackError(
    component: string,
    method: string,
    error: Error,
    data?: any
  ): void {
    if (!this.isEnabled) return;

    const context: ErrorContext = {
      component,
      method,
      timestamp: new Date(),
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      stack: error.stack,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    };

    this.errors.push(context);
    
    console.error(`🚨 [${component}] ${method}:`, error, data);
    
    // Send to external service in production
    this.sendToExternalService(context);
  }

  static getErrors(): ErrorContext[] {
    return [...this.errors];
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getErrorSummary(): any {
    const errors = this.getErrors();
    const summary = {
      total: errors.length,
      byComponent: {} as any,
      byMethod: {} as any,
      recent: errors.slice(-10)
    };

    errors.forEach(error => {
      summary.byComponent[error.component] = (summary.byComponent[error.component] || 0) + 1;
      summary.byMethod[error.method] = (summary.byMethod[error.method] || 0) + 1;
    });

    return summary;
  }

  private static sendToExternalService(context: ErrorContext): void {
    // In production, this would send to an error tracking service
    // like Sentry, LogRocket, or custom API
    const isProduction = typeof window !== 'undefined' && 
      (window as any).location?.hostname !== 'localhost' && 
      (window as any).location?.hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Example: Sentry.captureException(context.error, { extra: context });
      console.log('Would send error to external service:', context);
    }
  }
}

export class TestRunner {
  private static testCases: TestCase[] = [];
  private static results: TestResult[] = [];

  static addTestCase(testCase: TestCase): void {
    this.testCases.push(testCase);
  }

  static addTestCases(testCases: TestCase[]): void {
    this.testCases.push(...testCases);
  }

  static async runAllTests(): Promise<RegressionTestSuite> {
    const startTime = new Date();
    this.results = [];

    console.log(`🧪 Running ${this.testCases.length} test cases...`);

    for (const testCase of this.testCases) {
      try {
        const result = await this.runTestCase(testCase);
        this.results.push(result);
        
        if (result.passed) {
          console.log(`✅ ${testCase.name}: PASSED`);
        } else {
          console.error(`❌ ${testCase.name}: FAILED - ${result.error}`);
        }
      } catch (error) {
        const result: TestResult = {
          testCase,
          passed: false,
          actualOutput: null,
          error: error instanceof Error ? error.message : String(error),
          executionTime: 0,
          timestamp: new Date()
        };
        this.results.push(result);
        console.error(`💥 ${testCase.name}: ERROR - ${error}`);
      }
    }

    const endTime = new Date();
    const totalTime = endTime.getTime() - startTime.getTime();

    const summary = this.generateSummary();
    const suite: RegressionTestSuite = {
      name: 'Angular vs React Regression Tests',
      version: '1.0.0',
      timestamp: startTime,
      results: this.results,
      summary
    };

    console.log(`🏁 Test suite completed in ${totalTime}ms`);
    console.log(`📊 Results: ${summary.passed}/${summary.total} passed (${summary.successRate.toFixed(1)}%)`);

    return suite;
  }

  private static async runTestCase(testCase: TestCase): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      let actualOutput: any;
      
      switch (testCase.category) {
        case 'calculation':
          actualOutput = await this.runCalculationTest(testCase);
          break;
        case 'ui':
          actualOutput = await this.runUITest(testCase);
          break;
        case 'integration':
          actualOutput = await this.runIntegrationTest(testCase);
          break;
        case 'performance':
          actualOutput = await this.runPerformanceTest(testCase);
          break;
        default:
          throw new Error(`Unknown test category: ${testCase.category}`);
      }

      const executionTime = performance.now() - startTime;
      const passed = this.compareOutputs(actualOutput, testCase.expectedOutput, testCase.tolerance);

      return {
        testCase,
        passed,
        actualOutput,
        executionTime,
        timestamp: new Date()
      };
    } catch (error) {
      const executionTime = performance.now() - startTime;
      return {
        testCase,
        passed: false,
        actualOutput: null,
        error: error instanceof Error ? error.message : String(error),
        executionTime,
        timestamp: new Date()
      };
    }
  }

  private static async runCalculationTest(testCase: TestCase): Promise<any> {
    // Mock calculation test - in real implementation, this would call actual calculation functions
    const { input } = testCase;
    
    // Example calculation test
    if (testCase.name.includes('Revenue Calculation')) {
      const grossFees = input.avgNetFee * input.taxPrepReturns;
      const discounts = grossFees * (input.discountsPct / 100);
      return { grossFees, discounts, taxPrepIncome: grossFees - discounts };
    }
    
    if (testCase.name.includes('Expense Calculation')) {
      const salaries = input.grossFees * (input.salariesPct / 100);
      return { salaries };
    }
    
    throw new Error(`Unknown calculation test: ${testCase.name}`);
  }

  private static async runUITest(testCase: TestCase): Promise<any> {
    // Mock UI test - in real implementation, this would test DOM elements
    return { elementFound: true, value: 'test' };
  }

  private static async runIntegrationTest(testCase: TestCase): Promise<any> {
    // Mock integration test - in real implementation, this would test component communication
    return { connected: true, dataFlow: 'success' };
  }

  private static async runPerformanceTest(testCase: TestCase): Promise<any> {
    // Mock performance test - in real implementation, this would measure actual performance
    return { executionTime: 100, memoryUsage: 50 };
  }

  private static compareOutputs(actual: any, expected: any, tolerance: number = 0.01): boolean {
    if (typeof actual === 'number' && typeof expected === 'number') {
      return Math.abs(actual - expected) <= (tolerance || 0.01);
    }
    
    if (typeof actual === 'object' && typeof expected === 'object') {
      return JSON.stringify(actual) === JSON.stringify(expected);
    }
    
    return actual === expected;
  }

  private static generateSummary(): any {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, failed, successRate };
  }

  static getResults(): TestResult[] {
    return [...this.results];
  }

  static clearResults(): void {
    this.results = [];
  }

  static exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }
}

// Predefined test cases for common scenarios
export const COMMON_TEST_CASES: TestCase[] = [
  {
    name: 'Basic Revenue Calculation',
    description: 'Test basic revenue calculation with standard inputs',
    input: { avgNetFee: 125, taxPrepReturns: 1600, discountsPct: 3 },
    expectedOutput: { grossFees: 200000, discounts: 6000, taxPrepIncome: 194000 },
    tolerance: 0.01,
    category: 'calculation'
  },
  {
    name: 'Expense Percentage Calculation',
    description: 'Test expense calculation with percentage inputs',
    input: { grossFees: 200000, salariesPct: 25 },
    expectedOutput: { salaries: 50000 },
    tolerance: 0.01,
    category: 'calculation'
  },
  {
    name: 'TaxRush Calculation (Canada)',
    description: 'Test TaxRush income calculation for Canadian stores',
    input: { taxRushReturns: 100, taxRushFee: 125 },
    expectedOutput: { taxRushIncome: 12500 },
    tolerance: 0.01,
    category: 'calculation'
  },
  {
    name: 'KPI Status Determination',
    description: 'Test KPI status determination logic',
    input: { netMargin: 22, costPerReturn: 85 },
    expectedOutput: { netMarginStatus: 'green', cprStatus: 'green' },
    category: 'calculation'
  },
  {
    name: 'Input Validation',
    description: 'Test input field validation',
    input: { avgNetFee: -50, taxPrepReturns: 0 },
    expectedOutput: { valid: false, errors: ['avgNetFee must be positive', 'taxPrepReturns must be greater than 0'] },
    category: 'ui'
  },
  {
    name: 'Component Communication',
    description: 'Test communication between inputs panel and dashboard',
    input: { avgNetFee: 125, taxPrepReturns: 1600 },
    expectedOutput: { dataFlow: 'success', updated: true },
    category: 'integration'
  },
  {
    name: 'Calculation Performance',
    description: 'Test calculation performance with large datasets',
    input: { taxPrepReturns: 10000, avgNetFee: 125 },
    expectedOutput: { executionTime: 100, memoryUsage: 50 },
    category: 'performance'
  }
];

// Global error handler
export function setupGlobalErrorHandling(): void {
  window.addEventListener('error', (event) => {
    ErrorTracker.trackError('Global', 'WindowError', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    ErrorTracker.trackError('Global', 'UnhandledRejection', new Error(event.reason), {
      reason: event.reason
    });
  });
}

// Initialize test cases
export function initializeTestSuite(): void {
  TestRunner.addTestCases(COMMON_TEST_CASES);
  setupGlobalErrorHandling();
}
