// Angular Test Environment Setup
// Enhanced with React test setup features while maintaining Angular testing superiority

import 'zone.js/testing'; // Angular testing zone
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Angular TestBed initialization
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Enhanced localStorage mock (from React test setup)
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Enhanced window.location mock (from React test setup)
const mockLocation = {
  ...window.location,
  origin: 'http://localhost:4200', // Angular default port
  href: 'http://localhost:4200',
  pathname: '/',
  search: '',
  hash: '',
};

// Apply mocks to global objects
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Enhanced console mocking for cleaner test output (Jasmine-compatible)
const originalConsole = { ...console };

const isDev = (() => {
  try {
    return (process && process.env && process.env['NODE_ENV'] === 'development') || false;
  } catch {
    return false;
  }
})();

const spyLog = jasmine.createSpy('console.log').and.callFake((...args: unknown[]) => {
  if (isDev) originalConsole.log(...(args as any[]));
});
const spyWarn = jasmine.createSpy('console.warn').and.callFake((...args: unknown[]) => {
  if (isDev) originalConsole.warn(...(args as any[]));
});
const spyError = jasmine.createSpy('console.error').and.callFake((...args: unknown[]) => {
  if (isDev) originalConsole.error(...(args as any[]));
});

globalThis.console = {
  ...console,
  log: spyLog as unknown as typeof console.log,
  warn: spyWarn as unknown as typeof console.warn,
  error: spyError as unknown as typeof console.error,
};

// Angular-specific test utilities
export const TestUtils = {
  // Reset all mocks between tests
  resetMocks: () => {
    localStorageMock.clear();
    spyLog.calls.reset();
    spyWarn.calls.reset();
    spyError.calls.reset();
  },

  // Get localStorage mock for test assertions
  getLocalStorageMock: () => localStorageMock,

  // Get original console for debugging
  getOriginalConsole: () => originalConsole,

  // Set mock location for navigation tests
  setMockLocation: (overrides: Partial<Location>) => {
    Object.assign(mockLocation, overrides);
  },
};

// Global test setup
beforeEach(() => {
  // Reset mocks before each test
  TestUtils.resetMocks();
});

// Export for use in individual test files
export { localStorageMock, mockLocation, originalConsole };
