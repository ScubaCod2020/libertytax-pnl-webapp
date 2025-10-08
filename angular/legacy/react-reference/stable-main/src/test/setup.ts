<<<<<<<< HEAD:react-app-reference/react-app-reference/src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
========
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
>>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive:react-reference/stable-main/src/test/setup.ts

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
<<<<<<<< HEAD:react-app-reference/react-app-reference/src/test/setup.ts
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
========
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()
>>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive:react-reference/stable-main/src/test/setup.ts

// Mock window.location
const mockLocation = {
  ...window.location,
<<<<<<<< HEAD:react-app-reference/react-app-reference/src/test/setup.ts
  origin: 'http://localhost:3000',
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});
========
  origin: 'http://localhost:3000'
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})
>>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive:react-reference/stable-main/src/test/setup.ts

// Mock console methods for cleaner test output
globalThis.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
<<<<<<<< HEAD:react-app-reference/react-app-reference/src/test/setup.ts
};
========
}
>>>>>>>> origin/cursor/enhance-github-testing-and-virtual-team-4d10_archive:react-reference/stable-main/src/test/setup.ts
