import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
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

// Mock window.location
const mockLocation = {
  ...window.location,
  origin: 'http://localhost:3000'
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
